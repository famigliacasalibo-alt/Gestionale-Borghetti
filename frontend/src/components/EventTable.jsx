import unita from "../data/unita";


function EventTable({ events, onChiudi, onModifica }) {
  function getNomeUnita(unitaId) {
    const trovato = unita.find(
      (u) => Number(u.id) === Number(unitaId)
    );


    return trovato ? trovato.nome : "-";
  }


  const eventiAperti = events
    .filter((e) => e.stato === "aperto")
    .sort((a, b) => (b.peso || 0) - (a.peso || 0));


  return (
    <div className="card">
      <h2>📋 Eventi aperti</h2>


      {eventiAperti.length === 0 ? (
        <p>Nessun evento aperto.</p>
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