// src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  function toggleMenu() {
    setOpen((prev) => !prev);
  }

  function closeMenu() {
    setOpen(false);
  }

  const links = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/cadastro", label: "Cadastro", icon: "📝" },
    { to: "/estoque", label: "Estoque", icon: "📦" },
    { to: "/producao", label: "Produção", icon: "🛠" },
    { to: "/laboratorio", label: "Laboratório", icon: "🔬" },
    { to: "/qualidade", label: "Qualidade", icon: "✔" },
    { to: "/coordenacao", label: "Coordenação", icon: "📚" },
    { to: "/scanner", label: "Scanner", icon: "📷" },
  ];

  return (
    <>
      {/* BOTÃO HAMBÚRGUER (MOBILE) */}
      <button
        className="hamburger-btn"
        onClick={toggleMenu}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={closeMenu}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-circle">PL</div>
          <div className="sidebar-title-block">
            <h2 className="sidebar-title">Bundy</h2>
            <span className="sidebar-subtitle">Linha de Produção</span>
          </div>
        </div>

        <nav className="sidebar-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-text">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
