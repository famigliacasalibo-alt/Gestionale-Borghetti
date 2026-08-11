import { forwardRef } from "react";

const UploadCheckOut = forwardRef(function UploadCheckOut(
  { onCaricaFile },
  ref
) {
  return (
    <input
      ref={ref}
      type="file"
      accept=".xls,.xlsx"
      onChange={onCaricaFile}
      style={{ display: "none" }}
    />
  );
});

export default UploadCheckOut;