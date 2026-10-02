import React, { useState, useEffect } from "react";
import { getCreditState, syncWithGoogleCloud, CreditState } from "../utils/creditsManager";
import ReportModal from "./ReportModal";
import {
  Sparkles,
  Home,
  Briefcase,
  Images,
  Globe,
  AlertTriangle,
  MoreHorizontal,
  LayoutGrid,
  Shield,
  User,
  CreditCard,
  LogOut,
  ExternalLink,
  X,
  Settings,
  ArrowRight,
  Headphones,
  BookOpen,
  Bot,
  ChevronRight
} from "lucide-react";
import { DesignBuilderSettingsModal } from "./DesignBuilderSettingsModal";

export const AGENTS = [
  { slug: "ref", name: "REF", href: "/agent/ref", color: "rgb(139, 92, 246)" },
  { slug: "hydra", name: "Hydra", href: "/hydra", color: "rgb(139, 92, 246)" },
  { slug: "enhance-builder", name: "Enhance", href: "/enhance-builder", color: "rgb(124, 58, 237)" },
  { slug: "design-builder1-2", name: "Design Builder 1.2", href: "/agent/design-builder1-2", color: "rgb(124, 58, 237)" },
  { slug: "orion-pro", name: "Órion Pro", href: "/orion-pro", color: "rgb(255, 213, 0)" },
  { slug: "altera-facil", name: "Altera Fácil", href: "/altera-facil", color: "rgb(168, 85, 247)" },
];

export interface DesignBuilderSidebarProps {
  variant?: "dock" | "expanded";
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
  userCredits?: number | string;
  isUnlimited?: boolean;
  userPlan?: string;
  hideMobileNav?: boolean;
}

