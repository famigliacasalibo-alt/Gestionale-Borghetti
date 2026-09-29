import { useEffect, useState } from "react";

function CarrelloModal({
  open,
  onClose,
  onSave,
  onUpdate,
  ticket,
}) {
  const [descrizione, setDescrizione] = useState("");

  useEffect(() => {
    if (ticket) {
      setDescrizione(ticket.descrizione);
    } else {
      setDescrizione("");
    }
  }, [ticket, open]);

  if (!open) return null;

  function handleSave() {
    if (!descrizione.trim()) {
      alert("Inserisci una descrizione.");
      return;
    }

    const ticketSalvato = {
      ...(ticket || {}),

      id: ticket ? ticket.id : Date.now(),

      descrizione: descrizione.trim(),

      stato: ticket ? ticket.stato : "aperto",

      created_at: ticket
        ? ticket.created_at
        : new Date().toISOString(),

      data_chiusura: ticket
        ? ticket.data_chiusura
        : null,
    };

    if (ticket) {
      onUpdate(ticketSalvato);
    } else {
      onSave(ticketSalvato);
    }

    setDescrizione("");

    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {ticket
            ? "✏️ Modifica ticket"
            : "🛒 Nuovo ticket"}
        </h2>

        <label>Descrizione</label>

        <textarea
          rows="5"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Cosa serve acquistare?"
        />

        <br />
        <br />

        <div className="buttons">
          <button onClick={handleSave}>
            {ticket ? "Aggiorna" : "Salva"}
          </button>

          <button onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarrelloModal;