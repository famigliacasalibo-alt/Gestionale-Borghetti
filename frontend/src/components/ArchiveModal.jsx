import ArchiveTable from "./ArchiveTable";

function ArchiveModal({ open, onClose, events }) {
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
        <h2>🗂️ Archivio eventi</h2>

        <ArchiveTable events={events} />

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

export default ArchiveModal;