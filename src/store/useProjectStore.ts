import { create } from "zustand";
import { ProjectConfig, CamadaTexto, EstiloReferencia } from "../types/designBuilder";
import { useClientStore } from "./useClientStore";
import { set as idbSet, get as idbGet } from "idb-keyval";

// ─── GERENCIAMENTO PERMANENTE DE IMAGENS EXCLUÍDAS ─────────────────────
export const GENERIC_DELETED_NAMES = new Set([
  "result.avif", "result.png", "result.webp", "result.jpg", "result.jpeg",
  "thumbnail.avif", "thumbnail.png", "thumbnail.webp", "thumbnail.jpg", "thumbnail.jpeg",
  "0.jpg", "1.jpg", "image.png", "image.jpg"
]);

export const getDeletedImages = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("zion_deleted_images");
    const rawList = saved ? JSON.parse(saved) : [];
    // Sanitizar: nunca permitir nomes genericos que limpam a galeria inteira
    const filtered = rawList.filter((item) => {
      if (!item || typeof item !== "string") return false;
      const clean = item.trim().toLowerCase();
      if (GENERIC_DELETED_NAMES.has(clean)) return false;
      const bname = clean.split("/").pop()?.split("?")[0] || "";
      if (GENERIC_DELETED_NAMES.has(bname) && !clean.includes("results/") && !clean.includes("thumbnails/")) {
        return false;
      }
      return true;
    });
    if (filtered.length !== rawList.length) {
      localStorage.setItem("zion_deleted_images", JSON.stringify(filtered));
    }
    return new Set(filtered);
  } catch {
    return new Set();
  }
};

export const addDeletedImage = (idOrUrl: string) => {
  if (typeof window === "undefined" || !idOrUrl) return;
  try {
    const deleted = getDeletedImages();
    const clean = idOrUrl.trim();
    const bname = clean.split("/").pop()?.split("?")[0] || "";
    
    // NUNCA adicionar nomes de arquivo genericos soltos (ex: result.avif)
    if (!GENERIC_DELETED_NAMES.has(bname.toLowerCase())) {
      deleted.add(clean);
    } else if (clean.includes("/") && clean.length > bname.length) {
      deleted.add(clean);
    }
    
    const matchId = clean.match(/(\d{13}_[a-z0-9]+)/i);
    if (matchId) deleted.add(matchId[1]);
    const matchUuid = clean.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (matchUuid) deleted.add(matchUuid[1]);
    
    localStorage.setItem("zion_deleted_images", JSON.stringify(Array.from(deleted)));
  } catch (_) {}
};

interface ProjectStoreState extends ProjectConfig {
  galeriaImages: string[];
  activeImageIndex: number;
  lastLoadedAt: number;
  isGenerating: boolean;
  generatingProjectIds: Record<string, boolean>;
  projectGenerationStartTimes: Record<string, number>;
  apiStatus: "Online" | "Offline";
  projectsList: { id: string; name: string; config: ProjectConfig; galeria: string[] }[];
  activeProjectId: string | null;
  lastGeneratedPrompt: string;
  lastGeneratedId?: string;
  setLastGeneratedId: (id: string) => void;
  lastSystemInstruction: string;
  setLastSystemInstruction: (s: string) => void;
  setLastGeneratedPrompt: (p: string) => void;
  setSeedUsuario: (seed: string | null) => void;
  chatDrawerOpen: boolean;
  chatActiveAssistantId: string | null;
  setChatDrawerOpen: (isOpen: boolean) => void;
  setChatActiveAssistantId: (id: string | null) => void;
  selectedAiModel: string;
  setSelectedAiModel: (model: string) => void;

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
  duplicateProject: () => string;
  deleteProject: (id: string) => void;
  loadProjectById: (id: string) => void;
  initProjectsList: () => void;
  renameProject: (id: string, newName: string) => void;
  resetConfig: () => void;
  deleteGaleriaImage: (idOrUrl: string) => void;
  addGaleriaImage: (imgUrl: string, meta?: { app?: string; prompt?: string }) => void;
  syncGaleriaWithServer: () => Promise<void>;
}

