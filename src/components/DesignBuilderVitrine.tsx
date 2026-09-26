import React, { useState, useEffect } from "react";
import { CosmicBackground } from "./CosmicBackground";
import { DesignBuilderSidebar } from "./DesignBuilderSidebar";
import { DesignBuilderMobileNav } from "./DesignBuilderMobileNav";
import { DesignBuilderAssistant } from "./DesignBuilderAssistant";
import {
  Image as ImageIcon,
  Package,
  Palette,
  PenTool,
  Wand2,
  ArrowRight
} from "lucide-react";

interface DesignBuilderVitrineProps {
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

export const DesignBuilderVitrine: React.FC<DesignBuilderVitrineProps> = ({
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
    if (propUserName && propUserName !== "Usuário") return propUserName;
    try {
      const u = localStorage.getItem("currentUser") || localStorage.getItem("zion_user");
      if (u) {
        const parsed = JSON.parse(u);
        return parsed?.name || parsed?.full_name || "Ricardo";
      }
    } catch (_) {}
    return "Ricardo";
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const displayName = userName.split(" ")[0] || "Ricardo";
  const userInitials = (displayName.substring(0, 2) || "RI").toUpperCase();

  const handleAgentClick = (slug: string) => {
    const targetPath = slug === "design-builder1-2" ? "/agent/design-builder1-2" : slug === "ref" ? "/agent/ref" : `/${slug}`;
    if (typeof window !== "undefined") {
      window.history.pushState({ path: targetPath }, "", targetPath);
    }
    onOpenStudio(slug);
  };

  return (
    <div
      className="flex h-[100dvh] flex-col overflow-hidden relative z-[2]"
      style={{ backgroundColor: "#000000", color: "#ffffff", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Background Glow Orbs Oficiais ─────────────────── */}
      <div aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── Background Canvas de Estrelas / Cometas ──────── */}
      <CosmicBackground />

      {/* ── Barra Lateral Esquerda Persistente (Dock Flutuante Oficial) ── */}
      <DesignBuilderSidebar
        activeTab="home"
        onNavigateTab={(tab) => {
          if (onNavigateTab) onNavigateTab(tab);
        }}
        onOpenProjects={onOpenProjects}
        onOpenGallery={onOpenGallery}
        onOpenCommunity={onOpenCommunity}
        onOpenAdmin={onOpenAdmin}
        onOpenAgentes={onOpenAgentes}
        onSelectAgent={(slug) => handleAgentClick(slug)}
        onOpenCreditsModal={onOpenCreditsModal}
        userEmail={userEmail}
        userName={userName}
        userInitials={userInitials}
        userCredits={propUserTokens || 6612}
        isUnlimited={false}
        userPlan="Profissional (Vertex AI)"
      />

      {/* ── Conteúdo Principal com Scroll Suave (Exact match to app.designbuilder.co) ── */}
      <div className="flex h-[100dvh] flex-col overflow-hidden relative z-[2] lg:pl-[60px]">
        <div className="flex-1 min-h-0 max-lg:overflow-x-hidden lg:pb-0 overflow-y-auto overscroll-contain pb-mobile-nav lg:overflow-y-auto custom-scrollbar">
          <main className="max-lg:min-h-full lg:min-h-screen overflow-x-hidden">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
              <div className="relative">
                
                {/* Glow de fundo */}
                <div className="pointer-events-none absolute inset-0 -top-32 overflow-hidden">
                  <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-violet-500/[0.03] blur-[100px]" />
                  <div className="absolute -top-20 right-1/4 h-60 w-60 rounded-full bg-blue-500/[0.03] blur-[80px]" />
                </div>

                {/* Header Oficial DB */}
                <div className="relative mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      alt="Design Builder"
                      width={399}
                      height={85}
                      decoding="async"
                      className="h-7 w-auto opacity-80"
                      src="/logo-db.webp"
                      onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
                      style={{ color: "transparent" }}
                    />
                  </div>

                  <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    {getGreeting()}<span className="text-zinc-400">, {displayName}</span>
                  </h1>

                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-400">
                    Selecione um dos agentes abaixo para criar designs profissionais com inteligência artificial
                  </p>

                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-700">6 agentes</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                  </div>
                </div>

                {/* Grid dos 6 Agentes Oficiais com 3D Flip Card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {/* ── 1. REF ── */}
                  <a
                    className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
                    href="/agent/ref"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick("ref");
                    }}
                    style={{ animationDelay: "0ms" }}
                  >
                    <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                      {/* Frente */}
                      <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden]">
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
                          <ImageIcon className="h-5 w-5" style={{ color: "rgb(139, 92, 246)" }} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
                            REF
                          </h3>
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                            Builder
                          </span>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                            Repita o estilo visual de uma inspiração com fidelidade.
                          </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5">
                          <span className="hidden lg:inline">Passe o mouse para ver</span>
                          <span className="lg:hidden">Abrir</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {/* Verso 3D com Vídeo */}
                      <div
                        className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)]"
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
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">REF</p>
                            <div className="mt-2 h-px w-8 bg-white/15" />
                            <ul className="mt-3.5 space-y-2.5">
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                                <span>Fácil de unir inspirações</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                                <span>Detalhe o que você quer de cada inspiração.</span>
                              </li>
                            </ul>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                            <span>Abrir</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* ── 2. HYDRA ── */}
                  <a
                    className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
                    href="/hydra"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick("hydra");
                    }}
                    style={{ animationDelay: "80ms" }}
                  >
                    <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                      {/* Frente */}
                      <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden]">
                        <div
                          className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.376), transparent)" }}
                        />
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: "rgba(139, 92, 246, 0.082)" }}
                        >
                          <Package className="h-5 w-5" style={{ color: "rgb(139, 92, 246)" }} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
                            Hydra
                          </h3>
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                            Builder
                          </span>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                            Crie imagens de produto usando inspirações da galeria.
                          </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5">
                          <span className="hidden lg:inline">Passe o mouse para ver</span>
                          <span className="lg:hidden">Abrir</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {/* Verso 3D com Vídeo */}
                      <div
                        className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)]"
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
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Hydra</p>
                            <div className="mt-2 h-px w-8 bg-white/15" />
                            <ul className="mt-3.5 space-y-2.5">
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                                <span>Use nossa biblioteca de inspirações</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                                <span>Composição avançada com inspirações de estilo</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(139, 92, 246)" }} />
                                <span>Seja um Designer Sênior</span>
                              </li>
                            </ul>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                            <span>Abrir</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* ── 3. ENHANCE ── */}
                  <a
                    className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
                    href="/enhance-builder"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick("enhance-builder");
                    }}
                    style={{ animationDelay: "160ms" }}
                  >
                    <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                      {/* Frente */}
                      <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden]">
                        <div
                          className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.376), transparent)" }}
                        />
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: "rgba(124, 58, 237, 0.082)" }}
                        >
                          <Palette className="h-5 w-5" style={{ color: "rgb(124, 58, 237)" }} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
                            Enhance
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                            Melhore fotos borradas, antigas ou de baixa qualidade.
                          </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5">
                          <span className="hidden lg:inline">Passe o mouse para ver</span>
                          <span className="lg:hidden">Abrir</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {/* Verso 3D com Vídeo */}
                      <div
                        className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)]"
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
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Enhance</p>
                            <div className="mt-2 h-px w-8 bg-white/15" />
                            <ul className="mt-3.5 space-y-2.5">
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(124, 58, 237)" }} />
                                <span>Recupera fotos borradas e antigas</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(124, 58, 237)" }} />
                                <span>Hiper realismo + retoque de estúdio</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(124, 58, 237)" }} />
                                <span>Mantém identidade do sujeito</span>
                              </li>
                            </ul>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                            <span>Abrir</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* ── 4. DESIGN BUILDER 1.2 ── */}
                  <a
                    className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 active:scale-[0.98] cursor-pointer"
                    href="/agent/design-builder1-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick("design-builder1-2");
                    }}
                    style={{ animationDelay: "240ms" }}
                  >
                    <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center]">
                      <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden]">
                        <div
                          className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.22]"
                          style={{ backgroundColor: "rgba(124, 58, 237, 0.125)" }}
                        />
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
                          <PenTool className="h-5 w-5" style={{ color: "rgb(124, 58, 237)" }} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
                            Design Builder 1.2
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                            A primeira versão do DB, dinâmico para diversos nichos e desafios.
                          </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5">
                          <span>Abrir</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* ── 5. ÓRION PRO ── */}
                  <a
                    className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 lg:hover:z-50 active:scale-[0.98] cursor-pointer"
                    href="/orion-pro"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick("orion-pro");
                    }}
                    style={{ animationDelay: "320ms" }}
                  >
                    <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center] lg:group-hover:[transform:scale(1.2)_rotateY(180deg)]">
                      {/* Frente */}
                      <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden]">
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
                          <PenTool className="h-5 w-5" style={{ color: "rgb(255, 213, 0)" }} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
                            Órion Pro
                          </h3>
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                            Builder
                          </span>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                            Pipeline avançada para mais controle criativo.
                          </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5">
                          <span className="hidden lg:inline">Passe o mouse para ver</span>
                          <span className="lg:hidden">Abrir</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {/* Verso 3D com Vídeo */}
                      <div
                        className="absolute top-0 bottom-0 left-1/2 hidden overflow-hidden rounded-2xl bg-black lg:flex [backface-visibility:hidden] [transform:translateX(-50%)_rotateY(180deg)]"
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
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Órion Pro</p>
                            <div className="mt-2 h-px w-8 bg-white/15" />
                            <ul className="mt-3.5 space-y-2.5">
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(255, 213, 0)" }} />
                                <span>Construa qualquer estilo de design</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(255, 213, 0)" }} />
                                <span>Composições complexas com texto</span>
                              </li>
                              <li className="flex gap-2 text-[11px] leading-snug text-white/90">
                                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: "rgb(255, 213, 0)" }} />
                                <span>Múltiplas inspirações de estilo</span>
                              </li>
                            </ul>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                            <span>Abrir</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>

                  {/* ── 6. ALTERA FÁCIL ── */}
                  <a
                    className="group relative block lg:aspect-[4/5] lg:[perspective:1200px] transition-[z-index] duration-0 active:scale-[0.98] cursor-pointer"
                    href="/altera-facil"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAgentClick("altera-facil");
                    }}
                    style={{ animationDelay: "400ms" }}
                  >
                    <div className="relative w-full lg:h-full transition-transform duration-700 ease-suave lg:[transform-style:preserve-3d] [transform-origin:center_center]">
                      <div className="relative lg:absolute lg:inset-0 flex flex-col justify-center rounded-2xl p-5 lg:p-6 overflow-hidden glass-card lg:[backface-visibility:hidden]">
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
                          <Wand2 className="h-5 w-5" style={{ color: "rgb(168, 85, 247)" }} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-[22px] font-bold tracking-tight text-white leading-none transition-colors duration-200 group-hover:text-white/90">
                            Altera Fácil
                          </h3>
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                            Builder
                          </span>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3 lg:text-[15px] lg:line-clamp-5">
                            Altere cenas, poses, luz e enquadramento sem perder a identidade.
                          </p>
                        </div>
                        <div className="pt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 group-hover:gap-2.5">
                          <span>Abrir</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </a>

                </div>

                {/* Linha sutil no rodapé */}
                <div className="pointer-events-none mt-16 flex justify-center">
                  <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Barra de Navegação Mobile Persistente (lg:hidden) ── */}
      <DesignBuilderMobileNav
        activeTab="home"
        onNavigateHome={() => onOpenStudio("home")}
        onNavigateProjects={() => onOpenProjects ? onOpenProjects() : onNavigateTab?.("projetos")}
        onNavigateGallery={() => onOpenGallery ? onOpenGallery() : onNavigateTab?.("gallery")}
        onNavigateCommunity={() => onOpenCommunity ? onOpenCommunity() : onNavigateTab?.("community")}
        onOpenAccount={() => onOpenCreditsModal?.()}
        onOpenAdmin={onOpenAdmin}
        onOpenCredits={onOpenCreditsModal}
        userInitial={userInitials[0] || "R"}
        userEmail={userEmail}
        userName={userName}
        isAdmin={userEmail === "der.contatos@gmail.com"}
      />

      {/* ── Floating AI Assistant (Prompt Extractor) ── */}
      <DesignBuilderAssistant />
    </div>
  );
};

export default DesignBuilderVitrine;
