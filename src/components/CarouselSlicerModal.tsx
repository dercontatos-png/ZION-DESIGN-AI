import React, { useState, useEffect, useRef, useCallback } from "react";
import JSZip from "jszip";
import {
  X,
  Download,
  Layers,
  Columns3,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Loader2,
  Smartphone,
  ZoomIn,
  FileArchive,
  ArrowRight,
  Sliders,
  Scissors
} from "lucide-react";

interface CarouselSlicerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  projectName?: string;
}

interface SliceItem {
  id: number;
  label: string;
  dataUrl: string;
  width: number;
  height: number;
}

export const CarouselSlicerModal: React.FC<CarouselSlicerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  projectName = "carrossel-zion"
}) => {
  const [slideCount, setSlideCount] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<"panoramic" | "preview" | "slices">("panoramic");
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [slices, setSlices] = useState<SliceItem[]>([]);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [originalMeta, setOriginalMeta] = useState<{ width: number; height: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── FUNÇÃO DE FATIAMENTO COM ALTA FIDELIDADE (CANVAS HTML5) ──
  const sliceImage = useCallback(async () => {
    if (!imageUrl) return;
    setIsSlicing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = imageUrl;
      });

      const totalW = img.naturalWidth;
      const totalH = img.naturalHeight;
      setOriginalMeta({ width: totalW, height: totalH });

      const count = Math.max(2, Math.min(10, slideCount));
      const sliceWidth = Math.floor(totalW / count);
      const generatedSlices: SliceItem[] = [];

      for (let i = 0; i < count; i++) {
        const sx = i * sliceWidth;
        const sw = i === count - 1 ? totalW - sx : sliceWidth;

        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = totalH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) continue;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, sx, 0, sw, totalH, 0, 0, sw, totalH);

        const dataUrl = canvas.toDataURL("image/png");
        const label = i === 0 ? "01 (Capa)" : i === count - 1 ? `${String(i + 1).padStart(2, "0")} (Final/CTA)` : `${String(i + 1).padStart(2, "0")} (Conteúdo)`;

        generatedSlices.push({
          id: i + 1,
          label,
          dataUrl,
          width: sw,
          height: totalH
        });
      }

      setSlices(generatedSlices);
      if (previewIndex >= count) {
        setPreviewIndex(0);
      }
    } catch (err) {
      console.error("Erro ao fatiar carrossel:", err);
      showToast("Não foi possível fatiar a imagem.");
    } finally {
      setIsSlicing(false);
    }
  }, [imageUrl, slideCount]);

  useEffect(() => {
    if (isOpen && imageUrl) {
      sliceImage();
    }
  }, [isOpen, imageUrl, slideCount, sliceImage]);

  if (!isOpen || !imageUrl) return null;

  // ── DOWNLOAD DE UM SLIDE INDIVIDUAL ──
  const downloadSingleSlice = (slice: SliceItem) => {
    const a = document.createElement("a");
    a.href = slice.dataUrl;
    a.download = `${projectName}_slide_${String(slice.id).padStart(2, "0")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Slide ${slice.id} baixado!`);
  };

  // ── DOWNLOAD DO PACOTE COMPLETO (.ZIP) ──
  const downloadAllAsZip = async () => {
    if (!slices.length) return;
    setIsDownloadingZip(true);
    showToast("Gerando arquivo .ZIP com todas as lâminas...");

    try {
      const zip = new JSZip();
      const folder = zip.folder(projectName) || zip;

      slices.forEach((slice) => {
        const base64Data = slice.dataUrl.split(",")[1];
        const fileName = `slide_${String(slice.id).padStart(2, "0")}.png`;
        folder.file(fileName, base64Data, { base64: true });
      });

      // Inclui arquivo com instruções de postagem
      const readmeText = `=== ZION CARROSSEL CONTÍNUO ===
Total de Lâminas: ${slices.length}
Resolução por Lâmina: ${slices[0]?.width}x${slices[0]?.height}px

ORDEM DE PUBLICAÇÃO NO INSTAGRAM/LINKEDIN:
1. Selecione as imagens na ordem numérica (slide_01.png até slide_${String(slices.length).padStart(2, "0")}.png).
2. Não ative o recorte quadrado do Instagram para manter a proporção perfeita.
3. Publique e veja o efeito de continuidade perfeito ao arrastar!`;

      folder.file("instrucoes_de_postagem.txt", readmeText);

      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      const a = document.createElement("a");
      const url = URL.createObjectURL(content);
      a.href = url;
      a.download = `${projectName}_${slices.length}_slides.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Carrossel baixado com sucesso em .ZIP!");
    } catch (err) {
      console.error("Erro ao gerar ZIP do carrossel:", err);
      showToast("Erro ao compactar arquivos.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-2xl border border-white/10 bg-[rgba(12,10,24,0.96)] shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notifier */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-violet-500/40 bg-violet-950/90 px-4 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* ── CABEÇALHO DO MODAL ── */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-gradient-to-r from-violet-950/30 to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shadow-inner">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Fatiador de Carrossel Contínuo</h2>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300 border border-violet-500/30">
                  Seamless Instagram
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Divida sua arte panorâmica em lâminas conectadas com precisão de pixels.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── BARRA DE CONTROLE E ABAS ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-3 bg-white/[0.02]">
          {/* Seletor de Lâminas */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Columns3 className="h-4 w-4 text-violet-400" />
              Lâminas:
            </span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSlideCount(num)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    slideCount === num
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {num} Slides
                </button>
              ))}
            </div>

            {originalMeta && (
              <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-1 rounded-md border border-white/5">
                Corte: ~{Math.floor(originalMeta.width / slideCount)} × {originalMeta.height} px
              </span>
            )}
          </div>

          {/* Abas de Visualização */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("panoramic")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === "panoramic"
                  ? "bg-violet-600/30 border border-violet-500/40 text-violet-200"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Guias de Corte
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-violet-600/30 border border-violet-500/40 text-violet-200"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Simulador Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("slices")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === "slices"
                  ? "bg-violet-600/30 border border-violet-500/40 text-violet-200"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Lâminas ({slices.length})
            </button>
          </div>
        </div>

        {/* ── ÁREA CENTRAL DO CONTEÚDO ── */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[360px] flex items-center justify-center">
          {isSlicing ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <p className="text-sm font-medium text-zinc-300">Fatiando imagem em {slideCount} lâminas milimétricas...</p>
            </div>
          ) : (
            <>
              {/* ABA 1: VISÃO PANORÂMICA COM GUIAS DE DIVISÃO */}
              {activeTab === "panoramic" && (
                <div className="flex flex-col items-center w-full gap-4">
                  <div className="relative max-h-[50vh] max-w-full rounded-xl overflow-hidden border border-white/20 shadow-2xl group">
                    <img
                      src={imageUrl}
                      alt="Panorâmica para fatiar"
                      className="max-h-[50vh] object-contain select-none"
                    />

                    {/* Linhas de Divisão Verticais */}
                    <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${slideCount}, 1fr)` }}>
                      {Array.from({ length: slideCount }).map((_, idx) => (
                        <div
                          key={idx}
                          className="relative h-full border-r border-violet-400/60 last:border-r-0 flex flex-col justify-between p-2"
                          style={{
                            background: idx % 2 === 0 ? "rgba(139, 92, 246, 0.04)" : "transparent"
                          }}
                        >
                          <span className="self-start rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white border border-violet-400/40 shadow-md">
                            Lâmina {idx + 1}
                          </span>
                          <span className="self-center text-[10px] font-mono text-violet-300 bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx === 0 ? "Capa" : idx === slideCount - 1 ? "CTA" : "Slide"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-violet-950/20 px-3 py-1.5 rounded-lg border border-violet-500/20">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    <span>Linhas verticais indicam os cortes exatos. Nenhum pixel é perdido ou distorcido.</span>
                  </div>
                </div>
              )}

              {/* ABA 2: SIMULADOR DE FEED DO INSTAGRAM */}
              {activeTab === "preview" && slices.length > 0 && (
                <div className="flex flex-col items-center gap-4 w-full">
                  {/* Mockup de Celular */}
                  <div className="relative flex flex-col w-[320px] rounded-[36px] border-[6px] border-zinc-800 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
                    {/* Top Notch e Status */}
                    <div className="flex items-center justify-between px-6 pt-2 pb-1 text-[10px] text-zinc-400">
                      <span>9:41</span>
                      <div className="h-3 w-16 bg-zinc-800 rounded-full" />
                      <span>5G 100%</span>
                    </div>

                    {/* Instagram Header Mockup */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900 bg-zinc-950">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px]">
                          <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                            Z
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-white">sua.marca</span>
                            <span className="text-[10px] text-blue-400">✓</span>
                          </div>
                          <span className="text-[9px] text-zinc-500">Original audio</span>
                        </div>
                      </div>
                      <span className="text-zinc-400 text-xs">•••</span>
                    </div>

                    {/* Imagem do Slide Atual */}
                    <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden group">
                      <img
                        src={slices[previewIndex]?.dataUrl}
                        alt={`Slide ${previewIndex + 1}`}
                        className="h-full w-full object-cover select-none"
                      />

                      {/* Contador Flutuante */}
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {previewIndex + 1}/{slices.length}
                      </div>

                      {/* Botões de Navegação no Celular */}
                      {previewIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      {previewIndex < slices.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setPreviewIndex((prev) => Math.min(slices.length - 1, prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Bolinhas Indicadoras de Carrossel */}
                    <div className="flex items-center justify-center gap-1 py-2 bg-zinc-950">
                      {slices.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            previewIndex === idx ? "w-4 bg-blue-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Legenda Mockup */}
                    <div className="px-3 pb-3 pt-1 text-[10px] text-zinc-300 bg-zinc-950">
                      <span className="font-bold text-white mr-1.5">sua.marca</span>
                      Arraste para o lado para conferir este carrossel contínuo! 🔥
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={previewIndex === 0}
                      onClick={() => setPreviewIndex((p) => Math.max(0, p - 1))}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </button>
                    <span className="text-xs font-medium text-zinc-300">
                      Lâmina {previewIndex + 1} de {slices.length}
                    </span>
                    <button
                      type="button"
                      disabled={previewIndex === slices.length - 1}
                      onClick={() => setPreviewIndex((p) => Math.min(slices.length - 1, p + 1))}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      Próximo <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ABA 3: GRADE DE TODAS AS LÂMINAS */}
              {activeTab === "slices" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                  {slices.map((slice) => (
                    <div
                      key={slice.id}
                      className="group relative flex flex-col rounded-xl border border-white/10 bg-black/40 overflow-hidden shadow-lg transition-all hover:border-violet-500/40"
                    >
                      <div className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden">
                        <img
                          src={slice.dataUrl}
                          alt={`Lâmina ${slice.id}`}
                          className="h-full w-full object-cover select-none"
                        />
                        <span className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-white/10">
                          {slice.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 border-t border-white/5">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {slice.width}×{slice.height}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadSingleSlice(slice)}
                          className="flex items-center gap-1 text-[10px] font-medium text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                          title="Baixar apenas esta lâmina"
                        >
                          <Download className="h-3 w-3" />
                          PNG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RODAPÉ DE EXPORTAÇÃO ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Layers className="h-4 w-4 text-violet-400" />
            <span>{slices.length} lâminas prontas para postar em sequência</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <button
              type="button"
              disabled={isDownloadingZip || slices.length === 0}
              onClick={downloadAllAsZip}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-purple-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloadingZip ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compactando .ZIP...
                </>
              ) : (
                <>
                  <FileArchive className="h-4 w-4" />
                  Baixar Carrossel Completo (.ZIP)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
