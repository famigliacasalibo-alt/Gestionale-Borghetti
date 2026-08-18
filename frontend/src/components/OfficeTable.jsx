function OfficeTable({
  office,
  onCompleta,
  onModifica,
}) {
  if (!office || office.length === 0) {
    return null;
  }

  return (
    <div className="table-section">
      <h2>💻 Office aperti</h2>

      <table>
        <thead>
          <tr>
            <th>Attività</th>
            <th>Scadenza</th>
            <th></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {office.map((attivita) => (
            <tr key={attivita.id}>
              <td>{attivita.descrizione}</td>

              <td>
                {new Date(
                  `${attivita.scadenza}T00:00:00`
                ).toLocaleDateString("it-IT")}
              </td>

              <td>
                <button
                  onClick={() =>
                    onModifica(attivita)
                  }
                  title="Modifica"
                >
                  ✏️
                </button>
              </td>

              <td>
                <button
                  onClick={() =>
                    onCompleta(attivita.id)
                  }
                  title="Completa"
                >
                  ☑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OfficeTable;