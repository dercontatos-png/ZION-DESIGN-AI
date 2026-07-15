import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ClientProfile {
  id: string;
  name: string;
  niche: string;
  logoBase64?: string;
  paletaCores: string[];
  corDominante?: string;
  infoExtra: string;
  bancoDeDadosIA: string; // Histórico de aprendizado da IA
}

interface ClientStoreState {
  clients: ClientProfile[];
  activeClientId: string | null;
  addClient: (client: Omit<ClientProfile, "id">) => void;
  updateClient: (id: string, updates: Partial<ClientProfile>) => void;
  removeClient: (id: string) => void;
  setActiveClient: (id: string | null) => void;
  appendAiLearnings: (id: string, text: string) => void;
}

export const useClientStore = create<ClientStoreState>()(
  persist(
    (set) => ({
      clients: [],
      activeClientId: null,
      addClient: (client) =>
        set((state) => ({
          clients: [
            ...state.clients,
            { ...client, id: Date.now().toString() },
          ],
        })),
      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          activeClientId: state.activeClientId === id ? null : state.activeClientId,
        })),
      setActiveClient: (id) => set({ activeClientId: id }),
      appendAiLearnings: (id, text) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id
              ? { ...c, bancoDeDadosIA: c.bancoDeDadosIA ? `${c.bancoDeDadosIA}\n\n[Nova Interação]: ${text}` : `[Nova Interação]: ${text}` }
              : c
          ),
        })),
    }),
    {
      name: "zion-client-storage",
    }
  )
);
