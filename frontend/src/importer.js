import * as XLSX from "xlsx";
import unita from "./data/unita";

function normalizzaAppartamento(nome) {
  if (!nome) return "";

  let testo = nome.toUpperCase().trim();

  testo = testo.replace("APPARTAMENTO", "").trim();

  if (testo.includes("BOPA")) {
    const match = testo.match(/BOPA\s*([0-9]+S?)/);
    if (match) return `BOPA${match[1]}`;
  }

  if (testo.includes("BOSA")) {
    const match = testo.match(/BOSA\s*([0-9]+S?)/);
    if (match) return `BOSA${match[1]}`;
  }

  if (testo === "BOCA") {
    return "BOCA";
  }

  return testo;
}

function formattaData(dataExcel) {
  if (!dataExcel) return "";

  if (typeof dataExcel === "number") {
    const data = XLSX.SSF.parse_date_code(dataExcel);

    return `${String(data.d).padStart(2, "0")}/${String(data.m).padStart(
      2,
      "0"
    )}/${data.y}`;
  }

  return dataExcel;
}

export function importaAmicHotel(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (evento) => {
      const dati = new Uint8Array(evento.target.result);

      const workbook = XLSX.read(dati, {
        type: "array",
      });

      const foglio = workbook.Sheets[workbook.SheetNames[0]];

      const righe = XLSX.utils.sheet_to_json(foglio);

      const checkOut = righe.map((riga) => {
        const nomeAppartamento = normalizzaAppartamento(
          riga.Alloggio
        );

        const unitaTrovata = unita.find(
          (u) => u.nome === nomeAppartamento
        );

        return {
          unitId: unitaTrovata ? unitaTrovata.id : null,

          appartamento: nomeAppartamento,

          partenza: formattaData(riga.Partenza),

          allestimento: false,

          manutenzioni: false,

          note: "",
        };
      });

      resolve(checkOut);
    };

    reader.readAsArrayBuffer(file);
  });
}