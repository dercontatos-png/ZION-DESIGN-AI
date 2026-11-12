import { get as idbGet, set as idbSet } from "idb-keyval";

export interface CanvasEmergencySnapshot {
  timestamp: number;
  reason: "update" | "beforeunload" | "periodic" | "manual";
  activeProjectId?: string;
  config?: any;
  promptSujeito?: string;
  promptCenario?: string;
  additionalPrompt?: string;
  sujeitoBase64?: string;
  cenarioBase64?: string;
  dimensao?: string;
  resolucao?: string;
  camadasTexto?: any[];
  referenciasEstilo?: any[];
  agent?: string;
}

const STORAGE_KEY = "zion_canvas_emergency_snapshot";
const IDB_KEY = "zion_canvas_emergency_snapshot_full";

let initialBuildId: string | null = null;
let updateAvailableNotified = false;

/**
 * Salva um snapshot de emergência do canvas ativo no LocalStorage e no IndexedDB
 */
export async function saveEmergencySnapshot(snapshot: Partial<CanvasEmergencySnapshot>): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const fullSnapshot: CanvasEmergencySnapshot = {
      timestamp: Date.now(),
      reason: snapshot.reason || "periodic",
      ...snapshot
    };

    // 1. Salvar no IndexedDB (sem limite de 5MB do localStorage para imagens grandes)
    await idbSet(IDB_KEY, fullSnapshot).catch(() => {});

    // 2. Salvar versão leve no localStorage (para acesso síncrono imediato no boot)
    const lightweight = { ...fullSnapshot };
    if (lightweight.sujeitoBase64 && lightweight.sujeitoBase64.length > 500 && lightweight.sujeitoBase64.startsWith("data:")) {
      lightweight.sujeitoBase64 = ""; // Mantém a imagem pesada salva com segurança no IndexedDB
    }
    if (lightweight.cenarioBase64 && lightweight.cenarioBase64.length > 500 && lightweight.cenarioBase64.startsWith("data:")) {
      lightweight.cenarioBase64 = "";
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    return true;
  } catch (err) {
    console.warn("[projectSafetyService] Falha ao salvar snapshot de emergência:", err);
    return false;
  }
}

/**
 * Recupera o último snapshot de emergência salvo
 */
export async function getEmergencySnapshot(): Promise<CanvasEmergencySnapshot | null> {
  if (typeof window === "undefined") return null;
  try {
    // 1. Tentar ler do IndexedDB (que possui as imagens completas)
    const fromIdb = await idbGet<CanvasEmergencySnapshot>(IDB_KEY).catch(() => null);
    if (fromIdb && fromIdb.timestamp) {
      // Ignora se tiver mais de 7 dias
      if (Date.now() - fromIdb.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return fromIdb;
      }
    }

    // 2. Fallback para localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[projectSafetyService] Erro ao recuperar snapshot:", err);
  }
  return null;
}

/**
 * Limpa o snapshot após ter sido consumido ou descartado
 */
export async function clearEmergencySnapshot(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    await idbSet(IDB_KEY, null).catch(() => {});
  } catch (_) {}
}

/**
 * Inicia o sentinela de proteção nativo:
 * 1. Intercepta 'beforeunload' se houver geração em andamento ou trabalho ativo.
 * 2. Salva o snapshot antes de descarregar a página.
 */
export function setupProjectSafetyGuard(opts: {
  isBusyCheck: () => boolean;
  getSnapshotData: () => Partial<CanvasEmergencySnapshot>;
}): () => void {
  if (typeof window === "undefined") return () => {};

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    try {
      const data = opts.getSnapshotData();
      saveEmergencySnapshot({ ...data, reason: "beforeunload" });
    } catch (_) {}

    if (opts.isBusyCheck()) {
      e.preventDefault();
      e.returnValue = "Há uma criação em andamento ou alterações não salvas. Tem certeza que deseja sair?";
      return e.returnValue;
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      try {
        const data = opts.getSnapshotData();
        saveEmergencySnapshot({ ...data, reason: "periodic" });
      } catch (_) {}
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

/**
 * Sentinela de Atualizações da Plataforma (Zero-Loss Update Sentinel)
 * Monitora se o servidor foi atualizado com novo build/código.
 */
export function startUpdateSentinel(onUpdateFound: (details: { buildId: string }) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const checkVersion = async () => {
    try {
      const res = await fetch("/api/system/version", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.buildId) return;

      if (!initialBuildId) {
        initialBuildId = String(data.buildId);
        return;
      }

      if (String(data.buildId) !== initialBuildId && !updateAvailableNotified) {
        updateAvailableNotified = true;
        onUpdateFound({ buildId: String(data.buildId) });
        window.dispatchEvent(new CustomEvent("zion:update_available", { detail: { buildId: data.buildId } }));
      }
    } catch (_) {}
  };

  // Primeira checagem no carregamento
  checkVersion();

  // Checagem periódica a cada 45 segundos
  const interval = setInterval(checkVersion, 45000);

  // Checa também quando a aba ganha foco novamente
  const handleFocus = () => {
    if (document.visibilityState === "visible") {
      checkVersion();
    }
  };
  document.addEventListener("visibilitychange", handleFocus);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleFocus);
  };
}

/**
 * Aplica a atualização de forma 100% segura:
 * Salva o snapshot atual e só então recarrega a janela.
 */
export async function executeSafeReload(getSnapshotData?: () => Partial<CanvasEmergencySnapshot>): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (getSnapshotData) {
      const data = getSnapshotData();
      await saveEmergencySnapshot({ ...data, reason: "update" });
    }
  } catch (_) {}
  window.location.reload();
}

