import React, { useState } from "react";
import { safeJsonResponse } from "../utils/safeFetch";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Layers,
  Eye,
  RefreshCw,
  Download,
  Wand2,
  ShieldCheck,
  Cpu,
  Feather,
  Type
} from "lucide-react";

interface MotorGenerativoProps {
  customApiKey?: string;
  initialImage?: string;
  onImageEnhanced?: (enhancedImageBase64: string) => void;
}

export default function MotorGenerativoMagnific({
  customApiKey = "",
  initialImage,
  onImageEnhanced
}: MotorGenerativoProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [targetHex, setTargetHex] = useState("#000000");
  const [semPromptAuto, setSemPromptAuto] = useState(true);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [techLogs, setTechLogs] = useState<string[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Weights (Plano de Fundo, Produto, Rosto, Tipografia)
  const [weights, setWeights] = useState({
    background: 0.1,
    productSubject: 0.95,
    face: 0.9,
    textEdges: 1.0
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCurrentImage(url);
        setAnalysisReport(null);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runTechnicalVisionAnalysis = async () => {
    if (!currentImage) return;
    setIsAnalyzing(true);
    setAnalysisReport(null);

    try {
      const res = await fetch("/api/analyze-image-tech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentImage,
          customApiKey
        })
      });

      const data = await safeJsonResponse(res);
      setAnalysisReport(data);
      if (data.dominantColorHex && (!targetHex || targetHex === "#000000" || targetHex === "")) {
        setTargetHex(data.dominantColorHex);
      }
      if (data.recommendedWeights && semPromptAuto) {
        setWeights({
          background: data.recommendedWeights.background ?? 0.1,
          productSubject: data.recommendedWeights.productSubject ?? 0.95,
          face: data.recommendedWeights.face ?? 0.9,
          textEdges: data.recommendedWeights.textEdges ?? 1.0
        });
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao conectar com o analisador de visão: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runGenerativeEnhancement = async () => {
    if (!currentImage) return;
    setIsProcessing(true);
    setTechLogs(["Iniciando pipeline do Motor Generativo (Sem Prompt)..."]);

    try {
      const res = await fetch("/api/enhancer-supir-magnific", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentImage,
          mode: "solid_background_fix",
          targetSolidColorHex: targetHex,
          fixBackgroundSmudges: true,
          weights: semPromptAuto
            ? { background: 0.1, productSubject: 0.95, face: 0.9, textEdges: 1.0 }
            : weights,
          customApiKey
        })
      });

      const data = await safeJsonResponse(res);
      if (data.image) {
        setResultImage(data.image);
        if (data.techLog) {
          setTechLogs(data.techLog);
        }
        if (onImageEnhanced) {
          onImageEnhanced(data.image);
        }
      } else {
        alert("Erro no reprocessamento: " + (data.error || "Tente novamente"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Falha no reprocessamento generativo: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl max-w-6xl mx-auto my-4 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
            <Cpu className="w-3.5 h-3.5" />
            MOTOR GENERATIVO "SEM PROMPT" • SUPIR & MAGNIFIC AI ARCHITECTURE
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Correção Definitiva de Fundo Sólido & Micro-texturas
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Reconstrói os detalhes injetando micro-texturas reais (pele, produtos e bordas) e isola o plano de fundo em cor sólida 100% limpa — eliminando definitivamente borrões, manchas de difusão e ruído cromático.
          </p>
        </div>

        {/* Sem Prompt Switch */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <div className="text-xs">
            <span className="font-semibold block text-white">Modo Auto "Sem Prompt"</span>
            <span className="text-slate-400 text-[11px]">Calibração Inteligente de Pesos</span>
          </div>
          <button
            onClick={() => setSemPromptAuto(!semPromptAuto)}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
              semPromptAuto ? "bg-amber-500" : "bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                semPromptAuto ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Upload/Source vs Analysis & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Image Source & Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" /> Imagem Original (Com Borrões/Ruído)
            </label>
            <label className="cursor-pointer text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium underline">
              Carregar outra imagem
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div className="relative aspect-square rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden flex items-center justify-center group">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Original"
                className="w-full h-full object-contain"
              />
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3 text-slate-500 hover:text-slate-300 transition-colors p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-sm font-medium">Clique para selecionar uma imagem com borrões</span>
                <span className="text-xs text-slate-600">Suporta PNG, JPG e WebP</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {currentImage && (
            <button
              onClick={runTechnicalVisionAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  Realizando Leitura Técnica da Imagem...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-amber-400" />
                  1. Executar Análise Técnica Prévia (Leitura de Luz/Textura)
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: Technical Diagnosis & Actions */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Diagnóstico Técnico Pré-Execução
            </h3>

            {analysisReport ? (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Tipo de Fundo:</span>
                  <span className="font-semibold text-amber-300 uppercase tracking-wide">
                    {analysisReport.backgroundType || "Fundo Sólido"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Manchas/Borrões de Difusão:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    analysisReport.smudgeArtifactsDetected
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {analysisReport.smudgeArtifactsDetected ? "Detectadas na Amostra" : "Sem Manchas Graves"}
                  </span>
                </div>

                {analysisReport.smudgeDescription && (
                  <p className="text-slate-300 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 italic leading-relaxed">
                    "{analysisReport.smudgeDescription}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Iluminação & Luz:</span>
                    <span className="text-slate-200 font-medium">{analysisReport.lightingAnalysis || "Normal"}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Mapeamento Rosto/Produto:</span>
                    <span className="text-amber-400 font-medium">
                      {analysisReport.faceMappingDetected ? "Humano Mapeado" : analysisReport.productTextureDetected ? "Produto Detectado" : "Vetores/Gerais"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                  <span className="font-semibold text-slate-200">Recomendação Técnica: </span>
                  {analysisReport.technicalSummary}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                {currentImage
                  ? "Clique em 'Executar Análise Técnica' para ler luz, sombras e mapear os borrões de difusão automaticamente."
                  : "Selecione uma imagem à esquerda para iniciar o processo."}
              </div>
            )}

            {/* Solid Color Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Cor do Fundo Sólido Definitivo (Zero Manchas):</span>
                <span className="font-mono text-amber-400">{targetHex}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={targetHex}
                  onChange={(e) => setTargetHex(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-1"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {["#000000", "#FFFFFF", "#0F172A", "#1E1B4B", "#172554", "#14532D", "#701A75", "#831843"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setTargetHex(hex)}
                      className={`w-7 h-7 rounded-full border border-slate-600 transition-transform ${
                        targetHex.toLowerCase() === hex.toLowerCase() ? "scale-110 ring-2 ring-amber-400" : ""
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Layer Weights (If not auto) */}
            {!semPromptAuto && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-amber-400" /> Pesos do Algoritmo Isolado</span>
                  <span className="text-amber-400 text-[10px]">Manual</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Plano de Fundo (Trava Sólida):</span>
                      <span>{(weights.background * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={weights.background}
                      onChange={(e) => setWeights({ ...weights, background: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Produto Principal (Micro-texturas):</span>
                      <span>{(weights.productSubject * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={weights.productSubject}
                      onChange={(e) => setWeights({ ...weights, productSubject: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Rosto Humano (Mapeamento de Poros):</span>
                      <span>{(weights.face * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={weights.face}
                      onChange={(e) => setWeights({ ...weights, face: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={runGenerativeEnhancement}
            disabled={!currentImage || isProcessing}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processando no Motor Generativo...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                2. Processar & Eliminar Borrões Definitivamente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Execution Logs */}
      {techLogs.length > 0 && (
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
          {techLogs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-slate-600">&gt;</span> {log}
            </div>
          ))}
        </div>
      )}

      {/* Result Display */}
      {resultImage && (
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resultado Final Definitivo Sem Borrões
            </h3>
            <a
              href={resultImage}
              download="imagem-fundo-solido-perfeita.png"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Baixar Imagem Processada
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Antes (Com Manchas de Difusão):</span>
              <div className="aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <img src={currentImage!} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Depois (Fundo Sólido Puro & Micro-texturas SUPIR):
              </span>
              <div className="aspect-square rounded-xl bg-slate-950 border border-amber-500/40 overflow-hidden shadow-2xl shadow-amber-500/10">
                <img src={resultImage} alt="Perfeita" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
