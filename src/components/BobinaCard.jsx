import { Link } from "react-router-dom";

export default function BobinaCard({ bobina }) {
  const statusColor =
    bobina.status === "Liberada"
      ? "verde"
      : bobina.status === "Bloqueada"
      ? "vermelho"
      : "amarelo";

  return (
    <div className={`card-bobina estilo1 ${statusColor}`}>
      <div className={`left-status ${statusColor}`}></div>

      <div className="right-info">
        <div className={`badge-status ${statusColor}`}>
          {bobina.status.toUpperCase()}
        </div>

        <h3>{bobina.rastro || "-"}</h3>

        <p>👷 <b>Operador:</b> {bobina.operador || "—"}</p>
        <p>🪪 <b>Matrícula:</b> {bobina.matricula || "—"}</p>
        <p>🏭 <b>Linha:</b> {bobina.linha || "—"}</p>
        <p>⏰ <b>Turno:</b> {bobina.turno || "—"}</p>
        <p>⚙️ <b>Tipo:</b> {bobina.tipo || "-"}</p>
        <p>📏 <b>Diâmetro:</b> {bobina.diametro || "-"}</p>
        <p>🧩 <b>Furos:</b> {bobina.furos ?? "-"}</p>
        <p>📐 <b>Comprimento:</b> {bobina.comprimento ?? 0} m</p>
        <p>⚖️ <b>Peso:</b> {Number(bobina.peso || 0).toFixed(2)} kg</p>
        <p>📅 <b>Data:</b> {bobina.data || "-"}</p>

        <div className="card-actions">
          <Link
            to={`/bobina/${bobina.rastro}`}
            className="btn-detalhes"
            style={{ textDecoration: "none" }}
          >
            🔍 Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
