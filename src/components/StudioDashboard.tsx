import React from "react";
import {
  Image as ImageIcon,
  Package,
  Palette,
  PenTool,
  Wand2,
  ArrowRight
} from "lucide-react";

interface StudioDashboardProps {
  onSelectAgent: (agentId: string) => void;
  onOpenVitrine?: () => void;
  userName?: string;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  onSelectAgent,
  onOpenVitrine,
  userName = "Ricardo",
}) => {
  // Saudação dinâmica baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <main className="max-lg:min-h-full lg:min-h-screen overflow-x-hidden flex-1 relative bg-black">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
        <div className="relative">
          {/* Luzes de fundo atmosféricas oficiais */}
          <div className="pointer-events-none absolute inset-0 -top-32 overflow-hidden">
            <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-violet-500/[0.03] blur-[100px]" />
            <div className="absolute -top-20 right-1/4 h-60 w-60 rounded-full bg-blue-500/[0.03] blur-[80px]" />
          </div>

          {/* Header da Página */}
          <div className="relative mb-12">
            <div className="flex items-center justify-between gap-3 mb-4">
              <img
                alt="Zion Design"
                width={842}
                height={163}
                title="Voltar à Vitrine (Home)"
                className="h-7 w-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                src="/logo-zion.svg"
                onClick={() => onOpenVitrine?.()}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo-zion.webp";
                }}
              />
              {onOpenVitrine && (
                <button
                  type="button"
                  onClick={onOpenVitrine}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/10 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <span>Ver Vitrine / Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl font-display">
              {getGreeting()}
              <span className="text-zinc-400 font-normal">, {userName}</span>
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

          {/* Grid dos 6 Agentes com Flip 3D Oficial (Idêntico a 1.html) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* 1. REF Builder (Top 1°) */}
            <div
              onClick={() => onSelectAgent("ref")}
              className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
            >
              <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                {/* Frente */}
                <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden] border border-white/10 bg-[#0d0914]/90 backdrop-blur-md">
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.376), transparent)" }}
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: "rgba(139, 92, 246, 0.125)", color: "rgb(139, 92, 246)" }}
                    >
                      Em alta · Top 1°
                    </span>
                  </div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(139, 92, 246, 0.082)" }}
                  >
                    <ImageIcon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90 font-display">
                      REF
                    </h3>
                    <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                      Builder
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                      Repita o estilo visual de uma inspiração com fidelidade.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-violet-400">
                    <span className="hidden lg:inline">Passe o mouse para ver</span>
                    <span className="lg:hidden">Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Verso 3D */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)] border border-violet-500/30"
                  style={{ aspectRatio: "7 / 5" }}
                >
                  <div className="relative h-full shrink-0" style={{ aspectRatio: "4 / 5" }}>
                    <video
                      src="https://apidb20.designbuilder.co/api/agent-videos/ref-builder?v=4"
                      loop
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
                  </div>
                  <div className="flex h-full flex-1 flex-col justify-between bg-black p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 font-display">
                        REF
                      </p>
                      <div className="mt-2 h-px w-8 bg-white/15" />
                      <ul className="mt-3.5 space-y-2.5">
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                          <span>Fácil de unir inspirações</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                          <span>Detalhe o que você quer de cada inspiração.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white hover:text-violet-300">
                      <span>Abrir</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Hydra Builder */}
            <div
              onClick={() => onSelectAgent("hydra")}
              className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
            >
              <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                {/* Frente */}
                <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden] border border-white/10 bg-[#0d0914]/90 backdrop-blur-md">
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.376), transparent)" }}
                  />
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(139, 92, 246, 0.082)" }}
                  >
                    <Package className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90 font-display">
                      Hydra
                    </h3>
                    <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                      Builder
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                      Crie imagens de produto usando inspirações da galeria.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-violet-400">
                    <span className="hidden lg:inline">Passe o mouse para ver</span>
                    <span className="lg:hidden">Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Verso 3D */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)] border border-violet-500/30"
                  style={{ aspectRatio: "7 / 5" }}
                >
                  <div className="relative h-full shrink-0" style={{ aspectRatio: "4 / 5" }}>
                    <video
                      src="https://apidb20.designbuilder.co/api/agent-videos/product-builder-v2?v=4"
                      loop
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
                  </div>
                  <div className="flex h-full flex-1 flex-col justify-between bg-black p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 font-display">
                        Hydra
                      </p>
                      <div className="mt-2 h-px w-8 bg-white/15" />
                      <ul className="mt-3.5 space-y-2.5">
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                          <span>Use nossa biblioteca de inspirações</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                          <span>Composição avançada com inspirações de estilo</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                          <span>Seja um Designer Sênior</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white hover:text-violet-300">
                      <span>Abrir</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Enhance (Top 3°) */}
            <div
              onClick={() => onSelectAgent("enhance-builder")}
              className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
            >
              <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                {/* Frente */}
                <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden] border border-white/10 bg-[#0d0914]/90 backdrop-blur-md">
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.376), transparent)" }}
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: "rgba(124, 58, 237, 0.125)", color: "rgb(124, 58, 237)" }}
                    >
                      Em alta · Top 3°
                    </span>
                  </div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(124, 58, 237, 0.082)" }}
                  >
                    <Palette className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90 font-display">
                      Enhance
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                      Melhore fotos borradas, antigas ou de baixa qualidade.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-violet-400">
                    <span className="hidden lg:inline">Passe o mouse para ver</span>
                    <span className="lg:hidden">Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Verso 3D */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)] border border-violet-500/30"
                  style={{ aspectRatio: "7 / 5" }}
                >
                  <div className="relative h-full shrink-0" style={{ aspectRatio: "4 / 5" }}>
                    <video
                      src="https://apidb20.designbuilder.co/api/agent-videos/enhance-builder?v=4"
                      loop
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
                  </div>
                  <div className="flex h-full flex-1 flex-col justify-between bg-black p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 font-display">
                        Enhance
                      </p>
                      <div className="mt-2 h-px w-8 bg-white/15" />
                      <ul className="mt-3.5 space-y-2.5">
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-600" />
                          <span>Recupera fotos borradas e antigas</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-600" />
                          <span>Hiper realismo + retoque de estúdio</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-violet-600" />
                          <span>Mantém identidade do sujeito</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white hover:text-violet-300">
                      <span>Abrir</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Zion Design */}
            <div
              onClick={() => onSelectAgent("design-builder1-2")}
              className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 active:scale-[0.98] cursor-pointer"
            >
              <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave">
                <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card border border-white/10 bg-[#0d0914]/90 backdrop-blur-md">
                  <div
                    className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.22]"
                    style={{ backgroundColor: "rgba(124, 58, 237, 0.125)" }}
                  />
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.376), transparent)" }}
                  />
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(124, 58, 237, 0.082)" }}
                  >
                    <PenTool className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90 font-display">
                      Zion Design
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                      A primeira versão do DB, dinâmico para diversos nichos e desafios.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-violet-400">
                    <span>Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Órion Pro (Top 2°) */}
            <div
              onClick={() => onSelectAgent("orion-pro")}
              className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
            >
              <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                {/* Frente */}
                <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden] border border-white/10 bg-[#0d0914]/90 backdrop-blur-md">
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255, 213, 0, 0.376), transparent)" }}
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: "rgba(255, 213, 0, 0.125)", color: "rgb(255, 213, 0)" }}
                    >
                      Em alta · Top 2°
                    </span>
                  </div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(255, 213, 0, 0.082)" }}
                  >
                    <PenTool className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90 font-display">
                      Órion Pro
                    </h3>
                    <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                      Builder
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                      Pipeline avançada para mais controle criativo.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-amber-400">
                    <span className="hidden lg:inline">Passe o mouse para ver</span>
                    <span className="lg:hidden">Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Verso 3D */}
                <div
                  className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)] border border-amber-500/30"
                  style={{ aspectRatio: "7 / 5" }}
                >
                  <div className="relative h-full shrink-0" style={{ aspectRatio: "4 / 5" }}>
                    <video
                      src="https://apidb20.designbuilder.co/api/agent-videos/orion-pro?v=4"
                      loop
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black to-transparent" />
                  </div>
                  <div className="flex h-full flex-1 flex-col justify-between bg-black p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 font-display">
                        Órion Pro
                      </p>
                      <div className="mt-2 h-px w-8 bg-white/15" />
                      <ul className="mt-3.5 space-y-2.5">
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                          <span>Construa qualquer estilo de design</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                          <span>Composições complexas com texto</span>
                        </li>
                        <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                          <span>Múltiplas inspirações de estilo</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-white hover:text-amber-300">
                      <span>Abrir</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Altera Fácil (Beta) */}
            <div
              onClick={() => onSelectAgent("altera-facil")}
              className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 active:scale-[0.98] cursor-pointer"
            >
              <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave">
                <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card border border-white/10 bg-[#0d0914]/90 backdrop-blur-md">
                  <div
                    className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.22]"
                    style={{ backgroundColor: "rgba(168, 85, 247, 0.125)" }}
                  />
                  <div
                    className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.376), transparent)" }}
                  />
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: "rgba(168, 85, 247, 0.125)", color: "rgb(168, 85, 247)" }}
                    >
                      Beta
                    </span>
                  </div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: "rgba(168, 85, 247, 0.082)" }}
                  >
                    <Wand2 className="h-5 w-5 text-fuchsia-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90 font-display">
                      Altera Fácil
                    </h3>
                    <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                      Builder
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                      Altere cenas, poses, luz e enquadramento sem perder a identidade.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5 group-hover:text-fuchsia-400">
                    <span>Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Divisor Inferior */}
          <div className="pointer-events-none mt-16 flex justify-center">
            <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default StudioDashboard;
