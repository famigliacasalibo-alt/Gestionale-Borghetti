import unita from "../data/unita";


function DashboardSuggerimento({ events, checkOut }) {
  const eventiAperti = events.filter(
    (evento) => evento.stato === "aperto"
  );


  const checkOutOggi = checkOut.length;


  const pesi = {
    BOPA: 0,
    BOSA: 0,
    BOCA: 0,
  };


  eventiAperti.forEach((evento) => {
    const unitaEvento = unita.find(
      (u) => Number(u.id) === Number(evento.unitId)
    );


    if (!unitaEvento) return;


    const nome = unitaEvento.nome;


    let destinazione = null;


    if (nome.startsWith("BOPA")) {
      destinazione = "BOPA";
    } else if (nome.startsWith("BOSA")) {
      destinazione = "BOSA";
    } else if (nome.startsWith("BOCA")) {
      destinazione = "BOCA";
    }


    if (destinazione) {
      pesi[destinazione] += Number(evento.peso) || 0;
    }
  });


  let destinazione = "BOCA";
  let pesoMassimo = 0;


  Object.entries(pesi).forEach(([nome, peso]) => {
    if (peso > pesoMassimo) {
      pesoMassimo = peso;
      destinazione = nome;
    }
  });


  let suggerimento;


  if (pesoMassimo === 0) {
    suggerimento = "🏠 Oggi puoi lavorare da BOCA";
  } else {
    suggerimento = `📍 Oggi vai a ${destinazione}`;
  }


  return (
    <div
      style={{
        background: "#eef6ff",
        border: "1px solid #b8d8ff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <h2>📍 Suggerimento della giornata</h2>


      <p>
        <strong>{suggerimento}</strong>
      </p>


      <p>Check-out: {checkOutOggi}</p>


      <p>Eventi aperti: {eventiAperti.length}</p>


      <p>
        Pesi: BOPA {pesi.BOPA} · BOSA {pesi.BOSA} · BOCA {pesi.BOCA}
      </p>
    </div>
  );
}


export default DashboardSuggerimento;