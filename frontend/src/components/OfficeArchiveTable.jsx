function OfficeArchiveTable({ office }) {
  const archivio = (office || [])
    .filter((attivita) => attivita.completata === true)
    .sort(
      (a, b) =>
        new Date(b.completata_at || b.created_at) -
        new Date(a.completata_at || a.created_at)
    );

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
          💻 Archivio Office
        </h2>
      </div>

      {archivio.length === 0 ? (
        <p>Nessuna attività Office archiviata.</p>
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
                <th>Descrizione</th>
                <th>Scadenza</th>
                <th>Completata il</th>
              </tr>
            </thead>

            <tbody>
              {archivio.map((attivita) => (
                <tr key={attivita.id}>
                  <td>{attivita.descrizione}</td>

                  <td>
                    {new Date(
                      `${attivita.scadenza}T00:00:00`
                    ).toLocaleDateString("it-IT")}
                  </td>

                  <td>
                    {attivita.completata_at
                      ? new Date(
                          attivita.completata_at
                        ).toLocaleString("it-IT")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OfficeArchiveTable;