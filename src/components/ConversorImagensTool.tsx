import React, { useState, useRef } from "react";
import {
  RefreshCw,
  Upload,
  Download,
  Image as ImageIcon,
  Check,
  FileDown,
  Trash2,
  Sliders,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface ConversorImagensToolProps {
  onClose?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

type TargetFormat = "webp" | "avif" | "png" | "jpeg";
type ResolutionTarget = "original" | "1080p" | "1920p" | "4k";

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  convertedUrl?: string;
  convertedSize?: number;
  status: "idle" | "converting" | "done" | "error";
  width?: number;
  height?: number;
}

export const ConversorImagensTool: React.FC<ConversorImagensToolProps> = ({
  onClose,
  showToast = () => {}
}) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [format, setFormat] = useState<TargetFormat>("webp");
  const [resolution, setResolution] = useState<ResolutionTarget>("original");
  const [quality, setQuality] = useState<number>(85);
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: FileItem[] = Array.from(files).map((file, i) => {
      const preview = URL.createObjectURL(file);
      return {
        id: `${Date.now()}_${i}`,
        file,
        previewUrl: preview,
        originalSize: file.size,
        status: "idle"
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    showToast(`${newItems.length} arquivo(s) adicionado(s).`, "info");
  };

  const convertSingle = async (item: FileItem): Promise<FileItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let targetW = img.width;
        let targetH = img.height;

        if (resolution === "1080p") {
          const maxDim = 1080;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }
        } else if (resolution === "1920p") {
          const maxDim = 1920;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }
        } else if (resolution === "4k") {
          const maxDim = 3840;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ ...item, status: "error" });
          return;
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mime =
          format === "webp"
            ? "image/webp"
            : format === "avif"
            ? "image/avif"
            : format === "jpeg"
            ? "image/jpeg"
            : "image/png";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ ...item, status: "error" });
              return;
            }
            const convertedUrl = URL.createObjectURL(blob);
            resolve({
              ...item,
              convertedUrl,
              convertedSize: blob.size,
              width: targetW,
              height: targetH,
              status: "done"
            });
          },
          mime,
          quality / 100
        );
      };
      img.onerror = () => {
        resolve({ ...item, status: "error" });
      };
      img.src = item.previewUrl;
    });
  };

  const handleConvertAll = async () => {
    if (items.length === 0) {
      showToast("Adicione ao menos uma imagem.", "warning");
      return;
    }

    setIsProcessingAll(true);
    const updated: FileItem[] = [];

    for (const it of items) {
      setItems((prev) =>
        prev.map((p) => (p.id === it.id ? { ...p, status: "converting" } : p))
      );
      const res = await convertSingle(it);
      updated.push(res);
      setItems((prev) => prev.map((p) => (p.id === it.id ? res : p)));
    }

    setIsProcessingAll(false);
    showToast("Todas as conversões foram finalizadas!", "success");
  };

  const downloadItem = (item: FileItem) => {
    if (!item.convertedUrl) return;
    const originalName = item.file.name.replace(/\.[^/.]+$/, "");
    const ext = format === "jpeg" ? "jpg" : format;
    const a = document.createElement("a");
    a.href = item.convertedUrl;
    a.download = `${originalName}_convertido.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    items.forEach((item) => {
      if (item.convertedUrl) downloadItem(item);
    });
    showToast("Downloads iniciados!", "success");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#09090b] text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Conversor de Imagens
                <span className="rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/30">
                  Batch Pro
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Converta entre formatos WebP, AVIF, PNG e JPEG com redução inteligente de peso e controle de escala.
              </p>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Painel Esquerdo: Controles */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 flex flex-col gap-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
              Formato de Saída
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              {(["webp", "avif", "png", "jpeg"] as TargetFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`py-2 px-1 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                    format === f ? "bg-violet-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mt-2">
              Resolução Máxima
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "original", label: "Original (100%)" },
                { id: "1080p", label: "1080p (Social Feed)" },
                { id: "1920p", label: "1920p (Full HD)" },
                { id: "4k", label: "4K (Ultra HD)" }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setResolution(r.id as any)}
                  className={`py-2 px-2.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                    resolution === r.id
                      ? "bg-violet-600/20 border-violet-500 text-white"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Slider de Compressão / Qualidade */}
            {format !== "png" && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">Qualidade da Compressão</span>
                  <span className="text-violet-400 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 block mt-1">
                  85% oferece o melhor equilíbrio visual sem perda perceptível de nitidez.
                </span>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 flex-1 flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                Arquivos para Conversão
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFiles}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-zinc-800 hover:border-violet-500/70 rounded-xl p-6 text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900/80 flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="h-10 w-10 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-white">Carregar fotos ou imagens</p>
                <p className="text-[11px] text-zinc-500 mt-1">Suporta envio em lote</p>
              </div>
            </div>

            <button
              type="button"
              disabled={items.length === 0 || isProcessingAll}
              onClick={handleConvertAll}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Convertendo {items.length} imagens...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Converter Todas ({items.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Painel Direito: Lista de Arquivos & Resultados */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden min-h-[460px]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
            <span className="text-xs font-semibold text-zinc-300">
              Fila de Conversão ({items.length})
            </span>
            {items.some((i) => i.status === "done") && (
              <button
                type="button"
                onClick={downloadAll}
                className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Baixar Todos</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-8 text-zinc-500">
                <ImageIcon className="h-12 w-12 mb-3 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">Nenhum arquivo adicionado</p>
                <p className="text-xs text-zinc-600 mt-1">Selecione imagens para iniciar a conversão em massa.</p>
              </div>
            ) : (
              items.map((item) => {
                const diffPercent = item.convertedSize
                  ? Math.round(((item.originalSize - item.convertedSize) / item.originalSize) * 100)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="h-12 w-12 rounded-lg object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate max-w-[200px] md:max-w-[300px]">
                          {item.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                          <span>Original: {formatBytes(item.originalSize)}</span>
                          {item.convertedSize && (
                            <>
                              <span>→</span>
                              <span className="text-violet-400 font-bold">
                                {formatBytes(item.convertedSize)}
                              </span>
                              {diffPercent > 0 && (
                                <span className="rounded bg-green-500/10 text-green-400 font-semibold px-1 py-0.2 text-[10px]">
                                  -{diffPercent}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "converting" && (
                        <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Convertendo...</span>
                        </div>
                      )}
                      {item.status === "done" && (
                        <button
                          type="button"
                          onClick={() => downloadItem(item)}
                          className="flex items-center gap-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                          <span>Baixar</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ConversorImagensTool;
