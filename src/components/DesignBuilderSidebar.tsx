import React, { useState, useEffect } from "react";
import { getCreditState, syncWithGoogleCloud, CreditState } from "../utils/creditsManager";
import ReportModal from "./ReportModal";
import {
  Home,
  FolderOpen,
  Images,
  Globe,
  Bot,
  Bell,
  AlertTriangle,
  MoreHorizontal,
  User,
  LogOut,
  ChevronRight,
  Layers,
  Shield,
  MessageCircle,
  BookOpen,
  ExternalLink
} from "lucide-react";

export const AGENTS = [
  { slug: "orion-pro", name: "Órion Pro", href: "/orion-pro" },
  { slug: "design-builder1-2", name: "Zion Design", href: "/agent/design-builder1-2" },
  { slug: "ref", name: "REF", href: "/agent/ref" },
  { slug: "enhance-builder", name: "Enhance", href: "/enhance-builder" },
  { slug: "altera-facil", name: "Altera Fácil", href: "/altera-facil" },
  { slug: "hydra", name: "Hydra", href: "/hydra" },
];

export interface DesignBuilderSidebarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenCommunity?: () => void;
  onOpenGallery?: () => void;
  onOpenProjects?: () => void;
  onOpenAdmin?: () => void;
  onOpenAgentes?: () => void;
  onSelectAgent?: (slug: string) => void;
  onOpenCreditsModal?: () => void;
  selectedAgent?: string;
  userInitials?: string;
  userName?: string;
  userEmail?: string;
  currentLang?: string;
  setLanguage?: (lang: string) => void;
  onOpenProfile?: () => void;
  onSignOut?: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export const DesignBuilderSidebar: React.FC<DesignBuilderSidebarProps> = ({
  activeTab,
  onNavigateTab,
  onOpenCommunity,
  onOpenGallery,
  onOpenProjects,
  onOpenAdmin,
  onOpenAgentes,
  onSelectAgent,
  onOpenCreditsModal,
  selectedAgent,
  userInitials = "RI",
  userName = "Ricardo",
  userEmail = "zion@design.ai",
  onOpenProfile,
  onSignOut,
  onCloseMobile,
  isMobile = false,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [creditState, setCreditState] = useState<CreditState>(getCreditState);

  useEffect(() => {
    // Sincroniza dados reais do GCP
    syncWithGoogleCloud(false).then((updated) => setCreditState(updated));

    const update = () => setCreditState(getCreditState());
    window.addEventListener("zion_credits_updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("zion_credits_updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const handleHomeClick = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({ path: "/" }, "", "/");
      window.dispatchEvent(new CustomEvent("db:open_vitrine"));
    }
    onNavigateTab("ai-tools");
    onCloseMobile?.();
  };

  const handleAgentClick = (slug: string) => {
    const agentObj = AGENTS.find(a => a.slug === slug);
    const targetPath = agentObj ? agentObj.href : `/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState({ path: targetPath }, "", targetPath);
    }
    if (onSelectAgent) {
      onSelectAgent(slug);
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("db:open_studio", { detail: { agent: slug } }));
      }
      onNavigateTab("ai-tools");
    }
    onCloseMobile?.();
  };

  const isHomeActive = activeTab === "ai-tools" || activeTab === "home";
  const isAppsActive = activeTab === "apps";
  const isProjectsActive = activeTab === "projetos" || activeTab === "projects" || activeTab === "tasks";
  const isGalleryActive = activeTab === "gallery" || activeTab === "galeria";
  const isCommunityActive = activeTab === "community" || activeTab === "comunidade";
  const isAdminActive = activeTab === "admin" || activeTab === "auditoria";
  const isAgentesActive = activeTab === "agentes" || activeTab === "agents";

  return (
    <aside
      aria-label="Navegação principal"
      className={`fixed inset-y-3 left-3 z-50 flex flex-col rounded-3xl ring-1 ring-white/[0.06] select-none ${
        isMobile ? "w-full inset-0 rounded-none z-[9999]" : "hidden lg:flex w-64"
      }`}
      style={{
        background: "linear-gradient(rgb(23, 16, 42) 0%, rgb(12, 8, 24) 55%, rgb(5, 3, 8) 100%)",
      }}
    >
      {/* ── Logo Oficial Zion Design ──────────────────────── */}
      <div className="flex shrink-0 items-center px-6 pt-5 pb-5">
        <a
          aria-label="Zion Design"
          onClick={handleHomeClick}
          className="cursor-pointer"
        >
          <img
            alt="Zion Design"
            width={842}
            height={163}
            decoding="async"
            data-nimg="1"
            className="h-7 w-auto"
            src="/logo-db.webp"
            style={{ color: "transparent" }}
          />
        </a>
      </div>

      {/* ── Navegação Principal ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 custom-scrollbar">
        <ul className="space-y-0.5">
          {/* Home */}
          <li>
            <a
              href="/"
              aria-current={isHomeActive && !isProjectsActive && !isGalleryActive && !isCommunityActive ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleHomeClick();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                isHomeActive && !isProjectsActive && !isGalleryActive && !isCommunityActive
                  ? "bg-violet-600/25 font-medium text-white"
                  : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Home className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">Home</span>
            </a>
          </li>

          {/* Projetos */}
          <li>
            <a
              href="/projetos"
              aria-current={isProjectsActive ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/projetos" }, "", "/projetos");
                  window.dispatchEvent(new CustomEvent("db:open_projects"));
                }
                if (onOpenProjects) onOpenProjects();
                else onNavigateTab("projetos");
                onCloseMobile?.();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                isProjectsActive
                  ? "bg-violet-600/25 font-medium text-white"
                  : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <FolderOpen className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">Projetos</span>
            </a>
          </li>

          {/* Galeria */}
          <li>
            <a
              href="/gallery"
              aria-current={isGalleryActive ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/gallery" }, "", "/gallery");
                  window.dispatchEvent(new CustomEvent("db:open_gallery"));
                }
                if (onOpenGallery) onOpenGallery();
                else onNavigateTab("gallery");
                onCloseMobile?.();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                isGalleryActive
                  ? "bg-violet-600/25 font-medium text-white"
                  : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Images className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">Galeria</span>
            </a>
          </li>

          {/* Comunidade */}
          <li>
            <a
              href="/community"
              aria-current={isCommunityActive ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/community" }, "", "/community");
                }
                if (onOpenCommunity) onOpenCommunity();
                else onNavigateTab("community");
                onCloseMobile?.();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                isCommunityActive
                  ? "bg-violet-600/25 font-medium text-white"
                  : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Globe className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">Comunidade</span>
            </a>
          </li>

          {/* Agentes - Oficial com badge Em breve */}
          <li>
            <span
              title="Em breve"
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] text-zinc-600"
            >
              <Bot className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="truncate">Agentes</span>
              <span className="ml-auto shrink-0 rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                Em breve
              </span>
            </span>
          </li>
        </ul>

        <div className="my-2.5 h-px bg-white/10" />

        {/* ── Lista de Agentes / Builders Oficiais ────────────── */}
        <ul className="space-y-0.5">
          {AGENTS.map((agent) => {
            const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
            const isAgentActive =
              (selectedAgent && (selectedAgent === agent.slug || selectedAgent === agent.slug.replace("-builder", "") || (agent.slug === "design-builder1-2" && selectedAgent === "design-builder"))) ||
              currentPath === agent.href ||
              (activeTab === agent.slug);

            return (
              <li key={agent.slug}>
                <div>
                  <a
                    href={agent.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick(agent.slug);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                      isAgentActive
                        ? "bg-violet-600/25 font-medium text-white"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className="truncate">{agent.name}</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Rodapé Oficial com Créditos e Usuário ─────────────── */}
      <div className="shrink-0 rounded-b-3xl border-t border-white/[0.06]">
        {/* Barra de Créditos Oficial Dinâmica */}
        <button
          type="button"
          aria-label="Ver extrato de créditos"
          onClick={() => {
            if (onOpenCreditsModal) onOpenCreditsModal();
            else {
              window.dispatchEvent(new CustomEvent("open-credits-modal"));
            }
          }}
          className="block w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04] cursor-pointer"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[15px] font-semibold tabular-nums text-violet-300">
              {(creditState.remaining ?? 0).toLocaleString("pt-BR")}{" "}
              <span className="text-xs font-normal text-zinc-300">créditos</span>
            </p>
            <span className="shrink-0 text-[10px] tabular-nums text-zinc-500">
              / {(creditState.total || 0).toLocaleString("pt-BR")}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={creditState.remaining ?? 0}
            aria-valuemin={0}
            aria-valuemax={creditState.total || 1}
            aria-label="restantes"
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-500"
              style={{
                width: `${
                  (creditState.total || 0) > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round(
                            ((creditState.remaining ?? 0) / (creditState.total || 1)) * 100
                          )
                        )
                      )
                    : 100
                }%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-[10px] tabular-nums text-zinc-500">
            {(
              creditState.used ??
              Math.max(0, (creditState.total || 0) - (creditState.remaining ?? 0))
            ).toLocaleString("pt-BR")}{" "}
            usados
          </p>
        </button>

        {/* Linha do Usuário */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 relative">
          <div className="relative">
            <button
              type="button"
              aria-label="Abrir menu do usuário"
              aria-expanded={isProfileMenuOpen}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="h-7 w-7 overflow-hidden rounded-full ring-2 transition-all focus:outline-none focus-visible:ring-violet-400 ring-violet-500/20 hover:ring-violet-400/50 cursor-pointer"
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white">
                {userInitials}
              </div>
            </button>

            {/* Menu Dropdown do Usuário */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-56 bg-[#0c0817]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{userEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    else {
                      window.dispatchEvent(new CustomEvent("open-profile-modal"));
                    }
                    setIsProfileMenuOpen(false);
                    onCloseMobile?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-white hover:bg-violet-600/20 hover:text-violet-300 rounded-xl transition-all cursor-pointer text-left"
                >
                  <User size={14} className="text-violet-400" />
                  <span>Ver Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAdmin) onOpenAdmin();
                    else onNavigateTab("admin");
                    setIsProfileMenuOpen(false);
                    onCloseMobile?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-600/20 rounded-xl transition-all cursor-pointer text-left"
                >
                  <Shield size={14} className="text-purple-400" />
                  <span>Painel ADM</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setIsProfileMenuOpen(false);
                      onCloseMobile?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <LogOut size={14} />
                    <span>Sair da Conta</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Notificações / Avisos */}
            <div className="relative">
              <button
                type="button"
                aria-label="Avisos"
                aria-haspopup="dialog"
                aria-expanded={false}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("zion_toast", { detail: { message: "Nenhum novo aviso no momento.", type: "info" } }));
                  }
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            {/* Reportar Erro ou Sugestão */}
            <button
              type="button"
              title="Reportar erro ou sugestão"
              aria-label="Reportar"
              onClick={() => setIsReportOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer"
            >
              <AlertTriangle className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            {/* Links Úteis */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLinksMenuOpen(!isLinksMenuOpen);
                  setIsProfileMenuOpen(false);
                }}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                  isLinksMenuOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/10 hover:text-white"
                }`}
                aria-label="Links úteis"
                aria-haspopup="menu"
                aria-expanded={isLinksMenuOpen}
              >
                <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
                  Links úteis
                </span>
              </button>

              {/* Popover Oficial de Links Úteis */}
              {isLinksMenuOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-64 rounded-2xl border border-white/10 bg-[#0c0817]/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-2 py-1.5 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Links Úteis</span>
                    <span className="text-[10px] text-zinc-500">Oficial</span>
                  </div>
                  <a
                    href="#suporte"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <MessageCircle size={14} className="text-[#5df65a]" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Suporte</span>
                      <span className="text-[10px] text-zinc-400">Fale com nossa equipe</span>
                    </div>
                  </a>
                  <a
                    href="#onboarding"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <BookOpen size={14} className="text-[#a78bfa]" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Documentação</span>
                      <span className="text-[10px] text-zinc-400">Guias e tutoriais</span>
                    </div>
                  </a>
                  <a
                    href="https://chat.whatsapp.com/Hl6hLlAETob4t1Nc2oGZn0"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Globe size={14} className="text-[#d3f529]" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Comunidade</span>
                      <span className="text-[10px] text-zinc-400">Junte-se ao grupo</span>
                    </div>
                  </a>
                  <a
                    href="#discord"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Bot size={14} className="text-[#5865F2]" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Discord</span>
                      <span className="text-[10px] text-zinc-400">Comunidade local</span>
                    </div>
                  </a>
                  <a
                    href="#contato"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <ExternalLink size={14} className="text-[#28e23d]" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">Comercial</span>
                      <span className="text-[10px] text-zinc-400">Fale com nosso comercial</span>
                    </div>
                  </a>
                  <div className="my-1 border-t border-white/5" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinksMenuOpen(false);
                      setIsReportOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <AlertTriangle size={14} />
                    <span>Reportar Erro</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reportar Erro/Sugestão (1:1 com FireShot 5.png) */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        showToast={(msg, type) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("zion_toast", { detail: { message: msg, type } })
            );
          }
        }}
      />
    </aside>
  );
};
