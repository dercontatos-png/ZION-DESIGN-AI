import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Layers,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Image as ImageIcon,
  Upload,
  Palette,
  Lightbulb,
  Award,
  HelpCircle,
  Compass,
  Target,
  ListOrdered,
  Send,
  RefreshCw,
  CheckCircle2,
  Briefcase,
  Type,
  Smartphone,
  X,
  MessageSquare,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";
import { useClientStore, ClientProfile, ContentItem, ContentSlide } from "../store/useClientStore";
import { analisarPrintsPerfil, gerarConteudoCliente, ajustarConteudoComIA } from "../services/clientContentService";

interface ClientHubProps {
  customApiKey?: string;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onNavigateToOrion: (clientId: string, contentId: string, slideIndex?: number) => void;
  onClose?: () => void;
}

// ── OBJETIVOS DE CONTEÚDO (ESTÉTICA MINIMALISTA ZION) ──────────────────────────
const OBJETIVOS_POST = [
  { id: "mitos", label: "Quebra de Mitos", icon: HelpCircle, desc: "Desbanca crenças erradas" },
  { id: "dica", label: "Dica Prática", icon: Lightbulb, desc: "Conselho acionável e rápido" },
  { id: "autoridade", label: "Autoridade", icon: Award, desc: "Posicionamento de especialista" },
  { id: "passo_a_passo", label: "Passo a Passo", icon: ListOrdered, desc: "Tutorial educativo guiado" },
  { id: "venda", label: "Venda / Oferta", icon: Target, desc: "Conversão e agendamento" },
  { id: "curiosidade", label: "Curiosidade", icon: Compass, desc: "Fato surpreendente do mercado" },
];

const TONS_VOZ = [
  { id: "profissional", label: "Profissional" },
  { id: "elegante", label: "Elegante & Luxo" },
  { id: "provocativo", label: "Provocativo" },
  { id: "empatico", label: "Humanizado" },
];

const TEMAS_SUGERIDOS = [
  "3 Erros Mais Comuns",
  "Mitos vs Verdades",
  "O Que Ninguém Te Conta",
  "Guia Rápido de Início",
  "Dúvidas Frequentes",
];

