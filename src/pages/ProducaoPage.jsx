// src/pages/ProducaoPage.jsx
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
  const [quantidade, setQuantidade] = useState("");
  const [turno, setTurno] = useState("1º Turno");
  const [obs, setObs] = useState("");

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
      data: new Date().toISOString().slice(0, 10),
      turno,
      obs
    };

    const atualizadas = bobinas.map((b) =>
      b.rastro === bobinaSelecionada.rastro
        ? { ...b, pecas: [...(b.pecas || []), novaPeca] }
        : b
    );

    saveLocal(atualizadas);
    setBobinas(atualizadas);

    setBobinaSelecionada(
      atualizadas.find((b) => b.rastro === bobinaSelecionada.rastro)
    );

    // limpa form
    setModelo("");
    setCliente("");
    setQuantidade("");
    setObs("");

    alert("Peça registrada!");
  }

  function excluirPeca(i) {
    const novaLista = [...(bobinaSelecionada.pecas || [])];
    novaLista.splice(i, 1);

    const atualizadas = bobinas.map((b) =>
      b.rastro === bobinaSelecionada.rastro
        ? { ...b, pecas: novaLista }
        : b
    );

    saveLocal(atualizadas);
    setBobinas(atualizadas);

    setBobinaSelecionada(
      atualizadas.find((b) => b.rastro === bobinaSelecionada.rastro)
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="content">
        <h1>Registrar Peças da Produção</h1>

        {/* BUSCA DE BOBINA */}
        <div className="producao-box">
          <input
            type="text"
            placeholder="Digite o rastro da bobina"
            value={rastroBusca}
            onChange={(e) => setRastroBusca(e.target.value)}
          />

          <button onClick={selecionarBobina}>Buscar Bobina</button>

          {/* OU SELECT */}
          <select onChange={(e) => { setRastroBusca(e.target.value) }}>
            <option value="">Selecione uma bobina</option>
            {bobinas.map((b) => (
              <option key={b.rastro} value={b.rastro}>
                {b.rastro}
              </option>
            ))}
          </select>
        </div>

        {/* SE ACHAR A BOBINA, MOSTRA O FORM */}
        {bobinaSelecionada && (
          <>
            <h2>Bobina Selecionada: {bobinaSelecionada.rastro}</h2>

            <div className="producao-form">

              <input
                type="text"
                placeholder="Modelo da peça"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />

              <input
                type="text"
                placeholder="Cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              />

              <input
                type="number"
                placeholder="Quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />

              <select value={turno} onChange={(e) => setTurno(e.target.value)}>
                <option>1º Turno</option>
                <option>2º Turno</option>
                <option>3º Turno</option>
              </select>

              <textarea
                placeholder="Observações"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
              />

              <button className="btn-add" onClick={adicionarPeca}>
                ➕ Adicionar Peça
              </button>

            </div>

            {/* LISTA DE PEÇAS */}
            <h2>Peças Registradas</h2>

            <div className="pecas-lista">
              {(bobinaSelecionada.pecas || []).length === 0 ? (
                <p>Nenhuma peça registrada.</p>
              ) : (
                bobinaSelecionada.pecas.map((p, i) => (
                  <div className="peca-item" key={i}>
                    <div>
                      <h3>{p.nome}</h3>
                      <p><b>Cliente:</b> {p.cliente}</p>
                      <p><b>Quantidade:</b> {p.quantidade}</p>
                      <p><b>Data:</b> {p.data}</p>
                      <p><b>Turno:</b> {p.turno}</p>
                      {p.obs && <p><b>Obs:</b> {p.obs}</p>}
                    </div>

                    <button onClick={() => excluirPeca(i)}>❌</button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
