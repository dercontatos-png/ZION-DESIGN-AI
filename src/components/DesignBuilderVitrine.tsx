import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  Briefcase,
  Images,
  Globe,
  Sparkles,
  ArrowRight,
  Package,
  Palette,
  PenTool,
  Wand2,
  Image as ImageIcon,
  MoreHorizontal,
  Flag,
  RotateCcw,
  ExternalLink,
  BookOpen,
  Headphones,
  Settings,
  Shield,
  CreditCard,
  User,
  LogOut,
  X
} from "lucide-react";
import ReportModal from "./ReportModal";
import { DesignBuilderSettingsModal } from "./DesignBuilderSettingsModal";

interface DesignBuilderVitrineProps {
  onGoHome?: () => void;
  onOpenStudio: (agentSlug?: string) => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenProjects?: () => void;
  onOpenAdmin?: () => void;
  onOpenAgentes?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCreditsModal?: () => void;
  userEmail?: string;
  userName?: string;
  userTokens?: number;
}

interface AgentCardDef {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  desc: string;
  color: string;
  route: string;
  videoUrl?: string;
  bullets?: string[];
  icon: "ref" | "hydra" | "enhance" | "db12" | "orion" | "altera";
}

const AGENTS_LIST: AgentCardDef[] = [
  {
    id: "ref",
    name: "REF",
    subtitle: "Builder",
    badge: "Em alta · Top 1°",
    badgeBg: "rgba(139, 92, 246, 0.125)",
    badgeColor: "rgb(139, 92, 246)",
    desc: "Repita o estilo visual de uma inspiração com fidelidade.",
    color: "rgb(139, 92, 246)",
    route: "/agent/ref",
    videoUrl: "https://apidb20.designbuilder.co/api/agent-videos/ref-builder?v=4",
    bullets: [
      "Fácil de unir inspirações",
      "Detalhe o que você quer de cada inspiração."
    ],
    icon: "ref"
  },
  {
    id: "hydra",
    name: "Hydra",
    subtitle: "Builder",
    desc: "Crie imagens de produto usando inspirações da galeria.",
    color: "rgb(139, 92, 246)",
    route: "/hydra",
    videoUrl: "https://apidb20.designbuilder.co/api/agent-videos/product-builder-v2?v=4",
    bullets: [
      "Use nossa biblioteca de inspirações",
      "Composição avançada com inspirações de estilo",
      "Seja um Designer Sênior"
    ],
    icon: "hydra"
  },
  {
    id: "enhance-builder",
    name: "Enhance",
    desc: "Melhore fotos borradas, antigas ou de baixa qualidade.",
    color: "rgb(124, 58, 237)",
    route: "/enhance-builder",
    videoUrl: "https://apidb20.designbuilder.co/api/agent-videos/enhance-builder?v=4",
    bullets: [
      "Recupera fotos borradas e antigas",
      "Hiper realismo + retoque de estúdio",
      "Mantém identidade do sujeito"
    ],
    icon: "enhance"
  },
  {
    id: "design-builder1-2",
    name: "Design Builder 1.2",
    badge: "Em alta · Top 3°",
    badgeBg: "rgba(124, 58, 237, 0.125)",
    badgeColor: "rgb(124, 58, 237)",
    desc: "A primeira versão do DB, dinâmico para diversos nichos e desafios.",
    color: "rgb(124, 58, 237)",
    route: "/agent/design-builder1-2",
    icon: "db12"
  },
  {
    id: "orion-pro",
    name: "Órion Pro",
    subtitle: "Builder",
    badge: "Em alta · Top 2°",
    badgeBg: "rgba(255, 213, 0, 0.125)",
    badgeColor: "rgb(255, 213, 0)",
    desc: "Pipeline avançada para mais controle criativo.",
    color: "rgb(255, 213, 0)",
    route: "/orion-pro",
    videoUrl: "https://apidb20.designbuilder.co/api/agent-videos/orion-pro?v=4",
    bullets: [
      "Construa qualquer estilo de design",
      "Composições complexas com texto",
      "Múltiplas inspirações de estilo"
    ],
    icon: "orion"
  },
  {
    id: "altera-facil",
    name: "Altera Fácil",
    subtitle: "Builder",
    badge: "Beta",
    badgeBg: "rgba(168, 85, 247, 0.125)",
    badgeColor: "rgb(168, 85, 247)",
    desc: "Altere cenas, poses, luz e enquadramento sem perder a identidade.",
    color: "rgb(168, 85, 247)",
    route: "/altera-facil",
    icon: "altera"
  }
];

