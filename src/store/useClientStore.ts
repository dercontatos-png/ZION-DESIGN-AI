import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { safeStorageSetItem } from "../utils/imageStorageManager";

export interface ContentSlide {
  id: string;
  numero: number;
  tipo: "capa" | "conteudo" | "cta";
  titulo: string;
  conteudo: string;
  sugestaoVisual: string;
  promptOrion: string;
  imagemGerada?: string;
}

export interface ContentItem {
  id: string;
  tipo: "carrossel" | "card_unico";
  titulo: string;
  temaCentral: string;
  gancho: string;
  slides: ContentSlide[];
  legenda: string;
  hashtags: string[];
  criadoEm: string;
  status: "rascunho" | "enviado_orion" | "concluido";
}

export interface ClientProfile {
  id: string;
  name: string;
  niche: string;
  logoBase64?: string;
  paletaCores: string[];
  corDominante?: string;
  infoExtra: string;
  bancoDeDadosIA: string; // Histórico de aprendizado da IA
  printsPerfil?: string[]; // Prints do perfil do Instagram para análise estética
  estiloVisualExtraido?: string; // Estilo detectado pela IA
  regrasMarca?: string; // Diretrizes, dores, público-alvo e regras
  historicoConteudos?: ContentItem[]; // Memória anti-repetição permanente
}

interface ClientStoreState {
  clients: ClientProfile[];
  activeClientId: string | null;
  activeContentId: string | null;
  activeSlideIndex: number;
  isSyncing: boolean;
  lastSavedAt: number | null;

  // Actions
  addClient: (client: Omit<ClientProfile, "id">) => string;
  updateClient: (id: string, updates: Partial<ClientProfile>) => void;
  removeClient: (id: string) => void;
  setActiveClient: (id: string | null) => void;
  setActiveContentId: (id: string | null) => void;
  setActiveSlideIndex: (idx: number) => void;
  appendAiLearnings: (id: string, text: string) => void;
  addContentItem: (clientId: string, item: Omit<ContentItem, "id" | "criadoEm">) => string;
  updateContentItem: (clientId: string, contentId: string, updates: Partial<ContentItem>) => void;
  updateSlideImage: (clientId: string, contentId: string, slideNumber: number, imageBase64: string) => void;
  removeContentItem: (clientId: string, contentId: string) => void;
  initClients: () => Promise<void>;
  saveToServer: () => Promise<boolean>;
}

// Debounce helper para salvar no disco do servidor sem sobrecarregar chamadas rápidas
let serverSyncTimeout: any = null;
const debouncedSyncToServer = (clients: ClientProfile[]) => {
  if (serverSyncTimeout) clearTimeout(serverSyncTimeout);
  serverSyncTimeout = setTimeout(async () => {
    try {
      await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients })
      });
    } catch (e) {
      console.warn("[ClientStore] Falha ao sincronizar clientes com servidor:", e);
    }
  }, 350);
};

const persistAllLayers = (clients: ClientProfile[]) => {
  // 1. IndexedDB: capacidade ilimitada para suportar imagens, prints e logotipos em alta qualidade
  idbSet("zion_clients_v2", clients).catch((err) =>
    console.error("[ClientStore] Erro ao salvar no IndexedDB:", err)
  );

  // 2. Servidor local em disco: local_storage/clientes_db.json
  debouncedSyncToServer(clients);
};

