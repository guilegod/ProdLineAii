import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  function toggleMenu() {
    setOpen(!open);
  }

  return (
    <>
      {/* BOTÃO HAMBÚRGUER */}
      <button className="hamburger-btn" onClick={toggleMenu}>
        ☰
      </button>

      {/* OVERLAY – fecha o menu ao clicar fora */}
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={toggleMenu}
      ></div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Bundy</h2>
        </div>

        <nav className="sidebar-links">
          <Link to="/" onClick={toggleMenu}>🏠 Home</Link>
          <Link to="/cadastro" onClick={toggleMenu}>📝 Cadastro</Link>
          <Link to="/estoque" onClick={toggleMenu}>📦 Estoque</Link>
          <Link to="/producao" onClick={() => setOpen(false)}>🛠 Produção</Link>
          <Link to="/laboratorio" onClick={toggleMenu}>🔬 Laboratório</Link>
          <Link to="/qualidade" onClick={toggleMenu}>✔ Qualidade</Link>
          <Link to="/coordenacao" onClick={toggleMenu}>📚 Coordenação</Link>
          <Link to="/scanner" onClick={toggleMenu}>📷 Scanner</Link>
        </nav>
      </aside>
    </>
  );
}
