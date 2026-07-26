import { create } from "zustand";
import { ProjectConfig, CamadaTexto, EstiloReferencia } from "../types/designBuilder";
import { useClientStore } from "./useClientStore";
import { set as idbSet, get as idbGet } from "idb-keyval";

interface ProjectStoreState extends ProjectConfig {
  galeriaImages: string[];
  activeImageIndex: number;
  isGenerating: boolean;
  generatingProjectIds: Record<string, boolean>;
  apiStatus: "Online" | "Offline";
  projectsList: { id: string; name: string; config: ProjectConfig; galeria: string[] }[];
  activeProjectId: string | null;
  lastGeneratedPrompt: string;
  lastSystemInstruction: string;
  setLastSystemInstruction: (s: string) => void;
  setLastGeneratedPrompt: (p: string) => void;
  chatDrawerOpen: boolean;
  chatActiveAssistantId: string | null;
  setChatDrawerOpen: (isOpen: boolean) => void;
  setChatActiveAssistantId: (id: string | null) => void;

  // Actions
  updateConfig: (updates: Partial<ProjectConfig>) => void;
  setSujeitoBase64: (base64: string) => void;
  setCenarioBase64: (base64: string) => void;
  addEstiloVisual: (style: string) => void;
  removeEstiloVisual: (style: string) => void;
  setEstilosVisuais: (styles: string[]) => void;
  setGaleriaImages: (images: string[] | ((prev: string[]) => string[])) => void;
  addImagesToProjectGallery: (projectId: string, images: string[]) => boolean;
  setActiveImageIndex: (index: number) => void;
  setIsGenerating: (val: boolean) => void;
  setIsProjectGenerating: (projectId: string, isGenerating: boolean) => void;
  setApiStatus: (status: "Online" | "Offline") => void;

  // Typography Layers Actions
  addCamadaTexto: () => void;
  removeCamadaTexto: (id: string) => void;
  updateCamadaTexto: (id: string, updates: Partial<CamadaTexto>) => void;
  moverCamadaTexto: (id: string, direcao: "cima" | "baixo") => void;

  // Style References Actions
  addReferenciaEstilo: (url: string, data: string) => void;
  removeReferenciaEstilo: (id: string) => void;
  updateReferenciaEstilo: (id: string, descricao: string) => void;

  // Refs
  setTipografiaRefBase64: (base64: string) => void;
  setDesignRefBase64: (base64: string) => void;

  // Multi-upload actions
  setSujeitoBase64List: (list: string[]) => void;
  setCenarioBase64List: (list: string[]) => void;
  setTipografiaRefsList: (list: string[]) => void;
  setDesignRefsList: (list: string[]) => void;
  setLogosList: (list: string[]) => void;

  // Projetos
  createProject: () => void;
  deleteProject: (id: string) => void;
  loadProjectById: (id: string) => void;
  initProjectsList: () => void;
  renameProject: (id: string, newName: string) => void;
}

const defaultConfig: ProjectConfig = {
  clientId: null,
  tipoPainel: "DESIGNER",
  sujeitoBase64: "",
  desativarSujeito: false,
  cenarioBase64: "",
  dimensao: "1:1",
  cores: {
    ambiente: "#000000",
    recorte: "#bbfb33",
    complementar: "#827df6",
    paleta: ["#000000", "#bbfb33", "#827df6"]
  },
  coresAutomaticas: true,
  corDominante: "#000000",
  useCorDominante: false,
  degradeLeitura: false,
  composicao: "Plano Médio (Busto)",
  composicaoCustom: "",
  estilosVisuais: ["Ultra Realista"],
  resolucao: "1K",
  formatoExportacao: "PNG",
  gender: "Masculino",
  positioning: "Centro",
  poseDescription: "",
  cenarioPredefinido: "",
  useEnvRef: false,
  enableBlur: false,
  lateralGradient: false,
  additionalPrompt: "",
  promptCenario: "",
  promptDesign: "",
  promptTipografia: "",
  negativePrompt: "",
  enableTypography: false,
  camadasTexto: [],
  referenciasEstilo: [],
  tipografiaRefBase64: "",
  designRefBase64: "",
  logoBase64: "",
  useLogo: false,
  logoPosOverlay: "top_center",
  logoSizeOverlay: 20,
  logoInclusionType: "embedded",
  sujeitosBase64List: [],
  cenariosBase64List: [],
  tipografiaRefsList: [],
  designRefsList: [],
  logosList: [],
  variations: 1,
  multiplesPersons: false,
  gendersDescription: "",
  modoCriacao: "Criativo",
  nivelCriativo: 50,
  floatingElementsMode: "auto",
  floatingElementsCustom: "",
  somentePrompt: false,
  enableEstiloVisual: true,
  estiloVisualCustom: ""
};

