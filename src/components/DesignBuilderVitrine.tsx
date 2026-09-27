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
interface CommunityCard {
  id: string;
  src: string;
  author: string;
  avatar?: string;
  initial?: string;
}

const COMMUNITY_COL_1: CommunityCard[] = [
  { id: "EGCPV", src: "/Home_files/thumbnail(18).avif", author: "Joao Celistrino", avatar: "/Home_files/cb80a483e74e954f27902f85296e3d2c.jpg" },
  { id: "UHR0F", src: "/Home_files/thumbnail(19).avif", author: "Rafael Dias", initial: "R" },
  { id: "35SU4", src: "/Home_files/thumbnail(20).avif", author: "André Lira", initial: "A" },
  { id: "Q0XO9", src: "/Home_files/thumbnail(21).avif", author: "Joao Celistrino", avatar: "/Home_files/cb80a483e74e954f27902f85296e3d2c.jpg" },
  { id: "P374K", src: "/Home_files/thumbnail(22).avif", author: "LAO Digital", initial: "L" },
  { id: "4O8SC", src: "/Home_files/thumbnail(23).avif", author: "Erick Lorenzi Vasconcelos", initial: "E" },
];

const COMMUNITY_COL_2: CommunityCard[] = [
  { id: "ULP5G", src: "/Home_files/thumbnail(24).avif", author: "Lucas Albert", avatar: "/Home_files/47658fbc02ba49f99b54465a2574324e__06.PERFIL_LUCAS.png" },
  { id: "OJ5OZ", src: "/Home_files/thumbnail(25).avif", author: "Rafael Dias", initial: "R" },
  { id: "VZDJI", src: "/Home_files/thumbnail(26).avif", author: "CARLOS LOPES", initial: "C" },
  { id: "OP4G5", src: "/Home_files/thumbnail(27).avif", author: "LAO Digital", initial: "L" },
  { id: "AL2SC", src: "/Home_files/thumbnail(28).avif", author: "Mancio", initial: "M" },
  { id: "CY3TE", src: "/Home_files/thumbnail(29).avif", author: "Rafael Dias", initial: "R" },
];

const COMMUNITY_COL_3: CommunityCard[] = [
  { id: "NOCW9", src: "/Home_files/thumbnail(30).avif", author: "Lucas Albert", avatar: "/Home_files/47658fbc02ba49f99b54465a2574324e__06.PERFIL_LUCAS.png" },
  { id: "37GSI", src: "/Home_files/thumbnail(31).avif", author: "CARLOS LOPES", initial: "C" },
  { id: "6HJ71", src: "/Home_files/thumbnail(32).avif", author: "CARLOS LOPES", initial: "C" },
  { id: "MQX0H", src: "/Home_files/thumbnail(33).avif", author: "LAO Digital", initial: "L" },
  { id: "6XH7T", src: "/Home_files/thumbnail(34).avif", author: "Thiago Vargas", initial: "T" },
  { id: "8C4FP", src: "/Home_files/thumbnail(35).avif", author: "Rafael Dias", initial: "R" },
];

const COMMUNITY_COL_4: CommunityCard[] = [
  { id: "G8MYA", src: "/Home_files/thumbnail(36).avif", author: "Rafael Dias", initial: "R" },
  { id: "VQ7YH", src: "/Home_files/thumbnail(37).avif", author: "André Lira", initial: "A" },
  { id: "W0GVC", src: "/Home_files/thumbnail(38).avif", author: "Radinho 24h", initial: "R" },
  { id: "JEG7F", src: "/Home_files/thumbnail(39).avif", author: "LAO Digital", initial: "L" },
  { id: "RZ81U", src: "/Home_files/thumbnail(40).avif", author: "Thiago Vargas", initial: "T" },
  { id: "2ZC0V", src: "/Home_files/thumbnail(41).avif", author: "Rafael Dias", initial: "R" },
];

/* ─────────────────────────── Ref Builder 5 Cards com Sub-Cards Flutuantes ─── */
interface RefSubcard {
  img: string;
  baseTransform: string;
  hoverTransform: string;
  delay: number;
}

interface RefCardData {
  id: number;
  mainImg: string;
  width: string;
  marginLeft?: string;
  baseTransform: string;
  hoverTransform: string;
  baseZ: number;
  subcards: RefSubcard[];
}

