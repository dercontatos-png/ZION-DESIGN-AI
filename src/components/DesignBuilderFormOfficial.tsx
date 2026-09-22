import React, { useState, useRef, useEffect } from "react";
import { useProjectStore } from "../store/useProjectStore";
import {
  Info, SlidersHorizontal, Crop, X, Check, Copy, RotateCcw,
  Heading1, Heading2, AlignLeft, AlignCenter, AlignRight,
  List, MousePointerClick, GripVertical, ChevronUp, ChevronDown,
  Maximize2, CircleUser, User, SquareUserRound, Trash2
} from "lucide-react";

interface DesignBuilderFormOfficialProps {
  onOpenCropModal?: (imgUrl: string, onDone: (croppedUrl: string) => void) => void;
  showToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
  isGenerating?: boolean;
  onGenerate: () => void;
  activePalcoMode?: string;
  agentColWidth?: number;
}

export const DesignBuilderFormOfficial: React.FC<DesignBuilderFormOfficialProps> = ({
  onOpenCropModal,
  showToast,
  isGenerating = false,
  onGenerate,
  activePalcoMode,
  agentColWidth = 420
}) => {
  const store = useProjectStore();

  // Floating submit visibility on scroll (IntersectionObserver matching official FloatingSubmitOnScroll)
  const staticSubmitRef = useRef<HTMLDivElement>(null);
  const [isStaticSubmitVisible, setIsStaticSubmitVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const el = staticSubmitRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStaticSubmitVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;
    const handleScroll = () => {
      setHasScrolled(aside.scrollTop > 60);
    };
    aside.addEventListener("scroll", handleScroll, { passive: true });
    return () => aside.removeEventListener("scroll", handleScroll);
  }, []);

  // Hidden file inputs
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const ambienteInputRef = useRef<HTMLInputElement>(null);
  const estiloInputRef = useRef<HTMLInputElement>(null);

  // Subject manager panel toggle & zoom modal
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Global Ctrl+V paste support for photos
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const b64 = reader.result as string;
              const current = store.sujeitosBase64List || [];
              const next = [...current, b64];
              store.setSujeitoBase64(b64);
              store.setSujeitoBase64List(next);
              showToast("Foto do sujeito colada via Ctrl+V!", "success");
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [store, showToast]);

  // Local state for fields not directly in basic store config
  const [quantidade, setQuantidade] = useState<number>(() => store.quantidade || 1);
  const [genero, setGenero] = useState<"Masculino" | "Feminino" | "">(
    () => (store.gender === "Feminino" ? "Feminino" : "Masculino")
  );

  // Expanded Textarea Editor Modal state (Radix-style)
  const [expandedEditor, setExpandedEditor] = useState<{
    isOpen: boolean;
    fieldId: string;
    title: string;
    placeholder: string;
    value: string;
    onSave: (val: string) => void;
  }>({
    isOpen: false,
    fieldId: "",
    title: "",
    placeholder: "",
    value: "",
    onSave: () => {}
  });
  const [tempEditorValue, setTempEditorValue] = useState("");

  // Close expanded editor on Escape
  useEffect(() => {
    if (!expandedEditor.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpandedEditor((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedEditor.isOpen]);
  const asideRef = useRef<HTMLElement>(null);
  const [subjectPos, setSubjectPos] = useState<"Esquerda" | "Centro" | "Direita">(
    () => (store.positioning as any) || "Centro"
  );
  const [nicho, setNicho] = useState(() => store.nicho || "");
  const [textBlocks, setTextBlocks] = useState<Array<{
    id: string;
    type: "H1" | "H2" | "Texto" | "Bullets" | "CTA";
    label: string;
    sub: string;
    text: string;
    weight: number;
    posicao?: "Esquerda" | "Centro" | "Direita";
  }>>(() => {
    if (store.camadasTexto && store.camadasTexto.length > 0) {
      return store.camadasTexto.map((c) => ({
        id: c.id,
        type: (c.tipoBloco || (c.funcao?.includes("Headline") ? "H1" : c.funcao?.includes("CTA") ? "CTA" : c.funcao?.includes("Bullets") ? "Bullets" : c.funcao?.includes("Sub") ? "H2" : "Texto")) as any,
        label: c.funcao || "Texto",
        sub: "",
        text: c.conteudo,
        weight: c.pesoVisual || (c.funcao?.includes("Headline") ? 5 : c.funcao?.includes("Sub") ? 3 : 2),
        posicao: (c.posicao as any) || (store.typographyPosition as any) || "Centro"
      }));
    }
    return [];
  });

  const [degradeTexto, setDegradeTexto] = useState(() => Boolean(store.degradeLeitura));
  const [posicaoTexto, setPosicaoTexto] = useState<"Esquerda" | "Centro" | "Direita">(
    () => (store.typographyPosition as any) || "Centro"
  );

  // Color palette state (Opcional por padrao, 1:1 com a tela oficial de referencia)
  const [ambientColorActive, setAmbientColorActive] = useState(() => Boolean(store.cores?.ambiente));
  const [ambientColor, setAmbientColor] = useState(() => store.cores?.ambiente || "#1a1a2e");
  const [compLightActive, setCompLightActive] = useState(() => Boolean(store.cores?.complementar));
  const [compLight, setCompLight] = useState(() => store.cores?.complementar || "#e2e2e2");
  const [accentColorActive, setAccentColorActive] = useState(() => Boolean(store.cores?.recorte));
  const [accentColor, setAccentColor] = useState(() => store.cores?.recorte || "#7C3AED");

  // Style composition state
  const [plano, setPlano] = useState<"close-up" | "medium" | "american">(
    () => ((store.composicao?.toLowerCase().includes("close") ? "close-up" : store.composicao?.toLowerCase().includes("american") ? "american" : "medium") as any)
  );
  const [elementosFlutuantesActive, setElementosFlutuantesActive] = useState(
    () => Boolean(store.elementosFlutuantes || store.floatingElementsCustom)
  );
  const [elementosFlutuantesText, setElementosFlutuantesText] = useState(
    () => store.floatingElementsCustom || store.elementosFlutuantesTexto || ""
  );
  const [estiloVisual, setEstiloVisual] = useState(
    () => store.estiloVisual || store.estilosVisuais?.[0] || "Ultra Realista"
  );
  const [sobriedade, setSobriedade] = useState(() => store.nivelCriativo ?? 50);
  const [usarBlur, setUsarBlur] = useState(() => Boolean(store.enableBlur));

  // Ambience refs with descriptions
  const [ambienteRefs, setAmbienteRefs] = useState<Array<{ id: string; url: string; desc: string }>>(() => {
    const list = store.cenariosBase64List || (store.cenarioBase64 ? [store.cenarioBase64] : []);
    return list.map((url, i) => ({ id: `env_${i}`, url, desc: "" }));
  });

  // Style refs with descriptions
  const [estiloRefs, setEstiloRefs] = useState<Array<{ id: string; url: string; desc: string }>>(() => {
    return (store.referenciasEstilo || []).map((r) => ({ id: r.id, url: r.url || r.data, desc: r.descricao || "" }));
  });

  // Guard against initial mount overwriting persisted store
  const isMountedRef = useRef(false);
  const isSyncingFromStoreRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // Sincronizar estados locais caso o projeto ativo mude ou seja carregado
  useEffect(() => {
    if (!store.activeProjectId) return;
    isSyncingFromStoreRef.current = true;
    setSubjectPos((store.positioning as any) || "Centro");
    setNicho(store.nicho || "");
    setQuantidade(store.quantidade || 1);
    setGenero((store.gender === "Feminino" ? "Feminino" : "Masculino") as any);
    setDegradeTexto(Boolean(store.degradeLeitura));
    setPosicaoTexto((store.typographyPosition as any) || "Centro");
    setUsarBlur(Boolean(store.enableBlur));
    setSobriedade(store.nivelCriativo ?? 50);
    setElementosFlutuantesActive(Boolean(store.elementosFlutuantes || store.floatingElementsCustom));
    setElementosFlutuantesText(store.floatingElementsCustom || store.elementosFlutuantesTexto || "");
    setEstiloVisual(store.estiloVisual || store.estilosVisuais?.[0] || "Ultra Realista");

    if (store.camadasTexto && store.camadasTexto.length > 0) {
      setTextBlocks(store.camadasTexto.map((c) => ({
        id: c.id,
        type: (c.tipoBloco || (c.funcao?.includes("Headline") ? "H1" : c.funcao?.includes("CTA") ? "CTA" : c.funcao?.includes("Bullets") ? "Bullets" : c.funcao?.includes("Sub") ? "H2" : "Texto")) as any,
        label: c.funcao || "Texto",
        sub: "",
        text: c.conteudo,
        weight: c.pesoVisual || (c.funcao?.includes("Headline") ? 5 : c.funcao?.includes("Sub") ? 3 : 2),
        posicao: (c.posicao as any) || (store.typographyPosition as any) || "Centro"
      })));
    } else {
      setTextBlocks([]);
    }
    if (store.cenariosBase64List || store.cenarioBase64) {
      const list = store.cenariosBase64List || (store.cenarioBase64 ? [store.cenarioBase64] : []);
      setAmbienteRefs(list.map((url, i) => ({ id: `env_${i}`, url, desc: "" })));
    } else {
      setAmbienteRefs([]);
    }
    if (store.referenciasEstilo) {
      setEstiloRefs(store.referenciasEstilo.map((r) => ({ id: r.id, url: r.url || r.data, desc: r.descricao || "" })));
    } else {
      setEstiloRefs([]);
    }
    if (store.cores) {
      setAmbientColorActive(Boolean(store.cores.ambiente));
      if (store.cores.ambiente) setAmbientColor(store.cores.ambiente);
      setCompLightActive(Boolean(store.cores.complementar));
      if (store.cores.complementar) setCompLight(store.cores.complementar);
      setAccentColorActive(Boolean(store.cores.recorte));
      if (store.cores.recorte) setAccentColor(store.cores.recorte);
    }
    store.updateConfig({ activeAgentSlug: "design-builder1-2" } as any);
    const timer = setTimeout(() => {
      isSyncingFromStoreRef.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [
    store.activeProjectId,
    store.nicho,
    store.camadasTexto,
    store.cores,
    store.positioning,
    store.gender,
    store.composicao,
    store.degradeLeitura,
    store.typographyPosition,
    store.elementosFlutuantes,
    store.floatingElementsCustom,
    store.estiloVisual,
    store.nivelCriativo,
    store.enableBlur,
    store.cenariosBase64List,
    store.referenciasEstilo
  ]);

  // Sincronização contínua com useProjectStore para garantir que todos os campos vão para a IA (Apenas após montagem e sem loop)
  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    const camadas = textBlocks
      .filter(b => b.text && b.text.trim().length > 0)
      .map(b => ({
        id: b.id,
        conteudo: b.text.trim(),
        funcao: (b.type === "H1" ? "Headline Principal" : b.type === "H2" ? "Subheadline Secundário" : b.type === "CTA" ? "CTA Botão" : "Corpo Descrição") as any,
        tipoBloco: b.type,
        pesoVisual: b.weight,
        posicao: b.posicao || posicaoTexto
      }));
    if (camadas.length > 0) {
      const anyLeft = camadas.some(c => c.posicao === "Esquerda");
      const anyRight = camadas.some(c => c.posicao === "Direita");
      const effectivePos = anyLeft ? "Esquerda" : anyRight ? "Direita" : posicaoTexto;
      store.updateConfig({ camadasTexto: camadas, typographyPosition: effectivePos });
    }
  }, [textBlocks, posicaoTexto]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    if (ambienteRefs.length > 0) {
      const urls = ambienteRefs.map(r => r.url);
      store.updateConfig({
        cenariosBase64List: urls,
        cenarioBase64: urls[0] || "",
        useEnvRef: urls.length > 0
      });
    }
  }, [ambienteRefs]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    if (estiloRefs.length > 0) {
      const estilos = estiloRefs.map(r => ({
        id: r.id,
        url: r.url,
        data: r.url,
        descricao: r.desc
      }));
      store.updateConfig({
        referenciasEstilo: estilos
      });
    }
  }, [estiloRefs]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    store.updateConfig({
      cores: {
        ambiente: ambientColorActive ? ambientColor : "",
        complementar: compLightActive ? compLight : "",
        recorte: accentColorActive ? accentColor : "",
        paleta: [ambientColor, compLight, accentColor].filter(Boolean)
      }
    });
  }, [ambientColorActive, ambientColor, compLightActive, compLight, accentColorActive, accentColor]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    store.updateConfig({ degradeLeitura: degradeTexto });
  }, [degradeTexto]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    store.updateConfig({ typographyPosition: posicaoTexto });
  }, [posicaoTexto]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    store.updateConfig({ nivelCriativo: sobriedade });
  }, [sobriedade]);

  useEffect(() => {
    if (!isMountedRef.current || isSyncingFromStoreRef.current) return;
    store.updateConfig({
      elementosFlutuantes: elementosFlutuantesActive,
      floatingElementsMode: elementosFlutuantesActive ? "custom" : "off",
      floatingElementsCustom: elementosFlutuantesActive ? elementosFlutuantesText : ""
    });
  }, [elementosFlutuantesActive, elementosFlutuantesText]);

  // Funcao centralizada para resetar todos os estados do formulario
  const handleResetAll = () => {
    store.resetConfig();
    setSubjectPos("Centro");
    setNicho("");
    setTextBlocks([]);
    setDegradeTexto(false);
    setPosicaoTexto("Centro");
    setAmbientColorActive(false);
    setCompLightActive(false);
    setAccentColorActive(false);
    setPlano("medium");
    setElementosFlutuantesActive(false);
    setElementosFlutuantesText("");
    setEstiloVisual("Ultra Realista");
    setSobriedade(50);
    setUsarBlur(false);
    setAmbienteRefs([]);
    setEstiloRefs([]);
    showToast("Formulário resetado com sucesso!", "info");
  };

  // Subject photos list
  const sujeitoList = (store.sujeitosBase64List && store.sujeitosBase64List.length > 0)
    ? store.sujeitosBase64List
    : store.sujeitoBase64 ? [store.sujeitoBase64] : [];

  // Handle subject photo upload
  const handleSubjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        const current = store.sujeitosBase64List || [];
        const next = [...current, b64];
        store.setSujeitoBase64(b64);
        store.setSujeitoBase64List(next);
        showToast("Foto do sujeito adicionada!", "success");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSubject = (idx: number) => {
    const current = [...(store.sujeitosBase64List || [])];
    current.splice(idx, 1);
    store.setSujeitoBase64List(current);
    if (current.length > 0) {
      store.setSujeitoBase64(current[0]);
    } else {
      store.setSujeitoBase64("");
    }
  };

  const handleAmbienteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setAmbienteRefs(prev => [...prev, { id: `amb-${Date.now()}-${Math.random()}`, url: b64, desc: "" }]);
        showToast("Inspiração de ambiente adicionada!", "success");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEstiloUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setEstiloRefs(prev => [...prev, { id: `est-${Date.now()}-${Math.random()}`, url: b64, desc: "" }]);
        showToast("Inspiração de estilo adicionada!", "success");
      };
      reader.readAsDataURL(file);
    });
  };

  // Text block helpers
  const addTextBlock = (type: "H1" | "H2" | "Texto" | "Bullets" | "CTA") => {
    if (textBlocks.length >= 8) {
      showToast("Limite de 8 blocos atingido", "warning");
      return;
    }
    const metaMap = {
      H1: { label: "H1", sub: "Título principal", weight: 5 },
      H2: { label: "H2", sub: "Subtítulo", weight: 3 },
      Texto: { label: "Texto", sub: "Parágrafo curto", weight: 2 },
      Bullets: { label: "Bullets", sub: "Lista de tópicos", weight: 2 },
      CTA: { label: "CTA", sub: "Texto do botão", weight: 4 },
    };
    const m = metaMap[type];
    setTextBlocks(prev => [
      ...prev,
      { id: `${Date.now()}`, type, label: m.label, sub: m.sub, text: "", weight: m.weight }
    ]);
  };

  const moveTextBlock = (index: number, dir: -1 | 1) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= textBlocks.length) return;
    const next = [...textBlocks];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setTextBlocks(next);
  };

  const removeTextBlock = (id: string) => {
    setTextBlocks(prev => prev.filter(b => b.id !== id));
  };

  const updateTextBlock = (id: string, updates: Partial<{ text: string; weight: number; posicao: "Esquerda" | "Centro" | "Direita" }>) => {
    setTextBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const allStyles = [
    "Clássico", "Formal", "Elegante", "Sexy", "Institucional",
    "Tecnológico", "Glassmorphism", "Interface UI", "Minimalista",
    "Lúdico", "Cartoon", "Infoproduto", "Jovial", "Gamer",
    "Retrato Profissional", "Ultra Realista", "Glow"
  ];

  return (
    <aside
      ref={asideRef}
      data-aside-form-col=""
      data-tour="form"
      className={`agent-form-col relative z-10 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/5 scrollbar-hide px-1.5 py-3 lg:p-6 transition-[filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full lg:h-full lg:w-[var(--agent-form-col-w,420px)] lg:min-w-[280px] lg:max-w-[700px] lg:flex-shrink-0 ${
        activePalcoMode && activePalcoMode !== "builder" ? "hidden" : "flex max-lg:order-last max-lg:min-h-0 lg:flex"
      }`}
      style={{
        "--agent-form-col-w": `${agentColWidth || 420}px`,
        "--agent-color": "#7C3AED",
      } as any}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
        className="flex flex-col gap-4 lg:gap-5 pb-16"
      >
        {/* ── 1. SUJEITO / PRODUTO ── */}
        <div data-tour="form-sec-subject">
          <div className="flex flex-col gap-6 lg:gap-12">
            
            {/* Fotos do Sujeito / Produto */}
            {isSubjectManagerOpen ? (
              /* Modo Gerenciar Imagens — Fotos do Sujeito / Produto */
              <div data-field-id="fotos_do_sujeito_produto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                <div className="flex flex-col gap-2 relative z-30 rounded-xl bg-[#0b0b0f] px-2 py-3 ring-1 ring-violet-500/40" data-image-field-id="fotos_do_sujeito_produto">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                      <span>Fotos do Sujeito / Produto</span>
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Fotos do Sujeito / Produto"
                          className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                          style={{ color: "rgb(124, 58, 237)" }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </label>
                  </div>

                  <input
                    ref={subjectInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    multiple
                    className="hidden"
                    type="file"
                    onChange={handleSubjectUpload}
                  />

                  <div className="flex items-center justify-center w-full" role="group" aria-label="Gerenciar imagens — Fotos do Sujeito / Produto">
                    <div className="relative flex flex-col bg-[#0b0b0f] w-full">
                      <div className="flex">
                        <div className="flex flex-col w-full">
                          <div className="py-3 px-2">
                            <button
                              type="button"
                              onClick={() => subjectInputRef.current?.click()}
                              className="sub-area-entra mb-3 w-full rounded-xl border border-dashed px-3 py-5 text-center text-xs transition-colors border-white/15 text-zinc-500 hover:border-violet-500/50 hover:bg-violet-500/[0.05] hover:text-violet-300 cursor-pointer"
                              style={{ animationDelay: "0ms" }}
                            >
                              {sujeitoList.length === 0
                                ? "Escolha ao lado, ou clique e arraste sua foto aqui"
                                : "Clique ou arraste para trazer mais"}
                            </button>

                            <div className="space-y-2.5" data-testid="lista-de-imagens">
                              {sujeitoList.map((imgUrl, i) => (
                                <div
                                  key={i}
                                  draggable="true"
                                  className="sub-area-entra rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 transition-opacity"
                                  style={{ animationDelay: `${(i + 1) * 55}ms` }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-zinc-600" />
                                    <button
                                      type="button"
                                      aria-label={`Ampliar imagem ${i + 1}`}
                                      title="Ampliar imagem"
                                      onClick={() => setPreviewZoomImage(imgUrl)}
                                      className="relative shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
                                    >
                                      <img
                                        alt={`imagem ${i + 1}`}
                                        className="h-14 w-14 rounded-lg border border-white/10 object-cover transition-colors hover:border-violet-500/60"
                                        src={imgUrl}
                                      />
                                      <span
                                        aria-hidden="true"
                                        className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white"
                                      >
                                        {i + 1}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      aria-label={`Recortar imagem ${i + 1}`}
                                      title="Recortar imagem"
                                      onClick={() => onOpenCropModal && onOpenCropModal(imgUrl, (cUrl) => {
                                        const next = [...sujeitoList];
                                        next[i] = cUrl;
                                        store.setSujeitoBase64List(next);
                                        store.setSujeitoBase64(next[0]);
                                      })}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-40 cursor-pointer"
                                    >
                                      <Crop className="h-3.5 w-3.5" />
                                    </button>

                                    <div className="flex-1"></div>

                                    <div className="flex shrink-0 items-center gap-1">
                                      <button
                                        type="button"
                                        aria-label={`Remover imagem ${i + 1}`}
                                        title="Remover"
                                        onClick={() => handleRemoveSubject(i)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsSubjectManagerOpen(false)}
                              className="sub-area-entra w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 mt-8 cursor-pointer"
                              style={{ animationDelay: `${(sujeitoList.length + 1) * 55}ms` }}
                            >
                              Concluir
                            </button>
                          </div>
                        </div>
                      </div>
                      <input accept="image/*" multiple className="hidden" type="file" />
                    </div>
                  </div>
                </div>
              </div>
            ) : sujeitoList.length === 0 ? (
              /* Modo Vazio — Fotos do Sujeito / Produto (h-40 grande) */
              <div data-field-id="fotos_do_sujeito_produto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                <div className="flex flex-col gap-3" data-image-field-id="fotos_do_sujeito_produto">
                  <div className="flex flex-col gap-2" data-image-field-id="fotos_do_sujeito_produto">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                        <span>Fotos do Sujeito / Produto</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Fotos do Sujeito / Produto"
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(124, 58, 237)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </label>
                    </div>

                    <div tabIndex={-1} className="relative flex flex-col outline-none gap-2">
                      <div
                        onClick={() => subjectInputRef.current?.click()}
                        className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all flex-col gap-1.5 h-40 border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                      >
                        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                          <span className="font-light text-[#5c5278] text-4xl">+</span>
                          <span className="truncate text-xs text-[#5c5278]">Clique, arraste ou cole (Ctrl+V)</span>
                        </div>
                      </div>
                    </div>

                    <input
                      ref={subjectInputRef}
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      multiple
                      className="hidden"
                      type="file"
                      onChange={handleSubjectUpload}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Modo Compacto com Fotos e Botão Ajustar Fotos e Cena */
              <div data-field-id="fotos_do_sujeito_produto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
                <div className="flex flex-col gap-3" data-image-field-id="fotos_do_sujeito_produto">
                  <div className="flex flex-col gap-2" data-image-field-id="fotos_do_sujeito_produto">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                        <span>Fotos do Sujeito / Produto</span>
                        <span className="relative inline-flex items-center">
                          <button
                            type="button"
                            data-field-info=""
                            aria-label="Mais informações Fotos do Sujeito / Produto"
                            className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                            style={{ color: "rgb(124, 58, 237)" }}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </label>
                    </div>

                    <div tabIndex={-1} className="relative flex flex-col outline-none gap-2">
                      <div className="flex flex-wrap gap-2">
                        {sujeitoList.map((imgUrl, i) => (
                          <div key={i} className="relative group">
                            <img
                              alt={`imagem ${i + 1}`}
                              className="h-20 w-20 rounded-lg object-cover cursor-pointer transition-all"
                              src={imgUrl}
                              style={{ border: "1px solid rgba(139, 92, 246, 0.22)" }}
                              onClick={() => onOpenCropModal && onOpenCropModal(imgUrl, (cUrl) => {
                                const next = [...sujeitoList];
                                next[i] = cUrl;
                                store.setSujeitoBase64List(next);
                                store.setSujeitoBase64(next[0]);
                              })}
                            />
                            <button
                              type="button"
                              aria-label={`Remover imagem ${i + 1}`}
                              title={`Remover imagem ${i + 1}`}
                              onClick={() => handleRemoveSubject(i)}
                              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                            >
                              <span aria-hidden="true">×</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Recortar imagem ${i + 1}`}
                              title={`Recortar imagem ${i + 1}`}
                              onClick={() => onOpenCropModal && onOpenCropModal(imgUrl, (cUrl) => {
                                const next = [...sujeitoList];
                                next[i] = cUrl;
                                store.setSujeitoBase64List(next);
                                store.setSujeitoBase64(next[0]);
                              })}
                              className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                            >
                              <Crop className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add Button */}
                        <div
                          onClick={() => subjectInputRef.current?.click()}
                          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all border-[rgba(139,92,246,0.20)] bg-[rgba(139,92,246,0.03)] hover:border-[rgba(139,92,246,0.38)] hover:bg-[rgba(139,92,246,0.07)]"
                        >
                          <span className="text-2xl font-light leading-none text-[#5c5278]">+</span>
                        </div>
                      </div>
                    </div>

                    <input
                      ref={subjectInputRef}
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      multiple
                      className="hidden"
                      type="file"
                      onChange={handleSubjectUpload}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSubjectManagerOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Ajustar fotos e cena</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantidade */}
            <div data-field-id="quantidade" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Quantidade</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Quantidade"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div role="group" aria-label="Quantidade" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(5, minmax(0px, 1fr))" }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isSelected = quantidade === n;
                    return (
                      <div key={n} className="group relative">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            const next = isSelected ? 0 : n;
                            setQuantidade(next);
                            store.updateConfig({ quantidade: next as any });
                          }}
                          className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                            isSelected ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <span className="font-medium text-sm">{n}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gênero */}
            <div data-field-id="genero" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Gênero</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Gênero"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div role="group" aria-label="Gênero" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(2, minmax(0px, 1fr))" }}>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={genero === "Masculino"}
                      onClick={() => {
                        const next = genero === "Masculino" ? "" : "Masculino";
                        setGenero(next as any);
                        store.updateConfig({ gender: next as any });
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        genero === "Masculino" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mars h-5 w-5" aria-hidden="true">
                        <path d="M16 3h5v5"></path>
                        <path d="m21 3-6.75 6.75"></path>
                        <circle cx="10" cy="14" r="6"></circle>
                      </svg>
                      <span className="font-medium text-sm">Masculino</span>
                    </button>
                  </div>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={genero === "Feminino"}
                      onClick={() => {
                        const next = genero === "Feminino" ? "" : "Feminino";
                        setGenero(next as any);
                        store.updateConfig({ gender: next as any });
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        genero === "Feminino" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-venus h-5 w-5" aria-hidden="true">
                        <path d="M12 15v7"></path>
                        <path d="M9 19h6"></path>
                        <circle cx="12" cy="9" r="6"></circle>
                      </svg>
                      <span className="font-medium text-sm">Feminino</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição do Sujeito */}
            <div data-field-id="subject_description" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-2">
                <label htmlFor="subject_description" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Descrição do Sujeito</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Descrição do Sujeito"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div className="group relative">
                  <textarea
                    id="subject_description"
                    rows={2}
                    placeholder="Descreva a aparência, roupas, pose ou detalhes do produto..."
                    className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    value={store.poseDescription || ""}
                    onChange={(e) => store.updateConfig({ poseDescription: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTempEditorValue(store.poseDescription || "");
                      setExpandedEditor({
                        isOpen: true,
                        fieldId: "subject_description",
                        title: "Descrição do Sujeito",
                        placeholder: "Descreva a aparência, roupas, pose ou detalhes do produto...",
                        value: store.poseDescription || "",
                        onSave: (val) => store.updateConfig({ poseDescription: val })
                      });
                    }}
                    className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                    title="Expandir editor"
                    aria-haspopup="dialog"
                    aria-expanded={expandedEditor.isOpen && expandedEditor.fieldId === "subject_description"}
                    data-state={expandedEditor.isOpen && expandedEditor.fieldId === "subject_description" ? "open" : "closed"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Posição do Sujeito */}
            <div data-field-id="subject_position" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Posição do Sujeito</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Posição do Sujeito"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div role="group" aria-label="Posição do Sujeito" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={subjectPos === "Esquerda"}
                      onClick={() => {
                        const next = subjectPos === "Esquerda" ? ("" as any) : "Esquerda";
                        setSubjectPos(next);
                        store.updateConfig({ positioning: next });
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        subjectPos === "Esquerda" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-start h-5 w-5" aria-hidden="true"><path d="M21 5H3"></path><path d="M15 12H3"></path><path d="M17 19H3"></path></svg>
                      <span className="font-medium text-sm">Esquerda</span>
                    </button>
                  </div>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={subjectPos === "Centro"}
                      onClick={() => {
                        const next = subjectPos === "Centro" ? ("" as any) : "Centro";
                        setSubjectPos(next);
                        store.updateConfig({ positioning: next });
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        subjectPos === "Centro" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-center h-5 w-5" aria-hidden="true"><path d="M21 5H3"></path><path d="M17 12H7"></path><path d="M19 19H5"></path></svg>
                      <span className="font-medium text-sm">Centro</span>
                    </button>
                  </div>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={subjectPos === "Direita"}
                      onClick={() => {
                        const next = subjectPos === "Direita" ? ("" as any) : "Direita";
                        setSubjectPos(next);
                        store.updateConfig({ positioning: next });
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        subjectPos === "Direita" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-end h-5 w-5" aria-hidden="true"><path d="M21 5H3"></path><path d="M21 12H9"></path><path d="M21 19H7"></path></svg>
                      <span className="font-medium text-sm">Direita</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensões */}
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
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
                  <div role="group" aria-label="Dimensões" className="flex flex-col gap-1.5">
                    {[
                      { label: "Stories", ratio: "9:16" },
                      { label: "Feed Vertical", ratio: "4:5" },
                      { label: "Feed", ratio: "1:1" },
                      { label: "Cinema", ratio: "16:9" }
                    ].map((d) => {
                      const isSelected = (store.dimensao === d.ratio) || (!store.dimensao && d.ratio === "4:5");
                      return (
                        <button
                          key={d.ratio}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => store.updateConfig({ dimensao: d.ratio as any })}
                          className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-all pb-ctrl-btn cursor-pointer ${
                            isSelected ? "pb-ctrl-active text-white" : ""
                          }`}
                        >
                          <span className={`text-[12px] font-semibold transition-colors ${isSelected ? "text-white" : "text-zinc-200 group-hover:text-white"}`}>
                            {d.label}
                          </span>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tabular-nums tracking-wide transition-colors ${
                              isSelected ? "text-white/80" : "text-zinc-300"
                            }`}
                            style={{ backgroundColor: isSelected ? "rgba(139, 92, 246, 0.133)" : "rgba(255, 255, 255, 0.04)" }}
                          >
                            {d.ratio}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Dynamic aspect ratio preview */}
                  <div aria-hidden="true" className="hidden sm:flex h-[170px] w-[120px] items-center justify-center rounded-xl pb-ctrl-btn p-2">
                    <div
                      className="rounded-md transition-all duration-300"
                      style={{
                        width: "92%",
                        maxHeight: "92%",
                        aspectRatio: (store.dimensao || "4:5").replace(":", " / "),
                        background: "linear-gradient(rgba(139, 92, 246, 0.19), rgba(139, 92, 246, 0.063))",
                        border: "1.5px solid rgba(139, 92, 246, 0.333)",
                        boxShadow: "rgba(139, 92, 246, 0.133) 0px 0px 16px inset",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Qualidade de Renderização */}
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
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
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
                          {store.qualidade === "1K" ? "NORMAL" : store.qualidade === "2K" ? "ALTA" : "MÁXIMA"}
                        </span>
                        <span className="text-[10px] tabular-nums text-zinc-500">
                          {store.qualidade === "1K" ? "1024×1280" : store.qualidade === "2K" ? "2048×2560" : "3712×4608"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div role="group" aria-label="Qualidade de Renderização" className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                  {[
                    { q: "1K", speed: "Rápido" },
                    { q: "2K", speed: "Médio" },
                    { q: "4K", speed: "Lento" }
                  ].map(({ q, speed }) => {
                    const isSelected = (store.qualidade === q) || (!store.qualidade && q === "1K");
                    return (
                      <button
                        key={q}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => store.updateConfig({ qualidade: q as any, resolucao: q as any })}
                        className="group flex items-center justify-center rounded-xl px-2 transition-all duration-200 cursor-pointer flex-col gap-1.5 py-3"
                        style={
                          isSelected
                            ? {
                                background: "linear-gradient(rgba(30, 16, 70, 0.6), rgba(20, 10, 50, 0.7)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.447), rgba(139, 92, 246, 0.12) 50%, rgba(139, 92, 246, 0.28)) border-box border-box",
                                border: "1px solid transparent",
                                boxShadow: "rgba(139, 92, 246, 0.19) 0px 0px 12px, rgba(139, 92, 246, 0.07) 0px 0px 28px"
                              }
                            : {
                                background: "linear-gradient(rgba(16, 10, 40, 0.4), rgba(10, 7, 28, 0.5)) padding-box padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.027)) border-box border-box",
                                border: "1px solid transparent"
                              }
                        }
                      >
                        <span className="text-base font-bold leading-none tracking-tight transition-colors" style={{ color: isSelected ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                          {q}
                        </span>
                        <span className="font-medium uppercase tracking-[0.05em] transition-colors text-[10px]" style={{ color: isSelected ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)" }}>
                          {speed}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. CENÁRIO / CONTEXTO ── */}
        <div data-tour="form-sec-context">
          <div className="flex flex-col gap-6 lg:gap-12">
            
            {/* Nicho/Projeto */}
            <div data-field-id="nicho_projeto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label htmlFor="nicho_projeto" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Nicho/Projeto</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Nicho/Projeto"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div className="group relative">
                  <input
                    id="nicho_projeto"
                    placeholder="ex: Campanha Verão 2026"
                    className="w-full rounded-2xl pb-glass-input px-4 py-3 pr-9 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={nicho}
                    onChange={(e) => { setNicho(e.target.value); store.updateConfig({ nicho: e.target.value }); }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTempEditorValue(nicho || "");
                      setExpandedEditor({
                        isOpen: true,
                        fieldId: "nicho_projeto",
                        title: "Nicho/Projeto",
                        placeholder: "ex: Campanha Verão 2026",
                        value: nicho || "",
                        onSave: (val) => {
                          setNicho(val);
                          store.updateConfig({ nicho: val });
                        }
                      });
                    }}
                    className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                    title="Expandir editor"
                    aria-haspopup="dialog"
                    aria-expanded={expandedEditor.isOpen && expandedEditor.fieldId === "nicho_projeto"}
                    data-state={expandedEditor.isOpen && expandedEditor.fieldId === "nicho_projeto" ? "open" : "closed"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Cenário / Contexto */}
            <div data-field-id="scene_description" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-2">
                <label htmlFor="scene_description" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Cenário / Contexto</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Cenário / Contexto"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div className="group relative">
                  <textarea
                    id="scene_description"
                    rows={3}
                    placeholder="Descreva o ambiente, cenário ou contexto da imagem..."
                    className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    value={store.promptCenario || ""}
                    onChange={(e) => store.updateConfig({ promptCenario: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTempEditorValue(store.promptCenario || "");
                      setExpandedEditor({
                        isOpen: true,
                        fieldId: "scene_description",
                        title: "Cenário / Contexto",
                        placeholder: "Descreva o ambiente, cenário ou contexto da imagem...",
                        value: store.promptCenario || "",
                        onSave: (val) => store.updateConfig({ promptCenario: val })
                      });
                    }}
                    className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                    title="Expandir editor"
                    aria-haspopup="dialog"
                    aria-expanded={expandedEditor.isOpen && expandedEditor.fieldId === "scene_description"}
                    data-state={expandedEditor.isOpen && expandedEditor.fieldId === "scene_description" ? "open" : "closed"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Inspirações de Ambiente */}
            <div data-field-id="referencias_de_ambiente" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3" data-image-field-id="referencias_de_ambiente">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <label className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Inspirações de Ambiente</span>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Inspirações de Ambiente"
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>
                </div>

                <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                  <div className="flex flex-col gap-2">
                    {ambienteRefs.map((amb, idx) => (
                      <div key={amb.id} className="group flex items-center gap-2">
                        <div className="relative shrink-0">
                          <img
                            alt={`imagem ${idx + 1}`}
                            className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                            src={amb.url}
                          />
                          <button
                            type="button"
                            aria-label={`Remover imagem ${idx + 1}`}
                            title={`Remover imagem ${idx + 1}`}
                            onClick={() => setAmbienteRefs(prev => prev.filter(a => a.id !== amb.id))}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                          >
                            ×
                          </button>
                          <button
                            type="button"
                            aria-label={`Recortar imagem ${idx + 1}`}
                            title={`Recortar imagem ${idx + 1}`}
                            onClick={() => onOpenCropModal && onOpenCropModal(amb.url, (cropped) => {
                              setAmbienteRefs(prev => prev.map(a => a.id === amb.id ? { ...a, url: cropped } : a));
                            })}
                            className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                          >
                            <Crop className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <input
                          placeholder="Como usar? Ex: Reproduzir fielmente, apenas inspiracao..."
                          className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors"
                          type="text"
                          value={amb.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAmbienteRefs(prev => prev.map(a => a.id === amb.id ? { ...a, desc: val } : a));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      onClick={() => ambienteInputRef.current?.click()}
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
                    ref={ambienteInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    multiple
                    className="hidden"
                    type="file"
                    onChange={handleAmbienteUpload}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. TEXTOS DA IMAGEM ── */}
        <div data-tour="form-sec-step_1773771934403_6">
          <div className="flex flex-col gap-6 lg:gap-12">
            
            {/* Textos da Imagem */}
            <div data-field-id="text_blocks" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-white">Textos da Imagem</label>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Textos da Imagem"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                  <span className="text-[10px] text-[#5c5278] pb-ctrl-btn px-1.5 py-0.5 rounded">opcional</span>
                  <span className="ml-auto text-[10px] tabular-nums text-[#5c5278]">{textBlocks.length}/8</span>
                </div>

                <div role="group" aria-label="Tipos de bloco de texto" className="grid grid-cols-3 gap-2">
                  {([
                    { type: "H1", icon: Heading1, sub: "Título principal", colorBg: "bg-violet-500/20", colorText: "text-violet-300", colorBorder: "border-violet-500/30", badgeBg: "bg-violet-500/15" },
                    { type: "H2", icon: Heading2, sub: "Subtítulo", colorBg: "bg-blue-500/20", colorText: "text-blue-300", colorBorder: "border-blue-500/30", badgeBg: "bg-blue-500/15" },
                    { type: "Texto", icon: AlignLeft, sub: "Parágrafo curto", colorBg: "bg-zinc-500/20", colorText: "text-zinc-200", colorBorder: "border-zinc-500/30", badgeBg: "bg-zinc-500/15" },
                    { type: "Bullets", icon: List, sub: "Lista de tópicos", colorBg: "bg-amber-500/20", colorText: "text-amber-300", colorBorder: "border-amber-500/30", badgeBg: "bg-amber-500/15" },
                    { type: "CTA", icon: MousePointerClick, sub: "Texto do botão", colorBg: "bg-emerald-500/20", colorText: "text-emerald-300", colorBorder: "border-emerald-500/30", badgeBg: "bg-emerald-500/15" }
                  ] as const).map(({ type, icon: IconComponent, sub, colorBg, colorText, badgeBg }) => {
                    const count = textBlocks.filter(b => b.type === type).length;
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-label={`Adicionar ${type}`}
                        onClick={() => addTextBlock(type)}
                        className={`group/card relative flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-center transition-all pb-ctrl-btn cursor-pointer ${
                          count > 0 ? "pb-ctrl-active" : ""
                        }`}
                      >
                        {count > 0 && (
                          <span className={`absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2 ring-zinc-900 ${badgeBg} ${colorText}`}>
                            {count}
                          </span>
                        )}
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${colorBg} ${colorText} ring-1 ring-violet-400/40 group-hover/card:scale-105`}>
                          <IconComponent className="h-5 w-5" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold text-white">{type}</span>
                          <span className="text-[10px] text-zinc-400">{sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                  <p className="text-[11px] leading-relaxed text-zinc-300">
                    {textBlocks.length === 0
                      ? "Adicione blocos de texto para guiar a composição da imagem. Cada bloco vira uma camada de tipografia com hierarquia ajustável pelo peso visual."
                      : "Ajuste o peso visual de cada bloco (1=discreto, 5=protagonista). Reordene arrastando ou usando as setas no hover."}
                  </p>
                </div>

                {/* Blocos de texto ativos */}
                <div className="flex flex-col gap-1.5">
                  {textBlocks.map((blk, idx) => {
                    const typeColors = {
                      H1: { border: "border-l-violet-400/60", bg: "from-violet-500/[0.05]", badge: "bg-violet-500/15 text-violet-300 border-violet-500/30", bar: "bg-violet-400" },
                      H2: { border: "border-l-blue-400/60", bg: "from-blue-500/[0.05]", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30", bar: "bg-blue-400" },
                      Texto: { border: "border-l-zinc-400/60", bg: "from-zinc-500/[0.05]", badge: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30", bar: "bg-zinc-300" },
                      Bullets: { border: "border-l-amber-400/60", bg: "from-amber-500/[0.05]", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", bar: "bg-amber-400" },
                      CTA: { border: "border-l-emerald-400/60", bg: "from-emerald-500/[0.05]", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", bar: "bg-emerald-400" },
                    }[blk.type] || { border: "border-l-violet-400/60", bg: "from-violet-500/[0.05]", badge: "bg-violet-500/15 text-violet-300 border-violet-500/30", bar: "bg-violet-400" };

                    return (
                      <div
                        key={blk.id}
                        className={`group/blk relative overflow-hidden rounded-xl border border-white/[0.06] border-l-2 transition-all ${typeColors.border} bg-gradient-to-r ${typeColors.bg} via-transparent to-transparent hover:border-white/[0.12]`}
                      >
                        <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                          <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${typeColors.badge}`}>
                            {blk.type}
                          </span>
                          <span className="text-[10px] text-[#5c5278]">{blk.sub}</span>
                          <span className="ml-auto text-[9px] tabular-nums text-[#5c5278]">#{idx + 1}</span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveTextBlock(idx, -1)}
                              title="Mover para cima"
                              className="rounded p-1 max-lg:p-2 text-[#5c5278] transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5c5278] cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up h-3.5 w-3.5" aria-hidden="true"><path d="m18 15-6-6-6 6"></path></svg>
                            </button>
                            <button
                              type="button"
                              disabled={idx === textBlocks.length - 1}
                              onClick={() => moveTextBlock(idx, 1)}
                              title="Mover para baixo"
                              className="rounded p-1 max-lg:p-2 text-[#5c5278] transition-all hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5c5278] cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTextBlock(blk.id)}
                              title="Remover"
                              className="rounded p-1 max-lg:p-2 text-[#5c5278] transition-all hover:bg-red-500/15 hover:text-red-400 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          </div>
                        </div>

                        <div className="px-3 pb-2">
                          {blk.type === "Bullets" ? (
                            <textarea
                              placeholder="Um item por linha..."
                              rows={2}
                              className="w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-100 placeholder-[#5c5278] outline-none"
                              value={blk.text}
                              onChange={(e) => updateTextBlock(blk.id, { text: e.target.value })}
                            />
                          ) : (
                            <input
                              placeholder={`${blk.sub}...`}
                              className="w-full bg-transparent text-sm text-zinc-100 placeholder-[#5c5278] outline-none"
                              type="text"
                              value={blk.text}
                              onChange={(e) => updateTextBlock(blk.id, { text: e.target.value })}
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-2 border-t border-white/[0.04] px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[9px] font-semibold uppercase tracking-widest text-[#5c5278]">Peso</span>
                            <div role="group" aria-label={`Peso visual ${blk.weight} de 5`} className="flex items-end gap-[3px] max-lg:gap-1.5" title={`Peso visual: ${blk.weight}/5`}>
                              {[1, 2, 3, 4, 5].map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  aria-label={`Definir peso ${w}`}
                                  onClick={() => updateTextBlock(blk.id, { weight: w })}
                                  className={`w-[4px] max-lg:w-2.5 rounded-full transition-all hover:opacity-80 max-lg:py-1.5 max-lg:box-content cursor-pointer ${
                                    w <= blk.weight ? typeColors.bar : "bg-white/10"
                                  }`}
                                  style={{ height: `${8 + w * 2}px` }}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] tabular-nums text-[#5c5278]">{blk.weight}/5</span>

                            <div className="ml-auto flex items-center gap-1" role="group" aria-label="Alinhamento do bloco">
                              {(["Esquerda", "Centro", "Direita"] as const).map((pos) => {
                                const isSel = (blk.posicao || posicaoTexto) === pos;
                                return (
                                  <button
                                    key={pos}
                                    type="button"
                                    title={`Alinhar bloco à ${pos}`}
                                    onClick={() => updateTextBlock(blk.id, { posicao: pos })}
                                    className={`px-1.5 py-0.5 text-[8px] rounded transition-all cursor-pointer ${
                                      isSel
                                        ? "bg-violet-500/30 text-violet-200 border border-violet-500/50 font-bold"
                                        : "bg-white/5 text-[#5c5278] hover:bg-white/10 hover:text-zinc-300"
                                    }`}
                                  >
                                    {pos === "Esquerda" ? "Esq" : pos === "Centro" ? "Cen" : "Dir"}
                                  </button>
                                );
                              })}
                            </div>

                            <span className="ml-1 text-[#5c5278]/50" title="Use as setas acima para reordenar" aria-hidden="true">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical h-3.5 w-3.5" aria-hidden="true"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Degradê no texto ou não? */}
            <div data-field-id="degrade" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <label htmlFor="degrade" className="text-sm font-medium text-zinc-300 leading-snug">
                    Degradê no texto ou não?
                  </label>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Degradê no texto ou não?"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/8 bg-zinc-900/80 p-1">
                  <button
                    type="button"
                    title="Ativar"
                    onClick={() => setDegradeTexto(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    style={
                      degradeTexto
                        ? { backgroundColor: "rgba(124, 58, 237, 0.133)", color: "rgb(124, 58, 237)", boxShadow: "rgba(124, 58, 237, 0.267) 0px 0px 0px 1px" }
                        : { color: "rgb(82, 82, 91)" }
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                  </button>
                  <button
                    type="button"
                    title="Desativar"
                    onClick={() => setDegradeTexto(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    style={
                      !degradeTexto
                        ? { backgroundColor: "rgba(124, 58, 237, 0.133)", color: "rgb(124, 58, 237)", boxShadow: "rgba(124, 58, 237, 0.267) 0px 0px 0px 1px" }
                        : { color: "rgb(82, 82, 91)" }
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Posição do Texto */}
            <div data-field-id="posicao_do_texto" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Posição do Texto</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Posição do Texto"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div role="group" aria-label="Posição do Texto" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={posicaoTexto === "Esquerda"}
                      onClick={() => {
                        setPosicaoTexto("Esquerda");
                        setTextBlocks(prev => prev.map(b => ({ ...b, posicao: "Esquerda" })));
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        posicaoTexto === "Esquerda" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-start h-5 w-5" aria-hidden="true"><path d="M21 5H3"></path><path d="M15 12H3"></path><path d="M17 19H3"></path></svg>
                      <span className="font-medium text-sm">Esquerda</span>
                    </button>
                    <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Esquerda"
                          aria-expanded="false"
                          className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={posicaoTexto === "Centro"}
                      onClick={() => {
                        setPosicaoTexto("Centro");
                        setTextBlocks(prev => prev.map(b => ({ ...b, posicao: "Centro" })));
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        posicaoTexto === "Centro" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-center h-5 w-5" aria-hidden="true"><path d="M21 5H3"></path><path d="M17 12H7"></path><path d="M19 19H5"></path></svg>
                      <span className="font-medium text-sm">Centro</span>
                    </button>
                    <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Centro"
                          aria-expanded="false"
                          className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={posicaoTexto === "Direita"}
                      onClick={() => {
                        setPosicaoTexto("Direita");
                        setTextBlocks(prev => prev.map(b => ({ ...b, posicao: "Direita" })));
                      }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        posicaoTexto === "Direita" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-text-align-end h-5 w-5" aria-hidden="true"><path d="M21 5H3"></path><path d="M21 12H9"></path><path d="M21 19H7"></path></svg>
                      <span className="font-medium text-sm">Direita</span>
                    </button>
                    <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Direita"
                          aria-expanded="false"
                          className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. PALETA DE CORES ── */}
        <div data-tour="form-sec-advanced">
          <div className="flex flex-col gap-6 lg:gap-12">
            <div data-field-id="color_palette" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-white">Paleta de Cores</label>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Paleta de Cores"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">
                    Opcional
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* Cor do Ambiente */}
                  <div className="relative flex-1 min-w-0">
                    <div className="group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 select-none cursor-pointer border-white/25 shadow-lg ring-1 ring-white/10">
                      <div
                        className="relative h-16 w-full flex items-center justify-center transition-all duration-300"
                        style={{ backgroundColor: ambientColorActive ? ambientColor : "rgb(39, 39, 42)" }}
                      >
                        {ambientColorActive && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255, 255, 255, 0.133)", border: "1px solid rgba(255, 255, 255, 0.267)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3" aria-hidden="true" style={{ color: "rgb(255, 255, 255)" }}><path d="M20 6 9 17l-5-5"></path></svg>
                          </div>
                        )}
                        <input
                          type="color"
                          value={ambientColor}
                          onChange={(e) => setAmbientColor(e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 transition-colors duration-300" style={{ backgroundColor: ambientColorActive ? `${ambientColor}dd` : "#18181b" }}>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider truncate transition-colors duration-300" style={{ color: "rgba(255, 255, 255, 0.733)" }}>
                            Cor do Ambiente
                          </span>
                          <span className="text-xs font-mono transition-colors duration-300" style={{ color: "rgb(255, 255, 255)" }}>{ambientColor}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAmbientColorActive(!ambientColorActive); }}
                          className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.133)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                          title="Desativar cor"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-2.5 w-2.5" aria-hidden="true" style={{ color: "rgb(255, 255, 255)" }}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Luz Complementar */}
                  <div className="relative flex-1 min-w-0">
                    <div className="group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 select-none cursor-pointer border-white/25 shadow-lg ring-1 ring-white/10">
                      <div
                        className="relative h-16 w-full flex items-center justify-center transition-all duration-300"
                        style={{ backgroundColor: compLightActive ? compLight : "rgb(39, 39, 42)" }}
                      >
                        {compLightActive && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255, 255, 255, 0.133)", border: "1px solid rgba(255, 255, 255, 0.267)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3" aria-hidden="true" style={{ color: "rgb(255, 255, 255)" }}><path d="M20 6 9 17l-5-5"></path></svg>
                          </div>
                        )}
                        <input
                          type="color"
                          value={compLight}
                          onChange={(e) => setCompLight(e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 transition-colors duration-300" style={{ backgroundColor: compLightActive ? `${compLight}dd` : "#18181b" }}>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider truncate transition-colors duration-300" style={{ color: "rgba(255, 255, 255, 0.733)" }}>
                            Luz Complementar
                          </span>
                          <span className="text-xs font-mono transition-colors duration-300" style={{ color: "rgb(255, 255, 255)" }}>{compLight}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCompLightActive(!compLightActive); }}
                          className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.133)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                          title="Desativar cor"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-2.5 w-2.5" aria-hidden="true" style={{ color: "rgb(255, 255, 255)" }}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cor de Destaque */}
                  <div className="relative flex-1 min-w-0">
                    <div className="group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 select-none cursor-pointer border-white/25 shadow-lg ring-1 ring-white/10">
                      <div
                        className="relative h-16 w-full flex items-center justify-center transition-all duration-300"
                        style={{ backgroundColor: accentColorActive ? accentColor : "rgb(39, 39, 42)" }}
                      >
                        {accentColorActive && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(17, 17, 17, 0.133)", border: "1px solid rgba(17, 17, 17, 0.267)" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3 w-3" aria-hidden="true" style={{ color: "rgb(17, 17, 17)" }}><path d="M20 6 9 17l-5-5"></path></svg>
                          </div>
                        )}
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 transition-colors duration-300" style={{ backgroundColor: accentColorActive ? `${accentColor}dd` : "#18181b" }}>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider truncate transition-colors duration-300" style={{ color: "rgba(17, 17, 17, 0.733)" }}>
                            Cor de Destaque
                          </span>
                          <span className="text-xs font-mono transition-colors duration-300" style={{ color: "rgb(17, 17, 17)" }}>{accentColor}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAccentColorActive(!accentColorActive); }}
                          className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: "rgba(17, 17, 17, 0.133)", border: "1px solid rgba(17, 17, 17, 0.2)" }}
                          title="Desativar cor"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-2.5 w-2.5" aria-hidden="true" style={{ color: "rgb(17, 17, 17)" }}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── 5. COMPOSIÇÃO E ESTILO ── */}
        <div data-tour="form-sec-style">
          <div className="flex flex-col gap-6 lg:gap-12">
            
            {/* Plano */}
            <div data-field-id="plano" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Plano</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Plano"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div role="group" aria-label="Plano" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={plano === "close-up"}
                      onClick={() => { setPlano("close-up"); store.updateConfig({ composicao: "Close-up (Rosto)" as any }); }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        plano === "close-up" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
                      <span className="font-medium text-sm">Close-up (Rosto)</span>
                    </button>
                    <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Close-up (Rosto)"
                          aria-expanded="false"
                          className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={plano === "medium"}
                      onClick={() => { setPlano("medium"); store.updateConfig({ composicao: "Plano Médio (Busto)" as any }); }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        plano === "medium" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <span className="font-medium text-sm">Plano Médio (Busto)</span>
                    </button>
                    <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Plano Médio (Busto)"
                          aria-expanded="false"
                          className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>

                  <div className="group relative">
                    <button
                      type="button"
                      aria-pressed={plano === "american"}
                      onClick={() => { setPlano("american"); store.updateConfig({ composicao: "Plano Americano" as any }); }}
                      className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                        plano === "american" ? "pb-ctrl-active text-white" : "text-zinc-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-user-round h-5 w-5" aria-hidden="true"><path d="M18 21a6 6 0 0 0-12 0"></path><circle cx="12" cy="11" r="4"></circle><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>
                      <span className="font-medium text-sm">Plano Americano</span>
                    </button>
                    <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                      <span className="relative inline-flex items-center">
                        <button
                          type="button"
                          data-field-info=""
                          aria-label="Mais informações Plano Americano"
                          aria-expanded="false"
                          className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Elementos Flutuantes */}
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
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setElementosFlutuantesActive(!elementosFlutuantesActive)}
                    className="relative h-6 w-11 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: elementosFlutuantesActive ? "rgb(124, 58, 237)" : "#3f3f46" }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        elementosFlutuantesActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {elementosFlutuantesActive && (
                  <input
                    id="elementos_flutuantes"
                    placeholder="Ex: Notas de dólar, moedas... (vazio = IA decide)"
                    className="w-full rounded-2xl pb-glass-input px-4 py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={elementosFlutuantesText}
                    onChange={(e) => {
                      setElementosFlutuantesText(e.target.value);
                      store.updateConfig({ floatingElementsCustom: e.target.value, elementosFlutuantesTexto: e.target.value });
                    }}
                  />
                )}
              </div>
            </div>

            {/* Estilo Visual */}
            <div data-field-id="estilo_visual" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Estilo Visual</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Estilo Visual"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div role="group" aria-label="Estilo Visual" className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(3, minmax(0px, 1fr))" }}>
                  {allStyles.map((styleName) => {
                    const isSelected = estiloVisual === styleName;
                    return (
                      <div key={styleName} className="group relative">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => { setEstiloVisual(styleName); store.setEstilosVisuais([styleName]); }}
                          className={`flex h-full w-full items-center text-center transition-colors pb-ctrl-btn flex-col gap-2 rounded-xl p-4 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                            isSelected ? "pb-ctrl-active text-white" : "text-zinc-200"
                          }`}
                        >
                          <span className="font-medium text-sm">{styleName}</span>
                        </button>
                        <div className="absolute bottom-1 right-1 z-10 flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                          <span className="relative inline-flex items-center">
                            <button
                              type="button"
                              data-field-info=""
                              aria-label={`Mais informações ${styleName}`}
                              aria-expanded="false"
                              className="group inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 h-4 w-4 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                            </button>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inspirações de Estilo */}
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
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>
                </div>

                <div tabIndex={0} className="relative flex flex-col gap-2 rounded-lg p-2 -m-2 transition-colors outline-none">
                  <div className="flex flex-col gap-2">
                    {estiloRefs.map((est, idx) => (
                      <div key={est.id} className="group flex items-center gap-2">
                        <div className="relative shrink-0">
                          <img
                            alt={`imagem ${idx + 1}`}
                            className="h-12 w-12 rounded-lg object-cover border border-white/10 cursor-pointer transition-all hover:border-violet-500/40 hover:ring-1 hover:ring-violet-500/20"
                            src={est.url}
                          />
                          <button
                            type="button"
                            aria-label={`Remover imagem ${idx + 1}`}
                            title={`Remover imagem ${idx + 1}`}
                            onClick={() => setEstiloRefs(prev => prev.filter(e => e.id !== est.id))}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500 z-10 cursor-pointer"
                          >
                            ×
                          </button>
                          <button
                            type="button"
                            aria-label={`Recortar imagem ${idx + 1}`}
                            title={`Recortar imagem ${idx + 1}`}
                            onClick={() => onOpenCropModal && onOpenCropModal(est.url, (cropped) => {
                              setEstiloRefs(prev => prev.map(e => e.id === est.id ? { ...e, url: cropped } : e));
                            })}
                            className="absolute -bottom-1.5 -right-1.5 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center opacity-0 group-hover:opacity-100 max-lg:opacity-100 transition-opacity hover:bg-violet-600 hover:text-white hover:border-violet-500 z-10 cursor-pointer"
                          >
                            <Crop className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <input
                          placeholder="O que aproveitar desta inspiração? Ex: iluminação, cores, composição..."
                          className="flex-1 rounded-lg pb-glass-input px-3 py-2 text-xs transition-colors"
                          type="text"
                          value={est.desc}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEstiloRefs(prev => prev.map(item => item.id === est.id ? { ...item, desc: val } : item));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      onClick={() => estiloInputRef.current?.click()}
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
                    ref={estiloInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    multiple
                    className="hidden"
                    type="file"
                    onChange={handleEstiloUpload}
                  />
                </div>
              </div>
            </div>

            {/* Estilo da Imagem (Slider) */}
            <div data-field-id="sobriedade_criatividade" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="sobriedade_criatividade" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>Estilo da Imagem</span>
                    <span className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-field-info=""
                        aria-label="Mais informações Estilo da Imagem"
                        aria-expanded="false"
                        className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                        style={{ color: "rgb(124, 58, 237)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </button>
                    </span>
                  </label>
                  <span className="text-xs tabular-nums text-zinc-400" style={{ color: "rgb(255, 255, 255)" }}>{sobriedade}%</span>
                </div>

                <div
                  className="relative flex touch-none items-center select-none w-full py-2"
                  id="sobriedade_criatividade"
                >
                  <div
                    className="relative grow overflow-hidden rounded-full h-1.5 w-full bg-zinc-700"
                  >
                    <div
                      className="absolute h-full bg-white transition-all duration-75"
                      style={{
                        left: "0%",
                        width: `${sobriedade}%`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sobriedade}
                    onChange={(e) => setSobriedade(parseInt(e.target.value, 10))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    aria-label="Estilo da Imagem: Nível de Sobriedade"
                  />
                  <div
                    style={{
                      transform: "translateX(-50%)",
                      position: "absolute",
                      left: `${sobriedade}%`
                    }}
                    className="pointer-events-none z-10"
                  >
                    <span
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-orientation="horizontal"
                      data-orientation="horizontal"
                      tabIndex={0}
                      data-slot="slider-thumb"
                      className="block size-4 shrink-0 rounded-full border border-white bg-white shadow-sm ring-violet-500/30 transition-all"
                      aria-valuenow={sobriedade}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Criativo</span>
                  <span>Sóbrio</span>
                </div>
              </div>
            </div>

            {/* Usar Desfoque (Blur)? */}
            <div data-field-id="usar_desfoque_blur" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <label htmlFor="usar_desfoque_blur" className="text-sm font-medium text-zinc-300 leading-snug">
                    Usar Desfoque (Blur)?
                  </label>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Usar Desfoque (Blur)?"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/8 bg-zinc-900/80 p-1">
                  <button
                    type="button"
                    title="Ativar"
                    onClick={() => { setUsarBlur(true); store.updateConfig({ enableBlur: true }); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    style={
                      usarBlur
                        ? { backgroundColor: "rgba(124, 58, 237, 0.133)", color: "rgb(124, 58, 237)", boxShadow: "rgba(124, 58, 237, 0.267) 0px 0px 0px 1px" }
                        : { color: "rgb(82, 82, 91)" }
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-3.5 w-3.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                  </button>
                  <button
                    type="button"
                    title="Desativar"
                    onClick={() => { setUsarBlur(false); store.updateConfig({ enableBlur: false }); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    style={
                      !usarBlur
                        ? { backgroundColor: "rgba(124, 58, 237, 0.133)", color: "rgb(124, 58, 237)", boxShadow: "rgba(124, 58, 237, 0.267) 0px 0px 0px 1px" }
                        : { color: "rgb(82, 82, 91)" }
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-3.5 w-3.5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 6. PROMPT ADICIONAL ── */}
        <div data-tour="form-sec-step_1773770939424_4">
          <div className="flex flex-col gap-6 lg:gap-12">
            <div data-field-id="prompt_adicional" className="flex flex-col gap-2 lg:gap-1 campo-com-info">
              <div className="flex flex-col gap-2">
                <label htmlFor="prompt_adicional" className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span>Prompt Adicional</span>
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      data-field-info=""
                      aria-label="Mais informações Prompt Adicional"
                      aria-expanded="false"
                      className="group inline-flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer"
                      style={{ color: "rgb(124, 58, 237)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info h-3.5 w-3.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </button>
                  </span>
                </label>
                <div className="group relative">
                  <textarea
                    id="prompt_adicional"
                    rows={3}
                    placeholder="Adicione detalhes extras ao prompt automático"
                    className="w-full rounded-2xl pb-glass-input px-4 py-3 pb-8 text-sm resize-none min-h-[80px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    value={store.additionalPrompt || ""}
                    onChange={(e) => store.updateConfig({ additionalPrompt: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTempEditorValue(store.additionalPrompt || "");
                      setExpandedEditor({
                        isOpen: true,
                        fieldId: "prompt_adicional",
                        title: "Prompt Adicional",
                        placeholder: "Adicione detalhes extras ao prompt automático",
                        value: store.additionalPrompt || "",
                        onSave: (val) => store.updateConfig({ additionalPrompt: val })
                      });
                    }}
                    className="absolute bottom-2 right-2 rounded-md p-1 text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/5 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
                    title="Expandir editor"
                    aria-haspopup="dialog"
                    aria-expanded={expandedEditor.isOpen && expandedEditor.fieldId === "prompt_adicional"}
                    data-state={expandedEditor.isOpen && expandedEditor.fieldId === "prompt_adicional" ? "open" : "closed"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5" aria-hidden="true"><path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. BOTÃO CONSTRUIR E AÇÕES (ESTÁTICO NO FIM DO FORMULÁRIO) ── */}
        <div>
          <div ref={staticSubmitRef} className="w-full">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
              style={{ background: "linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))" }}
            >
              <span>{isGenerating ? "Construindo..." : "Construir"}</span>
              <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
            </button>
          </div>
        </div>

        {/* Sticky Bottom Bar (Exibida suavemente enquanto o usuário navega pelo formulário; oculta no topo para não cobrir campos) */}
        {hasScrolled && !isStaticSubmitVisible && (
          <div className="sticky bottom-3 z-30 -mx-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-white/10 bg-black/70 px-2 py-2 shadow-2xl backdrop-blur-md">
              <div className="w-full">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={onGenerate}
                  className="flex w-full items-center justify-center gap-2 text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-40 cursor-pointer"
                  style={{ background: "linear-gradient(to right, rgb(124, 58, 237), rgba(124, 58, 237, 0.8))" }}
                >
                  <span>{isGenerating ? "Construindo..." : "Construir"}</span>
                  <span className="ml-1.5 rounded-lg bg-white/15 px-2 py-0.5 text-xs font-medium">1 crédito</span>
                </button>
              </div>
              <div className="mt-2 px-1 pb-0.5">
                <div className="flex items-center justify-center gap-3 text-[11px] text-[#9d94bb]">
                  <button
                    type="button"
                    onClick={() => {
                      store.createProject();
                      showToast("Configurações duplicadas em uma nova aba!", "success");
                    }}
                    title="Duplicar configurações para uma nova aba"
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Duplicar</span>
                  </button>
                  <span aria-hidden="true" className="text-white/15">·</span>
                  <button
                    type="button"
                    onClick={handleResetAll}
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
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              store.createProject();
              showToast("Configurações duplicadas em uma nova aba!", "success");
            }}
            title="Duplicar configurações para uma nova aba"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#9d94bb] cursor-pointer"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicar</span>
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            title="Resetar todas as configurações do formulário"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#9d94bb] transition-colors pb-ctrl-btn hover:text-[#f0ecff] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Resetar</span>
          </button>
        </div>

        {/* Botão de minimizar filtros no mobile */}
        <button
          type="button"
          aria-label="Minimizar filtros"
          className="lg:hidden flex w-full shrink-0 items-center justify-center py-0.5 text-zinc-500 transition-colors active:text-white cursor-pointer"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        <div className="h-20 shrink-0" aria-hidden="true"></div>
      </form>

      {/* Modal Ampliar Imagem do Sujeito */}
      {previewZoomImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewZoomImage}
              alt="Ampliar imagem"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/20"
            />
            <button
              type="button"
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-zinc-800 border border-white/20 text-white flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── EXPANDED TEXTAREA RADIX DIALOG MODAL ── */}
      {expandedEditor.isOpen && (
        <>
          <div
            data-state="open"
            onClick={() => setExpandedEditor((prev) => ({ ...prev, isOpen: false }))}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
            style={{ pointerEvents: "auto" }}
            aria-hidden="true"
          />
          <div
            role="dialog"
            id="radix-_r_8_"
            data-state="open"
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            tabIndex={-1}
            aria-describedby="radix-_r_a_"
            aria-labelledby="radix-_r_9_"
            style={{ pointerEvents: "auto" }}
          >
            <p id="radix-_r_a_" className="sr-only">
              Editor expandido para o campo {expandedEditor.title}. Use Ctrl+Enter para salvar, Esc para cancelar.
            </p>
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <h2 id="radix-_r_9_" className="text-sm font-semibold text-white">
                {expandedEditor.title}
              </h2>
              <button
                type="button"
                onClick={() => setExpandedEditor((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            <div className="flex-1 p-5">
              <textarea
                autoFocus
                placeholder={expandedEditor.placeholder}
                rows={12}
                className="w-full rounded-xl border border-white/5 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 transition-colors resize-y min-h-[200px] focus:border-violet-500/30"
                value={tempEditorValue}
                onChange={(e) => setTempEditorValue(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    expandedEditor.onSave(tempEditorValue);
                    setExpandedEditor((prev) => ({ ...prev, isOpen: false }));
                    showToast("Texto salvo com sucesso!", "success");
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
              <span className="text-xs text-zinc-500">Ctrl+Enter para salvar</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedEditor((prev) => ({ ...prev, isOpen: false }))}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    expandedEditor.onSave(tempEditorValue);
                    setExpandedEditor((prev) => ({ ...prev, isOpen: false }));
                    showToast("Texto salvo com sucesso!", "success");
                  }}
                  className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                  style={{ backgroundColor: "rgb(124, 58, 237)" }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};
