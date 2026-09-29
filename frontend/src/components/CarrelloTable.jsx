function CarrelloTable({ carrello, onChiudi, onModifica }) {
  if (carrello.length === 0) return null;

  return (
    <div className="card">
      <h2>🛒 Carrello</h2>

      <table>
        <thead>
          <tr>
            <th>Descrizione</th>
            <th>Azioni</th>
          </tr>
        </thead>

        <tbody>
          {carrello.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.descrizione}</td>

              <td>
                <button
                  onClick={() => onModifica(ticket)}
                  title="Modifica"
                >
                  ✏️
                </button>

                {" "}

                <button
                  onClick={() => onChiudi(ticket.id)}
                  title="Chiudi"
                >
                  ✅
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CarrelloTable;
