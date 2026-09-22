import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  ThumbsUp,
  Copy,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  Star,
  Trash2,
  Check,
  Loader2
} from "lucide-react";

export interface GaleriaCardItem {
  id: string;
  index: number;
  col?: number;
  aspect: string;
  app: string;
  src: string;
  fallback?: string;
  date?: string;
  resolution?: string;
  prompt?: string;
  inputsTitle?: string;
  inputs?: Array<{ title: string; label?: string; src: string; fallback?: string }>;
  isFavorited?: boolean;
  isLiked?: boolean;
  isRated?: boolean;
  isSelected?: boolean;
}

interface GaleriaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: GaleriaCardItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onReuseSettings?: (card: GaleriaCardItem) => void;
  onShareCommunity?: (card: GaleriaCardItem) => void;
  onToggleFavorite?: (cardId: string) => void;
  onToggleLike?: (cardId: string) => void;
  onToggleRate?: (cardId: string) => void;
  onDelete?: (cardId: string, src: string) => void;
  onOpenApp?: (appSlug: string) => void;
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const GaleriaDetailModal: React.FC<GaleriaDetailModalProps> = ({
  isOpen,
  onClose,
  cards,
  currentIndex,
  onNavigate,
  onReuseSettings,
  onShareCommunity,
  onToggleFavorite,
  onToggleLike,
  onToggleRate,
  onDelete,
  onOpenApp,
  showToast
}) => {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadSuccessFormat, setDownloadSuccessFormat] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const currentCard = cards[currentIndex];

  useEffect(() => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < cards.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, cards.length, onClose, onNavigate]);

  if (!isOpen || !currentCard) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = async (format: string) => {
    try {
      setDownloadingFormat(format);
      if (showToast) showToast(`Baixando imagem em formato ${format.toUpperCase()}...`, "info");
      const filename = `design_${(currentCard.app || "arte").toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.${format.toLowerCase()}`;

      const response = await fetch(currentCard.src);
      const blob = await response.blob();

      if (format.toLowerCase() === "png" || format.toLowerCase() === "jpeg" || format.toLowerCase() === "webp") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (format.toLowerCase() === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const mimeType = format.toLowerCase() === "jpeg" ? "image/jpeg" : format.toLowerCase() === "webp" ? "image/webp" : "image/png";
          canvas.toBlob((convertedBlob) => {
            if (convertedBlob) {
              const downloadUrl = URL.createObjectURL(convertedBlob);
              const a = document.createElement("a");
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              URL.revokeObjectURL(downloadUrl);
              document.body.removeChild(a);
            }
          }, mimeType, 0.95);
        }
        URL.revokeObjectURL(objectUrl);
      } else {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }

      setDownloadSuccessFormat(format);
      setTimeout(() => setDownloadSuccessFormat(null), 2000);
      if (showToast) showToast(`Download ${format.toUpperCase()} concluído!`, "success");
    } catch (err) {
      console.warn("Erro ao converter/baixar:", err);
      const a = document.createElement("a");
      a.href = currentCard.src;
      a.download = `design_${(currentCard.app || "arte").toLowerCase()}.${format}`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getAppRoute = (app: string) => {
    const a = app.toLowerCase();
    if (a === "ref") return "/agent/ref";
    if (a === "hydra") return "/agent/hydra";
    if (a.includes("enhance")) return "/agent/enhance-builder";
    if (a.includes("builder")) return "/agent/design-builder1-2";
    if (a.includes("orion") || a.includes("órion")) return "/agent/orion-pro";
    if (a.includes("altera")) return "/agent/altera-facil";
    return `/agent/${a}`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visualizador de Imagem à Esquerda */}
        <div
          className="relative flex-1 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="contents">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => onNavigate(currentIndex - 1)}
                className="absolute top-1/2 z-[80] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/10 transition-colors hover:bg-white/10 left-3 cursor-pointer"
                title="Imagem anterior (←)"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
            {currentIndex < cards.length - 1 && (
              <button
                type="button"
                onClick={() => onNavigate(currentIndex + 1)}
                className="absolute top-1/2 z-[80] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/10 transition-colors hover:bg-white/10 right-3 cursor-pointer"
                title="Próxima imagem (→)"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
          </div>

          <img
            decoding="async"
            alt="Geração"
            className="max-h-[85vh] max-w-[60vw] rounded-2xl object-contain shadow-2xl ring-1 ring-white/10 select-none cursor-grab"
            draggable={false}
            src={currentCard.src}
            onMouseDown={handleMouseDown}
            style={{
              transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "transform 0.2s",
              backgroundImage: `url("${currentCard.fallback || currentCard.src}")`,
              backgroundSize: "contain",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat"
            }}
          />
        </div>

        {/* Barra Lateral Direita de Detalhes (w-72) */}
        <div className="w-72 flex-shrink-0 rounded-2xl border border-white/10 bg-zinc-900/95 p-5 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Detalhes</h3>
            <span className="text-[10px] text-zinc-500">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-500">App</span>
              <p className="text-zinc-200">{currentCard.app || "Ref"}</p>
            </div>
            <div>
              <span className="text-zinc-500">Data</span>
              <p className="text-zinc-200">{currentCard.date || "07 de setembro de 2026 às 20:10"}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <span className="text-zinc-500">Formato</span>
                <p className="text-zinc-200">{currentCard.aspect ? currentCard.aspect.replace(/\s+/g, "").replace(/\//g, ":") : "9:16"}</p>
              </div>
              <div>
                <span className="text-zinc-500">Resolução</span>
                <p className="text-zinc-200">{currentCard.resolution || "2K"}</p>
              </div>
            </div>
          </div>

          {/* Botões Favoritar & Curtir */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite && onToggleFavorite(currentCard.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                currentCard.isFavorited
                  ? "border-pink-500/40 bg-pink-500/15 text-pink-400"
                  : "border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <Heart className="h-3.5 w-3.5" fill={currentCard.isFavorited ? "currentColor" : "none"} aria-hidden="true" />
              Favoritar
            </button>
            <button
              type="button"
              onClick={() => onToggleLike && onToggleLike(currentCard.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                currentCard.isLiked
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                  : "border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" fill={currentCard.isLiked ? "currentColor" : "none"} aria-hidden="true" />
              Curtir
            </button>
          </div>

          {/* Reutilizar configurações */}
          <button
            type="button"
            onClick={() => onReuseSettings && onReuseSettings(currentCard)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Reutilizar configurações
          </button>

          {/* Compartilhar na Comunidade */}
          <button
            type="button"
            onClick={() => onShareCommunity && onShareCommunity(currentCard)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            Compartilhar na Comunidade
          </button>

          {/* Inspirações / Input thumbnails quando existirem */}
          {currentCard.inputs && currentCard.inputs.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Inspirações</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentCard.inputs.map((inp, idx) => (
                  <img
                    key={idx}
                    loading="lazy"
                    decoding="async"
                    alt={inp.title || `Ref ${idx + 1}`}
                    title={inp.title || `Ref ${idx + 1}`}
                    className="h-12 w-12 cursor-pointer rounded-lg object-cover ring-1 transition-all ring-white/10 hover:ring-violet-500/50"
                    src={inp.src}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Barra de Zoom */}
          <div className="mt-4 flex items-center gap-1 rounded-xl border border-white/5 bg-zinc-800/50 p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200 cursor-pointer"
              title="Diminuir zoom (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="flex-1 text-center text-[10px] text-zinc-500 font-mono">{zoom}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200 cursor-pointer"
              title="Aumentar zoom (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200 cursor-pointer"
              title="Resetar zoom (0)"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 text-center text-[9px] text-zinc-600">Rolar para zoom / Arrastar para mover</p>

          {/* Opções de Download */}
          <div className="mt-5 space-y-2">
            <div className="flex flex-col gap-1.5">
              {[
                { format: "avif", label: "AVIF", sublabel: "Resolução original" },
                { format: "png", label: "PNG", sublabel: "Sem perda" },
                { format: "jpeg", label: "JPEG", sublabel: "Alta qualidade" },
                { format: "webp", label: "WebP", sublabel: "Web otimizado" }
              ].map(({ format, label, sublabel }) => {
                const isLoading = downloadingFormat === format;
                const isSuccess = downloadSuccessFormat === format;

                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => handleDownload(format)}
                    disabled={!!downloadingFormat}
                    className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-zinc-900 px-3 py-2.5 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-violet-500/40 hover:bg-violet-500/5 cursor-pointer group"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
                      ) : isSuccess ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Download className="h-3 w-3 text-zinc-400 group-hover:text-violet-400 transition-colors" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-zinc-600">{sublabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Abrir app */}
            <a
              href={getAppRoute(currentCard.app)}
              onClick={(e) => {
                if (onOpenApp) {
                  e.preventDefault();
                  onOpenApp(currentCard.app);
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Abrir app
            </a>

            {/* Avaliar esta geração */}
            <button
              type="button"
              aria-label="Avaliar geração"
              onClick={() => onToggleRate && onToggleRate(currentCard.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                currentCard.isRated
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Star className="h-3.5 w-3.5" fill={currentCard.isRated ? "currentColor" : "none"} aria-hidden="true" />
              Avaliar esta geração
            </button>

            {/* Excluir */}
            <button
              type="button"
              onClick={() => onDelete && onDelete(currentCard.id, currentCard.src)}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 w-full px-4 py-2.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Excluir
            </button>
          </div>
        </div>

        {/* Botão Fechar no Canto Superior Direito (-top-3 -right-3) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 ring-1 ring-white/10 hover:bg-red-500 hover:text-white transition-colors cursor-pointer z-50"
          title="Fechar (Esc)"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default GaleriaDetailModal;
