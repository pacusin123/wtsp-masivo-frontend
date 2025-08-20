// src/components/ImportFromExcelModal.tsx
import React, { useState } from "react";
import "../css/ConfirmModal.css"; // usa tu estilo general de modales

interface Props {
  onClose: () => void;
  onImport: (file: File) => void;
}

const ImportFromExcelModal: React.FC<Props> = ({ onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportClick = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/ejempplo.xlsx"; // asegúrate de copiar tu Excel a la carpeta `public`
    link.download = "ejemplo.xlsx";
    link.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal modern">
        <div className="modal-header">
          <h2>Importar Miembros desde Excel</h2>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <button className="btn-download" onClick={handleDownloadTemplate}>
            📥 Descargar Plantilla Excel
          </button>

          <div style={{ marginTop: "1.5rem" }}>
            <label htmlFor="fileInput"><strong>Seleccionar archivo</strong></label>
            <input
              id="fileInput"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              style={{ display: "block", marginTop: "0.5rem" }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="btn-save"
            onClick={handleImportClick}
            disabled={!selectedFile}
          >
            Importar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportFromExcelModal;
