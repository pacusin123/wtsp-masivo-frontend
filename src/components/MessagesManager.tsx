import { useEffect, useState, type FormEvent } from "react";
import { fetchWithToken } from "../api/fetchWithToken";
import "../css/MessagesManager.css";
import NotificationMessage from "./NotificationMessage";
import ConfirmModal from "../components/ConfirmModal";

const apiUrl = import.meta.env.VITE_API_URL;

interface Message {
  id: number;
  title: string;
  message: string;
  image_url?: string;
  created_at: string;
}

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [msgText, setMsgText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, [refreshFlag]);

  async function loadMessages() {
    const res = await fetchWithToken(`${apiUrl}/messages`);
    if (!res) return;
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", msgText);
    if (file) formData.append("image", file);

    const url = editingMessageId
      ? `${apiUrl}/messages/${editingMessageId}`
      : `${apiUrl}/messages`;
    const method = editingMessageId ? "PUT" : "POST";

    const res = await fetchWithToken(url, {
      method,
      body: formData,
    });

    if (!res) return;

    if (res.ok) {
      await res.json();
      setNotification({ message: `✅ Mensaje ${editingMessageId ? "actualizado" : "guardado"}`, type: "success" });
      setTitle("");
      setMsgText("");
      setFile(null);
      setShowModal(false);
      setEditingMessageId(null);
      setRefreshFlag((flag) => flag + 1);
    } else {
      setNotification({ message: `Error al ${editingMessageId ? "actualizar" : "guardar"} mensaje`, type: "error" });
    }
  }

  function handleEdit(msg: Message) {
    setTitle(msg.title);
    setMsgText(msg.message);
    setFile(null);
    setEditingMessageId(msg.id);
    setShowModal(true);
  }

  async function handleDeleteConfirm() {
    const response = await fetchWithToken(`${apiUrl}/messages/${messageToDelete?.id}`, { method: "DELETE" });
    setRefreshFlag(flag => flag + 1);

    if (!response) return;

    if (response.ok) {
      setMessages((prev) => prev.filter((g) => g.id !== messageToDelete?.id));
      setNotification({ message: "🗑️ Mensaje eliminado", type: "success" });
    } else {
      setNotification({ message: "❌ No se pudo eliminar el mensaje" });
    }

    setMessageToDelete(null);
    setShowDeleteModal(false);
  }

  function openDeleteModal(message: Message) {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  }

  const filteredMessages = messages.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="table-header">
        <h2>Mensajes</h2>
        <div className="table-controls">
          <input
            type="text"
            placeholder="Buscar por título"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => {
            setTitle("");
            setMsgText("");
            setFile(null);
            setEditingMessageId(null);
            setShowModal(true);
          }}>+ Agregar mensaje</button>
        </div>
      </div>

      <table className="message-table">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "18%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Mensaje</th>
            <th>Imagen</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredMessages.map((msg) => (
            <tr key={msg.id}>
              <td>{msg.id}</td>
              <td>{msg.title}</td>
              <td style={{ textAlign: "left" }}>{msg.message}</td>
              <td style={{ textAlign: "center" }}>
                {msg.image_url ? (
                  <button
                    onClick={() => setPreviewImage(`${msg.image_url}`)}
                    title="Ver imagen"
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
                  >
                    👁️
                  </button>
                ) : (
                  <span title="Sin imagen" style={{ fontSize: 18, opacity: 0.5 }}>🚫</span>
                )}
              </td>
              <td>{new Date(msg.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(msg)} title="Editar" style={{ marginRight: "8px" }}>✏️</button>
                <button onClick={() => openDeleteModal(msg)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingMessageId ? "Editar mensaje" : "Nuevo mensaje"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">

                <input
                  type="text"
                  placeholder="Título"
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  placeholder="Mensaje"
                  value={msgText}
                  required
                  onChange={(e) => setMsgText(e.target.value)}
                />
                <div className="info-message">Agrega @nombre, @variable1, @variable2 o @variable3 para reemplazar en su mensaje</div>
                <input
                  title="agregar archivo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile && selectedFile.size > 4 * 1024 * 1024) {
                      setNotification({ message: `La imagen debe ser menor a 4MB.`, type: "error" });
                      e.target.value = "";
                      setFile(null);
                    } else {
                      setFile(selectedFile || null);
                    }
                  }}
                />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-save" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <img src={previewImage} alt="Vista previa" style={{ width: "100%", height: "auto" }} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Mensaje"
        message={`¿Estás seguro de eliminar el mensaje ${messageToDelete?.title}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />

      {notification && (
        <NotificationMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
