import { filterHistory } from "../data/filterHistory";
import { maintenanceTypes } from "../data/maintenanceTypes";
import { supabase } from "../supabaseClient";

const filterConfig = maintenanceTypes.find(
  (type) => type.id === "FILTERS"
);

function parseData(data) {
  if (!data) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const date = new Date(`${data}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [day, month, year] = data.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(data);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

function sameUnit(event, unitId) {
  return String(event?.unitId ?? event?.unitaId ?? "") === String(unitId);
}

function isFilterEvent(event) {
  return (
    event?.categoria === "manutenzione" &&
    event?.descrizione === filterConfig.name &&
    (event?.unitId != null || event?.unitaId != null)
  );
}

function createFilterEvent(unitId, dueDate) {
  return {
    categoria: "manutenzione",
    unitId,
    descrizione: filterConfig.name,
    data: formatISODate(dueDate),
    peso: filterConfig.eventWeight,
    stato: "aperto",
    fotoApertura: [],
    fotoChiusura: [],
    dataChiusura: null,
  };
}

function findLatestFilterEvent(existingEvents, unitId) {
  const unitEvents = existingEvents
    .filter(
      (event) =>
        isFilterEvent(event) &&
        sameUnit(event, unitId)
    )
    .sort((a, b) => {
      const dateA = parseData(a.dataChiusura || a.data);
      const dateB = parseData(b.dataChiusura || b.data);

      return (
        (dateB?.getTime() || 0) -
        (dateA?.getTime() || 0)
      );
    });

  return unitEvents[0] || null;
}

export async function initializeAutomaticEvents(
  existingEvents = []
) {
  const today = new Date();

  const events = [...existingEvents];
  const eventsToCreate = [];

  for (const filter of filterHistory) {
    const latestEvent = findLatestFilterEvent(
      events,
      filter.unitId
    );

    /*
     * Se esiste già un evento aperto per questo appartamento,
     * non dobbiamo crearne un altro.
     */
    if (latestEvent?.stato === "aperto") {
      continue;
    }

    let dueDate = null;

    /*
     * DAL SECONDO CICLO IN POI:
     *
     * la data di riferimento è la data di chiusura
     * dell'ultimo evento filtro salvato su Supabase.
     */
    if (latestEvent?.stato === "chiuso") {
      const lastCleaning = parseData(
        latestEvent.dataChiusura
      );

      if (!lastCleaning) {
        continue;
      }

      dueDate = new Date(lastCleaning);

      dueDate.setDate(
        dueDate.getDate() + filterConfig.intervalDays
      );
    }

    /*
     * PRIMO CICLO:
     *
     * se non esiste ancora nessun evento filtro
     * per questo appartamento, utilizziamo lo storico
     * iniziale contenuto in filterHistory.
     */
    if (!latestEvent) {
      const lastCleaning = parseData(
        filter.lastCleaning
      );

      if (!lastCleaning) {
        continue;
      }

      dueDate = new Date(lastCleaning);

      dueDate.setDate(
        dueDate.getDate() + filterConfig.intervalDays
      );
    }

    /*
     * Il nuovo evento viene creato solo quando
     * la scadenza è arrivata.
     */
    if (!dueDate || dueDate > today) {
      continue;
    }

    eventsToCreate.push(
      createFilterEvent(
        filter.unitId,
        dueDate
      )
    );
  }

  if (eventsToCreate.length === 0) {
    return events;
  }

  /*
   * Salviamo direttamente i nuovi eventi su Supabase.
   * L'id viene generato dal database.
   */
  const { data, error } = await supabase
    .from("events")
    .insert(eventsToCreate)
    .select("*");

  if (error) {
    console.error(
      "Errore creazione automatica eventi filtri:",
      error
    );

    return events;
  }

  return [...data, ...events];
}