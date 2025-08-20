import { useEffect, useRef, useState } from "react";
import { fetchWithToken } from "../api/fetchWithToken";

const apiUrl = import.meta.env.VITE_API_URL;

type Props = {
  onLogout: () => void;
  initialNumber: string | null;
};

export default function WhatsappStatus({ onLogout, initialNumber  }: Props) {
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timer, setTimer] = useState(30);
  const [number, setNumber] = useState<string | null>(initialNumber);



  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          fetchStatus();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetchWithToken(`${apiUrl}/whatsapp/status`);
      if (!res) return;
      const data = await res.json();
      setNumber(data.number);
    } catch {
      setNumber(null);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 32 }}>
      <div style={{ fontSize: 48, color: "purple" }}>📱</div>
      <div style={{ color: "green", fontWeight: "bold", marginTop: 8 }}>
        Dispositivo vinculado:<br />
        <span style={{ fontSize: 22 }}>+{number}</span>
      </div>

      <div style={{
        background: "#888",
        color: "#fff",
        padding: "4px 16px",
        borderRadius: 8,
        display: "inline-block",
        marginTop: 10,
        fontSize: 18,
        fontWeight: "bold"
      }}>
        Refrescando en {timer}s
      </div>

      <button
        onClick={onLogout}
        style={{
          backgroundColor: "#e53935",
          color: "white",
          padding: "10px 20px",
          marginTop: 16,
          border: "2px solid black",
          borderRadius: 6,
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🔁 Cerrar sesión y obtener nuevo QR
      </button>
    </div>
  );
}
