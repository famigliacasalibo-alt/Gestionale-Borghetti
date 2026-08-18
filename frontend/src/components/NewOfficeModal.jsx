import { useEffect, useState } from "react";

function NewOfficeModal({
  open,
  onClose,
  onSave,
  onUpdate,
  attivita,
}) {
  const [descrizione, setDescrizione] = useState("");
  const [scadenza, setScadenza] = useState("");

  const modifica = !!attivita;

  useEffect(() => {
    if (attivita) {
      setDescrizione(attivita.descrizione || "");
      setScadenza(attivita.scadenza || "");
    } else {
      setDescrizione("");
      setScadenza("");
    }
  }, [attivita, open]);

  if (!open) return null;

  function handleSalva() {
    if (!descrizione.trim()) {
      alert("Inserisci la descrizione dell'attività.");
      return;
    }

    if (!scadenza) {
      alert("Inserisci la scadenza.");
      return;
    }

    if (modifica) {
      onUpdate({
        ...attivita,
        descrizione: descrizione.trim(),
        scadenza,
      });
    } else {
      onSave({
        descrizione: descrizione.trim(),
        scadenza,
        completata: false,
      });
    }

    setDescrizione("");
    setScadenza("");
  }

  function handleChiudi() {
    setDescrizione("");
    setScadenza("");
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {modifica
            ? "✏️ Modifica attività Office"
            : "💻 Nuova attività Office"}
        </h2>

        <label>Descrizione</label>

        <textarea
          rows="5"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Cosa devo fare?"
        />

        <br />
        <br />

        <label>Scadenza</label>

        <input
          type="date"
          value={scadenza}
          onChange={(e) => setScadenza(e.target.value)}
        />

        <br />
        <br />

        <div className="buttons">
          <button onClick={handleSalva}>
            {modifica ? "Aggiorna" : "Salva"}
          </button>

          <button onClick={handleChiudi}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewOfficeModal;