function FilterTable({ maintenance }) {
  return (
    <div className="card">
      <h2>Manutenzione filtri</h2>

      <table>
        <thead>
          <tr>
            <th>Appartamento</th>
            <th>Ultima pulizia</th>
            <th>Scadenza</th>
            <th>Giorni</th>
            <th>Stato</th>
          </tr>
        </thead>

        <tbody>
          {maintenance.map((m) => (
            <tr key={m.unitId}>
              <td>{m.unitId}</td>
              <td>{m.lastCleaning}</td>
              <td>{m.dueDate}</td>
              <td>{m.daysRemaining}</td>
              <td>{m.expired ? "🔴 Scaduta" : "🟢 OK"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FilterTable;