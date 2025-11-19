// src/pages/EstoquePage.jsx

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import BobinaCard from "../components/BobinaCard.jsx";
import { fetchBobinas } from "../services/bobinasService.js";
import "../styles/EstoqueStyles.css";
import "../styles/Global.css";

export default function EstoquePage() {
  const [bobinas, setBobinas] = useState([]);

  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [busca, setBusca] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");

  // ============================================================
  // CARREGAR DO BANCO OU LOCALSTORAGE
  // ============================================================
  useEffect(() => {
    async function carregar() {
      const data = await fetchBobinas();

      // Normalização — garante compatibilidade com QualidadePage
      const normalizadas = data.map((b) => ({
        ...b,
        status: b.status || "Aguardando Laudo",
        arquivos: b.arquivos || [],
        producao: b.producao || b.pecas || [],
      }));

      setBobinas(normalizadas);
    }

    carregar();
  }, []);

  // ============================================================
  // FILTROS
  // ============================================================
  const bobinasFiltradas = bobinas
    .filter((b) => {
      if (filtroStatus === "todas") return true;
      return b.status === filtroStatus;
    })
    .filter((b) =>
      busca.trim() === ""
        ? true
        : b.rastro.toLowerCase().includes(busca.toLowerCase())
    )
    .filter((b) => {
      if (!dataFiltro) return true;
      return b.data === dataFiltro;
    });

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================
  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">

        {/* ============================= */}
        {/*   CABEÇALHO DO ESTOQUE       */}
        {/* ============================= */}
        <header className="estoque-header">
          <h1>Estoque de Bobinas</h1>

          <div className="dashboard">
            <div>
              <strong>Total de Bobinas:</strong> {bobinas.length}
            </div>

            <div>
              <strong>Peso Total (kg):</strong>{" "}
              {bobinas
                .reduce((acc, b) => acc + Number(b.peso || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        </header>

        {/* ============================= */}
        {/*          FILTROS              */}
        {/* ============================= */}
        <section className="filtros">
          <h2>Filtros</h2>

          <div className="filtro-container">

            <button onClick={() => setFiltroStatus("todas")}>Todas</button>

            <button onClick={() => setFiltroStatus("Liberada")}>Liberadas</button>

            <button onClick={() => setFiltroStatus("Aguardando Laudo")}>Aguardando</button>

            <button onClick={() => setFiltroStatus("Bloqueada")}>Bloqueadas</button>

            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />

            <input
              type="text"
              placeholder="Buscar por rastro"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </section>

        {/* ============================= */}
        {/*           LISTA              */}
        {/* ============================= */}
        <section className="lista-bobinas">
          {bobinasFiltradas.length === 0 ? (
            <p>Nenhuma bobina encontrada.</p>
          ) : (
            bobinasFiltradas.map((b) => (
              <BobinaCard key={b.rastro} bobina={b} />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
