function Header({
  onNuovoEvento,
  onCaricaCheckOut,
  onNuovoAppuntamento,
  onNuovoOffice,
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

        <button onClick={onNuovoEvento}>
          ➕ Evento
        </button>

        <button onClick={onNuovoOffice}>
          💻 Office
        </button>
      </div>
    </div>
  );
}

export default Header;