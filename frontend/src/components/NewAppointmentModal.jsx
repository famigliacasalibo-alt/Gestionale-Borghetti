import { useState } from "react";

function NewAppointmentModal({ open, onClose, onSave }) {
  const [area, setArea] = useState("BOPA");
  const [descrizione, setDescrizione] = useState("");
  const [data, setData] = useState("");

  if (!open) return null;

  function getUnitaId(area) {
    switch (area) {
      case "BOPA":
        return 1;
      case "BOSA":
        return 101;
      case "BOCA":
        return 201;
      default:
        return null;
    }
  }

  function handleSave() {
    if (!descrizione.trim()) {
      alert("Inserisci una descrizione.");
      return;
    }

    if (!data) {
      alert("Seleziona una data.");
      return;
    }

    const nuovoAppuntamento = {
      id: Date.now(),

      categoria: "appuntamento",

      unitId: getUnitaId(area),

      descrizione,

      data,

      peso: 100,

      stato: "aperto",

      fotoApertura: [],

      fotoChiusura: [],

      dataChiusura: null,
    };

    onSave(nuovoAppuntamento);

    setDescrizione("");
    setData("");
    setArea("BOPA");

    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>📅 Nuovo Appuntamento</h2>

        <label>Area</label>

        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="BOPA">BOPA</option>
          <option value="BOSA">BOSA</option>
          <option value="BOCA">BOCA</option>
        </select>

        <br />
        <br />

        <label>Descrizione</label>

        <textarea
          rows="4"
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
        />

        <br />
        <br />

        <label>Data</label>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <br />
        <br />

        <div className="buttons">
          <button onClick={handleSave}>Salva</button>
          <button onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}

export default NewAppointmentModal;