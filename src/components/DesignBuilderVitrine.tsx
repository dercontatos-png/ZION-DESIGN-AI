import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Home,
  Briefcase,
  Images,
  Globe,
  ArrowUpRight,
  ChevronRight,
  ImageOff,
  Sparkles,
  LogIn
} from "lucide-react";
import { DesignBuilderSidebar } from "./DesignBuilderSidebar";
import { CosmicBackground } from "./CosmicBackground";
import { DesignBuilderAssistant } from "./DesignBuilderAssistant";

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

/* ─────────────────────────── Comunidade Mini Preview Strip (18 Itens Oficiais) ───── */
const COMUNIDADE_STRIP = [
  { id: "HJETQ", alt: "[HJETQ]", src: "/Home_files/thumbnail.avif" },
  { id: "0SH2K", alt: "[0SH2K]", src: "/Home_files/thumbnail(1).avif" },
  { id: "9K46H", alt: "[9K46H]", src: "/Home_files/thumbnail(2).avif" },
  { id: "C0O3C", alt: "[C0O3C]", src: "/Home_files/thumbnail(3).avif" },
  { id: "OR1CT", alt: "[OR1CT]", src: "/Home_files/thumbnail(4).avif" },
  { id: "JEG7F", alt: "[JEG7F]", src: "/Home_files/thumbnail(5).avif" },
  { id: "ULP5G", alt: "[ULP5G]", src: "/Home_files/thumbnail(6).avif" },
  { id: "LJRT0", alt: "[LJRT0]", src: "/Home_files/thumbnail(7).avif" },
  { id: "3P2BN", alt: "[3P2BN]", src: "/Home_files/thumbnail(8).avif" },
  { id: "NWL7W", alt: "[NWL7W]", src: "/Home_files/thumbnail(9).avif" },
  { id: "XZ37U", alt: "[XZ37U]", src: "/Home_files/thumbnail(10).avif" },
  { id: "45WTY", alt: "[45WTY] Capa Filme", src: "/Home_files/thumbnail(11).avif" },
  { id: "6YL8S", alt: "[6YL8S]", src: "/Home_files/thumbnail(12).avif" },
  { id: "WGTZG", alt: "[WGTZG]", src: "/Home_files/thumbnail(13).avif" },
  { id: "1A927", alt: "[1A927]", src: "/Home_files/thumbnail(14).avif" },
  { id: "PAVNB", alt: "[PAVNB]", src: "/Home_files/thumbnail(15).avif" },
  { id: "WB9O4", alt: "[WB9O4]", src: "/Home_files/thumbnail(16).avif" },
  { id: "XU66U", alt: "[XU66U]", src: "/Home_files/thumbnail(17).avif" },
];

/* ─────────────────────────── Hydra 6 Fanned Cards ───────────── */
const HYDRA_FANNED_CARDS = [
  { img: "/Home_files/hydra-2.avif", translate: "20px", rotate: "-7deg", scale: 1, brightness: 1, z: 60, delay: 125 },
  { img: "/Home_files/hydra-5.avif", translate: "-130px", rotate: "-12deg", scale: 0.93, brightness: 0.9, z: 50, delay: 100 },
  { img: "/Home_files/hydra-3.avif", translate: "-260px", rotate: "-17deg", scale: 0.86, brightness: 0.8, z: 40, delay: 75 },
  { img: "/Home_files/hydra-6.avif", translate: "-375px", rotate: "-22deg", scale: 0.79, brightness: 0.7, z: 30, delay: 50 },
  { img: "/Home_files/hydra-4.avif", translate: "-475px", rotate: "-27deg", scale: 0.72, brightness: 0.6, z: 20, delay: 25 },
  { img: "/Home_files/hydra-1.avif", translate: "-560px", rotate: "-32deg", scale: 0.66, brightness: 0.5, z: 10, delay: 0 },
];

/* ─────────────────────────── Community Feed 4 Colunas Oficiais (24 Cards) ────────── */
const COMMUNITY_COL_1 = [
  { id: "EGCPV", src: "/Home_files/thumbnail(18).avif", author: "Joao Celistrino", avatar: "/Home_files/cb80a483e74e954f27902f85296e3d2c.jpg" },
  { id: "UHR0F", src: "/Home_files/thumbnail(19).avif", author: "Rafael Dias", initial: "R" },
  { id: "35SU4", src: "/Home_files/thumbnail(20).avif", author: "André Lira", initial: "A" },
  { id: "Q0XO9", src: "/Home_files/thumbnail(21).avif", author: "Joao Celistrino", avatar: "/Home_files/cb80a483e74e954f27902f85296e3d2c.jpg" },
  { id: "P374K", src: "/Home_files/thumbnail(22).avif", author: "LAO Digital", initial: "L" },
  { id: "4O8SC", src: "/Home_files/thumbnail(23).avif", author: "Erick Lorenzi Vasconcelos", initial: "E" },
];

