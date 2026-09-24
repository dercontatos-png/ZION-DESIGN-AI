import { useProjectStore, addDeletedImage, getDeletedImages } from "../store/useProjectStore";
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Sparkles,
  ChevronRight,
  Info,
  Maximize2,
  Copy,
  RotateCcw,
  Plus,
  ImagePlus,
  Layers,
  Trash2,
  X,
  Check,
  ChevronLeft,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Clock,
  LayoutGrid,
  Download,
  AlertTriangle,
  FolderPlus,
  MoreHorizontal,
  Folder
} from "lucide-react";
import { HYDRA_CATEGORIES, HYDRA_STYLE_CARDS, HydraStyleCard } from "../data/hydraData";
import { GenerationLoadingCanvas } from "./GenerationLoadingCanvas";
import { MagicRefineBar } from "./MagicRefineBar";
import { set as idbSet, get as idbGet } from "idb-keyval";

interface HydraTabState {
  id: string;
  title: string;
  productImage: string | null;
  selectedInspirations: HydraStyleCard[];
  selectedDimension: "4:5" | "9:16" | "1:1" | "16:9";
  selectedQuality: "1K" | "2K" | "4K";
  subjectPosition: "auto" | "left" | "center" | "right";
  textSpace: "none" | "left" | "right" | "top" | "bottom";
  blurBackground: boolean;
  colorMode: "auto" | "manual";
  manualColor: string;
  visualStyle: string;
  styleNotes: string;
  activeResultImage: string | null;
}

