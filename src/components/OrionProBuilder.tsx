import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { compressImageForStorage } from "../utils/imageCompressor";
import {
  Image as ImageIcon,
  UserRound,
  Package,
  Camera,
  Layers,
  Sparkles,
  Flame,
  Crown,
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
  ChevronDown,
  X,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Info
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
  weight: number;
  color: string;
  position: string;
}

interface ImageWithDesc {
  id: string;
  url: string;
  desc: string;
}

// Estilos Visuais canônicos do Órion Pro idênticos ao site oficial
const ESTILOS_VISUAIS = [
  { value: "publicitario", label: "Publicitário", Icon: Camera },
  { value: "flyer_sertanejo", label: "Flyer Sertanejo", Icon: Flame },
  { value: "flyer_funk", label: "Flyer Funk", Icon: Zap },
  { value: "delivery", label: "Delivery", Icon: Package },
  { value: "brand_premium", label: "Brand Premium", Icon: Crown },
  { value: "ultra_realistic", label: "Ultra Realista", Icon: Camera },
  { value: "glow", label: "Glow Radiante", Icon: Sparkles },
  { value: "pro_portrait", label: "Retrato Profissional", Icon: Layers },
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

const FieldInfo: React.FC<{ tooltip?: string }> = ({ tooltip }) => (
  <span className="relative inline-flex items-center">
    <button
      type="button"
      data-field-info=""
      aria-label="Mais informações"
      title={tooltip || "Informações do campo"}
      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
      style={{ color: "rgb(255, 213, 0)" }}
    >
      <Info className="h-3.5 w-3.5" />
    </button>
  </span>
);

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
  const [sobriedadeCriatividade, setSobriedadeCriatividade] = useState<number>(50);

  // ── Section 3: Cenário
  const [nichoProjeto, setNichoProjeto] = useState<string>("");
  const [sceneDescription, setSceneDescription] = useState<string>("");
  const [ambienteImages, setAmbienteImages] = useState<ImageWithDesc[]>([]);

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

  // Sync to store in background without subscribing to store changes
  const syncToStore = useCallback(() => {
    const calculatedTypoPos = posicaoTexto === "left" ? "Esquerda" : posicaoTexto === "right" ? "Direita" : "Centro";
    const effectiveSubjectPos = subjectPosition === "left" ? "Esquerda" : subjectPosition === "right" ? "Direita" : "Centro";

    useProjectStore.getState().updateConfig({
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
    sobriedadeCriatividade
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

  const handleUploadEstilo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImageForStorage(file);
        setEstiloImages((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 9), url: compressed, desc: "" }
        ]);
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = "";
  };

  const handleUploadAmbiente = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImageForStorage(file);
        setAmbienteImages((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(2, 9), url: compressed, desc: "" }
        ]);
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = "";
  };

  // Text Blocks Management
  const addTextBlock = () => {
    if (textBlocks.length >= 8) {
      showToast("Limite de 8 blocos de texto atingido.", "warning");
      return;
    }
    setTextBlocks((prev) => [
      ...prev,
      { id: String(Date.now()), type: "H2", text: "", weight: 3, color: "#FFFFFF", position: "middle-center" }
    ]);
  };

  const removeTextBlock = (id: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlockItem>) => {
    setTextBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const handleConstruirClick = () => {
    syncToStore();
    onCloseMobileCategory?.();
    generatePremiumImage?.();
  };

  const fotosList = store.sujeitosBase64List || [];

  return (
    <aside
      data-aside-form-col=""
      data-tour="form"
      onPaste={handlePaste}
      tabIndex={0}
      className="agent-form-col relative z-10 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full lg:h-full lg:w-[var(--agent-form-col-w,420px)] lg:min-w-[280px] lg:max-w-[700px] lg:flex-shrink-0 flex max-lg:order-last max-lg:min-h-0 select-none font-sans outline-none"
      style={{ "--agent-form-col-w": "420px", "--agent-color": "#ffd500" } as any}
    >
      <form className="flex flex-col gap-4 lg:gap-5 pb-6" onSubmit={(e) => e.preventDefault()}>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. PRINCIPAL                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div data-tour="form-sec-principal">
          <div className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]">
            <button
              type="button"
              onClick={() => toggleSection("principal")}
              aria-expanded={openSections.principal}
              className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                <ImageIcon className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Principal</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${
                  openSections.principal ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.principal && (
              <div className="px-2 pb-3 lg:px-4 lg:pb-4 pt-1 flex flex-col gap-4 animate-in fade-in duration-150">
                
                {/* Categoria* */}
                <div data-field-id="categoria" className="flex flex-col gap-2">
                  <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Categoria</span>
                    <span className="ml-1 text-red-400">*</span>
                    <FieldInfo tooltip="Escolha o tipo principal da sua composição" />
                  </label>
                  <div role="group" aria-label="Categoria" className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "Pessoa", label: "Pessoa", Icon: UserRound },
                      { id: "Produto", label: "Produto", Icon: Package },
                      { id: "Livre", label: "Livre", Icon: Sparkles }
                    ].map((cat) => {
                      const active = categoria === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoria(cat.id as any)}
                          className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <cat.Icon className="h-5 w-5" />
                          <span className="font-medium text-sm">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fotos do Sujeito / Produto */}
                <div data-field-id="fotos" className="flex flex-col gap-2">
                  <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Fotos do Sujeito / Produto</span>
                    <FieldInfo tooltip="Envie foto do sujeito ou produto para preservar identidade" />
                  </label>
                  
                  {fotosList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {fotosList.map((photo, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-xl border border-white/10 overflow-hidden group">
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
                      <div
                        onClick={() => fileInputSujeitoRef.current?.click()}
                        className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-20 w-20 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)] text-[#5c5278] hover:text-[#9d94bb]"
                      >
                        <span className="text-2xl font-light">+</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputSujeitoRef.current?.click()}
                      className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                    >
                      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                        <span className="font-light text-[#5c5278] text-4xl">+</span>
                        <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputSujeitoRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    multiple
                    onChange={handleUploadSujeito}
                    className="hidden"
                  />
                  <p className="text-xs text-amber-400/80 pl-0.5">Para máxima fidelidade, use uma única foto</p>
                </div>

                {/* Quantidade */}
                <div data-field-id="quantidade" className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Quantidade</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["1", "2", "3", "4", "5"].map((num) => {
                      const active = quantidade === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQuantidade(num)}
                          className={`flex h-11 items-center justify-center text-center transition-colors pb-ctrl-btn rounded-xl text-sm font-semibold cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Como o sujeito deve aparecer? */}
                <div data-field-id="como_aparecer" className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Como o sujeito deve aparecer?</span>
                    <FieldInfo tooltip="Descreva roupas, pose, acessórios ou ações desejadas" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-purple-500/40">
                    <textarea
                      rows={3}
                      value={subjectDescription}
                      onChange={(e) => setSubjectDescription(e.target.value)}
                      placeholder="Descreva roupas, pose, acessorios, acao..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Posição do Sujeito */}
                <div data-field-id="posicao" className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Posição do Sujeito</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
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
                          className={`flex h-16 flex-col items-center justify-center gap-1.5 text-center transition-colors pb-ctrl-btn rounded-xl p-2 cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <pos.Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{pos.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Plano */}
                <div data-field-id="plano" className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Plano</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
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
                          className={`flex h-16 flex-col items-center justify-center gap-1.5 text-center transition-colors pb-ctrl-btn rounded-xl p-2 cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <p.Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{p.label}</span>
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
        {/* 2. MARCA E ESTILO                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div data-tour="form-sec-marca_estilo">
          <div className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]">
            <button
              type="button"
              onClick={() => toggleSection("marca_estilo")}
              aria-expanded={openSections.marca_estilo}
              className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                <Palette className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Marca e estilo</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${
                  openSections.marca_estilo ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.marca_estilo && (
              <div className="px-2 pb-3 lg:px-4 lg:pb-4 pt-1 flex flex-col gap-4 animate-in fade-in duration-150">
                
                {/* Cores da Marca */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Identidade da Marca</span>
                    <FieldInfo tooltip="Cores principais aplicadas no ambiente e na iluminação" />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-[#9d94bb]">Ambiente</span>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
                        <input
                          type="color"
                          value={corAmbiente}
                          onChange={(e) => setCorAmbiente(e.target.value)}
                          className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase">{corAmbiente}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-[#9d94bb]">Luz Comp.</span>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
                        <input
                          type="color"
                          value={luzComplementar}
                          onChange={(e) => setLuzComplementar(e.target.value)}
                          className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase">{luzComplementar}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-[#9d94bb]">Destaque</span>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
                        <input
                          type="color"
                          value={corDestaque}
                          onChange={(e) => setCorDestaque(e.target.value)}
                          className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase">{corDestaque}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estilo Visual */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Estilo Visual</span>
                    <FieldInfo tooltip="Escolha o tom artístico que define toda a cena" />
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {ESTILOS_VISUAIS.map((est) => {
                      const active = estiloVisual === est.value;
                      return (
                        <button
                          key={est.value}
                          type="button"
                          onClick={() => setEstiloVisual(est.value)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-colors pb-ctrl-btn cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <est.Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                          <span className="text-xs font-medium truncate">{est.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Referências de Estilo */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Referências de Estilo</span>
                    <FieldInfo tooltip="Fotos de iluminação, cores ou referências que a IA deve seguir" />
                  </label>
                  <div
                    onClick={() => fileInputEstiloRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] py-3 px-4 transition-colors"
                  >
                    <span className="text-xs text-[#5c5278] hover:text-[#9d94bb] flex items-center gap-2">
                      <span className="text-base leading-none">+</span>
                      Clique, arraste ou cole referências (Ctrl+V)
                    </span>
                  </div>
                  <input
                    ref={fileInputEstiloRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadEstilo}
                    className="hidden"
                  />
                  {estiloImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {estiloImages.map((img, i) => (
                        <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/10 group">
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEstiloImages(estiloImages.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-400 hover:text-white"
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
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. CENÁRIO                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div data-tour="form-sec-cenario">
          <div className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]">
            <button
              type="button"
              onClick={() => toggleSection("cenario")}
              aria-expanded={openSections.cenario}
              className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                <Mountain className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Cenário</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${
                  openSections.cenario ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.cenario && (
              <div className="px-2 pb-3 lg:px-4 lg:pb-4 pt-1 flex flex-col gap-4 animate-in fade-in duration-150">
                
                {/* Nicho */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>O que você está criando? Para qual nicho?</span>
                    <span className="ml-1 text-red-400">*</span>
                    <FieldInfo tooltip="Ex: Hambúrguer artesanal, anúncio de dentista, evento sertanejo" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-purple-500/40">
                    <input
                      type="text"
                      value={nichoProjeto}
                      onChange={(e) => setNichoProjeto(e.target.value)}
                      placeholder="Ex: Consultório odontológico de luxo, Hamburgueria gourmet..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none"
                    />
                  </div>
                </div>

                {/* Descrição do Cenário */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Descrição da Cena / Ambiente</span>
                    <FieldInfo tooltip="Detalhes do fundo, iluminação, elementos ao redor do sujeito" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-purple-500/40">
                    <textarea
                      rows={3}
                      value={sceneDescription}
                      onChange={(e) => setSceneDescription(e.target.value)}
                      placeholder="Descreva o cenário, iluminação volumétrica, partículas..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Imagens de Cenário / Referência */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Imagens de Cenário</span>
                    <FieldInfo tooltip="Imagens de fundo ou ambiente para inspiração direta" />
                  </label>
                  <div
                    onClick={() => fileInputAmbienteRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] py-3 px-4 transition-colors"
                  >
                    <span className="text-xs text-[#5c5278] hover:text-[#9d94bb] flex items-center gap-2">
                      <span className="text-base leading-none">+</span>
                      Clique ou arraste imagens de ambiente
                    </span>
                  </div>
                  <input
                    ref={fileInputAmbienteRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadAmbiente}
                    className="hidden"
                  />
                  {ambienteImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ambienteImages.map((img, i) => (
                        <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/10 group">
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAmbienteImages(ambienteImages.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-400 hover:text-white"
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
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. TEXTO NA IMAGEM [EXPERIMENTAL]                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div data-tour="form-sec-texto_imagem">
          <div className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]">
            <button
              type="button"
              onClick={() => toggleSection("texto_imagem")}
              aria-expanded={openSections.texto_imagem}
              className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                <Type className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Texto na imagem</span>
              </span>
              <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                experimental
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${
                  openSections.texto_imagem ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.texto_imagem && (
              <div className="px-2 pb-3 lg:px-4 lg:pb-4 pt-1 flex flex-col gap-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>Textos da Imagem</span>
                    <FieldInfo tooltip="Defina as palavras exatas para a IA renderizar com tipografia fidedigna" />
                  </label>
                  <button
                    type="button"
                    onClick={addTextBlock}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Adicionar Texto</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {textBlocks.map((block, idx) => (
                    <div key={block.id} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#9d94bb]">Bloco #{idx + 1} ({block.type})</span>
                        {textBlocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTextBlock(block.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={block.text}
                        onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                        placeholder="Digite o texto exato..."
                        className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs text-white placeholder-[#5c5278] outline-none focus:border-purple-500/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. AJUSTES                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div data-tour="form-sec-ajustes">
          <div className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]">
            <button
              type="button"
              onClick={() => toggleSection("ajustes")}
              aria-expanded={openSections.ajustes}
              className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                <SlidersHorizontal className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Ajustes</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${
                  openSections.ajustes ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.ajustes && (
              <div className="px-2 pb-3 lg:px-4 lg:pb-4 pt-1 flex flex-col gap-4 animate-in fade-in duration-150">
                {/* Elementos Flutuantes */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Elementos Flutuantes</span>
                    <FieldInfo tooltip="Partículas, faíscas, confetes, notas de dinheiro, gotas de água, fumaça..." />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-purple-500/40">
                    <textarea
                      rows={2}
                      value={elementosFlutuantes}
                      onChange={(e) => setElementosFlutuantes(e.target.value)}
                      placeholder="Ex: Moedas de ouro voando, faíscas incandescentes, névoa..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Toggles Rápidos */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUsarBlur(!usarBlur)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors pb-ctrl-btn cursor-pointer ${
                      usarBlur ? "pb-ctrl-active text-white" : "text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-medium">Desfoque Fundo</span>
                    <span className={`h-2 w-2 rounded-full ${usarBlur ? "bg-purple-400 shadow-[0_0_8px_#c084fc]" : "bg-zinc-600"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDegradeTexto(!degradeTexto)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors pb-ctrl-btn cursor-pointer ${
                      degradeTexto ? "pb-ctrl-active text-white" : "text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-medium">Degradê Suave</span>
                    <span className={`h-2 w-2 rounded-full ${degradeTexto ? "bg-purple-400 shadow-[0_0_8px_#c084fc]" : "bg-zinc-600"}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 6. CONFIGURAÇÕES (DIMENSÕES E QUALIDADE)                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div data-tour="form-sec-configuracoes">
          <div className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]">
            <button
              type="button"
              onClick={() => toggleSection("configuracoes")}
              aria-expanded={openSections.configuracoes}
              className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
                <Settings className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="truncate text-left text-base font-normal text-[#e2d9ff]">Configurações</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${
                  openSections.configuracoes ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.configuracoes && (
              <div className="px-2 pb-3 lg:px-4 lg:pb-4 pt-1 flex flex-col gap-4 animate-in fade-in duration-150">
                {/* Formato / Dimensão */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Dimensão da Arte</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "1:1", label: "1:1 Feed" },
                      { id: "9:16", label: "9:16 Story" },
                      { id: "16:9", label: "16:9 Banner" },
                      { id: "4:5", label: "4:5 Retrato" }
                    ].map((d) => {
                      const active = dimensao === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDimensao(d.id)}
                          className={`flex h-11 flex-col items-center justify-center text-center transition-colors pb-ctrl-btn rounded-xl p-1 cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <span className="text-xs font-semibold">{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Qualidade */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Qualidade de Renderização</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["1K", "2K", "4K"] as const).map((q) => {
                      const active = quality === q;
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuality(q)}
                          className={`flex h-11 items-center justify-center text-center transition-colors pb-ctrl-btn rounded-xl text-sm font-semibold cursor-pointer ${
                            active ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Adicional */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Prompt Adicional</span>
                    <FieldInfo tooltip="Comandos técnicos e instruções livres para a engine" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-purple-500/40">
                    <textarea
                      rows={2}
                      value={promptAdicional}
                      onChange={(e) => setPromptAdicional(e.target.value)}
                      placeholder="Instruções adicionais personalizadas..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STICKY BOTTOM: CONSTRUIR (1 CRÉDITO) & DUPLICAR · RESETAR           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="sticky bottom-3 z-30 -mx-1 animate-in fade-in slide-in-from-bottom-2 duration-200 mt-2">
          <div className="rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl backdrop-blur-md">
            <div className="w-full">
              <button
                type="button"
                onClick={handleConstruirClick}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 text-black rounded-xl px-6 py-4 text-base font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
                style={{
                  background: "linear-gradient(to right, rgb(255, 213, 0), rgba(255, 213, 0, 0.8))"
                }}
              >
                <span>{isGenerating ? "Construindo..." : "Construir"}</span>
                <span className="ml-1.5 rounded-lg bg-black/15 px-2 py-0.5 text-xs font-semibold">
                  1 crédito
                </span>
              </button>
            </div>
            <div className="mt-2 px-1 pb-0.5">
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#9d94bb]">
                <button
                  type="button"
                  title="Duplicar configurações para uma nova aba"
                  onClick={() => {
                    store.createProject();
                    showToast?.("Configurações duplicadas em uma nova aba!", "success");
                  }}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplicar</span>
                </button>
                <span className="text-white/20">·</span>
                <button
                  type="button"
                  title="Resetar configurações para o padrão"
                  onClick={() => {
                    store.resetConfig();
                    showToast?.("Configurações resetadas com sucesso!", "info");
                  }}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Resetar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </form>
    </aside>
  );
};
