import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Video,
  Loader2,
  Sparkles,
  Download,
  Eye,
  Palette,
  Type,
  Camera,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Image as ImageIcon,
  Play,
  FileVideo,
  Wand2,
  AlertTriangle,
} from "lucide-react";

interface Scene {
  timestamp: string;
  description: string;
  framing: string;
  caption_text: string;
  key_words: string[];
  mood: string;
}

interface VideoAnalysisResult {
  transcription: string;
  scenes: Scene[];
  color_palette: string[];
  central_elements: string;
  style_notes: string;
  suggested_accent_colors: string[];
}

interface GeneratedFrame {
  imageUrl: string;
  prompt: string;
  scene: {
    timestamp: string;
    caption_text: string;
    key_words: string[];
    mood: string;
  };
}

interface VideoAnalysisProps {
  customApiKey?: string;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ customApiKey }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysisResult | null>(null);
  const [generatedFrames, setGeneratedFrames] = useState<GeneratedFrame[]>([]);
  const [accentColor, setAccentColor] = useState("#FFD700");
  const [numFrames, setNumFrames] = useState(3);
  const [error, setError] = useState("");
  const [analysisExpanded, setAnalysisExpanded] = useState(true);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [previewFrame, setPreviewFrame] = useState<GeneratedFrame | null>(null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Frame extraction from real video via Canvas ──
  const captureVideoFrameAt = (timeInSeconds: number): Promise<string> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) return resolve("");

      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1080;
          canvas.height = video.videoHeight || 1920;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            video.removeEventListener("seeked", onSeeked);
            return resolve(dataUrl);
          }
        } catch (e) {
          console.warn("Frame capture error:", e);
        }
        video.removeEventListener("seeked", onSeeked);
        resolve("");
      };

      video.addEventListener("seeked", onSeeked);
      video.currentTime = Math.max(0.1, timeInSeconds);
    });
  };

  // ── Drag & Drop handlers ──
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        loadVideo(file);
      } else {
        setError("Apenas arquivos de vídeo (MP4) são aceitos.");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadVideo(files[0]);
    }
  };

  const loadVideo = (file: File) => {
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setError("");
    setAnalysis(null);
    setGeneratedFrames([]);
    setActiveStep(1);
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreviewUrl("");
    setAnalysis(null);
    setGeneratedFrames([]);
    setError("");
    setActiveStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Step 1: Analyze Video ──
  const analyzeVideo = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      if (customApiKey) formData.append("customApiKey", customApiKey);

      const res = await fetch("/api/video-analysis", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na análise");

      setAnalysis(data.analysis);
      setActiveStep(2);

      // Set accent color from suggestions
      if (data.analysis?.suggested_accent_colors?.[0]) {
        setAccentColor(data.analysis.suggested_accent_colors[0]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao analisar o vídeo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Step 3: Generate Styleframes ──
  const generateFrames = async () => {
    if (!analysis) return;
    setIsGenerating(true);
    setGeneratedFrames([]);
    setGeneratingProgress(10);
    setError("");

    try {
      // Capture REAL frames from the video element at timestamps
      const selectedScenes = analysis.scenes.slice(0, Math.min(numFrames, analysis.scenes.length));
      const frameImages: string[] = [];

      for (let i = 0; i < selectedScenes.length; i++) {
        const scene = selectedScenes[i] as any;
        let sec = scene.time_seconds;
        if (sec === undefined && scene.timestamp) {
          const parts = String(scene.timestamp).split(":").map(Number);
          sec = parts.length === 2 ? parts[0] * 60 + parts[1] : (i + 1) * 2;
        }
        const frameB64 = await captureVideoFrameAt(sec || 1.5);
        if (frameB64) frameImages.push(frameB64);
        setGeneratingProgress(10 + Math.round(((i + 1) / selectedScenes.length) * 30));
      }

      console.log(`[VideoAnalysis] Captured ${frameImages.length} real video frame snapshots.`);

      const res = await fetch("/api/video-generate-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          customApiKey,
          accentColor,
          numFrames,
          frameImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na geração");

      setGeneratedFrames(data.frames || []);
      setActiveStep(3);
      setGeneratingProgress(100);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar styleframes.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Download ──
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(url, "_blank");
    }
  };

  const downloadAll = async () => {
    for (let i = 0; i < generatedFrames.length; i++) {
      await downloadImage(
        generatedFrames[i].imageUrl,
        `styleframe_${i + 1}.jpg`
      );
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#09090b] text-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-zinc-800/80 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Video size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">
                Análise Audiovisual
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-wide">
                Envie um vídeo → IA analisa → Gera styleframes com legendas dinâmicas
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-1">
            {[
              { num: 1, label: "Upload", icon: Upload },
              { num: 2, label: "Análise", icon: Eye },
              { num: 3, label: "Resultado", icon: Sparkles },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                {idx > 0 && (
                  <div
                    className={`w-8 h-px ${
                      activeStep >= step.num
                        ? "bg-amber-500"
                        : "bg-zinc-800"
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeStep >= step.num
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                  }`}
                >
                  <step.icon size={11} />
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium"
              >
                <AlertTriangle size={14} className="shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError("")} className="hover:text-red-300 transition-colors">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════ STEP 1: Upload ════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Zone */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-black">
                  1
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Upload do Vídeo
                </h2>
              </div>

              {!videoFile ? (
                <div
                  ref={dropZoneRef}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                    isDragging
                      ? "border-amber-500 bg-amber-500/10 scale-[1.02]"
                      : "border-zinc-700/50 hover:border-amber-500/50 bg-zinc-900/40 hover:bg-zinc-900/60"
                  }`}
                  style={{ minHeight: 320 }}
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                    backgroundSize: "24px 24px"
                  }} />

                  <div className="relative flex flex-col items-center justify-center h-full py-16 px-8">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                      isDragging
                        ? "bg-amber-500/20 scale-110 rotate-3"
                        : "bg-zinc-800/80 group-hover:bg-amber-500/10 group-hover:scale-105"
                    }`}>
                      <FileVideo size={32} className={`transition-colors ${isDragging ? "text-amber-400" : "text-zinc-500 group-hover:text-amber-500"}`} />
                    </div>

                    <p className="text-sm font-bold text-zinc-300 mb-1">
                      {isDragging ? "Solte o vídeo aqui!" : "Arraste e solte seu vídeo"}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-medium mb-5">
                      ou clique para selecionar • MP4, MOV, WebM • até 500MB
                    </p>

                    <div className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-400 text-[10px] font-bold uppercase tracking-wider group-hover:bg-amber-500/15 transition-colors">
                      Escolher Arquivo
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      src={videoPreviewUrl}
                      controls
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain"
                    />

                    <button
                      onClick={clearVideo}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/80 hover:bg-red-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Video Info */}
                  <div className="px-4 py-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play size={12} className="text-amber-500" />
                      <span className="text-[11px] font-bold text-zinc-300 truncate max-w-[200px]">
                        {videoFile.name}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-medium">
                        ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>

                    <button
                      onClick={analyzeVideo}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Wand2 size={12} />
                          Analisar Vídeo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Analysis Loading Overlay */}
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                          <Loader2 size={28} className="animate-spin text-amber-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-white mb-1">Analisando o vídeo com IA...</p>
                          <p className="text-[10px] text-zinc-400">Transcrição, paleta de cores, enquadramento, elementos</p>
                        </div>
                        <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 25, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ════════════ STEP 2: Analysis Results & Config ════════════ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                  analysis ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-600"
                }`}>
                  2
                </div>
                <h2 className={`text-xs font-black uppercase tracking-wider ${
                  analysis ? "text-zinc-300" : "text-zinc-600"
                }`}>
                  Configuração & Análise
                </h2>
              </div>

              {!analysis ? (
                <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 flex flex-col items-center justify-center py-20 px-8">
                  <Eye size={32} className="text-zinc-800 mb-4" />
                  <p className="text-xs text-zinc-600 font-medium text-center">
                    Envie um vídeo e clique em "Analisar" para ver os resultados da IA aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Accent Color & Config */}
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Configuração dos Frames
                      </span>
                      <span className="text-[9px] text-zinc-600 font-medium">
                        {analysis.scenes.length} cenas detectadas
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Accent Color */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Palette size={10} />
                          Cor de Destaque
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                          />
                          <div className="flex-1 flex gap-1.5">
                            {(analysis.suggested_accent_colors || ["#FFD700", "#FF4500", "#00FF88"]).map((color) => (
                              <button
                                key={color}
                                onClick={() => setAccentColor(color)}
                                className={`w-7 h-7 rounded-lg border-2 transition-all ${
                                  accentColor === color
                                    ? "border-white scale-110"
                                    : "border-transparent hover:border-zinc-600"
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Number of frames */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon size={10} />
                          Nº de Frames
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <button
                              key={n}
                              onClick={() => setNumFrames(n)}
                              disabled={n > analysis.scenes.length}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                numFrames === n
                                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                                  : n > analysis.scenes.length
                                  ? "bg-zinc-900 text-zinc-700 cursor-not-allowed"
                                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  {analysis.color_palette && (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-3">
                        <Palette size={10} />
                        Paleta de Cores do Vídeo
                      </span>
                      <div className="flex gap-2">
                        {analysis.color_palette.map((color, i) => (
                          <div key={i} className="flex-1 space-y-1">
                            <div
                              className="h-10 rounded-lg border border-zinc-700/50"
                              style={{ backgroundColor: color }}
                            />
                            <p className="text-[8px] text-zinc-600 font-mono text-center">{color}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collapsible Analysis Details */}
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden">
                    <button
                      onClick={() => setAnalysisExpanded(!analysisExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/40 transition-colors"
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Camera size={10} />
                        Detalhes da Análise
                      </span>
                      {analysisExpanded ? <ChevronUp size={12} className="text-zinc-600" /> : <ChevronDown size={12} className="text-zinc-600" />}
                    </button>

                    <AnimatePresence>
                      {analysisExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {/* Transcription */}
                            {analysis.transcription && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">Transcrição</span>
                                <p className="text-[11px] text-zinc-400 leading-relaxed bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                  {analysis.transcription}
                                </p>
                              </div>
                            )}

                            {/* Central Elements */}
                            {analysis.central_elements && (
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">Elementos Centrais</span>
                                <p className="text-[11px] text-zinc-400">{analysis.central_elements}</p>
                              </div>
                            )}

                            {/* Scenes */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">
                                Cenas ({analysis.scenes.length})
                              </span>
                              <div className="space-y-2">
                                {analysis.scenes.map((scene, i) => (
                                  <div key={i} className="bg-black/40 p-3 rounded-lg border border-zinc-800/50 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-amber-400">
                                        {scene.timestamp}
                                      </span>
                                      <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                                        {scene.framing}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400">{scene.description}</p>
                                    {scene.caption_text && (
                                      <p className="text-[10px] text-zinc-300 font-medium flex items-center gap-1">
                                        <Type size={9} className="text-amber-500 shrink-0" />
                                        "{scene.caption_text}"
                                      </p>
                                    )}
                                    {scene.key_words?.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {scene.key_words.map((kw, j) => (
                                          <span
                                            key={j}
                                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                            style={{
                                              backgroundColor: accentColor + "22",
                                              color: accentColor,
                                              border: `1px solid ${accentColor}44`,
                                            }}
                                          >
                                            {kw}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateFrames}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.98]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Gerando Styleframes...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Gerar {numFrames} Styleframe{numFrames > 1 ? "s" : ""} com Legendas Dinâmicas
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ════════════ Generation Progress ════════════ */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Gerando Styleframes com IA...</p>
                    <p className="text-[10px] text-zinc-400">Imagen 3 está criando seus frames com legendas dinâmicas</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(generatingProgress + 10, 90)}%` }}
                    transition={{ duration: numFrames * 20, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ════════════ STEP 3: Generated Frames Gallery ════════════ */}
          {generatedFrames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-black">
                    3
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Styleframes Gerados ({generatedFrames.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={generateFrames}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                  >
                    <RefreshCw size={10} />
                    Regerar
                  </button>
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                  >
                    <Download size={10} />
                    Baixar Todos
                  </button>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedFrames.map((frame, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden hover:border-amber-500/30 transition-all duration-300"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-[9/16] bg-black cursor-pointer overflow-hidden"
                      onClick={() => setPreviewFrame(frame)}
                    >
                      <img
                        src={frame.imageUrl}
                        alt={`Styleframe ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(frame.imageUrl, `styleframe_${i + 1}.jpg`);
                            }}
                            className="w-10 h-10 bg-amber-500/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-black hover:bg-amber-400 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Scene badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                        {frame.scene.timestamp}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <p className="text-[11px] text-zinc-300 font-medium line-clamp-2">
                        "{frame.scene.caption_text}"
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {frame.scene.key_words?.map((kw, j) => (
                          <span
                            key={j}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: accentColor + "22",
                              color: accentColor,
                              border: `1px solid ${accentColor}44`,
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                        <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
                          {frame.scene.mood}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ════════════ Fullscreen Preview Modal ════════════ */}
      <AnimatePresence>
        {previewFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-8"
            onClick={() => setPreviewFrame(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-lg w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewFrame.imageUrl}
                alt="Preview"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-xs text-zinc-300 font-medium">
                    "{previewFrame.scene.caption_text}"
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {previewFrame.scene.timestamp} • {previewFrame.scene.mood}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadImage(previewFrame.imageUrl, "styleframe_preview.jpg")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                  >
                    <Download size={12} />
                      Baixar
                  </button>
                  <button
                    onClick={() => setPreviewFrame(null)}
                    className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoAnalysis;