const COMMUNITY_COL_2 = [
  { id: "ULP5G", src: "/Home_files/thumbnail(24).avif", author: "Lucas Albert", avatar: "/Home_files/47658fbc02ba49f99b54465a2574324e__06.PERFIL_LUCAS.png" },
  { id: "OJ5OZ", src: "/Home_files/thumbnail(25).avif", author: "Rafael Dias", initial: "R" },
  { id: "VZDJI", src: "/Home_files/thumbnail(26).avif", author: "CARLOS LOPES", initial: "C" },
  { id: "OP4G5", src: "/Home_files/thumbnail(27).avif", author: "LAO Digital", initial: "L" },
  { id: "AL2SC", src: "/Home_files/thumbnail(28).avif", author: "Mancio", initial: "M" },
  { id: "CY3TE", src: "/Home_files/thumbnail(29).avif", author: "Rafael Dias", initial: "R" },
];

const COMMUNITY_COL_3 = [
  { id: "NOCW9", src: "/Home_files/thumbnail(30).avif", author: "Lucas Albert", avatar: "/Home_files/47658fbc02ba49f99b54465a2574324e__06.PERFIL_LUCAS.png" },
  { id: "37GSI", src: "/Home_files/thumbnail(31).avif", author: "CARLOS LOPES", initial: "C" },
  { id: "6HJ71", src: "/Home_files/thumbnail(32).avif", author: "CARLOS LOPES", initial: "C" },
  { id: "MQX0H", src: "/Home_files/thumbnail(33).avif", author: "LAO Digital", initial: "L" },
  { id: "6XH7T", src: "/Home_files/thumbnail(34).avif", author: "Thiago Vargas", initial: "T" },
  { id: "8C4FP", src: "/Home_files/thumbnail(35).avif", author: "Rafael Dias", initial: "R" },
];

const COMMUNITY_COL_4 = [
  { id: "G8MYA", src: "/Home_files/thumbnail(36).avif", author: "Rafael Dias", initial: "R" },
  { id: "VQ7YH", src: "/Home_files/thumbnail(37).avif", author: "André Lira", initial: "A" },
  { id: "W0GVC", src: "/Home_files/thumbnail(38).avif", author: "Radinho 24h", initial: "R" },
  { id: "JEG7F", src: "/Home_files/thumbnail(39).avif", author: "LAO Digital", initial: "L" },
  { id: "RZ81U", src: "/Home_files/thumbnail(40).avif", author: "Thiago Vargas", initial: "T" },
  { id: "2ZC0V", src: "/Home_files/thumbnail(41).avif", author: "Rafael Dias", initial: "R" },
];

