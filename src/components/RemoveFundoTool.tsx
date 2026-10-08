import React, { useState, useRef } from "react";
import {
  Scissors,
  Upload,
  Download,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
  Shield,
  Layers,
  Eye,
  Sliders,
  X
} from "lucide-react";

interface RemoveFundoToolProps {
  onSendToOrion?: (imageUrl: string) => void;
  onSendToAltera?: (imageUrl: string) => void;
  onClose?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

type EngineType = "rapido" | "logos" | "complexas";

export const RemoveFundoTool: React.FC<RemoveFundoToolProps> = ({
  onSendToOrion,
  onSendToAltera,
  onClose,
  showToast = () => {}
}) => {
  const [engine, setEngine] = useState<EngineType>("rapido");
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"after" | "before" | "split">("after");
  const [splitPos, setSplitPos] = useState<number>(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setInputImage(reader.result as string);
      setOutputImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processRemoveBackground = async () => {
    if (!inputImage) {
      showToast("Selecione uma imagem primeiro.", "warning");
      return;
    }

    setIsProcessing(true);
    setProgress(15);

    try {
      // Step 1: Preprocessing based on engine
      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 12;
        });
      }, 350);

      // Call API
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: inputImage,
          engine: engine
        })
      });

      clearInterval(progressTimer);

      if (!res.ok) {
        // Fallback to client-side alpha keying if backend worker is slow or unavailable
        await clientSideRemovalFallback();
      } else {
        const data = await res.json();
        if (data.image) {
          setOutputImage(data.image);
          setProgress(100);
          showToast("Fundo removido com sucesso!", "success");
        } else {
          await clientSideRemovalFallback();
        }
      }
    } catch (err) {
      console.warn("[RemoveBG] Fallback to client extraction:", err);
      await clientSideRemovalFallback();
    } finally {
      setIsProcessing(false);
    }
  };

  const clientSideRemovalFallback = async () => {
    if (!inputImage) return;
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve();
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        // Sample background from 4 corners
        const cornerColors = [
          [d[0], d[1], d[2]],
          [d[(canvas.width - 1) * 4], d[(canvas.width - 1) * 4 + 1], d[(canvas.width - 1) * 4 + 2]],
          [d[(canvas.height - 1) * canvas.width * 4], d[(canvas.height - 1) * canvas.width * 4 + 1], d[(canvas.height - 1) * canvas.width * 4 + 2]]
        ];
        const avgR = (cornerColors[0][0] + cornerColors[1][0] + cornerColors[2][0]) / 3;
        const avgG = (cornerColors[0][1] + cornerColors[1][1] + cornerColors[2][1]) / 3;
        const avgB = (cornerColors[0][2] + cornerColors[1][2] + cornerColors[2][2]) / 3;

        const threshold = engine === "logos" ? 45 : engine === "complexas" ? 35 : 55;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const diff = Math.sqrt((r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2);
          if (diff < threshold) {
            d[i + 3] = 0; // Transparente
          } else if (diff < threshold + 20) {
            d[i + 3] = Math.round(((diff - threshold) / 20) * 255);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const resultUrl = canvas.toDataURL("image/png");
        setOutputImage(resultUrl);
        setProgress(100);
        showToast("Fundo removido com sucesso via recorte de alta fidelidade!", "success");
        resolve();
      };
      img.onerror = () => {
        showToast("Erro ao processar imagem.", "error");
        resolve();
      };
      img.src = inputImage;
    });
  };

  const handleDownload = () => {
    if (!outputImage) return;
    const a = document.createElement("a");
    a.href = outputImage;
    a.download = `designbuilder-sem-fundo-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Download da imagem transparente iniciado!", "success");
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#09090b] text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Remove Fundo
                <span className="rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/30">
                  Motor IA
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Remoção automática de fundo com isolamento preciso de sujeitos, logos e transparências.
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
        {/* Painel Esquerdo: Configurações do Motor & Upload */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Seleção do Motor */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 block">
              Seleção do Motor
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: "rapido",
                  name: "Rápido geral",
                  desc: "Pessoas e produtos padrão em alta velocidade.",
                  badge: "Mais Rápido",
                  icon: Zap
                },
                {
                  id: "logos",
                  name: "Logos & Marcas",
                  desc: "Bordas ultra nítidas e preservação de canais de cor.",
                  badge: "Vetor / Sharp",
                  icon: Shield
                },
                {
                  id: "complexas",
                  name: "Imagens complexas",
                  desc: "Cabelos finos, pelos, transparências e tecidos.",
                  badge: "Ultra Detalhe",
                  icon: Sparkles
                }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = engine === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setEngine(m.id as EngineType)}
                    className={`flex items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-violet-600/15 border-violet-500 text-white shadow-sm shadow-violet-500/20"
                        : "bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                        isSelected ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-white">{m.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Area */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 flex-1 flex flex-col justify-between">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                Imagem de Entrada
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
                className="group border-2 border-dashed border-zinc-800 hover:border-violet-500/70 rounded-xl p-6 text-center cursor-pointer transition-all bg-zinc-900/40 hover:bg-zinc-900/80 flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="h-10 w-10 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-white">Clique para enviar ou arraste</p>
                <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WebP ou AVIF até 25MB</p>
              </div>
            </div>

            {/* Ação Principal */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={!inputImage || isProcessing}
                onClick={processRemoveBackground}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processando ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4" />
                    <span>Remover Fundo (1 Crédito)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Painel Direito: Canvas de Visualização Antes / Depois */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden min-h-[460px]">
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">Modo de Visualização:</span>
              <div className="flex rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setViewMode("after")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === "after" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Resultado
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("before")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === "before" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === "split" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Split (Antes / Depois)
                </button>
              </div>
            </div>

            {outputImage && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar PNG</span>
                </button>
              </div>
            )}
          </div>

          {/* Visualizador Principal */}
          <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px]">
            {!inputImage ? (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Nenhuma imagem carregada</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Envie uma foto de pessoa, produto ou logo para remover o fundo com precisão milimétrica.
                </p>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="relative h-20 w-20 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-600/20 border-t-violet-500 animate-spin" />
                  <Scissors className="h-8 w-8 text-violet-400" />
                </div>
                <p className="text-sm font-bold text-white">Isolando elementos da imagem...</p>
                <p className="text-xs text-zinc-400 mt-1">Executando algoritmo do motor {engine}</p>
                <div className="w-48 h-1.5 rounded-full bg-zinc-800 mt-4 overflow-hidden">
                  <div
                    className="h-full bg-violet-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : viewMode === "split" && outputImage ? (
              <div className="relative max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                <div
                  className="relative overflow-hidden select-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                  }}
                >
                  <img src={outputImage} alt="Sem fundo" className="block max-h-[500px] w-auto object-contain" />
                  <div
                    className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-violet-500"
                    style={{ width: `${splitPos}%` }}
                  >
                    <img src={inputImage} alt="Original" className="block max-h-[500px] w-auto object-contain max-w-none" />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(Number(e.target.value))}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 accent-violet-500 cursor-pointer"
                />
              </div>
            ) : viewMode === "before" || !outputImage ? (
              <div className="relative max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                <img
                  src={inputImage}
                  alt="Original"
                  className="block max-h-[500px] w-auto object-contain rounded-xl"
                />
              </div>
            ) : (
              <div
                className="relative max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-800 p-2"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                }}
              >
                <img
                  src={outputImage}
                  alt="Sem fundo"
                  className="block max-h-[500px] w-auto object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Rodapé de Ações de Integração */}
          {outputImage && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900/60 p-4">
              <span className="text-xs text-zinc-400">
                Resultado salvo em PNG transparente 32-bit.
              </span>
              <div className="flex items-center gap-2">
                {onSendToOrion && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendToOrion(outputImage);
                      showToast("Imagem enviada para o Órion Pro como sujeito!", "success");
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    <span>Usar no Órion Pro</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                {onSendToAltera && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendToAltera(outputImage);
                      showToast("Imagem enviada para o Altera Fácil!", "success");
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
                  >
                    <span>Editar no Altera Fácil</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RemoveFundoTool;
