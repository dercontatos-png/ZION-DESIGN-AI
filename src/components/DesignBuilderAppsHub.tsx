import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Camera,
  Image as ImageIcon,
  Wand2,
  ScanFace,
  ArrowUpRight,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  Home
} from "lucide-react";

export interface AppDefinition {
  id: string;
  name: string;
  category: string;
  categoryTag: string;
  tagline: string;
  desc: string;
  color: string;
  accentBg: string;
  accentBorder: string;
  route: string;
  bullets: string[];
  status: "active" | "beta" | "soon";
  popular?: boolean;
}

export const APPS_CATALOG: AppDefinition[] = [
  {
    id: "design-builder",
    name: "Zion Design",
    category: "Campanhas & Flyers",
    categoryTag: "Principal",
    tagline: "Criativos, flyers e campanhas completas de alta conversao",
    desc: "Criacao de artes comerciais com controle total de camadas de tipografia, pesos visuais e integracao direta com prompt mestre.",
    color: "#8B5CF6",
    accentBg: "rgba(139, 92, 246, 0.12)",
    accentBorder: "rgba(139, 92, 246, 0.3)",
    route: "/agent/design-builder1-2",
    bullets: ["Textos monumentais com pesos 1 a 5", "Estilos autorais para social media", "Fidelidade facial fotografica", "Multi-camadas inteligentes"],
    status: "active",
    popular: true
  },
  {
    id: "orion-pro",
    name: "Orion Pro",
    category: "Direcao de Arte",
    categoryTag: "Editorial & 3D",
    tagline: "Direcao de arte cinematografica com liberdade criativa total",
    desc: "Render hiper-realista com controle de iluminacao dramatica, estudios virtuais e referencias esteticas de nivel cinema.",
    color: "#F59E0B",
    accentBg: "rgba(245, 158, 11, 0.12)",
    accentBorder: "rgba(245, 158, 11, 0.3)",
    route: "/orion-pro",
    bullets: ["Fotografia cinematografica & editorial", "Qualidade 4K Ultra com texturas reais", "Qualquer estilo visual sem limitacoes", "Render dinamico de iluminacao"],
    status: "active",
    popular: true
  },
  {
    id: "ref",
    name: "Ref Builder",
    category: "Referencias",
    categoryTag: "Pinterest Sync",
    tagline: "Clonagem e recombinacao de referencias com Pinterest nativo",
    desc: "Clone estruturas visuais, composicoes e paletas de cores de qualquer imagem do Pinterest ou upload com um unico clique.",
    color: "#EC4899",
    accentBg: "rgba(236, 72, 153, 0.12)",
    accentBorder: "rgba(236, 72, 153, 0.3)",
    route: "/agent/ref",
    bullets: ["Busca no Pinterest integrada", "Extracao de paleta e iluminacao", "Transferencia fiel de pose e composicao", "Presets 1:1, 4:5 e 9:16"],
    status: "active",
    popular: true
  },
  {
    id: "hydra",
    name: "Hydra",
    category: "Fotografia & E-commerce",
    categoryTag: "Packshots",
    tagline: "Fotos de produtos e ambientacoes de alta conversao",
    desc: "Transforme fotos amadoras de produtos em ensaios comerciais dignos de grandes marcas em estudios hiper-realistas.",
    color: "#A78BFA",
    accentBg: "rgba(167, 139, 250, 0.12)",
    accentBorder: "rgba(167, 139, 250, 0.3)",
    route: "/hydra",
    bullets: ["Ensaios de produtos profissionais", "Ambientacoes de luxo e lifestyle", "Sombras e reflexos contextuais 100% fisicos", "Curadoria por designers seniores"],
    status: "active"
  },
  {
    id: "enhance-builder",
    name: "Enhance",
    category: "Upscale & Restauracao",
    categoryTag: "Upscale 4K",
    tagline: "Restauracao de imagens e ampliacao ultra-nitida",
    desc: "Remova ruidos, reconstrua detalhes faciais borrados e aumente a resolucao das suas fotos para ate 4K com fidelidade absoluta.",
    color: "#10B981",
    accentBg: "rgba(16, 185, 129, 0.12)",
    accentBorder: "rgba(16, 185, 129, 0.3)",
    route: "/enhance-builder",
    bullets: ["Upscale 2x e 4K preservando tracos", "Restauracao de fotos antigas ou compactadas", "Nitidez facial com textura de pele real", "Recuperacao de iluminacao"],
    status: "active"
  },
  {
    id: "altera-facil",
    name: "Altera Facil",
    category: "Identidade & Poses",
    categoryTag: "Consistencia",
    tagline: "Variacoes de roupas, poses e cenarios mantendo o mesmo rosto",
    desc: "Mude o look, a pose e a ambientacao da modelo sem perder a identidade facial ou caracteristicas corporais originais.",
    color: "#F97316",
    accentBg: "rgba(249, 115, 22, 0.12)",
    accentBorder: "rgba(249, 115, 22, 0.3)",
    route: "/altera-facil",
    bullets: ["Consistencia facial garantida", "Troca completa de roupas e vestuario", "Novas poses dinamicas para ensaios", "Consistencia de marca e influencer"],
    status: "active"
  }
];

