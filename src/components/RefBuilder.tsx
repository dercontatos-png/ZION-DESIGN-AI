import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useProjectStore, addDeletedImage } from "../store/useProjectStore";
import { checkAdminOrOpenPlan, getAuthHeaders } from "../utils/userAuth";
import { downloadImage } from "../utils/downloadImage";
import { deductCredit, getCreditState } from "../utils/creditsManager";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { ImageCropModal } from "./ImageCropModal";
import { CarouselSlicerModal } from "./CarouselSlicerModal";
import { ProjetosWorkspace } from "./ProjetosWorkspace";
import { GenerationLoadingCanvas } from "./GenerationLoadingCanvas";
import { UsefulLinksMenu } from "./UsefulLinksMenu";
import { optimizeBase64Image } from "../utils/compressBase64";
import { extractImageTimestamp, sortImagesChronological } from "../utils/imageCanonical";

import { REF_PINTEREST_CARDS } from "../data/refPinterestData";
import { COMMUNITY_CARDS } from "../data/communityData";
import {
  AlertTriangle,
  RotateCcw,
  Heart,
  Globe,
  Crop,
  Download,
  Sparkles,
  Pencil,
  Paperclip,
  Send,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  FileText,
  Check,
  Copy,
  Settings2,
  ChevronDown,
  ChevronUp,
  User,
  Layers,
  Loader2,
  Sliders,
  SlidersHorizontal,
  Clock,
  Scissors,
  ChevronLeft
} from "lucide-react";

interface RefBuilderProps {
  onSwitchAgent?: (agent: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (message: string, type?: "error" | "info" | "success" | "warning") => void;
}

export interface SubjectImageItem {
  id: string;
  url: string;
  desc: string;
}

interface RefTabState {
  mainPhotoBase64: string | null;
  mainPhotos: SubjectImageItem[];
  isManagingSujeitos: boolean;
  subjectPosition: "left" | "center" | "right";
  logoPosition?: "auto" | "top_center" | "center" | "bottom_center" | "top_left" | "top_right" | "bottom_left" | "bottom_right";
  customHeadline?: string;
  customSubtitle?: string;
  customBadge?: string;
  customFooter?: string;
  textAlignment?: "center" | "left" | "right";
  showTypographyDrawer?: boolean;
  refPhotoBase64: string | null;
  refPhotoDesc: string;
  refPhotos: SubjectImageItem[];
  isManagingReferencias: boolean;
  useRefOnBuild: boolean;
  dimension: "9:16" | "4:5" | "1:1" | "16:9" | "3:4" | "4:3" | "custom";
  customWidth?: number;
  customHeight?: number;
  quality: "1K" | "2K" | "4K";
  assetsPhotoBase64: string | null;
  assetsPhotoDesc: string;
  assetsPhotos: SubjectImageItem[];
  isManagingAssets: boolean;
  additionalDescription: string;
  generatedImage: string | null;
  masterPromptResult: string;
}

const defaultTabState: RefTabState = {
  mainPhotoBase64: null,
  mainPhotos: [],
  isManagingSujeitos: false,
  subjectPosition: "center",
  logoPosition: "auto",
  customHeadline: "",
  customSubtitle: "",
  customBadge: "",
  customFooter: "",
  textAlignment: "center",
  showTypographyDrawer: false,
  refPhotoBase64: null,
  refPhotoDesc: "",
  refPhotos: [],
  isManagingReferencias: false,
  useRefOnBuild: true,
  dimension: "1:1",
  customWidth: 1200,
  customHeight: 630,
  quality: "4K",
  assetsPhotoBase64: null,
  assetsPhotoDesc: "",
  assetsPhotos: [],
  isManagingAssets: false,
  additionalDescription: "",
  generatedImage: "/1_files/ref-1.avif",
  masterPromptResult: ""
};

const cleanPromptText = (text: string): string => {
  if (!text) return "";
  let clean = text.trim();
  // Remove tags <think>...</think>
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 1. Se veio em bloco de código ```prompt ou ```text
  const promptCodeBlocks = [...clean.matchAll(/```(?:prompt|text|markdown)?\s*([\s\S]*?)```/gi)];
  for (const block of promptCodeBlocks) {
    const candidate = block[1]?.trim() || "";
    // Ignora placeholders com reticências
    if (candidate.length > 50 && !candidate.includes("Cinematic 8k commercial photograph...")) {
      return candidate;
    }
  }

  // 2. Se tiver a estrutura modular fotográfica [Camera Angle / [Sony A1 Setup
  const cameraIndex = clean.indexOf("[Camera Angle");
  if (cameraIndex !== -1) {
    const textBefore = clean.substring(0, cameraIndex).trim();
    const paragraphs = textBefore.split("\n\n").filter(Boolean);
    const lastParagraph = paragraphs.pop() || "";
    const startPos = (lastParagraph.length > 20 && !lastParagraph.includes("Ele pediu") && !lastParagraph.includes("Vou compor"))
      ? clean.indexOf(lastParagraph)
      : cameraIndex;

    const fromStart = clean.substring(startPos);
    const endMatch = fromStart.match(/(?:\n\s*(?:Mas o usuário|Ele pediu|Vou verificar|Vou definir|Primeiro o bloco|Vou colocar|Nota:|Lembrete:|Observação:|```json|```))/i);
    let promptExtract = endMatch ? fromStart.substring(0, endMatch.index).trim() : fromStart.trim();
    promptExtract = promptExtract.replace(/```json[\s\S]*?```/gi, "").trim();
    if (promptExtract.length > 100) {
      return promptExtract;
    }
  }

  // 3. Se houver [EN] e [PT] reais no texto (mesmo misturado com raciocínio ou pensamentos)
  const enIndex = clean.lastIndexOf("[EN]");
  if (enIndex !== -1) {
    const fromEn = clean.substring(enIndex);
    const endMatch = fromEn.match(/(?:\n\s*(?:Mas o usuário|Ele pediu|Vou verificar|Vou definir|Primeiro o bloco|Vou colocar|Nota:|Lembrete:|Observação:|```json|```))/i);
    let promptExtract = endMatch ? fromEn.substring(0, endMatch.index).trim() : fromEn.trim();
    promptExtract = promptExtract.replace(/```json[\s\S]*?```/gi, "").trim();

    if (promptExtract.length > 50 && !promptExtract.includes("Cinematic 8k commercial photograph...")) {
      return promptExtract;
    }
  }

  // 4. Se houver apenas [PT]
  const ptIndex = clean.lastIndexOf("[PT]");
  if (ptIndex !== -1) {
    const fromPt = clean.substring(ptIndex);
    const endMatch = fromPt.match(/(?:\n\s*(?:Mas o usuário|Ele pediu|Vou verificar|Vou definir|Primeiro o bloco|Vou colocar|Nota:|Lembrete:|Observação:|```json|```))/i);
    let promptExtract = endMatch ? fromPt.substring(0, endMatch.index).trim() : fromPt.trim();
    promptExtract = promptExtract.replace(/```json[\s\S]*?```/gi, "").trim();
    if (promptExtract.length > 50) {
      return promptExtract;
    }
  }

  // 5. Se houver JSON com campos de prompt
  if (clean.includes("```json")) {
    const jsonMatch = clean.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.additionalPrompt) return parsed.additionalPrompt;
        if (parsed.promptDesign) return parsed.promptDesign;
      } catch {}
    }
  }

  // 6. Se for JSON puro
  if (clean.startsWith("{") && clean.endsWith("}")) {
    try {
      const parsed = JSON.parse(clean);
      return parsed.additionalPrompt || parsed.promptDesign || parsed.promptCenario || clean;
    } catch {}
  }

  // 7. Limpeza geral de ruídos residuais
  clean = clean.replace(/```json[\s\S]*?```/gi, "").trim();
  clean = clean.replace(/^(?:Ele pediu|Vou compor|Mas o usuário|Vou verificar|Vou definir|Primeiro o bloco)[\s\S]*?(?=\[Camera Angle|\[EN\]|\[PT\])/im, "").trim();
  clean = clean.replace(/(?:Mas o usuário pediu|Vou verificar se devo|Vou definir no JSON)[\s\S]*$/im, "").trim();

  return clean;
};

const normalizeDimension = (d: any): "9:16" | "4:5" | "1:1" | "16:9" => {
  if (!d) return "1:1";
  const s = String(d).toLowerCase();
  if (s.includes("9:16") || s.includes("story") || s.includes("stories") || s.includes("1920")) return "9:16";
  if (s.includes("4:5") || s.includes("3:4") || s.includes("retrato") || s.includes("feed vertical")) return "4:5";
  if (s.includes("16:9") || s.includes("landscape") || s.includes("desktop")) return "16:9";
  return "1:1";
};

const normalizeQuality = (q: any): "1K" | "2K" | "4K" => {
  if (!q) return "4K";
  const s = String(q).toUpperCase();
  if (s.includes("8K") || s.includes("7680") || s.includes("6144")) return "4K";
  if (s.includes("4K") || s.includes("4096") || s.includes("3840")) return "4K";
  if (s.includes("2K") || s.includes("2048")) return "2K";
  return "1K";
};

