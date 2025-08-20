import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Login.css";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) setMsg("✅ Usuario registrado correctamente");
      else setMsg(data.message || "Error en el registro");
    } catch {
      setMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-icon">
          {/* Puedes usar el mismo SVG u otro */}
          <svg width={110} height={56} fill="none" viewBox="0 0 24 24">
            <circle cx={12} cy={8} r={4} fill="#fff" opacity="0.8"/>
            <ellipse cx={12} cy={18} rx={7} ry={4} fill="#fff" opacity="0.3"/>
          </svg>
        </div>
        <div className="login-title">Crear usuario</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {msg && <div className="text-sm text-center" style={{color: msg.includes("✅") ? "#10b981" : "#f87171"}}>{msg}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>
        <div className="login-footer">
          ¿Ya tienes cuenta?
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
