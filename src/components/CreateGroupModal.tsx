import { useState } from "react";
import "../css/ConfirmModal.css"; // Reutilizamos estilos del modal existente

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (newGroup: { id: number; name: string }) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: Props) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  async function handleCreate() {
    if (!groupName.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: groupName }),
      });

      if (!res.ok) throw new Error("Error al crear grupo");

      const data = await res.json();
      onGroupCreated(data.group);
      setGroupName("");
      onClose();
    } catch {
      setError("❌ No se pudo crear el grupo");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-new-group">
        <div className="modal-header">
          <h2>Crear Grupo</h2>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <label htmlFor="groupName">Nombre del Grupo</label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
