// src/pages/CoordenacaoPage.jsx

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { fetchBobinas, deleteBobina } from "../services/bobinasService.js";
import "../styles/Coordenacao.css";

// Para gráficos
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function CoordenacaoPage() {
  const [bobinas, setBobinas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Gerenciamento / exclusão
  const [selecionada, setSelecionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // ===============================
  // 🔄 CARREGAR DO BACKEND (COM FALLBACK)
  // ===============================
  useEffect(() => {
    async function carregar() {
      try {
        const data = await fetchBobinas(); // já faz fallback pro localStorage se API cair
        setBobinas(data || []);
      } catch (err) {
        console.warn("Erro ao carregar bobinas na Coordenação:", err);
        setBobinas([]);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  // ===============================
  // 📊 CÁLCULOS
  // ===============================

  const totalBobinas = bobinas.length;

  const totalPeso = bobinas.reduce(
    (a, b) => a + Number(b.peso || 0),
    0
  );

  const aguardando = bobinas.filter(
    (b) => b.status === "Aguardando Laudo"
  ).length;

  const liberadas = bobinas.filter(
    (b) => b.status === "Liberada"
  ).length;

  const bloqueadas = bobinas.filter(
    (b) => b.status === "Bloqueada"
  ).length;

  // GRÁFICO — Pizza
  const pieData = [
    { name: "Liberadas", value: liberadas },
    { name: "Aguardando", value: aguardando },
    { name: "Bloqueadas", value: bloqueadas },
  ];

  const pieColors = ["#00C46E", "#FFD43B", "#FF4C4C"];

  // Produção por dia
  const producaoPorDia = {};
  bobinas.forEach((b) => {
    if (!b.data) return;
    if (!producaoPorDia[b.data]) producaoPorDia[b.data] = 0;
    producaoPorDia[b.data] += 1;
  });

  const linhaData = Object.keys(producaoPorDia)
    .sort() // deixa as datas em ordem
    .map((d) => ({
      day: d,
      bobinas: producaoPorDia[d],
    }));

  // ===============================
  // 🗑️ AÇÕES DE EXCLUSÃO
  // ===============================
  function selecionarBobina(b) {
    setSelecionada((atual) =>
      atual?.rastro === b.rastro ? null : b
    );
  }

  async function confirmarExclusao() {
    if (!selecionada) return;

    try {
      await deleteBobina(selecionada.rastro);

      setBobinas((prev) =>
        prev.filter((b) => b.rastro !== selecionada.rastro)
      );

      setMensagem(`Bobina ${selecionada.rastro} excluída com sucesso.`);
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao excluir bobina.");
    } finally {
      setMostrarModal(false);
      setSelecionada(null);
      setTimeout(() => setMensagem(""), 2500);
    }
  }

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content coordenacao-page">

        <h1 className="titulo-coordenacao">📊 Painel da Coordenação</h1>

        {carregando && <p>Carregando dados...</p>}
        {mensagem && <p className="msg-coordenacao">{mensagem}</p>}

       
        {/* =========================================== */}
        {/* 🔥 INDICADORES RÁPIDOS */}
        {/* =========================================== */}
        <div className="cards-indicadores">

          <div className="indicador-card">
            <h3>📦 Total de Bobinas</h3>
            <p className="numero">{totalBobinas}</p>
          </div>

          <div className="indicador-card">
            <h3>⚖️ Peso Total</h3>
            <p className="numero">{totalPeso.toFixed(2)} kg</p>
          </div>

          <div className="indicador-card amarelo">
            <h3>🧪 Aguardando Laudo</h3>
            <p className="numero">{aguardando}</p>
          </div>

          <div className="indicador-card verde">
            <h3>✓ Liberadas</h3>
            <p className="numero">{liberadas}</p>
          </div>

          <div className="indicador-card vermelho">
            <h3>⛔ Bloqueadas</h3>
            <p className="numero">{bloqueadas}</p>
          </div>

        </div>

        {/* =========================================== */}
        {/* 📈 GRÁFICO DE PRODUÇÃO DIÁRIA */}
        {/* =========================================== */}
        <div className="grafico-card">
          <h2>📅 Produção por Dia</h2>
          {linhaData.length === 0 ? (
            <p>Sem dados suficientes para gerar o gráfico.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={linhaData}>
                <Line
                  type="monotone"
                  dataKey="bobinas"
                  stroke="#0d6efd"
                  strokeWidth={3}
                />
                <CartesianGrid stroke="#ccc" strokeDasharray="4 4" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* =========================================== */}
        {/* 🥧 GRÁFICO DE STATUS */}
        {/* =========================================== */}
        <div className="grafico-card">
          <h2>📌 Distribuição por Status</h2>
          {totalBobinas === 0 ? (
            <p>Sem bobinas para exibir.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* =========================================== */}
        {/* 🔍 ÚLTIMAS BOBINAS */}
        {/* =========================================== */}
        <h2 className="subtitulo">📄 Últimas Bobinas Registradas</h2>

        <div className="lista-recentes">
          {bobinas.length === 0 && (
            <p>Não há bobinas registradas ainda.</p>
          )}

          {bobinas
            .slice(-6)
            .reverse()
            .map((b) => (
              <div key={b.rastro} className="card-recente">

                <div
                  className={`st ${
                    b.status === "Liberada"
                      ? "green"
                      : b.status === "Bloqueada"
                      ? "red"
                      : "yellow"
                  }`}
                ></div>

                <div className="info-recente">
                  <h3>{b.rastro}</h3>
                  <p><b>Status:</b> {b.status}</p>
                  <p><b>Operador:</b> {b.operador}</p>
                  <p><b>Peso:</b> {b.peso} kg</p>
                  <p><b>Data:</b> {b.data}</p>
                </div>

              </div>
            ))}
        </div>

        {/* =========================================== */}
        {/* MODAL CONFIRMAÇÃO EXCLUSÃO */}
        {/* =========================================== */}
        {mostrarModal && selecionada && (
          <div className="modal-excluir-backdrop">
            <div className="modal-excluir">
              <h3>Confirmar exclusão</h3>
              <p>
                Tem certeza que deseja excluir a bobina{" "}
                <strong>{selecionada.rastro}</strong>?<br />
                Esta ação não poderá ser desfeita.
              </p>

              <div className="modal-btns">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn-confirmar"
                  onClick={confirmarExclusao}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
         {/* =========================================== */}
        {/* 🗂 PAINEL ADMINISTRATIVO (EXCLUSÃO) */}
        {/* =========================================== */}
        <h2 className="subtitulo">🗂 Painel Administrativo</h2>

        <div className="gerenciamento-card">
          <p className="ger-descricao">
            Selecione uma bobina para exclusão controlada. Essa ação é registrada e não pode ser desfeita.
          </p>

          <div className="lista-gerenciamento">
            {bobinas.length === 0 && (
              <p className="texto-vazio">
                Nenhuma bobina encontrada para gerenciamento.
              </p>
            )}

            {bobinas.map((b) => (
              <button
                key={b.rastro}
                type="button"
                className={
                  "item-gerenciamento" +
                  (selecionada?.rastro === b.rastro ? " ativo" : "")
                }
                onClick={() => selecionarBobina(b)}
              >
                <div className="info-item-ger">
                  <strong>{b.rastro}</strong>
                  <span>{b.operador || "Operador não informado"}</span>
                  <span>{b.data || "Data não informada"}</span>
                </div>

                <div
                  className={
                    "status-bolinha-ger " +
                    (b.status === "Liberada"
                      ? "green"
                      : b.status === "Bloqueada"
                      ? "red"
                      : "yellow")
                  }
                ></div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-excluir"
            disabled={!selecionada}
            onClick={() => setMostrarModal(true)}
          >
            ❌ Excluir bobina selecionada
          </button>
        </div>


      </main>
    </div>
  );
}