export const DesignBuilderVitrine: React.FC<DesignBuilderVitrineProps> = ({
  onGoHome,
  onOpenStudio,
  onOpenGallery,
  onOpenCommunity,
  onOpenProjects,
  onOpenAdmin,
  onOpenAgentes,
  onNavigateTab,
  onOpenCreditsModal,
  userEmail: propUserEmail,
  userName: propUserName,
  userTokens: propUserTokens = 6612,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [userEmail] = useState(() => {
    if (propUserEmail) return propUserEmail;
    try {
      const u = localStorage.getItem("currentUser") || localStorage.getItem("zion_user");
      if (u) {
        const parsed = JSON.parse(u);
        return parsed?.email || "der.contatos@gmail.com";
      }
    } catch (_) {}
    return "der.contatos@gmail.com";
  });

  const [userName] = useState(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("zion_user_name");
      if (savedName) return savedName;
    }
    if (propUserName && propUserName !== "Usuário" && propUserName !== "Equipe Zion") return propUserName;
    try {
      const u = localStorage.getItem("currentUser") || localStorage.getItem("zion_user");
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.name && parsed.name !== "Equipe Zion") return parsed.name;
        if (parsed?.full_name && parsed.full_name !== "Equipe Zion") return parsed.full_name;
      }
    } catch (_) {}
    return "Ricardo";
  });

  const displayName = userName.split(" ")[0] || "Ricardo";
  const userInitials = (displayName.length >= 2 ? displayName.substring(0, 2) : "RI").toUpperCase();

  // Calculate real credits
  const storedReal = typeof window !== "undefined" ? localStorage.getItem("zion_real_credits") : null;
  const realCredits = (storedReal !== null && !isNaN(Number(storedReal)) && Number(storedReal) > 100)
    ? Number(storedReal)
    : (typeof propUserTokens === "number" && propUserTokens > 100 && propUserTokens !== 999999 ? propUserTokens : 6612);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleLaunchAgent = (slug: string) => {
    const targetRoute = slug === "design-builder1-2" ? "/agent/design-builder1-2" : slug === "ref" ? "/agent/ref" : `/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState({ path: targetRoute }, "", targetRoute);
    }
    onOpenStudio(slug);
  };

  return (
    <div id="main-content" className="relative h-[100dvh] w-full overflow-hidden bg-black text-white select-none">
      {/* Background orbs */}
      <div aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── DESKTOP FLOATING DOCK (Barra Lateral 1:1 Oficial) ── */}
      <nav data-tour="menu" className="barra-lateral fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-zinc-950 px-2 py-3 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06]">
          {/* Créditos */}
          <div
            title={`${realCredits.toLocaleString("pt-BR")} créditos`}
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
              className="lucide lucide-coins h-4 w-4 text-amber-400"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
              <path d="M7 6h1v4" />
              <path d="m16.71 13.88.7.71-2.82 2.82" />
            </svg>
            <span className="text-[10px] font-bold tabular-nums leading-none text-amber-400">
              {realCredits > 9999 ? "99k+" : realCredits}
            </span>
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              {realCredits.toLocaleString("pt-BR")} créditos
            </span>
          </div>

          {/* User Profile Avatar */}
          <div className="mb-1">
            <div className="relative">
              <button
                type="button"
                aria-label="Abrir menu do usuário"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-7 w-7 overflow-hidden rounded-full ring-2 transition-all focus:outline-none ring-violet-500/20 hover:ring-violet-400/50 cursor-pointer"
              >
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white">
                  {userInitials}
                </div>
              </button>

              {/* Profile Popover Menu */}
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute left-full top-0 ml-3 z-50 w-56 rounded-2xl bg-zinc-950 p-2 shadow-2xl ring-1 ring-white/10 text-white animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-bold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Settings size={14} className="text-violet-400" />
                        <span>Configurações</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAdmin?.();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Shield size={14} className="text-amber-400" />
                        <span>Painel do Assinante</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenCreditsModal?.();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <CreditCard size={14} className="text-emerald-400" />
                        <span>Recarregar Créditos</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mx-auto h-px w-5 bg-white/10" />

          {/* Apps / Home with Flyout Menu */}
          <div className="group/home relative">
            <a
              title="Início"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({ path: "/" }, "", "/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
                if (onGoHome) onGoHome();
                else if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("db:go_home"));
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
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
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 pl-3 opacity-0 transition-all duration-200 group-hover/home:pointer-events-auto group-hover/home:opacity-100 z-50">
              <div className="flex flex-col gap-0.5 rounded-xl bg-zinc-900 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/[0.08] min-w-[200px]">
                <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] bg-violet-500/15 text-violet-300 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  <span className="truncate">Todos os apps</span>
                </div>
                <div className="my-0.5 h-px bg-white/[0.06]" />
                {AGENTS_LIST.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleLaunchAgent(a.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 text-left cursor-pointer"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${a.color}22` }}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                    </span>
                    <span className="truncate">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projetos */}
          <button
            title="Projetos"
            type="button"
            onClick={() => onOpenProjects?.()}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Briefcase size={20} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              Projetos
            </span>
          </button>

          {/* Galeria */}
          <button
            title="Galeria"
            type="button"
            onClick={() => onOpenGallery?.()}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Images size={20} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              Galeria
            </span>
          </button>

          {/* Comunidade */}
          <button
            title="Comunidade"
            type="button"
            onClick={() => onOpenCommunity?.()}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Globe size={20} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
              Comunidade
            </span>
          </button>

          {/* Rodapé da Sidebar */}
          <div className="rodape-da-sidebar">
            <div className="min-h-0 overflow-visible">
              <div className="mx-auto my-1.5 h-px w-5 bg-white/10" />
              <div className="flex flex-col items-center gap-1.5">
                {/* Reportar */}
                <button
                  type="button"
                  title="Reportar erro ou sugestão"
                  onClick={() => setIsReportModalOpen(true)}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-red-400 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300 cursor-pointer"
                >
                  <Flag size={18} />
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
                    Reportar
                  </span>
                </button>

                {/* Links Úteis */}
                <div className="relative">
                  <button
                    type="button"
                    title="Links úteis"
                    onClick={() => setIsLinksMenuOpen(!isLinksMenuOpen)}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-500 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <MoreHorizontal size={20} />
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 z-50">
                      Links úteis
                    </span>
                  </button>

                  {isLinksMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLinksMenuOpen(false)} />
                      <div className="absolute left-full bottom-0 ml-3 z-50 w-56 rounded-2xl bg-zinc-950 p-2 shadow-2xl ring-1 ring-white/10 text-white animate-in fade-in zoom-in-95 duration-150">
                        <div className="py-1">
                          <a
                            href="https://wa.me/5577998317804"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Headphones size={14} className="text-emerald-400" />
                            <span>Suporte WhatsApp</span>
                          </a>
                          <a
                            href="https://app.designbuilder.co/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <BookOpen size={14} className="text-violet-400" />
                            <span>Guia de Prompts</span>
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (1:1 Oficial) ── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav aria-label="Navegação principal" className="pointer-events-auto flex h-16 items-center rounded-[28px] bg-zinc-950/95 px-2 shadow-[0_8px_28px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl w-full max-w-md justify-around gap-1">
          <button
            type="button"
            aria-label="Início"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.pushState({ path: "/" }, "", "/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              if (onGoHome) onGoHome();
              else if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("db:go_home"));
              }
            }}
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none active:scale-95 flex-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full group-hover:bg-white/[0.06]">
              <Home size={16} />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Início</span>
          </button>

          <button
            type="button"
            aria-label="Projetos"
            onClick={() => onOpenProjects?.()}
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none active:scale-95 flex-1 text-zinc-400 hover:text-white"
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full">
              <Briefcase size={16} />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Projetos</span>
          </button>

          <button
            type="button"
            aria-label="Galeria"
            onClick={() => onOpenGallery?.()}
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none active:scale-95 flex-1 text-zinc-400 hover:text-white"
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full">
              <Images size={16} />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Galeria</span>
          </button>

          <button
            type="button"
            aria-label="Comunidade"
            onClick={() => onOpenCommunity?.()}
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none active:scale-95 flex-1 text-zinc-400 hover:text-white"
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full">
              <Globe size={16} />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Comunidade</span>
          </button>

          <button
            type="button"
            aria-label="Abrir conta"
            onClick={() => setIsSettingsModalOpen(true)}
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full outline-none active:scale-95"
          >
            <span className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-violet-500/30">
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                {userInitials.substring(0, 1)}
              </span>
            </span>
          </button>
        </nav>
      </div>

      {/* ── ÁREA PRINCIPAL COM SCROLL & CARDS (1:1 Oficial de Design Builder.html) ── */}
      <div className="flex h-[100dvh] flex-col overflow-hidden relative z-[2] lg:pl-[60px]">
        <div className="flex-1 min-h-0 max-lg:overflow-x-hidden lg:pb-0 overflow-y-auto overscroll-contain pb-24 lg:overflow-y-auto custom-scrollbar">
          <main className="max-lg:min-h-full lg:min-h-screen overflow-x-hidden">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
              <div className="relative">
                {/* Orbs de fundo da página */}
                <div className="pointer-events-none absolute inset-0 -top-32 overflow-hidden">
                  <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-violet-500/[0.03] blur-[100px]" />
                  <div className="absolute -top-20 right-1/4 h-60 w-60 rounded-full bg-blue-500/[0.03] blur-[80px]" />
                </div>

                {/* Cabeçalho Oficial: Logo DB, Saudação, Subtítulo */}
                <div className="relative mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      alt="Design Builder"
                      width={399}
                      height={85}
                      decoding="async"
                      className="h-7 w-auto opacity-80"
                      src="/logo-db.webp"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute("src", "/Design Builder_files/logo-db.jpeg");
                      }}
                      style={{ color: "transparent" }}
                    />
                  </div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    {getGreeting()}
                    <span className="text-zinc-400">, {displayName}</span>
                  </h1>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-400">
                    Selecione um dos agentes abaixo para criar designs profissionais com inteligência artificial
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-700">
                      6 agentes
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                  </div>
                </div>

                {/* Grid Oficial dos 6 Agentes com 3D Flip Card & Vídeo no Hover */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {AGENTS_LIST.map((agent, idx) => (
                    <OfficialAgentCard
                      key={agent.id}
                      agent={agent}
                      index={idx}
                      onOpen={() => handleLaunchAgent(agent.id)}
                    />
                  ))}
                </div>

                <div className="pointer-events-none mt-16 flex justify-center">
                  <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modais de suporte e configurações */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        generationId="hub-feedback"
      />
      <DesignBuilderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  );
};

