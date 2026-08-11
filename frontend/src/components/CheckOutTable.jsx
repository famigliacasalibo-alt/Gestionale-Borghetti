function CheckOutTable({ checkOut, onApriManutenzioni }) {
  if (checkOut.length === 0) return null;

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
        {checkOut.map((app, index) => {
          console.log(app);

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
                <input
                  type="text"
                  placeholder="..."
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default CheckOutTable;