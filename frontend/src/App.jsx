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

  const [events, setEvents] = useState([]);
  const [checkOut, setCheckOut] = useState([]);

  const [appartamentoSelezionato, setAppartamentoSelezionato] =
    useState(null);

  const [newEventOpen, setNewEventOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const [eventoDaModificare, setEventoDaModificare] = useState(null);

  const fileInputRef = useRef(null);

  /*
   * Carica gli eventi da Supabase e verifica
   * se ci sono filtri scaduti da trasformare
   * automaticamente in eventi.
   */
  useEffect(() => {
    async function caricaEventiDaSupabase() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Errore caricamento eventi da Supabase:",
          error
        );
        return;
      }

      const eventiEsistenti = data || [];

      const eventiAggiornati =
        await initializeAutomaticEvents(
          eventiEsistenti
        );

      setEvents(eventiAggiornati);
    }

    caricaEventiDaSupabase();
  }, []);

  /*
   * Carica l'ultimo check-out salvato su Supabase.
   */
  useEffect(() => {
    async function caricaCheckOutDaSupabase() {
      const { data, error } = await supabase
        .from("check_out")
        .select("dati")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Errore caricamento check-out da Supabase:",
          error
        );
        return;
      }

      if (!data || !data.dati) {
        return;
      }

      setCheckOut(data.dati);
    }

    caricaCheckOutDaSupabase();
  }, []);

  async function caricaFile(event) {
    const file = event.target.files[0];

    if (!file) return;

    const dati = await importaAmicHotel(file);

    setCheckOut(dati);

    const { error } = await supabase
      .from("check_out")
      .insert([
        {
          dati,
        },
      ]);

    if (error) {
      console.error(
        "Errore salvataggio check-out:",
        error
      );

      alert(
        "Errore nel salvataggio dei check-out."
      );
    }
  }

  async function handleNuovoElemento(nuovoElemento) {
    const { data, error } = await supabase
      .from("events")
      .insert([nuovoElemento])
      .select("*")
      .single();

    if (error) {
      console.error(
        "Errore salvataggio evento:",
        error
      );

      alert(
        "Errore nel salvataggio dell'evento."
      );

      return;
    }

    setEvents((precedenti) => [
      data,
      ...precedenti.filter(
        (evento) => evento.id !== data.id
      ),
    ]);
  }

  async function handleAggiornaEvento(
    eventoAggiornato
  ) {
    const { error } = await supabase
      .from("events")
      .update(eventoAggiornato)
      .eq("id", eventoAggiornato.id);

    if (error) {
      console.error(
        "Errore aggiornamento evento:",
        error
      );

      alert(
        "Errore nell'aggiornamento dell'evento."
      );

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
    const evento =
      events.find((e) => e.id === id);

    const oggi = new Date();

    const isFiltro =
      evento?.categoria === "manutenzione" &&
      evento?.descrizione === "Pulizia filtri";

    /*
     * Per gli eventi filtro salviamo la data
     * in formato ISO, così potrà essere utilizzata
     * automaticamente per calcolare i successivi 90 giorni.
     *
     * Gli altri eventi continuano a usare il formato italiano.
     */
    const dataChiusura = isFiltro
      ? oggi.toISOString().slice(0, 10)
      : oggi.toLocaleDateString("it-IT");

    const { error } = await supabase
      .from("events")
      .update({
        stato: "chiuso",
        dataChiusura,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Errore chiusura evento:",
        error
      );

      alert(
        "Errore nella chiusura dell'evento."
      );

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

  function handleChiudiManutenzione(
    maintenanceType,
    unitId
  ) {
    setMaintenance((precedenti) =>
      precedenti.map((m) => {
        if (
          m.maintenanceType === maintenanceType &&
          m.unitId === unitId
        ) {
          const oggi = new Date();

          const prossimaScadenza =
            new Date(oggi);

          prossimaScadenza.setDate(
            prossimaScadenza.getDate() + 90
          );

          return {
            ...m,
            lastCleaning:
              oggi.toISOString().slice(0, 10),

            dueDate:
              prossimaScadenza
                .toISOString()
                .slice(0, 10),

            expired: false,
            daysRemaining: 90,
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
        onNuovoAppuntamento={() =>
          setAppointmentOpen(true)
        }
        onCaricaCheckOut={() =>
          fileInputRef.current?.click()
        }
        onArchivio={() =>
          setArchiveOpen(true)
        }
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
        onApriManutenzioni={
          setAppartamentoSelezionato
        }
      />

      <EventTable
        events={events}
        onChiudi={handleChiudiEvento}
        onModifica={handleModificaEvento}
      />

      <MaintenanceModal
        appartamento={
          appartamentoSelezionato
        }
        maintenance={maintenance}
        events={events}
        onChiudiEvento={handleChiudiEvento}
        onChiudiManutenzione={
          handleChiudiManutenzione
        }
        onChiudi={() =>
          setAppartamentoSelezionato(null)
        }
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
        onClose={() =>
          setAppointmentOpen(false)
        }
        onSave={handleNuovoElemento}
      />

      <ArchiveModal
        open={archiveOpen}
        onClose={() =>
          setArchiveOpen(false)
        }
        events={events}
      />
    </div>
  );
}

export default App;