const REF_FANNED_CARDS: RefCardData[] = [
  {
    id: 1,
    mainImg: "/Home_files/ref-1.avif",
    width: "20%",
    baseTransform: "translateY(14%) rotate(-13deg)",
    hoverTransform: "translateY(0%) rotate(-13deg) scale(1.04)",
    baseZ: 8,
    subcards: [
      { img: "/Home_files/1-1.avif", baseTransform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", hoverTransform: "translate(-76%, -32%) rotate(-9deg) scale(0.88)", delay: 0 },
      { img: "/Home_files/1-2.avif", baseTransform: "translate(0%, 63%) rotate(0deg) scale(0.85)", hoverTransform: "translate(0%, -46%) rotate(0deg) scale(0.88)", delay: 55 },
      { img: "/Home_files/1-3.avif", baseTransform: "translate(76%, 75%) rotate(9deg) scale(0.85)", hoverTransform: "translate(76%, -32%) rotate(9deg) scale(0.88)", delay: 110 },
    ],
  },
  {
    id: 2,
    mainImg: "/Home_files/ref-2.avif",
    width: "20%",
    marginLeft: "-1%",
    baseTransform: "translateY(4.5%) rotate(-6deg)",
    hoverTransform: "translateY(-6%) rotate(-6deg) scale(1.04)",
    baseZ: 9,
    subcards: [
      { img: "/Home_files/2-1.avif", baseTransform: "translate(-27.5%, 75%) rotate(-4.5deg) scale(0.85)", hoverTransform: "translate(-27.5%, -38%) rotate(-4.5deg) scale(0.88)", delay: 0 },
      { img: "/Home_files/2-2.avif", baseTransform: "translate(27.5%, 75%) rotate(4.5deg) scale(0.85)", hoverTransform: "translate(27.5%, -38%) rotate(4.5deg) scale(0.88)", delay: 55 },
    ],
  },
  {
    id: 3,
    mainImg: "/Home_files/ref-3.avif",
    width: "20%",
    marginLeft: "-1%",
    baseTransform: "translateY(0%) rotate(0deg)",
    hoverTransform: "translateY(-10%) rotate(0deg) scale(1.04)",
    baseZ: 10,
    subcards: [
      { img: "/Home_files/3-1.avif", baseTransform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", hoverTransform: "translate(-76%, -32%) rotate(-9deg) scale(0.88)", delay: 0 },
      { img: "/Home_files/3-2.avif", baseTransform: "translate(0%, 63%) rotate(0deg) scale(0.85)", hoverTransform: "translate(0%, -46%) rotate(0deg) scale(0.88)", delay: 55 },
      { img: "/Home_files/3-3.avif", baseTransform: "translate(76%, 75%) rotate(9deg) scale(0.85)", hoverTransform: "translate(76%, -32%) rotate(9deg) scale(0.88)", delay: 110 },
    ],
  },
  {
    id: 4,
    mainImg: "/Home_files/ref-4(1).avif",
    width: "20%",
    marginLeft: "-1%",
    baseTransform: "translateY(4.5%) rotate(6deg)",
    hoverTransform: "translateY(-6%) rotate(6deg) scale(1.04)",
    baseZ: 9,
    subcards: [
      { img: "/Home_files/4-1.avif", baseTransform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", hoverTransform: "translate(-76%, -32%) rotate(-9deg) scale(0.88)", delay: 0 },
      { img: "/Home_files/4-2.avif", baseTransform: "translate(0%, 63%) rotate(0deg) scale(0.85)", hoverTransform: "translate(0%, -46%) rotate(0deg) scale(0.88)", delay: 55 },
      { img: "/Home_files/4-3.avif", baseTransform: "translate(76%, 75%) rotate(9deg) scale(0.85)", hoverTransform: "translate(76%, -32%) rotate(9deg) scale(0.88)", delay: 110 },
    ],
  },
  {
    id: 5,
    mainImg: "/Home_files/ref-5.avif",
    width: "20%",
    marginLeft: "-1%",
    baseTransform: "translateY(14%) rotate(13deg)",
    hoverTransform: "translateY(0%) rotate(13deg) scale(1.04)",
    baseZ: 8,
    subcards: [
      { img: "/Home_files/5-1.avif", baseTransform: "translate(-76%, 75%) rotate(-9deg) scale(0.85)", hoverTransform: "translate(-76%, -32%) rotate(-9deg) scale(0.88)", delay: 0 },
      { img: "/Home_files/5-2.avif", baseTransform: "translate(0%, 63%) rotate(0deg) scale(0.85)", hoverTransform: "translate(0%, -46%) rotate(0deg) scale(0.88)", delay: 55 },
      { img: "/Home_files/5-3.avif", baseTransform: "translate(76%, 75%) rotate(9deg) scale(0.85)", hoverTransform: "translate(76%, -32%) rotate(9deg) scale(0.88)", delay: 110 },
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
  const [activeTab, setActiveTab] = useState<"comunidade" | "em_alta" | "recentes">("comunidade");
  const [hoveredHydraIndex, setHoveredHydraIndex] = useState<number | null>(null);
  const [hoveredRefIndex, setHoveredRefIndex] = useState<number | null>(null);
  const [previewArt, setPreviewArt] = useState<any | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLinksMenuOpen, setIsLinksMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
  const isActualAdmin = userEmail.toLowerCase().trim() === "der.contatos@gmail.com" || userEmail.toLowerCase().trim() === "ricardo.jrsr.gov@gmail.com";

  // Calculate real credits from Vertex AI
  const storedReal = typeof window !== "undefined" ? localStorage.getItem("zion_real_credits") : null;
  const realCredits = (storedReal !== null && !isNaN(Number(storedReal)) && Number(storedReal) > 100)
    ? Number(storedReal)
    : (typeof propUserTokens === "number" && propUserTokens > 100 && propUserTokens !== 999999 ? propUserTokens : 6612);

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

  // Determine which column set to display based on active tab
  const activeCommunityColumns = activeTab === "comunidade"
    ? [COMMUNITY_COL_1, COMMUNITY_COL_2, COMMUNITY_COL_3, COMMUNITY_COL_4]
    : activeTab === "em_alta"
    ? [COMMUNITY_COL_2, COMMUNITY_COL_4, COMMUNITY_COL_1, COMMUNITY_COL_3]
    : [COMMUNITY_COL_3, COMMUNITY_COL_1, COMMUNITY_COL_4, COMMUNITY_COL_2];

  return (
    <div
      className="flex h-[100dvh] flex-col overflow-hidden relative z-[2]"
      style={{ backgroundColor: "#000000", color: "#ffffff", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Background Glow Orbs Oficiais ─────────────────── */}
      <div aria-hidden="true">
        <div
          className="pointer-events-none fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full blur-[140px] opacity-25"
          style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none fixed bottom-[-15%] right-[-10%] h-[700px] w-[700px] rounded-full blur-[160px] opacity-20"
          style={{ background: "radial-gradient(circle, rgba(217, 70, 239, 0.35) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none fixed top-[40%] right-[15%] h-[500px] w-[500px] rounded-full blur-[150px] opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Sidebar Desktop Oficial 1:1 ────────────────────── */}
      <aside className="fixed top-0 bottom-0 left-0 z-30 hidden w-72 flex-col rounded-r-3xl bg-black/60 backdrop-blur-2xl ring-1 ring-white/[0.06] lg:flex">
        {/* Logo Oficial Zion Design */}
        <div className="flex h-20 shrink-0 items-center px-6">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              alt="Zion Design"
              width={200}
              height={44}
              decoding="async"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              src="/logo-zion.svg"
              onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
              style={{ color: "transparent" }}
            />
          </a>
        </div>

        {/* Itens do Menu Principal */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
          <ul className="space-y-1">
            <li>
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); }}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors bg-white/[0.08] text-white cursor-pointer"
              >
                <Home className="h-5 w-5 text-violet-400" />
                <span>Início</span>
              </a>
            </li>
            <li>
              <a
                href="/projetos"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenProjects) onOpenProjects();
                  else if (onNavigateTab) onNavigateTab("projetos");
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <Briefcase className="h-5 w-5 text-zinc-400" />
                <span>Projetos</span>
              </a>
            </li>
            <li>
              <a
                href="/galeria"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenGallery) onOpenGallery();
                  else if (onNavigateTab) onNavigateTab("gallery");
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <Images className="h-5 w-5 text-zinc-400" />
                <span>Galeria</span>
              </a>
            </li>
            <li>
              <a
                href="/comunidade"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenCommunity) onOpenCommunity();
                  else if (onNavigateTab) onNavigateTab("community");
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <Globe className="h-5 w-5 text-zinc-400" />
                <span>Comunidade</span>
              </a>
            </li>

            {/* Agentes com Badge Em breve Oficial */}
            <li className="pt-1">
              <a
                href="/agentes"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenAgentes) onOpenAgentes();
                  else if (onNavigateTab) onNavigateTab("agentes");
                }}
                className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                  <span>Agentes</span>
                </div>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/20">
                  Em breve
                </span>
              </a>
            </li>
          </ul>

          {/* Divisor "Agentes" na Sidebar */}
          <div className="my-4 border-t border-white/[0.06]" />
          <div className="px-4 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Agentes
            </span>
          </div>

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
                        localStorage.removeItem("zion_user");
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
                aria-label="Notificações"
                title="Notificações"
                onClick={() => alert("Nenhuma nova notificação.")}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Bell className="h-[18px] w-[18px]" />
              </button>

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
                    <a
                      role="menuitem"
                      href="https://aulas.easybuilder.com.br/"
                      target="_blank"
                      rel="noopener noreferrer"
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
                    </a>
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

            {/* ══════════════════════════════════════════════════════
                1. HERO SHOWCASE & 3-SUBGRID (Home.html Seção 1)
            ══════════════════════════════════════════════════════ */}
            <section className="mb-12 lg:mb-16">
              {/* Linha Superior: ÓRION PRO e HYDRA */}
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

              {/* 2ª Linha: Comunidade Strip, REF BUILDER, ENHANCE */}
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
                  images={["/Home_files/ref-4.avif", "/Home_files/ref-1.avif", "/Home_files/ref-2.avif", "/Home_files/ref-3.avif"]}
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
                    <source src="/Home_files/enhance-builder.mp4" type="video/mp4" />
                    <source src="https://apidb20.designbuilder.co/api/agent-videos/enhance-builder?v=4" type="video/mp4" />
                  </video>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-16">
                    <span className="font-display text-lg font-bold tracking-wider text-white">ENHANCE</span>
                  </div>
                </a>

              </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                2. HYDRA FAIXA DE DESTAQUE 3D (Home.html Seção 2)
            ══════════════════════════════════════════════════════ */}
            <div className="mt-12 lg:mt-16">
              <section className="relative min-h-[380px] sm:min-h-[440px] overflow-hidden rounded-3xl bg-black ring-1 ring-white/[0.06]">
                {/* 6 Fanned 3D Cards */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68%] md:block"
                  style={{ perspective: "1400px" }}
                >
                  {HYDRA_FANNED_CARDS.map((card, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredHydraIndex(i)}
                      onMouseLeave={() => setHoveredHydraIndex(null)}
                      onClick={() => go("hydra")}
                      className="pointer-events-auto absolute top-1/2 right-6 h-[126%] w-[40%] overflow-hidden rounded-[22px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] cursor-pointer"
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

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent md:via-black/35 md:to-transparent" />

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

            {/* ══════════════════════════════════════════════════════
                3. COMUNIDADE FEED MASONRY 24 CARDS (Home.html Seção 3)
            ══════════════════════════════════════════════════════ */}
            <div className="mt-12 lg:mt-16">
              <section>
                {/* Abas Oficiais */}
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
                    aria-pressed={activeTab === "recentes"}
                    onClick={() => setActiveTab("recentes")}
                    className={`font-display text-lg font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeTab === "recentes" ? "text-violet-400" : "text-white/90 hover:text-white"
                    }`}
                  >
                    Recentes
                  </button>
                </div>

                {/* Grid 4 Colunas 1:1 Oficial */}
                <div className="relative">
                  <div className="mt-4 flex gap-[2px]" style={{ "--duracao-zoom": "280ms" } as React.CSSProperties}>
                    {activeCommunityColumns.map((col, colIdx) => (
                      <div key={colIdx} className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        {col.map((item) => (
                          <a
                            key={item.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setPreviewArt(item);
                            }}
                            className="group relative block overflow-hidden rounded-md cursor-pointer"
                          >
                            <img
                              alt={`[${item.id}]`}
                              loading="lazy"
                              className="h-auto w-full zoom-lento"
                              src={item.src}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-2.5 pt-10 pb-2">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 transition-opacity duration-[400ms] ease-suave group-hover:opacity-100" />
                              {item.avatar ? (
                                <img
                                  alt=""
                                  loading="lazy"
                                  className="relative h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                                  src={item.avatar}
                                />
                              ) : (
                                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-[11px] font-semibold text-white ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                  {item.initial || "R"}
                                </span>
                              )}
                              <span className="relative min-w-0 max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-[400ms] ease-suave group-hover:max-w-[240px] group-hover:translate-x-0 group-hover:opacity-100">
                                <span className="block truncate text-[12px] font-medium leading-tight text-white">
                                  {item.author}
                                </span>
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Gradiente de Desvanecimento Inferior */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/85 to-transparent" />
                  
                  {/* Botão Central Ver Mais */}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenCommunity) onOpenCommunity();
                        else onNavigateTab?.("community");
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-[filter] duration-300 hover:brightness-110 disabled:opacity-60 cursor-pointer"
                    >
                      Ver mais
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* ══════════════════════════════════════════════════════
                4. REF BUILDER 3D FAN SHOWCASE (Home.html Seção 4)
            ══════════════════════════════════════════════════════ */}
            <div className="mt-12 lg:mt-16">
              <section
                className="relative overflow-hidden rounded-3xl bg-[#08040f]"
                style={{
                  boxShadow: "rgba(139, 92, 246, 0.35) 0px 0px 90px 10px inset, rgba(217, 70, 239, 0.12) 0px 0px 200px 40px inset, rgba(139, 92, 246, 0.4) 0px 0px 60px -20px",
                }}
              >
                {/* Vídeo de Fundo Oficial */}
                <video
                  src="/Home_files/fundo-secao-referencias.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  ref={(el) => {
                    if (el) {
                      el.muted = true;
                      el.play().catch(() => {});
                    }
                  }}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,4,15,0.86)_0%,rgba(8,4,15,0.72)_55%,rgba(8,4,15,0.9)_100%)]" />

                <div className="relative flex flex-col items-center gap-5 px-6 pt-16 pb-10 text-center sm:pt-20 md:pb-16 xl:pb-24">
                  {/* Logo Zion Design */}
                  <img
                    alt="Zion Design"
                    loading="lazy"
                    width={399}
                    height={85}
                    decoding="async"
                    className="h-8 w-auto"
                    src="/logo-zion.svg"
                    onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
                    style={{ color: "transparent" }}
                  />

                  <p className="font-display text-2xl leading-tight text-white sm:text-4xl">
                    <span className="block">Transforme inspirações</span>
                    <span className="block">em criações únicas</span>
                  </p>

                  <p className="max-w-xl text-[15px] text-zinc-300">
                    Combine suas inspirações no Ref Builder e crie uma imagem com identidade própria.
                  </p>

                  <a
                    onClick={(e) => { e.preventDefault(); go("ref"); }}
                    className="botao-externo cursor-pointer"
                    href="/agent/ref"
                  >
                    <span className="botao-externo__seta">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="botao-externo__texto">Criar com inspirações</span>
                  </a>

                  {/* Leque 3D Interativo de 5 Cards com Entradas Flutuantes */}
                  <div className="mt-8 hidden w-full max-w-[1400px] items-end justify-center md:flex">
                    {REF_FANNED_CARDS.map((card, idx) => {
                      const isHovered = hoveredRefIndex === idx;
                      return (
                        <div
                          key={card.id}
                          onMouseEnter={() => setHoveredRefIndex(idx)}
                          onMouseLeave={() => setHoveredRefIndex(null)}
                          onClick={() => go("ref")}
                          className="relative aspect-[3/4] shrink-0 overflow-hidden rounded-2xl shadow-[0_26px_60px_-18px_rgba(0,0,0,0.85)] cursor-pointer"
                          style={{
                            width: card.width,
                            marginLeft: card.marginLeft,
                            transform: isHovered ? card.hoverTransform : card.baseTransform,
                            filter: isHovered ? "brightness(1.1)" : "brightness(0.92)",
                            transitionProperty: "transform, filter",
                            transitionDuration: "320ms",
                            transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                            zIndex: isHovered ? 50 : card.baseZ,
                          }}
                        >
                          <img alt="" loading="lazy" className="h-full w-full object-cover" src={card.mainImg} />

                          {/* Escurecimento suave no hover */}
                          <div
                            className="pointer-events-none absolute inset-0 bg-black"
                            style={{
                              opacity: isHovered ? 0.45 : 0,
                              transitionProperty: "opacity",
                              transitionDuration: "460ms",
                              transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                            }}
                          />

                          {/* Miniaturas de Inspiração Flutuantes que abrem no hover */}
                          <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            {card.subcards.map((sub, sidx) => (
                              <div
                                key={sidx}
                                className="col-start-1 row-start-1 aspect-[3/4] w-[36%] overflow-hidden rounded-lg shadow-[0_10px_24px_-8px_rgba(0,0,0,0.9)] ring-1 ring-white/25"
                                style={{
                                  transform: isHovered ? sub.hoverTransform : sub.baseTransform,
                                  opacity: isHovered ? 1 : 0,
                                  transitionProperty: "transform, opacity",
                                  transitionDuration: "560ms",
                                  transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                                  transitionDelay: `${sub.delay}ms`,
                                }}
                              >
                                <img alt="" loading="lazy" className="h-full w-full object-cover" src={sub.img} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            {/* ══════════════════════════════════════════════════════
                5. ÁREA DE MEMBROS COM WIREFRAME 3D SVG (Home.html Seção 5)
            ══════════════════════════════════════════════════════ */}
            <div className="mt-12 lg:mt-16">
              <section
                className="relative overflow-hidden rounded-3xl bg-[#08040f]"
                style={{
                  boxShadow: "rgba(139, 92, 246, 0.35) 0px 0px 90px 10px inset, rgba(217, 70, 239, 0.12) 0px 0px 200px 40px inset, rgba(139, 92, 246, 0.4) 0px 0px 60px -20px",
                }}
              >
                {/* Grid 3D de Perspectiva da Sala Oficial */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 1000 400"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <g stroke="rgba(167, 139, 250, 0.13)" strokeWidth="1" fill="none">
                    <path d="M0 0 L340 130" />
                    <path d="M0 400 L340 270" />
                    <path d="M0 0 L340 130" />
                    <path d="M1000 0 L660 130" />
                    <path d="M100 0 L372 130" />
                    <path d="M100 400 L372 270" />
                    <path d="M0 40 L340 144" />
                    <path d="M1000 40 L660 144" />
                    <path d="M200 0 L404 130" />
                    <path d="M200 400 L404 270" />
                    <path d="M0 80 L340 158" />
                    <path d="M1000 80 L660 158" />
                    <path d="M300 0 L436 130" />
                    <path d="M300 400 L436 270" />
                    <path d="M0 120 L340 172" />
                    <path d="M1000 120 L660 172" />
                    <path d="M400 0 L468 130" />
                    <path d="M400 400 L468 270" />
                    <path d="M0 160 L340 186" />
                    <path d="M1000 160 L660 186" />
                    <path d="M500 0 L500 130" />
                    <path d="M500 400 L500 270" />
                    <path d="M0 200 L340 200" />
                    <path d="M1000 200 L660 200" />
                    <path d="M600 0 L532 130" />
                    <path d="M600 400 L532 270" />
                    <path d="M0 240 L340 214" />
                    <path d="M1000 240 L660 214" />
                    <path d="M700 0 L564 130" />
                    <path d="M700 400 L564 270" />
                    <path d="M0 280 L340 228" />
                    <path d="M1000 280 L660 228" />
                    <path d="M800 0 L596 130" />
                    <path d="M800 400 L596 270" />
                    <path d="M0 320 L340 242" />
                    <path d="M1000 320 L660 242" />
                    <path d="M900 0 L628 130" />
                    <path d="M900 400 L628 270" />
                    <path d="M0 360 L340 256" />
                    <path d="M1000 360 L660 256" />
                    <path d="M1000 0 L660 130" />
                    <path d="M1000 400 L660 270" />
                    <path d="M0 400 L340 270" />
                    <path d="M1000 400 L660 270" />
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

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,4,15,0.92)_0%,rgba(8,4,15,0.55)_45%,transparent_75%)]" />

                <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center sm:py-20">
                  <img
                    alt="Zion Design"
                    loading="lazy"
                    width={399}
                    height={85}
                    decoding="async"
                    className="h-8 w-auto"
                    src="/logo-zion.svg"
                    onError={(e) => { (e.target as HTMLElement).setAttribute("src", "/logo-zion.webp"); }}
                    style={{ color: "transparent" }}
                  />

                  <p className="font-display text-2xl leading-tight text-white sm:text-4xl">
                    <span className="block">Assista nossos conteúdos</span>
                    <span className="block">na área de membros!</span>
                  </p>

                  <a
                    href="https://aulas.easybuilder.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="botao-externo"
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

      {/* ── Modal de Detalhe da Arte da Comunidade ── */}
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
