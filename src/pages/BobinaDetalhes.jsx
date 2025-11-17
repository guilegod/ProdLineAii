// src/pages/BobinaDetalhes.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { QRCodeCanvas } from "qrcode.react";
import { loadLocal, saveLocal } from "../services/bobinasService.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ProducaoBobina from "../components/ProducaoBobina.jsx";


import "../styles/BobinaDetalhes.css";

export default function BobinaDetalhesPage() {
  const { rastro } = useParams();

  const [bobina, setBobina] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [modalFoto, setModalFoto] = useState(null);
  const [modalQR, setModalQR] = useState(false);

  const [dados, setDados] = useState({});

  // CARREGA A BOBINA
  useEffect(() => {
    const todas = loadLocal();
    const encontrada = todas.find((b) => b.rastro === rastro);

    if (encontrada) {
      encontrada.fotos = encontrada.fotos || [];
      encontrada.arquivos = encontrada.arquivos || [];
      setBobina(encontrada);
      setDados(encontrada);
    }
  }, [rastro]);

  if (!bobina) {
    return (
      <div className="detalhes-layout">
        <Sidebar />
        <main className="detalhes-content">
          <h1>Bobina não encontrada</h1>
          <p>Rastro: {rastro}</p>
        </main>
      </div>
    );
  }

  // SENHA
  function habilitarEdicao() {
    if (senhaDigitada === "bundy123") {
      setModoEdicao(true);
      setMensagem("Modo de edição ativado!");
    } else {
      setMensagem("Senha incorreta!");
    }
  }

  // SALVAR ALTERAÇÕES
  function salvarAlteracoes() {
    const todas = loadLocal();
    const outras = todas.filter((b) => b.rastro !== bobina.rastro);

    const alterado = { ...bobina, ...dados };

    saveLocal([...outras, alterado]);
    setBobina(alterado);
    setMensagem("Alterações salvas!");
    setModoEdicao(false);
  }

  // FOTO → base64
  function adicionarFoto(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (ev) => {
      setDados({
        ...dados,
        fotos: [...dados.fotos, ev.target.result],
      });
    };
    leitor.readAsDataURL(arquivo);
  }

  function excluirFoto(i) {
    setDados({
      ...dados,
      fotos: dados.fotos.filter((_, x) => x !== i),
    });
  }

  // ARQUIVOS → base64
  function adicionarArquivo(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (ev) => {
      const novo = {
        nome: arquivo.name,
        tipo: arquivo.type,
        base64: ev.target.result,
      };

      setDados({
        ...dados,
        arquivos: [...dados.arquivos, novo],
      });
    };
    leitor.readAsDataURL(arquivo);
  }

  function excluirArquivo(i) {
    setDados({
      ...dados,
      arquivos: dados.arquivos.filter((_, x) => x !== i),
    });
  }

  function atualizarCampo(campo, valor) {
    setDados({ ...dados, [campo]: valor });
  }

  const urlQR = `${window.location.origin}/bobina/${rastro}`;

  function imprimirDetalhes() {
    window.print();
  }
  async function gerarPDF() {
  const pdf = new jsPDF("p", "mm", "a4");

  const container = document.querySelector(".detalhes-content");

  // tira screenshot da área da página
  const canvas = await html2canvas(container, {
    scale: 2,
    backgroundColor: "#FFFFFF"
  });

  const imgData = canvas.toDataURL("image/png");

  const imgWidth = 210; // largura A4
  const pageHeight = 297; 
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // primeira página
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // se tiver mais de 1 página
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`Bobina_${rastro}.pdf`);
}


  // ============================================================
  // ===================== RENDERIZAÇÃO =========================
  // ============================================================

  return (
    <div className="detalhes-layout">
      <Sidebar />

      <main className="detalhes-content">

        {/* CABEÇALHO */}
        <div className="details-title-panel">
          <div>
            <h1>Detalhes da Bobina</h1>
            <p><strong>Rastro:</strong> {rastro}</p>
          </div>

          <div className="details-actions">
            <button className="btn-secundario" onClick={gerarPDF}>📄 Gerar PDF</button>
            <button className="btn-secundario" onClick={() => setModalQR(true)}>📸 Modal QR</button>
            <button className="btn-secundario" onClick={imprimirDetalhes}>🖨 Imprimir</button>
          </div>
        </div>

        {/* SENHA */}
        {!modoEdicao && (
          <div className="senha-panel">
            <span>Insira a senha para editar:</span>
            <input
              type="password"
              value={senhaDigitada}
              onChange={(e) => setSenhaDigitada(e.target.value)}
            />
            <button onClick={habilitarEdicao}>🔒 Editar</button>
          </div>
        )}

        {mensagem && <p className="mensagem">{mensagem}</p>}

        {/* GRID PRINCIPAL */}
        <div className="detalhes-duas-colunas">

          {/* COLUNA ESQUERDA */}
          <div className="coluna-esquerda">

            {/* INFORMAÇÕES GERAIS */}
            <div className="details-panel">
              <h2>Informações Gerais</h2>
              <div className="details-grid">

                <div data-print={dados.operador}>
                  <label>Operador</label>
                  <input disabled={!modoEdicao}
                    value={dados.operador}
                    onChange={(e) => atualizarCampo("operador", e.target.value)} />
                </div>

                <div data-print={dados.matricula}>
                  <label>Matrícula</label>
                  <input disabled={!modoEdicao}
                    value={dados.matricula}
                    onChange={(e) => atualizarCampo("matricula", e.target.value)} />
                </div>

                <div data-print={dados.linha}>
                  <label>Linha</label>
                  <select disabled={!modoEdicao}
                    value={dados.linha}
                    onChange={(e) => atualizarCampo("linha", e.target.value)}>
                    <option value="L1">Linha 01</option>
                    <option value="L2">Linha 02</option>
                  </select>
                </div>

                <div data-print={dados.turno}>
                  <label>Turno</label>
                  <select disabled={!modoEdicao}
                    value={dados.turno}
                    onChange={(e) => atualizarCampo("turno", e.target.value)}>
                    <option>1º Turno</option>
                    <option>2º Turno</option>
                    <option>3º Turno</option>
                  </select>
                </div>

                <div data-print={dados.origem}>
                  <label>Origem</label>
                  <select disabled={!modoEdicao}
                    value={dados.origem}
                    onChange={(e) => atualizarCampo("origem", e.target.value)}>
                    <option value="Bundy">Bundy</option>
                    <option value="Concorrente">Concorrente</option>
                  </select>
                </div>

                <div data-print={dados.data}>
                  <label>Data</label>
                  <input type="date" disabled={!modoEdicao}
                    value={dados.data}
                    onChange={(e) => atualizarCampo("data", e.target.value)} />
                </div>

              </div>
            </div>

            {/* CARACTERÍSTICAS TÉCNICAS */}
            <div className="details-panel">
              <h2>Características Técnicas</h2>

              <div className="details-grid">

                <div data-print={dados.tipo}>
                  <label>Tipo</label>
                  <input disabled={!modoEdicao}
                    value={dados.tipo}
                    onChange={(e) => atualizarCampo("tipo", e.target.value)} />
                </div>

                <div data-print={dados.diametro}>
                  <label>Diâmetro</label>
                  <input disabled={!modoEdicao}
                    value={dados.diametro}
                    onChange={(e) => atualizarCampo("diametro", e.target.value)} />
                </div>

                <div data-print={dados.furos}>
                  <label>Furos</label>
                  <input disabled={!modoEdicao}
                    value={dados.furos}
                    onChange={(e) => atualizarCampo("furos", e.target.value)} />
                </div>

                <div data-print={dados.comprimento}>
                  <label>Comprimento (m)</label>
                  <input disabled={!modoEdicao}
                    value={dados.comprimento}
                    onChange={(e) => atualizarCampo("comprimento", e.target.value)} />
                </div>

                <div data-print={dados.peso}>
                  <label>Peso (kg)</label>
                  <input disabled={!modoEdicao}
                    value={dados.peso}
                    onChange={(e) => atualizarCampo("peso", e.target.value)} />
                </div>

              </div>
            </div>

            {/* STATUS */}
            <div className="details-panel">
              <h2>Status</h2>

              <div className="details-grid">

                <div data-print={dados.status}>
                  <label>Status</label>
                  <select disabled={!modoEdicao}
                    value={dados.status}
                    onChange={(e) => atualizarCampo("status", e.target.value)}>
                    <option value="Liberada">Liberada</option>
                    <option value="Aguardando Laudo">Aguardando Laudo</option>
                    <option value="Bloqueada">Bloqueada</option>
                  </select>
                </div>

                <div data-print={dados.observacoes} style={{ gridColumn: "1 / -1" }}>
                  <label>Observações</label>
                  <textarea disabled={!modoEdicao}
                    rows={3}
                    value={dados.observacoes}
                    onChange={(e) => atualizarCampo("observacoes", e.target.value)} />
                </div>

              </div>
            </div>
            

            {modoEdicao && (
              <button className="save-btn" onClick={salvarAlteracoes}>
                💾 Salvar Alterações
              </button>
            )}

          </div>

          {/* COLUNA DIREITA */}
          <div className="coluna-direita">

            {/* QR CODE */}
            <div className="details-panel">
              <h2>QR Code</h2>
              <div className="qr-box">
                <QRCodeCanvas value={urlQR} size={220} />
              </div>
            </div>
            <ProducaoBobina dados={dados} setDados={setDados} modoEdicao={modoEdicao} />


            {/* ARQUIVOS */}
            <div className="details-panel">
              <h2>Arquivos</h2>

              {modoEdicao && (
                <input type="file" accept=".pdf,.xlsx,.xls" onChange={adicionarArquivo} />
              )}

              {dados.arquivos.length === 0 && (
                <p className="sem-arquivos">Nenhum arquivo anexado.</p>
              )}

              <ul className="files-list">
                {dados.arquivos.map((arq, i) => (
                  <li key={i}>
                    <span className="file-icon">📎</span>
                    <a href={arq.base64} download={arq.nome}>{arq.nome}</a>

                    {modoEdicao && (
                      <button className="btn-secundario" onClick={() => excluirArquivo(i)}>❌</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* FOTOS */}
            <div className="details-panel">
              <h2>Fotos</h2>

              {modoEdicao && (
                <input type="file" accept="image/*" onChange={adicionarFoto} />
              )}

              <div className="photos-grid">
                {dados.fotos.map((foto, i) => (
                  <div key={i} className="foto-wrapper">

                    <img
                      src={foto}
                      className="photo-thumb-rect"
                      onClick={() => setModalFoto(foto)}
                    />

                    {modoEdicao && (
                      <button className="foto-remove-btn" onClick={() => excluirFoto(i)}>
                        ❌
                      </button>
                    )}

                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* MODAL FOTO */}
        {modalFoto && (
          <div className="modal-foto-backdrop" onClick={() => setModalFoto(null)}>
            <img src={modalFoto} className="modal-foto-img" />
          </div>
        )}

        {/* MODAL QR */}
        {modalQR && (
          <div className="modal-qr-backdrop" onClick={() => setModalQR(false)}>
            <div className="modal-qr-content">
              <QRCodeCanvas value={urlQR} size={350} />
              <p className="modal-qr-rastro">{rastro}</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
