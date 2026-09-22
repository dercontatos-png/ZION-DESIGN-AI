import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Heart, ArrowBigUp, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface CommunityCardItem {
  id: string;
  index: number;
  col: number;
  aspect: string;
  title: string;
  tag: string;
  app: string;
  votes: number;
  author: string;
  avatar: string;
  letter: string;
  src: string;
  prompt?: string;
  date?: string;
}

interface ComunidadeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CommunityCardItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onVote: (cardId: string) => void;
  onFavorite: (cardId: string) => void;
  votes: number;
  isFavorited: boolean;
}

export const ComunidadeDetailModal: React.FC<ComunidadeDetailModalProps> = ({
  isOpen,
  onClose,
  cards,
  currentIndex,
  onNavigate,
  onVote,
  onFavorite,
  votes,
  isFavorited
}) => {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const card = cards[currentIndex];

  useEffect(() => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
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

  if (!isOpen || !card) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm overflow-hidden lg:flex-row select-none">
      {/* Área de Visualização da Imagem à Esquerda */}
      <div
        className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden"
        style={{ cursor: zoom > 100 ? (isDragging ? "grabbing" : "grab") : "zoom-in", touchAction: "none" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Botão Fechar Mobile */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 lg:hidden cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Botão Foto Anterior */}
        {currentIndex > 0 && (
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/75 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Botão Próxima Foto */}
        {currentIndex < cards.length - 1 && (
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/75 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Imagem Central */}
        <img
          alt={card.title ? `[${card.id}] ${card.title}` : `[${card.id}]`}
          draggable={false}
          src={card.src}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `/designbuilder/thumbnail(${(currentIndex % 41) + 1}).avif`;
          }}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transform: `scale(${zoom / 100}) translate(${pan.x / (zoom / 100)}px, ${pan.y / (zoom / 100)}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.12s",
            userSelect: "none"
          }}
        />

        {/* Barra de Controle de Zoom Flutuante (Canto inferior esquerdo) */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/70 px-2 py-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors lg:h-7 lg:w-7 cursor-pointer"
            title="Reduzir zoom"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-zinc-200">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors lg:h-7 lg:w-7 cursor-pointer"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-white/10" />
          <button
            type="button"
            title="Resetar (0)"
            onClick={handleResetZoom}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors lg:h-7 lg:w-7 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Dicas de Atalhos (Canto inferior direito) */}
        <div className="absolute bottom-4 right-4 hidden space-y-0.5 text-right pointer-events-none lg:block">
          <p className="text-[9px] text-zinc-700">Scroll — zoom</p>
          <p className="text-[9px] text-zinc-700">Drag — mover</p>
          <p className="text-[9px] text-zinc-700">ESC — fechar</p>
        </div>
      </div>

      {/* Painel Lateral de Metadados à Direita (1:1 com FireShot 3.png) */}
      <aside className="flex max-h-[48dvh] w-full shrink-0 flex-col border-t border-white/5 bg-zinc-950 pb-safe lg:h-full lg:max-h-none lg:w-72 lg:border-l lg:border-t-0 lg:pb-0">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between border-b border-white/5 px-5 py-4">
          <div className="min-w-0 flex-1 pr-3">
            <p className="truncate text-sm font-semibold leading-tight text-zinc-100">
              {card.title || "Personagens"}
            </p>
            <p className="mt-1 font-mono text-[11px] text-violet-400">[{card.id}]</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Informações detalhadas */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Categoria</p>
            <p className="mt-0.5 text-sm capitalize text-zinc-300">{card.tag || "social media"}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">App</p>
            <p className="mt-0.5 text-sm text-zinc-300">{card.app || "Ref"}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Dimensões</p>
            <p className="mt-0.5 text-sm text-zinc-300">{card.aspect ? card.aspect.replace(/\s+/g, "") : "1:1"}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Publicado em</p>
            <p className="mt-0.5 text-sm text-zinc-300">{card.date || "10 de abril de 2026"}</p>
          </div>
        </div>

        {/* Rodapé de Ações: Votos e Favoritar */}
        <div className="border-t border-white/5 px-5 py-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onVote(card.id)}
            className="flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 hover:text-violet-200 cursor-pointer"
          >
            <ArrowBigUp className="h-5 w-5" fill="currentColor" />
            <span>{votes} votos</span>
          </button>

          <button
            type="button"
            onClick={() => onFavorite(card.id)}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors border cursor-pointer ${
              isFavorited
                ? "border-pink-500/40 bg-pink-500/15 text-pink-400"
                : "border-white/10 bg-zinc-800/80 text-zinc-400 hover:text-pink-400 hover:border-pink-500/30"
            }`}
          >
            <Heart className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
            <span>{isFavorited ? "Favoritado" : "Favoritar"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ComunidadeDetailModal;
