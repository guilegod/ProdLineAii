// src/components/BobinaCard.jsx

import { Link } from "react-router-dom";

export default function BobinaCard({ bobina }) {
  const statusColor =
    bobina.status === "Liberada"
      ? "verde"
      : bobina.status === "Bloqueada"
      ? "vermelho"
      : "amarelo";

  return (
    <div className={`bobina-card ${statusColor}`}>
      
      {/* BARRA LATERAL DE STATUS */}
      <div className={`status-bar ${statusColor}`}></div>

      <div className="card-body">
        
        {/* BADGE DE STATUS */}
        <span className={`status-badge ${statusColor}`}>
          {bobina.status?.toUpperCase() || "—"}
        </span>

        {/* TÍTULO */}
        <h3 className="card-rastro">{bobina.rastro || "-"}</h3>

        {/* INFORMAÇÕES */}
        <div className="card-info">
          <p>👷 <b>Operador:</b> {bobina.operador || "—"}</p>
          <p>🪪 <b>Matrícula:</b> {bobina.matricula || "—"}</p>
          <p>🏭 <b>Linha:</b> {bobina.linhaLabel || bobina.linha || "—"}</p>
          <p>⏰ <b>Turno:</b> {bobina.turno || "—"}</p>
          <p>⚙️ <b>Tipo:</b> {bobina.tipo || "-"}</p>
          <p>📏 <b>Diâmetro:</b> {bobina.diametro || "-"}</p>
          <p>🧩 <b>Furos:</b> {bobina.furos ?? "-"}</p>
          <p>📐 <b>Comprimento:</b> {bobina.comprimento ?? 0} m</p>
          <p>⚖️ <b>Peso:</b> {Number(bobina.peso || 0).toFixed(2)} kg</p>
          <p>📅 <b>Data:</b> {bobina.data || "-"}</p>
        </div>

        {/* BOTÃO */}
        <Link
          to={`/bobina/${bobina.rastro}`}
          className="btn-ver-detalhes"
        >
          🔍 Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
