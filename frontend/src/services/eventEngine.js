import { maintenanceTypes } from "../data/maintenanceTypes";
import { supabase } from "../supabaseClient";

const filterConfig = maintenanceTypes.find(
  (type) => type.id === "FILTERS"
);

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function getFilterEvents(events, unitId) {
  return events
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
}

function createNextFilterEvent(unitId, lastCleaning) {
  const dueDate = new Date(lastCleaning);

  dueDate.setDate(
    dueDate.getDate() + filterConfig.intervalDays
  );

  const today = new Date();

  return {
    categoria: "manutenzione",
    unitId,
    descrizione: filterConfig.name,
    data: formatISODate(dueDate),
    peso: filterConfig.eventWeight,
    stato:
      dueDate <= today
        ? "aperto"
        : "programmato",
    fotoApertura: [],
    fotoChiusura: [],
    dataChiusura: null,
  };
}

async function executeAutomaticEventsInitialization(
  existingEvents = []
) {
  const events = [...existingEvents];
  const updates = [];
  const eventsToCreate = [];

  /*
   * Individuiamo tutti gli appartamenti che hanno
   * almeno un evento "Pulizia filtri".
   */
  const unitIds = [
    ...new Set(
      events
        .filter(isFilterEvent)
        .map(
          (event) =>
            event.unitId ?? event.unitaId
        )
        .filter((unitId) => unitId != null)
    ),
  ];

  for (const unitId of unitIds) {
    const filterEvents = getFilterEvents(
      events,
      unitId
    );

    if (filterEvents.length === 0) {
      continue;
    }

    const latestEvent = filterEvents[0];

    /*
     * 1. Evento già aperto:
     *    non facciamo nulla.
     */
    if (latestEvent.stato === "aperto") {
      continue;
    }

    /*
     * 2. Evento programmato:
     *    se la data non è ancora arrivata,
     *    non facciamo nulla.
     *
     *    Se invece la data è arrivata,
     *    lo trasformiamo in aperto.
     */
    if (latestEvent.stato === "programmato") {
      const dueDate = parseData(
        latestEvent.data
      );

      if (!dueDate) {
        continue;
      }

      const today = new Date();

      if (dueDate <= today) {
        updates.push({
          id: latestEvent.id,
          stato: "aperto",
        });
      }

      continue;
    }

    /*
     * 3. Evento chiuso:
     *    la data di chiusura diventa la nuova
     *    data dell'ultima manutenzione.
     *
     *    Da quella data calcoliamo +90 giorni
     *    e creiamo il prossimo evento.
     */
    if (latestEvent.stato === "chiuso") {
      const lastCleaning = parseData(
        latestEvent.dataChiusura
      );

      if (!lastCleaning) {
        continue;
      }

      const nextEvent = createNextFilterEvent(
        unitId,
        lastCleaning
      );

      eventsToCreate.push(nextEvent);
    }
  }

  /*
   * Aggiorniamo gli eventi programmati
   * che sono arrivati a scadenza.
   */
  for (const update of updates) {
    const { error } = await supabase
      .from("events")
      .update({
        stato: update.stato,
      })
      .eq("id", update.id);

    if (error) {
      console.error(
        "Errore apertura evento filtro:",
        error
      );
      continue;
    }

    const index = events.findIndex(
      (event) => event.id === update.id
    );

    if (index !== -1) {
      events[index] = {
        ...events[index],
        stato: update.stato,
      };
    }
  }

  /*
   * Creiamo i nuovi eventi successivi.
   */
  if (eventsToCreate.length === 0) {
    return events;
  }

  /*
   * Protezione ulteriore contro duplicati:
   * controlliamo nuovamente Supabase prima dell'insert.
   */
  const eventsDaCreare = [];

  for (const newEvent of eventsToCreate) {
    const { data: existing, error } = await supabase
      .from("events")
      .select("id")
      .eq("categoria", newEvent.categoria)
      .eq("unitId", newEvent.unitId)
      .eq("descrizione", newEvent.descrizione)
      .eq("data", newEvent.data)
      .limit(1);

    if (error) {
      console.error(
        "Errore controllo evento filtro:",
        error
      );
      continue;
    }

    if (!existing || existing.length === 0) {
      eventsDaCreare.push(newEvent);
    }
  }

  if (eventsDaCreare.length === 0) {
    return events;
  }

  const { data, error } = await supabase
    .from("events")
    .insert(eventsDaCreare)
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
   * Evita due inizializzazioni contemporanee.
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