// src/pages/QualidadePage.jsx

import Sidebar from "../components/Sidebar.jsx";
import { loadLocal, saveLocal } from "../services/bobinasService.js";
import "../styles/Qualidade.css";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function QualidadePage() {
  const [aba, setAba] = useState("analise");
  const [bobinas, setBobinas] = useState(loadLocal());

  function atualizarStatus(rastro, novoStatus) {
    const atualizadas = bobinas.map((b) =>
      b.rastro === rastro ? { ...b, status: novoStatus } : b
    );

    saveLocal(atualizadas);
    setBobinas(atualizadas);
  }

  function anexarLaudo(rastro, arquivo) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;

      const atualizadas = bobinas.map((b) =>
        b.rastro === rastro
          ? {
              ...b,
              arquivos: [
                ...(b.arquivos || []),
                { nome: arquivo.name, base64 },
              ],
            }
          : b
      );

      saveLocal(atualizadas);
      setBobinas(atualizadas);
    };

    reader.readAsDataURL(arquivo);
  }

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">
        <h1 className="qualidade-title">Painel da Qualidade</h1>

        {/* Abas */}
        <div className="qualidade-tabs">
          <button
            className={`qtab ${aba === "analise" ? "active" : ""}`}
            onClick={() => setAba("analise")}
          >
            🧪 Análise / Laudos
          </button>

          <button
            className={`qtab ${aba === "pecas" ? "active" : ""}`}
            onClick={() => setAba("pecas")}
          >
            ⚙️ Peças Produzidas
          </button>
        </div>

        {/* Conteúdo da ABA 1: ANÁLISE */}
        {aba === "analise" && (
          <div className="qualidade-grid">
            {bobinas.map((b) => (
              <div key={b.rastro} className="qualidade-card">

                <h2>{b.rastro}</h2>
                <p><strong>Operador:</strong> {b.operador}</p>

                <p className="status-line">
                  <strong>Status:</strong>
                  <span
                    className={`status-badge ${
                      b.status === "Liberada"
                        ? "status-liberada"
                        : b.status === "Bloqueada"
                        ? "status-bloqueada"
                        : "status-aguardando"
                    }`}
                  >
                    {b.status}
                  </span>
                </p>

                <div className="card-buttons">

                  {/* Liberar */}
                  <button
                    className="btn-q btn-liberar"
                    onClick={() => atualizarStatus(b.rastro, "Liberada")}
                  >
                    ✓ Liberar
                  </button>

                  {/* Bloquear */}
                  <button
                    className="btn-q btn-bloquear"
                    onClick={() => atualizarStatus(b.rastro, "Bloqueada")}
                  >
                    ⛔ Bloquear
                  </button>

                  {/* Anexar laudo */}
                  <button className="btn-q btn-laudo">
                    📎 Anexar Laudo
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls"
                      onChange={(e) => anexarLaudo(b.rastro, e.target.files[0])}
                    />
                  </button>

                  {/* Detalhes */}
                  <Link
                    to={`/bobina/${b.rastro}`}
                    className="btn-q btn-detalhes"
                    style={{ textDecoration: "none" }}
                  >
                    🔍 Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conteúdo ABA 2 — Peças Produzidas */}
        {aba === "pecas" && (
          <div className="qualidade-grid">
            {bobinas.map((b) => (
              <div key={b.rastro} className="qualidade-card">
                <h2>{b.rastro}</h2>
                <h3 style={{ marginTop: "10px", color: "#9fd3ff" }}>Peças</h3>

                {(!b.producao || b.producao.length === 0) && (
                  <p className="sem-pecas">Nenhuma peça registrada.</p>
                )}

                {b.producao?.map((p) => (
                  <div key={p.id} className="pecas-item">
                    <strong>{p.modelo}</strong>  
                    <p>Quantidade: {p.quantidade}</p>
                    <p>Cliente: {p.cliente}</p>
                    <p>Data: {p.data}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
