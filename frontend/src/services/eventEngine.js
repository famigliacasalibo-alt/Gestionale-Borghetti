import { events } from "../data/events";
import { generateFilterEvents } from "../utils/maintenanceEngine";

export function initializeAutomaticEvents() {
  const automaticGenerators = [
    generateFilterEvents,
  ];

  automaticGenerators.forEach((generator) => {
    const generatedEvents = generator();

    generatedEvents.forEach((newEvent) => {
      const alreadyExists = events.some(
        (event) =>
          event.categoria === newEvent.categoria &&
          event.unitaId === newEvent.unitaId &&
          event.descrizione === newEvent.descrizione &&
          event.stato === "aperto"
      );

      if (!alreadyExists) {
        events.push(newEvent);
      }
    });
  });

  return events;
}