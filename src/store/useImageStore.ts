import { create } from 'zustand';
import { safeStorageSetItem } from '../utils/imageStorageManager';
import { recordImageGeneration } from '../utils/apiUsageManager';
import { checkAdminOrOpenPlan, getAuthHeaders, openPlanModal } from '../utils/userAuth';

export interface ImgConfig {
  imageSize: string;
  aspectRatio: string;
  variations: number;
  gender: string;
  positioning: string;
  clothingPose: string;
  enableText: boolean;
  h1: string;
  h2: string;
  cta: string;
  textPosition: string;
  gradient: boolean;
  niche: string;
  environment: string;
  useEnvRef: boolean;
  envColor: string;
  colorCode: string;
  enableAmbientColor: boolean;
  rimLight: string;
  enableRimLight: boolean;
  compLight: string;
  enableCompLight: boolean;
  extractTypography: boolean;
  framing: string;
  floatingElements: boolean;
  floatingElementsDescription: string;
  sobriety: number;
  style: string;
  enableBlur: boolean;
  lateralGradient: boolean;
  noPeople: boolean;
  additionalPrompt: string;
  
  // Advanced configuration extensions
  modoCriacao: string;
  tipoLayout: string;
  textSmall: string;
  textEffect: string;
  fontFamily: string;
  age: string;
  ethnicity: string;
  expression: string;
  lookCamera: boolean;
  identityWeight: number;
  ambienteCategoria: string;
  luzPrincipalColor: string;
  luzRecorteColor: string;
  luzCompColor: string;
  temperaturaLuz: string;
  horaDia: string;
  envRefWeight: number;
  visualStyle: string;
  efeitoGrain: boolean;
  efeitoBloom: boolean;
  efeitoLensFlare: boolean;
  efeitoHDR: boolean;
  efeitoChromaticAberration: boolean;
  efeitoVignette: boolean;
  efeitoMotionBlur: boolean;
  degradeDirecao: string;
  floatElementParticles: boolean;
  floatElementMoney: boolean;
  floatElementFog: boolean;
  floatElementSmoke: boolean;
  floatElementLightning: boolean;
  floatElementFire: boolean;
  floatElementRain: boolean;
  floatElementSnow: boolean;
  floatElementConfetti: boolean;
  logoPosition: string;
  logoScale: number;
  logoOpacity: number;
  logoSafeArea: boolean;
  negativePrompt: string;
}

