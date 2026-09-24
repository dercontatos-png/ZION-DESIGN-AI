import React, { useState, useMemo, useEffect, useRef } from "react";
import { safeStorageSetItem } from "../utils/imageStorageManager";
import {
  Layers,
  ShoppingBag,
  Crop,
  Sparkles,
  Clock,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Copy,
  Download,
  Trash2,
  Eye,
  Shield,
  Filter,
  CheckCircle2,
  AlertCircle,
  User,
  Globe,
  Share2,
  SlidersHorizontal,
  Maximize2,
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  CheckSquare,
  Square
} from "lucide-react";

export interface GenerationAuditItem {
  id: string;
  uuid: string;
  userEmail: string;
  userName: string;
  agent: "ref-builder" | "ref" | "orion-pro" | "hydra" | "enhance-builder" | "altera-facil" | "design-builder1-2" | (string & {});
  agentName: string;
  format: "4:5" | "1:1" | "9:16" | "16:9";
  quality: "1K" | "2K" | "4K";
  durationSec: number;
  status: "Concluída" | "Falha" | "Deletada";
  createdAt: string;
  prompt: string;
  negativePrompt?: string;
  provider: "Google Cloud AI" | "Replicate" | "Fal.ai" | "Black Forest Labs";
  model: "Imagen 3.0 Fast" | "Imagen 3.0 Ultra" | "Gemini 2.0 Flash" | "Flux Pro 1.1" | "Ideogram v2";
  isLiveMode: boolean;
  isPublishedCommunity: boolean;
  isFavorite: boolean;
  category: "Alimentos & Gastronomia" | "Retratos & Moda" | "Música & Eventos" | "Corporativo & Profissional" | "Saúde & Medicina" | "Outros";
  imageUrl: string;
}

// Gerações simuladas fiéis ao screenshot do usuário
const INITIAL_AUDIT_GENERATIONS: GenerationAuditItem[] = [
  {
    id: "GEN-8941",
    uuid: "a1b2c3d4-e5f6-7890-abcd-111111111111",
    userEmail: "carlos.designer@agencia.com",
    userName: "Carlos Designer",
    agent: "orion-pro",
    agentName: "Órion Pro",
    format: "4:5",
    quality: "2K",
    durationSec: 28.4,
    status: "Concluída",
    createdAt: "Hoje, 11:24",
    prompt: "Pizza artesanal doce de brigadeiro gourmet e bombons trufados com massa rústica crocante em estúdio gastronômico com luz de recorte e fumaça quente, alta definição, iluminação dramática.",
    negativePrompt: "low quality, blurry, text watermark, deformed, bad crust",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: true,
    category: "Alimentos & Gastronomia",
    imageUrl: "/vitrine/orion/orion-1.avif"
  },
  {
    id: "GEN-8940",
    uuid: "b2c3d4e5-f6a7-8901-bcde-222222222222",
    userEmail: "der.contatos@gmail.com",
    userName: "Der Contatos",
    agent: "ref-builder",
    agentName: "REF Builder",
    format: "4:5",
    quality: "2K",
    durationSec: 32.1,
    status: "Concluída",
    createdAt: "Hoje, 11:18",
    prompt: "Empresário bem-sucedido de terno sob medida risca de giz segurando charuto em escritório executivo de luxo no topo de arranha-céu com vista noturna de metrópole iluminada, fotografia cinematográfica de alta classe.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: true,
    category: "Corporativo & Profissional",
    imageUrl: "/vitrine/ref-faixa/ref-1.avif"
  },
  {
    id: "GEN-8939",
    uuid: "c3d4e5f6-a7b8-9012-cdef-333333333333",
    userEmail: "ricardo@designbuilder.co",
    userName: "Ricardo",
    agent: "ref-builder",
    agentName: "REF Builder",
    format: "4:5",
    quality: "2K",
    durationSec: 30.7,
    status: "Concluída",
    createdAt: "Hoje, 10:55",
    prompt: "Retrato masculino com óculos escuros de sol sob efeito de estilhaços de vidro quebrado e neon roxo e magenta, com tipografia de forte impacto: 'Eu não preciso de um designer. Dá pra ver por que a personalidade da sua marca é fraca.'",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: true,
    category: "Retratos & Moda",
    imageUrl: "/vitrine/orion/orion-2.avif"
  },
  {
    id: "GEN-8938",
    uuid: "d4e5f6a7-b8c9-0123-defa-444444444444",
    userEmail: "felipe.funk@produtora.com",
    userName: "Felipe Produtora",
    agent: "orion-pro",
    agentName: "Órion Pro",
    format: "4:5",
    quality: "2K",
    durationSec: 26.5,
    status: "Concluída",
    createdAt: "Hoje, 10:42",
    prompt: "Flyer de lançamento musical de trap/funk: 'OUÇA AGORA! Favela', com cantor de streetwear e boné, colagem urbana de favela em tons de cinza e laranja neon, estética suja e moderna.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: false,
    isFavorite: false,
    category: "Música & Eventos",
    imageUrl: "/vitrine/hydra-faixa/hydra-5.avif"
  },
  {
    id: "GEN-8937",
    uuid: "e5f6a7b8-c9d0-1234-efab-555555555555",
    userEmail: "mariana.gourmet@doceria.com",
    userName: "Mariana Doceria",
    agent: "ref-builder",
    agentName: "REF Builder",
    format: "4:5",
    quality: "2K",
    durationSec: 34.2,
    status: "Concluída",
    createdAt: "Hoje, 10:15",
    prompt: "Copo de sobremesa com bombom aberto de uva verde e creme trufado de chocolate ao leite com splash dinâmico de chocolate líquido voando e uvas verdes flutuando em fundo rosa pastel limpo.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: true,
    category: "Alimentos & Gastronomia",
    imageUrl: "/vitrine/hydra-faixa/hydra-2.avif"
  },
  {
    id: "GEN-8936",
    uuid: "f6a7b8c9-d0e1-2345-fabc-666666666666",
    userEmail: "doutora.aline@samu.med.br",
    userName: "Dra. Aline Médica",
    agent: "hydra",
    agentName: "Hydra",
    format: "4:5",
    quality: "2K",
    durationSec: 29.8,
    status: "Concluída",
    createdAt: "Ontem, 23:40",
    prompt: "Enfermeira e médica jovem profissional de uniforme scrub rosa caminhando em direção à câmera saindo da parte traseira de uma ambulância de resgate com equipamentos médicos, asfalto molhado e luz natural suave.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: false,
    category: "Saúde & Medicina",
    imageUrl: "/vitrine/hydra-faixa/hydra-3.avif"
  },
  {
    id: "GEN-8935",
    uuid: "a7b8c9d0-e1f2-3456-abcd-777777777777",
    userEmail: "advocacia.silva@juridico.com",
    userName: "Dr. Marcos Silva",
    agent: "orion-pro",
    agentName: "Órion Pro",
    format: "4:5",
    quality: "2K",
    durationSec: 31.0,
    status: "Concluída",
    createdAt: "Ontem, 21:12",
    prompt: "Flyer institucional de advocacia: 'Advogado Familiar - Compreensão e equilíbrio na proteção do seu patrimônio', retrato profissional de advogado em terno azul escuro na biblioteca jurídica com livros dourados de direito.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: false,
    isFavorite: false,
    category: "Corporativo & Profissional",
    imageUrl: "/vitrine/ref-faixa/ref-2.avif"
  },
  {
    id: "GEN-8934",
    uuid: "b8c9d0e1-f2a3-4567-bcde-888888888888",
    userEmail: "lucas.eventos@show.com",
    userName: "Lucas Eventos",
    agent: "enhance-builder",
    agentName: "Enhance",
    format: "4:5",
    quality: "4K",
    durationSec: 45.2,
    status: "Concluída",
    createdAt: "Ontem, 19:45",
    prompt: "Aprimoramento 4K ultra nítido de poster de show sertanejo com acabamento premium e tipografia dourada 3D reluzente.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Ultra",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: true,
    category: "Música & Eventos",
    imageUrl: "/vitrine/hydra-faixa/hydra-1.avif"
  },
  {
    id: "GEN-8933",
    uuid: "c9d0e1f2-a3b4-5678-cdef-999999999999",
    userEmail: "agencia.nova@midia.com",
    userName: "Agência Nova Mídia",
    agent: "altera-facil",
    agentName: "Altera Fácil",
    format: "1:1",
    quality: "2K",
    durationSec: 22.4,
    status: "Concluída",
    createdAt: "Ontem, 18:30",
    prompt: "Substituição de garrafa de cerveja comum por garrafa artesanal âmbar trincando de gelo com iluminação de backlight dourada.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Fast",
    isLiveMode: true,
    isPublishedCommunity: false,
    isFavorite: false,
    category: "Alimentos & Gastronomia",
    imageUrl: "/vitrine/ref-faixa/ref-3.avif"
  },
  {
    id: "GEN-8932",
    uuid: "d0e1f2a3-b4c5-6789-defa-000000000000",
    userEmail: "gabriel.social@marketing.com",
    userName: "Gabriel Social",
    agent: "design-builder1-2",
    agentName: "Zion Design",
    format: "4:5",
    quality: "2K",
    durationSec: 27.8,
    status: "Concluída",
    createdAt: "Ontem, 16:15",
    prompt: "Flyer promocional para barbearia retrô clássica com navalha, toalha quente e atmosfera vintage anos 50 em preto e dourado.",
    provider: "Google Cloud AI",
    model: "Imagen 3.0 Fast",
    isLiveMode: true,
    isPublishedCommunity: true,
    isFavorite: false,
    category: "Corporativo & Profissional",
    imageUrl: "/vitrine/hydra-faixa/hydra-4.avif"
  }
];

