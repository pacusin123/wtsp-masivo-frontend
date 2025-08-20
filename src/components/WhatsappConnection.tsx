// src/components/WhatsappConnection.tsx
import { useState, useEffect, useRef } from "react";
import WhatsappQr from "./WhatsappQr";
import WhatsappStatus from "./WhatsappStatus";
import { fetchWithToken } from "../api/fetchWithToken";
import NotificationMessage from "./NotificationMessage";
import { io as socketIO } from "socket.io-client";
import "../css/WhatsappConnection.css";

const apiUrl = import.meta.env.VITE_API_URL;
const apiUrlHost = import.meta.env.VITE_API_HOST;

function StepsGuide() {
  return (
    <div className="steps-guide">
      <h1>Vincular con WhatsApp</h1>
      <h2>Pasos a seguir:</h2>
      <ol>
        <li>Abre WhatsApp en tu teléfono</li>
        <li>Toca los tres puntos en la parte superior</li>
        <li>Selecciona <b>Dispositivos vinculados</b></li>
        <li>Toca <b>Vincular dispositivo</b></li>
        <li>Valida tu identidad (puede requerir huella dactilar o PIN)</li>
        <li>Escanea el código QR que aparece a la derecha</li>
      </ol>
    </div>
  );
}

export default function WhatsappConnection() {
  const [ready, setReady] = useState(false);
  const [messageConnection, setMessageConnection] = useState("");
  const [number, setNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [manualQr, setManualQr] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetchWithToken(`${apiUrl}/whatsapp/status`);
      if (!res) return;
      const data = await res.json();
      setReady(data.ready);
      setNumber(data.number);
    } catch {
      setReady(false);
      setNumber(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (intervalRef.current) return;

    fetchStatus();

    const socket = socketIO(apiUrlHost);

    socket.on("authenticated", (data) => {
      setLoading(true);
      setMessageConnection(data.message);
    });

    socket.on("ready", (data) => {
      setLoading(false);
      setNumber(data.number);
      setReady(true);
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleLogout = async () => {
    const res = await fetchWithToken(`${apiUrl}/whatsapp/logout`, { method: "POST", headers: { "Content-Type": "application/json" } });
    if (!res) return;
    const data = await res.json();
    if (data.qr) setManualQr(data.qr);
    setReady(false);
    setNumber(null);
    setNotification({ message: data.message, type: `${res.ok ? "info" : "error"}` });
  };

  return (
    <div className="whatsapp-connection">
      <div style={{ flex: 1 }}>
        <StepsGuide />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {loading ? (
          <span style={{ fontSize: 18 }}>🔄 {messageConnection}</span>
        ) : ready && number ? (
          <WhatsappStatus initialNumber={number} onLogout={handleLogout} />
        ) : (
          <WhatsappQr ready={ready} manualQr={manualQr} />
        )}
      </div>      
      
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