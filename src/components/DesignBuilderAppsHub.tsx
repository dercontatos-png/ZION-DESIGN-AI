import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Package,
  Palette,
  PenTool,
  Wand2,
  ArrowRight,
  Search,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Home
} from "lucide-react";

export interface AppDefinition {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  subtitle?: string;
  desc: string;
  color: string;
  route: string;
  videoUrl?: string;
  bullets?: string[];
  icon: "image" | "package" | "palette" | "pen-tool" | "wand";
}

export const APPS_CATALOG: AppDefinition[] = [
  {
    id: "ref",
    name: "REF",
    subtitle: "Builder",
    badge: "Em alta · Top 1°",
    badgeColor: "rgb(139, 92, 246)",
    badgeBg: "rgba(139, 92, 246, 0.125)",
    desc: "Repita o estilo visual de uma inspiração com fidelidade.",
    color: "rgb(139, 92, 246)",
    route: "/agent/ref",
    videoUrl: "https://apidb20.designbuilder.co/api/agent-videos/ref-builder?v=4",
    bullets: [
      "Fácil de unir inspirações",
      "Detalhe o que você quer de cada inspiração."
    ],
    icon: "image"
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
    icon: "package"
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
    icon: "palette"
  },
  {
    id: "design-builder1-2",
    name: "Design Builder 1.2",
    badge: "Em alta · Top 3°",
    badgeColor: "rgb(124, 58, 237)",
    badgeBg: "rgba(124, 58, 237, 0.125)",
    desc: "A primeira versão do DB, dinâmico para diversos nichos e desafios.",
    color: "rgb(124, 58, 237)",
    route: "/agent/design-builder1-2",
    icon: "pen-tool"
  },
  {
    id: "orion-pro",
    name: "Órion Pro",
    subtitle: "Builder",
    badge: "Em alta · Top 2°",
    badgeColor: "rgb(255, 213, 0)",
    badgeBg: "rgba(255, 213, 0, 0.125)",
    desc: "Pipeline avançada para mais controle criativo.",
    color: "rgb(255, 213, 0)",
    route: "/orion-pro",
    videoUrl: "https://apidb20.designbuilder.co/api/agent-videos/orion-pro?v=4",
    bullets: [
      "Construa qualquer estilo de design",
      "Composições complexas com texto",
      "Múltiplas inspirações de estilo"
    ],
    icon: "pen-tool"
  },
  {
    id: "altera-facil",
    name: "Altera Fácil",
    subtitle: "Builder",
    badge: "Beta",
    badgeColor: "rgb(168, 85, 247)",
    badgeBg: "rgba(168, 85, 247, 0.125)",
    desc: "Altere cenas, poses, luz e enquadramento sem perder a identidade.",
    color: "rgb(168, 85, 247)",
    route: "/altera-facil",
    icon: "wand"
  }
];

interface DesignBuilderAppsHubProps {
  onSelectAgent: (agentId: string) => void;
  onOpenVitrine: () => void;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  userName?: string;
}

