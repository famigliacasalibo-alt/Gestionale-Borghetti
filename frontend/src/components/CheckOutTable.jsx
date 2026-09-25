function CheckOutTable({
  checkOut,
  events,
  onApriManutenzioni,
}) {
  const checkOutVisibili = checkOut.filter(
    (app) =>
      ![
        "APPOGGIO",
        "APPOGGIO 2",
        "APPOGGIO 3",
        "10- MERAVILLE",
      ].includes(String(app.appartamento).trim())
  );

  if (checkOutVisibili.length === 0) return null;

  function contaEventiAperti(app) {
    return events.filter(
      (evento) =>
        evento.stato === "aperto" &&
        String(evento.unitId) === String(app.unitId)
    ).length;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>✔</th>
          <th>Appartamento</th>
          <th>Partenza</th>
          <th>Allestimento</th>
          <th>Manutenzioni</th>
          <th>Note</th>
        </tr>
      </thead>

      <tbody>
        {checkOutVisibili.map((app, index) => {
          const eventiAperti = contaEventiAperti(app);

          return (
            <tr key={index}>
              <td>
                <input type="checkbox" />
              </td>

              <td>{app.appartamento}</td>

              <td>{app.partenza}</td>

              <td>
                <input type="checkbox" />
              </td>

              <td>
                <button onClick={() => onApriManutenzioni(app)}>
                  🔧 Apri
                </button>
              </td>

              <td>
                {eventiAperti === 0
                  ? "Nessun evento"
                  : eventiAperti === 1
                  ? "1 evento"
                  : `${eventiAperti} eventi`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default CheckOutTable;