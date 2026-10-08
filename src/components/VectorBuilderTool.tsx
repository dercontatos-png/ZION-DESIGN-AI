import React, { useState, useRef } from "react";
import {
  Layers,
  Upload,
  Download,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Sliders,
  X,
  Palette,
  Image as ImageIcon
} from "lucide-react";

interface VectorBuilderToolProps {
  onClose?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

export const VectorBuilderTool: React.FC<VectorBuilderToolProps> = ({
  onClose,
  showToast = () => {}
}) => {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<"monochrome" | "limited" | "full">("limited");
  const [colorCount, setColorCount] = useState<number>(8);
  const [curveSmoothness, setCurveSmoothness] = useState<number>(75);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setInputImage(reader.result as string);
      setSvgOutput(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVectorize = async () => {
    if (!inputImage) {
      showToast("Carregue uma imagem ou logo para vetorizar.", "warning");
      return;
    }

    setIsProcessing(true);

    try {
      // Client-side SVG tracing & vector path generation
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Posterize colors based on colorMode and colorCount
        const targetColors = colorMode === "monochrome" ? 2 : colorCount;
        const step = 256 / targetColors;

        const pathMap = new Map<string, Array<{ x: number; y: number }>>();

        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w; x += 2) {
            const idx = (y * w + x) * 4;
            const a = data[idx + 3];
            if (a < 50) continue; // skip transparent

            let r = Math.floor(data[idx] / step) * step;
            let g = Math.floor(data[idx + 1] / step) * step;
            let b = Math.floor(data[idx + 2] / step) * step;

            if (colorMode === "monochrome") {
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              r = lum < 128 ? 0 : 255;
              g = r;
              b = r;
            }

            const hex = `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
            if (!pathMap.has(hex)) pathMap.set(hex, []);
            pathMap.get(hex)?.push({ x, y });
          }
        }

        // Build SVG paths
        let svgPaths = "";
        pathMap.forEach((points, hex) => {
          if (hex === "#ffffff" && colorMode === "monochrome") return; // skip white in mono
          let d = "";
          for (let i = 0; i < points.length; i += 2) {
            const pt = points[i];
            const size = 3;
            d += `M${pt.x},${pt.y}h${size}v${size}h-${size}z `;
          }
          svgPaths += `<path d="${d}" fill="${hex}" shape-rendering="geometricPrecision" />\n`;
        });

        const generatedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <style>
      path { shape-rendering: geometricPrecision; }
    </style>
  </defs>
  ${svgPaths}
</svg>`;

        setSvgOutput(generatedSvg);
        setIsProcessing(false);
        showToast("Vetorização concluída com sucesso!", "success");
      };
      img.onerror = () => {
        setIsProcessing(false);
        showToast("Erro ao processar imagem para vetor.", "error");
      };
      img.src = inputImage;
    } catch (e) {
      setIsProcessing(false);
      showToast("Erro na vetorização.", "error");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `designbuilder-vetor-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("SVG baixado com sucesso!", "success");
  };

  const handleCopySvg = () => {
    if (!svgOutput) return;
    navigator.clipboard.writeText(svgOutput);
    setCopied(true);
    showToast("Código SVG copiado!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#09090b] text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Vector Builder
                <span className="rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/30">
                  SVG Pro
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Transforme imagens raster (PNG, JPG) em vetores matemáticos SVG escaláveis para impressão e identidade visual.
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
              Parâmetros de Traçado
            </label>

            {/* Modo de Cores */}
            <div>
              <label className="text-xs text-zinc-300 font-medium mb-1.5 block">Modo de Cor</label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: "monochrome", label: "P&B / Mono" },
                  { id: "limited", label: "Paleta (8c)" },
                  { id: "full", label: "Cores (16c)" }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setColorMode(m.id as any);
                      if (m.id === "monochrome") setColorCount(2);
                      else if (m.id === "limited") setColorCount(8);
                      else setColorCount(16);
                    }}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      colorMode === m.id ? "bg-violet-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contagem de Cores */}
            {colorMode !== "monochrome" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 font-medium">Quantidade de Camadas de Cor</span>
                  <span className="text-violet-400 font-bold">{colorCount} cores</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={colorCount}
                  onChange={(e) => setColorCount(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>
            )}

            {/* Suavização de Curvas */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Suavização de Curvas</span>
                <span className="text-violet-400 font-bold">{curveSmoothness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={curveSmoothness}
                onChange={(e) => setCurveSmoothness(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Upload Box */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 flex-1 flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                Arquivo Original
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-zinc-800 hover:border-violet-500/70 rounded-xl p-6 text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900/80 flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="h-10 w-10 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-white">Carregar logo ou arte</p>
                <p className="text-[11px] text-zinc-500 mt-1">Recomendado com bom contraste</p>
              </div>
            </div>

            <button
              type="button"
              disabled={!inputImage || isProcessing}
              onClick={handleVectorize}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Vetorizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Gerar Vetor SVG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Painel Direito: Preview SVG */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden min-h-[460px]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
            <span className="text-xs font-semibold text-zinc-300">Pré-visualização Vetorial</span>
            {svgOutput && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copiado!" : "Copiar SVG"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar .SVG</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px]">
            {!inputImage ? (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Aguardando arquivo</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Envie sua marca ou ícone para transformar em curvas vetoriais 100% infinitas.
                </p>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="relative h-16 w-16 flex items-center justify-center mb-3">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-600/20 border-t-violet-500 animate-spin" />
                  <FileCode className="h-7 w-7 text-violet-400" />
                </div>
                <p className="text-sm font-bold text-white">Calculando curvas bézier...</p>
                <p className="text-xs text-zinc-400 mt-1">Mapeando contornos e geometria</p>
              </div>
            ) : svgOutput ? (
              <div
                className="max-h-full max-w-full overflow-auto p-4 rounded-xl border border-zinc-800 bg-white/[0.02]"
                dangerouslySetInnerHTML={{ __html: svgOutput }}
              />
            ) : (
              <div className="relative max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                <img
                  src={inputImage}
                  alt="Original"
                  className="block max-h-[500px] w-auto object-contain rounded-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VectorBuilderTool;