export const DesignBuilderAppsHub: React.FC<DesignBuilderAppsHubProps> = ({
  onSelectAgent,
  onOpenVitrine,
  showToast,
  userName = "Ricardo"
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = APPS_CATALOG.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      app.desc.toLowerCase().includes(q) ||
      (app.bullets && app.bullets.some((b) => b.toLowerCase().includes(q)))
    );
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleLaunch = (app: AppDefinition) => {
    if (typeof window !== "undefined") {
      window.history.pushState({ path: app.route }, "", app.route);
    }
    onSelectAgent(app.id);
    if (showToast) {
      showToast(`Iniciando ${app.name}...`, "info");
    }
  };

  const renderIcon = (type: AppDefinition["icon"], color: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" style={{ color }} />;
      case "package":
        return <Package className="h-5 w-5" style={{ color }} />;
      case "palette":
        return <Palette className="h-5 w-5" style={{ color }} />;
      case "pen-tool":
        return <PenTool className="h-5 w-5" style={{ color }} />;
      case "wand":
        return <Wand2 className="h-5 w-5" style={{ color }} />;
    }
  };

  return (
    <main className="max-lg:min-h-full lg:min-h-screen overflow-x-hidden bg-black text-white select-none custom-scrollbar">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="relative">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 -top-32 overflow-hidden">
            <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-violet-500/[0.04] blur-[100px]" />
            <div className="absolute -top-20 right-1/4 h-60 w-60 rounded-full bg-blue-500/[0.03] blur-[80px]" />
          </div>

          {/* Top navigation actions */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <button
                type="button"
                onClick={onOpenVitrine}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <Home size={13} />
                <span>Início</span>
              </button>
              <ChevronRight size={11} className="text-zinc-600" />
              <span className="text-zinc-200 font-medium">Todos os agentes</span>
            </div>

            <button
              type="button"
              onClick={onOpenVitrine}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Voltar para Vitrine</span>
            </button>
          </div>

          {/* Header Title Section */}
          <div className="relative mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-violet-900/30">
                  DB
                </div>
                <span className="text-base font-bold tracking-tight text-white/90">
                  Design Builder
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {getGreeting()}
              <span className="text-zinc-400">, {userName}</span>
            </h1>

            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-400">
              Selecione um dos agentes abaixo para criar designs profissionais com inteligência artificial
            </p>

            {/* Search Input Bar */}
            <div className="mt-6 max-w-md relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar agente por nome ou recurso..."
                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-700">
                {filteredApps.length} {filteredApps.length === 1 ? "agente" : "agentes"}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
            </div>
          </div>

          {/* 3D Flip Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app, index) => (
              <AppFlipCard
                key={app.id}
                app={app}
                index={index}
                onLaunch={() => handleLaunch(app)}
                renderIcon={renderIcon}
              />
            ))}
          </div>

          <div className="pointer-events-none mt-16 flex justify-center">
            <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    </main>
  );
};

// ── Individual 3D Flip Card Component ──
interface AppFlipCardProps {
  app: AppDefinition;
  index: number;
  onLaunch: () => void;
  renderIcon: (type: AppDefinition["icon"], color: string) => React.ReactNode;
}

const AppFlipCard: React.FC<AppFlipCardProps> = ({ app, index, onLaunch, renderIcon }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && app.videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onLaunch}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onLaunch();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group relative block cursor-pointer lg:aspect-[4/5] app-flip-container transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] outline-none`}
    >
      <div className="relative w-full lg:h-full app-flip-inner ease-suave">
        {/* ── CARD FRONT ── */}
        <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card app-flip-front border border-white/[0.08] bg-[#0c0a15]/90 hover:border-white/20 transition-colors">
          {/* Subtle accent line on top */}
          <div
            className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${app.color}, transparent)`
            }}
          />

          {/* Badge */}
          {app.badge && (
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: app.badgeBg || "rgba(139, 92, 246, 0.125)",
                  color: app.badgeColor || app.color
                }}
              >
                {app.badge}
              </span>
            </div>
          )}

          {/* Icon */}
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${app.color}15` }}
          >
            {renderIcon(app.icon, app.color)}
          </div>

          {/* Content */}
          <div className="mt-4">
            <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
              {app.name}
            </h3>
            {app.subtitle && (
              <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                {app.subtitle}
              </span>
            )}
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
              {app.desc}
            </p>
          </div>

          {/* Footer Link */}
          <div
            className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-all duration-200 group-hover:gap-2.5 group-hover:text-white"
          >
            <span className="hidden lg:inline">
              {app.videoUrl ? "Passe o mouse para ver" : "Abrir"}
            </span>
            <span className="lg:hidden">Abrir</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* ── CARD BACK (FLIPPED 180° WITH VIDEO ON DESKTOP) ── */}
        {app.videoUrl && (
          <div
            className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex app-flip-back border border-white/10 shadow-2xl"
            style={{ aspectRatio: "7 / 5" }}
          >
            {/* Video preview column */}
            <div className="relative h-full shrink-0" style={{ aspectRatio: "4 / 5" }}>
              <video
                ref={videoRef}
                src={app.videoUrl}
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
            </div>

            {/* Information column on back */}
            <div className="flex h-full flex-1 flex-col justify-between bg-black p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  {app.name}
                </p>
                <div className="mt-2 h-px w-8 bg-white/15" />
                {app.bullets && (
                  <ul className="mt-3.5 space-y-2.5">
                    {app.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[11px] leading-snug text-white/90">
                        <span
                          className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: app.color }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white hover:text-violet-300 transition-colors">
                <span>Abrir</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
