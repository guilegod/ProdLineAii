import "../styles/ProducaoBobina.css";

export default function ProducaoBobina({ dados, setDados, modoEdicao }) {

  function adicionarPeca() {
    const modelo = prompt("Modelo da peça:");
    if (!modelo) return;

    const cliente = prompt("Cliente:");
    if (!cliente) return;

    const quantidade = prompt("Quantidade produzida:");
    if (!quantidade) return;

    const nova = {
      id: Date.now(),
      modelo,
      cliente,
      quantidade: Number(quantidade),
      data: new Date().toISOString().slice(0, 10),
    };

    setDados({
      ...dados,
      producao: [...dados.producao, nova],
    });
  }

  function excluirPeca(i) {
    const novoArray = dados.producao.filter((_, index) => index !== i);
    setDados({ ...dados, producao: novoArray });
  }

  return (
    <div className="details-panel">

      <h2>Produção da Bobina</h2>

      {/* Botão adicionar */}
      {modoEdicao && (
        <button
          className="btn-secundario"
          style={{ marginBottom: 10 }}
          onClick={adicionarPeca}
        >
          ➕ Adicionar Produção
        </button>
      )}

      {/* Lista */}
      {dados.producao.length === 0 ? (
        <p className="sem-arquivos">Nenhuma peça cadastrada.</p>
      ) : (
        <ul className="producao-lista">
          {dados.producao.map((p, i) => (
            <li key={p.id}>
              <div>
                <strong>{p.modelo}</strong>
                <br />
                Cliente: {p.cliente}
                <br />
                Quantidade: {p.quantidade}
                <br />
                Data: {p.data}
              </div>

              {modoEdicao && (
                <button className="btn-secundario" onClick={() => excluirPeca(i)}>
                  ❌
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
