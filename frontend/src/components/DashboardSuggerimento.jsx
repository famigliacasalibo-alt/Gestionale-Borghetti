import unita from "../data/unita";

function DashboardSuggerimento({ events, checkOut }) {
  const oggi = new Date();

  const dataOggi = `${oggi.getFullYear()}-${String(
    oggi.getMonth() + 1
  ).padStart(2, "0")}-${String(oggi.getDate()).padStart(2, "0")}`;

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
    // Gli appuntamenti pesano esclusivamente
    // nel giorno in cui sono programmati.
    if (
      evento?.categoria === "appuntamento" &&
      String(evento?.data ?? "").slice(0, 10) !== dataOggi
    ) {
      return;
    }

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
        padding: "22px 24px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        minHeight: 170,
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* INFORMAZIONI */}
      <div
        style={{
          flex: "0 0 40%",
          minWidth: 0,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 24,
          }}
        >
          📍 Suggerimento della giornata
        </h2>

        <p>
          <strong>{suggerimento}</strong>
        </p>

        <p>Check-out: {checkOutOggi}</p>

        <p>Eventi aperti: {eventiAperti.length}</p>

        <p style={{ marginBottom: 0 }}>
          Pesi: BOPA {pesi.BOPA} · BOSA {pesi.BOSA} · BOCA {pesi.BOCA}
        </p>
      </div>

      {/* LOGO BORGHETTI BOLOGNA */}
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          minWidth: 0,
        }}
      >
        <img
          src="/LOGO.png"
          alt="Borghetti Bologna"
          style={{
            width: "100%",
            maxWidth: 300,
            maxHeight: 150,
            objectFit: "contain",
            objectPosition: "left center",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export default DashboardSuggerimento;