const defaultConfig: ProjectConfig = {
  selectedModel: "nanobanana-pro",
  dimensao: "4:5",
  clientId: null,
  promptSujeito: "",
  sujeitoBase64: "",
  cenarioBase64: "",
  cores: {
    primaria: "#CA00E5",
    secundaria: "#E85700",
    acento: "#39ED53",
    fundo: "#0c0a15",
    ambiente: "#CA00E5",
    complementar: "#E85700",
    recorte: "#39ED53",
    paleta: ["#CA00E5", "#E85700", "#39ED53"]
  },
  useDominantColors: true,
  degradeLeitura: true,
  composicao: "Plano Médio (Busto)",
  composicaoCustom: "",
  estilosVisuais: ["Ultra Realista"],
  resolucao: "1K",
  formatoExportacao: "PNG",
  gender: "Feminino",
  genero: "female",
  positioning: "Direita",
  poseDescription: "",
  cenarioPredefinido: "",
  useEnvRef: true,
  enableBlur: true,
  lateralGradient: true,
  additionalPrompt: "",
  promptCenario: "",
  promptDesign: "",
  promptTipografia: "",
  negativePrompt: "",
  enableTypography: true,
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
  floatingElementsMode: "none",
  floatingElementsCustom: "",
  somentePrompt: false,
  enableEstiloVisual: true,
  estiloVisualCustom: "",
  nicho: "",
  quantidade: 1,
  qualidade: "1K",
  cenario: "",
  typographyPosition: "Centro",
  elementosFlutuantes: false,
  elementosFlutuantesTexto: "",
  estiloVisual: "Ultra Realista",
  modelId: "nanobanana-pro",
  categoria: "Pessoa",
  modoCriativo: "Criativo"
};

const getFreshDefaultConfig = (): ProjectConfig => JSON.parse(JSON.stringify(defaultConfig));

const createDefaultProjects = (serverImages: string[] = ["/Design Builder1 2_files/result.avif"]) => {
  const proj1Config: ProjectConfig = getFreshDefaultConfig();
  const proj2Config: ProjectConfig = getFreshDefaultConfig();
  /*
    ...getFreshDefaultConfig(),
    dimensao: "4:5",
    qualidade: "1K",
    resolucao: "1K",
    quantidade: 1,
    nicho: "Saúde, Cursos Técnicos, Capacitações Profissionais, Teoria e Prática Profissional",
    positioning: "Centro",
    composicao: "Plano Médio (Busto)",
    estiloVisual: "Ultra Realista",
    estilosVisuais: ["Ultra Realista"],
    nivelCriativo: 50,
    enableBlur: false,
    degradeLeitura: false,
    typographyPosition: "Centro",
    elementosFlutuantes: false,
    floatingElementsMode: "none",
    floatingElementsCustom: "",
    cores: {
      ambiente: "#1E8FD5",
      complementar: "#081B3F",
      recorte: "#e2e2e2",
      primaria: "#1E8FD5",
      secundaria: "#081B3F",
      acento: "#e2e2e2",
      fundo: "#0c0a15",
      paleta: ["#1E8FD5", "#081B3F", "#e2e2e2"]
    },
    camadasTexto: [
      { id: "cep_1", tipoBloco: "H1", funcao: "Headline Principal", conteudo: "Matrículas abertas.", pesoVisual: 5, fonte: "Montserrat", cor: "#ffffff" },
      { id: "cep_2", tipoBloco: "Bullets", funcao: "Lista de Benefícios", conteudo: "Técnico em Radiologia", pesoVisual: 2, fonte: "Outfit", cor: "#1E8FD5" },
      { id: "cep_3", tipoBloco: "Bullets", funcao: "Lista de Benefícios", conteudo: "Técnico em Farmácia", pesoVisual: 2, fonte: "Outfit", cor: "#1E8FD5" },
      { id: "cep_4", tipoBloco: "Bullets", funcao: "Lista de Benefícios", conteudo: "Técnico em Enfermagem", pesoVisual: 2, fonte: "Outfit", cor: "#1E8FD5" },
      { id: "cep_5", tipoBloco: "Bullets", funcao: "Lista de Benefícios", conteudo: "Auxiliar em Saúde Bucal", pesoVisual: 2, fonte: "Outfit", cor: "#1E8FD5" },
      { id: "cep_6", tipoBloco: "CTA", funcao: "CTA Botão", conteudo: "@centrocepar", pesoVisual: 4, fonte: "Unbounded", cor: "#081B3F" },
      { id: "cep_7", tipoBloco: "CTA", funcao: "CTA Botão", conteudo: "(74) 9950-3892", pesoVisual: 4, fonte: "Unbounded", cor: "#081B3F" }
    ],
    referenciasEstilo: [
      {
        id: "ref_cepar_1",
        url: "/Prefeitura_Educacao.jpg",
        data: "/Prefeitura_Educacao.jpg",
        descricao: "melhor que esse"
      }
    ],
    cenariosBase64List: ["/Prefeitura_Educacao.jpg"],
    cenarioBase64: "/Prefeitura_Educacao.jpg"
  }; */

  return [
    { id: "proj_aba_1", name: "Aba 1", config: proj1Config, galeria: serverImages },
    { id: "proj_aba_2", name: "Aba 2", config: proj2Config, galeria: serverImages }
  ];
};

