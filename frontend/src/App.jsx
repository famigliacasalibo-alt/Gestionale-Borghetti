import "./App.css";

import { useEffect, useRef, useState } from "react";

import { importaAmicHotel } from "./importer";

import Header from "./components/Header";
import UploadCheckOut from "./components/UploadCheckOut";
import DashboardSuggerimento from "./components/DashboardSuggerimento";
import CheckOutTable from "./components/CheckOutTable";
import EventTable from "./components/EventTable";
import MaintenanceModal from "./components/MaintenanceModal";
import NewEventModal from "./components/NewEventModal";
import NewAppointmentModal from "./components/NewAppointmentModal";
import ArchiveModal from "./components/ArchiveModal";

import { getExpiredFilterMaintenance } from "./utils/maintenanceEngine";
import { initializeAutomaticEvents } from "./services/eventEngine";

import { supabase } from "./supabaseClient";

function App() {
  const [maintenance, setMaintenance] = useState(
    getExpiredFilterMaintenance()
  );

  const [events, setEvents] = useState(initializeAutomaticEvents());
  const [checkOut, setCheckOut] = useState([]);

  const [appartamentoSelezionato, setAppartamentoSelezionato] =
    useState(null);

  const [newEventOpen, setNewEventOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const [eventoDaModificare, setEventoDaModificare] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function caricaEventiDaSupabase() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore caricamento eventi da Supabase:", error);
        return;
      }

      if (!data || data.length === 0) {
        return;
      }

      setEvents((eventiAutomatici) => {
        const eventiEsistenti = new Map(
          eventiAutomatici.map((evento) => [evento.id, evento])
        );

        data.forEach((evento) => {
          eventiEsistenti.set(evento.id, evento);
        });

        return Array.from(eventiEsistenti.values());
      });
    }

    caricaEventiDaSupabase();
  }, []);

  async function caricaFile(event) {
    const file = event.target.files[0];

    if (!file) return;

    const dati = await importaAmicHotel(file);

    setCheckOut(dati);
  }

  async function handleNuovoElemento(nuovoElemento) {
    const { error } = await supabase
      .from("events")
      .insert([nuovoElemento]);

    if (error) {
      console.error("Errore salvataggio evento:", error);
      alert("Errore nel salvataggio dell'evento.");
      return;
    }

    setEvents((precedenti) => [
      nuovoElemento,
      ...precedenti.filter((evento) => evento.id !== nuovoElemento.id),
    ]);
  }

  async function handleAggiornaEvento(eventoAggiornato) {
    const { error } = await supabase
      .from("events")
      .update(eventoAggiornato)
      .eq("id", eventoAggiornato.id);

    if (error) {
      console.error("Errore aggiornamento evento:", error);
      alert("Errore nell'aggiornamento dell'evento.");
      return;
    }

    setEvents((precedenti) =>
      precedenti.map((evento) =>
        evento.id === eventoAggiornato.id
          ? eventoAggiornato
          : evento
      )
    );

    setEventoDaModificare(null);
    setNewEventOpen(false);
  }

  async function handleChiudiEvento(id) {
    const dataChiusura = new Date().toLocaleDateString("it-IT");

    const { error } = await supabase
      .from("events")
      .update({
        stato: "chiuso",
        dataChiusura,
      })
      .eq("id", id);

    if (error) {
      console.error("Errore chiusura evento:", error);
      alert("Errore nella chiusura dell'evento.");
      return;
    }

    setEvents((precedenti) =>
      precedenti.map((e) =>
        e.id === id
          ? {
              ...e,
              stato: "chiuso",
              dataChiusura,
            }
          : e
      )
    );
  }

  function handleChiudiManutenzione(maintenanceType, unitId) {
    setMaintenance((precedenti) =>
      precedenti.map((m) => {
        if (
          m.maintenanceType === maintenanceType &&
          m.unitId === unitId
        ) {
          const oggi = new Date();

          const prossimaScadenza = new Date(oggi);
          prossimaScadenza.setDate(
            prossimaScadenza.getDate() + 180
          );

          return {
            ...m,
            lastCleaning: oggi.toISOString().slice(0, 10),
            dueDate: prossimaScadenza
              .toISOString()
              .slice(0, 10),
            expired: false,
            daysRemaining: 180,
          };
        }

        return m;
      })
    );
  }

  function handleModificaEvento(evento) {
    setEventoDaModificare(evento);
    setNewEventOpen(true);
  }

  function handleChiudiModalEvento() {
    setEventoDaModificare(null);
    setNewEventOpen(false);
  }

  return (
    <div className="App">
      <Header
        onNuovoEvento={() => {
          setEventoDaModificare(null);
          setNewEventOpen(true);
        }}
        onNuovoAppuntamento={() => setAppointmentOpen(true)}
        onCaricaCheckOut={() => fileInputRef.current?.click()}
        onArchivio={() => setArchiveOpen(true)}
      />

      <UploadCheckOut
        ref={fileInputRef}
        onCaricaFile={caricaFile}
      />

      <DashboardSuggerimento
        events={events}
        checkOut={checkOut}
      />

      <CheckOutTable
        checkOut={checkOut}
        onApriManutenzioni={setAppartamentoSelezionato}
      />

      <EventTable
        events={events}
        onChiudi={handleChiudiEvento}
        onModifica={handleModificaEvento}
      />

      <MaintenanceModal
        appartamento={appartamentoSelezionato}
        maintenance={maintenance}
        events={events}
        onChiudiEvento={handleChiudiEvento}
        onChiudiManutenzione={handleChiudiManutenzione}
        onChiudi={() => setAppartamentoSelezionato(null)}
      />

      <NewEventModal
        open={newEventOpen}
        onClose={handleChiudiModalEvento}
        onSave={handleNuovoElemento}
        onUpdate={handleAggiornaEvento}
        evento={eventoDaModificare}
      />

      <NewAppointmentModal
        open={appointmentOpen}
        onClose={() => setAppointmentOpen(false)}
        onSave={handleNuovoElemento}
      />

      <ArchiveModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        events={events}
      />
    </div>
  );
}

export default App;