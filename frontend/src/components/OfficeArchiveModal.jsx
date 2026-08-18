import OfficeArchiveTable from "./OfficeArchiveTable";

function OfficeArchiveModal({
  open,
  onClose,
  office,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          width: "95%",
          maxWidth: "1200px",
        }}
      >
        <h2>💻 Archivio Office</h2>

        <OfficeArchiveTable office={office} />

        <br />

        <div className="buttons">
          <button onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfficeArchiveModal;