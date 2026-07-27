import React, { useState } from "react";
import { useImageStore } from "../store/useImageStore";
import { InpaintCanvas } from "./InpaintCanvas";
import {
  Sparkles,
  Layers,
  User,
  Copy,
  Download,
  MoreVertical,
  Code,
  MessageSquare,
  Wand2,
  Eye,
  SlidersHorizontal,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  RefreshCw,
  FolderOpen,
  Scissors
} from "lucide-react";

interface VisualStudioProps {
  customApiKey: string;
  myProfile?: any;
}

export default function VisualStudio({ customApiKey, myProfile }: VisualStudioProps) {
  // Zustand Store selectors
  const {
    imgConfig, updateImgConfig,
    personRefs, addPersonRef, removePersonRef,
    envRefs, addEnvRef, removeEnvRef,
    styleRefs, addStyleRef, removeStyleRef, updateStyleRefDescription,
    logoRefs, addLogoRef, removeLogoRef, updateLogoRef,
    generatedImages,
    aiThought,
    savedCards, setSavedCards,
    isGeneratingImage,
    generationProgress,
    activeSubTab, setActiveSubTab,
    canvasImage, setCanvasImage,
    maskImage,
    brushSize, setBrushSize,
    brushMode, setBrushMode,
    inpaintPrompt, setInpaintPrompt,
    isInpainting,
    generateImage,
    applyInpainting,
    removeBackground
  } = useImageStore();

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<string[]>([
    "config",
    "sujeito",
    "cenario",
    "estilo",
    "ajustes"
  ]);

  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter((s) => s !== section));
    } else {
      setOpenSections([...openSections, section]);
    }
  };

  // Local Project List
  const [visualProjects, setVisualProjects] = useState([
    { id: "alpha", name: "Projeto Alpha" },
    { id: "medium", name: "Medium shot of..." },
    { id: "web", name: "Web Builder" },
    { id: "new", name: "Novo Projeto" },
    { id: "dentist", name: "Dentista espec..." }
  ]);
  const [activeProjectId, setActiveProjectId] = useState("new");

  // Local UI States
  const [modoCriacao, setModoCriacao] = useState("Criativo (Padrão)");
  const [paletaCores, setPaletaCores] = useState("#ad8330, #000000, #ffffff");
  const [usarImagensFundo, setUsarImagensFundo] = useState(true);

  // Active Image Format/Zoom States
  const [zoomLevel, setZoomLevel] = useState(80);
  const [maskVisible, setMaskVisible] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeExportFormat, setActiveExportFormat] = useState<"AVIF" | "PNG" | "JPEG" | "WebP">("AVIF");

  // Code Viewer Modal State
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Image compression helper (Disabled/Bypassed to keep original image untouched)
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<{ url: string; data: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const data = url.split(",")[1];
        resolve({ url, data });
      };
      reader.readAsDataURL(file);
    });
  };

  // File Upload Helper with compression
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "person" | "env" | "style" | "logo"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      // Compress to max 1000px and 80% quality to fit within Vercel body size limits (max 4.5MB)
      const { url, data } = await compressImage(file, 1000, 1000, 0.85);

      const refObject = {
        url,
        data,
        mimeType: "image/jpeg",
        description: "",
        position: "Bottom Right",
        size: 15
      };

      if (type === "person") addPersonRef(refObject);
      else if (type === "env") addEnvRef(refObject);
      else if (type === "style") addStyleRef(refObject);
      else if (type === "logo") addLogoRef(refObject);
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      alert("Falha ao carregar e comprimir imagem.");
    }
  };

  // Watermark Positioning CSS Resolver
  const getLogoPositionStyle = (position: string) => {
    switch (position) {
      case "Top Left":
        return { top: "12px", left: "12px" };
      case "Top Right":
        return { top: "12px", right: "12px" };
      case "Bottom Left":
        return { bottom: "12px", left: "12px" };
      case "Bottom Right":
      default:
        return { bottom: "12px", right: "12px" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-full overflow-hidden z-10 relative">
      
      {/* COLUMN 1: SIDEBAR CONFIGURATIONS PANEL (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-black border border-white/5 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
        <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-amber-500" />
            <span className="text-xs font-black tracking-wider text-zinc-300 uppercase">
              Mesa de Direção de Arte
            </span>
          </div>
          <button
            onClick={() => {
              alert("Configurações redefinidas!");
              useImageStore.setState({
                imgConfig: {
                  imageSize: "1K",
                  aspectRatio: "1:1",
                  variations: 1,
                  gender: "Masculino",
                  positioning: "Centro",
                  clothingPose: "",
                  enableText: false,
                  h1: "",
                  h2: "",
                  cta: "",
                  textPosition: "Centro",
                  gradient: false,
                  niche: "",
                  environment: "",
                  useEnvRef: false,
                  envColor: "Neutro",
                  colorCode: "#ad8330",
                  enableAmbientColor: false,
                  rimLight: "Nenhuma",
                  enableRimLight: false,
                  compLight: "Nenhuma",
                  enableCompLight: false,
                  extractTypography: false,
                  framing: "Plano Médio",
                  floatingElements: false,
                  floatingElementsDescription: "",
                  sobriety: 50,
                  style: "Ultra Realista",
                  enableBlur: false,
                  lateralGradient: false,
                  noPeople: false,
                  additionalPrompt: ""
                } as any,
                personRefs: [],
                envRefs: [],
                styleRefs: [],
                logoRefs: []
              });
            }}
            className="text-[10px] text-zinc-500 hover:text-white font-semibold transition-colors"
          >
            Redefinir
          </button>
        </div>

        {/* Scrollable Configuration Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          
          {/* ACCORDION 1: Configurações da Arte */}
          <div className="border border-white/5 bg-black/15 rounded-xl overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleSection("config")}
              className="w-full flex items-center justify-between p-3 bg-black hover:bg-[#111]/80 transition-colors"
            >
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                1. Configurações da Arte
              </span>
              {openSections.includes("config") ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            {openSections.includes("config") && (
              <div className="p-3.5 space-y-4 border-t border-white/5">
                {/* Modo de Criação */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Modo de Criação</label>
                  <select
                    value={modoCriacao}
                    onChange={(e) => setModoCriacao(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option>Criativo (Padrão)</option>
                    <option>Fiel ao Rascunho</option>
                    <option>Estilo de Estúdio</option>
                  </select>
                </div>

                {/* Resolução */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Resolução</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["1K", "2K", "4K"].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateImgConfig({ imageSize: size })}
                        className={`py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                          imgConfig.imageSize === size
                            ? "bg-amber-500 text-zinc-950 scale-[1.02]"
                            : "bg-black hover:bg-[#111] border border-white/5 text-zinc-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proporção */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Proporção</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["1:1", "9:16", "16:9", "4:3", "3:4"].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => updateImgConfig({ aspectRatio: ratio })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          imgConfig.aspectRatio === ratio
                            ? "bg-amber-500 text-zinc-950"
                            : "bg-black hover:bg-[#111] border border-white/5 text-zinc-400"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variações */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Variações</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((v) => (
                      <button
                        key={v}
                        onClick={() => updateImgConfig({ variations: v })}
                        className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                          imgConfig.variations === v
                            ? "bg-amber-500 text-zinc-950 scale-105"
                            : "bg-black hover:bg-[#111] border border-white/5 text-zinc-400"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paleta de Cores */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Paleta de Cores (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={paletaCores}
                    onChange={(e) => setPaletaCores(e.target.value)}
                    placeholder="Ex: #ad8330, #000000, #ffffff"
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Toggle Usar Imagens de Fundo */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-zinc-400">Usar Imagens de Fundo</span>
                  <button
                    onClick={() => {
                      setUsarImagensFundo(!usarImagensFundo);
                      updateImgConfig({ useEnvRef: !usarImagensFundo });
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${usarImagensFundo ? "bg-amber-500" : "bg-[#111]"}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${usarImagensFundo ? "translate-x-4" : ""}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: Sujeito & Composição */}
          <div className="border border-white/5 bg-black/15 rounded-xl overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleSection("sujeito")}
              className="w-full flex items-center justify-between p-3 bg-black hover:bg-[#111]/80 transition-colors"
            >
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                2. Sujeito & Composição
              </span>
              {openSections.includes("sujeito") ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            {openSections.includes("sujeito") && (
              <div className="p-3.5 space-y-4 border-t border-white/5">
                {/* Gênero */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Gênero</label>
                  <select
                    value={imgConfig.gender}
                    onChange={(e) => updateImgConfig({ gender: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Andrógino</option>
                    <option>Qualquer</option>
                  </select>
                </div>

                {/* Enquadramento */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Enquadramento</label>
                  <select
                    value={imgConfig.framing}
                    onChange={(e) => updateImgConfig({ framing: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option>Close-up</option>
                    <option>Plano Médio</option>
                    <option>Plano Americano</option>
                    <option>Corpo Inteiro</option>
                    <option>Aberto</option>
                  </select>
                </div>

                {/* Posicionamento */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Posicionamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Esquerda", "Centro", "Direita"].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateImgConfig({ positioning: pos })}
                        className={`py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                          imgConfig.positioning === pos
                            ? "bg-amber-500 text-zinc-950"
                            : "bg-black hover:bg-[#111] border border-white/5 text-zinc-400"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roupa e Pose */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Roupa e Pose (Opcional)</label>
                  <textarea
                    value={imgConfig.clothingPose}
                    onChange={(e) => updateImgConfig({ clothingPose: e.target.value })}
                    placeholder="Ex: Terno azul marinho, braços cruzados..."
                    className="w-full min-h-[60px] bg-black border border-white/5 rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Upload Fotos de Referência Pessoas */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">Fotos de Referência (Pessoas)</label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {personRefs.map((ref, idx) => (
                      <div key={idx} className="relative w-full aspect-square border border-white/5 rounded-lg overflow-hidden group bg-black">
                        <img src={ref.url} className="w-full h-full object-cover" alt="" />
                        <button
                          onClick={() => removePersonRef(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="border border-dashed border-white/20 hover:border-amber-500/50 rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors bg-black/20">
                      <Plus size={16} className="text-zinc-500" />
                      <span className="text-[8px] text-zinc-500 mt-1 font-bold">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "person")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: Cenário & Iluminação */}
          <div className="border border-white/5 bg-black/15 rounded-xl overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleSection("cenario")}
              className="w-full flex items-center justify-between p-3 bg-black hover:bg-[#111]/80 transition-colors"
            >
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                3. Cenário & Iluminação
              </span>
              {openSections.includes("cenario") ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            {openSections.includes("cenario") && (
              <div className="p-3.5 space-y-4 border-t border-white/5">
                {/* Nicho / Projeto */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Nicho / Projeto</label>
                  <input
                    type="text"
                    value={imgConfig.niche}
                    onChange={(e) => updateImgConfig({ niche: e.target.value })}
                    placeholder="Ex: Trader de Elite, Clínica de Estética..."
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Descrição do Ambiente */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Descrição do Ambiente</label>
                  <textarea
                    value={imgConfig.environment}
                    onChange={(e) => updateImgConfig({ environment: e.target.value })}
                    placeholder="Ex: Escritório moderno de vidro com vista para cidade..."
                    className="w-full min-h-[60px] bg-black border border-white/5 rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Cor Ambiente */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Cor Ambiente</label>
                  <div className="flex gap-2">
                    <select
                      value={imgConfig.envColor}
                      onChange={(e) => updateImgConfig({ envColor: e.target.value, colorCode: e.target.value === "Neutro" ? "#ad8330" : e.target.value })}
                      className="flex-1 bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Neutro">Neutro (Dourado/Preto)</option>
                      <option value="Branca">Branca</option>
                      <option value="Azul">Azul</option>
                      <option value="Vermelha">Vermelha</option>
                      <option value="Dourada">Dourada</option>
                      <option value="Verde">Verde</option>
                      <option value="Roxa">Roxa</option>
                    </select>
                    <input
                      type="color"
                      value={imgConfig.colorCode || "#ad8330"}
                      onChange={(e) => updateImgConfig({ colorCode: e.target.value, enableAmbientColor: true })}
                      className="w-8 h-8 rounded-lg bg-black border border-white/5 p-0.5 cursor-pointer shrink-0"
                    />
                  </div>
                </div>

                {/* Luz de Recorte */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Luz de Recorte</label>
                  <select
                    value={imgConfig.rimLight}
                    onChange={(e) => updateImgConfig({ rimLight: e.target.value, enableRimLight: e.target.value !== "Nenhuma" })}
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option>Nenhuma</option>
                    <option>Branca</option>
                    <option>Azul</option>
                    <option>Vermelha</option>
                    <option>Dourada</option>
                    <option>Verde</option>
                    <option>Roxa</option>
                  </select>
                </div>

                {/* Luz Complementar */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Luz Comp.</label>
                  <select
                    value={imgConfig.compLight}
                    onChange={(e) => updateImgConfig({ compLight: e.target.value, enableCompLight: e.target.value !== "Nenhuma" })}
                    className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option>Nenhuma</option>
                    <option>Branca</option>
                    <option>Azul</option>
                    <option>Vermelha</option>
                    <option>Dourada</option>
                    <option>Verde</option>
                    <option>Roxa</option>
                  </select>
                </div>

                {/* Upload Fotos de Referência (Estilo) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">Fotos de Referência (Estilo)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {styleRefs.map((ref, idx) => (
                      <div key={idx} className="relative w-full aspect-square border border-white/5 rounded-lg overflow-hidden group bg-black">
                        <img src={ref.url} className="w-full h-full object-cover" alt="" />
                        <button
                          onClick={() => removeStyleRef(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="border border-dashed border-white/20 hover:border-amber-500/50 rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors bg-black/20">
                      <Plus size={16} className="text-zinc-500" />
                      <span className="text-[8px] text-zinc-500 mt-1 font-bold">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "style")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Extrair estilo tipográfico */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-zinc-400">Extrair estilo tipográfico</span>
                  <button
                    onClick={() => updateImgConfig({ extractTypography: !imgConfig.extractTypography })}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${imgConfig.extractTypography ? "bg-amber-500" : "bg-[#111]"}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${imgConfig.extractTypography ? "translate-x-4" : ""}`} />
                  </button>
                </div>

                {/* Upload Logos */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block">Logos</label>
                  <div className="grid grid-cols-4 gap-2">
                    {logoRefs.map((ref, idx) => (
                      <div key={idx} className="relative w-full aspect-square border border-white/5 rounded-lg overflow-hidden group bg-black">
                        <img src={ref.url} className="w-full h-full object-contain p-1" alt="" />
                        <button
                          onClick={() => removeLogoRef(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="border border-dashed border-white/20 hover:border-amber-500/50 rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors bg-black/20">
                      <Plus size={16} className="text-zinc-500" />
                      <span className="text-[8px] text-zinc-500 mt-1 font-bold">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 4: Estilo & Efeitos */}
          <div className="border border-white/5 bg-black/15 rounded-xl overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleSection("estilo")}
              className="w-full flex items-center justify-between p-3 bg-black hover:bg-[#111]/80 transition-colors"
            >
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                4. Estilo & Efeitos
              </span>
              {openSections.includes("estilo") ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            {openSections.includes("estilo") && (
              <div className="p-3.5 space-y-4 border-t border-white/5">
                {/* Sobriedade Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                    <span>Criativo / Vibrante</span>
                    <span>Sóbrio / Profissional</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imgConfig.sobriety}
                    onChange={(e) => updateImgConfig({ sobriety: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Estilo Visual Grid */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Estilo Visual</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      "Clássico",
                      "Formal",
                      "Elegante",
                      "Sexy",
                      "Institucional",
                      "Tecnológico",
                      "Glasmorphism",
                      "Interface UI",
                      "Minimalista",
                      "Lúdico",
                      "Cartoon",
                      "Infoproduto",
                      "Jovial",
                      "Gamer",
                      "Retrato Pro",
                      "Ultra Realista",
                      "Glow"
                    ].map((styleOption) => (
                      <button
                        key={styleOption}
                        onClick={() => updateImgConfig({ style: styleOption })}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all border text-left truncate ${
                          imgConfig.style === styleOption
                            ? "bg-amber-500 text-zinc-950 border-amber-400"
                            : "bg-black text-zinc-400 border-white/5 hover:border-zinc-700"
                        }`}
                      >
                        {styleOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Desfoque (Blur/Bokeh)</span>
                    <button
                      onClick={() => updateImgConfig({ enableBlur: !imgConfig.enableBlur })}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${imgConfig.enableBlur ? "bg-amber-500" : "bg-[#111]"}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${imgConfig.enableBlur ? "translate-x-4" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Degradê Lateral</span>
                    <button
                      onClick={() => updateImgConfig({ lateralGradient: !imgConfig.lateralGradient })}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${imgConfig.lateralGradient ? "bg-amber-500" : "bg-[#111]"}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${imgConfig.lateralGradient ? "translate-x-4" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Sem Pessoas</span>
                    <button
                      onClick={() => updateImgConfig({ noPeople: !imgConfig.noPeople })}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${imgConfig.noPeople ? "bg-amber-500" : "bg-[#111]"}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${imgConfig.noPeople ? "translate-x-4" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Elementos Flutuantes</span>
                    <button
                      onClick={() => updateImgConfig({ floatingElements: !imgConfig.floatingElements })}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${imgConfig.floatingElements ? "bg-amber-500" : "bg-[#111]"}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${imgConfig.floatingElements ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                  {imgConfig.floatingElements && (
                    <input
                      type="text"
                      value={imgConfig.floatingElementsDescription}
                      onChange={(e) => updateImgConfig({ floatingElementsDescription: e.target.value })}
                      placeholder="Descreva os elementos (ex: partículas de ouro, moedas...)"
                      className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Permitir Texto na Arte</span>
                    <button
                      onClick={() => updateImgConfig({ enableText: !imgConfig.enableText })}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${imgConfig.enableText ? "bg-amber-500" : "bg-[#111]"}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${imgConfig.enableText ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                  {imgConfig.enableText && (
                    <div className="space-y-2 p-2.5 bg-black/40 border border-white/5 rounded-xl">
                      <input
                        type="text"
                        value={imgConfig.h1}
                        onChange={(e) => updateImgConfig({ h1: e.target.value })}
                        placeholder="Título (H1)"
                        className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={imgConfig.h2}
                        onChange={(e) => updateImgConfig({ h2: e.target.value })}
                        placeholder="Subtítulo (H2)"
                        className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={imgConfig.cta}
                        onChange={(e) => updateImgConfig({ cta: e.target.value })}
                        placeholder="Botão (CTA)"
                        className="w-full bg-black border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 5: Ajustes Finais */}
          <div className="border border-white/5 bg-black/15 rounded-xl overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleSection("ajustes")}
              className="w-full flex items-center justify-between p-3 bg-black hover:bg-[#111]/80 transition-colors"
            >
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                5. Ajustes Finais e Geração
              </span>
              {openSections.includes("ajustes") ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            {openSections.includes("ajustes") && (
              <div className="p-3.5 space-y-4 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Prompt Adicional (Opcional)</label>
                  <textarea
                    value={imgConfig.additionalPrompt}
                    onChange={(e) => updateImgConfig({ additionalPrompt: e.target.value })}
                    placeholder="Adicione qualquer outro detalhe específico aqui..."
                    className="w-full min-h-[70px] bg-black border border-white/5 rounded-lg p-2 text-xs text-white resize-none focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Generate Sticky Bottom Button */}
        <div className="p-4 border-t border-white/5 bg-black/40">
          <button
            onClick={() => generateImage(customApiKey, { type: "color", colors: paletaCores.split(",").map((c) => c.trim()) })}
            disabled={isGeneratingImage}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 py-3 rounded-xl font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-amber-500/10 active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>Gerar Arte(s)</span>
          </button>
        </div>
      </div>

      {/* COLUMN 2: WORKSPACE & RESULTS CANVAS (lg:col-span-8) */}
      <div className="lg:col-span-8 bg-black border border-white/5 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
        {/* Results Header */}
        <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FolderOpen size={14} className="text-zinc-500" />
            <span className="text-xs font-bold text-zinc-300">
              Resultados ({imgConfig.imageSize}) - {generatedImages.length} imagem(ns) gerada(s)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* API Status */}
            <div className="bg-black px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-bold">API OK</span>
            </div>
            
            {/* HTML Viewer Button */}
            <button
              onClick={() => setShowCodeModal(true)}
              className="p-1.5 bg-black hover:bg-[#111] rounded-lg border border-white/5 text-zinc-400 hover:text-white transition-colors"
              title="Ver Código Renderizado"
            >
              <Code size={14} />
            </button>
          </div>
        </div>

        {/* Workspace Center Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-black/30 relative custom-scrollbar">
          {isGeneratingImage ? (
            <div className="text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
              </div>
              <p className="text-xs text-zinc-400 font-black animate-pulse uppercase tracking-widest">
                Gerando arte com o Imagen 3...
              </p>
            </div>
          ) : canvasImage ? (
            <div className="flex flex-col items-center gap-4 max-w-full">
              {/* Image and Inpaint Workspace Canvas */}
              <div
                className="relative bg-black border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 flex items-center justify-center max-w-full"
                style={{
                  width: `${zoomLevel}%`,
                  aspectRatio: imgConfig.aspectRatio === "9:16" ? "9/16" : imgConfig.aspectRatio === "16:9" ? "16/9" : "1/1"
                }}
              >
                {/* Image Mask Canvas */}
                <div className={maskVisible ? "w-full h-full relative" : "w-full h-full relative pointer-events-none opacity-90"}>
                  <InpaintCanvas
                    imageUrl={canvasImage}
                    brushSize={brushSize}
                    brushMode={brushMode}
                    onSaveMask={(maskBase64) => useImageStore.setState({ maskImage: maskBase64 })}
                    onClear={() => useImageStore.setState({ maskImage: null })}
                  />
                </div>

                {/* Draggable/CSS Overlay Logo Watermark */}
                {logoRefs.length > 0 && (
                  <img
                    src={logoRefs[logoRefs.length - 1].url}
                    style={{
                      position: "absolute",
                      width: `${logoRefs[logoRefs.length - 1].size || 15}%`,
                      opacity: 0.85,
                      pointerEvents: "none",
                      ...getLogoPositionStyle(logoRefs[logoRefs.length - 1].position || "Bottom Right")
                    }}
                    alt="Watermark Overlay"
                    className="z-10 shadow-sm"
                  />
                )}
              </div>

              {/* Mask Annotation Label */}
              <p className="text-[10px] text-zinc-500 text-center italic mt-[-5px]">
                "Pinte sobre as áreas que deseja regenerar ou substituir no background."
              </p>

              {/* Canvas controls bottom bar */}
              <div className="flex gap-2 w-full max-w-xl justify-between items-center bg-black/60 p-2.5 rounded-xl border border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBrushMode(brushMode === "draw" ? "erase" : "draw");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                      brushMode === "draw" ? "bg-amber-500 text-zinc-950" : "bg-[#111] text-zinc-400"
                    }`}
                  >
                    Pintar Máscara
                  </button>
                  <button
                    onClick={() => {
                      updateImgConfig({ aspectRatio: "9:16" });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-black border border-white/5 text-[9px] font-black text-zinc-400 hover:text-white uppercase transition-colors"
                  >
                    Versão Vertical (9:16)
                  </button>
                </div>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => removeBackground()}
                    disabled={isGeneratingImage}
                    className="bg-black hover:bg-[#111] text-zinc-300 disabled:opacity-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 shadow-md border border-white/5"
                    title="Remover Fundo (IA)"
                  >
                    <Scissors size={12} />
                    <span>SEM FUNDO</span>
                  </button>
                  <a
                    href={canvasImage}
                    download={`Zion_Studio_Design_Output_${Date.now().toString().slice(-4)}.png`}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 shadow-md"
                  >
                    <Download size={12} />
                    <span>DOWNLOAD</span>
                  </a>
                  
                  {/* Export format popover */}
                  <div className="relative">
                    <button
                      onClick={() => setIsExportOpen(!isExportOpen)}
                      className="p-1.5 bg-black border border-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <MoreVertical size={12} />
                    </button>
                    {isExportOpen && (
                      <div className="absolute right-0 bottom-full mb-2 bg-black border border-white/5 p-2 rounded-xl w-32 shadow-xl z-50 flex flex-col gap-1">
                        {["AVIF", "PNG", "JPEG", "WebP"].map((format) => (
                          <button
                            key={format}
                            onClick={() => {
                              setActiveExportFormat(format as any);
                              setIsExportOpen(false);
                              alert(`Pronto para exportar em ${format}!`);
                            }}
                            className={`px-2.5 py-1.5 rounded text-[10px] font-bold text-left hover:bg-white/5 ${
                              activeExportFormat === format ? "text-amber-500" : "text-zinc-400"
                            }`}
                          >
                            Exportar {format}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 space-y-2">
              <ImageIcon size={32} className="mx-auto opacity-10" />
              <p className="text-xs max-w-xs mx-auto">
                Configure os parâmetros ao lado e clique em gerar para criar artes incríveis com a inteligência artificial da Zion.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Inpaint Refinement Toolbar */}
        {canvasImage && !isGeneratingImage && (
          <div className="p-4 border-t border-white/5 bg-black/40 flex items-center gap-3 shrink-0">
            <input
              type="text"
              value={inpaintPrompt}
              onChange={(e) => setInpaintPrompt(e.target.value)}
              placeholder="Descreva o ajuste ou inpainting a aplicar (ex: coloque luz neon azul nas bordas, mude o fundo para cyberpunk...)"
              className="flex-1 bg-black border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
            <button
              onClick={() => applyInpainting(customApiKey)}
              disabled={isInpainting || !inpaintPrompt.trim()}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
            >
              {isInpainting ? "Refinando..." : "Refinar"}
            </button>
          </div>
        )}

        {/* Masonry gallery feed displaying generated images list */}
        {generatedImages.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-black/40 shrink-0">
            <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-3">HISTÓRICO DE ARTES DESTA SESSÃO</label>
            <div className="grid grid-cols-6 gap-2">
              {generatedImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCanvasImage(img)}
                  className={`relative aspect-square rounded-lg border overflow-hidden cursor-pointer bg-black hover:scale-102 transition-transform ${
                    canvasImage === img ? "border-amber-500 shadow-md" : "border-white/5"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating green code button in the bottom-right corner */}
      <button
        onClick={() => setShowCodeModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90 transition-all z-50 border border-emerald-400/20"
        title="Ver Código Fonte do Template"
      >
        <Code size={20} />
      </button>

      {/* HTML Code Viewer Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-black border border-white/5 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-zinc-300 uppercase">
                Template Renderizado (HTML/Tailwind)
              </span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-xs text-zinc-400 hover:text-white font-bold"
              >
                FECHAR
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <pre className="text-xs font-mono text-zinc-400 bg-black p-4 rounded-xl border border-white/5 select-all overflow-x-auto">
                {`<!-- Zion Graphic Design Generated Card Template -->
<div class="relative overflow-hidden rounded-2xl bg-black text-white border border-white/5 aspect-${
                  imgConfig.aspectRatio === "9:16" ? "vertical" : imgConfig.aspectRatio === "16:9" ? "video" : "square"
                }" style="max-width: 600px;">
  
  <!-- Generated Image Layer -->
  <img src="${canvasImage || "placeholder-image-url"}" class="w-full h-full object-cover" />

  <!-- Premium Ambient Gradients -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
  
  <!-- Overlay Branding Logo -->
  ${
    logoRefs.length > 0
      ? `<img src="branding-logo.png" class="absolute bottom-4 right-4 w-16 opacity-90" />`
      : ""
  }

  <!-- Typography Copy Elements -->
  ${
    imgConfig.enableText
      ? `<div class="absolute inset-0 flex flex-col justify-end p-6 space-y-2">
    <h1 class="text-xl font-bold tracking-tight text-white">${imgConfig.h1}</h1>
    <p class="text-sm text-zinc-300">${imgConfig.h2}</p>
    <button class="bg-amber-500 text-zinc-950 font-black text-xs px-4 py-2 rounded-lg self-start mt-2">${imgConfig.cta}</button>
  </div>`
      : ""
  }
</div>`}
              </pre>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