const getFreshDefaultConfig = (): ProjectConfig => JSON.parse(JSON.stringify(defaultConfig));

const saveProjectsToLocalStorage = (list: any[]) => {
  try {
    idbSet("zion_project_list_v5", list).catch(e => console.error("IDB write failed:", e));
  } catch (e) {
    console.error("Local storage write failed:", e);
  }
};

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  ...defaultConfig,
  galeriaImages: [],
  activeImageIndex: 0,
  isGenerating: false,
  generatingProjectIds: {},
  apiStatus: "Online",
  projectsList: [],
  activeProjectId: null,
  lastGeneratedPrompt: "",
  lastSystemInstruction: "",
  setLastSystemInstruction: (s) => set({ lastSystemInstruction: s }),
  chatDrawerOpen: false,
  chatActiveAssistantId: null,
  setChatDrawerOpen: (isOpen) => set({ chatDrawerOpen: isOpen }),
  setChatActiveAssistantId: (id) => set({ chatActiveAssistantId: id }),
  setLastGeneratedPrompt: (p) => set({ lastGeneratedPrompt: p }),

  updateConfig: (updates) => set((state) => {
    const nextState = { ...state, ...updates };
    
    const updatedProjects = state.projectsList.map((proj) => {
      if (proj.id === state.activeProjectId) {
        const configKeys = Object.keys(defaultConfig) as (keyof ProjectConfig)[];
        const nextConfig = {} as ProjectConfig;
        configKeys.forEach((key) => {
          (nextConfig[key] as any) = nextState[key];
        });
        return { ...proj, config: nextConfig };
      }
      return proj;
    });

    saveProjectsToLocalStorage(updatedProjects);
    return { ...updates, projectsList: updatedProjects, lastGeneratedPrompt: "" };
  }),

  setSujeitoBase64: (base64) => {
    const list = base64 ? [base64] : [];
    get().updateConfig({ sujeitoBase64: base64, sujeitosBase64List: list });
  },

  setCenarioBase64: (base64) => {
    const list = base64 ? [base64] : [];
    get().updateConfig({ cenarioBase64: base64, cenariosBase64List: list });
  },

  addEstiloVisual: (style) => {
    const current = get().estilosVisuais;
    if (!current.includes(style)) {
      get().updateConfig({ estilosVisuais: [...current, style] });
    }
  },

  removeEstiloVisual: (style) => {
    const current = get().estilosVisuais;
    get().updateConfig({ estilosVisuais: current.filter((s) => s !== style) });
  },

  setEstilosVisuais: (styles) => {
    get().updateConfig({ estilosVisuais: styles });
  },

  // Camadas de texto
  addCamadaTexto: () => {
    const current = get().camadasTexto;
    const newCamada: CamadaTexto = {
      id: `text_${Date.now()}`,
      conteudo: "",
      funcao: "Headline Principal",
      fonte: "Montserrat",
      cor: "#ffffff"
    };
    get().updateConfig({ camadasTexto: [...current, newCamada] });
  },

  removeCamadaTexto: (id) => {
    const current = get().camadasTexto;
    get().updateConfig({ camadasTexto: current.filter((t) => t.id !== id) });
  },

  updateCamadaTexto: (id, updates) => {
    const current = get().camadasTexto;
    const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
    get().updateConfig({ camadasTexto: updated });
  },

  moverCamadaTexto: (id, direcao) => {
    const current = [...get().camadasTexto];
    const index = current.findIndex((t) => t.id === id);
    if (index === -1) return;

    if (direcao === "cima" && index > 0) {
      const temp = current[index];
      current[index] = current[index - 1];
      current[index - 1] = temp;
    } else if (direcao === "baixo" && index < current.length - 1) {
      const temp = current[index];
      current[index] = current[index + 1];
      current[index + 1] = temp;
    }

    get().updateConfig({ camadasTexto: current });
  },

  // Referências de estilo
  addReferenciaEstilo: (url, data, descricao = "") => {
    const current = get().referenciasEstilo;
    const finalDesc = descricao || (typeof data === "string" && data.length < 500 ? data : "");
    const newRef: EstiloReferencia = {
      id: `ref_${Date.now()}`,
      url,
      data: typeof data === "string" && data.length < 500 ? "" : data,
      descricao: finalDesc
    };
    get().updateConfig({ referenciasEstilo: [...current, newRef] });
  },

  removeReferenciaEstilo: (id) => {
    const current = get().referenciasEstilo;
    get().updateConfig({ referenciasEstilo: current.filter((r) => r.id !== id) });
  },

  updateReferenciaEstilo: (id, descricao) => {
    const current = get().referenciasEstilo;
    const updated = current.map((r) => (r.id === id ? { ...r, descricao } : r));
    get().updateConfig({ referenciasEstilo: updated });
  },

  setTipografiaRefBase64: (base64) => {
    const list = base64 ? [base64] : [];
    get().updateConfig({ tipografiaRefBase64: base64, tipografiaRefsList: list });
  },

  setDesignRefBase64: (base64) => {
    const list = base64 ? [base64] : [];
    get().updateConfig({ designRefBase64: base64, designRefsList: list });
  },

  setSujeitoBase64List: (list) => {
    get().updateConfig({
      sujeitosBase64List: list,
      sujeitoBase64: list.length > 0 ? list[0] : ""
    });
  },

  setCenarioBase64List: (list) => {
    get().updateConfig({
      cenariosBase64List: list,
      cenarioBase64: list.length > 0 ? list[0] : ""
    });
  },

  setTipografiaRefsList: (list) => {
    get().updateConfig({
      tipografiaRefsList: list,
      tipografiaRefBase64: list.length > 0 ? list[0] : ""
    });
  },

  setDesignRefsList: (list) => {
    get().updateConfig({
      designRefsList: list,
      designRefBase64: list.length > 0 ? list[0] : ""
    });
  },

  setLogosList: (list) => {
    get().updateConfig({
      logosList: list,
      logoBase64: list.length > 0 ? list[0] : ""
    });
  },

  setGaleriaImages: (images) => set((state) => {
    const nextImages = typeof images === "function" ? images(state.galeriaImages) : images;
    const seen = new Set<string>();
    const uniqueImages: string[] = [];
    if (Array.isArray(nextImages)) {
      for (const img of nextImages) {
        if (img && typeof img === "string" && !seen.has(img)) {
          seen.add(img);
          uniqueImages.push(img);
        }
      }
    }
    
    const updatedProjects = state.projectsList.map((proj) => {
      if (proj.id === state.activeProjectId) {
        return { ...proj, galeria: uniqueImages };
      }
      return proj;
    });
    saveProjectsToLocalStorage(updatedProjects);

    return { galeriaImages: uniqueImages, projectsList: updatedProjects };
  }),

  addImagesToProjectGallery: (projectId, images) => {
    let isActive = false;
    set((state) => {
      isActive = state.activeProjectId === projectId;
      const updatedProjects = state.projectsList.map((proj) => {
        if (proj.id === projectId) {
          const combined = [...images, ...(proj.galeria || [])];
          const seen = new Set<string>();
          const uniqueGaleria: string[] = [];
          for (const img of combined) {
            if (img && typeof img === "string" && !seen.has(img)) {
              seen.add(img);
              uniqueGaleria.push(img);
            }
          }
          return { ...proj, galeria: uniqueGaleria };
        }
        return proj;
      });
      saveProjectsToLocalStorage(updatedProjects);

      if (isActive) {
        const combined = [...images, ...state.galeriaImages];
        const seen = new Set<string>();
        const uniqueGaleria: string[] = [];
        for (const img of combined) {
          if (img && typeof img === "string" && !seen.has(img)) {
            seen.add(img);
            uniqueGaleria.push(img);
          }
        }
        return {
          projectsList: updatedProjects,
          galeriaImages: uniqueGaleria,
          activeImageIndex: 0
        };
      }
      return { projectsList: updatedProjects };
    });
    return isActive;
  },

  setActiveImageIndex: (index) => set({ activeImageIndex: index }),

  setIsGenerating: (val) => set((state) => {
    const currentId = state.activeProjectId;
    if (!currentId) return { isGenerating: val };
    const updatedMap = { ...state.generatingProjectIds, [currentId]: val };
    if (!val) delete updatedMap[currentId];
    return {
      isGenerating: val,
      generatingProjectIds: updatedMap
    };
  }),

  setIsProjectGenerating: (projectId, isGenerating) => set((state) => {
    const updatedMap = { ...state.generatingProjectIds, [projectId]: isGenerating };
    if (!isGenerating) delete updatedMap[projectId];

    const isCurrentGenerating = state.activeProjectId ? !!updatedMap[state.activeProjectId] : false;

    return {
      generatingProjectIds: updatedMap,
      isGenerating: isCurrentGenerating
    };
  }),

  setApiStatus: (status) => set({ apiStatus: status }),

  createProject: () => {
    const id = `proj_${Date.now()}`;
    const name = `Projeto ${new Date().toLocaleDateString("pt-BR")}`;
    const freshConfig = getFreshDefaultConfig();
    const newProj = {
      id,
      name,
      config: freshConfig,
      galeria: []
    };

    useClientStore.getState().setActiveClient(null);

    set((state) => {
      const newList = [newProj, ...state.projectsList];
      saveProjectsToLocalStorage(newList);
      return {
        projectsList: newList,
        activeProjectId: id,
        ...freshConfig,
        galeriaImages: [],
        activeImageIndex: 0,
        lastGeneratedPrompt: "",
        lastSystemInstruction: ""
      };
    });
  },

  deleteProject: (id) => {
    set((state) => {
      const newList = state.projectsList.filter((p) => p.id !== id);
      saveProjectsToLocalStorage(newList);

      const updatedMap = { ...state.generatingProjectIds };
      delete updatedMap[id];

      let nextActiveId = state.activeProjectId;
      let nextStateUpdates = {};

      if (state.activeProjectId === id) {
        if (newList.length > 0) {
          nextActiveId = newList[0].id;
          const targetProj = newList[0];
          useClientStore.getState().setActiveClient(targetProj.config.clientId || null);
          nextStateUpdates = {
            activeProjectId: nextActiveId,
            ...targetProj.config,
            galeriaImages: targetProj.galeria || [],
            activeImageIndex: 0,
            isGenerating: !!updatedMap[nextActiveId]
          };
        } else {
          nextActiveId = null;
          const freshConfig = getFreshDefaultConfig();
          useClientStore.getState().setActiveClient(null);
          nextStateUpdates = {
            activeProjectId: null,
            ...freshConfig,
            galeriaImages: [],
            activeImageIndex: 0,
            isGenerating: false
          };
        }
      }

      return {
        projectsList: newList,
        generatingProjectIds: updatedMap,
        ...nextStateUpdates
      };
    });
  },

  renameProject: (id, newName) => {
    set((state) => {
      const updatedList = state.projectsList.map((p) => {
        if (p.id === id) {
          return { ...p, name: newName };
        }
        return p;
      });
      saveProjectsToLocalStorage(updatedList);
      return { projectsList: updatedList };
    });
  },

  loadProjectById: (id) => {
    const { projectsList, generatingProjectIds } = get();
    const proj = projectsList.find((p) => p.id === id);
    if (proj) {
      useClientStore.getState().setActiveClient(proj.config.clientId || null);
      set({
        activeProjectId: id,
        ...proj.config,
        galeriaImages: proj.galeria || [],
        activeImageIndex: 0,
        isGenerating: !!generatingProjectIds[id]
      });
    }
  },

  initProjectsList: async () => {
    try {
      let list = await idbGet("zion_project_list_v5");
      if (!list) {
        const saved = localStorage.getItem("zion_project_list_v5");
        if (saved) {
          list = JSON.parse(saved);
        }
      }
      
      if (list && list.length > 0) {
        useClientStore.getState().setActiveClient(list[0].config?.clientId || null);
        set({
          projectsList: list,
          activeProjectId: list[0].id,
          ...list[0].config,
          galeriaImages: list[0].galeria || [],
          activeImageIndex: 0
        });
        return;
      }
    } catch (e) {
      console.error("Error loading project list:", e);
    }
    get().createProject();
  }
}));