export const RefBuilder: React.FC<RefBuilderProps> = ({
  onSwitchAgent,
  onOpenVitrine,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onOpenReport
}) => {
  const store = useProjectStore();

  // Sistema de Abas Oficial: estritamente Aba 1, Aba 2, Aba 3 (máximo de 3 abas)
  const [tabs, setTabs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_ref_tabs_list_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return ["Aba 1"];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_ref_active_tab_v2");
        if (saved) return saved;
      } catch (e) {}
    }
    return "Aba 1";
  });

  const [tabsData, setTabsData] = useState<Record<string, RefTabState>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_ref_tabs_data_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return { "Aba 1": defaultTabState };
  });

  // Persistência automática em localStorage e IndexedDB (garante que após F5 a imagem e dados nunca se percam)
  useEffect(() => {
    try {
      localStorage.setItem("zion_ref_tabs_list_v2", JSON.stringify(tabs));
    } catch (e) {}
  }, [tabs]);

  useEffect(() => {
    try {
      localStorage.setItem("zion_ref_active_tab_v2", activeTab);
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("zion_ref_tabs_data_v2", JSON.stringify(tabsData));
        idbSet("zion_ref_tabs_data_idb", tabsData).catch(() => {});
      } catch (e) {
        idbSet("zion_ref_tabs_data_idb", tabsData).catch(() => {});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [tabsData]);

  // Recupera IndexedDB se localStorage estava vazio
  useEffect(() => {
    idbGet("zion_ref_tabs_data_idb").then((savedIdb) => {
      if (savedIdb && typeof savedIdb === "object" && Object.keys(savedIdb).length > 0) {
        setTabsData(prev => {
          const isCurrentDefault = Object.keys(prev).length === 1 && !prev["Aba 1"]?.generatedImage && !prev["Aba 1"]?.mainPhotoBase64;
          return isCurrentDefault ? savedIdb : prev;
        });
      }
    }).catch(() => {});
  }, []);

  const [activeViewMode, setActiveViewMode] = useState<"builder" | "pinterest" | "comunidade" | "galeria">("builder");

  // Botão Gerar Prompt: modo ativar ou desativar
  // Quando ativado: gera prompt com a IA (0 créditos).
  // Quando desativado: constrói a imagem no próprio site (1 crédito).
  const [generatePromptOnly, setGeneratePromptOnly] = useState<boolean>(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [isPromptCopied, setIsPromptCopied] = useState<boolean>(false);

  // Dados da Aba Ativa Atual
  const currentTab = tabsData[activeTab] || defaultTabState;
  const mainPhotoBase64 = currentTab.mainPhotoBase64;
  const mainPhotos = currentTab.mainPhotos || [];
  const subjectImages: SubjectImageItem[] = (mainPhotos.length > 0)
    ? mainPhotos
    : (mainPhotoBase64 ? [{ id: "1", url: mainPhotoBase64, desc: "" }] : []);

  const [isManagingSujeitos, setIsManagingSujeitos] = useState<boolean>(false);
  // Sincroniza estado de gerenciamento de imagens ao trocar de aba
  useEffect(() => {
    const tab = tabsData[activeTab];
    if (tab) {
      setIsManagingSujeitos(!!tab.isManagingSujeitos);
      setIsManagingReferencias(!!tab.isManagingReferencias);
      setIsManagingAssets(!!tab.isManagingAssets);
    }
  }, [activeTab]);

  const [pinterestSearch, setPinterestSearch] = useState<string>("");

  const subjectPosition = currentTab.subjectPosition;
  const logoPosition = currentTab.logoPosition || "auto";
  const customHeadline = currentTab.customHeadline || "";
  const customSubtitle = currentTab.customSubtitle || "";
  const customBadge = currentTab.customBadge || "";
  const customFooter = currentTab.customFooter || "";
  const textAlignment = currentTab.textAlignment || "center";
  const showTypographyDrawer = currentTab.showTypographyDrawer || false;
  const refPhotoBase64 = currentTab.refPhotoBase64;
  const refPhotoDesc = currentTab.refPhotoDesc || "";
  const refPhotos = currentTab.refPhotos || [];
  const referenceImages: SubjectImageItem[] = (refPhotos.length > 0)
    ? refPhotos
    : (refPhotoBase64 ? [{ id: "1", url: refPhotoBase64, desc: refPhotoDesc || "" }] : []);

  const [isManagingReferencias, setIsManagingReferencias] = useState<boolean>(false);
  const [draggedRefIdx, setDraggedRefIdx] = useState<number | null>(null);
  const managerRefInputRef = useRef<HTMLInputElement>(null);

  const useRefOnBuild = currentTab.useRefOnBuild;
  const dimension = currentTab.dimension;
  const customWidth = currentTab.customWidth || 1200;
  const customHeight = currentTab.customHeight || 630;
  const [popoverCustomW, setPopoverCustomW] = useState<number>(1200);
  const [popoverCustomH, setPopoverCustomH] = useState<number>(630);
  const quality = currentTab.quality;
  const assetsPhotoBase64 = currentTab.assetsPhotoBase64;
  const assetsPhotoDesc = currentTab.assetsPhotoDesc || "";
  const assetsPhotos = currentTab.assetsPhotos || [];
  const assetImages: SubjectImageItem[] = (assetsPhotos.length > 0)
    ? assetsPhotos
    : (assetsPhotoBase64 ? [{ id: "1", url: assetsPhotoBase64, desc: assetsPhotoDesc || "" }] : []);

  const [isManagingAssets, setIsManagingAssets] = useState<boolean>(false);
  const [draggedAssetIdx, setDraggedAssetIdx] = useState<number | null>(null);
  const managerAssetsInputRef = useRef<HTMLInputElement>(null);

  // ── ESTADOS DE CLONAGEM DESIGNBUILDER (AÇÕES DO CANVAS, DETALHES E REFINO) ──
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState<boolean>(false);
  const [isFullscreenViewerOpen, setIsFullscreenViewerOpen] = useState<boolean>(false);
  const [showPublishAlert, setShowPublishAlert] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false);
  const [isUseAsBaseModalOpen, setIsUseAsBaseModalOpen] = useState<boolean>(false);
  const [magicRefineText, setMagicRefineText] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const inlineSubmitRef = useRef<HTMLDivElement>(null);
  const [isSubmitIntersecting, setIsSubmitIntersecting] = useState<boolean>(true);

  useEffect(() => {
    const el = inlineSubmitRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSubmitIntersecting(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };
  const [lastUsedSettings, setLastUsedSettings] = useState<any>(null);
  const [isBrushActive, setIsBrushActive] = useState<boolean>(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isReformatting, setIsReformatting] = useState<boolean>(false);
  const [activeReformatDim, setActiveReformatDim] = useState<string | null>(null);
  const [isCarouselSlicerOpen, setIsCarouselSlicerOpen] = useState<boolean>(false);
  const rightActionsRef = useRef<HTMLDivElement>(null);
  const [brushSize, setBrushSize] = useState<number>(30);
  const [brushColor, setBrushColor] = useState<string>("#a855f7");
  const [brushTool, setBrushTool] = useState<"hand" | "brush">("brush");
  const [isMobileMagicToolsOpen, setIsMobileMagicToolsOpen] = useState<boolean>(false);
  const [isDragOverMagicBar, setIsDragOverMagicBar] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [fullscreenAttachment, setFullscreenAttachment] = useState<string | null>(null);
  const [isMagicBarFocused, setIsMagicBarFocused] = useState<boolean>(false);
  const magicFileInputRef = useRef<HTMLInputElement>(null);
  const magicTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dragCounterRef = useRef<number>(0);

  // Auto-resize textarea (matches original scrollHeight logic, max 168px)
  const autoResizeTextarea = useCallback(() => {
    const el = magicTextareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
    }
  }, []);

  useLayoutEffect(() => {
    autoResizeTextarea();
  }, [magicRefineText, autoResizeTextarea]);

  // Clipboard paste handler for images
  const handleClipboardPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const f = items[i].getAsFile();
        if (f) imageFiles.push(f);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      const newAtts = imageFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
      setAttachments(prev => [...prev, ...newAtts].slice(0, 5));
    }
  }, []);

  // Dismiss popover on outside click (matches original useDismissOnOutside)
  useEffect(() => {
    if (!activePopover) return;
    const handleClick = (e: MouseEvent) => {
      if (rightActionsRef.current && !rightActionsRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activePopover]);

  // Inpaint Canvas & Panning Refs and State
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const viewerImageRef = useRef<HTMLImageElement>(null);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateCanvasDimensions = () => {
    if (viewerImageRef.current && drawingCanvasRef.current) {
      const img = viewerImageRef.current;
      const canvas = drawingCanvasRef.current;
      canvas.width = img.clientWidth || img.naturalWidth || 800;
      canvas.height = img.clientHeight || img.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (brushTool === "hand") {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      return;
    }
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokeHistory((prev) => [...prev, currentSnapshot]);
    } catch {}

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = 0.65;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && brushTool === "hand") {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }
    if (!isDrawing) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleUndoCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (strokeHistory.length > 0) {
      const prev = strokeHistory[strokeHistory.length - 1];
      ctx.putImageData(prev, 0, 0);
      setStrokeHistory((h) => h.slice(0, -1));
      showToast("Traço desfeito", "info");
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      showToast("Área limpa", "info");
    }
  };

  const handleClearCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStrokeHistory([]);
    showToast("Máscara limpa", "info");
  };

  const handleCommitMaskSelection = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], `selecao-${Date.now()}.png`, { type: "image/png" });
        const preview = URL.createObjectURL(blob);
        setAttachments((prev) => [...prev, { file, preview }].slice(0, 5));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setStrokeHistory([]);
        showToast("Seleção aprovada como referência!", "success");
      }, "image/png");
    } catch (e) {
      console.error("Erro ao adicionar seleção:", e);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    if (brushTool === "hand") {
      setIsPanning(true);
      panStartRef.current = { x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y };
      return;
    }
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokeHistory((prev) => [...prev, currentSnapshot]);
    } catch {}

    const rect = canvas.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = 0.65;
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    if (isPanning && brushTool === "hand") {
      setPanOffset({
        x: touch.clientX - panStartRef.current.x,
        y: touch.clientY - panStartRef.current.y
      });
      return;
    }
    if (!isDrawing) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleDeleteHistoryItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemToDelete = refGalleryItems.find((item) => item.id === id);
    const targetUrl = itemToDelete?.url || "";
    const filename = targetUrl.split("/").pop() || "";

    addDeletedImage(id);
    if (targetUrl) addDeletedImage(targetUrl);
    if (filename) addDeletedImage(filename);

    useProjectStore.getState().deleteGaleriaImage(targetUrl || id);
    fetch(`/api/bff/api/generations/${id}`, { method: "DELETE" }).catch(() => {});
    if (filename.endsWith(".png") || filename.endsWith(".avif") || filename.endsWith(".webp") || filename.endsWith(".jpg")) {
      fetch(`/api/historico-imagens/${filename}`, { method: "DELETE" }).catch(() => {});
    }

    setRefGalleryItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("zion_ref_history", JSON.stringify(next));
      } catch {}
      return next;
    });

    // Salvar no zion_galeria_deleted_ids para sincronizar com a galeria geral
    try {
      const savedDeleted = localStorage.getItem("zion_galeria_deleted_ids");
      const deletedList: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
      if (!deletedList.includes(id)) deletedList.push(id);
      if (itemToDelete?.url && !deletedList.includes(itemToDelete.url)) deletedList.push(itemToDelete.url);
      localStorage.setItem("zion_galeria_deleted_ids", JSON.stringify(deletedList));
    } catch {}

    // Excluir arquivo físico do disco via API DELETE
    if (itemToDelete?.url && itemToDelete.url.includes("/generated-images/")) {
      const filename = itemToDelete.url.split("/generated-images/")[1]?.split("?")[0];
      if (filename) {
        try {
          await fetch(`/api/historico-imagens/${encodeURIComponent(filename)}`, { method: "DELETE" });
        } catch (err) {
          console.error("Erro ao deletar imagem física do servidor:", err);
        }
      }
    }
  };

  // ── ESTADOS DA GALERIA E COMUNIDADE DO REF (1:1 COM SCREENSHOTS 399, 400 E 401) ──
  const [refGalleryTab, setRefGalleryTab] = useState<"todos" | "favs">("todos");
  const [refComunidadeTab, setRefComunidadeTab] = useState<"esse_app" | "todos">("esse_app");
  const [refGalleryItems, setRefGalleryItems] = useState<Array<{
    id: string;
    url: string;
    type: "refino" | "geracao";
    timestamp: number;
    isFavorited?: boolean;
    settings?: any;
  }>>(() => {
    try {
      const saved = localStorage.getItem("zion_ref_history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: "ref-demo-1", url: "/galeria/thumbnail(1).avif", type: "refino", timestamp: Date.now() - 120000, isFavorited: true },
      { id: "ref-demo-2", url: "/galeria/thumbnail(2).avif", type: "geracao", timestamp: Date.now() - 180000, isFavorited: false },
      { id: "ref-demo-3", url: "/galeria/thumbnail(3).avif", type: "geracao", timestamp: Date.now() - 240000, isFavorited: false },
    ];
  });

  const [mobileView, setMobileView] = useState<"form" | "palco">("palco");
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<"foto" | "estilo" | "saida" | null>(null);
  const [isFotoOpen, setIsFotoOpen] = useState(true);
  const [isEstiloOpen, setIsEstiloOpen] = useState(true);
  const [isSaidaOpen, setIsSaidaOpen] = useState(true);

  const handleSelectMobileCategory = (cat: "foto" | "estilo" | "saida") => {
    setMobileActiveCategory((prev) => {
      const next = prev === cat ? null : cat;
      if (next === "foto") setIsFotoOpen(true);
      if (next === "estilo") setIsEstiloOpen(true);
      if (next === "saida") setIsSaidaOpen(true);
      if (next) {
        setTimeout(() => {
          const aside = document.querySelector('.agent-form-col') || document.querySelector('[data-aside-form-col]');
          if (aside) aside.scrollTo({ top: 0, behavior: "smooth" });
        }, 60);
      }
      return next;
    });
  };
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const allRefHistory = React.useMemo(() => {
    const map = new Map<string, any>();
    refGalleryItems.forEach((r) => map.set(r.url, r));
    (store.galeriaImages || []).forEach((url, idx) => {
      if (!map.has(url)) {
        map.set(url, {
          id: `store-ref-${idx}`,
          url,
          type: "geracao",
          timestamp: extractImageTimestamp(url) || (Date.now() - idx * 1000),
          aspect: "4 / 5",
        });
      }
    });
    return sortImagesChronological(Array.from(map.values()), true);
  }, [refGalleryItems, store.galeriaImages]);

  const saveToRefHistory = (url: string, type: "refino" | "geracao" = "geracao", customSettings?: any) => {
    try {
      useProjectStore.getState().addGaleriaImage(url, { app: "ref" });
    } catch (_) {}
    const settingsToSave = customSettings || {
      mainPhotoBase64,
      subjectImages,
      subjectPosition,
      refPhotoBase64,
      referenceImages,
      refPhotoDesc,
      dimension,
      customWidth,
      customHeight,
      quality,
      assetsPhotoBase64,
      assetImages,
      assetsPhotoDesc,
      additionalDescription
    };
    setRefGalleryItems((prev) => {
      const item = { id: `ref-${Date.now()}`, url, type, timestamp: Date.now(), isFavorited: false, settings: settingsToSave };
      const updated = sortImagesChronological([item, ...prev.filter((p) => p.url !== url)], true);
      try {
        localStorage.setItem("zion_ref_history", JSON.stringify(updated.slice(0, 60)));
      } catch {}
      return updated;
    });
  };

  // Buscar imagens geradas do servidor para alimentar a galeria do REF
  const recarregarGaleriaRef = async () => {
    try {
      const res = await fetch("/api/historico-imagens");
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.images) && data.images.length > 0) {
        setRefGalleryItems((prev) => {
          const existingUrls = new Set(prev.map((i) => i.url));
          const newServerItems = data.images
            .filter((img: any) => !existingUrls.has(img.url))
            .map((img: any, idx: number) => ({
              id: `ref-srv-${img.filename || idx}`,
              url: img.url,
              type: (img.filename?.includes("refino") ? "refino" : "geracao") as "refino" | "geracao",
              timestamp: img.mtimeMs || extractImageTimestamp(img.filename) || Date.now(),
              isFavorited: false
            }));
          const merged = [...newServerItems, ...prev];
          return sortImagesChronological(merged, true);
        });
      }
    } catch (err) {
      console.warn("Erro ao recarregar galeria REF:", err);
    }
  };

  useEffect(() => {
    recarregarGaleriaRef();
  }, []);

  const additionalDescription = currentTab.additionalDescription;
  const masterPromptResult = currentTab.masterPromptResult;
  const generatedImage = currentTab.generatedImage || store.galeriaImages?.[0] || "/1_files/ref-1.avif";

  useEffect(() => {
    if (isBrushActive) {
      updateCanvasDimensions();
    }
  }, [isBrushActive, zoomLevel, generatedImage]);

  // Atualizador de estado da aba atual
  const updateActiveTab = (updates: Partial<RefTabState>) => {
    setTabsData(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || defaultTabState),
        ...updates
      }
    }));
  };

  const setSubjectImages = (images: SubjectImageItem[]) => {
    const firstUrl = images[0]?.url || null;
    updateActiveTab({
      mainPhotos: images,
      mainPhotoBase64: firstUrl
    });
    if (firstUrl) {
      store.setSujeitoBase64(firstUrl);
      store.setSujeitoBase64List(images.map(i => i.url));
    } else {
      store.setSujeitoBase64("");
      store.setSujeitoBase64List([]);
    }
  };

  const setMainPhotoBase64 = (val: string | null) => {
    updateActiveTab({
      mainPhotoBase64: val,
      mainPhotos: val ? [{ id: "1", url: val, desc: "" }] : []
    });
    if (val) {
      setIsManagingSujeitos(true);
      store.setSujeitoBase64(val);
      store.setSujeitoBase64List([val]);
    } else {
      store.setSujeitoBase64("");
      store.setSujeitoBase64List([]);
    }
  };

  const setSubjectPosition = (val: "left" | "center" | "right") => {
    updateActiveTab({ subjectPosition: val });
    const mapped = val === "left" ? "Esquerda" : val === "right" ? "Direita" : val === "center" ? "Centro" : "";
    store.updateConfig({ positioning: mapped });
  };

  const setRefPhotoBase64 = (val: string | null) => {
    updateActiveTab({
      refPhotoBase64: val,
      refPhotos: val ? [{ id: "1", url: val, desc: "" }] : []
    });
    if (val) {
      setIsManagingReferencias(true);
      store.setDesignRefBase64(val);
      store.setDesignRefsList([val]);
    } else {
      store.setDesignRefBase64("");
      store.setDesignRefsList([]);
    }
  };

  const setRefPhotoDesc = (val: string) => {
    updateActiveTab({ refPhotoDesc: val });
  };

  const setUseRefOnBuild = (val: boolean) => {
    updateActiveTab({ useRefOnBuild: val });
  };

  const setDimension = (val: "9:16" | "4:5" | "1:1" | "16:9" | "3:4" | "4:3" | "custom") => {
    updateActiveTab({ dimension: val });
    store.updateConfig({ dimensao: val });
  };

  const setCustomWidth = (val: number) => {
    updateActiveTab({ customWidth: val });
  };

  const setCustomHeight = (val: number) => {
    updateActiveTab({ customHeight: val });
  };

  const setQuality = (val: "1K" | "2K" | "4K") => {
    updateActiveTab({ quality: val });
    store.updateConfig({ resolucao: val });
  };

  const setAssetsPhotoBase64 = (val: string | null) => {
    updateActiveTab({ assetsPhotoBase64: val });
  };

  const setAssetsPhotoDesc = (val: string) => {
    updateActiveTab({ assetsPhotoDesc: val });
  };

  const setAdditionalDescription = (val: string) => {
    updateActiveTab({ additionalDescription: val });
    store.updateConfig({ additionalPrompt: val });
  };

  const setGeneratedImage = (val: string | null) => {
    updateActiveTab({ generatedImage: val });
  };

  const setMasterPromptResult = (val: string) => {
    updateActiveTab({ masterPromptResult: val });
  };

  const setLogoPosition = (val: "auto" | "top_center" | "center" | "bottom_center" | "top_left" | "top_right" | "bottom_left" | "bottom_right") => {
    updateActiveTab({ logoPosition: val });
  };

  const setCustomHeadline = (val: string) => {
    updateActiveTab({ customHeadline: val });
  };

  const setCustomSubtitle = (val: string) => {
    updateActiveTab({ customSubtitle: val });
  };

  const setCustomBadge = (val: string) => {
    updateActiveTab({ customBadge: val });
  };

  const setCustomFooter = (val: string) => {
    updateActiveTab({ customFooter: val });
  };

  const setTextAlignment = (val: "center" | "left" | "right") => {
    updateActiveTab({ textAlignment: val });
  };

  const setShowTypographyDrawer = (val: boolean) => {
    updateActiveTab({ showTypographyDrawer: val });
  };

  // Só pode Aba 1, Aba 2 e Aba 3 (máximo de 3 abas)
  const handleAddTab = () => {
    if (tabs.length >= 3) return;
    const possibleNumbers = [1, 2, 3];
    const existingNumbers = tabs.map(t => parseInt(t.replace("Aba ", ""), 10)).filter(n => !isNaN(n));
    const nextNum = possibleNumbers.find(n => !existingNumbers.includes(n));
    if (!nextNum) return;

    const newTabName = `Aba ${nextNum}`;
    const updatedTabs = [...tabs, newTabName].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    setTabs(updatedTabs);
    setTabsData(prev => ({
      ...prev,
      [newTabName]: { ...defaultTabState }
    }));
    setActiveTab(newTabName);
  };

  const handleDuplicateTab = () => {
    if (tabs.length >= 3) {
      showToast("Limite máximo de 3 abas atingido.", "info");
      return;
    }
    const possibleNumbers = [1, 2, 3];
    const existingNumbers = tabs.map(t => parseInt(t.replace("Aba ", ""), 10)).filter(n => !isNaN(n));
    const nextNum = possibleNumbers.find(n => !existingNumbers.includes(n));
    if (!nextNum) return;

    const newTabName = `Aba ${nextNum}`;
    const updatedTabs = [...tabs, newTabName].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    setTabs(updatedTabs);
    setTabsData(prev => ({
      ...prev,
      [newTabName]: { ...(prev[activeTab] || defaultTabState) }
    }));
    setActiveTab(newTabName);
  };

  const handleDeleteTab = (tabToDelete: string) => {
    if (tabs.length <= 1) {
      handleReset();
      return;
    }
    const remainingTabs = tabs.filter(t => t !== tabToDelete);
    setTabs(remainingTabs);
    setTabsData(prev => {
      const next = { ...prev };
      delete next[tabToDelete];
      return next;
    });

    if (activeTab === tabToDelete) {
      setActiveTab(remainingTabs[0]);
    }
  };

  // Renomear abas com duplo clique
  const [renamingTab, setRenamingTab] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const handleStartRenameTab = (tab: string) => {
    setRenamingTab(tab);
    setRenameValue(tab);
  };

  const handleFinishRenameTab = () => {
    if (renamingTab && renameValue.trim() && renameValue.trim() !== renamingTab) {
      const newName = renameValue.trim();
      setTabs(prev => prev.map(t => t === renamingTab ? newName : t));
      setTabsData(prev => {
        const data = prev[renamingTab] || defaultTabState;
        const copy = { ...prev };
        delete copy[renamingTab];
        copy[newName] = data;
        return copy;
      });
      if (activeTab === renamingTab) {
        setActiveTab(newName);
      }
    }
    setRenamingTab(null);
  };

  // Toast notification
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Estados gerais
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isExpandedTextarea, setIsExpandedTextarea] = useState(false);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustDescTextareaHeight = useCallback(() => {
    const el = descTextareaRef.current;
    if (el) {
      el.style.height = "auto";
      const h = Math.max(85.3559, el.scrollHeight);
      el.style.height = `${h}px`;
    }
  }, []);

  useLayoutEffect(() => {
    adjustDescTextareaHeight();
  }, [additionalDescription, adjustDescTextareaHeight]);

  // Modais
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folders, setFolders] = useState<Array<{ id: string; name: string; count: number; items: string[] }>>([
    { id: "ee012546-bd64-4115-b328-b7ae4f0fa80e", name: "fde", count: 0, items: [] }
  ]);
  const [selectedFolderForUpload, setSelectedFolderForUpload] = useState<string | null>("ee012546-bd64-4115-b328-b7ae4f0fa80e");
  const folderUploadInputRef = useRef<HTMLInputElement>(null);

  const [isGuiaOpen, setIsGuiaOpen] = useState(false);
  const [showSubjectInfo, setShowSubjectInfo] = useState(false);
  const [showRefInfo, setShowRefInfo] = useState(false);
  const [showPosInfo, setShowPosInfo] = useState(false);
  const [showDimInfo, setShowDimInfo] = useState(false);
  const [showQualInfo, setShowQualInfo] = useState(false);
  const [showAssetsInfo, setShowAssetsInfo] = useState(false);
  const [showDescInfo, setShowDescInfo] = useState(false);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [draggedSubjectIdx, setDraggedSubjectIdx] = useState<number | null>(null);
  const managerSubjectInputRef = useRef<HTMLInputElement>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const mobileMainInputRef = useRef<HTMLInputElement>(null);
  const mobileRefInputRef = useRef<HTMLInputElement>(null);
  const mobileAssetsInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const assetsInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubjectFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    setIsManagingSujeitos(true);
    updateActiveTab({ isManagingSujeitos: true });

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setTabsData(prev => {
          const tab = prev[activeTab] || defaultTabState;
          const currentList = (tab.mainPhotos && tab.mainPhotos.length > 0)
            ? tab.mainPhotos
            : (tab.mainPhotoBase64 ? [{ id: "1", url: tab.mainPhotoBase64, desc: "" }] : []);

          const newItem: SubjectImageItem = {
            id: Math.random().toString(36).substring(2, 9),
            url,
            desc: ""
          };
          const updatedList = [...currentList, newItem];
          const firstUrl = updatedList[0]?.url || null;

          store.setSujeitoBase64(firstUrl || "");
          store.setSujeitoBase64List(updatedList.map(i => i.url));

          return {
            ...prev,
            [activeTab]: {
              ...tab,
              mainPhotos: updatedList,
              mainPhotoBase64: firstUrl,
              isManagingSujeitos: true
            }
          };
        });
        setIsManagingSujeitos(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSubjectImage = (indexToRemove: number) => {
    const currentList = subjectImages.filter((_, idx) => idx !== indexToRemove);
    setSubjectImages(currentList);
    if (currentList.length === 0) {
      setIsManagingSujeitos(false);
      updateActiveTab({ isManagingSujeitos: false });
    }
  };

  const handleSubjectDescChange = (index: number, desc: string) => {
    const updatedList = subjectImages.map((item, idx) => idx === index ? { ...item, desc } : item);
    updateActiveTab({ mainPhotos: updatedList });
  };

  const handleDropSubjectReorder = (dropIdx: number) => {
    if (draggedSubjectIdx === null || draggedSubjectIdx === dropIdx) return;
    const list = [...subjectImages];
    const [removed] = list.splice(draggedSubjectIdx, 1);
    list.splice(dropIdx, 0, removed);
    setSubjectImages(list);
    setDraggedSubjectIdx(null);
  };

  const handleMoveSubjectImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= subjectImages.length) return;
    const updated = [...subjectImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setSubjectImages(updated);
  };

  const setReferenceImages = (images: SubjectImageItem[]) => {
    const firstUrl = images[0]?.url || null;
    const firstDesc = images[0]?.desc || "";
    updateActiveTab({
      refPhotos: images,
      refPhotoBase64: firstUrl,
      refPhotoDesc: firstDesc
    });
    if (firstUrl) {
      store.setDesignRefBase64(firstUrl);
      store.setDesignRefsList(images.map(i => i.url));
    } else {
      store.setDesignRefBase64("");
      store.setDesignRefsList([]);
    }
  };

  const handleRefFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setTabsData(prev => {
          const tab = prev[activeTab] || defaultTabState;
          const currentList = (tab.refPhotos && tab.refPhotos.length > 0)
            ? tab.refPhotos
            : (tab.refPhotoBase64 ? [{ id: "1", url: tab.refPhotoBase64, desc: tab.refPhotoDesc || "" }] : []);

          const newItem: SubjectImageItem = {
            id: Math.random().toString(36).substring(2, 9),
            url,
            desc: ""
          };
          const updatedList = [...currentList, newItem];
          const firstUrl = updatedList[0]?.url || null;
          const firstDesc = updatedList[0]?.desc || "";

          store.setDesignRefBase64(firstUrl || "");
          store.setDesignRefsList(updatedList.map(i => i.url));

          return {
            ...prev,
            [activeTab]: {
              ...tab,
              refPhotos: updatedList,
              refPhotoBase64: firstUrl,
              refPhotoDesc: firstDesc,
              isManagingReferencias: true
            }
          };
        });
        setIsManagingReferencias(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveRefImage = (indexToRemove: number) => {
    const currentList = referenceImages.filter((_, idx) => idx !== indexToRemove);
    setReferenceImages(currentList);
    if (currentList.length === 0) {
      setIsManagingReferencias(false);
      updateActiveTab({ isManagingReferencias: false });
    }
  };

  const handleMoveRefImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= referenceImages.length) return;
    const updated = [...referenceImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setReferenceImages(updated);
  };

  const handleRefDescChange = (index: number, desc: string) => {
    const updatedList = referenceImages.map((item, idx) => idx === index ? { ...item, desc } : item);
    updateActiveTab({ refPhotos: updatedList });
  };

  const handleDropRefReorder = (dropIdx: number) => {
    if (draggedRefIdx === null || draggedRefIdx === dropIdx) return;
    const list = [...referenceImages];
    const [removed] = list.splice(draggedRefIdx, 1);
    list.splice(dropIdx, 0, removed);
    setReferenceImages(list);
    setDraggedRefIdx(null);
  };

  const setAssetImages = (images: SubjectImageItem[]) => {
    const firstUrl = images[0]?.url || null;
    const firstDesc = images[0]?.desc || "";
    updateActiveTab({
      assetsPhotos: images,
      assetsPhotoBase64: firstUrl,
      assetsPhotoDesc: firstDesc
    });
    if (firstUrl) {
      store.setLogosList(images.map(i => i.url));
    } else {
      store.setLogosList([]);
    }
  };

  const handleAssetFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setTabsData(prev => {
          const tab = prev[activeTab] || defaultTabState;
          const currentList = (tab.assetsPhotos && tab.assetsPhotos.length > 0)
            ? tab.assetsPhotos
            : (tab.assetsPhotoBase64 ? [{ id: "1", url: tab.assetsPhotoBase64, desc: tab.assetsPhotoDesc || "" }] : []);

          const newItem: SubjectImageItem = {
            id: Math.random().toString(36).substring(2, 9),
            url,
            desc: ""
          };
          const updatedList = [...currentList, newItem];
          const firstUrl = updatedList[0]?.url || null;
          const firstDesc = updatedList[0]?.desc || "";

          store.setLogosList(updatedList.map(i => i.url));

          return {
            ...prev,
            [activeTab]: {
              ...tab,
              assetsPhotos: updatedList,
              assetsPhotoBase64: firstUrl,
              assetsPhotoDesc: firstDesc,
              isManagingAssets: true
            }
          };
        });
        setIsManagingAssets(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAssetImage = (indexToRemove: number) => {
    const currentList = assetImages.filter((_, idx) => idx !== indexToRemove);
    setAssetImages(currentList);
    if (currentList.length === 0) {
      setIsManagingAssets(false);
      updateActiveTab({ isManagingAssets: false });
    }
  };

  const handleAssetDescChange = (index: number, desc: string) => {
    const updatedList = assetImages.map((item, idx) => idx === index ? { ...item, desc } : item);
    updateActiveTab({ assetsPhotos: updatedList });
  };

  const handleDropAssetReorder = (dropIdx: number) => {
    if (draggedAssetIdx === null || draggedAssetIdx === dropIdx) return;
    const list = [...assetImages];
    const [removed] = list.splice(draggedAssetIdx, 1);
    list.splice(dropIdx, 0, removed);
    setAssetImages(list);
    setDraggedAssetIdx(null);
  };

  const handleMoveAssetImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= assetImages.length) return;
    const updated = [...assetImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setAssetImages(updated);
  };

  // Modal de Recorte de Imagem (100% fiel ao HTML oficial)
  const [cropModalState, setCropModalState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    targetType: "sujeito" | "referencia" | "asset" | "canvas";
    targetIndex: number;
  }>({
    isOpen: false,
    imageUrl: "",
    targetType: "sujeito",
    targetIndex: 0
  });

  const openCropper = (imageUrl: string, targetType: "sujeito" | "referencia" | "asset" | "canvas", targetIndex: number) => {
    setCropModalState({
      isOpen: true,
      imageUrl,
      targetType,
      targetIndex
    });
  };

  const handleConfirmCrop = (croppedDataUrl: string) => {
    if (cropModalState.targetType === "sujeito") {
      const updatedList = subjectImages.map((item, idx) =>
        idx === cropModalState.targetIndex ? { ...item, url: croppedDataUrl } : item
      );
      setSubjectImages(updatedList);
    } else if (cropModalState.targetType === "referencia") {
      const updatedList = referenceImages.map((item, idx) =>
        idx === cropModalState.targetIndex ? { ...item, url: croppedDataUrl } : item
      );
      setReferenceImages(updatedList);
    } else if (cropModalState.targetType === "asset") {
      const updatedList = assetImages.map((item, idx) =>
        idx === cropModalState.targetIndex ? { ...item, url: croppedDataUrl } : item
      );
      setAssetImages(updatedList);
    } else if (cropModalState.targetType === "canvas") {
      setGeneratedImage(croppedDataUrl);
      setMainPhotoBase64(croppedDataUrl);
      showToast("Formato da imagem atualizado!", "success");
    }
    setCropModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSelectAssetFromWorkspace = (assetUrl: string, assetName?: string) => {
    const newItem: SubjectImageItem = {
      id: Math.random().toString(36).substring(2, 9),
      url: assetUrl,
      desc: ""
    };

    if (isManagingSujeitos) {
      setSubjectImages([...subjectImages, newItem]);
    } else if (isManagingReferencias) {
      setReferenceImages([...referenceImages, newItem]);
    } else if (isManagingAssets) {
      setAssetImages([...assetImages, newItem]);
    } else {
      setSubjectImages([...subjectImages, newItem]);
    }
  };

  const handleReset = () => {
    setIsManagingSujeitos(false);
    setIsManagingReferencias(false);
    setIsManagingAssets(false);
    updateActiveTab({
      mainPhotoBase64: null,
      mainPhotos: [],
      isManagingSujeitos: false,
      subjectPosition: "center",
      refPhotoBase64: null,
      refPhotoDesc: "",
      refPhotos: [],
      isManagingReferencias: false,
      useRefOnBuild: true,
      dimension: "1:1",
      quality: "4K",
      assetsPhotoBase64: null,
      assetsPhotoDesc: "",
      assetsPhotos: [],
      isManagingAssets: false,
      additionalDescription: "",
      generatedImage: null,
      masterPromptResult: ""
    });
  };

  // ── AUTO-PREENCHIMENTO AUTOMÁTICO DO DIRETOR CRIATIVO ──
  useEffect(() => {
    const handleAutoFill = (e: any) => {
      const data = e.detail;
      if (!data) return;

      const updates: Partial<RefTabState> = {};
      if (data.mainPhoto) {
        updates.mainPhotoBase64 = data.mainPhoto;
        updates.mainPhotos = [{ id: "1", url: data.mainPhoto, desc: data.mainPhotoDesc || "" }];
        setIsManagingSujeitos(true);
      }
      if (data.refPhoto) updates.refPhotoBase64 = data.refPhoto;
      if (data.assetsPhoto) updates.assetsPhotoBase64 = data.assetsPhoto;
      if (data.additionalDescription) updates.additionalDescription = cleanPromptText(data.additionalDescription);
      if (data.dimension) updates.dimension = normalizeDimension(data.dimension);
      if (data.quality) updates.quality = normalizeQuality(data.quality);
      if (data.subjectPosition) updates.subjectPosition = data.subjectPosition;

      updateActiveTab(updates);
    };

    window.addEventListener("zion:autofill", handleAutoFill);
    return () => window.removeEventListener("zion:autofill", handleAutoFill);
  }, [activeTab]);

  // Sincronização inicial com o useProjectStore
  useEffect(() => {
    const storeSubject = store.sujeitoBase64 || store.sujeitosBase64List?.[0] || null;
    const storeDesign = store.designRefBase64 || store.designRefsList?.[0] || null;
    const storePrompt = store.additionalPrompt ? cleanPromptText(store.additionalPrompt) : "";

    updateActiveTab({
      ...(!mainPhotoBase64 && storeSubject ? { mainPhotoBase64: storeSubject } : {}),
      ...(!refPhotoBase64 && storeDesign ? { refPhotoBase64: storeDesign } : {}),
      ...(!additionalDescription && storePrompt ? { additionalDescription: storePrompt } : {})
    });
  }, [store.sujeitoBase64, store.sujeitosBase64List, store.designRefBase64, store.designRefsList, store.additionalPrompt]);

  // ── GERAÇÃO DE PROMPT MESTRE ──
  const handleGeneratePrompt = async () => {
    setIsProcessing(true);
    try {
      const positionNames = {
        left: "posicionado estritamente à ESQUERDA da composição (ocupando os 45% esquerdos), deixando o lado direito livre para respiro visual e tipografia",
        center: "centralizado com simetria e equilíbrio de respiro",
        right: "posicionado estritamente à DIREITA da composição (ocupando os 45% direitos), deixando o lado esquerdo livre para respiro visual e tipografia"
      };

      const attachedFiles: any[] = [];
      if (mainPhotoBase64) {
        attachedFiles.push({
          name: "imagem_principal.jpg",
          data: mainPhotoBase64,
          mimeType: "image/jpeg"
        });
      }
      if (referenceImages.length > 0) {
        referenceImages.forEach((item, idx) => {
          attachedFiles.push({
            name: `referencia_${idx + 1}.jpg`,
            data: item.url,
            mimeType: "image/jpeg"
          });
        });
      } else if (refPhotoBase64) {
        attachedFiles.push({
          name: "referencia_estilo.jpg",
          data: refPhotoBase64,
          mimeType: "image/jpeg"
        });
      }
      if (assetImages.length > 0) {
        assetImages.forEach((item, idx) => {
          attachedFiles.push({
            name: `asset_${idx + 1}.jpg`,
            data: item.url,
            mimeType: "image/jpeg"
          });
        });
      } else if (assetsPhotoBase64) {
        attachedFiles.push({
          name: "assets.jpg",
          data: assetsPhotoBase64,
          mimeType: "image/jpeg"
        });
      }

      const refPromptNotes = referenceImages.length > 0
        ? referenceImages.filter(i => i.desc?.trim()).map((i, idx) => `Instrução da Ref ${idx + 1}: "${i.desc.trim()}".`).join("\n")
        : (refPhotoDesc ? `Instrução da Ref: "${refPhotoDesc}".` : "");

      const assetPromptNotes = assetImages.length > 0
        ? assetImages.filter(i => i.desc?.trim()).map((i, idx) => `Instrução do Asset ${idx + 1}: "${i.desc.trim()}".`).join("\n")
        : (assetsPhotoDesc ? `Instrução do Asset: "${assetsPhotoDesc}".` : "");

      const promptRequest = `Aja como o Motor Especialista de Engenharia Reversa Visual e Síntese de Prompt do REF Builder.
Execute a engenharia reversa visual profunda da referência e da composição:
1) SEPARAÇÃO CRÍTICA DE PAPÉIS:
   - A imagem "imagem_principal.jpg" (Sujeito) serve UNICA E EXCLUSIVAMENTE para a IDENTIDADE BIOMÉTRICA (rosto, formato dos olhos, nariz, lábios, idade, etnia e cabelo). NUNCA herde o fundo, iluminação fraca ou roupas casuais dela.
   - A imagem "referencia_estilo.jpg" (Referência) é a LEI ABSOLUTA para: ILUMINAÇÃO DE ESTÚDIO, CENÁRIO, CORES, VESTUÁRIO DE LUXO/EDITORIAL, POSTURA E LENTE FOTOGRÁFICA.
   - O objetivo do Prompt Mestre é colocar o sujeito da imagem principal EXATAMENTE com o mesmo visual, pose, iluminação e qualidade da referência!
${refPromptNotes}
${assetPromptNotes}
2) Posição do sujeito: ${positionNames[subjectPosition]}. Proporção: ${dimension}. Resolução: ${quality}.
${additionalDescription ? `3) Instruções adicionais: "${additionalDescription}".` : ""}

Sintetize o Prompt Mestre Fotográfico Oficial no padrão técnico modular de hiper-precisão:
- [Resumo da Cena] (Visão geral em 1 a 2 frases)
- [Camera Angle/Pitch] (Enquadramento, altura em metros, pitch 0°, lente 85mm full-frame)
- [Body-to-Head Torque] (Alinhamento do tronco, 0° rotação cervical, tensão muscular isométrica, postura dos ombros)
- [Gaze Vector] (Vetor ocular, pupilas centradas e alinhadas ao eixo óptico da lente)
- [Hand/Object Tactile Interaction] (Física de contato, pressão nos dedos, deformação dérmica, hierarquia de oclusão)
- [Subject (Identity & Pose)] (Expressão de foco/concentração, presença visual e pose)
- [New Clothing Design / Product Materials] (Vestuário ou materiais com texturas táteis, caimento e absorção de luz BxDF)
- [Background & Layout] (Zoneamento e contraste de fundo, desfoque gaussiano f/2.0, objetos cenográficos e elementos 3D/texto emissivo com halo)
- [Physics of Light] (Octabox grande 120cm, rim lights quentes/frias com gelatinas CTO/CTB, black clipping e sombras profundas)
- [Bio-Dermal Texture] (SSS de 3 camadas para translucidez na pele, micro-displacement de poros e sombreamento anisotrópico nos fios de cabelo)
- [Sony A1 Setup] (Tabela técnica com Lente Sony FE 85mm f/1.4 GM, f/2.0, 1/160s, ISO 400, Kelvin, Spot Metering, S-Log3 e configuração completa de luzes Octabox/Strobe/LEDs)
- [Negative Instructions] (Instruções negativas estritas contra estética plástica de IA)

DIRETRIZES RÍGIDAS DE SAÍDA:
- NÃO inclua conversas, cumprimentos ou saudações.
- NÃO inclua raciocínio interno, monólogo ("Ele pediu...", "Vou compor...") ou pensamentos.
- NÃO inclua blocos JSON.
- Entregue DIRETAMENTE o texto técnico estruturado com as tags acima.`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app: "ref",
          isRefBuilder: true,
          agent_slug: "ref-builder",
          assistantId: "ref-prompt",
          message: promptRequest,
          modelId: store.selectedAiModel,
          attachedFiles
        })
      });

      const data = await res.json();
      const aiResponse = data.response || "";

      // Extrai o prompt mestre limpo (sem chatter nem JSON de automação)
      const cleanPrompt = cleanPromptText(aiResponse);

      // Só preenche a Descrição Adicional se estiver vazia, preservando o que o usuário digitou
      if (!additionalDescription && cleanPrompt) {
        setAdditionalDescription(cleanPrompt);
      }
      setMasterPromptResult(cleanPrompt || aiResponse);
      setIsPromptModalOpen(true);
    } catch (err: any) {
      console.error("Erro ao gerar prompt com a IA:", err);
      showToast("Erro ao conectar com a IA para gerar o prompt.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPrompt = async () => {
    const promptText = masterPromptResult || additionalDescription;
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = promptText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2500);
    }
  };

  // ── CONSTRUIR (AÇÃO PRINCIPAL DEPENDENTE DO TOGGLE) ──
  // ── REUTILIZAR CONFIGURAÇÕES (CLONE DESIGNBUILDER) ──
  const handleReuseSettings = (specificSettings?: any) => {
    const settings = specificSettings || lastUsedSettings;
    if (!settings) {
      showToast("Nenhuma configuração anterior encontrada para reutilizar.", "info");
      return;
    }
    const subImgs = settings.subjectImages || (settings.mainPhotoBase64 ? [{ id: "1", url: settings.mainPhotoBase64, desc: "" }] : []);
    const refImgs = settings.referenceImages || (settings.refPhotoBase64 ? [{ id: "1", url: settings.refPhotoBase64, desc: settings.refPhotoDesc || "" }] : []);
    const assetImgs = settings.assetImages || (settings.assetsPhotoBase64 ? [{ id: "1", url: settings.assetsPhotoBase64, desc: settings.assetsPhotoDesc || "" }] : []);

    updateActiveTab({
      mainPhotoBase64: settings.mainPhotoBase64 || subImgs[0]?.url || null,
      mainPhotos: subImgs,
      subjectPosition: settings.subjectPosition || "center",
      refPhotoBase64: settings.refPhotoBase64 || refImgs[0]?.url || null,
      refPhotos: refImgs,
      refPhotoDesc: settings.refPhotoDesc || "",
      dimension: settings.dimension || "4:5",
      customWidth: settings.customWidth || 1200,
      customHeight: settings.customHeight || 630,
      quality: settings.quality || "4K",
      assetsPhotoBase64: settings.assetsPhotoBase64 || assetImgs[0]?.url || null,
      assetsPhotos: assetImgs,
      assetsPhotoDesc: settings.assetsPhotoDesc || "",
      additionalDescription: settings.additionalDescription || ""
    });
    setActiveViewMode("builder");
    showToast("Configurações e imagens anteriores restauradas no formulário!", "success");
  };

  // ── EXPORTAÇÃO REAL MULTIFORMATO (AVIF, PNG, JPEG, WEBP) ──
  const handleDownloadFormat = async (format: "avif" | "png" | "jpeg" | "webp") => {
    if (!generatedImage) return;
    try {
      showToast(`Exportando em ${format.toUpperCase()} (${quality || "4K"})...`, "info");
      await downloadImage(generatedImage, format, undefined, undefined, undefined, quality || "4K", { title: "arte_ref", aspectRatio: dimension, targetResolution: quality || "4K" });
      return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const mimeMap: Record<string, string> = {
          avif: "image/avif",
          png: "image/png",
          jpeg: "image/jpeg",
          webp: "image/webp"
        };
        const mime = mimeMap[format] || "image/png";
        const ext = format === "jpeg" ? "jpg" : format;

        try {
          canvas.toBlob((blob) => {
            if (!blob) {
              const a = document.createElement("a");
              a.href = generatedImage;
              a.download = `arte-ref-${Date.now()}.${ext}`;
              a.click();
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `arte-ref-${Date.now()}.${ext}`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          }, mime, 0.95);
        } catch {
          const a = document.createElement("a");
          a.href = generatedImage;
          a.download = `arte-ref-${Date.now()}.${ext}`;
          a.click();
        }
      };
      img.src = generatedImage;
    } catch (e) {
      console.error("Erro ao converter imagem:", e);
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = `arte-ref-${Date.now()}.${format === "jpeg" ? "jpg" : format}`;
      a.click();
    }
  };

  // ── ALTERAÇÃO MÁGICA / REFINO FLUTUANTE (CLONE DESIGNBUILDER) ──
  const handleMagicRefine = async () => {
    const currentImg = generatedImage || mainPhotoBase64 || (subjectImages[0]?.url);
    if (!currentImg) {
      showToast("Gere ou envie uma imagem antes de aplicar o refinamento.", "info");
      return;
    }
    const textToUse = magicRefineText.trim() || (isBrushActive ? "Altere a área pintada na imagem de forma coerente e realista" : "");
    if (!textToUse) return;

    setIsRefining(true);
    try {
      let maskDataUrl: string | undefined = undefined;
      if (drawingCanvasRef.current && isBrushActive && strokeHistory.length > 0) {
        try {
          maskDataUrl = drawingCanvasRef.current.toDataURL("image/png");
        } catch {}
      }

      // Converte anexos/seleções em base64 se houver
      const attachmentBase64s: string[] = [];
      for (const att of attachments) {
        try {
          const reader = new FileReader();
          const p = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
          });
          reader.readAsDataURL(att.file);
          const b64 = await p;
          attachmentBase64s.push(b64);
        } catch {}
      }

      const isGraphicCardOrFlyer =
        /(card|flyer|banner|post|cartaz|propaganda|anúncio|anuncio|ótica|otica|exame|consulta|promoção|promocao|desconto|preço|preco|título|titulo|cabeçalho|cabecalho|texto|legenda|layout|arte|design|sindicato|procedimentos|fundoscopia|acuidade|óculos|oculos)/i.test(additionalDescription || "") ||
        /(card|flyer|banner|post|cartaz|propaganda|anúncio|anuncio|ótica|otica|exame|consulta|promoção|promocao|desconto|preço|preco|título|titulo|cabeçalho|cabecalho|texto|legenda|layout|arte|design|sindicato|procedimentos|fundoscopia|acuidade|óculos|oculos)/i.test(refPhotoDesc || "");

      const apiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
        body: JSON.stringify({
          app: "ref",
          isRefBuilder: true,
          agent_slug: "ref-builder",
          previousImageBase64: currentImg,
          maskBase64: maskDataUrl,
          referenceImagesBase64: attachmentBase64s,
          promptTraduzido: `${textToUse.includes("EXPLICIT INSTRUCTION") ? textToUse : `EXPLICIT INSTRUCTION FOR THIS REFINEMENT: ${textToUse}`}\n\n[SAFE MARGINS AND HEADROOM MANDATE]: Top logo and headers MUST sit at least 16% to 20% down from the top canvas border (never glued to top edge). Footer contact info (phone and @ handle) MUST end at least 16% to 20% above the bottom canvas border (never glued to bottom border). Maintain generous breathing room across all canvas boundaries.`,
          resolutionInput: quality,
          dimensao: dimension,
          formato: "PNG",
          customApiKey: apiKey,
          modelId: store.selectedAiModel
        })
      });
      const data = await res.json();
      const finalImg = data.image || data.imageUrl;
      if (finalImg) {
        setGeneratedImage(finalImg);
        saveToRefHistory(finalImg, "refino");
        deductCredit(1);
        store.setGaleriaImages(prev => [finalImg, ...prev]);
        store.addGaleriaImage(finalImg, { app: "ref" });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: finalImg, app: "ref" } }));
        }
        if (store.activeProjectId) {
          store.addImagesToProjectGallery(store.activeProjectId, [finalImg]);
        }
        setMagicRefineText("");
        setIsBrushActive(false);
        setStrokeHistory([]);
        setAttachments((prev) => {
          prev.forEach((a) => URL.revokeObjectURL(a.preview));
          return [];
        });
        if (drawingCanvasRef.current) {
          const ctx = drawingCanvasRef.current.getContext("2d");
          ctx?.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
        }
        showToast("Refinamento aplicado com sucesso!", "success");
      } else {
        showToast(data.error || "Erro ao aplicar alteração mágica.", "error");
      }
    } catch (err: any) {
      console.error("Erro no refino mágico:", err);
      showToast("Erro ao conectar com o servidor para o refino.", "error");
    } finally {
      setIsRefining(false);
    }
  };

  // ── REFORMATAR (ADAPTAR PROPORÇÃO / OUTPAINTING DA ARTE) ──
  const handleReformat = async (
    targetDim: "16:9" | "9:16" | "1:1" | "4:5" | "3:4" | "4:3" | "custom",
    customW?: number,
    customH?: number
  ) => {
    const currentImg = generatedImage;
    if (!currentImg) {
      showToast("Nenhuma arte gerada ainda para reformatar.", "info");
      return;
    }

    if (isReformatting) return;

    const effW = targetDim === "custom" ? (customW || customWidth) : undefined;
    const effH = targetDim === "custom" ? (customH || customHeight) : undefined;
    const dimLabel = targetDim === "custom" ? `${effW}×${effH}px` : targetDim;

    setActiveReformatDim(targetDim);
    setIsReformatting(true);
    showToast(`Adaptando formato para ${dimLabel}...`, "info");

    try {
      const apiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const promptReformat = `Reformat and adapt this previously generated artwork to the exact ${dimLabel} aspect ratio. Extend and outpaint the scene naturally to fill the new canvas dimensions while maintaining 100% fidelity to the main subject, typography, visual hierarchy, lighting, colors, styling, and background of the original artwork. Do not stretch, warp, or distort the original content.`;

      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
        body: JSON.stringify({
          app: "ref",
          isRefBuilder: true,
          agent_slug: "ref-builder",
          previousImageBase64: currentImg,
          dimensao: targetDim,
          customWidth: effW,
          customHeight: effH,
          resolutionInput: quality,
          formato: "PNG",
          promptTraduzido: promptReformat,
          customApiKey: apiKey,
          modelId: store.selectedAiModel
        })
      });

      const data = await res.json();
      const finalImg = data.image || data.imageUrl;
      if (finalImg) {
        setGeneratedImage(finalImg);
        saveToRefHistory(finalImg, "refino");
        updateActiveTab({
          dimension: targetDim,
          customWidth: effW || customWidth,
          customHeight: effH || customHeight,
          generatedImage: finalImg
        });
        deductCredit(1);
        store.setGaleriaImages((prev) => [finalImg, ...prev]);
        store.addGaleriaImage(finalImg, { app: "ref" });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: finalImg, app: "ref" } }));
        }
        if (store.activeProjectId) {
          store.addImagesToProjectGallery(store.activeProjectId, [finalImg]);
        }
        showToast(`Formato adaptado para ${dimLabel} com sucesso!`, "success");
        setActivePopover(null);
      } else {
        showToast(data.error || "Erro ao adaptar formato da arte.", "error");
      }
    } catch (err: any) {
      console.error("Erro ao reformatar arte:", err);
      showToast("Erro ao conectar com o servidor para adaptar o formato.", "error");
    } finally {
      setIsReformatting(false);
      setActiveReformatDim(null);
    }
  };

  // ── CONSTRUIR (AÇÃO PRINCIPAL DEPENDENTE DO TOGGLE) ──
  const handleBuild = async () => {
    // Se o saldo de créditos for zero (credits === 0), abre o NoCreditsModal
    const creditState = getCreditState();
    if (creditState.remaining <= 0) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("zion:no_credits"));
      }
      return;
    }

    // Se o modo "Gerar Prompt" estiver ativado, gera o prompt mestre (0 créditos)
    if (generatePromptOnly) {
      await handleGeneratePrompt();
      return;
    }

    const hasSubject = !!(mainPhotoBase64 || subjectImages.length > 0);
    const hasRef = !!(refPhotoBase64 || referenceImages.length > 0);
    const hasAssets = !!(assetsPhotoBase64 || assetImages.length > 0);
    const hasDesc = !!(additionalDescription && additionalDescription.trim());

    // Se o modo "Gerar Prompt" estiver desativado, constrói a imagem no próprio site (1 crédito)
    if (!hasSubject && !hasRef && !hasAssets && !hasDesc) {
      showToast("Por favor, envie sua imagem principal, uma referência de estilo ou digite uma descrição.", "info");
      return;
    }

    // Garante que o palco mude para o Builder imediatamente e feche workspaces de assets
    setActiveViewMode("builder");
    setMobileView("palco");
    setIsManagingSujeitos(false);
    setIsManagingReferencias(false);
    setIsManagingAssets(false);
    setIsProcessing(true);
    store.setIsGenerating(true);

    const snapshot = {
      mainPhotoBase64,
      subjectImages,
      subjectPosition,
      logoPosition,
      customHeadline,
      customSubtitle,
      customBadge,
      customFooter,
      textAlignment,
      refPhotoBase64,
      referenceImages,
      refPhotoDesc,
      dimension,
      customWidth,
      customHeight,
      quality,
      assetsPhotoBase64,
      assetImages,
      assetsPhotoDesc,
      additionalDescription
    };

    try {
      setLastUsedSettings(snapshot);

      const isGraphicCardOrFlyer =
        /(card|flyer|banner|post|cartaz|propaganda|anúncio|anuncio|ótica|otica|exame|consulta|promoção|promocao|desconto|preço|preco|título|titulo|cabeçalho|cabecalho|texto|legenda|layout|arte|design|sindicato|procedimentos|fundoscopia|acuidade|óculos|oculos)/i.test(additionalDescription || "") ||
        /(card|flyer|banner|post|cartaz|propaganda|anúncio|anuncio|ótica|otica|exame|consulta|promoção|promocao|desconto|preço|preco|título|titulo|cabeçalho|cabecalho|texto|legenda|layout|arte|design|sindicato|procedimentos|fundoscopia|acuidade|óculos|oculos)/i.test(refPhotoDesc || "") ||
        referenceImages.some(img => /(card|flyer|banner|post|cartaz|propaganda|anúncio|anuncio|ótica|otica|exame|consulta|promoção|promocao|desconto|preço|preco|título|titulo|cabeçalho|cabecalho|texto|legenda|layout|arte|design|sindicato|procedimentos|fundoscopia|acuidade|óculos|oculos)/i.test(img.desc || "")) ||
        Boolean(refPhotoBase64 || referenceImages.length > 0);

      // Pre-optimize reference images to 1536px JPEG to eliminate 60MB+ network bottlenecks
      const effSubject = /n[aã]o\s*quero\s*pessoa|sem\s*pessoa|no\s*people/i.test(additionalDescription || "")
        ? ""
        : (mainPhotoBase64 || subjectImages[0]?.url || "");
      const optSubject = effSubject ? await optimizeBase64Image(effSubject, 1536, 0.88) : "";

      const optSubjectList: string[] = [];
      if (!/n[aã]o\s*quero\s*pessoa|sem\s*pessoa|no\s*people/i.test(additionalDescription || "")) {
        for (const img of subjectImages) {
          if (img.url) optSubjectList.push(await optimizeBase64Image(img.url, 1536, 0.88));
        }
      }

      const optRefList: string[] = [];
      for (const img of referenceImages) {
        if (img.url) optRefList.push(await optimizeBase64Image(img.url, 1536, 0.88));
      }
      const optPrimaryRef = refPhotoBase64
        ? await optimizeBase64Image(refPhotoBase64, 1536, 0.88)
        : (optRefList[0] || "");

      const referenceImagesMeta = referenceImages.map((img, idx) => ({
        index: idx + 1,
        desc: img.desc?.trim() || "",
        url: optRefList[idx] || img.url
      }));

      const subjectImagesMeta = subjectImages.map((img, idx) => ({
        index: idx + 1,
        desc: img.desc?.trim() || "",
        url: optSubjectList[idx] || img.url
      }));

      const assetImagesMeta = assetImages.map((img, idx) => ({
        index: idx + 1,
        desc: img.desc?.trim() || (idx === 0 ? assetsPhotoDesc?.trim() : "") || "",
        url: img.url
      }));

      const apiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
        body: JSON.stringify({
          app: "ref",
          isRefBuilder: true,
          agent_slug: "ref-builder",
          base64DoSujeito: optSubject,
          sujeitosBase64List: optSubjectList.length > 0 ? optSubjectList : (optSubject ? [optSubject] : []),
          subjectImagesMeta,
          referenciasEstilo: optRefList.length > 0 ? optRefList : (optPrimaryRef ? [optPrimaryRef] : []),
          referenceImagesMeta,
          designRefBase64: optPrimaryRef || "",
          designRefsList: optRefList.length > 1 ? optRefList.slice(1) : (optPrimaryRef ? [optPrimaryRef] : []),
          logoBase64: assetImages[0]?.url || assetsPhotoBase64 || "",
          logosList: assetImages.length > 1 ? assetImages.slice(1).map(i => i.url) : [],
          assetImagesMeta,
          useLogo: !!(assetImages.length > 0 || assetsPhotoBase64),
          logoInclusionType: "embedded",
          desativarSujeito: /n[aã]o\s*quero\s*pessoa|sem\s*pessoa|no\s*people/i.test(additionalDescription || ""),
          subjectPosition: subjectPosition,
          logoPosition: logoPosition || "auto",
          textHierarchy: {
            headline: customHeadline?.trim() || "",
            subtitle: customSubtitle?.trim() || "",
            badge: customBadge?.trim() || "",
            footer: customFooter?.trim() || "",
            alignment: textAlignment || "center"
          },
          additionalPrompt: additionalDescription?.trim() || "",
          promptTraduzido: [
            additionalDescription?.trim()
              ? `[USER DIRECT MANDATE - HIGHEST OVERRIDING PRIORITY]: ${additionalDescription.trim()}`
              : "",
            customHeadline?.trim() ? `[MANDATORY HEADLINE (H1)]: "${customHeadline.trim().toUpperCase()}"` : "",
            customSubtitle?.trim() ? `[MANDATORY SUBTITLE (H2)]: "${customSubtitle.trim()}"` : "",
            customBadge?.trim() ? `[MANDATORY BADGE / TAG]: "${customBadge.trim().toUpperCase()}"` : "",
            customFooter?.trim() ? `[MANDATORY FOOTER INFO]: "${customFooter.trim()}"` : "",
            textAlignment ? `[MANDATORY TEXT ALIGNMENT]: ${textAlignment.toUpperCase()}` : "",
            logoPosition && logoPosition !== "auto" ? `[MANDATORY LOGO ALIGNMENT]: ${logoPosition.toUpperCase()}` : "",
            isGraphicCardOrFlyer
              ? "[GRAPHIC DESIGN & ADVERTISING MANDATE]: Replicate the layout composition, color palette, lighting atmosphere, and visual style directly from the Design Reference image. STRICT TEXT MANDATE: Render ONLY the text explicitly requested by the user. Do NOT copy or carry over any text, words, or phone numbers from the reference image."
              : "[PHOTO ARCHITECTURE MANDATE]: Authentic commercial editorial portrait. Pure full-bleed photographic realism with authentic 3-layer SSS dermal micro-pores.",
            subjectPosition === "left"
              ? "[COMPOSITION MANDATE]: Main subject positioned strictly on the LEFT SIDE of the frame, leaving the right side open."
              : subjectPosition === "right"
              ? "[COMPOSITION MANDATE]: Main subject positioned strictly on the RIGHT SIDE of the frame, leaving the left side open."
              : "[COMPOSITION MANDATE]: Main subject centered with symmetrical balance.",
            subjectImages.filter(i => i.desc?.trim()).map((i, idx) => `Instrução Imagem ${idx + 1}: ${i.desc.trim()}`).join("; "),
            referenceImages.length > 0
              ? referenceImages.filter(i => i.desc?.trim()).map((i, idx) => `Referência ${idx + 1}: ${i.desc.trim()}`).join("; ")
              : (refPhotoDesc?.trim() ? `Referência: ${refPhotoDesc.trim()}` : ""),
            assetImages.length > 0
              ? assetImages.filter(i => i.desc?.trim()).map((i, idx) => `Asset ${idx + 1}: ${i.desc.trim()}`).join("; ")
              : (assetsPhotoDesc?.trim() ? `Asset: ${assetsPhotoDesc.trim()}` : "")
          ].filter(Boolean).join("\n\n"),
          resolutionInput: quality,
          dimensao: dimension,
          customWidth: dimension === "custom" ? customWidth : undefined,
          customHeight: dimension === "custom" ? customHeight : undefined,
          formato: "PNG",
          useEnvRef: useRefOnBuild,
          modelId: store.selectedAiModel,
          customApiKey: apiKey
        })
      });

      const data = await res.json();
      const finalImg = data.image || data.imageUrl;
      if (finalImg) {
        setGeneratedImage(finalImg);
        saveToRefHistory(finalImg, "geracao", snapshot);
        deductCredit(1);
        store.setGaleriaImages(prev => [finalImg, ...prev]);
        store.addGaleriaImage(finalImg, { app: "ref" });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: finalImg, app: "ref" } }));
        }
        store.addGaleriaImage(finalImg, { app: "ref" });
        if (store.activeProjectId) {
          store.addImagesToProjectGallery(store.activeProjectId, [finalImg]);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: finalImg, app: "ref" } }));
        }
        showToast("Imagem sintetizada com sucesso no REF!", "success");
      } else {
        showToast(data.error || "Erro ao sintetizar imagem no REF.", "error");
      }
    } catch (err: any) {
      console.error("Erro no REF Builder:", err);
      showToast("Erro ao processar imagem no REF.", "error");
    } finally {
      setIsProcessing(false);
      store.setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main
        data-builder-workspace-shell=""
        className={`relative flex h-full min-h-0 overflow-hidden bg-black lg:flex-row max-lg:grid max-lg:overflow-hidden max-lg:transition-[grid-template-rows] max-lg:duration-300 max-lg:ease-in-out flex-1 ${
          mobileActiveCategory ? "max-lg:grid-rows-[auto_1fr]" : "max-lg:grid-rows-[1fr_0fr]"
        }`}
      >
        {/* ── COLUNA DO FORMULÁRIO REF (LAYOUT 100% ORIGINAL) ── */}
        <aside
          data-aside-form-col=""
          data-tour="form"
          className="agent-form-col relative z-10 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full lg:h-full lg:w-[var(--agent-form-col-w,420px)] lg:min-w-[280px] lg:max-w-[700px] lg:flex-shrink-0 flex max-lg:order-last max-lg:min-h-0 lg:flex"
          style={{ "--agent-form-col-w": "420px", "--agent-color": "#8B5CF6" } as any}
        >
        <form onSubmit={(e) => { e.preventDefault(); handleBuild(); }} className="flex flex-col gap-6 lg:gap-12">
          {/* ── SEÇÃO 1: FOTO (100% IDÊNTICO AO HTML OFICIAL) ── */}




          {/* ══════════════════════════════════════════════════════════════════
              MODO CELULAR / MOBILE (lg:hidden) - 100% IDÊNTICO AO APP MOBILE
              ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-6 lg:hidden">
          <div data-tour="form-sec-foto" className={mobileActiveCategory !== "foto" ? "max-lg:hidden" : ""}>
            <div
              data-state={isFotoOpen ? "open" : "closed"}
              data-slot="collapsible"
              className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
            >
              <button
                type="button"
                aria-expanded={isFotoOpen}
                data-state={isFotoOpen ? "open" : "closed"}
                data-slot="collapsible-trigger"
                onClick={() => setIsFotoOpen(!isFotoOpen)}
                className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image h-[18px] w-[18px] text-zinc-400 transition-colors" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Foto</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${isFotoOpen ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>

              {isFotoOpen && (
                <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
                  <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">

                    {/* ── 1. SUJEITOS (IMAGEM PRINCIPAL) ── */}
                    <div data-field-id="sujeitos" data-tour="form-field-sujeitos" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                      <div className="flex flex-col gap-3" data-image-field-id="sujeitos">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                            <span>Envie sua imagem principal</span>
                            <span className="relative inline-flex items-center">
                              <button
                                type="button"
                                data-field-info=""
                                aria-label="Mais informações Envie sua imagem principal"
                                aria-expanded={showSubjectInfo}
                                onClick={() => setShowSubjectInfo(!showSubjectInfo)}
                                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                                style={{ color: "rgb(139, 92, 246)" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M12 16v-4"></path>
                                  <path d="M12 8h.01"></path>
                                </svg>
                              </button>
                            </span>
                          </label>
                        </div>

                        {showSubjectInfo && (
                          <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                            Envie a foto do sujeito ou modelo que será o foco da sua arte. Você pode adicionar mais fotos para enriquecer o contexto e orientar a IA sobre o que focar.
                          </div>
                        )}

                        <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                          {subjectImages.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {subjectImages.map((img, idx) => (
                                <div key={img.id || idx} className="group flex items-center gap-2">
                                  <div className="relative shrink-0">
                                    <img
                                      alt={`imagem ${idx + 1}`}
                                      onClick={() => setLightboxImage(img.url)}
                                      className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                      src={img.url}
                                    />
                                    <button
                                      type="button"
                                      aria-label={`Remover imagem ${idx + 1}`}
                                      title={`Remover imagem ${idx + 1}`}
                                      onClick={() => handleRemoveSubjectImage(idx)}
                                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Recortar imagem ${idx + 1}`}
                                      title={`Recortar imagem ${idx + 1}`}
                                      onClick={() => openCropper(img.url, "sujeito", idx)}
                                      className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-2.5 w-2.5" aria-hidden="true">
                                        <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
                                        <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <input
                                    placeholder="Descreva o que quer focar nesta foto (ex: 'rosto', 'cabelo', 'roupa')"
                                    className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors text-white"
                                    type="text"
                                    value={img.desc || ""}
                                    onChange={(e) => handleSubjectDescChange(idx, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] py-2">
                              <button
                                type="button"
                                onClick={() => mobileMainInputRef.current?.click()}
                                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                              >
                                <span className="text-base leading-none">+</span>
                                <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                              </button>
                            </div>
                          </div>

                          <input
                            ref={mobileMainInputRef}
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
                            multiple
                            className="hidden"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files) handleSubjectFiles(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── 2. REFERÊNCIAS (INSPIRAÇÕES DE ESTILO) ── */}
                    <div data-field-id="referencias" data-tour="form-field-referencias" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                      <div className="flex flex-col gap-3" data-image-field-id="referencias">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                            <span>Inspirações de Estilo</span>
                            <span className="relative inline-flex items-center">
                              <button
                                type="button"
                                data-field-info=""
                                aria-label="Mais informações Inspirações de Estilo"
                                aria-expanded={showRefInfo}
                                onClick={() => setShowRefInfo(!showRefInfo)}
                                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                                style={{ color: "rgb(139, 92, 246)" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M12 16v-4"></path>
                                  <path d="M12 8h.01"></path>
                                </svg>
                              </button>
                            </span>
                          </label>

                          <button
                            type="button"
                            aria-label={`Usar na imagem: ${useRefOnBuild ? "ativado" : "desativado"}`}
                            aria-pressed={useRefOnBuild}
                            title={useRefOnBuild ? "Imagem" : "Somente JSON"}
                            onClick={() => setUseRefOnBuild(!useRefOnBuild)}
                            className="flex shrink-0 items-center gap-1.5 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                          >
                            <span>Usar na imagem</span>
                            <span
                              className={`relative h-4 w-7 rounded-full border transition-colors ${
                                useRefOnBuild
                                  ? "border-violet-500/50 bg-violet-500/30"
                                  : "border-white/10 bg-white/[0.05]"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all ${
                                  useRefOnBuild ? "left-3.5 bg-violet-300" : "left-0.5 bg-zinc-600"
                                }`}
                              />
                            </span>
                            <span
                              className={`rounded-full border px-1.5 py-0.5 font-medium ${
                                useRefOnBuild
                                  ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                              }`}
                            >
                              {useRefOnBuild ? "Imagem" : "Somente JSON"}
                            </span>
                          </button>
                        </div>

                        {showRefInfo && (
                          <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                            Envie imagens de referência visual para guiar a iluminação, ângulo, clima e acabamento da sua composição.
                          </div>
                        )}

                        <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                          {referenceImages.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {referenceImages.map((img, idx) => (
                                <div key={img.id || idx} className="group flex items-center gap-2">
                                  <div className="relative shrink-0">
                                    <img
                                      alt={`imagem ${idx + 1}`}
                                      onClick={() => setLightboxImage(img.url)}
                                      className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                      src={img.url}
                                    />
                                    <button
                                      type="button"
                                      aria-label={`Remover imagem ${idx + 1}`}
                                      title={`Remover imagem ${idx + 1}`}
                                      onClick={() => handleRemoveRefImage(idx)}
                                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Recortar imagem ${idx + 1}`}
                                      title={`Recortar imagem ${idx + 1}`}
                                      onClick={() => openCropper(img.url, "referencia", idx)}
                                      className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-2.5 w-2.5" aria-hidden="true">
                                        <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
                                        <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <input
                                    placeholder="Descreva o estilo que quer extrair desta referência (ex: 'cores', 'iluminação', 'composição')"
                                    className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors text-white"
                                    type="text"
                                    value={img.desc || ""}
                                    onChange={(e) => handleRefDescChange(idx, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] py-2">
                              <button
                                type="button"
                                onClick={() => mobileRefInputRef.current?.click()}
                                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                              >
                                <span className="text-base leading-none">+</span>
                                <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                              </button>
                            </div>
                          </div>

                          <input
                            ref={mobileRefInputRef}
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
                            multiple
                            className="hidden"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files) handleRefFiles(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── 3. USAR INSPIRAÇÃO NA CONSTRUÇÃO DA IMAGEM (TOGGLE) ── */}
                    <div data-field-id="send_style_ref_bytes" data-tour="form-field-send_style_ref_bytes" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <label htmlFor="send_style_ref_bytes" className="text-sm font-medium text-zinc-300 leading-snug">
                            Usar inspiração na construção da imagem
                          </label>
                          <span className="relative inline-flex items-center">
                            <button
                              type="button"
                              data-field-info=""
                              aria-label="Mais informações Usar inspiração na construção da imagem"
                              aria-expanded={false}
                              className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                              style={{ color: "rgb(139, 92, 246)" }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                              </svg>
                            </button>
                          </span>
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border" style={{ color: "rgb(139, 92, 246)", borderColor: "rgba(139, 92, 246, 0.267)", backgroundColor: "rgba(139, 92, 246, 0.07)" }}>
                            Avançado
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/8 bg-zinc-900/80 p-1">
                          <button
                            type="button"
                            title="Ativar"
                            onClick={() => setUseRefOnBuild(true)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            style={
                              useRefOnBuild
                                ? { color: "rgb(139, 92, 246)", backgroundColor: "rgba(139, 92, 246, 0.133)", boxShadow: "rgba(139, 92, 246, 0.267) 0px 0px 0px 1px" }
                                : { color: "rgb(82, 82, 91)" }
                            }
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Desativar"
                            onClick={() => setUseRefOnBuild(false)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                            style={
                              !useRefOnBuild
                                ? { backgroundColor: "rgba(239, 68, 68, 0.12)", color: "rgb(248, 113, 113)", boxShadow: "rgba(239, 68, 68, 0.25) 0px 0px 0px 1px" }
                                : { color: "rgb(82, 82, 91)" }
                            }
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5" aria-hidden="true">
                              <path d="M18 6 6 18"></path>
                              <path d="m6 6 12 12"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── 4. ASSETS (OPCIONAL) ── */}
                    <div data-field-id="assets" data-tour="form-field-assets" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                      <div className="flex flex-col gap-3" data-image-field-id="assets">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                            <span>Assets (opcional)</span>
                            <span className="relative inline-flex items-center">
                              <button
                                type="button"
                                data-field-info=""
                                aria-label="Mais informações Assets (opcional)"
                                aria-expanded={showAssetsInfo}
                                onClick={() => setShowAssetsInfo(!showAssetsInfo)}
                                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                                style={{ color: "rgb(139, 92, 246)" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M12 16v-4"></path>
                                  <path d="M12 8h.01"></path>
                                </svg>
                              </button>
                            </span>
                          </label>
                        </div>

                        {showAssetsInfo && (
                          <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                            Envie assets extras como logotipos, mockups de celular ou outros produtos para serem compostos na imagem.
                          </div>
                        )}

                        <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                          {assetImages.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {assetImages.map((img, idx) => (
                                <div key={img.id || idx} className="group flex items-center gap-2">
                                  <div className="relative shrink-0">
                                    <img
                                      alt={`imagem ${idx + 1}`}
                                      onClick={() => setLightboxImage(img.url)}
                                      className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                      src={img.url}
                                    />
                                    <button
                                      type="button"
                                      aria-label={`Remover imagem ${idx + 1}`}
                                      title={`Remover imagem ${idx + 1}`}
                                      onClick={() => handleRemoveAssetImage(idx)}
                                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Recortar imagem ${idx + 1}`}
                                      title={`Recortar imagem ${idx + 1}`}
                                      onClick={() => openCropper(img.url, "asset", idx)}
                                      className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-2.5 w-2.5" aria-hidden="true">
                                        <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
                                        <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <input
                                    placeholder="Descreva o que quer extrair deste asset (ex: 'logotipo', 'produto em destaque')"
                                    className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors text-white"
                                    type="text"
                                    value={img.desc || ""}
                                    onChange={(e) => handleAssetDescChange(idx, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] py-2">
                              <button
                                type="button"
                                onClick={() => mobileAssetsInputRef.current?.click()}
                                className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                              >
                                <span className="text-base leading-none">+</span>
                                <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                              </button>
                            </div>
                          </div>

                          <input
                            ref={mobileAssetsInputRef}
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
                            multiple
                            className="hidden"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files) handleAssetFiles(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>

          <div data-tour="form-sec-estilo" className={mobileActiveCategory !== "estilo" ? "max-lg:hidden" : ""}>
            <div
              data-state={isEstiloOpen ? "open" : "closed"}
              data-slot="collapsible"
              className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
            >
              <button
                type="button"
                aria-expanded={isEstiloOpen}
                data-state={isEstiloOpen ? "open" : "closed"}
                data-slot="collapsible-trigger"
                onClick={() => setIsEstiloOpen(!isEstiloOpen)}
                className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles lucide-stars h-[18px] w-[18px] text-zinc-400 transition-colors" aria-hidden="true">
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                    <path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle>
                  </svg>
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Estilo</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${isEstiloOpen ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              {isEstiloOpen && (
                <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
                  <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
              {/* Posição do Sujeito */}
              <div data-field-id="subject_position" data-tour="form-field-subject_position" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Posição do sujeito</span>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Posição do sujeito"
                        aria-expanded={showPosInfo}
                        onClick={() => setShowPosInfo(!showPosInfo)}
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(139, 92, 246)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>
                  <div role="group" aria-label="Posição do sujeito" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-pressed={subjectPosition === "left"}
                        onClick={() => setSubjectPosition("left")}
                        className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                          subjectPosition === "left" ? "pb-ctrl-active text-white" : "text-zinc-200"
                        }`}
                      >
                        <span className="font-medium text-sm">Esquerda</span>
                      </button>
                    </div>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-pressed={subjectPosition === "center"}
                        onClick={() => setSubjectPosition("center")}
                        className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                          subjectPosition === "center" ? "pb-ctrl-active text-white" : "text-zinc-200"
                        }`}
                      >
                        <span className="font-medium text-sm">Centro</span>
                      </button>
                    </div>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-pressed={subjectPosition === "right"}
                        onClick={() => setSubjectPosition("right")}
                        className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                          subjectPosition === "right" ? "pb-ctrl-active text-white" : "text-zinc-200"
                        }`}
                      >
                        <span className="font-medium text-sm">Direita</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div data-field-id="descricao_adicional" data-tour="form-field-descricao_adicional" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                <div className="flex flex-col gap-2">
                  <label htmlFor="descricao_adicional" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Descrição adicional (opcional)</span>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Descrição adicional (opcional)"
                        aria-expanded={showDescInfo}
                        onClick={() => setShowDescInfo(!showDescInfo)}
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(139, 92, 246)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>

                  {showDescInfo && (
                    <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                      Pedidos específicos que a IA deve seguir à risca (ex.: texto exato, ajuste de roupa ou cena). Opcional.
                    </div>
                  )}

                  <div className="group relative">
                    <textarea
                      ref={descTextareaRef}
                      id="descricao_adicional"
                      rows={2}
                      value={additionalDescription}
                      onInput={adjustDescTextareaHeight}
                      onChange={(e) => {
                        setAdditionalDescription(e.target.value);
                        adjustDescTextareaHeight();
                      }}
                      placeholder="Instruções extras ou contexto. Ex: 'coloque o sujeito em pé com o logo no peito'..."
                      className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ height: "85.3559px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsExpandedTextarea(true)}
                      className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                      title="Expandir editor"
                      aria-haspopup="dialog"
                      aria-expanded={isExpandedTextarea}
                      data-state={isExpandedTextarea ? "open" : "closed"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path><path d="M21 9V3"></path><path d="M3 15v6"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SEÇÃO 3: SAÍDA (100% IDÊNTICO AO HTML OFICIAL) ── */}
          <div data-tour="form-sec-saida" className={mobileActiveCategory !== "saida" ? "max-lg:hidden" : ""}>
            <div
              data-state={isSaidaOpen ? "open" : "closed"}
              data-slot="collapsible"
              className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
            >
              <button
                type="button"
                aria-expanded={isSaidaOpen}
                data-state={isSaidaOpen ? "open" : "closed"}
                data-slot="collapsible-trigger"
                onClick={() => setIsSaidaOpen(!isSaidaOpen)}
                className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal h-[18px] w-[18px] text-zinc-400 transition-colors" aria-hidden="true">
                    <path d="M10 5H3"></path><path d="M12 19H3"></path><path d="M14 3v4"></path><path d="M16 17v4"></path><path d="M21 12h-9"></path><path d="M21 19h-5"></path><path d="M21 5h-7"></path><path d="M8 10v4"></path><path d="M8 12H3"></path>
                  </svg>
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Saída</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${isSaidaOpen ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>

              {isSaidaOpen && (
                <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
                  <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                    
                    {/* Campo Dimensões */}
                    <div data-field-id="dimensions" data-tour="form-field-dimensions" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white text-sm">Dimensões</span>
                            <span className="relative inline-flex items-center">
                              <button
                                type="button"
                                data-field-info=""
                                aria-label="Mais informações Dimensões"
                                aria-expanded={showDimInfo}
                                onClick={() => setShowDimInfo(!showDimInfo)}
                                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                                style={{ color: "rgb(139, 92, 246)" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M12 16v-4"></path>
                                  <path d="M12 8h.01"></path>
                                </svg>
                              </button>
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
                          <div role="group" aria-label="Dimensões" className="flex flex-col gap-1.5">
                            {/* Stories 9:16 */}
                            <button
                              type="button"
                              aria-pressed={dimension === "9:16"}
                              onClick={() => setDimension("9:16")}
                              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                                dimension === "9:16" ? "pb-ctrl-active" : ""
                              }`}
                              style={dimension === "9:16" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : undefined}
                            >
                              <span className={`text-[12px] font-semibold transition-colors ${
                                dimension === "9:16" ? "text-white" : "text-zinc-200 group-hover:text-white"
                              }`}>Stories</span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                                  dimension === "9:16" ? "text-white/80" : "text-zinc-300"
                                }`}
                                style={{ backgroundColor: dimension === "9:16" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                              >9:16</span>
                            </button>

                            {/* Feed Vertical 4:5 */}
                            <button
                              type="button"
                              aria-pressed={dimension === "4:5"}
                              onClick={() => setDimension("4:5")}
                              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                                dimension === "4:5" ? "pb-ctrl-active" : ""
                              }`}
                              style={dimension === "4:5" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : undefined}
                            >
                              <span className={`text-[12px] font-semibold transition-colors ${
                                dimension === "4:5" ? "text-white" : "text-zinc-200 group-hover:text-white"
                              }`}>Feed Vertical</span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                                  dimension === "4:5" ? "text-white/80" : "text-zinc-300"
                                }`}
                                style={{ backgroundColor: dimension === "4:5" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                              >4:5</span>
                            </button>

                            {/* Feed 1:1 */}
                            <button
                              type="button"
                              aria-pressed={dimension === "1:1"}
                              onClick={() => setDimension("1:1")}
                              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                                dimension === "1:1" ? "pb-ctrl-active" : ""
                              }`}
                              style={dimension === "1:1" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : undefined}
                            >
                              <span className={`text-[12px] font-semibold transition-colors ${
                                dimension === "1:1" ? "text-white" : "text-zinc-200 group-hover:text-white"
                              }`}>Feed</span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                                  dimension === "1:1" ? "text-white/80" : "text-zinc-300"
                                }`}
                                style={{ backgroundColor: dimension === "1:1" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                              >1:1</span>
                            </button>

                            {/* Cinema 16:9 */}
                            <button
                              type="button"
                              aria-pressed={dimension === "16:9"}
                              onClick={() => setDimension("16:9")}
                              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                                dimension === "16:9" ? "pb-ctrl-active" : ""
                              }`}
                              style={dimension === "16:9" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : undefined}
                            >
                              <span className={`text-[12px] font-semibold transition-colors ${
                                dimension === "16:9" ? "text-white" : "text-zinc-200 group-hover:text-white"
                              }`}>Cinema</span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                                  dimension === "16:9" ? "text-white/80" : "text-zinc-300"
                                }`}
                                style={{ backgroundColor: dimension === "16:9" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                              >16:9</span>
                            </button>
                          </div>

                          {/* Preview visual proporcional à direita */}
                          <div aria-hidden="true" className="hidden sm:flex h-[170px] w-[120px] items-center justify-center rounded-xl pb-ctrl-btn p-2">
                            <div
                              className="rounded-md transition-all duration-300"
                              style={{
                                width: dimension === "16:9" ? "100%" : "92%",
                                maxHeight: "92%",
                                aspectRatio: dimension === "9:16" ? "9 / 16" : dimension === "4:5" ? "4 / 5" : dimension === "1:1" ? "1 / 1" : "16 / 9",
                                background: "linear-gradient(rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.063))",
                                border: "1.5px solid rgba(139, 92, 246, 0.333)",
                                boxShadow: "rgba(139, 92, 246, 0.133) 0px 0px 16px inset"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campo Qualidade */}
                    <div data-field-id="quality" data-tour="form-field-quality" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white text-sm">Qualidade</span>
                            <span className="relative inline-flex items-center">
                              <button
                                type="button"
                                data-field-info=""
                                aria-label="Mais informações Qualidade"
                                aria-expanded={showQualInfo}
                                onClick={() => setShowQualInfo(!showQualInfo)}
                                className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                                style={{ color: "rgb(139, 92, 246)" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M12 16v-4"></path>
                                  <path d="M12 8h.01"></path>
                                </svg>
                              </button>
                            </span>
                            <div className="ml-auto text-[10px] tabular-nums text-white/60">
                              <div className="flex items-center gap-2">
                                <span
                                  className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                                  style={
                                    quality === "4K"
                                      ? {
                                          backgroundColor: "rgba(245, 158, 11, 0.12)",
                                          color: "rgb(251, 191, 36)",
                                          border: "1px solid rgba(245, 158, 11, 0.3)"
                                        }
                                      : quality === "2K"
                                      ? {
                                          backgroundColor: "rgba(139, 92, 246, 0.12)",
                                          color: "rgb(196, 181, 253)",
                                          border: "1px solid rgba(139, 92, 246, 0.3)"
                                        }
                                      : {
                                          backgroundColor: "rgba(255, 255, 255, 0.06)",
                                          color: "rgb(161, 161, 170)",
                                          border: "1px solid rgba(255, 255, 255, 0.08)"
                                        }
                                  }
                                >
                                  {quality === "4K" ? "MÁXIMA" : quality === "2K" ? "ALTA" : "PADRÃO"}
                                </span>
                                <span className="text-[10px] tabular-nums text-zinc-500">
                                  {dimension === "4:5"
                                    ? (quality === "4K" ? "3712×4608" : quality === "2K" ? "2048×2560" : "1080×1350")
                                    : dimension === "9:16"
                                    ? (quality === "4K" ? "2160×3840" : quality === "2K" ? "1440×2560" : "1080×1920")
                                    : dimension === "16:9"
                                    ? (quality === "4K" ? "3840×2160" : quality === "2K" ? "2560×1440" : "1920×1080")
                                    : (quality === "4K" ? "4096×4096" : quality === "2K" ? "2048×2048" : "1024×1024")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div role="group" aria-label="Qualidade" className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                          {/* 1K Rápido */}
                          <button
                            type="button"
                            aria-pressed={quality === "1K"}
                            onClick={() => setQuality("1K" as any)}
                            className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-col gap-1.5 py-3"
                            style={
                              quality === "1K"
                                ? {
                                    background: "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                                    border: "1px solid transparent",
                                    boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px"
                                  }
                                : {
                                    background: "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                                    border: "1px solid transparent"
                                  }
                            }
                          >
                            <span
                              className="text-base font-bold leading-none tracking-tight transition-colors"
                              style={{ color: quality === "1K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                            >1K</span>
                            <span
                              className="font-medium uppercase tracking-[0.05em] transition-colors text-[10px]"
                              style={{ color: quality === "1K" ? "rgb(196, 181, 253)" : "rgb(161, 161, 170)" }}
                            >Rápido</span>
                          </button>

                          {/* 2K Médio */}
                          <button
                            type="button"
                            aria-pressed={quality === "2K"}
                            onClick={() => setQuality("2K" as any)}
                            className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-col gap-1.5 py-3"
                            style={
                              quality === "2K"
                                ? {
                                    background: "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                                    border: "1px solid transparent",
                                    boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px"
                                  }
                                : {
                                    background: "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                                    border: "1px solid transparent"
                                  }
                            }
                          >
                            <span
                              className="text-base font-bold leading-none tracking-tight transition-colors"
                              style={{ color: quality === "2K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                            >2K</span>
                            <span
                              className="font-medium uppercase tracking-[0.05em] transition-colors text-[10px]"
                              style={{ color: quality === "2K" ? "rgb(196, 181, 253)" : "rgb(161, 161, 170)" }}
                            >Médio</span>
                          </button>

                          {/* 4K Lento (Dourado Oficial Âmbar) */}
                          <button
                            type="button"
                            aria-pressed={quality === "4K"}
                            onClick={() => setQuality("4K" as any)}
                            className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-col gap-1.5 py-3"
                            style={
                              quality === "4K"
                                ? {
                                    background: "linear-gradient(rgba(60, 38, 8, 0.85), rgba(40, 24, 4, 0.92)) padding-box padding-box, linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(245, 158, 11, 0.3) 50%, rgba(245, 158, 11, 0.65)) border-box border-box",
                                    border: "1px solid transparent",
                                    boxShadow: "rgba(245, 158, 11, 0.35) 0px 0px 14px, rgba(245, 158, 11, 0.18) 0px 0px 32px"
                                  }
                                : {
                                    background: "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                                    border: "1px solid transparent"
                                  }
                            }
                          >
                            <span
                              className="text-base font-bold leading-none tracking-tight transition-colors"
                              style={{ color: quality === "4K" ? "rgb(251, 191, 36)" : "rgb(161, 161, 170)" }}
                            >4K</span>
                            <span
                              className="font-medium uppercase tracking-[0.05em] transition-colors text-[10px]"
                              style={{ color: quality === "4K" ? "rgb(245, 158, 11)" : "rgb(161, 161, 170)" }}
                            >Lento</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              MODO PC / DESKTOP (hidden lg:flex) - 100% IDÊNTICO AO REF_ASIDE.HTML
              ══════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex flex-col gap-6 lg:gap-12">
            <div data-tour="form-sec-ref-essential">
            <div className="flex flex-col gap-6 lg:gap-12">
              {/* Imagem Principal */}
              <div data-field-id="sujeitos" className={`flex flex-col gap-1 campo-com-info ${mobileActiveCategory && mobileActiveCategory !== "foto" ? "max-lg:hidden" : ""}`}>
                <div
                  className={`flex flex-col gap-3 ${
                    isManagingSujeitos
                      ? "relative z-30 rounded-xl bg-[#0b0b0f] px-2 py-3 ring-1 ring-violet-500/40"
                      : ""
                  }`}
                  data-image-field-id="sujeitos"
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Envie sua imagem principal</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Envie sua imagem principal"
                          aria-expanded={showSubjectInfo}
                          onClick={() => setShowSubjectInfo(!showSubjectInfo)}
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(139, 92, 246)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                        </button>
                      </span>
                    </label>
                  </div>

                  {showSubjectInfo && (
                    <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                      Envie a foto do sujeito ou modelo que será o foco da sua arte. Você pode adicionar mais fotos para enriquecer o contexto e orientar a IA sobre o que focar.
                    </div>
                  )}

                  {isManagingSujeitos ? (
                    <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                      <input
                        ref={managerSubjectInputRef}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
                        multiple
                        className="hidden"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files) handleSubjectFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <div className="flex items-center justify-center w-full" role="group" aria-label="Gerenciar imagens — Envie sua imagem principal">
                        <div className="relative flex flex-col bg-[#0b0b0f] w-full">
                          <div className="flex">
                            <div className="flex flex-col w-full">
                              <div className="py-3 px-2">
                                <button
                                  type="button"
                                  onClick={() => managerSubjectInputRef.current?.click()}
                                  className="sub-area-entra mb-3 w-full rounded-xl border border-dashed px-3 py-5 text-center text-xs transition-colors border-white/15 text-zinc-500 hover:border-violet-500/50 hover:bg-violet-500/[0.05] hover:text-violet-300 cursor-pointer"
                                  style={{ animationDelay: "0ms" }}
                                >
                                  Clique ou arraste para trazer mais
                                </button>

                                <div className="space-y-2.5" data-testid="lista-de-imagens">
                                  {subjectImages.map((imgItem, idx) => (
                                    <div
                                      key={imgItem.id || idx}
                                      draggable
                                      onDragStart={() => setDraggedSubjectIdx(idx)}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={() => handleDropSubjectReorder(idx)}
                                      className="sub-area-entra rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 transition-opacity"
                                      style={{ animationDelay: `${55 * (idx + 1)}ms` }}
                                    >
                                      <div className="flex items-center gap-2.5">
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
                                          className="lucide lucide-grip-vertical h-4 w-4 shrink-0 cursor-grab text-zinc-600 active:cursor-grabbing"
                                          aria-hidden="true"
                                        >
                                          <circle cx="9" cy="12" r="1" />
                                          <circle cx="9" cy="5" r="1" />
                                          <circle cx="9" cy="19" r="1" />
                                          <circle cx="15" cy="12" r="1" />
                                          <circle cx="15" cy="5" r="1" />
                                          <circle cx="15" cy="19" r="1" />
                                        </svg>

                                        <button
                                          type="button"
                                          aria-label={`Ampliar imagem ${idx + 1}`}
                                          title="Ampliar imagem"
                                          onClick={() => setLightboxImage(imgItem.url)}
                                          className="relative shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
                                        >
                                          <img
                                            alt={`imagem ${idx + 1}`}
                                            className="h-14 w-14 rounded-lg border border-white/10 object-cover transition-colors hover:border-violet-500/60"
                                            src={imgItem.url}
                                          />
                                          <span
                                            aria-hidden="true"
                                            className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white shadow-md"
                                          >
                                            {idx + 1}
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          aria-label={`Recortar imagem ${idx + 1}`}
                                          title="Recortar imagem"
                                          onClick={() => openCropper(imgItem.url, "sujeito", idx)}
                                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40 cursor-pointer"
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
                                            className="lucide lucide-crop h-3.5 w-3.5"
                                            aria-hidden="true"
                                          >
                                            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                                            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                                          </svg>
                                        </button>

                                        <div className="flex-1" />

                                        <div className="flex shrink-0 items-center gap-1">
                                          <button
                                            type="button"
                                            aria-label={`Remover imagem ${idx + 1}`}
                                            title="Remover"
                                            onClick={() => handleRemoveSubjectImage(idx)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
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
                                              className="lucide lucide-trash2 lucide-trash-2 h-3.5 w-3.5"
                                              aria-hidden="true"
                                            >
                                              <path d="M10 11v6" />
                                              <path d="M14 11v6" />
                                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                              <path d="M3 6h18" />
                                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>

                                      <textarea
                                        rows={2}
                                        value={imgItem.desc || ""}
                                        onChange={(e) => handleSubjectDescChange(idx, e.target.value)}
                                        placeholder="Descreva o que quer extrair desta imagem (ex: 'foco no rosto', 'pegar pose e roupa')"
                                        aria-label={`Descrição da imagem ${idx + 1}`}
                                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => { setIsManagingSujeitos(false); updateActiveTab({ isManagingSujeitos: false }); }}
                                  className="sub-area-entra w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 mt-8 cursor-pointer"
                                  style={{ animationDelay: "110ms" }}
                                >
                                  Concluir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Visão Recolhida (100% fiel ao HTML oficial) */
                    <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                      {subjectImages.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {subjectImages.map((item, idx) => (
                            <div key={item.id || idx} className="group flex items-center gap-2">
                              <div className="relative shrink-0">
                                <img
                                  alt={`imagem ${idx + 1}`}
                                  onClick={() => setLightboxImage(item.url)}
                                  className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                  src={item.url}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubjectImage(idx)}
                                  aria-label={`Remover imagem ${idx + 1}`}
                                  title={`Remover imagem ${idx + 1}`}
                                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                                >
                                  ×
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Recortar imagem ${idx + 1}`}
                                  title={`Recortar imagem ${idx + 1}`}
                                  onClick={() => openCropper(item.url, "sujeito", idx)}
                                  className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 disabled:opacity-40 cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-2.5 w-2.5" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
                                </button>
                              </div>
                              <input
                                placeholder="Descreva o que quer extrair desta imagem (ex: 'foco no rosto', 'pegar pose e roupa')"
                                className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors text-white"
                                type="text"
                                value={item.desc || ""}
                                onChange={(e) => handleSubjectDescChange(idx, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <div
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              handleSubjectFiles(e.dataTransfer.files);
                            }
                          }}
                          className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] h-10 gap-2 px-1">
                          <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Alinhamento do sujeito">
                            <button
                              type="button"
                              aria-label="Sujeito à esquerda"
                              aria-pressed={subjectPosition === "left"}
                              title="Sujeito à esquerda"
                              onClick={() => setSubjectPosition("left")}
                              className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                                subjectPosition === "left"
                                  ? "border-violet-500/60 bg-violet-500/25 text-violet-200"
                                  : "border-white/10 bg-white/[0.04] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-start h-3.5 w-3.5" aria-hidden="true"><path d="M21 5H3"></path><path d="M15 12H3"></path><path d="M17 19H3"></path></svg>
                            </button>
                            <button
                              type="button"
                              aria-label="Sujeito ao centro"
                              aria-pressed={subjectPosition === "center"}
                              title="Sujeito ao centro"
                              onClick={() => setSubjectPosition("center")}
                              className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                                subjectPosition === "center"
                                  ? "border-violet-500/60 bg-violet-500/25 text-violet-200"
                                  : "border-white/10 bg-white/[0.04] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-center h-3.5 w-3.5" aria-hidden="true"><path d="M21 5H3"></path><path d="M17 12H7"></path><path d="M19 19H5"></path></svg>
                            </button>
                            <button
                              type="button"
                              aria-label="Sujeito à direita"
                              aria-pressed={subjectPosition === "right"}
                              title="Sujeito à direita"
                              onClick={() => setSubjectPosition("right")}
                              className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                                subjectPosition === "right"
                                  ? "border-violet-500/60 bg-violet-500/25 text-violet-200"
                                  : "border-white/10 bg-white/[0.04] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-end h-3.5 w-3.5" aria-hidden="true"><path d="M21 5H3"></path><path d="M21 12H9"></path><path d="M21 19H7"></path></svg>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => mainInputRef.current?.click()}
                            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                          >
                            <span className="text-base leading-none">+</span>
                            <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsManagingSujeitos(true); updateActiveTab({ isManagingSujeitos: true }); }}
                            aria-label="Ajustar fotos e cena"
                            title="Ajustar fotos e cena"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-500 transition-colors hover:border-violet-500/30 hover:text-zinc-200 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-open h-3.5 w-3.5" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>

                      <input
                        ref={mainInputRef}
                        onChange={(e) => {
                          if (e.target.files) handleSubjectFiles(e.target.files);
                          e.target.value = "";
                        }}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        multiple
                        className="hidden"
                        type="file"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Posição do Sujeito (Oculto por padrão, idêntico ao original) */}
              <div data-field-id="subject_position" className="flex-col gap-1 campo-com-info hidden">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-zinc-300">
                    <span className="truncate">Posição do sujeito</span>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Posição do sujeito"
                        onClick={() => setShowPosInfo(!showPosInfo)}
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none"
                        style={{ color: "rgb(139, 92, 246)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                      </button>
                    </span>
                  </label>
                  <div role="group" aria-label="Posição do sujeito" className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Esquerda"
                      aria-pressed={subjectPosition === "left"}
                      title="Esquerda"
                      onClick={() => setSubjectPosition("left")}
                      className={`flex h-8 w-10 items-center justify-center rounded-lg transition-colors pb-ctrl-btn cursor-pointer ${
                        subjectPosition === "left" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-start h-5 w-5"><path d="M21 5H3" /><path d="M15 12H3" /><path d="M17 19H3" /></svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Centro"
                      aria-pressed={subjectPosition === "center"}
                      title="Centro"
                      onClick={() => setSubjectPosition("center")}
                      className={`flex h-8 w-10 items-center justify-center rounded-lg transition-colors pb-ctrl-btn cursor-pointer ${
                        subjectPosition === "center" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-center h-5 w-5"><path d="M21 5H3" /><path d="M17 12H7" /><path d="M19 19H5" /></svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Direita"
                      aria-pressed={subjectPosition === "right"}
                      title="Direita"
                      onClick={() => setSubjectPosition("right")}
                      className={`flex h-8 w-10 items-center justify-center rounded-lg transition-colors pb-ctrl-btn cursor-pointer ${
                        subjectPosition === "right" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-end h-5 w-5"><path d="M21 5H3" /><path d="M21 12H9" /><path d="M21 19H7" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Referências de Estilo (Idêntico ao snippet oficial com gerenciador) */}
              <div data-field-id="referencias" className={`flex flex-col gap-1 campo-com-info ${mobileActiveCategory && mobileActiveCategory !== "estilo" ? "max-lg:hidden" : ""}`}>
                <div
                  className={`flex flex-col gap-3 ${
                    isManagingReferencias
                      ? "relative z-30 rounded-xl bg-[#0b0b0f] px-2 py-3 ring-1 ring-violet-500/40"
                      : ""
                  }`}
                  data-image-field-id="referencias"
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Inspirações de Estilo</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Inspirações de Estilo"
                          aria-expanded={showRefInfo}
                          onClick={() => setShowRefInfo(!showRefInfo)}
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(139, 92, 246)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </label>

                    {/* Switch: Usar na imagem */}
                    {/* Switch: Usar na imagem (100% IDÊNTICO AO HTML OFICIAL) */}
                    <button
                      type="button"
                      aria-label={`Usar na imagem: ${useRefOnBuild ? "ativado" : "desativado"}`}
                      aria-pressed={useRefOnBuild}
                      title={useRefOnBuild ? "Imagem" : "Somente JSON"}
                      onClick={() => setUseRefOnBuild(!useRefOnBuild)}
                      className="flex shrink-0 items-center gap-1.5 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                    >
                      <span>Usar na imagem</span>
                      <span
                        className={`relative h-4 w-7 rounded-full border transition-colors ${
                          useRefOnBuild
                            ? "border-violet-500/50 bg-violet-500/30"
                            : "border-white/10 bg-white/[0.05]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all ${
                            useRefOnBuild ? "left-3.5 bg-violet-300" : "left-0.5 bg-zinc-600"
                          }`}
                        />
                      </span>
                      <span
                        className={`rounded-full border px-1.5 py-0.5 font-medium ${
                          useRefOnBuild
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {useRefOnBuild ? "Imagem" : "Somente JSON"}
                      </span>
                    </button>
                  </div>

                  {showRefInfo && (
                    <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                      Envie uma imagem de referência visual para guiar iluminação, composição estética e paleta de cores.
                    </div>
                  )}

                  {isManagingReferencias ? (
                    /* Visão Expandida do Gerenciador de Referências (100% idêntico ao HTML do usuário) */
                    <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                      <input
                        ref={managerRefInputRef}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        multiple
                        className="hidden"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files) handleRefFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <div className="flex items-center justify-center w-full" role="group" aria-label="Gerenciar imagens — Referências de Estilo">
                        <div className="relative flex flex-col bg-[#0b0b0f] w-full">
                          <div className="flex">
                            <div className="flex flex-col w-full">
                              <div className="py-3 px-2">
                                <button
                                  type="button"
                                  onClick={() => managerRefInputRef.current?.click()}
                                  className="sub-area-entra mb-3 w-full rounded-xl border border-dashed px-3 py-5 text-center text-xs transition-colors border-white/15 text-zinc-500 hover:border-violet-500/50 hover:bg-violet-500/[0.05] hover:text-violet-300 cursor-pointer"
                                  style={{ animationDelay: "0ms" }}
                                >
                                  Clique ou arraste para trazer mais
                                </button>

                                <div className="space-y-2.5" data-testid="lista-de-imagens">
                                  {referenceImages.map((imgItem, idx) => (
                                    <div
                                      key={imgItem.id || idx}
                                      draggable
                                      onDragStart={() => setDraggedRefIdx(idx)}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={() => handleDropRefReorder(idx)}
                                      className="sub-area-entra rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 transition-opacity"
                                      style={{ animationDelay: `${55 * (idx + 1)}ms` }}
                                    >
                                      <div className="flex items-center gap-2.5">
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
                                          className="lucide lucide-grip-vertical h-4 w-4 shrink-0 cursor-grab text-zinc-600 active:cursor-grabbing"
                                          aria-hidden="true"
                                        >
                                          <circle cx="9" cy="12" r="1" />
                                          <circle cx="9" cy="5" r="1" />
                                          <circle cx="9" cy="19" r="1" />
                                          <circle cx="15" cy="12" r="1" />
                                          <circle cx="15" cy="5" r="1" />
                                          <circle cx="15" cy="19" r="1" />
                                        </svg>

                                        <button
                                          type="button"
                                          aria-label={`Ampliar imagem ${idx + 1}`}
                                          title="Ampliar imagem"
                                          onClick={() => setLightboxImage(imgItem.url)}
                                          className="relative shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
                                        >
                                          <img
                                            alt={`imagem ${idx + 1}`}
                                            className="h-14 w-14 rounded-lg border border-white/10 object-cover transition-colors hover:border-violet-500/60"
                                            src={imgItem.url}
                                          />
                                          <span
                                            aria-hidden="true"
                                            className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white shadow-md"
                                          >
                                            {idx + 1}
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          aria-label={`Recortar imagem ${idx + 1}`}
                                          title="Recortar imagem"
                                          onClick={() => openCropper(imgItem.url, "referencia", idx)}
                                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40 cursor-pointer"
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
                                            className="lucide lucide-crop h-3.5 w-3.5"
                                            aria-hidden="true"
                                          >
                                            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                                            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                                          </svg>
                                        </button>

                                        <div className="flex-1" />

                                        <div className="flex shrink-0 items-center gap-1">
                                          <button
                                            type="button"
                                            aria-label={`Remover imagem ${idx + 1}`}
                                            title="Remover"
                                            onClick={() => handleRemoveRefImage(idx)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
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
                                              className="lucide lucide-trash2 lucide-trash-2 h-3.5 w-3.5"
                                              aria-hidden="true"
                                            >
                                              <path d="M10 11v6" />
                                              <path d="M14 11v6" />
                                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                              <path d="M3 6h18" />
                                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>

                                      <textarea
                                        rows={2}
                                        value={imgItem.desc || ""}
                                        onChange={(e) => handleRefDescChange(idx, e.target.value)}
                                        placeholder="Descreva o que quer extrair desta ref (ex: 'só a paleta de cores', 'só a iluminação')"
                                        aria-label={`Descrição da imagem ${idx + 1}`}
                                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => { setIsManagingReferencias(false); updateActiveTab({ isManagingReferencias: false }); }}
                                  className="sub-area-entra w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 mt-8 cursor-pointer"
                                  style={{ animationDelay: "110ms" }}
                                >
                                  Concluir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <input accept="image/*" multiple className="hidden" type="file" />
                    </div>
                  ) : (
                    /* Visão Recolhida de Referências */
                    <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                      {referenceImages.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {referenceImages.map((item, idx) => (
                            <div key={item.id || idx} className="group flex items-center gap-2">
                              <div className="relative shrink-0">
                                <img
                                  alt={`imagem ${idx + 1}`}
                                  onClick={() => setLightboxImage(item.url)}
                                  className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                  src={item.url}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRefImage(idx)}
                                  aria-label={`Remover imagem ${idx + 1}`}
                                  title={`Remover imagem ${idx + 1}`}
                                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                                >
                                  ×
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Recortar imagem ${idx + 1}`}
                                  title={`Recortar imagem ${idx + 1}`}
                                  onClick={() => openCropper(item.url, "referencia", idx)}
                                  className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 disabled:opacity-40 cursor-pointer"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-2.5 w-2.5" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
                                </button>
                              </div>
                              <input
                                placeholder="Descreva o que quer extrair desta imagem (ex: 'só a paleta de cores', 'só a iluminação')"
                                className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors text-white"
                                type="text"
                                value={item.desc || ""}
                                onChange={(e) => handleRefDescChange(idx, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] h-10 gap-2 px-1">
                          <button
                            type="button"
                            onClick={() => refInputRef.current?.click()}
                            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                          >
                            <span className="text-base leading-none">+</span>
                            <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsManagingReferencias(true); updateActiveTab({ isManagingReferencias: true }); }}
                            aria-label="Ajustar fotos e cena"
                            title="Ajustar fotos e cena"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-500 transition-colors hover:border-violet-500/30 hover:text-zinc-200 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-open h-3.5 w-3.5" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>

                      <input
                        ref={refInputRef}
                        onChange={(e) => {
                          if (e.target.files) handleRefFiles(e.target.files);
                          e.target.value = "";
                        }}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        multiple
                        className="hidden"
                        type="file"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Usar inspiração na construção da imagem (oculto por padrão) */}
              <div data-field-id="send_style_ref_bytes" className="flex-col gap-1 campo-com-info hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <label htmlFor="send_style_ref_bytes" className="text-sm font-medium text-zinc-300 leading-snug">
                      Usar inspiração na construção da imagem
                    </label>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Usar inspiração na construção da imagem"
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        style={{ color: "rgb(139, 92, 246)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/8 bg-zinc-900/80 p-1">
                    <button
                      type="button"
                      title="Ativar"
                      onClick={() => setUseRefOnBuild(true)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      style={useRefOnBuild ? { backgroundColor: "rgba(139, 92, 246, 0.133)", color: "rgb(139, 92, 246)", boxShadow: "rgba(139, 92, 246, 0.267) 0px 0px 0px 1px" } : { color: "rgb(82, 82, 91)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                    </button>
                    <button
                      type="button"
                      title="Desativar"
                      onClick={() => setUseRefOnBuild(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      style={!useRefOnBuild ? { backgroundColor: "rgba(139, 92, 246, 0.133)", color: "rgb(139, 92, 246)", boxShadow: "rgba(139, 92, 246, 0.267) 0px 0px 0px 1px" } : { color: "rgb(82, 82, 91)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dimensões */}
              <div data-field-id="dimensions" className={`flex flex-col gap-1 campo-com-info ${mobileActiveCategory && mobileActiveCategory !== "saida" ? "max-lg:hidden" : ""}`}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs">Dimensões</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Dimensões"
                          aria-expanded={showDimInfo}
                          onClick={() => setShowDimInfo(!showDimInfo)}
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(139, 92, 246)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>

                  <div role="group" aria-label="Dimensões" className="grid grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      aria-label="Stories 9:16"
                      aria-pressed={dimension === "9:16"}
                      title="Stories · 9:16"
                      onClick={() => setDimension("9:16")}
                      className={`flex h-12 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors pb-ctrl-btn cursor-pointer ${
                        dimension === "9:16" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <span aria-hidden="true" className={`block rounded-[3px] border ${dimension === "9:16" ? "border-violet-300 bg-violet-400/20" : "border-zinc-600 bg-white/[0.025]"}`} style={{ width: "12px", height: "22px" }}></span>
                      <span className="text-[10px] font-semibold tabular-nums">9:16</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Feed Vertical 4:5"
                      aria-pressed={dimension === "4:5"}
                      title="Feed Vertical · 4:5"
                      onClick={() => setDimension("4:5")}
                      className={`flex h-12 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors pb-ctrl-btn cursor-pointer ${
                        dimension === "4:5" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <span aria-hidden="true" className={`block rounded-[3px] border ${dimension === "4:5" ? "border-violet-300 bg-violet-400/20" : "border-zinc-600 bg-white/[0.025]"}`} style={{ width: "18px", height: "22px" }}></span>
                      <span className="text-[10px] font-semibold tabular-nums">4:5</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Feed 1:1"
                      aria-pressed={dimension === "1:1"}
                      title="Feed · 1:1"
                      onClick={() => setDimension("1:1")}
                      className={`flex h-12 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors pb-ctrl-btn cursor-pointer ${
                        dimension === "1:1" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <span aria-hidden="true" className={`block rounded-[3px] border ${dimension === "1:1" ? "border-violet-300 bg-violet-400/20" : "border-zinc-600 bg-white/[0.025]"}`} style={{ width: "22px", height: "22px" }}></span>
                      <span className="text-[10px] font-semibold tabular-nums">1:1</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Cinema 16:9"
                      aria-pressed={dimension === "16:9"}
                      title="Cinema · 16:9"
                      onClick={() => setDimension("16:9")}
                      className={`flex h-12 items-center justify-center gap-1.5 rounded-lg px-1.5 transition-colors pb-ctrl-btn cursor-pointer ${
                        dimension === "16:9" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <span aria-hidden="true" className={`block rounded-[3px] border ${dimension === "16:9" ? "border-violet-300 bg-violet-400/20" : "border-zinc-600 bg-white/[0.025]"}`} style={{ width: "22px", height: "12px" }}></span>
                      <span className="text-[10px] font-semibold tabular-nums">16:9</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Personalizado"
                      aria-pressed={dimension === "custom"}
                      title="Personalizado (Largura × Altura em Pixels)"
                      onClick={() => setDimension("custom")}
                      className={`flex h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 transition-colors pb-ctrl-btn cursor-pointer ${
                        dimension === "custom" ? "pb-ctrl-active text-white" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <Sliders className={`h-3.5 w-3.5 ${dimension === "custom" ? "text-violet-300" : "text-zinc-500"}`} />
                      <span className="text-[9px] font-semibold tracking-tight">Livre</span>
                    </button>
                  </div>

                  {dimension === "custom" && (
                    <div className="mt-2.5 rounded-xl border border-violet-500/25 bg-gradient-to-b from-violet-500/[0.08] to-purple-500/[0.02] p-3 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-violet-400" />
                          Medida Exata em Pixels
                        </span>
                        <span className="text-[10px] font-mono text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-md border border-violet-500/30">
                          {customWidth} × {customHeight} px
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-400 font-medium">Largura (px)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={128}
                              max={4096}
                              step={10}
                              value={customWidth}
                              onChange={(e) => {
                                const v = Math.max(1, parseInt(e.target.value) || 0);
                                setCustomWidth(v);
                              }}
                              className="w-full h-8 rounded-lg bg-black/40 border border-white/10 px-2.5 text-xs text-white font-mono focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                              placeholder="1200"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">W</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-400 font-medium">Altura (px)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={128}
                              max={4096}
                              step={10}
                              value={customHeight}
                              onChange={(e) => {
                                const v = Math.max(1, parseInt(e.target.value) || 0);
                                setCustomHeight(v);
                              }}
                              className="w-full h-8 rounded-lg bg-black/40 border border-white/10 px-2.5 text-xs text-white font-mono focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                              placeholder="630"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">H</span>
                          </div>
                        </div>
                      </div>

                      {/* Chips de Predefinições Rápidas */}
                      <div className="mt-2.5 pt-2 border-t border-white/5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1.5">Atalhos rápidos:</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { label: "1200 × 630 (Meta)", w: 1200, h: 630 },
                            { label: "800 × 1200 (Pin)", w: 800, h: 1200 },
                            { label: "1920 × 1080 (HD)", w: 1920, h: 1080 },
                            { label: "2 Lâminas 4:5 (2160×1350)", w: 2160, h: 1350 },
                            { label: "3 Lâminas 4:5 (3240×1350)", w: 3240, h: 1350 },
                            { label: "4 Lâminas 4:5 (4320×1350)", w: 4320, h: 1350 },
                            { label: "5 Lâminas 4:5 (5400×1350)", w: 5400, h: 1350 }
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setCustomWidth(preset.w);
                                setCustomHeight(preset.h);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                customWidth === preset.w && customHeight === preset.h
                                  ? "bg-violet-500/30 border-violet-400/50 text-white shadow-sm"
                                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08]"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualidade */}
              <div data-field-id="quality" data-tour="form-field-quality" className="flex flex-col gap-1 campo-com-info">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-xs">Qualidade</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Qualidade"
                          aria-expanded={showQualInfo}
                          onClick={() => setShowQualInfo(!showQualInfo)}
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(139, 92, 246)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                          </svg>
                        </button>
                      </span>
                      <div className="ml-auto text-[10px] tabular-nums text-white/60">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                            style={
                              quality === "4K"
                                ? { backgroundColor: "rgba(245, 158, 11, 0.12)", color: "rgb(251, 191, 36)", border: "1px solid rgba(245, 158, 11, 0.3)" }
                                : quality === "2K"
                                ? { backgroundColor: "rgba(139, 92, 246, 0.12)", color: "rgb(196, 181, 253)", border: "1px solid rgba(139, 92, 246, 0.3)" }
                                : { backgroundColor: "rgba(255, 255, 255, 0.06)", color: "rgb(161, 161, 170)", border: "1px solid rgba(255, 255, 255, 0.08)" }
                            }
                          >
                            {quality === "4K" ? "MÁXIMA" : quality === "2K" ? "ALTA" : "PADRÃO"}
                          </span>
                          <span className="text-[10px] tabular-nums text-zinc-500">
                            {dimension === "custom"
                              ? `${customWidth}×${customHeight}`
                              : dimension === "4:5"
                              ? (quality === "4K" ? "3712×4608" : quality === "2K" ? "1792×2304" : "896×1152")
                              : dimension === "9:16"
                              ? (quality === "4K" ? "2880×5120" : quality === "2K" ? "1536×2688" : "768×1344")
                              : dimension === "16:9"
                              ? (quality === "4K" ? "5120×2880" : quality === "2K" ? "2688×1536" : "1344×768")
                              : (quality === "4K" ? "4096×4096" : quality === "2K" ? "2048×2048" : "1024×1024")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showQualInfo && (
                    <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                      Define a densidade de pixels e fidelidade visual da imagem final. O modo 4K aplica acabamento cinematográfico com super-resolução.
                    </div>
                  )}

                  <div role="group" aria-label="Qualidade" className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                    {[
                      { id: "1K", sub: "Rápido" },
                      { id: "2K", sub: "Médio" },
                      { id: "4K", sub: "Lento" }
                    ].map((q) => {
                      const isSelected = quality === q.id;
                      const is4K = q.id === "4K";
                      return (
                        <button
                          key={q.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setQuality(q.id as any)}
                          className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                          style={
                            isSelected && is4K
                              ? {
                                  background: "linear-gradient(rgba(60, 38, 8, 0.85), rgba(40, 24, 4, 0.92)) padding-box padding-box, linear-gradient(135deg, rgba(245, 158, 11, 0.85), rgba(245, 158, 11, 0.3) 50%, rgba(245, 158, 11, 0.65)) border-box border-box",
                                  border: "1px solid transparent",
                                  boxShadow: "rgba(245, 158, 11, 0.35) 0px 0px 14px, rgba(245, 158, 11, 0.18) 0px 0px 32px"
                                }
                              : isSelected
                              ? {
                                  background: "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                                  border: "1px solid transparent",
                                  boxShadow: "rgba(139, 92, 246, 0.19) 0px 0px 12px, rgba(139, 92, 246, 0.07) 0px 0px 28px"
                                }
                              : {
                                  background: "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                                  border: "1px solid transparent"
                                }
                          }
                        >
                          <span
                            className="text-base font-bold leading-none tracking-tight transition-colors"
                            style={{
                              color: isSelected && is4K ? "rgb(251, 191, 36)" : isSelected ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)"
                            }}
                          >
                            {q.id}
                          </span>
                          <span
                            className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]"
                            style={{
                              color: isSelected && is4K ? "rgb(245, 158, 11)" : isSelected ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)"
                            }}
                          >
                            {q.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 2: MAIS OPÇÕES (100% IDÊNTICO AO HTML OFICIAL DO AGENTE REF) ── */}
          
            <div data-tour="form-sec-ref-more-options" className={mobileActiveCategory === "foto" ? "max-lg:hidden" : ""}>
            <div className="flex flex-col gap-4">
              {/* Assets (opcional) */}
              <div data-field-id="assets" className={`flex flex-col gap-1 campo-com-info ${mobileActiveCategory && mobileActiveCategory !== "saida" ? "max-lg:hidden" : ""}`}>
                <div className="flex flex-col gap-3" data-image-field-id="assets">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Assets (opcional)</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Assets (opcional)"
                          aria-expanded={showAssetsInfo}
                          onClick={() => setShowAssetsInfo(!showAssetsInfo)}
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(139, 92, 246)" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </label>
                  </div>

                  {showAssetsInfo && (
                    <div className="text-xs text-zinc-400 bg-white/[0.04] p-2.5 rounded-lg border border-white/10">
                      Envie assets extras como logotipos, mockups de celular ou outros produtos para serem compostos na imagem.
                    </div>
                  )}

                  <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                    {assetImages.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {assetImages.map((img, idx) => (
                          <div key={img.id || idx} className="group flex items-center gap-2">
                            <div className="relative shrink-0">
                              <img
                                alt={`imagem ${idx + 1}`}
                                onClick={() => setLightboxImage(img.url)}
                                className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                src={img.url}
                              />
                              <button
                                type="button"
                                aria-label={`Remover imagem ${idx + 1}`}
                                title={`Remover imagem ${idx + 1}`}
                                onClick={() => handleRemoveAssetImage(idx)}
                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                              >
                                ×
                              </button>
                              <button
                                type="button"
                                aria-label={`Recortar imagem ${idx + 1}`}
                                title={`Recortar imagem ${idx + 1}`}
                                onClick={() => openCropper(img.url, "asset", idx)}
                                className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 disabled:opacity-40 cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-2.5 w-2.5" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
                              </button>
                            </div>
                            <input
                              placeholder="Descreva o que quer extrair deste asset (ex: 'logotipo', 'produto em destaque')"
                              className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors text-white"
                              type="text"
                              value={img.desc || ""}
                              onChange={(e) => handleAssetDescChange(idx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] py-2">
                        <button
                          type="button"
                          onClick={() => assetsInputRef.current?.click()}
                          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                        >
                          <span className="text-base leading-none">+</span>
                          <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                        </button>
                      </div>
                    </div>
                    <input
                      ref={assetsInputRef}
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      multiple
                      className="hidden"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files) handleAssetFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* Descrição adicional (opcional) */}
              <div data-field-id="descricao_adicional" className={`flex flex-col gap-1 campo-com-info ${mobileActiveCategory && mobileActiveCategory !== "estilo" ? "max-lg:hidden" : ""}`}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="descricao_adicional" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Descrição adicional (opcional)</span>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Descrição adicional (opcional)"
                        aria-expanded={showDescInfo}
                        onClick={() => setShowDescInfo(!showDescInfo)}
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(139, 92, 246)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>
                  <div className="group relative">
                    <textarea
                      id="descricao_adicional"
                      rows={2}
                      value={additionalDescription}
                      onChange={(e) => setAdditionalDescription(e.target.value)}
                      placeholder="Instruções extras ou contexto. Ex: 'coloque o sujeito em pé com o logo no peito'..."
                      className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-white"
                      style={{ height: "85.6px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsExpandedTextarea(true)}
                      className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                      title="Expandir editor"
                      aria-haspopup="dialog"
                      aria-expanded={isExpandedTextarea}
                      data-state={isExpandedTextarea ? "open" : "closed"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          
          </div>


          {/* ── BOTÕES CONSTRUIR, DUPLICAR E RESETAR (DESKTOP) ── */}
          <div data-tour="form-actions" className="flex flex-col gap-6 max-lg:hidden">
          <div>
            <div ref={inlineSubmitRef} className="w-full">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40"
                style={{
                  background: "linear-gradient(to right, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))"
                }}
              >
                {isProcessing ? "Construindo..." : "Construir"}
                <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
              </button>
            </div>
          </div>

          {/* ── BOTÕES DUPLICAR E RESETAR (100% IDÊNTICO AO HTML OFICIAL) ── */}
          <div className="flex gap-2">
            <button
              type="button"
              title="Duplicar configurações para uma nova aba"
              onClick={handleDuplicateTab}
              disabled={tabs.length >= 3}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-4 w-4" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
              <span>Duplicar</span>
            </button>
            <button
              type="button"
              title="Resetar todas as configurações do formulário"
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-4 w-4" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
              <span>Resetar</span>
            </button>
          </div>

          {/* ── CARD DE AÇÃO FLUTUANTE AO ROLAR O FORMULÁRIO ── */}
          {/* ── CARD DE AÇÃO FLUTUANTE AO ROLAR O FORMULÁRIO (100% IDÊNTICO AO HTML OFICIAL) ── */}
          {!isSubmitIntersecting && (
            <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl backdrop-blur-md">
                <div className="w-full">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40"
                    style={{
                      background: "linear-gradient(to right, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))"
                    }}
                  >
                    {isProcessing ? "Construindo..." : "Construir"}
                    <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                  </button>
                </div>
                <div className="mt-2 px-1 pb-0.5">
                  <div className="flex items-center justify-center gap-3 text-[11px] text-[#9d94bb]">
                    <button
                      type="button"
                      title="Duplicar configurações para uma nova aba"
                      onClick={handleDuplicateTab}
                      disabled={tabs.length >= 3}
                      className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-3 w-3" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                      Duplicar
                    </button>
                    <span aria-hidden="true" className="text-white/15">·</span>
                    <button
                      type="button"
                      title="Resetar todas as configurações do formulário"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-3 w-3" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                      Resetar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </form>
      </aside>

      {/* ── SEPARADOR REDIMENSIONÁVEL ── */}
      <div role="separator" aria-orientation="vertical" title="Arraste para redimensionar" className="group relative z-10 hidden w-1.5 cursor-col-resize items-center justify-center border-r border-white/5 transition-colors lg:flex">
        <div className="h-8 w-0.5 rounded-full bg-white/10 transition-colors" />
      </div>

      {/* ── PALCO CENTRAL REF (CONTAINER COMPLETO 100% ORIGINAL) ── */}
      <div className="relative flex min-h-0 min-w-0 flex-1 max-lg:contents">
        <section className="palco-central relative flex-col overflow-hidden flex max-lg:order-first max-lg:min-h-0 max-lg:overflow-hidden max-lg:pt-[env(safe-area-inset-top)] lg:h-full lg:flex-1" style={{ minWidth: 0 }}>
          
          {/* Botão Minimizar/Mostrar filtros no Mobile (100% IDÊNTICO AO OFICIAL) */}
          <button
            type="button"
            aria-label={mobileActiveCategory ? "Minimizar filtros" : "Mostrar filtros"}
            onClick={() => {
              if (mobileActiveCategory) {
                setMobileActiveCategory(null);
              } else {
                setMobileActiveCategory("foto");
              }
            }}
            className="lg:hidden flex w-full shrink-0 items-center justify-center py-0.5 text-zinc-500 transition-colors active:text-white cursor-pointer"
          >
            {mobileActiveCategory ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {/* ── BARRA DE NAVEGAÇÃO PERSISTENTE (IDÊNTICO AO SNIPPET OFICIAL) ── */}
          <div className="barra-de-navegacao navegacao-persistente relative flex w-full items-center justify-start gap-2 py-3 pl-3 pr-14 shrink-0 scrollbar-hide max-lg:flex-col max-lg:items-stretch max-lg:gap-1.5 max-lg:px-2 max-lg:py-1.5 max-lg:sticky max-lg:top-0 max-lg:z-20 max-lg:border-b max-lg:border-white/[0.06] max-lg:bg-[#0c0a15]/85 max-lg:backdrop-blur-sm lg:z-30 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-0 lg:overflow-visible lg:pl-0 lg:pr-0 max-lg:overflow-hidden max-lg:transition-all max-lg:duration-300 max-lg:ease-out max-lg:max-h-48">
            
            {/* Coluna 1: Abas de Geração */}
            <div className="pointer-events-auto flex min-w-0 items-start gap-2 max-lg:order-2 max-lg:w-full max-lg:justify-center lg:w-full lg:pl-4">
              <div className="hidden min-w-0 flex-1 lg:flex">
                <div data-tour="tabs" role="tablist" aria-label="Abas de geração" className="pointer-events-auto flex min-w-0 flex-row items-center gap-1 overflow-x-auto scrollbar-hide w-full max-w-full">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <div key={tab} className="group relative flex w-fit shrink-0 items-center">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveTab(tab)}
                          className={`inline-flex h-7 max-w-[12rem] flex-none items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/30 hover:bg-white/[0.06] cursor-pointer ${
                            tabs.length > 1 ? "pr-5" : ""
                          }`}
                          style={
                            isActive
                              ? {
                                  color: "rgb(139, 92, 246)",
                                  borderColor: "rgba(139, 92, 246, 0.4)",
                                  backgroundColor: "rgba(139, 92, 246, 0.08)"
                                }
                              : {
                                  color: "rgb(139, 92, 246)",
                                  borderColor: "rgba(139, 92, 246, 0.333)"
                                }
                          }
                        >
                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          )}
                          {renamingTab === tab ? (
                            <input
                              autoFocus
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={handleFinishRenameTab}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleFinishRenameTab();
                                if (e.key === "Escape") setRenamingTab(null);
                              }}
                              className="h-5 w-16 bg-transparent text-[11px] font-semibold uppercase text-white outline-none border-b border-violet-400"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className="truncate"
                              title="Duplo clique para renomear"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleStartRenameTab(tab);
                              }}
                            >
                              {tab}
                            </span>
                          )}
                        </button>
                        {tabs.length > 1 && (
                          <button
                            type="button"
                            aria-label="Fechar aba"
                            title="Fechar aba"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTab(tab);
                            }}
                            className={`absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-white/10 cursor-pointer ${
                              isActive ? "text-white hover:text-white" : "text-zinc-500 hover:text-red-400"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3 w-3" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {tabs.length < 3 && (
                    <button
                      type="button"
                      aria-label="Nova aba"
                      title="Nova aba"
                      onClick={handleAddTab}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-white/[0.06] hover:text-zinc-400 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-3 w-3" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna 2 e 3: Modo de visualização + Ações de cabeçalho */}
            <div className="flex shrink-0 items-center gap-2 max-lg:order-1 max-lg:w-full lg:contents">
              {/* Pills de visualização originais */}
              <div role="tablist" aria-label="Modo de visualização" data-tour="gallery" className="flex shrink-0 items-center rounded-full border border-white/[0.06] bg-[rgba(10,7,25,0.70)] p-1 max-lg:min-w-0 max-lg:flex-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeViewMode === "builder"}
                  onClick={() => setActiveViewMode("builder")}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 max-lg:min-w-0 max-lg:flex-1 max-lg:truncate max-lg:px-1 max-lg:text-[10px] max-lg:tracking-normal cursor-pointer ${
                    activeViewMode === "builder" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={activeViewMode === "builder" ? { background: "linear-gradient(135deg, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))" } : {}}
                >
                  Builder
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeViewMode === "pinterest"}
                  onClick={() => setActiveViewMode("pinterest")}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 max-lg:min-w-0 max-lg:flex-1 max-lg:truncate max-lg:px-1 max-lg:text-[10px] max-lg:tracking-normal cursor-pointer ${
                    activeViewMode === "pinterest" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={activeViewMode === "pinterest" ? { background: "linear-gradient(135deg, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))" } : {}}
                >
                  Pinterest
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeViewMode === "comunidade"}
                  onClick={() => setActiveViewMode("comunidade")}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 max-lg:min-w-0 max-lg:flex-1 max-lg:truncate max-lg:px-1 max-lg:text-[10px] max-lg:tracking-normal cursor-pointer ${
                    activeViewMode === "comunidade" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={activeViewMode === "comunidade" ? { background: "linear-gradient(135deg, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))" } : {}}
                >
                  Comunidade
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeViewMode === "galeria"}
                  onClick={() => setActiveViewMode("galeria")}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 max-lg:min-w-0 max-lg:flex-1 max-lg:truncate max-lg:px-1 max-lg:text-[10px] max-lg:tracking-normal cursor-pointer ${
                    activeViewMode === "galeria" ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={activeViewMode === "galeria" ? { background: "linear-gradient(135deg, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))" } : {}}
                >
                  Galeria
                </button>
              </div>

              {/* Botão Guia (Idêntico ao snippet oficial) */}
              <button
                type="button"
                data-tour="header-actions"
                aria-haspopup="menu"
                aria-expanded={isGuiaOpen}
                aria-label="Guia"
                onClick={() => setIsGuiaOpen(!isGuiaOpen)}
                className="flex shrink-0 items-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors hover:bg-white/[0.06] max-lg:px-2.5 h-10 px-5 uppercase tracking-wider lg:mr-4 lg:justify-self-end cursor-pointer"
                style={{ color: "#8B5CF6", border: "1px solid #8B5CF633" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-3.5 w-3.5 shrink-0" aria-hidden="true"><path d="M12 5v16"></path><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"></path></svg>
                <span className="max-lg:hidden">Guia</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3 w-3 shrink-0 transition-transform duration-200 max-lg:hidden" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>

              {/* Botão de reticências (...) Links Úteis oficial do DesignBuilder */}
              <UsefulLinksMenu />
            </div>
          </div>

          {/* ── ÁREA CENTRAL (BUILDER / PINTEREST / COMUNIDADE / GALERIA) ── */}
          <div className={`relative flex flex-1 min-h-0 flex-row overflow-hidden ${mobileActiveCategory ? "max-lg:hidden" : ""}`}>
            {activeViewMode === "builder" && (
              <>
                <div className="relative flex flex-1 min-h-0 flex-col items-center justify-center overflow-hidden">
                  <div className="flex items-center justify-center overflow-hidden h-full w-full">
                    <div className="palco-da-arte relative flex h-full min-h-0 w-full min-w-0 overflow-hidden">
                      <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center gap-3 p-4 pb-36">
                        <div className="group/viewer relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
                          <div
                            data-testid="result-viewer-surface"
                            className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden"
                            style={{ cursor: "pointer" }}
                          >
                            {/* Botão Mais ações no Canto Superior Esquerdo da Imagem (100% IDÊNTICO AO HTML OFICIAL) */}
                            <button
                              type="button"
                              aria-label="Mais ações"
                              aria-haspopup="dialog"
                              aria-expanded={isMobileActionsOpen ? "true" : "false"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMobileActionsOpen(true);
                              }}
                              className="pointer-events-auto lg:hidden absolute left-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/15 backdrop-blur-md active:scale-95 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis lucide-more-horizontal h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                            </button>
                            {isProcessing ? (
                              <GenerationLoadingCanvas
                                agentColor="#ffffff"
                                subMessage="REF Builder replicando estilo da referência com seu sujeito"
                              />
                            ) : generatedImage ? (
                            
                              <>
                                <img
                                  ref={viewerImageRef}
                                  alt={`design-builder-${(generatedImage || "").slice(-8)}`}
                                  data-testid="result-viewer"
                                  draggable={true}
                                  decoding="async"
                                  fetchPriority="high"
                                  className="block h-auto w-auto max-h-full max-w-full shrink rounded-2xl object-contain"
                                  onError={(e) => {
                                    const img = e.currentTarget;
                                    if (!img.dataset.fallbackApplied && img.src) {
                                      img.dataset.fallbackApplied = "true";
                                      if (img.src.startsWith("http")) {
                                        img.src = `/api/image-proxy?url=${encodeURIComponent(img.src)}&format=jpeg&maxDim=3840`;
                                      }
                                    }
                                  }}
                                  src={generatedImage}
                                  onLoad={updateCanvasDimensions}
                                  onClick={() => {
                                    if (!isBrushActive) setIsFullscreenViewerOpen(true);
                                  }}
                                />
                                {isBrushActive && (
                                  <canvas
                                    ref={drawingCanvasRef}
                                    onMouseDown={handleCanvasMouseDown}
                                    onMouseMove={handleCanvasMouseMove}
                                    onMouseUp={handleCanvasMouseUp}
                                    onMouseLeave={handleCanvasMouseUp}
                                    onTouchStart={handleCanvasTouchStart}
                                    onTouchMove={handleCanvasTouchMove}
                                    onTouchEnd={handleCanvasMouseUp}
                                    className="absolute inset-0 rounded-2xl pointer-events-auto"
                                    style={{
                                      cursor: brushTool === "hand" ? (isPanning ? "grabbing" : "grab") : "crosshair",
                                      width: "100%",
                                      height: "100%"
                                    }}
                                  />
                                )}
                                {isReformatting && (
                                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shadow-xl">
                                      <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs font-semibold text-white">Adaptando proporção para ${activeReformatDim}...</span>
                                      <span className="text-[10px] text-zinc-400">Reformatando o cenário e preservando todos os elementos</span>
                                    </div>
                                  </div>
                                )}
                              </>
) : (
                              <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                                <Sparkles className="h-10 w-10 text-violet-500/40 animate-pulse" />
                                <span className="text-xs font-semibold text-zinc-500">Nenhuma arte gerada ainda</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      

                      {/* Gradiente Inferior Oficial */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-48 bg-gradient-to-t from-[rgba(4,2,12,0.70)] via-[rgba(4,2,12,0.35)] to-transparent" />

                      {/* Container Absoluto Flutuante (@container) */}
                      <div className="@container absolute inset-0 pointer-events-none">
                        {/* Ações da Lateral Esquerda (Reportar, Reutilizar, Favoritar, Publicar) */}
                        <div className="acoes-da-arte absolute left-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-start max-lg:hidden pointer-events-auto" style={{ bottom: "108px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenReport?.();
                              showToast("Reportar geração aberto!", "info");
                            }}
                            title="Reportar geração (problema nesta geração)"
                            aria-label="Reportar geração"
                            className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleReuseSettings}
                            title="Reutilizar configurações"
                            className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="rotulo-da-acao ml-1.5">Reutilizar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFavorited(!isFavorited);
                              showToast(isFavorited ? "Removido dos favoritos" : "Favoritado!", "info");
                            }}
                            title="Favoritar"
                            className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                            <span className="rotulo-da-acao ml-1.5">Favoritar</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!generatedImage) {
                                showToast("Nenhuma arte gerada para publicar.", "error");
                                return;
                              }
                              try {
                                showToast("Publicando no Feed Global...", "info");
                                const res = await fetch("/api/comunidade/publicar", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    imageUrl: generatedImage,
                                    prompt: masterPromptResult || additionalDescription || "Arte criada no Ref Builder",
                                    aspectRatio: dimension,
                                    app: "ref",
                                    authorName: "Criador Zion",
                                    tag: "destaque"
                                  })
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || "Erro ao publicar");
                                showToast("Arte publicada com sucesso no Feed da Comunidade!", "success");
                                window.dispatchEvent(new CustomEvent("community:new_post", { detail: data.post }));
                                onOpenCommunity?.();
                              } catch (err: any) {
                                showToast(err.message || "Erro ao publicar arte.", "error");
                              }
                            }}
                            title="Publicar na Comunidade"
                            className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="rotulo-da-acao ml-1.5">Publicar</span>
                          </button>
                        </div>

                        {/* Ações da Lateral Direita (Formato, Exportar, Usar como base) */}
                        <div ref={rightActionsRef} className="acoes-da-arte absolute right-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-end max-lg:hidden pointer-events-auto" style={{ bottom: "108px" }}>
                          {/* Formato Popover */}
                          <div className="relative">
                            <div onClick={() => setActivePopover(activePopover === "formato" ? null : "formato")}>
                              <button
                                type="button"
                                title="Formato"
                                className={`flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${activePopover === "formato" ? "bg-black/70 text-pink-400" : "bg-black/70 text-zinc-300 hover:text-white"}`}
                              >
                                <Crop className="h-4 w-4" />
                                <span className="rotulo-da-acao ml-1.5">Formato</span>
                              </button>
                            </div>
                            {activePopover === "formato" && (
                              <div
                                className="absolute bottom-full mb-2 z-30 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 right-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium text-zinc-500">Formato</p>
                                <div className="grid grid-cols-3 gap-1 px-2 pb-1.5">
                                  {([
                                    { r: "16:9", w: 48, h: 27, t: "Widescreen" },
                                    { r: "9:16", w: 27, h: 48, t: "Story / Reels" },
                                    { r: "1:1", w: 36, h: 36, t: "Quadrado" },
                                    { r: "4:5", w: 32, h: 40, t: "Instagram" },
                                    { r: "3:4", w: 30, h: 40, t: "Retrato" },
                                    { r: "4:3", w: 40, h: 30, t: "Paisagem" }
                                  ] as const).map(({ r, w, h, t }) => (
                                    <button
                                      key={r}
                                      type="button"
                                      disabled={isReformatting}
                                      onClick={() => handleReformat(r)}
                                      className="group flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all duration-150 hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer"
                                      title={t}
                                    >
                                      {isReformatting && activeReformatDim === r ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                      ) : (
                                        <div
                                          className="rounded border border-white/[0.12] transition-all duration-150 group-hover:border-violet-500/40"
                                          style={{
                                            width: 0.6 * w,
                                            height: 0.6 * h,
                                            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))"
                                          }}
                                        />
                                      )}
                                      <span className="text-[9px] font-medium text-zinc-400">{r}</span>
                                    </button>
                                  ))}
                                </div>
                                {/* Seção Personalizado no Popover */}
                                <div className="mt-1 border-t border-white/[0.08] px-2.5 pt-2 pb-1.5">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                                      <Sliders className="h-3 w-3 text-violet-400" />
                                      Personalizado
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-500">pixels</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={128}
                                      max={4096}
                                      value={popoverCustomW}
                                      onChange={(e) => setPopoverCustomW(Math.max(1, parseInt(e.target.value) || 0))}
                                      placeholder="1200"
                                      className="w-14 h-6 rounded bg-black/40 border border-white/10 px-1 text-[10px] font-mono text-white text-center focus:outline-none focus:border-violet-500"
                                      title="Largura em pixels"
                                    />
                                    <span className="text-zinc-500 text-[10px]">×</span>
                                    <input
                                      type="number"
                                      min={128}
                                      max={4096}
                                      value={popoverCustomH}
                                      onChange={(e) => setPopoverCustomH(Math.max(1, parseInt(e.target.value) || 0))}
                                      placeholder="630"
                                      className="w-14 h-6 rounded bg-black/40 border border-white/10 px-1 text-[10px] font-mono text-white text-center focus:outline-none focus:border-violet-500"
                                      title="Altura em pixels"
                                    />
                                    <button
                                      type="button"
                                      disabled={isReformatting}
                                      onClick={() => handleReformat("custom", popoverCustomW, popoverCustomH)}
                                      className="h-6 px-2 rounded bg-violet-600 hover:bg-violet-500 text-[10px] font-medium text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                      title="Adaptar para esta medida"
                                    >
                                      {isReformatting && activeReformatDim === "custom" ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        "Adaptar"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Exportar Popover */}
                          <div className="relative">
                            <div onClick={() => setActivePopover(activePopover === "exportar" ? null : "exportar")}>
                              <button
                                type="button"
                                title="Exportar"
                                className={`flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${activePopover === "exportar" ? "bg-black/70 text-pink-400" : "bg-black/70 text-zinc-300 hover:text-white"}`}
                              >
                                <Download className="h-4 w-4" />
                                <span className="rotulo-da-acao ml-1.5">Exportar</span>
                              </button>
                            </div>
                            {activePopover === "exportar" && (
                              <div className="absolute bottom-full mb-2 z-30 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 right-0" onClick={() => setActivePopover(null)}>
                                <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium text-zinc-500">Baixar</p>
                                {[
                                  { id: "avif", label: "AVIF", desc: "Original" },
                                  { id: "png", label: "PNG", desc: "Sem perda" },
                                  { id: "jpeg", label: "JPEG", desc: "Alta qualidade" },
                                  { id: "webp", label: "WebP", desc: "Web otimizado" }
                                ].map((fmt) => (
                                  <button
                                    key={fmt.id}
                                    type="button"
                                    onClick={() => {
                                      const currentUrl = generatedImage || refGalleryItems[0]?.url;
                                      if (currentUrl) {
                                        downloadImage(currentUrl, fmt.id, undefined, undefined, undefined, quality || "4K", { title: "arte_ref", aspectRatio: dimension, targetResolution: quality || "4K" });
                                        showToast(`Exportando como ${fmt.label}...`, "info");
                                      }
                                    }}
                                    className="flex w-full items-center gap-2.5 whitespace-nowrap px-3.5 py-2 text-xs text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-zinc-200 cursor-pointer"
                                  >
                                    <Download className="h-3 w-3 text-zinc-500" />
                                    <span className="font-medium text-zinc-300">{fmt.label}</span>
                                    <span className="text-zinc-600">{fmt.desc}</span>
                                  </button>
                                ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActivePopover(null);
                                      setIsCarouselSlicerOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2.5 whitespace-nowrap px-3.5 py-2 text-xs text-violet-300 transition-all duration-150 hover:bg-violet-500/10 hover:text-white cursor-pointer border-t border-white/5"
                                  >
                                    <Scissors className="h-3 w-3 text-violet-400" />
                                    <span className="font-medium">Fatiar Carrossel</span>
                                    <span className="text-zinc-500 text-[10px] ml-auto">ZIP</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Botão Fatiar Carrossel */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!generatedImage) {
                                  showToast("Gere uma arte primeiro para fatiar em carrossel.", "info");
                                  return;
                                }
                                setIsCarouselSlicerOpen(true);
                              }}
                              title="Fatiar em Carrossel Contínuo (Instagram/LinkedIn)"
                              className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-violet-300 hover:text-white hover:bg-violet-600/30 border border-violet-500/30 cursor-pointer shadow-lg"
                            >
                              <Scissors className="h-4 w-4 text-violet-400" />
                              <span className="rotulo-da-acao ml-1.5 font-semibold">Fatiar</span>
                            </button>

                            {/* Usar como base */}
                          <button
                            type="button"
                            onClick={() => setIsUseAsBaseModalOpen(true)}
                            title="Usar esta imagem como entrada do agente"
                            className="flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-black/70 text-zinc-300 hover:text-white cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="rotulo-da-acao ml-1.5">Usar como base</span>
                          </button>
                        </div>



                          {/* Bloco Central: Publish Alert + Magic Bar */}
                          <div className="pointer-events-auto absolute bottom-8 left-1/2 z-20 flex w-[min(92vw,480px)] -translate-x-1/2 flex-col items-center gap-2.5 lg:w-[calc(100%-120px)] transition-[max-width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:max-w-[480px]">
                            {/* Toolbar Superior: text-actions-toolbar (1:1 com app.designbuilder.co) */}
                            <div data-testid="text-actions-toolbar" className="relative z-30 flex w-full items-center justify-between gap-3 px-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsBrushActive(!isBrushActive);
                                  showToast(isBrushActive ? "Modo de pincel desativado" : "Pós-produção ativada! Marque a área ou descreva a alteração.", "info");
                                }}
                                className={`magic-bar relative inline-flex min-h-9 items-center gap-2 overflow-hidden rounded-lg px-3 text-xs font-medium text-violet-100 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400${
                                  isBrushActive ? " bg-violet-600/30 text-violet-200 ring-1 ring-violet-500/40" : ""
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-type h-4 w-4" aria-hidden="true">
                                  <path d="M12 4v16"></path><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"></path><path d="M9 20h6"></path>
                                </svg>
                                Pós-produção
                              </button>
                              <div className="relative">
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setActivePopover(activePopover === "formato" ? null : "formato")}
                                    className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-4 w-4" aria-hidden="true">
                                      <path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
                                    </svg>
                                    Formato
                                  </button>
                                </div>
                                {activePopover === "formato" && (
                                  <div
                                    className="absolute bottom-full mb-2 z-40 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 right-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium text-zinc-500">Formato</p>
                                    <div className="grid grid-cols-3 gap-1 px-2 pb-1.5">
                                      {([
                                        { r: "16:9", w: 48, h: 27, t: "Widescreen" },
                                        { r: "9:16", w: 27, h: 48, t: "Story / Reels" },
                                        { r: "1:1", w: 36, h: 36, t: "Quadrado" },
                                        { r: "4:5", w: 32, h: 40, t: "Instagram" },
                                        { r: "3:4", w: 30, h: 40, t: "Retrato" },
                                        { r: "4:3", w: 40, h: 30, t: "Paisagem" }
                                      ] as const).map(({ r, w, h, t }) => (
                                        <button
                                          key={r}
                                          type="button"
                                          disabled={isReformatting}
                                          onClick={() => {
                                            handleReformat(r);
                                            setActivePopover(null);
                                          }}
                                          className={`group/btn relative flex flex-col items-center justify-center gap-1.5 rounded-lg py-2 transition-all duration-150 hover:bg-white/[0.08] cursor-pointer ${dimension === r ? "bg-white/[0.08] ring-1 ring-violet-400" : ""}`}
                                          title={t}
                                        >
                                          <div
                                            className={`rounded-sm border ${dimension === r ? "border-violet-400 bg-violet-400/20" : "border-zinc-500 group-hover/btn:border-zinc-300"}`}
                                            style={{ width: `${Math.round(w * 0.55)}px`, height: `${Math.round(h * 0.55)}px` }}
                                          />
                                          <span className={`text-[10px] font-medium leading-none ${dimension === r ? "text-violet-300" : "text-zinc-400 group-hover/btn:text-zinc-200"}`}>{r}</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {showPublishAlert && (
                              <div className="publish-alert-card relative inline-flex items-center gap-3 rounded-2xl py-2 pl-4 pr-2.5 shadow-xl shadow-black/30" style={{ "--alert-idv": "#8B5CF6", "--alert-idv-dim": "#8B5CF640" } as any}>
                                <p className="whitespace-nowrap text-[15px] font-semibold leading-snug" style={{ color: "color-mix(in srgb, rgb(139, 92, 246) 74%, rgb(0, 0, 0))" }}>
                                  Vire inspiração na comunidade. Compartilhe!
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenCommunity?.();
                                    showToast("Publicação na comunidade iniciada!", "info");
                                  }}
                                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-[14.5px] font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60 cursor-pointer"
                                  title="Publicar na Comunidade"
                                  style={{ backgroundColor: "color-mix(in srgb, rgb(139, 92, 246) 74%, rgb(0, 0, 0))" }}
                                >
                                  Publicar
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-4 w-4" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowPublishAlert(false)}
                                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white/80 ring-1 ring-white/15 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
                                  title="Fechar"
                                  aria-label="Fechar aviso de publicar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3 w-3" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                </button>
                              </div>
                            )}

                            {/* Magic Bar */}
                            <div
                              onDragEnter={(e) => {
                                e.preventDefault();
                                dragCounterRef.current++;
                                if (dragCounterRef.current === 1) setIsDragOverMagicBar(true);
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                dragCounterRef.current--;
                                if (dragCounterRef.current === 0) setIsDragOverMagicBar(false);
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                dragCounterRef.current = 0;
                                setIsDragOverMagicBar(false);
                                if (e.dataTransfer.files.length > 0) {
                                  const newAtts = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")).map(f => ({
                                    file: f,
                                    preview: URL.createObjectURL(f)
                                  }));
                                  setAttachments(prev => {
                                    const merged = [...prev, ...newAtts];
                                    const kept = merged.slice(0, 5);
                                    merged.slice(5).forEach(a => URL.revokeObjectURL(a.preview));
                                    return kept;
                                  });
                                }
                              }}
                              className={`magic-bar relative flex w-full flex-col overflow-hidden rounded-[22px] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-500 ${
                                isDragOverMagicBar ? "magic-bar-dragging" : ""
                              } ${isMagicBarFocused || magicRefineText.length > 0 || attachments.length > 0 ? "magic-bar-em-uso" : ""}`}
                            >
                              {/* Attachments & Mask Selections Previews */}
                              {attachments.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2.5 px-3.5 pt-3.5 pb-1">
                                  {attachments.map((att, idx) => (
                                    <div key={att.preview || idx} className="refine-thumb-in group relative h-14 w-14 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setFullscreenAttachment(att.preview)}
                                        className="block h-full w-full overflow-hidden rounded-xl border border-white/[0.10] shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-violet-400/60 cursor-pointer"
                                        title="Ver em tela cheia"
                                        aria-label="Ver imagem em tela cheia"
                                      >
                                        <img src={att.preview} alt="" className="h-full w-full object-cover" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(idx)}
                                        className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/90 text-white shadow-md ring-1 ring-white/10 opacity-0 transition-opacity group-hover:opacity-100 max-lg:opacity-100 cursor-pointer"
                                        title="Remover"
                                        aria-label="Remover imagem"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3 w-3" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Dropzone */}
                              <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${isDragOverMagicBar ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="px-3 pt-2 pb-1">
                                  <div className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-violet-400/50 bg-violet-500/[0.08] py-5 transition-all duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-plus h-5 w-5 text-violet-300 animate-pulse" aria-hidden="true"><path d="M16 5h6"></path><path d="M19 2v6"></path><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"></path><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path><circle cx="9" cy="9" r="2"></circle></svg>
                                    <span className="text-sm font-medium text-violet-200">Solte a imagem aqui</span>
                                  </div>
                                </div>
                              </div>

                              {/* Brush Tools Header and Controls */}
                              {isBrushActive && (
                                <>
                                  <div className="flex w-full items-center gap-3 border-t border-white/10 px-3.5 pt-2.5">
                                    <div className="flex shrink-0 items-center rounded-lg bg-white/[0.06] p-1">
                                      <button
                                        type="button"
                                        onClick={() => setBrushTool("hand")}
                                        className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${
                                          brushTool === "hand" ? "bg-violet-500 text-white" : "text-white/55 hover:text-white"
                                        }`}
                                        aria-label="Ferramenta mão"
                                        aria-pressed={brushTool === "hand" ? "true" : "false"}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hand h-4 w-4" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"></path><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setBrushTool("brush")}
                                        className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${
                                          brushTool === "brush" ? "bg-violet-500 text-white" : "text-white/55 hover:text-white"
                                        }`}
                                        aria-label="Ferramenta pincel"
                                        aria-pressed={brushTool === "brush" ? "true" : "false"}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brush h-4 w-4" aria-hidden="true"><path d="m11 10 3 3"></path><path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"></path><path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"></path></svg>
                                      </button>
                                    </div>
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-out h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="8" x2="14" y1="11" y2="11"></line></svg>
                                      <input
                                        min="1"
                                        max="4"
                                        step="0.01"
                                        className="h-1 min-w-20 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                                        aria-label="Zoom da imagem"
                                        type="range"
                                        value={zoomLevel / 100}
                                        onChange={(e) => setZoomLevel(Math.round(parseFloat(e.target.value) * 100))}
                                      />
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-in h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="11" x2="11" y1="8" y2="14"></line><line x1="8" x2="14" y1="11" y2="11"></line></svg>
                                      <span className="w-10 text-right font-mono text-[10px] text-violet-200/70">{zoomLevel}%</span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 border-l border-white/10 pl-2">
                                      <button
                                        type="button"
                                        onClick={handleUndoCanvas}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-violet-100 hover:bg-white/[0.08] cursor-pointer"
                                        aria-label="Desfazer"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo2 lucide-undo-2 h-4 w-4" aria-hidden="true"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"></path></svg>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setIsBrushActive(false)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/75 hover:bg-white/[0.08] cursor-pointer"
                                        aria-label="Sair do pincel"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Mobile Brush Size & Colors */}
                                  <div className="lg:hidden flex flex-col gap-2 px-3 pt-2 pb-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                                    <div className="flex items-center gap-1.5">
                                      {["#a855f7", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff"].map((color) => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => { setBrushColor(color); setBrushTool("brush"); }}
                                          className={`h-6 flex-1 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                                            brushColor.toLowerCase() === color.toLowerCase() ? "border-white ring-2 ring-white/40" : "border-white/15"
                                          }`}
                                          aria-label={`Cor ${color}`}
                                          aria-pressed={brushColor.toLowerCase() === color.toLowerCase() ? "true" : "false"}
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">Brush</span>
                                      <input
                                        min="6"
                                        max="200"
                                        step="2"
                                        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                                        title={`${brushSize}px`}
                                        aria-label="Tamanho do pincel"
                                        type="range"
                                        value={brushSize}
                                        onChange={(e) => { setBrushSize(parseInt(e.target.value)); setBrushTool("brush"); }}
                                      />
                                      <span className="w-9 text-right font-mono text-[11px] text-violet-200/70">{brushSize}px</span>
                                      {strokeHistory.length > 0 && (
                                        <button
                                          type="button"
                                          onClick={handleClearCanvas}
                                          className="flex h-7 w-7 items-center justify-center rounded-full text-violet-200/80 transition-colors hover:bg-red-500/20 hover:text-red-200 cursor-pointer"
                                          aria-label="Limpar máscara"
                                          title="Limpar máscara"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 h-4 w-4" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Desktop Brush Size & Colors */}
                                  <div className="hidden lg:flex items-center gap-3 px-3.5 pt-2.5 pb-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">Brush</span>
                                    <input
                                      min="6"
                                      max="200"
                                      step="2"
                                      className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                                      title={`${brushSize}px`}
                                      aria-label="Tamanho do pincel"
                                      type="range"
                                      value={brushSize}
                                      onChange={(e) => { setBrushSize(parseInt(e.target.value)); setBrushTool("brush"); }}
                                    />
                                    <span className="w-7 text-right font-mono text-[10px] text-violet-200/70">{brushSize}px</span>
                                    <div className="mx-0.5 h-3 w-px bg-white/10 max-lg:hidden"></div>
                                    <div className="flex items-center gap-1 max-lg:flex-wrap max-lg:gap-1.5">
                                      {["#a855f7", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff"].map((color) => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => { setBrushColor(color); setBrushTool("brush"); }}
                                          className={`h-4 w-4 max-lg:h-6 max-lg:w-6 shrink-0 rounded-full border transition-all hover:scale-110 cursor-pointer ${
                                            brushColor.toLowerCase() === color.toLowerCase()
                                              ? "scale-110 border-white ring-2 ring-white/30"
                                              : "border-white/20"
                                          }`}
                                          title={color}
                                          aria-label={`Cor ${color}`}
                                          aria-pressed={brushColor.toLowerCase() === color.toLowerCase() ? "true" : "false"}
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                    <div className="mx-0.5 h-3 w-px bg-white/10 max-lg:hidden"></div>
                                    {strokeHistory.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={handleClearCanvas}
                                        className="flex h-7 w-7 max-lg:h-9 max-lg:w-9 items-center justify-center rounded-full text-violet-200/80 transition-colors hover:bg-red-500/20 hover:text-red-200 cursor-pointer"
                                        title="Limpar máscara"
                                        aria-label="Limpar máscara"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 h-3.5 w-3.5 max-lg:h-4 max-lg:w-4" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                      </button>
                                    )}
                                  </div>

                                  {/* Adicionar seleção button */}
                                  <div className="px-3.5 pt-2">
                                    <button
                                      type="button"
                                      disabled={strokeHistory.length === 0}
                                      onClick={handleCommitMaskSelection}
                                      className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30 cursor-pointer"
                                      aria-label="Adicionar seleção"
                                      title="Adicionar seleção"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send h-4 w-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
                                      <span>Adicionar seleção</span>
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* Mobile tools expandable row */}
                              {isMobileMagicToolsOpen && (
                                <div className="lg:hidden flex items-center gap-2 px-3 pt-2.5 pb-1 animate-in slide-in-from-bottom-1 fade-in duration-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsBrushActive(!isBrushActive);
                                      setIsMobileMagicToolsOpen(false);
                                    }}
                                    className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                                      isBrushActive ? "bg-violet-500/90 text-white" : "bg-white/[0.06] text-violet-100 hover:bg-white/[0.10]"
                                    }`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil h-4 w-4" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                                    {isBrushActive ? "Sair do pincel" : "Pincel"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      magicFileInputRef.current?.click();
                                      setIsMobileMagicToolsOpen(false);
                                    }}
                                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.10] cursor-pointer"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip h-4 w-4" aria-hidden="true"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"></path></svg>
                                    Anexar
                                  </button>
                                </div>
                              )}

                              {/* Input Row */}
                              <div className={`flex items-end gap-2 px-3.5 max-lg:gap-1.5 max-lg:py-1.5 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                isMagicBarFocused || magicRefineText.length > 0 || attachments.length > 0 ? "py-3.5" : "py-2.5"
                              }`}>
                                <button
                                  type="button"
                                  aria-label="Ferramentas: pincel e anexar"
                                  aria-expanded={isMobileMagicToolsOpen ? "true" : "false"}
                                  onClick={() => setIsMobileMagicToolsOpen(!isMobileMagicToolsOpen)}
                                  className={`lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
                                    isMobileMagicToolsOpen || isBrushActive ? "bg-violet-500/90 text-white" : "bg-white/[0.06] text-violet-200 hover:bg-white/[0.10]"
                                  }`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis lucide-more-horizontal h-[18px] w-[18px]" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsBrushActive(!isBrushActive);
                                    showToast(isBrushActive ? "Modo de pincel desativado" : "Modo de pincel ativado! Marque a área da imagem para refinar.", "info");
                                  }}
                                  className={`flex h-9 w-9 max-lg:hidden shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 cursor-pointer ${
                                    isBrushActive
                                      ? "bg-violet-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                                      : "bg-gradient-to-br from-violet-500/[0.15] to-purple-500/[0.08] text-[rgba(196,181,253,0.85)] hover:from-violet-500/25 hover:to-purple-500/[0.15] hover:text-[#e0d4ff]"
                                  }`}
                                  title="Marcar área da imagem"
                                  aria-label="Marcar área da imagem"
                                  aria-pressed={isBrushActive ? "true" : "false"}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil h-[18px] w-[18px]" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => magicFileInputRef.current?.click()}
                                  className="flex h-9 w-9 max-lg:hidden shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/[0.15] to-purple-500/[0.08] text-[rgba(196,181,253,0.85)] transition-all duration-300 hover:from-violet-500/25 hover:to-purple-500/[0.15] hover:text-[#e0d4ff] hover:scale-105 cursor-pointer"
                                  title="Anexar imagem"
                                  aria-label="Anexar imagem"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip h-[18px] w-[18px]" aria-hidden="true"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"></path></svg>
                                </button>
                                <div className="area-do-campo flex min-w-0 flex-1 flex-col justify-end">
                                  <textarea
                                    ref={magicTextareaRef}
                                    rows={1}
                                    value={magicRefineText}
                                    onChange={(e) => setMagicRefineText(e.target.value)}
                                    onPaste={handleClipboardPaste}
                                    onFocus={() => setIsMagicBarFocused(true)}
                                    onBlur={() => setIsMagicBarFocused(false)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey && !isRefining) {
                                        e.preventDefault();
                                        handleMagicRefine();
                                      }
                                    }}
                                    disabled={isRefining}
                                    placeholder="Descreva a alteração mágica..."
                                    className="campo-de-refino w-full min-w-0 resize-none bg-transparent px-1 py-[6px] text-[15px] leading-6 text-[#f0ecff] outline-none scrollbar-hide disabled:opacity-50"
                                    style={{ height: "36px" }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  disabled={isBrushActive ? !(strokeHistory.length > 0 && magicRefineText.trim() && !isRefining) : !(((magicRefineText.trim().length > 0) || attachments.length > 0) && !isRefining)}
                                  onClick={handleMagicRefine}
                                  className={`flex h-9 w-9 max-lg:h-8 max-lg:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                                    (magicRefineText.trim().length > 0 || attachments.length > 0)
                                      ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white refine-send-active"
                                      : "bg-white/[0.06] text-zinc-600 cursor-not-allowed"
                                  }`}
                                  title="Enviar refinamento"
                                  aria-label="Enviar refinamento"
                                >
                                  {isRefining ? (
                                    <span className="h-[18px] w-[18px] rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send h-[18px] w-[18px]" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
                                  )}
                                </button>
                              </div>
                              <input
                                ref={magicFileInputRef}
                                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
                                multiple
                                className="hidden"
                                type="file"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    const newAtts = Array.from(files).filter(f => f.type.startsWith("image/")).map((f) => ({
                                      file: f,
                                      preview: URL.createObjectURL(f)
                                    }));
                                    setAttachments((prev) => [...prev, ...newAtts].slice(0, 5));
                                  }
                                  e.target.value = "";
                                }}
                              />
                            </div>
                          </div>

                      </div>
                    </div>
                  </div>
                </div>

                </>
            )}

            {/* Modo Pinterest Integrado Oficial */}
            {activeViewMode === "pinterest" && (
              <div
                data-inspirations-panel="true"
                className="flex-1 min-h-0 overflow-hidden flex flex-col"
                style={{ backgroundColor: "rgb(0, 0, 0)" }}
              >
                <div className="flex h-full w-full flex-col">
                  <div className="sticky top-0 z-10 border-b border-white/[0.04] bg-black/60 backdrop-blur-xl px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
                    <form
                      role="search"
                      onSubmit={(e) => e.preventDefault()}
                      className="relative w-full mx-auto max-w-2xl"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                      <input
                        placeholder="Buscar inspirações no Pinterest..."
                        className="w-full border border-white/10 bg-zinc-900/80 py-2.5 pr-10 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-violet-500/20 [&::-webkit-search-cancel-button]:hidden rounded-full pl-10 focus:ring-2"
                        type="search"
                        value={pinterestSearch}
                        onChange={(e) => setPinterestSearch(e.target.value)}
                      />
                      {pinterestSearch && (
                        <button
                          type="button"
                          aria-label="Limpar busca"
                          onClick={() => setPinterestSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>
                      )}
                    </form>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div data-media-masonry="true" className="flex w-full p-3 pb-12" style={{ gap: "8px" }}>
                      {[0, 1, 2, 3].map((colIdx) => {
                        const filteredCards = REF_PINTEREST_CARDS.filter((card) => {
                          if (!pinterestSearch.trim()) return true;
                          const q = pinterestSearch.toLowerCase();
                          return card.title.toLowerCase().includes(q) || card.tags.some(t => t.toLowerCase().includes(q));
                        });
                        const colCards = filteredCards.filter((_, idx) => idx % 4 === colIdx);
                        return (
                          <div
                            key={colIdx}
                            data-media-column={colIdx}
                            className={`min-w-0 flex-1 flex-col ${colIdx === 2 ? "max-md:hidden flex" : colIdx === 3 ? "max-lg:hidden flex" : "flex"}`}
                            style={{ gap: "8px" }}
                          >
                            {colCards.map((card, itemIdx) => {
                              const globalIdx = itemIdx * 4 + colIdx;
                              return (
                                <div key={card.id} data-media-index={globalIdx} className="w-full">
                                  <div
                                    draggable="true"
                                    role="button"
                                    tabIndex={0}
                                    className="group relative w-full overflow-hidden rounded-xl bg-zinc-900 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)] [content-visibility:auto] [contain-intrinsic-size:auto_300px]"
                                  >
                                    <div
                                      data-media-card="true"
                                      data-media-loaded="true"
                                      className="relative w-full overflow-hidden bg-zinc-900 [aspect-ratio:var(--media-card-aspect)]"
                                      style={{ "--media-card-aspect": card.aspectRatio } as any}
                                    >
                                      <img
                                        alt={card.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="absolute inset-0 block h-full w-full transition-opacity duration-300 object-cover opacity-100"
                                        src={card.src}
                                      />
                                      <button
                                        type="button"
                                        aria-label="Ver detalhes e ações"
                                        className="lg:hidden absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/15 backdrop-blur-md active:scale-95"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                      </button>
                                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-violet-950/70 via-violet-950/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRefPhotoBase64(card.src);
                                            setActiveViewMode("builder");
                                            showToast("Referência selecionada com sucesso!", "success");
                                          }}
                                          className="pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-br from-violet-500/45 via-violet-600/35 to-fuchsia-500/30 ring-1 ring-white/30 shadow-xl shadow-violet-900/50 backdrop-blur-md cursor-pointer hover:scale-105 transition-transform"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-4 w-4" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                          Selecionar
                                        </button>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            title="Ver maior"
                                            aria-label="Ver maior"
                                            onClick={() => setLightboxImage(card.src)}
                                            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-white bg-black/55 ring-1 ring-white/20 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:bg-violet-500/35 hover:ring-violet-300/50 cursor-pointer"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                                          </button>
                                          <button
                                            type="button"
                                            title="Salvar em Meus arquivos"
                                            aria-label="Salvar em Meus arquivos"
                                            onClick={() => {
                                              setFolders(prev => prev.map((f, i) => i === 0 ? { ...f, count: f.count + 1, items: [...f.items, card.src] } : f));
                                              showToast("Referência salva em Meus arquivos!", "success");
                                            }}
                                            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-white bg-black/55 ring-1 ring-white/20 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:bg-violet-500/35 hover:ring-violet-300/50 cursor-pointer"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-plus h-3.5 w-3.5" aria-hidden="true"><path d="M12 10v6"></path><path d="M9 13h6"></path><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>
                                          </button>
                                          <a
                                            href={card.pinterestUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Abrir no Pinterest"
                                            aria-label="Abrir no Pinterest"
                                            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full text-white bg-black/55 ring-1 ring-white/20 shadow-lg shadow-black/40 backdrop-blur-md transition-colors hover:bg-violet-500/35 hover:ring-violet-300/50 cursor-pointer"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                          </a>
                                        </div>
                                      </div>
                                      {card.tags && card.tags.length > 0 && (
                                        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end pointer-events-none px-2 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                                            {card.tags.map((tag, tIdx) => (
                                              <span key={tIdx} className="max-w-[110px] truncate rounded-full bg-white/12 px-2 py-0.5 text-[9px] font-medium text-white shadow-sm ring-1 ring-white/15 backdrop-blur-md">
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modo Comunidade (1:1 com Screenshot 399) */}
            {activeViewMode === "comunidade" && (
              <div className="flex-1 min-h-0 overflow-y-auto bg-black flex flex-col custom-scrollbar">
                <div className="sticky top-0 z-20 border-b border-white/[0.04] bg-black/75 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRefComunidadeTab("esse_app")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        refComunidadeTab === "esse_app"
                          ? "bg-[#7c3aed] text-white shadow-lg shadow-purple-600/30"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                      }`}
                    >
                      Esse App
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefComunidadeTab("todos")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        refComunidadeTab === "todos"
                          ? "bg-[#7c3aed] text-white shadow-lg shadow-purple-600/30"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">
                    {COMMUNITY_CARDS.length} criações da comunidade
                  </span>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {COMMUNITY_CARDS.map((card) => (
                      <div
                        key={card.id}
                        className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                      >
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                          <img
                            src={card.src}
                            alt={card.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                            <p className="text-xs font-bold text-white truncate">{card.title}</p>
                            <div className="flex items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  updateActiveTab({ refPhotoBase64: card.src, useRefOnBuild: true });
                                  setActiveViewMode("builder");
                                  showToast("Inspiração aplicada no REF com sucesso!", "success");
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-md cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3" />
                                Selecionar
                              </button>
                              <button
                                type="button"
                                onClick={() => setLightboxImage(card.src)}
                                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Ver maior"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modo Galeria (1:1 com Screenshot 400) */}
            {activeViewMode === "galeria" && (
              <div className="flex-1 min-h-0 overflow-y-auto bg-black flex flex-col custom-scrollbar">
                <div className="sticky top-0 z-20 border-b border-white/[0.04] bg-black/75 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRefGalleryTab("todos")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        refGalleryTab === "todos"
                          ? "bg-[#7c3aed] text-white shadow-lg shadow-purple-600/30"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefGalleryTab("favs")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        refGalleryTab === "favs"
                          ? "bg-[#7c3aed] text-white shadow-lg shadow-purple-600/30"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                      }`}
                    >
                      Favs
                    </button>
                    <button
                      type="button"
                      title="Recarregar imagens"
                      onClick={recarregarGaleriaRef}
                      className="h-8 w-8 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-xs text-zinc-500 font-medium">
                    {refGalleryItems.filter(c => refGalleryTab === "todos" || c.isFavorited).length} gerações salvas
                  </span>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortImagesChronological(
                      refGalleryItems.filter((card) => refGalleryTab === "todos" || card.isFavorited),
                      true
                    ).map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setGeneratedImage(card.url);
                            setActiveViewMode("builder");
                          }}
                          className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] cursor-pointer"
                        >
                          <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                            <img
                              src={card.url}
                              alt="Arte gerada"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Badge Ciano/Roxo no Top-Left (Screenshot 400) */}
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-md ${
                                  card.type === "refino"
                                    ? "bg-teal-600/90 text-teal-50 border border-teal-400/30"
                                    : "bg-[#7c3aed]/90 text-purple-50 border border-purple-400/30"
                                }`}
                              >
                                {card.type === "refino" ? "Refino" : "Geração"}
                              </span>
                            </div>

                            {/* Overlay com Ações no Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                              <div className="flex items-center justify-between gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGeneratedImage(card.url);
                                    setActiveViewMode("builder");
                                    showToast("Arte carregada no Builder!", "success");
                                  }}
                                  className="flex-1 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-lg cursor-pointer"
                                >
                                  Abrir no Builder
                                </button>

                                <button
                                  type="button"
                                  title="Detalhes"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGeneratedImage(card.url);
                                    setIsDetailsDrawerOpen(true);
                                  }}
                                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRefGalleryItems((prev) =>
                                      prev.map((c) => (c.id === card.id ? { ...c, isFavorited: !c.isFavorited } : c))
                                    );
                                  }}
                                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                    card.isFavorited ? "text-red-500 bg-red-500/20" : "text-zinc-300 hover:text-white bg-zinc-800"
                                  }`}
                                >
                                  <Heart className={`h-3.5 w-3.5 ${card.isFavorited ? "fill-current" : ""}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
            {/* Coluna de Histórico Oficial (72px) - Visível em todas as abas do Palco */}
            {/* Coluna de Histórico Oficial (72px) - Sempre Visível no Palco */}
                <div data-tour="history" className={`coluna-de-historico z-50 shrink-0 flex-col transition-all duration-300 ${isMobileHistoryOpen ? "fixed inset-y-0 right-0 z-50 flex shadow-2xl bg-black border-l border-white/10 w-44" : "relative z-10 hidden h-full lg:flex"}`} style={{ width: isMobileHistoryOpen ? "176px" : "72px", "--largura-do-historico": isMobileHistoryOpen ? "176px" : "72px" } as any}>
                  <div className="historico-lateral relative flex h-full flex-col border-l border-white/[0.04] w-full" style={{ backgroundColor: "rgb(0, 0, 0)", width: "100%" }}>
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
                    <div className="absolute left-0 top-0 z-20 h-full w-1.5 -translate-x-1/2 cursor-col-resize transition-colors hover:bg-violet-500/30 hidden lg:block" title="Arraste para redimensionar" />
                    <div className="flex-1 space-y-1.5 overflow-y-auto px-1.5 py-2 scrollbar-hide">
                      {allRefHistory.map((item, idx) => (
                        <div key={item.id || idx} data-media-window="mounted" className="w-full [content-visibility:auto] [contain-intrinsic-size:auto_400px]">
                          <div
                            className={`group relative w-full overflow-hidden rounded-lg border transition-all duration-200 ${
                              generatedImage === item.url
                                ? "border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                                : "border-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_6px_rgba(139,92,246,0.08)]"
                            }`}
                            style={generatedImage === item.url ? { borderColor: "rgba(139, 92, 246, 0.5)", boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 8px" } : {}}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setGeneratedImage(item.url);
                                setIsMobileHistoryOpen(false);
                                setMobileView("palco");
                              }}
                              className="block w-full cursor-pointer"
                              title={`Geração ${(item.id || "").slice(0, 6)} — clique para visualizar`}
                            >
                              <img
                              alt=""
                              className="block w-full bg-black object-cover cursor-grab active:cursor-grabbing"
                              loading="lazy"
                              decoding="async"
                              draggable="true"
                              src={item.url}
                              style={{
                                aspectRatio: (item as any).aspect || "4 / 5"
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
                              className={`pointer-events-none absolute left-1 top-1 z-10 flex items-center rounded border px-1 py-0.5 text-[8px] font-semibold leading-none shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${
                                item.type === "refino"
                                  ? "border-amber-400/30 bg-amber-950/85 text-amber-200"
                                  : "border-violet-400/30 bg-violet-950/85 text-violet-200"
                              }`}
                              title={item.type === "refino" ? "Formato" : "Geração"}
                              aria-label={item.type === "refino" ? "Formato" : "Geração"}
                            >
                              <span>{item.type === "refino" ? "Formato" : "Geração"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                              className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-zinc-300 ring-1 ring-white/10 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-300 focus-visible:opacity-100 cursor-pointer"
                              title="Remover geração"
                              aria-label="Remover geração"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

          </div>
        </section>
      </div>

      {/* ── MODAL AJUSTAR FOTOS E CENA (PASTAS EM PILHA) ── */}
      {isFolderModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFolderModalOpen(false)}
        >
          <div
            className="relative max-h-[85vh] h-[650px] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0a15] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0 bg-zinc-950">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <h2 className="text-sm font-bold text-white">Pastas e Imagens do Cliente</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              <ProjetosWorkspace
                compacto={true}
                aoEscolher={(asset) => {
                  handleSelectAssetFromWorkspace(asset.url, asset.name);
                  setIsFolderModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL GUIA DE USO REF BUILDER ── */}
      {isGuiaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsGuiaOpen(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0a15] p-6 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600/20 text-violet-300 border border-violet-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
                </span>
                <h2 className="text-base font-bold text-white">Guia do REF Builder</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGuiaOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <h4 className="font-semibold text-white mb-1">1. Imagem Principal</h4>
                <p className="text-zinc-400">Envie a foto do seu sujeito ou produto. Você pode adicionar múltiplas fotos para enriquecer o contexto da pose e do rosto.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <h4 className="font-semibold text-white mb-1">2. Referências de Estilo</h4>
                <p className="text-zinc-400">Adicione uma referência visual (iluminação, cores ou background). Use o campo de texto para especificar o que quer extrair da ref.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <h4 className="font-semibold text-white mb-1">3. Modo Gerar Prompt vs Construir</h4>
                <p className="text-zinc-400">
                  - <strong>Gerar Prompt Ativado:</strong> Gera o prompt mestre fotográfico completo com IA (0 créditos).
                  <br />
                  - <strong>Gerar Prompt Desativado:</strong> Constrói a arte e gera a imagem diretamente no próprio site (1 crédito).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <h4 className="font-semibold text-white mb-1">4. Proporção e Resolução</h4>
                <p className="text-zinc-400">Escolha o formato da peça (Stories 9:16, Feed Vertical 4:5, Feed 1:1, Cinema 16:9) e qualidade até 4K MÁXIMA (4096×4096).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EXPANDIDO DE DESCRIÇÃO ADICIONAL ── */}
      {isExpandedTextarea && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsExpandedTextarea(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0a15] p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Editor de Instruções Adicionais</h3>
              <button
                type="button"
                onClick={() => setIsExpandedTextarea(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <textarea
              rows={8}
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              placeholder="Instruções completas para a IA..."
              className="w-full rounded-xl bg-zinc-950 p-4 text-sm text-white resize-none border border-white/10 focus:border-violet-500 focus:outline-none leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsExpandedTextarea(false)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox para ampliação de imagens */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-zinc-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
            <img src={lightboxImage} alt="Visualização de imagem" className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Modal de Recorte de Imagem (100% fiel ao HTML oficial) */}
      <ImageCropModal
        isOpen={cropModalState.isOpen}
        imageUrl={cropModalState.imageUrl}
        onClose={() => setCropModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmCrop}
      />

      {/* Modal do Fatiador de Carrossel Contínuo (Seamless) */}
      <CarouselSlicerModal
        isOpen={isCarouselSlicerOpen}
        onClose={() => setIsCarouselSlicerOpen(false)}
        imageUrl={generatedImage}
        projectName={store.activeProjectId || "carrossel-zion"}
      />

      {/* ── MODAL: ONDE USAR ESTA IMAGEM (USAR COMO BASE - 100% FIEL AO ORIGINAL) ── */}
      {isUseAsBaseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsUseAsBaseModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span>Usar como base</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUseAsBaseModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-white/10">
                <img
                  src={generatedImage || mainPhotoBase64 || "/2_files/1be0117204b1db82fe23dc4281411978.jpg"}
                  alt="Prévia"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Onde você deseja usar esta imagem?</p>
                <p className="mt-0.5 text-xs text-zinc-400">Selecione como quer incorporar esta arte no Ref Builder.</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  const targetImg = generatedImage || mainPhotoBase64 || "/2_files/1be0117204b1db82fe23dc4281411978.jpg";
                  setMainPhotoBase64(targetImg);
                  setIsUseAsBaseModalOpen(false);
                  showToast("Imagem definida como Sujeito Principal!", "success");
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-violet-500/40 hover:bg-violet-600/10 hover:shadow-lg cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300 group-hover:scale-105 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white">Sujeito Principal</div>
                  <div className="text-[11px] text-zinc-400">Substitui a imagem do sujeito principal no formulário</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetImg = generatedImage || mainPhotoBase64 || "/2_files/1be0117204b1db82fe23dc4281411978.jpg";
                  setReferenceImages([
                    ...referenceImages,
                    { id: Math.random().toString(36).substring(2, 9), url: targetImg, desc: "" }
                  ]);
                  setIsUseAsBaseModalOpen(false);
                  showToast("Imagem adicionada às Referências de Estilo!", "success");
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-violet-500/40 hover:bg-violet-600/10 hover:shadow-lg cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white">Referência de Estilo</div>
                  <div className="text-[11px] text-zinc-400">Extrai iluminação, composição e estilo visual</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetImg = generatedImage || mainPhotoBase64 || "/2_files/1be0117204b1db82fe23dc4281411978.jpg";
                  setAssetImages([
                    ...assetImages,
                    { id: Math.random().toString(36).substring(2, 9), url: targetImg, desc: "" }
                  ]);
                  setIsMoreOptionsOpen(true);
                  setIsUseAsBaseModalOpen(false);
                  showToast("Imagem adicionada aos Assets!", "success");
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-all hover:border-violet-500/40 hover:bg-violet-600/10 hover:shadow-lg cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300 group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white">Assets (Elemento)</div>
                  <div className="text-[11px] text-zinc-400">Adiciona aos assets opcionais para compor a cena</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ── MODAL DETALHES E EXPORTAÇÃO AVIF/PNG/JPEG/WEBP ── */}
      {/* ── DRAWER LATERAL DIREITO DE DETALHES (1:1 COM SCREENSHOT 401) ── */}
      {isDetailsDrawerOpen && generatedImage && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsDetailsDrawerOpen(false)}
        >
          <div
            className="relative h-full w-80 max-w-[90vw] bg-[#0c0a15]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col p-4 animate-in slide-in-from-right duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-semibold text-white">Detalhes</h3>
              <button
                type="button"
                onClick={() => setIsDetailsDrawerOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar">
              {/* Botão 1: Reutilizar configurações (Roxo) */}
              <button
                type="button"
                onClick={() => {
                  const cardItem = refGalleryItems.find(c => c.url === generatedImage);
                  handleReuseSettings(cardItem?.settings);
                  setIsDetailsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reutilizar configurações</span>
              </button>

              {/* Botão 2: Usar como inspiração (Escuro) */}
              <button
                type="button"
                onClick={() => {
                  updateActiveTab({ refPhotoBase64: generatedImage, useRefOnBuild: true });
                  setIsDetailsDrawerOpen(false);
                  showToast("Arte definida como Inspiração de Estilo!", "success");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/5 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                <span>Usar como inspiração</span>
              </button>

              {/* Seção REFORMATAR */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  REFORMATAR
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {(["16:9", "9:16", "1:1", "3:4", "4:3"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      disabled={isReformatting}
                      onClick={() => {
                        const targetDim = ratio === "3:4" ? "4:5" : (ratio as any);
                        handleReformat(targetDim);
                      }}
                      className="py-1.5 px-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-medium text-center border border-white/5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isReformatting && activeReformatDim === (ratio === "3:4" ? "4:5" : ratio) ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-zinc-400" />
                      ) : (
                        ratio
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={isReformatting}
                    onClick={() => handleReformat("custom", customWidth, customHeight)}
                    className="py-1.5 px-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-violet-300 text-xs font-medium text-center border border-violet-500/20 transition-colors cursor-pointer disabled:opacity-50"
                    title={`Personalizado (${customWidth}×${customHeight})`}
                  >
                    {isReformatting && activeReformatDim === "custom" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-violet-400" />
                    ) : (
                      "Livre"
                    )}
                  </button>
                </div>
                {isReformatting && (
                  <p className="text-[9px] text-violet-400 mt-1 w-full text-center animate-pulse">Adaptando proporção...</p>
                )}
              </div>

              {/* Botão Publicar na Comunidade */}
              <button
                type="button"
                onClick={() => {
                  onOpenCommunity?.();
                  setIsDetailsDrawerOpen(false);
                  showToast("Publicação na Comunidade aberta!", "info");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/5 transition-all cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-zinc-400" />
                <span>Publicar na Comunidade</span>
              </button>

              {/* Seção EXPORTAR */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  EXPORTAR
                </span>
                <div className="space-y-2">
                  {[
                    { format: "avif", label: "AVIF", sub: "Original" },
                    { format: "png", label: "PNG", sub: "Sem perda" },
                    { format: "jpeg", label: "JPEG", sub: "Alta qualidade" },
                    { format: "webp", label: "WebP", sub: "Web" }
                  ].map((exp) => (
                    <div
                      key={exp.format}
                      onClick={() => handleDownloadFormat(exp.format as any)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 transition-all cursor-pointer group"
                    >
                      <Download className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white">{exp.label}</span>
                        <span className="text-[10px] text-zinc-500">{exp.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizador de Imagem em Tela Cheia (role="dialog") */}
      {isFullscreenViewerOpen && generatedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar imagem em tela cheia"
          className="fixed inset-0 flex bg-black overflow-hidden transition-opacity duration-150 z-[2147483647]"
        >
          <div className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden">
            <div className="flex h-full w-full items-center justify-center cursor-grab">
              <img
                alt="Visualizacao em tela cheia"
                draggable="true"
                src={generatedImage}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: `scale(${zoomLevel / 100}) translate(0px, 0px)`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s",
                  userSelect: "none"
                }}
              />
            </div>
          </div>
          <aside className="flex h-full w-64 shrink-0 flex-col gap-2 border-l border-white/5 bg-zinc-950 overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <span className="text-xs font-semibold text-zinc-300">Detalhes</span>
              <button
                type="button"
                onClick={() => setIsFullscreenViewerOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar visualizador"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3" />
            <div className="mx-4 border-t border-white/5" />
            <div className="px-4 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">Exportar</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { format: "avif", label: "AVIF", sub: "Original" },
                  { format: "png", label: "PNG", sub: "Sem perda" },
                  { format: "jpeg", label: "JPEG", sub: "Alta qualidade" },
                  { format: "webp", label: "WebP", sub: "Web" }
                ].map((exp) => (
                  <button
                    key={exp.format}
                    type="button"
                    onClick={() => handleDownloadFormat(exp.format as any)}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 text-left transition-all hover:border-violet-500/40 hover:bg-violet-500/5 cursor-pointer"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5">
                      <Download className="h-3 w-3 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-white">{exp.label}</p>
                      <p className="text-[9px] text-zinc-600">{exp.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 text-center text-[10px] font-medium text-zinc-400 tabular-nums">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="flex h-7 items-center justify-center gap-1 rounded-lg border border-white/5 bg-zinc-900 px-2 text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Dropdown Menu Guia (role="menu") */}
      {isGuiaOpen && (
        <div
          role="menu"
          className="fixed z-[10060] flex flex-col gap-0.5 rounded-2xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/60"
          style={{ width: "216px", top: "60px", right: "24px" }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsGuiaOpen(false);
              showToast("Iniciando Guia guiado...", "info");
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-4 w-4 shrink-0" aria-hidden="true" style={{ color: "rgb(139, 92, 246)" }}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
            Guia guiado
          </button>
          <button
            type="button"
            role="menuitem"
            data-tour="demo"
            onClick={() => {
              setIsGuiaOpen(false);
              showToast("Carregando vídeo de demonstração...", "info");
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play h-4 w-4 shrink-0" aria-hidden="true" style={{ color: "rgb(139, 92, 246)" }}><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
            Ver demonstração
          </button>
        </div>
      )}

      {/* ── MODAL: PROMPT MESTRE GERADO (0 CRÉDITOS) ── */}
      {isPromptModalOpen && (masterPromptResult || additionalDescription) && (
        <div className="fixed inset-0 z-[10070] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-2xl w-full flex flex-col rounded-3xl overflow-hidden bg-[#0c0817] border border-fuchsia-500/30 shadow-2xl shadow-fuchsia-950/50 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600/30 to-violet-600/30 border border-fuchsia-500/40 text-fuchsia-300">
                  <FileText className="h-6 w-6 text-fuchsia-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Prompt Mestre Fotográfico</h3>
                    <span className="rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-0.5 text-[10px] font-bold text-fuchsia-300 uppercase tracking-wider">
                      0 Créditos
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Sintetizado com IA de alta fidelidade com engenharia reversa das referências.
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
            <div className="relative mb-3 rounded-2xl bg-black/70 border border-violet-500/20 p-4 max-h-[300px] overflow-y-auto scrollbar-thin">
              <pre className="text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed select-text">
                {masterPromptResult || additionalDescription}
              </pre>
            </div>

            {/* Dica Prática de Uso em Plataformas Externas */}
            <div className="mb-4 rounded-xl bg-violet-950/30 border border-violet-500/20 p-3 text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5 font-bold text-violet-300 mb-1">
                <span>💡 Como usar na sua IA (Midjourney, Flow, Fooocus, Leonardo):</span>
              </div>
              <ul className="space-y-1 text-[11px] text-zinc-300/90 list-disc list-inside">
                <li><strong className="text-white">Apenas com o Texto:</strong> Cole apenas o prompt acima. Ele já recria a iluminação de estúdio, enquadramento e figurino da referência.</li>
                <li><strong className="text-white">Para manter o rosto da pessoa:</strong> Use a foto da pessoa no slot de <code className="bg-white/10 px-1 py-0.5 rounded text-fuchsia-300">FaceSwap</code> (ou <code className="bg-white/10 px-1 py-0.5 rounded text-fuchsia-300">--cref</code> no Midjourney) e a foto de referência no slot de <code className="bg-white/10 px-1 py-0.5 rounded text-fuchsia-300">Estilo / --sref</code>. <em>Nunca misture as duas como imagem comum!</em></li>
              </ul>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-400">
                Compatível com <strong>Midjourney, Flux, Fooocus, Flow, ComfyUI</strong>.
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

      

      {/* Modal Bottom Sheet "Ações" Mobile (1:1 com app.designbuilder.co) */}
      {isMobileActionsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileActionsOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-zinc-950 pb-safe shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Sticky com barra de puxar e botão Fechar */}
            <div className="sticky top-0 z-10 flex touch-none items-center justify-between bg-zinc-950/95 px-5 pb-2 pt-3 backdrop-blur">
              <div className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15" />
              <span className="text-sm font-semibold text-white">Ações</span>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setIsMobileActionsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-5 w-5" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-1 px-4 pb-6 pt-2">
              {/* Reutilizar configurações */}
              <button
                type="button"
                onClick={() => {
                  showToast("Configurações reutilizadas!", "info");
                  setIsMobileActionsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-[18px] w-[18px] text-zinc-400" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span className="flex-1">Reutilizar configurações</span>
              </button>

              {/* Usar como base */}
              <button
                type="button"
                onClick={() => {
                  if (generatedImage) {
                    setSubjectImages([{ id: Math.random().toString(36).substring(2, 9), url: generatedImage, desc: "" }]);
                    showToast("Arte definida como imagem de base!", "success");
                  }
                  setIsMobileActionsOpen(false);
                }}
                disabled={!generatedImage}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles lucide-stars h-[18px] w-[18px] text-zinc-400" aria-hidden="true">
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                  <path d="M20 2v4" />
                  <path d="M22 4h-4" />
                  <circle cx="4" cy="20" r="2" />
                </svg>
                <span className="flex-1">Usar como base</span>
              </button>

              {/* Favoritar */}
              <button
                type="button"
                onClick={() => {
                  setIsFavorited(!isFavorited);
                  showToast(isFavorited ? "Removido dos favoritos" : "Favoritado!", "info");
                  setIsMobileActionsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorited ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-heart h-[18px] w-[18px] ${isFavorited ? "text-red-500 fill-red-500" : "text-zinc-400"}`} aria-hidden="true">
                  <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                </svg>
                <span className="flex-1">Favoritar</span>
              </button>

              {/* Publicar na Comunidade */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenCommunity) onOpenCommunity();
                  else showToast("Publicar na Comunidade aberto!", "info");
                  setIsMobileActionsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe h-[18px] w-[18px] text-zinc-400" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <span className="flex-1">Publicar na Comunidade</span>
              </button>

              {/* Formato */}
              <div className="pt-3">
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Formato</p>
                <div className="grid grid-cols-3 gap-1.5 px-1">
                  {[
                    { id: "16:9", title: "Widescreen" },
                    { id: "9:16", title: "Story / Reels" },
                    { id: "1:1", title: "Quadrado" },
                    { id: "4:5", title: "Instagram" },
                    { id: "3:4", title: "Retrato" },
                    { id: "4:3", title: "Paisagem" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      title={fmt.title}
                      onClick={() => {
                        setDimension(fmt.id as any);
                        setIsMobileActionsOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer ${
                        dimension === fmt.id ? "bg-white/10 ring-1 ring-white/20" : ""
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-4 w-4 text-zinc-400" aria-hidden="true">
                        <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                        <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                      </svg>
                      <span className="text-[11px] font-medium text-zinc-300">{fmt.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exportar */}
              <div className="pt-3">
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Exportar</p>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {[
                    { format: "AVIF", ext: "AVIF", label: "AVIF", sub: "Original" },
                    { format: "PNG", ext: "PNG", label: "PNG", sub: "Sem perda" },
                    { format: "JPG", ext: "JPEG", label: "JPEG", sub: "Alta qualidade" },
                    { format: "WEBP", ext: "WebP", label: "WebP", sub: "Web otimizado" },
                  ].map((exp) => (
                    <button
                      key={exp.format}
                      type="button"
                      onClick={() => {
                        if (generatedImage) {
                          downloadImage(generatedImage, exp.format as any, undefined, undefined, undefined, quality || "4K", {
                            title: "arte_ref",
                            aspectRatio: dimension,
                            targetResolution: quality || "4K"
                          });
                          showToast(`Download ${exp.label} iniciado!`, "success");
                        }
                        setIsMobileActionsOpen(false);
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.06] cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true">
                        <path d="M12 15V3" />
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                      <span className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-zinc-200">{exp.label}</span>
                        <span className="text-[10px] text-zinc-500">{exp.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-violet-500/30 bg-black/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span>{toastMsg.msg}</span>
        </div>
      )}
      {/* Barra de controle inferior mobile removida pois já existe no header superior e estava sobrepondo o botão Construir */}
    </main>

      {/* ── BARRA INFERIOR MOBILE OFICIAL: SIBLING DO MAIN (100% IDÊNTICO AO APP.DESIGNBUILDER.CO) ── */}
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
          className="flex items-stretch gap-0.5 overflow-x-auto scrollbar-hide px-2 py-1.5 [scroll-snap-type:x_proximity] justify-center"
        >
          {/* Início */}
          <button
            type="button"
            aria-label="Sair para o início"
            onClick={() => {
              setMobileActiveCategory(null);
              if (onOpenVitrine) onOpenVitrine();
              else if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("db:go_home"));
            }}
            className="group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 text-zinc-300 cursor-pointer"
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors bg-white/[0.05] ring-1 ring-white/15 group-hover:bg-white/[0.10]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house lucide-home h-[22px] w-[22px]" aria-hidden="true">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
            </span>
            <span className="whitespace-nowrap text-[10px] leading-none font-semibold">
              Início
            </span>
          </button>

          <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

          {/* Foto */}
          <button
            type="button"
            role="tab"
            aria-selected={mobileActiveCategory === "foto"}
            aria-current={mobileActiveCategory === "foto" ? "true" : undefined}
            onClick={() => handleSelectMobileCategory("foto")}
            className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
              mobileActiveCategory === "foto" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                mobileActiveCategory === "foto" ? "" : "group-hover:bg-white/[0.06]"
              }`}
              style={mobileActiveCategory === "foto" ? { backgroundColor: "rgba(139, 92, 246, 0.15)" } : undefined}
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
                  style={mobileActiveCategory === "foto" ? { color: "rgb(139, 92, 246)" } : undefined}
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
                {mobileActiveCategory !== "foto" && (
                  <span aria-hidden="true" className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                )}
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">
              Foto
            </span>
          </button>

          {/* Estilo */}
          <button
            type="button"
            role="tab"
            aria-selected={mobileActiveCategory === "estilo"}
            aria-current={mobileActiveCategory === "estilo" ? "true" : undefined}
            onClick={() => handleSelectMobileCategory("estilo")}
            className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
              mobileActiveCategory === "estilo" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                mobileActiveCategory === "estilo" ? "" : "group-hover:bg-white/[0.06]"
              }`}
              style={mobileActiveCategory === "estilo" ? { backgroundColor: "rgba(139, 92, 246, 0.15)" } : undefined}
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
                  className="lucide lucide-sparkles lucide-stars h-[22px] w-[22px]"
                  aria-hidden="true"
                  style={mobileActiveCategory === "estilo" ? { color: "rgb(139, 92, 246)" } : undefined}
                >
                  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                  <path d="M20 2v4"></path>
                  <path d="M22 4h-4"></path>
                  <circle cx="4" cy="20" r="2"></circle>
                </svg>
                {mobileActiveCategory !== "estilo" && (
                  <span aria-hidden="true" className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                )}
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">
              Estilo
            </span>
          </button>

          {/* Saída */}
          <button
            type="button"
            role="tab"
            aria-selected={mobileActiveCategory === "saida"}
            aria-current={mobileActiveCategory === "saida" ? "true" : undefined}
            onClick={() => handleSelectMobileCategory("saida")}
            className={`group flex min-h-[56px] shrink-0 snap-start flex-col items-center justify-center gap-1 px-2.5 py-1 transition-transform duration-100 ease-out active:scale-95 cursor-pointer ${
              mobileActiveCategory === "saida" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                mobileActiveCategory === "saida" ? "" : "group-hover:bg-white/[0.06]"
              }`}
              style={mobileActiveCategory === "saida" ? { backgroundColor: "rgba(139, 92, 246, 0.15)" } : undefined}
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
                  style={mobileActiveCategory === "saida" ? { color: "rgb(139, 92, 246)" } : undefined}
                >
                  <path d="M10 5H3"></path>
                  <path d="M12 19H3"></path>
                  <path d="M14 3v4"></path>
                  <path d="M16 17v4"></path>
                  <path d="M21 12h-9"></path>
                  <path d="M21 19h-5"></path>
                  <path d="M21 5h-7"></path>
                  <path d="M8 10v4"></path>
                  <path d="M8 12H3"></path>
                </svg>
                {mobileActiveCategory !== "saida" && (
                  <span aria-hidden="true" className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                )}
              </span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-none">
              Saída
            </span>
          </button>

          <span aria-hidden="true" className="mx-1 my-2 w-px shrink-0 self-stretch bg-white/10" />

          {/* Construir */}
          <button
            type="button"
            aria-label="Construir"
            disabled={isProcessing}
            onClick={() => {
              setMobileActiveCategory(null);
              handleBuild();
            }}
            className="group ml-0.5 flex min-h-[52px] min-w-[78px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl px-3 text-white transition-transform duration-100 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            style={{
              color: "rgb(255, 255, 255)",
              background: "linear-gradient(to right, rgb(139, 92, 246), rgba(139, 92, 246, 0.8))",
              boxShadow: "rgba(139, 92, 246, 0.35) 0px 4px 16px"
            }}
          >
            <span className="whitespace-nowrap text-sm font-extrabold leading-tight">
              Construir
            </span>
          </button>
        </div>
      </nav>
  </div>
  );
};

export default RefBuilder;
