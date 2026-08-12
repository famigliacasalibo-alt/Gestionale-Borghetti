import { useState } from "react";
import unita from "../data/unita";

function EventTable({ events, onChiudi, onModifica }) {
  const [filtro, setFiltro] = useState("tutti");

  function getNomeUnita(unitaId) {
    const trovato = unita.find(
      (u) => Number(u.id) === Number(unitaId)
    );

    return trovato ? trovato.nome : "-";
  }

  function eventoRispettaFiltro(evento) {
    if (filtro === "tutti") {
      return true;
    }

    if (filtro.startsWith("area:")) {
      const area = filtro.replace("area:", "");
      const nomeUnita = getNomeUnita(evento.unitId);

      return nomeUnita.startsWith(area);
    }

    if (filtro.startsWith("unita:")) {
      const unitaId = filtro.replace("unita:", "");

      return String(evento.unitId) === String(unitaId);
    }

    return true;
  }

  const eventiAperti = events
    .filter((e) => e.stato === "aperto")
    .filter(eventoRispettaFiltro)
    .sort((a, b) => (b.peso || 0) - (a.peso || 0));

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>📋 Eventi aperti</h2>

        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            minWidth: 190,
            background: "#fff",
          }}
          aria-label="Filtra eventi"
        >
          <option value="tutti">🔽 Filtra eventi</option>

          <option value="area:BOPA">BOPA</option>
          <option value="area:BOSA">BOSA</option>
          <option value="area:BOCA">BOCA</option>

          {unita.map((unitaItem) => (
            <option
              key={unitaItem.id}
              value={`unita:${unitaItem.id}`}
            >
              {unitaItem.nome}
            </option>
          ))}
        </select>
      </div>

      {eventiAperti.length === 0 ? (
        <p>
          {filtro === "tutti"
            ? "Nessun evento aperto."
            : "Nessun evento aperto per questa selezione."}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Unità</th>
              <th>Descrizione</th>
              <th>Data</th>
              <th>Peso</th>
              <th>Azioni</th>
            </tr>
          </thead>

          <tbody>
            {eventiAperti.map((evento) => (
              <tr key={evento.id}>
                <td>{evento.categoria}</td>

                <td>{getNomeUnita(evento.unitId)}</td>

                <td>{evento.descrizione}</td>

                <td>{evento.data}</td>

                <td>{evento.peso}</td>

                <td>
                  <button
                    onClick={() => onModifica(evento)}
                    title="Modifica"
                  >
                    ✏️
                  </button>

                  {" "}

                  <button
                    onClick={() => onChiudi(evento.id)}
                    title="Chiudi"
                  >
                    ✅
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EventTable;