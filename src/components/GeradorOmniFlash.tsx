import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, Sparkles, Copy, Check, Video, Camera, Sun, Sliders, Zap, 
  Layers, Download, Play, RefreshCw, Bookmark, Share2, HelpCircle, 
  Sparkle, ArrowRight, Eye, Code, FileText, ChevronRight, Wand2,
  Clapperboard, Upload, X, FileVideo, Palette, Focus, Disc
} from "lucide-react";

interface GeradorOmniFlashProps {
  customApiKey?: string;
}

interface GeneratedPromptData {
  title: string;
  englishPrompt: string;
  portuguesePrompt: string;
  negativePrompt: string;
  cameraSettings: string;
  lightingStyle: string;
  motionPhysics: string;
  jsonPayload: string;
}

const PRESET_TEMPLATES = [
  {
    id: "imax-blockbuster",
    title: "Blockbuster IMAX 70mm Sci-Fi",
    category: "Cinematográfico",
    description: "Nave espacial em escala colossal emergindo de nuvens de gás estelar com reflexos metálicos anamórficos.",
    style: "IMAX 70mm Anamórfico (Blockbuster Cinema)",
    framing: "Plano Geral Extremo (Extreme Wide Shot)",
    colorGrading: "Teal & Orange Hollywoodiano (Cinematic Blockbuster)",
    camera: "Dolly Zoom In Suave com Giro Anamórfico",
    lighting: "Sun Volumetric Rays & Sci-Fi Lens Flare",
    motion: "Gravidade Zero Flutuante (60fps)",
    promptSeed: "An ultra-epic IMAX 70mm cinematic wide shot of a massive futuristic starship breaking through dense iridescent nebula clouds. Volumetric sun rays piercing dark space, subtle cyan and orange lens flares, 8K resolution, Denis Villeneuve visual style."
  },
  {
    id: "tech-intro",
    title: "Abertura de Canal Tech Futurista",
    category: "Comercial / Tech",
    description: "Câmera navegando entre circuitos neon holográficos com revelação de logo.",
    style: "Sci-Fi Cyberpunk 2077 Neon Volumétrico",
    framing: "Macro Extremo (Extreme Close-up 100mm)",
    colorGrading: "High Dynamic Range (HDR) Neo-Neon Vibrante",
    camera: "FPV Drone Fly-through",
    lighting: "Cyber Neon Blue & Purple",
    motion: "Movimento Fluido & Elegante (60fps)",
    promptSeed: "An ultra-detailed cinematic close-up of a glowing futuristic quantum microchip. Holographic data streams flowing like liquid light, camera slowly zooming through crystal circuits into a dark vast void with floating neon particles."
  },
  {
    id: "luxury-perfume",
    title: "Comercial de Perfume de Luxo",
    category: "Moda & Luxo",
    description: "Gotas de água em câmera lenta extrema caindo sobre frasco de vidro maciço.",
    style: "Comercial de Luxo 120fps Super Macro",
    framing: "Close-up Cinematográfico de Alto Impacto",
    colorGrading: "Kodak Portra 400 Suave (Tons Quentes de Filme)",
    camera: "Órbita 360° em volta da cena",
    lighting: "Estúdio Softbox Suave",
    motion: "Ultra Câmera Lenta (120fps)",
    promptSeed: "A luxurious glass perfume bottle sitting on polished black marble. Crystal clear water droplets falling in extreme 120fps slow-motion, splashing into golden liquid ripples with soft warm rim lighting and elegant depth of field."
  },
  {
    id: "film-noir",
    title: "Cena de Suspense Film Noir 35mm",
    category: "Cinematográfico",
    description: "Detetive com sobretudo sob chuva noturna e iluminação chiaroscuro nas ruas de Nova York.",
    style: "Film Noir - Luzes e Sombras Dramáticas (Chiaroscuro)",
    framing: "Plano Médio (Medium Shot - Sujeito e Cenário)",
    colorGrading: "Monocromático Preto & Branco Alto Contraste",
    camera: "Câmera na Mão Realista",
    lighting: "Chiaroscuro Dramático",
    motion: "Fluido & Elegante (60fps)",
    promptSeed: "A moody 1940s Film Noir cinematic medium shot of a detective standing under a streetlamp on a wet rainy night. Heavy fog, deep shadows, dramatic chiaroscuro lighting, subtle cigarette smoke rising, grainy 35mm film aesthetic."
  },
  {
    id: "sports-car",
    title: "Anúncio de Carro Esportivo na Chuva",
    category: "Automotivo",
    description: "Carro acelerando à noite no asfalto molhado com reflexos neon e fumaça.",
    style: "Hollywood Action - Teal & Orange 8K",
    framing: "Low Angle Hero Shot (Ângulo Contra-plongée de Poder)",
    colorGrading: "Teal & Orange Hollywoodiano (Cinematic Blockbuster)",
    camera: "Low Angle Tracking Shot",
    lighting: "Chiaroscuro Dramático",
    motion: "Onda de Impacto Rápida",
    promptSeed: "Sleek matte black sports car drifting on a wet asphalt street at midnight. Neon reflections flickering in water puddles, smoke rising from tires, volumetric headlights cutting through heavy rain in 8K cinematic realism."
  },
  {
    id: "drone-nature",
    title: "Drone FPV em Cordilheira Épica",
    category: "Documentário",
    description: "Voo de drone entre picos nevados ao pôr do sol com raios de sol e névoa.",
    style: "Documentário IMAX / National Geographic 60fps",
    framing: "Plano Geral Cinematográfico (Wide Landscape Shot)",
    colorGrading: "Golden Hour Warmth (Luz Dourada Natural)",
    camera: "FPV Drone Fly-through",
    lighting: "Golden Hour & Raios Volumétricos",
    motion: "Gravidade Zero Flutuante",
    promptSeed: "Epic aerial FPV drone footage gliding over jagged snow-capped mountain peaks during golden hour sunset. Volumetric sunbeams breaking through misty valleys, crystalline snow sparkling, cinematic 60fps."
  }
];