interface HydraBuilderProps {
  onSwitchAgent?: (agent: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const defaultHydraTabs: HydraTabState[] = [
  {
    id: "tab-1",
    title: "ABA 1",
    productImage: null,
    selectedInspirations: [
      HYDRA_STYLE_CARDS[0],
      HYDRA_STYLE_CARDS[1],
      HYDRA_STYLE_CARDS[2],
    ],
    selectedDimension: "4:5",
    selectedQuality: "1K",
    subjectPosition: "auto",
    textSpace: "none",
    blurBackground: false,
    colorMode: "auto",
    manualColor: "#8b5cf6",
    visualStyle: "none",
    styleNotes: "",
    activeResultImage: null,
  },
];

export const HydraBuilder: React.FC<HydraBuilderProps> = ({
  onSwitchAgent,
  onOpenVitrine,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onOpenReport,
  showToast,
}) => {
  // Multi-Tab System: Strictly up to 3 tabs ("ABA 1", "ABA 2", "ABA 3") with persistent storage
  const [tabs, setTabs] = useState<HydraTabState[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_hydra_tabs_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3).map((t, idx) => ({
              ...t,
              title: t.title && t.title.toUpperCase().startsWith("ABA ") ? t.title : `ABA ${idx + 1}`
            }));
          }
        }
      } catch (e) {}
    }
    return defaultHydraTabs;
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_hydra_active_tab_id");
        if (saved) return saved;
      } catch (e) {}
    }
    return "tab-1";
  });
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabTitle, setEditingTabTitle] = useState<string>("");

  // Persist tabs and activeTabId to LocalStorage and IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem("zion_hydra_tabs_v2", JSON.stringify(tabs));
      idbSet("zion_hydra_tabs_idb", tabs).catch(() => {});
    } catch (e) {
      idbSet("zion_hydra_tabs_idb", tabs).catch(() => {});
    }
  }, [tabs]);

  useEffect(() => {
    try {
      localStorage.setItem("zion_hydra_active_tab_id", activeTabId);
    } catch (e) {}
  }, [activeTabId]);

  // Rehydrate full IndexedDB if LocalStorage didn't have heavy images
  useEffect(() => {
    idbGet("zion_hydra_tabs_idb").then((saved) => {
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setTabs(prev => {
          const isInitialDefault = prev.length === 1 && !prev[0].productImage && !prev[0].activeResultImage;
          return isInitialDefault ? saved.slice(0, 3) : prev;
        });
      }
    }).catch(() => {});
  }, []);

  // Current active tab helper
  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateCurrentTab = (updates: Partial<HydraTabState>) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t))
    );
  };

  // Main Mode: BUILDER | GALERIA | GALERIA DE GERAÇÕES
  const [activeMode, setActiveMode] = useState<"builder" | "galeria" | "geracoes">("builder");

  // Galeria filters
  const [galeriaSubFilter, setGaleriaSubFilter] = useState<"curadoria" | "populares" | "recentes">("curadoria");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  // Galeria de Gerações filters
  const [geracoesFilter, setGeracoesFilter] = useState<"todos" | "favs">("todos");
  const [generationsList, setGenerationsList] = useState<Array<{ id: string; url: string; createdAt: number; isFav?: boolean }>>([
    {
      id: "gen-initial-1",
      url: "/hydra_files/thumbnail(10).webp",
      createdAt: Date.now() - 3600000,
    },
    {
      id: "gen-initial-2",
      url: "/hydra_files/thumbnail(4).webp",
      createdAt: Date.now() - 7200000,
    }
  ]);

  // UI state
    // Sincronizar galeria do Hydra em tempo real com o servidor e outros apps
  const recarregarGaleriaHydra = async () => {
    try {
      const [histRes, bffRes] = await Promise.all([
        fetch("/api/historico-imagens").catch(() => null),
        fetch("/api/bff/api/generations?limit=60").catch(() => null)
      ]);

      const foundList: Array<{ id: string; url: string; createdAt: number }> = [];

      if (histRes && histRes.ok) {
        const hData = await histRes.json();
        if (Array.isArray(hData.images)) {
          hData.images.forEach((img: any, idx: number) => {
            foundList.push({
              id: "hydra-srv-" + (img.filename || idx),
              url: img.url,
              createdAt: img.mtimeMs || Date.now()
            });
          });
        }
      }

      if (bffRes && bffRes.ok) {
        const bffData = await bffRes.json();
        if (Array.isArray(bffData.items)) {
          bffData.items.forEach((item: any, idx: number) => {
            const url = item.result_url || item.thumbnail_url;
            if (url && !foundList.some((f) => f.url === url)) {
              foundList.push({
                id: item.id || ("hydra-bff-" + idx),
                url,
                createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
              });
            }
          });
        }
      }

      const storeImages = useProjectStore.getState().galeriaImages || [];
      storeImages.forEach((url, idx) => {
        if (url && !foundList.some((f) => f.url === url)) {
          foundList.push({
            id: "hydra-store-" + idx,
            url,
            createdAt: Date.now()
          });
        }
      });

      const deleted = getDeletedImages();
      const validFound = foundList.filter((f) => {
        const bname = f.url.split("/").pop() || "";
        return !deleted.has(f.url) && !deleted.has(bname) && !deleted.has(f.id);
      });

      if (validFound.length > 0) {
        setGenerationsList((prev) => {
          const map = new Map<string, { id: string; url: string; createdAt: number; isFav?: boolean }>();
          validFound.forEach((it) => map.set(it.url, it));
          prev.forEach((it) => {
            const bname = it.url.split("/").pop() || "";
            if (!deleted.has(it.url) && !deleted.has(bname) && !deleted.has(it.id)) {
              if (!map.has(it.url)) map.set(it.url, it);
            }
          });
          const list = Array.from(map.values());
          list.sort((a, b) => b.createdAt - a.createdAt);
          return list;
        });
      }
    } catch (err) {
      console.warn("Erro ao recarregar galeria Hydra:", err);
    }
  };

  useEffect(() => {
    recarregarGaleriaHydra();
    const handleSync = () => recarregarGaleriaHydra();
    window.addEventListener("zion-generation-done", handleSync);
    window.addEventListener("focus", handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("zion-gallery-sync");
      bc.onmessage = () => handleSync();
    }

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        handleSync();
      }
    }, 2500);

    return () => {
      window.removeEventListener("zion-generation-done", handleSync);
      window.removeEventListener("focus", handleSync);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [isStyleNotesExpanded, setIsStyleNotesExpanded] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Paste image from clipboard support (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                updateCurrentTab({ productImage: reader.result as string });
                showToast?.("Imagem colada da área de transferência!", "success");
              };
              reader.readAsDataURL(blob);
              break;
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [activeTabId]);

  // Tab operations
  const handleAddNewTab = () => {
    if (tabs.length >= 3) {
      showToast?.("Limite máximo de 3 abas atingido.", "warning");
      return;
    }
    const nextNum = tabs.length + 1;
    const newTab: HydraTabState = {
      id: `tab-${Date.now()}`,
      title: `ABA ${nextNum}`,
      productImage: null,
      selectedInspirations: [],
      selectedDimension: "4:5",
      selectedQuality: "1K",
      subjectPosition: "auto",
      textSpace: "none",
      blurBackground: false,
      colorMode: "auto",
      manualColor: "#8b5cf6",
      visualStyle: "none",
      styleNotes: "",
      activeResultImage: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    showToast?.(`Nova aba ABA ${nextNum} criada!`, "info");
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
    }
  };

  const handleDuplicateTab = () => {
    if (tabs.length >= 3) {
      showToast?.("Limite máximo de 3 abas atingido.", "warning");
      return;
    }
    const nextNum = tabs.length + 1;
    const newTab: HydraTabState = {
      ...currentTab,
      id: `tab-${Date.now()}`,
      title: `ABA ${nextNum}`,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    showToast?.(`Configurações duplicadas para a ABA ${nextNum}!`, "success");
  };

  const handleResetTab = () => {
    updateCurrentTab({
      productImage: null,
      selectedInspirations: [],
      selectedDimension: "4:5",
      selectedQuality: "1K",
      subjectPosition: "auto",
      textSpace: "none",
      blurBackground: false,
      colorMode: "auto",
      manualColor: "#8b5cf6",
      visualStyle: "none",
      styleNotes: "",
      activeResultImage: null,
    });
    showToast?.("Configurações resetadas para os padrões oficiais.", "info");
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateCurrentTab({ productImage: reader.result as string });
        showToast?.("Foto do produto carregada!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // Inspiration card selection toggle (up to 3)
  const toggleInspiration = (card: HydraStyleCard) => {
    const isSelected = currentTab.selectedInspirations.some((c) => c.id === card.id);
    if (isSelected) {
      updateCurrentTab({
        selectedInspirations: currentTab.selectedInspirations.filter((c) => c.id !== card.id),
      });
      showToast?.(`Inspiração "${card.title}" removida.`, "info");
    } else {
      if (currentTab.selectedInspirations.length >= 3) {
        showToast?.("Limite máximo de 3 inspirações selecionadas atingido.", "warning");
        return;
      }
      updateCurrentTab({
        selectedInspirations: [...currentTab.selectedInspirations, card],
      });
      showToast?.(`Inspiração "${card.title}" adicionada! (${currentTab.selectedInspirations.length + 1}/3)`, "success");
    }
  };

  const removeInspirationById = (cardId: string) => {
    updateCurrentTab({
      selectedInspirations: currentTab.selectedInspirations.filter((c) => c.id !== cardId),
    });
  };

  // Category Carousel scroll
  const handleScrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  // Category mix detection (warning badge)
  const uniqueCategories = Array.from(new Set(currentTab.selectedInspirations.map((i) => i.category.toLowerCase())));
  const hasCategoryMix = uniqueCategories.length > 1;

  // Generate / Build
  const handleBuild = async () => {
    if (!currentTab.productImage) {
      showToast?.("Por favor, faça o upload de uma imagem do produto primeiro.", "warning");
      return;
    }
    setIsGenerating(true);
    showToast?.("Criando ensaio fotográfico de produto com Hydra...", "info");

    try {
      const apiKey = localStorage.getItem("custom_gemini_api_key") || "";
      let spatialRule = "";
      if (currentTab.textSpace === "left") {
        spatialRule = "NEGATIVE SPACE & COMPOSITION MANDATE: Strictly leave the entire LEFT SIDE (left 45% of the frame) clean and clear as open negative space for headline copy. Stage the physical product anchored on the RIGHT SIDE.";
      } else if (currentTab.textSpace === "right") {
        spatialRule = "NEGATIVE SPACE & COMPOSITION MANDATE: Strictly leave the entire RIGHT SIDE (right 45% of the frame) clean and clear as open negative space for headline copy. Stage the physical product anchored on the LEFT SIDE.";
      } else if (currentTab.subjectPosition === "left") {
        spatialRule = "PRODUCT POSITIONING: Stage the physical product anchored firmly on the LEFT SIDE of the frame.";
      } else if (currentTab.subjectPosition === "right") {
        spatialRule = "PRODUCT POSITIONING: Stage the physical product anchored firmly on the RIGHT SIDE of the frame.";
      } else if (currentTab.subjectPosition === "center") {
        spatialRule = "PRODUCT POSITIONING: Stage the physical product prominently in the horizontal CENTER of the frame with symmetrical lighting.";
      }

      const promptTxt = `PRODUCT PACKSHOT FIDELITY MANDATE — Image 1 is the physical product reference. Preserve 100% of the authentic product packaging, label typography, bottle/box geometry, brand logo, textures, and exact product dimensions from this image. Do not distort, redraw, or alter the product. Position and stage the real product in a world-class advertising studio setting: ${spatialRule} Estilos selecionados: ${
        currentTab.selectedInspirations.map((i) => i.title).join(", ") || "Comercial de alta conversão"
      }. Posição: ${currentTab.subjectPosition}. Espaço texto: ${currentTab.textSpace}. Fundo desfocado: ${
        currentTab.blurBackground ? "Sim" : "Não"
      }. Cor: ${currentTab.colorMode === "manual" ? currentTab.manualColor : "Auto"}. Estilo: ${
        currentTab.visualStyle
      }. Ajustes: ${currentTab.styleNotes}.`;

      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64DoSujeito: currentTab.productImage,
          sujeitosBase64List: [currentTab.productImage],
          designRefsList: currentTab.selectedInspirations.map((i) => i.src),
          promptTraduzido: promptTxt,
          resolutionInput: currentTab.selectedQuality,
          dimensao: currentTab.selectedDimension,
          formato: "PNG",
          useEnvRef: currentTab.selectedInspirations.length > 0,
          modelId: "default",
          customApiKey: apiKey,
          hydraData: {
            category: "Produto",
            inspirations: currentTab.selectedInspirations.map((i) => i.title),
            subjectPosition: currentTab.subjectPosition,
            textSpace: currentTab.textSpace,
            blurBackground: currentTab.blurBackground,
            colorMode: currentTab.colorMode,
            visualStyle: currentTab.visualStyle,
            notes: currentTab.styleNotes,
          },
        }),
      });

      const data = await res.json();
      const finalImg = data.image || data.imageUrl;
      if (finalImg) {
        showToast?.("Produto renderizado com sucesso!", "success");
        updateCurrentTab({ activeResultImage: finalImg });
        try {
          useProjectStore.getState().addGaleriaImage(finalImg, { app: "hydra" });
        } catch (_) {}
        setGenerationsList((prev) => [
          { id: Date.now().toString(), url: finalImg, createdAt: Date.now() },
          ...prev,
        ]);
        setActiveMode("builder");
      } else {
        showToast?.(data.error || "Erro ao gerar imagem.", "error");
      }
    } catch (error) {
      console.error("Erro no Hydra Builder:", error);
      showToast?.("Erro ao conectar com o servidor.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered Cards for Galeria
  const filteredCards = HYDRA_STYLE_CARDS.filter((card) => {
    if (selectedCategory !== "todos") {
      const catObj = HYDRA_CATEGORIES.find((c) => c.id === selectedCategory);
      if (catObj && card.category.toLowerCase() !== catObj.id.toLowerCase()) {
        return false;
      }
    }
    if (galeriaSubFilter === "curadoria") return card.isCurated;
    if (galeriaSubFilter === "populares") return card.isPopular;
    if (galeriaSubFilter === "recentes") return card.isRecent;
    return true;
  });

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-black text-white relative font-sans select-none">
      {/* ── COLUNA ESQUERDA: FORMULÁRIO COMPLETO DO HYDRA (320px) ── */}
      <aside
        data-aside-form-col=""
        data-tour="form"
        className="agent-form-col relative z-10 flex shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-2 py-3 lg:px-4 lg:py-5 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:h-full max-lg:order-2 max-lg:w-full max-lg:min-h-0 bg-black"
        style={{ width: "320px" }}
      >
        <div className="flex flex-col gap-5 flex-1 min-h-max">
          {/* 1. Upload de Imagem */}
          <div data-tour="form-sec-pf-produto" className="campo-com-info flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-white">Upload de Imagem</label>
              <button
                type="button"
                data-field-info=""
                aria-label="Mais informações Upload de Imagem"
                onClick={() => setActiveTooltip(activeTooltip === "upload" ? null : "upload")}
                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 text-violet-400"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2" data-image-field-id="product_images">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)] relative overflow-hidden group"
              >
                {currentTab.productImage ? (
                  <div className="relative w-full h-full p-2 flex items-center justify-center">
                    <img
                      src={currentTab.productImage}
                      alt="Produto"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      aria-label="Remover imagem"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCurrentTab({ productImage: null });
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-zinc-300 hover:text-red-400 backdrop-blur-md shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                    <span className="font-light text-[#5c5278] text-4xl group-hover:text-violet-400 transition-colors">+</span>
                    <span className="truncate text-xs text-[#5c5278] group-hover:text-zinc-300 transition-colors">
                      Clique, arraste ou cole (Ctrl+V)
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-[#5c5278]">Faça upload da imagem</p>
          </div>

          {/* 2. Inspirações selecionadas */}
          <div data-tour="form-sec-pf-refs" className="campo-com-info flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold text-white">Inspirações selecionadas</label>
                <button
                  type="button"
                  aria-label="Mais informações Inspirações selecionadas"
                  onClick={() => setActiveTooltip(activeTooltip === "insp" ? null : "insp")}
                  className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 text-violet-400"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs font-semibold text-zinc-500 tabular-nums">
                {currentTab.selectedInspirations.length}/3
              </span>
            </div>

            {currentTab.selectedInspirations.length === 0 ? (
              <button
                type="button"
                onClick={() => setActiveMode("galeria")}
                className="group flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 transition-all border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.06] to-fuchsia-500/[0.04] hover:border-violet-500/50 hover:from-violet-500/[0.12] hover:to-fuchsia-500/[0.08] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 ring-1 ring-violet-500/30 transition-colors group-hover:bg-violet-500/25">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-semibold text-zinc-200">Selecione inspirações</span>
                    <span className="text-[10px] text-[#5c5278]">Vá para a galeria de estilos</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-violet-400/70 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {currentTab.selectedInspirations.map((insp) => (
                  <div
                    key={insp.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border border-violet-500/40 bg-zinc-900 shadow-md"
                  >
                    <img src={insp.src} alt={insp.title} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remover inspiração"
                      onClick={() => removeInspirationById(insp.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {currentTab.selectedInspirations.length < 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveMode("galeria")}
                    className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 text-zinc-500 hover:text-violet-300 transition-all cursor-pointer"
                    title="Adicionar mais inspirações"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 3. Dimensões */}
          <div data-tour="form-sec-pf-config" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm">Dimensões</span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "dim" ? null : "dim")}
                  className="group inline-flex h-5 w-5 items-center justify-center rounded-full text-violet-400"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
                <div role="group" aria-label="Dimensões" className="flex flex-col gap-1.5">
                  {[
                    { key: "9:16", label: "Stories", ratio: "9:16" },
                    { key: "4:5", label: "Feed Vertical", ratio: "4:5" },
                    { key: "1:1", label: "Feed", ratio: "1:1" },
                    { key: "16:9", label: "Cinema", ratio: "16:9" },
                  ].map((dim) => {
                    const isSel = currentTab.selectedDimension === dim.key;
                    return (
                      <button
                        key={dim.key}
                        type="button"
                        onClick={() => updateCurrentTab({ selectedDimension: dim.key as any })}
                        className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all cursor-pointer ${
                          isSel
                            ? "bg-violet-600/20 border border-violet-500/40 text-white shadow-[0_0_14px_rgba(139,92,246,0.2)]"
                            : "bg-white/[0.03] border border-white/5 text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <span className="text-[12px] font-semibold">{dim.label}</span>
                        <span className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide bg-white/5 text-zinc-300">
                          {dim.ratio}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Aspect Ratio Box Preview */}
                <div
                  aria-hidden="true"
                  className="flex h-[170px] w-[120px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] p-2"
                >
                  <div
                    className="rounded-md transition-all duration-300"
                    style={{
                      width: currentTab.selectedDimension === "16:9" ? "100%" : "92%",
                      maxHeight: "92%",
                      aspectRatio:
                        currentTab.selectedDimension === "9:16"
                          ? "9 / 16"
                          : currentTab.selectedDimension === "4:5"
                          ? "4 / 5"
                          : currentTab.selectedDimension === "1:1"
                          ? "1 / 1"
                          : "16 / 9",
                      background: "linear-gradient(rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.063))",
                      border: "1.5px solid rgba(139, 92, 246, 0.333)",
                      boxShadow: "rgba(139, 92, 246, 0.133) 0px 0px 16px inset",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 4. Qualidade */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-sm">Qualidade</span>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === "qual" ? null : "qual")}
                    className="group inline-flex h-5 w-5 items-center justify-center rounded-full text-violet-400"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                    PADRÃO
                  </span>
                  <span className="text-[10px] tabular-nums text-zinc-500">928×1152</span>
                </div>
              </div>

              <div role="group" className="grid grid-cols-3 gap-2">
                {[
                  { key: "1K", label: "Rápido" },
                  { key: "2K", label: "Médio" },
                  { key: "4K", label: "Lento" },
                ].map((q) => {
                  const isSel = currentTab.selectedQuality === q.key;
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => updateCurrentTab({ selectedQuality: q.key as any })}
                      className={`group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer flex-col gap-1.5 py-3 ${
                        isSel
                          ? "border border-violet-500/50 bg-gradient-to-br from-violet-950/60 to-purple-950/70 shadow-[0_0_12px_rgba(139,92,246,0.19)] text-white"
                          : "border border-white/5 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-base font-bold leading-none">{q.key}</span>
                      <span className="font-medium uppercase tracking-[0.05em] text-[10px]">{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 5. Posição do Sujeito/produto (opcional) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-white">Posição do Sujeito/produto</label>
              <span className="text-[10px] text-[#5c5278] bg-white/5 px-1.5 py-0.5 rounded">(opcional)</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === "pos" ? null : "pos")}
                className="text-violet-400 hover:text-violet-300"
              >
                <Info size={14} />
              </button>
            </div>
            <p className="text-xs text-[#5c5278] italic">Usa a posição da inspiração selecionada</p>
            <div role="group" aria-label="Posição do sujeito" className="grid grid-cols-3 gap-2">
              {[
                { key: "left", label: "Esquerda" },
                { key: "center", label: "Centro" },
                { key: "right", label: "Direita" },
              ].map((pos) => {
                const isSel = currentTab.subjectPosition === pos.key;
                return (
                  <button
                    key={pos.key}
                    type="button"
                    onClick={() =>
                      updateCurrentTab({
                        subjectPosition: isSel ? "auto" : (pos.key as any),
                      })
                    }
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs transition-all cursor-pointer ${
                      isSel
                        ? "bg-violet-600/20 border border-violet-500/40 text-white shadow-sm"
                        : "border border-white/5 text-[#5c5278] hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    <span className="font-semibold">{pos.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 6. Espaço para Texto (opcional) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-white">Espaço para Texto</label>
              <span className="text-[10px] text-[#5c5278] bg-white/5 px-1.5 py-0.5 rounded">(opcional)</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === "txt" ? null : "txt")}
                className="text-violet-400 hover:text-violet-300"
              >
                <Info size={14} />
              </button>
            </div>
            <p className="text-xs text-[#5c5278] italic">
              {currentTab.textSpace === "none"
                ? "Sem espaço reservado para texto"
                : currentTab.textSpace === "top"
                ? "Espaço reservado na parte superior"
                : "Espaço reservado na parte inferior"}
            </p>
            <div role="group" aria-label="Espaço para texto" className="grid grid-cols-3 gap-2">
              {[
                { key: "none", label: "Nenhum" },
                { key: "top", label: "Superior" },
                { key: "bottom", label: "Inferior" },
              ].map((sp) => {
                const isSel = currentTab.textSpace === sp.key;
                return (
                  <button
                    key={sp.key}
                    type="button"
                    onClick={() => updateCurrentTab({ textSpace: sp.key as any })}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs transition-all cursor-pointer ${
                      isSel
                        ? "bg-violet-600/20 border border-violet-500/40 text-[#f0ecff] shadow-sm"
                        : "border border-white/5 text-[#5c5278] hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-10 rounded-sm border border-current/30 mb-0.5 flex flex-col overflow-hidden">
                      {sp.key === "top" && <div className="h-[40%] bg-current/20 border-b border-current/10" />}
                      <div className="flex-1" />
                      {sp.key === "bottom" && <div className="h-[40%] bg-current/20 border-t border-current/10" />}
                    </div>
                    <span className="text-[10px] font-medium">{sp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 7. Desfoque no fundo */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">Desfoque no fundo</span>
              <span className="text-xs text-[#5c5278]">Desfocar o fundo, produto em foco</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={currentTab.blurBackground}
              onClick={() => updateCurrentTab({ blurBackground: !currentTab.blurBackground })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                currentTab.blurBackground ? "bg-violet-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  currentTab.blurBackground ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 8. Cor principal (opcional) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-white">Cor principal</label>
              <span className="text-[10px] text-[#5c5278] bg-white/5 px-1.5 py-0.5 rounded">(opcional)</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === "cor" ? null : "cor")}
                className="text-violet-400 hover:text-violet-300"
              >
                <Info size={14} />
              </button>
            </div>
            <div role="group" aria-label="Modo de cor principal" className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateCurrentTab({ colorMode: "auto" })}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                  currentTab.colorMode === "auto"
                    ? "bg-violet-600/20 border border-violet-500/40 text-white shadow-sm"
                    : "border border-white/5 text-[#5c5278] hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40">
                  <Sparkles size={16} />
                </span>
                <span className="flex flex-col leading-tight min-w-0">
                  <span className="text-xs font-semibold text-[#f0ecff]">Auto</span>
                  <span className="text-[9px] text-[#5c5278] truncate">IA decide</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateCurrentTab({ colorMode: "manual" })}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                  currentTab.colorMode === "manual"
                    ? "bg-violet-600/20 border border-violet-500/40 text-white shadow-sm"
                    : "border border-white/5 text-[#5c5278] hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-full ring-1 ring-white/15"
                  style={{
                    background:
                      "conic-gradient(from 180deg, rgb(239, 68, 68), rgb(245, 158, 11), rgb(132, 204, 22), rgb(16, 185, 129), rgb(6, 182, 212), rgb(99, 102, 241), rgb(236, 72, 153), rgb(239, 68, 68))",
                  }}
                />
                <span className="flex flex-col leading-tight min-w-0">
                  <span className="text-xs font-semibold text-[#5c5278]">Manual</span>
                  <span className="text-[9px] text-[#5c5278] truncate">Escolher cor</span>
                </span>
              </button>
            </div>

            {currentTab.colorMode === "manual" && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-white/10">
                <input
                  type="color"
                  value={currentTab.manualColor && currentTab.manualColor.length === 7 ? currentTab.manualColor : "#7C3AED"}
                  onChange={(e) => updateCurrentTab({ manualColor: e.target.value })}
                  className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                />
                <div className="flex items-center rounded-lg bg-black/50 px-2 py-1 border border-white/10 focus-within:border-violet-400">
                  <span className="text-xs font-mono text-zinc-500 select-none mr-0.5">#</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={(currentTab.manualColor || "").replace("#", "")}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                      updateCurrentTab({ manualColor: `#${clean}` });
                    }}
                    placeholder="7C3AED"
                    className="w-16 text-xs font-mono uppercase text-zinc-200 bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-[#9d94bb]">
                A IA analisa o produto enviado e a inspiração selecionada para decidir as cores sozinha — ideal pra deixar a estética coerente sem se preocupar.
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 9. Estilo visual */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-white">Estilo visual</label>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === "estilo" ? null : "estilo")}
                className="text-violet-400 hover:text-violet-300"
              >
                <Info size={14} />
              </button>
            </div>
            <div role="group" aria-label="Estilo visual" className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => updateCurrentTab({ visualStyle: "none" })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  currentTab.visualStyle === "none"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-[#9d94bb] hover:text-white bg-white/5"
                }`}
              >
                Nenhum
              </button>
              <button
                type="button"
                onClick={() => updateCurrentTab({ visualStyle: "realistic" })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  currentTab.visualStyle === "realistic"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-[#9d94bb] hover:text-white bg-white/5"
                }`}
              >
                Retrato Realista
              </button>
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* 10. Ajustes de estilo (opcional) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-white">Ajustes de estilo</label>
                <span className="text-[10px] text-[#5c5278] bg-white/5 px-1.5 py-0.5 rounded">(opcional)</span>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "ajustes" ? null : "ajustes")}
                  className="text-violet-400 hover:text-violet-300"
                >
                  <Info size={14} />
                </button>
              </div>
              <span className="text-xs text-[#5c5278]">{currentTab.styleNotes.length}/700</span>
            </div>
            <div className="group relative">
              <textarea
                placeholder="Descreva ajustes de estilo (ex: fundo mais escuro, iluminação dramática)"
                rows={3}
                value={currentTab.styleNotes}
                maxLength={700}
                onChange={(e) => updateCurrentTab({ styleNotes: e.target.value })}
                className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 pb-8 text-sm text-white resize-none outline-none focus:border-violet-500/50"
              />
              <button
                type="button"
                onClick={() => setIsStyleNotesExpanded(true)}
                className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                title="Expandir editor"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1" />

          {/* 11. STICKY ACTION CARD (Sempre visível fixado na base da barra lateral) */}
          <div className="sticky bottom-3 z-30 -mx-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-white/10 bg-black/85 px-2 py-2 shadow-2xl backdrop-blur-md">
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleBuild}
                  disabled={isGenerating}
                  onMouseMove={handleButtonMouseMove}
                  className="group relative overflow-hidden flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg shadow-violet-950/40 hover:shadow-[0_0_28px_rgba(139,92,246,0.65)] hover:border-violet-400/40 border border-transparent cursor-pointer disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50"
                  style={{
                    background: "radial-gradient(140px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.28), transparent 75%), linear-gradient(to right, rgb(139, 92, 246), rgba(139, 92, 246, 0.85))",
                  }}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Construindo..." : "Construir"}</span>
                  <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                </button>
              </div>
              <div className="mt-2 px-1 pb-0.5">
                <div className="flex items-center justify-center gap-4 text-[11px] text-[#9d94bb]">
                  <button
                    type="button"
                    onClick={handleDuplicateTab}
                    title="Duplicar configurações para uma nova aba"
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Duplicar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTab}
                    title="Resetar todas as configurações do formulário"
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Resetar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="h-4 shrink-0" aria-hidden="true" />

          <div className="h-10 shrink-0" aria-hidden="true" />
        </div>
      </aside>

      {/* ── PALCO CENTRAL: ABAS & CANVAS ── */}
      <main className="relative flex-1 flex flex-col overflow-hidden max-lg:order-1 max-lg:min-h-0 bg-black">
        {/* Abas Superiores (Aba 1, Aba 2, etc.) */}
        <div className="absolute left-4 top-4 z-30 hidden lg:flex">
          <div role="tablist" aria-label="Abas de geração" className="pointer-events-auto flex min-w-0 max-w-[min(42vw,30rem)] flex-row items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isTabActive = tab.id === activeTabId;
              const isEditing = editingTabId === tab.id;
              return (
                <div key={tab.id} className="group relative flex w-fit shrink-0 items-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTabTitle}
                      autoFocus
                      onChange={(e) => setEditingTabTitle(e.target.value)}
                      onBlur={() => {
                        if (editingTabTitle.trim()) {
                          setTabs((prev) =>
                            prev.map((t) => (t.id === tab.id ? { ...t, title: editingTabTitle.trim() } : t))
                          );
                        }
                        setEditingTabId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingTabTitle.trim()) {
                            setTabs((prev) =>
                              prev.map((t) => (t.id === tab.id ? { ...t, title: editingTabTitle.trim() } : t))
                            );
                          }
                          setEditingTabId(null);
                        }
                      }}
                      className="inline-flex h-7 w-24 rounded-lg border border-purple-500 bg-purple-950/60 px-2 text-[11px] font-semibold uppercase text-white outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isTabActive}
                      onClick={() => setActiveTabId(tab.id)}
                      onDoubleClick={() => {
                        setEditingTabId(tab.id);
                        setEditingTabTitle(tab.title);
                      }}
                      className={`inline-flex h-7 max-w-[12rem] flex-none items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 outline-none cursor-pointer ${
                        isTabActive
                          ? "text-purple-300 border-purple-500/40 bg-purple-500/15 shadow-sm"
                          : "text-zinc-400 border-white/5 bg-zinc-900/40 hover:text-zinc-200 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="truncate" title="Duplo clique para renomear">{tab.title}</span>
                      {tabs.length > 1 && (
                        <span
                          onClick={(e) => handleCloseTab(e, tab.id)}
                          className="hover:text-red-400 p-0.5 rounded transition-colors"
                          title="Fechar aba"
                        >
                          <X size={11} />
                        </span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
            {tabs.length < 3 && (
              <button
                type="button"
                aria-label="Nova aba"
                onClick={handleAddNewTab}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300 cursor-pointer"
                title="Nova aba"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Seletor Central de Visualização (BUILDER | GALERIA | GALERIA DE GERAÇÕES) */}
        <div className="flex items-center justify-center gap-3 pt-4 pb-2">
          <div role="tablist" aria-label="Modo de visualização" className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/10 rounded-full">
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "builder"}
              onClick={() => setActiveMode("builder")}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeMode === "builder"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              BUILDER
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "galeria"}
              onClick={() => setActiveMode("galeria")}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeMode === "galeria"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              <span>GALERIA</span>
              {currentTab.selectedInspirations.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "geracoes"}
              onClick={() => setActiveMode("geracoes")}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeMode === "geracoes"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              GALERIA DE GERAÇÕES
            </button>
          </div>
        </div>

        {/* ── MODO 1: BUILDER ── */}
        {activeMode === "builder" && (
          <div className="flex flex-1 min-h-0 flex-row overflow-hidden">
            <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
              {/* Header: Estilos Ativos quando selecionados */}
              {currentTab.selectedInspirations.length > 0 && (
                <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-zinc-950/40">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                      ESTILOS ATIVOS:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {currentTab.selectedInspirations.map((insp) => (
                        <div key={insp.id} className="h-8 w-8 rounded-md overflow-hidden ring-1 ring-violet-500/40">
                          <img src={insp.src} alt={insp.title} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMode("galeria")}
                    className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Editar inspirações</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Canvas do Palco Central */}
              <div className="flex flex-1 min-h-0 items-center justify-center p-6 overflow-hidden">
                {isGenerating ? (
                  <div
                    className="relative flex flex-col items-center justify-center rounded-2xl border border-violet-500/40 overflow-hidden shadow-2xl shadow-violet-950/60 animate-in fade-in zoom-in-95 duration-300 w-full"
                    style={{
                      width: "min(92%, 480px)",
                      aspectRatio:
                        currentTab.selectedDimension === "9:16"
                          ? "9/16"
                          : currentTab.selectedDimension === "4:5"
                          ? "4/5"
                          : currentTab.selectedDimension === "1:1"
                          ? "1/1"
                          : "16/9",
                      maxHeight: "75vh"
                    }}
                  >
                    <GenerationLoadingCanvas
                      agentColor="#8b5cf6"
                      subMessage="Hydra sintetizando composição comercial com produto"
                    />
                  </div>
                ) : currentTab.activeResultImage ? (
                  <div className="relative max-h-full max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img
                      src={currentTab.activeResultImage}
                      alt="Resultado Hydra"
                      className="max-h-[75vh] w-auto object-contain rounded-2xl"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal(currentTab.activeResultImage!)}
                        className="p-2 rounded-xl bg-black/80 text-white hover:bg-black transition-colors backdrop-blur-md shadow-lg"
                        title="Ver em tela cheia"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = currentTab.activeResultImage!;
                          a.download = `hydra-${Date.now()}.png`;
                          a.click();
                        }}
                        className="p-2 rounded-xl bg-black/80 text-white hover:bg-black transition-colors backdrop-blur-md shadow-lg"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ) : currentTab.productImage ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div
                      className="rounded-2xl overflow-hidden border border-violet-500/30 shadow-2xl bg-zinc-950 flex items-center justify-center p-2"
                      style={{
                        aspectRatio:
                          currentTab.selectedDimension === "9:16"
                            ? "9/16"
                            : currentTab.selectedDimension === "4:5"
                            ? "4/5"
                            : currentTab.selectedDimension === "1:1"
                            ? "1/1"
                            : "16/9",
                        maxHeight: "65vh",
                      }}
                    >
                      <img
                        src={currentTab.productImage}
                        alt="Preview Produto"
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      Produto pronto. {currentTab.selectedInspirations.length > 0 ? "Clique em Construir para renderizar." : "Escolha estilos na Galeria ou clique em Construir."}
                    </p>
                  </div>
                ) : (
                  /* Empty state oficial do Hydra */
                  <div className="flex flex-col items-center justify-center gap-6 py-24 text-center max-w-sm mx-auto animate-in fade-in duration-300">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-20 w-20 rounded-full bg-violet-500/10 blur-2xl" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-800/20 ring-1 ring-white/10">
                        <ImagePlus className="h-7 w-7 text-violet-400/70" />
                      </div>
                      <div className="absolute -top-2 -right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-white/5">
                        <Sparkles className="h-3.5 w-3.5 text-violet-300/50" />
                      </div>
                      <div className="absolute -bottom-1 -left-3 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-white/5">
                        <Layers className="h-3.5 w-3.5 text-violet-300/50" />
                      </div>
                    </div>

                    <div className="text-center space-y-1.5">
                      <p className="text-sm font-medium text-[#9d94bb]">Pronto para criar</p>
                      <p className="text-xs text-[#5c5278] max-w-[240px] leading-relaxed">
                        Escolha estilos na galeria, suba a foto do produto e clique em Construir
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveMode("galeria")}
                      className="mt-1 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-200 hover:bg-violet-600/30 hover:text-white px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Ir para Galeria
                    </button>
                  </div>
                )}
              </div>

              {/* Magic Refine Bar */}
              {currentTab.activeResultImage && !isGenerating && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex w-[min(92vw,480px)] flex-col items-center gap-2 pointer-events-auto">
                  <MagicRefineBar
                    activeImage={currentTab.activeResultImage}
                    isProcessing={isGenerating}
                    agentColor="#8b5cf6"
                    placeholder="Descreva o que deseja alterar nesta composição..."
                    onPublishCommunity={() => {
                      onOpenCommunity?.();
                      showToast?.("Publicação na comunidade iniciada!", "info");
                    }}
                    onSendRefine={(text, _attachments, _isBrush) => {
                      showToast?.("Refinamento via Hydra em desenvolvimento.", "info");
                    }}
                  />
                </div>
              )}
            </div>

            {/* Coluna Lateral de Histórico (72px) Oficial */}
            <div
              data-tour="history"
              className="coluna-de-historico relative z-10 hidden h-full shrink-0 flex-col lg:flex"
              style={{ width: "72px" }}
            >
              <div
                className="historico-lateral absolute right-0 top-0 flex h-full flex-col border-l border-white/[0.04] bg-black"
                style={{ width: "72px" }}
              >
                <div
                  className="absolute left-0 top-0 z-20 h-full w-1.5 -translate-x-1/2 cursor-col-resize transition-colors hover:bg-violet-500/30"
                  title="Arraste para redimensionar"
                />
                <div className="flex-1 space-y-1.5 overflow-y-auto px-1.5 py-2 scrollbar-hide">
                  {generationsList.map((gen) => (
                    <div
                      key={gen.id}
                      className="group relative w-full overflow-hidden rounded-lg border transition-all duration-200 border-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_6px_rgba(139,92,246,0.08)] cursor-pointer"
                    >
                      <button
                        type="button"
                        onClick={() => updateCurrentTab({ activeResultImage: gen.url })}
                        className="block w-full"
                        title="Geração — clique para visualizar no palco"
                      >
                        <img
                          alt="Geração"
                          src={gen.url}
                          className="block w-full bg-black object-cover cursor-grab active:cursor-grabbing"
                          loading="lazy"
                          decoding="async"
                          style={{
                            aspectRatio: (gen as any).aspect || ((currentTab as any).dimension ? (currentTab as any).dimension.replace(":", " / ") : "4 / 5")
                          }}
                          onLoad={(e) => {
                            const { naturalWidth, naturalHeight } = e.currentTarget;
                            if (naturalWidth && naturalHeight) {
                              e.currentTarget.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
                            }
                          }}
                        />
                      </button>
                      <div
                        className="pointer-events-none absolute left-1 top-1 z-10 flex items-center rounded border px-1 py-0.5 text-[8px] font-semibold leading-none shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 border-violet-400/30 bg-violet-950/85 text-violet-200"
                      >
                        <span>Geração</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const filename = gen.url.split("/").pop() || "";
                          addDeletedImage(gen.id);
                          addDeletedImage(gen.url);
                          addDeletedImage(filename);
                          useProjectStore.getState().deleteGaleriaImage(gen.url);
                          fetch(`/api/bff/api/generations/${gen.id}`, { method: "DELETE" }).catch(() => {});
                          if (filename.endsWith(".png") || filename.endsWith(".avif") || filename.endsWith(".webp") || filename.endsWith(".jpg")) {
                            fetch(`/api/historico-imagens/${filename}`, { method: "DELETE" }).catch(() => {});
                          }
                          setGenerationsList((prev) => prev.filter((g) => g.id !== gen.id));
                          showToast?.("Geração excluída permanentemente.", "info");
                        }}
                        className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-zinc-300 ring-1 ring-white/10 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-300"
                        title="Remover geração"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODO 2: GALERIA DE ESTILOS E INSPIRAÇÕES ── */}
        {activeMode === "galeria" && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden relative bg-black">
            {/* Top Bar da Galeria: Filtros Curadoria, Populares, Recentes */}
            <div className="flex items-center justify-end px-6 pt-3 pb-2 border-b border-white/5">
              <div className="flex items-center gap-1 rounded-xl bg-zinc-950 border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setGaleriaSubFilter("curadoria")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    galeriaSubFilter === "curadoria"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Curadoria</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGaleriaSubFilter("populares")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    galeriaSubFilter === "populares"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TrendingUp size={13} />
                  <span>Populares</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGaleriaSubFilter("recentes")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    galeriaSubFilter === "recentes"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Clock size={13} />
                  <span>Recentes</span>
                </button>
              </div>
            </div>

            {/* Carrossel Horizontal de Categorias com setas oficiais */}
            <div className="relative shrink-0 px-6 py-3 border-b border-white/5">
              <button
                type="button"
                aria-label="Rolar categorias para esquerda"
                onClick={() => handleScrollCategories("left")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Rolar categorias para direita"
                onClick={() => handleScrollCategories("right")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>

              <div
                ref={categoryScrollRef}
                className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-6 scroll-smooth"
              >
                {HYDRA_CATEGORIES.map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`relative flex-shrink-0 h-28 w-44 rounded-2xl overflow-hidden border transition-all cursor-pointer text-left group ${
                        isCatSelected
                          ? "border-violet-500 ring-2 ring-violet-500/40 shadow-lg shadow-violet-950/40"
                          : "border-white/10 hover:border-white/25"
                      }`}
                      style={{
                        background: cat.img
                          ? "transparent"
                          : "linear-gradient(135deg, rgb(24, 17, 43), rgb(11, 7, 21))",
                      }}
                    >
                      {cat.img ? (
                        <>
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-base font-bold text-white tracking-wide">{cat.name}</span>
                        </div>
                      )}
                      {cat.img && (
                        <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex flex-col">
                          <span className="text-xs font-bold text-white leading-snug">{cat.name}</span>
                          <span className="text-[9px] text-zinc-300 truncate">{cat.sub}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Barra de Inspirações Selecionadas acima do Grid */}
            {currentTab.selectedInspirations.length > 0 && (
              <div className="shrink-0 px-6 py-2.5 bg-[#0e0a1f] border-b border-violet-500/20 flex items-center justify-between animate-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                      INSPIRAÇÕES SELECIONADAS
                    </span>
                    <span className="rounded-md bg-violet-600/30 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                      {currentTab.selectedInspirations.length}/3
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentTab.selectedInspirations.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col items-center rounded-lg overflow-hidden border border-violet-500/40 bg-zinc-900 w-12 h-14"
                      >
                        <img src={item.src} alt={item.title} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-center text-zinc-300 py-0.5 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInspirationById(item.id)}
                          className="absolute top-0.5 right-0.5 bg-black/70 rounded p-0.5 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {currentTab.selectedInspirations.length < 3 && (
                      <div className="flex items-center justify-center h-14 w-12 rounded-lg border-2 border-dashed border-white/20 text-zinc-500">
                        <Plus size={16} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasCategoryMix && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium">
                      <AlertTriangle size={13} className="text-amber-400" />
                      <span>Mix de categorias: {uniqueCategories.join(" + ")}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveMode("builder")}
                    className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Continuar para o Builder</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Grid 4 Colunas de Inspirações com TODOS OS BOTÕES OFICIAIS */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-hide">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCards.map((card) => {
                  const isCardSelected = currentTab.selectedInspirations.some((c) => c.id === card.id);
                  return (
                    <div
                      key={card.id}
                      className={`group relative rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-200 aspect-[4/5] ${
                        isCardSelected
                          ? "border-violet-500 ring-2 ring-violet-500/50 shadow-xl shadow-violet-950/50"
                          : "border-white/10 hover:border-white/30 hover:shadow-lg"
                      }`}
                    >
                      <img
                        src={card.src}
                        alt={card.title}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />

                      {/* Checkmark Badge no Canto Superior Direito quando Selecionado */}
                      {isCardSelected && (
                        <div className="absolute top-2.5 right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-2 ring-white/30 animate-in zoom-in-75">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      )}

                      {/* Mobile 3-dots Menu Button */}
                      <button
                        type="button"
                        aria-label="Ver detalhes e ações"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImageModal(card.src);
                        }}
                        className="lg:hidden absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/15 backdrop-blur-md active:scale-95"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {/* OVERLAY DE HOVER COM TODOS OS BOTÕES OFICIAIS */}
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-violet-950/70 via-violet-950/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {/* Botão Central: Selecionar / Selecionado */}
                        <button
                          type="button"
                          onClick={() => toggleInspiration(card)}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            isCardSelected
                              ? "bg-violet-600 ring-1 ring-white/40 shadow-violet-900/60"
                              : "bg-gradient-to-br from-violet-500/45 via-violet-600/35 to-fuchsia-500/30 ring-1 ring-white/30 shadow-violet-900/50 hover:bg-violet-500/60"
                          }`}
                        >
                          {isCardSelected ? (
                            <>
                              <Check className="h-4 w-4 stroke-[3]" />
                              <span>Selecionado</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 stroke-[3]" />
                              <span>Selecionar</span>
                            </>
                          )}
                        </button>

                        {/* Botão Reutilizar com RotateCcw */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCardSelected) {
                              toggleInspiration(card);
                            }
                            setActiveMode("builder");
                            showToast?.(`Estilo "${card.title}" aplicado no Builder!`, "success");
                          }}
                          className="flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold text-white bg-black/55 ring-1 ring-white/20 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:bg-violet-500/35 hover:ring-violet-300/50 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Reutilizar</span>
                        </button>

                        {/* Linha de Ícones: Ver maior + Salvar em Meus arquivos */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Ver maior"
                            aria-label="Ver maior"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImageModal(card.src);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white bg-black/55 ring-1 ring-white/20 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:bg-violet-500/35 hover:ring-violet-300/50 cursor-pointer"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Salvar em Meus arquivos"
                            aria-label="Salvar em Meus arquivos"
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast?.(`Inspiração "${card.title}" salva em Meus Arquivos!`, "success");
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white bg-black/55 ring-1 ring-white/20 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:bg-violet-500/35 hover:ring-violet-300/50 cursor-pointer"
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pill Flutuante de Status no Canto Inferior Direito */}
            <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl bg-zinc-950/95 border border-white/10 p-3 shadow-2xl backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                {currentTab.selectedInspirations.length}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white">Selecione imagens de inspiração</span>
                <span className="text-[10px] text-zinc-400">
                  {currentTab.selectedInspirations.length === 0
                    ? "Clique nas imagens para escolher (até 3)"
                    : `${currentTab.selectedInspirations.length} de 3 selecionadas`}
                </span>
              </div>
              {currentTab.selectedInspirations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveMode("builder")}
                  className="ml-2 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-violet-500 transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── MODO 3: GALERIA DE GERAÇÕES ── */}
        {activeMode === "geracoes" && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-black p-6">
            {/* Top Bar da Galeria de Gerações */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGeracoesFilter("todos")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    geracoesFilter === "todos"
                      ? "bg-violet-600 text-white shadow-lg"
                      : "text-zinc-400 hover:text-white bg-white/5"
                  }`}
                >
                  TODOS
                </button>
                <button
                  type="button"
                  onClick={() => setGeracoesFilter("favs")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    geracoesFilter === "favs"
                      ? "bg-violet-600 text-white shadow-lg"
                      : "text-zinc-400 hover:text-white bg-white/5"
                  }`}
                >
                  FAVS
                </button>
              </div>

              <button
                type="button"
                onClick={() => showToast?.("Histórico de gerações atualizado!", "success")}
                className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Atualizar histórico"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Conteúdo de Gerações */}
            <div className="flex flex-1 min-h-0 items-center justify-center p-6 overflow-y-auto">
              {generationsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-zinc-600 border border-white/5">
                    <ImagePlus size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-300">Sem gerações ainda</p>
                    <p className="text-xs text-zinc-500">Suas próximas gerações aparecerão aqui.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full">
                  {generationsList.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 aspect-[4/5]"
                    >
                      <img src={item.url} alt="Geração" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal(item.url)}
                          className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                          title="Ver ampliada"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = item.url;
                            a.download = `hydra-${item.id}.png`;
                            a.click();
                          }}
                          className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Tooltip / Explicação dos Campos */}
      {activeTooltip && (
        <div
          onClick={() => setActiveTooltip(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#100c22] p-5 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                <Info size={16} />
                <span>Informação do Campo</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTooltip(null)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeTooltip === "upload" && "Envie a foto do produto ou elemento que deseja destacar na composição."}
              {activeTooltip === "insp" && "Selecione até 3 estilos da galeria para orientar o design, iluminação e cores."}
              {activeTooltip === "dim" && "Escolha a proporção ideal para o seu canal (Feed 4:5 ou 1:1, Stories 9:16, Cinema 16:9)."}
              {activeTooltip === "qual" && "Resolução de renderização final da imagem gerada."}
              {activeTooltip === "pos" && "Define o alinhamento do produto na imagem (Esquerda, Centro ou Direita)."}
              {activeTooltip === "txt" && "Reserva áreas limpas no topo ou na base para inserção de títulos e tipografia."}
              {activeTooltip === "cor" && "A IA analisa o produto enviado e a inspiração para decidir a paleta, ou você pode definir manualmente."}
              {activeTooltip === "estilo" && "Selecione o motor de acabamento artístico para aplicar sobre o produto."}
              {activeTooltip === "ajustes" && "Escreva instruções adicionais para a IA refinar o cenário, luz ou sombras."}
            </p>
          </div>
        </div>
      )}

      {/* Modal Expandido de Ajustes de Estilo */}
      {isStyleNotesExpanded && (
        <div
          onClick={() => setIsStyleNotesExpanded(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-violet-500/30 bg-[#0e0a1f] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-sm font-bold text-white">Editor de Ajustes de Estilo</span>
              <button
                type="button"
                onClick={() => setIsStyleNotesExpanded(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              rows={8}
              value={currentTab.styleNotes}
              maxLength={700}
              onChange={(e) => updateCurrentTab({ styleNotes: e.target.value })}
              placeholder="Descreva ajustes de estilo (ex: fundo mais escuro, iluminação dramática, partículas ao redor...)"
              className="w-full rounded-xl bg-black/60 border border-white/10 p-3 text-sm text-white resize-none outline-none focus:border-violet-500/60"
            />
            <div className="flex items-center justify-between pt-3 text-xs text-zinc-400">
              <span>{currentTab.styleNotes.length} / 700 caracteres</span>
              <button
                type="button"
                onClick={() => setIsStyleNotesExpanded(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md cursor-pointer"
              >
                Salvar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualização de imagem em tamanho grande */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={previewImageModal} alt="Ampliada" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydraBuilder;
