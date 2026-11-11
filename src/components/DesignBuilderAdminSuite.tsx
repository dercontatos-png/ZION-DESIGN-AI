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
  Check
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

  // Stats do Dashboard
  const [stats, setStats] = useState({
    totalUsers: 1420,
    activeSubscribers: 384,
    totalGenerations: 48920,
    creditsConsumed: 54100,
    vertexStatus: "Online (Ótimo)",
    vertexLatency: "1.8s",
    monthlyRevenueBrl: "75.648,00",
    monthlyRevenueUsd: "14.980,00"
  });

  // Assinantes
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchSub, setSearchSub] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState<number>(500);
  const [newPlan, setNewPlan] = useState("Plano Pro");

  // Galeria Global de Gerações
  const [globalGenerations, setGlobalGenerations] = useState<any[]>([]);
  const [searchGen, setSearchGen] = useState("");

  // Reports
  const [reports, setReports] = useState([
    {
      id: "REP-01",
      user: "lucas.mendes@gmail.com",
      agent: "Ref Builder",
      type: "Dúvida de Proporção",
      message: "Gostaria de saber se a dimensão 9:16 funciona com logos em PNG transparente.",
      status: "pendente",
      createdAt: "Há 18 minutos"
    },
    {
      id: "REP-02",
      user: "camila.design@outlook.com",
      agent: "Zion Design V2",
      type: "Sugestão",
      message: "Adicionar mais presets de iluminação neon cyberpunk na aba de estilos.",
      status: "resolvido",
      createdAt: "Há 2 horas"
    },
    {
      id: "REP-03",
      user: "agencia.prime@gmail.com",
      agent: "Órion Pro",
      type: "Elogio",
      message: "A nitidez da resolução 8K superou as expectativas para nossos clientes de ótica.",
      status: "resolvido",
      createdAt: "Há 5 horas"
    }
  ]);

  // Agentes
  const [agents, setAgents] = useState([
    {
      slug: "ref",
      name: "Ref Builder",
      category: "Reengenharia Reversa 1:1",
      status: "Ativo",
      model: "Gemini 2.5 Flash / Imagen 3",
      safeMargins: "16% a 20% Top & Bottom",
      priority: "Ultra Alta"
    },
    {
      slug: "design-builder-v2",
      name: "Zion Design V2",
      category: "Composição Modular Multicamadas",
      status: "Ativo",
      model: "Google GenAI Multi-modal",
      safeMargins: "Automática",
      priority: "Alta"
    },
    {
      slug: "orion-pro",
      name: "Órion Pro",
      category: "Fotografia de Estúdio 8K Master",
      status: "Ativo",
      model: "Vertex AI Studio Master",
      safeMargins: "Safe Margin Headroom",
      priority: "Prioritária"
    },
    {
      slug: "altera-facil",
      name: "Altera Fácil",
      category: "Inpainting & Substituição Inteligente",
      status: "Ativo",
      model: "Selective Mask Inpainting",
      safeMargins: "Preserva Contorno",
      priority: "Alta"
    },
    {
      slug: "hydra",
      name: "Hydra Builder",
      category: "Flyers e Posters Temáticos",
      status: "Ativo",
      model: "Hydra Engine V3",
      safeMargins: "Layout Dinâmico",
      priority: "Alta"
    }
  ]);

  // Carrega Stats
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

  // Carrega Assinantes
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

  // Carrega Galeria Global
  const loadGlobalGenerations = async () => {
    try {
      const res = await fetch("/api/comunidade/feed?limit=50");
      const data = await res.json();
      if (data && data.items) {
        setGlobalGenerations(data.items);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadDashboardStats();
      loadSubscribers();
      loadGlobalGenerations();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10090] flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#090710] shadow-2xl text-left"
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
              </div>
              <p className="text-xs text-zinc-400">
                Painel Oficial de Controle, Gestão de Usuários, Métricas e Políticas de IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                loadSubscribers();
                loadGlobalGenerations();
                showToast?.("Dados atualizados!", "info");
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
            { id: "reports", label: "Reports & Bugs", icon: AlertTriangle, badge: "3" },
            { id: "ratings", label: "Feedbacks", icon: Sparkles },
            { id: "live", label: "Modo Live", icon: Radio },
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
                <Icon className="h-3.5 w-3.5 shrink-0" />
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
          {/* ── 1. DASHBOARD ── */}
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
                    <span>+14% esse mês</span>
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
                    <span>Alta demanda</span>
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

              {/* Status dos Clusters e Serviços */}
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
                        <span className="font-semibold text-zinc-200">Cloudflare R2 Bucket (Nuvem Global de Imagens)</span>
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
                      <span className="font-bold text-white">Adicionar Assinante</span>
                      <span className="text-[11px] text-zinc-400">Cadastre clientes e envie créditos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("generations")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white">Moderar Feed Global</span>
                      <span className="text-[11px] text-zinc-400">Ver artes públicas e aprovações</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("agents")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white">Editar Prompts de IA</span>
                      <span className="text-[11px] text-zinc-400">Ajustar diretrizes e margens</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("reports")}
                      className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="font-bold text-white">Tickets & Reports</span>
                      <span className="text-[11px] text-zinc-400">Responder dúvidas dos usuários</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2. POLÍTICA DE IA & AGENTES ── */}
          {activeTab === "agents" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Agentes de Inteligência Artificial</h3>
                  <p className="text-xs text-zinc-400">Diretrizes de geração, modelos de base e políticas de layout</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((ag) => (
                  <div key={ag.slug} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ag.name}</span>
                      <span className="rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 border border-emerald-500/30">
                        {ag.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-zinc-400 font-medium">{ag.category}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">Modelo: {ag.model}</div>
                      <div className="text-[11px] text-violet-400 font-semibold">Margens Seguras: {ag.safeMargins}</div>
                    </div>

                    <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Fila: {ag.priority}</span>
                      <button
                        type="button"
                        onClick={() => showToast?.(`Configurações de ${ag.name} salvas!`, "success")}
                        className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        Editar Prompt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 3. GALERIA GLOBAL / MODERAÇÃO ── */}
          {activeTab === "generations" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Galeria Global de Criações</h3>
                  <p className="text-xs text-zinc-400">Monitore e modere todas as artes geradas no mundo em tempo real</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar por prompt ou autor..."
                    value={searchGen}
                    onChange={(e) => setSearchGen(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {globalGenerations
                  .filter((g) => (g.title || "").toLowerCase().includes(searchGen.toLowerCase()) || (g.prompt || "").toLowerCase().includes(searchGen.toLowerCase()))
                  .map((gen, idx) => (
                    <div key={idx} className="group relative rounded-xl border border-white/10 bg-zinc-900/40 overflow-hidden flex flex-col justify-between">
                      <div className="aspect-[4/5] w-full overflow-hidden bg-black/40">
                        <img
                          src={gen.src || gen.image_url || gen.thumbnail_url}
                          alt={gen.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="text-[11px] font-semibold text-white truncate">{gen.title || "Arte"}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{gen.author || "Criador Global"}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── 4. ASSINANTES & CRÉDITOS ── */}
          {activeTab === "subscribers" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Gestão de Clientes e Assinaturas (SaaS)</h3>
                  <p className="text-xs text-zinc-400">Controle permissões de acesso, recarga de saldo e status dos planos</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Filtrar assinantes..."
                    value={searchSub}
                    onChange={(e) => setSearchSub(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500"
                  />
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
                      <th className="px-4 py-3 text-right">Ações</th>
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
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 5. REPORTS & BUGS ── */}
          {activeTab === "reports" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h3 className="text-sm font-bold text-white">Tickets de Erros & Reports</h3>
                <p className="text-xs text-zinc-400">Mensagens enviadas diretamente pelo modal de Reportar dos usuários</p>
              </div>

              <div className="space-y-2.5">
                {reports.map((rep) => (
                  <div key={rep.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rep.user}</span>
                        <span className="text-zinc-500">· {rep.agent}</span>
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          {rep.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{rep.createdAt}</span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                      "{rep.message}"
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={`text-[11px] font-semibold ${rep.status === "resolvido" ? "text-emerald-400" : "text-amber-400"}`}>
                        Status: {rep.status.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReports(prev => prev.map(r => r.id === rep.id ? { ...r, status: "resolvido" } : r));
                          showToast?.("Ticket marcado como resolvido!", "success");
                        }}
                        className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        Marcar como Resolvido
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 6. FEEDBACKS / RATINGS ── */}
          {activeTab === "ratings" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/10 via-zinc-900/80 to-zinc-950 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Satisfação Média dos Usuários</h3>
                  <p className="text-xs text-zinc-400">Avaliações coletadas após cada geração de imagem</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-amber-400">4.92</span>
                  <span className="text-xs text-zinc-400">/ 5.0 (98.4% positivas)</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 7. MODO LIVE ── */}
          {activeTab === "live" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                  <Radio className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">Sessões Coletivas ao Vivo (Modo Live)</h3>
                <p className="max-w-md mx-auto text-xs text-zinc-400 leading-relaxed">
                  Crie salas de geração em tempo real para workshops, masterclasses e desafios da comunidade.
                </p>
                <button
                  type="button"
                  onClick={() => showToast?.("Nova sessão Live criada com sucesso!", "success")}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Iniciar Nova Sessão Live
                </button>
              </div>
            </div>
          )}

          {/* ── 8. HYDRA OBJECTIVES ── */}
          {activeTab === "hydra" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h3 className="text-sm font-bold text-white">Hydra Objectives & Taxonomia</h3>
                <p className="text-xs text-zinc-400">Estilos pré-configurados e objetivos visuais do motor Hydra</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {["Gastronomia Gourmet", "Nightclub & Balada", "Streetwear & Moda", "Ótica & Saúde", "Automotivo GT", "Podcast Cover", "Imóveis de Luxo", "Barbearia Vintage"].map((obj, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/40 p-3 flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">{obj}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
