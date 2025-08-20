import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Login.css";

const apiUrl = import.meta.env.VITE_API_URL;

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  loading?: boolean;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, loading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(apiUrl + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      onLogin(username, password);
    } else {
      setMsg(data.message || "Login failed");
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-icon">
          {/* Ícono SVG usuario */}
          <svg width={110} height={56} fill="none" viewBox="0 0 24 24">
            <circle cx={12} cy={8} r={4} fill="#fff" opacity="0.8"/>
            <ellipse cx={12} cy={18} rx={7} ry={4} fill="#fff" opacity="0.3"/>
          </svg>
        </div>
        <div className="login-title">Iniciar sesión</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {msg && <div className="text-red-600 text-sm text-center">{msg}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <div className="login-footer">
          ¿No tienes cuenta?
          <Link to="/register">Crear usuario</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
