// src/pages/HomePage.jsx
import Sidebar from "../components/Sidebar";

export default function HomePage() {
  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">
        <h1>Início</h1>
        <p>Bem-vindo ao Bundy System.</p>
      </main>
    </div>
  );
}