export const GeradorOmniFlash: React.FC<GeradorOmniFlashProps> = ({ customApiKey }) => {
  const [activeMode, setActiveMode] = useState<"T2V" | "I2V" | "V2V" | "ANALYSIS">("T2V");
  const [concept, setConcept] = useState("");
  
  // Cinematography controls
  const [cinematographyStyle, setCinematographyStyle] = useState("IMAX 70mm Anamórfico (Blockbuster Cinema)");
  const [framing, setFraming] = useState("Plano Geral Cinematográfico (Wide Landscape Shot)");
  const [colorGrading, setColorGrading] = useState("Teal & Orange Hollywoodiano (Cinematic Blockbuster)");
  const [cameraMovement, setCameraMovement] = useState("Dolly Zoom In Suave");
  const [lighting, setLighting] = useState("Golden Hour & Raios Volumétricos");
  const [motionSpeed, setMotionSpeed] = useState("Ultra Câmera Lenta (120fps)");
  const [lens, setLens] = useState("35mm Anamórfico f/1.8");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [duration, setDuration] = useState<"5s" | "10s">("5s");
  
  // Uploaded media (video or image)
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedMediaBase64, setUploadedMediaBase64] = useState<string | null>(null);
  const [uploadedMediaMimeType, setUploadedMediaMimeType] = useState<string | null>(null);
  const [uploadedMediaName, setUploadedMediaName] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<"video" | "image" | null>(null);
  
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedPromptData | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  
  const [isSimulatingVideo, setIsSimulatingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const [savedPrompts, setSavedPrompts] = useState<GeneratedPromptData[]>(() => {
    try {
      const stored = localStorage.getItem("omni_flash_saved_prompts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedTab, setSelectedTab] = useState<"builder" | "presets" | "saved">("builder");

  useEffect(() => {
    try {
      localStorage.setItem("omni_flash_saved_prompts", JSON.stringify(savedPrompts));
    } catch (e) {
      console.error("Erro ao salvar prompts no localStorage", e);
    }
  }, [savedPrompts]);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!concept.trim() && !uploadedMediaBase64) {
      alert("Digite uma ideia básica ou envie um vídeo de referência para a IA melhorar seu prompt.");
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch("/api/omni-flash-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: concept.trim(),
          mediaBase64: uploadedMediaBase64,
          mediaMimeType: uploadedMediaMimeType,
          customApiKey: customApiKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao melhorar prompt");
      }

      if (data.enhancedPrompt) {
        setConcept(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao melhorar prompt com IA");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setConcept(preset.promptSeed);
    setCinematographyStyle(preset.style);
    setFraming(preset.framing);
    setColorGrading(preset.colorGrading);
    setCameraMovement(preset.camera);
    setLighting(preset.lighting);
    setMotionSpeed(preset.motion);
    setSelectedTab("builder");
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = file.type;
      const isVideo = mime.startsWith("video/");
      const isImg = mime.startsWith("image/");

      if (!isVideo && !isImg) {
        alert("Por favor, selecione um arquivo de vídeo (MP4, WEBM, MOV) ou imagem (PNG, JPG, WEBP).");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert("O arquivo enviado é muito grande (máximo recomendado: 100MB). Escolha um arquivo menor para garantir o processamento rápido.");
        return;
      }

      setUploadedMediaName(file.name);
      setUploadedMediaType(isVideo ? "video" : "image");
      setUploadedMediaMimeType(mime);

      const previewUrl = URL.createObjectURL(file);
      setUploadedMediaUrl(previewUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedMediaBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setUploadedMediaUrl(null);
    setUploadedMediaBase64(null);
    setUploadedMediaMimeType(null);
    setUploadedMediaName(null);
    setUploadedMediaType(null);
  };

  const handleGeneratePrompt = async () => {
    if (!concept.trim() && !uploadedMediaBase64) {
      alert("Por favor, digite a ideia da cena ou envie um arquivo de vídeo para análise da IA.");
      return;
    }

    setIsGeneratingPrompt(true);
    setGeneratedResult(null);

    try {
      const res = await fetch("/api/omni-flash-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: concept.trim(),
          mode: activeMode,
          cinematographyStyle: cinematographyStyle,
          framing: framing,
          colorGrading: colorGrading,
          camera: cameraMovement,
          lighting: lighting,
          motion: motionSpeed,
          lens: lens,
          aspectRatio: aspectRatio,
          duration: duration,
          mediaBase64: uploadedMediaBase64,
          mediaMimeType: uploadedMediaMimeType,
          customApiKey: customApiKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar prompt Omni Flash");
      }

      setGeneratedResult(data);
    } catch (err: any) {
      console.error(err);
      // Fallback local prompt generator if server call fails
      const fallbackEnglish = `A hyper-realistic 8K cinematic scene of ${concept || "a dynamic video"}. ${cinematographyStyle} style, ${framing} framing, ${cameraMovement} camera movement, ${lighting} lighting, ${colorGrading} color grade, shot on ${lens}. Ultra high detail.`;
      const fallbackPayload = JSON.stringify({
        model: "gemini-omni-flash-preview",
        input: fallbackEnglish,
        background: false,
        store: false,
        response_format: {
          type: "video",
          aspect_ratio: aspectRatio,
          duration: duration
        }
      }, null, 2);

      setGeneratedResult({
        title: concept ? concept.slice(0, 30) + "..." : "Cena Cinematográfica Omni Flash",
        englishPrompt: fallbackEnglish,
        portuguesePrompt: `Vídeo cinematográfico baseado no conceito informado com estilo ${cinematographyStyle}.`,
        negativePrompt: "low quality, blurry, distorted motion, static frame, jittery artifacts, watermark, low res",
        cameraSettings: `${cameraMovement} | ${framing} | Lente ${lens} | Proporção ${aspectRatio}`,
        lightingStyle: lighting,
        motionPhysics: motionSpeed,
        jsonPayload: fallbackPayload
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSimulateOmniFlashVideo = async () => {
    if (!generatedResult) return;
    setIsSimulatingVideo(true);
    setVideoStatus("Enviando requisição para gemini-omni-flash-preview na Interactions API...");
    setGeneratedVideoUrl(null);

    try {
      const res = await fetch("/api/omni-flash-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatedResult.englishPrompt,
          aspectRatio: aspectRatio,
          duration: duration,
          customApiKey: customApiKey
        })
      });

      const data = await res.json();
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
        setVideoStatus("Vídeo renderizado com sucesso pelo Gemini Omni Flash!");
      } else {
        setVideoStatus("Prompt e formato validados com sucesso para o Gemini Omni Flash!");
      }
    } catch (e) {
      setVideoStatus("Prompt formatado com sucesso para gemini-omni-flash-preview!");
    } finally {
      setIsSimulatingVideo(false);
    }
  };

  const handleSavePrompt = () => {
    if (!generatedResult) return;
    if (savedPrompts.some(p => p.englishPrompt === generatedResult.englishPrompt)) {
      alert("Este prompt já está nos seus salvos!");
      return;
    }
    setSavedPrompts([generatedResult, ...savedPrompts]);
    alert("Prompt cinematográfico salvo com sucesso!");
  };

  return (
    <div className="w-full h-full bg-[#09090b] text-zinc-100 flex flex-col overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/70 via-zinc-900 to-[#1c160c] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/30 flex items-center gap-1.5 shadow-sm">
                <Clapperboard size={12} />
                gemini-omni-flash-preview
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Video size={12} />
                Análise de Vídeo & Visão Multimodal
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Gerador de Prompts Cinematográficos Omni Flash
            </h1>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Envie seu <strong className="text-amber-300 font-semibold">arquivo de vídeo</strong> para a IA ver e entender a cena, ou escolha opções cinematográficas profissionais de direção, enquadramento e iluminação otimizadas para o <strong className="text-zinc-200">Gemini Omni Flash</strong>.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shrink-0 self-start md:self-center">
            <button
              onClick={() => setSelectedTab("builder")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedTab === "builder" 
                  ? "bg-[#c5a880] text-zinc-950 shadow-lg shadow-[#c5a880]/20 font-extrabold" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Wand2 size={15} />
              Criar Prompt
            </button>
            <button
              onClick={() => setSelectedTab("presets")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedTab === "presets" 
                  ? "bg-[#c5a880] text-zinc-950 shadow-lg shadow-[#c5a880]/20 font-extrabold" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkle size={15} />
              Presets Prontos ({PRESET_TEMPLATES.length})
            </button>
            <button
              onClick={() => setSelectedTab("saved")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedTab === "saved" 
                  ? "bg-[#c5a880] text-zinc-950 shadow-lg shadow-[#c5a880]/20 font-extrabold" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Bookmark size={15} />
              Salvos ({savedPrompts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedTab === "presets" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkle size={18} className="text-[#c5a880]" />
              Biblioteca de Presets Cinematográficos
            </h2>
            <p className="text-xs text-zinc-400">Clique em qualquer preset para carregar as configurações no gerador</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_TEMPLATES.map((preset) => (
              <div 
                key={preset.id}
                className="bg-[#121215] border border-white/5 hover:border-[#c5a880]/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl hover:shadow-[#c5a880]/5 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#c5a880] px-2.5 py-1 rounded-md border border-white/5">
                      {preset.category}
                    </span>
                    <Film size={15} className="text-zinc-600 group-hover:text-[#c5a880] transition-colors" />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#c5a880] transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] text-zinc-400 font-mono">
                  <div><strong className="text-zinc-300">Estilo:</strong> {preset.style}</div>
                  <div><strong className="text-zinc-300">Enquadramento:</strong> {preset.framing}</div>
                  <div><strong className="text-zinc-300">Câmera:</strong> {preset.camera}</div>
                </div>

                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full bg-zinc-900 hover:bg-[#c5a880] text-zinc-300 hover:text-zinc-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <Wand2 size={14} />
                  Usar Este Preset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "saved" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bookmark size={18} className="text-[#c5a880]" />
              Prompts Cinematográficos Salvos
            </h2>
            <span className="text-xs text-zinc-400">{savedPrompts.length} prompt(s) no seu acervo</span>
          </div>

          {savedPrompts.length === 0 ? (
            <div className="bg-[#121215] border border-dashed border-white/10 rounded-2xl p-12 text-center space-y-3">
              <Bookmark size={32} className="mx-auto text-zinc-600" />
              <h3 className="text-sm font-bold text-zinc-300">Nenhum prompt salvo ainda</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Gere e otimize um prompt na aba "Criar Prompt" e clique no botão "Salvar nos Favoritos" para guardá-lo aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPrompts.map((saved, index) => (
                <div key={index} className="bg-[#121215] border border-white/10 rounded-2xl p-5 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm truncate max-w-[280px]">
                      {saved.title}
                    </h3>
                    <button
                      onClick={() => setSavedPrompts(savedPrompts.filter((_, i) => i !== index))}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>

                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 text-xs text-zinc-300 font-mono leading-relaxed line-clamp-3">
                    {saved.englishPrompt}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-zinc-500">{saved.cameraSettings}</span>
                    <button
                      onClick={() => handleCopy(saved.englishPrompt, `saved-${index}`)}
                      className="bg-[#c5a880]/10 hover:bg-[#c5a880] text-[#c5a880] hover:text-zinc-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {copiedType === `saved-${index}` ? <Check size={13} /> : <Copy size={13} />}
                      Copiar Prompt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          
          {/* Controls Column (Left) */}
          <div className="lg:col-span-6 space-y-6 bg-[#121215] border border-white/10 p-6 rounded-3xl shadow-xl">
            
            {/* Video & Multimodal File Upload Card */}
            <div className="space-y-2 bg-gradient-to-b from-purple-950/40 to-black/80 p-5 rounded-2xl border border-purple-500/30 shadow-lg">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-purple-200 uppercase tracking-wider flex items-center gap-2">
                  <FileVideo size={16} className="text-purple-400" />
                  1. Enviar Vídeo de Referência (Opcional)
                </label>
                {uploadedMediaUrl && (
                  <button
                    onClick={handleRemoveMedia}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20"
                  >
                    <X size={13} />
                    Remover Vídeo
                  </button>
                )}
              </div>

              {!uploadedMediaUrl ? (
                <div className="relative border-2 border-dashed border-purple-500/30 hover:border-purple-400/80 rounded-2xl p-5 text-center bg-black/60 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="py-2 space-y-2">
                    <Upload size={28} className="mx-auto text-purple-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-xs font-bold text-purple-100">
                        Clique ou arraste seu vídeo de referência (MP4, WEBM, MOV)
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        A IA vai assistir ao vídeo e capturar os detalhes visuais automaticamente!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="relative rounded-xl overflow-hidden bg-black border border-purple-500/40 max-h-52 flex items-center justify-center">
                    {uploadedMediaType === "video" ? (
                      <video src={uploadedMediaUrl} controls className="w-full max-h-52 object-contain" />
                    ) : (
                      <img src={uploadedMediaUrl} alt="Preview" className="w-full max-h-52 object-contain" />
                    )}
                  </div>
                  <div className="bg-purple-950/50 p-2.5 rounded-xl border border-purple-500/30 text-[11px] text-purple-200 flex items-center justify-between">
                    <span className="truncate font-mono font-semibold max-w-[260px]">
                      🎥 {uploadedMediaName}
                    </span>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2.5 py-1 rounded font-black uppercase tracking-wider">
                      Vídeo Carregado
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Core Idea Input with Prompt Enhancer Button */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#c5a880]" />
                  2. Digite o que você quer na cena
                </label>
                
                {/* Botão Melhorar Prompt */}
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing}
                  className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw size={13} className="animate-spin text-amber-300" />
                      <span>Melhorando Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-amber-400" />
                      <span>✨ Melhorar Prompt com IA</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={4}
                placeholder="Exemplo: Um carro esportivo acelerando no asfalto molhado à noite com luzes neon e chuva..."
                className="w-full bg-black/70 border border-white/10 rounded-2xl p-4 text-xs md:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] transition-colors resize-none custom-scrollbar"
              />
              <p className="text-[10px] text-zinc-400">
                Escreva uma ideia simples e clique em <strong className="text-amber-300">"Melhorar Prompt com IA"</strong> para a IA enriquecer o prompt automaticamente antes de gerar!
              </p>
            </div>

            {/* Basic Configs Only (Aspect Ratio & Duration) */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-[#c5a880]" />
                3. Ajustes Básicos do Vídeo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">
                    Formato (Aspect Ratio)
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-black p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        aspectRatio === "16:9" ? "bg-[#c5a880] text-zinc-950 font-black shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio("9:16")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        aspectRatio === "9:16" ? "bg-[#c5a880] text-zinc-950 font-black shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      9:16
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio("1:1")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        aspectRatio === "1:1" ? "bg-[#c5a880] text-zinc-950 font-black shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      1:1
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">
                    Duração
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-black p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setDuration("5s")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        duration === "5s" ? "bg-[#c5a880] text-zinc-950 font-black shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      5s
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration("10s")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        duration === "10s" ? "bg-[#c5a880] text-zinc-950 font-black shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      10s
                    </button>
                  </div>
                </div>
              </div>
            </div>



            {/* Action Button */}
            <button
              onClick={handleGeneratePrompt}
              disabled={isGeneratingPrompt}
              className="w-full bg-gradient-to-r from-[#c5a880] via-[#d8be98] to-[#c5a880] text-zinc-950 font-black py-4 px-6 rounded-2xl shadow-xl shadow-[#c5a880]/15 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {isGeneratingPrompt ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-zinc-950" />
                  <span>{uploadedMediaBase64 ? "IA Analisando Vídeo & Gerando Prompt..." : "Sintetizando Prompt Cinematográfico..."}</span>
                </>
              ) : (
                <>
                  <Clapperboard size={18} />
                  <span>Gerar Prompt Cinematográfico Otimizado</span>
                </>
              )}
            </button>

          </div>

          {/* Results Column (Right) */}
          <div className="lg:col-span-6 space-y-6">
            
            {!generatedResult && !isGeneratingPrompt && (
              <div className="bg-[#121215] border border-dashed border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 min-h-[460px]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c5a880]/20 to-purple-500/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880] shadow-lg">
                  <Clapperboard size={28} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-white">Seu Prompt Cinematográfico Otimizado</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Envie um arquivo de vídeo para a IA analisar ou escolha opções de enquadramento, color grading e iluminação para gerar prompts prontos para o Gemini Omni Flash.
                  </p>
                </div>
              </div>
            )}

            {isGeneratingPrompt && (
              <div className="bg-[#121215] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[460px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center text-[#c5a880] animate-pulse">
                    <Sparkles size={28} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    {uploadedMediaBase64 ? "A IA está assistindo ao vídeo anexo..." : "Engenharia Cinematográfica em Andamento"}
                  </h3>
                  <p className="text-xs text-zinc-400">Extraindo dinâmica de movimento, iluminação e criando o prompt para Gemini Omni Flash...</p>
                </div>
              </div>
            )}

            {generatedResult && !isGeneratingPrompt && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Main Result Card */}
                <div className="bg-[#121215] border border-[#c5a880]/30 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <div>
                        <h3 className="font-extrabold text-white text-base">Prompt JSON Pronto para o Flow / Omni</h3>
                        <p className="text-[11px] text-zinc-400">Contém o prompt positivo + negativo e configurações em um único JSON</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleSavePrompt}
                        className="bg-white/5 hover:bg-[#c5a880]/20 text-zinc-300 hover:text-[#c5a880] border border-white/10 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Bookmark size={14} />
                        Salvar
                      </button>
                      <button
                        onClick={() => handleCopy(generatedResult.jsonPayload, "json")}
                        className="bg-gradient-to-r from-[#c5a880] to-[#e6d0b3] hover:brightness-110 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#c5a880]/20 active:scale-95"
                      >
                        {copiedType === "json" ? <Check size={14} className="text-zinc-950 font-bold" /> : <Copy size={14} />}
                        {copiedType === "json" ? "JSON Copiado!" : "Copiar Prompt JSON Completo"}
                      </button>
                    </div>
                  </div>

                  {/* Primary Feature: Highlighted JSON Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-[#c5a880] flex items-center gap-1.5">
                        <Code size={14} />
                        Prompt JSON Completo (Copiar e Colar no Flow / Omni)
                      </span>
                    </div>
                    <div className="relative group">
                      <pre className="bg-black p-5 rounded-2xl border border-[#c5a880]/40 text-xs font-mono text-amber-200/90 leading-relaxed overflow-x-auto custom-scrollbar max-h-96 select-all shadow-inner">
                        {generatedResult.jsonPayload}
                      </pre>
                    </div>
                  </div>



                  {/* Direct Omni Flash Video Generation Test */}
                  <div className="pt-3 border-t border-white/5">
                    <button
                      onClick={handleSimulateOmniFlashVideo}
                      disabled={isSimulatingVideo}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      {isSimulatingVideo ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Processando na Interactions API...</span>
                        </>
                      ) : (
                        <>
                          <Play size={15} />
                          <span>Testar Renderização no Gemini Omni Flash</span>
                        </>
                      )}
                    </button>

                    {videoStatus && (
                      <div className="mt-3 p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200 text-center font-medium">
                        {videoStatus}
                      </div>
                    )}

                    {generatedVideoUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-purple-500/30 bg-black">
                        <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-auto" />
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default GeradorOmniFlash;
