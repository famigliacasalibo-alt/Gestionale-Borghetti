function MaintenanceModal({ appartamento, onChiudi }) {
  if (!appartamento) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>{appartamento.appartamento}</h2>

        <hr />

        <h3>Manutenzioni</h3>

        <label>
          <input type="checkbox" />
          {" "}Filtri
        </label>

        <hr />

        <h3>Storico</h3>

        <p>Nessun intervento registrato.</p>

        <hr />

        <h3>Note manutenzione</h3>

        <textarea
          rows="5"
          placeholder="Scrivi eventuali note..."
        />

        <div className="buttons">
          <button>Salva</button>

          <button onClick={onChiudi}>
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}

export default MaintenanceModal;
