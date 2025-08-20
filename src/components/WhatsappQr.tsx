// src/components/WhatsappQr.tsx
import { useState, useEffect, useRef } from "react";
import { fetchWithToken } from "../api/fetchWithToken";
import "../css/WhatsappConnection.css";

const apiUrl = import.meta.env.VITE_API_URL;

export default function WhatsappQr({ ready, manualQr }: { ready: boolean; manualQr?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [timer, setTimer] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [qr, setQr] = useState<string | null>(manualQr || null);

  const fetchQr = async () => {
    setLoading(true);
    setMsg("");
    setQr(null);
    setTimer(30);
    try {
      const res = await fetchWithToken(`${apiUrl}/whatsapp/qr`);
      if (!res) return;
      if (!res.ok) {
        setMsg("QR no disponible. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setQr(data.qr);
    } catch {
      setMsg("Error al obtener el QR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready || !qr) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          fetchQr();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [qr, ready]);

  useEffect(() => {
    if (!ready) fetchQr();
    else setQr(null);
  }, [ready]);

  if (ready) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="qr-box" style={{ position: "relative" }}>
        {qr && (
          <>
            <div className="qr-timer">{timer}s</div>
            <img src={qr} alt="QR WhatsApp" className="qr-img" />
          </>
        )}
        {!qr && !loading && (
          <div style={{ color: "red", marginTop: 22 }}>{msg || "Esperando QR..."}</div>
        )}
      </div>
      <button className="refresh-btn" onClick={fetchQr} disabled={loading}>
        <span style={{ fontSize: 19 }}>🔄</span> Actualizar QR
      </button>
    </div>
  );
}