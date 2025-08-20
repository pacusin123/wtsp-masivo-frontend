import { Link, useLocation } from "react-router-dom";
import "../css/Menu.css"; // Asegúrate de crear este archivo

const navLinks = [
  {
    to: "/whatsapp",
    label: "Conexión a Whatsapp",
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <circle cx={12} cy={12} r={10} stroke="#60d394" strokeWidth={2}/>
        <path d="M8 13s1.5 2 4 2 4-2 4-2" stroke="#60d394" strokeWidth={2} strokeLinecap="round"/>
        <circle cx={9} cy={10} r={1} fill="#60d394"/>
        <circle cx={15} cy={10} r={1} fill="#60d394"/>
      </svg>
    ),
  },
  {
    to: "/contacts",
    label: "Contactos",
    icon: (
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
        <circle cx={12} cy={8} r={4} fill="#8ecae6"/>
        <ellipse cx={12} cy={18} rx={7} ry={4} fill="#8ecae6" opacity=".3"/>
      </svg>
    ),
  },
  {
    to: "/messages-manager",
    label: "Mensaje",
    icon: (
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
        <rect x={4} y={6} width={16} height={12} rx={2} fill="#ffb703"/>
        <path d="M4 8l8 5 8-5" stroke="#fff" strokeWidth={2}/>
      </svg>
    ),
  },
  {
    to: "/send-message",
    label: "Enviar Mensaje",
    icon: (
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
        <path d="M2 12L22 2 15 22 11 13 2 12z" fill="#60d394"/>
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reportes",
    icon: (
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
        <rect x={4} y={4} width={16} height={16} rx={2} fill="#219ebc"/>
        <path d="M8 12h8M8 16h5" stroke="#fff" strokeWidth={2}/>
      </svg>
    ),
  },
];

export default function Menu({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  return (
    <nav className="menu-container">
      <div className="menu-title">Menu</div>
      <div className="menu-links">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`menu-link${location.pathname === link.to ? " active" : ""}`}
          >
            <span className="menu-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
      <button className="menu-logout" onClick={onLogout}>
        Cerrar sesión
      </button>
    </nav>
  );
}