export const useClientStore = create<ClientStoreState>()(
  persist(
    (set, get) => ({
      clients: [],
      activeClientId: null,
      activeContentId: null,
      activeSlideIndex: 0,
      isSyncing: false,
      lastSavedAt: null,

      addClient: (client) => {
        const newId = Date.now().toString();
        const newClient: ClientProfile = {
          ...client,
          id: newId,
          historicoConteudos: client.historicoConteudos || [],
          printsPerfil: client.printsPerfil || [],
        };
        const updated = [...get().clients, newClient];
        set({
          clients: updated,
          activeClientId: newId,
          lastSavedAt: Date.now(),
        });
        try {
          localStorage.setItem("zion_active_client_id", newId);
        } catch {}
        persistAllLayers(updated);
        return newId;
      },

      updateClient: (id, updates) => {
        const updated = get().clients.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        );
        set({ clients: updated, lastSavedAt: Date.now() });
        persistAllLayers(updated);
      },

      removeClient: (id) => {
        const updated = get().clients.filter((c) => c.id !== id);
        const currentActive = get().activeClientId;
        const nextActive = currentActive === id ? (updated[0]?.id || null) : currentActive;
        set({
          clients: updated,
          activeClientId: nextActive,
          activeContentId: currentActive === id ? null : get().activeContentId,
          lastSavedAt: Date.now(),
        });
        try {
          if (nextActive) {
            localStorage.setItem("zion_active_client_id", nextActive);
          } else {
            localStorage.removeItem("zion_active_client_id");
          }
        } catch {}
        persistAllLayers(updated);
      },

      setActiveClient: (id) => {
        set({ activeClientId: id });
        try {
          if (id) {
            localStorage.setItem("zion_active_client_id", id);
          }
        } catch {}
      },

      setActiveContentId: (id) => set({ activeContentId: id }),
      setActiveSlideIndex: (idx) => set({ activeSlideIndex: idx }),

      appendAiLearnings: (id, text) => {
        const updated = get().clients.map((c) =>
          c.id === id
            ? {
                ...c,
                bancoDeDadosIA: c.bancoDeDadosIA
                  ? `${c.bancoDeDadosIA}\n\n[Nova Interação]: ${text}`
                  : `[Nova Interação]: ${text}`,
              }
            : c
        );
        set({ clients: updated, lastSavedAt: Date.now() });
        persistAllLayers(updated);
      },

      addContentItem: (clientId, item) => {
        const newContentId = `content_${Date.now()}`;
        const newContent: ContentItem = {
          ...item,
          id: newContentId,
          criadoEm: new Date().toISOString(),
        };
        const updated = get().clients.map((c) => {
          if (c.id !== clientId) return c;
          const existing = c.historicoConteudos || [];
          return {
            ...c,
            historicoConteudos: [newContent, ...existing],
          };
        });
        set({
          clients: updated,
          activeContentId: newContentId,
          lastSavedAt: Date.now(),
        });
        persistAllLayers(updated);
        return newContentId;
      },

      updateContentItem: (clientId, contentId, updates) => {
        const updated = get().clients.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            historicoConteudos: (c.historicoConteudos || []).map((item) =>
              item.id === contentId ? { ...item, ...updates } : item
            ),
          };
        });
        set({ clients: updated, lastSavedAt: Date.now() });
        persistAllLayers(updated);
      },

      updateSlideImage: (clientId, contentId, slideNumber, imageBase64) => {
        const updated = get().clients.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            historicoConteudos: (c.historicoConteudos || []).map((item) => {
              if (item.id !== contentId) return item;
              const updatedSlides = item.slides.map((s) =>
                s.numero === slideNumber ? { ...s, imagemGerada: imageBase64 } : s
              );
              const allDone = updatedSlides.every((s) => !!s.imagemGerada);
              return {
                ...item,
                slides: updatedSlides,
                status: (allDone ? "concluido" : "enviado_orion") as "concluido" | "enviado_orion",
              };
            }),
          };
        });
        set({ clients: updated, lastSavedAt: Date.now() });
        persistAllLayers(updated);
      },

      removeContentItem: (clientId, contentId) => {
        const updated = get().clients.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            historicoConteudos: (c.historicoConteudos || []).filter(
              (item) => item.id !== contentId
            ),
          };
        });
        set({
          clients: updated,
          activeContentId:
            get().activeContentId === contentId ? null : get().activeContentId,
          lastSavedAt: Date.now(),
        });
        persistAllLayers(updated);
      },

      saveToServer: async () => {
        try {
          set({ isSyncing: true });
          const clients = get().clients;
          await idbSet("zion_clients_v2", clients);
          const res = await fetch("/api/clientes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clients }),
          });
          set({ isSyncing: false, lastSavedAt: Date.now() });
          return res.ok;
        } catch (e) {
          console.warn("[ClientStore] Erro ao forçar salvamento:", e);
          set({ isSyncing: false });
          return false;
        }
      },

      initClients: async () => {
        set({ isSyncing: true });
        let resolvedClients: ClientProfile[] = [];

        // 1. Tentar carregar do Servidor local (disco rígido)
        try {
          const res = await fetch("/api/clientes");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.clients) && data.clients.length > 0) {
              resolvedClients = data.clients;
            }
          }
        } catch (e) {
          console.warn("[ClientStore] Servidor indisponível no momento:", e);
        }

        // 2. Se o servidor não tiver, tentar IndexedDB
        if (resolvedClients.length === 0) {
          try {
            const fromIdb = await idbGet("zion_clients_v2");
            if (Array.isArray(fromIdb) && fromIdb.length > 0) {
              resolvedClients = fromIdb;
              // Salva no servidor para manter em sincronia
              debouncedSyncToServer(resolvedClients);
            }
          } catch (e) {
            console.warn("[ClientStore] IndexedDB indisponível:", e);
          }
        }

        // 3. Se ainda vazio, tentar LocalStorage legado
        if (resolvedClients.length === 0) {
          try {
            const raw = localStorage.getItem("zion-client-storage");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed?.state?.clients) && parsed.state.clients.length > 0) {
                resolvedClients = parsed.state.clients;
                persistAllLayers(resolvedClients);
              }
            }
          } catch {}
        }

        // Determinar activeClientId preservando seleção anterior
        let savedActiveId: string | null = null;
        try {
          savedActiveId = localStorage.getItem("zion_active_client_id");
        } catch {}

        const currentActive = get().activeClientId;
        const validActiveId =
          resolvedClients.find((c) => c.id === currentActive)?.id ||
          resolvedClients.find((c) => c.id === savedActiveId)?.id ||
          resolvedClients[0]?.id ||
          null;

        set({
          clients: resolvedClients,
          activeClientId: validActiveId,
          isSyncing: false,
          lastSavedAt: Date.now(),
        });

        if (validActiveId) {
          try {
            localStorage.setItem("zion_active_client_id", validActiveId);
          } catch {}
        }
      },
    }),
    {
      name: "zion-client-storage",
      partialize: (state) => ({
        activeClientId: state.activeClientId,
        activeContentId: state.activeContentId,
        activeSlideIndex: state.activeSlideIndex,
        clients: (state.clients || []).map((c) => ({
          ...c,
          logoBase64: c.logoBase64 && c.logoBase64.length > 500 ? "" : c.logoBase64,
          printsPerfil: [],
          historicoConteudos: (c.historicoConteudos || []).map((h) => ({
            ...h,
            slides: (h.slides || []).map((s) => ({
              ...s,
              imagemGerada: s.imagemGerada && s.imagemGerada.startsWith("data:") ? "" : s.imagemGerada,
            })),
          })),
        })),
      }),
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          try {
            return localStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            safeStorageSetItem(name, value);
          } catch (e) {
            // Em caso de QuotaExceededError, ignoramos o erro aqui pois o IndexedDB e Servidor já salvaram
          }
        },
        removeItem: (name: string) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        },
      })),
    }
  )
);

// Executa a carga imediata no browser
if (typeof window !== "undefined") {
  useClientStore.getState().initClients();
}
