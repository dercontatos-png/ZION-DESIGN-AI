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
  Info,
  UploadCloud
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
  mobileActiveCategory?: string | null;
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
  showToast = () => { },
  isGenerating = false,
  generatePremiumImage,
  onCloseMobileCategory,
  mobileActiveCategory
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
  const [gender, setGender] = useState<"Masculino" | "Feminino">("Masculino");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [subjectDescription, setSubjectDescription] = useState<string>("");
  const [subjectPosition, setSubjectPosition] = useState<"left" | "center" | "right">("center");
  const [plano, setPlano] = useState<string>("medium");

  // ── Section 2: Marca e estilo
  const [corAmbiente, setCorAmbiente] = useState<string>("#1A1A2E");
  const [luzComplementar, setLuzComplementar] = useState<string>("#E2E2E2");
  const [corDestaque, setCorDestaque] = useState<string>("#7C3AED");
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [useLogo, setUseLogo] = useState<boolean>(false);
  const [logoPosition, setLogoPosition] = useState<string>("top_center");
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
  const [quality, setQuality] = useState<"1K" | "2K" | "4K">("4K");

  // File Input Refs
  const fileInputSujeitoRef = useRef<HTMLInputElement>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputEstiloRef = useRef<HTMLInputElement>(null);
  const fileInputAmbienteRef = useRef<HTMLInputElement>(null);

  // Submit button intersection observer para botão flutuante inteligente
  const staticSubmitRef = useRef<HTMLDivElement>(null);
  const [isSubmitIntersecting, setIsSubmitIntersecting] = useState(false);

  useEffect(() => {
    const el = staticSubmitRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSubmitIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Ouvir saltos de categoria mobile para abrir o accordion e rolar
  useEffect(() => {
    const handleCategoryJump = (e: any) => {
      const cat = e?.detail?.category;
      if (!cat) return;
      const targetSec =
        cat === "principal" || cat === "sujeito" ? "principal" :
        cat === "marca" || cat === "marca_estilo" || cat === "cores" ? "marca_estilo" :
        cat === "cenario" || cat === "contexto" ? "cenario" :
        cat === "texto" || cat === "texto_imagem" ? "texto_imagem" :
        cat === "ajustes" || cat === "composicao" ? "ajustes" :
        cat === "configuracoes" || cat === "config" || cat === "prompt" ? "configuracoes" : null;

      if (targetSec) {
        setOpenSections((prev) => ({ ...prev, [targetSec]: true }));
        setTimeout(() => {
          const el = document.getElementById(`section-${targetSec}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 80);
      }
    };

    window.addEventListener("agent:category_jump", handleCategoryJump);
    return () => window.removeEventListener("agent:category_jump", handleCategoryJump);
  }, []);

  // ── Se mobileActiveCategory for passada como prop, abre e rola também
  useEffect(() => {
    if (!mobileActiveCategory) return;
    const cat = mobileActiveCategory;
    const targetSec =
      cat === "principal" || cat === "sujeito" ? "principal" :
      cat === "marca" || cat === "marca_estilo" || cat === "cores" ? "marca_estilo" :
      cat === "cenario" || cat === "contexto" ? "cenario" :
      cat === "texto" || cat === "texto_imagem" ? "texto_imagem" :
      cat === "ajustes" || cat === "composicao" ? "ajustes" :
      cat === "configuracoes" || cat === "config" || cat === "prompt" ? "configuracoes" : null;

    if (targetSec) {
      setOpenSections((prev) => ({ ...prev, [targetSec]: true }));
      setTimeout(() => {
        const el = document.getElementById(`section-${targetSec}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  }, [mobileActiveCategory]);

  // ── Sincronizar estado inicial vindo do Store (quando troca projeto ou monta)
  useEffect(() => {
    if (!store.activeProjectId) return;
    if (store.dimensao) setDimensao(store.dimensao);
    if (store.qualidade || store.resolucao) {
      const q = String(store.qualidade || store.resolucao || "4K").toUpperCase();
      setQuality(q.includes("1K") ? "1K" : q.includes("2K") ? "2K" : "4K");
    }
    if ((store as any).categoria) setCategoria((store as any).categoria);
    if (store.gender) {
      setGender(store.gender.toLowerCase().includes("fem") ? "Feminino" : "Masculino");
    }
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
    if (store.logoBase64) {
      setLogoBase64(store.logoBase64);
      setUseLogo(store.useLogo !== undefined ? Boolean(store.useLogo) : true);
    }
    if (store.logoPosOverlay) {
      setLogoPosition(store.logoPosOverlay);
    }
    if (store.estiloVisual) setEstiloVisual(store.estiloVisual);
    if (store.nicho) setNichoProjeto(store.nicho);
    if (store.promptCenario || store.cenario) setSceneDescription(store.promptCenario || store.cenario || "");
    if (store.additionalPrompt) setPromptAdicional(store.additionalPrompt);
    if (store.floatingElementsCustom) setElementosFlutuantes(store.floatingElementsCustom);
    if (store.enableBlur !== undefined) setUsarBlur(Boolean(store.enableBlur));
    if (store.degradeLeitura !== undefined) setDegradeTexto(Boolean(store.degradeLeitura));
    if (store.nivelCriativo !== undefined) setSobriedadeCriatividade(Number(store.nivelCriativo));

    // Carregar referências de ambiente salvas
    if (Array.isArray(store.cenariosBase64List) && store.cenariosBase64List.length > 0) {
      setAmbienteImages(
        store.cenariosBase64List.map((url, i) => ({
          id: `amb_${i}_${Date.now()}`,
          url: typeof url === "string" ? url : (url as any)?.url || "",
          desc: ""
        }))
      );
    }

    // Carregar referências de estilo salvas
    if (Array.isArray(store.referenciasEstilo) && store.referenciasEstilo.length > 0) {
      setEstiloImages(
        store.referenciasEstilo.map((r: any, i: number) => ({
          id: r.id || `est_${i}_${Date.now()}`,
          url: r.url || r.data || (typeof r === "string" ? r : ""),
          desc: r.descricao || ""
        }))
      );
    }

    // Carregar blocos de texto
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

    if (store.typographyPosition) {
      const tp = store.typographyPosition.toLowerCase();
      if (tp.includes("esq") || tp.includes("left")) setPosicaoTexto("left");
      else if (tp.includes("dir") || tp.includes("right")) setPosicaoTexto("right");
      else setPosicaoTexto("center");
    }
  }, [store.activeProjectId, store.lastLoadedAt]);

  // ── Sincronizador contínuo e imediato com useProjectStore
  const syncToStore = useCallback(() => {
    const calculatedTypoPos = posicaoTexto === "left" ? "Esquerda" : posicaoTexto === "right" ? "Direita" : "Centro";
    const effectiveSubjectPos = subjectPosition === "left" ? "Esquerda" : subjectPosition === "right" ? "Direita" : "Centro";

    useProjectStore.getState().updateConfig({
      qualidade: quality,
      resolucao: quality,
      dimensao: dimensao,
      categoria: categoria,
      gender: gender,
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
      logoBase64: logoBase64,
      logosList: logoBase64 ? [logoBase64] : [],
      useLogo: Boolean(useLogo && logoBase64),
      logoPosOverlay: logoPosition,
      estiloVisual: estiloVisual,
      estilosVisuais: [estiloVisual],
      nicho: nichoProjeto,
      cenario: sceneDescription,
      promptCenario: sceneDescription,
      cenariosBase64List: ambienteImages.map((img) => img.url).filter(Boolean),
      cenarioBase64: ambienteImages.length > 0 ? ambienteImages[0].url : "",
      referenciasEstilo: estiloImages.map((img) => ({
        id: img.id,
        url: img.url,
        data: img.url,
        descricao: img.desc || "estilo"
      })),
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
    gender,
    quantidade,
    subjectDescription,
    subjectPosition,
    plano,
    corAmbiente,
    luzComplementar,
    corDestaque,
    logoBase64,
    useLogo,
    logoPosition,
    estiloVisual,
    nichoProjeto,
    sceneDescription,
    ambienteImages,
    estiloImages,
    textBlocks,
    posicaoTexto,
    degradeTexto,
    elementosFlutuantes,
    usarBlur,
    promptAdicional,
    sobriedadeCriatividade
  ]);

  // Sincroniza sempre que qualquer campo muda
  useEffect(() => {
    syncToStore();
  }, [syncToStore]);

  // ── Handle Upload de Fotos do Sujeito
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
      const updated = [...currentList, b64];
      store.setSujeitoBase64List(updated);

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
            const replaced = current.map((item) => (item === b64 ? data.url : item));
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

  // ── Handle Upload de Logotipo
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const b64 = await compressImageForStorage(file, 1200, 0.9);
    if (!b64) return;
    setLogoBase64(b64);
    setUseLogo(true);
    store.updateConfig({ logoBase64: b64, useLogo: true, logosList: [b64] });
    showToast("Logotipo anexado com sucesso!", "success");
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoBase64("");
    setUseLogo(false);
    store.updateConfig({ logoBase64: "", useLogo: false, logosList: [] });
    showToast("Logotipo removido.", "info");
  };

  // ── Handle Upload de Estilo
  const handleUploadEstilo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImageForStorage(file, 1600, 0.82);
        if (compressed) {
          setEstiloImages((prev) => [
            ...prev,
            { id: `estilo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, url: compressed, desc: file.name || "estilo" }
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = "";
  };

  // ── Handle Upload de Ambiente / Cenário
  const handleUploadAmbiente = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImageForStorage(file, 1600, 0.82);
        if (compressed) {
          setAmbienteImages((prev) => [
            ...prev,
            { id: `amb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, url: compressed, desc: file.name || "cenario" }
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = "";
  };

  // ── Handle Paste (Ctrl+V) inteligente
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
              if (currentList.length < 8) {
                store.setSujeitoBase64List([...currentList, b64]);
                showToast("Imagem colada nas Fotos do Sujeito!", "success");
              } else {
                showToast("Limite de 8 fotos já atingido.", "warning");
              }
            }
          });
        }
      }
    }
  }, [store, showToast]);

  // ── Gestão de Blocos de Texto
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
      className="agent-form-col bg-black relative z-10 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full lg:h-full lg:w-[var(--agent-form-col-w,420px)] lg:min-w-[280px] lg:max-w-[700px] lg:flex-shrink-0 flex max-lg:order-last max-lg:min-h-0 select-none font-sans outline-none"
      style={{ "--agent-form-col-w": "420px", "--agent-color": "#ffd500" } as any}
    >
      <form className="flex flex-col gap-4 lg:gap-5 pb-36 lg:pb-44" onSubmit={(e) => e.preventDefault()}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. PRINCIPAL                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div id="section-principal" data-tour="form-sec-principal">
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
                          onClick={() => {
                            setCategoria(cat.id as any);
                            store.updateConfig({ categoria: cat.id as any });
                          }}
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

                {/* Gênero (Apenas quando Categoria for Pessoa) */}
                {categoria === "Pessoa" && (
                  <div data-field-id="genero" className="flex flex-col gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Gênero</span>
                      <FieldInfo tooltip="Define o gênero do sujeito para fidelidade anatômica perfeita" />
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: "Masculino", label: "Masculino" },
                        { id: "Feminino", label: "Feminino" }
                      ].map((g) => {
                        const active = gender === g.id;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              setGender(g.id as any);
                              store.updateConfig({ gender: g.id as any });
                            }}
                            className={`flex h-11 items-center justify-center text-center transition-colors pb-ctrl-btn rounded-xl text-sm font-semibold cursor-pointer ${
                              active ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            <span>{g.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fotos do Sujeito / Produto */}
                <div data-field-id="fotos" className="flex flex-col gap-2">
                  <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Fotos do Sujeito / Produto</span>
                    <FieldInfo tooltip="Envie foto do sujeito ou produto para preservar identidade facial e de marca" />
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
                            title="Remover foto"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {fotosList.length < 8 && (
                        <div
                          onClick={() => fileInputSujeitoRef.current?.click()}
                          className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-20 w-20 border-[rgba(255,213,0,0.25)] bg-[rgba(255,213,0,0.04)] hover:border-[rgba(255,213,0,0.5)] hover:bg-[rgba(255,213,0,0.08)] text-[#ffd500]"
                          title="Adicionar mais fotos (até 8)"
                        >
                          <span className="text-2xl font-light">+</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputSujeitoRef.current?.click()}
                      className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-36 border-[rgba(255,213,0,0.25)] bg-[rgba(255,213,0,0.03)] hover:border-[rgba(255,213,0,0.5)] hover:bg-[rgba(255,213,0,0.06)]"
                    >
                      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                        <span className="font-light text-[#ffd500] text-3xl">+</span>
                        <span className="truncate text-xs text-zinc-400">Clique, arraste ou cole fotos (Ctrl+V)</span>
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
                  <p className="text-xs text-amber-400/80 pl-0.5">Para máxima fidelidade, use foto nítida e bem iluminada</p>
                </div>

                {/* Quantidade */}
                <div data-field-id="quantidade" className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Quantidade de Sujeitos</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["1", "2", "3", "4", "5"].map((num) => {
                      const active = quantidade === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setQuantidade(num);
                            store.updateConfig({ quantidade: Number(num) as any });
                          }}
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
                    <FieldInfo tooltip="Descreva roupas, pose, acessórios, expressão ou ação desejada" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-yellow-500/40">
                    <textarea
                      rows={3}
                      value={subjectDescription}
                      onChange={(e) => {
                        setSubjectDescription(e.target.value);
                        store.updateConfig({ poseDescription: e.target.value, composicaoCustom: e.target.value });
                      }}
                      placeholder="Descreva roupas, pose, expressão facial, acessórios, gestos..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none leading-relaxed"
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
                          onClick={() => {
                            setSubjectPosition(pos.id as any);
                            const mapped = pos.id === "left" ? "Esquerda" : pos.id === "right" ? "Direita" : "Centro";
                            store.updateConfig({ positioning: mapped });
                          }}
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
                    <span>Plano e Enquadramento</span>
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
                          onClick={() => {
                            setPlano(p.id);
                            store.updateConfig({ composicao: p.id });
                          }}
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
        <div id="section-marca_estilo" data-tour="form-sec-marca_estilo">
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
                    <span>Paleta de Cores da Marca</span>
                    <FieldInfo tooltip="Cores principais aplicadas no ambiente e na iluminação" />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-[#ffd500]/80">Ambiente</span>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
                        <input
                          type="color"
                          value={corAmbiente}
                          onChange={(e) => {
                            setCorAmbiente(e.target.value);
                            store.updateConfig({ cores: { ...store.cores, ambiente: e.target.value } });
                          }}
                          className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase truncate">{corAmbiente}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-[#ffd500]/80">Luz Comp.</span>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
                        <input
                          type="color"
                          value={luzComplementar}
                          onChange={(e) => {
                            setLuzComplementar(e.target.value);
                            store.updateConfig({ cores: { ...store.cores, complementar: e.target.value } });
                          }}
                          className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase truncate">{luzComplementar}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-[#ffd500]/80">Destaque</span>
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
                        <input
                          type="color"
                          value={corDestaque}
                          onChange={(e) => {
                            setCorDestaque(e.target.value);
                            store.updateConfig({ cores: { ...store.cores, recorte: e.target.value, acento: e.target.value } });
                          }}
                          className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono text-zinc-300 uppercase truncate">{corDestaque}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logotipo da Marca (Brand Identity) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Logotipo da Marca</span>
                      <FieldInfo tooltip="Anexe o logotipo oficial para a IA aplicar na composição" />
                    </label>
                    {logoBase64 && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Remover Logo
                      </button>
                    )}
                  </div>

                  {logoBase64 ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="relative h-14 w-14 rounded-lg bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <img src={logoBase64} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">Logotipo Ativo</p>
                        <p className="text-[11px] text-zinc-400">A IA integrará a marca com iluminação realista</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputLogoRef.current?.click()}
                        className="text-xs text-yellow-400 hover:text-yellow-300 underline cursor-pointer shrink-0"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputLogoRef.current?.click()}
                      className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[rgba(255,213,0,0.25)] bg-[rgba(255,213,0,0.02)] hover:border-[rgba(255,213,0,0.45)] py-3 px-4 transition-colors"
                    >
                      <span className="text-xs text-zinc-400 hover:text-yellow-300 flex items-center gap-2">
                        <UploadCloud size={16} className="text-[#ffd500]" />
                        <span>Clique para enviar o Logotipo (PNG / JPEG)</span>
                      </span>
                    </div>
                  )}

                  <input
                    ref={fileInputLogoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
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
                          onClick={() => {
                            setEstiloVisual(est.value);
                            store.updateConfig({ estiloVisual: est.value, estilosVisuais: [est.value] });
                          }}
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
                    <span>Referências de Estilo / Iluminação</span>
                    <FieldInfo tooltip="Fotos de iluminação, cores ou referências que a IA deve replicar" />
                  </label>
                  <div
                    onClick={() => fileInputEstiloRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[rgba(255,213,0,0.25)] bg-[rgba(255,213,0,0.02)] hover:border-[rgba(255,213,0,0.45)] py-3 px-4 transition-colors"
                  >
                    <span className="text-xs text-zinc-400 hover:text-yellow-300 flex items-center gap-2">
                      <span className="text-base leading-none text-[#ffd500]">+</span>
                      Clique ou arraste referências de estilo
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
                        <div key={img.id || i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-white/10 group">
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEstiloImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-0.5 bg-black/80 rounded-full text-red-400 hover:text-white"
                            title="Remover referência"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slider de Sobriedade vs Criatividade */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Nível Criativo da IA</span>
                      <FieldInfo tooltip="Menor valor = Mais comercial e contido. Maior valor = Mais artístico e dramático." />
                    </label>
                    <span className="text-xs font-mono text-yellow-400 font-semibold">{sobriedadeCriatividade}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sobriedadeCriatividade}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSobriedadeCriatividade(val);
                      store.updateConfig({ nivelCriativo: val });
                    }}
                    className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                    <span>Sóbrio / Comercial</span>
                    <span>Criativo / Ousado</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. CENÁRIO                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div id="section-cenario" data-tour="form-sec-cenario">
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
                    <FieldInfo tooltip="Ex: Hambúrguer artesanal, anúncio de dentista, evento sertanejo..." />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-yellow-500/40">
                    <input
                      type="text"
                      value={nichoProjeto}
                      onChange={(e) => {
                        setNichoProjeto(e.target.value);
                        store.updateConfig({ nicho: e.target.value });
                      }}
                      placeholder="Ex: Consultório odontológico de luxo, Hamburgueria gourmet..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                    />
                  </div>
                </div>

                {/* Descrição do Cenário */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Descrição da Cena / Ambiente</span>
                    <FieldInfo tooltip="Detalhes do fundo, iluminação, arquitetura ou elementos ao redor" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-yellow-500/40">
                    <textarea
                      rows={3}
                      value={sceneDescription}
                      onChange={(e) => {
                        setSceneDescription(e.target.value);
                        store.updateConfig({ promptCenario: e.target.value, cenario: e.target.value });
                      }}
                      placeholder="Descreva o cenário, iluminação volumétrica, partículas, arquitetura..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Imagens de Cenário / Referência */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Imagens de Cenário / Ambiente</span>
                    <FieldInfo tooltip="Imagens de fundo ou ambiente para inspiração direta" />
                  </label>
                  <div
                    onClick={() => fileInputAmbienteRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[rgba(255,213,0,0.25)] bg-[rgba(255,213,0,0.02)] hover:border-[rgba(255,213,0,0.45)] py-3 px-4 transition-colors"
                  >
                    <span className="text-xs text-zinc-400 hover:text-yellow-300 flex items-center gap-2">
                      <span className="text-base leading-none text-[#ffd500]">+</span>
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
                        <div key={img.id || i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-white/10 group">
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAmbienteImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-0.5 bg-black/80 rounded-full text-red-400 hover:text-white"
                            title="Remover cenário"
                          >
                            <X size={12} />
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
        <div id="section-texto_imagem" data-tour="form-sec-texto_imagem">
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
              <span className="shrink-0 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
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
                
                {/* Posição Geral do Texto */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>Posição Geral da Tipografia</span>
                    <FieldInfo tooltip="Alinhamento dos blocos de texto no canvas" />
                  </label>
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
                          onClick={() => {
                            setPosicaoTexto(pos.id as any);
                            const mapped = pos.id === "left" ? "Esquerda" : pos.id === "right" ? "Direita" : "Centro";
                            store.updateConfig({ typographyPosition: mapped });
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? "bg-yellow-500/20 border-yellow-500 text-yellow-300 font-semibold"
                              : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
                          }`}
                        >
                          <pos.Icon size={14} />
                          <span>{pos.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>Textos da Imagem</span>
                    <FieldInfo tooltip="Defina as palavras exatas para a IA renderizar com tipografia fidedigna" />
                  </label>
                  <button
                    type="button"
                    onClick={addTextBlock}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-yellow-400 hover:text-yellow-300 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Adicionar Texto</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {textBlocks.map((block, idx) => (
                    <div key={block.id} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={block.type}
                            onChange={(e) => updateTextBlock(block.id, { type: e.target.value as any })}
                            className="bg-black/60 border border-white/10 rounded-md px-2 py-0.5 text-[11px] font-semibold text-yellow-400 outline-none cursor-pointer"
                          >
                            <option value="H1">H1 - Título</option>
                            <option value="H2">H2 - Subtítulo</option>
                            <option value="CTA">CTA - Botão</option>
                            <option value="Bullets">Bullets / Itens</option>
                            <option value="Texto">Texto Geral</option>
                          </select>
                          <span className="text-[10px] text-zinc-500">#{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={block.color || "#FFFFFF"}
                            onChange={(e) => updateTextBlock(block.id, { color: e.target.value })}
                            className="h-5 w-5 rounded border-0 bg-transparent cursor-pointer"
                            title="Cor do texto"
                          />
                          {textBlocks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTextBlock(block.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                              title="Remover este bloco"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={block.text}
                        onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                        placeholder="Digite o texto exato..."
                        className="w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-yellow-500/40"
                      />
                    </div>
                  ))}
                </div>

                {/* Toggle de Degradê de Leitura */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div>
                    <p className="text-xs font-semibold text-white">Degradê de Leitura</p>
                    <p className="text-[10px] text-zinc-400">Garante contraste para legibilidade do texto</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !degradeTexto;
                      setDegradeTexto(next);
                      store.updateConfig({ degradeLeitura: next });
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      degradeTexto ? "bg-yellow-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                        degradeTexto ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. AJUSTES                                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div id="section-ajustes" data-tour="form-sec-ajustes">
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
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-yellow-500/40">
                    <textarea
                      rows={2}
                      value={elementosFlutuantes}
                      onChange={(e) => {
                        setElementosFlutuantes(e.target.value);
                        store.updateConfig({
                          elementosFlutuantes: Boolean(e.target.value),
                          floatingElementsCustom: e.target.value
                        });
                      }}
                      placeholder="Ex: Moedas de ouro voando, faíscas incandescentes, névoa..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Toggles Rápidos */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !usarBlur;
                      setUsarBlur(next);
                      store.updateConfig({ enableBlur: next });
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors pb-ctrl-btn cursor-pointer ${
                      usarBlur ? "pb-ctrl-active text-white" : "text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-medium">Desfoque Fundo</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${usarBlur ? "bg-yellow-400 shadow-[0_0_8px_#ffd500]" : "bg-zinc-600"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !degradeTexto;
                      setDegradeTexto(next);
                      store.updateConfig({ degradeLeitura: next });
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors pb-ctrl-btn cursor-pointer ${
                      degradeTexto ? "pb-ctrl-active text-white" : "text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-medium">Degradê Suave</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${degradeTexto ? "bg-yellow-400 shadow-[0_0_8px_#ffd500]" : "bg-zinc-600"}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 6. CONFIGURAÇÕES (DIMENSÕES E QUALIDADE)                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div id="section-configuracoes" data-tour="form-sec-configuracoes">
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
                          onClick={() => {
                            setDimensao(d.id);
                            store.updateConfig({ dimensao: d.id as any });
                            const currentImg = store.galeriaImages?.[store.activeImageIndex];
                            if (currentImg && generatePremiumImage) {
                              showToast?.(`Gerando imagem no formato ${d.label}...`, "info");
                              generatePremiumImage({ previousImageBase64: currentImg, isRefinement: true });
                            }
                          }}
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
                          onClick={() => {
                            setQuality(q);
                            store.updateConfig({ qualidade: q, resolucao: q });
                          }}
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
                    <span>Prompt Adicional / Comandos Técnicos</span>
                    <FieldInfo tooltip="Comandos técnicos e instruções livres para a engine generativa" />
                  </label>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors focus-within:border-yellow-500/40">
                    <textarea
                      rows={2}
                      value={promptAdicional}
                      onChange={(e) => {
                        setPromptAdicional(e.target.value);
                        store.updateConfig({ additionalPrompt: e.target.value });
                      }}
                      placeholder="Instruções adicionais personalizadas..."
                      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ESPAÇADOR E BOTÃO CONSTRUIR ESTÁTICO (NO FIM DO FORMULÁRIO) ── */}
        <div className="h-4 shrink-0" aria-hidden="true" />

        <div ref={staticSubmitRef} className="pt-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-2 shadow-lg">
            <div className="w-full">
              <button
                type="button"
                onClick={handleConstruirClick}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 text-black rounded-xl px-6 py-4 text-base font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer shadow-[0_4px_24px_rgba(255,213,0,0.3)]"
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
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#ffd500]/70">
                <button
                  type="button"
                  title="Duplicar configurações para uma nova aba"
                  onClick={() => {
                    store.createProject();
                    showToast?.("Configurações duplicadas em uma nova aba!", "success");
                  }}
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#ffd500] cursor-pointer"
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
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#ffd500] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Resetar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD FLUTUANTE DE CONSTRUIR (APENAS QUANDO O BOTÃO ESTÁTICO NÃO ESTÁ VISÍVEL NA TELA) ── */}
        {!isSubmitIntersecting && (
          <div className="sticky bottom-3 z-30 -mx-1 animate-in fade-in slide-in-from-bottom-2 duration-200 mt-2">
            <div className="rounded-2xl border border-white/10 bg-black/75 px-2 py-2 shadow-2xl backdrop-blur-md">
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleConstruirClick}
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-2 text-black rounded-xl px-6 py-4 text-base font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer shadow-[0_4px_24px_rgba(255,213,0,0.3)]"
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
                <div className="flex items-center justify-center gap-3 text-[11px] text-[#ffd500]/70">
                  <button
                    type="button"
                    title="Duplicar configurações para uma nova aba"
                    onClick={() => {
                      store.createProject();
                      showToast?.("Configurações duplicadas em uma nova aba!", "success");
                    }}
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#ffd500] cursor-pointer"
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
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#ffd500] cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Resetar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-24 shrink-0" aria-hidden="true" />

      </form>
    </aside>
  );
};
