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
  BookOpen
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
  userEmail = "der.contatos@gmail.com",
  onOpenProfile,
  onSignOut,
  onCloseMobile,
  isMobile = false,
  userCredits: propUserCredits,
  isUnlimited: propIsUnlimited,
  userPlan: propUserPlan,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [creditState, setCreditState] = useState<CreditState>(getCreditState);

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
      window.dispatchEvent(new CustomEvent("db:open_vitrine"));
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

  // Mobile drawer mode if explicitly requested
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-zinc-950 p-6 text-white animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm">
              {userInitials}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{userName}</p>
              <p className="text-xs text-zinc-400">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="py-4 space-y-2">
          <div
            onClick={() => {
              onOpenCreditsModal?.();
              onCloseMobile?.();
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold">{effectiveCredits.toLocaleString("pt-BR")} créditos disponíveis</span>
            </div>
          </div>

          <a
            href="/"
            onClick={(e) => { e.preventDefault(); handleHomeClick(); }}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${isHomeActive ? "bg-violet-600/20 text-white" : "text-zinc-400"}`}
          >
            <Home size={18} />
            <span>Início / Apps</span>
          </a>

          <a
            href="/projetos"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenProjects) onOpenProjects();
              else onNavigateTab("projetos");
              onCloseMobile?.();
            }}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${isProjectsActive ? "bg-violet-600/20 text-white" : "text-zinc-400"}`}
          >
            <Briefcase size={18} />
            <span>Projetos</span>
          </a>

          <a
            href="/gallery"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenGallery) onOpenGallery();
              else onNavigateTab("gallery");
              onCloseMobile?.();
            }}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${isGalleryActive ? "bg-violet-600/20 text-white" : "text-zinc-400"}`}
          >
            <Images size={18} />
            <span>Galeria</span>
          </a>

          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenCommunity) onOpenCommunity();
              else onNavigateTab("community");
              onCloseMobile?.();
            }}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${isCommunityActive ? "bg-violet-600/20 text-white" : "text-zinc-400"}`}
          >
            <Globe size={18} />
            <span>Comunidade</span>
          </a>
        </div>
      </div>
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
              )}
            </div>
          </div>

          <div className="mx-auto h-px w-5 bg-white/10" />

          {/* 3. Início / Apps com Flyout Menu */}
          <div className="group/home relative">
            <a
              title="Apps"
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
                    <div className="absolute left-full ml-3 bottom-0 z-50 w-80 rounded-xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-150">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsLinksMenuOpen(false);
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

      {/* Modal de Report */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Modal de Configurações 1:1 Oficial */}
      <DesignBuilderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userEmail={cleanEmail}
        userName={userName}
        onOpenCredits={onOpenCreditsModal}
        onOpenAdmin={onOpenAdmin}
      />
    </>
  );
};

export default DesignBuilderSidebar;
