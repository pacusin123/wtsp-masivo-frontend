import { useEffect, useState, type FormEvent } from "react";
import { fetchWithToken } from "../api/fetchWithToken";
import "../css/SendMessage.css";
import { io as socketIO } from "socket.io-client";
import NotificationMessage from "./NotificationMessage";


const apiUrl = import.meta.env.VITE_API_URL;
const apiUrlHost = import.meta.env.VITE_API_HOST;

interface Group {
  id: number;
  name: string;
}

interface Message {
  id: number;
  title: string;
  message: string;
  image_url?: string;
}

interface SendProgress {
  name: string;
  phone: string;
  index: number;
  total: number;
  status: "enviado" | "error";
  error?: string;
}

export default function SendMessage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [progressList, setProgressList] = useState<SendProgress[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type?: "success" | "error" | "info";
    duration: number;
  } | null>(null);

  useEffect(() => {
    loadGroups();
    loadMessages();
    const socket = socketIO(apiUrlHost);

    socket.on("connect", () => {
      console.log("🔌 Conectado a socket", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado del socket");
    });

    socket.on("send-progress", (data: SendProgress) => {
      setProgressList(prev => [...prev, data]);
    });

    socket.on("send-complete", (data) => {
      console.log("✅ Envío completado:", data);
      setNotification({ message: `✅ Envío completado. Total: ${data.total}`, type: "info", duration: 5000 });
      setSending(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function loadGroups() {
    const res = await fetchWithToken(`${apiUrl}/groups`);
    if (!res) return;
    const data = await res.json();
    setGroups(data.groups || []);
  }

  async function loadMessages() {
    const res = await fetchWithToken(`${apiUrl}/messages`);
    if (!res) return;
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!selectedGroup || !selectedMessage) {
      setNotification({ message: `Selecciona un grupo y un mensaje.`, type: "info", duration: 2000 });

      return;
    }
    setSending(true);
    setNotification({ message: `Enviando mensajes...`, type: "info", duration: 2000 });
    setProgressList([]);
    const res = await fetchWithToken(`${apiUrl}/messages/send-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: selectedGroup,
        messageId: selectedMessage,
      }),
    });
    if (!res) return;
    if (res.ok) {
      setNotification({ message: `El envio de mensajes a sido iniciado...`, type: "info", duration: 2000 });

    } else {
      setNotification({ message: `Error al enviar mensajes`, type: "error", duration: 2000 });
    }
  }

  return (
    <div className="send-message-container">
      <h2>Enviar mensaje masivo</h2>
      <form onSubmit={handleSend} className="send-form-horizontal">
        <div className="form-group">
          <label>Grupo:</label>
          <select
            value={selectedGroup || ""}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
            required
          >
            <option value="">Selecciona grupo</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Mensaje:</label>
          <select
            value={selectedMessage || ""}
            onChange={(e) => setSelectedMessage(Number(e.target.value))}
            required
          >
            <option value="">Selecciona mensaje</option>
            {messages.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="send-button" disabled={sending}>
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {progressList.length > 0 && (
        <div className="progress-container">
          <h4 className="progress-title">Progreso de envío</h4>
          <table className="progress-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {progressList.map((item, index) => (
                <tr key={index}>
                  <td>{item.index}/{item.total}</td>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td className={item.status}>
                    {item.status}
                  </td>
                  <td>{item.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