export const DesignBuilderSidebar: React.FC<DesignBuilderSidebarProps> = ({
  variant = "dock",
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
  userEmail = "der.contatos@gmail.com",
  onOpenProfile,
  onSignOut,
  onCloseMobile,
  isMobile = false,
  userCredits: propUserCredits,
  isUnlimited: propIsUnlimited,
  userPlan: propUserPlan,
  hideMobileNav = false,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"perfil" | "plano" | "uso" | "documentacao">("perfil");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [creditState, setCreditState] = useState<CreditState>(getCreditState);

  const userPlan = propUserPlan || "Profissional (Vertex AI)";
  const cleanEmail = (userEmail || "").toLowerCase().trim();
  const isCleanAdmin = cleanEmail === "der.contatos@gmail.com" || cleanEmail === "ricardo.jrsr.gov@gmail.com";

  // Calculate real credits from GCP Vertex AI
  const storedReal = typeof window !== "undefined" ? localStorage.getItem("zion_real_credits") : null;
  const realCredits = (storedReal !== null && !isNaN(Number(storedReal)) && Number(storedReal) > 100)
    ? Number(storedReal)
    : (typeof propUserCredits === "number" && propUserCredits > 100 && propUserCredits !== 999999 ? propUserCredits : 6612);

  const effectiveCredits = realCredits;

  const handleHomeClick = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({ path: "/" }, "", "/");
      window.dispatchEvent(new CustomEvent("db:go_home"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onNavigateTab("ai-tools");
    onCloseMobile?.();
  };

  const handleAppsClick = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({ path: "/apps" }, "", "/apps");
      window.dispatchEvent(new CustomEvent("db:open_apps"));
    }
    if (onOpenAgentes) onOpenAgentes();
    else onNavigateTab("ai-tools");
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

  const isHomeActive = activeTab === "ai-tools" || activeTab === "home" || activeTab === "apps";
  const isProjectsActive = activeTab === "projetos" || activeTab === "projects" || activeTab === "tasks";
  const isGalleryActive = activeTab === "gallery" || activeTab === "galeria";
  const isCommunityActive = activeTab === "community" || activeTab === "comunidade";

  const renderMobileNavigation = () => {
    return (
      <>
        {/* Barra Flutuante de Navegação Inferior 1:1 Oficial do Design Builder */}
        {!hideMobileNav && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
          <nav
            aria-label="Navegação principal"
            className="pointer-events-auto flex h-16 items-center rounded-[28px] bg-zinc-950/95 px-2 shadow-[0_8px_28px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl w-full max-w-md justify-around gap-1 select-none"
          >
            {/* 1. Início */}
            <a
              aria-label="Início"
              aria-current={isHomeActive ? "page" : undefined}
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleHomeClick();
              }}
              className={`group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
                isHomeActive ? "text-violet-400" : "text-zinc-400"
              }`}
            >
              <span
                className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                  isHomeActive ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
                }`}
              >
                <Home className="h-[22px] w-[22px]" />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">
                Início
              </span>
            </a>

            {/* 2. Projetos */}
            <a
              aria-label="Projetos"
              aria-current={isProjectsActive ? "page" : undefined}
              href="/projetos"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/projetos" }, "", "/projetos");
                }
                if (onOpenProjects) onOpenProjects();
                else onNavigateTab("projetos");
                onCloseMobile?.();
              }}
              className={`group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
                isProjectsActive ? "text-violet-400" : "text-zinc-400"
              }`}
            >
              <span
                className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                  isProjectsActive ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
                }`}
              >
                <Briefcase className="h-[22px] w-[22px]" />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">
                Projetos
              </span>
            </a>

            {/* 3. Galeria */}
            <a
              aria-label="Galeria"
              aria-current={isGalleryActive ? "page" : undefined}
              href="/gallery"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/gallery" }, "", "/gallery");
                }
                if (onOpenGallery) onOpenGallery();
                else onNavigateTab("gallery");
                onCloseMobile?.();
              }}
              className={`group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
                isGalleryActive ? "text-violet-400" : "text-zinc-400"
              }`}
            >
              <span
                className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                  isGalleryActive ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
                }`}
              >
                <Images className="h-[22px] w-[22px]" />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">
                Galeria
              </span>
            </a>

            {/* 4. Comunidade */}
            <a
              aria-label="Comunidade"
              aria-current={isCommunityActive ? "page" : undefined}
              href="/community"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/community" }, "", "/community");
                }
                if (onOpenCommunity) onOpenCommunity();
                else onNavigateTab("community");
                onCloseMobile?.();
              }}
              className={`group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
                isCommunityActive ? "text-violet-400" : "text-zinc-400"
              }`}
            >
              <span
                className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                  isCommunityActive ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
                }`}
              >
                <Globe className="h-[22px] w-[22px]" />
              </span>
              <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">
                Comunidade
              </span>
            </a>

            {/* 5. Avatar do Usuário */}
            <button
              type="button"
              aria-label="Abrir conta e notificações"
              aria-haspopup="dialog"
              aria-expanded={isMobileAccountOpen}
              onClick={() => setIsMobileAccountOpen(true)}
              className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 cursor-pointer"
            >
              <span className="h-10 w-10 overflow-hidden rounded-full ring-2 transition-[box-shadow] ring-violet-500/30">
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                  {userInitials}
                </span>
              </span>
            </button>
          </nav>
        </div>
        )}

        {/* Drawer Inferior de Conta (Mobile Bottom Sheet 1:1 Oficial) */}
        {isMobileAccountOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Backdrop escurecido */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsMobileAccountOpen(false)}
            />

            {/* Sheet deslizante de baixo para cima */}
            <div className="fixed inset-x-0 bottom-0 z-[61] max-h-[92vh] overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-[#0d091a]/98 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom duration-200">
              
              {/* Grab Handle */}
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />

              {/* Cabeçalho */}
              <div className="flex items-center justify-between pb-5">
                <h2 className="text-base font-bold text-white tracking-tight">Conta</h2>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setIsMobileAccountOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Info do Usuário */}
              <div className="flex items-center gap-3.5 pb-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-base font-bold text-white shadow-lg">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-white leading-snug">{userName}</p>
                  <p className="truncate text-xs text-zinc-400">{cleanEmail}</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                      Operação Design Builder
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Créditos */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileAccountOpen(false);
                  onOpenCreditsModal?.();
                }}
                className="mb-4 flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-left transition-all hover:bg-amber-500/15 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
                  <span className="text-sm font-semibold text-white">Créditos</span>
                </div>
                <span className="text-base font-bold tabular-nums text-amber-400">
                  {effectiveCredits > 999 ? effectiveCredits.toLocaleString("pt-BR") : effectiveCredits}
                </span>
              </button>

              {/* Linha de Configurações */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileAccountOpen(false);
                  setSettingsInitialTab("perfil");
                  setIsSettingsModalOpen(true);
                }}
                className="mb-3 flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-left transition-all hover:bg-white/[0.08] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-zinc-300 shrink-0" />
                  <span className="text-sm font-medium text-white">Configurações</span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              {/* Linha de Painel Admin (para administradores) */}
              {isCleanAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileAccountOpen(false);
                    if (onOpenAdmin) onOpenAdmin();
                    else {
                      window.dispatchEvent(new CustomEvent("open-admin-subscribers"));
                      window.dispatchEvent(new CustomEvent("db:open_admin"));
                    }
                  }}
                  className="mb-6 flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-left transition-all hover:bg-amber-500/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-400 shrink-0" />
                    <span className="text-sm font-bold text-amber-400">Painel Admin</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-500/70" />
                </button>
              )}

              {/* Links Úteis */}
              <div className="mb-6">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Links Úteis
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://discord.gg/easybuilder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.12] cursor-pointer"
                  >
                    <span>Discord</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileAccountOpen(false);
                      if (onOpenCommunity) onOpenCommunity();
                      else onNavigateTab("community");
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.12] cursor-pointer"
                  >
                    <span>Comunidade</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileAccountOpen(false);
                      setSettingsInitialTab("documentacao");
                      setIsSettingsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.12] cursor-pointer"
                  >
                    <span>Documentação</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </button>
                  <a
                    href="https://link.easybuilder.com.br/fale-com-o-suporte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.12] cursor-pointer"
                  >
                    <span>Suporte</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </a>
                  <a
                    href="https://link.easybuilder.com.br/fale-com-luiz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.12] cursor-pointer"
                  >
                    <span>Comercial</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </a>
                </div>
              </div>

              {/* Sair */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileAccountOpen(false);
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    localStorage.removeItem("zion_auth_user");
                    localStorage.removeItem("zion_current_user");
                    localStorage.removeItem("currentUser");
                    window.location.reload();
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.06] py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-zinc-400" />
                <span>Sair</span>
              </button>

            </div>
          </div>
        )}
      </>
    );
  };

  // Desktop Expanded Sidebar (Exact match to app.designbuilder.co Home page)
  if (variant === "expanded") {
    return (
      <>
        <aside
          aria-label="Navegação principal"
          className="fixed inset-y-3 left-3 z-50 hidden flex-col rounded-3xl ring-1 ring-white/[0.06] lg:flex w-64 select-none"
        style={{
          background: "linear-gradient(rgb(23, 16, 42) 0%, rgb(12, 8, 24) 55%, rgb(5, 3, 8) 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center px-7 pt-7 pb-8">
          <a
            aria-label="Design Builder"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleHomeClick();
            }}
            className="cursor-pointer"
          >
            <img
              alt="Design Builder"
              width={399}
              height={85}
              className="h-7 w-auto"
              src="/logo-zion.svg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/logo-zion.webp";
              }}
            />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
          <ul className="space-y-0.5">
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleHomeClick();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                  activeTab === "home" || activeTab === "ai-tools"
                    ? "bg-violet-600/25 font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                }`}
              >
                <Home className="h-[18px] w-[18px] shrink-0 text-violet-400" />
                <span className="truncate">Home</span>
              </a>
            </li>
            <li>
              <a
                href="/projetos"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenProjects) onOpenProjects();
                  else onNavigateTab("projetos");
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                  isProjectsActive
                    ? "bg-violet-600/25 font-medium text-white"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                }`}
              >
                <Briefcase className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Projetos</span>
              </a>
            </li>
            <li>
              <a
                href="/gallery"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenGallery) onOpenGallery();
                  else onNavigateTab("gallery");
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                  isGalleryActive
                    ? "bg-violet-600/25 font-medium text-white"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                }`}
              >
                <Images className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Galeria</span>
              </a>
            </li>
            <li>
              <a
                href="/community"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenCommunity) onOpenCommunity();
                  else onNavigateTab("community");
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors cursor-pointer ${
                  isCommunityActive
                    ? "bg-violet-600/25 font-medium text-white"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                }`}
              >
                <Globe className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">Comunidade</span>
              </a>
            </li>
            <li>
              <span
                title="Em breve"
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] text-zinc-600 select-none"
              >
                <Bot className="h-[18px] w-[18px] shrink-0 text-zinc-600" />
                <span className="truncate">Agentes</span>
                <span className="ml-auto shrink-0 rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  Em breve
                </span>
              </span>
            </li>
          </ul>

          <div className="my-3 mx-4 h-px bg-white/[0.06]" />

          <ul className="space-y-0.5">
            {AGENTS.map((agent) => (
              <li key={agent.slug}>
                <a
                  href={agent.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAgentClick(agent.slug);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-[14px] transition-colors cursor-pointer ${
                    selectedAgent === agent.slug
                      ? "bg-violet-600/20 font-medium text-white"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                  }`}
                >
                  <span className="truncate">{agent.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer: Créditos + Perfil */}
        <div className="shrink-0 p-4 border-t border-white/[0.06] bg-black/20">
          <div
            onClick={() => onOpenCreditsModal?.()}
            className="group/cred mb-3 cursor-pointer rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06] transition-all hover:bg-white/[0.06]"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                {effectiveCredits.toLocaleString("pt-BR")} créditos
              </span>
              <span className="text-zinc-500">/ 56</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, (effectiveCredits / 100) * 100))}%` }}
              />
            </div>
            <span className="mt-1.5 block text-[11px] text-zinc-400">
              11 usados
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 rounded-full p-1 text-left ring-1 ring-white/10 transition-all hover:ring-violet-400/50 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white">
                  {userInitials}
                </div>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute bottom-full left-0 mb-3 w-60 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl p-2 z-50"
                  >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-xs text-zinc-400 truncate">{cleanEmail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setSettingsInitialTab("perfil");
                      setIsSettingsModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Configurações</span>
                  </button>
                  {isCleanAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAdmin?.();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 font-bold cursor-pointer"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Painel Admin</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut ? onSignOut() : window.location.reload();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-amber-400 transition-colors cursor-pointer"
                title="Reportar erro ou sugestão"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label="Links úteis"
                  aria-haspopup="menu"
                  aria-expanded={isLinksMenuOpen}
                  onClick={() => setIsLinksMenuOpen(!isLinksMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  title="Links úteis"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {isLinksMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-3 z-50 w-72 rounded-xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsLinksMenuOpen(false);
                        setSettingsInitialTab("documentacao");
                        setIsSettingsModalOpen(true);
                      }}
                      className="group/link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "rgba(139, 92, 246, 0.125)", border: "1px solid rgba(139, 92, 246, 0.19)" }}
                      >
                        <BookOpen className="h-4 w-4" style={{ color: "rgb(139, 92, 246)" }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight">Documentação</span>
                        <span className="block text-xs text-zinc-500">Guias e tutoriais do Design Builder</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
                    </button>

                    <a
                      role="menuitem"
                      href="https://link.easybuilder.com.br/fale-com-luiz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "rgba(167, 139, 250, 0.125)", border: "1px solid rgba(167, 139, 250, 0.19)" }}
                      >
                        <Briefcase className="h-4 w-4" style={{ color: "rgb(167, 139, 250)" }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight">Falar com comercial</span>
                        <span className="block text-xs text-zinc-500">Planos, upgrades e condições</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
                    </a>

                    <a
                      role="menuitem"
                      href="https://link.easybuilder.com.br/fale-com-o-suporte"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "rgba(96, 165, 250, 0.125)", border: "1px solid rgba(96, 165, 250, 0.19)" }}
                      >
                        <Headphones className="h-4 w-4" style={{ color: "rgb(96, 165, 250)" }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight">Falar com o suporte</span>
                        <span className="block text-xs text-zinc-500">Ajuda com dúvidas ou problemas</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Barra de Navegação Flutuante e Drawer Mobile 1:1 Oficial */}
      {renderMobileNavigation()}

      {/* Modal de Configurações 1:1 Oficial */}
      <DesignBuilderSettingsModal
        isOpen={isSettingsModalOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsModalOpen(false)}
        userEmail={cleanEmail}
        userName={userName}
        userCredits={effectiveCredits}
        userPlan={userPlan}
        isAdmin={isCleanAdmin}
        onOpenCredits={onOpenCreditsModal}
        onOpenAdmin={onOpenAdmin}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Modal de Report */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  );
}

  // Desktop Floating Dock (Exact match to app.designbuilder.co)
  return (
    <>
      <nav data-tour="menu" className="barra-lateral fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 lg:block select-none">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-zinc-950 px-2 py-3 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06]">
          
          {/* 1. Créditos no Topo da Sidebar */}
          <div
            title={`${effectiveCredits.toLocaleString("pt-BR")} créditos`}
            onClick={() => onOpenCreditsModal?.()}
            className="group relative flex flex-col items-center gap-0.5 mb-0.5 cursor-pointer"
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
              className="lucide lucide-sparkles lucide-stars h-3.5 w-3.5 text-amber-400"
              aria-hidden="true"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              <path d="M20 2v4" />
              <path d="M22 4h-4" />
              <circle cx="4" cy="20" r="2" />
            </svg>
            <span className="text-[10px] font-bold tabular-nums leading-none text-amber-400">
              {effectiveCredits > 999 ? effectiveCredits.toLocaleString("pt-BR") : effectiveCredits}
            </span>
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              {effectiveCredits.toLocaleString("pt-BR")} créditos
            </span>
          </div>

          {/* 2. Avatar do Usuário */}
          <div className="mb-1">
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

              {/* Menu do Usuário Flutuante 1:1 Oficial */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute left-full z-50 ml-3 w-64 top-0 rounded-2xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7),0_0_60px_-15px_rgba(139,92,246,0.25)] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-150"
                  >
                  <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/30">
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                        {userInitials}
                      </div>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-white">{userName}</span>
                      <span className="truncate text-xs text-zinc-400">{cleanEmail}</span>
                    </div>
                  </div>
                  <div className="flex flex-col py-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setSettingsInitialTab("perfil");
                        setIsSettingsModalOpen(true);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 text-left transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
                    >
                      <Settings className="h-4 w-4 text-zinc-400" />
                      Configurações
                    </button>
                    {isCleanAdmin && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenAdmin) onOpenAdmin();
                          else {
                            window.dispatchEvent(new CustomEvent("open-admin-subscribers"));
                            window.dispatchEvent(new CustomEvent("db:open_admin"));
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-amber-400 text-left transition-colors hover:bg-amber-500/10 cursor-pointer font-bold"
                      >
                        <Shield className="h-4 w-4 text-amber-400" />
                        Painel Admin
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onSignOut) onSignOut();
                        else {
                          localStorage.removeItem("zion_auth_user");
                          localStorage.removeItem("currentUser");
                          window.location.reload();
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-zinc-400" />
                      Sair
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          </div>

          <div className="mx-auto h-px w-5 bg-white/10" />

          {/* 3. Início / Apps com Flyout Menu */}
          <div className="group/home relative">
            <a
              title="Início"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleHomeClick();
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                isHomeActive ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
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
                className="lucide lucide-house lucide-home h-[18px] w-[18px]"
                aria-hidden="true"
              >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </a>
            
            {/* Flyout Menu de Apps */}
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 pl-3 opacity-0 transition-all duration-200 group-hover/home:pointer-events-auto group-hover/home:opacity-100 z-50">
              <div className="flex flex-col gap-0.5 rounded-xl bg-zinc-900 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/[0.08] min-w-[200px]">
                <a
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors bg-violet-500/15 text-violet-300 cursor-pointer"
                  href="/apps"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAppsClick();
                  }}
                >
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate font-semibold">Todos os apps</span>
                </a>
                <div className="my-0.5 h-px bg-white/[0.06]" />

                {AGENTS.map((agent) => (
                  <a
                    key={agent.slug}
                    href={agent.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick(agent.slug);
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 cursor-pointer"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${agent.color.replace("rgb", "rgba").replace(")", ", 0.133)")}` }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                    </span>
                    <span className="truncate">{agent.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Projetos */}
          <a
            title="Projetos"
            href="/projetos"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenProjects) onOpenProjects();
              else onNavigateTab("projetos");
            }}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
              isProjectsActive ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Briefcase className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              Projetos
            </span>
          </a>

          {/* 5. Galeria */}
          <a
            title="Galeria"
            href="/gallery"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenGallery) onOpenGallery();
              else onNavigateTab("gallery");
            }}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
              isGalleryActive ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Images className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              Galeria
            </span>
          </a>

          {/* 6. Comunidade */}
          <a
            title="Comunidade"
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenCommunity) onOpenCommunity();
              else onNavigateTab("community");
            }}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
              isCommunityActive ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              Comunidade
            </span>
          </a>

          {/* 7. Rodapé da Sidebar */}
          <div className="rodape-da-sidebar">
            <div className="min-h-0 overflow-visible">
              <div className="mx-auto my-1.5 h-px w-5 bg-white/10" />
              <div className="flex flex-col items-center gap-1.5">
                
                {/* Botão Reportar */}
                <button
                  type="button"
                  data-tour="report"
                  title="Reportar erro ou sugestão"
                  onClick={() => setIsReportOpen(true)}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-red-400 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300 cursor-pointer"
                >
                  <AlertTriangle className="h-[18px] w-[18px]" aria-hidden="true" />
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
                    Reportar
                  </span>
                </button>

                {/* Links Úteis */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Links úteis"
                    aria-haspopup="menu"
                    aria-expanded={isLinksMenuOpen}
                    onClick={() => setIsLinksMenuOpen(!isLinksMenuOpen)}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-500 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
                      Links úteis
                    </span>
                  </button>

                  {isLinksMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsLinksMenuOpen(false)}
                      />
                      <div className="absolute left-full ml-3 bottom-0 z-50 w-80 rounded-xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-150">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsLinksMenuOpen(false);
                          setSettingsInitialTab("documentacao");
                          setIsSettingsModalOpen(true);
                        }}
                        className="group/link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(139, 92, 246, 0.125)", border: "1px solid rgba(139, 92, 246, 0.19)" }}
                        >
                          <BookOpen className="h-4 w-4" style={{ color: "rgb(139, 92, 246)" }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-tight">Documentação</span>
                          <span className="block text-xs text-zinc-500">Guias e tutoriais do Design Builder</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
                      </button>

                      <a
                        role="menuitem"
                        href="https://link.easybuilder.com.br/fale-com-luiz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(167, 139, 250, 0.125)", border: "1px solid rgba(167, 139, 250, 0.19)" }}
                        >
                          <Briefcase className="h-4 w-4" style={{ color: "rgb(167, 139, 250)" }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-tight">Falar com comercial</span>
                          <span className="block text-xs text-zinc-500">Planos, upgrades e condições</span>
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
                      </a>

                      <a
                        role="menuitem"
                        href="https://link.easybuilder.com.br/fale-com-o-suporte"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(96, 165, 250, 0.125)", border: "1px solid rgba(96, 165, 250, 0.19)" }}
                        >
                          <Headphones className="h-4 w-4" style={{ color: "rgb(96, 165, 250)" }} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-tight">Falar com o suporte</span>
                          <span className="block text-xs text-zinc-500">Ajuda com dúvidas ou problemas</span>
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
                      </a>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>
      </nav>

      {/* Barra de Navegação Flutuante e Drawer Mobile 1:1 Oficial */}
      {renderMobileNavigation()}

      {/* Modal de Report */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Modal de Configurações 1:1 Oficial */}
      <DesignBuilderSettingsModal
        isOpen={isSettingsModalOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsModalOpen(false)}
        userEmail={cleanEmail}
        userName={userName}
        userCredits={effectiveCredits}
        userPlan={userPlan}
        isAdmin={isCleanAdmin}
        onOpenCredits={onOpenCreditsModal}
        onOpenAdmin={onOpenAdmin}
        onOpenReport={() => setIsReportOpen(true)}
      />
    </>
  );
};

export default DesignBuilderSidebar;
