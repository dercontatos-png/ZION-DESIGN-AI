import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { compressImageForStorage } from "../utils/imageCompressor";
import {
  Image as ImageIcon,
  UserRound,
  Camera,
  Layers,
  Sparkles,
  Clock,
  Briefcase,
  Crown,
  Flame,
  Shield,
  Cpu,
  GlassWater,
  Layout,
  Feather,
  Smile,
  Tv,
  Zap,
  Gamepad2,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Mountain,
  Type,
  Settings,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Sliders
} from "lucide-react";

interface OrionProBuilderProps {
  onSwitchAgent?: (agent: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  isGenerating?: boolean;
  generatePremiumImage?: (opts?: any) => Promise<void>;
  generatePromptOnly?: boolean;
  setGeneratePromptOnly?: (val: boolean) => void;
  handleGenerateMasterPrompt?: () => Promise<void>;
  isGeneratingPrompt?: boolean;
  onCloseMobileCategory?: () => void;
}

export interface TextBlockItem {
  id: string;
  type: "H1" | "H2" | "Texto" | "Bullets" | "CTA";
  text: string;
  weight: number; // 1 to 5
  color: string;
  position: string;
}

interface ImageWithDesc {
  id: string;
  url: string;
  desc: string;
}

// 17 Canonical Visual Styles
const ESTILOS_VISUAIS = [
  { value: "ultra_realistic", label: "Ultra Realista", Icon: Camera },
  { value: "glow", label: "Glow Radiante", Icon: Sparkles },
  { value: "pro_portrait", label: "Retrato Profissional", Icon: Layers },
  { value: "classic", label: "Clássico", Icon: Clock },
  { value: "formal", label: "Formal Corporativo", Icon: Briefcase },
  { value: "elegant", label: "Elegante & Luxo", Icon: Crown },
  { value: "sexy", label: "Editorial Dramático", Icon: Flame },
  { value: "institutional", label: "Institucional", Icon: Shield },
  { value: "tech", label: "Tecnológico / Cyber", Icon: Cpu },
  { value: "glassmorphism", label: "Glassmorphism", Icon: GlassWater },
  { value: "ui_interface", label: "Interface UI", Icon: Layout },
  { value: "minimalist", label: "Minimalista", Icon: Feather },
  { value: "playful", label: "Lúdico / Divertido", Icon: Smile },
  { value: "cartoon", label: "Cartoon / Ilustrado", Icon: Tv },
  { value: "infoproduct", label: "Infoproduto", Icon: Zap },
  { value: "jovial", label: "Jovial Lifestyle", Icon: Sparkles },
  { value: "gamer", label: "Gamer Esports", Icon: Gamepad2 }
];

export const OrionProBuilder: React.FC<OrionProBuilderProps> = ({
  showToast = () => {},
  isGenerating = false,
  generatePremiumImage,
  onCloseMobileCategory
}) => {
  const store = useProjectStore();

  // ── 6 ACCORDIONS STATE (Principal aberto por padrão, outros fechados; toggles independentes)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    principal: true,
    marca_estilo: false,
    cenario: false,
    texto_imagem: false,
    ajustes: false,
    configuracoes: false
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allOpen = Object.values(openSections).every(Boolean);

  const handleToggleAll = () => {
    const nextState = !allOpen;
    setOpenSections({
      principal: nextState,
      marca_estilo: nextState,
      cenario: nextState,
      texto_imagem: nextState,
      ajustes: nextState,
      configuracoes: nextState
    });
  };

  // ── Section 1: Principal
  const [categoria, setCategoria] = useState<"Pessoa" | "Produto" | "Livre">("Pessoa");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [subjectDescription, setSubjectDescription] = useState<string>("");
  const [subjectPosition, setSubjectPosition] = useState<"left" | "center" | "right">("center");
  const [plano, setPlano] = useState<string>("medium");

  // ── Section 2: Marca e estilo
  const [corAmbiente, setCorAmbiente] = useState<string>("#1A1A2E");
  const [luzComplementar, setLuzComplementar] = useState<string>("#E2E2E2");
  const [corDestaque, setCorDestaque] = useState<string>("#7C3AED");
  const [estiloVisual, setEstiloVisual] = useState<string>("ultra_realistic");
  const [estiloImages, setEstiloImages] = useState<ImageWithDesc[]>([]);
  const [styleRefDescription, setStyleRefDescription] = useState<string>("");
  const [sobriedadeCriatividade, setSobriedadeCriatividade] = useState<number>(50);

  // ── Section 3: Cenário
  const [nichoProjeto, setNichoProjeto] = useState<string>("");
  const [sceneDescription, setSceneDescription] = useState<string>("");
  const [ambienteImages, setAmbienteImages] = useState<ImageWithDesc[]>([]);
  const [sceneRefDescription, setSceneRefDescription] = useState<string>("");

  // ── Section 4: Texto na imagem
  const [textBlocks, setTextBlocks] = useState<TextBlockItem[]>([
    { id: "1", type: "H1", text: "", weight: 5, color: "#FFFFFF", position: "middle-center" }
  ]);
  const [posicaoTexto, setPosicaoTexto] = useState<"left" | "center" | "right">("center");
  const [degradeTexto, setDegradeTexto] = useState<boolean>(false);

  // ── Section 5: Ajustes
  const [elementosFlutuantes, setElementosFlutuantes] = useState<string>("");
  const [usarBlur, setUsarBlur] = useState<boolean>(false);
  const [promptAdicional, setPromptAdicional] = useState<string>("");

  // ── Section 6: Configurações
  const [dimensao, setDimensao] = useState<string>("16:9");
  const [quality, setQuality] = useState<"1K" | "2K" | "4K">("2K");

  // Modal Ajustar Fotos e Cena
  const [showPhotoAdjustModal, setShowPhotoAdjustModal] = useState<boolean>(false);

  // File Input Refs
  const fileInputSujeitoRef = useRef<HTMLInputElement>(null);
  const fileInputEstiloRef = useRef<HTMLInputElement>(null);
  const fileInputAmbienteRef = useRef<HTMLInputElement>(null);

  // Sync state from Store on initial mount and project switch
  useEffect(() => {
    if (!store.activeProjectId) return;
    if (store.dimensao) setDimensao(store.dimensao);
    if (store.qualidade || store.resolucao) {
      const q = (store.qualidade || store.resolucao || "2K") as "1K" | "2K" | "4K";
      setQuality(q === "1K" || q === "4K" ? q : "2K");
    }
    if ((store as any).categoria) setCategoria((store as any).categoria);
    if (store.quantidade) setQuantidade(String(store.quantidade));
    if (store.poseDescription || store.composicaoCustom) {
      setSubjectDescription(store.poseDescription || store.composicaoCustom || "");
    }
    if (store.positioning) {
      const p = store.positioning.toLowerCase();
      if (p.includes("esq") || p.includes("left")) setSubjectPosition("left");
      else if (p.includes("dir") || p.includes("right")) setSubjectPosition("right");
      else setSubjectPosition("center");
    }
    if (store.composicao) {
      const c = store.composicao.toLowerCase();
      if (c.includes("close")) setPlano("close-up");
      else if (c.includes("american")) setPlano("american");
      else if (c.includes("corpo") || c.includes("full")) setPlano("full_body");
      else setPlano("medium");
    }
    if (store.cores) {
      if (store.cores.ambiente) setCorAmbiente(store.cores.ambiente);
      if (store.cores.complementar) setLuzComplementar(store.cores.complementar);
      if (store.cores.recorte || store.cores.acento) setCorDestaque(store.cores.recorte || store.cores.acento || "#7C3AED");
    }
    if (store.estiloVisual) setEstiloVisual(store.estiloVisual);
    if (store.nicho) setNichoProjeto(store.nicho);
    if (store.promptCenario || store.cenario) setSceneDescription(store.promptCenario || store.cenario || "");
    if (store.additionalPrompt) setPromptAdicional(store.additionalPrompt);
    if (store.floatingElementsCustom) setElementosFlutuantes(store.floatingElementsCustom);
    if (store.enableBlur !== undefined) setUsarBlur(Boolean(store.enableBlur));
    if (store.degradeLeitura !== undefined) setDegradeTexto(Boolean(store.degradeLeitura));
    if (store.nivelCriativo !== undefined) setSobriedadeCriatividade(Number(store.nivelCriativo));

    if (Array.isArray(store.camadasTexto) && store.camadasTexto.length > 0) {
      setTextBlocks(
        store.camadasTexto.map((c: any, i: number) => ({
          id: c.id || `block_${i}`,
          type: (c.tipoBloco || c.funcao || "H1").toUpperCase() as any,
          text: c.conteudo || "",
          weight: c.pesoVisual || 5,
          color: c.cor || "#FFFFFF",
          position: c.posicao || "middle-center"
        }))
      );
    }
  }, [store.activeProjectId, store.lastLoadedAt]);

  // Sync to store in background
  const syncToStore = useCallback(() => {
    const calculatedTypoPos = posicaoTexto === "left" ? "Esquerda" : posicaoTexto === "right" ? "Direita" : "Centro";
    const effectiveSubjectPos = subjectPosition === "left" ? "Esquerda" : subjectPosition === "right" ? "Direita" : "Centro";

    store.updateConfig({
      qualidade: quality,
      resolucao: quality,
      dimensao: dimensao,
      categoria: categoria,
      quantidade: Number(quantidade) || 1,
      poseDescription: subjectDescription,
      composicaoCustom: subjectDescription,
      positioning: effectiveSubjectPos,
      composicao: plano,
      cores: {
        ambiente: corAmbiente,
        complementar: luzComplementar,
        recorte: corDestaque,
        acento: corDestaque,
        primaria: corAmbiente,
        secundaria: luzComplementar,
        paleta: [corAmbiente, luzComplementar, corDestaque].filter(Boolean)
      },
      estiloVisual: estiloVisual,
      estilosVisuais: [estiloVisual],
      nicho: nichoProjeto,
      cenario: sceneDescription,
      promptCenario: sceneDescription,
      camadasTexto: textBlocks.map((b) => ({
        id: b.id,
        conteudo: b.text,
        funcao: b.type as any,
        tipoBloco: b.type,
        pesoVisual: b.weight,
        cor: b.color,
        posicao: b.position
      })),
      typographyPosition: calculatedTypoPos,
      degradeLeitura: degradeTexto,
      elementosFlutuantes: Boolean(elementosFlutuantes),
      floatingElementsCustom: elementosFlutuantes,
      enableBlur: usarBlur,
      additionalPrompt: promptAdicional,
      nivelCriativo: sobriedadeCriatividade,
      activeAgentSlug: "orion-pro"
    } as any);
  }, [
    quality,
    dimensao,
    categoria,
    quantidade,
    subjectDescription,
    subjectPosition,
    plano,
    corAmbiente,
    luzComplementar,
    corDestaque,
    estiloVisual,
    nichoProjeto,
    sceneDescription,
    textBlocks,
    posicaoTexto,
    degradeTexto,
    elementosFlutuantes,
    usarBlur,
    promptAdicional,
    sobriedadeCriatividade,
    store
  ]);

  // Handle Upload Photos
  const handleUploadSujeito = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(async (file) => {
      const b64 = await compressImageForStorage(file, 1600, 0.82);
      if (!b64) return;
      const currentList = store.sujeitosBase64List || [];
      if (currentList.length >= 8) {
        showToast("Limite de 8 fotos atingido.", "warning");
        return;
      }
      store.setSujeitoBase64List([...currentList, b64]);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: b64, filename: file.name || "sujeito_" + Date.now() + ".jpg" })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) {
            const current = store.sujeitosBase64List || [];
            const replaced = current.map(item => item === b64 ? data.url : item);
            store.setSujeitoBase64List(replaced);
          }
        }
      } catch (err) {
        console.warn("Upload sujeito error:", err);
      }
    });
    if (e.target) e.target.value = "";
  };

  const handleRemoveSujeito = (idx: number) => {
    const currentList = store.sujeitosBase64List || [];
    store.setSujeitoBase64List(currentList.filter((_, i) => i !== idx));
  };

  // Handle Paste (Ctrl+V)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          compressImageForStorage(file, 1600, 0.82).then((b64) => {
            if (b64) {
              const currentList = store.sujeitosBase64List || [];
              store.setSujeitoBase64List([...currentList, b64]);
              showToast("Imagem colada com sucesso!", "success");
            }
          });
        }
      }
    }
  }, [store, showToast]);

  // Handle Text Blocks
  const handleAddTextBlock = () => {
    if (textBlocks.length >= 8) {
      showToast("Limite de 8 blocos de texto atingido.", "warning");
      return;
    }
    setTextBlocks((prev) => [
      ...prev,
      { id: String(Date.now()), type: "H2", text: "", weight: 3, color: "#FFFFFF", position: "middle-center" }
    ]);
  };

  const handleRemoveTextBlock = (id: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateTextBlock = (id: string, updates: Partial<TextBlockItem>) => {
    setTextBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // Main Click Construir
  const handleConstruirClick = () => {
    syncToStore();
    generatePremiumImage?.();
  };

  const fotosList = store.sujeitosBase64List || [];

  return (
    <div 
      onPaste={handlePaste}
      tabIndex={0}
      className="flex flex-col h-full w-full overflow-hidden bg-[#0C0D11] text-[#E4E4E7] select-none font-sans outline-none"
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. TOPO FIXO: EXPANDIR / RECOLHER TUDO                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0C0D11] z-20">
        <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
          Direção Criativa do Órion Pro
        </span>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          {allOpen ? "Recolher Tudo" : "Expandir Tudo"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. ÁREA ROLÁVEL COM OS 6 ACCORDIONS                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* ── 1. PRINCIPAL ── */}
        <div className="rounded-2xl border border-white/5 bg-[#0F1017] p-4 transition-all">
          <div
            onClick={() => toggleSection("principal")}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <UserRound className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#E2D9FF]">1. Principal</span>
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20">
                {categoria} · {quantidade}
              </span>
            </div>
            {openSections.principal ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </div>

          {openSections.principal && (
            <div className="mt-4 flex flex-col gap-4 pt-3 border-t border-white/5">
              {/* Categoria* */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Categoria*</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Pessoa", "Produto", "Livre"] as const).map((cat) => {
                    const active = categoria === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoria(cat)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fotos do Sujeito / Produto */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Fotos do Sujeito / Produto</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {fotosList.map((photo, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-xl border border-white/10 overflow-hidden group">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveSujeito(idx)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label
                    onClick={() => fileInputSujeitoRef.current?.click()}
                    className="h-16 flex-1 min-w-[120px] rounded-xl border border-dashed border-white/15 hover:border-purple-500/50 bg-[#12141A] hover:bg-purple-950/20 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-zinc-400 hover:text-white p-2"
                  >
                    <Plus size={18} />
                    <span className="text-[10px] text-center leading-tight">Clique, arraste ou cole (Ctrl+V)</span>
                  </label>
                  <input
                    ref={fileInputSujeitoRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadSujeito}
                    className="hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhotoAdjustModal(true)}
                  className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A152B] border border-purple-500/30 text-purple-200 text-[11px] font-semibold hover:bg-purple-900/40 transition-colors cursor-pointer"
                >
                  <Sliders size={13} />
                  <span>Ajustar fotos e cena</span>
                </button>
                <p className="text-[11px] font-medium text-[#EAB308] mt-2">
                  Para máxima fidelidade, use uma única foto
                </p>
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Quantidade</label>
                <div className="grid grid-cols-5 gap-2">
                  {["1", "2", "3", "4", "5"].map((num) => {
                    const active = quantidade === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantidade(num)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Como o sujeito deve aparecer? */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Como o sujeito deve aparecer?</label>
                <div className="rounded-xl border border-white/10 bg-[#10121A] p-2.5">
                  <textarea
                    rows={3}
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="Descreva roupas, pose, acessorios, acao..."
                    className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Posição do Sujeito */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Posição do Sujeito</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "left", label: "Esquerda", Icon: AlignLeft },
                    { id: "center", label: "Centro", Icon: AlignCenter },
                    { id: "right", label: "Direita", Icon: AlignRight }
                  ].map((pos) => {
                    const active = subjectPosition === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setSubjectPosition(pos.id as any)}
                        className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <pos.Icon size={16} />
                        <span className="text-[11px] font-semibold">{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plano (Grade 2x2 com 4 Opções) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Plano</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "close-up", label: "Close-up (Rosto)", Icon: UserRound },
                    { id: "medium", label: "Plano Médio (Busto)", Icon: UserRound },
                    { id: "american", label: "Plano Americano", Icon: ImageIcon },
                    { id: "full_body", label: "Corpo Inteiro", Icon: UserRound }
                  ].map((p) => {
                    const active = plano === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlano(p.id)}
                        className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <p.Icon size={16} />
                        <span className="text-[11px] font-semibold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 2. MARCA E ESTILO ── */}
        <div className="rounded-2xl border border-white/5 bg-[#0F1017] p-4 transition-all">
          <div
            onClick={() => toggleSection("marca_estilo")}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <Palette className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#E2D9FF]">2. Marca e estilo</span>
            </div>
            {openSections.marca_estilo ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </div>

          {openSections.marca_estilo && (
            <div className="mt-4 flex flex-col gap-4 pt-3 border-t border-white/5">
              {/* Cores da marca */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Cores da marca</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#12141A] p-2.5 rounded-xl flex flex-col items-center gap-1.5 border border-white/5">
                    <input
                      type="color"
                      value={corAmbiente}
                      onChange={(e) => setCorAmbiente(e.target.value)}
                      className="w-7 h-7 rounded-full border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] text-zinc-400 text-center font-medium">Ambiente</span>
                  </div>
                  <div className="bg-[#12141A] p-2.5 rounded-xl flex flex-col items-center gap-1.5 border border-white/5">
                    <input
                      type="color"
                      value={luzComplementar}
                      onChange={(e) => setLuzComplementar(e.target.value)}
                      className="w-7 h-7 rounded-full border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] text-zinc-400 text-center font-medium">Luz</span>
                  </div>
                  <div className="bg-[#12141A] p-2.5 rounded-xl flex flex-col items-center gap-1.5 border border-white/5">
                    <input
                      type="color"
                      value={corDestaque}
                      onChange={(e) => setCorDestaque(e.target.value)}
                      className="w-7 h-7 rounded-full border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] text-zinc-400 text-center font-medium">Complementar</span>
                  </div>
                </div>
              </div>

              {/* Estilos Visuais (17 Estilos em Grid) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Estilos Visuais</label>
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-1">
                  {ESTILOS_VISUAIS.map((est) => {
                    const active = estiloVisual === est.value;
                    return (
                      <button
                        key={est.value}
                        type="button"
                        onClick={() => setEstiloVisual(est.value)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <est.Icon size={16} className={active ? "text-purple-300" : "text-zinc-400"} />
                        <span className="text-[10px] font-semibold text-center leading-tight">{est.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inspirações de estilo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Inspirações de estilo</label>
                <div className="flex gap-2 mb-2">
                  <input
                    ref={fileInputEstiloRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach(async (file) => {
                        const b64 = await compressImageForStorage(file, 1600, 0.82);
                        if (b64) {
                          setEstiloImages((prev) => [...prev, { id: String(Date.now()), url: b64, desc: "" }]);
                        }
                      });
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputEstiloRef.current?.click()}
                    className="px-3 py-2 rounded-xl border border-dashed border-white/15 hover:border-purple-500/50 bg-[#12141A] text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    <span>Upload Estilo</span>
                  </button>
                  <input
                    type="text"
                    value={styleRefDescription}
                    onChange={(e) => setStyleRefDescription(e.target.value)}
                    placeholder="Descrição da referência estética..."
                    className="flex-1 bg-[#10121A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                </div>
                {estiloImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {estiloImages.map((img, idx) => (
                      <div key={idx} className="relative h-14 w-14 rounded-xl border border-white/10 overflow-hidden">
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEstiloImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/80 text-red-400 flex items-center justify-center cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slider Sobriedade x Criatividade */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Sobriedade x Criatividade</label>
                  <span className="text-xs font-mono text-purple-400">{sobriedadeCriatividade}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sobriedadeCriatividade}
                  onChange={(e) => setSobriedadeCriatividade(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Sóbrio</span>
                  <span>Criativo</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. CENÁRIO ── */}
        <div className="rounded-2xl border border-white/5 bg-[#0F1017] p-4 transition-all">
          <div
            onClick={() => toggleSection("cenario")}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <Mountain className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#E2D9FF]">3. Cenário</span>
            </div>
            {openSections.cenario ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </div>

          {openSections.cenario && (
            <div className="mt-4 flex flex-col gap-4 pt-3 border-t border-white/5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nicho/Projeto</label>
                <input
                  type="text"
                  value={nichoProjeto}
                  onChange={(e) => setNichoProjeto(e.target.value)}
                  placeholder="ex: Odontologia estética, lançamento tech..."
                  className="w-full bg-[#10121A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Descrição do cenário</label>
                <div className="rounded-xl border border-white/10 bg-[#10121A] p-2.5">
                  <textarea
                    rows={3}
                    value={sceneDescription}
                    onChange={(e) => setSceneDescription(e.target.value)}
                    placeholder="Descreva o fundo, ambiente, iluminação ambiente, objetos..."
                    className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Inspirações de ambiente</label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputAmbienteRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach(async (file) => {
                        const b64 = await compressImageForStorage(file, 1600, 0.82);
                        if (b64) {
                          setAmbienteImages((prev) => [...prev, { id: String(Date.now()), url: b64, desc: "" }]);
                        }
                      });
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputAmbienteRef.current?.click()}
                    className="px-3 py-2 rounded-xl border border-dashed border-white/15 hover:border-purple-500/50 bg-[#12141A] text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    <span>Upload Ambiente</span>
                  </button>
                  <input
                    type="text"
                    value={sceneRefDescription}
                    onChange={(e) => setSceneRefDescription(e.target.value)}
                    placeholder="Descrição da referência do cenário..."
                    className="flex-1 bg-[#10121A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                </div>
                {ambienteImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ambienteImages.map((img, idx) => (
                      <div key={idx} className="relative h-14 w-14 rounded-xl border border-white/10 overflow-hidden">
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAmbienteImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/80 text-red-400 flex items-center justify-center cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 4. TEXTO NA IMAGEM [EXPERIMENTAL] ── */}
        <div className="rounded-2xl border border-white/5 bg-[#0F1017] p-4 transition-all">
          <div
            onClick={() => toggleSection("texto_imagem")}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <Type className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#E2D9FF]">4. Texto na imagem</span>
              <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                EXPERIMENTAL
              </span>
            </div>
            {openSections.texto_imagem ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </div>

          {openSections.texto_imagem && (
            <div className="mt-4 flex flex-col gap-4 pt-3 border-t border-white/5">
              {/* Dynamic text blocks */}
              <div className="space-y-3">
                {textBlocks.map((block) => (
                  <div key={block.id} className="p-3 rounded-xl bg-[#12141A] border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <select
                        value={block.type}
                        onChange={(e) => handleUpdateTextBlock(block.id, { type: e.target.value as any })}
                        className="bg-black/50 border border-white/10 rounded-lg text-purple-300 text-xs px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value="H1">Título (H1)</option>
                        <option value="H2">Subtítulo (H2)</option>
                        <option value="Texto">Texto</option>
                        <option value="Bullets">Lista (Bullets)</option>
                        <option value="CTA">Botão (CTA)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveTextBlock(block.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={block.text}
                      onChange={(e) => handleUpdateTextBlock(block.id, { text: e.target.value })}
                      placeholder="Digite o texto da arte..."
                      className="w-full bg-transparent border-b border-white/10 text-xs text-white pb-1 outline-none placeholder-zinc-500"
                    />

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                      <span>Peso: {block.weight === 1 ? "Sutil" : block.weight === 5 ? "Dominante" : "Normal"}</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={block.weight}
                        onChange={(e) => handleUpdateTextBlock(block.id, { weight: Number(e.target.value) })}
                        className="w-24 accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTextBlock}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-purple-950/30 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Adicionar texto</span>
                </button>
              </div>

              {/* Posição do texto */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Posição do texto</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "left", label: "Esquerda", Icon: AlignLeft },
                    { id: "center", label: "Centro", Icon: AlignCenter },
                    { id: "right", label: "Direita", Icon: AlignRight }
                  ].map((pos) => {
                    const active = posicaoTexto === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setPosicaoTexto(pos.id as any)}
                        className={`h-10 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <pos.Icon size={14} />
                        <span className="text-xs font-semibold">{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Degradê de leitura */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12141A] border border-white/5">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Degradê de leitura</span>
                  <span className="block text-[10px] text-zinc-500">Melhora o contraste sob o texto</span>
                </div>
                <input
                  type="checkbox"
                  checked={degradeTexto}
                  onChange={(e) => setDegradeTexto(e.target.checked)}
                  className="h-4 w-4 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 5. AJUSTES ── */}
        <div className="rounded-2xl border border-white/5 bg-[#0F1017] p-4 transition-all">
          <div
            onClick={() => toggleSection("ajustes")}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <Settings className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#E2D9FF]">5. Ajustes</span>
            </div>
            {openSections.ajustes ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </div>

          {openSections.ajustes && (
            <div className="mt-4 flex flex-col gap-4 pt-3 border-t border-white/5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Elementos Flutuantes</label>
                <input
                  type="text"
                  value={elementosFlutuantes}
                  onChange={(e) => setElementosFlutuantes(e.target.value)}
                  placeholder="Ex: Notas de dólar, moedas... (vazio = IA decide)"
                  className="w-full bg-[#10121A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12141A] border border-white/5">
                <div>
                  <span className="block text-xs font-semibold text-zinc-200">Desfocar fundo (Blur)</span>
                  <span className="block text-[10px] text-zinc-500">Desfoque óptico de profundidade de campo</span>
                </div>
                <input
                  type="checkbox"
                  checked={usarBlur}
                  onChange={(e) => setUsarBlur(e.target.checked)}
                  className="h-4 w-4 accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Prompt Adicional</label>
                <div className="rounded-xl border border-white/10 bg-[#10121A] p-2.5">
                  <textarea
                    rows={3}
                    value={promptAdicional}
                    onChange={(e) => setPromptAdicional(e.target.value)}
                    placeholder="Instruções extras de direção de arte, renderização, câmera..."
                    className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 6. CONFIGURAÇÕES (DIMENSÕES E QUALIDADE) ── */}
        <div className="rounded-2xl border border-white/5 bg-[#0F1017] p-4 transition-all">
          <div
            onClick={() => toggleSection("configuracoes")}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-[#E2D9FF]">6. Configurações</span>
            </div>
            {openSections.configuracoes ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </div>

          {openSections.configuracoes && (
            <div className="mt-4 flex flex-col gap-4 pt-3 border-t border-white/5">
              {/* Dimensões */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Dimensões</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "16:9", label: "16:9", sub: "Banner" },
                    { id: "4:5", label: "4:5", sub: "Feed" },
                    { id: "1:1", label: "1:1", sub: "Square" },
                    { id: "9:16", label: "9:16", sub: "Story" }
                  ].map((dim) => {
                    const active = dimensao === dim.id;
                    return (
                      <button
                        key={dim.id}
                        type="button"
                        onClick={() => setDimensao(dim.id)}
                        className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xs font-bold">{dim.label}</span>
                        <span className="text-[9px] text-zinc-500">{dim.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qualidade */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Qualidade</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1K", label: "1K", sub: "Rápido" },
                    { id: "2K", label: "2K", sub: "Equilibrado" },
                    { id: "4K", label: "4K", sub: "Ultra" }
                  ].map((q) => {
                    const active = quality === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setQuality(q.id as any)}
                        className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          active
                            ? "bg-[#261742] border-2 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-[#12141A] border border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xs font-bold">{q.label}</span>
                        <span className="text-[9px] text-zinc-500">{q.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. RODAPÉ FIXO NO FUNDO (STICKY BOTTOM): CONSTRUIR (1 CRÉDITO)     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="shrink-0 sticky bottom-0 z-30 bg-[#0C0D11]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.7)]">
        <button
          type="button"
          onClick={handleConstruirClick}
          disabled={isGenerating}
          className="flex w-full items-center justify-between font-extrabold rounded-2xl px-5 h-[52px] text-[15px] transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-[0_4px_20px_rgba(234,179,8,0.25)] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: "#EAB308",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          <div className="w-5" />
          <span className="flex items-center gap-2 font-black text-white text-base">
            {isGenerating ? "Construindo..." : "Construir"}
          </span>
          <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-bold text-white">
            1 crédito
          </span>
        </button>

        <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-[#9d94bb]">
          <button
            type="button"
            onClick={() => {
              store.createProject();
              showToast?.("Configurações duplicadas em uma nova aba!", "success");
            }}
            title="Duplicar configurações para uma nova aba"
            className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
          >
            <Copy className="h-3 w-3" />
            <span>Duplicar</span>
          </button>
          <span aria-hidden="true" className="text-white/15">·</span>
          <button
            type="button"
            onClick={() => {
              store.resetConfig();
              showToast?.("Formulário resetado com sucesso!", "info");
            }}
            title="Resetar todas as configurações do formulário"
            className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Resetar</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL AJUSTAR FOTOS E CENA                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showPhotoAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Sliders className="h-5 w-5" />
                <h3 className="text-base font-semibold text-white">Ajustar Fotos e Cena</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoAdjustModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gerencie as fotos enviadas para o Órion Pro para garantir máxima fidelidade na criação.
            </p>
            <div className="grid grid-cols-4 gap-2.5 py-2">
              {fotosList.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl border border-white/10 overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveSujeito(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => fileInputSujeitoRef.current?.click()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 cursor-pointer transition-colors"
              >
                + Adicionar foto
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoAdjustModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EAB308] text-black hover:opacity-95 cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