export interface DesignProject {
  id: string;
  name: string;
  thumbnail: string | null;
  config: ImgConfig;
  backgroundSettings: { type: 'color' | 'image'; colors: string[] };
  personRefs: any[];
  envRefs: any[];
  styleRefs: any[];
  logoRefs: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ImageStoreState {
  imgConfig: ImgConfig;
  personRefs: { url: string; data: string; mimeType: string }[];
  envRefs: { url: string; data: string; mimeType: string }[];
  styleRefs: { url: string; data: string; mimeType: string; description: string }[];
  logoRefs: { url: string; data: string; mimeType: string; position: string; size: number }[];
  generatedImages: string[];
  aiThought: string;
  savedCards: string[];
  isGeneratingImage: boolean;
  generationProgress: number;
  
  // Column 1: Navigation State
  activeSubTab: 'templates' | 'community' | 'library';
  
  // Column 3: Canvas Inpainting Editor State
  canvasImage: string | null;     // Selected base image (URL/base64)
  maskImage: string | null;       // Drawn mask (base64)
  brushSize: number;
  brushMode: 'draw' | 'erase';
  inpaintPrompt: string;
  isInpainting: boolean;

  // Projects State
  projects: DesignProject[];
  activeProjectId: string | null;
  backgroundSettings: { type: 'color' | 'image'; colors: string[] };
  isExtractingPrompt: boolean;
  promptExtractorResult: string;
  modelUsed: string;

  // Actions
  updateImgConfig: (updates: Partial<ImgConfig>) => void;
  setPersonRefs: (refs: any[]) => void;
  setEnvRefs: (refs: any[]) => void;
  setStyleRefs: (refs: any[]) => void;
  setLogoRefs: (refs: any[]) => void;
  addPersonRef: (ref: any) => void;
  removePersonRef: (index: number) => void;
  addEnvRef: (ref: any) => void;
  removeEnvRef: (index: number) => void;
  addStyleRef: (ref: any) => void;
  removeStyleRef: (index: number) => void;
  updateStyleRefDescription: (index: number, description: string) => void;
  addLogoRef: (ref: any) => void;
  removeLogoRef: (index: number) => void;
  updateLogoRef: (index: number, updates: any) => void;
  
  setGeneratedImages: (images: string[]) => void;
  setAiThought: (thought: string) => void;
  setSavedCards: (cards: string[]) => void;
  setIsGeneratingImage: (val: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  
  setActiveSubTab: (tab: 'templates' | 'community' | 'library') => void;
  setCanvasImage: (imgUrl: string | null) => void;
  setBrushSize: (size: number) => void;
  setBrushMode: (mode: 'draw' | 'erase') => void;
  setInpaintPrompt: (prompt: string) => void;
  clearCanvasState: () => void;
  
  generateImage: (customApiKey: string, backgroundSettings: any, aspectRatioOverride?: string) => Promise<void>;
  applyInpainting: (customApiKey: string) => Promise<void>;
  removeBackground: () => Promise<void>;

  // Project Actions
  setProjects: (projects: DesignProject[]) => void;
  setActiveProjectId: (id: string | null) => void;
  setIsExtractingPrompt: (val: boolean) => void;
  setPromptExtractorResult: (result: string) => void;
  setModelUsed: (model: string) => void;
  setBackgroundSettings: (settings: { type: 'color' | 'image'; colors: string[] }) => void;
  createProject: () => DesignProject;
  saveProject: (workspaceKey: string) => Promise<void>;
  loadProjects: (workspaceKey: string) => Promise<void>;
  deleteProject: (id: string, workspaceKey: string) => Promise<void>;
  loadProjectById: (project: DesignProject) => void;
  extractPrompt: (imageData: string, mimeType: string, customApiKey: string) => Promise<void>;
}

export const useImageStore = create<ImageStoreState>((set, get) => ({
  imgConfig: {
    imageSize: "1K",
    aspectRatio: "1:1",
    variations: 1,
    gender: "Masculino",
    positioning: "Centro",
    clothingPose: "",
    enableText: false,
    h1: "",
    h2: "",
    cta: "",
    textPosition: "Centro",
    gradient: false,
    niche: "",
    environment: "",
    useEnvRef: false,
    envColor: "Neutro",
    colorCode: "#ad8330",
    enableAmbientColor: false,
    rimLight: "Nenhuma",
    enableRimLight: false,
    compLight: "Nenhuma",
    enableCompLight: false,
    extractTypography: false,
    framing: "Plano Médio",
    floatingElements: false,
    floatingElementsDescription: "",
    sobriety: 50,
    style: "Ultra Realista",
    enableBlur: false,
    lateralGradient: false,
    noPeople: false,
    additionalPrompt: "",
    
    // Extensions
    modoCriacao: "Criativo (Padrão)",
    tipoLayout: "Social",
    textSmall: "",
    textEffect: "Nenhum",
    fontFamily: "Inter",
    age: "Adulto",
    ethnicity: "Livre",
    expression: "Natural",
    lookCamera: true,
    identityWeight: 0.8,
    ambienteCategoria: "Estúdio",
    luzPrincipalColor: "Branca",
    luzRecorteColor: "Nenhuma",
    luzCompColor: "Nenhuma",
    temperaturaLuz: "Neutra",
    horaDia: "Tarde",
    envRefWeight: 0.5,
    visualStyle: "Ultra Realista",
    efeitoGrain: false,
    efeitoBloom: false,
    efeitoLensFlare: false,
    efeitoHDR: false,
    efeitoChromaticAberration: false,
    efeitoVignette: false,
    efeitoMotionBlur: false,
    degradeDirecao: "Nenhum",
    floatElementParticles: false,
    floatElementMoney: false,
    floatElementFog: false,
    floatElementSmoke: false,
    floatElementLightning: false,
    floatElementFire: false,
    floatElementRain: false,
    floatElementSnow: false,
    floatElementConfetti: false,
    logoPosition: "Bottom Right",
    logoScale: 1,
    logoOpacity: 100,
    logoSafeArea: true,
    negativePrompt: ""
  },
  personRefs: [],
  envRefs: [],
  styleRefs: [],
  logoRefs: [],
  generatedImages: [],
  aiThought: "",
  savedCards: [],
  isGeneratingImage: false,
  generationProgress: 0,
  
  activeSubTab: 'templates',
  
  canvasImage: null,
  maskImage: null,
  brushSize: 20,
  brushMode: 'draw',
  inpaintPrompt: "",
  isInpainting: false,

  // Projects Initial State
  projects: [],
  activeProjectId: null,
  backgroundSettings: { type: 'color', colors: ['#000000', '#ffffff'] },
  isExtractingPrompt: false,
  promptExtractorResult: '',
  modelUsed: '',

  updateImgConfig: (updates) => set((state) => ({ imgConfig: { ...state.imgConfig, ...updates } })),
  setPersonRefs: (refs) => set({ personRefs: refs }),
  setEnvRefs: (refs) => set({ envRefs: refs }),
  setStyleRefs: (refs) => set({ styleRefs: refs }),
  setLogoRefs: (refs) => set({ logoRefs: refs }),

  addPersonRef: (ref) => set((state) => ({ personRefs: [...state.personRefs, ref] })),
  removePersonRef: (index) => set((state) => ({ personRefs: state.personRefs.filter((_, i) => i !== index) })),
  
  addEnvRef: (ref) => set((state) => ({ envRefs: [...state.envRefs, ref] })),
  removeEnvRef: (index) => set((state) => ({ envRefs: state.envRefs.filter((_, i) => i !== index) })),
  
  addStyleRef: (ref) => set((state) => ({ styleRefs: [...state.styleRefs, ref] })),
  removeStyleRef: (index) => set((state) => ({ styleRefs: state.styleRefs.filter((_, i) => i !== index) })),
  updateStyleRefDescription: (index, description) => set((state) => ({
    styleRefs: state.styleRefs.map((ref, i) => i === index ? { ...ref, description } : ref)
  })),

  addLogoRef: (ref) => set((state) => ({ logoRefs: [...state.logoRefs, ref] })),
  removeLogoRef: (index) => set((state) => ({ logoRefs: state.logoRefs.filter((_, i) => i !== index) })),
  updateLogoRef: (index, updates) => set((state) => ({
    logoRefs: state.logoRefs.map((logo, i) => i === index ? { ...logo, ...updates } : logo)
  })),

  setGeneratedImages: (images) => set({ generatedImages: images }),
  setAiThought: (thought) => set({ aiThought: thought }),
  setSavedCards: (cards) => set({ savedCards: cards }),
  setIsGeneratingImage: (val) => set({ isGeneratingImage: val }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  setActiveSubTab: (tab) => set({ activeSubTab: tab }),
  setCanvasImage: (imgUrl) => set({ canvasImage: imgUrl, maskImage: null, inpaintPrompt: "" }),
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushMode: (mode) => set({ brushMode: mode }),
  setInpaintPrompt: (prompt) => set({ inpaintPrompt: prompt }),
  clearCanvasState: () => set({ maskImage: null, inpaintPrompt: "" }),
  
  generateImage: async (customApiKey, backgroundSettings, aspectRatioOverride) => {
    const { imgConfig, personRefs, envRefs, styleRefs, logoRefs } = get();
    if (!checkAdminOrOpenPlan(customApiKey)) {
      openPlanModal();
      set({ isGeneratingImage: false, generationProgress: 0 });
      alert("Apenas administradores podem utilizar a geração de imagens. Assine um plano para continuar!");
      return;
    }
    set({ isGeneratingImage: true, generationProgress: 100 });
    
    try {
      const effectiveApiKey = customApiKey || localStorage.getItem('custom_gemini_api_key') || "";
      const payload = {
        imgConfig,
        backgroundSettings,
        personRefs,
        envRefs,
        styleRefs,
        logoRefs,
        customApiKey: effectiveApiKey,
        aspectRatioOverride
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(effectiveApiKey) },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 403) openPlanModal();
        throw new Error(errData.error || "Erro desconhecido na geração.");
      }

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        recordImageGeneration(data.images.length);
        set((state) => ({
          generatedImages: [...state.generatedImages, ...data.images],
          canvasImage: data.images[0], // Set generated image as canvas active
          aiThought: data.thought || state.aiThought,
          modelUsed: data.modelUsed || "Modelo de Imagem"
        }));
      } else {
        throw new Error("Nenhuma imagem retornada.");
      }
    } catch (e: any) {
      console.error("Error generating image in store:", e.message);
      throw e;
    } finally {
      set({ isGeneratingImage: false, generationProgress: 0 });
    }
  },
  
  applyInpainting: async (customApiKey) => {
    if (!checkAdminOrOpenPlan(customApiKey)) {
      openPlanModal();
      alert("Apenas administradores podem utilizar a edição de imagem. Assine um plano para continuar!");
      return;
    }
    const { canvasImage, maskImage, inpaintPrompt } = get();
    if (!canvasImage || !inpaintPrompt) {
      alert("Por favor, digite a descrição do ajuste e selecione a imagem no canvas.");
      return;
    }
    set({ isInpainting: true });
    
    try {
      const effectiveApiKey = customApiKey || localStorage.getItem('custom_gemini_api_key') || "";
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(effectiveApiKey) },
        body: JSON.stringify({
          image: canvasImage,
          mask: maskImage || null,
          prompt: inpaintPrompt,
          customApiKey: effectiveApiKey
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro na edição de Inpainting.");
      }

      const data = await response.json();
      if (data.image) {
        set((state) => ({
          generatedImages: [...state.generatedImages, data.image],
          canvasImage: data.image,
          maskImage: null,
          inpaintPrompt: ""
        }));
        alert("Inpainting aplicado com sucesso!");
      }
    } catch (e: any) {
      alert("Erro no Inpainting: " + e.message);
    } finally {
      set({ isInpainting: false });
    }
  },

  removeBackground: async () => {
    const { canvasImage } = get();
    if (!canvasImage) return;

    set({ isGeneratingImage: true });
    try {
      const response = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: canvasImage })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao remover fundo.");
      }

      const data = await response.json();
      if (data.image) {
        set((state) => ({
          generatedImages: [...state.generatedImages, data.image],
          canvasImage: data.image
        }));
        alert("Fundo removido com sucesso!");
      }
    } catch (e: any) {
      alert("Erro ao remover fundo: " + e.message);
    } finally {
      set({ isGeneratingImage: false });
    }
  },

  // Project Actions Implementation
  setProjects: (projects) => set({ projects }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setIsExtractingPrompt: (val) => set({ isExtractingPrompt: val }),
  setPromptExtractorResult: (result) => set({ promptExtractorResult: result }),
  setModelUsed: (model) => set({ modelUsed: model }),
  setBackgroundSettings: (settings) => set({ backgroundSettings: settings }),

  createProject: () => {
    const { imgConfig, backgroundSettings, personRefs, envRefs, styleRefs, logoRefs } = get();
    
    const newProject: DesignProject = {
      id: `proj_${Date.now()}`,
      name: `Projeto ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`,
      thumbnail: get().generatedImages[0] || null,
      config: JSON.parse(JSON.stringify(imgConfig)),
      backgroundSettings: JSON.parse(JSON.stringify(backgroundSettings)),
      personRefs: JSON.parse(JSON.stringify(personRefs)),
      envRefs: JSON.parse(JSON.stringify(envRefs)),
      styleRefs: JSON.parse(JSON.stringify(styleRefs)),
      logoRefs: JSON.parse(JSON.stringify(logoRefs)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({ 
      projects: [newProject, ...state.projects], 
      activeProjectId: newProject.id 
    }));
    
    // Save locally
    try {
      const stored = JSON.parse(localStorage.getItem('design_projects') || '[]');
      stored.unshift(newProject);
      safeStorageSetItem('design_projects', JSON.stringify(stored.slice(0, 15)));
    } catch (e) {
      console.warn('Failed to save new project to storage:', e);
    }

    return newProject;
  },

  saveProject: async (workspaceKey) => {
    const { 
      imgConfig, 
      backgroundSettings, 
      personRefs, 
      envRefs, 
      styleRefs, 
      logoRefs, 
      generatedImages, 
      activeProjectId, 
      projects 
    } = get();
    
    const projectId = activeProjectId || `proj_${Date.now()}`;
    const thumbnail = generatedImages[generatedImages.length - 1] || null;
    
    const projectData: DesignProject = {
      id: projectId,
      name: projects.find(p => p.id === projectId)?.name || `Projeto ${new Date().toLocaleDateString('pt-BR')}`,
      thumbnail: thumbnail,
      config: imgConfig,
      backgroundSettings,
      personRefs,
      envRefs,
      styleRefs,
      logoRefs,
      createdAt: projects.find(p => p.id === projectId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('design_projects') || '[]');
      const idx = stored.findIndex((p: any) => p.id === projectId);
      
      if (idx >= 0) {
        stored[idx] = projectData;
      } else {
        stored.unshift(projectData);
      }
      
      safeStorageSetItem('design_projects', JSON.stringify(stored.slice(0, 15)));
      
      set((state) => {
        const updatedProjects = [...state.projects];
        const pIdx = updatedProjects.findIndex(p => p.id === projectId);
        if (pIdx >= 0) {
          updatedProjects[pIdx] = projectData;
        } else {
          updatedProjects.unshift(projectData);
        }
        return { 
          projects: updatedProjects,
          activeProjectId: projectId
        };
      });

      console.log('Projeto salvo localmente com sucesso!');
    } catch (e) {
      console.error('Save project error:', e);
    }
  },

  loadProjects: async (workspaceKey) => {
    try {
      const stored = JSON.parse(localStorage.getItem('design_projects') || '[]');
      set({ projects: Array.isArray(stored) ? stored : [] });
    } catch (e) {
      console.error('Load projects error:', e);
      set({ projects: [] });
    }
  },

  deleteProject: async (id, workspaceKey) => {
    try {
      const stored = JSON.parse(localStorage.getItem('design_projects') || '[]');
      const filtered = Array.isArray(stored) ? stored.filter((p: any) => p.id !== id) : [];
      safeStorageSetItem('design_projects', JSON.stringify(filtered));
      
      set((state) => ({ 
        projects: state.projects.filter(p => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
      }));
    } catch (e) {
      console.error('Delete project error:', e);
    }
  },

  loadProjectById: (project) => {
    set({
      imgConfig: JSON.parse(JSON.stringify(project.config)),
      backgroundSettings: JSON.parse(JSON.stringify(project.backgroundSettings || { type: 'color', colors: ['#000000', '#ffffff'] })),
      personRefs: JSON.parse(JSON.stringify(project.personRefs || [])),
      envRefs: JSON.parse(JSON.stringify(project.envRefs || [])),
      styleRefs: JSON.parse(JSON.stringify(project.styleRefs || [])),
      logoRefs: JSON.parse(JSON.stringify(project.logoRefs || [])),
      activeProjectId: project.id,
      generatedImages: project.thumbnail ? [project.thumbnail] : [],
      canvasImage: project.thumbnail || null,
    });
  },

  extractPrompt: async (imageData, mimeType, customApiKey) => {
    if (!checkAdminOrOpenPlan(customApiKey)) {
      openPlanModal();
      alert("Apenas administradores podem extrair prompts. Assine um plano para continuar!");
      return;
    }
    set({ isExtractingPrompt: true, promptExtractorResult: '' });
    try {
      const effectiveApiKey = customApiKey || localStorage.getItem('custom_gemini_api_key') || "";
      const response = await fetch('/api/extract-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(effectiveApiKey) },
        body: JSON.stringify({ imageData, mimeType, customApiKey: effectiveApiKey }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro na extração.');
      }
      
      const data = await response.json();
      if (data.prompt) {
        set({ promptExtractorResult: data.prompt });
      } else {
        throw new Error('Nenhum prompt retornado.');
      }
    } catch (e: any) {
      set({ promptExtractorResult: `Erro: ${e.message}` });
      alert("Erro ao extrair prompt: " + e.message);
    } finally {
      set({ isExtractingPrompt: false });
    }
  }
}));
