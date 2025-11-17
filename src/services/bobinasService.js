// src/services/bobinasService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// chave do localStorage
const LS_KEY = "bobinas";

// -------- LOCALSTORAGE (FALLBACK / BACKUP) --------
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

// -------- API PRINCIPAL --------
export async function fetchBobinas() {
  try {
    const res = await fetch(`${API_URL}/bobinas`);
    if (!res.ok) throw new Error("Erro ao buscar bobinas");
    const data = await res.json();
    // sincroniza backup local
    saveLocal(data);
    return data;
  } catch (e) {
    console.warn("⚠ API offline, usando localStorage", e);
    return loadLocal();
  }
}

export async function fetchResumo() {
  try {
    const res = await fetch(`${API_URL}/bobinas/resumo`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchBobinaDetalhe(rastro) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}`);
    if (!res.ok) throw new Error("Não encontrada");
    return await res.json();
  } catch (e) {
    console.warn("Erro ao buscar bobina na API, tentando local", e);
    const todas = loadLocal();
    return todas.find((b) => b.rastro === rastro) || null;
  }
}

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
    console.warn("⚠ API offline, salvando só local", e);
    const atuais = loadLocal().filter((b) => b.rastro !== bobina.rastro);
    const novaLista = [...atuais, bobina];
    saveLocal(novaLista);
    return bobina;
  }
}

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
    console.warn("⚠ Falha update API, tentando só local", e);
    const atuais = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, ...dados } : b
    );
    saveLocal(atuais);
    return dados;
  }
}

// STATUS rápido (liberar/bloquear)
export async function updateStatus(rastro, status) {
  try {
    const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error();
    const atualizado = await res.json();
    const atuais = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, status: atualizado.status } : b
    );
    saveLocal(atuais);
    return atualizado;
  } catch (e) {
    console.warn("⚠ Falha PATCH status, só local", e);
    const atuais = loadLocal().map((b) =>
      b.rastro === rastro ? { ...b, status } : b
    );
    saveLocal(atuais);
    return { rastro, status };
  }
}

// FOTOS
export async function addFoto(rastro, base64) {
  const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/fotos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64 }),
  });
  return await res.json();
}

export async function deleteFoto(rastro, idFoto) {
  await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/fotos/${idFoto}`, {
    method: "DELETE"
  });
}

// ARQUIVOS
export async function addArquivo(rastro, arquivo) {
  const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/arquivos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arquivo),
  });
  return await res.json();
}

export async function deleteArquivo(rastro, idArquivo) {
  await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/arquivos/${idArquivo}`, {
    method: "DELETE"
  });
}

// PRODUÇÃO
export async function addPeca(rastro, peca) {
  const res = await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/producao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(peca),
  });
  return await res.json();
}

export async function deletePeca(rastro, idPeca) {
  await fetch(`${API_URL}/bobinas/${encodeURIComponent(rastro)}/producao/${idPeca}`, {
    method: "DELETE"
  });
}
