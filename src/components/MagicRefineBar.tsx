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
  className?: string;
  onSendRefine: (text: string, attachments: MagicRefineAttachment[], isBrush: boolean) => void;
  onPublishCommunity?: () => void;
  onFormatClick?: () => void;
  isProcessing?: boolean;
  activeImage?: string | null;
  agentColor?: string;
  placeholder?: string;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onBrushToggle?: (active: boolean) => void;
}

export const MagicRefineBar: React.FC<MagicRefineBarProps> = ({
  className,
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
  const [showPublishAlert, setShowPublishAlert] = useState<boolean>(false);
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
  const [isFormatOpen, setIsFormatOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalZoom(zoomLevel);
  }, [zoomLevel]);

  const toggleBrush = () => {
    const next = !isBrushActive;
    setIsBrushActive(next);
    onBrushToggle?.(next);
  };

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    const newAttachments: MagicRefineAttachment[] = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRefineText(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 120) + "px";
  };

  const handleSend = () => {
    if ((refineText.trim() || attachments.length > 0) && !isProcessing) {
      onSendRefine(refineText.trim(), attachments, isBrushActive);
      setRefineText("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const isSendActive = (refineText.trim().length > 0 || attachments.length > 0) && !isProcessing;

  const containerClass = className || "pointer-events-auto absolute bottom-8 left-1/2 z-20 flex w-[min(92vw,480px)] -translate-x-1/2 flex-col items-center gap-2.5 lg:w-[calc(100%-120px)] transition-[max-width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:max-w-[480px]";

  return (
    <div className={containerClass}>
      {/* ── TOOLBAR SUPERIOR (PÓS-PRODUÇÃO E FORMATO - 100% IDÊNTICO AO SNIPPET) ── */}
      <div data-testid="text-actions-toolbar" className="relative z-30 flex w-full items-center justify-between gap-3 px-0.5">
        <button
          type="button"
          onClick={toggleBrush}
          className={`magic-bar relative inline-flex min-h-9 items-center gap-2 overflow-hidden rounded-lg px-3 text-xs font-medium text-violet-100 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400${
            isBrushActive ? " bg-violet-600/30 text-violet-200 border border-violet-500/40" : ""
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
              onClick={() => {
                if (onFormatClick) onFormatClick();
                else setIsFormatOpen(!isFormatOpen);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crop h-4 w-4" aria-hidden="true">
                <path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
              </svg>
              Formato
            </button>
          </div>
          {isFormatOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 z-40 min-w-[160px] rounded-xl py-1.5 border border-white/[0.08] bg-[rgba(15,10,30,0.95)] backdrop-blur-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="px-2 pb-1 text-[10px] font-medium text-zinc-500">Alterar Formato</p>
              <div className="grid grid-cols-3 gap-1">
                {["1:1", "4:5", "9:16", "16:9", "3:4", "4:3"].map((dim) => (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => {
                      setIsFormatOpen(false);
                      if (onFormatClick) onFormatClick();
                    }}
                    className="flex h-8 items-center justify-center rounded-lg text-xs font-semibold cursor-pointer text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  >
                    {dim}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BARRA DE REFINAMENTO MÁGICO OFICIAL (MAGIC BAR - 100% IDÊNTICO AO SNIPPET) ── */}
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
        {/* Drag & Drop Overlay (100% IDÊNTICO AO SNIPPET) */}
        <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${isDragOver ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-violet-400/50 bg-violet-500/[0.08] py-5 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-plus h-5 w-5 text-violet-300 animate-pulse" aria-hidden="true">
                <path d="M16 5h6"></path><path d="M19 2v6"></path><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"></path><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path><circle cx="9" cy="9" r="2"></circle>
              </svg>
              <span className="text-sm font-medium text-violet-200">Solte a imagem aqui</span>
            </div>
          </div>
        </div>

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

        {/* Mobile Tools Expandable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden flex items-center gap-2 px-3 pt-2.5 pb-1 border-t border-white/5 animate-in slide-in-from-bottom-1 fade-in duration-200">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil h-4 w-4" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
              {isBrushActive ? "Sair do pincel" : "Pincel"}
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setIsMobileMenuOpen(false);
              }}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.10] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip h-4 w-4" aria-hidden="true"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"></path></svg>
              Anexar
            </button>
          </div>
        )}

        {/* ── Main Input Row (100% IDÊNTICO AO SNIPPET) ── */}
        <div
          className="flex items-end gap-2 px-3.5 max-lg:gap-1.5 max-lg:py-1.5 transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] py-2.5"
        >
          {/* Mobile Tools Ellipsis */}
          <button
            type="button"
            aria-label="Ferramentas: pincel e anexar"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors bg-white/[0.06] text-violet-200 hover:bg-white/[0.10] active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis lucide-more-horizontal h-[18px] w-[18px]" aria-hidden="true">
              <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil h-[18px] w-[18px]" aria-hidden="true">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path>
            </svg>
          </button>

          {/* Desktop Paperclip */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 max-lg:hidden shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/[0.15] to-purple-500/[0.08] text-[rgba(196,181,253,0.85)] transition-all duration-300 hover:from-violet-500/25 hover:to-purple-500/[0.15] hover:text-[#e0d4ff] hover:scale-105 cursor-pointer"
            title="Anexar imagem"
            aria-label="Anexar imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip h-[18px] w-[18px]" aria-hidden="true">
              <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"></path>
            </svg>
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
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!isSendActive}
            className={`flex h-9 w-9 max-lg:h-8 max-lg:w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
              isSendActive
                ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white"
                : "bg-white/[0.06] text-zinc-600"
            }`}
            title="Enviar refinamento"
            aria-label="Enviar refinamento"
          >
            {isProcessing ? (
              <span className="h-[18px] w-[18px] rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send h-[18px] w-[18px]" aria-hidden="true">
                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path>
              </svg>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.svg"
          multiple
          className="hidden"
          type="file"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Modal Tela Cheia Anexo */}
      {fullscreenPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFullscreenPreview(null)}
        >
          <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img src={fullscreenPreview} alt="" className="max-h-[85vh] max-w-[85vw] object-contain" />
            <button
              type="button"
              onClick={() => setFullscreenPreview(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm ring-1 ring-white/10 transition-colors hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
