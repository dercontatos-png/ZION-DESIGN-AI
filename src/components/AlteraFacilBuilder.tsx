import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ImagePlus,
  Maximize2,
  Copy,
  RotateCcw,
  FileText,
  Check,
  Sparkles,
  X,
  Info,
  Crop,
  Download,
  SlidersHorizontal,
  History,
  Send,
  Eye,
  Heart,
  Globe,
  MoreHorizontal
} from "lucide-react";
import { useProjectStore, addDeletedImage } from "../store/useProjectStore";
import { GenerationLoadingCanvas } from "./GenerationLoadingCanvas";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { MagicRefineBar } from "./MagicRefineBar";
import { getAuthHeaders, getCurrentUserEmail } from "../utils/userAuth";

interface AlteraFacilTabState {
  id: string;
  name: string;
  photoBase64: string | null;
  templateGroup: "masculino" | "feminino";
  poseIndex: number;
  expressionIndex: number;
  framingIndex: number;
  focusIndex: number;
  isAdvancedMode: boolean;
  negativePrompt: string;
  aspectRatio: "9:16" | "4:5" | "1:1" | "16:9";
  quality: "1K" | "2K" | "4K";
  generatedImage: string | null;
}

const defaultAlteraTab: AlteraFacilTabState = {
  id: "tab-1",
  name: "Aba 1",
  photoBase64: null,
  templateGroup: "masculino",
  poseIndex: 0,
  expressionIndex: 0,
  framingIndex: 0,
  focusIndex: 0,
  isAdvancedMode: false,
  negativePrompt: "",
  aspectRatio: "4:5",
  quality: "2K",
  generatedImage: null
};

