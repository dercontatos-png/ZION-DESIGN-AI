import { getAuthHeaders, getCurrentUserEmail } from "../utils/userAuth";
import { useProjectStore, addDeletedImage } from "../store/useProjectStore";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  AlertTriangle,
  Globe,
  Heart,
  Trash2,
  FileText,
  Clock,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { ImageCropModal } from "./ImageCropModal";
import { CompareSlider } from "./CompareSlider";
import { downloadImage } from "../utils/downloadImage";
import { GenerationLoadingCanvas } from "./GenerationLoadingCanvas";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { MagicRefineBar } from "./MagicRefineBar";

export type EnhanceDimension = "original" | "9:16" | "4:5" | "1:1" | "16:9";

export interface EnhanceHistoryItem {
  id: string;
  originalUrl: string;
  enhancedUrl: string;
  style: "fotografia" | "estudio" | "hiper_realismo";
  dimension: EnhanceDimension;
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
  dimension: EnhanceDimension;
  quality: "1K" | "2K" | "4K";
  extraInstructions: string;
}

const defaultEnhanceTab: EnhanceTabState = {
  id: "tab-1",
  name: "Aba 1",
  photoBase64: "",
  enhancedImage: "",
  selectedStyle: "fotografia",
  dimension: "4:5",
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
  onOpenAssistant?: () => void;
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const EnhanceBuilder: React.FC<EnhanceBuilderProps> = ({
  onSwitchAgent,
  onOpenVitrine,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onOpenReport,
  onOpenAssistant,
  showToast,
}) => {
  // Initial state aligned with official Design Builder Enhance
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [enhancedImage, setEnhancedImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isExportPopoverOpen, setIsExportPopoverOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const rightActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rightActionsRef.current && !rightActionsRef.current.contains(e.target as Node)) {
        setIsExportPopoverOpen(false);
      }
    };
    if (isExportPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExportPopoverOpen]);

  const handleDownloadFormat = (format: "png" | "jpeg" | "webp" | "avif") => {
    const targetImage = enhancedImage || photoBase64;
    if (!targetImage) return;
    downloadImage(targetImage, format.toUpperCase() as any, undefined, undefined, undefined, "ORIGINAL", {
      customFileName: `zion_enhance_${Date.now()}.${format}`,
    });
    showToast?.(`Download .${format} iniciado!`, "success");
  };

  const handleUseAsBase = () => {
    const targetImage = enhancedImage || photoBase64;
    if (!targetImage) return;
    setPhotoBase64(targetImage);
    setEnhancedImage("");
    showToast?.("Imagem definida como base para novo aprimoramento!", "success");
  };
  const [historyItems, setHistoryItems] = useState<EnhanceHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("zion_enhance_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const store = useProjectStore();
  const [activeMobileCategory, setActiveMobileCategory] = useState<"foto" | "estilo" | "saida">("foto");
  const [mobileView, setMobileView] = useState<"form" | "palco">("form");
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [isGuiaMenuOpen, setIsGuiaMenuOpen] = useState(false);
  const [guiaMenuCoords, setGuiaMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const guiaMenuRef = useRef<HTMLDivElement>(null);

  const handleToggleGuia = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGuiaMenuCoords({
      top: rect.bottom + 6,
      left: Math.max(12, rect.right - 216),
    });
    setIsGuiaMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isGuiaMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (guiaMenuRef.current && !guiaMenuRef.current.contains(e.target as Node)) {
        setIsGuiaMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isGuiaMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const [selectedStyle, setSelectedStyle] = useState<"fotografia" | "estudio" | "hiper_realismo">("fotografia");
  const [dimension, setDimension] = useState<EnhanceDimension>("4:5");
  const [quality, setQuality] = useState<"1K" | "2K" | "4K">("4K");
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
    setSelectedStyle("fotografia");
    setDimension("4:5");
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

  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renamingTabName, setRenamingTabName] = useState("");

  const handleSaveTabName = (tabId: string) => {
    const trimmed = renamingTabName.trim();
    if (trimmed) {
      setTabs(prev => prev.map(t => (t.id === tabId ? { ...t, name: trimmed } : t)));
    }
    setRenamingTabId(null);
  };

  const [activeStageMode, setActiveStageMode] = useState<"builder" | "galeria">("builder");
  const [historyTab, setHistoryTab] = useState<"todos" | "favs">("todos");
  const [isExpandInstructionsOpen, setIsExpandInstructionsOpen] = useState(false);
  const [tempExtraInstructions, setTempExtraInstructions] = useState("");
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
  const asideRef = useRef<HTMLElement | null>(null);
  const inFlowButtonRef = useRef<HTMLDivElement | null>(null);

  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<string>("1 / 1");

  useEffect(() => {
    if (!photoBase64) {
      setOriginalDimensions(null);
      setOriginalAspectRatio("1 / 1");
      return;
    }
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setOriginalAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
    };
    img.src = photoBase64;
  }, [photoBase64]);

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

  const checkInFlowVisibility = useCallback(() => {
    if (!asideRef.current || !inFlowButtonRef.current) return;
    const aside = asideRef.current;
    const isNearBottom = aside.scrollHeight - aside.scrollTop - aside.clientHeight < 60;
    const asideRect = aside.getBoundingClientRect();
    const btnRect = inFlowButtonRef.current.getBoundingClientRect();
    const isIntersecting = btnRect.top < asideRect.bottom && btnRect.bottom > asideRect.top;
    setIsInFlowVisible(isNearBottom || isIntersecting);
  }, []);

  useEffect(() => {
    checkInFlowVisibility();
  }, [checkInFlowVisibility]);

  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;
    aside.addEventListener("scroll", checkInFlowVisibility, { passive: true });
    return () => aside.removeEventListener("scroll", checkInFlowVisibility);
  }, [checkInFlowVisibility]);

  useEffect(() => {
    if (!inFlowButtonRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInFlowVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(inFlowButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSelectMobileCategory = (cat: "foto" | "estilo" | "saida") => {
    if (mobileView === "form" && activeMobileCategory === cat) {
      setMobileView("palco");
      return;
    }
    setMobileView("form");
    setActiveMobileCategory(cat);
    setActiveStageMode("builder");
  };

  const styleDescriptions: Record<"fotografia" | "estudio" | "hiper_realismo", string> = {
    fotografia:
      "Transforma uma foto comum em fotografia editorial profissional, elevando o realismo e a iluminação sem alterar a identidade ou o cenário.",
    estudio:
      "Retoque de estúdio — pele refinada, cores corrigidas, iluminação aprimorada, acabamento editorial.",
    hiper_realismo:
      "Quebra o look de IA: pele com poros reais, cabelo com fios individuais, olhos com textura humana. Para imagens geradas que parecem artificiais.",
  };

  const qualityResolutionMap: Record<EnhanceDimension, Record<"1K" | "2K" | "4K", string>> = {
    "original": {
      "1K": originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}` : "Original • 1K",
      "2K": originalDimensions ? `${Math.round(originalDimensions.width * 1.5)}×${Math.round(originalDimensions.height * 1.5)}` : "Original • 2K",
      "4K": originalDimensions ? `${originalDimensions.width * 2}×${originalDimensions.height * 2}` : "Original • 4K",
    },
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 min timeout
      let res: Response;
      try {
        res = await fetch("/api/enhancer-supir-magnific", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
          signal: controller.signal,
          body: JSON.stringify({
            imageBase64: photoBase64,
            mode: selectedStyle,
            dimension,
            quality,
            instructions: extraInstructions,
            customApiKey: apiKey,
          }),
        });
      } finally {
        clearTimeout(timeoutId);
      }
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

      const resultImg = data.image || data.outputBase64 || data.enhancedImage;
      if (resultImg) {
        setEnhancedImage(resultImg);
        const newItem: EnhanceHistoryItem = {
          id: `enh-${Date.now()}`,
          originalUrl: photoBase64,
          enhancedUrl: resultImg,
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
    setSelectedStyle("fotografia");
    setDimension("4:5");
    setQuality("2K");
  };

  const renderFotoSection = () => (
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
            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <span className="font-light text-[#5c5278] text-4xl">+</span>
                <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
          multiple={false}
          className="hidden"
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
      </div>
    </div>
  );

  const renderEstiloSection = () => (
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
            <Sun className="h-4 w-4" />
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
            <Sparkles className="h-4 w-4" />
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
            <Camera className="h-4 w-4" />
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
  );

  const renderConfigSection = () => (
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
              {/* Original */}
              <button
                type="button"
                aria-pressed={dimension === "original"}
                onClick={() => setDimension("original")}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                  dimension === "original" ? "pb-ctrl-active" : ""
                }`}
                style={dimension === "original" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
              >
                <span className={`text-[12px] font-semibold transition-colors ${dimension === "original" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                  Original
                </span>
                <span className={`font-mono text-[11px] ${dimension === "original" ? "text-violet-300" : "text-[#5c5278]"}`}>
                  {originalDimensions ? `${originalDimensions.width}x${originalDimensions.height}` : "Auto"}
                </span>
                <span className="text-[10px] text-zinc-500">Foto</span>
              </button>

              {/* Stories / Reels 9:16 */}
              <button
                type="button"
                aria-pressed={dimension === "9:16"}
                onClick={() => setDimension("9:16")}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                  dimension === "9:16" ? "pb-ctrl-active" : ""
                }`}
                style={dimension === "9:16" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
              >
                <span className={`text-[12px] font-semibold transition-colors ${dimension === "9:16" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                  Stories
                </span>
                <span className={`font-mono text-[11px] ${dimension === "9:16" ? "text-violet-300" : "text-[#5c5278]"}`}>
                  9:16
                </span>
                <span className="text-[10px] text-zinc-500">Vertical</span>
              </button>

              {/* Feed Vertical 4:5 */}
              <button
                type="button"
                aria-pressed={dimension === "4:5"}
                onClick={() => setDimension("4:5")}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                  dimension === "4:5" ? "pb-ctrl-active" : ""
                }`}
                style={dimension === "4:5" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
              >
                <span className={`text-[12px] font-semibold transition-colors ${dimension === "4:5" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                  Feed Vertical
                </span>
                <span className={`font-mono text-[11px] ${dimension === "4:5" ? "text-violet-300" : "text-[#5c5278]"}`}>
                  4:5
                </span>
                <span className="text-[10px] text-zinc-500">Instagram</span>
              </button>

              {/* Feed Quadrado 1:1 */}
              <button
                type="button"
                aria-pressed={dimension === "1:1"}
                onClick={() => setDimension("1:1")}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                  dimension === "1:1" ? "pb-ctrl-active" : ""
                }`}
                style={dimension === "1:1" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
              >
                <span className={`text-[12px] font-semibold transition-colors ${dimension === "1:1" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                  Feed
                </span>
                <span className={`font-mono text-[11px] ${dimension === "1:1" ? "text-violet-300" : "text-[#5c5278]"}`}>
                  1:1
                </span>
                <span className="text-[10px] text-zinc-500">Quadrado</span>
              </button>

              {/* Cinema 16:9 */}
              <button
                type="button"
                aria-pressed={dimension === "16:9"}
                onClick={() => setDimension("16:9")}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                  dimension === "16:9" ? "pb-ctrl-active" : ""
                }`}
                style={dimension === "16:9" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
              >
                <span className={`text-[12px] font-semibold transition-colors ${dimension === "16:9" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                  Cinema
                </span>
                <span className={`font-mono text-[11px] ${dimension === "16:9" ? "text-violet-300" : "text-[#5c5278]"}`}>
                  16:9
                </span>
                <span className="text-[10px] text-zinc-500">Horizontal</span>
              </button>
            </div>

            {/* Box de Preview da Proporção */}
            <div
              aria-hidden="true"
              className="hidden sm:flex min-h-[170px] w-[120px] items-center justify-center rounded-xl pb-ctrl-btn p-2"
            >
              <div
                className="rounded-md transition-all duration-300"
                style={{
                  width:
                    dimension === "16:9"
                      ? "96%"
                      : dimension === "original"
                      ? originalDimensions && originalDimensions.width > originalDimensions.height
                        ? "96%"
                        : "80%"
                      : dimension === "9:16"
                      ? "92%"
                      : dimension === "4:5"
                      ? "92%"
                      : "90%",
                  maxHeight:
                    dimension === "16:9"
                      ? "54%"
                      : dimension === "original"
                      ? originalDimensions && originalDimensions.height > originalDimensions.width
                        ? "92%"
                        : "70%"
                      : dimension === "9:16"
                      ? "92%"
                      : dimension === "4:5"
                      ? "92%"
                      : "90%",
                  aspectRatio:
                    dimension === "16:9"
                      ? "16 / 9"
                      : dimension === "9:16"
                      ? "9 / 16"
                      : dimension === "4:5"
                      ? "4 / 5"
                      : dimension === "original"
                      ? originalAspectRatio
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

      {/* Instruções adicionais (opcional) */}
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
            onClick={() => {
              setTempExtraInstructions(extraInstructions);
              setIsExpandInstructionsOpen(true);
            }}
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
  );

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-black text-white relative font-sans select-none flex-col">
      <div
        data-builder-workspace-shell=""
        className={`relative flex h-full min-h-0 overflow-hidden bg-black lg:flex-row max-lg:grid max-lg:overflow-hidden max-lg:transition-[grid-template-rows] max-lg:duration-300 max-lg:ease-in-out ${
          activeStageMode === "galeria" || mobileView === "palco" || isProcessing ? "max-lg:grid-rows-[1fr_0fr]" : "max-lg:grid-rows-[auto_1fr]"
        } flex-1`}
      >
        {/* ── ASIDE FORM COL (420px) ── */}
        <aside
          ref={asideRef}
          onScroll={checkInFlowVisibility}
          data-aside-form-col=""
          data-tour="form"
          className={`agent-form-col relative z-10 flex shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] gap-5 lg:gap-6 lg:sticky lg:top-0 lg:h-full max-lg:order-2 max-lg:w-full max-lg:min-h-0 ${
            activeStageMode === "galeria" || mobileView === "palco" || isProcessing ? "max-lg:hidden" : ""
          }`}
          style={isMobile ? undefined : { width: "420px", minWidth: "280px", maxWidth: "700px" }}
        >
        {isMobile ? (
          <>
            {/* Guia button (Mobile) */}
            <div className="flex justify-end lg:hidden">
              <button
                type="button"
                data-tour="header-actions"
                aria-haspopup="menu"
                aria-expanded={isGuiaMenuOpen}
                aria-label="Guia"
                onClick={handleToggleGuia}
                className="flex shrink-0 items-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors hover:bg-white/[0.06] max-lg:px-2.5 h-9 px-4 uppercase tracking-wider"
                style={{ color: "rgb(168, 85, 247)", border: "1px solid rgba(168, 85, 247, 0.2)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-3.5 w-3.5 shrink-0" aria-hidden="true"><path d="M12 5v16"></path><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"></path></svg>
                <span className="max-lg:hidden">Guia</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3 w-3 shrink-0 transition-transform duration-200 max-lg:hidden" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
            </div>

            {/* Etapa Ativa */}
            {activeMobileCategory === "foto" && renderFotoSection()}
            {activeMobileCategory === "estilo" && renderEstiloSection()}
            {activeMobileCategory === "saida" && renderConfigSection()}

            {/* Duplicar & Resetar */}
            <div className="flex gap-2">
              <button
                type="button"
                title={tabs.length >= 3 ? "Limite de 3 abas atingido" : "Duplicar configurações para uma nova aba"}
                onClick={handleDuplicate}
                disabled={tabs.length >= 3}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-4 w-4" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
                Duplicar
              </button>
              <button
                type="button"
                title="Resetar todas as configurações do formulário"
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-4 w-4" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Resetar
              </button>
            </div>

            <div className="h-20 shrink-0" aria-hidden="true"></div>
          </>
        ) : (
          <>
            {renderFotoSection()}
            {renderEstiloSection()}
            {renderConfigSection()}

            {/* ── BOTÃO MELHORAR IMAGEM E AÇÕES NO FIM DO FORMULÁRIO (IN-FLOW) ── */}
            <div ref={inFlowButtonRef} className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  if (!photoBase64) {
                    fileInputRef.current?.click();
                    showToast?.("Selecione uma imagem para aprimorar", "info");
                    return;
                  }
                  handleEnhance();
                }}
                className="hidden lg:flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
                style={{
                  background: "linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))"
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Aprimorando em {quality}...</span>
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-sparkles lucide-wand-2 h-4 w-4" aria-hidden="true">
                      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
                      <path d="m14 7 3 3"></path>
                      <path d="M5 6v4"></path>
                      <path d="M19 14v4"></path>
                      <path d="M10 2v2"></path>
                      <path d="M7 8H3"></path>
                      <path d="M21 16h-4"></path>
                      <path d="M11 3H9"></path>
                    </svg>
                    Melhorar Imagem
                    <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  title={tabs.length >= 3 ? "Limite de 3 abas atingido" : "Duplicar configurações para uma nova aba"}
                  onClick={handleDuplicate}
                  disabled={tabs.length >= 3}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-4 w-4" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                  Duplicar
                </button>
                <button
                  type="button"
                  title="Resetar todas as configurações do formulário"
                  onClick={handleReset}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-4 w-4" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  Resetar
                </button>
              </div>
            </div>

            {/* ── CARD FLUTUANTE STICKY (VISÍVEL NO DESKTOP ENQUANTO NÃO ROLAR ATÉ O FINAL) ── */}
            {!isInFlowVisible && (
              <div className="hidden lg:block sticky bottom-0 z-20 mt-auto rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
                <div className="w-full">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      if (!photoBase64) {
                        fileInputRef.current?.click();
                        showToast?.("Selecione uma imagem para aprimorar", "info");
                        return;
                      }
                      handleEnhance();
                    }}
                    className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
                    style={{
                      background: "linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))"
                    }}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>Aprimorando em {quality}...</span>
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-sparkles lucide-wand-2 h-4 w-4" aria-hidden="true">
                          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
                          <path d="m14 7 3 3"></path>
                          <path d="M5 6v4"></path>
                          <path d="M19 14v4"></path>
                          <path d="M10 2v2"></path>
                          <path d="M7 8H3"></path>
                          <path d="M21 16h-4"></path>
                          <path d="M11 3H9"></path>
                        </svg>
                        Melhorar Imagem
                        <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 px-1 pb-0.5">
                  <div className="flex items-center justify-center gap-4 text-[11px] text-[#9d94bb]">
                    <button
                      type="button"
                      title={tabs.length >= 3 ? "Limite de 3 abas atingido" : "Duplicar configurações para uma nova aba"}
                      onClick={handleDuplicate}
                      disabled={tabs.length >= 3}
                      className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-3 w-3" aria-hidden="true">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                      </svg>
                      Duplicar
                    </button>
                    <button
                      type="button"
                      title="Resetar todas as configurações do formulário"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-3 w-3" aria-hidden="true">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                      </svg>
                      Resetar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="h-20 shrink-0" aria-hidden="true"></div>
          </>
        )}
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
                const tabDisplayName = tab.name && tab.name.trim() !== "" ? tab.name : `Aba ${idx + 1}`;
                return (
                  <div key={tab.id} className="group relative flex w-fit shrink-0 items-center">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isTabActive}
                      onClick={() => switchTab(tab.id)}
                      className={`inline-flex h-7 max-w-[12rem] flex-none items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer ${
                        isTabActive ? "text-white" : "hover:bg-white/[0.06]"
                      } ${tabs.length > 1 ? "pr-5" : ""}`}
                      style={
                        isTabActive
                          ? {
                              background: "linear-gradient(135deg, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))",
                              borderColor: "rgb(124, 58, 237)",
                            }
                          : {
                              color: "rgb(124, 58, 237)",
                              borderColor: "rgba(124, 58, 237, 0.333)",
                            }
                      }
                    >
                      {renamingTabId === tab.id ? (
                        <input
                          type="text"
                          value={renamingTabName}
                          autoFocus
                          onChange={(e) => setRenamingTabName(e.target.value)}
                          onBlur={() => handleSaveTabName(tab.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTabName(tab.id);
                            if (e.key === "Escape") setRenamingTabId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-black/50 text-white text-[11px] font-semibold uppercase rounded px-1 outline-none w-16"
                        />
                      ) : (
                        <span
                          className="truncate"
                          title="Duplo clique para renomear"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setRenamingTabId(tab.id);
                            setRenamingTabName(tabDisplayName);
                          }}
                        >
                          {tabDisplayName}
                        </span>
                      )}
                    </button>
                    {tabs.length > 1 && (
                      <button
                        type="button"
                        aria-label="Fechar aba"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(e, tab.id);
                        }}
                        className={`absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-white/10 cursor-pointer ${
                          isTabActive ? "text-white hover:text-white" : "text-zinc-500 hover:text-red-400"
                        }`}
                      >
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
                          className="lucide lucide-x h-3 w-3"
                          aria-hidden="true"
                        >
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-white/[0.06] hover:text-zinc-400 cursor-pointer"
                  title="Nova aba"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-3 w-3" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
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

          {/* Guia button (Desktop) */}
          <div className="absolute right-4 top-4 hidden lg:flex">
            <button
              type="button"
              data-tour="header-actions"
              aria-haspopup="menu"
              aria-expanded={isGuiaMenuOpen}
              aria-label="Guia"
              onClick={handleToggleGuia}
              className="flex shrink-0 items-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors hover:bg-white/[0.06] max-lg:px-2.5 h-10 px-5 uppercase tracking-wider cursor-pointer"
              style={{ color: "rgb(168, 85, 247)", border: "1px solid rgba(168, 85, 247, 0.2)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-3.5 w-3.5 shrink-0" aria-hidden="true"><path d="M12 5v16"></path><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"></path></svg>
              <span className="max-lg:hidden">Guia</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down h-3 w-3 shrink-0 transition-transform duration-200 max-lg:hidden ${isGuiaMenuOpen ? "rotate-180" : ""}`} aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
          </div>
        </div>

        {/* Modo Builder: Palco de Preview Oficial */}
        {/* Palco Central e Galeria */}
        {/* Container Principal: Palco + Coluna Lateral de Histórico à Direita */}
        {/* 2. Palco Builder Oficial */}
        <div className={`flex flex-1 min-h-0 flex-col overflow-hidden ${mobileView === "form" && !isProcessing ? "max-lg:hidden" : ""} ${activeStageMode === "galeria" ? "hidden" : ""}`}>
          <div className="relative flex flex-1 min-h-0 flex-row overflow-hidden">
            <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden">
              {isMobile && mobileView === "palco" && !isProcessing && (
                <div className="absolute top-3 left-3 z-30 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileView("form")}
                    className="flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 backdrop-blur-md border border-white/10 hover:text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Opções</span>
                  </button>
                </div>
              )}
                {isProcessing ? (
                  <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-4">
                    <div
                      className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden db-generating-card animate-in fade-in zoom-in-95 duration-300"
                      style={{
                        width: "min(88%, 460px)",
                        aspectRatio:
                          dimension === "9:16"
                            ? "9/16"
                            : dimension === "1:1"
                            ? "1/1"
                            : dimension === "16:9"
                            ? "16/9"
                            : dimension === "original"
                            ? (originalAspectRatio || "4/5")
                            : "4/5",
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
                  </div>
                ) : enhancedImage ? (
                  /* 2. Imagem Aprimorada Concluída */
                  <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-4 pb-32 sm:pb-36">
                    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col items-center justify-center overflow-hidden">
                      {/* Display da Imagem / Comparador */}
                      <div className="flex flex-1 min-h-0 w-full items-center justify-center">
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
                  </div>
                ) : photoBase64 ? (
                  /* 3. Prévia da Foto Enviada (Aguardando clique em Melhorar Imagem) */
                  <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-4">
                    <div className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
                      <img
                        alt="Foto enviada"
                        className="block h-auto w-auto max-h-full max-w-full shrink rounded-2xl object-contain shadow-lg ring-1 ring-white/10"
                        src={photoBase64}
                      />
                      <span className="absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-md ring-1 ring-white/10">
                        Prévia
                      </span>
                    </div>
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
                        aria-hidden="true"
                      >
                        <path d="M12 3v12"></path>
                        <path d="m17 8-5-5-5 5"></path>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-[#5c5278] max-w-[200px]">Envie uma foto para ver a prévia aqui</p>
                  </div>
                )}

                {/* Magic Refine Bar & Ações Inferiores da Arte (100% IDÊNTICO AO SNIPPET OFICIAL) */}
                {(enhancedImage || photoBase64) && (
                  <>
                    {/* Gradiente Inferior Oficial */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-48 bg-gradient-to-t from-[rgba(4,2,12,0.70)] via-[rgba(4,2,12,0.35)] to-transparent" />

                    {/* Ações Inferiores da Arte */}
                    <div className="@container absolute inset-x-0 bottom-0 pointer-events-none">
                      {/* Lateral Esquerda: Reportar, Reutilizar, Favoritar, Publicar (+ Comparar) */}
                      <div className="acoes-da-arte pointer-events-auto absolute left-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-start max-lg:hidden" style={{ bottom: "108px" }}>
                        {photoBase64 && enhancedImage && (
                          <button
                            type="button"
                            onClick={() => setIsComparing(!isComparing)}
                            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                              isComparing
                                ? "bg-violet-600 text-white ring-1 ring-violet-400"
                                : "bg-black/70 text-zinc-300 hover:text-white"
                            }`}
                            title="Comparar foto original com a versão melhorada"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                            <span className="rotulo-da-acao">{isComparing ? "Ver Aprimorada" : "Comparar"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onOpenReport?.();
                            showToast?.("Reportar geração aberto!", "info");
                          }}
                          title="Reportar geração (problema nesta geração)"
                          aria-label="Reportar geração"
                          disabled={!enhancedImage && !photoBase64}
                          className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => showToast?.("Configurações do Enhance reutilizadas!", "info")}
                          title="Reutilizar configurações"
                          disabled={!enhancedImage && !photoBase64}
                          className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="rotulo-da-acao ml-1.5">Reutilizar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsFavorited(!isFavorited);
                            showToast?.(isFavorited ? "Removido dos favoritos" : "Favoritado!", "info");
                          }}
                          title="Favoritar"
                          disabled={!enhancedImage && !photoBase64}
                          className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                          <span className="rotulo-da-acao ml-1.5">Favoritar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onOpenCommunity?.();
                            showToast?.("Publicar na Comunidade aberto!", "info");
                          }}
                          title="Publicar na Comunidade"
                          disabled={!enhancedImage && !photoBase64}
                          className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="rotulo-da-acao ml-1.5">Publicar</span>
                        </button>
                      </div>

                      {/* Lateral Direita: Exportar, Usar como base (100% IDÊNTICO AO SNIPPET DO USUÁRIO) */}
                      <div ref={rightActionsRef} className="acoes-da-arte pointer-events-auto absolute right-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-end max-lg:hidden" style={{ bottom: "108px" }}>
                        {/* Exportar Popover */}
                        <div className="relative">
                          <div>
                            <button
                              type="button"
                              onClick={() => setIsExportPopoverOpen(!isExportPopoverOpen)}
                              title="Exportar"
                              disabled={!enhancedImage && !photoBase64}
                              className={`flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                                isExportPopoverOpen ? "bg-black/70 text-violet-300" : "bg-black/70 text-zinc-300 hover:text-white"
                              }`}
                            >
                              <Download className="h-4 w-4" />
                              <span className="rotulo-da-acao ml-1.5">Exportar</span>
                            </button>
                          </div>

                          {isExportPopoverOpen && (
                            <div
                              className="absolute bottom-full mb-2 z-30 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 right-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium text-zinc-500">Baixar</p>
                              {[
                                { format: "avif", label: "AVIF", sub: "Original" },
                                { format: "png", label: "PNG", sub: "Sem perda" },
                                { format: "jpeg", label: "JPEG", sub: "Alta qualidade" },
                                { format: "webp", label: "WebP", sub: "Web otimizado" },
                              ].map((item) => (
                                <button
                                  key={item.format}
                                  type="button"
                                  onClick={() => {
                                    setIsExportPopoverOpen(false);
                                    handleDownloadFormat(item.format as any);
                                  }}
                                  className="flex w-full items-center gap-2.5 whitespace-nowrap px-3.5 py-2 text-xs text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-zinc-200 cursor-pointer"
                                >
                                  <Download className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                                  <span className="font-medium text-zinc-300">{item.label}</span>
                                  <span className="text-zinc-600">{item.sub}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Usar como base */}
                        <button
                          type="button"
                          onClick={handleUseAsBase}
                          disabled={!enhancedImage && !photoBase64}
                          title="Usar esta imagem como entrada do agente"
                          className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span className="rotulo-da-acao ml-1.5">Usar como base</span>
                        </button>
                      </div>

                      {/* Bloco Central: Magic Refine Bar */}
                      {enhancedImage && (
                        <div className="pointer-events-auto">
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
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

            {/* Coluna Lateral de Histórico Oficial (72px) SEMPRE à Direita do Palco */}
            <div
              data-tour="history"
              className="coluna-de-historico z-50 shrink-0 flex-col transition-all duration-300 border-l border-white/[0.04] bg-black relative z-10 hidden h-full lg:flex"
              style={{ width: "72px", "--largura-do-historico": "72px" } as any}
            >
              <div
                className="historico-lateral relative flex h-full flex-col bg-black w-full"
                style={{ width: "100%" }}
              >
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
                          setActiveStageMode("builder");
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
        </div>

        {/* Histórico Móvel Oficial (Drawer Lateral Flutuante) */}
        {isMobileHistoryOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
            <div
              className="coluna-de-historico fixed inset-y-0 right-0 z-50 flex shadow-2xl w-44 shrink-0 flex-col border-l border-white/[0.04] bg-black lg:hidden"
              style={{ width: "176px" }}
            >
              <div className="historico-lateral relative flex h-full flex-col bg-black w-full">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
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
                          setActiveStageMode("builder");
                        }}
                        className="block w-full cursor-pointer"
                        title="Geração — clique para visualizar"
                      >
                        <img
                          alt="Geração"
                          src={item.enhancedUrl}
                          className="block w-full bg-black object-cover"
                          loading="lazy"
                          decoding="async"
                          style={{
                            aspectRatio: dimension ? dimension.replace(":", " / ") : "4 / 5"
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. Modo Galeria Oficial */}
        <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide ${activeStageMode === "builder" ? "hidden" : ""}`}>
          <div className="flex flex-col">
              <div className="flex items-center gap-2 min-w-0 sticky top-0 z-10 bg-black/80 backdrop-blur-sm px-3 py-2.5">
                <div
                  className="pointer-events-auto inline-flex items-center rounded-full border border-white/[0.06] p-1"
                  style={{ background: "rgba(10, 7, 25, 0.7)" }}
                >
                  <button
                    type="button"
                    aria-pressed={historyTab === "todos"}
                    onClick={() => setHistoryTab("todos")}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      historyTab === "todos" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={
                      historyTab === "todos"
                        ? { background: "linear-gradient(135deg, rgb(124, 58, 237), rgb(147, 51, 234))" }
                        : {}
                    }
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    aria-pressed={historyTab === "favs"}
                    onClick={() => setHistoryTab("favs")}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      historyTab === "favs" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={
                      historyTab === "favs"
                        ? { background: "linear-gradient(135deg, rgb(236, 72, 153), rgb(219, 39, 119))" }
                        : {}
                    }
                  >
                    Favs
                  </button>
                </div>
                <button
                  type="button"
                  title="Atualizar histórico"
                  aria-label="Atualizar histórico"
                  onClick={() => {
                    try {
                      const saved = localStorage.getItem("zion_enhance_history");
                      if (saved) setHistoryItems(JSON.parse(saved));
                    } catch {}
                    showToast?.("Histórico atualizado!", "info");
                  }}
                  className="ml-auto shrink-0 rounded-lg transition-colors p-2 text-zinc-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-4 w-4" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
              </div>

              <div className="p-3">
                {(() => {
                  const filtered = historyItems.filter((item) => (historyTab === "favs" ? item.isFav : true));
                  if (filtered.length === 0) {
                    if (historyTab === "favs") {
                      return (
                        <div className="flex flex-col items-center justify-center text-center px-4 py-12">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart mb-3 text-zinc-700 h-12 w-12" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path></svg>
                          <p className="font-medium text-zinc-400 text-sm mb-1">Você ainda não favoritou nenhuma geração</p>
                          <p className="text-zinc-600 text-xs">Clique no coração nas gerações para salvá-las aqui.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col items-center justify-center text-center px-4 py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image mb-3 text-zinc-700 h-12 w-12" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                        <p className="font-medium text-zinc-400 text-sm">Sem gerações ainda</p>
                        <p className="text-xs text-zinc-600 mt-1">Suas próximas gerações aparecerão aqui.</p>
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
      </main>
      </div>

      {/* ── BOTTOM MOBILE NAV OFICIAL ── */}
      <nav
        aria-label="Categorias e ações de construção"
        className="relative shrink-0 overflow-x-hidden border-t border-white/[0.08] backdrop-blur-xl pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.35)] lg:hidden"
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
          className="flex items-stretch gap-0.5 overflow-x-auto scrollbar-hide px-2 py-1.5 [scroll-snap-type:x_proximity]"
        >
          {/* Início */}
          <button
            type="button"
            aria-label="Sair para o início"
            onClick={() => {
              if (onOpenVitrine) {
                onOpenVitrine();
              } else if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("db:go_home"));
              }
            }}
            className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-zinc-300"
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
            aria-selected={mobileView === "form" && activeMobileCategory === "foto"}
            aria-current={mobileView === "form" && activeMobileCategory === "foto" ? "true" : undefined}
            onClick={() => {
              handleSelectMobileCategory("foto");
            }}
            className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 ${
              mobileView === "form" && activeMobileCategory === "foto" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                mobileView === "form" && activeMobileCategory === "foto" ? "" : "group-hover:bg-white/[0.06]"
              }`}
              style={mobileView === "form" && activeMobileCategory === "foto" ? { backgroundColor: "rgba(139, 92, 246, 0.15)" } : {}}
            >
              <span className="relative">
                <ImageIcon
                  className="h-[22px] w-[22px]"
                  style={mobileView === "form" && activeMobileCategory === "foto" ? { color: "rgb(139, 92, 246)" } : {}}
                />
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">Foto</span>
          </button>

          {/* Estilo */}
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === "form" && activeMobileCategory === "estilo"}
            aria-current={mobileView === "form" && activeMobileCategory === "estilo" ? "true" : undefined}
            onClick={() => {
              handleSelectMobileCategory("estilo");
            }}
            className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 ${
              mobileView === "form" && activeMobileCategory === "estilo" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                mobileView === "form" && activeMobileCategory === "estilo" ? "" : "group-hover:bg-white/[0.06]"
              }`}
              style={mobileView === "form" && activeMobileCategory === "estilo" ? { backgroundColor: "rgba(139, 92, 246, 0.15)" } : {}}
            >
              <span className="relative">
                <Palette
                  className="h-[22px] w-[22px]"
                  style={mobileView === "form" && activeMobileCategory === "estilo" ? { color: "rgb(139, 92, 246)" } : {}}
                />
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
            aria-selected={mobileView === "form" && activeMobileCategory === "saida"}
            aria-current={mobileView === "form" && activeMobileCategory === "saida" ? "true" : undefined}
            onClick={() => {
              handleSelectMobileCategory("saida");
            }}
            className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 ${
              mobileView === "form" && activeMobileCategory === "saida" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                mobileView === "form" && activeMobileCategory === "saida" ? "" : "group-hover:bg-white/[0.06]"
              }`}
              style={mobileView === "form" && activeMobileCategory === "saida" ? { backgroundColor: "rgba(139, 92, 246, 0.15)" } : {}}
            >
              <span className="relative">
                <SlidersHorizontal
                  className="h-[22px] w-[22px]"
                  style={mobileView === "form" && activeMobileCategory === "saida" ? { color: "rgb(139, 92, 246)" } : {}}
                />
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">Saída</span>
          </button>

          <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

          {/* Construir / Melhorar Imagem */}
          <button
            type="button"
            aria-label="Construir"
            disabled={isProcessing}
            onClick={() => {
              if (!photoBase64) {
                fileInputRef.current?.click();
                showToast?.("Selecione uma imagem para aprimorar", "info");
                return;
              }
              handleEnhance();
            }}
            className="group ml-0.5 flex min-h-[52px] min-w-[78px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl px-3 text-white transition-transform duration-100 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              color: "rgb(255, 255, 255)",
              background: "linear-gradient(to right, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))",
              boxShadow: "rgba(139, 92, 246, 0.35) 0px 4px 16px",
            }}
          >
            {isProcessing ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <span className="whitespace-nowrap text-sm font-extrabold leading-tight">Melhorar Imagem</span>
            )}
          </button>
        </div>
      </nav>

      {/* ── MODAL: EXPANDIR INSTRUÇÕES (Radix Dialog Idêntico ao Original) ── */}
      {isExpandInstructionsOpen && (
        <>
          <div
            data-state="open"
            className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
            style={{ pointerEvents: "auto" }}
            onClick={() => setIsExpandInstructionsOpen(false)}
          />
          <div
            role="dialog"
            id="radix-_r_65_"
            data-state="open"
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            tabIndex={-1}
            aria-describedby="radix-_r_67_"
            aria-labelledby="radix-_r_66_"
            style={{ pointerEvents: "auto" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsExpandInstructionsOpen(false);
              } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                setExtraInstructions(tempExtraInstructions);
                setIsExpandInstructionsOpen(false);
              }
            }}
          >
            <p id="radix-_r_67_" className="sr-only">
              Editor expandido para o campo Instruções adicionais (opcional). Use Ctrl+Enter para salvar, Esc para cancelar.
            </p>
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <h2 id="radix-_r_66_" className="text-sm font-semibold text-white">
                Instruções adicionais (opcional)
              </h2>
              <button
                type="button"
                onClick={() => setIsExpandInstructionsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
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
                  className="lucide lucide-x h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            <div className="flex-1 p-5">
              <textarea
                placeholder="Ex: manter tons quentes, reforçar brilho nos olhos..."
                rows={12}
                value={tempExtraInstructions}
                onChange={(e) => setTempExtraInstructions(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors resize-y min-h-[200px] focus:border-violet-500/30"
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
              <span className="text-xs text-zinc-500">Ctrl+Enter para salvar</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpandInstructionsOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExtraInstructions(tempExtraInstructions);
                    setIsExpandInstructionsOpen(false);
                  }}
                  className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors bg-violet-600 hover:bg-violet-500 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </>
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

      {/* ── MENU FLUTUANTE: GUIA ── */}
      {isGuiaMenuOpen && guiaMenuCoords && (
        <div
          ref={guiaMenuRef}
          role="menu"
          className="fixed z-[10060] flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/60"
          style={{ width: "216px", top: `${guiaMenuCoords.top}px`, left: `${guiaMenuCoords.left}px` }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsGuiaMenuOpen(false);
              if (onOpenAssistant) onOpenAssistant();
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-4 w-4 shrink-0" aria-hidden="true" style={{ color: "rgb(168, 85, 247)" }}>
              <path d="M12 5v16"></path>
              <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"></path>
            </svg>
            Tour Guiado
          </button>
          <button
            type="button"
            role="menuitem"
            data-tour="demo"
            onClick={() => {
              setIsGuiaMenuOpen(false);
              showToast?.("Iniciando demonstração...", "info");
              if (onOpenAssistant) onOpenAssistant();
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-4 w-4 shrink-0" aria-hidden="true" style={{ color: "rgb(168, 85, 247)" }}>
              <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
              <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
              <path d="M10 9H8"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
            </svg>
            Assistir tutorial
          </button>
        </div>
      )}
      {/* Barra de controle inferior mobile removida pois já existe no header superior e estava sobrepondo o botão Construir */}
    </div>
  );
};

export default EnhanceBuilder;
