import { filterHistory } from "../data/filterHistory";
import { maintenanceTypes } from "../data/maintenanceTypes";

const filterConfig = maintenanceTypes.find(
  (type) => type.id === "FILTERS"
);

export function getExpiredFilterMaintenance() {
  const today = new Date();

  return filterHistory.map((filter) => {
    const lastCleaning = new Date(filter.lastCleaning);

    const dueDate = new Date(lastCleaning);
    dueDate.setDate(
      dueDate.getDate() + filterConfig.intervalDays
    );

    const daysRemaining = Math.ceil(
      (dueDate - today) / (1000 * 60 * 60 * 24)
    );

    return {
      maintenanceType: filterConfig.id,
      maintenanceName: filterConfig.name,
      eventWeight: filterConfig.eventWeight,

      unitId: filter.unitId,

      lastCleaning: filter.lastCleaning,
      dueDate: dueDate.toISOString().slice(0, 10),

      expired: daysRemaining <= 0,
      daysRemaining,
    };
  });
}

export function generateFilterEvents() {
  const maintenance = getExpiredFilterMaintenance();

  return maintenance
    .filter((m) => m.expired)
    .map((m) => ({
      id: `FILTER-${m.unitId}`,

      categoria: "manutenzione",

      unitId: m.unitId,

      descrizione: "Pulizia filtri",

      data: m.dueDate,

      priorita: m.eventWeight,

      stato: "aperto",

      fotoApertura: [],
      fotoChiusura: [],

      dataChiusura: null,
    }));
}