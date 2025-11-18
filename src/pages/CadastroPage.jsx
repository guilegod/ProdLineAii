// src/pages/Cadastro.jsx
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../components/Sidebar.jsx";
import { loadLocal, saveLocal, createBobina } from "../services/bobinasService.js";
import "../styles/CadastroStyles.css";

// turnos automáticos
function calcularTurno() {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 14) return "1º Turno";
  if (hora >= 14 && hora < 22) return "2º Turno";
  return "3º Turno";
}

export default function CadastroPage() {
  const [rastro, setRastro] = useState("");
  const [linha, setLinha] = useState("L1");
  const [turno, setTurno] = useState(calcularTurno);
  const [origem, setOrigem] = useState("Bundy");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  const [operador, setOperador] = useState("");
  const [matricula, setMatricula] = useState("");
  const [tipo, setTipo] = useState("");
  const [diametro, setDiametro] = useState("");
  const [furos, setFuros] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [peso, setPeso] = useState("");

  const [status] = useState("Aguardando Laudo");
  const [observacoes, setObservacoes] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [mostrarQR, setMostrarQR] = useState(false);

  const urlBobina = `${window.location.origin}/bobina/${encodeURIComponent(
    rastro || ""
  )}`;

  // ============================================================
  // SALVAR BOBINA
  // ============================================================
  async function handleSubmit(e) {
    e.preventDefault();

    if (!rastro || !operador || !matricula || !tipo || !diametro || !peso) {
      setMensagem("Preencha Rastro, Operador, Matrícula, Tipo, Diâmetro e Peso.");
      return;
    }

    const novaBobina = {
      rastro,
      operador,
      matricula,
      linha,
      linhaLabel: linha === "L1" ? "Linha 01" : "Linha 02",
      tipo,
      diametro,
      furos: Number(furos || 0),
      comprimento,
      peso: Number(peso || 0),
      status: "Aguardando Laudo",
      data,
      turno,
      origem,
      observacoes,
      fotos: [],
      producao: [],
      arquivos: [],
      historicoQualidade: [],
    };

    try {
      // SALVA NO BACKEND
      const salvo = await createBobina(novaBobina);

      // sincroniza localStorage com o retorno da API
      const atual = loadLocal().filter((b) => b.rastro !== salvo.rastro);
      saveLocal([...atual, salvo]);

      setMensagem(`Bobina ${rastro} salva com sucesso!`);
      setMostrarQR(true);

    } catch (err) {
      console.warn("Erro API, salvando local:", err);

      // fallback LOCAL
      const atual = loadLocal().filter((b) => b.rastro !== novaBobina.rastro);
      saveLocal([...atual, novaBobina]);

      setMensagem("⚠ API offline — Bobina salva somente localmente.");
      setMostrarQR(true);
    }
  }

  // ============================================================
  // IMPRIMIR QR
  // ============================================================
  function imprimirQR() {
    const canvas = document.querySelector(".qr-pos-cadastro canvas");
    if (!canvas) return;

    const img = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`<img src="${img}" style="width:280px">`);
    win.print();
    win.close();
  }

  // ============================================================
  // LAYOUT
  // ============================================================
  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content cadastro-page">
        {/* CABEÇALHO */}
        <section className="cadastro-header-card">
          <h1>Cadastro de Bobina</h1>
          <p>
            Rastro selecionado:{" "}
            <strong>{rastro || "— digite o código da bobina —"}</strong>
          </p>
        </section>

        {/* FORMULÁRIO */}
        <section className="cadastro-form-card">
          <h2>Dados da Bobina</h2>

          <form className="cadastro-form" onSubmit={handleSubmit}>
            {/* RASTRO */}
            <div className="form-row">
              <label>
                <span className="field-icon">#️⃣</span> Rastro da Bobina
              </label>
              <input
                type="text"
                value={rastro}
                onChange={(e) => setRastro(e.target.value)}
                placeholder="Ex: BND-L1-123"
              />
              <small className="hint">
                Use o padrão atual da fábrica (ex.: BND-L1-1, BND-L2-15).
              </small>
            </div>

            {/* LINHA / TURNO / ORIGEM / DATA */}
            <div className="form-row-inline">
              <div className="form-row">
                <label>🏭 Linha</label>
                <select value={linha} onChange={(e) => setLinha(e.target.value)}>
                  <option value="L1">Linha 01</option>
                  <option value="L2">Linha 02</option>
                </select>
              </div>

              <div className="form-row">
                <label>⏱ Turno</label>
                <select value={turno} onChange={(e) => setTurno(e.target.value)}>
                  <option>1º Turno</option>
                  <option>2º Turno</option>
                  <option>3º Turno</option>
                </select>
              </div>

              <div className="form-row">
                <label>🌍 Origem</label>
                <select value={origem} onChange={(e) => setOrigem(e.target.value)}>
                  <option value="Bundy">Bundy</option>
                  <option value="Concorrente">Concorrente</option>
                </select>
              </div>

              <div className="form-row">
                <label>📅 Data</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
            </div>

            {/* OPERADOR / MATRÍCULA */}
            <div className="form-row">
              <label>👷 Operador</label>
              <input
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
                placeholder="Nome do operador"
              />
            </div>

            <div className="form-row">
              <label>🪪 Matrícula</label>
              <input
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: 4172"
              />
            </div>

            {/* DADOS TÉCNICOS */}
            <div className="form-row">
              <label>⚙️ Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="PEWQ">PEWQ</option>
                <option value="PEWS">PEWS</option>
              </select>
            </div>

            <div className="form-row-inline">
              <div className="form-row">
                <label>📏 Diâmetro</label>
                <select
                  value={diametro}
                  onChange={(e) => setDiametro(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="4.00">4.00</option>
                  <option value="4.76">4.76</option>
                  <option value="6.35">6.35</option>
                  <option value="7.94">7.94</option>
                </select>
              </div>

              <div className="form-row">
                <label>🧩 Furos</label>
                <input
                  type="number"
                  value={furos}
                  onChange={(e) => setFuros(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row-inline">
              <div className="form-row">
                <label>📐 Comprimento (m)</label>
                <input
                  value={comprimento}
                  onChange={(e) => setComprimento(e.target.value)}
                  placeholder="Ex: 6500"
                />
              </div>

              <div className="form-row">
                <label>⚖️ Peso (kg)</label>
                <input
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 1231"
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="form-row">
              <label>✅ Status inicial</label>
              <input value={status} readOnly disabled />
              <small className="hint">
                Toda bobina cadastrada entra como <b>Aguardando Laudo</b>.
              </small>
            </div>

            {/* OBSERVAÇÕES */}
            <div className="form-row">
              <label>📝 Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Bobina com leve marca na borda..."
              />
            </div>

            {/* BOTÃO */}
            <div className="form-actions">
              <button type="submit" className="btn-salvar-premium">
                💾 Salvar Bobina
              </button>
              {mensagem && <span className="msg-sucesso">{mensagem}</span>}
            </div>
          </form>
        </section>

        {/* QR CODE */}
        {mostrarQR && rastro && (
          <section className="qr-pos-cadastro">
            <h3>QR Code da Bobina</h3>
            <p>Escaneie para abrir a página de detalhes.</p>

            <div className="qr-box-cadastro">
              <QRCodeCanvas value={urlBobina} size={220} />
            </div>

            <button className="btn-imprimir-qr" onClick={imprimirQR}>
              🖨 Imprimir QR
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
