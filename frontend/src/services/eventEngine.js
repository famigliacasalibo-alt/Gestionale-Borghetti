import { filterHistory } from "../data/filterHistory";
import { maintenanceTypes } from "../data/maintenanceTypes";
import { supabase } from "../supabaseClient";

const filterConfig = maintenanceTypes.find(
  (type) => type.id === "FILTERS"
);

// Evita due inizializzazioni contemporanee
let automaticEventsInitializationPromise = null;

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
  return (
    String(event?.unitId ?? event?.unitaId ?? "") ===
    String(unitId)
  );
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
      const dateA = parseData(
        a.dataChiusura || a.data
      );

      const dateB = parseData(
        b.dataChiusura || b.data
      );

      return (
        (dateB?.getTime() || 0) -
        (dateA?.getTime() || 0)
      );
    });

  return unitEvents[0] || null;
}

async function executeAutomaticEventsInitialization(
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

    // Se esiste già un evento aperto,
    // non ne creiamo un altro.
    if (latestEvent?.stato === "aperto") {
      continue;
    }

    let dueDate = null;

    // Dal secondo ciclo in poi:
    // partiamo dalla data di chiusura dell'ultimo evento.
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

    // Primo ciclo:
    // utilizziamo lo storico iniziale.
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

    // Non ancora scaduto.
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

export async function initializeAutomaticEvents(
  existingEvents = []
) {
  /*
   * Se un'altra inizializzazione è già in corso,
   * aspettiamo quella invece di crearne una seconda.
   */
  if (automaticEventsInitializationPromise) {
    return automaticEventsInitializationPromise;
  }

  automaticEventsInitializationPromise =
    executeAutomaticEventsInitialization(
      existingEvents
    );

  try {
    return await automaticEventsInitializationPromise;
  } finally {
    automaticEventsInitializationPromise = null;
  }
}