export const uploadBase64IfPossible = async (base64: string, prefix = "upload"): Promise<string> => {
  if (typeof window === "undefined" || !base64 || typeof base64 !== "string" || !base64.startsWith("data:")) {
    return base64;
  }
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, filename: `${prefix}_${Date.now()}.png` })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url) return data.url;
    }
  } catch (e) {
    console.warn("Upload helper failed:", e);
  }
  return base64;
};

const sanitizeConfigValue = (val: any): any => {
  if (typeof val === "string") {
    if (val.startsWith("data:") && val.length > 500) {
      return "";
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeConfigValue);
  }
  if (val && typeof val === "object") {
    const copy: any = {};
    for (const k of Object.keys(val)) {
      copy[k] = sanitizeConfigValue(val[k]);
    }
    return copy;
  }
  return val;
};

const sanitizeListForLocalStorage = (list: any[]) => {
  if (!Array.isArray(list)) return [];
  return list.map(proj => {
    if (!proj || !proj.config) return proj;
    const configCopy = sanitizeConfigValue(proj.config);
    const cleanGaleria = Array.isArray(proj.galeria)
      ? proj.galeria.filter((img: string) => typeof img === "string" && (!img.startsWith("data:") || img.length < 500))
      : [];
    return {
      ...proj,
      config: configCopy,
      galeria: cleanGaleria
    };
  });
};

const saveProjectsToLocalStorage = (list: any[]) => {
  if (!Array.isArray(list) || list.length === 0) return;
  // Ensure maximum 3 tabs and names strictly "Aba 1", "Aba 2", "Aba 3"
  const cappedList = list.slice(0, 3).map((proj, idx) => ({
    ...proj,
    name: proj.name && proj.name.startsWith("Aba ") ? proj.name : `Aba ${idx + 1}`
  }));

  try {
    // Preserve full base64 images in IndexedDB so references and generated outputs are never lost on reload
    idbSet("zion_project_list_v5_full", cappedList).catch(e => console.error("IDB full write failed:", e));
    idbSet("zion_project_list_v5", cappedList).catch(e => console.error("IDB write failed:", e));
    if (typeof window !== "undefined") {
      try {
        const cleanList = sanitizeListForLocalStorage(cappedList);
        localStorage.setItem("zion_project_list_v5", JSON.stringify(cleanList));
      } catch (err) {
        console.warn("LocalStorage quota limit, saved in IDB:", err);
      }
    }
  } catch (e) {
    console.error("Local storage write failed:", e);
  }
};

const getInitialProjectState = (): { list: any[]; activeId: string; activeConfig: Partial<ProjectConfig> } => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("zion_project_list_v5");
      if (saved) {
        let list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          list = list.slice(0, 3).map((p: any, idx: number) => ({
            ...p,
            name: p.name && p.name.startsWith("Aba ") ? p.name : `Aba ${idx + 1}`
          }));
          const lastActiveId = localStorage.getItem("zion_last_active_project_id");
          const activeProj = list.find((p: any) => p.id === lastActiveId) || list[0];
          return {
            list,
            activeId: activeProj?.id || list[0].id,
            activeConfig: activeProj?.config || {}
          };
        }
      }
    } catch (_) {}
  }
  const defaultList = createDefaultProjects();
  return { list: defaultList, activeId: "proj_aba_1", activeConfig: defaultList[0].config };
};

