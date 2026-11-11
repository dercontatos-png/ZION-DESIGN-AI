import React, { useState, useEffect } from "react";
import {
  Shield,
  BarChart3,
  Bot,
  Images,
  Radio,
  Package,
  Sparkles,
  AlertTriangle,
  Users,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Sliders,
  DollarSign,
  Activity,
  Copy,
  Check,
  Download,
  Eye,
  Star,
  MessageSquare,
  Lock,
  Unlock,
  RadioTower,
  Camera,
  Palette,
  Sun,
  Flame,
  UserPlus
} from "lucide-react";
import { Subscriber } from "../utils/subscriberService";

interface AdminSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "dashboard" | "agents" | "generations" | "live" | "hydra" | "ratings" | "reports" | "subscribers";
  adminEmail: string;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const DesignBuilderAdminSuite: React.FC<AdminSuiteProps> = ({
  isOpen,
  onClose,
  initialTab = "dashboard",
  adminEmail,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  // ── 1. STATS DO DASHBOARD ──
  const [stats, setStats] = useState({
    totalUsers: 1421,
    activeSubscribers: 384,
    totalGenerations: 48920,
    creditsConsumed: 54100,
    vertexStatus: "Online (Ótimo)",
    vertexLatency: "1.4s",
    monthlyRevenueBrl: "75.648,00",
    monthlyRevenueUsd: "14,976.00"
  });

  const loadDashboardStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard/stats", {
        headers: { "x-user-email": adminEmail || "der.contatos@gmail.com" }
      });
      const data = await res.json();
      if (data && data.stats) {
        setStats(data.stats);
      }
    } catch (_) {}
  };

  // ── 2. POLÍTICA DE IA & AGENTES ──
  const [agents, setAgents] = useState<any[]>([]);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);

  const loadAgents = async () => {
    try {
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      if (data && data.agents) {
        setAgents(data.agents);
      }
    } catch (_) {}
  };

  const handleSaveAgent = async (agentData: any) => {
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData)
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Diretriz do agente ${agentData.name} salva com sucesso!`, "success");
        setEditingAgent(null);
        loadAgents();
      }
    } catch (_) {
      showToast?.("Erro ao salvar diretriz do agente.", "error");
    }
  };

  // ── 3. GALERIA GLOBAL / MODERAÇÃO ──
  const [globalGenerations, setGlobalGenerations] = useState<any[]>([]);
  const [searchGen, setSearchGen] = useState("");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("all");
  const [inspectGen, setInspectGen] = useState<any | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const loadGlobalGenerations = async () => {
    try {
      const res = await fetch("/api/comunidade/feed?limit=60");
      const data = await res.json();
      if (data && data.items) {
        setGlobalGenerations(data.items);
      }
    } catch (_) {}
  };

  // ── 4. ASSINANTES & CRÉDITOS ──
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchSub, setSearchSub] = useState("");
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [newSubForm, setNewSubForm] = useState({
    name: "",
    email: "",
    plan: "Plano Pro",
    credits: 500
  });

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        headers: { "x-user-email": adminEmail || "der.contatos@gmail.com" }
      });
      const data = await res.json();
      if (data && data.subscribers) {
        setSubscribers(data.subscribers);
      }
    } catch (_) {}
    setIsLoading(false);
  };

  const handleCreateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubForm.email.trim()) {
      showToast?.("E-mail é obrigatório.", "warning");
      return;
    }
    try {
      await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: adminEmail || "der.contatos@gmail.com",
          email: newSubForm.email,
          name: newSubForm.name || newSubForm.email.split("@")[0],
          plan: newSubForm.plan,
          credits: Number(newSubForm.credits) || 500,
          status: "ativo"
        })
      });
      showToast?.(`Assinante ${newSubForm.email} cadastrado com sucesso!`, "success");
      setIsAddSubOpen(false);
      setNewSubForm({ name: "", email: "", plan: "Plano Pro", credits: 500 });
      loadSubscribers();
    } catch (_) {
      showToast?.("Erro ao cadastrar assinante.", "error");
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o assinante ${email}?`)) return;
    try {
      await fetch(`/api/admin/subscribers?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": adminEmail || "der.contatos@gmail.com"
        },
        body: JSON.stringify({ adminEmail: adminEmail || "der.contatos@gmail.com", email })
      });
      showToast?.(`Assinante ${email} removido.`, "info");
      loadSubscribers();
    } catch (_) {
      showToast?.("Erro ao remover assinante.", "error");
    }
  };

  // ── 5. REPORTS & BUGS ──
  const [reports, setReports] = useState<any[]>([]);
  const [reportFilter, setReportFilter] = useState<"todos" | "pendente" | "resolvido">("todos");

  const loadReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data && data.reports) {
        setReports(data.reports);
      }
    } catch (_) {}
  };

  const handleUpdateReportStatus = async (id: string, status: "pendente" | "em_analise" | "resolvido") => {
    try {
      await fetch(`/api/admin/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      showToast?.(`Status alterado para ${status.toUpperCase()}!`, "success");
      loadReports();
    } catch (_) {
      showToast?.("Erro ao atualizar status do report.", "error");
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm("Excluir este chamado?")) return;
    try {
      await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      showToast?.("Chamado excluído.", "info");
      loadReports();
    } catch (_) {
      showToast?.("Erro ao excluir report.", "error");
    }
  };

  // ── 6. FEEDBACKS / RATINGS ──
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>({ average: 4.92, total: 38, unread: 3, breakdown: { 5: 32, 4: 5, 3: 1, 2: 0, 1: 0 } });
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const loadRatings = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        fetch("/api/admin/ratings"),
        fetch("/api/admin/ratings/stats")
      ]);
      const rData = await rRes.json();
      const sData = await sRes.json();
      if (rData && rData.ratings) setRatings(rData.ratings);
      if (sData && sData.success) setRatingStats(sData);
    } catch (_) {}
  };

  const handleSaveRatingNotes = async (id: string) => {
    try {
      await fetch(`/api/admin/ratings/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: tempNotes })
      });
      showToast?.("Anotação interna salva!", "success");
      setEditingNotesId(null);
      loadRatings();
    } catch (_) {
      showToast?.("Erro ao salvar anotação.", "error");
    }
  };

  // ── 7. MODO LIVE ──
  const [liveSession, setLiveSession] = useState<any>({
    id: "LIVE-MAIN",
    title: "Workshop Masterclass: Criação de Flyers 8K ao Vivo",
    description: "Treinamento prático de composição de artes com a comunidade de designers",
    status: "idle",
    viewersCount: 142,
    unlimitedCreditsRule: true,
    unlockProAgentsRule: true,
    challengeTopic: "Flyer de Hamburgueria Artesanal Noturna"
  });

  const loadLiveConfig = async () => {
    try {
      const res = await fetch("/api/admin/live/config");
      const data = await res.json();
      if (data && data.session) {
        setLiveSession(data.session);
      }
    } catch (_) {}
  };

  const handleToggleLiveStatus = async () => {
    const isCurrentlyLive = liveSession.status === "live";
    try {
      if (isCurrentlyLive) {
        await fetch(`/api/admin/live/sessions/${liveSession.id}/end`, { method: "POST" });
        showToast?.("Sessão Live finalizada com sucesso!", "info");
      } else {
        await fetch("/api/admin/live/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: liveSession.title,
            description: liveSession.description,
            unlimitedCreditsRule: liveSession.unlimitedCreditsRule,
            unlockProAgentsRule: liveSession.unlockProAgentsRule,
            challengeTopic: liveSession.challengeTopic
          })
        });
        showToast?.("🔴 Modo Live INICIADO! Regras ativas para todos os alunos.", "success");
      }
      loadLiveConfig();
    } catch (_) {
      showToast?.("Erro ao alternar status da live.", "error");
    }
  };

  const handleToggleLiveRule = async (ruleKey: string, value: boolean) => {
    try {
      await fetch("/api/admin/live/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [ruleKey]: value })
      });
      showToast?.("Regra de Live atualizada!", "success");
      loadLiveConfig();
    } catch (_) {}
  };

  // ── 8. HYDRA OBJECTIVES & TAXONOMIA ──
  const [hydraObjectives, setHydraObjectives] = useState<any[]>([]);
  const [isAddObjOpen, setIsAddObjOpen] = useState(false);
  const [newObjForm, setNewObjForm] = useState({
    title: "",
    category: "Geral",
    palette: "Tons dinâmicos de alto impacto",
    lighting: "Luz de estúdio softbox",
    lens: "50mm f/1.8"
  });

  const loadHydraObjectives = async () => {
    try {
      const res = await fetch("/api/admin/hydra/objectives");
      const data = await res.json();
      if (data && data.objectives) {
        setHydraObjectives(data.objectives);
      }
    } catch (_) {}
  };

  const handleCreateHydraObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjForm.title.trim()) {
      showToast?.("Título do objetivo é obrigatório.", "warning");
      return;
    }
    try {
      await fetch("/api/admin/hydra/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObjForm)
      });
      showToast?.(`Objetivo "${newObjForm.title}" criado com sucesso!`, "success");
      setIsAddObjOpen(false);
      setNewObjForm({
        title: "",
        category: "Geral",
        palette: "Tons dinâmicos de alto impacto",
        lighting: "Luz de estúdio softbox",
        lens: "50mm f/1.8"
      });
      loadHydraObjectives();
    } catch (_) {
      showToast?.("Erro ao criar objetivo Hydra.", "error");
    }
  };

  const handleDeleteHydraObjective = async (id: string) => {
    if (!window.confirm("Excluir este objetivo visual?")) return;
    try {
      await fetch(`/api/admin/hydra/objectives/${id}`, { method: "DELETE" });
      showToast?.("Objetivo removido.", "info");
      loadHydraObjectives();
    } catch (_) {
      showToast?.("Erro ao remover objetivo.", "error");
    }
  };

  // ── CARREGAMENTO INICIAL ──
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadDashboardStats();
      loadAgents();
      loadGlobalGenerations();
      loadSubscribers();
      loadReports();
      loadRatings();
      loadLiveConfig();
      loadHydraObjectives();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const unreadReportsCount = reports.filter(r => r.status === "pendente").length;
  const isLiveActive = liveSession.status === "live";

  return (
    <div
      className="fixed inset-0 z-[10090] flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col h-[94vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#090710] shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/10">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  DesignBuilder Admin Master Suite
                </h1>
                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                  ROOT / SUPERADMIN
                </span>
                {isLiveActive && (
                  <span className="flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-400 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    LIVE ON AIR
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Painel Oficial de Controle, Gestão de Clientes, Métricas e Políticas de IA 1:1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                loadDashboardStats();
                loadAgents();
                loadGlobalGenerations();
                loadSubscribers();
                loadReports();
                loadRatings();
                loadLiveConfig();
                loadHydraObjectives();
                showToast?.("Todos os dados foram atualizados!", "info");
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <div className="flex shrink-0 items-center gap-1 border-b border-white/10 bg-zinc-950/40 px-6 py-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "agents", label: "Política de IA", icon: Bot },
            { id: "generations", label: "Galeria Global", icon: Images },
            { id: "subscribers", label: "Assinantes & Créditos", icon: Users },
            { id: "reports", label: "Reports & Bugs", icon: AlertTriangle, badge: unreadReportsCount > 0 ? String(unreadReportsCount) : undefined },
            { id: "ratings", label: "Feedbacks", icon: Star, badge: ratingStats.unread > 0 ? String(ratingStats.unread) : undefined },
            { id: "live", label: "Modo Live", icon: Radio, pulse: isLiveActive },
            { id: "hydra", label: "Hydra Objectives", icon: Package }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${tab.pulse ? "text-red-400 animate-pulse" : ""}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ══════════════════════════════════════════════════
              ── 1. DASHBOARD ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in-50 duration-150">
              {/* Grid de Cards Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Assinantes Ativos</span>
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                    {stats.activeSubscribers.toLocaleString("pt-BR")}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>Total na base: {stats.totalUsers}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Artes Geradas</span>
                    <Images className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                    {stats.totalGenerations.toLocaleString("pt-BR")}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-violet-400 font-medium">
                    <Zap className="h-3 w-3" />
                    <span>{stats.creditsConsumed.toLocaleString("pt-BR")} créditos usados</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Receita Mensal (SaaS)</span>
                    <DollarSign className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white tabular-nums">
                    R$ {stats.monthlyRevenueBrl}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-400">
                    ≈ $ {stats.monthlyRevenueUsd} USD
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Status Vertex AI</span>
                    <Activity className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="mt-2 text-base font-bold text-emerald-400 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{stats.vertexStatus}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-400">
                    Latência média: {stats.vertexLatency}
                  </div>
                </div>
              </div>

              {/* Status dos Clusters e Ações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-violet-400" />
                    <span>Clusters de Geração & Motores Ativos</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-zinc-200">Google Gemini 2.5 Flash Multi-modal</span>
                      </div>
                      <span className="text-emerald-400 font-mono">100% OPERACIONAL</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-zinc-200">Google Cloud Vertex AI (Imagen 3 High Quality)</span>
                      </div>
                      <span className="text-emerald-400 font-mono">100% OPERACIONAL</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-zinc-200">Cloudflare R2 Bucket (Storage CDN Global)</span>
                      </div>
                      <span className="text-emerald-400 font-mono">100% OPERACIONAL</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-zinc-200">Stripe Billing Webhooks & Checkout Engine</span>
                      </div>
                      <span className="text-emerald-400 font-mono">100% OPERACIONAL</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-400" />
                    <span>Ações Administrativas Rápidas</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab("subscribers")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-violet-400" />
                        Adicionar Assinante
                      </span>
                      <span className="text-[11px] text-zinc-400">Cadastre clientes e envie créditos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("generations")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-sky-400" />
                        Moderar Feed Global
                      </span>
                      <span className="text-[11px] text-zinc-400">Ver artes públicas e aprovações</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("agents")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-amber-400" />
                        Editar Prompts de IA
                      </span>
                      <span className="text-[11px] text-zinc-400">Ajustar diretrizes e margens</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("reports")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                        Tickets & Reports
                      </span>
                      <span className="text-[11px] text-zinc-400">Responder dúvidas dos usuários</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 2. POLÍTICA DE IA & AGENTES ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "agents" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Agentes de Inteligência Artificial & Políticas de IA</h3>
                  <p className="text-xs text-zinc-400">Diretrizes de geração, modelos de base e headroom de margem de segurança</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((ag) => (
                  <div key={ag.slug} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{ag.name}</span>
                        <span className={`rounded-full text-[10px] font-semibold px-2 py-0.5 border ${
                          ag.status === "Ativo"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}>
                          {ag.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-zinc-400 font-medium">{ag.category}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">Modelo: <span className="text-zinc-200">{ag.model}</span></div>
                        <div className="text-[11px] text-violet-400 font-semibold">Headroom: {ag.safeMargins} ({ag.safeMarginPercent || 18}%)</div>
                      </div>

                      {ag.promptGuidelines && (
                        <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2 bg-black/30 p-2 rounded-lg border border-white/5">
                          "{ag.promptGuidelines}"
                        </p>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Fila: {ag.priority}</span>
                      <button
                        type="button"
                        onClick={() => setEditingAgent({ ...ag })}
                        className="rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 text-[11px] font-semibold hover:bg-violet-600 hover:text-white transition-all cursor-pointer"
                      >
                        Editar Diretrizes
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal de Edição de Agente */}
              {editingAgent && (
                <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                  <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-violet-400" />
                        <h4 className="text-sm font-bold text-white">Editar Diretrizes: {editingAgent.name}</h4>
                      </div>
                      <button onClick={() => setEditingAgent(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Modelo de Inteligência Artificial</label>
                        <select
                          value={editingAgent.model}
                          onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        >
                          <option value="Google Cloud Vertex AI (Imagen 3 High Quality)">Google Cloud Vertex AI (Imagen 3 High Quality)</option>
                          <option value="Google GenAI Multi-modal Pro">Google GenAI Multi-modal Pro</option>
                          <option value="Vertex AI Studio Master 8K">Vertex AI Studio Master 8K</option>
                          <option value="Selective Mask Inpainting Engine">Selective Mask Inpainting Engine</option>
                          <option value="Hydra Engine V3 Multi-layer">Hydra Engine V3 Multi-layer</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-400 mb-1 font-medium">Margem Segura (Headroom %)</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={editingAgent.safeMarginPercent || 18}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditingAgent({
                                ...editingAgent,
                                safeMarginPercent: val,
                                safeMargins: `${val}% Safe Headroom`
                              });
                            }}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 mb-1 font-medium">Prioridade de Fila</label>
                          <select
                            value={editingAgent.priority}
                            onChange={(e) => setEditingAgent({ ...editingAgent, priority: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                          >
                            <option value="Ultra Alta">Ultra Alta (Prioridade Root)</option>
                            <option value="Alta">Alta</option>
                            <option value="Padrão">Padrão</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Status Operacional</label>
                        <select
                          value={editingAgent.status}
                          onChange={(e) => setEditingAgent({ ...editingAgent, status: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Manutenção">Manutenção</option>
                          <option value="Em breve">Em breve</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Diretrizes do Prompt de Sistema</label>
                        <textarea
                          rows={4}
                          value={editingAgent.promptGuidelines || ""}
                          onChange={(e) => setEditingAgent({ ...editingAgent, promptGuidelines: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-zinc-200 outline-none resize-none"
                          placeholder="Instruções e diretrizes de renderização..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingAgent(null)}
                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-white/5 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAgent(editingAgent)}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 cursor-pointer shadow-lg shadow-violet-600/30"
                      >
                        Salvar Diretrizes de IA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 3. GALERIA GLOBAL / MODERAÇÃO ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "generations" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Galeria Global & Auditoria de Criações</h3>
                  <p className="text-xs text-zinc-400">Inspeção em tempo real de metadados, prompts e artes de usuários no mundo todo</p>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por prompt ou autor..."
                    value={searchGen}
                    onChange={(e) => setSearchGen(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {globalGenerations
                  .filter((g) => (g.title || "").toLowerCase().includes(searchGen.toLowerCase()) || (g.prompt || "").toLowerCase().includes(searchGen.toLowerCase()) || (g.author || "").toLowerCase().includes(searchGen.toLowerCase()))
                  .map((gen, idx) => {
                    const imgSrc = gen.src || gen.image_url || gen.thumbnail_url;
                    return (
                      <div
                        key={idx}
                        onClick={() => setInspectGen(gen)}
                        className="group relative rounded-xl border border-white/10 bg-zinc-900/40 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-violet-500/50 transition-all hover:scale-[1.02]"
                      >
                        <div className="aspect-[4/5] w-full overflow-hidden bg-black/40 relative">
                          <img
                            src={imgSrc}
                            alt={gen.title || "Arte"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-violet-600/90 px-2.5 py-1 rounded-full shadow-lg">
                              <Eye className="h-3 w-3" /> Inspecionar
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 space-y-1">
                          <div className="text-[11px] font-semibold text-white truncate">{gen.title || gen.prompt || "Criação de IA"}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{gen.author || "Usuário da Comunidade"}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Lightbox de Inspeção de Imagem */}
              {inspectGen && (
                <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md" onClick={() => setInspectGen(null)}>
                  <div className="flex flex-col md:flex-row h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c0915] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 bg-black/80 flex items-center justify-center p-4">
                      <img
                        src={inspectGen.src || inspectGen.image_url || inspectGen.thumbnail_url}
                        alt="Arte inspecionada"
                        className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                      />
                    </div>
                    <div className="w-full md:w-80 flex flex-col justify-between p-5 border-l border-white/10 bg-zinc-950 text-xs space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-bold text-white text-sm">Metadados da Criação</span>
                          <button onClick={() => setInspectGen(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-500 uppercase font-semibold">Autor</label>
                          <div className="font-medium text-zinc-200">{inspectGen.author || "Designer Anônimo"}</div>
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-500 uppercase font-semibold">Prompt Utilizado</label>
                          <p className="mt-1 text-zinc-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/5 max-h-36 overflow-y-auto leading-relaxed">
                            {inspectGen.prompt || inspectGen.title || "Sem prompt disponível"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            <span className="text-zinc-500 block">Proporção</span>
                            <span className="font-bold text-zinc-200">{inspectGen.aspectRatio || "9:16"}</span>
                          </div>
                          <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            <span className="text-zinc-500 block">Motor</span>
                            <span className="font-bold text-violet-400">Vertex AI Imagen 3</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(inspectGen.prompt || inspectGen.title || "");
                            setCopiedPrompt(true);
                            setTimeout(() => setCopiedPrompt(false), 2000);
                          }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 font-semibold text-zinc-200 hover:bg-white/15 transition-colors cursor-pointer"
                        >
                          {copiedPrompt ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedPrompt ? "Prompt Copiado!" : "Copiar Prompt"}</span>
                        </button>

                        <a
                          href={inspectGen.src || inspectGen.image_url}
                          download={`criacao-${Date.now()}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 font-bold text-white hover:bg-violet-500 transition-colors cursor-pointer shadow-lg shadow-violet-600/30"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Baixar Resolução Máxima</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 4. ASSINANTES & CRÉDITOS ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "subscribers" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Gestão de Clientes e Assinaturas (SaaS)</h3>
                  <p className="text-xs text-zinc-400">Controle permissões de acesso, recarga de saldo e status dos planos</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Filtrar assinantes..."
                      value={searchSub}
                      onChange={(e) => setSearchSub(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddSubOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Novo Assinante</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Assinantes */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/30">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-white/10 bg-zinc-950/50 text-[11px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Cliente / E-mail</th>
                      <th className="px-4 py-3">Plano</th>
                      <th className="px-4 py-3">Créditos</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscribers
                      .filter((s) => s.email.toLowerCase().includes(searchSub.toLowerCase()) || (s.name || "").toLowerCase().includes(searchSub.toLowerCase()))
                      .map((sub) => (
                        <tr key={sub.email} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{sub.name || sub.email.split("@")[0]}</div>
                            <div className="text-[11px] text-zinc-500">{sub.email}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-violet-300">
                            {sub.plan || "Plano Pro"}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                            {sub.unlimited ? "∞ Ilimitado" : (sub.credits || 0).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 border border-emerald-500/30">
                              {sub.status || "Ativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  const addAmount = 500;
                                  try {
                                    await fetch("/api/admin/subscribers", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        adminEmail: adminEmail || "der.contatos@gmail.com",
                                        email: sub.email,
                                        name: sub.name,
                                        credits: (sub.credits || 0) + addAmount,
                                        status: "ativo",
                                        plan: sub.plan
                                      })
                                    });
                                    loadSubscribers();
                                    showToast?.(`+${addAmount} créditos adicionados para ${sub.email}!`, "success");
                                  } catch (_) {}
                                }}
                                className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer"
                              >
                                +500 Créditos
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubscriber(sub.email)}
                                className="rounded-lg bg-red-500/10 text-red-400 p-1 hover:bg-red-500/20 transition-colors cursor-pointer"
                                title="Excluir assinante"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Adicionar Assinante */}
              {isAddSubOpen && (
                <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                  <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-4 shadow-2xl text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-violet-400" />
                        <h4 className="text-sm font-bold text-white">Cadastrar Novo Assinante</h4>
                      </div>
                      <button onClick={() => setIsAddSubOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateSubscriber} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Nome do Cliente</label>
                        <input
                          type="text"
                          placeholder="Ex: João Designer"
                          value={newSubForm.name}
                          onChange={(e) => setNewSubForm({ ...newSubForm, name: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">E-mail do Cliente *</label>
                        <input
                          type="email"
                          required
                          placeholder="cliente@design.com"
                          value={newSubForm.email}
                          onChange={(e) => setNewSubForm({ ...newSubForm, email: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-400 mb-1 font-medium">Plano Contratado</label>
                          <select
                            value={newSubForm.plan}
                            onChange={(e) => setNewSubForm({ ...newSubForm, plan: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                          >
                            <option value="Plano Pro">Plano Pro</option>
                            <option value="Plano Ilimitado">Plano Ilimitado</option>
                            <option value="Plano Enterprise">Plano Enterprise</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-400 mb-1 font-medium">Créditos Iniciais</label>
                          <input
                            type="number"
                            min="0"
                            value={newSubForm.credits}
                            onChange={(e) => setNewSubForm({ ...newSubForm, credits: Number(e.target.value) })}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsAddSubOpen(false)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-white/5 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 cursor-pointer shadow-lg shadow-violet-600/30"
                        >
                          Salvar Assinante
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 5. REPORTS & BUGS ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "reports" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Tickets de Erros & Reports de Usuários</h3>
                  <p className="text-xs text-zinc-400">Mensagens enviadas diretamente pelo modal oficial de Reportar</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {(["todos", "pendente", "resolvido"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReportFilter(st)}
                      className={`rounded-xl px-3 py-1.5 font-semibold capitalize transition-colors cursor-pointer ${
                        reportFilter === st
                          ? "bg-violet-600 text-white"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {reports
                  .filter((r) => reportFilter === "todos" || r.status === reportFilter)
                  .map((rep) => (
                    <div key={rep.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rep.user}</span>
                          <span className="text-zinc-500">· {rep.agent}</span>
                          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                            {rep.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500">{new Date(rep.createdAt).toLocaleString("pt-BR")}</span>
                      </div>

                      {rep.title && (
                        <div className="text-xs font-bold text-violet-300">{rep.title}</div>
                      )}

                      <p className="text-xs text-zinc-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                        "{rep.message}"
                      </p>

                      {rep.screenshot && (
                        <div className="mt-2">
                          <span className="text-[11px] text-zinc-500 block mb-1">Print Anexado pelo Usuário:</span>
                          <img
                            src={rep.screenshot}
                            alt="Screenshot do report"
                            className="max-h-48 rounded-xl border border-white/10 object-contain bg-black/50"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                        <span className={`text-[11px] font-semibold ${rep.status === "resolvido" ? "text-emerald-400" : "text-amber-400"}`}>
                          STATUS: {rep.status.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          {rep.status !== "resolvido" ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateReportStatus(rep.id, "resolvido")}
                              className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Marcar como Resolvido
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateReportStatus(rep.id, "pendente")}
                              className="rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Reabrir Chamado
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(rep.id)}
                            className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                            title="Excluir report"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 6. FEEDBACKS / RATINGS ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "ratings" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/10 via-zinc-900/80 to-zinc-950 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span>Satisfação Geral dos Usuários (CSAT)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">Avaliações coletadas em tempo real após cada geração de imagem</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-amber-400">{ratingStats.average}</span>
                  <span className="text-xs text-zinc-400">/ 5.0 ({ratingStats.total} avaliações)</span>
                </div>
              </div>

              {/* Lista de Avaliações */}
              <div className="space-y-3">
                {ratings.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < item.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-white">{item.user}</span>
                        <span className="text-zinc-500">· {item.agent}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                    </div>

                    {item.comment && (
                      <p className="text-xs text-zinc-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        "{item.comment}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-medium">Nota Interna:</span>
                        {editingNotesId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRatingNotes(item.id)}
                              className="rounded bg-violet-600 px-2 py-0.5 text-[11px] font-bold text-white cursor-pointer"
                            >
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => {
                              setEditingNotesId(item.id);
                              setTempNotes(item.notes || "");
                            }}
                            className="text-violet-400 hover:underline cursor-pointer"
                          >
                            {item.notes || "+ Adicionar nota interna"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 7. MODO LIVE ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "live" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className={`rounded-3xl border p-6 text-center space-y-4 ${
                isLiveActive
                  ? "border-red-500/30 bg-red-500/[0.05]"
                  : "border-white/10 bg-zinc-900/40"
              }`}>
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isLiveActive ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/5 text-zinc-400"
                }`}>
                  <Radio className="h-7 w-7" />
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isLiveActive ? "bg-red-500 animate-ping" : "bg-zinc-600"}`} />
                    <h3 className="text-base font-bold text-white">
                      {isLiveActive ? "🔴 SALA LIVE TRANSMITINDO AO VIVO" : "⚪ MODO LIVE EM ESPERA (OFFLINE)"}
                    </h3>
                  </div>
                  <p className="mt-1 max-w-md mx-auto text-xs text-zinc-400 leading-relaxed">
                    {liveSession.title}
                  </p>
                  {isLiveActive && (
                    <div className="mt-2 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{liveSession.viewersCount} designers conectados agora</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleLiveStatus}
                    className={`rounded-2xl px-6 py-3 text-xs font-bold text-white transition-all shadow-xl cursor-pointer ${
                      isLiveActive
                        ? "bg-zinc-800 hover:bg-zinc-700"
                        : "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                    }`}
                  >
                    {isLiveActive ? "Finalizar Sessão Live" : "Iniciar Transmissão Ao Vivo"}
                  </button>
                </div>
              </div>

              {/* Painel de Regras da Live */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Regras Coletivas da Sala de Live
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <div className="font-semibold text-white">Créditos Ilimitados durante a Live</div>
                      <div className="text-[11px] text-zinc-500">Alunos geram sem gastar créditos do plano</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleLiveRule("unlimitedCreditsRule", !liveSession.unlimitedCreditsRule)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        liveSession.unlimitedCreditsRule ? "bg-violet-600" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        liveSession.unlimitedCreditsRule ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <div className="font-semibold text-white">Liberar Todos os Agentes Pro</div>
                      <div className="text-[11px] text-zinc-500">Acesso antecipado durante o workshop</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleLiveRule("unlockProAgentsRule", !liveSession.unlockProAgentsRule)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        liveSession.unlockProAgentsRule ? "bg-violet-600" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        liveSession.unlockProAgentsRule ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ── 8. HYDRA OBJECTIVES & TAXONOMIA ──
             ══════════════════════════════════════════════════ */}
          {activeTab === "hydra" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Hydra Objectives & Taxonomia de Estilos</h3>
                  <p className="text-xs text-zinc-400">Objetivos visuais, paletas pré-configuradas e iluminação do motor Hydra</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddObjOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Objetivo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {hydraObjectives.map((obj) => (
                  <div key={obj.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{obj.title}</span>
                        <span className="rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-semibold px-2 py-0.5 border border-violet-500/30">
                          {obj.category}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1.5 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Palette className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{obj.palette}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sun className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">{obj.lighting}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{obj.lens}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Ativo no Hydra
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteHydraObjective(obj.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                        title="Excluir objetivo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Criar Objetivo Hydra */}
              {isAddObjOpen && (
                <div className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                  <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-4 shadow-2xl text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-amber-400" />
                        <h4 className="text-sm font-bold text-white">Adicionar Objetivo Hydra</h4>
                      </div>
                      <button onClick={() => setIsAddObjOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateHydraObjective} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Nome do Objetivo *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Hambúrguer Rústico Dark"
                          value={newObjForm.title}
                          onChange={(e) => setNewObjForm({ ...newObjForm, title: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Categoria</label>
                        <input
                          type="text"
                          placeholder="Ex: Alimentos & Bebidas"
                          value={newObjForm.category}
                          onChange={(e) => setNewObjForm({ ...newObjForm, category: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Paleta de Cores</label>
                        <input
                          type="text"
                          placeholder="Ex: Tons de madeira, fogo e dourado"
                          value={newObjForm.palette}
                          onChange={(e) => setNewObjForm({ ...newObjForm, palette: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Iluminação</label>
                        <input
                          type="text"
                          placeholder="Ex: Rim light forte e luz difusa de estúdio"
                          value={newObjForm.lighting}
                          onChange={(e) => setNewObjForm({ ...newObjForm, lighting: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Lente / Enquadramento</label>
                        <input
                          type="text"
                          placeholder="Ex: Macro 50mm f/1.8"
                          value={newObjForm.lens}
                          onChange={(e) => setNewObjForm({ ...newObjForm, lens: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200 outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsAddObjOpen(false)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-white/5 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 cursor-pointer shadow-lg shadow-violet-600/30"
                        >
                          Salvar Objetivo
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default DesignBuilderAdminSuite;