interface DesignBuilderAppsHubProps {
  onSelectAgent: (agentId: string) => void;
  onOpenVitrine: () => void;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const DesignBuilderAppsHub: React.FC<DesignBuilderAppsHubProps> = ({
  onSelectAgent,
  onOpenVitrine,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = ["Todos", "Campanhas & Flyers", "Direcao de Arte", "Referencias", "Fotografia & E-commerce", "Upscale & Restauracao", "Identidade & Poses"];

  const filteredApps = APPS_CATALOG.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.bullets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === "Todos" || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getAppIcon = (id: string, color: string) => {
    switch (id) {
      case "design-builder":
        return <Layers size={22} style={{ color }} />;
      case "orion-pro":
        return <Sparkles size={22} style={{ color }} />;
      case "ref":
        return <ImageIcon size={22} style={{ color }} />;
      case "hydra":
        return <Camera size={22} style={{ color }} />;
      case "enhance-builder":
        return <Wand2 size={22} style={{ color }} />;
      case "altera-facil":
        return <ScanFace size={22} style={{ color }} />;
      default:
        return <Layers size={22} style={{ color }} />;
    }
  };

  const handleLaunchApp = (app: AppDefinition) => {
    if (typeof window !== "undefined") {
      window.history.pushState({ path: app.route }, "", app.route);
    }
    onSelectAgent(app.id);
    if (showToast) {
      showToast(`Iniciando ${app.name}...`, "info");
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-black text-white p-4 sm:p-8 lg:p-10 select-none custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <button
              type="button"
              onClick={onOpenVitrine}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Home size={14} />
              <span>Inicio</span>
            </button>
            <ChevronRight size={12} className="text-zinc-600" />
            <span className="text-violet-400 font-semibold">Todos os apps</span>
          </div>

          <button
            type="button"
            onClick={onOpenVitrine}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Voltar para Vitrine</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300">
              <Sparkles size={13} />
              <span>Suite Criativa Completa</span>
              <span className="text-violet-500/50"></span>
              <span className="text-white font-bold">{APPS_CATALOG.length} Aplicativos Oficiais</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Todos os Apps de IA <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
                para Designers de Alta Performance
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
              Alterne entre ferramentas especializadas criadas para cada etapa da sua producao: de flyers monumentais a estudios fotograficos e restauracao 4K.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar aplicativo, recurso ou estilo..."
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
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

            {/* Quick stats */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <SlidersHorizontal size={14} className="text-violet-400" />
              <span>Mostrando <strong>{filteredApps.length}</strong> de {APPS_CATALOG.length} apps</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="relative z-10 mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleLaunchApp(app)}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0a18] p-6 hover:border-violet-500/50 hover:bg-[#120e22] transition-all duration-300 shadow-xl cursor-pointer overflow-hidden"
              style={{
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
              }}
            >
              {/* Subtle gradient hover glow */}
              <div
                className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: app.color }}
              />

              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: app.accentBg,
                        borderColor: app.accentBorder
                      }}
                    >
                      {getAppIcon(app.id, app.color)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-200 transition-colors flex items-center gap-1.5">
                        {app.name}
                      </h3>
                      <span className="text-[11px] font-medium text-zinc-400">
                        {app.category}
                      </span>
                    </div>
                  </div>

                  {app.popular && (
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Popular
                    </span>
                  )}
                </div>

                {/* Tagline & Desc */}
                <p className="text-xs sm:text-sm font-semibold text-zinc-200 mb-2 leading-snug">
                  {app.tagline}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                  {app.desc}
                </p>

                {/* Bullets */}
                <div className="space-y-2 border-t border-white/[0.06] pt-4 mb-6">
                  {app.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                      <CheckCircle2 size={13} style={{ color: app.color }} className="shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer button */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 bg-white/[0.06] group-hover:bg-violet-600 text-zinc-200 group-hover:text-white border border-white/10 group-hover:border-violet-500/50 shadow-md cursor-pointer"
                >
                  <span>Abrir no Studio</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span className="text-[10px] text-zinc-400 group-hover:text-violet-200 font-mono">
                      {app.route}
                    </span>
                    <ArrowUpRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          ))}

          {/* Card Em Breve / Ecossistema */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-6 text-zinc-500">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
                <Sparkles size={22} />
              </div>
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/[0.05] text-zinc-400 mb-2">
                Em Desenvolvimento
              </div>
              <h3 className="text-base font-bold text-zinc-300 mb-1">Novos Agentes & Integracoes</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                Gerador de animacoes para criativos, assistente de redacao e integracoes com WhatsApp e Telegram estao a caminho.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-500 font-mono">
              Atualizacoes automaticas da suite
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignBuilderAppsHub;
