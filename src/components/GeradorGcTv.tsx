import React, { useState, useEffect, useRef } from "react";
import { 
  Tv, 
  Scan, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Play, 
  Info, 
  FileCode, 
  Upload, 
  Image as ImageIcon, 
  Wand2, 
  Trash2,
  ChevronRight,
  SlidersHorizontal,
  FileCheck
} from "lucide-react";
import JSZip from "jszip";
import { checkAdminOrOpenPlan, getAuthHeaders } from "../utils/userAuth";
import { 
  sanitizeXaml, 
  wpfToGtXml, 
  generateVmixXamlCode, 
  autoDetectLayoutStyle, 
  updateXamlWithState,
  GcScanData 
} from "./VmixXamlModal";
import { t } from "../utils/i18n";

interface GeradorGcTvProps {
  customApiKey?: string;
  showToast?: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

const DEFAULT_GC_DATA: GcScanData = {
  gcTitle: "CARLOS SILVA",
  gcSubtitle: "Ministro da Economia • Entrevista Exclusiva",
  gcBadge: "AO VIVO",
  primaryColor: "#0f172a",
  secondaryColor: "#1e293b",
  accentColor: "#38bdf8",
  textColor: "#ffffff",
  subtextColor: "#e0f2fe",
  badgeBgColor: "#ef4444",
  badgeTextColor: "#ffffff",
  layoutStyle: "jornalismo",
  hasLogo: true,
  logoUrl: "https://api.iconify.design/lucide:tv.svg?color=%23ffffff",
  logoName: "Logo",
  homeLogoName: "HomeLogo",
  awayLogoName: "AwayLogo",
  homeTeam: "INT",
  awayTeam: "COR",
  score: "0 | 0",
  clock: "1T | 00:00",
  roundText: "03ª RODADA | CAMPEONATO BRASILEIRO",
  barHeight: 170,
  barCornerRadius: 12,
  barOpacity: 0.95,
  summary: "Layout padrão inicial. Carregue uma imagem de referência para analisar via IA."
};

const SUGGESTED_PROMPTS = [
  "Cores modernas em tons de vermelho e cinza escuro, badge 'URGENTE' piscando.",
  "Estilo esportivo minimalista para transmissão de basquete, cores verde e dourado.",
  "Tarja dupla clássica para jornalismo matutino com tons pastel e azul marinho.",
  "Estilo clean para Podcast com cantos arredondados, logo à esquerda e sem badge."
];

export function GeradorGcTv({ customApiKey, showToast: propShowToast }: GeradorGcTvProps) {
  // Local Toast State
  const [localToast, setLocalToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  // Safe toast helper
  const showToast = (msg: string, type: "success" | "error" | "info" | "warning" = "success") => {
    if (propShowToast) {
      propShowToast(msg, type);
    }
    setLocalToast({ message: msg, type });
    setTimeout(() => {
      setLocalToast(null);
    }, 4000);
  };

  // State
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [layoutStyleHint, setLayoutStyleHint] = useState<string>("auto");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSteps, setScanSteps] = useState<string>("");
  
  const [scanData, setScanData] = useState<GcScanData>(DEFAULT_GC_DATA);
  const [activeTab, setActiveTab] = useState<"ajustes" | "xaml" | "guia">("ajustes");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // File reader for reference image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Handle reference image upload
  const handleRefImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setRefImageBase64(reader.result);
          showToast("Imagem de referência carregada! Clique em 'Analisar & Gerar GC' para extrair o XAML.", "info");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove reference image
  const handleRemoveRefImage = () => {
    setRefImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Run Vision Scan via API
  const handleScanImage = async () => {
    if (!checkAdminOrOpenPlan(customApiKey)) return;
    if (!refImageBase64) {
      showToast("Por favor, envie uma imagem de referência primeiro.", "warning");
      return;
    }

    setIsScanning(true);
    setScanSteps("Conectando ao Gemini Vision...");
    showToast("Analisando imagem de referência de GC...", "info");

    try {
      const stepsList = [
        "Escaneando pixels e proporções da imagem...",
        "Identificando paleta de cores (Hexadecimais)...",
        "Detectando textos (Título, Subtítulo, Badges)...",
        "Reconhecendo estilo de layout (Esportes vs Jornalismo)...",
        "Construindo árvores de elementos WPF Canvas...",
        "Formatando e aplicando regras anti-erros de fontes..."
      ];

      // Simulate visually beautiful steps while API runs
      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < stepsList.length) {
          setScanSteps(stepsList[stepIndex]);
          stepIndex++;
        } else {
          clearInterval(interval);
        }
      }, 1500);

      const detectedStyle = layoutStyleHint === "auto" ? undefined : layoutStyleHint;
      
      const res = await fetch("/api/scan-gc-to-xaml", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(customApiKey) },
        body: JSON.stringify({ 
          imageBase64: refImageBase64, 
          customApiKey,
          layoutStyleHint: detectedStyle,
          userPrompt
        })
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao escanear GC.");
      }

