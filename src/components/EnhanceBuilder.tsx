import { getAuthHeaders, getCurrentUserEmail } from "../utils/userAuth";
import { useProjectStore, addDeletedImage } from "../store/useProjectStore";
import React, { useState, useRef, useEffect } from "react";
import {
  Info,
  Crop,
  X,
  Sun,
  Sparkles,
  Camera,
  Maximize2,
  Copy,
  RotateCcw,
  Plus,
  Image as ImageIcon,
  Home,
  Palette,
  SlidersHorizontal,
  Check,
  Download,
  ExternalLink,
  ArrowLeftRight,
  Heart,
  Trash2,
  FileText,
  Clock,
  Eye,
} from "lucide-react";
import { ImageCropModal } from "./ImageCropModal";
import { CompareSlider } from "./CompareSlider";
import { downloadImage } from "../utils/downloadImage";
import { GenerationLoadingCanvas } from "./GenerationLoadingCanvas";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { MagicRefineBar } from "./MagicRefineBar";

export interface EnhanceHistoryItem {
  id: string;
  originalUrl: string;
  enhancedUrl: string;
  style: "fotografia" | "estudio" | "hiper_realismo";
  dimension: "9:16" | "4:5" | "1:1" | "16:9";
  quality: "1K" | "2K" | "4K";
  timestamp: number;
  isFav?: boolean;
}

export interface EnhanceTabState {
  id: string;
  name: string;
  photoBase64: string;
  enhancedImage: string;
  selectedStyle: "fotografia" | "estudio" | "hiper_realismo";
  dimension: "9:16" | "4:5" | "1:1" | "16:9";
  quality: "1K" | "2K" | "4K";
  extraInstructions: string;
}

const defaultEnhanceTab: EnhanceTabState = {
  id: "tab-1",
  name: "Aba 1",
  photoBase64: "",
  enhancedImage: "",
  selectedStyle: "hiper_realismo",
  dimension: "9:16",
  quality: "2K",
  extraInstructions: ""
};

