import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/Menu";
import WhatsappConnection from "./components/WhatsappConnection";
import ContactsUpload from "./components/ContactsUpload";
import SendMessage from "./components/SendMessage";
import Reports from "./components/Reports";
// import Register from "./components/Register";
import Login from "./components/Login";
import { useState, useEffect } from "react";
import "./App.css";
import MessagesManager from "./components/MessagesManager";

const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 👈 para esperar validación

  useEffect(() => {
    const checkToken = async () => {
      const t = localStorage.getItem("token");
      if (!t) {
        setToken(null);
        setLoading(false);
        return;
      }
      console.log("test")
      try {
        const res = await fetch(`${apiUrl}/auth/validate`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.ok) {
          setToken(t); // token válido
        } else {
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (err) {
        console.error("Error validando token:", err);
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const handleLogin = () => {
    setToken(localStorage.getItem("token"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>; // ⏳ mientras se valida
  }

  return (
    <BrowserRouter>
      {token ? (
        <div className="layout">
          <Menu onLogout={handleLogout} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/whatsapp" />} />
              <Route path="/whatsapp" element={<WhatsappConnection />} />
              <Route path="/contacts" element={<ContactsUpload />} />
              <Route path="/messages-manager" element={<MessagesManager />} />
              <Route path="/send-message" element={<SendMessage />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/login" element={<Navigate to="/whatsapp" />} />
              {/* <Route path="/register" element={<Navigate to="/whatsapp" />} /> */}
              <Route path="*" element={<Navigate to="/whatsapp" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