      const data: GcScanData = await res.json();
      
      if (data.generatedXaml) {
        let cleanXaml = data.generatedXaml.trim();
        if (cleanXaml.startsWith("```")) {
          cleanXaml = cleanXaml.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
        }
        data.generatedXaml = cleanXaml;
      }

      setScanData(prev => ({
        ...prev,
        ...data,
        layoutStyle: (data.layoutStyle || detectedStyle || prev.layoutStyle) as "jornalismo" | "esportes" | "urgente" | "clean",
        hasLogo: data.hasLogo ?? prev.hasLogo ?? true,
        logoUrl: data.logoUrl || refImageBase64 || prev.logoUrl
      }));

      showToast("GC analisado com sucesso! Arquivo .XAML funcional gerado.", "success");
      handlePlayPreviewAnimation();
    } catch (e: any) {
      console.error(e);
      showToast(`Falha na IA: ${e.message || "Erro desconhecido"}`, "error");
    } finally {
      setIsScanning(false);
      setScanSteps("");
    }
  };

  // Upload custom logo in the GC adjustments tab
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setScanData(prev => ({
            ...prev,
            hasLogo: true,
            logoUrl: reader.result as string
          }));
          showToast("Logotipo aplicado ao GC!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation controller for HTML preview
  const handlePlayPreviewAnimation = () => {
    setIsPlayingAnim(false);
    setTimeout(() => setIsPlayingAnim(true), 50);
  };

  // Compile active state to WPF XAML
  const xamlCode = generateVmixXamlCode(scanData);

  // Download .xaml
  const handleDownloadWpfXaml = () => {
    let pureXaml = sanitizeXaml(xamlCode);
    if (pureXaml.startsWith("<?xml")) {
      pureXaml = pureXaml.replace(/^<\?xml[^>]*\?>\s*/i, "");
    }
    const blob = new Blob([pureXaml], { type: "application/xaml+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const isSports = scanData.layoutStyle === "esportes";
    const filenamePrefix = isSports ? "PLACAR_vMix_Animado" : "GC_vMix_Animado";
    const cleanTitle = (scanData.gcTitle || scanData.homeTeam || "TV").replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `${filenamePrefix}_${cleanTitle}.xaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Arquivo XAML '${filenamePrefix}_${cleanTitle}.xaml' baixado!`, "success");
  };

  // Download .gtzip
  const handleDownloadGtZip = async () => {
    try {
      const gtXmlCode = wpfToGtXml(xamlCode);
      const zip = new JSZip();
      
      zip.file("document.xml", gtXmlCode);
      zip.file("resources.xml", `<resources />`);
      zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="text/xml" /><Default Extension="png" ContentType="image/png" /></Types>`);
      zip.file("thumbnail.png", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", { base64: true });
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      const isSports = scanData.layoutStyle === "esportes";
      const filenamePrefix = isSports ? "PLACAR_GT" : "GC_GT";
      const cleanTitle = (scanData.gcTitle || scanData.homeTeam || "TV").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `${filenamePrefix}_${cleanTitle}.gtzip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Pacote nativo '${filenamePrefix}_${cleanTitle}.gtzip' baixado! Pronto para vMix e GT Title Designer.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Falha ao empacotar GTZIP: ${err.message}`, "error");
    }
  };

  // Copy XAML code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(xamlCode);
    setIsCopied(true);
    showToast("Código XAML copiado!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Dynamic CSS styling for live HTML preview
  const renderPreviewOverlay = () => {
    const isSports = scanData.layoutStyle === "esportes";
    
    if (isSports) {
      return (
        <div 
          className={`absolute left-8 top-8 transition-all duration-500 flex flex-col font-sans ${
            isPlayingAnim ? "animate-in slide-in-from-top duration-700 fade-in" : "opacity-0"
          }`}
          style={{ width: "420px" }}
        >
          {/* Header Bar */}
          <div 
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-t-lg shadow-md flex items-center justify-between"
            style={{ 
              backgroundColor: scanData.primaryColor, 
              color: scanData.textColor 
            }}
          >
            <span>{scanData.roundText || "03ª RODADA | CAMPEONATO BRASILEIRO"}</span>
          </div>

          {/* Main Board */}
          <div className="bg-white rounded-b-lg shadow-xl flex items-center relative overflow-hidden border-t-2" style={{ borderColor: scanData.accentColor }}>
            {/* Clock */}
            <div 
              className="px-3 py-4 flex flex-col justify-center items-center font-mono font-bold text-sm tracking-tight w-[100px] shrink-0"
              style={{ backgroundColor: scanData.secondaryColor, color: scanData.accentColor }}
            >
              <span>{scanData.clock || "1T | 00:00"}</span>
            </div>

            {/* Teams & Score */}
            <div className="flex-1 px-3 py-3 flex items-center justify-between text-zinc-900 font-extrabold text-sm">
              {/* Home */}
              <div className="flex items-center gap-1.5 flex-1 justify-end">
                <span className="truncate">{scanData.homeTeam || "INT"}</span>
                {scanData.hasLogo && scanData.logoUrl && (
                  <img src={scanData.logoUrl} alt="Home" className="w-6 h-6 object-contain rounded" />
                )}
              </div>

              {/* Score Box */}
              <div 
                className="mx-2 px-3 py-1 rounded-md text-xs tracking-wider shrink-0 font-black shadow-inner"
                style={{ backgroundColor: scanData.secondaryColor, color: scanData.accentColor }}
              >
                <span>{scanData.score || "0 | 0"}</span>
              </div>

              {/* Away */}
              <div className="flex items-center gap-1.5 flex-1 justify-start">
                {scanData.hasLogo && scanData.logoUrl && (
                  <img src={scanData.logoUrl} alt="Away" className="w-6 h-6 object-contain rounded" />
                )}
                <span className="truncate">{scanData.awayTeam || "COR"}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Lower Third style (Journalism, Urgent, Clean)
    return (
      <div 
        className={`absolute left-8 bottom-8 right-8 transition-all duration-500 ${
          isPlayingAnim ? "animate-in slide-in-from-left duration-700 fade-in" : "opacity-0"
        }`}
      >
        {/* Badge tag */}
        <div 
          className="absolute -top-6 left-12 px-3 py-0.5 rounded-t-lg text-[9px] font-black uppercase tracking-widest shadow-md border-t border-x border-white/10"
          style={{ 
            backgroundColor: scanData.badgeBgColor, 
            color: scanData.badgeTextColor 
          }}
        >
          {scanData.gcBadge || "AO VIVO"}
        </div>

        {/* Main Bar */}
        <div 
          className="w-full flex items-center p-4 relative shadow-2xl border border-white/5"
          style={{ 
            height: `${(scanData.barHeight || 170) * 0.7}px`, // Scaled for preview viewport
            borderRadius: `${scanData.barCornerRadius || 12}px`,
            opacity: scanData.barOpacity || 0.95,
            background: `linear-gradient(90deg, ${scanData.primaryColor} 0%, ${scanData.secondaryColor} 100%)`
          }}
        >
          {/* Side accent glowing border */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-2"
            style={{ 
              backgroundColor: scanData.accentColor,
              borderTopLeftRadius: `${scanData.barCornerRadius || 12}px`,
              borderBottomLeftRadius: `${scanData.barCornerRadius || 12}px`
            }}
          />

          {/* Logo */}
          {scanData.hasLogo && scanData.logoUrl && (
            <div className="ml-3 mr-4 w-14 h-14 bg-black/20 rounded-xl border border-white/10 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
              <img src={scanData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Texts */}
          <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
            <h3 
              className="text-base sm:text-lg font-black tracking-tight uppercase truncate"
              style={{ color: scanData.textColor }}
            >
              {scanData.gcTitle || "CARLOS SILVA"}
            </h3>
            <p 
              className="text-xs font-medium truncate mt-0.5"
              style={{ color: scanData.subtextColor }}
            >
              {scanData.gcSubtitle || "Ministro da Economia • Entrevista Exclusiva"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0c0c0e]">
      
      {/* Header Bar */}
      <div className="px-6 py-4 bg-black border-b border-white/5 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c5a880]/20 via-[#c5a880]/10 to-transparent border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shadow-lg shadow-[#c5a880]/5 shrink-0">
            <Tv size={22} className="text-[#c5a880]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Copiloto GC de TV & Transmissão
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a880] bg-[#c5a880]/10 px-2 py-0.5 rounded border border-[#c5a880]/20 animate-pulse">
                vMix Engine
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">
              Crie tarjas, lower-thirds e placares animados profissionais para vMix e GT Title Designer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPreviewAnimation}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all border border-white/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer h-10 px-3"
            title="Recomeçar animação de entrada"
          >
            <Play size={14} className="text-amber-500 fill-amber-500" />
            <span>Ver Animação</span>
          </button>
        </div>
      </div>

      {/* Main Content Split Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: UPLOAD REFERENCE & PROMPTS */}
        <div className="w-full lg:w-[420px] bg-[#0f0f11] border-r border-white/5 flex flex-col overflow-y-auto shrink-0 p-5 gap-5">
          
          {/* Section: Upload Reference */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block">
              1. Imagem de Referência do GC
            </label>
            
            {refImageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#c5a880]/40 group aspect-[16/9] bg-black">
                <img 
                  src={refImageBase64} 
                  alt="GC Referência" 
                  className="w-full h-full object-contain" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3.5">
                  <div className="flex justify-end">
                    <button
                      onClick={handleRemoveRefImage}
                      className="p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-all cursor-pointer"
                      title="Remover referência"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-300 font-bold bg-black/60 p-1.5 rounded border border-white/5 backdrop-blur-sm">
                    A IA vai escanear este layout e extrair cores, textos e proporções WPF.
                  </p>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-[#c5a880]/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-black/20 hover:bg-black/40 flex flex-col items-center justify-center gap-3 aspect-[16/9]"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-[#c5a880] transition-colors">
                  <Upload size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Arraste ou clique para enviar</span>
                  <span className="text-[10px] text-zinc-500 block mt-1">Imagens de TV, prints de transmissão, etc. (PNG/JPG)</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleRefImageChange} 
                  className="hidden" 
                />
              </div>
            )}
          </div>

          {/* Section: Custom Directives Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block">
              2. Instruções do Prompt (Opcional)
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ex: Altere o badge de AO VIVO para PLANTÃO e use cores que combinem com a marca..."
              className="w-full bg-black/60 border border-zinc-800 focus:border-[#c5a880] rounded-xl px-3.5 py-3 text-white text-xs placeholder-zinc-600 focus:outline-none resize-none h-28 leading-relaxed font-medium transition-colors"
            />
          </div>

          {/* Presets Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Sugestões de Ajustes:</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserPrompt(promptText)}
                  className="text-[10px] text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-[#c5a880]/30 rounded-lg px-2.5 py-1.5 text-left transition-all font-medium cursor-pointer"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Model Hint Preset */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block">
              3. Preset de Formato do GC
            </label>
            <select
              value={layoutStyleHint}
              onChange={(e) => setLayoutStyleHint(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 focus:border-[#c5a880] rounded-xl px-3.5 py-2.5 text-white font-bold text-xs focus:outline-none cursor-pointer transition-colors"
            >
              <option value="auto">Auto-detectar da imagem (Recomendado)</option>
              <option value="jornalismo">Jornalismo / Tarja Dupla</option>
              <option value="esportes">Placar de Esportes / Placar & Relógio</option>
              <option value="urgente">Alerta Urgente / Plantão de Notícias</option>
              <option value="clean">Clean / Minimalista (Podcast)</option>
            </select>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleScanImage}
            disabled={isScanning || !refImageBase64}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isScanning
                ? "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                : !refImageBase64
                ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-amber-500 text-black border-amber-400 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/10"
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Processando IA...</span>
              </>
            ) : (
              <>
                <Wand2 size={14} />
                <span>Analisar & Gerar GC</span>
              </>
            )}
          </button>

          {/* Real-time scan feedback steps */}
          {isScanning && (
            <div className="bg-[#18181b] border border-sky-500/20 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-5 h-5 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 animate-pulse">
                <Scan size={11} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 block">Etapa do Processo</span>
                <span className="text-[11px] text-zinc-300 font-bold block truncate">{scanSteps}</span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE WORKSPACE */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#070708]">
          
          {/* Top Panel: Live Monitor (16:9 Aspect Ratio Simulation) */}
          <div className="p-5 border-b border-white/5 bg-black/40 flex flex-col items-center shrink-0">
            <div 
              className="w-full max-w-3xl rounded-2xl overflow-hidden border border-zinc-800 relative bg-[#131317] shadow-inner"
              style={{ aspectRatio: "16/9" }}
            >
              {/* Checkerboard Pattern Background for alpha opacity */}
              <div 
                className="absolute inset-0 opacity-10" 
                style={{ 
                  backgroundImage: "radial-gradient(#ffffff 1px, transparent 0), radial-gradient(#ffffff 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px"
                }}
              />

              {/* Live Overlay Banner */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Monitor vMix Live Preview</span>
              </div>

              {/* Render dynamic interactive component preview */}
              {renderPreviewOverlay()}
              
              {/* Background Reference Indicator when empty */}
              {!refImageBase64 && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-zinc-950/40">
                  <div>
                    <Tv size={40} className="text-zinc-700 mx-auto mb-2" />
                    <span className="text-xs text-zinc-500 font-bold block">Preview do GC carregando com dados padrão</span>
                    <span className="text-[10px] text-zinc-600 block mt-1">Carregue um arquivo para escanear sob medida</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Tabs Selection */}
          <div className="bg-black/60 px-5 border-b border-white/5 flex items-center justify-between shrink-0 h-12">
            <div className="flex gap-1.5">
              {[
                { id: "ajustes", label: "Ajustes do GC", icon: <SlidersHorizontal size={13} /> },
                { id: "xaml", label: "Código WPF XAML", icon: <FileCode size={13} /> },
                { id: "guia", label: "Instruções vMix", icon: <Info size={13} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 h-9 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadWpfXaml}
                className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={11} className="text-sky-400" />
                <span>Baixar .XAML</span>
              </button>

              <button
                onClick={handleDownloadGtZip}
                className="h-8 px-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-400 flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck size={11} />
                <span>Baixar .gtzip</span>
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "ajustes" && (
              <div className="space-y-5 max-w-4xl">
                
                {/* 1. Content Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a880]">Conteúdo e Textos</h4>
                  
                  {scanData.layoutStyle === "esportes" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Campeonato / Rodada</label>
                        <input
                          type="text"
                          value={scanData.roundText || ""}
                          onChange={(e) => setScanData({ ...scanData, roundText: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Relógio / Tempo</label>
                        <input
                          type="text"
                          value={scanData.clock || ""}
                          onChange={(e) => setScanData({ ...scanData, clock: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-mono font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Placar (Home | Away)</label>
                        <input
                          type="text"
                          value={scanData.score || ""}
                          onChange={(e) => setScanData({ ...scanData, score: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880] text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Time da Casa (Home)</label>
                        <input
                          type="text"
                          value={scanData.homeTeam || ""}
                          onChange={(e) => setScanData({ ...scanData, homeTeam: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Time de Fora (Away)</label>
                        <input
                          type="text"
                          value={scanData.awayTeam || ""}
                          onChange={(e) => setScanData({ ...scanData, awayTeam: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Badge de Status (Live Tag)</label>
                        <input
                          type="text"
                          value={scanData.gcBadge || ""}
                          onChange={(e) => setScanData({ ...scanData, gcBadge: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Título Principal (Headline)</label>
                        <input
                          type="text"
                          value={scanData.gcTitle || ""}
                          onChange={(e) => setScanData({ ...scanData, gcTitle: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Subtítulo (Headline 2)</label>
                        <input
                          type="text"
                          value={scanData.gcSubtitle || ""}
                          onChange={(e) => setScanData({ ...scanData, gcSubtitle: e.target.value })}
                          className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#c5a880]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Color Controls */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a880]">Cores e Estilo Visual</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Primária</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.primaryColor}
                          onChange={(e) => setScanData({ ...scanData, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.primaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Secundária</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.secondaryColor}
                          onChange={(e) => setScanData({ ...scanData, secondaryColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.secondaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Destaque</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.accentColor}
                          onChange={(e) => setScanData({ ...scanData, accentColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.accentColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Texto 1</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.textColor}
                          onChange={(e) => setScanData({ ...scanData, textColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.textColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Texto 2</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.subtextColor}
                          onChange={(e) => setScanData({ ...scanData, subtextColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.subtextColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Fundo Tag</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.badgeBgColor}
                          onChange={(e) => setScanData({ ...scanData, badgeBgColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.badgeBgColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Texto Tag</label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="color"
                          value={scanData.badgeTextColor}
                          onChange={(e) => setScanData({ ...scanData, badgeTextColor: e.target.value })}
                          className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{scanData.badgeTextColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Layout Controls & Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Geometry Sliders */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a880]">Dimensões e Cantos</h4>
                    
                    <div className="space-y-3.5 bg-black/40 border border-zinc-900 rounded-xl p-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                          <span>Altura da Barra (WPF)</span>
                          <span className="text-[#c5a880]">{scanData.barHeight || 170} px</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="280"
                          value={scanData.barHeight || 170}
                          onChange={(e) => setScanData({ ...scanData, barHeight: parseInt(e.target.value) })}
                          className="w-full accent-amber-500 bg-zinc-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                          <span>Arredondamento dos Cantos</span>
                          <span className="text-[#c5a880]">{scanData.barCornerRadius || 12} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={scanData.barCornerRadius || 12}
                          onChange={(e) => setScanData({ ...scanData, barCornerRadius: parseInt(e.target.value) })}
                          className="w-full accent-amber-500 bg-zinc-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                          <span>Opacidade de Fundo</span>
                          <span className="text-[#c5a880]">{Math.round((scanData.barOpacity || 0.95) * 100)} %</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={(scanData.barOpacity || 0.95) * 100}
                          onChange={(e) => setScanData({ ...scanData, barOpacity: parseFloat(e.target.value) / 100 })}
                          className="w-full accent-amber-500 bg-zinc-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Config */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a880]">Logotipo da Transmissão</h4>
                    
                    <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-white block">Ativar Campo de Imagem</span>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">Disponibiliza um espaço para logo no vMix</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={scanData.hasLogo || false}
                          onChange={(e) => setScanData({ ...scanData, hasLogo: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-800 accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {scanData.hasLogo && (
                        <div className="flex items-center gap-3 bg-black/60 rounded-xl p-2.5 border border-white/5">
                          {scanData.logoUrl ? (
                            <img src={scanData.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded bg-white/5 border border-white/10 p-1 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                              <ImageIcon size={16} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Arquivo Ativo</span>
                            <span className="text-[10px] text-zinc-300 font-bold block truncate">
                              {scanData.logoUrl?.startsWith("data:image") ? "Imagem Personalizada Enviada" : "Ícone Padrão de Transmissão"}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => logoInputRef.current?.click()}
                            className="h-7 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-[#c5a880] border border-[#c5a880]/30 rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Upload size={10} />
                            <span>Alterar</span>
                          </button>
                          <input 
                            type="file" 
                            ref={logoInputRef} 
                            accept="image/*" 
                            onChange={handleLogoUpload} 
                            className="hidden" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === "xaml" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a880]">Código de Markup WPF XAML</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Compatível com vMix overlays nativos e renderização por hardware.</p>
                  </div>
                  
                  <button
                    onClick={handleCopyCode}
                    className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check size={11} className="text-green-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copiar XAML</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black max-h-[300px] overflow-y-auto">
                  <pre className="p-4 text-[10px] sm:text-xs text-sky-300 font-mono leading-relaxed select-all">
                    <code>{xamlCode}</code>
                  </pre>
                </div>

                <div className="bg-[#111115] border border-[#c5a880]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880] shrink-0 mt-0.5">
                      <FileCode size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Quer editar visualmente no Windows?</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Baixe o pacote .gtzip para abrir de forma nativa no GT Title Designer do vMix.</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleDownloadWpfXaml}
                      className="flex-1 sm:flex-none h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-black uppercase tracking-wider border border-white/5 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} className="text-sky-400" />
                      <span>Baixar .XAML</span>
                    </button>

                    <button
                      onClick={handleDownloadGtZip}
                      className="flex-1 sm:flex-none h-9 px-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-black uppercase tracking-wider border border-amber-400 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck size={13} />
                      <span>Baixar .gtzip</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "guia" && (
              <div className="max-w-3xl space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#c5a880]">Manual Prático de Importação no vMix</h4>
                  <p className="text-[10px] text-zinc-500">Duas alternativas fáceis para carregar suas artes geradas no software de transmissão.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Método 1 */}
                  <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                      Método 1: Importação Direta .XAML
                    </span>
                    <h5 className="text-[11px] font-bold text-white">Ideal para maior controle de código</h5>
                    <ol className="text-[10px] text-zinc-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
                      <li>Clique em <strong>Baixar .XAML</strong> para obter o arquivo de markup do Canvas.</li>
                      <li>No vMix, clique no botão <strong>Add Input</strong> (Adicionar Entrada).</li>
                      <li>Selecione a aba <strong>Title/XAML</strong>.</li>
                      <li>Clique em <strong>Browse</strong> e aponte para o arquivo carregado.</li>
                      <li>O vMix carregará a tarja com as animações nativas de storyboard WPF já prontas!</li>
                    </ol>
                  </div>

                  {/* Método 2 */}
                  <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-[#c5a880]/10 border border-[#c5a880]/25 px-2 py-0.5 rounded">
                      Método 2: Pacote .gtzip
                    </span>
                    <h5 className="text-[11px] font-bold text-white">Ideal para GT Title Designer</h5>
                    <ol className="text-[10px] text-zinc-400 space-y-1.5 list-decimal pl-4 leading-relaxed">
                      <li>Clique no botão <strong>Baixar .gtzip</strong>.</li>
                      <li>A IA empacotará o XML e os recursos em um arquivo ZIP compatível.</li>
                      <li>Abra o software <strong>vMix GT Title Designer</strong> (instalado junto com o vMix).</li>
                      <li>Abra o arquivo <code>.gtzip</code> diretamente.</li>
                      <li>Você poderá editar as camadas visualmente, alterar fontes e reposicionar tudo arrastando!</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-[#18181b]/30 rounded-xl p-3 border border-white/5 flex items-start gap-2.5">
                  <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    <strong>Dica de Transmissão:</strong> Todos os campos gerados contêm as propriedades <code>x:Name="Title"</code>, <code>x:Name="Description"</code>, <code>x:Name="Badge"</code> etc. Isso garante que, ao abrir no vMix, você pode alterar os textos ao vivo digitando diretamente na caixa de controle de entrada do software sem precisar alterar nenhum arquivo!
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2.5 ${
            localToast.type === "success" 
              ? "bg-[#181c18] border-green-500/30 text-green-400"
              : localToast.type === "error"
              ? "bg-[#1c1818] border-red-500/30 text-red-400"
              : localToast.type === "warning"
              ? "bg-[#1c1b18] border-yellow-500/30 text-yellow-400"
              : "bg-[#181a1c] border-sky-500/30 text-sky-400"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping shrink-0" />
            <span>{localToast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
