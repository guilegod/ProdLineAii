import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { loadLocal, saveLocal } from "../services/bobinasService.js";
import "../styles/ProducaoPage.css";

export default function ProducaoPage() {
  const [bobinas, setBobinas] = useState([]);
  const [rastroBusca, setRastroBusca] = useState("");
  const [bobinaSelecionada, setBobinaSelecionada] = useState(null);

  const [modelo, setModelo] = useState("");
  const [cliente, setCliente] = useState("");
  const [matricula, setMatricula] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [turno, setTurno] = useState("1º Turno");
  const [obs, setObs] = useState("");

  const [modalIndex, setModalIndex] = useState(null);

  // Carrega localStorage
  useEffect(() => {
    setBobinas(loadLocal());
  }, []);

  function selecionarBobina() {
    const encontrada = bobinas.find((b) => b.rastro === rastroBusca);
    setBobinaSelecionada(encontrada || null);
  }

  function adicionarPeca() {
    if (!modelo || !quantidade) {
      alert("Preencha modelo e quantidade!");
      return;
    }

    const novaPeca = {
      nome: modelo,
      cliente,
      quantidade: Number(quantidade),
      matricula,
      data: new Date().toISOString().slice(0, 10),
      turno,
      obs,
      evidencias: []
    };

    const atualizadas = bobinas.map((b) =>
      b.rastro === bobinaSelecionada.rastro
        ? { ...b, pecas: [...(b.pecas || []), novaPeca] }
        : b
    );

    saveLocal(atualizadas);
    setBobinas(atualizadas);

    setBobinaSelecionada(atualizadas.find((b) => b.rastro === bobinaSelecionada.rastro));

    setModelo("");
    setCliente("");
    setQuantidade("");
    setMatricula("");
    setObs("");

    alert("Peça registrada!");
  }

  function excluirPeca(index) {
    const novaLista = [...(bobinaSelecionada.pecas || [])];
    novaLista.splice(index, 1);

    const atualizadas = bobinas.map((b) =>
      b.rastro === bobinaSelecionada.rastro
        ? { ...b, pecas: novaLista }
        : b
    );

    saveLocal(atualizadas);
    setBobinas(atualizadas);

    setBobinaSelecionada(atualizadas.find((b) => b.rastro === bobinaSelecionada.rastro));
  }

  // Abre modal
  function abrirModalEvidencias(i) {
    setModalIndex(i);
  }

  // Fecha modal
  function fecharModalEvidencias() {
    setModalIndex(null);
  }

  // Adicionar imagem
  function adicionarEvidencia(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const copia = [...bobinaSelecionada.pecas];
      const fotos = copia[modalIndex].evidencias || [];

      copia[modalIndex].evidencias = [...fotos, ev.target.result];

      const atualizadas = bobinas.map((b) =>
        b.rastro === bobinaSelecionada.rastro ? { ...b, pecas: copia } : b
      );

      saveLocal(atualizadas);
      setBobinas(atualizadas);

      setBobinaSelecionada(atualizadas.find((b) => b.rastro === bobinaSelecionada.rastro));
    };

    reader.readAsDataURL(file);
  }

  // ✅ EXCLUIR IMAGEM — AGORA FUNCIONANDO
  function removerEvidencia(idxFoto) {
    const copia = [...bobinaSelecionada.pecas];
    const fotos = copia[modalIndex].evidencias || [];

    fotos.splice(idxFoto, 1);
    copia[modalIndex].evidencias = fotos;

    const atualizadas = bobinas.map((b) =>
      b.rastro === bobinaSelecionada.rastro ? { ...b, pecas: copia } : b
    );

    saveLocal(atualizadas);
    setBobinas(atualizadas);

    setBobinaSelecionada(atualizadas.find((b) => b.rastro === bobinaSelecionada.rastro));
  }

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">
        <h1>Registrar Peças da Produção</h1>

        {/* BUSCA */}
        <div className="producao-box">
          <input
            type="text"
            placeholder="Digite o rastro da bobina"
            value={rastroBusca}
            onChange={(e) => setRastroBusca(e.target.value)}
          />

          <button onClick={selecionarBobina}>Buscar Bobina</button>

          <select onChange={(e) => setRastroBusca(e.target.value)}>
            <option value="">Selecione uma bobina</option>
            {bobinas.map((b) => (
              <option key={b.rastro} value={b.rastro}>
                {b.rastro}
              </option>
            ))}
          </select>
        </div>

        {/* SELECIONADA */}
        {bobinaSelecionada && (
          <>
            <h2 className="titulo-bobina">
              Bobina Selecionada: <span>{bobinaSelecionada.rastro}</span>
            </h2>

            {/* FORM */}
            <div className="producao-form">
              <input type="text" placeholder="Modelo da peça" value={modelo} onChange={(e) => setModelo(e.target.value)} />
              <input type="text" placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
              <input type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
              <input type="text" placeholder="Matrícula do operador" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
              <select value={turno} onChange={(e) => setTurno(e.target.value)}>
                <option>1º Turno</option>
                <option>2º Turno</option>
                <option>3º Turno</option>
              </select>
              <textarea placeholder="Observações" value={obs} onChange={(e) => setObs(e.target.value)} />
              <button className="btn-add" onClick={adicionarPeca}>➕ Adicionar Peça</button>
            </div>

            {/* LISTA */}
            <h2 className="titulo-sec">Peças Registradas</h2>

            <div className="pecas-grid">
              {(bobinaSelecionada.pecas || []).map((p, i) => (
                <div className="peca-card" key={i}>

                  <div className="peca-header">
                    <h3>{p.nome}</h3>
                    <button onClick={() => excluirPeca(i)} className="btn-del">❌</button>
                  </div>

                  <p><b>Cliente:</b> {p.cliente}</p>
                  <p><b>Quantidade:</b> {p.quantidade}</p>
                  <p><b>Matrícula:</b> {p.matricula}</p>
                  <p><b>Data:</b> {p.data}</p>
                  <p><b>Turno:</b> {p.turno}</p>
                  {p.obs && <p><b>Obs:</b> {p.obs}</p>}

                  <button className="btn-evidencias" onClick={() => abrirModalEvidencias(i)}>
                    📸 Evidências
                  </button>

                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* MODAL */}
      {modalIndex !== null && (
        <div className="modal-evidencia-backdrop" onClick={fecharModalEvidencias}>
          <div className="modal-evidencia" onClick={(e) => e.stopPropagation()}>
            <h2>Evidências da Peça</h2>

            {/* FOTOS */}
            <div className="evidencias-grid">
              {(bobinaSelecionada.pecas[modalIndex].evidencias || []).map((img, idx) => (
                <div key={idx} className="evidencia-wrapper">
                  <img src={img} className="evidencia-thumb" />
                  <button className="btn-excluir-foto" onClick={() => removerEvidencia(idx)}>❌</button>
                </div>
              ))}
            </div>

            <input type="file" accept="image/*" capture="environment" onChange={adicionarEvidencia} />

            <button className="btn-close" onClick={fecharModalEvidencias}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