const initialProjectData = getInitialProjectState();

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  ...defaultConfig,
  ...initialProjectData.activeConfig,
  galeriaImages: (initialProjectData.list.find(p => p.id === initialProjectData.activeId)?.galeria) || ["/Design Builder1 2_files/result.avif"],
  activeImageIndex: 0,
  lastLoadedAt: Date.now(),
  isGenerating: false,
  generatingProjectIds: {},
  projectGenerationStartTimes: {},
  apiStatus: "Online",
  projectsList: initialProjectData.list,
  activeProjectId: initialProjectData.activeId,
  lastGeneratedPrompt: "",
  lastSystemInstruction: "",
  setLastSystemInstruction: (s) => set({ lastSystemInstruction: s }),
  setSeedUsuario: (seed) => set({ seedUsuario: seed }),
  chatDrawerOpen: false,
  chatActiveAssistantId: null,
  setChatDrawerOpen: (isOpen) => set({ chatDrawerOpen: isOpen }),
  setChatActiveAssistantId: (id) => set({ chatActiveAssistantId: id }),
  setLastGeneratedPrompt: (p) => set({ lastGeneratedPrompt: p }),
  lastGeneratedId: "",
  setLastGeneratedId: (id) => set({ lastGeneratedId: id }),
  selectedAiModel: typeof window !== "undefined" ? (localStorage.getItem("zion_selected_model") || "deepseek-v4-flash") : "deepseek-v4-flash",
  setSelectedAiModel: (model) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("zion_selected_model", model);
    }
    set({ selectedAiModel: model });
  },

  updateConfig: (updates) => set((state) => {
    // Keep resolucao and qualidade strictly in sync
    if (updates.qualidade && !updates.resolucao) {
      updates.resolucao = updates.qualidade;
    }
    if (updates.resolucao && !updates.qualidade) {
      updates.qualidade = updates.resolucao;
    }
    const nextState = { ...state, ...updates };
    const currentId = state.activeProjectId || (state.projectsList[0] ? state.projectsList[0].id : "proj_aba_1");
    
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("zion_last_active_project_id", currentId);
      }
    } catch (_) {}

    const updatedProjects = state.projectsList.map((proj) => {
      if (proj.id === currentId) {
        const nextConfig = { ...(proj.config || {}), ...updates } as ProjectConfig;
        return { ...proj, config: nextConfig };
      }
      return proj;
    });

    saveProjectsToLocalStorage(updatedProjects);
    return { ...updates, activeProjectId: currentId, projectsList: updatedProjects, lastGeneratedPrompt: "" };
  }),

  setSujeitoBase64: (base64) => {
    const list = base64 ? [base64] : [];
    if (base64) {
      idbSet("zion_saved_sujeito", base64).catch(() => {});
      // Se for base64, envia também ao servidor para persistência física permanente no disco
      if (typeof window !== "undefined" && base64.startsWith("data:")) {
        fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, filename: "sujeito_" + Date.now() + ".png" })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.url) {
              get().updateConfig({ sujeitoBase64: data.url, sujeitosBase64List: [data.url] });
              idbSet("zion_saved_sujeito", data.url).catch(() => {});
            }
          })
          .catch(() => {});
      }
    }
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
    const current = get().referenciasEstilo || [];
    const finalData = (typeof data === "string" && data.length > 500) ? data : (url || "");
    const finalDesc = descricao || (typeof data === "string" && data.length < 500 ? data : "");
    const newRef: EstiloReferencia = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      url: url || finalData,
      data: finalData,
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
          // Snapshot current active state config into proj.config so user inputs and base64 references never disappear
          const currentConfigSnapshot: any = {
            selectedModel: state.selectedModel,
            dimensao: state.dimensao,
            clientId: state.clientId,
            promptSujeito: state.promptSujeito,
            sujeitoBase64: state.sujeitoBase64,
            cenarioBase64: state.cenarioBase64,
            cores: state.cores,
            useDominantColors: state.useDominantColors,
            degradeLeitura: state.degradeLeitura,
            composicao: state.composicao,
            composicaoCustom: state.composicaoCustom,
            estilosVisuais: state.estilosVisuais,
            resolucao: state.resolucao,
            qualidade: state.qualidade,
            formatoExportacao: state.formatoExportacao,
            gender: state.gender,
            genero: state.genero,
            positioning: state.positioning,
            poseDescription: state.poseDescription,
            cameraAngle: (state as any).cameraAngle,
            lighting: (state as any).lighting,
            promptCenario: state.promptCenario,
            scenarioPreset: (state as any).scenarioPreset,
            camadasTexto: state.camadasTexto,
            typographyPosition: state.typographyPosition,
            referenciasEstilo: state.referenciasEstilo,
            nivelCriativo: state.nivelCriativo,
            floatingElementsMode: state.floatingElementsMode,
            floatingElementsCustom: state.floatingElementsCustom,
            floatingElementsPreset: (state as any).floatingElementsPreset,
            nicho: state.nicho,
            additionalPrompt: state.additionalPrompt,
            enableBlur: state.enableBlur,
            depthOfField: (state as any).depthOfField,
            tipografiaRefBase64: state.tipografiaRefBase64,
            designRefBase64: state.designRefBase64,
            sujeitosBase64List: state.sujeitosBase64List,
            cenariosBase64List: state.cenariosBase64List,
            tipografiaRefsList: state.tipografiaRefsList,
            designRefsList: state.designRefsList,
            logosList: state.logosList,
            variations: state.variations,
            tipoPainel: state.tipoPainel,
            promptTextoLivre: (state as any).promptTextoLivre
          };
          return { ...proj, config: { ...(proj.config || {}), ...currentConfigSnapshot }, galeria: uniqueGaleria };
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
    const updatedTimes = { ...state.projectGenerationStartTimes };
    if (val) {
      updatedTimes[currentId] = updatedTimes[currentId] || Date.now();
    } else {
      delete updatedMap[currentId];
      delete updatedTimes[currentId];
    }
    return {
      isGenerating: val,
      generatingProjectIds: updatedMap,
      projectGenerationStartTimes: updatedTimes
    };
  }),

  setIsProjectGenerating: (projectId, isGenerating) => set((state) => {
    const updatedMap = { ...state.generatingProjectIds, [projectId]: isGenerating };
    const updatedTimes = { ...state.projectGenerationStartTimes };
    if (isGenerating) {
      updatedTimes[projectId] = updatedTimes[projectId] || Date.now();
    } else {
      delete updatedMap[projectId];
      delete updatedTimes[projectId];
    }

    const isCurrentGenerating = state.activeProjectId ? !!updatedMap[state.activeProjectId] : false;

    return {
      generatingProjectIds: updatedMap,
      projectGenerationStartTimes: updatedTimes,
      isGenerating: isCurrentGenerating
    };
  }),

  setApiStatus: (status) => set({ apiStatus: status }),

  createProject: () => {
    const state = get();
    if (state.projectsList.length >= 3) return;

    const nextIndex = state.projectsList.length + 1;
    const id = `proj_aba_${nextIndex}_${Date.now()}`;
    const name = `Aba ${nextIndex}`;
    const freshConfig = getFreshDefaultConfig();
    const newProj = {
      id,
      name,
      config: freshConfig,
      galeria: []
    };

    // Snapshot current active project before creating new tab
    const activeId = state.activeProjectId;
    const configKeys = Object.keys(defaultConfig) as (keyof ProjectConfig)[];
    const activeSnapshot: any = {};
    configKeys.forEach((k) => {
      if (state[k] !== undefined) {
        activeSnapshot[k] = state[k];
      }
    });
    activeSnapshot.categoria = (state as any).categoria;
    activeSnapshot.modoCriativo = (state as any).modoCriativo;
    activeSnapshot.modoCriacao = (state as any).modoCriacao;

    const updatedProjects = state.projectsList.map((p) => {
      if (p.id === activeId) {
        return {
          ...p,
          config: { ...(p.config || {}), ...activeSnapshot },
          galeria: state.galeriaImages || p.galeria || []
        };
      }
      return p;
    });

    const newList = [...updatedProjects, newProj];
    saveProjectsToLocalStorage(newList);
    try { localStorage.setItem("zion_last_active_project_id", id); } catch {}

    set({
      projectsList: newList,
      activeProjectId: id,
      ...freshConfig,
      galeriaImages: [],
      activeImageIndex: 0,
      lastLoadedAt: Date.now(),
      lastGeneratedPrompt: "",
      lastSystemInstruction: ""
    });
  },

  duplicateProject: () => {
    const state = get();
    if (state.projectsList.length >= 3) {
      return state.activeProjectId || "";
    }

    const nextIndex = state.projectsList.length + 1;
    const id = `proj_aba_${nextIndex}_${Date.now()}`;
    const name = `Aba ${nextIndex}`;

    const configKeys = Object.keys(defaultConfig) as (keyof ProjectConfig)[];
    const duplicatedConfig = {} as ProjectConfig;
    configKeys.forEach((key) => {
      const val = state[key] !== undefined ? state[key] : defaultConfig[key];
      try {
        (duplicatedConfig as any)[key] = val !== undefined && val !== null ? JSON.parse(JSON.stringify(val)) : val;
      } catch (e) {
        (duplicatedConfig as any)[key] = val;
      }
    });

    const newProj = {
      id,
      name,
      config: duplicatedConfig,
      galeria: [...state.galeriaImages]
    };

    set((state) => {
      const newList = [...state.projectsList, newProj];
      saveProjectsToLocalStorage(newList);
      return {
        projectsList: newList,
        activeProjectId: id,
        ...duplicatedConfig,
        galeriaImages: [...state.galeriaImages],
        activeImageIndex: 0,
        lastGeneratedPrompt: "",
        lastSystemInstruction: ""
      };
    });

    return id;
  },

  deleteProject: (id) => {
    // Notifica o backend para limpar do disco e do Cloudflare R2
    const currentList = get().projectsList;
    const targetProj = currentList.find((p) => p.id === id);
    if (targetProj) {
      fetch(`/api/projetos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: targetProj.galeria || [] })
      }).catch(() => {});
    }

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
          if (targetProj.config?.clientId) {
            useClientStore.getState().setActiveClient(targetProj.config.clientId);
          }
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
    const currentState = get();
    const { projectsList, generatingProjectIds, activeProjectId } = currentState;
    const proj = projectsList.find((p) => p.id === id);
    if (!proj) return;

    try { localStorage.setItem("zion_last_active_project_id", id); } catch {}

    // Snapshot current active project before switching tabs so user inputs are never lost
    let updatedProjectsList = projectsList;
    if (activeProjectId && activeProjectId !== id) {
      const configKeys = Object.keys(defaultConfig) as (keyof ProjectConfig)[];
      const activeSnapshot: any = {};
      configKeys.forEach((k) => {
        if (currentState[k] !== undefined) {
          activeSnapshot[k] = currentState[k];
        }
      });
      activeSnapshot.categoria = (currentState as any).categoria;
      activeSnapshot.modoCriativo = (currentState as any).modoCriativo;
      activeSnapshot.modoCriacao = (currentState as any).modoCriacao;

      updatedProjectsList = projectsList.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            config: { ...(p.config || {}), ...activeSnapshot },
            galeria: currentState.galeriaImages || p.galeria || []
          };
        }
        return p;
      });
      saveProjectsToLocalStorage(updatedProjectsList);
    }

    useClientStore.getState().setActiveClient(proj.config?.clientId || null);
    const projQualidade = proj.config?.qualidade || proj.config?.resolucao || "1K";
    set({
      projectsList: updatedProjectsList,
      activeProjectId: id,
      ...(proj.config || {}),
      qualidade: projQualidade,
      resolucao: projQualidade,
      galeriaImages: proj.galeria || [],
      activeImageIndex: 0,
      lastLoadedAt: Date.now(),
      isGenerating: !!generatingProjectIds[id]
    });
  },

  initProjectsList: async () => {
    try {
      // First try full IndexedDB with all base64 reference images preserved
      let list = await idbGet("zion_project_list_v5_full");
      if (!list || !Array.isArray(list) || list.length === 0) {
        list = await idbGet("zion_project_list_v5");
      }
      if (!list || !Array.isArray(list) || list.length === 0) {
        const saved = localStorage.getItem("zion_project_list_v5");
        if (saved) {
          list = JSON.parse(saved);
        }
      }

      // Normalise tabs to max 3 and strict "Aba 1", "Aba 2", "Aba 3" names
      if (Array.isArray(list) && list.length > 0) {
        list = list.slice(0, 3).map((p: any, idx: number) => ({
          ...p,
          name: p.name && p.name.startsWith("Aba ") ? p.name : `Aba ${idx + 1}`
        }));
      }

      // Inicia sincronizacao continua em tempo real (BroadcastChannel + polling + events)
      if (typeof window !== "undefined" && !(window as any).__zionGallerySyncStarted) {
        (window as any).__zionGallerySyncStarted = true;
        try {
          if ("BroadcastChannel" in window) {
            const bc = new BroadcastChannel("zion-gallery-sync");
            bc.onmessage = () => {
              get().syncGaleriaWithServer();
            };
          }
          window.addEventListener("zion-generation-done", () => {
            get().syncGaleriaWithServer();
          });
          window.addEventListener("focus", () => {
            get().syncGaleriaWithServer();
          });
          setInterval(() => {
            if (document.visibilityState === "visible") {
              get().syncGaleriaWithServer();
            }
          }, 2500);
        } catch (_) {}
      }

      // Busca histórico de imagens no disco do servidor para que nenhuma geração se perca
      let serverImages: string[] = [];
      try {
        const [hRes, bffRes] = await Promise.all([
          fetch("/api/historico-imagens").catch(() => null),
          fetch("/api/bff/api/generations").catch(() => null)
        ]);
        if (hRes && hRes.ok) {
          const hData = await hRes.json();
          if (Array.isArray(hData.images)) {
            serverImages.push(...hData.images.map((img: any) => img.url).filter(Boolean));
          }
        }
        if (bffRes && bffRes.ok) {
          const bffData = await bffRes.json();
          if (Array.isArray(bffData.items)) {
            serverImages.push(...bffData.items.map((item: any) => item.result_url).filter(Boolean));
          }
        }
      } catch (e) {
        console.warn("Não foi possível carregar histórico do servidor:", e);
      }
      // Filtra imagens excluídas da lista do servidor
      const deletedSet = getDeletedImages();
      serverImages = Array.from(new Set(["/Design Builder1 2_files/result.avif", ...serverImages]))
        .filter((img) => {
          const bname = img.split("/").pop() || "";
          const matchId = img.match(/(\d{13}_[a-z0-9]+)/i);
          const jId = matchId ? matchId[1] : "";
          return !deletedSet.has(img) && !deletedSet.has(bname) && (!jId || !deletedSet.has(jId));
        });
      
      if (list && Array.isArray(list) && list.length > 0) {
        const lastActiveId = typeof window !== "undefined" ? localStorage.getItem("zion_last_active_project_id") : null;
        const activeProj = list.find((p: any) => p.id === lastActiveId) || list[0];
        if (activeProj?.config?.clientId) {
          useClientStore.getState().setActiveClient(activeProj.config.clientId);
        }

        const existingGal = activeProj.galeria || [];
        const combinedGallery = Array.from(new Set([...serverImages, ...existingGal]));

        const projQualidade = activeProj.config?.qualidade || activeProj.config?.resolucao || "1K";

        // Restaura foto do sujeito salva se não houver no config
        let restoredSujeito = activeProj.config?.sujeitoBase64;
        if (!restoredSujeito) {
          try {
            const savedSuj = await idbGet("zion_saved_sujeito");
            if (savedSuj) restoredSujeito = savedSuj;
          } catch (_) {}
        }

        const filteredCombined = (combinedGallery.length > 0 ? combinedGallery : serverImages).filter((img) => {
          const bname = img.split("/").pop() || "";
          return !deletedSet.has(img) && !deletedSet.has(bname);
        });

        set({
          projectsList: list,
          activeProjectId: activeProj.id,
          ...activeProj.config,
          sujeitoBase64: restoredSujeito || activeProj.config?.sujeitoBase64 || "",
          sujeitosBase64List: restoredSujeito ? [restoredSujeito] : (activeProj.config?.sujeitosBase64List || []),
          qualidade: projQualidade,
          resolucao: projQualidade,
          logoInclusionType: "embedded",
          galeriaImages: filteredCombined,
          activeImageIndex: 0,
          lastLoadedAt: Date.now()
        });
        return;
      }

      // Sem projetos salvos: cria Aba 1 e Aba 2 fidedignas ao app.designbuilder.co
      const initialList = createDefaultProjects(serverImages);
      saveProjectsToLocalStorage(initialList);

      const defaultActive = initialList[0];
      set({
        projectsList: initialList,
        activeProjectId: defaultActive.id,
        ...defaultActive.config,
        galeriaImages: serverImages,
        activeImageIndex: 0,
        lastGeneratedPrompt: "",
        lastSystemInstruction: ""
      });
      return;
    } catch (e) {
      console.error("Error loading project list:", e);
    }
    const freshConfig = getFreshDefaultConfig();
    const fallbackProj = {
      id: "proj_aba_1",
      name: "Aba 1",
      config: freshConfig,
      galeria: ["/Design Builder1 2_files/result.avif"]
    };
    set({
      projectsList: [fallbackProj],
      activeProjectId: "proj_aba_1",
      ...freshConfig,
      galeriaImages: ["/Design Builder1 2_files/result.avif"],
      activeImageIndex: 0,
      lastGeneratedPrompt: "",
      lastSystemInstruction: ""
    });
  },

  resetConfig: () => {
    const freshConfig = getFreshDefaultConfig();
    set({
      ...freshConfig,
      sujeitoBase64: "",
      cenarioBase64: "",
      sujeitosBase64List: [],
      cenariosBase64List: [],
      tipografiaRefsList: [],
      designRefsList: [],
      logosList: [],
      camadasTexto: [],
      referenciasEstilo: []
    });
  },

  addGaleriaImage: (imgUrl: string, meta?: { app?: string; prompt?: string }) => {
    if (!imgUrl || typeof imgUrl !== "string") return;
    const deleted = getDeletedImages();
    const bname = imgUrl.split("/").pop() || "";
    if (deleted.has(imgUrl) || deleted.has(bname)) return;

    set((state) => {
      const existing = state.galeriaImages || [];
      if (existing.includes(imgUrl)) {
        return { activeImageIndex: 0 };
      }
      const nextImages = [imgUrl, ...existing];
      const activeProjId = state.activeProjectId;
      let nextProjects = state.projectsList;
      if (activeProjId) {
        nextProjects = state.projectsList.map((p) => {
          if (p.id === activeProjId) {
            const gal = [imgUrl, ...(p.galeria || []).filter((x) => x !== imgUrl)];
            return { ...p, galeria: gal };
          }
          return p;
        });
        saveProjectsToLocalStorage(nextProjects);
      }
      return {
        galeriaImages: nextImages,
        activeImageIndex: 0,
        projectsList: nextProjects
      };
    });

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: imgUrl, ...meta } }));
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("zion-gallery-sync");
          bc.postMessage({ type: "NEW_IMAGE", imageUrl: imgUrl, ...meta });
          bc.close();
        }
      } catch (_) {}
    }
  },

  syncGaleriaWithServer: async () => {
    try {
      const [hRes, bffRes] = await Promise.all([
        fetch("/api/historico-imagens").catch(() => null),
        fetch("/api/bff/api/generations?limit=150").catch(() => null)
      ]);

      const foundImages: string[] = [];
      if (hRes && hRes.ok) {
        const hData = await hRes.json();
        if (Array.isArray(hData.images)) {
          foundImages.push(...hData.images.map((img: any) => img.url).filter(Boolean));
        }
      }
      if (bffRes && bffRes.ok) {
        const bffData = await bffRes.json();
        if (Array.isArray(bffData.items)) {
          foundImages.push(
            ...bffData.items
              .filter((it: any) => it.status === "done" || it.status === "COMPLETED" || !it.status)
              .map((it: any) => it.result_url)
              .filter(Boolean)
          );
        }
      }

      if (foundImages.length === 0) return;

      const deleted = getDeletedImages();
      const validFound = foundImages.filter((url) => {
        const bname = url.split("/").pop() || "";
        return !deleted.has(url) && !deleted.has(bname);
      });

      const current = get().galeriaImages || [];
      const newItems = validFound.filter((url) => !current.includes(url));
      if (newItems.length === 0) return;

      const combined = Array.from(new Set([...newItems, ...current]));
      const activeProjId = get().activeProjectId;
      let nextProjects = get().projectsList;
      if (activeProjId) {
        nextProjects = nextProjects.map((p) => {
          if (p.id === activeProjId) {
            return { ...p, galeria: Array.from(new Set([...newItems, ...(p.galeria || [])])) };
          }
          return p;
        });
        saveProjectsToLocalStorage(nextProjects);
      }

      set({
        galeriaImages: combined,
        projectsList: nextProjects
      });
    } catch (_) {}
  },

  deleteGaleriaImage: (idOrUrl: string) => {
    if (!idOrUrl) return;
    // 1. Grava na lista negra permanente de excluídos
    addDeletedImage(idOrUrl);

    // 2. Extrai identificadores e aciona exclusão no backend
    const basename = idOrUrl.split("/").pop() || "";
    const matchId = idOrUrl.match(/(\d{13}_[a-z0-9]+)/i);
    const jobId = matchId ? matchId[1] : (idOrUrl.startsWith("http") || idOrUrl.startsWith("/") ? null : idOrUrl);

    if (jobId) {
      fetch(`/api/bff/api/generations/${jobId}`, { method: "DELETE" }).catch(() => {});
    }
    if (basename && (basename.endsWith(".png") || basename.endsWith(".avif") || basename.endsWith(".webp") || basename.endsWith(".jpg"))) {
      fetch(`/api/historico-imagens/${basename}`, { method: "DELETE" }).catch(() => {});
    }

    // 3. Remove de todas as abas e estado da galeria
    set((state) => {
      const nextImages = state.galeriaImages.filter((img) => img !== idOrUrl && !img.includes(idOrUrl) && img !== basename);
      const nextIndex = Math.min(state.activeImageIndex, Math.max(0, nextImages.length - 1));

      const updatedProjects = state.projectsList.map((p) => {
        const pGal = Array.isArray(p.galeria)
          ? p.galeria.filter((img: string) => img !== idOrUrl && !img.includes(idOrUrl) && img !== basename)
          : [];
        return { ...p, galeria: pGal };
      });

      saveProjectsToLocalStorage(updatedProjects);
      return {
        galeriaImages: nextImages,
        activeImageIndex: nextIndex,
        projectsList: updatedProjects
      };
    });
  },

  loadProjects: async () => {
    return get().initProjectsList();
  }
}));