interface AlteraFacilBuilderProps {
  onSwitchAgent?: (agent: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

interface CarouselItem {
  id: string;
  title: string;
  isOriginal?: boolean;
  img?: string;
  fallback?: string;
}

const POSES_LIST: CarouselItem[] = [
  { id: "pose-0", title: "Manter original", isOriginal: true },
  { id: "pose-1", title: "Reclinado com punho no queixo", img: "/altera-facil/templates/pose-m-01-reclinado-com-punho-no-queixo.avif" },
  { id: "pose-2", title: "Inclinado, mãos entrelaçadas", img: "/altera-facil/templates/pose-m-02-inclinado-maos-entrelacadas.avif" },
  { id: "pose-3", title: "Ajustando o punho", img: "/altera-facil/templates/pose-m-03-ajustando-o-punho.avif" },
  { id: "pose-4", title: "Olhar de perfil sofisticado", img: "/altera-facil/templates/pose-m-02-inclinado-maos-entrelacadas.avif" },
  { id: "pose-5", title: "Braços cruzados editorial", img: "/altera-facil/templates/pose-m-01-reclinado-com-punho-no-queixo.avif" },
  { id: "pose-6", title: "Mão no paletó executivo", img: "/altera-facil/templates/pose-m-03-ajustando-o-punho.avif" },
  { id: "pose-7", title: "Sentado inclinado para frente", img: "/altera-facil/templates/pose-m-02-inclinado-maos-entrelacadas.avif" },
  { id: "pose-8", title: "Expressão confiante estúdio", img: "/altera-facil/templates/pose-m-01-reclinado-com-punho-no-queixo.avif" },
  { id: "pose-9", title: "Postura de liderança", img: "/altera-facil/templates/pose-m-03-ajustando-o-punho.avif" },
  { id: "pose-10", title: "Gesto reflexivo dinâmico", img: "/altera-facil/templates/pose-m-02-inclinado-maos-entrelacadas.avif" },
  { id: "pose-11", title: "Retrato editorial clássico", img: "/altera-facil/templates/pose-m-01-reclinado-com-punho-no-queixo.avif" },
  { id: "pose-12", title: "Passada longa", img: "/altera-facil/templates/pose-m-17-passada-longa.avif" }
];

const EXPRESSOES_LIST: CarouselItem[] = [
  { id: "expr-0", title: "Manter original", isOriginal: true },
  { id: "expr-1", title: "Feliz", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-2", title: "Sério / Confiante", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-3", title: "Pensativo / Analítico", img: "/altera-facil/templates/expr-19-alivio.avif" },
  { id: "expr-4", title: "Sorriso sutil / Amigável", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-5", title: "Intenso / Focado", img: "/altera-facil/templates/expr-19-alivio.avif" },
  { id: "expr-6", title: "Sereno / Tranquilo", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-7", title: "Expressivo / Comunicativo", img: "/altera-facil/templates/expr-19-alivio.avif" },
  { id: "expr-8", title: "Carismático / Acolhedor", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-9", title: "Determinado / Firme", img: "/altera-facil/templates/expr-19-alivio.avif" },
  { id: "expr-10", title: "Inspirado / Visionário", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-11", title: "Elegante / Imponente", img: "/altera-facil/templates/expr-19-alivio.avif" },
  { id: "expr-12", title: "Descontraído / Natural", img: "/altera-facil/templates/expr-01-feliz.avif" },
  { id: "expr-13", title: "Alívio", img: "/altera-facil/templates/expr-19-alivio.avif" }
];

const ENQUADRAMENTOS_LIST: CarouselItem[] = [
  { id: "enq-0", title: "Manter original", isOriginal: true },
  { id: "enq-1", title: "Plano Detalhe", img: "/altera-facil/templates/pd-plano-detalhe.avif" },
  { id: "enq-2", title: "Close-up (Rosto)", img: "/altera-facil/templates/pp-primeiro-plano.avif" },
  { id: "enq-3", title: "Primeiro Plano (Busto)", img: "/altera-facil/templates/pp-primeiro-plano.avif" },
  { id: "enq-4", title: "Plano Médio (Cintura)", img: "/altera-facil/templates/pm-plano-medio.avif" },
  { id: "enq-5", title: "Plano Americano (Joelhos)", img: "/altera-facil/templates/pm-plano-medio.avif" },
  { id: "enq-6", title: "Plano Inteiro", img: "/altera-facil/templates/pi-plano-inteiro.avif" },
  { id: "enq-7", title: "Grande Plano Geral", img: "/altera-facil/templates/gpg-grande-plano-geral.avif" }
];

const FOCOS_LIST: CarouselItem[] = [
  { id: "foco-0", title: "Manter original", isOriginal: true },
  { id: "foco-1", title: "Ultra foco", img: "/altera-facil/templates/focus-ultra-foco.avif" },
  { id: "foco-2", title: "Desfoque suave de estúdio", img: "/altera-facil/templates/focus-tudo-nitido.avif" },
  { id: "foco-3", title: "Bokeh cinematográfico", img: "/altera-facil/templates/focus-ultra-foco.avif" },
  { id: "foco-4", title: "Tudo nítido", img: "/altera-facil/templates/focus-tudo-nitido.avif" }
];

interface Carousel3DProps {
  label: string;
  items: CarouselItem[];
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
}

const Carousel3D: React.FC<Carousel3DProps> = ({ label, items, currentIndex, onSelectIndex }) => {
  const prevIndex = (currentIndex - 1 + items.length) % items.length;
  const nextIndex = (currentIndex + 1) % items.length;

  const prevItem = items[prevIndex];
  const currentItem = items[currentIndex];
  const nextItem = items[nextIndex];

  return (
    <section className="py-2">
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-sm">{label}</span>
          <div className="ml-auto text-[10px] tabular-nums text-white/60">
            {currentIndex + 1}/{items.length}
          </div>
        </div>
      </div>
      <div className="relative mx-auto h-[320px] w-full max-w-[330px]">
        {/* Left option (Previous) */}
        <button
          type="button"
          onClick={() => onSelectIndex(prevIndex)}
          aria-label={`Ver opção anterior de ${label}: ${prevItem.title}`}
          className="absolute -left-[10%] top-1/2 z-0 block aspect-[4/5] w-[72%] -translate-y-1/2 rotate-[-4deg] scale-[0.84] overflow-hidden rounded-[20px] border border-white/[0.08] bg-black opacity-60 transition hover:opacity-85 cursor-pointer"
        >
          {prevItem.isOriginal ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.14),transparent_50%),linear-gradient(145deg,#110b1d,#050308)]">
              <span className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white h-14 w-14">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image h-6 w-6" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </span>
            </div>
          ) : (
            <img
              alt={prevItem.title}
              loading="lazy"
              decoding="async"
              data-nimg="fill"
              className="object-cover scale-[1.03] blur-[2.5px]"
              src={prevItem.img || prevItem.fallback}
              onError={(e) => {
                if (prevItem.fallback && e.currentTarget.src !== prevItem.fallback) {
                  e.currentTarget.src = prevItem.fallback;
                }
              }}
              style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent" }}
            />
          )}
        </button>

        {/* Right option (Next) */}
        <button
          type="button"
          onClick={() => onSelectIndex(nextIndex)}
          aria-label={`Ver próxima opção de ${label}: ${nextItem.title}`}
          className="absolute -right-[10%] top-1/2 z-0 block aspect-[4/5] w-[72%] -translate-y-1/2 rotate-[4deg] scale-[0.84] overflow-hidden rounded-[20px] border border-white/[0.08] bg-black opacity-60 transition hover:opacity-85 cursor-pointer"
        >
          {nextItem.isOriginal ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.14),transparent_50%),linear-gradient(145deg,#110b1d,#050308)]">
              <span className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white h-14 w-14">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image h-6 w-6" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </span>
            </div>
          ) : (
            <img
              alt={nextItem.title}
              loading="lazy"
              decoding="async"
              data-nimg="fill"
              className="object-cover scale-[1.03] blur-[2.5px]"
              src={nextItem.img || nextItem.fallback}
              onError={(e) => {
                if (nextItem.fallback && e.currentTarget.src !== nextItem.fallback) {
                  e.currentTarget.src = nextItem.fallback;
                }
              }}
              style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent" }}
            />
          )}
        </button>

        {/* Center option (Active / Selected) */}
        <button
          type="button"
          aria-pressed="true"
          aria-label={currentItem.title}
          className={`absolute left-1/2 top-1/2 z-10 block aspect-[4/5] w-[76%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] border bg-zinc-950 text-left transition-all ${
            currentItem.isOriginal
              ? "border-white/10"
              : "border-violet-400/60 shadow-[4px_4px_18px_-6px_rgba(139,92,246,0.30)]"
          }`}
        >
          {currentItem.isOriginal ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.14),transparent_50%),linear-gradient(145deg,#110b1d,#050308)]">
              <span className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white h-14 w-14">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image h-6 w-6" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </span>
            </div>
          ) : (
            <img
              alt={currentItem.title}
              loading="lazy"
              decoding="async"
              data-nimg="fill"
              className="object-cover"
              src={currentItem.img || currentItem.fallback}
              onError={(e) => {
                if (currentItem.fallback && e.currentTarget.src !== currentItem.fallback) {
                  e.currentTarget.src = currentItem.fallback;
                }
              }}
              style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent" }}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-4 pb-4 pt-16">
            <p className="text-sm font-semibold text-white truncate">{currentItem.title}</p>
          </div>
        </button>

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => onSelectIndex(prevIndex)}
          aria-label={`Opção anterior de ${label}`}
          className="absolute left-[12%] top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/85 text-white shadow-xl transition hover:border-violet-400/50 hover:bg-violet-500/15 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => onSelectIndex(nextIndex)}
          aria-label={`Próxima opção de ${label}`}
          className="absolute right-[12%] top-1/2 z-20 flex h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/85 text-white shadow-xl transition hover:border-violet-400/50 hover:bg-violet-500/15 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
};

const AlteraFacilBuilder: React.FC<AlteraFacilBuilderProps> = ({
  onSwitchAgent,
  onOpenVitrine,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onOpenReport,
  showToast
}) => {
  const store = useProjectStore();
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [templateGroup, setTemplateGroup] = useState<"masculino" | "feminino">("masculino");
  
  // Carousel indices
  const [poseIndex, setPoseIndex] = useState(0);
  const [expressionIndex, setExpressionIndex] = useState(0);
  const [framingIndex, setFramingIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  
  // Advanced mode & prompt
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [promptResult, setPromptResult] = useState("");
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  // Dimensions & Quality
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "4:5" | "1:1" | "16:9">("4:5");
  const [quality, setQuality] = useState<"1K" | "2K" | "4K">("2K");

  // Canvas state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Multi-Tab System: Strictly up to 3 tabs ("Aba 1", "Aba 2", "Aba 3") with persistent storage
  const [tabs, setTabs] = useState<AlteraFacilTabState[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_altera_facil_tabs_v2");
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
    return [defaultAlteraTab];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("zion_altera_facil_active_tab_id");
        if (saved) return saved;
      } catch (e) {}
    }
    return "tab-1";
  });
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState("");