// ── COMPONENTE OFICIAL DO CARD 3D FLIP COM VÍDEO (1:1 Design Builder.html) ──
interface OfficialAgentCardProps {
  agent: AgentCardDef;
  index: number;
  onOpen: () => void;
}

const OfficialAgentCard: React.FC<OfficialAgentCardProps> = ({ agent, index, onOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current && agent.videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const renderCardIcon = () => {
    switch (agent.icon) {
      case "ref":
        return <ImageIcon className="h-5 w-5" style={{ color: agent.color }} />;
      case "hydra":
        return <Package className="h-5 w-5" style={{ color: agent.color }} />;
      case "enhance":
        return <Palette className="h-5 w-5" style={{ color: agent.color }} />;
      case "db12":
        return <PenTool className="h-5 w-5" style={{ color: agent.color }} />;
      case "orion":
        return <Sparkles className="h-5 w-5" style={{ color: agent.color }} />;
      case "altera":
        return <Wand2 className="h-5 w-5" style={{ color: agent.color }} />;
    }
  };

  const hasVideo = Boolean(agent.videoUrl && agent.bullets && agent.bullets.length > 0);

  return (
    <a
      href={agent.route}
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group relative block lg:aspect-[4/5] ${
        hasVideo ? "lg:[perspective:1200px]" : ""
      } transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer`}
    >
      <div
        className={`relative w-full lg:h-full transition-transform duration-700 ease-suave ${
          hasVideo
            ? "lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]"
            : ""
        }`}
      >
        {/* ── CARD FRONT (Frente do Card) ── */}
        <div
          className={`relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card ${
            hasVideo ? "lg:[backface-visibility:hidden]" : ""
          } border border-white/[0.08] hover:border-white/20 transition-colors`}
        >
          {/* Linha de acento neon no topo */}
          <div
            className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
            }}
          />

          {/* Badge (Top 1°, Top 2°, etc.) */}
          {agent.badge && (
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: agent.badgeBg,
                  color: agent.badgeColor,
                }}
              >
                {agent.badge}
              </span>
            </div>
          )}

          {/* Ícone com glow */}
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${agent.color}15` }}
          >
            {renderCardIcon()}
          </div>

          {/* Textos */}
          <div className="mt-4">
            <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
              {agent.name}
            </h3>
            {agent.subtitle && (
              <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                {agent.subtitle}
              </span>
            )}
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
              {agent.desc}
            </p>
          </div>

          {/* Rodapé do Card */}
          <div
            className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-white"
            style={agent.id === "hydra" ? { color: agent.color } : {}}
          >
            {hasVideo && <span className="hidden lg:inline">Passe o mouse para ver</span>}
            <span className={hasVideo ? "lg:hidden" : ""}>Abrir</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* ── CARD BACK (Verso com Vídeo 3D no Hover) ── */}
        {hasVideo && (
          <div
            className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)] border border-white/10"
            style={{ aspectRatio: "7 / 5" }}
          >
            {/* Coluna do Vídeo */}
            <div className="relative h-full shrink-0" style={{ aspectRatio: "4 / 5" }}>
              <video
                ref={videoRef}
                src={agent.videoUrl}
                loop
                playsInline
                muted
                preload="metadata"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
            </div>

            {/* Coluna das Vantagens e Ação */}
            <div className="flex h-full flex-1 flex-col justify-between bg-black p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  {agent.name}
                </p>
                <div className="mt-2 h-px w-8 bg-white/15" />
                <ul className="mt-3.5 space-y-2.5">
                  {agent.bullets?.map((b, i) => (
                    <li key={i} className="flex gap-2 text-[11px] leading-snug text-white/90">
                      <span
                        className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white hover:text-violet-300 transition-colors">
                <span>Abrir</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        )}
      </div>
    </a>
  );
};

export default DesignBuilderVitrine;
