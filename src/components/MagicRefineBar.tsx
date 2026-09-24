import React, { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Paperclip,
  Send,
  MoreHorizontal,
  Hand,
  Paintbrush,
  ZoomIn,
  ZoomOut,
  Undo2,
  X,
  ImagePlus,
  ArrowRight,
  Trash2
} from "lucide-react";

export interface MagicRefineAttachment {
  file?: File;
  preview: string;
}

export interface MagicRefineBarProps {
  onSendRefine: (text: string, attachments: MagicRefineAttachment[], isBrush: boolean) => void;
  onPublishCommunity?: () => void;
  isProcessing?: boolean;
  activeImage?: string | null;
  agentColor?: string;
  placeholder?: string;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onBrushToggle?: (active: boolean) => void;
}

export const MagicRefineBar: React.FC<MagicRefineBarProps> = ({
  onSendRefine,
  onPublishCommunity,
  isProcessing = false,
  activeImage = null,
  agentColor = "#a855f7",
  placeholder,
  zoomLevel = 100,
  onZoomChange,
  onBrushToggle
}) => {
  const [showPublishAlert, setShowPublishAlert] = useState<boolean>(true);
  const [isBrushActive, setIsBrushActive] = useState<boolean>(false);
  const [brushTool, setBrushTool] = useState<"hand" | "brush">("brush");
  const [brushColor, setBrushColor] = useState<string>("#a855f7");
  const [brushSize, setBrushSize] = useState<number>(30);
  const [localZoom, setLocalZoom] = useState<number>(zoomLevel);
  const [attachments, setAttachments] = useState<MagicRefineAttachment[]>([]);
  const [refineText, setRefineText] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [fullscreenPreview, setFullscreenPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync zoom
  useEffect(() => {
    setLocalZoom(zoomLevel);
  }, [zoomLevel]);

  const handleZoom = (val: number) => {
    setLocalZoom(val);
    onZoomChange?.(val);
  };

  const toggleBrush = () => {
    const next = !isBrushActive;
    setIsBrushActive(next);
    onBrushToggle?.(next);
    if (next) setBrushTool("brush");
  };

  const handleFiles = (files: FileList | File[]) => {
    const newItems: MagicRefineAttachment[] = [];
    Array.from(files).forEach((f) => {
      if (f.type.startsWith("image/")) {
        newItems.push({
          file: f,
          preview: URL.createObjectURL(f)
        });
      }
    });
    setAttachments((prev) => [...prev, ...newItems].slice(0, 5));
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => {
      const target = prev[idx];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSend = () => {
    if ((!refineText.trim() && attachments.length === 0) || isProcessing) return;
    onSendRefine(refineText.trim(), attachments, isBrushActive);
    setRefineText("");
    setAttachments([]);
    if (isBrushActive) {
      setIsBrushActive(false);
      onBrushToggle?.(false);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRefineText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(120, Math.max(36, e.target.scrollHeight))}px`;
  };

  const colors = ["#a855f7", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff"];
  const isSendActive = (refineText.trim().length > 0 || attachments.length > 0) && !isProcessing;

  return (
    <div className="w-full flex flex-col items-center gap-2 pointer-events-auto">
      {/* ── CARD AVISO DE PUBLICAR NA COMUNIDADE ─────────────────────── */}
      {showPublishAlert && (
        <div className="flex w-full justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div
            className="publish-alert-card relative inline-flex items-center gap-3 rounded-2xl py-2 pl-4 pr-2.5 shadow-xl shadow-black/30"
            style={{
              ["--alert-idv" as any]: agentColor,
              ["--alert-idv-dim" as any]: `${agentColor}40`
            }}
          >
            <p
              className="whitespace-nowrap text-[15px] font-semibold leading-snug"
              style={{ color: "color-mix(in srgb, rgb(168, 85, 247) 74%, rgb(0, 0, 0) 26%)" }}
            >
              Vire inspiração na comunidade. Compartilhe!
            </p>
            <button
              type="button"
              onClick={onPublishCommunity}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-[14.5px] font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60 cursor-pointer"
              title="Publicar na Comunidade"
              style={{ backgroundColor: "color-mix(in srgb, rgb(168, 85, 247) 74%, rgb(0, 0, 0) 26%)" }}
            >
              <span>Publicar</span>
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
                className="lucide lucide-arrow-right h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowPublishAlert(false)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white/80 ring-1 ring-white/15 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
              title="Fechar"
              aria-label="Fechar aviso de publicar"
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
          </div>
        </div>
      )}

      {/* ── BARRA DE REFINAMENTO MÁGICO OFICIAL (MAGIC BAR) ──────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={`magic-bar relative flex w-full flex-col overflow-hidden rounded-[22px] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-500 ${
          isDragOver ? "magic-bar-dragging" : ""
        } ${isFocused || refineText.length > 0 || attachments.length > 0 ? "magic-bar-em-uso" : ""}`}
      >
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 px-3.5 pt-3.5 pb-1">
            {attachments.map((att, idx) => (
              <div key={idx} className="refine-thumb-in group relative h-14 w-14 shrink-0">
                <button
                  type="button"
                  onClick={() => setFullscreenPreview(att.preview)}
                  className="block h-full w-full overflow-hidden rounded-xl border border-white/[0.10] shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-violet-400/60 cursor-pointer"
                  title="Ver em tela cheia"
                >
                  <img src={att.preview} alt="" className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/90 text-white shadow-md ring-1 ring-white/10 opacity-0 transition-opacity group-hover:opacity-100 max-lg:opacity-100 cursor-pointer"
                  title="Remover"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dropzone */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            isDragOver ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-violet-400/50 bg-violet-500/[0.08] py-5 transition-all duration-200">
              <ImagePlus className="h-5 w-5 text-violet-300 animate-pulse" />
              <span className="text-sm font-medium text-violet-200">Solte a imagem aqui</span>
            </div>
          </div>
        </div>

        {/* Brush Controls Header and Toolbar */}
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
                  aria-pressed={brushTool === "hand"}
                >
                  <Hand className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setBrushTool("brush")}
                  className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    brushTool === "brush" ? "bg-violet-500 text-white" : "text-white/55 hover:text-white"
                  }`}
                  aria-label="Ferramenta pincel"
                  aria-pressed={brushTool === "brush"}
                >
                  <Paintbrush className="h-4 w-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ZoomOut className="h-3.5 w-3.5 shrink-0 text-white/45" />
                <input
                  min={1}
                  max={4}
                  step={0.01}
                  className="h-1 min-w-20 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                  aria-label="Zoom da imagem"
                  type="range"
                  value={localZoom / 100}
                  onChange={(e) => handleZoom(Math.round(parseFloat(e.target.value) * 100))}
                />
                <ZoomIn className="h-3.5 w-3.5 shrink-0 text-white/45" />
                <span className="w-10 text-right font-mono text-[10px] text-violet-200/70">{localZoom}%</span>
              </div>

              {/* Exit Brush Buttons */}
              <div className="flex shrink-0 items-center gap-1 border-l border-white/10 pl-2">
                <button
                  type="button"
                  onClick={() => handleZoom(100)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-violet-100 hover:bg-white/[0.08] cursor-pointer"
                  aria-label="Desfazer"
                  title="Resetar zoom"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleBrush}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/75 hover:bg-white/[0.08] cursor-pointer"
                  aria-label="Sair do pincel"
                  title="Sair do pincel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile Brush Size & Colors */}
            <div className="lg:hidden flex flex-col gap-2 px-3 pt-2 pb-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setBrushColor(c);
                      setBrushTool("brush");
                    }}
                    className={`h-6 flex-1 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                      brushColor.toLowerCase() === c.toLowerCase()
                        ? "border-white ring-2 ring-white/40"
                        : "border-white/15"
                    }`}
                    aria-label={`Cor ${c}`}
                    aria-pressed={brushColor.toLowerCase() === c.toLowerCase()}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">Brush</span>
                <input
                  min={6}
                  max={200}
                  step={2}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                  title={`${brushSize}px`}
                  aria-label="Tamanho do pincel"
                  type="range"
                  value={brushSize}
                  onChange={(e) => {
                    setBrushSize(parseInt(e.target.value));
                    setBrushTool("brush");
                  }}
                />
                <span className="w-9 text-right font-mono text-[11px] text-violet-200/70">{brushSize}px</span>
              </div>
            </div>

            {/* Desktop Brush Size & Colors */}
            <div className="hidden lg:flex items-center gap-3 px-3.5 pt-2.5 pb-1 animate-in slide-in-from-top-1 fade-in duration-200">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">Brush</span>
              <input
                min={6}
                max={200}
                step={2}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                title={`${brushSize}px`}
                aria-label="Tamanho do pincel"
                type="range"
                value={brushSize}
                onChange={(e) => {
                  setBrushSize(parseInt(e.target.value));
                  setBrushTool("brush");
                }}
              />
              <span className="w-7 text-right font-mono text-[10px] text-violet-200/70">{brushSize}px</span>
              <div className="mx-0.5 h-3 w-px bg-white/10 max-lg:hidden"></div>
              <div className="flex items-center gap-1 max-lg:flex-wrap max-lg:gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setBrushColor(c);
                      setBrushTool("brush");
                    }}
                    className={`h-4 w-4 max-lg:h-6 max-lg:w-6 shrink-0 rounded-full border transition-all hover:scale-110 cursor-pointer ${
                      brushColor.toLowerCase() === c.toLowerCase()
                        ? "scale-110 border-white ring-2 ring-white/30"
                        : "border-white/20"
                    }`}
                    title={c}
                    aria-label={`Cor ${c}`}
                    aria-pressed={brushColor.toLowerCase() === c.toLowerCase()}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mx-0.5 h-3 w-px bg-white/10 max-lg:hidden"></div>
            </div>

            {/* Adicionar seleção */}
            <div className="px-3.5 pt-2">
              <button
                type="button"
                onClick={handleSend}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 text-sm font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30 cursor-pointer"
                aria-label="Adicionar seleção"
                title="Adicionar seleção"
              >
                <Send className="h-4 w-4" />
                <span>Adicionar seleção</span>
              </button>
            </div>
          </>
        )}

        {/* Mobile Tools Expandable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden flex items-center gap-2 px-3 pt-2.5 pb-1 animate-in slide-in-from-bottom-1 fade-in duration-200">
            <button
              type="button"
              onClick={() => {
                toggleBrush();
                setIsMobileMenuOpen(false);
              }}
              className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                isBrushActive ? "bg-violet-500/90 text-white" : "bg-white/[0.06] text-violet-100 hover:bg-white/[0.10]"
              }`}
            >
              <Pencil className="h-4 w-4" />
              <span>{isBrushActive ? "Sair do pincel" : "Pincel"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setIsMobileMenuOpen(false);
              }}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.10] cursor-pointer"
            >
              <Paperclip className="h-4 w-4" />
              <span>Anexar</span>
            </button>
          </div>
        )}

        {/* ── Main Input Row ────────────────────────────────────────── */}
        <div
          className={`flex items-end gap-2 px-3.5 max-lg:gap-1.5 max-lg:py-1.5 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFocused || refineText.length > 0 || attachments.length > 0 ? "py-3.5" : "py-2.5"
          }`}
        >
          {/* Mobile Tools Ellipsis */}
          <button
            type="button"
            aria-label="Ferramentas: pincel e anexar"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
              isMobileMenuOpen || isBrushActive
                ? "bg-violet-500/90 text-white"
                : "bg-white/[0.06] text-violet-200 hover:bg-white/[0.10]"
            }`}
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>

          {/* Desktop Pencil/Brush */}
          <button
            type="button"
            onClick={toggleBrush}
            className={`flex h-9 w-9 max-lg:hidden shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 cursor-pointer ${
              isBrushActive
                ? "bg-violet-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                : "bg-gradient-to-br from-violet-500/[0.15] to-purple-500/[0.08] text-[rgba(196,181,253,0.85)] hover:from-violet-500/25 hover:to-purple-500/[0.15] hover:text-[#e0d4ff]"
            }`}
            title="Marcar área da imagem"
            aria-label="Marcar área da imagem"
            aria-pressed={isBrushActive}
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>

          {/* Desktop Paperclip */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 max-lg:hidden shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/[0.15] to-purple-500/[0.08] text-[rgba(196,181,253,0.85)] transition-all duration-300 hover:from-violet-500/25 hover:to-purple-500/[0.15] hover:text-[#e0d4ff] hover:scale-105 cursor-pointer"
            title="Anexar imagem"
            aria-label="Anexar imagem"
          >
            <Paperclip className="h-[18px] w-[18px]" />
          </button>

          {/* Textarea */}
          <div className="area-do-campo flex min-w-0 flex-1 flex-col justify-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={refineText}
              onChange={handleTextareaChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && isSendActive) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={placeholder || (isBrushActive ? "Pinte a área que quer alterar..." : "Descreva a alteração mágica...")}
              className="campo-de-refino w-full min-w-0 resize-none bg-transparent px-1 py-[6px] text-[15px] leading-6 text-[#f0ecff] outline-none scrollbar-hide disabled:opacity-50"
              style={{ height: refineText.includes("\n") ? "60px" : "36px" }}
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!isSendActive}
            className={`flex h-9 w-9 max-lg:h-8 max-lg:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
              isSendActive
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white refine-send-active hover:scale-105 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                : "bg-white/[0.06] text-zinc-600 disabled:cursor-not-allowed"
            }`}
            title="Enviar refinamento"
            aria-label="Enviar refinamento"
            style={
              isSendActive
                ? {
                    background: "linear-gradient(135deg, rgb(168, 85, 247), rgba(168, 85, 247, 0.533))",
                    boxShadow: "rgba(168, 85, 247, 0.4) 0px 0px 12px"
                  }
                : {}
            }
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Fullscreen Attachment Modal */}
      {fullscreenPreview && (
        <div
          onClick={() => setFullscreenPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img src={fullscreenPreview} alt="Preview" className="max-h-[80vh] max-w-[85vw] object-contain" />
            <button
              type="button"
              onClick={() => setFullscreenPreview(null)}
              className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MagicRefineBar;
