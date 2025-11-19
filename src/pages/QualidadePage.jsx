// ===============================================
// QUALIDADE PAGE — V2 FINAL (BACKEND + FALLBACK)
// ===============================================

import Sidebar from "../components/Sidebar.jsx";
import "../styles/Qualidade.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  loadLocal,
  saveLocal,
  updateBobina,
  fetchBobinas,
} from "../services/bobinasService.js";

export default function QualidadePage() {
  const [aba, setAba] = useState("analise");
  const [bobinas, setBobinas] = useState([]);
  const [mensagem, setMensagem] = useState("");

  // =========================================================
  // NOTIFICAÇÃO DE SUCESSO
  // =========================================================
  function avisar(msg) {
    setMensagem(msg);
    setTimeout(() => setMensagem(""), 2500);
  }

  // =========================================================
  // NORMALIZAR DADOS DO BACKEND
  // (lista /bobinas → arquivos vêm com conteudo)
  // =========================================================
  function normalizar(b) {
    return {
      ...b,
      producao: b.producoes || [],
      arquivos:
        b.arquivos?.map((a) => ({
          nome: a.nome,
          tipo: a.tipo,
          base64: a.conteudo, // front trabalha SEMPRE com base64
        })) || [],
      fotos: b.fotos?.map((f) => f.data) || [],
      historicoQualidade: b.historicos || [],
    };
  }

  // =========================================================
  // CARREGAR LISTA
  // =========================================================
  async function carregarBobinas() {
    try {
      const data = await fetchBobinas(); // usa API_URL do service
      const lista = data.map((b) => normalizar(b));

      setBobinas(lista);
      saveLocal(lista);
    } catch {
      console.warn("⚠ Offline → usando local");
      const local = loadLocal() || [];
      setBobinas(local);
    }
  }

  useEffect(() => {
    carregarBobinas();
  }, []);

  // =========================================================
  // MONTAR PAYLOAD (FORMATO DO DETALHES / updateBobina)
  // =========================================================
  function montarPayload(bobina, extras = {}) {
    const fotosBase = extras.fotos ?? bobina.fotos ?? [];
    const arquivosBase = extras.arquivos ?? bobina.arquivos ?? [];
    const producaoBase = extras.producao ?? bobina.producao ?? [];
    const historicoBase =
      extras.historicoQualidade ?? bobina.historicoQualidade ?? [];

    return {
      ...bobina,
      ...extras,

      fotos: fotosBase.map((f) => f),

      arquivos: arquivosBase.map((a) => ({
        nome: a.nome,
        tipo: a.tipo,
        base64: a.base64, // o service/ backend converte base64 → conteudo
      })),

      producao: producaoBase,
      historicoQualidade: historicoBase,
    };
  }

  // =========================================================
  // ATUALIZAR STATUS
  // =========================================================
  async function atualizarStatus(rastro, novoStatus) {
    const bobina = bobinas.find((b) => b.rastro === rastro);
    if (!bobina) return;

    const payload = montarPayload(bobina, { status: novoStatus });

    try {
      await updateBobina(rastro, payload);
      avisar(`Status atualizado para "${novoStatus}"`);
      carregarBobinas();
    } catch {
      console.warn("⚠ Offline → fallback local");
      const loc = bobinas.map((b) =>
        b.rastro === rastro ? { ...b, status: novoStatus } : b
      );
      saveLocal(loc);
      setBobinas(loc);
      avisar("Status salvo localmente.");
    }
  }

  // =========================================================
  // ANEXAR LAUDO (ARQUIVO)
  // =========================================================
  function anexarLaudo(rastro, arquivo) {
    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64 = e.target.result;

      const bobina = bobinas.find((b) => b.rastro === rastro);
      if (!bobina) return;

      const novoArquivo = {
        nome: arquivo.name,
        tipo: arquivo.type,
        base64, // igual Detalhes / padrão front
      };

      const novosArquivos = [...(bobina.arquivos || []), novoArquivo];

      const payload = montarPayload(bobina, {
        arquivos: novosArquivos,
      });

      try {
        await updateBobina(rastro, payload);
        avisar("📎 Laudo anexado com sucesso!");
        carregarBobinas();
      } catch {
        console.warn("⚠ Offline → fallback local");

        const loc = bobinas.map((b) =>
          b.rastro === rastro ? { ...b, arquivos: novosArquivos } : b
        );

        saveLocal(loc);
        setBobinas(loc);
        avisar("📎 Laudo salvo localmente.");
      }
    };

    reader.readAsDataURL(arquivo);
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">
        {mensagem && <p className="msg-sucesso">{mensagem}</p>}

        <h1 className="qualidade-title">Painel da Qualidade</h1>

        {/* ABAS */}
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

        {/* ABA ANÁLISE */}
        {aba === "analise" && (
          <div className="qualidade-grid">
            {bobinas.map((b) => (
              <div key={b.rastro} className="qualidade-card">
                <h2>{b.rastro}</h2>
                <p>
                  <strong>Operador:</strong> {b.operador}
                </p>

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
                  <button
                    className="btn-q btn-liberar"
                    onClick={() => atualizarStatus(b.rastro, "Liberada")}
                  >
                    ✓ Liberar
                  </button>

                  <button
                    className="btn-q btn-bloquear"
                    onClick={() => atualizarStatus(b.rastro, "Bloqueada")}
                  >
                    ⛔ Bloquear
                  </button>

                  <button className="btn-q btn-laudo">
                    📎 Anexar Laudo
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls"
                      onChange={(e) =>
                        anexarLaudo(b.rastro, e.target.files[0])
                      }
                    />
                  </button>

                  <Link
                    to={`/bobina/${b.rastro}`}
                    className="btn-q btn-detalhes"
                  >
                    🔍 Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA PEÇAS */}
        {aba === "pecas" && (
          <div className="qualidade-grid">
            {bobinas.map((b) => (
              <div key={b.rastro} className="qualidade-card">
                <h2>{b.rastro}</h2>
                <h3 className="pecas-title">Peças</h3>

                {(!b.producao || b.producao.length === 0) && (
                  <p className="sem-pecas">Nenhuma peça registrada.</p>
                )}

                {b.producao?.map((p, i) => (
                  <div key={i} className="pecas-item">
                    <strong>{p.modelo}</strong>
                    <p>Quantidade: {p.quantidade}</p>
                    <p>Cliente: {p.cliente}</p>
                    <p>Data: {p.data}</p>
                    {p.obs && <p>Obs: {p.obs}</p>}
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
