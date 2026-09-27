import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Home,
  Briefcase,
  Images,
  Globe,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Bell,
  X,
  CreditCard,
  Shield,
  User,
  LogOut,
  FolderOpen,
  Bot,
  Settings,
  ExternalLink,
  Headphones,
  BookOpen
} from "lucide-react";
import { CosmicBackground } from "./CosmicBackground";
import { DesignBuilderAssistant } from "./DesignBuilderAssistant";
import { DesignBuilderMobileNav } from "./DesignBuilderMobileNav";
import { DesignBuilderSettingsModal } from "./DesignBuilderSettingsModal";
import ReportModal from "./ReportModal";

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

/* ─────────────────────────── Comunidade Mini Preview Strip ───── */
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
    z: 7,
    inputs: [
      { src: "/Home_files/2-1.avif", transform: "translate(-62%, 78%) rotate(-6deg) scale(0.85)", delay: 35 },
      { src: "/Home_files/2-2.avif", transform: "translate(62%, 78%) rotate(6deg) scale(0.85)", delay: 85 },
    ],
  },
  {
    img: "/Home_files/ref-3.avif",
    w: "22%",
    ml: "-1%",
    ty: "0%",
    rot: "0deg",
    z: 10,
    inputs: [
      { src: "/Home_files/3-1.avif", transform: "translate(-88%, 70%) rotate(-10deg) scale(0.85)", delay: 20 },
      { src: "/Home_files/3-2.avif", transform: "translate(0%, 60%) rotate(0deg) scale(0.85)", delay: 70 },
      { src: "/Home_files/3-3.avif", transform: "translate(88%, 70%) rotate(10deg) scale(0.85)", delay: 120 },
    ],
  },
  {
    img: "/Home_files/ref-4(1).avif",
    w: "20%",
    ml: "-1%",
    ty: "4.5%",
    rot: "6deg",
    z: 6,
    inputs: [
      { src: "/Home_files/4-1.avif", transform: "translate(-62%, 78%) rotate(-6deg) scale(0.85)", delay: 40 },
      { src: "/Home_files/4-2.avif", transform: "translate(62%, 78%) rotate(6deg) scale(0.85)", delay: 90 },
    ],
  },
  {
    img: "/Home_files/ref-5.avif",
    w: "20%",
    ml: "-1%",
    ty: "14%",
    rot: "13deg",
    z: 5,
    inputs: [
      { src: "/Home_files/5-1.avif", transform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", delay: 45 },
      { src: "/Home_files/5-2.avif", transform: "translate(0%, 63%) rotate(0deg) scale(0.85)", delay: 95 },
      { src: "/Home_files/5-3.avif", transform: "translate(76%, 75%) rotate(9deg) scale(0.85)", delay: 145 },
    ],
  },
];

