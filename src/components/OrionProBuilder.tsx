import React, { useState, useEffect, useRef } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useClientStore } from "../store/useClientStore";
import {
  Image as ImageIcon,
  User,
  Package,
  Sparkles,
  Crop,
  SlidersHorizontal,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CircleUser,
  SquareUserRound,
  PersonStanding,
  Palette,
  Mountain,
  Type,
  Heading1,
  Heading2,
  List,
  MousePointerClick,
  ChevronUp,
  ChevronDown,
  Layers,
  CheckCircle2,
  X,
  GripVertical,
  Settings,
  Check,
  Copy,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Plus,
  Trash2,
  Info
} from "lucide-react";

interface OrionProBuilderProps {
  onSwitchAgent?: (agent: string) => void;
  onOpenVitrine?: () => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onOpenReport?: () => void;
  showToast?: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  isGenerating?: boolean;
  generatePremiumImage?: (opts?: any) => Promise<void>;
  generatePromptOnly?: boolean;
  setGeneratePromptOnly?: (val: boolean) => void;
  handleGenerateMasterPrompt?: () => Promise<void>;
  isGeneratingPrompt?: boolean;
}

export interface TextBlockItem {
  id: string;
  type: "H1" | "H2" | "Texto" | "Bullets" | "CTA";
  text: string;
  weight: number; // 1 to 5
  color: string;
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "middle-center"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

interface ImageWithDesc {
  id: string;
  url: string;
  desc: string;
}

export const OrionProBuilder: React.FC<OrionProBuilderProps> = ({
  showToast = () => {},
  isGenerating = false,
  generatePremiumImage,
  generatePromptOnly = false,
  handleGenerateMasterPrompt,
  isGeneratingPrompt = false
}) => {
  const store = useProjectStore();

  // ── Collapsible Sections (principal open by default as in official Órion Pro)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    principal: true,
    marca_estilo: false,
    cenario: false,
    texto_imagem: false,
    ajustes: false,
    configuracoes: false
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Section 1: Principal
  const [categoria, setCategoria] = useState<"Pessoa" | "Produto" | "Livre" | null>("Pessoa");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [subjectDescription, setSubjectDescription] = useState<string>("");
  const [subjectPosition, setSubjectPosition] = useState<"left" | "center" | "right" | "">("center");
  const [plano, setPlano] = useState<string>("Plano Médio (Busto)");

  // ── Section 2: Marca e estilo
  const [brandImages, setBrandImages] = useState<ImageWithDesc[]>(() => {
    if (Array.isArray(store.logosList) && store.logosList.length > 0) {
      return store.logosList.map((url, i) => ({ id: `brand_${i}`, url, desc: "logo" }));
    }
    if (store.logoBase64 && store.logoBase64.trim()) {
      return [{ id: "brand_0", url: store.logoBase64, desc: "logo" }];
    }
    return [];
  });
  const [nichoProjeto, setNichoProjeto] = useState<string>(() => store.nicho || "");
  const [estiloVisual, setEstiloVisual] = useState<string>(() => store.estiloVisual || "Ultra Realista");
  const [estiloImages, setEstiloImages] = useState<ImageWithDesc[]>(() => {
    if (Array.isArray(store.referenciasEstilo) && store.referenciasEstilo.length > 0) {
      return store.referenciasEstilo.map((r: any, i: number) => ({
        id: r.id || `estilo_${i}`,
        url: r.data || r.url || (typeof r === "string" ? r : ""),
        desc: r.descricao || "estilo"
      }));
    }
    return [];
  });

  // ── Section 3: Cenário
  const [sceneDescription, setSceneDescription] = useState<string>(() => store.promptCenario || store.cenario || "");
  const [ambienteImages, setAmbienteImages] = useState<ImageWithDesc[]>(() => {
    if (Array.isArray(store.cenariosBase64List) && store.cenariosBase64List.length > 0) {
      return store.cenariosBase64List.map((url, i) => ({ id: `amb_${i}`, url, desc: "ambiente" }));
    }
    if (store.cenarioBase64 && store.cenarioBase64.trim()) {
      return [{ id: "amb_0", url: store.cenarioBase64, desc: "ambiente" }];
    }
    return [];
  });

  // ── Section 4: Texto na imagem
  const [textBlocks, setTextBlocks] = useState<TextBlockItem[]>(() => {
    if (Array.isArray(store.camadasTexto) && store.camadasTexto.length > 0) {
      return store.camadasTexto.map((c: any, i: number) => ({
        id: c.id || `block_${i}`,
        type: (c.tipoBloco || c.funcao?.toLowerCase() || "h1").toLowerCase().includes("bullet")
          ? "bullets"
          : (c.tipoBloco || "").toLowerCase().includes("cta")
          ? "cta"
          : (c.tipoBloco || "h1").toLowerCase(),
        text: c.conteudo || "",
        weight: c.pesoVisual || 5,
        color: c.cor || "#FFFFFF",
        position: c.posicao || (c as any).posicao || "top-center"
      }));
    }
    return [];
  });

  // ── Section 5: Ajustes
  const [corAmbiente, setCorAmbiente] = useState<string>(() => store.cores?.ambiente || "#1A1A2E");
  const [activeAmbiente, setActiveAmbiente] = useState<boolean>(true);
  const [luzComplementar, setLuzComplementar] = useState<string>(() => store.cores?.complementar || "#E2E2E2");
  const [activeLuz, setActiveLuz] = useState<boolean>(true);
  const [corDestaque, setCorDestaque] = useState<string>(() => store.cores?.acento || store.cores?.recorte || "#7C3AED");
  const [activeDestaque, setActiveDestaque] = useState<boolean>(true);

  const [elementosFlutuantes, setElementosFlutuantes] = useState<boolean>(() => !!store.elementosFlutuantes && !!store.floatingElementsCustom);
  const [elementosFlutuantesText, setElementosFlutuantesText] = useState<string>(() => store.floatingElementsCustom || "");
  const [promptAdicional, setPromptAdicional] = useState<string>(() => store.additionalPrompt || "");

  // ── Section 6: Configurações
  const [dimensao, setDimensao] = useState<string>("4:5");
  const [quality, setQuality] = useState<"1K" | "2K" | "4K">(() => {
    const q = (store.qualidade || store.resolucao || "1K") as "1K" | "2K" | "4K";
    return q === "2K" || q === "4K" ? q : "1K";
  });
  const [modoCriativo, setModoCriativo] = useState<"Rígido" | "Criativo" | "Builder">("Criativo");

  // Rehydrate state when switching projects/tabs or on initial mount
  useEffect(() => {
    if (store.qualidade || store.resolucao) {
      const q = (store.qualidade || store.resolucao || "1K") as "1K" | "2K" | "4K";
      setQuality(q === "2K" || q === "4K" ? q : "1K");
    }
    if (store.dimensao) {
      setDimensao(store.dimensao);
    }
    if (store.poseDescription || store.composicaoCustom) {
      setSubjectDescription(store.poseDescription || store.composicaoCustom || "");
    }
    if (store.promptCenario || store.cenario) {
      setSceneDescription(store.promptCenario || store.cenario || "");
    }
    if (store.additionalPrompt) {
      setPromptAdicional(store.additionalPrompt || "");
    }
    if (store.nicho) {
      setNichoProjeto(store.nicho || "");
    }
    if (store.estiloVisual) {
      setEstiloVisual(store.estiloVisual || "Ultra Realista");
    }
    if (store.positioning) {
      const p = store.positioning.toLowerCase();
      setSubjectPosition(p.includes("esq") || p.includes("left") ? "left" : p.includes("dir") || p.includes("right") ? "right" : "center");
    }
    if (store.composicao) {
      setPlano(store.composicao);
    }
    if (store.elementosFlutuantes !== undefined) {
      setElementosFlutuantes(!!store.elementosFlutuantes);
    }
    if (store.floatingElementsCustom) {
      setElementosFlutuantesText(store.floatingElementsCustom);
    }
    if (store.cores) {
      if (store.cores.ambiente) setCorAmbiente(store.cores.ambiente);
      if (store.cores.complementar) setLuzComplementar(store.cores.complementar);
      if (store.cores.acento || store.cores.recorte) setCorDestaque(store.cores.acento || store.cores.recorte);
    }

    // Rehydrate brandImages
    if (Array.isArray(store.logosList) && store.logosList.length > 0) {
      setBrandImages(store.logosList.map((url, i) => ({ id: `brand_${i}`, url, desc: "logo" })));
    } else if (store.logoBase64 && store.logoBase64.trim()) {
      setBrandImages([{ id: "brand_0", url: store.logoBase64, desc: "logo" }]);
    } else {
      setBrandImages([]);
    }

    // Rehydrate estiloImages
    if (Array.isArray(store.referenciasEstilo) && store.referenciasEstilo.length > 0) {
      setEstiloImages(store.referenciasEstilo.map((r: any, i: number) => ({
        id: r.id || `estilo_${i}`,
        url: r.data || r.url || (typeof r === "string" ? r : ""),
        desc: r.descricao || "estilo"
      })));
    } else {
      setEstiloImages([]);
    }

    // Rehydrate ambienteImages
    if (Array.isArray(store.cenariosBase64List) && store.cenariosBase64List.length > 0) {
      setAmbienteImages(store.cenariosBase64List.map((url, i) => ({ id: `amb_${i}`, url, desc: "ambiente" })));
    } else if (store.cenarioBase64 && store.cenarioBase64.trim()) {
      setAmbienteImages([{ id: "amb_0", url: store.cenarioBase64, desc: "ambiente" }]);
    } else {
      setAmbienteImages([]);
    }

    // Rehydrate textBlocks
    if (Array.isArray(store.camadasTexto) && store.camadasTexto.length > 0) {
      setTextBlocks(store.camadasTexto.map((c: any, i: number) => ({
        id: c.id || `block_${i}`,
        type: (c.tipoBloco || c.funcao?.toLowerCase() || "h1").toLowerCase().includes("bullet")
          ? "bullets"
          : (c.tipoBloco || "").toLowerCase().includes("cta")
          ? "cta"
          : (c.tipoBloco || "h1").toLowerCase(),
        text: c.conteudo || "",
        weight: c.pesoVisual || 5,
        color: c.cor || "#FFFFFF",
        position: c.posicao || (c as any).posicao || "top-center"
      })));
    } else {
      setTextBlocks([]);
    }
  }, [store.activeProjectId, store.lastLoadedAt]);

  // ── Client Content Context (from ClientHub)
  // ── Client Content Context (from ClientHub)
  const {
    clients,
    activeClientId,
    activeContentId,
    activeSlideIndex,
    setActiveSlideIndex,
    setActiveContentId,
    updateSlideImage
  } = useClientStore();
  const activeClient = clients.find((c) => c.id === activeClientId);
  const activeContent = activeClient?.historicoConteudos?.find((h) => h.id === activeContentId);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(() => activeSlideIndex || 0);

  // Sync internal slide index with store slide index
  useEffect(() => {
    if (typeof activeSlideIndex === "number" && activeSlideIndex !== activeSlideIdx) {
      setActiveSlideIdx(activeSlideIndex);
    }
  }, [activeSlideIndex]);

  // Auto-sync active slide and client assets from client content
  useEffect(() => {
    if (!activeContent || !activeClient) return;
    const currentSlide = activeContent.slides?.[activeSlideIdx] || activeContent.slides?.[0];
    if (!currentSlide) return;

    // 1. Proporção e Dimensões
    setDimensao("4:5");

    // 2. Prompt Órion
    if (currentSlide.promptOrion) {
      setPromptAdicional(currentSlide.promptOrion);
    }

    // 3. Sujeito / Posicionamento / Enquadramento
    setCategoria("Pessoa");
    setQuantidade("1");
    if (currentSlide.tipo === "capa") {
      setSubjectPosition("right");
      setPlano("Plano Médio (Busto)");
    } else if (currentSlide.tipo === "cta") {
      setSubjectPosition("center");
      setPlano("Plano Médio Curto");
    } else {
      setSubjectPosition("right");
      setPlano("Plano Médio (Busto)");
    }

    // Descrição do Sujeito Inteligente
    let autoSubject = "";
    if (currentSlide.sugestaoVisual && (
      currentSlide.sugestaoVisual.toLowerCase().includes("pessoa") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("homem") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("mulher") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("profissional") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("especialista") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("médic") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("advogad") ||
      currentSlide.sugestaoVisual.toLowerCase().includes("cliente")
    )) {
      autoSubject = currentSlide.sugestaoVisual;
    } else if (activeClient?.niche) {
      autoSubject = `Profissional de destaque em ${activeClient.niche}, expressão confiante e postura de autoridade para a marca ${activeClient.name}.`;
    }
    setSubjectDescription(autoSubject);

    // 4. Marca e Identidade Visual (Logo)
    if (activeClient?.logoBase64) {
      setBrandImages([
        {
          id: `client_logo_${activeClient.id}`,
          url: activeClient.logoBase64,
          desc: `Logo Oficial (${activeClient.name})`
        }
      ]);
      store.updateConfig({
        logoBase64: activeClient.logoBase64,
        useLogo: true,
        logosList: [activeClient.logoBase64]
      });
    }

    // 5. Inspirações de Estilo (Prints do Perfil)
    if (activeClient?.printsPerfil && activeClient.printsPerfil.length > 0) {
      setEstiloImages(
        activeClient.printsPerfil.map((url, idx) => ({
          id: `client_print_${activeClient.id}_${idx}`,
          url,
          desc: `Referência estética do perfil #${idx + 1} (${activeClient.name})`
        }))
      );
    }

    // 6. Nicho / Contexto do Projeto
    const projetoContexto = [
      activeClient?.name ? `Marca: ${activeClient.name}` : "",
      activeClient?.niche ? `Nicho: ${activeClient.niche}` : "",
      activeContent.temaCentral ? `Tema: ${activeContent.temaCentral}` : ""
    ].filter(Boolean).join(" - ");
    setNichoProjeto(projetoContexto || activeClient?.niche || "");

    // 7. Estilo Visual Extraído
    if (activeClient?.estiloVisualExtraido) {
      const match = ESTILOS_VISUAIS_LIST.find(
        (e) =>
          e.label.toLowerCase() === activeClient.estiloVisualExtraido?.toLowerCase() ||
          activeClient.estiloVisualExtraido?.toLowerCase().includes(e.label.toLowerCase()) ||
          e.label.toLowerCase().includes(activeClient.estiloVisualExtraido?.toLowerCase() || "")
      );
      if (match) {
        setEstiloVisual(match.label);
      } else {
        setEstiloVisual(activeClient.estiloVisualExtraido);
      }
    }

    // 8. Cenário / Ambiente
    if (currentSlide.sugestaoVisual) {
      setSceneDescription(currentSlide.sugestaoVisual);
    } else if (activeClient?.infoExtra) {
      setSceneDescription(`Ambiente contemporâneo alinhado à proposta de ${activeClient.name}. ${activeClient.infoExtra}`);
    }

    // 9. Paleta de Cores e Iluminação
    if (activeClient?.paletaCores?.[0]) {
      setCorAmbiente(activeClient.paletaCores[0]);
      setActiveAmbiente(true);
    }
    if (activeClient?.paletaCores?.[1]) {
      setLuzComplementar(activeClient.paletaCores[1]);
      setActiveLuz(true);
    } else if (activeClient?.corDominante) {
      setLuzComplementar(activeClient.corDominante);
      setActiveLuz(true);
    }
    if (activeClient?.paletaCores?.[2]) {
      setCorDestaque(activeClient.paletaCores[2]);
      setActiveDestaque(true);
    } else if (activeClient?.corDominante) {
      setCorDestaque(activeClient.corDominante);
      setActiveDestaque(true);
    }

    // 10. Camadas de Texto (Título e Conteúdo do Slide)
    const blocks: TextBlockItem[] = [];
    const titleColor = activeClient?.paletaCores?.[1] || activeClient?.corDominante || "#FFFFFF";
    const bodyColor = "#F1F5F9";

    if (currentSlide.titulo) {
      blocks.push({
        id: `tb_${currentSlide.id || activeSlideIdx}_title`,
        type: currentSlide.tipo === "capa" ? "H1" : currentSlide.tipo === "cta" ? "CTA" : "H2",
        text: currentSlide.titulo,
        weight: 5,
        color: titleColor,
        position: currentSlide.tipo === "capa" ? "top-left" : currentSlide.tipo === "cta" ? "top-center" : "top-left",
      });
    }

    if (currentSlide.conteudo) {
      blocks.push({
        id: `tb_${currentSlide.id || activeSlideIdx}_content`,
        type: currentSlide.tipo === "cta" ? "CTA" : "Texto",
        text: currentSlide.conteudo,
        weight: currentSlide.tipo === "cta" ? 4 : 3,
        color: bodyColor,
        position: currentSlide.tipo === "capa" ? "middle-left" : currentSlide.tipo === "cta" ? "middle-center" : "middle-left",
      });
    }

    setTextBlocks(blocks);

    // 11. Auto-abrir seções para visibilidade total
    setOpenSections({
      principal: true,
      marca_estilo: true,
      cenario: true,
      texto_imagem: true,
      ajustes: true,
      configuracoes: false
    });
  }, [activeContentId, activeSlideIdx, activeClientId]);

  // ── Modals & Dialogs State
  const [activeModalInfo, setActiveModalInfo] = useState<{ title: string; text: string } | null>(null);
  const [expandedEditor, setExpandedEditor] = useState<{
    id: "subject_description" | "nicho_projeto" | "scene_description" | "prompt_adicional";
    title: string;
    value: string;
  } | null>(null);
  const [showPhotoAdjustModal, setShowPhotoAdjustModal] = useState<boolean>(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [cropModal, setCropModal] = useState<{
    url: string;
    target: "ambiente" | "sujeito" | "marca" | "estilo";
    index: number;
  } | null>(null);
  const [cropRatio, setCropRatio] = useState<"Livre" | "1:1" | "4:3" | "16:9" | "9:16">("Livre");
  const [cropRotation, setCropRotation] = useState<number>(0);
  const [cropFlipH, setCropFlipH] = useState<boolean>(false);
  const [cropFlipV, setCropFlipV] = useState<boolean>(false);
  const [activeColorPicker, setActiveColorPicker] = useState<{
    id: string;
    title: string;
    color: string;
    onSelect: (color: string) => void;
  } | null>(null);

  // ── File Input Refs
  const fileInputSujeitoRef = useRef<HTMLInputElement>(null);
  const fileInputBrandRef = useRef<HTMLInputElement>(null);
  const fileInputEstiloRef = useRef<HTMLInputElement>(null);
  const fileInputAmbienteRef = useRef<HTMLInputElement>(null);

  // Hidden Color Input Refs
  const colorAmbienteRef = useRef<HTMLInputElement>(null);
  const colorLuzRef = useRef<HTMLInputElement>(null);
  const colorDestaqueRef = useRef<HTMLInputElement>(null);

  // 23 Visual Styles with Descriptions
  const ESTILOS_VISUAIS_LIST = [
    { label: "Cinema", desc: "Clima cinematográfico dramático, iluminação de filme, granulação suave e grading de cor cinematográfico." },
    { label: "Clássico", desc: "Atemporal e sóbrio: tons quentes, luz suave e ar de retrato clássico de cinema." },
    { label: "Formal", desc: "Corporativo e limpo: simetria, paleta neutra (azul-marinho, grafite) e luz de estúdio." },
    { label: "Elegante", desc: "Luxo refinado: tons sofisticados (ouro, champanhe), luz de glamour e texturas sedosas." },
    { label: "Sexy", desc: "Sensual e dramático: pouca luz, sombras profundas, contraste forte e clima editorial de moda." },
    { label: "Institucional", desc: "Institucional e confiável: tons neutros, luz equilibrada e foco em credibilidade e autoridade." },
    { label: "Tecnológico", desc: "Futurista: tons de azul e ciano, grades digitais, luz de LED e clima de inovação." },
    { label: "Glassmorphism", desc: "Vidro fosco: camadas translúcidas, desfoque de profundidade e fundos em degradê suave." },
    { label: "Interface UI", desc: "Interface digital: modo escuro, elementos de HUD flutuantes e linhas de neon." },
    { label: "Minimalista", desc: "Clean: muito espaço livre, paleta neutra com um só destaque e clima calmo, sem excessos." },
    { label: "Lúdico", desc: "Vibrante e divertido: cores saturadas, ângulos dinâmicos e elementos lúdicos. Jovem e alegre." },
    { label: "Cartoon", desc: "Ilustração estilizada com toque realista: contornos marcados, cores chapadas e energia de quadrinhos." },
    { label: "Infoproduto", desc: "Marketing de conversão: cores fortes, alto contraste e espaço para texto. Visual digital moderno." },
    { label: "Jovial", desc: "Caloroso e acessível: luz dourada, sorrisos naturais e clima de fotografia de lifestyle." },
    { label: "Gamer", desc: "Esports: fundo escuro com neon RGB, ângulos agressivos, fumaça e clima competitivo de alta energia." },
    { label: "Retrato Profissional", desc: "Retrato de estúdio: fundo limpo, luz de softbox e foco nítido nos olhos. Qualidade de capa." },
    { label: "Ultra Realista", desc: "Hiper-realista: luz natural, pele com textura real e zero aparência de IA." },
    { label: "Glow", desc: "Brilho etéreo: luz suave e radiante, efeito bloom, contraluz angelical e fundo com bokeh." },
    { label: "Publicitário", desc: "Fotografia comercial para grandes marcas, iluminação perfeitamente calculada e nitidez impecável." },
    { label: "Flyer Sertanejo", desc: "Estética noturna de shows sertanejos, tons quentes e ambarados, iluminação rústica e efeitos volumétricos." },
    { label: "Flyer Funk", desc: "Estilo baile funk paulista e carioca, visual urbano noturno, neons vibrantes, flares e alto contraste." },
    { label: "Delivery", desc: "Fotografia gastronômica comercial apetitosa, luz natural quente, foco nos ingredientes e cores vivas." },
    { label: "Brand Premium", desc: "Visual de marca de alto luxo internacional, elegância contida, tipografia sofisticada e acabamentos impecáveis." }
  ];

  // ── Sync to Global Store in Realtime
  useEffect(() => {
    const brandDescText = brandImages.filter(b => b.desc && b.desc.trim()).map((b, i) => `Identidade da Marca #${i + 1}: ${b.desc.trim()}`).join(". ");
    const estiloDescText = estiloImages.filter(e => e.desc && e.desc.trim()).map((e, i) => `Referência de Estilo #${i + 1}: ${e.desc.trim()}`).join(". ");
    const ambienteDescText = ambienteImages.filter(a => a.desc && a.desc.trim()).map((a, i) => `Cenário/Ambiente #${i + 1}: ${a.desc.trim()}`).join(". ");

    store.updateConfig({
      dimensao: dimensao,
      resolucao: quality,
      gender: categoria === "Pessoa" ? "Masculino" : "Livre",
      positioning: subjectPosition === "left" ? "Esquerda" : subjectPosition === "right" ? "Direita" : "Centro",
      poseDescription: subjectDescription,
      promptCenario: [
        nichoProjeto ? `Nicho/Projeto: ${nichoProjeto}` : "",
        sceneDescription ? `Cenário: ${sceneDescription}` : "",
        ambienteDescText
      ].filter(Boolean).join(". "),
      composicao: plano,
      estilosVisuais: [estiloVisual],
      additionalPrompt: [
        categoria ? `Categoria: ${categoria}` : "",
        quantidade ? `Quantidade: ${quantidade}` : "",
        elementosFlutuantes ? (elementosFlutuantesText ? `Elementos flutuantes: ${elementosFlutuantesText}` : "Elementos flutuantes dinâmicos no ambiente") : "",
        `Modo Criativo: ${modoCriativo}`,
        brandDescText,
        estiloDescText,
        promptAdicional
      ].filter(Boolean).join(". "),
      // Brand / Logo sync
      logoBase64: brandImages[0]?.url || store.logoBase64 || "",
      logosList: brandImages.map(b => b.url),
      useLogo: brandImages.length > 0 || !!store.logoBase64,
      // Estilo sync
      referenciasEstilo: estiloImages.map(e => ({
        id: e.id,
        data: e.url,
        url: e.url,
        nome: e.desc || "Estilo",
        descricao: e.desc || "Estilo",
        peso: 1
      })),
      // Cenário / Ambiente sync
      cenarioBase64: ambienteImages[0]?.url || store.cenarioBase64 || "",
      cenariosBase64List: ambienteImages.map(a => a.url),
      useEnvRef: ambienteImages.length > 0 || !!store.cenarioBase64,
      cores: {
        ambiente: activeAmbiente ? corAmbiente : "",
        recorte: activeLuz ? luzComplementar : "",
        complementar: activeDestaque ? corDestaque : "",
        paleta: [activeAmbiente && corAmbiente, activeLuz && luzComplementar, activeDestaque && corDestaque].filter(Boolean) as string[]
      },
      camadasTexto: textBlocks.map((b) => ({
        id: b.id,
        conteudo: b.text,
        funcao: b.type as any,
        tipoBloco: b.type,
        pesoVisual: b.weight,
        cor: b.color,
        posicao: b.position
      })),
      activeAgentSlug: "orion-pro"
    } as any);
  }, [
    dimensao,
    quality,
    categoria,
    quantidade,
    subjectPosition,
    subjectDescription,
    plano,
    nichoProjeto,
    sceneDescription,
    estiloVisual,
    elementosFlutuantes,
    elementosFlutuantesText,
    modoCriativo,
    promptAdicional,
    corAmbiente,
    activeAmbiente,
    luzComplementar,
    activeLuz,
    corDestaque,
    activeDestaque,
    textBlocks,
    brandImages,
    estiloImages,
    ambienteImages
  ]);

  // ── Upload Handlers
  const handleUploadSujeito = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const currentList = store.sujeitosBase64List || [];
    Array.from(files).forEach((file) => {
      if (currentList.length >= 8) {
        showToast("Limite de fotos atingido.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        const updated = [...(store.sujeitosBase64List || []), b64];
        store.setSujeitoBase64List(updated);
        if (!store.sujeitoBase64) {
          store.setSujeitoBase64(b64);
        }

        // Persist physical image file to server disk so it never disappears on F5
        fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: b64, filename: file.name || "sujeito_" + Date.now() + ".png" })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.url) {
              const diskList = (store.sujeitosBase64List || []).map((u) => (u === b64 ? data.url : u));
              store.setSujeitoBase64List(diskList);
              if (store.sujeitoBase64 === b64) {
                store.setSujeitoBase64(data.url);
              }
            }
          })
          .catch((err) => console.warn("Upload sujeito error:", err));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSujeito = (idx: number) => {
    const updated = (store.sujeitosBase64List || []).filter((_, i) => i !== idx);
    store.setSujeitoBase64List(updated);
    store.setSujeitoBase64(updated[0] || "");
  };

  const handleUploadGeneric = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<ImageWithDesc[]>>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        const tempId = String(Date.now() + Math.random());
        setter((prev) => [...prev, { id: tempId, url: b64, desc: "" }]);

        // Persist physical image file to server disk so it never disappears on F5
        fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: b64, filename: file.name || "ref_" + Date.now() + ".png" })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.url) {
              setter((prev) => prev.map((item) => (item.id === tempId ? { ...item, url: data.url } : item)));
            }
          })
          .catch((err) => console.warn("Upload generic error:", err));
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Text Block Functions
  const addTextBlock = (type: "H1" | "H2" | "Texto" | "Bullets" | "CTA") => {
    if (textBlocks.length >= 8) {
      showToast("Limite de 8 blocos atingido.", "warning");
      return;
    }
    const defaultWeightMap = { H1: 5, H2: 3, Texto: 2, Bullets: 2, CTA: 4 };
    const newBlock: TextBlockItem = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      text: "",
      weight: defaultWeightMap[type] || 3,
      color: "#FFFFFF",
      position: "middle-center"
    };
    setTextBlocks((prev) => [...prev, newBlock]);
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlockItem>) => {
    setTextBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeTextBlock = (id: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveTextBlock = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= textBlocks.length) return;
    setTextBlocks((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const countByType = (type: "H1" | "H2" | "Texto" | "Bullets" | "CTA") => {
    return textBlocks.filter((b) => b.type === type).length;
  };

  // Helper for 9-cell position buttons
  const POSITIONS_GRID: { pos: TextBlockItem["position"]; label: string; arrow: string }[] = [
    { pos: "top-left", label: "top-left", arrow: "↖" },
    { pos: "top-center", label: "top-center", arrow: "↑" },
    { pos: "top-right", label: "top-right", arrow: "↗" },
    { pos: "middle-left", label: "middle-left", arrow: "←" },
    { pos: "middle-center", label: "middle-center", arrow: "●" },
    { pos: "middle-right", label: "middle-right", arrow: "→" },
    { pos: "bottom-left", label: "bottom-left", arrow: "↙" },
    { pos: "bottom-center", label: "bottom-center", arrow: "↓" },
    { pos: "bottom-right", label: "bottom-right", arrow: "↘" }
  ];

  // Helper for resolution text
  const getResolutionInfo = () => {
    if (quality === "1K") {
      if (dimensao === "9:16") return { label: "1K", res: "1080×1920" };
      if (dimensao === "4:5") return { label: "1K", res: "1080×1350" };
      if (dimensao === "16:9") return { label: "1K", res: "1920×1080" };
      return { label: "1K", res: "1024×1024" };
    }
    if (quality === "2K") {
      if (dimensao === "9:16") return { label: "ALTA", res: "1440×2560" };
      if (dimensao === "4:5") return { label: "ALTA", res: "1856×2304" };
      if (dimensao === "16:9") return { label: "ALTA", res: "2560×1440" };
      return { label: "ALTA", res: "2048×2048" };
    }
    if (dimensao === "9:16") return { label: "MÁXIMA", res: "2160×3840" };
    if (dimensao === "4:5") return { label: "MÁXIMA", res: "3072×3840" };
    if (dimensao === "16:9") return { label: "MÁXIMA", res: "3840×2160" };
    return { label: "MÁXIMA", res: "4096×4096" };
  };

  const resInfo = getResolutionInfo();

  return (
    <div className="flex flex-col gap-4 lg:gap-5 w-full">
      {/* ── MODO CONTEÚDO DE CLIENTE / CARROSSEL ── */}
      {activeContent && (
        <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-zinc-900/90 to-purple-950/20 p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-black font-bold text-xs">
                {activeContent.tipo === "carrossel" ? <Layers className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                  {activeClient?.name} • {activeContent.tipo === "carrossel" ? "Modo Carrossel" : "Card Único"}
                </span>
                <h4 className="text-xs font-bold text-white truncate max-w-[240px]">{activeContent.titulo}</h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveContentId(null)}
              className="text-zinc-500 hover:text-white text-xs p-1 cursor-pointer"
              title="Sair do Modo Cliente"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Timeline de Slides */}
          {activeContent.tipo === "carrossel" && activeContent.slides?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {activeContent.slides.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => {
                      setActiveSlideIdx(idx);
                      setActiveSlideIndex(idx);
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      activeSlideIdx === idx
                        ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/30 scale-102"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{idx === 0 ? "Capa" : idx === activeContent.slides.length - 1 ? "CTA" : `Slide ${idx + 1}`}</span>
                    {s.imagemGerada && (
                      <CheckCircle2 className={`h-3 w-3 ${activeSlideIdx === idx ? "text-black" : "text-emerald-400"}`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Detalhe do slide ativo */}
              {activeContent.slides[activeSlideIdx] && (
                <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5 text-[11px]">
                  <span className="text-zinc-300 truncate max-w-[200px]">
                    <strong className="text-yellow-400">#{activeSlideIdx + 1}:</strong> {activeContent.slides[activeSlideIdx].titulo}
                  </span>
                  {activeContent.slides[0]?.imagemGerada && activeSlideIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeContent.slides[0].imagemGerada) {
                          store.updateConfig({ cenarioBase64: activeContent.slides[0].imagemGerada, useEnvRef: true });
                          setAmbienteImages([
                            {
                              id: `slide_0_anchor`,
                              url: activeContent.slides[0].imagemGerada,
                              desc: "Capa do Carrossel (Âncora Visual de Estilo e Consistência)"
                            }
                          ]);
                          showToast("Capa vinculada como Âncora Visual para consistência total!", "success");
                        }
                      }}
                      className="text-[10px] text-yellow-300 hover:underline font-semibold cursor-pointer"
                    >
                      🔗 Usar Capa como Âncora
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. SEÇÃO PRINCIPAL (data-tour="form-sec-principal")                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-tour="form-sec-principal">
        <div
          data-state={openSections.principal ? "open" : "closed"}
          data-slot="collapsible"
          className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
        >
          <button
            type="button"
            onClick={() => toggleSection("principal")}
            aria-expanded={openSections.principal}
            data-state={openSections.principal ? "open" : "closed"}
            data-slot="collapsible-trigger"
            className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
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
            <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
              <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                {/* 1.1 Categoria */}
                <div data-field-id="categoria" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>
                        Categoria<span className="ml-1 text-red-400">*</span>
                      </span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Categoria"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Categoria",
                              text: "Define o foco central da criação: Pessoa preserva traços faciais e identidade; Produto foca no objeto e embalagem; Livre permite criações artísticas e conceituais sem sujeito fixo."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div
                      role="group"
                      aria-label="Categoria"
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}
                    >
                      {[
                        { key: "Pessoa", label: "Pessoa", icon: <User className="h-5 w-5" /> },
                        { key: "Produto", label: "Produto", icon: <Package className="h-5 w-5" /> },
                        { key: "Livre", label: "Livre", icon: <Sparkles className="h-5 w-5" /> }
                      ].map((item) => (
                        <div key={item.key} className="group relative">
                          <button
                            type="button"
                            aria-pressed={categoria === item.key ? "true" : "false"}
                            onClick={() => setCategoria(categoria === item.key ? null : (item.key as any))}
                            className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                              categoria === item.key ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            {item.icon}
                            <span className="font-medium text-sm">{item.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1.2 Fotos do Sujeito / Produto */}
                <div data-field-id="fotos_do_sujeito_produto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3" data-image-field-id="fotos_do_sujeito_produto">
                    <div className="flex flex-col gap-2">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                          <span>Fotos do Sujeito / Produto</span>
                          <span className="relative inline-flex items-center">
                            <button
                              type="button"
                              data-field-info=""
                              aria-label="Mais informações Fotos do Sujeito / Produto"
                              onClick={() =>
                                setActiveModalInfo({
                                  title: "Fotos do Sujeito / Produto",
                                  text: "Imagens que representam o protagonista da arte. Para pessoas, a IA mantém a fisionomia e expressões. Para produtos, preserva o formato, embalagem e proporções."
                                })
                              }
                              className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                              style={{ color: "rgb(255, 213, 0)" }}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </label>
                      </div>

                      {(store.sujeitosBase64List || []).length === 0 ? (
                        <>
                          <div tabIndex={-1} className="relative flex flex-col outline-none gap-2">
                            <div
                              onClick={() => fileInputSujeitoRef.current?.click()}
                              className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                            >
                              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                                <span className="font-light text-[#5c5278] text-4xl leading-none">+</span>
                                <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div tabIndex={-1} className="relative flex flex-col outline-none gap-2">
                            <div className="flex flex-wrap gap-2">
                              {/* Render Existing Uploaded Images */}
                              {(store.sujeitosBase64List || []).map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    alt={`imagem ${idx + 1}`}
                                    className="h-20 w-20 rounded-lg object-cover cursor-pointer transition-all"
                                    src={img}
                                    style={{ border: "1px solid rgba(139, 92, 246, 0.22)" }}
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Remover imagem ${idx + 1}`}
                                    title={`Remover imagem ${idx + 1}`}
                                    onClick={() => handleRemoveSujeito(idx)}
                                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                                  >
                                    <span aria-hidden="true">×</span>
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Recortar imagem ${idx + 1}`}
                                    title={`Recortar imagem ${idx + 1}`}
                                    onClick={() => setShowPhotoAdjustModal(true)}
                                    className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                                  >
                                    <Crop className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              ))}

                              {/* Add Plus Dropzone */}
                              <div
                                onClick={() => fileInputSujeitoRef.current?.click()}
                                className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                              >
                                <span className="text-2xl font-light leading-none text-[#5c5278]">+</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowPhotoAdjustModal(true)}
                              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] cursor-pointer"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                              Ajustar fotos e cena
                            </button>
                          </div>
                        </>
                      )}

                      <input
                        ref={fileInputSujeitoRef}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        multiple
                        className="hidden"
                        type="file"
                        onChange={handleUploadSujeito}
                      />
                    </div>
                  </div>
                </div>

                {/* 1.3 Quantidade */}
                <div data-field-id="quantidade" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Quantidade</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Quantidade"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Quantidade",
                              text: "Número de pessoas ou produtos destacados que devem aparecer simultaneamente na composição visual da cena."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div
                      role="group"
                      aria-label="Quantidade"
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: "repeat(5, minmax(0px, 1fr))" }}
                    >
                      {["1", "2", "3", "4", "5"].map((q) => (
                        <div key={q} className="group relative">
                          <button
                            type="button"
                            aria-pressed={quantidade === q ? "true" : "false"}
                            onClick={() => setQuantidade(quantidade === q ? "" : q)}
                            className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                              quantidade === q ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            <span className="font-medium text-sm">{q}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1.4 Como o sujeito deve aparecer? */}
                <div data-field-id="subject_description" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="subject_description"
                      className="flex items-center gap-1.5 text-sm font-semibold text-white"
                    >
                      <span>Como o sujeito deve aparecer?</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Como o sujeito deve aparecer?"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Como o sujeito deve aparecer?",
                              text: "Descreva a vestimenta, pose, ângulo corporal, olhar, expressão facial e qualquer acessório importante para garantir máxima fidelidade."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div className="group relative">
                      <textarea
                        id="subject_description"
                        rows={2}
                        value={subjectDescription}
                        onChange={(e) => setSubjectDescription(e.target.value)}
                        placeholder="Descreva roupas, pose, acessorios, acao..."
                        className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ height: "85.6px" }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEditor({
                            id: "subject_description",
                            title: "Como o sujeito deve aparecer?",
                            value: subjectDescription
                          })
                        }
                        className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 cursor-pointer"
                        title="Expandir editor"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1.5 Posição do Sujeito */}
                <div data-field-id="subject_position" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Posição do Sujeito</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Posição do Sujeito"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Posição do Sujeito",
                              text: "Alinhamento do personagem ou produto no quadro. Esquerda ou Direita deixam espaço negativo livre para títulos e tipografia. Centro cria impacto simétrico direto."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div
                      role="group"
                      aria-label="Posição do Sujeito"
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}
                    >
                      {[
                        { key: "left", label: "Esquerda", icon: <AlignLeft className="h-5 w-5" /> },
                        { key: "center", label: "Centro", icon: <AlignCenter className="h-5 w-5" /> },
                        { key: "right", label: "Direita", icon: <AlignRight className="h-5 w-5" /> }
                      ].map((pos) => (
                        <div key={pos.key} className="group relative">
                          <button
                            type="button"
                            aria-pressed={subjectPosition === pos.key ? "true" : "false"}
                            onClick={() => setSubjectPosition(subjectPosition === pos.key ? "" : (pos.key as any))}
                            className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                              subjectPosition === pos.key ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            {pos.icon}
                            <span className="font-medium text-sm">{pos.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1.6 Plano */}
                <div data-field-id="plano" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Plano</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Plano"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Plano de Enquadramento",
                              text: "Enquadramento da câmera: Close-up (foco na expressão facial), Plano Médio (busto e ombros), Plano Americano (da cintura para cima) ou Corpo Inteiro (visão completa da cabeça aos pés)."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div
                      role="group"
                      aria-label="Plano"
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: "repeat(2, minmax(0px, 1fr))" }}
                    >
                      {[
                        { key: "Close-up (Rosto)", label: "Close-up (Rosto)", icon: <CircleUser className="h-5 w-5" /> },
                        { key: "Plano Médio (Busto)", label: "Plano Médio (Busto)", icon: <User className="h-5 w-5" /> },
                        { key: "Plano Americano", label: "Plano Americano", icon: <SquareUserRound className="h-5 w-5" /> },
                        { key: "Corpo Inteiro", label: "Corpo Inteiro", icon: <PersonStanding className="h-5 w-5" /> }
                      ].map((pl) => (
                        <div key={pl.key} className="group relative">
                          <button
                            type="button"
                            aria-pressed={plano === pl.key ? "true" : "false"}
                            onClick={() => setPlano(plano === pl.key ? "" : pl.key)}
                            className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                              plano === pl.key ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            {pl.icon}
                            <span className="font-medium text-sm">{pl.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. SEÇÃO MARCA E ESTILO (data-tour="form-sec-marca_estilo")         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-tour="form-sec-marca_estilo">
        <div
          data-state={openSections.marca_estilo ? "open" : "closed"}
          data-slot="collapsible"
          className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
        >
          <button
            type="button"
            onClick={() => toggleSection("marca_estilo")}
            aria-expanded={openSections.marca_estilo}
            data-state={openSections.marca_estilo ? "open" : "closed"}
            data-slot="collapsible-trigger"
            className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
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
            <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
              <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                {/* 2.1 Identidade da Marca */}
                <div data-field-id="brand_identity_images" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3" data-image-field-id="brand_identity_images">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                        <span>Identidade da Marca</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Identidade da Marca"
                            onClick={() =>
                              setActiveModalInfo({
                                title: "Identidade da Marca",
                                text: "Envie logos, manuais ou peças da marca. No campo de texto ao lado, informe o que a IA deve aproveitar (ex: cores, estilo do logotipo, fontes ou elementos gráficos)."
                              })
                            }
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(255, 213, 0)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </label>
                    </div>

                    <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                      {brandImages.map((item, idx) => (
                        <div key={item.id} className="flex flex-col gap-2">
                          <div className="group flex items-center gap-2">
                            <div className="relative shrink-0">
                              <img
                                alt={`imagem ${idx + 1}`}
                                className="h-12 w-12 rounded-lg object-contain bg-zinc-900/80 p-1 border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                src={item.url}
                              />
                              <button
                                type="button"
                                aria-label="Remover imagem"
                                onClick={() => setBrandImages((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                              >
                                ×
                              </button>
                              <button
                                type="button"
                                aria-label="Recortar imagem"
                                onClick={() => setShowPhotoAdjustModal(true)}
                                className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                              >
                                <Crop className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <input
                              placeholder="O que aproveitar? Ex: Cores, logo, estilo, tipografia..."
                              value={item.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBrandImages((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, desc: val } : it))
                                );
                              }}
                              className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors"
                              type="text"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-col gap-1">
                        <div
                          onClick={() => fileInputBrandRef.current?.click()}
                          className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] py-2 cursor-pointer"
                        >
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                          >
                            <span className="text-base leading-none">+</span>
                            <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                          </button>
                        </div>
                      </div>

                      <input
                        ref={fileInputBrandRef}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        multiple
                        className="hidden"
                        type="file"
                        onChange={(e) => handleUploadGeneric(e, setBrandImages)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2.2 Nicho / Projeto */}
                <div data-field-id="nicho_projeto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="nicho_projeto" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>
                        O que voce esta criando? Para qual nicho?<span className="ml-1 text-red-400">*</span>
                      </span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações O que voce esta criando? Para qual nicho?"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Nicho e Objetivo do Projeto",
                              text: "Descreva o segmento, público-alvo e contexto da arte. Ex: 'Campanha de matrículas para academia premium', 'Post de autoridade jurídica para advogado tributarista'."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div className="group relative">
                      <input
                        id="nicho_projeto"
                        value={nichoProjeto}
                        onChange={(e) => setNichoProjeto(e.target.value)}
                        placeholder="Ex: Campanha para escritorio de advocacia, Coach fitness..."
                        className="w-full rounded-2xl pb-glass-input px-4 py-3 pr-9 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        type="text"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEditor({
                            id: "nicho_projeto",
                            title: "O que você está criando? Para qual nicho?",
                            value: nichoProjeto
                          })
                        }
                        className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 cursor-pointer"
                        title="Expandir editor"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2.3 Estilo Visual (23 Estilos em Grid 3 Cols) */}
                <div data-field-id="estilo_visual" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Estilo Visual</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Estilo Visual"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Estilo Visual",
                              text: "Escolha a estética fotográfica e artística. Cada estilo altera o tratamento de cor, iluminação, nível de contraste e estilo de pós-produção da cena."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div
                      role="group"
                      aria-label="Estilo Visual"
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}
                    >
                      {ESTILOS_VISUAIS_LIST.map((item) => (
                        <div key={item.label} className="group relative">
                          <button
                            type="button"
                            aria-pressed={estiloVisual === item.label ? "true" : "false"}
                            onClick={() => setEstiloVisual(estiloVisual === item.label ? "" : item.label)}
                            className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                              estiloVisual === item.label ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            <span className="font-medium text-sm">{item.label}</span>
                          </button>
                          <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                            <span className="relative inline-flex items-center">
                              <button
                                type="button"
                                data-field-info=""
                                title={item.desc}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalInfo({ title: `Estilo: ${item.label}`, text: item.desc });
                                }}
                                className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2.4 Inspirações de Estilo */}
                <div data-field-id="referencias_de_estilo" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3" data-image-field-id="referencias_de_estilo">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                        <span>Inspirações de Estilo</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Inspirações de Estilo"
                            onClick={() =>
                              setActiveModalInfo({
                                title: "Inspirações de Estilo",
                                text: "Envie imagens com iluminação, enquadramento ou pós-produção que você queira imitar na imagem final."
                              })
                            }
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(255, 213, 0)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </label>
                    </div>

                    <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                      {estiloImages.map((item, idx) => (
                        <div key={item.id} className="flex flex-col gap-2">
                          <div className="group flex items-center gap-2">
                            <div className="relative shrink-0">
                              <img
                                alt={`imagem ${idx + 1}`}
                                className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                                src={item.url}
                              />
                              <button
                                type="button"
                                aria-label="Remover imagem"
                                onClick={() => setEstiloImages((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                              >
                                ×
                              </button>
                              <button
                                type="button"
                                aria-label="Recortar imagem"
                                onClick={() => setShowPhotoAdjustModal(true)}
                                className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                              >
                                <Crop className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <input
                              placeholder="O que aproveitar desta inspiração? Ex: iluminação, cores, composição..."
                              value={item.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEstiloImages((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, desc: val } : it))
                                );
                              }}
                              className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors"
                              type="text"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-col gap-1">
                        <div
                          onClick={() => fileInputEstiloRef.current?.click()}
                          className="flex items-center rounded-lg border-2 border-dashed border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] transition-colors hover:border-[rgba(139,92,246,0.38)] py-2 cursor-pointer"
                        >
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch text-xs text-[#5c5278] transition-colors hover:text-[#9d94bb] cursor-pointer"
                          >
                            <span className="text-base leading-none">+</span>
                            <span className="truncate">Clique, arraste ou cole (Ctrl+V)</span>
                          </button>
                        </div>
                      </div>

                      <input
                        ref={fileInputEstiloRef}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        multiple
                        className="hidden"
                        type="file"
                        onChange={(e) => handleUploadGeneric(e, setEstiloImages)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. SEÇÃO CENÁRIO (data-tour="form-sec-cenario")                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-tour="form-sec-cenario">
        <div
          data-state={openSections.cenario ? "open" : "closed"}
          data-slot="collapsible"
          className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-black/40 hover:border-white/[0.08]"
        >
          <button
            type="button"
            onClick={() => toggleSection("cenario")}
            aria-expanded={openSections.cenario}
            data-state={openSections.cenario ? "open" : "closed"}
            data-slot="collapsible-trigger"
            className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
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
            <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
              <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                {/* 3.1 Descrição do Cenário */}
                <div data-field-id="scene_description" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="scene_description"
                      className="flex items-center gap-1.5 text-sm font-semibold text-white"
                    >
                      <span>Como voce imagina o cenario?</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Como voce imagina o cenario?"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Cenário e Ambiente",
                              text: "Descreva o fundo, localização geográfica, arquitetura, elementos de iluminação, profundidade de campo e atmosfera do local onde a imagem se passa."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div className="group relative">
                      <textarea
                        id="scene_description"
                        rows={3}
                        value={sceneDescription}
                        onChange={(e) => setSceneDescription(e.target.value)}
                        placeholder="Descreva o ambiente, local ou contexto da imagem..."
                        className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ height: "105.6px" }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEditor({
                            id: "scene_description",
                            title: "Como você imagina o cenário?",
                            value: sceneDescription
                          })
                        }
                        className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 cursor-pointer"
                        title="Expandir editor"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3.2 Inspirações de Ambiente */}
                <div data-field-id="referencias_de_ambiente" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  {ambienteImages.length === 0 ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                          <span>Inspirações de Ambiente</span>
                          <span className="relative inline-flex items-center">
                            <button
                              type="button"
                              data-field-info=""
                              aria-label="Mais informações Inspirações de Ambiente"
                              aria-expanded="false"
                              onClick={() =>
                                setActiveModalInfo({
                                  title: "Inspirações de Ambiente",
                                  text: "Envie referências visuais de ambientes, arquiteturas ou fundos que você quer que a IA reproduza ou se inspire para compor o cenário."
                                })
                              }
                              className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                              style={{ color: "rgb(255, 213, 0)" }}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </label>
                      </div>

                      <div
                        onClick={() => fileInputAmbienteRef.current?.click()}
                        className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                      >
                        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                          <span className="font-light text-[#5c5278] text-4xl">+</span>
                          <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 relative z-30 rounded-xl bg-[#0b0b0f] px-2 py-3 ring-1 ring-violet-500/40" data-image-field-id="referencias_de_ambiente">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                          <span>Inspirações de Ambiente</span>
                          <span className="relative inline-flex items-center">
                            <button
                              type="button"
                              data-field-info=""
                              aria-label="Mais informações Inspirações de Ambiente"
                              aria-expanded="false"
                              onClick={() =>
                                setActiveModalInfo({
                                  title: "Inspirações de Ambiente",
                                  text: "Envie referências visuais de ambientes, arquiteturas ou fundos que você quer que a IA reproduza ou se inspire para compor o cenário."
                                })
                              }
                              className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                              style={{ color: "rgb(255, 213, 0)" }}
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </label>
                      </div>

                      <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                        <div className="flex items-center justify-center w-full" role="group" aria-label="Gerenciar imagens — Inspirações de Ambiente">
                          <div className="relative flex flex-col bg-[#0b0b0f] w-full">
                            <div className="flex">
                              <div className="flex flex-col w-full">
                                <div className="py-3 px-2">
                                  <button
                                    type="button"
                                    onClick={() => fileInputAmbienteRef.current?.click()}
                                    className="sub-area-entra mb-3 w-full rounded-xl border border-dashed px-3 py-5 text-center text-xs transition-colors border-white/15 text-zinc-500 hover:border-violet-500/50 hover:bg-violet-500/[0.05] hover:text-violet-300 cursor-pointer"
                                    style={{ animationDelay: "0ms" }}
                                  >
                                    Clique ou arraste para trazer mais
                                  </button>
                                  <div className="space-y-2.5" data-testid="lista-de-imagens">
                                    {ambienteImages.map((img, idx) => (
                                      <div
                                        key={img.id || idx}
                                        draggable="true"
                                        className="sub-area-entra rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 transition-opacity"
                                        style={{ animationDelay: `${55 * (idx + 1)}ms` }}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-zinc-600" />
                                          <button
                                            type="button"
                                            aria-label={`Ampliar imagem ${idx + 1}`}
                                            title="Ampliar imagem"
                                            onClick={() => setPreviewModalImage(img.url)}
                                            className="relative shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
                                          >
                                            <img
                                              alt={`imagem ${idx + 1}`}
                                              className="h-14 w-14 rounded-lg border border-white/10 object-cover transition-colors hover:border-violet-500/60"
                                              src={img.url}
                                            />
                                            <span
                                              aria-hidden="true"
                                              className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white"
                                            >
                                              {idx + 1}
                                            </span>
                                          </button>
                                          <button
                                            type="button"
                                            aria-label={`Recortar imagem ${idx + 1}`}
                                            title="Recortar imagem"
                                            onClick={() => setCropModal({ url: img.url, target: "ambiente", index: idx })}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40 cursor-pointer"
                                          >
                                            <Crop className="h-3.5 w-3.5" />
                                          </button>
                                          <div className="flex-1" />
                                          <div className="flex shrink-0 items-center gap-1">
                                            <button
                                              type="button"
                                              aria-label={`Remover imagem ${idx + 1}`}
                                              title="Remover"
                                              onClick={() => setAmbienteImages((prev) => prev.filter((_, i) => i !== idx))}
                                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                        <textarea
                                          rows={2}
                                          placeholder="Como usar? Ex: Reproduzir fielmente, apenas inspiracao..."
                                          aria-label={`Descrição da imagem ${idx + 1}`}
                                          value={img.desc || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setAmbienteImages((prev) =>
                                              prev.map((item, i) => (i === idx ? { ...item, desc: val } : item))
                                            );
                                          }}
                                          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => showToast("Inspirações salvas!", "success")}
                                    className="sub-area-entra w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 mt-8 cursor-pointer"
                                    style={{ animationDelay: "110ms" }}
                                  >
                                    Concluir
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputAmbienteRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    multiple
                    className="hidden"
                    type="file"
                    onChange={(e) => handleUploadGeneric(e, setAmbienteImages)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. SEÇÃO TEXTO NA IMAGEM (data-tour="form-sec-texto_imagem")         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-tour="form-sec-texto_imagem">
        <div
          data-state={openSections.texto_imagem ? "open" : "closed"}
          data-slot="collapsible"
          className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
        >
          <button
            type="button"
            onClick={() => toggleSection("texto_imagem")}
            aria-expanded={openSections.texto_imagem}
            data-state={openSections.texto_imagem ? "open" : "closed"}
            data-slot="collapsible-trigger"
            className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
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
            <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
              <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                <div data-field-id="text_blocks" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-white">Textos da Imagem</label>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Textos da Imagem"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Textos da Imagem",
                              text: "Adicione e personalize blocos de tipografia na arte (H1, H2, Texto, Bullets ou Botão CTA). Você pode ajustar a posição exata (3x3), cor e peso visual de cada elemento."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                      <span className="text-[10px] text-[#5c5278] pb-ctrl-btn px-1.5 py-0.5 rounded">opcional</span>
                      <span className="ml-auto text-[10px] tabular-nums text-[#5c5278]">
                        {textBlocks.length}/8
                      </span>
                    </div>

                    {/* 5 Block Type Adder Buttons */}
                    <div role="group" aria-label="Tipos de bloco de texto" className="grid grid-cols-3 gap-2">
                      {/* 1. H1 */}
                      <button
                        type="button"
                        aria-label="Adicionar H1"
                        onClick={() => addTextBlock("H1")}
                        className={`group/card relative flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-center transition-all pb-ctrl-btn ${
                          countByType("H1") > 0 ? "pb-ctrl-active" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
                      >
                        {countByType("H1") > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2 ring-zinc-900 bg-violet-500/15 text-violet-300 border border-violet-500/30">
                            {countByType("H1")}
                          </span>
                        )}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all group-hover/card:scale-105 ${
                          countByType("H1") > 0
                            ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40"
                            : "bg-violet-500/[0.06] text-violet-400/60"
                        }`}>
                          <Heading1 className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-zinc-200">H1</span>
                          <span className="text-[10px] text-zinc-400">Título principal</span>
                        </span>
                        <Plus className="lucide lucide-plus absolute bottom-2 right-2 h-3 w-3 text-[#5c5278] opacity-0 transition-opacity group-hover/card:opacity-100" />
                      </button>

                      {/* 2. H2 */}
                      <button
                        type="button"
                        aria-label="Adicionar H2"
                        onClick={() => addTextBlock("H2")}
                        className={`group/card relative flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-center transition-all pb-ctrl-btn ${
                          countByType("H2") > 0 ? "pb-ctrl-active" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
                      >
                        {countByType("H2") > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2 ring-zinc-900 bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            {countByType("H2")}
                          </span>
                        )}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all group-hover/card:scale-105 ${
                          countByType("H2") > 0
                            ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/40"
                            : "bg-blue-500/[0.06] text-blue-400/60"
                        }`}>
                          <Heading2 className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-zinc-200">H2</span>
                          <span className="text-[10px] text-zinc-400">Subtítulo</span>
                        </span>
                        <Plus className="lucide lucide-plus absolute bottom-2 right-2 h-3 w-3 text-[#5c5278] opacity-0 transition-opacity group-hover/card:opacity-100" />
                      </button>

                      {/* 3. Texto */}
                      <button
                        type="button"
                        aria-label="Adicionar Texto"
                        onClick={() => addTextBlock("Texto")}
                        className={`group/card relative flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-center transition-all pb-ctrl-btn ${
                          countByType("Texto") > 0 ? "pb-ctrl-active" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
                      >
                        {countByType("Texto") > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2 ring-zinc-900 bg-zinc-500/15 text-zinc-200 border border-zinc-500/30">
                            {countByType("Texto")}
                          </span>
                        )}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all group-hover/card:scale-105 ${
                          countByType("Texto") > 0
                            ? "bg-zinc-500/20 text-zinc-200 ring-1 ring-zinc-400/40"
                            : "bg-zinc-500/[0.06] text-zinc-400/60"
                        }`}>
                          <AlignLeft className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-zinc-200">Texto</span>
                          <span className="text-[10px] text-zinc-400">Parágrafo curto</span>
                        </span>
                        <Plus className="lucide lucide-plus absolute bottom-2 right-2 h-3 w-3 text-[#5c5278] opacity-0 transition-opacity group-hover/card:opacity-100" />
                      </button>

                      {/* 4. Bullets */}
                      <button
                        type="button"
                        aria-label="Adicionar Bullets"
                        onClick={() => addTextBlock("Bullets")}
                        className={`group/card relative flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-center transition-all pb-ctrl-btn ${
                          countByType("Bullets") > 0 ? "pb-ctrl-active" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
                      >
                        {countByType("Bullets") > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2 ring-zinc-900 bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {countByType("Bullets")}
                          </span>
                        )}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all group-hover/card:scale-105 ${
                          countByType("Bullets") > 0
                            ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40"
                            : "bg-amber-500/[0.06] text-amber-400/60"
                        }`}>
                          <List className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-zinc-200">Bullets</span>
                          <span className="text-[10px] text-zinc-400">Lista de tópicos</span>
                        </span>
                        <Plus className="lucide lucide-plus absolute bottom-2 right-2 h-3 w-3 text-[#5c5278] opacity-0 transition-opacity group-hover/card:opacity-100" />
                      </button>

                      {/* 5. CTA */}
                      <button
                        type="button"
                        aria-label="Adicionar CTA"
                        onClick={() => addTextBlock("CTA")}
                        className={`group/card relative flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-center transition-all pb-ctrl-btn ${
                          countByType("CTA") > 0 ? "pb-ctrl-active" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
                      >
                        {countByType("CTA") > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2 ring-zinc-900 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {countByType("CTA")}
                          </span>
                        )}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all group-hover/card:scale-105 ${
                          countByType("CTA") > 0
                            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                            : "bg-emerald-500/[0.06] text-emerald-400/60"
                        }`}>
                          <MousePointerClick className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-zinc-200">CTA</span>
                          <span className="text-[10px] text-zinc-400">Texto do botão</span>
                        </span>
                        <Plus className="lucide lucide-plus absolute bottom-2 right-2 h-3 w-3 text-[#5c5278] opacity-0 transition-opacity group-hover/card:opacity-100" />
                      </button>
                    </div>

                    {/* Explanatory Notice */}
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                      <p className="text-[11px] leading-relaxed text-zinc-300">
                        Adicione blocos de texto para guiar a composição da imagem. Cada bloco vira uma camada de tipografia com hierarquia ajustável pelo peso visual.
                      </p>
                    </div>

                    {/* List of Added Text Blocks */}
                    <div className="flex flex-col gap-2">
                      {textBlocks.map((blk, idx) => {
                        const isViolet = blk.type === "H1";
                        const isBlue = blk.type === "H2";
                        const isZinc = blk.type === "Texto";
                        const isAmber = blk.type === "Bullets";
                        const isEmerald = blk.type === "CTA";

                        const borderLeftClass = isViolet
                          ? "border-l-violet-400/60"
                          : isBlue
                          ? "border-l-blue-400/60"
                          : isZinc
                          ? "border-l-zinc-400/60"
                          : isAmber
                          ? "border-l-amber-400/60"
                          : "border-l-emerald-400/60";

                        const bgGradientClass = isViolet
                          ? "from-violet-500/[0.05]"
                          : isBlue
                          ? "from-blue-500/[0.05]"
                          : isZinc
                          ? "from-zinc-500/[0.05]"
                          : isAmber
                          ? "from-amber-500/[0.05]"
                          : "from-emerald-500/[0.05]";

                        const badgeClass = isViolet
                          ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                          : isBlue
                          ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          : isZinc
                          ? "bg-zinc-500/15 text-zinc-200 border-zinc-500/30"
                          : isAmber
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

                        const weightBarActiveBg = isViolet
                          ? "bg-violet-400"
                          : isBlue
                          ? "bg-blue-400"
                          : isZinc
                          ? "bg-zinc-300"
                          : isAmber
                          ? "bg-amber-400"
                          : "bg-emerald-400";

                        const activePosBg = isViolet
                          ? "bg-violet-400 text-zinc-900 font-bold"
                          : isBlue
                          ? "bg-blue-400 text-zinc-900 font-bold"
                          : isZinc
                          ? "bg-zinc-300 text-zinc-900 font-bold"
                          : isAmber
                          ? "bg-amber-400 text-zinc-900 font-bold"
                          : "bg-emerald-400 text-zinc-900 font-bold";

                        const subtitle =
                          blk.type === "H1"
                            ? "Título principal"
                            : blk.type === "H2"
                            ? "Subtítulo"
                            : blk.type === "Texto"
                            ? "Parágrafo curto"
                            : blk.type === "Bullets"
                            ? "Lista de tópicos"
                            : "Texto do botão";

                        const placeholder =
                          blk.type === "H1"
                            ? "Título principal..."
                            : blk.type === "H2"
                            ? "Subtítulo..."
                            : blk.type === "Texto"
                            ? "Texto..."
                            : blk.type === "Bullets"
                            ? "Um item por linha..."
                            : "Texto do botão...";

                        return (
                          <div
                            key={blk.id}
                            className={`group/blk relative overflow-hidden rounded-xl border border-white/[0.06] border-l-2 transition-all ${borderLeftClass} bg-gradient-to-r ${bgGradientClass} via-transparent to-transparent hover:border-white/[0.12]`}
                          >
                            {/* Block Header */}
                            <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                              <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
                                {blk.type}
                              </span>
                              <span className="text-[10px] text-[#5c5278]">{subtitle}</span>
                              <span className="ml-auto text-[9px] tabular-nums text-[#5c5278]">
                                #{idx + 1}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  title="Mover para cima"
                                  onClick={() => moveTextBlock(idx, "up")}
                                  className="rounded p-1 max-lg:p-2 text-[#5c5278] transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5c5278] cursor-pointer"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === textBlocks.length - 1}
                                  title="Mover para baixo"
                                  onClick={() => moveTextBlock(idx, "down")}
                                  className="rounded p-1 max-lg:p-2 text-[#5c5278] transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5c5278] cursor-pointer"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Remover"
                                  onClick={() => removeTextBlock(blk.id)}
                                  className="rounded p-1 max-lg:p-2 text-[#5c5278] transition-all hover:bg-red-500/15 hover:text-red-400 cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Block Input Content */}
                            <div className="px-3 pb-2">
                              {blk.type === "Bullets" ? (
                                <textarea
                                  placeholder={placeholder}
                                  rows={2}
                                  value={blk.text}
                                  onChange={(e) => updateTextBlock(blk.id, { text: e.target.value })}
                                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-100 placeholder-[#5c5278] outline-none"
                                />
                              ) : (
                                <input
                                  placeholder={placeholder}
                                  value={blk.text}
                                  onChange={(e) => updateTextBlock(blk.id, { text: e.target.value })}
                                  className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none"
                                  type="text"
                                />
                              )}
                            </div>

                            {/* Block Footer: Peso, Cor & Posicao */}
                            <div className="flex flex-col gap-2 border-t border-white/[0.04] px-3 py-2">
                              <div className="flex items-center gap-2.5">
                                <span className="text-[9px] font-semibold uppercase tracking-widest text-[#5c5278]">
                                  Peso
                                </span>
                                <div
                                  role="group"
                                  aria-label={`Peso visual ${blk.weight} de 5`}
                                  className="flex items-end gap-[3px] max-lg:gap-1.5"
                                  title={`Peso visual: ${blk.weight}/5`}
                                >
                                  {[1, 2, 3, 4, 5].map((w) => (
                                    <button
                                      key={w}
                                      type="button"
                                      aria-label={`Definir peso ${w}`}
                                      onClick={() => updateTextBlock(blk.id, { weight: w })}
                                      className={`w-[4px] max-lg:w-2.5 rounded-full transition-all hover:opacity-80 max-lg:py-1.5 max-lg:box-content cursor-pointer ${
                                        w <= blk.weight ? weightBarActiveBg : "bg-white/10"
                                      }`}
                                      style={{ height: `${8 + w * 2}px` }}
                                    />
                                  ))}
                                </div>
                                <span className="ml-auto text-[9px] tabular-nums text-[#5c5278]">
                                  {blk.weight}/5
                                </span>
                                <span className="ml-1 text-[#5c5278]/50" title="Use as setas acima para reordenar" aria-hidden="true">
                                  <GripVertical className="h-3.5 w-3.5" />
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Color Picker */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[#5c5278]">
                                    Cor
                                  </span>
                                  <label className="relative flex h-6 w-6 max-lg:h-8 max-lg:w-8 shrink-0 cursor-pointer items-center justify-center rounded-md ring-1 ring-white/10 overflow-hidden hover:ring-white/30 transition-all">
                                    <input
                                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                      type="color"
                                      value={blk.color.startsWith("#") && blk.color.length === 7 ? blk.color : "#ffffff"}
                                      onChange={(e) => updateTextBlock(blk.id, { color: e.target.value })}
                                    />
                                    <span className="h-full w-full rounded-md" style={{ backgroundColor: blk.color }} />
                                  </label>
                                  <div className="flex items-center rounded-md bg-black/40 px-1.5 py-0.5 border border-white/10 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30">
                                    <span className="text-[9px] text-[#5c5278] font-mono select-none">#</span>
                                    <input
                                      type="text"
                                      maxLength={6}
                                      value={blk.color.replace("#", "")}
                                      onChange={(e) => {
                                        const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                                        updateTextBlock(blk.id, { color: `#${clean}` });
                                      }}
                                      placeholder="FFFFFF"
                                      className="w-14 bg-transparent text-[10px] font-mono uppercase text-zinc-200 outline-none"
                                    />
                                  </div>
                                </div>

                                <span className="h-3 w-px bg-white/10" />

                                {/* 3x3 Position Grid */}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[#5c5278]">
                                    Posicao
                                  </span>
                                  <div className="grid grid-cols-3 gap-px max-lg:gap-1" role="group" aria-label="Posicao do texto">
                                    {POSITIONS_GRID.map((p) => {
                                      const isCurrent = blk.position === p.pos;
                                      return (
                                        <button
                                          key={p.pos}
                                          type="button"
                                          title={p.pos}
                                          onClick={() => updateTextBlock(blk.id, { position: p.pos })}
                                          className={`flex h-4 w-4 max-lg:h-8 max-lg:w-8 items-center justify-center rounded-sm text-[7px] max-lg:text-sm transition-all cursor-pointer ${
                                            isCurrent ? "bg-violet-400 text-zinc-900 font-bold" : "bg-white/5 text-[#5c5278] hover:bg-white/10"
                                          }`}
                                        >
                                          {p.arrow}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. SEÇÃO AJUSTES (data-tour="form-sec-ajustes")                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-tour="form-sec-ajustes">
        <div
          data-state={openSections.ajustes ? "open" : "closed"}
          data-slot="collapsible"
          className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
        >
          <button
            type="button"
            onClick={() => toggleSection("ajustes")}
            aria-expanded={openSections.ajustes}
            data-state={openSections.ajustes ? "open" : "closed"}
            data-slot="collapsible-trigger"
            className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
              <Settings className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
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
            <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
              <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                {/* 5.1 Paleta de Cores */}
                <div data-field-id="color_palette" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-white">Paleta de Cores</label>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Paleta de Cores"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Paleta de Cores",
                              text: "Defina as 3 cores estruturais da sua arte: Cor do Ambiente (tonalidade de fundo), Luz Complementar (luz secundária de recorte) e Cor de Destaque (pontos focais e brilhos)."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">
                        Opcional
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {/* Cor 1: Cor do Ambiente */}
                      <div className="relative flex-1 min-w-0">
                        <div
                          onClick={() => setActiveColorPicker({
                            id: "ambiente",
                            title: "Cor do Ambiente",
                            color: corAmbiente,
                            onSelect: (c) => setCorAmbiente(c)
                          })}
                          className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 select-none cursor-pointer ${
                            activeAmbiente
                              ? "border-white/25 shadow-lg ring-1 ring-white/10"
                              : "border-white/10 opacity-50"
                          }`}
                        >
                          <div
                            className="relative h-16 w-full flex items-center justify-center transition-all duration-300"
                            style={{ backgroundColor: corAmbiente }}
                          >
                            {activeAmbiente && (
                              <div
                                className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.133)",
                                  border: "1px solid rgba(255, 255, 255, 0.267)"
                                }}
                              >
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between px-3 py-2 transition-colors duration-300"
                            style={{ backgroundColor: "rgba(26, 26, 46, 0.867)" }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider truncate transition-colors duration-300"
                                style={{ color: "rgba(255, 255, 255, 0.733)" }}
                              >
                                Cor do Ambiente
                              </span>
                              <div
                                className="flex items-center gap-0.5 rounded bg-black/40 px-1.5 py-0.5 border border-white/10 focus-within:border-violet-400"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] text-zinc-400 font-mono select-none">#</span>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={corAmbiente.replace("#", "")}
                                  onChange={(e) => {
                                    const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                                    setCorAmbiente(`#${clean}`);
                                    if (!activeAmbiente && clean) setActiveAmbiente(true);
                                  }}
                                  className="w-14 bg-transparent text-xs font-mono uppercase text-white outline-none"
                                  placeholder="000000"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAmbiente(!activeAmbiente);
                              }}
                              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer"
                              title={activeAmbiente ? "Desativar cor" : "Ativar cor"}
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.133)",
                                border: "1px solid rgba(255, 255, 255, 0.2)"
                              }}
                            >
                              <X className="h-2.5 w-2.5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Cor 2: Luz Complementar */}
                      <div className="relative flex-1 min-w-0">
                        <div
                          onClick={() => setActiveColorPicker({
                            id: "luz",
                            title: "Luz Complementar",
                            color: luzComplementar,
                            onSelect: (c) => setLuzComplementar(c)
                          })}
                          className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 select-none cursor-pointer ${
                            activeLuz
                              ? "border-white/25 shadow-lg ring-1 ring-white/10"
                              : "border-white/10 opacity-50"
                          }`}
                        >
                          <div
                            className="relative h-16 w-full flex items-center justify-center transition-all duration-300"
                            style={{ backgroundColor: luzComplementar }}
                          >
                            {activeLuz && (
                              <div
                                className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(17, 17, 17, 0.133)",
                                  border: "1px solid rgba(17, 17, 17, 0.267)"
                                }}
                              >
                                <Check className="h-3 w-3 text-zinc-900" />
                              </div>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between px-3 py-2 transition-colors duration-300"
                            style={{ backgroundColor: "rgba(226, 226, 226, 0.867)" }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider truncate transition-colors duration-300"
                                style={{ color: "rgba(17, 17, 17, 0.733)" }}
                              >
                                Luz Complementar
                              </span>
                              <div
                                className="flex items-center gap-0.5 rounded bg-black/10 px-1.5 py-0.5 border border-black/15 focus-within:border-violet-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] text-zinc-600 font-mono select-none">#</span>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={luzComplementar.replace("#", "")}
                                  onChange={(e) => {
                                    const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                                    setLuzComplementar(`#${clean}`);
                                    if (!activeLuz && clean) setActiveLuz(true);
                                  }}
                                  className="w-14 bg-transparent text-xs font-mono uppercase text-zinc-900 outline-none"
                                  placeholder="E2E2E2"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveLuz(!activeLuz);
                              }}
                              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer"
                              title={activeLuz ? "Desativar cor" : "Ativar cor"}
                              style={{
                                backgroundColor: "rgba(17, 17, 17, 0.133)",
                                border: "1px solid rgba(17, 17, 17, 0.2)"
                              }}
                            >
                              <X className="h-2.5 w-2.5 text-zinc-900" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Cor 3: Cor de Destaque */}
                      <div className="relative flex-1 min-w-0">
                        <div
                          onClick={() => setActiveColorPicker({
                            id: "destaque",
                            title: "Cor de Destaque",
                            color: corDestaque,
                            onSelect: (c) => setCorDestaque(c)
                          })}
                          className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 select-none cursor-pointer ${
                            activeDestaque
                              ? "border-white/25 shadow-lg ring-1 ring-white/10"
                              : "border-white/10 opacity-50"
                          }`}
                        >
                          <div
                            className="relative h-16 w-full flex items-center justify-center transition-all duration-300"
                            style={{ backgroundColor: corDestaque }}
                          >
                            {activeDestaque && (
                              <div
                                className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.133)",
                                  border: "1px solid rgba(255, 255, 255, 0.267)"
                                }}
                              >
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between px-3 py-2 transition-colors duration-300"
                            style={{ backgroundColor: "rgba(124, 58, 237, 0.867)" }}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider truncate transition-colors duration-300"
                                style={{ color: "rgba(255, 255, 255, 0.733)" }}
                              >
                                Cor de Destaque
                              </span>
                              <div
                                className="flex items-center gap-0.5 rounded bg-black/40 px-1.5 py-0.5 border border-white/10 focus-within:border-violet-400"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] text-zinc-400 font-mono select-none">#</span>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={corDestaque.replace("#", "")}
                                  onChange={(e) => {
                                    const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                                    setCorDestaque(`#${clean}`);
                                    if (!activeDestaque && clean) setActiveDestaque(true);
                                  }}
                                  className="w-14 bg-transparent text-xs font-mono uppercase text-white outline-none"
                                  placeholder="7C3AED"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDestaque(!activeDestaque);
                              }}
                              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer"
                              title={activeDestaque ? "Desativar cor" : "Ativar cor"}
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.133)",
                                border: "1px solid rgba(255, 255, 255, 0.2)"
                              }}
                            >
                              <X className="h-2.5 w-2.5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5.2 Elementos Flutuantes */}
                <div data-field-id="elementos_flutuantes" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="elementos_flutuantes" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                        <span>Elementos Flutuantes</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Elementos Flutuantes"
                            onClick={() =>
                              setActiveModalInfo({
                                title: "Elementos Flutuantes",
                                text: "Gera partículas, faíscas, confetes, moedas, folhas ou ícones do nicho flutuando na cena para dar sensação tridimensional de profundidade."
                              })
                            }
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(255, 213, 0)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setElementosFlutuantes(!elementosFlutuantes)}
                        className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer ${
                          elementosFlutuantes ? "bg-[#ffd500]" : "bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            elementosFlutuantes ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {elementosFlutuantes && (
                      <input
                        type="text"
                        value={elementosFlutuantesText}
                        onChange={(e) => setElementosFlutuantesText(e.target.value)}
                        placeholder="Ex: Notas de 100 dólares, partículas douradas... (opcional)"
                        className="w-full rounded-xl pb-glass-input px-3 py-2 text-xs text-white placeholder-[#5c5278] outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* 5.3 Prompt Adicional */}
                <div data-field-id="prompt_adicional" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="prompt_adicional" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Prompt Adicional</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Prompt Adicional"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Prompt Adicional",
                              text: "Adicione instruções extras personalizadas que devem ser mescladas ao prompt mestre gerado pelo Órion Pro."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div className="group relative">
                      <textarea
                        id="prompt_adicional"
                        rows={3}
                        value={promptAdicional}
                        onChange={(e) => setPromptAdicional(e.target.value)}
                        placeholder="Adicione detalhes extras ao prompt automático"
                        className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ height: "105.6px" }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEditor({
                            id: "prompt_adicional",
                            title: "Prompt Adicional",
                            value: promptAdicional
                          })
                        }
                        className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 cursor-pointer"
                        title="Expandir editor"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 6. SEÇÃO CONFIGURAÇÕES (data-tour="form-sec-configuracoes")          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div data-tour="form-sec-configuracoes">
        <div
          data-state={openSections.configuracoes ? "open" : "closed"}
          data-slot="collapsible"
          className="group/step relative overflow-hidden rounded-2xl border border-white/[0.04] transition-colors duration-200 bg-white/[0.015] hover:border-white/[0.08]"
        >
          <button
            type="button"
            onClick={() => toggleSection("configuracoes")}
            aria-expanded={openSections.configuracoes}
            data-state={openSections.configuracoes ? "open" : "closed"}
            data-slot="collapsible-trigger"
            className="flex w-full items-center gap-3 px-2 py-3 lg:px-4 lg:py-3.5 text-left select-none cursor-pointer transition-colors duration-200 hover:bg-white/[0.025] outline-none focus-visible:bg-white/[0.03]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] transition-colors">
              <SlidersHorizontal className="h-[18px] w-[18px] text-zinc-400 transition-colors" />
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
            <div data-state="open" data-slot="collapsible-content" className="overflow-hidden">
              <div className="flex flex-col px-2 pb-5 pt-2 lg:px-4 lg:pb-6 lg:pt-3 gap-6 lg:gap-12">
                {/* 6.1 Dimensões */}
                <div data-field-id="dimensions" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm">Dimensões</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Dimensões"
                            onClick={() =>
                              setActiveModalInfo({
                                title: "Dimensões e Proporção",
                                text: "Escolha a proporção de tela adequada: Stories (9:16 vertical), Feed Vertical (4:5 padrão Instagram), Feed (1:1 quadrado) ou Cinema (16:9 widescreen)."
                              })
                            }
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(255, 213, 0)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
                      {/* Left: Button options */}
                      <div role="group" aria-label="Dimensões" className="flex flex-col gap-1.5">
                        {[
                          { key: "9:16", label: "Stories" },
                          { key: "4:5", label: "Feed Vertical" },
                          { key: "1:1", label: "Feed" },
                          { key: "16:9", label: "Cinema" }
                        ].map((dim) => {
                          const isSel = dimensao === dim.key;
                          return (
                            <button
                              key={dim.key}
                              type="button"
                              aria-pressed={isSel}
                              onClick={() => setDimensao(dim.key)}
                              className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                                isSel ? "pb-ctrl-active" : ""
                              }`}
                              style={isSel ? { boxShadow: "rgba(139, 92, 246, 0.2) 0px 0px 14px" } : {}}
                            >
                              <span
                                className={`text-[12px] font-semibold transition-colors ${
                                  isSel ? "text-white" : "text-zinc-200 group-hover:text-white"
                                }`}
                              >
                                {dim.label}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                                  isSel ? "text-white/80" : "text-zinc-300"
                                }`}
                                style={{
                                  backgroundColor: isSel
                                    ? "rgba(139, 92, 246, 0.133)"
                                    : "rgba(255, 255, 255, 0.04)"
                                }}
                              >
                                {dim.key}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: Aspect ratio visual preview */}
                      <div
                        aria-hidden="true"
                        className="hidden sm:flex h-[170px] w-[120px] items-center justify-center rounded-xl pb-ctrl-btn p-2"
                      >
                        <div
                          className="rounded-md transition-all duration-300"
                          style={{
                            width: "92%",
                            maxHeight: "92%",
                            aspectRatio:
                              dimensao === "9:16"
                                ? "9 / 16"
                                : dimensao === "4:5"
                                ? "4 / 5"
                                : dimensao === "1:1"
                                ? "1 / 1"
                                : "16 / 9",
                            background:
                              "linear-gradient(rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.063))",
                            border: "1.5px solid rgba(139, 92, 246, 0.333)",
                            boxShadow: "rgba(139, 92, 246, 0.133) 0px 0px 16px inset"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6.2 Qualidade de Renderização */}
                <div data-field-id="quality" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm">Qualidade de Renderização</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Qualidade de Renderização"
                            onClick={() =>
                              setActiveModalInfo({
                                title: "Qualidade de Renderização",
                                text: "Resolução e amostragem do modelo neural: 1K (geração ultra-rápida), 2K (alta definição balanceada para mídias sociais) e 4K (máximo detalhe para impressões e outdoors)."
                              })
                            }
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(255, 213, 0)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                        <div className="ml-auto text-[10px] tabular-nums text-white/60">
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: "rgba(139, 92, 246, 0.12)",
                                color: "rgb(139, 92, 246)",
                                border: "1px solid rgba(139, 92, 246, 0.2)"
                              }}
                            >
                              {resInfo.label}
                            </span>
                            <span className="text-[10px] tabular-nums text-zinc-500">
                              {resInfo.res}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      role="group"
                      aria-label="Qualidade de Renderização"
                      className="grid gap-2"
                      style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}
                    >
                      {[
                        { key: "1K", speed: "Rápido" },
                        { key: "2K", speed: "Médio" },
                        { key: "4K", speed: "Lento" }
                      ].map((q) => {
                        const isSel = quality === q.key;
                        return (
                          <button
                            key={q.key}
                            type="button"
                            aria-pressed={isSel}
                            onClick={() => {
                              setQuality(q.key as any);
                              store.updateConfig({ qualidade: q.key as any, resolucao: q.key as any });
                            }}
                            className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex-col gap-1.5 py-3"
                            style={
                              isSel
                                ? {
                                    background:
                                      "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                                    border: "1px solid transparent",
                                    boxShadow:
                                      "rgba(139, 92, 246, 0.19) 0px 0px 12px, rgba(139, 92, 246, 0.07) 0px 0px 28px"
                                  }
                                : {
                                    background:
                                      "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                                    border: "1px solid transparent"
                                  }
                            }
                          >
                            <span
                              className="text-base font-bold leading-none tracking-tight transition-colors"
                              style={{ color: isSel ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                            >
                              {q.key}
                            </span>
                            <span
                              className="font-medium uppercase tracking-[0.05em] transition-colors text-[10px]"
                              style={{ color: isSel ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}
                            >
                              {q.speed}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 6.3 Modo Criativo */}
                <div data-field-id="sobriedade_criatividade" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Modo Criativo</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Modo Criativo"
                          onClick={() =>
                            setActiveModalInfo({
                              title: "Modo Criativo",
                              text: "Rígido: adere com precisão matemática aos prompts e referências; Criativo: equilíbrio inteligente com iluminação e composição artística; Builder: autonomia total do gerador neural para propor composições inovadoras."
                            })
                          }
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(255, 213, 0)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>

                    <div
                      role="group"
                      aria-label="Modo Criativo"
                      className="grid gap-2.5"
                      style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}
                    >
                      {[
                        { key: "Rígido" },
                        { key: "Criativo" },
                        { key: "Builder" }
                      ].map((item) => (
                        <div key={item.key} className="group relative">
                          <button
                            type="button"
                            aria-pressed={modoCriativo === item.key}
                            onClick={() => setModoCriativo(item.key as any)}
                            className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                              modoCriativo === item.key ? "pb-ctrl-active text-white" : "text-zinc-200"
                            }`}
                          >
                            <span className="font-medium text-sm">{item.key}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BOTÃO CONSTRUIR ÓRION PRO (1 CRÉDITO) ── */}
          <div className="pt-4 pb-2">
            <button
              type="button"
              disabled={isGenerating || isGeneratingPrompt}
              onClick={() => {
                store.updateConfig({
                  qualidade: quality,
                  resolucao: quality,
                  dimensao: dimensao,
                  poseDescription: subjectDescription,
                  composicaoCustom: subjectDescription,
                  promptCenario: sceneDescription,
                  cenario: sceneDescription,
                  additionalPrompt: promptAdicional,
                  nicho: nichoProjeto,
                  estiloVisual: estiloVisual,
                  positioning: subjectPosition === "left" ? "Esquerda" : subjectPosition === "right" ? "Direita" : "Centro",
                  composicao: plano,
                  elementosFlutuantes: elementosFlutuantes,
                  floatingElementsCustom: elementosFlutuantesText,
                  cores: {
                    ...store.cores,
                    ambiente: corAmbiente,
                    complementar: luzComplementar,
                    acento: corDestaque,
                    recorte: corDestaque,
                    paleta: [corAmbiente, luzComplementar, corDestaque].filter(Boolean)
                  },
                  logoBase64: brandImages[0]?.url || store.logoBase64 || "",
                  logosList: brandImages.map(b => b.url),
                  useLogo: brandImages.length > 0 || !!store.logoBase64,
                  referenciasEstilo: estiloImages.map(e => ({
                    id: e.id,
                    data: e.url,
                    url: e.url,
                    nome: e.desc || "Estilo",
                    descricao: e.desc || "Estilo",
                    peso: 1
                  })),
                  cenarioBase64: ambienteImages[0]?.url || store.cenarioBase64 || "",
                  cenariosBase64List: ambienteImages.map(a => a.url),
                  useEnvRef: ambienteImages.length > 0 || !!store.cenarioBase64,
                  camadasTexto: textBlocks.map((b) => ({
                    id: b.id,
                    conteudo: b.text,
                    funcao: b.type as any,
                    tipoBloco: b.type,
                    pesoVisual: b.weight,
                    cor: b.color,
                    posicao: b.position
                  })),
                  activeAgentSlug: "orion-pro"
                } as any);
                if (generatePromptOnly) {
                  handleGenerateMasterPrompt?.();
                } else {
                  generatePremiumImage?.();
                }
              }}
              className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
              style={{
                background: generatePromptOnly
                  ? "linear-gradient(to right, #eab308, #ca8a04)"
                  : "linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))"
              }}
            >
              <span>
                {isGenerating || isGeneratingPrompt
                  ? "Construindo..."
                  : generatePromptOnly
                  ? "Gerar Prompt Mestre"
                  : "Construir"}
              </span>
              <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">
                {generatePromptOnly ? "0 créditos" : "1 crédito"}
              </span>
            </button>

            <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-[#9d94bb]">
              <button
                type="button"
                onClick={() => {
                  store.createProject();
                  showToast("Configurações duplicadas em uma nova aba!", "success");
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
                  showToast("Formulário resetado com sucesso!", "info");
                }}
                title="Resetar todas as configurações do formulário"
                className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Resetar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL EXPANDIR EDITOR (Maximize2)                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {expandedEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <h2 className="text-sm font-semibold text-white">{expandedEditor.title}</h2>
              <button
                type="button"
                onClick={() => setExpandedEditor(null)}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-5">
              <textarea
                placeholder={
                  expandedEditor.id === "subject_description"
                    ? "Descreva roupas, pose, acessorios, acao..."
                    : expandedEditor.id === "scene_description"
                    ? "Descreva detalhes da iluminação, elementos ao fundo, clima, texturas..."
                    : expandedEditor.id === "nicho_projeto"
                    ? "Ex: Médica dermatologista premium, Hamburgueria artesanal..."
                    : "Instruções extras para a composição da arte..."
                }
                rows={12}
                value={expandedEditor.value}
                onChange={(e) => {
                  const val = e.target.value;
                  setExpandedEditor((prev) => (prev ? { ...prev, value: val } : null));
                  if (expandedEditor.id === "subject_description") setSubjectDescription(val);
                  if (expandedEditor.id === "nicho_projeto") setNichoProjeto(val);
                  if (expandedEditor.id === "scene_description") setSceneDescription(val);
                  if (expandedEditor.id === "prompt_adicional") setPromptAdicional(val);
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    setExpandedEditor(null);
                    showToast("Texto salvo com sucesso!", "success");
                  }
                }}
                className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors resize-y min-h-[200px] focus:border-violet-500/30"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
              <span className="text-xs text-zinc-500">Ctrl+Enter para salvar</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedEditor(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedEditor(null);
                    showToast("Texto salvo com sucesso!", "success");
                  }}
                  className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                  style={{ backgroundColor: "rgb(168, 85, 247)" }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL RECORTAR IMAGEM (Cropper Oficial)                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {cropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-medium text-zinc-200">Recortar imagem</h3>
              <button
                type="button"
                onClick={() => setCropModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-black/40 p-4 flex items-center justify-center overflow-hidden">
              <div
                className="relative max-h-[60vh] max-w-full flex items-center justify-center overflow-hidden rounded-xl border border-white/10"
                style={{
                  aspectRatio:
                    cropRatio === "1:1"
                      ? "1 / 1"
                      : cropRatio === "4:3"
                      ? "4 / 3"
                      : cropRatio === "16:9"
                      ? "16 / 9"
                      : cropRatio === "9:16"
                      ? "9 / 16"
                      : "auto"
                }}
              >
                <img
                  src={cropModal.url}
                  alt="picture"
                  className="max-h-[55vh] max-w-full object-contain transition-transform duration-200"
                  style={{
                    transform: `rotate(${cropRotation}deg) scaleX(${cropFlipH ? -1 : 1}) scaleY(${cropFlipV ? -1 : 1})`
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-zinc-500 mr-1" />
                {(["Livre", "1:1", "4:3", "16:9", "9:16"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCropRatio(r)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      cropRatio === r
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCropRotation((prev) => (prev - 90 + 360) % 360)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                  title="Girar 90° esquerda"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                  title="Girar 90° direita"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCropFlipH((prev) => !prev)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 transition-colors cursor-pointer ${
                    cropFlipH ? "text-violet-400 ring-1 ring-violet-500" : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                  title="Espelhar horizontal"
                >
                  <FlipHorizontal className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCropFlipV((prev) => !prev)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 transition-colors cursor-pointer ${
                    cropFlipV ? "text-violet-400 ring-1 ring-violet-500" : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                  title="Espelhar vertical"
                >
                  <FlipVertical className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCropModal(null)}
                  className="px-4 py-1.5 rounded-lg text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCropModal(null);
                    showToast("Recorte confirmado com sucesso!", "success");
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirmar recorte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL AMPLIAR IMAGEM (Preview)                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 shadow-2xl cursor-default"
          >
            <img src={previewModalImage} alt="Preview" className="max-h-[80vh] max-w-[85vw] object-contain" />
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COLOR PICKER POPOVER (react-colorful style)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeColorPicker && (
        <div className="fixed inset-0 z-[10050]" onClick={() => setActiveColorPicker(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[10060] flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-3 shadow-2xl shadow-black/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[240px]"
          >
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-semibold text-white">{activeColorPicker.title}</span>
              <button
                type="button"
                onClick={() => setActiveColorPicker(null)}
                className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800 px-3 py-2">
              <span className="text-xs text-zinc-500 font-mono select-none">#</span>
              <input
                maxLength={6}
                spellCheck="false"
                placeholder="FFFFFF"
                className="flex-1 bg-transparent text-sm font-mono text-white outline-none uppercase"
                type="text"
                value={activeColorPicker.color.replace("#", "")}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                  const fullHex = `#${clean}`;
                  setActiveColorPicker((prev) => (prev ? { ...prev, color: fullHex } : null));
                  if (clean.length === 3 || clean.length === 6) {
                    activeColorPicker.onSelect(fullHex);
                  }
                }}
              />
              <label
                className="relative h-6 w-6 rounded-md border border-white/20 shrink-0 cursor-pointer overflow-hidden hover:scale-105 transition-transform"
                title="Abrir seletor de cores"
              >
                <input
                  type="color"
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  value={activeColorPicker.color.length === 7 ? activeColorPicker.color : "#ffffff"}
                  onChange={(e) => {
                    setActiveColorPicker((prev) => (prev ? { ...prev, color: e.target.value } : null));
                    activeColorPicker.onSelect(e.target.value);
                  }}
                />
                <div
                  className="h-full w-full"
                  style={{ backgroundColor: activeColorPicker.color }}
                />
              </label>
            </div>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {[
                "#7C3AED", "#A855F7", "#EF4444", "#EAB308", "#22C55E", "#3B82F6",
                "#EC4899", "#F97316", "#14B8A6", "#FFFFFF", "#94A3B8", "#000000"
              ].map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => {
                    setActiveColorPicker((prev) => (prev ? { ...prev, color: sw } : null));
                    activeColorPicker.onSelect(sw);
                  }}
                  className="h-6 w-full rounded-md border border-white/20 hover:scale-105 transition-transform cursor-pointer"
                  style={{ backgroundColor: sw }}
                  title={sw}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveColorPicker(null)}
              className="mt-1 w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Aplicar Cor
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL INFO EXPLICATIVO (Mais informações)                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ffd500]">
                <Info className="h-5 w-5" />
                <h3 className="text-base font-semibold text-white">{activeModalInfo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{activeModalInfo.text}</p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL AJUSTAR FOTOS E CENA                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showPhotoAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-violet-400" />
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
              Aqui você pode gerenciar, recortar e organizar as fotos de sujeito e referências de cena enviadas para o Órion Pro.
            </p>
            <div className="grid grid-cols-4 gap-3 py-2">
              {(store.sujeitosBase64List || []).map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl border border-white/10 overflow-hidden group">
                  <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveSujeito(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => fileInputSujeitoRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 cursor-pointer"
              >
                + Adicionar mais fotos
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoAdjustModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#ffd500] text-black hover:opacity-90 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
