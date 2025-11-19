import Sidebar from "../components/Sidebar";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content home-container">
        <h1 className="home-title">Dashboard Geral</h1>

        <div className="home-grid">

          <div className="home-card">
            <div className="icon-box">📦</div>
            <h3>Bobinas do Dia</h3>
            <p>Total: <b>12</b></p>
          </div>

          <div className="home-card">
            <div className="icon-box">🧪</div>
            <h3>Laudos Pendentes</h3>
            <p>3 aguardando análise</p>
          </div>

          <div className="home-card">
            <div className="icon-box">⚙️</div>
            <h3>Produção</h3>
            <p>Turno ativo: <b>3º</b></p>
          </div>

          <div className="home-card">
            <div className="icon-box">🏭</div>
            <h3>Setores</h3>
            <p>Estoque, Qualidade, Produção</p>
          </div>

        </div>

      </main>
    </div>
  );
}