/* ─────────────────────────── Ref Builder 5 Cards com Entradas Flutuantes ─── */
const REF_FAIXA_CARDS = [
  {
    img: "/Home_files/ref-1.avif",
    w: "20%",
    ml: "0%",
    ty: "14%",
    rot: "-13deg",
    z: 8,
    inputs: [
      { src: "/Home_files/1-1.avif", transform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", delay: 0 },
      { src: "/Home_files/1-2.avif", transform: "translate(0%, 63%) rotate(0deg) scale(0.85)", delay: 55 },
      { src: "/Home_files/1-3.avif", transform: "translate(76%, 75%) rotate(9deg) scale(0.85)", delay: 110 },
    ],
  },
  {
    img: "/Home_files/ref-2.avif",
    w: "20%",
    ml: "-1%",
    ty: "4.5%",
    rot: "-6deg",
    z: 9,
    inputs: [
      { src: "/Home_files/2-1.avif", transform: "translate(-27.5%, 75%) rotate(-4.5deg) scale(0.85)", delay: 0 },
      { src: "/Home_files/2-2.avif", transform: "translate(27.5%, 75%) rotate(4.5deg) scale(0.85)", delay: 55 },
    ],
  },
  {
    img: "/Home_files/ref-3.avif",
    w: "20%",
    ml: "-1%",
    ty: "0%",
    rot: "0deg",
    z: 10,
    inputs: [
      { src: "/Home_files/3-1.avif", transform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", delay: 0 },
      { src: "/Home_files/3-2.avif", transform: "translate(0%, 63%) rotate(0deg) scale(0.85)", delay: 55 },
      { src: "/Home_files/3-3.avif", transform: "translate(76%, 75%) rotate(9deg) scale(0.85)", delay: 110 },
    ],
  },
  {
    img: "/Home_files/ref-4(1).avif",
    w: "20%",
    ml: "-1%",
    ty: "4.5%",
    rot: "6deg",
    z: 9,
    inputs: [
      { src: "/Home_files/4-1.avif", transform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", delay: 0 },
      { src: "/Home_files/4-2.avif", transform: "translate(0%, 63%) rotate(0deg) scale(0.85)", delay: 55 },
      { src: "/Home_files/4-3.avif", transform: "translate(76%, 75%) rotate(9deg) scale(0.85)", delay: 110 },
    ],
  },
  {
    img: "/Home_files/ref-5.avif",
    w: "20%",
    ml: "-1%",
    ty: "14%",
    rot: "13deg",
    z: 8,
    inputs: [
      { src: "/Home_files/5-1.avif", transform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", delay: 0 },
      { src: "/Home_files/5-2.avif", transform: "translate(0%, 63%) rotate(0deg) scale(0.85)", delay: 55 },
      { src: "/Home_files/5-3.avif", transform: "translate(76%, 75%) rotate(9deg) scale(0.85)", delay: 110 },
    ],
  },
];

/* ─────────────────────────── Card Interativo com Troca de Imagem no Hover ─── */
interface VitrineHoverCardProps {
  images: string[];
  alt: string;
  onClick: () => void;
  aspectClass?: string;
  title?: string;
  subtitle?: string;
  showBottomTitleOverlay?: boolean;
}

const VitrineHoverCard: React.FC<VitrineHoverCardProps> = ({
  images,
  alt,
  onClick,
  aspectClass = "aspect-[16/9]",
  title,
  subtitle,
  showBottomTitleOverlay = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || images.length <= 1) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width - 1));
    const nextIndex = Math.min(images.length - 1, Math.floor((x / rect.width) * images.length));
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || images.length <= 1 || !e.touches[0]) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width - 1));
    const nextIndex = Math.min(images.length - 1, Math.floor((x / rect.width) * images.length));
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(0);
  };

  return (
    <a
      onClick={onClick}
      className={`group block cursor-pointer select-none ${showBottomTitleOverlay ? "relative self-start" : ""}`}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseLeave={handleMouseLeave}
        className={`relative ${aspectClass} overflow-hidden rounded-2xl ring-1 ring-white/[0.06]`}
      >
        {/* Camadas de Imagens com Crossfade Suave e Zoom Lento */}
        {images.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={alt}
            loading={idx === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover zoom-lento transition-opacity duration-300 ease-in-out ${
              idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          />
        ))}

        {/* Indicadores Pill Superiores Reativos (Ativo: w-5 bg-white | Inativos: w-2 bg-white/40) */}
        <div className="pointer-events-none absolute inset-x-0 top-2.5 flex justify-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-200 ${
                idx === activeIndex ? "w-5 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Overlay com Título Inferior (Ex.: REF BUILDER) */}
        {showBottomTitleOverlay && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16 z-20">
            <span className="font-display text-lg font-bold tracking-wider text-white">
              {title || alt}
            </span>
          </div>
        )}
      </div>

      {/* Título e Subtítulo Abaixo do Card (Ex.: ÓRION PRO / HYDRA) */}
      {title && !showBottomTitleOverlay && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-2xl font-bold tracking-wide text-white">{title}</h2>
          {subtitle && (
            <p className="font-sans text-[13px] tracking-[0.12em] text-zinc-400">{subtitle}</p>
          )}
        </div>
      )}
    </a>
  );
};

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
  userTokens: propUserTokens = 0,
}) => {
  const [userEmail, setUserEmail] = useState(() => {
    if (propUserEmail) return propUserEmail;
    try {
      const u = localStorage.getItem("currentUser") || localStorage.getItem("zion_user");
      if (u) {
        const parsed = JSON.parse(u);
        return parsed?.email || "";
      }
    } catch (_) {}
    return "";
  });

  const [userName, setUserName] = useState(() => {
    if (propUserName) return propUserName;
    try {
      const u = localStorage.getItem("currentUser") || localStorage.getItem("zion_user");
      if (u) {
        const parsed = JSON.parse(u);
        return parsed?.name || parsed?.full_name || "Equipe Zion";
      }
    } catch (_) {}
    return "Equipe Zion";
  });

  const userTokens = propUserTokens;
  const [activeTab, setActiveTab] = useState<"comunidade" | "em_alta" | "recentes">("comunidade");
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const [previewArt, setPreviewArt] = useState<{ id: string; src: string; author: string; avatar?: string; initial?: string } | null>(null);
  const [hoveredHydraIndex, setHoveredHydraIndex] = useState<number | null>(null);
  const [hoveredRefIndex, setHoveredRefIndex] = useState<number | null>(null);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRecents = async () => {
      const urls: string[] = [];
      try {
        const local = localStorage.getItem("savedCards");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              const u = typeof item === "string" ? item : item?.url || item?.src;
              if (u && typeof u === "string" && !urls.includes(u)) urls.push(u);
            });
          }
        }
      } catch (e) {}

      try {
        const res = await fetch("/api/historico-imagens");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.images)) {
            data.images.forEach((im: any) => {
              if (im.url && !urls.includes(im.url)) urls.push(im.url);
            });
          }
        }
      } catch (e) {}

      setRecentImages(urls);
    };
    loadRecents();
  }, []);

  const go = useCallback(
    (slug: string) => {
      onOpenStudio(slug);
    },
    [onOpenStudio]
  );

  const scrollCommunityRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
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

      {/* ── Header Mobile Oficial (Fixo no topo em telas menores) ─ */}
      <header className="fixed inset-x-3 top-3 z-50 flex h-14 items-center justify-between rounded-2xl bg-black/80 px-4 ring-1 ring-white/10 backdrop-blur-xl lg:hidden">
        <a aria-label="Zion Design" href="/" onClick={(e) => { e.preventDefault(); if (typeof window !== "undefined") window.history.pushState({ path: "/" }, "", "/"); }}>
          <img alt="Zion Design" width={399} height={85} decoding="async" className="h-6 w-auto" src="/logo-zion.svg" onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }} style={{ color: "transparent" }} />
        </a>
        <button
          type="button"
          onClick={() => {
            if (onOpenCreditsModal) onOpenCreditsModal();
            else {
              window.dispatchEvent(new CustomEvent("open-credits-modal"));
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:brightness-110"
        >
          <LogIn className="h-4 w-4" />
          <span>Entrar</span>
        </button>
      </header>

      {/* ── Sidebar Desktop Oficial à Esquerda ───────────── */}
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
        onSelectAgent={(slug) => onOpenStudio(slug)}
        onOpenCreditsModal={onOpenCreditsModal}
        userEmail={userEmail}
        userName={userName}
        userCredits={userEmail === "der.contatos@gmail.com" ? "Ilimitado" : userTokens}
        isUnlimited={userEmail === "der.contatos@gmail.com"}
        userPlan={userEmail === "der.contatos@gmail.com" ? "Administrador Geral" : "Assinante"}
      />

      {/* ── Conteúdo Principal com Scroll Suave ─────────── */}
      <div className="flex-1 min-h-0 max-lg:overflow-x-hidden lg:pb-0 overflow-y-auto overscroll-contain pb-mobile-nav lg:overflow-y-auto">
        <main className="max-lg:min-h-full lg:min-h-screen overflow-x-hidden lg:pl-72">
          <div className="mx-auto w-full max-w-[1800px] px-4 pb-10 sm:px-6 sm:pb-14 xl:px-10 2xl:px-14 pt-24 sm:pt-28 lg:pt-14">

            {/* ═══════════ 1. HERO CARDS (ÓRION PRO & HYDRA) ═════ */}
            <section className="mb-12 lg:mb-16">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* ÓRION PRO */}
                <VitrineHoverCard
                  images={["/Home_files/orion-3.avif", "/Home_files/orion-2.avif", "/Home_files/orion-1.avif"]}
                  alt="ÓRION PRO"
                  title="ÓRION PRO"
                  subtitle="Exponencialize sua imaginação"
                  onClick={() => go("orion-pro")}
                />

                {/* HYDRA */}
                <VitrineHoverCard
                  images={["/Home_files/hydra-1.avif", "/Home_files/hydra-2.avif", "/Home_files/hydra-5.avif"]}
                  alt="HYDRA"
                  title="HYDRA"
                  subtitle="Use inspirações curadas por Designers sêniors"
                  onClick={() => go("hydra")}
                />
              </div>

              {/* ── 2ª LINHA: GERAÇÕES STRIP, REF BUILDER, ENHANCE ─── */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-12 lg:mt-16">
                
                {/* Gerações Horizontal Strip */}
                <div className="group/comunidade group/recentes relative flex flex-col overflow-hidden rounded-2xl bg-violet-500/[0.04] p-4 ring-1 ring-white/[0.06] md:col-span-2 lg:aspect-[5/2] lg:self-start">
                  <p className="shrink-0 font-display text-lg font-bold uppercase tracking-wider text-white">
                    Gerações
                  </p>
                  <div className="relative mt-3 h-[132px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1 lg:shrink">
                    <div className="h-full bordas-que-desvanecem">
                      <div
                        ref={scrollRef}
                        className="flex h-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-hide"
                      >
                        {COMUNIDADE_STRIP.map((item) => (
                          <a
                            key={item.id}
                            onClick={() => {
                              if (onOpenCommunity) onOpenCommunity();
                              else onNavigateTab?.("community");
                            }}
                            className="group relative aspect-square h-full shrink-0 snap-start overflow-hidden rounded-xl cursor-pointer"
                          >
                            <img
                              alt={item.alt}
                              loading="lazy"
                              className="h-full w-full object-cover zoom-lento"
                              src={item.src}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                    {/* Botão circular de avançar */}
                    <button
                      type="button"
                      aria-label="Ver mais"
                      onClick={scrollCommunityRight}
                      className="absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 ring-1 ring-white/15 backdrop-blur-sm transition-[opacity,background-color] duration-200 hover:bg-black/90 focus-visible:opacity-100 group-hover/comunidade:opacity-100 right-2 cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* REF BUILDER */}
                <VitrineHoverCard
                  images={["/Home_files/ref-4.avif", "/Home_files/ref-1.avif", "/Home_files/ref-2.avif"]}
                  alt="REF BUILDER"
                  title="REF BUILDER"
                  aspectClass="aspect-[5/4]"
                  showBottomTitleOverlay={true}
                  onClick={() => go("ref")}
                />

                {/* ENHANCE - Vídeo Oficial Looping */}
                <a
                  onClick={() => go("enhance-builder")}
                  className="group relative block aspect-[5/4] self-start overflow-hidden rounded-2xl ring-1 ring-white/[0.06] cursor-pointer bg-black"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    ref={(el) => {
                      if (el) {
                        el.muted = true;
                        el.play().catch(() => {});
                      }
                    }}
                    aria-label="ENHANCE"
                    className="h-full w-full object-cover zoom-lento"
                  >
                    <source src="https://apidb20.designbuilder.co/api/agent-videos/enhance-builder?v=4" type="video/mp4" />
                    <source src="/vitrine/enhance-video.mp4" type="video/mp4" />
                  </video>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16">
                    <span className="font-display text-lg font-bold tracking-wider text-white">ENHANCE</span>
                  </div>
                </a>

              </div>
            </section>

            {/* ═══════════ 2. HYDRA FAIXA DE DESTAQUE 3D ═════════ */}
            <div className="mt-12 lg:mt-16">
              <section className="relative min-h-[380px] sm:min-h-[440px] overflow-hidden rounded-3xl bg-black ring-1 ring-white/[0.06]">
                {/* 6 Fanned 3D Cards */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-[90%] md:w-[68%] block opacity-60 md:opacity-100"
                  style={{ perspective: "1400px" }}
                >
                  {HYDRA_FANNED_CARDS.map((card, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredHydraIndex(i)}
                      onMouseLeave={() => setHoveredHydraIndex(null)}
                      onClick={() => go("hydra")}
                      className="pointer-events-auto absolute top-1/2 right-4 sm:right-6 h-[126%] w-[42%] sm:w-[40%] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] cursor-pointer"
                      style={{
                        transform: hoveredHydraIndex === i
                          ? `translate(${card.translate}, calc(-50% - 18px)) rotate(${card.rotate}) scale(${Number(card.scale) * 1.05}) translateZ(30px)`
                          : `translate(${card.translate}, calc(-50% + 0px)) rotate(${card.rotate}) scale(${card.scale}) translateZ(0px)`,
                        filter: hoveredHydraIndex === i ? "brightness(1.2)" : `brightness(${card.brightness})`,
                        transitionProperty: "transform, filter",
                        transitionDuration: "600ms",
                        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        transitionDelay: `${card.delay}ms`,
                        zIndex: hoveredHydraIndex === i ? 70 : card.z,
                      }}
                    >
                      <img alt="" loading="lazy" className="h-full w-full object-cover" src={card.img} />
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent md:via-black/35 md:to-transparent" />

                <div className="relative max-w-2xl px-8 py-12 sm:px-12 sm:py-16">
                  <span className="inline-flex rounded-full bg-brand-accent/15 px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">
                    Hydra
                  </span>
                  <h2 className="mt-5 font-display text-[28px] font-bold uppercase leading-[1.15] text-white sm:text-[38px]">
                    <span className="block whitespace-nowrap">Crie ensaios</span>
                    <span className="block whitespace-nowrap">
                      fotográficos com o <span className="text-brand-accent">Hydra</span>
                    </span>
                    <span className="block whitespace-nowrap">em poucos cliques</span>
                  </h2>
                  <p className="mt-4 text-[15px] text-zinc-300">
                    Escolha uma inspiração, envie suas fotos e gere seu ensaio.
                  </p>
                  <a onClick={() => go("hydra")} className="botao-externo mt-7 cursor-pointer">
                    <span className="botao-externo__seta">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="botao-externo__texto">Criar ensaio</span>
                  </a>
                </div>
              </section>
            </div>

            {/* ═══════════ 3. COMUNIDADE FEED MASONRY (4 COLUNAS) ═══════════ */}
            <div className="mt-12 lg:mt-16">
              <section>
                <div className="flex flex-wrap items-center gap-6 border-b border-white/[0.06] pb-3">
                  <button
                    type="button"
                    aria-pressed={activeTab === "comunidade"}
                    onClick={() => setActiveTab("comunidade")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "comunidade" ? "text-brand-accent" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Comunidade
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeTab === "em_alta"}
                    onClick={() => setActiveTab("em_alta")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "em_alta" ? "text-brand-accent" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Em alta no Hydra
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeTab === "recentes"}
                    onClick={() => setActiveTab("recentes")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "recentes" ? "text-brand-accent" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Recentes
                  </button>
                </div>

                {activeTab === "comunidade" && (
                  <div className={`relative transition-all duration-500 ${isCommunityExpanded ? "" : "max-h-[720px] overflow-hidden"}`}>
                    <div className="mt-4 flex gap-[2px]" style={{ "--duracao-zoom": "280ms" } as any}>
                      {/* Coluna 1 */}
                      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        {COMMUNITY_COL_1.map((card) => (
                          <a
                            key={card.id}
                            onClick={() => setPreviewArt(card)}
                            className="group relative block overflow-hidden rounded-md cursor-pointer"
                          >
                            <img
                              alt={`[${card.id}]`}
                              loading="lazy"
                              className="h-auto w-full zoom-lento"
                              src={card.src}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-2.5 pt-10 pb-2">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 transition-opacity duration-[400ms] ease-suave group-hover:opacity-100" />
                              {(card as any).avatar ? (
                                <img
                                  alt=""
                                  loading="lazy"
                                  className="relative h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                                  src={(card as any).avatar}
                                />
                              ) : (
                                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-[11px] font-semibold text-white ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                  {card.initial}
                                </span>
                              )}
                              <span className="relative min-w-0 max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-[400ms] ease-suave group-hover:max-w-[240px] group-hover:translate-x-0 group-hover:opacity-100">
                                <span className="block truncate text-[12px] font-medium leading-tight text-white">
                                  {card.author}
                                </span>
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Coluna 2 */}
                      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        {COMMUNITY_COL_2.map((card) => (
                          <a
                            key={card.id}
                            onClick={() => setPreviewArt(card)}
                            className="group relative block overflow-hidden rounded-md cursor-pointer"
                          >
                            <img
                              alt={`[${card.id}]`}
                              loading="lazy"
                              className="h-auto w-full zoom-lento"
                              src={card.src}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-2.5 pt-10 pb-2">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 transition-opacity duration-[400ms] ease-suave group-hover:opacity-100" />
                              {(card as any).avatar ? (
                                <img
                                  alt=""
                                  loading="lazy"
                                  className="relative h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                                  src={(card as any).avatar}
                                />
                              ) : (
                                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-[11px] font-semibold text-white ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                  {card.initial}
                                </span>
                              )}
                              <span className="relative min-w-0 max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-[400ms] ease-suave group-hover:max-w-[240px] group-hover:translate-x-0 group-hover:opacity-100">
                                <span className="block truncate text-[12px] font-medium leading-tight text-white">
                                  {card.author}
                                </span>
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Coluna 3 */}
                      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        {COMMUNITY_COL_3.map((card) => (
                          <a
                            key={card.id}
                            onClick={() => setPreviewArt(card)}
                            className="group relative block overflow-hidden rounded-md cursor-pointer"
                          >
                            <img
                              alt={`[${card.id}]`}
                              loading="lazy"
                              className="h-auto w-full zoom-lento"
                              src={card.src}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-2.5 pt-10 pb-2">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 transition-opacity duration-[400ms] ease-suave group-hover:opacity-100" />
                              {(card as any).avatar ? (
                                <img
                                  alt=""
                                  loading="lazy"
                                  className="relative h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                                  src={(card as any).avatar}
                                />
                              ) : (
                                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-[11px] font-semibold text-white ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                  {card.initial}
                                </span>
                              )}
                              <span className="relative min-w-0 max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-[400ms] ease-suave group-hover:max-w-[240px] group-hover:translate-x-0 group-hover:opacity-100">
                                <span className="block truncate text-[12px] font-medium leading-tight text-white">
                                  {card.author}
                                </span>
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Coluna 4 */}
                      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        {COMMUNITY_COL_4.map((card) => (
                          <a
                            key={card.id}
                            onClick={() => setPreviewArt(card)}
                            className="group relative block overflow-hidden rounded-md cursor-pointer"
                          >
                            <img
                              alt={`[${card.id}]`}
                              loading="lazy"
                              className="h-auto w-full zoom-lento"
                              src={card.src}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-2.5 pt-10 pb-2">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 transition-opacity duration-[400ms] ease-suave group-hover:opacity-100" />
                              {(card as any).avatar ? (
                                <img
                                  alt=""
                                  loading="lazy"
                                  className="relative h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                                  src={(card as any).avatar}
                                />
                              ) : (
                                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-[11px] font-semibold text-white ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                  {card.initial}
                                </span>
                              )}
                              <span className="relative min-w-0 max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-[400ms] ease-suave group-hover:max-w-[240px] group-hover:translate-x-0 group-hover:opacity-100">
                                <span className="block truncate text-[12px] font-medium leading-tight text-white">
                                  {card.author}
                                </span>
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Gradient Fade quando recolhido */}
                    {!isCommunityExpanded && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/85 to-transparent" />
                    )}

                    {/* Botão Central "Ver mais" / "Recolher" */}
                    <div className={`${isCommunityExpanded ? "relative mt-8" : "absolute inset-x-0 bottom-0"} flex justify-center pb-6 z-20`}>
                      <button
                        type="button"
                        onClick={() => setIsCommunityExpanded(!isCommunityExpanded)}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-[filter] duration-300 hover:brightness-110 disabled:opacity-60 cursor-pointer"
                      >
                        {isCommunityExpanded ? "Recolher feed" : "Ver mais"}
                        <ArrowUpRight className={`h-4 w-4 transition-transform duration-300 ${isCommunityExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "em_alta" && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {COMMUNITY_COL_1.slice(0, 8).map((card) => (
                      <div
                        key={card.id}
                        onClick={() => go("hydra")}
                        className="group relative overflow-hidden rounded-2xl cursor-pointer bg-zinc-900 border border-white/[0.06] transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_12px_32px_rgba(168,85,247,0.3)] hover:-translate-y-1.5 aspect-[3/4]"
                      >
                        <img
                          src={card.src}
                          alt={card.author}
                          loading="lazy"
                          className="h-full w-full object-cover zoom-lento"
                        />
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] text-white border border-white/15">
                          <span className="h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center text-[9px] font-bold">
                            {card.initial}
                          </span>
                          <span className="font-semibold truncate max-w-[120px]">{card.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "recentes" && (
                  <div className="mt-4">
                    {recentImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {recentImages.slice(0, 12).map((imgUrl, i) => (
                          <div
                            key={i}
                            onClick={() => go("ref")}
                            className="group relative overflow-hidden rounded-2xl cursor-pointer bg-zinc-900 border border-white/[0.06] aspect-square"
                          >
                            <img src={imgUrl} alt="" className="h-full w-full object-cover zoom-lento" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-950/40 py-24 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 text-zinc-500 mb-3">
                          <ImageOff className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-400">Nada por aqui ainda</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* ═══════════ 4. TRANSFORME INSPIRAÇÕES (REF BANNER) ═════ */}
            <div className="mt-12 lg:mt-16">
              <section
                className="relative overflow-hidden rounded-3xl bg-[#08040f]"
                style={{
                  boxShadow: "rgba(139, 92, 246, 0.35) 0px 0px 90px 10px inset, rgba(217, 70, 239, 0.12) 0px 0px 200px 40px inset, rgba(139, 92, 246, 0.4) 0px 0px 60px -20px",
                }}
              >
                <video
                  src="https://apidb20.designbuilder.co/api/agent-videos/fundo-secao-referencias"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(8,4,15,0.86) 0%, rgba(8,4,15,0.72) 55%, rgba(8,4,15,0.9) 100%)",
                  }}
                />

                <div className="relative flex flex-col items-center gap-5 px-6 pt-16 pb-10 text-center sm:pt-20 md:pb-16 xl:pb-24">
                  <img
                    alt="Zion Design"
                    loading="lazy"
                    width={399}
                    height={85}
                    decoding="async"
                    data-nimg="1"
                    className="h-8 w-auto"
                    src="/logo-zion.svg" onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
                    style={{ color: "transparent" }}
                  />
                  <p className="font-display text-2xl leading-tight text-white sm:text-4xl">
                    <span className="block">Transforme inspirações</span>
                    <span className="block">em criações únicas</span>
                  </p>
                  <p className="max-w-xl text-[15px] text-zinc-300">
                    Combine suas inspirações no Ref Builder e crie uma imagem com identidade própria.
                  </p>
                  <a onClick={() => go("ref")} className="botao-externo cursor-pointer">
                    <span className="botao-externo__seta">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="botao-externo__texto">Criar com inspirações</span>
                  </a>

                  {/* 5 Cards em Leque com Miniaturas de Entrada Flutuantes */}
                  <div className="mt-8 hidden w-full max-w-[1400px] items-end justify-center md:flex">
                    {REF_FAIXA_CARDS.map((card, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredRefIndex(i)}
                        onMouseLeave={() => setHoveredRefIndex(null)}
                        onClick={() => go("ref")}
                        className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl shadow-[0_26px_60px_-18px_rgba(0,0,0,0.85)] cursor-pointer"
                        style={{
                          width: card.w,
                          marginLeft: card.ml,
                          transform: hoveredRefIndex === i
                            ? `translateY(calc(${card.ty} - 24px)) rotate(${card.rot}) scale(1.06)`
                            : `translateY(${card.ty}) rotate(${card.rot})`,
                          filter: hoveredRefIndex === i ? "brightness(1.15)" : "brightness(0.92)",
                          transitionProperty: "transform, filter",
                          transitionDuration: "320ms",
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                          zIndex: hoveredRefIndex === i ? 60 : card.z,
                        }}
                      >
                        <img alt="" loading="lazy" className="h-full w-full object-cover" src={card.img} />

                        {/* Entradas flutuantes ao passar o mouse */}
                        <div className="pointer-events-none absolute inset-0 grid place-items-center">
                          {card.inputs.map((inp, ii) => (
                            <div
                              key={ii}
                              className="col-start-1 row-start-1 aspect-[3/4] w-[36%] overflow-hidden rounded-lg shadow-[0_10px_24px_-8px_rgba(0,0,0,0.9)] ring-1 ring-white/25"
                              style={{
                                transform: hoveredRefIndex === i ? inp.transform : "translate(0%, 50%) scale(0.3)",
                                opacity: hoveredRefIndex === i ? 1 : 0,
                                transitionProperty: "transform, opacity",
                                transitionDuration: "560ms",
                                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                                transitionDelay: `${inp.delay}ms`,
                              }}
                            >
                              <img alt="" loading="lazy" className="h-full w-full object-cover" src={inp.src} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* ═══════════ 5. ÁREA DE MEMBROS (SVG WIREFRAME GRID) ════ */}
            <div className="mt-12 lg:mt-16">
              <section
                className="relative overflow-hidden rounded-3xl bg-[#08040f]"
                style={{
                  boxShadow: "rgba(139, 92, 246, 0.35) 0px 0px 90px 10px inset, rgba(217, 70, 239, 0.12) 0px 0px 200px 40px inset, rgba(139, 92, 246, 0.4) 0px 0px 60px -20px",
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 1000 400"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <g stroke="rgba(167, 139, 250, 0.13)" strokeWidth="1" fill="none">
                    <path d="M0 0 L340 130" /><path d="M0 400 L340 270" /><path d="M0 0 L340 130" /><path d="M1000 0 L660 130" /><path d="M100 0 L372 130" /><path d="M100 400 L372 270" /><path d="M0 40 L340 144" /><path d="M1000 40 L660 144" /><path d="M200 0 L404 130" /><path d="M200 400 L404 270" /><path d="M0 80 L340 158" /><path d="M1000 80 L660 158" /><path d="M300 0 L436 130" /><path d="M300 400 L436 270" /><path d="M0 120 L340 172" /><path d="M1000 120 L660 172" /><path d="M400 0 L468 130" /><path d="M400 400 L468 270" /><path d="M0 160 L340 186" /><path d="M1000 160 L660 186" /><path d="M500 0 L500 130" /><path d="M500 400 L500 270" /><path d="M0 200 L340 200" /><path d="M1000 200 L660 200" /><path d="M600 0 L532 130" /><path d="M600 400 L532 270" /><path d="M0 240 L340 214" /><path d="M1000 240 L660 214" /><path d="M700 0 L564 130" /><path d="M700 400 L564 270" /><path d="M0 280 L340 228" /><path d="M1000 280 L660 228" /><path d="M800 0 L596 130" /><path d="M800 400 L596 270" /><path d="M0 320 L340 242" /><path d="M1000 320 L660 242" /><path d="M900 0 L628 130" /><path d="M900 400 L628 270" /><path d="M0 360 L340 256" /><path d="M1000 360 L660 256" /><path d="M1000 0 L660 130" /><path d="M1000 400 L660 270" /><path d="M0 400 L340 270" /><path d="M1000 400 L660 270" />
                  </g>
                  <g stroke="rgba(167, 139, 250, 0.11)" strokeWidth="1" fill="none">
                    <rect x="6.938775510204081" y="2.6530612244897958" width="986.1224489795918" height="394.69387755102036" />
                    <rect x="27.755102040816325" y="10.612244897959183" width="944.4897959183672" height="378.7755102040817" />
                    <rect x="62.44897959183673" y="23.877551020408163" width="875.1020408163265" height="352.2448979591836" />
                    <rect x="111.0204081632653" y="42.44897959183673" width="777.9591836734694" height="315.1020408163265" />
                    <rect x="173.46938775510205" y="66.3265306122449" width="653.0612244897959" height="267.34693877551024" />
                    <rect x="249.79591836734693" y="95.51020408163265" width="500.4081632653061" height="208.9795918367347" />
                  </g>
                  <rect x="340" y="130" width="320" height="140" fill="none" stroke="rgba(167, 139, 250, 0.28)" strokeWidth="1" />
                </svg>

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(8,4,15,0.92) 0%, rgba(8,4,15,0.55) 45%, transparent 75%)",
                  }}
                />

                <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center sm:py-20">
                  <img
                    alt="Zion Design"
                    loading="lazy"
                    width={399}
                    height={85}
                    decoding="async"
                    data-nimg="1"
                    className="h-8 w-auto"
                    src="/logo-zion.svg" onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
                    style={{ color: "transparent" }}
                  />
                  <p className="font-display text-2xl leading-tight text-white sm:text-4xl">
                    <span className="block">Assista nossos conteúdos</span>
                    <span className="block">na área de membros!</span>
                  </p>
                  <a
                    href="#aulas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="botao-externo cursor-pointer"
                  >
                    <span className="botao-externo__seta">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="botao-externo__texto">Acessar agora</span>
                  </a>
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation (Matching Home.html lines 175-233) ── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav
          aria-label="Navegação principal"
          className="pointer-events-auto flex h-16 items-center rounded-[28px] bg-zinc-950/95 px-2 shadow-[0_8px_28px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl w-full max-w-md justify-around gap-1"
        >
          {/* Início */}
          <a
            aria-label="Início"
            aria-current="page"
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 text-violet-400 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full transition-colors bg-violet-500/15">
              <Home className="h-[22px] w-[22px]" />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Início</span>
          </a>

          {/* Projetos */}
          <a
            aria-label="Projetos"
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 text-zinc-400 cursor-pointer"
            onClick={() => {
              if (onOpenProjects) onOpenProjects();
              else if (onNavigateTab) onNavigateTab("projetos");
            }}
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full transition-colors group-hover:bg-white/[0.06]">
              <Briefcase className="h-[22px] w-[22px]" />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Projetos</span>
          </a>

          {/* Galeria */}
          <a
            aria-label="Galeria"
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 text-zinc-400 cursor-pointer"
            onClick={() => {
              if (onOpenGallery) onOpenGallery();
              else onNavigateTab?.("gallery");
            }}
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full transition-colors group-hover:bg-white/[0.06]">
              <Images className="h-[22px] w-[22px]" />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Galeria</span>
          </a>

          {/* Comunidade */}
          <a
            aria-label="Comunidade"
            className="group relative flex h-12 min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 text-zinc-400 cursor-pointer"
            onClick={() => {
              if (onOpenCommunity) onOpenCommunity();
              else onNavigateTab?.("community");
            }}
          >
            <span className="flex h-6 w-9 items-center justify-center rounded-full transition-colors group-hover:bg-white/[0.06]">
              <Globe className="h-[22px] w-[22px]" />
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Comunidade</span>
          </a>

          {/* User Button */}
          <button
            type="button"
            aria-label="Abrir conta e notificações"
            onClick={() => {
              if (onOpenCreditsModal) onOpenCreditsModal();
              else {
                window.dispatchEvent(new CustomEvent("open-credits-modal"));
              }
            }}
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 cursor-pointer"
          >
            <span className="h-10 w-10 overflow-hidden rounded-full ring-2 transition-[box-shadow] ring-violet-500/30">
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                R
              </span>
            </span>
          </button>
        </nav>
      </div>

      {/* ── Assistente IA Flutuante Oficial (Matching Home.html lines 1176-1305) ── */}
      <DesignBuilderAssistant />

      {/* ── Modal de Detalhe da Comunidade ── */}
      {previewArt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewArt(null)}
        >
          <div 
            className="relative flex flex-col md:flex-row max-w-4xl w-full bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden p-2">
              <img 
                src={previewArt.src} 
                alt={previewArt.author} 
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Arte da Comunidade</span>
                  <button 
                    onClick={() => setPreviewArt(null)}
                    className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {previewArt.avatar ? (
                    <img 
                      src={previewArt.avatar} 
                      alt="" 
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white ring-1 ring-white/20">
                      {previewArt.initial || previewArt.author?.[0]}
                    </span>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-white">{previewArt.author}</h4>
                    <p className="text-xs text-zinc-500">Criado com Zion Design</p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-xs text-zinc-400">
                  Código da arte: <span className="text-white font-mono">{previewArt.id}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewArt(null);
                    go("ref");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Abrir no Ref Builder
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewArt(null)}
                  className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
