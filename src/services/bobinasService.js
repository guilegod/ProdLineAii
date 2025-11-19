// src/services/bobinasService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const LS_KEY = "bobinas";

// ========================================================
// 🔵 LOCALSTORAGE
// ========================================================
export function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocal(lista) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(lista));
  } catch (err) {
    console.warn("Erro ao salvar localStorage:", err);
  }
}

// ========================================================
// 🔵 API → LISTAR TODAS
// ========================================================
export async function fetchBobinas() {
  try {
    const res = await fetch(`${API_URL}/bobinas`);
    if (!res.ok) throw new Error("Erro ao buscar bobinas");

    const data = await res.json();
    saveLocal(data);
    return data;

  } catch (err) {
    console.warn("⚠ API offline → usando localStorage");
    return loadLocal();
  }
}

// ========================================================
// 🔵 API → DETALHES
// ========================================================
export async function fetchBobinaDetalhe(rastro) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}`);
    if (!res.ok) throw new Error("Bobina não encontrada na API");

    const data = await res.json();
    saveLocal([...loadLocal().filter((b) => b.rastro !== rastro), data]);

    return data;

  } catch (err) {
    console.warn("⚠ API offline → fallback local:", err);
    return loadLocal().find((b) => b.rastro === rastro) || null;
  }
}

// ========================================================
// 🔵 API → CRIAR
// ========================================================
export async function createBobina(bobina) {
  try {
    const res = await fetch(`${API_URL}/bobinas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bobina),
    });

    if (!res.ok) throw new Error("Erro ao salvar no backend");

    const saved = await res.json();

    saveLocal([...loadLocal().filter((b) => b.rastro !== saved.rastro), saved]);
    return saved;

  } catch (err) {
    console.warn("⚠ API offline → salvando local:", err);

    saveLocal([
      ...loadLocal().filter((b) => b.rastro !== bobina.rastro),
      bobina,
    ]);

    return bobina;
  }
}

// ========================================================
// 🔵 API → ATUALIZAR COMPLETO
// ========================================================
export async function updateBobina(rastro, dados) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error("Erro ao atualizar no backend");

    const atualizado = await res.json();
    saveLocal([...loadLocal().filter((b) => b.rastro !== rastro), atualizado]);

    return atualizado;

  } catch (err) {
    console.warn("⚠ API offline → update local:", err);

    const actual = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, ...dados } : b
    );

    saveLocal(actual);
    return { ...dados, rastro };
  }
}

// ========================================================
// 🔵 API → ATUALIZAR STATUS
// ========================================================
export async function updateStatus(rastro, status) {
  try {
    const res = await fetch(
      `${API_URL}/bobinas/${encodeURIComponent(rastro)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) throw new Error("Erro no PATCH");

    const atualizado = await res.json();

    saveLocal(
      loadLocal().map((b) =>
        b.rastro === rastro ? { ...b, status: atualizado.status } : b
      )
    );

    return atualizado;

  } catch {
    console.warn("⚠ updateStatus offline → local");

    const todas = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, status } : b
    );

    saveLocal(todas);
    return { rastro, status };
  }
}

// ========================================================
// 🔵 API → FOTOS
// ========================================================
export async function addFoto(rastro, base64) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${rastro}/fotos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64 }),
    });

    if (!res.ok) throw new Error();

    return await res.json();

  } catch (err) {
    console.warn("⚠ addFoto offline → local");

    const todas = loadLocal();
    const alvo = todas.find((b) => b.rastro === rastro);
    if (!alvo) return;

    alvo.fotos = [...(alvo.fotos || []), base64];
    saveLocal(todas);

    return { ok: true, base64 };
  }
}

export async function deleteFoto(rastro, index) {
  try {
    await fetch(`${API_URL}/bobinas/${rastro}/fotos/${index}`, {
      method: "DELETE",
    });
  } catch {
    console.warn("⚠ deleteFoto offline → local");

    const todas = loadLocal();
    const alvo = todas.find((b) => b.rastro === rastro);
    if (!alvo) return;

    alvo.fotos = alvo.fotos.filter((_, i) => i !== index);
    saveLocal(todas);
  }
}

// ========================================================
// 🔵 API → ARQUIVOS
// ========================================================
export async function addArquivo(rastro, arquivo) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${rastro}/arquivos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arquivo),
    });

    if (!res.ok) throw new Error();

    return await res.json();

  } catch {
    console.warn("⚠ addArquivo offline → local");

    const todas = loadLocal();
    const alvo = todas.find((b) => b.rastro === rastro);
    if (!alvo) return;

    alvo.arquivos = [...(alvo.arquivos || []), arquivo];
    saveLocal(todas);

    return { ok: true, arquivo };
  }
}

export async function deleteArquivo(rastro, index) {
  try {
    await fetch(`${API_URL}/bobinas/${rastro}/arquivos/${index}`, {
      method: "DELETE",
    });
  } catch {
    console.warn("⚠ deleteArquivo offline → local");

    const todas = loadLocal();
    const alvo = todas.find((b) => b.rastro === rastro);
    if (!alvo) return;

    alvo.arquivos = alvo.arquivos.filter((_, i) => i !== index);
    saveLocal(todas);
  }
}

// ========================================================
// 🔵 API → PRODUÇÃO
// ========================================================
export async function addPeca(rastro, peca) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${rastro}/producao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(peca),
    });

    if (!res.ok) throw new Error();

    return await res.json();

  } catch {
    console.warn("⚠ addPeca offline → local");

    const todas = loadLocal();
    const alvo = todas.find((b) => b.rastro === rastro);

    alvo.producao = [...(alvo.producao || []), peca];
    saveLocal(todas);

    return peca;
  }
}

export async function deletePeca(rastro, index) {
  try {
    await fetch(`${API_URL}/bobinas/${rastro}/producao/${index}`, {
      method: "DELETE",
    });
  } catch {
    console.warn("⚠ deletePeca offline → local");

    const todas = loadLocal();
    const alvo = todas.find((b) => b.rastro === rastro);

    alvo.producao = alvo.producao.filter((_, i) => i !== index);
    saveLocal(todas);
  }
}

// ========================================================
// 🔴 API → DELETE DE BOBINA (NOVO)
// ========================================================
export async function deleteBobina(rastro) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Erro ao excluir bobina");

    saveLocal(loadLocal().filter((b) => b.rastro !== rastro));
    return true;

  } catch (err) {
    console.warn("⚠ deleteBobina offline → local:", err);

    saveLocal(loadLocal().filter((b) => b.rastro !== rastro));
    return true;
  }
}
