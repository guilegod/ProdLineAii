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
  const [visual, setVisual] = useState("estilo1");

  useEffect(() => {
    async function carregar() {
      const data = await fetchBobinas();
      setBobinas(data);
    }
    carregar();
  }, []);

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

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">

        {/* CABEÇALHO */}
        <header className="estoque-header">
          <h1>Estoque de Bobinas</h1>

          <div className="dashboard">
            <div>
              <strong>Total de Bobinas:</strong> {bobinas.length}
            </div>
            <div>
              <strong>Peso Total (kg):</strong>
              {" "}
              {bobinas.reduce((acc, b) => acc + Number(b.peso || 0), 0).toFixed(2)}
            </div>
          </div>
        </header>

        {/* FILTROS */}
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

        {/* MODO VISUAL */}
        <section className="modo-visual">
          <label>🎨 Modo Visual:</label>
          <select value={visual} onChange={(e) => setVisual(e.target.value)}>
            <option value="estilo1">Industrial 3D</option>
            <option value="estilo2">Dashboard Tecnológico</option>
            <option value="estilo3">Minimalista Moderno</option>
          </select>
        </section>

        {/* LISTA */}
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
