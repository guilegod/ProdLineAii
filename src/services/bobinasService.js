// src/services/bobinasService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// chave do localStorage
const LS_KEY = "bobinas";

// =============== LOCALSTORAGE (BACKUP) ===============
export function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocal(lista) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(lista));
  } catch (e) {
    console.warn("Erro ao salvar localStorage", e);
  }
}

// =============== API PRINCIPAL ===============
export async function fetchBobinas() {
  try {
    const res = await fetch(`${API_URL}/bobinas`);
    if (!res.ok) throw new Error("Erro ao buscar bobinas");

    const data = await res.json();

    saveLocal(data); // sincroniza backup
    return data;
  } catch (e) {
    console.warn("⚠ API offline, usando localStorage");
    return loadLocal();
  }
}

// resumo (para estoque)
export async function fetchResumo() {
  try {
    const res = await fetch(`${API_URL}/bobinas/resumo`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    console.warn("Resumo não disponível na API");
    return null;
  }
}

// detalhes da bobina
export async function fetchBobinaDetalhe(rastro) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}`);
    if (!res.ok) throw new Error("Não encontrada");
    return await res.json();
  } catch (e) {
    console.warn("⚠ API offline, usando backup local", e);
    const todas = loadLocal();
    return todas.find((b) => b.rastro === rastro) || null;
  }
}

// criar bobina
export async function createBobina(bobina) {
  try {
    const res = await fetch(`${API_URL}/bobinas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bobina),
    });

    if (!res.ok) throw new Error("Erro ao salvar na API");

    const saved = await res.json();

    // sincroniza local
    const atuais = loadLocal().filter((b) => b.rastro !== saved.rastro);
    saveLocal([...atuais, saved]);

    return saved;
  } catch (e) {
    console.warn("⚠ API offline → salvando apenas local", e);

    const atuais = loadLocal().filter((b) => b.rastro !== bobina.rastro);
    saveLocal([...atuais, bobina]);

    return bobina;
  }
}

// atualizar bobina inteira
export async function updateBobina(rastro, dados) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error("Erro ao atualizar na API");

    const atualizado = await res.json();

    const atuais = loadLocal().filter((b) => b.rastro !== rastro);
    saveLocal([...atuais, atualizado]);

    return atualizado;
  } catch (e) {
    console.warn("⚠ API offline → update local apenas");

    const atuais = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, ...dados } : b
    );

    saveLocal(atuais);
    return { ...dados, rastro };
  }
}

// atualizar apenas status
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

    if (!res.ok) throw new Error();

    const atualizado = await res.json();

    const atuais = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, status: atualizado.status } : b
    );

    saveLocal(atuais);
    return atualizado;
  } catch {
    console.warn("⚠ PATCH status offline → local");
    const atuais = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, status } : b
    );
    saveLocal(atuais);

    return { rastro, status };
  }
}

// =============== FOTOS ===============
export async function addFoto(rastro, base64) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${rastro}/fotos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64 }),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    console.warn("⚠ addFoto offline → local");

    const todas = loadLocal();
    const atual = todas.find((b) => b.rastro === rastro);
    if (!atual) return null;

    atual.fotos = [...(atual.fotos || []), base64];
    saveLocal(todas);

    return { ok: true };
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
    const atual = todas.find((b) => b.rastro === rastro);

    if (!atual) return;

    atual.fotos = atual.fotos.filter((_, i) => i !== index);
    saveLocal(todas);
  }
}

// =============== ARQUIVOS ===============
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
    const atual = todas.find((b) => b.rastro === rastro);
    if (!atual) return;

    atual.arquivos = [...(atual.arquivos || []), arquivo];
    saveLocal(todas);

    return { ok: true };
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
    const atual = todas.find((b) => b.rastro === rastro);

    if (!atual) return;

    atual.arquivos = atual.arquivos.filter((_, i) => i !== index);
    saveLocal(todas);
  }
}

// =============== PRODUÇÃO ===============
export async function addPeca(rastro, peca) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${rastro}/producao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(peca),
    });
    return await res.json();
  } catch {
    console.warn("⚠ addPeca offline → local");

    const todas = loadLocal();
    const atual = todas.find((b) => b.rastro === rastro);

    atual.producao = [...(atual.producao || []), peca];
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
    const atual = todas.find((b) => b.rastro === rastro);

    atual.producao = atual.producao.filter((_, i) => i !== index);
    saveLocal(todas);
  }
}
