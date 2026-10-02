import { ORION_PINTEREST_CARDS } from "../data/orionPinterestData";
import { COMMUNITY_CARDS } from "../data/communityData";
/**
 * @license
 * Design Builder Studio 1:1 - Modular Core Hub & Canvas
 * Integrates DesignBuilderVitrine, OrionProBuilder, DesignBuilderFormOfficial,
 * HydraBuilder, AlteraFacilBuilder, RefBuilder, EnhanceBuilder,
 * ProjetosManager, GaleriaManager, ComunidadeManager, DesignBuilderAppsHub
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useGenerateImage } from "../hooks/useGenerateImage";
import { downloadImage } from "../utils/downloadImage";
import { checkAdminOrOpenPlan, getAuthHeaders, openPlanModal } from "../utils/userAuth";

// Modular App Builders & Hubs
import { DesignBuilderHome } from "./DesignBuilderHome";
import { DesignBuilderVitrine } from "./DesignBuilderVitrine";
import { DesignBuilderAppsHub } from "./DesignBuilderAppsHub";
import { OrionProBuilder } from "./OrionProBuilder";
import { DesignBuilderFormOfficial } from "./DesignBuilderFormOfficial";
import HydraBuilder from "./HydraBuilder";
import AlteraFacilBuilder from "./AlteraFacilBuilder";
import { RefBuilder } from "./RefBuilder";
import EnhanceBuilder from "./EnhanceBuilder";
import GenerationLoadingCanvas from "./GenerationLoadingCanvas";
import ImageCropModal from "./ImageCropModal";
import ReportModal from "./ReportModal";
import ProjetosManager from "./ProjetosManager";
import { DesignBuilderAssistant } from "./DesignBuilderAssistant";
import { CreditsModal } from "./CreditsModal";
import ComunidadeDetailModal from "./ComunidadeDetailModal";
import GaleriaManager from "./GaleriaManager";
import ComunidadeManager from "./ComunidadeManager";
import { MagicRefineBar } from "./MagicRefineBar";
import { AdminSubscribersModal } from "./AdminSubscribersModal";
import { DesignBuilderSidebar } from "./DesignBuilderSidebar";

import {
  Search,
  Sparkles,
  Zap,
  Coins,
  Flag,
  RotateCcw,
  Heart,
  Share2,
  Maximize2,
  Download,
  Image as ImageIcon,
  Plus,
  X,
  Trash2,
  Save,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Shield,
  HelpCircle,
  Layers,
  BookOpen,
  Eye,
  Sliders,
  User,
  SlidersHorizontal,
  FolderOpen,
  Home,
  LayoutGrid,
  Globe,
  RefreshCw,
  Paperclip,
  Send,
  Loader2,
  FileText,
  Type,
  Palette,
  Clock,
  Mountain,
  Settings
} from "lucide-react";

interface DesignBuilderProps {
  customApiKey?: string;
  myProfile?: any;
  onNavigateTab?: (tab: string) => void;
  activeMainTab?: string;
  userEmail?: string;
  userName?: string;
  userTokens?: number;
}

export default function DesignBuilder({
  customApiKey,
  myProfile,
  onNavigateTab,
  activeMainTab,
  userEmail = "usuario@zion.ai",
  userName = "Usuário",
  userTokens = 97
}: DesignBuilderProps) {
  const store = useProjectStore();

  const realCredits = (() => {
    try {
      const s = localStorage.getItem("zion_real_credits");
      if (s !== null && !isNaN(Number(s)) && Number(s) > 100) return Number(s);
    } catch(_) {}
    return typeof userTokens === "number" && userTokens > 100 && userTokens !== 999999 ? userTokens : 6612;
  })();

  // Helper function to detect agent from URL
  const detectAgentFromUrl = (): string => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const agentParam = new URLSearchParams(window.location.search).get("agent");
      if (p === "/hydra" || p === "/agent/hydra" || agentParam === "hydra") return "hydra";
      if (p === "/enhance-builder" || p === "/enhance" || p === "/agent/enhance-builder" || p === "/agent/enhance" || agentParam === "enhance-builder" || agentParam === "enhance") return "enhance-builder";
      if (p === "/altera-facil" || p === "/agent/altera-facil" || agentParam === "altera-facil") return "altera-facil";
      if (p === "/ref" || p === "/agent/ref" || agentParam === "ref") return "ref";
      if (p === "/orion-pro" || p === "/orion" || p === "/agent/orion-pro" || p === "/agent/orion" || agentParam === "orion-pro" || agentParam === "orion") return "orion-pro";
      if (p === "/agent/design-builder1-2" || p === "/design-builder" || agentParam === "design-builder" || agentParam === "design-builder1-2") return "design-builder1-2";
    }
    return "design-builder1-2";
  };

  const detectIsHomeFromUrl = (): boolean => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/" || p === "" || p === "/home") return true;
    }
    return false;
  };

  const detectIsAppsFromUrl = (): boolean => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      const search = new URLSearchParams(window.location.search);
      if (p === "/apps" || p === "/todos-os-apps" || search.get("vitrine") === "true") return true;
    }
    return false;
  };

  const detectPalcoModeFromUrl = (): string => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/" || p === "" || p === "/home") return "home";
      if (p === "/apps" || p === "/todos-os-apps") return "apps";
      if (p === "/projetos" || p === "/projects") return "projetos";
      if (p === "/community" || p === "/comunidade") return "comunidade";
      if (p === "/gallery" || p === "/galeria") return "galeria";
      if (p === "/pinterest") return "pinterest";
    }
    return "builder";
  };

  // Main UI routing states
  const [isHomeOpen, setIsHomeOpen] = useState<boolean>(detectIsHomeFromUrl);
  const [isAppsOpen, setIsAppsOpen] = useState<boolean>(detectIsAppsFromUrl);
  const [isVitrineOpen, setIsVitrineOpen] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<string>(detectAgentFromUrl);
  const [activePalcoMode, setActivePalcoMode] = useState<string>(detectPalcoModeFromUrl);
  const [studioPalcoTab, setStudioPalcoTab] = useState<"builder" | "pinterest" | "comunidade" | "galeria">("builder");
  const [pinterestSearch, setPinterestSearch] = useState<string>("");

  // Modals & Popovers
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [cropOnDone, setCropOnDone] = useState<((url: string) => void) | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);
  const [isAdminSubscribersOpen, setIsAdminSubscribersOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isGuiaModalOpen, setIsGuiaModalOpen] = useState<boolean>(false);
  const [isAvisosOpen, setIsAvisosOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState<boolean>(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [isLinksOpen, setIsLinksOpen] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<string | null>(null);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState<boolean>(false);
  const [isMobileNavCollapsed, setIsMobileNavCollapsed] = useState<boolean>(false);

  // Navegação suave e precisa entre seções/categorias do formulário no celular
  const handleSelectMobileCategory = useCallback((cat: string) => {
    let willOpen = true;
    setMobileActiveCategory((prev) => {
      const isCurrentActive =
        prev === cat ||
        (cat === "principal" && (prev === "principal" || prev === "sujeito")) ||
        (cat === "sujeito" && (prev === "principal" || prev === "sujeito")) ||
        (cat === "marca" && (prev === "marca" || prev === "marca_estilo" || prev === "cores")) ||
        (cat === "cenario" && (prev === "cenario" || prev === "contexto")) ||
        (cat === "ajustes" && (prev === "ajustes" || prev === "composicao")) ||
        (cat === "configuracoes" && (prev === "configuracoes" || prev === "config" || prev === "prompt"));

      if (isCurrentActive) {
        willOpen = false;
        return null;
      }
      return cat;
    });

    if (!willOpen) {
      return;
    }

    setStudioPalcoTab("builder");
    setIsMobileHistoryOpen(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agent:category_jump", { detail: { category: cat } }));
    }

    const candidateIds = [
      `section-${cat}`,
      cat === "marca" ? "section-marca_estilo" : "",
      cat === "marca" ? "section-cores" : "",
      cat === "marca_estilo" ? "section-marca" : "",
      cat === "cores" ? "section-marca" : "",
      cat === "cores" ? "section-marca_estilo" : "",
      cat === "cenario" ? "section-contexto" : "",
      cat === "contexto" ? "section-cenario" : "",
      cat === "principal" ? "section-sujeito" : "",
      cat === "sujeito" ? "section-principal" : "",
      cat === "texto" ? "section-texto_imagem" : "",
      cat === "texto_imagem" ? "section-texto" : "",
      cat === "ajustes" ? "section-composicao" : "",
      cat === "composicao" ? "section-ajustes" : "",
      cat === "configuracoes" ? "section-prompt" : "",
      cat === "config" ? "section-configuracoes" : "",
      cat === "prompt" ? "section-configuracoes" : ""
    ].filter(Boolean);

    const performScroll = () => {
      let targetEl: HTMLElement | null = null;
      for (const id of candidateIds) {
        const found = document.getElementById(id);
        if (found) {
          targetEl = found;
          break;
        }
      }
      if (!targetEl) {
        const aliasMap: Record<string, string> = {
          principal: "principal",
          sujeito: "principal",
          marca: "marca_estilo",
          marca_estilo: "marca_estilo",
          cores: "marca_estilo",
          cenario: "cenario",
          contexto: "contexto",
          texto: "texto_imagem",
          texto_imagem: "texto_imagem",
          ajustes: "ajustes",
          composicao: "ajustes",
          configuracoes: "configuracoes",
          config: "configuracoes",
          prompt: "configuracoes"
        };
        const alias = aliasMap[cat];
        if (alias) {
          targetEl = document.querySelector(`[data-section-alias="${alias}"]`) as HTMLElement;
        }
      }
      if (!targetEl) {
        const tourMap: Record<string, string> = {
          sujeito: "form-sec-subject",
          principal: "form-sec-principal",
          marca: "form-sec-marca_estilo",
          cenario: "form-sec-cenario",
          contexto: "form-sec-context",
          texto: "form-sec-texto_imagem",
          cores: "form-sec-advanced",
          ajustes: "form-sec-ajustes",
          composicao: "form-sec-style",
          configuracoes: "form-sec-configuracoes",
          prompt: "form-sec-step_1773770939424_4"
        };
        const tour = tourMap[cat];
        if (tour) {
          targetEl = document.querySelector(`[data-tour="${tour}"]`) as HTMLElement;
        }
      }

      if (targetEl) {
        const aside = document.querySelector('.agent-form-col') || document.querySelector('[data-aside-form-col]') || targetEl.closest('aside') || targetEl.closest('form');
        if (aside && aside.scrollHeight > aside.clientHeight) {
          const asideRect = aside.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();
          const offsetTop = targetRect.top - asideRect.top + aside.scrollTop - 14;
          aside.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
        } else {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    // Chamadas em múltiplos frames para acompanhar a expansão CSS do grid no celular
    requestAnimationFrame(performScroll);
    setTimeout(performScroll, 60);
    setTimeout(performScroll, 180);
    setTimeout(performScroll, 320);
  }, []);

  // Listener para alternar entre Palco e Formulário via eventos de cabeçalho
  useEffect(() => {
    const handleToggleMobileView = (e: any) => {
      if (e.detail?.view === "palco") {
        setMobileActiveCategory(null);
      } else if (e.detail?.view === "form") {
        handleSelectMobileCategory("sujeito");
      }
    };
    window.addEventListener("agent:toggle_mobile_view", handleToggleMobileView);
    return () => window.removeEventListener("agent:toggle_mobile_view", handleToggleMobileView);
  }, [handleSelectMobileCategory]);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // History of BFF generations for instant reuse
  const [bffGenerations, setBffGenerations] = useState<any[]>([]);
  const fetchBffGenerations = async () => {
    try {
      const res = await fetch("/api/bff/api/generations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setBffGenerations(data.items);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchBffGenerations();
  }, []);

  // Initial projects initialization
  useEffect(() => {
    store.initProjectsList();
  }, []);

  // Popstate sync for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const search = new URLSearchParams(window.location.search);
      if (p === "/admin" || p === "/auditoria" || search.get("admin") === "true") {
        onNavigateTab?.("admin");
        return;
      }
      if (p === "/" || p === "" || p === "/home") {
        setIsHomeOpen(true);
        setIsAppsOpen(false);
        setIsVitrineOpen(false);
        setActivePalcoMode("home");
      } else if (p === "/apps" || p === "/todos-os-apps" || p === "/vitrine") {
        setIsHomeOpen(false);
        setIsAppsOpen(true);
        setIsVitrineOpen(false);
        setActivePalcoMode("apps");
      } else if (p === "/projetos" || p === "/projects") {
        setIsHomeOpen(false);
        setIsAppsOpen(false);
        setIsVitrineOpen(false);
        setActivePalcoMode("projetos");
      } else if (p === "/community" || p === "/comunidade") {
        setIsHomeOpen(false);
        setIsAppsOpen(false);
        setIsVitrineOpen(false);
        setActivePalcoMode("comunidade");
      } else if (p === "/gallery" || p === "/galeria") {
        setIsHomeOpen(false);
        setIsAppsOpen(false);
        setIsVitrineOpen(false);
        setActivePalcoMode("galeria");
      } else if (p === "/pinterest") {
        setIsHomeOpen(false);
        setIsAppsOpen(false);
        setIsVitrineOpen(false);
        setActivePalcoMode("pinterest");
      } else if (p.startsWith("/agent/") || p === "/orion-pro" || p === "/hydra" || p === "/ref" || p === "/enhance-builder" || p === "/altera-facil" || p === "/enhance") {
        setIsHomeOpen(false);
        setIsAppsOpen(false);
        setIsVitrineOpen(false);
        const ag = detectAgentFromUrl();
        setSelectedAgent(ag);
        setActivePalcoMode("builder");
      }
    };
    const handleGoHome = () => {
      setIsHomeOpen(true);
      setIsAppsOpen(false);
      setIsVitrineOpen(false);
      setActivePalcoMode("home");
      if (onNavigateTab) {
        onNavigateTab("home");
      }
      if (typeof window !== "undefined") {
        window.history.pushState({ path: "/" }, "", "/");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    const handleOpenApps = () => {
      setIsHomeOpen(false);
      setIsAppsOpen(true);
      setIsVitrineOpen(false);
      setActivePalcoMode("apps");
      if (onNavigateTab) {
        onNavigateTab("apps");
      }
      if (typeof window !== "undefined") {
        window.history.pushState({ path: "/apps" }, "", "/apps");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    const handleOpenVitrine = handleGoHome;
    const handleOpenStudio = (e: any) => {
      setIsHomeOpen(false);
      setIsAppsOpen(false);
      setIsVitrineOpen(false);
      const agent = typeof e === "string" ? e : (e?.detail?.agent || "design-builder1-2");
      handleSwitchAgent(agent);
    };
    const handleOpenGallery = () => {
      setIsHomeOpen(false);
      setIsAppsOpen(false);
      setIsVitrineOpen(false);
      setActivePalcoMode("galeria");
      if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
    };
    const handleOpenCommunity = () => {
      setIsHomeOpen(false);
      setIsAppsOpen(false);
      setIsVitrineOpen(false);
      setActivePalcoMode("comunidade");
      if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
    };
    const handleOpenProjects = () => {
      setIsHomeOpen(false);
      setIsAppsOpen(false);
      setIsVitrineOpen(false);
      setActivePalcoMode("projetos");
      if (typeof window !== "undefined") window.history.pushState({ path: "/projetos" }, "", "/projetos");
    };

    const handleOpenAdmin = () => {
      const email = (userEmail || (typeof window !== "undefined" ? localStorage.getItem("zion_user_email") || "" : "")).toLowerCase().trim();
      if (email === "der.contatos@gmail.com") {
        setIsAdminSubscribersOpen(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("db:go_home", handleGoHome);
    window.addEventListener("db:open_vitrine", handleGoHome);
    window.addEventListener("db:open_apps", handleOpenApps);
    window.addEventListener("db:open_studio", handleOpenStudio);
    window.addEventListener("db:open_gallery", handleOpenGallery);
    window.addEventListener("db:open_community", handleOpenCommunity);
    window.addEventListener("db:open_projects", handleOpenProjects);
    window.addEventListener("db:open_admin", handleOpenAdmin);
    window.addEventListener("open-admin-subscribers", handleOpenAdmin);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("db:go_home", handleGoHome);
      window.removeEventListener("db:open_vitrine", handleGoHome);
      window.removeEventListener("db:open_apps", handleOpenApps);
      window.removeEventListener("db:open_studio", handleOpenStudio);
      window.removeEventListener("db:open_gallery", handleOpenGallery);
      window.removeEventListener("db:open_community", handleOpenCommunity);
      window.removeEventListener("db:open_projects", handleOpenProjects);
      window.removeEventListener("db:open_admin", handleOpenAdmin);
      window.removeEventListener("open-admin-subscribers", handleOpenAdmin);
    };
  }, [onNavigateTab, userEmail]);

  // Scroll to selected category section on mobile
  useEffect(() => {
    if (!mobileActiveCategory) return;
    const catMap: Record<string, string> = {
      sujeito: '[data-tour="form-sec-subject"]',
      contexto: '[data-tour="form-sec-context"]',
      texto: '[data-tour="form-sec-step_1773771934403_6"]',
      cores: '[data-tour="form-sec-advanced"]',
      composicao: '[data-tour="form-sec-style"]',
      prompt: '[data-tour="form-sec-step_1773770939424_4"]',
    };
    const selector = catMap[mobileActiveCategory];
    if (!selector) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [mobileActiveCategory]);

  // Active image in gallery
  const activeImage = store.galeriaImages?.[store.activeImageIndex] || null;

  // Real-time timer during generation
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [genProgress, setGenProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Iniciando conexão com os servidores de IA...");

  useEffect(() => {
    let timer: any;
    if (store.isGenerating && store.activeProjectId) {
      const is4K = store.resolucao === "4K";
      const is2K = store.resolucao === "2K";
      const expectedTime = is4K ? 45 : is2K ? 25 : 15;

      const updateProgress = () => {
        const startTime = store.projectGenerationStartTimes?.[store.activeProjectId!] || Date.now();
        const sec = Math.max(0, (Date.now() - startTime) / 1000);
        setElapsedSeconds(sec);

        let p = 0;
        if (sec < expectedTime) {
          p = (sec / expectedTime) * 95;
        } else {
          p = 95 + (1 - Math.exp(-(sec - expectedTime) / 8)) * 4;
        }
        setGenProgress(Math.min(99, Math.floor(p)));

        if (sec < 3) setStatusMessage("Iniciando conexão com os servidores de IA...");
        else if (sec < 7) setStatusMessage("Analisando fotos de referência do sujeito e layout...");
        else if (sec < 12) setStatusMessage("Sintetizando iluminação, profundidade 3D e texturas...");
        else if (sec < 18) setStatusMessage("Escrevendo tipografia de alta definição e degradês...");
        else setStatusMessage(is4K ? "Aprimorando nitidez para resolução máxima 4K (Ultra HD)..." : "Finalizando renderização e otimizando canais de cor...");
      };

      updateProgress();
      timer = setInterval(updateProgress, 100);
    } else {
      setElapsedSeconds(0);
      setGenProgress(0);
    }
    return () => clearInterval(timer);
  }, [store.isGenerating, store.activeProjectId, store.resolucao, store.projectGenerationStartTimes]);

  // Hook for image generation
  const { generatePremiumImage, isGenerating } = useGenerateImage(
    customApiKey,
    showToast,
    () => {},
    (newImg) => {
      fetchBffGenerations();
    },
    (err) => {
      console.error("Erro na geração:", err);
    }
  );

  // Manual explicit project save handler
  const handleManualSaveProject = () => {
    try {
      const currentId = store.activeProjectId || (store.projectsList[0] ? store.projectsList[0].id : "proj_aba_1");
      const currentConfigSnapshot: any = {
        selectedModel: store.selectedModel,
        dimensao: store.dimensao,
        clientId: store.clientId,
        promptSujeito: store.promptSujeito,
        sujeitoBase64: store.sujeitoBase64,
        cenarioBase64: store.cenarioBase64,
        cores: store.cores,
        useDominantColors: store.useDominantColors,
        degradeLeitura: store.degradeLeitura,
        composicao: store.composicao,
        estilosVisuais: store.estilosVisuais,
        resolucao: store.resolucao,
        qualidade: store.qualidade,
        formatoExportacao: store.formatoExportacao,
        gender: store.gender,
        genero: store.genero,
        positioning: store.positioning,
        poseDescription: store.poseDescription,
        promptCenario: store.promptCenario,
        camadasTexto: store.camadasTexto,
        typographyPosition: store.typographyPosition,
        referenciasEstilo: store.referenciasEstilo,
        nivelCriativo: store.nivelCriativo,
        floatingElementsMode: store.floatingElementsMode,
        floatingElementsCustom: store.floatingElementsCustom,
        nicho: store.nicho,
        additionalPrompt: store.additionalPrompt,
        enableBlur: store.enableBlur,
        sujeitosBase64List: store.sujeitosBase64List,
        cenariosBase64List: store.cenariosBase64List
      };

      const updated = store.projectsList.map((p) => {
        if (p.id === currentId) {
          return { ...p, config: { ...(p.config || {}), ...currentConfigSnapshot } };
        }
        return p;
      });

      localStorage.setItem("zion_project_list_v5_full", JSON.stringify(updated));
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
      showToast("💾 Projeto e referências salvos com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao salvar projeto:", err);
      showToast("Não foi possível salvar o projeto.", "error");
    }
  };

  // Magic Refine Bar State & Handlers
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineAttachedFiles, setRefineAttachedFiles] = useState<{ name: string; url: string }[]>([]);
  const refineFileInputRef = useRef<HTMLInputElement>(null);
  const refineTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRefineFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setRefineAttachedFiles((prev) => [
            ...prev,
            { name: file.name, url: String(reader.result) }
          ]);
        };
        reader.readAsDataURL(file);
      });
      showToast(`${files.length} imagem(ns) anexada(s) ao ajuste!`, "info");
    }
  };

  const handleSendRefinement = async () => {
    const prompt = refinePrompt.trim();
    if (!prompt || isRefining) return;

    setIsRefining(true);
    store.setIsGenerating(true);
    showToast("✨ Enviando instrução de ajuste para a IA...", "info");

    try {
      const activeGenId = store.lastGeneratedId || store.activeProjectId;
      const response = await fetch("/api/bff/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          generation_id: activeGenId,
          agent_slug: selectedAgent || "orion-pro",
          image: activeImage
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao processar solicitação de ajuste.");
      }

      const resData = await response.json();
      const newGenId = resData.generation_id;

      if (!newGenId) {
        throw new Error("ID de refinamento não retornado.");
      }

      let completed = false;
      const sse = new EventSource(`/api/bff/api/generations/${newGenId}/stream`);

      const finishSuccess = (resultUrl: string) => {
        if (completed) return;
        completed = true;
        sse.close();
        setIsRefining(false);
        store.setIsGenerating(false);
        setRefinePrompt("");
        setRefineAttachedFiles([]);
        store.setLastGeneratedId(newGenId);
        store.setGaleriaImages([resultUrl, ...(store.galeriaImages || [])]);
        store.addGaleriaImage(resultUrl, { app: "design-builder" });
        store.setActiveImageIndex(0);
        if (store.activeProjectId) {
          store.addImagesToProjectGallery(store.activeProjectId, [resultUrl]);
        }
        showToast("✨ Arte ajustada com sucesso!", "success");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: resultUrl } }));
        }
      };

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === "done" && data.result_url) {
            finishSuccess(data.result_url);
          } else if (data.status === "error") {
            sse.close();
            setIsRefining(false);
            store.setIsGenerating(false);
            showToast(data.message || "Erro durante o ajuste.", "error");
          }
        } catch (_) {}
      };

      sse.onerror = () => {
        sse.close();
        let pollCount = 0;
        const interval = setInterval(async () => {
          if (completed || pollCount > 40) {
            clearInterval(interval);
            if (!completed) {
              setIsRefining(false);
              store.setIsGenerating(false);
            }
            return;
          }
          pollCount++;
          try {
            const pollRes = await fetch(`/api/bff/api/generations/${newGenId}/status`);
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              if (pollData.status === "done" && pollData.result_url) {
                clearInterval(interval);
                finishSuccess(pollData.result_url);
              }
            }
          } catch (_) {}
        }, 3000);
      };
    } catch (err: any) {
      console.error("Erro ao refinar:", err);
      setIsRefining(false);
      store.setIsGenerating(false);
      showToast(err?.message || "Erro ao conectar com o servidor.", "error");
    }
  };

  // Reutilizar configuracoes instantaneamente a partir de qualquer imagem
  const handleReuseGeneration = async (imageUrlOrItem: any) => {
    try {
      let fd: any = null;
      let inputUrls: any = null;

      if (imageUrlOrItem && typeof imageUrlOrItem === "object" && imageUrlOrItem.form_data) {
        fd = imageUrlOrItem.form_data;
        inputUrls = imageUrlOrItem.input_image_urls || fd.saved_files || fd.input_image_urls || {};
      } else {
        const itemUrl = typeof imageUrlOrItem === "string" ? imageUrlOrItem : (imageUrlOrItem?.url || imageUrlOrItem?.result_url || imageUrlOrItem?.thumbnail_url);
        if (!itemUrl) {
          showToast("Nenhuma imagem selecionada para reutilizar.", "info");
          return;
        }

        let foundEntry: any = bffGenerations.find((g: any) =>
          g.result_url === itemUrl ||
          g.thumbnail_url === itemUrl ||
          (g.id && itemUrl.includes(g.id))
        );

        if (!foundEntry) {
          const match = itemUrl.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|\d{13}_[a-z0-9]+)/i);
          const jobId = match ? match[1] : null;
          if (jobId) {
            try {
              const detailRes = await fetch(`/api/bff/api/generations/${jobId}/detail`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData) {
                  foundEntry = {
                    id: jobId,
                    form_data: detailData.form_data || detailData.inputs?.parameters || {},
                    inputs: detailData.inputs || {},
                    input_image_urls: detailData.input_image_urls || {}
                  };
                }
              }
            } catch (_) {}
          }
        }

        if (!foundEntry) {
          showToast("Buscando configurações da arte...", "info");
        }

        fd = foundEntry?.form_data || foundEntry?.inputs?.parameters || {};
        inputUrls = foundEntry?.input_image_urls || foundEntry?.inputs || fd.saved_files || {};
      }

      if (!fd || Object.keys(fd).length === 0) {
        showToast("Não foi possível localizar as configurações salvas desta arte.", "info");
        return;
      }

      const targetDim = fd.dimensions || fd.dimensao || "4:5";
      const targetQuality = fd.quality || fd.resolucao || "1K";

      let newCamadas = store.camadasTexto;
      if (Array.isArray(fd.text_blocks) && fd.text_blocks.length > 0) {
        newCamadas = fd.text_blocks.map((b: any, bIdx: number) => ({
          id: `blk_reuse_${Date.now()}_${bIdx}`,
          conteudo: b.content || b.text || "",
          funcao: (b.type === "h1" ? "Headline Principal" : b.type === "h2" ? "Subheadline Secundário" : b.type === "cta" ? "CTA Botão" : b.type === "bullets" ? "Lista de Benefícios" : "Corpo Descrição") as any,
          tipoBloco: (b.type === "h1" ? "H1" : b.type === "h2" ? "H2" : b.type === "cta" ? "CTA" : b.type === "bullets" ? "Bullets" : "Texto") as any,
          pesoVisual: Number(b.weight) || (b.type === "h1" ? 5 : b.type === "h2" ? 3 : b.type === "cta" ? 4 : 2),
          fonte: "Montserrat",
          cor: b.color || "#ffffff",
          posicao: b.position || "middle-center"
        }));
      }

      let typoPos = "Centro";
      const rawTypo = (fd.posicao_do_texto || "").toLowerCase();
      if (rawTypo.includes("left") || rawTypo.includes("esq")) typoPos = "Esquerda";
      else if (rawTypo.includes("right") || rawTypo.includes("dir")) typoPos = "Direita";

      let pos = "Centro";
      const rawPos = (fd.subject_position || "").toLowerCase();
      if (rawPos === "right" || rawPos === "direita") pos = "Direita";
      else if (rawPos === "left" || rawPos === "esquerda") pos = "Esquerda";
      else if (typoPos === "Esquerda") pos = "Direita";
      else if (typoPos === "Direita") pos = "Esquerda";

      const gen = fd.genero === "female" || fd.gender === "Feminino" ? "Feminino" : "Masculino";

      const extractUrls = (val: any): string[] => {
        if (!val) return [];
        if (typeof val === "string") return [val];
        if (Array.isArray(val)) {
          return val.map((item: any) => (typeof item === "string" ? item : item?.url)).filter(Boolean);
        }
        if (typeof val === "object" && Array.isArray(val.urls)) {
          return val.urls.map((u: any) => (typeof u === "string" ? u : u?.url)).filter(Boolean);
        }
        return [];
      };

      const updates: Partial<any> = {
        dimensao: targetDim,
        resolucao: targetQuality,
        qualidade: targetQuality,
        gender: gen,
        genero: gen === "Feminino" ? "female" : "male",
        positioning: pos,
        poseDescription: fd.subject_description || "",
        promptCenario: fd.scene_description || "",
        additionalPrompt: fd.prompt_adicional || "",
        nicho: fd.nicho_projeto || "",
        composicao: fd.plano || "medium",
        floatingElementsMode: fd.elementos_flutuantes ? "custom" : "off",
        floatingElementsCustom: typeof fd.elementos_flutuantes === "string" && fd.elementos_flutuantes !== "__enabled__" ? fd.elementos_flutuantes : "",
        elementosFlutuantes: !!fd.elementos_flutuantes,
        enableBlur: fd.usar_desfoque_blur === true || fd.usar_desfoque_blur === "true",
        degradeLeitura: fd.degrade === true || fd.degrade === "true",
        typographyPosition: typoPos,
        nivelCriativo: Number(fd.sobriedade_criatividade || 50),
        camadasTexto: newCamadas,
        lastLoadedAt: Date.now()
      };

      if (fd.color_palette) {
        updates.cores = {
          ambiente: fd.color_palette.ambient_color || "#ca00e5",
          complementar: fd.color_palette.complementary_light || "#e85700",
          recorte: fd.color_palette.complementary_color || "#39ed53",
          paleta: [
            fd.color_palette.ambient_color || "#ca00e5",
            fd.color_palette.complementary_light || "#e85700",
            fd.color_palette.complementary_color || "#39ed53"
          ]
        };
      }

      // 1. Restaurar Logo / Identidade de Marca
      const logoUrls = [
        ...extractUrls(inputUrls?.brand_identity_images),
        ...extractUrls(fd.brand_identity_images),
        ...extractUrls(fd.saved_files?.brand_identity_images)
      ];
      if (logoUrls.length > 0) {
        updates.logoBase64 = logoUrls[0];
        updates.logosList = logoUrls;
        updates.useLogo = true;
      }

      // 2. Restaurar Sujeito / Fotos do Produto
      const subjectUrls = [
        ...extractUrls(inputUrls?.fotos_do_sujeito_produto),
        ...extractUrls(fd.fotos_do_sujeito_produto),
        ...extractUrls(fd.saved_files?.fotos_do_sujeito_produto)
      ];
      if (subjectUrls.length > 0) {
        updates.sujeitoBase64 = subjectUrls[0];
        updates.sujeitosBase64List = subjectUrls;
      }

      // 3. Restaurar Cenário / Referências de Ambiente
      const ambientUrls = [
        ...extractUrls(inputUrls?.referencias_de_ambiente),
        ...extractUrls(fd.referencias_de_ambiente),
        ...extractUrls(fd.saved_files?.referencias_de_ambiente)
      ];
      if (ambientUrls.length > 0) {
        updates.cenarioBase64 = ambientUrls[0];
        updates.cenariosBase64List = ambientUrls;
        updates.useEnvRef = true;
      }

      // 4. Restaurar Referências de Estilo
      const styleUrls = [
        ...extractUrls(inputUrls?.referencias_de_estilo),
        ...extractUrls(fd.referencias_de_estilo),
        ...extractUrls(fd.saved_files?.referencias_de_estilo)
      ];
      if (styleUrls.length > 0) {
        updates.referenciasEstilo = styleUrls.map((url, i) => ({
          id: `estilo_reuse_${i}`,
          data: url,
          url,
          descricao: "estilo"
        }));
      }

      store.updateConfig(updates);
      setActivePalcoMode("builder");
      setStudioPalcoTab("builder");
      setIsVitrineOpen(false);
      showToast("✨ Configurações e imagens da geração reutilizadas no formulário!", "success");
    } catch (err) {
      console.error("Erro ao reutilizar configurações:", err);
      showToast("Não foi possível reutilizar as configurações desta arte.", "error");
    }
  };

  // Switch agent helper
  const handleSwitchAgent = (agentSlug: string) => {
    let clean = agentSlug || "design-builder1-2";
    if (clean === "design-builder") clean = "design-builder1-2";
    if (clean === "enhance") clean = "enhance-builder";
    if (clean === "product-builder-v2") clean = "hydra";
    if (clean === "ref-builder") clean = "ref";

    setSelectedAgent(clean);
    setIsVitrineOpen(false);
    setActivePalcoMode("builder");

    if (typeof window !== "undefined") {
      const targetUrl = clean === "design-builder1-2" ? "/agent/design-builder1-2" : clean === "ref" ? "/agent/ref" : `/${clean}`;
      window.history.pushState({ path: targetUrl }, "", targetUrl);
    }
    showToast(`Iniciando ${clean === "orion-pro" ? "Órion Pro" : clean === "design-builder1-2" ? "Zion Design" : clean}...`, "success");
  };

  // Open Home (Dashboard)
  const handleGoHome = () => {
    setIsHomeOpen(true);
    setIsAppsOpen(false);
    setIsVitrineOpen(false);
    setActivePalcoMode("home");
    if (onNavigateTab) {
      onNavigateTab("ai-tools");
    }
    if (typeof window !== "undefined") {
      window.history.pushState({ path: "/" }, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Open Apps (6 Agents Showcase)
  const handleOpenApps = () => {
    setIsHomeOpen(false);
    setIsAppsOpen(true);
    setIsVitrineOpen(false);
    setActivePalcoMode("apps");
    if (onNavigateTab) {
      onNavigateTab("ai-tools");
    }
    if (typeof window !== "undefined") {
      window.history.pushState({ path: "/apps" }, "", "/apps");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenVitrine = handleGoHome;

  // Open Studio
  const handleOpenStudio = (agentSlug?: string) => {
    setIsHomeOpen(false);
    setIsAppsOpen(false);
    setIsVitrineOpen(false);
    setActivePalcoMode("builder");
    handleSwitchAgent(agentSlug || "design-builder1-2");
  };

  // Crop modal callback
  const handleOpenCropModal = (imgUrl: string, onDone: (croppedUrl: string) => void) => {
    setCropImageSrc(imgUrl);
    setCropOnDone(() => onDone);
    setIsCropModalOpen(true);
  };

  // RENDER: HOME DASHBOARD (Exact match to app.designbuilder.co Home)
  if (isHomeOpen) {
    return (
      <DesignBuilderHome
        onOpenStudio={handleOpenStudio}
        onOpenAgentes={handleOpenApps}
        onOpenGallery={() => {
          setIsHomeOpen(false);
          setIsAppsOpen(false);
          setActivePalcoMode("galeria");
          window.history.pushState({ path: "/gallery" }, "", "/gallery");
        }}
        onOpenCommunity={() => {
          setIsHomeOpen(false);
          setIsAppsOpen(false);
          setActivePalcoMode("comunidade");
          window.history.pushState({ path: "/community" }, "", "/community");
        }}
        onOpenProjects={() => {
          setIsHomeOpen(false);
          setIsAppsOpen(false);
          setActivePalcoMode("projetos");
          window.history.pushState({ path: "/projetos" }, "", "/projetos");
        }}
        onOpenAdmin={() => {
          setIsAdminSubscribersOpen(true);
          if (onNavigateTab) onNavigateTab("admin");
        }}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        userTokens={realCredits}
        userEmail={userEmail}
        userName={userName}
      />
    );
  }

  // RENDER: TODOS OS APPS (6 Agentes Vitrine - /apps)
  if (isAppsOpen) {
    return (
      <DesignBuilderVitrine
        onGoHome={handleGoHome}
        onOpenStudio={handleOpenStudio}
        onOpenGallery={() => {
          setIsHomeOpen(false);
          setIsAppsOpen(false);
          setActivePalcoMode("galeria");
          window.history.pushState({ path: "/gallery" }, "", "/gallery");
        }}
        onOpenCommunity={() => {
          setIsHomeOpen(false);
          setIsAppsOpen(false);
          setActivePalcoMode("comunidade");
          window.history.pushState({ path: "/community" }, "", "/community");
        }}
        onOpenAgentes={handleOpenApps}
        onOpenProjects={() => {
          setIsHomeOpen(false);
          setIsAppsOpen(false);
          setActivePalcoMode("projetos");
          window.history.pushState({ path: "/projetos" }, "", "/projetos");
        }}
        onOpenAdmin={() => {
          setIsAdminSubscribersOpen(true);
          if (onNavigateTab) onNavigateTab("admin");
        }}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        userTokens={realCredits}
        userEmail={userEmail}
        userName={userName}
      />
    );
  }

  const isOrion = selectedAgent === "orion-pro" || selectedAgent === "orion";

  return (
    <div className="flex h-full w-full bg-black text-zinc-100 font-sans overflow-hidden relative" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl backdrop-blur-md ring-1 ${
            toast.type === "error"
              ? "bg-red-950/90 text-red-200 ring-red-500/30"
              : toast.type === "warning"
              ? "bg-amber-950/90 text-amber-200 ring-amber-500/30"
              : toast.type === "info"
              ? "bg-blue-950/90 text-blue-200 ring-blue-500/30"
              : "bg-violet-950/90 text-violet-100 ring-violet-500/40"
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── BARRA LATERAL UNIFICADA OFICIAL (DESKTOP DOCK + MOBILE BAR 1:1) ── */}
      <DesignBuilderSidebar
        variant="dock"
        activeTab={
          activePalcoMode === "projetos"
            ? "projetos"
            : activePalcoMode === "galeria"
            ? "gallery"
            : activePalcoMode === "comunidade"
            ? "community"
            : activePalcoMode === "apps"
            ? "apps"
            : "ai-tools"
        }
        hideMobileNav={activePalcoMode === "builder"}
        onNavigateTab={(tab) => {
          if (tab === "projetos" || tab === "projects") {
            setActivePalcoMode("projetos");
          } else if (tab === "gallery" || tab === "galeria") {
            setActivePalcoMode("galeria");
          } else if (tab === "community" || tab === "comunidade") {
            setActivePalcoMode("comunidade");
          } else {
            handleGoHome();
          }
        }}
        onOpenProjects={() => {
          setActivePalcoMode("projetos");
          if (typeof window !== "undefined") window.history.pushState({ path: "/projetos" }, "", "/projetos");
        }}
        onOpenGallery={() => {
          setActivePalcoMode("galeria");
          if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
        }}
        onOpenCommunity={() => {
          setActivePalcoMode("comunidade");
          if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
        }}
        onOpenAdmin={() => {
          setIsAdminSubscribersOpen(true);
        }}
        onOpenAgentes={handleOpenApps}
        onSelectAgent={(slug) => handleSwitchAgent(slug)}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        selectedAgent={selectedAgent}
        userEmail={userEmail}
        userName={userName}
        userCredits={realCredits}
        isUnlimited={false}
        userPlan="Profissional (Vertex AI)"
      />

      {/* ── ÁREA PRINCIPAL DE CONTEÚDO (COM PADDING PARA O DOCK) ── */}
      <div className="flex h-[100dvh] flex-col overflow-hidden relative z-[2] lg:pl-[60px] flex-1 bg-black">
        {activePalcoMode === "apps" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
            <DesignBuilderAppsHub
              onSelectAgent={(agentId) => handleSwitchAgent(agentId)}
              onOpenVitrine={handleOpenVitrine}
              showToast={showToast}
              userName={userName || "Ricardo"}
            />
          </div>
        ) : activePalcoMode === "projetos" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
            <ProjetosManager
              onOpenVitrine={handleOpenVitrine}
              onOpenStudio={(agentSlug) => handleSwitchAgent(agentSlug || "design-builder1-2")}
              onOpenGallery={() => {
                setActivePalcoMode("galeria");
                if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
              }}
              onOpenCommunity={() => {
                setActivePalcoMode("comunidade");
                if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
              }}
              onOpenChat={() => setIsAssistantOpen(true)}
              onUseImageAsReference={(b64) => {
                store.setSujeitoBase64(b64);
                setActivePalcoMode("builder");
                showToast("Imagem definida como referência no Studio!", "success");
              }}
              showToast={showToast}
            />
          </div>
        ) : activePalcoMode === "galeria" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
            <GaleriaManager
              onOpenVitrine={handleOpenVitrine}
              onOpenStudio={(agentSlug, prompt, formData, inputImageUrls) => {
                if (agentSlug) handleSwitchAgent(agentSlug);
                setActivePalcoMode("builder");
                setStudioPalcoTab("builder");
                if (formData || inputImageUrls) {
                  handleReuseGeneration({ form_data: formData, input_image_urls: inputImageUrls, prompt });
                } else if (prompt) {
                  store.updateConfig({ additionalPrompt: prompt, lastLoadedAt: Date.now() });
                }
              }}
              onOpenCommunity={() => {
                setActivePalcoMode("comunidade");
                if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
              }}
              showToast={showToast}
            />
          </div>
        ) : activePalcoMode === "comunidade" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
            <ComunidadeManager
              onOpenVitrine={handleOpenVitrine}
              onOpenStudio={(slug, prompt) => {
                if (slug) handleSwitchAgent(slug);
                setActivePalcoMode("builder");
                if (prompt) store.updateConfig({ additionalPrompt: prompt });
              }}
              onOpenGallery={() => {
                setActivePalcoMode("galeria");
                if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
              }}
              showToast={showToast}
            />
          </div>
        ) : (selectedAgent === "hydra" || selectedAgent === "product-builder-v2") ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <HydraBuilder
              onSwitchAgent={handleSwitchAgent}
              onOpenVitrine={handleGoHome}
              onOpenGallery={() => {
                setActivePalcoMode("galeria");
                if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
              }}
              onOpenCommunity={() => {
                setActivePalcoMode("comunidade");
                if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
              }}
              onOpenChat={() => setIsAssistantOpen(true)}
              onOpenReport={() => setIsReportModalOpen(true)}
              showToast={showToast}
            />
          </div>
        ) : selectedAgent === "altera-facil" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AlteraFacilBuilder
              onSwitchAgent={handleSwitchAgent}
              onOpenVitrine={handleGoHome}
              onOpenGallery={() => {
                setActivePalcoMode("galeria");
                if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
              }}
              onOpenCommunity={() => {
                setActivePalcoMode("comunidade");
                if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
              }}
              onOpenChat={() => setIsAssistantOpen(true)}
              onOpenReport={() => setIsReportModalOpen(true)}
              showToast={showToast}
            />
          </div>
        ) : (selectedAgent === "ref" || selectedAgent === "ref-builder") ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <RefBuilder
              onSwitchAgent={handleSwitchAgent}
              onOpenVitrine={handleGoHome}
              onOpenGallery={() => {
                setActivePalcoMode("galeria");
                if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
              }}
              onOpenCommunity={() => {
                setActivePalcoMode("comunidade");
                if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
              }}
              onOpenChat={() => setIsAssistantOpen(true)}
              onOpenReport={() => setIsReportModalOpen(true)}
              showToast={showToast}
            />
          </div>
        ) : (selectedAgent === "enhance-builder" || selectedAgent === "enhance") ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <EnhanceBuilder
              onSwitchAgent={handleSwitchAgent}
              onOpenVitrine={handleGoHome}
              onOpenGallery={() => {
                setActivePalcoMode("galeria");
                if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
              }}
              onOpenCommunity={() => {
                setActivePalcoMode("comunidade");
                if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
              }}
              onOpenChat={() => setIsAssistantOpen(true)}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          </div>
        ) : (
          /* STUDIO MODE: DESIGN BUILDER 1.2 & ÓRION PRO */
          <>
          <main
            data-builder-workspace-shell=""
            className={`relative flex h-full min-h-0 overflow-hidden bg-black lg:flex-row max-lg:grid max-lg:overflow-hidden max-lg:transition-[grid-template-rows] max-lg:duration-300 max-lg:ease-in-out flex-1 ${
              (mobileActiveCategory && !isGenerating) ? "max-lg:grid-rows-[0fr_1fr]" : "max-lg:grid-rows-[1fr_0fr]"
            }`}
          >
            {/* ── COLUNA ESQUERDA: FORMULÁRIO DO AGENTE (420px) ── */}
            {isOrion ? (
              <aside
                data-aside-form-col=""
                data-tour="form"
                className={`agent-form-col relative z-10 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full lg:h-full lg:w-[var(--agent-form-col-w,420px)] lg:min-w-[280px] lg:max-w-[700px] lg:flex-shrink-0 flex max-lg:order-last max-lg:min-h-0 lg:flex ${
                  studioPalcoTab !== "builder" ? "max-lg:hidden" : ""
                }`}
                style={{ "--agent-form-col-w": "420px", "--agent-color": "#ffd500" } as any}
              >
                <OrionProBuilder
                  onSwitchAgent={handleSwitchAgent}
                  onOpenVitrine={handleGoHome}
                  onOpenGallery={() => {
                    setActivePalcoMode("galeria");
                    setStudioPalcoTab("galeria");
                    if (typeof window !== "undefined") window.history.pushState({ path: "/gallery" }, "", "/gallery");
                  }}
                  onOpenCommunity={() => {
                    setActivePalcoMode("comunidade");
                    setStudioPalcoTab("comunidade");
                    if (typeof window !== "undefined") window.history.pushState({ path: "/community" }, "", "/community");
                  }}
                  onOpenChat={() => setIsAssistantOpen(true)}
                  onOpenReport={() => setIsReportModalOpen(true)}
                  showToast={showToast}
                  isGenerating={isGenerating}
                  generatePremiumImage={generatePremiumImage}
                  onCloseMobileCategory={() => setMobileActiveCategory(null)}
                />
              </aside>
            ) : (
              <DesignBuilderFormOfficial
                onOpenCropModal={handleOpenCropModal}
                showToast={showToast}
                isGenerating={isGenerating}
                onGenerate={() => {
                  setMobileActiveCategory(null);
                  setStudioPalcoTab("builder");
                  generatePremiumImage();
                }}
                activePalcoMode={activePalcoMode}
                agentColWidth={420}
              />
            )}

            {/* Divisor Redimensionável */}
            <div
              role="separator"
              aria-orientation="vertical"
              title="Arraste para redimensionar"
              className="group relative z-10 hidden w-1.5 cursor-col-resize items-center justify-center border-r border-white/5 transition-colors lg:flex"
            >
              <div className="h-8 w-0.5 rounded-full bg-white/10 transition-colors group-hover:bg-white/30" />
            </div>

            {/* ── COLUNA DIREITA: PALCO CENTRAL & HISTÓRICO ── */}
            <section
              className="palco-central relative flex flex-col overflow-hidden max-lg:order-first max-lg:min-h-0 max-lg:overflow-hidden max-lg:pt-[env(safe-area-inset-top)] lg:h-full lg:flex-1"
              style={{ minWidth: "0px" }}
            >
              {/* Botão Minimizar filtros no Mobile */}
              <button
                type="button"
                aria-label={mobileActiveCategory ? "Minimizar filtros" : "Expandir filtros"}
                onClick={() => {
                  if (mobileActiveCategory) {
                    setMobileActiveCategory(null);
                  } else {
                    handleSelectMobileCategory(isOrion ? "principal" : "sujeito");
                  }
                  setIsMobileNavCollapsed(!isMobileNavCollapsed);
                }}
                className="lg:hidden flex w-full shrink-0 items-center justify-center py-0.5 text-zinc-500 transition-colors active:text-white cursor-pointer"
              >
                <ChevronUp
                  className={`h-5 w-5 transition-transform duration-200 ${
                    mobileActiveCategory ? "" : "rotate-180"
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* BARRA DE NAVEGAÇÃO PERSISTENTE (IDÊNTICO AO DESIGN BUILDER ORIGINAL) */}
              <div
                className={`barra-de-navegacao navegacao-persistente relative flex w-full items-center justify-start gap-2 py-3 pl-3 pr-14 shrink-0 scrollbar-hide max-lg:flex-col max-lg:items-stretch max-lg:gap-1.5 max-lg:px-2 max-lg:py-1.5 max-lg:sticky max-lg:top-0 max-lg:z-20 max-lg:border-b max-lg:border-white/[0.06] max-lg:bg-[#0c0a15]/85 max-lg:backdrop-blur-sm lg:z-30 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0 lg:overflow-visible lg:pl-0 lg:pr-0 max-lg:overflow-hidden max-lg:transition-all max-lg:duration-300 max-lg:ease-out ${
                  isMobileNavCollapsed ? "max-lg:max-h-0 max-lg:py-0 max-lg:border-none" : "max-lg:max-h-48"
                }`}
              >
                {/* Coluna 1: Abas de Geração do Projeto + Botão Nova Aba */}
                <div className="pointer-events-auto flex min-w-0 items-start gap-2 max-lg:order-2 max-lg:w-full max-lg:justify-center lg:w-full lg:pl-4">
                  <div className="hidden min-w-0 flex-1 lg:flex items-center gap-2">
                    <div
                      data-tour="tabs"
                      role="tablist"
                      aria-label="Abas de geração"
                      className="pointer-events-auto flex min-w-0 flex-row items-center gap-1 overflow-x-auto scrollbar-hide w-full max-w-full"
                    >
                      {store.projectsList.map((proj, idx) => {
                        const isActive = proj.id === store.activeProjectId;
                        return (
                          <div key={proj.id} className="group relative flex w-fit shrink-0 items-center">
                            <button
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => store.loadProjectById(proj.id)}
                              className={`inline-flex h-7 max-w-[12rem] flex-none items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/30 pr-5 cursor-pointer ${
                                isActive ? "text-white" : "hover:bg-white/[0.06]"
                              }`}
                              style={
                                isActive
                                  ? {
                                      background: isOrion
                                        ? "linear-gradient(135deg, rgb(255, 213, 0), rgba(255, 213, 0, 0.8))"
                                        : "linear-gradient(135deg, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))",
                                      borderColor: isOrion ? "rgb(255, 213, 0)" : "rgb(124, 58, 237)",
                                      color: isOrion ? "#000000" : "#ffffff"
                                    }
                                  : {
                                      color: isOrion ? "rgb(255, 213, 0)" : "rgb(124, 58, 237)",
                                      borderColor: isOrion ? "rgba(255, 213, 0, 0.333)" : "rgba(124, 58, 237, 0.333)"
                                    }
                              }
                            >
                              {!isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />}
                              <span className="truncate" title="Aba de projeto">
                                {proj.name && proj.name.startsWith("Aba ") ? proj.name : `Aba ${idx + 1}`}
                              </span>
                            </button>

                            {store.projectsList.length > 1 && (
                              <button
                                type="button"
                                aria-label="Fechar aba"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  store.deleteProject(proj.id);
                                }}
                                className={`absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-white/10 cursor-pointer ${
                                  isActive ? "text-white hover:text-white" : "text-zinc-500 hover:text-red-400"
                                }`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {store.projectsList.length < 3 && (
                        <button
                          type="button"
                          aria-label="Nova aba"
                          onClick={() => {
                            store.createProject();
                            showToast("Nova aba aberta!", "success");
                          }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300 cursor-pointer"
                          title="Nova aba"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coluna 2 & 3: Modos do Palco + Guia (wrap idêntico ao original: flex shrink-0 items-center gap-2 max-lg:order-1 max-lg:w-full lg:contents) */}
                <div className="flex shrink-0 items-center gap-2 max-lg:order-1 max-lg:w-full lg:contents">
                  <div
                    role="tablist"
                    aria-label="Modo de visualização"
                    data-tour="gallery"
                    className="flex shrink-0 items-center rounded-full border border-white/[0.06] bg-[rgba(10,7,25,0.70)] p-1 max-lg:min-w-0 max-lg:flex-1"
                  >
                    {[
                      { key: "builder", label: "Builder" },
                      { key: "pinterest", label: "Pinterest" },
                      { key: "comunidade", label: "Comunidade" },
                      { key: "galeria", label: "Galeria" }
                    ].map((item) => {
                      const isSelected = studioPalcoTab === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => {
                            setStudioPalcoTab(item.key as any);
                          }}
                          className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 max-lg:min-w-0 max-lg:flex-1 max-lg:truncate max-lg:px-1 max-lg:text-[10px] max-lg:tracking-normal cursor-pointer ${
                            isSelected ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          style={
                            isSelected
                              ? {
                                  background: isOrion
                                    ? "linear-gradient(135deg, rgb(255, 213, 0), rgba(255, 213, 0, 0.8))"
                                    : "linear-gradient(135deg, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))",
                                  color: isOrion ? "#000000" : "#ffffff"
                                }
                              : {}
                          }
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    data-tour="header-actions"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-label="Guia"
                    onClick={() => setIsGuiaModalOpen(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors hover:bg-white/[0.06] max-lg:px-2.5 h-10 px-5 uppercase tracking-wider lg:mr-4 lg:justify-self-end cursor-pointer"
                    style={{
                      color: isOrion ? "rgb(255, 213, 0)" : "rgb(124, 58, 237)",
                      border: isOrion ? "1px solid rgba(255, 213, 0, 0.2)" : "1px solid rgba(124, 58, 237, 0.2)"
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="max-lg:hidden">Guia</span>
                    <ChevronDown className="h-3 w-3 shrink-0 transition-transform duration-200 max-lg:hidden" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* ── ÁREA DO PALCO DA ARTE / CANVAS ── */}
              <div
                className={`relative flex flex-1 min-h-0 flex-row overflow-hidden ${
                  studioPalcoTab === "builder" ? "max-lg:hidden" : "max-lg:flex"
                }`}
              >
          <div className="palco-da-arte relative flex h-full min-h-0 flex-1 min-w-0 overflow-hidden items-center justify-center p-4">
            {studioPalcoTab === "pinterest" ? (
              /* MODO PINTEREST INTEGRADO NO PALCO */
              <div className="flex h-full w-full flex-col overflow-y-auto px-4 py-3 custom-scrollbar">
                <div className="mb-4 flex flex-col gap-2">
                  <div className="relative w-full max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={pinterestSearch}
                      onChange={(e) => setPinterestSearch(e.target.value)}
                      placeholder="Buscar inspirações de design no Pinterest..."
                      className="w-full rounded-xl bg-zinc-900/90 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {["Social Media", "Moda", "Minimalista", "E-commerce", "Tecnologia"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setPinterestSearch(pinterestSearch === tag ? "" : tag)}
                        className={`rounded-full px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                          pinterestSearch === tag
                            ? "bg-violet-600 text-white border-violet-500"
                            : "bg-zinc-900 text-zinc-400 border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {ORION_PINTEREST_CARDS.filter((c) => !pinterestSearch.trim() || c.title.toLowerCase().includes(pinterestSearch.toLowerCase()) || (c.tags || []).some((t) => t.toLowerCase().includes(pinterestSearch.toLowerCase()))).map((card) => (
                    <div
                      key={card.id}
                      className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-violet-500/50 transition-all shadow-md"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
                        <img src={card.src} alt={card.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 gap-1.5">
                          <p className="text-[11px] font-semibold text-white truncate">{card.title}</p>
                          <button
                            type="button"
                            onClick={() => {
                              store.setSujeitoBase64(card.src);
                              store.updateConfig({ additionalPrompt: `Inspirado no estilo: ${card.title}` });
                              setStudioPalcoTab("builder");
                              showToast("Inspiração definida no formulário!", "success");
                            }}
                            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 py-1.5 text-[11px] font-medium text-white flex items-center justify-center gap-1 cursor-pointer shadow-md"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Usar no Studio</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : studioPalcoTab === "comunidade" ? (
              /* MODO COMUNIDADE INTEGRADO NO PALCO */
              <div className="flex h-full w-full flex-col overflow-y-auto px-4 py-3 custom-scrollbar">
                <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-zinc-300">Criações da Comunidade</span>
                  <span className="text-[11px] text-zinc-500">{COMMUNITY_CARDS.length} artes</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {COMMUNITY_CARDS.map((card) => (
                    <div
                      key={card.id}
                      className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-violet-500/50 transition-all shadow-md"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
                        <img src={card.src} alt={card.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 gap-1.5">
                          <p className="text-[11px] font-semibold text-white truncate">{card.title}</p>
                          <p className="text-[10px] text-zinc-400 line-clamp-2">{card.prompt}</p>
                          <button
                            type="button"
                            onClick={() => {
                              store.updateConfig({ additionalPrompt: card.prompt });
                              setStudioPalcoTab("builder");
                              showToast("Prompt da comunidade aplicado!", "success");
                            }}
                            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 py-1.5 text-[11px] font-medium text-white flex items-center justify-center gap-1 cursor-pointer shadow-md"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Usar no Studio</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : studioPalcoTab === "galeria" ? (
              /* MODO GALERIA INTEGRADO NO PALCO */
              <div className="flex h-full w-full flex-col overflow-y-auto px-4 py-3 custom-scrollbar">
                <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-zinc-300">Suas Gerações Salvas</span>
                  <span className="text-[11px] text-zinc-500">{(store.galeriaImages || []).length} imagens</span>
                </div>
                {(store.galeriaImages || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-600">
                    <p className="text-xs">Nenhuma arte gerada ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {(store.galeriaImages || []).map((imgUrl, i) => (
                      <div
                        key={imgUrl + "_" + i}
                        onClick={() => {
                          store.setActiveImageIndex(i);
                          setStudioPalcoTab("builder");
                        }}
                        className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-violet-500/50 transition-all shadow-md cursor-pointer"
                      >
                        <div className="relative w-full overflow-hidden bg-zinc-900">
                          <img
                            src={imgUrl}
                            alt={`Geração ${i + 1}`}
                            className="block w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            style={{ aspectRatio: "4 / 5" }}
                            onLoad={(e) => {
                              const { naturalWidth, naturalHeight } = e.currentTarget;
                              if (naturalWidth && naturalHeight) {
                                e.currentTarget.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                            <span className="text-[10px] text-white font-medium">Ver no Palco</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReuseGeneration(imgUrl);
                                setStudioPalcoTab("builder");
                              }}
                              className="px-2 py-1 rounded bg-violet-600 text-white text-[10px] font-semibold hover:bg-violet-500 cursor-pointer"
                            >
                              Reutilizar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (store.isGenerating || isGenerating) ? (
              <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden items-center justify-center p-3 pb-28 sm:pb-32 animate-in fade-in zoom-in-95 duration-300">
                <div
                  className={`relative flex items-center justify-center h-full max-h-[72vh] sm:max-h-[78vh] w-auto ${
                    store.dimensao === "9:16"
                      ? "aspect-[9/16]"
                      : store.dimensao === "16:9"
                      ? "aspect-[16/9]"
                      : store.dimensao === "1:1"
                      ? "aspect-square"
                      : "aspect-[4/5]"
                  } max-w-full rounded-2xl overflow-hidden db-generating-card transition-all duration-300`}
                  style={{ minWidth: "min(320px, 90vw)", minHeight: "340px" }}
                >
                  <GenerationLoadingCanvas
                    className="w-full h-full"
                    agentColor={isOrion ? "#ffd500" : "#a78bfa"}
                    elapsedSeconds={elapsedSeconds}
                    message={statusMessage}
                    subMessage={isOrion ? "Órion Pro construindo anúncio de alta conversão" : "Zion Design sintetizando arte fidedigna"}
                  />
                </div>
              </div>
            ) : activeImage ? (
              /* ESTADO 2: IMAGEM GERADA ATIVA */
              <div className="group/viewer relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden items-center justify-center p-2 pb-32 sm:pb-36">
                <div className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
                  <img
                    alt="Arte gerada pelo Zion Design"
                    src={activeImage}
                    className="block h-auto w-auto max-h-full max-w-full shrink rounded-2xl object-contain shadow-2xl shadow-black/80"
                  />
                </div>

                {/* Floating Glass Action Bar - Lado Esquerdo */}
                <div className="acoes-da-arte absolute left-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-start max-lg:hidden pointer-events-auto" style={{ bottom: "108px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportModalOpen(true);
                      showToast("Reportar geração aberto!", "info");
                    }}
                    title="Reportar geração"
                    aria-label="Reportar geração"
                    className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <Flag className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReuseGeneration(activeImage)}
                    title="Reutilizar configurações desta imagem"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 text-zinc-300 hover:text-white cursor-pointer hover:bg-violet-600/30 hover:border-violet-500/40"
                  >
                    <RotateCcw className="h-4 w-4 text-violet-400" />
                    <span>Reutilizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFavorited(!isFavorited);
                      showToast(isFavorited ? "Removido dos favoritos" : "Favoritado!", "info");
                    }}
                    title="Favoritar"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                    <span>Favoritar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePalcoMode("comunidade");
                      showToast("Publicar na Comunidade aberto!", "info");
                    }}
                    title="Publicar na Comunidade"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Publicar</span>
                  </button>
                </div>

                {/* Floating Glass Action Bar - Lado Direito */}
                <div className="acoes-da-arte absolute right-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-end max-lg:hidden pointer-events-auto" style={{ bottom: "108px" }}>
                  
                  {/* Dropdown Formato */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormatDropdownOpen(!isFormatDropdownOpen);
                        setIsExportDropdownOpen(false);
                      }}
                      title="Formato"
                      className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 cursor-pointer ${
                        isFormatDropdownOpen ? "text-white bg-violet-600/30 ring-1 ring-violet-500" : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      <Maximize2 className="h-4 w-4" />
                      <span>Formato</span>
                    </button>
                    {isFormatDropdownOpen && (
                      <div className="absolute bottom-full right-0 mb-2 z-30 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-2xl p-2">
                        <p className="px-2 pb-1 text-[10px] font-medium text-zinc-500">Alterar Formato</p>
                        <div className="grid grid-cols-3 gap-1">
                          {["1:1", "4:5", "9:16", "16:9", "3:4", "4:3"].map((dim) => (
                            <button
                              key={dim}
                              type="button"
                              onClick={() => {
                                store.updateConfig({ dimensao: dim as any });
                                setIsFormatDropdownOpen(false);
                                showToast(`Formato alterado para ${dim}`, "info");
                              }}
                              className={`flex h-8 items-center justify-center rounded-lg text-xs font-semibold cursor-pointer ${
                                store.dimensao === dim ? "bg-violet-600 text-white" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                              }`}
                            >
                              {dim}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Exportar */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(!isExportDropdownOpen);
                        setIsFormatDropdownOpen(false);
                      }}
                      title="Exportar"
                      className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 cursor-pointer ${
                        isExportDropdownOpen ? "text-white bg-violet-600/30 ring-1 ring-violet-500" : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                    </button>
                    {isExportDropdownOpen && (
                      <div className="absolute bottom-full right-0 mb-2 z-30 w-56 rounded-2xl border border-white/10 bg-[#0c0817]/95 backdrop-blur-xl p-3 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                          <span className="text-xs font-bold text-white">Exportar Imagem</span>
                          <button
                            type="button"
                            onClick={() => setIsExportDropdownOpen(false)}
                            className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-white cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { ext: "AVIF", sub: "Original" },
                            { ext: "PNG", sub: "Sem perda" },
                            { ext: "JPEG", sub: "Alta qualidade" },
                            { ext: "WEBP", sub: "Otimizado Web" }
                          ].map((item) => (
                            <button
                              key={item.ext}
                              type="button"
                              onClick={() => {
                                const q = store.resolucao || store.qualidade || "4K";
                                const isOriginal = item.ext === "AVIF" || item.ext === "PNG";
                                downloadImage(activeImage, item.ext as any, undefined, undefined, undefined, q as any, {
                                  title: store.projectsList.find((p) => p.id === store.activeProjectId)?.name || "arte"
                                });
                                setIsExportDropdownOpen(false);
                                showToast(`Download ${item.ext} (${q}) iniciado!`, "success");
                              }}
                              className="flex items-center gap-2 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-left transition-all hover:border-violet-500/40 hover:bg-violet-500/10 cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5 text-zinc-400" />
                              <div>
                                <p className="text-[11px] font-semibold text-white">{item.ext}</p>
                                <p className="text-[9px] text-zinc-500">{item.sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Usar como Sujeito Base */}
                  <button
                    type="button"
                    onClick={() => {
                      store.setSujeitoBase64(activeImage);
                      store.setSujeitoBase64List([activeImage, ...(store.sujeitosBase64List || [])]);
                      showToast("Imagem definida como referência do sujeito!", "success");
                    }}
                    title="Usar esta imagem como entrada do sujeito"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Usar como base</span>
                  </button>
                </div>

                {/* Mobile Floating Action Bar (Ações da Arte no Celular) */}
                <div className="lg:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handleReuseGeneration(activeImage)}
                    title="Reutilizar"
                    className="flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-medium text-zinc-200 hover:text-white bg-white/5 active:bg-violet-600/30 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-violet-400" />
                    <span>Reutilizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFavorited(!isFavorited);
                      showToast(isFavorited ? "Removido dos favoritos" : "Favoritado!", "info");
                    }}
                    title="Favoritar"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-200 hover:text-white bg-white/5 cursor-pointer"
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(!isExportDropdownOpen);
                      setIsFormatDropdownOpen(false);
                    }}
                    title="Exportar"
                    className="flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-medium text-white bg-violet-600 active:bg-violet-500 shadow-md shadow-violet-600/30 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Exportar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewZoomImage(activeImage)}
                    title="Expandir"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-200 hover:text-white bg-white/5 cursor-pointer"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Magic Refine Bar & Community Publish Card Oficial */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex w-[min(92vw,560px)] flex-col items-center gap-2 pointer-events-auto">
                  <MagicRefineBar
                    activeImage={activeImage}
                    isProcessing={isRefining}
                    agentColor={isOrion ? "#ffd500" : "#a855f7"}
                    onPublishCommunity={() => {
                      setActivePalcoMode("comunidade");
                      showToast("Publicar na Comunidade aberto!", "info");
                    }}
                    onSendRefine={(text, atts) => {
                      setRefinePrompt(text);
                      if (atts.length > 0) {
                        setRefineAttachedFiles(atts.map((a, i) => ({ name: a.file?.name || `anexo_${i}`, url: a.preview })));
                      }
                      setTimeout(() => handleSendRefinement(), 50);
                    }}
                  />
                </div>
              </div>
            ) : (
              /* ESTADO 3: PALCO EM ESPERA / PREVIEW DO SUJEITO E PALETA */
              <div className={`jsx-60dea475f91d3ae3 flex w-full ${
                store.dimensao === "9:16" ? "max-w-[320px]" : store.dimensao === "16:9" ? "max-w-[560px]" : store.dimensao === "4:5" ? "max-w-[360px]" : "max-w-[400px]"
              } max-lg:max-w-[88vw] flex-col items-center gap-4 mx-auto p-3 lg:p-4`}>
                {store.dimensao && (
                  <span className="jsx-60dea475f91d3ae3 text-xs font-medium tracking-widest uppercase text-zinc-600">{store.dimensao}</span>
                )}
                <div
                  data-testid="preview-canvas"
                  className={`jsx-60dea475f91d3ae3 relative w-full ${
                    store.dimensao === "9:16" ? "aspect-[9/16]" : store.dimensao === "16:9" ? "aspect-[16/9]" : store.dimensao === "1:1" ? "aspect-square" : "aspect-[4/5]"
                  } rounded-lg lg:rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg lg:shadow-2xl shadow-black/50 transition-all duration-300`}
                  style={{ backgroundColor: "#0c0a15" }}
                >
                  {/* Grid de fundo */}
                  <div
                    className="jsx-60dea475f91d3ae3 absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                      backgroundSize: "40px 40px"
                    }}
                  />

                  {store.sujeitoBase64 ? (
                    <div data-testid="subject-placeholder" className={`jsx-60dea475f91d3ae3 flex items-center justify-center transition-all duration-300 ${
                      store.positioning === "left" || store.positioning === "Esquerda"
                        ? "absolute left-3 top-1/2 -translate-y-1/2 w-[35%] h-[60%]"
                        : store.positioning === "right" || store.positioning === "Direita"
                        ? "absolute right-3 top-1/2 -translate-y-1/2 w-[35%] h-[60%]"
                        : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[70%]"
                    }`}>
                      <img
                        src={store.sujeitoBase64}
                        alt="Preview Sujeito"
                        className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div data-testid="subject-placeholder" className="jsx-60dea475f91d3ae3 absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600">
                      <ImageIcon className="h-10 w-10 text-zinc-700" />
                      <span className="text-xs font-medium">Seu design será gerado aqui</span>
                    </div>
                  )}

                  {/* Preset badge */}
                  {store.estiloVisual && store.estiloVisual !== "Nenhum" && (
                    <div className="jsx-60dea475f91d3ae3 absolute bottom-3 left-3 right-3">
                      <span data-testid="preset-badge" className="jsx-60dea475f91d3ae3 inline-block bg-black/50 text-white/70 text-[10px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md ring-1 ring-white/5">
                        {store.estiloVisual}
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Swatches */}
                <div data-testid="color-swatches" className="jsx-60dea475f91d3ae3 flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      data-testid="swatch-luz"
                      className="h-6 w-6 rounded-full ring-1 ring-white/10 shadow-sm transition-transform hover:scale-110"
                      title={`Luz: ${store.cores?.complementar || "#e2e2e2"}`}
                      style={{ backgroundColor: store.cores?.complementar || "#e2e2e2" }}
                    />
                    <span className="text-[10px] text-zinc-600">Luz</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      data-testid="swatch-ambiente"
                      className="h-6 w-6 rounded-full ring-1 ring-white/10 shadow-sm transition-transform hover:scale-110"
                      title={`Ambiente: ${store.cores?.ambiente || "#0c0a15"}`}
                      style={{ backgroundColor: store.cores?.ambiente || "#0c0a15" }}
                    />
                    <span className="text-[10px] text-zinc-600">Ambiente</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      data-testid="swatch-destaque"
                      className="h-6 w-6 rounded-full ring-1 ring-white/10 shadow-sm transition-transform hover:scale-110"
                      title={`Destaque: ${store.cores?.recorte || (isOrion ? "#ffd500" : "#7c3aed")}`}
                      style={{ backgroundColor: store.cores?.recorte || (isOrion ? "#ffd500" : "#7c3aed") }}
                    />
                    <span className="text-[10px] text-zinc-600">Destaque</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isMobileHistoryOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
          )}
          {/* ── COLUNA LATERAL DE HISTÓRICO OFICIAL (72PX) À DIREITA ── */}
          <div
            data-tour="history"
            className={`coluna-de-historico z-50 shrink-0 flex-col transition-all duration-300 ${isMobileHistoryOpen ? "fixed inset-y-0 right-0 z-50 flex shadow-2xl bg-black border-l border-white/10 w-44" : "relative z-10 hidden h-full lg:flex"}`}
            style={{ width: isMobileHistoryOpen ? "176px" : "72px", "--largura-do-historico": isMobileHistoryOpen ? "176px" : "72px" } as any}
          >
            <div
              className="historico-lateral relative flex h-full flex-col border-l border-white/[0.04] bg-black w-full"
              style={{ width: "100%" }}
            >
              {isMobileHistoryOpen && (
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 lg:hidden shrink-0">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    Histórico
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMobileHistoryOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div
                className="absolute left-0 top-0 z-20 h-full w-1.5 -translate-x-1/2 cursor-col-resize transition-colors hover:bg-violet-500/30 hidden lg:block"
                title="Arraste para redimensionar"
              />
              <div className="flex-1 space-y-1.5 overflow-y-auto px-1.5 py-2 scrollbar-hide">
                {store.galeriaImages && store.galeriaImages.length > 0 ? (
                  store.galeriaImages.map((imgUrl, i) => {
                    const isCurrent = i === store.activeImageIndex;
                    return (
                      <div
                        key={imgUrl + "_" + i}
                        className={`group relative w-full overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer ${
                          isCurrent
                            ? "border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/40"
                            : "border-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_6px_rgba(139,92,246,0.08)]"
                        }`}
                        style={
                          isCurrent
                            ? {
                                borderColor: isOrion ? "rgba(255, 213, 0, 0.6)" : "rgba(124, 58, 237, 0.6)",
                                boxShadow: isOrion ? "rgba(255, 213, 0, 0.25) 0px 0px 8px" : "rgba(124, 58, 237, 0.25) 0px 0px 8px"
                              }
                            : {}
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            store.setActiveImageIndex(i);
                            setIsMobileHistoryOpen(false);
                          }}
                          className="block w-full cursor-pointer"
                          title="Geração — clique para visualizar no palco"
                        >
                          <img
                            alt="Geração"
                            src={imgUrl}
                            className="block w-full bg-black object-cover cursor-grab active:cursor-grabbing"
                            loading="lazy"
                            decoding="async"
                            style={{
                              aspectRatio: store.dimensao ? store.dimensao.replace(":", " / ") : "4 / 5"
                            }}
                            onLoad={(e) => {
                              const { naturalWidth, naturalHeight } = e.currentTarget;
                              if (naturalWidth && naturalHeight) {
                                e.currentTarget.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
                              }
                            }}
                          />
                        </button>

                        {/* Selo Hover "Geração" */}
                        <div
                          className={`pointer-events-none absolute left-1 top-1 z-10 flex items-center rounded border px-1 py-0.5 text-[8px] font-semibold leading-none shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${
                            isOrion
                              ? "border-amber-400/30 bg-amber-950/85 text-amber-200"
                              : "border-violet-400/30 bg-violet-950/85 text-violet-200"
                          }`}
                        >
                          <span>Geração</span>
                        </div>

                        {/* Botões de Ação no Card: Reutilizar e Excluir */}
                        <div className="absolute right-1 top-1 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReuseGeneration(imgUrl);
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/80 text-zinc-200 ring-1 ring-white/10 backdrop-blur-sm hover:bg-violet-600 hover:text-white cursor-pointer"
                            title="Reutilizar configurações desta arte"
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              store.deleteGaleriaImage(imgUrl);
                              showToast("Geração excluída permanentemente", "info");
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-black/80 text-zinc-200 ring-1 ring-white/10 backdrop-blur-sm hover:bg-red-600 hover:text-white cursor-pointer"
                            title="Remover geração permanentemente"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-zinc-600">
                    <span className="text-[10px]">Vazio</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

            </section>
          </main>

          {/* ── BARRA INFERIOR MOBILE OFICIAL (1:1 COM DESIGN BUILDER ORIGINAL) ── */}
          <nav
            aria-label="Categorias e ações de construção"
            className="relative shrink-0 overflow-x-hidden border-t border-white/[0.08] backdrop-blur-xl pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.35)] lg:hidden"
            style={{ background: "rgba(10, 7, 25, 0.92)" }}
          >
              <div
                role="tablist"
                aria-label="Categorias do agente"
                className="flex items-stretch gap-0.5 overflow-x-auto scrollbar-hide px-2 py-1.5 [scroll-snap-type:x_proximity]"
              >
                {/* Início */}
                <button
                  type="button"
                  aria-label="Sair para o início"
                  onClick={() => {
                    setMobileActiveCategory(null);
                    handleGoHome();
                  }}
                  className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-zinc-300 cursor-pointer"
                >
                  <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors bg-white/[0.05] ring-1 ring-white/15 group-hover:bg-white/[0.10]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house lucide-home h-[22px] w-[22px]" aria-hidden="true">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap text-[10px] leading-none font-semibold">Início</span>
                </button>

                <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

                {isOrion ? (
                  <>
                    {/* Principal */}
                    {(() => {
                      const isActive = mobileActiveCategory === "principal" || mobileActiveCategory === "sujeito";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("principal")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(255, 213, 0, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-image h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(255, 213, 0)" } : undefined}
                              >
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Principal</span>
                        </button>
                      );
                    })()}

                    {/* Marca e estilo */}
                    {(() => {
                      const isActive = mobileActiveCategory === "marca" || mobileActiveCategory === "marca_estilo" || mobileActiveCategory === "cores";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("marca")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(255, 213, 0, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-palette h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(255, 213, 0)" } : undefined}
                              >
                                <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Marca e estilo</span>
                        </button>
                      );
                    })()}

                    {/* Cenário */}
                    {(() => {
                      const isActive = mobileActiveCategory === "cenario" || mobileActiveCategory === "contexto";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("cenario")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(255, 213, 0, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-mountain h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(255, 213, 0)" } : undefined}
                              >
                                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Cenário</span>
                        </button>
                      );
                    })()}

                    {/* Texto na imagem */}
                    {(() => {
                      const isActive = mobileActiveCategory === "texto" || mobileActiveCategory === "texto_imagem";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("texto")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(255, 213, 0, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-text-initial lucide-letter-text h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(255, 213, 0)" } : undefined}
                              >
                                <path d="M15 5h6" />
                                <path d="M15 12h6" />
                                <path d="M3 19h18" />
                                <path d="m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12" />
                                <path d="M3.92 10h6.16" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Texto na imagem</span>
                        </button>
                      );
                    })()}

                    {/* Ajustes */}
                    {(() => {
                      const isActive = mobileActiveCategory === "ajustes" || mobileActiveCategory === "composicao";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("ajustes")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(255, 213, 0, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-settings h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(255, 213, 0)" } : undefined}
                              >
                                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Ajustes</span>
                        </button>
                      );
                    })()}

                    {/* Configurações */}
                    {(() => {
                      const isActive = mobileActiveCategory === "configuracoes" || mobileActiveCategory === "config" || mobileActiveCategory === "prompt";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("configuracoes")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(255, 213, 0, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-sliders-horizontal h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(255, 213, 0)" } : undefined}
                              >
                                <path d="M10 5H3" />
                                <path d="M12 19H3" />
                                <path d="M14 3v4" />
                                <path d="M16 17v4" />
                                <path d="M21 12h-9" />
                                <path d="M21 19h-5" />
                                <path d="M21 5h-7" />
                                <path d="M8 10v4" />
                                <path d="M8 12H3" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Configurações</span>
                        </button>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {/* Sujeito */}
                    {(() => {
                      const isActive = mobileActiveCategory === "sujeito" || mobileActiveCategory === "principal";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("sujeito")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(124, 58, 237, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-image h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(167, 139, 250)" } : undefined}
                              >
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Sujeito</span>
                        </button>
                      );
                    })()}

                    {/* Contexto */}
                    {(() => {
                      const isActive = mobileActiveCategory === "contexto" || mobileActiveCategory === "cenario";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("contexto")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(124, 58, 237, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-mountain h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(167, 139, 250)" } : undefined}
                              >
                                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Contexto</span>
                        </button>
                      );
                    })()}

                    {/* Texto */}
                    {(() => {
                      const isActive = mobileActiveCategory === "texto";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("texto")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(124, 58, 237, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-text-initial lucide-letter-text h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(167, 139, 250)" } : undefined}
                              >
                                <path d="M15 5h6" />
                                <path d="M15 12h6" />
                                <path d="M3 19h18" />
                                <path d="m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12" />
                                <path d="M3.92 10h6.16" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Texto</span>
                        </button>
                      );
                    })()}

                    {/* Cores */}
                    {(() => {
                      const isActive = mobileActiveCategory === "cores";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("cores")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(124, 58, 237, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-palette h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(167, 139, 250)" } : undefined}
                              >
                                <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Cores</span>
                        </button>
                      );
                    })()}

                    {/* Composição */}
                    {(() => {
                      const isActive = mobileActiveCategory === "composicao";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("composicao")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(124, 58, 237, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-layers h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(167, 139, 250)" } : undefined}
                              >
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Composição</span>
                        </button>
                      );
                    })()}

                    {/* Prompt */}
                    {(() => {
                      const isActive = mobileActiveCategory === "prompt";
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => handleSelectMobileCategory("prompt")}
                          className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
                            isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                              isActive ? "" : "group-hover:bg-white/[0.06]"
                            }`}
                            style={isActive ? { backgroundColor: "rgba(124, 58, 237, 0.15)" } : undefined}
                          >
                            <span className="relative">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-sparkles h-[22px] w-[22px]"
                                aria-hidden="true"
                                style={isActive ? { color: "rgb(167, 139, 250)" } : undefined}
                              >
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                <path d="M5 3v4" />
                                <path d="M19 17v4" />
                                <path d="M3 5h4" />
                                <path d="M17 19h4" />
                              </svg>
                            </span>
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-medium leading-none">Prompt</span>
                        </button>
                      );
                    })()}
                  </>
                )}

                <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

                {/* Botão Construir (Idêntico ao original) */}
                <button
                  type="button"
                  aria-label="Construir"
                  disabled={isGenerating}
                  onClick={() => {
                    setMobileActiveCategory(null);
                    generatePremiumImage();
                  }}
                  className="group ml-0.5 flex min-h-[52px] min-w-[78px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl px-3 text-white transition-transform duration-100 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  style={{
                    color: "rgb(255, 255, 255)",
                    background: isOrion
                      ? "linear-gradient(to right, rgb(255, 213, 0), rgba(255, 213, 0, 0.8))"
                      : "linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))",
                    boxShadow: isOrion
                      ? "rgba(255, 213, 0, 0.35) 0px 4px 16px"
                      : "rgba(124, 58, 237, 0.35) 0px 4px 16px"
                  }}
                >
                  <span className="whitespace-nowrap text-sm font-extrabold leading-tight">
                    {isGenerating ? "Criando..." : "Construir"}
                  </span>
                </button>
              </div>
            </nav>
          </>
        )}
      </div>

{/* ── MODAIS INTEGRADOS ── */}

      {/* Modal de Crop de Imagem */}
      {isCropModalOpen && (
        <ImageCropModal
          imageUrl={cropImageSrc}
          onConfirm={(croppedUrl) => {
            cropOnDone?.(croppedUrl);
            setIsCropModalOpen(false);
          }}
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
        />
      )}

      {/* Modal de Reportar Erro */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        showToast={showToast}
      />

      {/* Modal de Créditos */}
      {isCreditsModalOpen && (
        <CreditsModal
          onClose={() => setIsCreditsModalOpen(false)}
          onOpenAdmin={() => setIsAdminSubscribersOpen(true)}
          userEmail={userEmail}
          userName={userName}
        />
      )}

      {/* Modal de Gestão de Assinantes & Créditos (Exclusivo Admin: der.contatos@gmail.com) */}
      <AdminSubscribersModal
        isOpen={isAdminSubscribersOpen}
        onClose={() => setIsAdminSubscribersOpen(false)}
        adminEmail="der.contatos@gmail.com"
        showToast={showToast}
      />

      {/* ── Assistente Criativo Oficial (Matching app.designbuilder.co) ── */}
      <DesignBuilderAssistant
        onApplyPrompt={(prompt) => {
          store.updateConfig({ additionalPrompt: prompt });
          showToast("Prompt aplicado ao formulário!", "success");
        }}
        showToast={showToast}
      />

      {/* Modal Guia Rápido */}
      {isGuiaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0817] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-400" />
                Guia Rápido do Studio
              </h3>
              <button
                type="button"
                onClick={() => setIsGuiaModalOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-zinc-300">
              <p>• <strong>Resolução:</strong> Selecione 1K para agilidade ou 4K Ultra HD para impressão e outdoors.</p>
              <p>• <strong>Salvar Projeto:</strong> Suas referências e textos ficam salvos automaticamente na sua aba ativa.</p>
              <p>• <strong>Reutilizar Configurações:</strong> Clique no botão de reutilizar em qualquer geração anterior para preencher o formulário instantaneamente com os mesmos dados.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuiaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