interface EnhanceBuilderProps {
  onSwitchAgent?: (agentSlug: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const EnhanceBuilder: React.FC<EnhanceBuilderProps> = ({
  onSwitchAgent,
  onOpenVitrine,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onOpenReport,
  showToast,
}) => {
  // Initial state aligned with official Design Builder Enhance
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [enhancedImage, setEnhancedImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [historyItems, setHistoryItems] = useState<EnhanceHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("zion_enhance_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const store = useProjectStore();
  const [mobileView, setMobileView] = useState<"form" | "palco">("form");
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const allHistoryItems = React.useMemo(() => {
    const map = new Map<string, EnhanceHistoryItem>();
    historyItems.forEach((h) => map.set(h.enhancedUrl, h));
    (store.galeriaImages || []).forEach((url, idx) => {
      if (!map.has(url)) {
        map.set(url, {
          id: `store-enh-${idx}`,
          originalUrl: url,
          enhancedUrl: url,
          style: "hiper_realismo",
          dimension: "4:5",
          quality: "2K",
          timestamp: Date.now() - idx * 1000,
        });
      }
    });
    return Array.from(map.values());
  }, [historyItems, store.galeriaImages]);
  const [selectedStyle, setSelectedStyle] = useState<"fotografia" | "estudio" | "hiper_realismo">("hiper_realismo");
  const [dimension, setDimension] = useState<"9:16" | "4:5" | "1:1" | "16:9">("9:16");
  const [quality, setQuality] = useState<"1K" | "2K" | "4K">("2K");
  const [extraInstructions, setExtraInstructions] = useState("");
  
  // Multi-Tab System: Strictly up to 3 tabs ("Aba 1", "Aba 2", "Aba 3") with persistent storage
  const [tabs, setTabs] = useState<EnhanceTabState[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_enhance_tabs_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3).map((t: any, idx: number) => ({
              ...t,
              name: t.name && t.name.startsWith("Aba ") ? t.name : `Aba ${idx + 1}`
            }));
          }
        }
      } catch (e) {}
    }
    return [defaultEnhanceTab];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_enhance_active_tab_id");
        if (saved) return saved;
      } catch (e) {}
    }
    return "tab-1";
  });
  const activeTabName = tabs.find(t => t.id === activeTabId)?.name || "Aba 1";

  // Persist tabs and activeTabId to LocalStorage and IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem("zion_enhance_tabs_v2", JSON.stringify(tabs));
      idbSet("zion_enhance_tabs_idb", tabs).catch(() => {});
    } catch (e) {
      idbSet("zion_enhance_tabs_idb", tabs).catch(() => {});
    }
  }, [tabs]);

  useEffect(() => {
    try {
      localStorage.setItem("zion_enhance_active_tab_id", activeTabId);
    } catch (e) {}
  }, [activeTabId]);

  // Rehydrate from IndexedDB on initial mount
  useEffect(() => {
    idbGet("zion_enhance_tabs_idb").then((saved) => {
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setTabs(prev => {
          const isInitialDefault = prev.length === 1 && !prev[0].photoBase64 && !prev[0].enhancedImage;
          if (isInitialDefault) {
            const first = saved[0];
            setPhotoBase64(first.photoBase64 || "");
            setEnhancedImage(first.enhancedImage || "");
            setSelectedStyle(first.selectedStyle || "hiper_realismo");
            setDimension(first.dimension || "9:16");
            setQuality(first.quality || "2K");
            setExtraInstructions(first.extraInstructions || "");
            setActiveTabId(first.id);
            return saved.slice(0, 3);
          }
          return prev;
        });
      }
    }).catch(() => {});
  }, []);

  // Sync active form changes into tabs list
  useEffect(() => {
    setTabs(prev =>
      prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            photoBase64,
            enhancedImage,
            selectedStyle,
            dimension,
            quality,
            extraInstructions
          };
        }
        return t;
      })
    );
  }, [photoBase64, enhancedImage, selectedStyle, dimension, quality, extraInstructions, activeTabId]);

  const switchTab = (targetId: string) => {
    if (targetId === activeTabId) return;
    const targetTab = tabs.find(t => t.id === targetId);
    if (targetTab) {
      setPhotoBase64(targetTab.photoBase64);
      setEnhancedImage(targetTab.enhancedImage);
      setSelectedStyle(targetTab.selectedStyle);
      setDimension(targetTab.dimension);
      setQuality(targetTab.quality);
      setExtraInstructions(targetTab.extraInstructions);
    }
    setActiveTabId(targetId);
  };

  const handleAddNewTab = () => {
    if (tabs.length >= 3) return;
    const nextNum = tabs.length + 1;
    const newTab: EnhanceTabState = {
      ...defaultEnhanceTab,
      id: `tab-${Date.now()}`,
      name: `Aba ${nextNum}`
    };
    setTabs(prev => [...prev, newTab]);
    setPhotoBase64("");
    setEnhancedImage("");
    setSelectedStyle("hiper_realismo");
    setDimension("9:16");
    setQuality("2K");
    setExtraInstructions("");
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      const nextTab = remaining[0];
      setPhotoBase64(nextTab.photoBase64);
      setEnhancedImage(nextTab.enhancedImage);
      setSelectedStyle(nextTab.selectedStyle);
      setDimension(nextTab.dimension);
      setQuality(nextTab.quality);
      setExtraInstructions(nextTab.extraInstructions);
      setActiveTabId(nextTab.id);
    }
  };

  const handleDuplicate = () => {
    if (tabs.length >= 3) return;
    const nextNum = tabs.length + 1;
    const newTab: EnhanceTabState = {
      id: `tab-${Date.now()}`,
      name: `Aba ${nextNum}`,
      photoBase64,
      enhancedImage,
      selectedStyle,
      dimension,
      quality,
      extraInstructions
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const [activeStageMode, setActiveStageMode] = useState<"builder" | "galeria">("builder");
  const [historyTab, setHistoryTab] = useState<"todos" | "favs">("todos");
  const [isExpandInstructionsOpen, setIsExpandInstructionsOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [showFieldInfo, setShowFieldInfo] = useState<string | null>(null);
  const [isInFlowVisible, setIsInFlowVisible] = useState(true);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatePromptOnly, setGeneratePromptOnly] = useState<boolean>(false);
  const [masterPromptResult, setMasterPromptResult] = useState<string | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inFlowButtonRef = useRef<HTMLDivElement | null>(null);

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  useEffect(() => {
    try {
      localStorage.setItem("zion_enhance_history", JSON.stringify(historyItems));
    } catch (e) {
      console.warn("Falha ao persistir histórico do Enhance:", e);
    }
  }, [historyItems]);

  useEffect(() => {
    if (!inFlowButtonRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInFlowVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(inFlowButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const styleDescriptions: Record<"fotografia" | "estudio" | "hiper_realismo", string> = {
    fotografia:
      "Transforma uma foto comum em fotografia editorial profissional, elevando o realismo e a iluminação sem alterar a identidade ou o cenário.",
    estudio:
      "Retoque de estúdio — pele refinada, cores corrigidas, iluminação aprimorada, acabamento editorial.",
    hiper_realismo:
      "Quebra o look de IA: pele com poros reais, cabelo com fios individuais, olhos com textura humana. Para imagens geradas que parecem artificiais.",
  };

  const qualityResolutionMap: Record<"9:16" | "4:5" | "1:1" | "16:9", Record<"1K" | "2K" | "4K", string>> = {
    "9:16": { "1K": "768×1376", "2K": "1536×2752", "4K": "2160×3840" },
    "4:5": { "1K": "819×1024", "2K": "1638×2048", "4K": "3276×4096" },
    "1:1": { "1K": "1024×1024", "2K": "2048×2048", "4K": "4096×4096" },
    "16:9": { "1K": "1376×768", "2K": "2752×1536", "4K": "3840×2160" },
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setPhotoBase64(b64);
      setEnhancedImage("");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleCopyPrompt = async () => {
    if (!masterPromptResult) return;
    try {
      await navigator.clipboard.writeText(masterPromptResult);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = masterPromptResult;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    }
  };

  const handleEnhance = async () => {
    if (!photoBase64 || isProcessing) return;
    setIsProcessing(true);
    setMobileView("palco");
    setIsComparing(false);
    try {
      const apiKey = localStorage.getItem("custom_gemini_api_key") || localStorage.getItem("custom_api_key") || "";

      // ── MODO 1: GERAR APENAS O PROMPT MESTRE (0 CRÉDITOS) ──
      if (generatePromptOnly) {
        const res = await fetch("/api/enhancer-supir-magnific", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
          body: JSON.stringify({
            imageBase64: photoBase64,
            mode: selectedStyle,
            dimension,
            quality,
            instructions: extraInstructions,
            customApiKey: apiKey,
            somentePrompt: true,
            generatePromptOnly: true,
          }),
        });
        const data = await res.json();
        if (res.ok && data.prompt) {
          setMasterPromptResult(data.prompt);
          setIsPromptModalOpen(true);
        } else {
          setErrorMessage(data?.error || "Não foi possível sintetizar o prompt.");
        }
        setIsProcessing(false);
        return;
      }

      // ── MODO 2: MELHORAR IMAGEM COM IA GENERATIVA (1 CRÉDITO) ──
      const res = await fetch("/api/enhancer-supir-magnific", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
        body: JSON.stringify({
          imageBase64: photoBase64,
          mode: selectedStyle,
          dimension,
          quality,
          instructions: extraInstructions,
          customApiKey: apiKey,
        }),
      });
      const data = await res.json();
      const resultImg = data.image || data.outputBase64;
      if (res.ok && resultImg) {
        setEnhancedImage(resultImg);
        const newItem: EnhanceHistoryItem = {
          id: `enh_${Date.now()}`,
          originalUrl: photoBase64,
          enhancedUrl: resultImg,
          style: selectedStyle,
          dimension,
          quality,
          timestamp: Date.now(),
        };
        setHistoryItems((prev) => [newItem, ...prev.filter((it) => it.id !== newItem.id)]);
        try {
          useProjectStore.getState().addGaleriaImage(resultImg, { app: "enhance" });
        } catch (_) {}
      } else {
        if (data?.errorCode === "BILLING_DISABLED" || res.status === 403 || String(data?.error).includes("BILLING_DISABLED")) {
          setBillingModalOpen(true);
        } else {
          setErrorMessage(data?.error || "Não foi possível processar a melhoria da imagem.");
        }
      }
    } catch (err: any) {
      console.error("Erro no Enhance:", err);
      setErrorMessage("Erro de conexão ao processar melhoria: " + (err.message || "Tente novamente."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefine = async (refinePrompt: string) => {
    if ((!enhancedImage && !photoBase64) || isProcessing) return;
    setIsProcessing(true);
    setMobileView("palco");
    setIsComparing(false);
    try {
      const apiKey = localStorage.getItem("custom_gemini_api_key") || localStorage.getItem("custom_api_key") || "";
      const sourceImage = enhancedImage || photoBase64;

      const res = await fetch("/api/enhancer-supir-magnific", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
        body: JSON.stringify({
          imageBase64: sourceImage,
          mode: selectedStyle,
          dimension,
          quality,
          instructions: refinePrompt,
          customApiKey: apiKey,
          somentePrompt: false,
          generatePromptOnly: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao refinar imagem.");
      }

      if (data.enhancedImage) {
        setEnhancedImage(data.enhancedImage);
        const newItem: EnhanceHistoryItem = {
          id: `enh-${Date.now()}`,
          originalUrl: photoBase64,
          enhancedUrl: data.enhancedImage,
          style: selectedStyle,
          dimension,
          quality,
          timestamp: Date.now(),
        };
        setHistoryItems((prev) => [newItem, ...prev.filter((it) => it.id !== newItem.id)]);
        if (showToast) showToast("Aprimoramento concluído com sucesso!", "success");
      }
    } catch (err: any) {
      console.error("[EnhanceBuilder] Erro ao refinar:", err);
      if (showToast) showToast(err.message || "Erro ao refinar imagem", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPhotoBase64("");
    setEnhancedImage("");
    setIsComparing(false);
    setExtraInstructions("");
    setSelectedStyle("hiper_realismo");
    setDimension("9:16");
    setQuality("2K");
  };

  return (
    <div
      data-builder-workspace-shell=""
      className={`relative flex h-full min-h-0 overflow-hidden bg-black lg:flex-row max-lg:grid max-lg:overflow-hidden max-lg:transition-[grid-template-rows] max-lg:duration-300 max-lg:ease-in-out max-lg:pt-[env(safe-area-inset-top)] flex-1 ${
        (mobileView === "form" && !isProcessing) ? "max-lg:grid-rows-[0fr_1fr]" : "max-lg:grid-rows-[1fr_0fr]"
      }`}
    >
      {/* ── ASIDE FORM COL (420px) ── */}
      <aside
        data-aside-form-col=""
        data-tour="form"
        className="agent-form-col relative z-10 flex shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] gap-5 lg:gap-6 lg:sticky lg:top-0 lg:h-full max-lg:order-2 max-lg:w-full max-lg:min-h-0"
        style={{ width: "420px", minWidth: "280px", maxWidth: "700px" }}
      >
        {/* 1. Foto para melhorar */}
        <div data-tour="form-sec-ef-foto" className="campo-com-info">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#9d94bb] mb-2">
            <span>Foto para melhorar</span>
            <span className="relative inline-flex items-center">
              <button
                type="button"
                data-field-info=""
                aria-label="Mais informações Foto para melhorar"
                aria-expanded="false"
                onClick={() => setShowFieldInfo(showFieldInfo === "foto" ? null : "foto")}
                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                style={{ color: "rgb(167, 139, 250)" }}
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </span>
          </label>
          <div className="flex flex-col gap-2" data-image-field-id="foto_original">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                <span>Arraste ou clique para enviar sua foto</span>
              </label>
            </div>
            <div tabIndex={-1} className="relative flex flex-col outline-none gap-2">
              {photoBase64 ? (
                <div
                  className="relative group h-48 w-full overflow-hidden rounded-xl cursor-pointer"
                  style={{ border: "1px solid rgba(139, 92, 246, 0.25)" }}
                >
                  <img alt="imagem 1" className="h-full w-full object-cover" src={photoBase64} />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity">
                    <button
                      type="button"
                      aria-label="Recortar imagem"
                      title="Recortar imagem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCropModalOpen(true);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/80 text-white backdrop-blur-sm hover:bg-violet-600 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Crop className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remover imagem 1"
                      title="Remover imagem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoBase64("");
                        setEnhancedImage("");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur-sm hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                >
                  <div className="flex min-w-0 flex-col items-center text-center">
                    <span className="text-sm font-semibold text-white">Arraste ou clique para enviar sua foto</span>
                    <span className="text-xs text-[#5c5278]">JPEG, PNG, WebP ou GIF — até 20 MB</span>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple={false}
              className="hidden"
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
          </div>
        </div>

        {/* 2. Estilo de melhoria */}
        <div data-tour="form-sec-ef-estilo" className="campo-com-info flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#9d94bb]">
            <span>Estilo de melhoria</span>
            <span className="relative inline-flex items-center">
              <button
                type="button"
                data-field-info=""
                aria-label="Mais informações Estilo de melhoria"
                aria-expanded="false"
                onClick={() => setShowFieldInfo(showFieldInfo === "estilo" ? null : "estilo")}
                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                style={{ color: "rgb(167, 139, 250)" }}
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Estilo de melhoria">
            {/* Fotografia Profissional */}
            <button
              type="button"
              aria-pressed={selectedStyle === "fotografia"}
              onClick={() => setSelectedStyle("fotografia")}
              title="Transforma uma foto comum em fotografia editorial profissional, elevando o realismo e a iluminação sem alterar a identidade ou o cenário."
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all pb-ctrl-btn cursor-pointer ${
                selectedStyle === "fotografia" ? "pb-ctrl-active" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  selectedStyle === "fotografia"
                    ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40"
                    : "bg-zinc-800 text-[#5c5278]"
                }`}
              >
                <Sun className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span
                  className={`text-xs font-semibold truncate ${
                    selectedStyle === "fotografia" ? "text-[#f0ecff]" : "text-[#9d94bb]"
                  }`}
                >
                  Fotografia Profissional
                </span>
                <span className="text-[9px] text-[#5c5278]">
                  {selectedStyle === "fotografia" ? "Selecionado" : "Aplicar"}
                </span>
              </span>
            </button>

            {/* Retoque de estúdio */}
            <button
              type="button"
              aria-pressed={selectedStyle === "estudio"}
              onClick={() => setSelectedStyle("estudio")}
              title="Retoque de estúdio — pele refinada, cores corrigidas, iluminação aprimorada, acabamento editorial."
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all pb-ctrl-btn cursor-pointer ${
                selectedStyle === "estudio" ? "pb-ctrl-active" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  selectedStyle === "estudio"
                    ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40"
                    : "bg-zinc-800 text-[#5c5278]"
                }`}
              >
                <Sparkles className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span
                  className={`text-xs font-semibold truncate ${
                    selectedStyle === "estudio" ? "text-[#f0ecff]" : "text-[#9d94bb]"
                  }`}
                >
                  Retoque de estúdio
                </span>
                <span className="text-[9px] text-[#5c5278]">
                  {selectedStyle === "estudio" ? "Selecionado" : "Aplicar"}
                </span>
              </span>
            </button>

            {/* Hiper Realismo */}
            <button
              type="button"
              aria-pressed={selectedStyle === "hiper_realismo"}
              onClick={() => setSelectedStyle("hiper_realismo")}
              title="Quebra o look de IA: pele com poros reais, cabelo com fios individuais, olhos com textura humana. Para imagens geradas que parecem artificiais."
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all pb-ctrl-btn cursor-pointer ${
                selectedStyle === "hiper_realismo" ? "pb-ctrl-active" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  selectedStyle === "hiper_realismo"
                    ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40"
                    : "bg-zinc-800 text-[#5c5278]"
                }`}
              >
                <Camera className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span
                  className={`text-xs font-semibold truncate ${
                    selectedStyle === "hiper_realismo" ? "text-[#f0ecff]" : "text-[#9d94bb]"
                  }`}
                >
                  Hiper Realismo
                </span>
                <span className="text-[9px] text-[#5c5278]">
                  {selectedStyle === "hiper_realismo" ? "Selecionado" : "Aplicar"}
                </span>
              </span>
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-[#9d94bb] rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
            {styleDescriptions[selectedStyle]}
          </p>
        </div>

        {/* 3. Configurações (Dimensões e Qualidade) */}
        <div data-tour="form-sec-ef-config" className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            {/* Dimensões */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-sm">Dimensões</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Dimensões"
                      aria-expanded="false"
                      onClick={() => setShowFieldInfo(showFieldInfo === "dimensoes" ? null : "dimensoes")}
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(167, 139, 250)" }}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
                <div role="group" aria-label="Dimensões" className="flex flex-col gap-1.5">
                  {/* Stories */}
                  <button
                    type="button"
                    aria-pressed={dimension === "9:16"}
                    onClick={() => setDimension("9:16")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      dimension === "9:16" ? "pb-ctrl-active" : ""
                    }`}
                    style={
                      dimension === "9:16"
                        ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" }
                        : {}
                    }
                  >
                    <span
                      className={`text-[12px] font-semibold transition-colors ${
                        dimension === "9:16" ? "text-white" : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      Stories
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        dimension === "9:16" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{
                        backgroundColor:
                          dimension === "9:16" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      9:16
                    </span>
                  </button>

                  {/* Feed Vertical */}
                  <button
                    type="button"
                    aria-pressed={dimension === "4:5"}
                    onClick={() => setDimension("4:5")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      dimension === "4:5" ? "pb-ctrl-active" : ""
                    }`}
                    style={
                      dimension === "4:5"
                        ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" }
                        : {}
                    }
                  >
                    <span
                      className={`text-[12px] font-semibold transition-colors ${
                        dimension === "4:5" ? "text-white" : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      Feed Vertical
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        dimension === "4:5" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{
                        backgroundColor:
                          dimension === "4:5" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      4:5
                    </span>
                  </button>

                  {/* Feed */}
                  <button
                    type="button"
                    aria-pressed={dimension === "1:1"}
                    onClick={() => setDimension("1:1")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      dimension === "1:1" ? "pb-ctrl-active" : ""
                    }`}
                    style={
                      dimension === "1:1"
                        ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" }
                        : {}
                    }
                  >
                    <span
                      className={`text-[12px] font-semibold transition-colors ${
                        dimension === "1:1" ? "text-white" : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      Feed
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        dimension === "1:1" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{
                        backgroundColor:
                          dimension === "1:1" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      1:1
                    </span>
                  </button>

                  {/* Cinema */}
                  <button
                    type="button"
                    aria-pressed={dimension === "16:9"}
                    onClick={() => setDimension("16:9")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      dimension === "16:9" ? "pb-ctrl-active" : ""
                    }`}
                    style={
                      dimension === "16:9"
                        ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" }
                        : {}
                    }
                  >
                    <span
                      className={`text-[12px] font-semibold transition-colors ${
                        dimension === "16:9" ? "text-white" : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      Cinema
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        dimension === "16:9" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{
                        backgroundColor:
                          dimension === "16:9" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      16:9
                    </span>
                  </button>
                </div>

                {/* Box de Preview da Proporção Oficial */}
                <div
                  aria-hidden="true"
                  className="hidden sm:flex h-[170px] w-[120px] items-center justify-center rounded-xl pb-ctrl-btn p-2"
                >
                  <div
                    className="rounded-md transition-all duration-300"
                    style={{
                      width:
                        dimension === "16:9"
                          ? "96%"
                          : dimension === "9:16"
                          ? "92%"
                          : dimension === "4:5"
                          ? "88%"
                          : "90%",
                      maxHeight:
                        dimension === "16:9"
                          ? "54%"
                          : dimension === "9:16"
                          ? "92%"
                          : dimension === "4:5"
                          ? "90%"
                          : "90%",
                      aspectRatio:
                        dimension === "16:9"
                          ? "16 / 9"
                          : dimension === "9:16"
                          ? "9 / 16"
                          : dimension === "4:5"
                          ? "4 / 5"
                          : "1 / 1",
                      background: "linear-gradient(rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.063))",
                      border: "1.5px solid rgba(139, 92, 246, 0.333)",
                      boxShadow: "rgba(139, 92, 246, 0.133) 0px 0px 16px inset",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Qualidade */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-xs">Qualidade</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Qualidade"
                      aria-expanded="false"
                      onClick={() => setShowFieldInfo(showFieldInfo === "qualidade" ? null : "qualidade")}
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(167, 139, 250)" }}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  <div className="ml-auto text-[10px] tabular-nums text-white/60">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: "rgba(139, 92, 246, 0.12)",
                          color: "rgb(139, 92, 246)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                        }}
                      >
                        {quality === "4K" ? "MÁXIMA" : quality === "2K" ? "ALTA" : "PADRÃO"}
                      </span>
                      <span className="text-[10px] tabular-nums text-zinc-500">
                        {qualityResolutionMap[dimension][quality]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                role="group"
                aria-label="Qualidade"
                className="grid gap-1.5"
                style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}
              >
                {/* 1K */}
                <button
                  type="button"
                  aria-pressed={quality === "1K"}
                  onClick={() => setQuality("1K")}
                  className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                  style={
                    quality === "1K"
                      ? {
                          background:
                            "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                          border: "1px solid transparent",
                          boxShadow: "rgba(139, 92, 246, 0.19) 0px 0px 12px, rgba(139, 92, 246, 0.07) 0px 0px 28px",
                        }
                      : {
                          background:
                            "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <span
                    className="text-base font-bold leading-none tracking-tight transition-colors"
                    style={{ color: quality === "1K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                  >
                    1K
                  </span>
                  <span
                    className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]"
                    style={{ color: quality === "1K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                  >
                    Rápido
                  </span>
                </button>

                {/* 2K */}
                <button
                  type="button"
                  aria-pressed={quality === "2K"}
                  onClick={() => setQuality("2K")}
                  className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                  style={
                    quality === "2K"
                      ? {
                          background:
                            "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                          border: "1px solid transparent",
                          boxShadow: "rgba(139, 92, 246, 0.19) 0px 0px 12px, rgba(139, 92, 246, 0.07) 0px 0px 28px",
                        }
                      : {
                          background:
                            "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <span
                    className="text-base font-bold leading-none tracking-tight transition-colors"
                    style={{ color: quality === "2K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                  >
                    2K
                  </span>
                  <span
                    className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]"
                    style={{ color: quality === "2K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                  >
                    Médio
                  </span>
                </button>

                {/* 4K */}
                <button
                  type="button"
                  aria-pressed={quality === "4K"}
                  onClick={() => setQuality("4K")}
                  className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                  style={
                    quality === "4K"
                      ? {
                          background:
                            "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                          border: "1px solid transparent",
                          boxShadow: "rgba(139, 92, 246, 0.19) 0px 0px 12px, rgba(139, 92, 246, 0.07) 0px 0px 28px",
                        }
                      : {
                          background:
                            "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                          border: "1px solid transparent",
                        }
                  }
                >
                  <span
                    className="text-base font-bold leading-none tracking-tight transition-colors"
                    style={{ color: quality === "4K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                  >
                    4K
                  </span>
                  <span
                    className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]"
                    style={{ color: quality === "4K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                  >
                    Lento
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Instruções adicionais (opcional) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="extra_instructions" className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <span>Instruções adicionais (opcional)</span>
              <span className="relative inline-flex items-center">
                <button
                  type="button"
                  data-field-info=""
                  aria-label="Mais informações Instruções adicionais (opcional)"
                  aria-expanded="false"
                  onClick={() => setShowFieldInfo(showFieldInfo === "instrucoes" ? null : "instrucoes")}
                  className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                  style={{ color: "rgb(167, 139, 250)" }}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </span>
            </label>
            <div className="group relative">
              <textarea
                id="extra_instructions"
                rows={3}
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="Ex: manter tons quentes, reforçar brilho nos olhos..."
                className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-white"
                style={{ height: "105.6px" }}
              />
              <button
                type="button"
                onClick={() => setIsExpandInstructionsOpen(true)}
                className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                title="Expandir editor"
                aria-haspopup="dialog"
                aria-expanded={isExpandInstructionsOpen}
                data-state={isExpandInstructionsOpen ? "open" : "closed"}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Espaçador inferior para nunca sobrepor opções do formulário */}
        <div className="h-20 shrink-0" aria-hidden="true" />

        {/* Sticky Bottom Bar Flutuante Oficial 100% fiel */}
        <div className="sticky bottom-3 z-30 -mx-2 animate-in fade-in slide-in-from-bottom-2 duration-200 mt-auto">
          <div className="rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl backdrop-blur-md">
            <div className="w-full">
              <button
                type="button"
                disabled={!photoBase64 || isProcessing}
                onClick={handleEnhance}
                onMouseMove={handleButtonMouseMove}
                className="group relative overflow-hidden flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg shadow-violet-950/40 hover:shadow-[0_0_28px_rgba(139,92,246,0.65)] hover:border-violet-400/40 border border-transparent disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
                style={{
                  background: "radial-gradient(140px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.28), transparent 75%), linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.85))"
                }}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Aprimorando em {quality}...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Melhorar Imagem</span>
                    <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-2 px-1 pb-0.5">
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#9d94bb]">
                <button
                  type="button"
                  title="Duplicar configurações para uma nova aba"
                  onClick={handleDuplicate}
                  disabled={tabs.length >= 3}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Duplicar</span>
                </button>
                <span aria-hidden="true" className="text-white/15">·</span>
                <button
                  type="button"
                  title="Resetar todas as configurações do formulário"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Resetar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── SEPARADOR REDIMENSIONÁVEL OFICIAL ── */}
      <div
        role="separator"
        aria-orientation="vertical"
        title="Arraste para redimensionar"
        className="group relative z-10 hidden w-1.5 cursor-col-resize items-center justify-center border-r border-white/5 transition-colors lg:flex hover:border-violet-500/40"
      >
        <div className="h-8 w-0.5 rounded-full bg-white/10 transition-colors group-hover:bg-violet-500/50" />
      </div>

      {/* ── MAIN CENTRAL (PREVIEW & GALERIA) ── */}
      <main className="flex-1 flex flex-col overflow-hidden max-lg:order-1 max-lg:min-h-0">
        {/* Top bar com Abas e Modo */}
        <div className="relative flex items-start justify-center pt-4 pb-2 gap-3">
          {/* Abas à esquerda */}
          <div className="absolute left-4 top-4 hidden lg:flex">
            <div
              data-tour="tabs"
              role="tablist"
              aria-label="Abas de geração"
              className="pointer-events-auto flex min-w-0 max-w-[min(42vw,30rem)] flex-row items-center gap-1 overflow-x-auto scrollbar-hide"
            >
              {tabs.map((tab, idx) => {
                const isTabActive = tab.id === activeTabId;
                return (
                  <div key={tab.id} className="group relative flex w-fit shrink-0 items-center">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isTabActive}
                      onClick={() => switchTab(tab.id)}
                      className={`inline-flex h-7 max-w-[12rem] flex-none items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer ${
                        isTabActive
                          ? "text-white bg-violet-600/30 border-violet-500 shadow-sm"
                          : "text-zinc-400 border-white/5 bg-zinc-900/40 hover:text-zinc-200 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="truncate">{tab.name && tab.name.startsWith("Aba ") ? tab.name : `Aba ${idx + 1}`}</span>
                      {tabs.length > 1 && (
                        <span
                          onClick={(e) => handleCloseTab(e, tab.id)}
                          className="hover:text-red-400 p-0.5 rounded transition-colors ml-1"
                          title="Fechar aba"
                        >
                          <X size={11} />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
              {tabs.length < 3 && (
                <button
                  type="button"
                  aria-label="Nova aba"
                  onClick={handleAddNewTab}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-white/[0.06] hover:text-zinc-400 cursor-pointer"
                  title="Nova aba"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Seletor Builder / Galeria */}
          <div role="tablist" aria-label="Modo de visualização" data-tour="tabs" className="pb-tabbar">
            <button
              type="button"
              role="tab"
              aria-selected={activeStageMode === "builder"}
              onClick={() => setActiveStageMode("builder")}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeStageMode === "builder" ? "pb-tab-active" : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              Builder
              {activeStageMode !== "builder" && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full transition-colors duration-300 bg-[rgba(168,85,247,0.5)]"
                />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStageMode === "galeria"}
              onClick={() => setActiveStageMode("galeria")}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeStageMode === "galeria" ? "pb-tab-active" : "text-[#5c5278] hover:text-[#9d94bb]"
              }`}
            >
              Galeria
            </button>
          </div>
        </div>

        {/* Modo Builder: Palco de Preview Oficial */}
        {/* Palco Central e Galeria */}
        {/* Container Principal: Palco + Coluna Lateral de Histórico à Direita */}
        <div className="relative flex flex-1 min-h-0 flex-row overflow-hidden">
          {activeStageMode === "builder" ? (
              <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
                <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-4 pb-32 sm:pb-36">
                  {isProcessing ? (
                    <div
                      className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden db-generating-card animate-in fade-in zoom-in-95 duration-300"
                      style={{
                        width: "min(88%, 460px)",
                        aspectRatio: dimension === "9:16" ? "9/16" : dimension === "1:1" ? "1/1" : dimension === "16:9" ? "16/9" : "4/5",
                        maxHeight: "75vh"
                      }}
                    >
                      <GenerationLoadingCanvas
                        className="w-full h-full"
                        agentColor="#8b5cf6"
                        elapsedSeconds={elapsedSeconds}
                        subMessage="Enhance Builder aprimorando iluminação e nitidez"
                      />
                    </div>
                  ) : enhancedImage ? (
                    /* 2. Imagem Aprimorada Concluída (Com barra de ferramentas e Comparador Antes/Depois) */
                    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col items-center justify-center overflow-hidden">
                      {/* Barra de Ações Superior Flutuante */}
                      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md ring-1 ring-violet-500/30 shadow-lg">
                            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                            {selectedStyle === "fotografia"
                              ? "Fotografia"
                              : selectedStyle === "estudio"
                              ? "Estúdio"
                              : "Hiper Realismo"}{" "}
                            • {quality}
                          </span>
                          <span className="hidden sm:inline-flex rounded-lg bg-black/65 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur-md ring-1 ring-white/10 tabular-nums">
                            {qualityResolutionMap[dimension][quality]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pointer-events-auto">
                          {photoBase64 && (
                            <button
                              type="button"
                              onClick={() => setIsComparing(!isComparing)}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shadow-lg backdrop-blur-md cursor-pointer ${
                                isComparing
                                  ? "bg-violet-600 text-white ring-1 ring-violet-400"
                                  : "bg-black/75 text-zinc-200 hover:bg-black/90 hover:text-white ring-1 ring-white/15"
                              }`}
                              title="Comparar foto original com a versão melhorada"
                            >
                              <ArrowLeftRight className="h-3.5 w-3.5" />
                              <span>{isComparing ? "Ver Aprimorada" : "Comparar Antes / Depois"}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              downloadImage(enhancedImage, "PNG", undefined, undefined, undefined, "ORIGINAL", {
                                customFileName: `zion_enhance_${quality}_${Date.now()}.png`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-black/75 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-black/90 hover:text-white ring-1 ring-white/15 transition-all shadow-lg backdrop-blur-md cursor-pointer"
                            title="Baixar imagem aprimorada em alta resolução"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Baixar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.open(enhancedImage, "_blank")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/75 text-zinc-300 hover:bg-black/90 hover:text-white ring-1 ring-white/15 transition-all shadow-lg backdrop-blur-md cursor-pointer"
                            title="Abrir em tamanho real"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Display da Imagem / Comparador */}
                      <div className="flex flex-1 min-h-0 w-full items-center justify-center pt-10 pb-2">
                        {isComparing && photoBase64 ? (
                          <div className="h-full w-full max-h-[82vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <CompareSlider before={photoBase64} after={enhancedImage} />
                          </div>
                        ) : (
                          <img
                            alt="Imagem Aprimorada"
                            className="block h-auto w-auto max-h-[82vh] max-w-full shrink rounded-2xl object-contain shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-500"
                            src={enhancedImage}
                          />
                        )}
                      </div>
                    </div>
                  ) : photoBase64 ? (
                    /* 3. Prévia da Foto Enviada (Aguardando clique em Melhorar Imagem) */
                    <div className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
                      <img
                        alt="Foto enviada"
                        className="block h-auto w-auto max-h-full max-w-full shrink rounded-2xl object-contain shadow-lg ring-1 ring-white/10"
                        src={photoBase64}
                      />
                      <span className="absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-md ring-1 ring-white/10">
                        Foto enviada (Original)
                      </span>
                    </div>
                  ) : (
                    /* 4. Estado Vazio Inicial */
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
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
                          className="lucide lucide-upload h-7 w-7 text-[#5c5278]"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" x2="12" y1="3" y2="15"></line>
                        </svg>
                      </div>
                      <p className="text-xs text-[#5c5278] max-w-[200px]">Envie uma foto para ver a prévia aqui</p>
                    </div>
                  )}
                </div>

                {/* Magic Refine Bar & Publish Alert Card */}
                {enhancedImage && (
                  <MagicRefineBar
                    onSendRefine={(text, _attachments, _isBrush) => {
                      handleRefine(text);
                    }}
                    isProcessing={isProcessing}
                    agentColor="#8b5cf6"
                    placeholder="Descreva o que deseja aprimorar nesta imagem..."
                    activeImage={enhancedImage}
                    onPublishCommunity={() => {
                      onOpenCommunity?.();
                      showToast?.("Publicação na comunidade iniciada!", "info");
                    }}
                  />
                )}
              </div>


        ) : (
          /* Modo Galeria Oficial com Histórico Persistido */
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 min-w-0 sticky top-0 z-10 bg-black/80 backdrop-blur-sm px-3 py-2.5 border-b border-white/5">
                <div
                  className="pointer-events-auto inline-flex items-center rounded-full border border-white/[0.06] p-1"
                  style={{ background: "rgba(10, 7, 25, 0.7)" }}
                >
                  <button
                    type="button"
                    aria-pressed={historyTab === "todos"}
                    onClick={() => setHistoryTab("todos")}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      historyTab === "todos" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={
                      historyTab === "todos"
                        ? { background: "linear-gradient(135deg, rgb(124, 58, 237), rgb(147, 51, 234))" }
                        : {}
                    }
                  >
                    Todos ({historyItems.length})
                  </button>
                  <button
                    type="button"
                    aria-pressed={historyTab === "favs"}
                    onClick={() => setHistoryTab("favs")}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      historyTab === "favs" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={
                      historyTab === "favs"
                        ? { background: "linear-gradient(135deg, rgb(124, 58, 237), rgb(147, 51, 234))" }
                        : {}
                    }
                  >
                    Favs ({historyItems.filter((i) => i.isFav).length})
                  </button>
                </div>
                <button
                  type="button"
                  title="Limpar histórico"
                  aria-label="Limpar histórico"
                  onClick={() => {
                    if (window.confirm("Deseja limpar as gerações do histórico de melhorias?")) {
                      setHistoryItems([]);
                    }
                  }}
                  className="ml-auto shrink-0 rounded-lg transition-colors p-2 text-zinc-400 hover:bg-white/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                {(() => {
                  const filtered = historyItems.filter((item) => (historyTab === "favs" ? item.isFav : true));
                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center text-center px-4 py-16">
                        <ImageIcon className="mb-3 text-zinc-700 h-12 w-12" />
                        <p className="font-medium text-zinc-400 text-sm">Sem gerações ainda</p>
                        <p className="text-xs text-zinc-600 mt-1">Suas imagens aprimoradas aparecerão salvas aqui.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          className="group relative flex flex-col rounded-xl overflow-hidden border border-white/10 bg-zinc-950 hover:border-violet-500/50 transition-all shadow-lg"
                        >
                          <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-900">
                            <img
                              src={item.enhancedUrl}
                              alt="Gerado"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHistoryItems((prev) =>
                                      prev.map((it) => (it.id === item.id ? { ...it, isFav: !it.isFav } : it))
                                    );
                                  }}
                                  className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                                    item.isFav ? "bg-red-500 text-white" : "bg-black/60 text-zinc-300 hover:text-white"
                                  }`}
                                  title="Favoritar"
                                >
                                  <Heart className={`h-3.5 w-3.5 ${item.isFav ? "fill-current" : ""}`} />
                                </button>
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPhotoBase64(item.originalUrl);
                                    setEnhancedImage(item.enhancedUrl);
                                    setSelectedStyle(item.style);
                                    setDimension(item.dimension);
                                    setQuality(item.quality);
                                    setActiveStageMode("builder");
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-violet-600/90 hover:bg-violet-600 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm transition-colors cursor-pointer"
                                >
                                  <span>Abrir</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadImage(item.enhancedUrl, "PNG", undefined, undefined, undefined, "ORIGINAL", {
                                      customFileName: `zion_enhance_${item.quality}_${item.id}.png`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-black/60 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
                                  title="Baixar"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 flex items-center justify-between text-[10px] text-zinc-400 bg-zinc-900/60">
                            <span className="font-semibold text-zinc-300 truncate capitalize">
                              {item.style.replace("_", " ")}
                            </span>
                            <span className="font-bold text-violet-400">{item.quality}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

          {isMobileHistoryOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
          )}
          {/* Coluna Lateral de Histórico Oficial (72px) SEMPRE à Direita do Palco */}
          <div
            data-tour="history"
            className={`coluna-de-historico z-50 shrink-0 flex-col transition-all duration-300 border-l border-white/[0.04] bg-black ${isMobileHistoryOpen ? "fixed inset-y-0 right-0 z-50 flex shadow-2xl w-44" : "relative z-10 hidden h-full lg:flex"}`}
            style={{ width: isMobileHistoryOpen ? "176px" : "72px", "--largura-do-historico": isMobileHistoryOpen ? "176px" : "72px" } as any}
          >
            <div
              className="historico-lateral relative flex h-full flex-col bg-black w-full"
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
                {allHistoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative w-full overflow-hidden rounded-lg border transition-all duration-200 border-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_6px_rgba(139,92,246,0.08)] cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEnhancedImage(item.enhancedUrl);
                        setIsMobileHistoryOpen(false);
                        setMobileView("palco");
                      }}
                      className="block w-full cursor-pointer"
                      title="Geração — clique para visualizar"
                    >
                      <img
                        alt="Geração"
                        src={item.enhancedUrl}
                        className="block w-full bg-black object-cover cursor-grab active:cursor-grabbing"
                        loading="lazy"
                        decoding="async"
                        style={{
                          aspectRatio: dimension ? dimension.replace(":", " / ") : "4 / 5"
                        }}
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } = e.currentTarget;
                          if (naturalWidth && naturalHeight) {
                            e.currentTarget.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
                          }
                        }}
                      />
                    </button>
                    <div className="pointer-events-none absolute left-1 top-1 z-10 flex items-center rounded border px-1 py-0.5 text-[8px] font-semibold leading-none shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 border-violet-400/30 bg-violet-950/85 text-violet-200">
                      <span>Geração</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const filename = item.enhancedUrl.split("/").pop() || "";
                        addDeletedImage(item.id);
                        addDeletedImage(item.enhancedUrl);
                        addDeletedImage(filename);
                        useProjectStore.getState().deleteGaleriaImage(item.enhancedUrl);
                        fetch(`/api/bff/api/generations/${item.id}`, { method: "DELETE" }).catch(() => {});
                        if (filename.endsWith(".png") || filename.endsWith(".avif") || filename.endsWith(".webp") || filename.endsWith(".jpg")) {
                          fetch(`/api/historico-imagens/${filename}`, { method: "DELETE" }).catch(() => {});
                        }
                        setHistoryItems((prev) => prev.filter((h) => h.id !== item.id));
                      }}
                      className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-zinc-300 ring-1 ring-white/10 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-300"
                      title="Remover geração permanentemente"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── BOTTOM MOBILE NAV OFICIAL ── */}
      <nav
        aria-label="Categorias e ações de construção"
        className="relative shrink-0 overflow-x-hidden border-t border-white/[0.08] backdrop-blur-xl pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.35)] lg:hidden max-lg:order-3"
        style={{ background: "rgba(10, 7, 25, 0.92)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8"
          style={{ background: "linear-gradient(to right, rgba(10, 7, 25, 0.92), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8"
          style={{ background: "linear-gradient(to left, rgba(10, 7, 25, 0.92), transparent)" }}
        />
        <div
          role="tablist"
          aria-label="Categorias do agente"
          className="flex items-stretch gap-0.5 overflow-x-auto scrollbar-hide px-2 py-1.5 [scroll-snap-type:x_proximity] justify-center"
        >
          {/* Início */}
          <button
            type="button"
            aria-label="Sair para o início"
            onClick={() => (onOpenVitrine ? onOpenVitrine() : onSwitchAgent?.("orion-pro"))}
            className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-zinc-300 cursor-pointer"
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors bg-white/[0.05] ring-1 ring-white/15 group-hover:bg-white/[0.10]">
              <Home className="h-[22px] w-[22px]" />
            </span>
            <span className="whitespace-nowrap text-[10px] leading-none font-semibold">Início</span>
          </button>

          <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

          {/* Foto */}
          <button
            type="button"
            role="tab"
            aria-selected="true"
            aria-current="true"
            className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-white cursor-pointer"
          >
            <span
              className="flex h-7 w-12 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
            >
              <span className="relative">
                <ImageIcon className="h-[22px] w-[22px]" style={{ color: "rgb(139, 92, 246)" }} />
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">Foto</span>
          </button>

          {/* Estilo */}
          <button
            type="button"
            role="tab"
            aria-selected="false"
            className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors group-hover:bg-white/[0.06]">
              <span className="relative">
                <Palette className="h-[22px] w-[22px]" />
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "rgb(139, 92, 246)" }}
                />
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">Estilo</span>
          </button>

          {/* Saída */}
          <button
            type="button"
            role="tab"
            aria-selected="false"
            className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors group-hover:bg-white/[0.06]">
              <span className="relative">
                <SlidersHorizontal className="h-[22px] w-[22px]" />
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">Saída</span>
          </button>

          <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

          {/* Construir / Melhorar Imagem */}
          <button
            type="button"
            aria-label="Construir"
            disabled={!photoBase64 || isProcessing}
            onClick={handleEnhance}
            className="group ml-0.5 flex min-h-[52px] min-w-[78px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl px-3 text-white transition-transform duration-100 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            style={{
              color: "rgb(255, 255, 255)",
              background: "linear-gradient(to right, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))",
              boxShadow: "rgba(139, 92, 246, 0.35) 0px 4px 16px",
            }}
          >
            <span className="whitespace-nowrap text-sm font-extrabold leading-tight">Melhorar Imagem</span>
          </button>
        </div>
      </nav>

      {/* ── MODAL: EXPANDIR INSTRUÇÕES ── */}
      {isExpandInstructionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-xl w-full flex flex-col rounded-2xl overflow-hidden bg-zinc-950 border border-violet-500/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/60">
              <span className="text-sm font-bold text-white">Instruções adicionais</span>
              <button
                type="button"
                onClick={() => setIsExpandInstructionsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                rows={8}
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="Ex: manter tons quentes, reforçar brilho nos olhos..."
                className="w-full rounded-xl bg-black/60 border border-white/10 p-3.5 text-sm text-zinc-200 resize-none focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsExpandInstructionsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORTAR IMAGEM ── */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageUrl={photoBase64}
        onClose={() => setIsCropModalOpen(false)}
        onConfirm={(croppedUrl) => {
          setPhotoBase64(croppedUrl);
          setEnhancedImage("");
          setIsCropModalOpen(false);
        }}
      />

      {/* ── MODAL: GOOGLE CLOUD BILLING REQUIRED ($300 FREE CREDITS) ── */}
      {billingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-lg w-full flex flex-col rounded-3xl overflow-hidden bg-[#0e0a1a] border border-violet-500/40 shadow-2xl p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Sparkles className="h-8 w-8 text-violet-300 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Vincular Créditos de $300 no Google Cloud
            </h3>

            <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
              Sua chave do Vertex AI está conectada e reconhecida! Para que o Google libere a geração generativa de alta fidelidade, ele exige que a sua <strong className="text-violet-300">Conta de Faturamento</strong> (onde estão os seus <strong>$300 dólares grátis</strong>) seja vinculada ao projeto.
            </p>

            <div className="bg-violet-950/40 border border-violet-500/20 rounded-2xl p-3 mb-5 text-xs text-violet-200/90 text-left">
              <p className="font-semibold mb-1 text-violet-300">Como ativar em 1 clique:</p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                <li>Clique no botão abaixo para abrir o console oficial.</li>
                <li>Selecione sua conta com os créditos gratuitos de $300.</li>
                <li>Confirme. O Vertex AI será liberado imediatamente!</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setBillingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                Depois
              </button>
              <a
                href="https://console.developers.google.com/billing/enable?project=design-builder-682800-6bb"
                target="_blank"
                rel="noreferrer"
                onClick={() => setBillingModalOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <span>Ativar Faturamento ($300 Grátis)</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PROMPT MESTRE GERADO (0 CRÉDITOS) ── */}
      {isPromptModalOpen && masterPromptResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-2xl w-full flex flex-col rounded-3xl overflow-hidden bg-[#0c0817] border border-fuchsia-500/30 shadow-2xl shadow-fuchsia-950/50 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600/30 to-violet-600/30 border border-fuchsia-500/40 text-fuchsia-300">
                  <FileText className="h-6 w-6 text-fuchsia-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Prompt Mestre de Super-Resolução</h3>
                    <span className="rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-0.5 text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">
                      0 Créditos
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Sintetizado com Gemini 3.6 Flash para máxima fidelidade e fotorealismo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Prompt Box */}
            <div className="relative mb-5 rounded-2xl bg-black/70 border border-violet-500/20 p-4 max-h-[360px] overflow-y-auto scrollbar-thin">
              <pre className="text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed select-text">
                {masterPromptResult}
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-400">
                Cole no <strong>Midjourney, Flux, Fooocus, ComfyUI</strong> ou gerador de sua preferência.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer"
                >
                  {isPromptCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span className="text-emerald-300">Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Prompt Mestre</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ERRO GENÉRICO ── */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative max-w-md w-full flex flex-col rounded-2xl overflow-hidden bg-zinc-950 border border-red-500/30 shadow-2xl p-5 text-center">
            <h4 className="text-base font-bold text-white mb-2">Atenção</h4>
            <p className="text-xs text-zinc-300 mb-4 leading-relaxed whitespace-pre-wrap">{errorMessage}</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Barra de controle inferior mobile para alternar Ajustes / Palco / Histórico */}
      <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 lg:hidden pointer-events-none">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/85 p-1.5 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              setMobileView("form");
              setIsMobileHistoryOpen(false);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mobileView === "form" && !isMobileHistoryOpen
                ? "bg-violet-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Ajustes</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileView("palco");
              setIsMobileHistoryOpen(false);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mobileView === "palco" && !isMobileHistoryOpen
                ? "bg-violet-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Palco</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileHistoryOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isMobileHistoryOpen
                ? "bg-violet-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Histórico</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhanceBuilder;