/* ─────────────────────────── Componente VitrineHoverCard ───── */
const VitrineHoverCard: React.FC<{
  images: string[];
  alt: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  aspectClass?: string;
  showBottomTitleOverlay?: boolean;
}> = ({ images, alt, title, subtitle, onClick, aspectClass = "aspect-[16/9]", showBottomTitleOverlay = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isHovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentIndex(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, images.length]);

  return (
    <a
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group block cursor-pointer"
    >
      <div className={`relative ${aspectClass} overflow-hidden rounded-2xl ring-1 ring-white/[0.06] bg-zinc-950`}>
        {images.map((src, idx) => (
          <img
            key={idx}
            alt={alt}
            loading={idx === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out zoom-lento ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            src={src}
          />
        ))}

        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 top-2.5 flex justify-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {images.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  dotIdx === currentIndex ? "w-5 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {showBottomTitleOverlay && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16">
            <span className="font-display text-lg font-bold tracking-wider text-white">
              {title}
            </span>
          </div>
        )}
      </div>

      {!showBottomTitleOverlay && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-2xl font-bold tracking-wide text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13px] tracking-[0.12em] text-zinc-400">
              {subtitle}
            </p>
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
  userTokens: propUserTokens = 6612,
}) => {
  const [activeTab, setActiveTab] = useState<"comunidade" | "em_alta" | "meus_favoritos">("comunidade");
  const [hoveredHydraIndex, setHoveredHydraIndex] = useState<number | null>(null);
  const [isHoveredRefFaixa, setIsHoveredRefFaixa] = useState(false);
  const [previewArt, setPreviewArt] = useState<any | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGuiaModalOpen, setIsGuiaModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
  const isActualAdmin = userEmail.toLowerCase().trim() === "der.contatos@gmail.com";

  // Calculate real credits from Vertex AI
  const storedReal = typeof window !== "undefined" ? localStorage.getItem("zion_real_credits") : null;
  const realCredits = (storedReal !== null && !isNaN(Number(storedReal)) && Number(storedReal) !== 45)
    ? Number(storedReal)
    : (typeof propUserTokens === "number" && propUserTokens !== 999999 && propUserTokens !== 45 ? propUserTokens : 6612);

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

      {/* ── Sidebar Desktop Oficial à Esquerda (Home.html w-64) ── */}
      <aside
        aria-label="Navegação principal"
        className="fixed inset-y-3 left-3 z-50 hidden flex-col rounded-3xl ring-1 ring-white/[0.06] lg:flex w-64 select-none"
        style={{ background: "linear-gradient(rgb(23, 16, 42) 0%, rgb(12, 8, 24) 55%, rgb(5, 3, 8) 100%)" }}
      >
        {/* Logo Zion Design */}
        <div className="flex shrink-0 items-center px-7 pt-7 pb-8">
          <a
            aria-label="Zion Design"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="cursor-pointer flex items-center"
          >
            <img
              alt="Zion Design"
              width={399}
              height={85}
              decoding="async"
              className="h-7 w-auto"
              src="/logo-zion.svg"
              onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
              style={{ color: "transparent" }}
            />
          </a>
        </div>

        {/* Menu Principal de Navegação (Matching Home.html Oficial) */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 scrollbar-hide">
          <ul className="space-y-0.5">
            {/* 1. Home (Ativo) */}
            <li>
              <a
                aria-current="page"
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors bg-violet-600/25 font-medium text-white cursor-pointer"
              >
                <Home className="h-[18px] w-[18px] shrink-0 text-white" aria-hidden="true" />
                <span className="truncate">Home</span>
              </a>
            </li>

            {/* 2. Projetos */}
            <li>
              <a
                href="/projetos"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenProjects) onOpenProjects();
                  else onNavigateTab?.("projetos");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <FolderOpen className="h-[18px] w-[18px] shrink-0 text-zinc-400" aria-hidden="true" />
                <span className="truncate">Projetos</span>
              </a>
            </li>

            {/* 3. Galeria */}
            <li>
              <a
                href="/gallery"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenGallery) onOpenGallery();
                  else onNavigateTab?.("gallery");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <Images className="h-[18px] w-[18px] shrink-0 text-zinc-400" aria-hidden="true" />
                <span className="truncate">Galeria</span>
              </a>
            </li>

            {/* 4. Comunidade */}
            <li>
              <a
                href="/community"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenCommunity) onOpenCommunity();
                  else onNavigateTab?.("community");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <Globe className="h-[18px] w-[18px] shrink-0 text-zinc-400" aria-hidden="true" />
                <span className="truncate">Comunidade</span>
              </a>
            </li>

            {/* 5. Agentes (Em breve Oficial) */}
            <li>
              <span
                title="Em breve"
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] text-zinc-600 select-none"
              >
                <Bot className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className="truncate">Agentes</span>
                <span className="ml-auto shrink-0 rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  Em breve
                </span>
              </span>
            </li>
          </ul>

          <div className="my-4 h-px bg-white/10" />

          {/* Lista Direta dos 6 Agentes (Sem bolinhas, texto limpo) */}
          <ul className="space-y-0.5">
            <li>
              <div>
                <a
                  href="/agent/ref"
                  onClick={(e) => { e.preventDefault(); go("ref"); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                >
                  <span className="truncate">REF</span>
                </a>
              </div>
            </li>
            <li>
              <div>
                <a
                  href="/hydra"
                  onClick={(e) => { e.preventDefault(); go("hydra"); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                >
                  <span className="truncate">Hydra</span>
                </a>
              </div>
            </li>
            <li>
              <div>
                <a
                  href="/enhance-builder"
                  onClick={(e) => { e.preventDefault(); go("enhance-builder"); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                >
                  <span className="truncate">Enhance</span>
                </a>
              </div>
            </li>
            <li>
              <div>
                <a
                  href="/agent/design-builder1-2"
                  onClick={(e) => { e.preventDefault(); go("design-builder1-2"); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                >
                  <span className="truncate">Design Builder 1.2</span>
                </a>
              </div>
            </li>
            <li>
              <div>
                <a
                  href="/orion-pro"
                  onClick={(e) => { e.preventDefault(); go("orion-pro"); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                >
                  <span className="truncate">Órion Pro</span>
                </a>
              </div>
            </li>
            <li>
              <div>
                <a
                  href="/altera-facil"
                  onClick={(e) => { e.preventDefault(); go("altera-facil"); }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[15px] transition-colors text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                >
                  <span className="truncate">Altera Fácil</span>
                </a>
              </div>
            </li>
          </ul>
        </nav>

        {/* Rodapé da Sidebar com Créditos Reais e Perfil */}
        <div className="shrink-0 rounded-b-3xl border-t border-white/[0.06]">
          {/* Card de Créditos Vertex AI */}
          <button
            type="button"
            aria-label="Ver extrato de créditos"
            onClick={() => onOpenCreditsModal?.()}
            className="block w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04] cursor-pointer"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[15px] font-semibold tabular-nums text-violet-300">
                {realCredits.toLocaleString("pt-BR")}{" "}
                <span className="text-xs font-normal text-zinc-300">créditos</span>
              </p>
              <span className="shrink-0 text-[10px] tabular-nums text-zinc-500">/ 7.500</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={realCredits}
              aria-valuemin={0}
              aria-valuemax={7500}
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-500"
                style={{ width: `${Math.min(100, Math.round((realCredits / 7500) * 100))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] tabular-nums text-zinc-400">
              Saldo Vertex AI: $264.48 USD
            </p>
          </button>

          {/* Linha do Usuário */}
          <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 relative">
            <div className="relative">
              <button
                type="button"
                aria-label="Abrir menu do usuário"
                aria-expanded={isProfileMenuOpen}
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsLinksMenuOpen(false);
                }}
                className="h-7 w-7 overflow-hidden rounded-full ring-2 transition-all focus:outline-none focus-visible:ring-violet-400 ring-violet-500/20 hover:ring-violet-400/50 cursor-pointer"
              >
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white">
                  {userInitials}
                </div>
              </button>

              {/* Popover do Perfil 1:1 Oficial */}
              {isProfileMenuOpen && (
                <div
                  role="menu"
                  className="absolute left-full z-50 ml-3 w-64 bottom-0 rounded-2xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7),0_0_60px_-15px_rgba(139,92,246,0.25)] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-150"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/30">
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                        {userInitials}
                      </div>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-white">{userName}</span>
                      <span className="truncate text-xs text-zinc-400">{userEmail}</span>
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
                    {isActualAdmin && (
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
                        localStorage.removeItem("zion_auth_user");
                        localStorage.removeItem("currentUser");
                        window.location.reload();
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

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                title="Reportar erro ou sugestão"
                onClick={() => setIsReportModalOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer"
              >
                <AlertTriangle className="h-[18px] w-[18px]" />
              </button>

              {/* Botão dos 3 pontinhos */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsLinksMenuOpen(!isLinksMenuOpen);
                    setIsProfileMenuOpen(false);
                  }}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-500 hover:bg-white/10 hover:text-white cursor-pointer"
                  title="Mais opções"
                >
                  <MoreHorizontal className="h-[18px] w-[18px]" />
                </button>

                {/* Popover dos 3 pontinhos 1:1 Oficial */}
                {isLinksMenuOpen && (
                  <div className="absolute left-full z-50 ml-3 w-80 bottom-0 rounded-xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-150">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsLinksMenuOpen(false);
                        setIsGuiaModalOpen(true);
                      }}
                      className="group/link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-white transition-all hover:bg-white/10 cursor-pointer"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(139, 92, 246, 0.125)", border: "1px solid rgba(139, 92, 246, 0.19)" }}>
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
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(167, 139, 250, 0.125)", border: "1px solid rgba(167, 139, 250, 0.19)" }}>
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
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(96, 165, 250, 0.125)", border: "1px solid rgba(96, 165, 250, 0.19)" }}>
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

      {/* ── Conteúdo Principal com Scroll Suave (Home.html lg:pl-72) ── */}
      <div className="flex-1 min-h-0 max-lg:overflow-x-hidden lg:pb-0 overflow-y-auto overscroll-contain pb-mobile-nav lg:overflow-y-auto custom-scrollbar">
        <main className="max-lg:min-h-full lg:min-h-screen overflow-x-hidden lg:pl-72">
          <div className="mx-auto w-full max-w-[1800px] px-4 pb-10 sm:px-6 sm:pb-14 xl:px-10 2xl:px-14 pt-10 sm:pt-14">

            {/* 1. HERO CARDS (ÓRION PRO & HYDRA) */}
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

              {/* 2ª LINHA: COMUNIDADE STRIP, REF BUILDER, ENHANCE */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-12 lg:mt-16">
                
                {/* Comunidade Horizontal Strip */}
                <div className="group/comunidade group/recentes relative flex flex-col overflow-hidden rounded-2xl bg-violet-500/[0.04] p-4 ring-1 ring-white/[0.06] md:col-span-2 lg:aspect-[5/2] lg:self-start">
                  <p className="shrink-0 font-display text-lg font-bold uppercase tracking-wider text-white">
                    Comunidade
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

            {/* 2. HYDRA FAIXA DE DESTAQUE 3D */}
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
                  <span className="inline-flex rounded-full bg-violet-500/15 px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-violet-400">
                    Hydra
                  </span>
                  <h2 className="mt-5 font-display text-[28px] font-bold uppercase leading-[1.15] text-white sm:text-[38px]">
                    <span className="block whitespace-nowrap">Crie ensaios</span>
                    <span className="block whitespace-nowrap">
                      fotográficos com o <span className="text-violet-400">Hydra</span>
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

            {/* 3. COMUNIDADE FEED MASONRY (4 COLUNAS) */}
            <div className="mt-12 lg:mt-16">
              <section>
                <div className="flex flex-wrap items-center gap-6 border-b border-white/[0.06] pb-3">
                  <button
                    type="button"
                    aria-pressed={activeTab === "comunidade"}
                    onClick={() => setActiveTab("comunidade")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "comunidade" ? "text-violet-400" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Comunidade
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeTab === "em_alta"}
                    onClick={() => setActiveTab("em_alta")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "em_alta" ? "text-violet-400" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Em alta no Hydra
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeTab === "meus_favoritos"}
                    onClick={() => setActiveTab("meus_favoritos")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "meus_favoritos" ? "text-violet-400" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Meus favoritos
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {/* Coluna 1 */}
                  <div className="space-y-4">
                    {COMMUNITY_COL_1.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setPreviewArt(item)}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/[0.06] cursor-pointer"
                      >
                        <img alt="" loading="lazy" className="w-full object-cover zoom-lento" src={item.src} />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-end p-3">
                          <span className="text-xs font-medium text-white">{item.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coluna 2 */}
                  <div className="space-y-4">
                    {COMMUNITY_COL_2.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setPreviewArt(item)}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/[0.06] cursor-pointer"
                      >
                        <img alt="" loading="lazy" className="w-full object-cover zoom-lento" src={item.src} />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-end p-3">
                          <span className="text-xs font-medium text-white">{item.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coluna 3 */}
                  <div className="space-y-4">
                    {COMMUNITY_COL_3.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setPreviewArt(item)}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/[0.06] cursor-pointer"
                      >
                        <img alt="" loading="lazy" className="w-full object-cover zoom-lento" src={item.src} />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-end p-3">
                          <span className="text-xs font-medium text-white">{item.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coluna 4 */}
                  <div className="space-y-4">
                    {COMMUNITY_COL_4.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setPreviewArt(item)}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/[0.06] cursor-pointer"
                      >
                        <img alt="" loading="lazy" className="w-full object-cover zoom-lento" src={item.src} />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-end p-3">
                          <span className="text-xs font-medium text-white">{item.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* 4. BANNER DA ÁREA DE MEMBROS */}
            <div className="mt-16 sm:mt-24">
              <section className="relative overflow-hidden rounded-3xl ring-1 ring-white/10" style={{ background: "#08040f" }}>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(8,4,15,0.92) 0%, rgba(8,4,15,0.55) 45%, transparent 75%)",
                  }}
                />

                <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center sm:py-20">
                  <img
                    alt="Zion Design"
                    width={399}
                    height={85}
                    decoding="async"
                    className="h-8 w-auto opacity-90"
                    src="/logo-zion.svg"
                    onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
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

      {/* ── Mobile Bottom Navigation ── */}
      <DesignBuilderMobileNav
        activeTab="home"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onNavigateProjects={() => {
          if (onOpenProjects) onOpenProjects();
          else if (onNavigateTab) onNavigateTab("projetos");
        }}
        onNavigateGallery={() => {
          if (onOpenGallery) onOpenGallery();
          else if (onNavigateTab) onNavigateTab("gallery");
        }}
        onNavigateCommunity={() => {
          if (onOpenCommunity) onOpenCommunity();
          else if (onNavigateTab) onNavigateTab("community");
        }}
        onOpenAccount={() => onOpenCreditsModal?.()}
        onOpenAdmin={onOpenAdmin}
        onOpenCredits={onOpenCreditsModal}
        userEmail={userEmail}
        userName={userName}
        isAdmin={isActualAdmin}
        userInitial={userInitials[0] || "R"}
      />

      {/* ── Assistente IA Flutuante Oficial ── */}
      <DesignBuilderAssistant />

      {/* ── Modal de Reportar ── */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          userEmail={userEmail}
        />
      )}

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
                    className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
                    <p className="text-xs text-zinc-500">Criado com Design Builder</p>
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

      {/* ── Modal de Configurações 1:1 Oficial ── */}
      <DesignBuilderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
        onOpenCredits={onOpenCreditsModal}
        onOpenAdmin={onOpenAdmin}
      />
    </div>
  );
};

export default DesignBuilderVitrine;
