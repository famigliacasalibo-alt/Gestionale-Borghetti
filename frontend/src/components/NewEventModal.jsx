import { useEffect, useState } from "react";
import unita from "../data/unita";

function NewEventModal({
  open,
  onClose,
  onSave,
  onUpdate,
  evento,
}) {
  const [unitaSelezionata, setUnitaSelezionata] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [peso, setPeso] = useState(15);
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    if (evento) {
      setUnitaSelezionata(String(evento.unitId));
      setDescrizione(evento.descrizione);
      setPeso(evento.peso);
      setFoto(null);
    } else {
      setUnitaSelezionata("");
      setDescrizione("");
      setPeso(15);
      setFoto(null);
    }
  }, [evento, open]);

  if (!open) return null;

  function handleSave() {
    if (!unitaSelezionata) {
      alert("Seleziona una unità.");
      return;
    }

    if (!descrizione.trim()) {
      alert("Inserisci una descrizione.");
      return;
    }

    const eventoSalvato = {
      ...(evento || {}),

      id: evento ? evento.id : Date.now(),

      categoria: "evento",

      unitId: Number(unitaSelezionata),

      descrizione,

      data: evento
        ? evento.data
        : new Date().toLocaleDateString("it-IT"),

      peso: Number(peso),

      stato: evento ? evento.stato : "aperto",

      fotoApertura: evento
        ? evento.fotoApertura
        : foto
        ? [foto]
        : [],

      fotoChiusura: evento
        ? evento.fotoChiusura
        : [],

      dataChiusura: evento
        ? evento.dataChiusura
        : null,
    };

    if (evento) {
      onUpdate(eventoSalvato);
    } else {
      onSave(eventoSalvato);
    }

    setUnitaSelezionata("");
    setDescrizione("");
    setPeso(15);
    setFoto(null);

    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {evento ? "✏️ Modifica Evento" : "➕ Nuovo Evento"}
        </h2>

        <label>Unità</label>

        <select
          value={unitaSelezionata}
          onChange={(e) => setUnitaSelezionata(e.target.value)}
        >
          <option value="">Seleziona unità...</option>

          {unita.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>

        <br />
        <br />

        <label>Descrizione</label>

        <textarea
          rows="5"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          placeholder="Descrivi il problema..."
        />

        <br />
        <br />

        <label>
          Peso: <strong>{peso}</strong>
        </label>

        <input
          type="range"
          min="0"
          max="30"
          value={peso}
          onChange={(e) => setPeso(Number(e.target.value))}
        />

        <br />
        <br />

        {!evento && (
          <>
            <label>Foto</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0] || null)}
            />

            <br />
            <br />
          </>
        )}

        <div className="buttons">
          <button onClick={handleSave}>
            {evento ? "Aggiorna" : "Salva"}
          </button>

          <button onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewEventModal;