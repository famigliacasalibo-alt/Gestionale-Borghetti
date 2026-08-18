function Header({
  onNuovoEvento,
  onCaricaCheckOut,
  onNuovoAppuntamento,
  onNuovoOffice,
  onArchivio,
}) {
  return (
    <div className="header">
      <div>
        <h1>🏨 Gestionale Borghetti</h1>
        <p>Gestione operativa appartamenti</p>
      </div>

      <div className="actions">
        <button onClick={onCaricaCheckOut}>
          📂 Carica Check-out
        </button>

        <button onClick={onNuovoAppuntamento}>
          📅 Appuntamento
        </button>

        <div>
          <button onClick={onNuovoEvento}>
            ➕ Evento
          </button>

          <div style={{ marginTop: "10px" }}>
            <button onClick={onArchivio}>
              🗂️ Archivio eventi
            </button>
          </div>
        </div>

        <button onClick={onNuovoOffice}>
          💻 Office
        </button>
      </div>
    </div>
  );
}

export default Header;