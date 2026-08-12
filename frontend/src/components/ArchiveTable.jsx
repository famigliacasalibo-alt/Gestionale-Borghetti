import unita from "../data/unita";

function ArchiveTable({ events }) {
  function getNomeUnita(id) {
    const u = unita.find((x) => x.id === id);
    return u ? u.nome : "-";
  }

  const archivio = events
    .filter((e) => e.stato === "chiuso")
    .sort((a, b) => b.id - a.id);

  return (
    <div className="card">
      <h2>📦 Archivio eventi</h2>

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
                  <td>{getNomeUnita(evento.unitaId)}</td>
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