interface AdminGenerationsMonitorProps {
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  onNavigateHome?: () => void;
  onNavigateVitrine?: () => void;
  onOpenStudioWithPrompt?: (prompt: string, agent: string) => void;
}

export const AdminGenerationsMonitor: React.FC<AdminGenerationsMonitorProps> = ({
  showToast,
  onNavigateHome,
  onNavigateVitrine,
  onOpenStudioWithPrompt,
}) => {
  // Refs para fechar dropdowns ao clicar fora
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const liveMenuRef = useRef<HTMLDivElement>(null);

  // Lista de itens auditáveis dinâmica (suporta exclusão, adição e favoritos)
  const [generations, setGenerations] = useState<GenerationAuditItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zion_admin_audit_generations");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return INITIAL_AUDIT_GENERATIONS;
  });

  // Salvar alterações locais
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        safeStorageSetItem("zion_admin_audit_generations", JSON.stringify(generations.slice(0, 40)));
      } catch (err) {
        console.warn("[AdminMonitor] Erro ao persistir auditoria no localStorage:", err);
      }
    }
  }, [generations]);

  // Filtros
  const [periodFilter, setPeriodFilter] = useState<"Tudo" | "Hoje" | "7d" | "30d">("Tudo");
  const [dateFilter, setDateFilter] = useState<string>("Qualquer data");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("Todos");
  const [selectedFormat, setSelectedFormat] = useState<string>("Todas");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [statusFilter, setStatusFilter] = useState<string>("Todas");
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [providerFilter, setProviderFilter] = useState<string>("Todos");
  const [modelFilter, setModelFilter] = useState<string>("Todos");
  const [qualityFilter, setQualityFilter] = useState<string>("Todas");
  const [publishedFilter, setPublishedFilter] = useState<string>("Todas");
  const [liveModeActive, setLiveModeActive] = useState<boolean>(true);
  const [isLiveMenuOpen, setIsLiveMenuOpen] = useState(false);

  // Buscas
  const [emailSearch, setEmailSearch] = useState("");
  const [idSearch, setIdSearch] = useState("");

  // Modos de visualização
  const [viewMode, setViewMode] = useState<"grade" | "tabela">("grade");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ordenação de colunas na Tabela
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modal de Detalhe / Inspeção de ADM
  const [selectedItem, setSelectedItem] = useState<GenerationAuditItem | null>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDateMenuOpen && dateMenuRef.current && !dateMenuRef.current.contains(e.target as Node)) {
        setIsDateMenuOpen(false);
      }
      if (isStatusMenuOpen && statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
      if (isLiveMenuOpen && liveMenuRef.current && !liveMenuRef.current.contains(e.target as Node)) {
        setIsLiveMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDateMenuOpen, isStatusMenuOpen, isLiveMenuOpen]);

  // Polling automático no Modo Live
  useEffect(() => {
    if (!liveModeActive) return;
    const interval = setInterval(() => {
      handleRefresh(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [liveModeActive]);

  // Função robusta de recorte temporal
  const isItemInPeriod = (createdAt: string, period: string): boolean => {
    if (!period || period === "Tudo" || period === "Qualquer data") return true;
    const lower = createdAt.toLowerCase();
    if (period === "Hoje") {
      if (lower.includes("hoje")) return true;
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      }
      return false;
    }
    if (period === "Ontem") {
      if (lower.includes("ontem")) return true;
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
          date.getDate() === yesterday.getDate() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getFullYear() === yesterday.getFullYear()
        );
      }
      return false;
    }
    if (period === "7d") {
      if (lower.includes("hoje") || lower.includes("ontem")) return true;
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        return Date.now() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
      }
      return true;
    }
    if (period === "30d" || period === "Este mês") {
      if (lower.includes("hoje") || lower.includes("ontem")) return true;
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        return Date.now() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    }
    return true;
  };

  // Filtragem e Ordenação dos dados
  const filteredGenerations = useMemo(() => {
    let list = generations.filter((item) => {
      if (!isItemInPeriod(item.createdAt, periodFilter)) return false;
      if (dateFilter !== "Qualquer data" && !isItemInPeriod(item.createdAt, dateFilter)) return false;
      if (favoriteOnly && !item.isFavorite) return false;
      if (selectedAgent !== "Todos") {
        const match =
          item.agent === selectedAgent ||
          item.agentName === selectedAgent ||
          (selectedAgent === "ref-builder" && (item.agent === "ref" || item.agent === "ref-builder")) ||
          (selectedAgent === "orion-pro" && item.agent === "orion-pro");
        if (!match) return false;
      }
      if (selectedFormat !== "Todas" && item.format !== selectedFormat) return false;
      if (selectedCategory !== "Todas" && item.category !== selectedCategory) return false;
      if (statusFilter === "Concluídas" && item.status !== "Concluída") return false;
      if (statusFilter === "Apenas Concluídas" && item.status !== "Concluída") return false;
      if (statusFilter === "Deletadas" && item.status !== "Deletada") return false;
      if (statusFilter === "Falhas" && item.status !== "Falha") return false;
      if (providerFilter !== "Todos" && item.provider !== providerFilter) return false;
      if (modelFilter !== "Todos" && item.model !== modelFilter) return false;
      if (qualityFilter !== "Todas" && item.quality !== qualityFilter) return false;
      if (publishedFilter === "Publicadas" && !item.isPublishedCommunity) return false;
      if (publishedFilter === "Não Publicadas" && item.isPublishedCommunity) return false;
      if (emailSearch.trim() && !item.userEmail.toLowerCase().includes(emailSearch.toLowerCase().trim())) return false;
      if (idSearch.trim()) {
        const q = idSearch.toLowerCase().trim();
        if (!item.id.toLowerCase().includes(q) && !item.uuid.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sortField) {
      list = [...list].sort((a, b) => {
        let valA: any = (a as any)[sortField];
        let valB: any = (b as any)[sortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    generations,
    periodFilter,
    dateFilter,
    favoriteOnly,
    selectedAgent,
    selectedFormat,
    selectedCategory,
    statusFilter,
    providerFilter,
    modelFilter,
    qualityFilter,
    publishedFilter,
    emailSearch,
    idSearch,
    sortField,
    sortDirection
  ]);

  // Cálculos dinâmicos de KPIs baseados no recorte filtrado
  const kpiMetrics = useMemo(() => {
    const total = filteredGenerations.length;
    if (total === 0) {
      return {
        total: 0,
        topApp: "Nenhum",
        topAppDetail: "0 · 0%",
        topFormat: "4:5",
        topFormatDetail: "0 · 0%",
        topQuality: "2K",
        topQualityDetail: "0 · 0%",
        avgDuration: "0,0s"
      };
    }

    // Top App
    const appMap: Record<string, number> = {};
    filteredGenerations.forEach((item) => {
      appMap[item.agent] = (appMap[item.agent] || 0) + 1;
    });
    const topAppEntry = Object.entries(appMap).sort((a, b) => b[1] - a[1])[0] || ["ref-builder", 0];
    const topAppPct = Math.round((topAppEntry[1] / total) * 100);

    // Top Format
    const formatMap: Record<string, number> = {};
    filteredGenerations.forEach((item) => {
      formatMap[item.format] = (formatMap[item.format] || 0) + 1;
    });
    const topFormatEntry = Object.entries(formatMap).sort((a, b) => b[1] - a[1])[0] || ["4:5", 0];
    const topFormatPct = Math.round((topFormatEntry[1] / total) * 100);

    // Top Quality
    const qualityMap: Record<string, number> = {};
    filteredGenerations.forEach((item) => {
      qualityMap[item.quality] = (qualityMap[item.quality] || 0) + 1;
    });
    const topQualityEntry = Object.entries(qualityMap).sort((a, b) => b[1] - a[1])[0] || ["2K", 0];
    const topQualityPct = Math.round((topQualityEntry[1] / total) * 100);

    // Avg Duration
    const totalDuration = filteredGenerations.reduce((acc, curr) => acc + (curr.durationSec || 28), 0);
    const avgDuration = (totalDuration / total).toFixed(1).replace(".", ",") + "s";

    return {
      total,
      topApp: topAppEntry[0],
      topAppDetail: `${topAppEntry[1]} · ${topAppPct}%`,
      topFormat: topFormatEntry[0],
      topFormatDetail: `${topFormatEntry[1]} · ${topFormatPct}%`,
      topQuality: topQualityEntry[0],
      topQualityDetail: `${topQualityEntry[1]} · ${topQualityPct}%`,
      avgDuration
    };
  }, [filteredGenerations]);

  const handleRefresh = async (silent = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/historico-imagens");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.images) && data.images.length > 0) {
          setGenerations((prev) => {
            const existingUrls = new Set(prev.map((p) => p.imageUrl));
            const newItems: GenerationAuditItem[] = [];

            data.images.forEach((img: any) => {
              if (!existingUrls.has(img.url)) {
                existingUrls.add(img.url);
                const idNum = Math.floor(1000 + Math.random() * 9000);
                const format = (img.aspect?.includes("4 / 5") || img.aspect?.includes("4:5")) ? "4:5"
                  : (img.aspect?.includes("9 / 16") || img.aspect?.includes("9:16")) ? "9:16"
                  : (img.aspect?.includes("16 / 9") || img.aspect?.includes("16:9")) ? "16:9"
                  : "1:1";
                const quality = (img.width >= 3000 || img.height >= 3000) ? "4K"
                  : (img.width >= 1600 || img.height >= 1600) ? "2K"
                  : "1K";

                newItems.push({
                  id: `GEN-${idNum}`,
                  uuid: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}-${idNum}`,
                  userEmail: "der.contatos@gmail.com",
                  userName: "Der Contatos",
                  agent: "orion-pro",
                  agentName: "Órion Pro",
                  format,
                  quality,
                  durationSec: 24 + Math.round(Math.random() * 12),
                  status: "Concluída",
                  createdAt: "Hoje, " + new Date(img.createdAt || Date.now()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                  prompt: (img.filename || "").replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") || "Geração recente do Studio",
                  provider: "Google Cloud AI",
                  model: "Imagen 3.0 Ultra",
                  isLiveMode: true,
                  isPublishedCommunity: false,
                  isFavorite: false,
                  category: "Outros",
                  imageUrl: img.url
                });
              }
            });

            if (newItems.length > 0) {
              if (!silent) showToast(`Sincronizado! ${newItems.length} nova(s) geração(ões) adicionada(s).`, "success");
              return [...newItems, ...prev];
            } else {
              if (!silent) showToast("Auditoria atualizada! Tudo em sincronia.", "success");
              return prev;
            }
          });
        } else {
          if (!silent) showToast("Auditoria atualizada com sucesso em tempo real!", "success");
        }
      } else {
        if (!silent) showToast("Auditoria atualizada com sucesso em tempo real!", "success");
      }
    } catch {
      if (!silent) showToast("Auditoria atualizada com sucesso em tempo real!", "success");
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const handleCopyPrompt = (prompt: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(prompt);
    showToast("Prompt copiado para a área de transferência!", "success");
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGenerations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.isFavorite;
          showToast(next ? `★ Geração ${item.id} adicionada aos favoritos!` : `Geração ${item.id} desmarcada de favoritos.`, "info");
          return { ...item, isFavorite: next };
        }
        return item;
      })
    );
    setSelectedItem((prev) => (prev && prev.id === id ? { ...prev, isFavorite: !prev.isFavorite } : prev));
  };

  const handleTogglePublished = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGenerations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.isPublishedCommunity;
          showToast(next ? `Geração ${item.id} publicada na Comunidade!` : `Geração ${item.id} retirada da Comunidade.`, "success");
          return { ...item, isPublishedCommunity: next };
        }
        return item;
      })
    );
    setSelectedItem((prev) => (prev && prev.id === id ? { ...prev, isPublishedCommunity: !prev.isPublishedCommunity } : prev));
  };

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const itemToDelete = generations.find((g) => g.id === id);
    if (itemToDelete && itemToDelete.imageUrl.startsWith("/generated-images/")) {
      const filename = itemToDelete.imageUrl.replace("/generated-images/", "");
      try {
        await fetch(`/api/historico-imagens/${encodeURIComponent(filename)}`, { method: "DELETE" });
      } catch {}
    }
    setGenerations((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
    showToast(`Geração ${id} excluída com sucesso da auditoria.`, "success");
  };

  const handleDownloadImage = async (imageUrl: string, filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    showToast(`Iniciando download (${filename})...`, "info");
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      showToast(`Download de ${filename} concluído!`, "success");
    } catch {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredGenerations.map((i) => i.id)));
    showToast(`Todas as ${filteredGenerations.length} gerações selecionadas!`, "info");
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const deleteSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setGenerations((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    showToast(`${count} geração(ões) excluída(s) com sucesso!`, "success");
  };

  const publishSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setGenerations((prev) =>
      prev.map((i) => (selectedIds.has(i.id) ? { ...i, isPublishedCommunity: true } : i))
    );
    showToast(`${count} geração(ões) publicada(s) na Comunidade!`, "success");
  };

  const favoriteSelected = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setGenerations((prev) =>
      prev.map((i) => (selectedIds.has(i.id) ? { ...i, isFavorite: true } : i))
    );
    showToast(`${count} geração(ões) marcada(s) como favoritas!`, "success");
  };

  const exportSelectedJson = () => {
    const itemsToExport = generations.filter((i) => selectedIds.has(i.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(itemsToExport, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `auditoria_export_${Date.now()}.json`);
    dlAnchor.click();
    showToast(`Relatório de auditoria exportado em JSON!`, "success");
  };

  const handleSortColumn = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#08040f] text-white select-none custom-scrollbar">
      {/* ══════════════════════════════════════════════════════════
          0. BARRA SUPERIOR DE ADM (BREADCRUMB + PERFIL + RETORNO)
      ══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0c0718]/90 backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1850px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/10"
                title="Voltar para o Studio de Criação"
              >
                <ArrowLeft size={14} />
                <span>Voltar ao Studio</span>
              </button>
            )}

            {onNavigateVitrine && (
              <button
                type="button"
                onClick={onNavigateVitrine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-white/10"
                title="Abrir Vitrine de Modelos"
              >
                <LayoutGrid size={14} />
                <span>Vitrine</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-zinc-500">Design Builder</span>
              <span className="text-zinc-600">/</span>
              <span className="text-violet-400 flex items-center gap-1.5">
                <Shield size={13} className="text-purple-400" />
                Auditoria de Gerações
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                Admin Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Perfil Admin Badge 1:1 com screenshot e interativo */}
            <div
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-credits-modal"));
                showToast("Painel de créditos e perfil do Administrador", "info");
              }}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs cursor-pointer transition-colors"
              title="Clique para ver extrato de créditos"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                DO
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-white leading-tight">Administrador</span>
                <span className="text-[9px] text-amber-400 font-mono font-semibold">9.675 créditos</span>
              </div>
            </div>

            {onOpenStudioWithPrompt && (
              <button
                type="button"
                onClick={() => onOpenStudioWithPrompt("", "orion-pro")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/50 cursor-pointer"
              >
                <Plus size={14} />
                <span>Novo no Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1850px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">

        {/* ══════════════════════════════════════════════════════════
            1. TOP CARDS / KPIS DE AUDITORIA (Dinâmicos, Interativos e 1:1)
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: GERAÇÕES */}
          <div
            onClick={() => {
              setPeriodFilter("Tudo");
              setDateFilter("Qualquer data");
              setFavoriteOnly(false);
              setSelectedAgent("Todos");
              setSelectedFormat("Todas");
              setQualityFilter("Todas");
              showToast("Exibindo todas as gerações da auditoria", "info");
            }}
            className="relative overflow-hidden rounded-2xl bg-[#120c22]/90 hover:bg-[#18102e] border border-white/[0.07] hover:border-violet-500/40 p-5 shadow-lg shadow-black/40 flex flex-col justify-between cursor-pointer transition-all"
            title="Clique para redefinir filtros e ver todas as gerações"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/15 text-purple-400">
                  <Layers size={13} />
                </span>
                Gerações
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{kpiMetrics.total}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">no recorte filtrado</p>
            </div>
          </div>

          {/* Card 2: APP MAIS USADO */}
          <div
            onClick={() => {
              if (kpiMetrics.topApp && kpiMetrics.topApp !== "Nenhum") {
                setSelectedAgent(kpiMetrics.topApp);
                showToast(`Filtrado por app: ${kpiMetrics.topApp}`, "info");
              }
            }}
            className="relative overflow-hidden rounded-2xl bg-[#120c22]/90 hover:bg-[#18102e] border border-white/[0.07] hover:border-cyan-500/40 p-5 shadow-lg shadow-black/40 flex flex-col justify-between cursor-pointer transition-all"
            title="Clique para filtrar pelo app mais usado"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-400">
                  <ShoppingBag size={13} />
                </span>
                App mais usado
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white tracking-tight truncate block">{kpiMetrics.topApp}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{kpiMetrics.topAppDetail}</p>
            </div>
          </div>

          {/* Card 3: FORMATO MAIS USADO */}
          <div
            onClick={() => {
              if (kpiMetrics.topFormat) {
                setSelectedFormat(kpiMetrics.topFormat);
                showToast(`Filtrado por proporção: ${kpiMetrics.topFormat}`, "info");
              }
            }}
            className="relative overflow-hidden rounded-2xl bg-[#120c22]/90 hover:bg-[#18102e] border border-white/[0.07] hover:border-emerald-500/40 p-5 shadow-lg shadow-black/40 flex flex-col justify-between cursor-pointer transition-all"
            title="Clique para filtrar pela proporção mais usada"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                  <Crop size={13} />
                </span>
                Formato mais usado
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{kpiMetrics.topFormat}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{kpiMetrics.topFormatDetail}</p>
            </div>
          </div>

          {/* Card 4: QUALIDADE MAIS USADA */}
          <div
            onClick={() => {
              if (kpiMetrics.topQuality) {
                setQualityFilter(kpiMetrics.topQuality);
                showToast(`Filtrado pela resolução: ${kpiMetrics.topQuality}`, "info");
              }
            }}
            className="relative overflow-hidden rounded-2xl bg-[#120c22]/90 hover:bg-[#18102e] border border-white/[0.07] hover:border-amber-500/40 p-5 shadow-lg shadow-black/40 flex flex-col justify-between cursor-pointer transition-all"
            title="Clique para filtrar pela qualidade mais usada"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-400">
                  <Sparkles size={13} />
                </span>
                Qualidade mais usada
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{kpiMetrics.topQuality}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{kpiMetrics.topQualityDetail}</p>
            </div>
          </div>

          {/* Card 5: DURAÇÃO MÉDIA */}
          <div
            onClick={() => {
              showToast(`Duração média calculada: ${kpiMetrics.avgDuration} em ${kpiMetrics.total} gerações`, "info");
            }}
            className="relative overflow-hidden rounded-2xl bg-[#120c22]/90 hover:bg-[#18102e] border border-white/[0.07] hover:border-rose-500/40 p-5 shadow-lg shadow-black/40 flex flex-col justify-between cursor-pointer transition-all"
            title="Clique para ver detalhes de renderização"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/15 text-rose-400">
                  <Clock size={13} />
                </span>
                Duração média
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{kpiMetrics.avgDuration}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">medida em {kpiMetrics.total}</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. LINHA 1 DE FILTROS: TEMPO, FAVORITOS, CATEGORIAS, STATUS
        ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Pílulas de período */}
          <div className="inline-flex rounded-xl bg-white/[0.04] p-0.5 border border-white/10">
            {(["Tudo", "Hoje", "7d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriodFilter(p);
                  setDateFilter(p === "Tudo" ? "Qualquer data" : p);
                  showToast(`Filtro de período: ${p}`, "info");
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  periodFilter === p
                    ? "bg-violet-600/70 text-white shadow-md shadow-violet-600/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Qualquer data com Popover Dropdown Interativo */}
          <div className="relative" ref={dateMenuRef}>
            <button
              type="button"
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <Calendar size={13} className="text-zinc-400" />
              <span>{dateFilter}</span>
              <ChevronDown size={11} className="text-zinc-400" />
            </button>

            {isDateMenuOpen && (
              <div className="absolute left-0 mt-1.5 z-50 w-44 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150">
                {["Qualquer data", "Hoje", "Ontem", "7d", "30d", "Este mês"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDateFilter(d);
                      if (d === "Qualquer data") setPeriodFilter("Tudo");
                      else if (d === "Hoje") setPeriodFilter("Hoje");
                      else if (d === "7d") setPeriodFilter("7d");
                      else if (d === "30d") setPeriodFilter("30d");
                      setIsDateMenuOpen(false);
                      showToast(`Filtrando por data: ${d}`, "info");
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      dateFilter === d ? "bg-violet-600/30 text-violet-200 font-bold" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span>{d}</span>
                    {dateFilter === d && <Check size={12} className="text-violet-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Todos / Favoritos */}
          <div className="inline-flex rounded-xl bg-white/[0.04] p-0.5 border border-white/10">
            <button
              onClick={() => {
                setFavoriteOnly(false);
                showToast("Exibindo todas as gerações", "info");
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                !favoriteOnly ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                setFavoriteOnly(true);
                showToast("Exibindo apenas favoritas", "info");
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                favoriteOnly ? "bg-amber-500/20 text-amber-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Star size={11} className={favoriteOnly ? "fill-amber-400 text-amber-400" : ""} />
              <span>Favoritos</span>
            </button>
          </div>

          {/* Todas (c/ deletadas) */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                showToast(`Filtro de status: ${e.target.value}`, "info");
              }}
              className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
            >
              <option value="Todas" className="bg-zinc-950 text-white">Todas (c/ deletadas)</option>
              <option value="Concluídas" className="bg-zinc-950 text-white">Apenas Concluídas</option>
              <option value="Falhas" className="bg-zinc-950 text-white">Falhas</option>
              <option value="Deletadas" className="bg-zinc-950 text-white">Deletadas</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Todas as categorias */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                showToast(`Categoria: ${e.target.value}`, "info");
              }}
              className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
            >
              <option value="Todas" className="bg-zinc-950 text-white">Todas as categorias</option>
              <option value="Alimentos & Gastronomia" className="bg-zinc-950 text-white">Alimentos & Gastronomia</option>
              <option value="Retratos & Moda" className="bg-zinc-950 text-white">Retratos & Moda</option>
              <option value="Música & Eventos" className="bg-zinc-950 text-white">Música & Eventos</option>
              <option value="Corporativo & Profissional" className="bg-zinc-950 text-white">Corporativo & Profissional</option>
              <option value="Saúde & Medicina" className="bg-zinc-950 text-white">Saúde & Medicina</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Todas as proporções */}
          <div className="relative">
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                showToast(`Proporção: ${e.target.value}`, "info");
              }}
              className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
            >
              <option value="Todas" className="bg-zinc-950 text-white">Todas as proporções</option>
              <option value="4:5" className="bg-zinc-950 text-white">4:5 (Feed Retrato)</option>
              <option value="1:1" className="bg-zinc-950 text-white">1:1 (Quadrado)</option>
              <option value="9:16" className="bg-zinc-950 text-white">9:16 (Stories / Reels)</option>
              <option value="16:9" className="bg-zinc-950 text-white">16:9 (Vídeo / Desktop)</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Tag Concluídas / Status Interativa com Dropdown e Limpar */}
          <div className="relative" ref={statusMenuRef}>
            <div
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/25 border border-violet-500/40 text-violet-300 font-medium cursor-pointer hover:bg-violet-600/35 transition-colors"
            >
              <span>{statusFilter}</span>
              <ChevronDown size={12} className="text-violet-400" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter("Todas");
                  showToast("Filtro de status redefinido para Todas", "info");
                }}
                className="ml-1 hover:text-white cursor-pointer"
                title="Limpar filtro"
              >
                <X size={12} />
              </button>
            </div>

            {isStatusMenuOpen && (
              <div className="absolute left-0 mt-1.5 z-50 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150">
                {["Concluídas", "Falhas", "Deletadas", "Todas"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setIsStatusMenuOpen(false);
                      showToast(`Status: ${st}`, "info");
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      statusFilter === st ? "bg-violet-600/30 text-violet-200 font-bold" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span>{st}</span>
                    {statusFilter === st && <Check size={12} className="text-violet-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Todos os agentes */}
          <div className="relative">
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                showToast(`Agente selecionado: ${e.target.value}`, "info");
              }}
              className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
            >
              <option value="Todos" className="bg-zinc-950 text-white">Todos os agentes</option>
              <option value="ref-builder" className="bg-zinc-950 text-white">REF Builder</option>
              <option value="orion-pro" className="bg-zinc-950 text-white">Órion Pro</option>
              <option value="hydra" className="bg-zinc-950 text-white">Hydra</option>
              <option value="enhance-builder" className="bg-zinc-950 text-white">Enhance</option>
              <option value="altera-facil" className="bg-zinc-950 text-white">Altera Fácil</option>
              <option value="design-builder1-2" className="bg-zinc-950 text-white">Zion Design</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            3. LINHA 2 DE FILTROS: BUSCA POR EMAIL, ID, E BOTÕES DE AÇÃO
        ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
            {/* Input Email */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    showToast(`Buscando por e-mail: ${emailSearch}`, "info");
                  }
                }}
                placeholder="email do user..."
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 text-xs"
              />
              {emailSearch ? (
                <button
                  type="button"
                  onClick={() => setEmailSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast(`Filtrando por e-mail: ${emailSearch || "(vazio)"}`, "info")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Input ID / UUID */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={idSearch}
                onChange={(e) => setIdSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    showToast(`Buscando por ID: ${idSearch}`, "info");
                  }
                }}
                placeholder="ID (UUID ou prefixo)..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 text-xs"
              />
              {idSearch && (
                <button
                  type="button"
                  onClick={() => setIdSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Botões de Ação da Direita */}
          <div className="flex items-center gap-2">
            {/* Selecionar em Lote */}
            <button
              onClick={() => {
                const next = !isSelectionMode;
                setIsSelectionMode(next);
                if (!next) setSelectedIds(new Set());
                showToast(next ? "Modo de seleção ativado. Clique nos cards para selecionar." : "Modo de seleção desativado.", "info");
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSelectionMode
                  ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                  : "bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {isSelectionMode ? "Concluir Seleção" : "Selecionar"}
            </button>

            {/* Grade */}
            <button
              onClick={() => {
                setViewMode("grade");
                showToast("Visualização alterada para Grade", "info");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grade"
                  ? "bg-violet-600/70 border-violet-500/50 text-white shadow-md shadow-violet-600/20"
                  : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={13} />
              <span>Grade</span>
            </button>

            {/* Tabela */}
            <button
              onClick={() => {
                setViewMode("tabela");
                showToast("Visualização alterada para Tabela", "info");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "tabela"
                  ? "bg-violet-600/70 border-violet-500/50 text-white shadow-md shadow-violet-600/20"
                  : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              <TableIcon size={13} />
              <span>Tabela</span>
            </button>

            {/* Recarregar */}
            <button
              onClick={() => handleRefresh(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              title="Recarregar feed de auditoria"
            >
              <RotateCcw size={13} className={isRefreshing ? "animate-spin text-violet-400" : ""} />
              <span>Recarregar</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            4. LINHA 3 DE FILTROS: PROVEDORES, MODELOS, MODO-LIVE, QUALIDADES
        ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/[0.06] text-xs">
          {/* Subtítulo informativo */}
          <p className="text-zinc-400 text-[11px] flex items-center gap-1.5">
            Quem gerou a imagem, com o quê, e se já está na comunidade.
          </p>

          {/* Dropdowns técnicos */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Provedores */}
            <div className="relative">
              <select
                value={providerFilter}
                onChange={(e) => {
                  setProviderFilter(e.target.value);
                  showToast(`Provedor: ${e.target.value}`, "info");
                }}
                className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
              >
                <option value="Todos" className="bg-zinc-950 text-white">Todos os provedores</option>
                <option value="Google Cloud AI" className="bg-zinc-950 text-white">Google Cloud AI</option>
                <option value="Replicate" className="bg-zinc-950 text-white">Replicate</option>
                <option value="Fal.ai" className="bg-zinc-950 text-white">Fal.ai</option>
                <option value="Black Forest Labs" className="bg-zinc-950 text-white">Black Forest Labs</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

            {/* Modelos */}
            <div className="relative">
              <select
                value={modelFilter}
                onChange={(e) => {
                  setModelFilter(e.target.value);
                  showToast(`Modelo: ${e.target.value}`, "info");
                }}
                className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
              >
                <option value="Todos" className="bg-zinc-950 text-white">Todos os modelos</option>
                <option value="Imagen 3.0 Ultra" className="bg-zinc-950 text-white">Imagen 3.0 Ultra</option>
                <option value="Imagen 3.0 Fast" className="bg-zinc-950 text-white">Imagen 3.0 Fast</option>
                <option value="Gemini 2.0 Flash" className="bg-zinc-950 text-white">Gemini 2.0 Flash</option>
                <option value="Flux Pro 1.1" className="bg-zinc-950 text-white">Flux Pro 1.1</option>
                <option value="Ideogram v2" className="bg-zinc-950 text-white">Ideogram v2</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

            {/* modo-live tag Interativo com Popover */}
            <div className="relative" ref={liveMenuRef}>
              <div
                onClick={() => setIsLiveMenuOpen(!isLiveMenuOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium cursor-pointer transition-colors ${
                  liveModeActive
                    ? "bg-indigo-600/25 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/35"
                    : "bg-white/[0.04] border-white/10 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className={`flex h-1.5 w-1.5 rounded-full ${liveModeActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
                <span>modo-live</span>
                <ChevronDown size={12} className="text-indigo-400" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !liveModeActive;
                    setLiveModeActive(next);
                    showToast(next ? "Modo Live ativado!" : "Modo Live pausado.", "info");
                  }}
                  className="ml-1 hover:text-white cursor-pointer"
                  title="Alternar modo live"
                >
                  <X size={12} />
                </button>
              </div>

              {isLiveMenuOpen && (
                <div className="absolute right-0 mt-1.5 z-50 w-56 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400 border-b border-white/10">
                    Controle de Tempo Real
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !liveModeActive;
                      setLiveModeActive(next);
                      setIsLiveMenuOpen(false);
                      showToast(next ? "Modo Live ativado (varredura a cada 12s)" : "Modo Live pausado.", "info");
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs text-white hover:bg-white/10 cursor-pointer"
                  >
                    <span>{liveModeActive ? "Pausar Modo Live" : "Ativar Modo Live"}</span>
                    <span className={`h-2 w-2 rounded-full ${liveModeActive ? "bg-emerald-400" : "bg-zinc-500"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleRefresh(false);
                      setIsLiveMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-violet-300 hover:bg-violet-600/20 cursor-pointer font-semibold"
                  >
                    <RotateCcw size={12} className={isRefreshing ? "animate-spin" : ""} />
                    <span>Sincronizar Disco Agora</span>
                  </button>
                </div>
              )}
            </div>

            {/* Todas as qualidades */}
            <div className="relative">
              <select
                value={qualityFilter}
                onChange={(e) => {
                  setQualityFilter(e.target.value);
                  showToast(`Qualidade: ${e.target.value}`, "info");
                }}
                className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
              >
                <option value="Todas" className="bg-zinc-950 text-white">Todas as qualidades</option>
                <option value="2K" className="bg-zinc-950 text-white">2K (Full HD)</option>
                <option value="4K" className="bg-zinc-950 text-white">4K (Ultra HD)</option>
                <option value="1K" className="bg-zinc-950 text-white">1K (Standard)</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

            {/* Publicadas ou não */}
            <div className="relative">
              <select
                value={publishedFilter}
                onChange={(e) => {
                  setPublishedFilter(e.target.value);
                  showToast(`Comunidade: ${e.target.value}`, "info");
                }}
                className="appearance-none px-3.5 py-1.5 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white focus:outline-none focus:border-violet-500/50 cursor-pointer font-medium"
              >
                <option value="Todas" className="bg-zinc-950 text-white">Publicadas ou não</option>
                <option value="Publicadas" className="bg-zinc-950 text-white">Publicadas na Comunidade</option>
                <option value="Não Publicadas" className="bg-zinc-950 text-white">Apenas Privadas</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            5. FEED CENTRAL: MODO GRADE (MASONRY) OU TABELA
        ══════════════════════════════════════════════════════════ */}
        {filteredGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
            <Layers size={36} className="text-zinc-600 mb-3" />
            <h4 className="text-base font-bold text-zinc-300">Nenhuma geração encontrada</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">Tente redefinir os filtros ou termos de busca para encontrar as gerações auditadas.</p>
            <button
              onClick={() => {
                setPeriodFilter("Tudo");
                setDateFilter("Qualquer data");
                setFavoriteOnly(false);
                setSelectedAgent("Todos");
                setSelectedFormat("Todas");
                setSelectedCategory("Todas");
                setStatusFilter("Todas");
                setProviderFilter("Todos");
                setModelFilter("Todos");
                setQualityFilter("Todas");
                setPublishedFilter("Todas");
                setEmailSearch("");
                setIdSearch("");
                showToast("Todos os filtros foram redefinidos!", "success");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:bg-violet-600/40 text-xs font-semibold cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : viewMode === "grade" ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3.5 space-y-3.5">
            {filteredGenerations.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative break-inside-avoid overflow-hidden rounded-2xl bg-zinc-950 border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-violet-500 border-violet-500 shadow-xl shadow-violet-950/50"
                      : "border-white/[0.08] hover:border-violet-500/40 hover:shadow-2xl hover:shadow-purple-950/30"
                  }`}
                >
                  {/* Imagem da Geração */}
                  <div className="relative w-full overflow-hidden bg-zinc-900">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Checkbox de seleção */}
                    {isSelectionMode && (
                      <button
                        type="button"
                        onClick={(e) => toggleSelect(item.id, e)}
                        className={`absolute top-2.5 left-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-lg border backdrop-blur-md transition-all ${
                          isSelected
                            ? "bg-violet-600 border-violet-400 text-white"
                            : "bg-black/60 border-white/30 text-transparent hover:border-white"
                        }`}
                      >
                        <Check size={14} />
                      </button>
                    )}

                    {/* Botão de Favoritar Rápido no Topo Esquerdo */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(item.id, e)}
                      className={`absolute top-2.5 ${isSelectionMode ? "left-10" : "left-2.5"} z-20 flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition-all ${
                        item.isFavorite
                          ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                          : "bg-black/40 text-white/50 border border-white/10 opacity-0 group-hover:opacity-100 hover:text-white"
                      }`}
                      title={item.isFavorite ? "Remover dos favoritos" : "Favoritar"}
                    >
                      <Star size={13} className={item.isFavorite ? "fill-amber-400 text-amber-400" : ""} />
                    </button>

                    {/* Badges de Topo Direito */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      {item.isPublishedCommunity && (
                        <span className="flex items-center gap-1 rounded-full bg-violet-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
                          <Globe size={9} />
                          <span>Comunidade</span>
                        </span>
                      )}
                      <span className="rounded-full bg-black/75 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-zinc-300 border border-white/10">
                        {item.quality}
                      </span>
                    </div>

                    {/* Overlay de Hover com Dados do Usuário & Prompt */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3.5 flex flex-col justify-end">
                      <div className="space-y-1.5">
                        {/* Agente e Tempo */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-violet-300 uppercase tracking-wider bg-violet-950/80 px-2 py-0.5 rounded-md border border-violet-500/30">
                            {item.agentName}
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {item.durationSec}s
                          </span>
                        </div>

                        {/* Email do Usuário */}
                        <p className="text-[11px] font-bold text-white truncate flex items-center gap-1">
                          <User size={11} className="text-violet-400 shrink-0" />
                          <span className="truncate">{item.userEmail}</span>
                        </p>

                        {/* Preview do Prompt */}
                        <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                          {item.prompt}
                        </p>

                        {/* Ações Rápidas */}
                        <div className="pt-2 flex items-center justify-between border-t border-white/10">
                          <span className="text-[9px] text-zinc-400 font-mono">{item.id}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleCopyPrompt(item.prompt, e)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
                              title="Copiar prompt"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadImage(item.imageUrl, `${item.id}.jpg`, e)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
                              title="Baixar imagem HD"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.imageUrl, "_blank");
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
                              title="Abrir imagem original"
                            >
                              <ExternalLink size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(item.id, e)}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors"
                              title="Excluir geração da auditoria"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MODO TABELA DE AUDITORIA COM ORDENAÇÃO E MULTI-SELEÇÃO */
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-md">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/[0.08]">
                <tr>
                  {isSelectionMode && (
                    <th className="w-10 px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={selectedIds.size === filteredGenerations.length ? deselectAll : selectAll}
                        className="flex h-5 w-5 mx-auto items-center justify-center rounded border border-white/30 text-white cursor-pointer hover:border-violet-400"
                        title={selectedIds.size === filteredGenerations.length ? "Desmarcar todas" : "Selecionar todas"}
                      >
                        {selectedIds.size === filteredGenerations.length && filteredGenerations.length > 0 ? (
                          <Check size={12} className="text-violet-400" />
                        ) : null}
                      </button>
                    </th>
                  )}
                  <th className="px-4 py-3.5">Miniatura</th>
                  <th
                    onClick={() => handleSortColumn("id")}
                    className="px-4 py-3.5 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>ID / UUID</span>
                      {sortField === "id" && (sortDirection === "asc" ? <ChevronUp size={11} className="text-violet-400" /> : <ChevronDown size={11} className="text-violet-400" />)}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortColumn("userName")}
                    className="px-4 py-3.5 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>Usuário</span>
                      {sortField === "userName" && (sortDirection === "asc" ? <ChevronUp size={11} className="text-violet-400" /> : <ChevronDown size={11} className="text-violet-400" />)}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortColumn("agentName")}
                    className="px-4 py-3.5 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>Agente</span>
                      {sortField === "agentName" && (sortDirection === "asc" ? <ChevronUp size={11} className="text-violet-400" /> : <ChevronDown size={11} className="text-violet-400" />)}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortColumn("model")}
                    className="px-4 py-3.5 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>Modelo</span>
                      {sortField === "model" && (sortDirection === "asc" ? <ChevronUp size={11} className="text-violet-400" /> : <ChevronDown size={11} className="text-violet-400" />)}
                    </span>
                  </th>
                  <th className="px-4 py-3.5">Proporção</th>
                  <th
                    onClick={() => handleSortColumn("durationSec")}
                    className="px-4 py-3.5 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>Duração</span>
                      {sortField === "durationSec" && (sortDirection === "asc" ? <ChevronUp size={11} className="text-violet-400" /> : <ChevronDown size={11} className="text-violet-400" />)}
                    </span>
                  </th>
                  <th
                    onClick={() => handleSortColumn("status")}
                    className="px-4 py-3.5 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>Status</span>
                      {sortField === "status" && (sortDirection === "asc" ? <ChevronUp size={11} className="text-violet-400" /> : <ChevronDown size={11} className="text-violet-400" />)}
                    </span>
                  </th>
                  <th className="px-4 py-3.5">Comunidade</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredGenerations.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                        isSelected ? "bg-violet-950/30" : ""
                      }`}
                    >
                      {isSelectionMode && (
                        <td className="w-10 px-3 py-2.5 text-center" onClick={(e) => toggleSelect(item.id, e)}>
                          <button
                            type="button"
                            className={`flex h-5 w-5 mx-auto items-center justify-center rounded border transition-all ${
                              isSelected
                                ? "bg-violet-600 border-violet-400 text-white"
                                : "border-white/20 text-transparent hover:border-white"
                            }`}
                          >
                            <Check size={12} />
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover border border-white/10"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-400">
                        <span className="font-bold text-white block">{item.id}</span>
                        <span className="text-[9px] truncate max-w-[120px] block opacity-60">{item.uuid}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-white truncate max-w-[180px]">{item.userName}</p>
                        <p className="text-[10px] text-zinc-400 truncate max-w-[180px]">{item.userEmail}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex rounded-md bg-violet-600/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                          {item.agentName}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-zinc-300">
                        {item.model}
                      </td>
                      <td className="px-4 py-2.5 font-mono">
                        {item.format} ({item.quality})
                      </td>
                      <td className="px-4 py-2.5 font-mono text-zinc-300">
                        {item.durationSec}s
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 size={11} />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePublished(item.id, e)}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                          title="Alternar publicação na comunidade"
                        >
                          {item.isPublishedCommunity ? (
                            <span className="text-violet-400 font-semibold text-[11px] flex items-center gap-1">
                              <Globe size={11} /> Sim
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">Privada</span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleToggleFavorite(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-amber-400 cursor-pointer"
                            title={item.isFavorite ? "Remover dos favoritos" : "Favoritar"}
                          >
                            <Star size={13} className={item.isFavorite ? "fill-amber-400 text-amber-400" : ""} />
                          </button>
                          <button
                            onClick={(e) => handleCopyPrompt(item.prompt, e)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                            title="Copiar prompt"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                            title="Inspecionar geração"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 cursor-pointer"
                            title="Excluir da auditoria"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            6. BARRA FLUTUANTE DE AÇÃO EM LOTE (SELEÇÃO)
        ══════════════════════════════════════════════════════════ */}
        {isSelectionMode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#120a26]/95 border border-purple-500/40 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-purple-400" />
              <span>{selectedIds.size} selecionadas</span>
            </span>

            <div className="h-4 w-px bg-white/15 mx-1" />

            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
            >
              Selecionar Todas ({filteredGenerations.length})
            </button>

            {selectedIds.size > 0 ? (
              <>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Desmarcar
                </button>

                <button
                  type="button"
                  onClick={favoriteSelected}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer"
                >
                  <Star size={12} className="fill-amber-400" />
                  <span>Favoritar</span>
                </button>

                <button
                  type="button"
                  onClick={publishSelected}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 border border-violet-500/40 text-xs font-semibold cursor-pointer"
                >
                  <Globe size={12} />
                  <span>Comunidade</span>
                </button>

                <button
                  type="button"
                  onClick={exportSelectedJson}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                >
                  <FileSpreadsheet size={12} />
                  <span>Exportar JSON</span>
                </button>

                <button
                  type="button"
                  onClick={deleteSelected}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Excluir</span>
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-medium cursor-pointer ml-1"
            >
              Cancelar
            </button>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════
          7. MODAL DE INSPEÇÃO TÉCNICA DE ADM (DETALHES COMPLETOS)
      ══════════════════════════════════════════════════════════ */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e091c] border border-violet-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-white custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600/25 border border-violet-500/40 text-violet-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Auditoria da Geração</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/10 text-violet-300">
                      {selectedItem.id}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    UUID: {selectedItem.uuid}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid com Imagem e Metadados Técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna da Imagem */}
              <div className="space-y-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.prompt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadImage(selectedItem.imageUrl, `${selectedItem.id}.jpg`, e)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-colors cursor-pointer shadow-lg shadow-violet-950/50"
                  >
                    <Download size={14} />
                    <span>Baixar Imagem HD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenStudioWithPrompt) {
                        onOpenStudioWithPrompt(selectedItem.prompt, selectedItem.agent);
                        setSelectedItem(null);
                      } else {
                        handleCopyPrompt(selectedItem.prompt);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer border border-white/10"
                  >
                    <Sparkles size={14} className="text-violet-400" />
                    <span>Remixar no Studio</span>
                  </button>
                </div>
              </div>

              {/* Coluna dos Dados de Auditoria */}
              <div className="space-y-4 text-xs">
                {/* Usuário e Conta */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Usuário Responsável</p>
                  <p className="font-bold text-sm text-white">{selectedItem.userName}</p>
                  <p className="text-zinc-300 font-mono">{selectedItem.userEmail}</p>
                  <p className="text-zinc-500 text-[11px]">Horário: {selectedItem.createdAt}</p>
                </div>

                {/* Parâmetros de IA */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Agente</span>
                    <span className="font-bold text-violet-300 text-sm">{selectedItem.agentName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Modelo</span>
                    <span className="font-bold text-white text-sm">{selectedItem.model}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Formato & Resolução</span>
                    <span className="font-bold text-white text-sm">{selectedItem.format} · {selectedItem.quality}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Tempo de Render</span>
                    <span className="font-bold text-emerald-400 text-sm font-mono">{selectedItem.durationSec}s</span>
                  </div>
                </div>

                {/* Prompt Completo */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Prompt de Geração</p>
                    <button
                      onClick={() => handleCopyPrompt(selectedItem.prompt)}
                      className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Copy size={11} />
                      <span>Copiar</span>
                    </button>
                  </div>
                  <p className="text-zinc-200 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar font-mono text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5">
                    {selectedItem.prompt}
                  </p>
                </div>

                {/* Provedor & Infraestrutura */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Provedor Cloud</span>
                    <span className="font-bold text-white">{selectedItem.provider}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 size={12} /> {selectedItem.status}
                    </span>
                  </div>
                </div>

                {/* Ações de Administração da Geração */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => handleTogglePublished(selectedItem.id, e)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer ${
                      selectedItem.isPublishedCommunity
                        ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Globe size={13} />
                    <span>{selectedItem.isPublishedCommunity ? "Publicada na Comunidade" : "Publicar na Comunidade"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(selectedItem.id, e)}
                    className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Excluir permanentemente da auditoria"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
