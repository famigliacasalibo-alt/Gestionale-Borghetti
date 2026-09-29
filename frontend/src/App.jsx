import "./App.css";

import { useEffect, useRef, useState } from "react";

import { importaAmicHotel } from "./importer";

import Header from "./components/Header";
import UploadCheckOut from "./components/UploadCheckOut";
import DashboardSuggerimento from "./components/DashboardSuggerimento";
import CheckOutTable from "./components/CheckOutTable";
import EventTable from "./components/EventTable";
import OfficeTable from "./components/OfficeTable";
import MaintenanceModal from "./components/MaintenanceModal";
import NewEventModal from "./components/NewEventModal";
import NewAppointmentModal from "./components/NewAppointmentModal";
import NewOfficeModal from "./components/NewOfficeModal";
import ArchiveModal from "./components/ArchiveModal";
import OfficeArchiveModal from "./components/OfficeArchiveModal";
import CarrelloTable from "./components/CarrelloTable";
import CarrelloModal from "./components/CarrelloModal";

import { initializeAutomaticEvents } from "./services/eventEngine";

import { supabase } from "./supabaseClient";

function App() {
  const [events, setEvents] = useState([]);

  const [checkOut, setCheckOut] = useState([]);

  const [office, setOffice] = useState([]);

  const [carrello, setCarrello] = useState([]);

  const [appartamentoSelezionato, setAppartamentoSelezionato] =
    useState(null);

  const [newEventOpen, setNewEventOpen] = useState(false);

  const [appointmentOpen, setAppointmentOpen] = useState(false);

  const [archiveOpen, setArchiveOpen] = useState(false);

  const [officeOpen, setOfficeOpen] = useState(false);

  const [officeArchiveOpen, setOfficeArchiveOpen] = useState(false);

  const [carrelloOpen, setCarrelloOpen] = useState(false);

  const [eventoDaModificare, setEventoDaModificare] = useState(null);

  const [attivitaOfficeDaModificare, setAttivitaOfficeDaModificare] =
    useState(null);

  const [ticketCarrelloDaModificare, setTicketCarrelloDaModificare] =
    useState(null);

  const fileInputRef = useRef(null);

  /*
   * Carica gli eventi da Supabase.
   *
   * L'eventEngine utilizza esclusivamente gli eventi
   * già presenti nel database per gestire il ciclo
   * automatico delle manutenzioni.
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
        await initializeAutomaticEvents(eventiEsistenti);

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

  /*
   * Carica tutte le attività Office da Supabase.
   *
   * Le attività aperte vengono mostrate nella Home.
   * Le attività completate vengono utilizzate dall'archivio Office.
   */
  useEffect(() => {
    async function caricaOfficeDaSupabase() {
      const { data, error } = await supabase
        .from("office")
        .select("*")
        .order("scadenza", { ascending: true });

      if (error) {
        console.error(
          "Errore caricamento attività Office da Supabase:",
          error
        );
        return;
      }

      setOffice(data || []);
    }

    caricaOfficeDaSupabase();
  }, []);

  /*
   * Carica i ticket aperti del Carrello da Supabase.
   */
  useEffect(() => {
    async function caricaCarrelloDaSupabase() {
      const { data, error } = await supabase
        .from("carrello")
        .select("*")
        .eq("stato", "aperto")
        .order("created_at", { ascending: true });

      if (error) {
        console.error(
          "Errore caricamento Carrello da Supabase:",
          error
        );
        return;
      }

      setCarrello(data || []);
    }

    caricaCarrelloDaSupabase();
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

  async function handleNuovoOffice(nuovaAttivita) {
    const { data, error } = await supabase
      .from("office")
      .insert([nuovaAttivita])
      .select("*")
      .single();

    if (error) {
      console.error(
        "Errore salvataggio attività Office:",
        error
      );

      alert(
        "Errore nel salvataggio dell'attività Office."
      );

      return;
    }

    setOffice((precedenti) =>
      [...precedenti, data].sort(
        (a, b) =>
          new Date(a.scadenza) -
          new Date(b.scadenza)
      )
    );

    setOfficeOpen(false);
  }

  async function handleAggiornaOffice(attivitaAggiornata) {
    const { data, error } = await supabase
      .from("office")
      .update({
        descrizione: attivitaAggiornata.descrizione,
        scadenza: attivitaAggiornata.scadenza,
      })
      .eq("id", attivitaAggiornata.id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Errore aggiornamento attività Office:",
        error
      );

      alert(
        "Errore nell'aggiornamento dell'attività Office."
      );

      return;
    }

    setOffice((precedenti) =>
      precedenti
        .map((attivita) =>
          attivita.id === data.id
            ? data
            : attivita
        )
        .sort(
          (a, b) =>
            new Date(a.scadenza) -
            new Date(b.scadenza)
        )
    );

    setAttivitaOfficeDaModificare(null);

    setOfficeOpen(false);
  }

  async function handleCompletaOffice(id) {
    const completataAt = new Date().toISOString();

    const { error } = await supabase
      .from("office")
      .update({
        completata: true,
        completata_at: completataAt,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Errore completamento attività Office:",
        error
      );

      alert(
        "Errore nel completamento dell'attività Office."
      );

      return;
    }

    setOffice((precedenti) =>
      precedenti.map((attivita) =>
        attivita.id === id
          ? {
              ...attivita,
              completata: true,
              completata_at: completataAt,
            }
          : attivita
      )
    );
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
    const evento = events.find(
      (e) => e.id === id
    );

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
      ? `${oggi.getFullYear()}-${String(
          oggi.getMonth() + 1
        ).padStart(2, "0")}-${String(
          oggi.getDate()
        ).padStart(2, "0")}`
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

  async function handleNuovoTicketCarrello(ticket) {
    const { data, error } = await supabase
      .from("carrello")
      .insert([ticket])
      .select("*")
      .single();

    if (error) {
      console.error(
        "Errore salvataggio ticket Carrello:",
        error
      );

      alert(
        "Errore nel salvataggio del ticket."
      );

      return;
    }

    setCarrello((precedenti) => [
      ...precedenti,
      data,
    ]);
  }

  async function handleAggiornaTicketCarrello(
    ticketAggiornato
  ) {
    const { data, error } = await supabase
      .from("carrello")
      .update({
        descrizione: ticketAggiornato.descrizione,
      })
      .eq("id", ticketAggiornato.id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Errore aggiornamento ticket Carrello:",
        error
      );

      alert(
        "Errore nell'aggiornamento del ticket."
      );

      return;
    }

    setCarrello((precedenti) =>
      precedenti.map((ticket) =>
        ticket.id === data.id
          ? data
          : ticket
      )
    );

    setTicketCarrelloDaModificare(null);
  }

  async function handleChiudiTicketCarrello(id) {
    const dataChiusura = new Date().toISOString();

    const { error } = await supabase
      .from("carrello")
      .update({
        stato: "chiuso",
        data_chiusura: dataChiusura,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Errore chiusura ticket Carrello:",
        error
      );

      alert(
        "Errore nella chiusura del ticket."
      );

      return;
    }

    setCarrello((precedenti) =>
      precedenti.filter(
        (ticket) => ticket.id !== id
      )
    );
  }

  function handleNuovoTicket() {
    setTicketCarrelloDaModificare(null);
    setCarrelloOpen(true);
  }

  function handleModificaTicket(ticket) {
    setTicketCarrelloDaModificare(ticket);
    setCarrelloOpen(true);
  }

  function handleChiudiModalCarrello() {
    setTicketCarrelloDaModificare(null);
    setCarrelloOpen(false);
  }

  function handleModificaEvento(evento) {
    setEventoDaModificare(evento);
    setNewEventOpen(true);
  }

  function handleChiudiModalEvento() {
    setEventoDaModificare(null);
    setNewEventOpen(false);
  }

  function handleModificaOffice(attivita) {
    setAttivitaOfficeDaModificare(attivita);
    setOfficeOpen(true);
  }

  function handleChiudiModalOffice() {
    setAttivitaOfficeDaModificare(null);
    setOfficeOpen(false);
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
        onNuovoOffice={() => {
          setAttivitaOfficeDaModificare(null);
          setOfficeOpen(true);
        }}
        onArchivio={() =>
          setArchiveOpen(true)
        }
        onArchivioOffice={() =>
          setOfficeArchiveOpen(true)
        }
        onCarrello={handleNuovoTicket}
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
        events={events}
        onApriManutenzioni={
          setAppartamentoSelezionato
        }
      />

      <EventTable
        events={events}
        onChiudi={handleChiudiEvento}
        onModifica={handleModificaEvento}
      />

      <OfficeTable
        office={office}
        onCompleta={handleCompletaOffice}
        onModifica={handleModificaOffice}
      />

      <CarrelloTable
        carrello={carrello}
        onChiudi={handleChiudiTicketCarrello}
        onModifica={handleModificaTicket}
      />

      <MaintenanceModal
        appartamento={
          appartamentoSelezionato
        }
        events={events}
        onChiudiEvento={handleChiudiEvento}
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

      <NewOfficeModal
        open={officeOpen}
        onClose={handleChiudiModalOffice}
        onSave={handleNuovoOffice}
        onUpdate={handleAggiornaOffice}
        attivita={attivitaOfficeDaModificare}
      />

      <CarrelloModal
        open={carrelloOpen}
        onClose={handleChiudiModalCarrello}
        onSave={handleNuovoTicketCarrello}
        onUpdate={handleAggiornaTicketCarrello}
        ticket={ticketCarrelloDaModificare}
      />

      <ArchiveModal
        open={archiveOpen}
        onClose={() =>
          setArchiveOpen(false)
        }
        events={events}
      />

      <OfficeArchiveModal
        open={officeArchiveOpen}
        onClose={() =>
          setOfficeArchiveOpen(false)
        }
        office={office}
      />
    </div>
  );
}

export default App;