export const ClientHub: React.FC<ClientHubProps> = ({
  customApiKey,
  showToast,
  onNavigateToOrion,
  onClose,
}) => {
  const {
    clients,
    activeClientId,
    activeContentId,
    setActiveClient,
    setActiveContentId,
    addClient,
    updateClient,
    removeClient,
    addContentItem,
    updateContentItem,
    removeContentItem,
    saveToServer,
    isSyncing,
    lastSavedAt,
  } = useClientStore();

  useEffect(() => {
    useClientStore.getState().initClients();
  }, []);

  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0] || null;
  const activeContent = activeClient?.historicoConteudos?.find((h) => h.id === activeContentId) || activeClient?.historicoConteudos?.[0] || null;

  // Navegação Principal de Abas
  const [activeMainTab, setActiveMainTab] = useState<"criar" | "briefing">("criar");

  // Dropdown e Criação de Cliente
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientNiche, setNewClientNiche] = useState("");

  // Configurações Rápidas de Geração
  const [formato, setFormato] = useState<"carrossel" | "card_unico">("carrossel");
  const [slideCount, setSlideCount] = useState<number>(5);
  const [selectedObjetivo, setSelectedObjetivo] = useState<string>("mitos");
  const [selectedTom, setSelectedTom] = useState<string>("profissional");
  const [topicPrompt, setTopicPrompt] = useState("");

  // Estados de IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingPrints, setIsAnalyzingPrints] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [aiAdjustmentText, setAiAdjustmentText] = useState("");

  // Navegação do Palco
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<"slide" | "legenda" | "roteiro">("slide");
  const [copiedSlide, setCopiedSlide] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const printsInputRef = useRef<HTMLInputElement>(null);
  const clientMenuRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientMenuRef.current && !clientMenuRef.current.contains(e.target as Node)) {
        setIsClientMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.niche.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Criar novo cliente
  const handleCreateClient = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newClientName.trim()) {
      showToast("Informe o nome da marca ou cliente.", "warning");
      return;
    }
    const newId = addClient({
      name: newClientName.trim(),
      niche: newClientNiche.trim() || "Geral",
      paletaCores: ["#0F0E17", "#7C3AED", "#FFFFFF"],
      infoExtra: "",
      bancoDeDadosIA: "",
      regrasMarca: "",
      printsPerfil: [],
      historicoConteudos: [],
    });
    setActiveClient(newId);
    setNewClientName("");
    setNewClientNiche("");
    setIsNewClientModalOpen(false);
    setIsClientMenuOpen(false);
    showToast("Cliente cadastrado com sucesso!", "success");
  };

  // Upload de Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeClient) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateClient(activeClient.id, { logoBase64: reader.result as string });
      showToast("Logotipo atualizado!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Upload de Prints
  const handlePrintsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeClient) return;
    const urls: string[] = [...(activeClient.printsPerfil || [])];
    let loaded = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls.push(reader.result as string);
        loaded++;
        if (loaded === files.length) {
          updateClient(activeClient.id, { printsPerfil: urls });
          showToast(`${loaded} prints adicionados para análise!`, "success");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Analisar Estética com IA
  const handleAnalyzeAesthetic = async () => {
    if (!activeClient?.printsPerfil?.length) {
      showToast("Adicione pelo menos 1 print antes de analisar.", "warning");
      return;
    }
    setIsAnalyzingPrints(true);
    showToast("A IA está analisando a estética e paleta de cores...", "info");
    try {
      const formatted = activeClient.printsPerfil.map((p, idx) => ({
        data: p,
        name: `print_${idx + 1}.jpg`,
        type: "image/jpeg",
      }));
      const res = await analisarPrintsPerfil(formatted, customApiKey);
      updateClient(activeClient.id, {
        estiloVisualExtraido: res.estiloVisual,
        paletaCores: res.paletaCores?.length ? res.paletaCores : activeClient.paletaCores,
        infoExtra: res.resumoPerfil,
      });
      showToast("Identidade visual analisada e sincronizada!", "success");
    } catch (err: any) {
      showToast("Erro na análise: " + (err.message || "tente novamente"), "error");
    } finally {
      setIsAnalyzingPrints(false);
    }
  };

  // Gerar Conteúdo
  const handleGenerateContent = async () => {
    if (!activeClient) {
      showToast("Selecione um cliente primeiro.", "warning");
      return;
    }

    setIsGenerating(true);
    const obj = OBJETIVOS_POST.find((o) => o.id === selectedObjetivo);
    const tom = TONS_VOZ.find((t) => t.id === selectedTom);

    const promptComposto = [
      topicPrompt.trim() ? `Tema: ${topicPrompt.trim()}` : "",
      obj ? `Objetivo: ${obj.label} (${obj.desc})` : "",
      tom ? `Tom de Voz: ${tom.label}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    showToast(
      formato === "carrossel"
        ? `Estruturando carrossel (${slideCount} slides)...`
        : `Estruturando card único...`,
      "info"
    );

    try {
      const item = await gerarConteudoCliente(
        activeClient,
        formato,
        promptComposto,
        customApiKey,
        formato === "carrossel" ? slideCount : 1
      );
      const newId = addContentItem(activeClient.id, item);
      setActiveContentId(newId);
      setCurrentSlideIndex(0);
      showToast("Conteúdo gerado com sucesso!", "success");
    } catch (err: any) {
      showToast("Erro ao gerar: " + (err.message || "tente novamente"), "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajustar Conteúdo com IA
  const handleAdjustContent = async () => {
    if (!activeClient || !activeContent || !aiAdjustmentText.trim()) return;
    setIsAdjusting(true);
    showToast("Refinando o conteúdo...", "info");
    try {
      const updated = await ajustarConteudoComIA(
        activeContent,
        aiAdjustmentText.trim(),
        activeClient,
        customApiKey
      );
      updateContentItem(activeClient.id, activeContent.id, updated);
      setAiAdjustmentText("");
      showToast("Ajustes aplicados!", "success");
    } catch (err: any) {
      showToast("Erro ao ajustar: " + (err.message || "tente novamente"), "error");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Atualizar título do slide
  const handleUpdateSlideTitle = (idx: number, newTitle: string) => {
    if (!activeClient || !activeContent?.slides) return;
    const updated = activeContent.slides.map((s, i) =>
      i === idx ? { ...s, titulo: newTitle } : s
    );
    updateContentItem(activeClient.id, activeContent.id, { slides: updated });
  };

  // Atualizar corpo do slide
  const handleUpdateSlideContent = (idx: number, newBody: string) => {
    if (!activeClient || !activeContent?.slides) return;
    const updated = activeContent.slides.map((s, i) =>
      i === idx ? { ...s, conteudo: newBody } : s
    );
    updateContentItem(activeClient.id, activeContent.id, { slides: updated });
  };

  // Copiar texto do slide atual
  const handleCopyCurrentSlideText = () => {
    if (!activeContent?.slides?.[currentSlideIndex]) return;
    const s = activeContent.slides[currentSlideIndex];
    const text = `TÍTULO:\n${s.titulo}\n\nTEXTO:\n${s.conteudo}`;
    navigator.clipboard.writeText(text);
    setCopiedSlide(true);
    setTimeout(() => setCopiedSlide(false), 2000);
    showToast("Texto do slide copiado!", "success");
  };

  // Copiar legenda do Instagram
  const handleCopyCaption = () => {
    if (!activeContent) return;
    const text = `${activeContent.legenda}\n\n${activeContent.hashtags?.join(" ") || ""}`;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
    showToast("Legenda e hashtags copiadas!", "success");
  };

  // Copiar todos os textos da arte
  const handleCopyAllSlides = () => {
    if (!activeContent?.slides) return;
    const text = activeContent.slides
      .map(
        (s, idx) =>
          `SLIDE ${idx + 1} (${s.tipo.toUpperCase()})\n` +
          `• Título: ${s.titulo}\n` +
          `• Conteúdo: ${s.conteudo}\n`
      )
      .join("\n────────────────────────\n\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    showToast("Todos os slides copiados!", "success");
  };

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden relative">
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BARRA SUPERIOR INTEGRADA (PADRÃO ZION DESIGN STUDIO)               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className="h-14 shrink-0 border-b border-white/[0.08] bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30">
        
        {/* Esquerda: Seletor de Cliente Minimalista */}
        <div className="flex items-center gap-3 relative" ref={clientMenuRef}>
          <button
            type="button"
            onClick={() => setIsClientMenuOpen(!isClientMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all cursor-pointer group"
          >
            {activeClient?.logoBase64 ? (
              <img
                src={activeClient.logoBase64}
                alt=""
                className="h-6 w-6 rounded-lg object-contain bg-white/10 p-0.5"
              />
            ) : (
              <div
                className="h-6 w-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow-sm"
                style={{ backgroundColor: activeClient?.paletaCores?.[0] || "#7C3AED" }}
              >
                {activeClient?.name?.slice(0, 2).toUpperCase() || "CL"}
              </div>
            )}
            
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                {activeClient?.name || "Selecionar Cliente"}
              </span>
              <span className="text-[10px] text-zinc-400 truncate max-w-[160px]">
                {activeClient?.niche || "Nenhum cliente"}
              </span>
            </div>

            <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isClientMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Menu Dropdown de Clientes */}
          {isClientMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-zinc-950 border border-white/15 p-2 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
                <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full bg-transparent outline-none text-xs text-white placeholder-zinc-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 custom-scrollbar pr-1">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveClient(c.id);
                      setIsClientMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      activeClient?.id === c.id
                        ? "bg-violet-600/20 text-white border border-violet-500/30"
                        : "hover:bg-white/[0.04] text-zinc-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium block truncate text-white">{c.name}</span>
                      <span className="text-[10px] text-zinc-400 block truncate">{c.niche}</span>
                    </div>
                    {activeClient?.id === c.id && <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsNewClientModalOpen(true);
                  setIsClientMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 border border-violet-500/30 text-xs font-semibold transition-all cursor-pointer mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Cliente</span>
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Abas Segmentadas do Studio */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/[0.08] p-1">
            <button
              type="button"
              onClick={() => setActiveMainTab("criar")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMainTab === "criar"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Criar Post</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("briefing")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMainTab === "briefing"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Palette className="h-3 w-3" />
              <span>Brand Kit & Briefing</span>
            </button>
          </div>
        </div>

        {/* Direita: Ações Rápidas */}
        <div className="flex items-center gap-2.5">
          {activeContent && activeMainTab === "criar" && (
            <button
              type="button"
              onClick={() => onNavigateToOrion(activeClient?.id || "", activeContent.id, currentSlideIndex)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 fill-black" />
              <span>Produzir no Órion</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Voltar ao Studio"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CORPO PRINCIPAL DO STUDIO: 2 COLUNAS HARMONIOSAS                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden">
        
        {/* ───────────────────────────────────────────────────────────────── */}
        {/* ABA 1: CRIAR POST                                                 */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeMainTab === "criar" && (
          <>
            {/* COLUNA ESQUERDA: O PAINEL DE CONFIGURAÇÃO (~360px) */}
            <aside className="w-full lg:w-[360px] shrink-0 border-r border-white/[0.08] bg-zinc-950 flex flex-col h-full overflow-y-auto custom-scrollbar z-10 p-5 gap-8">
              
              {/* 1. FORMATO DO POST */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1 flex items-center justify-between">
                  <span>Formato da Arte</span>
                </label>
                <div className="flex items-center rounded-xl bg-black/40 border border-white/[0.08] p-1">
                  <button
                    type="button"
                    onClick={() => setFormato("carrossel")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      formato === "carrossel"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    <span>Carrossel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormato("card_unico")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      formato === "card_unico"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Card Único</span>
                  </button>
                </div>
              </div>

              {/* 2. QUANTIDADE DE SLIDES (SE CARROSSEL) */}
              {formato === "carrossel" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                    <span>Quantidade de Slides</span>
                    <span className="font-mono text-[11px] text-zinc-400">{slideCount} slides</span>
                  </div>
                  <div className="flex items-center rounded-xl bg-black/40 border border-white/[0.08] p-1">
                    {[3, 5, 7, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSlideCount(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          slideCount === num
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. OBJETIVO DO POST */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                  Objetivo Estratégico
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {OBJETIVOS_POST.map((obj) => {
                    const IconComp = obj.icon;
                    const isSelected = selectedObjetivo === obj.id;
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => setSelectedObjetivo(obj.id)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/[0.08] border-white/20 text-white shadow-sm"
                            : "bg-transparent border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconComp className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-zinc-400"}`} />
                          <span className="text-xs font-semibold">{obj.label}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 leading-tight">{obj.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. TOM DE VOZ */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                  Tom de Voz
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black/40 border border-white/[0.08]">
                  {TONS_VOZ.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTom(t.id)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedTom === t.id
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. TEMA / ASSUNTO */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                  Tema ou Assunto
                </label>
                <input
                  type="text"
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerateContent()}
                  placeholder="Ex: Clareamento dental ou deixe vazio..."
                  className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/20 transition-colors"
                />

                {/* Chips de Sugestões */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {TEMAS_SUGERIDOS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTopicPrompt(sug)}
                      className="text-[10px] text-zinc-400 hover:text-violet-300 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg px-2 py-1 transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTÃO PRINCIPAL DE GERAR CONTEÚDO */}
              <div className="pt-4 mt-auto">
                <button
                  type="button"
                  disabled={isGenerating || !activeClient}
                  onClick={handleGenerateContent}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-3.5 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Construindo Post...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-white" />
                      <span>⚡ Construir Conteúdo & Textos</span>
                    </>
                  )}
                </button>
              </div>
            </aside>

            {/* COLUNA CENTRAL & DIREITA: O PALCO DO STUDIO (FLEX-1) */}
            <main className="flex-1 min-w-0 h-full overflow-hidden bg-black flex flex-col lg:flex-row relative">
              
              {/* ESTADO VAZIO (NENHUM POST GERADO) */}
              {!activeContent && !isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="w-full max-w-[280px] aspect-[4/5] rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.01] flex flex-col items-center justify-center p-6 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-violet-600/15 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">Palco de Visualização</span>
                    <span className="text-[11px] text-zinc-500 leading-relaxed">
                      Selecione o formato e o objetivo no painel à esquerda e clique em <strong>Construir Conteúdo</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* ESTADO DE CARREGAMENTO */}
              {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center animate-pulse">
                    <RefreshCw className="h-6 w-6 animate-spin text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Criando Narrativa Estratégica...</h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Consultando as diretrizes da marca para redigir a headline e textos da arte.
                  </p>
                </div>
              )}

              {/* POST GERADO: CANVAS DO MOCKUP + PAINEL DE TEXTOS */}
              {activeContent && !isGenerating && (
                <div className="flex-1 min-w-0 h-full flex flex-col lg:flex-row overflow-hidden">
                  
                  {/* ÁREA CENTRAL: O MOCKUP REALISTA DO FEED 4:5 */}
                  <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto custom-scrollbar relative">
                    
                    {/* Mockup Frame (1080x1350 px / proporção 4:5) */}
                    <div className="w-full max-w-[350px] aspect-[4/5] rounded-3xl border border-white/[0.08] bg-zinc-950 overflow-hidden shadow-2xl relative flex flex-col justify-between p-6 select-none group">
                      
                      {/* Imagem de Fundo ou Gradiente da Marca */}
                      {activeContent.slides?.[currentSlideIndex]?.imagemGerada ? (
                        <>
                          <img
                            src={activeContent.slides[currentSlideIndex].imagemGerada}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/75" />
                        </>
                      ) : (
                        <>
                          <div
                            className="absolute inset-0"
                            style={{
                              background: `radial-gradient(circle at 50% 20%, ${
                                activeClient?.paletaCores?.[0] || "#7C3AED"
                              }30 0%, #0a0714 65%, #050308 100%)`
                            }}
                          />
                          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                        </>
                      )}

                      {/* Topo do Mockup: Logo e Marca */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {activeClient?.logoBase64 ? (
                            <img src={activeClient.logoBase64} alt="" className="h-7 w-7 rounded-full object-contain bg-white/10 p-0.5 border border-white/15" />
                          ) : (
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                              style={{ backgroundColor: activeClient?.paletaCores?.[0] || "#7C3AED" }}
                            >
                              {activeClient?.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-white truncate max-w-[160px] drop-shadow-md">
                            {activeClient?.name}
                          </span>
                        </div>

                        <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 font-mono">
                          {activeContent.slides?.[currentSlideIndex]?.tipo === "capa"
                            ? "Capa"
                            : activeContent.slides?.[currentSlideIndex]?.tipo === "cta"
                            ? "CTA"
                            : `${currentSlideIndex + 1}/${activeContent.slides?.length || 1}`}
                        </span>
                      </div>

                      {/* Meio do Mockup: TEXTOS DIAGRAMADOS COM DESIGN EDITORIAL */}
                      <div className="relative z-10 my-auto flex flex-col gap-3 py-4">
                        <span className="self-start text-[9px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                          {activeContent.slides?.[currentSlideIndex]?.tipo === "capa" ? "Headline" : "Conteúdo"}
                        </span>

                        <h4 className="text-lg font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                          {activeContent.slides?.[currentSlideIndex]?.titulo}
                        </h4>

                        <p className="text-xs text-zinc-200/90 leading-relaxed font-normal drop-shadow line-clamp-6">
                          {activeContent.slides?.[currentSlideIndex]?.conteudo}
                        </p>
                      </div>

                      {/* Rodapé do Mockup */}
                      <div className="relative z-10 flex flex-col gap-2 border-t border-white/10 pt-3">
                        {activeContent.slides?.[currentSlideIndex]?.tipo === "cta" ? (
                          <div className="w-full py-2 rounded-xl bg-violet-600/90 text-center text-xs font-semibold text-white shadow-lg">
                            Comente ou salve para consultar depois 📌
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Arraste para o lado 👉</span>
                            <div className="flex items-center gap-1">
                              {activeContent.slides?.map((_, i) => (
                                <span
                                  key={i}
                                  className={`h-1.5 rounded-full transition-all ${
                                    i === currentSlideIndex ? "w-4 bg-violet-400" : "w-1.5 bg-white/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barra de Navegação dos Slides Abaixo do Mockup */}
                    {activeContent.tipo === "carrossel" && activeContent.slides && (
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          type="button"
                          disabled={currentSlideIndex === 0}
                          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {activeContent.slides.map((s, idx) => (
                            <button
                              key={s.id || idx}
                              type="button"
                              onClick={() => setCurrentSlideIndex(idx)}
                              className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                currentSlideIndex === idx
                                  ? "bg-violet-600 text-white shadow-sm"
                                  : "bg-white/[0.02] text-zinc-400 hover:text-white border border-white/[0.06]"
                              }`}
                            >
                              #{idx + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={currentSlideIndex === (activeContent.slides.length - 1)}
                          onClick={() => setCurrentSlideIndex((prev) => Math.min(activeContent.slides.length - 1, prev + 1))}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PAINEL LATERAL DIREITO: CAMADAS DE TEXTO & LEGENDA (~380px) */}
                  <div className="w-full lg:w-[380px] shrink-0 border-l border-white/[0.08] bg-zinc-950 flex flex-col h-full overflow-y-auto custom-scrollbar p-5 gap-4">
                    
                    {/* Seletor de Aba do Painel Direito */}
                    <div className="flex items-center rounded-xl bg-black/40 border border-white/[0.08] p-1">
                      <button
                        type="button"
                        onClick={() => setRightPanelTab("slide")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          rightPanelTab === "slide"
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Slide #{currentSlideIndex + 1}
                      </button>

                      <button
                        type="button"
                        onClick={() => setRightPanelTab("legenda")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          rightPanelTab === "legenda"
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Legenda
                      </button>

                      <button
                        type="button"
                        onClick={() => setRightPanelTab("roteiro")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          rightPanelTab === "roteiro"
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Todos
                      </button>
                    </div>

                    {/* CASO A: EDITAR SLIDE ATUAL */}
                    {rightPanelTab === "slide" && activeContent.slides?.[currentSlideIndex] && (
                      <div className="flex flex-col gap-4">
                        
                        {/* Headline */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-zinc-300">
                              Título / Headline da Arte
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeContent.slides[currentSlideIndex].titulo);
                                showToast("Título copiado!", "success");
                              }}
                              className="text-[10px] text-zinc-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copiar</span>
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={activeContent.slides[currentSlideIndex].titulo}
                            onChange={(e) => handleUpdateSlideTitle(currentSlideIndex, e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm font-semibold text-white outline-none focus:border-violet-500 leading-snug resize-none"
                          />
                        </div>

                        {/* Texto de Apoio */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-zinc-300">
                              Texto de Apoio / Subtítulo
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeContent.slides[currentSlideIndex].conteudo);
                                showToast("Texto copiado!", "success");
                              }}
                              className="text-[10px] text-zinc-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copiar</span>
                            </button>
                          </div>
                          <textarea
                            rows={4}
                            value={activeContent.slides[currentSlideIndex].conteudo}
                            onChange={(e) => handleUpdateSlideContent(currentSlideIndex, e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-200 outline-none focus:border-violet-500 leading-relaxed resize-none"
                          />
                        </div>

                        {/* Botão Copiar Texto do Slide */}
                        <button
                          type="button"
                          onClick={handleCopyCurrentSlideText}
                          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                        >
                          {copiedSlide ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedSlide ? "Copiado!" : "Copiar Textos do Slide"}</span>
                        </button>
                      </div>
                    )}

                    {/* CASO B: LEGENDA DO INSTAGRAM */}
                    {rightPanelTab === "legenda" && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-zinc-300">
                            Legenda Completa com Hashtags
                          </label>
                          <button
                            type="button"
                            onClick={handleCopyCaption}
                            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedCaption ? "Copiada!" : "Copiar"}</span>
                          </button>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-zinc-200 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                          {activeContent.legenda}
                        </div>

                        {activeContent.hashtags && (
                          <div className="flex flex-wrap gap-1">
                            {activeContent.hashtags.map((h, i) => (
                              <span key={i} className="text-[10px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASO C: TODOS OS SLIDES */}
                    {rightPanelTab === "roteiro" && activeContent.slides && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-zinc-300">
                            Roteiro de Todos os Slides
                          </label>
                          <button
                            type="button"
                            onClick={handleCopyAllSlides}
                            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedAll ? "Copiado!" : "Copiar Tudo"}</span>
                          </button>
                        </div>

                        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                          {activeContent.slides.map((s, idx) => (
                            <div
                              key={s.id || idx}
                              onClick={() => {
                                setCurrentSlideIndex(idx);
                                setRightPanelTab("slide");
                              }}
                              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                                currentSlideIndex === idx
                                  ? "bg-violet-600/15 border-violet-500/40"
                                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-violet-400">#{idx + 1} {s.tipo.toUpperCase()}</span>
                                <span className="text-[10px] text-zinc-500">Ver no Mockup</span>
                              </div>
                              <p className="text-xs font-semibold text-white truncate">{s.titulo}</p>
                              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{s.conteudo}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* REFINAR COM IA NO RODAPÉ */}
                    <div className="pt-3 mt-auto border-t border-white/[0.06] flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-zinc-400">
                        Refinamento Rápido com IA
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={aiAdjustmentText}
                          onChange={(e) => setAiAdjustmentText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAdjustContent()}
                          placeholder="Ex: 'encurte a headline do slide 2'..."
                          className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                        />
                        <button
                          type="button"
                          disabled={isAdjusting || !aiAdjustmentText.trim()}
                          onClick={handleAdjustContent}
                          className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 cursor-pointer"
                        >
                          {isAdjusting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* ABA 2: BRAND KIT & BRIEFING                                       */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeMainTab === "briefing" && activeClient && (
          <div className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-black">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              
              {/* Topo do Briefing */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-violet-400" />
                    <span>Brand Kit de {activeClient.name}</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Essas diretrizes orientam a IA em todos os conteúdos gerados para esta marca.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await saveToServer();
                    showToast("Brand Kit salvo com sucesso!", "success");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>

              {/* Grid de Configurações da Marca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Nome & Nicho */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Identificação</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Nome da Marca</label>
                      <input
                        type="text"
                        value={activeClient.name}
                        onChange={(e) => updateClient(activeClient.id, { name: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Nicho / Especialidade</label>
                      <input
                        type="text"
                        value={activeClient.niche}
                        onChange={(e) => updateClient(activeClient.id, { niche: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Logotipo */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Logotipo Oficial</h3>
                  <div className="flex items-center gap-4">
                    {activeClient.logoBase64 ? (
                      <div className="relative h-16 w-16 rounded-2xl border border-white/15 bg-white/5 p-1.5 flex items-center justify-center">
                        <img src={activeClient.logoBase64} alt="" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => updateClient(activeClient.id, { logoBase64: undefined })}
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/20 text-zinc-500">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-xs font-medium text-zinc-200 cursor-pointer"
                    >
                      Carregar Logotipo (PNG)
                    </button>
                  </div>
                </div>

                {/* 3. Paleta de Cores */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Paleta de Cores</h3>
                    <button
                      type="button"
                      onClick={() => {
                        updateClient(activeClient.id, {
                          paletaCores: [...(activeClient.paletaCores || []), "#7C3AED"],
                        });
                      }}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Adicionar Cor</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(activeClient.paletaCores || []).map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const updated = [...(activeClient.paletaCores || [])];
                            updated[idx] = e.target.value;
                            updateClient(activeClient.id, { paletaCores: updated });
                          }}
                          className="h-5 w-5 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="font-mono text-xs text-zinc-300 uppercase">{color}</span>
                        {activeClient.paletaCores.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = activeClient.paletaCores.filter((_, i) => i !== idx);
                              updateClient(activeClient.id, { paletaCores: updated });
                            }}
                            className="text-zinc-500 hover:text-red-400 text-xs ml-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Diretrizes da Marca */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Diretrizes & Regras</h3>
                  <textarea
                    rows={4}
                    value={activeClient.regrasMarca || ""}
                    onChange={(e) => updateClient(activeClient.id, { regrasMarca: e.target.value })}
                    placeholder="Ex: Não usar jargões médicos complexos, manter tom sofisticado, destacar agendamentos..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white outline-none focus:border-violet-500 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* 5. Prints de Referência do Perfil */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Prints de Referência do Instagram</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      A IA analisa a estética e harmonia dessas imagens para calibrar as cores e textos.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="file" ref={printsInputRef} accept="image/*" multiple onChange={handlePrintsUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => printsInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-xs font-medium text-zinc-200 cursor-pointer"
                    >
                      Subir Prints
                    </button>

                    <button
                      type="button"
                      disabled={isAnalyzingPrints || !activeClient.printsPerfil?.length}
                      onClick={handleAnalyzeAesthetic}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-sm"
                    >
                      {isAnalyzingPrints ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      <span>Analisar com IA</span>
                    </button>
                  </div>
                </div>

                {activeClient.printsPerfil && activeClient.printsPerfil.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {activeClient.printsPerfil.map((img, i) => (
                      <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-black/60 relative group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = activeClient.printsPerfil?.filter((_, idx) => idx !== i);
                            updateClient(activeClient.id, { printsPerfil: updated });
                          }}
                          className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-zinc-500 text-xs">
                    Nenhum print de referência cadastrado ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL DE CADASTRO DE NOVO CLIENTE                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-white/15 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-violet-400" />
                <span>Novo Cliente ou Marca</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome da Marca *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Dra. Ana Beatriz Odontologia"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nicho / Segmento</label>
                <input
                  type="text"
                  value={newClientNiche}
                  onChange={(e) => setNewClientNiche(e.target.value)}
                  placeholder="Ex: Odontologia Estética, Direito, Nutrição..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
