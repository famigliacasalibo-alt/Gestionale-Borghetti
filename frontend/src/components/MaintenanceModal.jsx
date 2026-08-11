import unita from "../data/unita";

function MaintenanceModal({
  appartamento,
  maintenance,
  events,
  onChiudiEvento,
  onChiudiManutenzione,
  onChiudi,
}) {
  if (!appartamento) return null;

  // Trova l'unità corrispondente all'appartamento del check-out.
  // Se il check-out avesse già un unitId, utilizziamo direttamente quello.
  const unitaCorrispondente =
    appartamento.unitId != null
      ? unita.find(
          (u) => Number(u.id) === Number(appartamento.unitId)
        )
      : unita.find(
          (u) =>
            String(u.nome).trim().toLowerCase() ===
            String(appartamento.appartamento).trim().toLowerCase()
        );

  const unitId =
    appartamento.unitId != null
      ? Number(appartamento.unitId)
      : unitaCorrispondente
      ? Number(unitaCorrispondente.id)
      : null;

  // Eventi ancora aperti relativi a questa unità
  const eventiAperti = (events || []).filter(
    (evento) =>
      Number(evento.unitId) === Number(unitId) &&
      evento.stato === "aperto"
  );

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

        <h3>Eventi aperti</h3>

        {eventiAperti.length === 0 ? (
          <p>Nessun evento aperto per questa unità.</p>
        ) : (
          <div>
            {eventiAperti.map((evento) => (
              <div
                key={evento.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <strong>{evento.descrizione}</strong>

                <div
                  style={{
                    fontSize: "0.9em",
                    marginTop: "5px",
                  }}
                >
                  Aperto il: {evento.data}
                </div>

                <div
                  style={{
                    fontSize: "0.9em",
                    marginTop: "5px",
                  }}
                >
                  Peso: {evento.peso}
                </div>

                <div
                  className="buttons"
                  style={{ marginTop: "10px" }}
                >
                  <button
                    onClick={() => onChiudiEvento(evento.id)}
                  >
                    Chiudi evento
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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