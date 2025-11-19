import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div className="page-content">
      <Sidebar />

      <h1 style={{ color: "var(--accent-strong)" }}>Dashboard</h1>

      <div className="card">
        <h3>📦 Bobinas do Dia</h3>
        <p>Total: <b>12</b></p>
      </div>

      <div className="card">
        <h3>🧪 Laudos Pendentes</h3>
        <p>3 aguardando análise</p>
      </div>

      <div className="card">
        <h3>⚙️ Produção</h3>
        <p>Turno ativo: 3º</p>
      </div>
    </div>
  );
}
