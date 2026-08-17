import { useState } from "react";
import unita from "../data/unita";

function ArchiveTable({ events }) {
  const [unitaFiltro, setUnitaFiltro] = useState("");

  function getNomeUnita(id) {
    const unitaTrovata = unita.find(
      (u) => String(u.id) === String(id)
    );

    if (!unitaTrovata) {
      return "-";
    }

    return unitaTrovata.nome;
  }

  const archivio = events
    .filter((evento) => {
      if (evento.stato !== "chiuso") {
        return false;
      }

      if (!unitaFiltro) {
        return true;
      }

      return (
        String(evento.unitId ?? evento.unitaId) ===
        String(unitaFiltro)
      );
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <h2 style={{ margin: 0 }}>
          📦 Archivio eventi
        </h2>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <strong>Unità:</strong>

          <select
            value={unitaFiltro}
            onChange={(e) =>
              setUnitaFiltro(e.target.value)
            }
          >
            <option value="">Tutte</option>

            {unita.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {archivio.length === 0 ? (
        <p>Nessun evento archiviato.</p>
      ) : (
        <div
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Unità</th>
                <th>Descrizione</th>
                <th>Aperto</th>
                <th>Chiuso</th>
                <th>Peso</th>
              </tr>
            </thead>

            <tbody>
              {archivio.map((evento) => (
                <tr key={evento.id}>
                  <td>{evento.categoria}</td>

                  <td>
                    {getNomeUnita(
                      evento.unitId ?? evento.unitaId
                    )}
                  </td>

                  <td>{evento.descrizione}</td>

                  <td>{evento.data}</td>

                  <td>{evento.dataChiusura}</td>

                  <td>{evento.peso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ArchiveTable;