  // Persist tabs and activeTabId to LocalStorage and IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem("zion_altera_facil_tabs_v2", JSON.stringify(tabs));
      idbSet("zion_altera_facil_tabs_idb", tabs).catch(() => {});
    } catch (e) {
      idbSet("zion_altera_facil_tabs_idb", tabs).catch(() => {});
    }
  }, [tabs]);

  useEffect(() => {
    try {
      localStorage.setItem("zion_altera_facil_active_tab_id", activeTabId);
    } catch (e) {}
  }, [activeTabId]);

  // Rehydrate from IndexedDB on initial mount
  useEffect(() => {
    idbGet("zion_altera_facil_tabs_idb").then((saved) => {
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setTabs(prev => {
          const isInitialDefault = prev.length === 1 && !prev[0].photoBase64 && !prev[0].generatedImage;
          if (isInitialDefault) {
            const first = saved[0];
            setPhotoBase64(first.photoBase64);
            setTemplateGroup(first.templateGroup || "masculino");
            setPoseIndex(first.poseIndex || 0);
            setExpressionIndex(first.expressionIndex || 0);
            setFramingIndex(first.framingIndex || 0);
            setFocusIndex(first.focusIndex || 0);
            setIsAdvancedMode(!!first.isAdvancedMode);
            setNegativePrompt(first.negativePrompt || "");
            setAspectRatio(first.aspectRatio || "4:5");
            setQuality(first.quality || "2K");
            setGeneratedImage(first.generatedImage);
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
            templateGroup,
            poseIndex,
            expressionIndex,
            framingIndex,
            focusIndex,
            isAdvancedMode,
            negativePrompt,
            aspectRatio,
            quality,
            generatedImage
          };
        }
        return t;
      })
    );
  }, [photoBase64, templateGroup, poseIndex, expressionIndex, framingIndex, focusIndex, isAdvancedMode, negativePrompt, aspectRatio, quality, generatedImage, activeTabId]);

  const switchTab = (targetId: string) => {
    if (targetId === activeTabId) return;
    const targetTab = tabs.find(t => t.id === targetId);
    if (targetTab) {
      setPhotoBase64(targetTab.photoBase64);
      setTemplateGroup(targetTab.templateGroup);
      setPoseIndex(targetTab.poseIndex);
      setExpressionIndex(targetTab.expressionIndex);
      setFramingIndex(targetTab.framingIndex);
      setFocusIndex(targetTab.focusIndex);
      setIsAdvancedMode(targetTab.isAdvancedMode);
      setNegativePrompt(targetTab.negativePrompt);
      setAspectRatio(targetTab.aspectRatio);
      setQuality(targetTab.quality);
      setGeneratedImage(targetTab.generatedImage);
    }
    setActiveTabId(targetId);
  };

  const handleAddNewTab = () => {
    if (tabs.length >= 3) {
      showToast?.("Limite máximo de 3 abas atingido.", "warning");
      return;
    }
    const nextNum = tabs.length + 1;
    const newTab: AlteraFacilTabState = {
      ...defaultAlteraTab,
      id: `tab-${Date.now()}`,
      name: `Aba ${nextNum}`
    };
    setTabs(prev => [...prev, newTab]);
    setPhotoBase64(null);
    setPoseIndex(0);
    setExpressionIndex(0);
    setFramingIndex(0);
    setFocusIndex(0);
    setIsAdvancedMode(false);
    setNegativePrompt("");
    setAspectRatio("4:5");
    setQuality("2K");
    setGeneratedImage(null);
    setActiveTabId(newTab.id);
    showToast?.(`Nova aba Aba ${nextNum} criada!`, "success");
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      const nextTab = remaining[0];
      setPhotoBase64(nextTab.photoBase64);
      setTemplateGroup(nextTab.templateGroup);
      setPoseIndex(nextTab.poseIndex);
      setExpressionIndex(nextTab.expressionIndex);
      setFramingIndex(nextTab.framingIndex);
      setFocusIndex(nextTab.focusIndex);
      setIsAdvancedMode(nextTab.isAdvancedMode);
      setNegativePrompt(nextTab.negativePrompt);
      setAspectRatio(nextTab.aspectRatio);
      setQuality(nextTab.quality);
      setGeneratedImage(nextTab.generatedImage);
      setActiveTabId(nextTab.id);
    }
  };

  const handleDuplicate = () => {
    if (tabs.length >= 3) {
      showToast?.("Limite máximo de 3 abas atingido.", "warning");
      return;
    }
    const nextNum = tabs.length + 1;
    const newTab: AlteraFacilTabState = {
      id: `tab-${Date.now()}`,
      name: `Aba ${nextNum}`,
      photoBase64,
      templateGroup,
      poseIndex,
      expressionIndex,
      framingIndex,
      focusIndex,
      isAdvancedMode,
      negativePrompt,
      aspectRatio,
      quality,
      generatedImage
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    showToast?.(`Configurações duplicadas para a Aba ${nextNum}!`, "success");
  };
  const [activeViewMode, setActiveViewMode] = useState<"builder" | "galeria">("builder");
  const [galleryTab, setGalleryTab] = useState<"todos" | "favs">("todos");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [magicRefineText, setMagicRefineText] = useState("");
  const [isExportPopoverOpen, setIsExportPopoverOpen] = useState(false);
  const [isFormatoPopoverOpen, setIsFormatoPopoverOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true);

  // IntersectionObserver for Sticky floating card
  useEffect(() => {
    const btn = submitButtonRef.current;
    if (!btn) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSubmitButtonVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoBase64(ev.target?.result as string);
        showToast?.("Foto para alterar carregada!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const r = new FileReader();
            r.onload = (ev) => {
              setPhotoBase64(ev.target?.result as string);
              showToast?.("Imagem colada com sucesso!", "success");
            };
            r.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [showToast]);

  const handleExecute = async () => {
    if (!photoBase64) {
      showToast?.("Adicione uma foto para alterar primeiro.", "warning");
      return;
    }

    setIsProcessing(true);
    showToast?.("Alterando imagem com precisão de identidade...", "info");

    try {
      const selectedPose = POSES_LIST[poseIndex];
      const selectedExpr = EXPRESSOES_LIST[expressionIndex];
      const selectedEnq = ENQUADRAMENTOS_LIST[framingIndex];
      const selectedFoco = FOCOS_LIST[focusIndex];

      const apiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
        body: JSON.stringify({
          base64DoSujeito: photoBase64,
          sujeitosBase64List: [photoBase64],
          promptTraduzido: `SWAP SLOT IDENTITY PRESERVATION — Keep 100% of the authentic facial identity, skin texture, bone structure, eye color, and natural facial features from the attached reference photo. Apply ONLY the requested presentation changes: Gênero: ${templateGroup}. Pose: ${selectedPose.title}. Expressão: ${selectedExpr.title}. Enquadramento: ${selectedEnq.title}. Foco: ${selectedFoco.title}. Do not alter facial proportions or age. ${negativePrompt ? `Negative: ${negativePrompt}` : ""}`,
          resolutionInput: quality,
          dimensao: aspectRatio,
          formato: "PNG",
          modelId: "default",
          customApiKey: apiKey
        })
      });

      const data = await res.json();
      const finalImg = data.image || data.imageUrl;
      if (finalImg) {
        setGeneratedImage(finalImg);
        showToast?.("Imagem alterada com sucesso!", "success");
        store.addImagesToProjectGallery(store.activeProjectId, [finalImg]);
        store.addGaleriaImage(finalImg, { app: "altera-facil" });
      } else {
        showToast?.(data.error || "Erro ao alterar imagem.", "error");
      }
    } catch (err: any) {
      showToast?.("Erro ao conectar com o servidor.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPhotoBase64(null);
    setPoseIndex(0);
    setExpressionIndex(0);
    setFramingIndex(0);
    setFocusIndex(0);
    setIsAdvancedMode(false);
    setNegativePrompt("");
    setAspectRatio("4:5");
    setQuality("2K");
    setGeneratedImage(null);
    showToast?.("Formulário resetado com sucesso!", "info");
  };

  const handleDownloadFormat = (fmt: "avif" | "png" | "jpeg" | "webp") => {
    if (!generatedImage && !photoBase64) {
      showToast?.("Nenhuma imagem para exportar.", "warning");
      return;
    }
    const img = generatedImage || photoBase64!;
    const a = document.createElement("a");
    a.href = img;
    a.download = `altera-facil-${Date.now()}.${fmt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast?.(`Download iniciado em ${fmt.toUpperCase()}!`, "success");
  };

  return (
    <main data-builder-workspace-shell="" className="relative flex h-full min-h-0 overflow-hidden bg-black lg:flex-row max-lg:grid max-lg:overflow-hidden max-lg:transition-[grid-template-rows] max-lg:duration-300 max-lg:ease-in-out max-lg:grid-rows-[1fr_0fr] flex-1">
      {/* ── SIDEBAR OFICIAL ALTERA FÁCIL (420px) ── */}
      <aside
        data-aside-form-col=""
        data-tour="form"
        className="agent-form-col relative z-10 flex shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] gap-5 lg:gap-6 lg:sticky lg:top-0 lg:h-full max-lg:order-2 max-lg:w-full max-lg:min-h-0"
        style={{ width: "420px", minWidth: "280px", maxWidth: "700px" }}
      >
        {/* 1. Foto para alterar */}
        <div data-tour="form-sec-ef-foto" className="campo-com-info">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[#9d94bb] mb-2">
            <span>Foto para alterar</span>
            <span className="relative inline-flex items-center">
              <button
                type="button"
                data-field-info=""
                aria-label="Mais informações Foto para alterar"
                aria-expanded="false"
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
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onload = (ev) => {
                      setPhotoBase64(ev.target?.result as string);
                      showToast?.("Foto para alterar carregada!", "success");
                    };
                    r.readAsDataURL(file);
                  }
                }}
                className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)] relative overflow-hidden"
              >
                {photoBase64 ? (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <img src={photoBase64} alt="Foto original" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoBase64(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                      title="Remover foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                    <span className="font-light text-[#5c5278] text-4xl">+</span>
                    <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
                  </div>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple={false}
              className="hidden"
              type="file"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* 2. Grupo de templates & 4 Carrosséis */}
        <div data-tour="form-sec-af-alteracao" className="campo-com-info flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Grupo de templates</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={templateGroup === "masculino"}
                onClick={() => setTemplateGroup("masculino")}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold capitalize text-white pb-ctrl-btn cursor-pointer ${
                  templateGroup === "masculino" ? "pb-ctrl-active" : ""
                }`}
              >
                masculino
              </button>
              <button
                type="button"
                aria-pressed={templateGroup === "feminino"}
                onClick={() => setTemplateGroup("feminino")}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold capitalize text-white pb-ctrl-btn cursor-pointer ${
                  templateGroup === "feminino" ? "pb-ctrl-active" : ""
                }`}
              >
                feminino
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* 1. Pose Carousel */}
            <Carousel3D
              label="Pose"
              items={POSES_LIST}
              currentIndex={poseIndex}
              onSelectIndex={setPoseIndex}
            />

            {/* 2. Expressão Carousel */}
            <Carousel3D
              label="Expressão"
              items={EXPRESSOES_LIST}
              currentIndex={expressionIndex}
              onSelectIndex={setExpressionIndex}
            />

            {/* 3. Enquadramento Carousel */}
            <Carousel3D
              label="Enquadramento"
              items={ENQUADRAMENTOS_LIST}
              currentIndex={framingIndex}
              onSelectIndex={setFramingIndex}
            />

            {/* 4. Foco Carousel */}
            <Carousel3D
              label="Foco"
              items={FOCOS_LIST}
              currentIndex={focusIndex}
              onSelectIndex={setFocusIndex}
            />
          </div>
        </div>

        {/* 3. Modo avançado */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <button
            type="button"
            role="switch"
            aria-checked={isAdvancedMode}
            aria-controls="altera-facil-advanced-fields"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-white">Modo avançado</span>
              <span className="mt-1 text-[9px] leading-relaxed text-white/55">Prompt negativo e acabamento.</span>
            </span>
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                isAdvancedMode ? "bg-violet-600 border-violet-500" : "border-white/10 bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  isAdvancedMode ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          {isAdvancedMode && (
            <div id="altera-facil-advanced-fields" className="flex flex-col gap-2 pt-2 border-t border-white/5 animate-in fade-in duration-150">
              <label className="text-xs text-zinc-400 font-medium">Prompt Negativo</label>
              <textarea
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Ex: olhos fechados, distorção, baixa qualidade..."
                className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-zinc-200 resize-none focus:border-violet-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* 4. Dimensões & Qualidade */}
        <div data-tour="form-sec-ef-config" className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
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
                  <button
                    type="button"
                    aria-pressed={aspectRatio === "9:16"}
                    onClick={() => setAspectRatio("9:16")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      aspectRatio === "9:16" ? "pb-ctrl-active" : ""
                    }`}
                    style={aspectRatio === "9:16" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
                  >
                    <span className={`text-[12px] font-semibold transition-colors ${aspectRatio === "9:16" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>Stories</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        aspectRatio === "9:16" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{ backgroundColor: aspectRatio === "9:16" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                    >
                      9:16
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={aspectRatio === "4:5"}
                    onClick={() => setAspectRatio("4:5")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      aspectRatio === "4:5" ? "pb-ctrl-active" : ""
                    }`}
                    style={aspectRatio === "4:5" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
                  >
                    <span className={`text-[12px] font-semibold transition-colors ${aspectRatio === "4:5" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>Feed Vertical</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        aspectRatio === "4:5" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{ backgroundColor: aspectRatio === "4:5" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                    >
                      4:5
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={aspectRatio === "1:1"}
                    onClick={() => setAspectRatio("1:1")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      aspectRatio === "1:1" ? "pb-ctrl-active" : ""
                    }`}
                    style={aspectRatio === "1:1" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
                  >
                    <span className={`text-[12px] font-semibold transition-colors ${aspectRatio === "1:1" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>Feed</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        aspectRatio === "1:1" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{ backgroundColor: aspectRatio === "1:1" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                    >
                      1:1
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={aspectRatio === "16:9"}
                    onClick={() => setAspectRatio("16:9")}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                      aspectRatio === "16:9" ? "pb-ctrl-active" : ""
                    }`}
                    style={aspectRatio === "16:9" ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
                  >
                    <span className={`text-[12px] font-semibold transition-colors ${aspectRatio === "16:9" ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>Cinema</span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                        aspectRatio === "16:9" ? "text-white/80" : "text-zinc-300"
                      }`}
                      style={{ backgroundColor: aspectRatio === "16:9" ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                    >
                      16:9
                    </span>
                  </button>
                </div>
                <div aria-hidden="true" className="hidden sm:flex h-[170px] w-[120px] items-center justify-center rounded-xl pb-ctrl-btn p-2">
                  <div
                    className="rounded-md transition-all duration-300"
                    style={{
                      width: "92%",
                      maxHeight: "92%",
                      aspectRatio: aspectRatio.replace(":", " / "),
                      background: "linear-gradient(rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.063))",
                      border: "1.5px solid rgba(139, 92, 246, 0.333)",
                      boxShadow: "rgba(139, 92, 246, 0.133) 0px 0px 16px inset"
                    }}
                  />
                </div>
              </div>
            </div>
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
                        style={{ backgroundColor: "rgba(139, 92, 246, 0.12)", color: "rgb(139, 92, 246)", border: "1px solid rgba(139, 92, 246, 0.2)" }}
                      >
                        {quality === "4K" ? "MÁXIMA" : quality === "2K" ? "ALTA" : "PADRÃO"}
                      </span>
                      <span className="text-[10px] tabular-nums text-zinc-500">
                        {quality === "4K" ? "3840×2160" : quality === "2K" ? "1856×2304" : "1024×1024"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div role="group" aria-label="Qualidade" className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                <button
                  type="button"
                  aria-pressed={quality === "1K"}
                  onClick={() => setQuality("1K")}
                  className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                  style={
                    quality === "1K"
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
                  <span className="text-base font-bold leading-none tracking-tight transition-colors" style={{ color: quality === "1K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                    1K
                  </span>
                  <span className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]" style={{ color: quality === "1K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                    Rápido
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={quality === "2K"}
                  onClick={() => setQuality("2K")}
                  className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                  style={
                    quality === "2K"
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
                  <span className="text-base font-bold leading-none tracking-tight transition-colors" style={{ color: quality === "2K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                    2K
                  </span>
                  <span className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]" style={{ color: quality === "2K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                    Médio
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={quality === "4K"}
                  onClick={() => setQuality("4K")}
                  className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-10 gap-1.5 py-1.5"
                  style={
                    quality === "4K"
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
                  <span className="text-base font-bold leading-none tracking-tight transition-colors" style={{ color: quality === "4K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                    4K
                  </span>
                  <span className="font-medium uppercase tracking-[0.05em] transition-colors text-[9px]" style={{ color: quality === "4K" ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                    Lento
                  </span>
                </button>
              </div>
            </div>
            
                </div>
          </div>

          {/* Botão Alterar Imagem Principal */}
        <div>
          <div className="w-full">
            <button
              ref={submitButtonRef}
              type="button"
              disabled={isProcessing}
              onClick={handleExecute}
              className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
              style={{ background: "linear-gradient(to right, rgb(168, 85, 247), rgba(168, 85, 247, 0.8))" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-sparkles h-4 w-4" aria-hidden="true">
                <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
                <path d="m14 7 3 3"></path>
                <path d="M5 6v4"></path>
                <path d="M19 14v4"></path>
                <path d="M10 2v2"></path>
                <path d="M7 8H3"></path>
                <path d="M21 16h-4"></path>
                <path d="M11 3H9"></path>
              </svg>
              <span>{isProcessing ? "Alterando..." : "Alterar imagem"}</span>
              <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
            </button>
          </div>
        </div>

        {/* Sticky Floating Action Card */}
        {!isSubmitButtonVisible && (
          <div className="sticky bottom-3 z-30 -mx-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl backdrop-blur-md">
              <div className="w-full">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecute}
                  className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
                  style={{ background: "linear-gradient(to right, rgb(168, 85, 247), rgba(168, 85, 247, 0.8))" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-sparkles h-4 w-4" aria-hidden="true">
                    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"></path>
                    <path d="m14 7 3 3"></path>
                    <path d="M5 6v4"></path>
                    <path d="M19 14v4"></path>
                    <path d="M10 2v2"></path>
                    <path d="M7 8H3"></path>
                    <path d="M21 16h-4"></path>
                    <path d="M11 3H9"></path>
                  </svg>
                  <span>{isProcessing ? "Alterando..." : "Alterar imagem"}</span>
                  <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                </button>
              </div>
              <div className="mt-2 px-1 pb-0.5">
                <div className="flex items-center justify-center gap-4 text-[11px] text-[#9d94bb]">
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    title="Duplicar configurações para uma nova aba"
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
                    onClick={handleReset}
                    title="Resetar todas as configurações do formulário"
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
          </div>
        )}

        {/* Bottom row: Duplicar & Resetar */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDuplicate}
            title="Duplicar configurações para uma nova aba"
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
            onClick={handleReset}
            title="Resetar todas as configurações do formulário"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw h-4 w-4" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Resetar
          </button>
        </div>
        <div className="h-20 shrink-0" aria-hidden="true" />
      </aside>

      {/* ── CANVAS CENTRAL / WORKSPACE DE ALTA FIDELIDADE ── */}
      <section className="relative flex flex-1 min-h-0 flex-col overflow-hidden bg-black">
        {/* Top Header com Abas e Visualizações */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-4 lg:px-6">
          {/* Tabs */}
          <div data-tour="tabs" role="tablist" aria-label="Abas de geração" className="pointer-events-auto flex min-w-0 flex-row items-center gap-1 overflow-x-auto scrollbar-hide">
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
                        ? "text-white bg-purple-500/20 border-purple-500 shadow-sm"
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
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300 cursor-pointer"
                title="Nova aba"
              >
                <span className="text-base leading-none">+</span>
              </button>
            )}
          </div>

          {/* View Modes */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-zinc-900/90 p-1 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveViewMode("builder")}
                className={`px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeViewMode === "builder" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                }`}
              >
                BUILDER
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveViewMode("galeria");
                }}
                className={`px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeViewMode === "galeria" ? "bg-purple-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                }`}
              >
                GALERIA
              </button>
            </div>
          </div>
        </header>

        {/* Canvas do Palco */}
        <div className="relative flex flex-1 min-h-0 flex-row items-center justify-center overflow-hidden">
          <div className="palco-da-arte relative flex h-full min-h-0 w-full min-w-0 overflow-hidden">
            {activeViewMode === "galeria" ? (
              <div className="flex h-full w-full flex-col overflow-y-auto px-6 py-4 custom-scrollbar z-20">
                <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-sm font-semibold text-zinc-200">Gerações Salvas na Galeria</span>
                  <span className="text-xs text-zinc-500">{(store.galeriaImages || []).length} imagens</span>
                </div>
                {(store.galeriaImages || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
                    <p className="text-xs">Nenhuma arte gerada ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {(store.galeriaImages || []).map((imgUrl, i) => (
                      <div
                        key={imgUrl + "_" + i}
                        onClick={() => {
                          setPhotoBase64(imgUrl);
                          setActiveViewMode("builder");
                          showToast?.("Imagem carregada no Altera Fácil!", "success");
                        }}
                        className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-purple-500/50 transition-all shadow-md cursor-pointer"
                      >
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
                          <img src={imgUrl} alt={`Geração ${i + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                            <span className="text-[10px] text-white font-medium">Usar no Altera Fácil</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex h-full min-h-0 min-w-0 flex-1 items-center justify-center gap-3 p-4 pb-32 sm:pb-36">
              <div className="group/viewer relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden items-center justify-center">
                {isProcessing ? (
                  <div
                    className="relative flex flex-col items-center justify-center rounded-2xl border border-violet-500/40 overflow-hidden shadow-2xl shadow-violet-950/60 animate-in fade-in zoom-in-95 duration-300"
                    style={{
                      width: "min(85%, 480px)",
                      aspectRatio: aspectRatio.replace(":", " / "),
                      backgroundColor: "rgb(12, 10, 21)"
                    }}
                  >
                    <GenerationLoadingCanvas
                      agentColor="#a855f7"
                      subMessage="Altera Fácil aplicando pose e mantendo fisionomia"
                    />
                  </div>
                ) : generatedImage || photoBase64 ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <img
                      src={generatedImage || photoBase64!}
                      alt="Preview Altera Fácil"
                      className="block max-h-full max-w-full rounded-2xl object-contain shadow-2xl transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel / 100})` }}
                    />
                  </div>
                ) : (
                  <div
                    className="preview-canvas relative flex flex-col items-center justify-center rounded-2xl border border-white/10 overflow-hidden"
                    style={{
                      width: "min(85%, 480px)",
                      aspectRatio: aspectRatio.replace(":", " / "),
                      backgroundColor: "rgb(12, 10, 21)"
                    }}
                  >
                    {/* 40px grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                      }}
                    />
                    <div className="subject-placeholder flex flex-col items-center gap-3 text-zinc-500 z-10">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-purple-400">
                        <Upload className="h-7 w-7 opacity-60" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-400">Envie uma foto para começar a alterar</span>
                      <span className="text-[10px] text-zinc-600">Altere pose, expressão, enquadramento e foco</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gradiente Inferior Oficial */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-48 bg-gradient-to-t from-[rgba(4,2,12,0.70)] via-[rgba(4,2,12,0.35)] to-transparent" />

            {/* Ações Inferiores da Arte */}
            <div className="@container absolute inset-x-0 bottom-0">
              {/* Lateral Direita: Formato & Exportar */}
              <div className="acoes-da-arte absolute right-6 z-30 flex items-center gap-1.5 transition-all duration-300 max-[1800px]:flex-col max-[1800px]:items-end max-lg:hidden" style={{ bottom: "108px" }}>
                {/* Formato Popover */}
                <div className="relative">
                  {isFormatoPopoverOpen && (
                    <div className="absolute bottom-full mb-2 z-30 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 right-0">
                      <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium text-zinc-500">Formato</p>
                      <div className="grid grid-cols-3 gap-1 px-2 pb-1.5">
                        {[
                          { r: "16:9", w: "28.8px", h: "16.2px", t: "Widescreen" },
                          { r: "9:16", w: "16.2px", h: "28.8px", t: "Story / Reels" },
                          { r: "1:1", w: "21.6px", h: "21.6px", t: "Quadrado" },
                          { r: "4:5", w: "19.2px", h: "24px", t: "Instagram" },
                          { r: "3:4", w: "18px", h: "24px", t: "Retrato" },
                          { r: "4:3", w: "24px", h: "18px", t: "Paisagem" }
                        ].map(({ r, w, h, t }) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setIsFormatoPopoverOpen(false);
                              setAspectRatio(r === "3:4" ? "4:5" : r === "4:3" ? "16:9" : (r as any));
                              showToast?.(`Formato ${r} selecionado!`, "info");
                            }}
                            className="group flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all duration-150 hover:bg-white/[0.06] cursor-pointer"
                            title={t}
                          >
                            <div className="rounded border border-white/[0.12] transition-all duration-150 group-hover:border-purple-500/40" style={{ width: w, height: h, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.02))" }} />
                            <span className="text-[9px] font-medium text-zinc-400">{r}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFormatoPopoverOpen(!isFormatoPopoverOpen)}
                    title="Formato"
                    className={`flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                      isFormatoPopoverOpen ? "bg-purple-600/30 text-purple-200 border border-purple-500/40" : "bg-black/70 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Crop className="h-4 w-4" />
                    <span className="rotulo-da-acao ml-1.5">Formato</span>
                  </button>
                </div>

                {/* Exportar Popover */}
                <div className="relative">
                  {isExportPopoverOpen && (
                    <div className="absolute bottom-full mb-2 z-30 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 right-0">
                      <p className="px-3 pb-1 pt-0.5 text-[10px] font-medium text-zinc-500">Baixar</p>
                      {[
                        { fmt: "avif" as const, name: "AVIF", sub: "Original" },
                        { fmt: "png" as const, name: "PNG", sub: "Sem perda" },
                        { fmt: "jpeg" as const, name: "JPEG", sub: "Alta qualidade" },
                        { fmt: "webp" as const, name: "WebP", sub: "Web otimizado" }
                      ].map(({ fmt, name, sub }) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => {
                            setIsExportPopoverOpen(false);
                            handleDownloadFormat(fmt);
                          }}
                          className="flex w-full items-center gap-2.5 whitespace-nowrap px-3.5 py-2 text-xs text-zinc-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-zinc-200 cursor-pointer"
                        >
                          <Download className="h-3 w-3 text-zinc-500" />
                          <span className="font-medium text-zinc-300">{name}</span>
                          <span className="text-zinc-600">{sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsExportPopoverOpen(!isExportPopoverOpen)}
                    title="Exportar"
                    className={`flex h-9 items-center rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                      isExportPopoverOpen ? "bg-purple-600/30 text-purple-200 border border-purple-500/40" : "bg-black/70 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span className="rotulo-da-acao ml-1.5">Exportar</span>
                  </button>
                </div>
              </div>

              {/* Bloco Central: Magic Bar & Publish Alert */}
              <div className="absolute bottom-8 left-1/2 z-20 flex w-[min(92vw,480px)] -translate-x-1/2 flex-col items-center gap-2.5 lg:w-[calc(100%-120px)] transition-[max-width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:max-w-[480px] pointer-events-auto">
                <MagicRefineBar
                  activeImage={generatedImage || photoBase64 || undefined}
                  isProcessing={isProcessing}
                  agentColor="#a855f7"
                  placeholder="Descreva a alteração mágica..."
                  onPublishCommunity={() => {
                    onOpenCommunity?.();
                    showToast?.("Publicação na comunidade iniciada!", "info");
                  }}
                  onSendRefine={(text) => {
                    setMagicRefineText(text);
                    showToast?.("Refinando com instrução mágica...", "info");
                    setTimeout(() => handleExecute(), 50);
                  }}
                />
              </div>
            </div>
              </>
            )}
          </div>

          {/* Coluna Lateral de Histórico Oficial (72px) à Direita */}
            <div
              data-tour="history"
              className="coluna-de-historico relative z-10 hidden h-full shrink-0 flex-col lg:flex"
              style={{ width: "72px", "--largura-do-historico": "72px" } as any}
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
                  {store.galeriaImages && store.galeriaImages.length > 0 ? (
                    store.galeriaImages.map((imgUrl, i) => (
                      <div
                        key={imgUrl + "_" + i}
                        className="group relative w-full overflow-hidden rounded-lg border transition-all duration-200 border-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_6px_rgba(139,92,246,0.08)] cursor-pointer"
                      >
                        <button
                          type="button"
                          onClick={() => setGeneratedImage(imgUrl)}
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
                              aspectRatio: aspectRatio ? aspectRatio.replace(":", " / ") : "4 / 5"
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
                            store.deleteGaleriaImage(imgUrl);
                            showToast?.("Geração excluída permanentemente.", "info");
                          }}
                          className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-zinc-300 ring-1 ring-white/10 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/30 hover:text-red-300 cursor-pointer"
                          title="Remover geração permanentemente"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
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
  );
};

export default AlteraFacilBuilder;
