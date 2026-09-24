import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Copy,
  Heart,
  ArrowBigUp,
  X,
  Globe,
  ChevronDown,
  Shuffle,
  MoreHorizontal,
  Flame,
  Clock,
  Check
} from "lucide-react";
import { COMMUNITY_CARDS, CommunityCardItem } from "../data/communityData";
import { ComunidadeDetailModal } from "./ComunidadeDetailModal";

interface ComunidadeManagerProps {
  onOpenVitrine?: () => void;
  onOpenStudio: (agentSlug?: string, prompt?: string) => void;
  onOpenGallery?: () => void;
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

// 1. Dropdown Categoria oficial do Design Builder: "Todos" e "Favoritos"
const CATEGORIES = [
  { id: "all", label: "Todos", icon: Globe, iconColor: "text-violet-400" },
  { id: "favorites", label: "Favoritos", icon: Heart, iconColor: "text-pink-400" }
];

// 2. Dropdown Apps oficial do Design Builder
const APPS = [
  { id: "all", label: "Todos os apps", slug: "" },
  { id: "altera-facil", label: "Altera Fácil", slug: "altera-facil" },
  { id: "design-builder", label: "Zion Design", slug: "design-builder1-2" },
  { id: "design-builder-1-2", label: "Zion Design 1.2", slug: "design-builder1-2" },
  { id: "design-builder-v2", label: "Zion Design V2", slug: "design-builder1-2" },
  { id: "enhance", label: "Enhance", slug: "enhance-builder" },
  { id: "orion-pro", label: "Órion Pro", slug: "orion-pro" },
  { id: "product-builder", label: "Product Builder", slug: "design-builder1-2" },
  { id: "hydra", label: "Hydra", slug: "hydra" },
  { id: "ref", label: "Ref", slug: "ref-builder" },
  { id: "ref-builder-v2", label: "Ref Builder V2", slug: "ref-builder" }
];

// 3. Dropdown Ordenação oficial do Design Builder: "Aleatório", "Popular", "Recentes"
const SORT_OPTIONS = [
  { id: "random", label: "Aleatório", icon: Shuffle, iconColor: "text-violet-400" },
  { id: "popular", label: "Popular", icon: Flame, iconColor: "text-amber-500" },
  { id: "recent", label: "Recentes", icon: Clock, iconColor: "text-cyan-400" }
];

export const ComunidadeManager: React.FC<ComunidadeManagerProps> = ({
  onOpenVitrine,
  onOpenStudio,
  onOpenGallery,
  showToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("random");
  const [communitySearch, setCommunitySearch] = useState<string>("");
  const [communityVotes, setCommunityVotes] = useState<Record<string, number>>({});
  const [favoriteCards, setFavoriteCards] = useState<Set<string>>(new Set());
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // Dropdowns abertos
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Colunas responsivas para Media Masonry (1 a 5 colunas)
  const [columnCount, setColumnCount] = useState<number>(5);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) setColumnCount(1);
      else if (w < 768) setColumnCount(2);
      else if (w < 1100) setColumnCount(3);
      else if (w < 1500) setColumnCount(4);
      else setColumnCount(5);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-container]")) {
        setIsCatOpen(false);
        setIsAppOpen(false);
        setIsSortOpen(false);
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const [allCards, setAllCards] = useState<CommunityCardItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user_published_community_cards");
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            const listIds = new Set(list.map((c: any) => c.id));
            return [...list, ...COMMUNITY_CARDS.filter((c) => !listIds.has(c.id))];
          }
        }
      } catch (_) {}
    }
    return COMMUNITY_CARDS;
  });

  useEffect(() => {
    // 1. Fetch from backend /api/community
    fetch("/api/community")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const formatted: CommunityCardItem[] = data.items
            .filter((it: any) => it.src || it.image_url || it.thumbnail_url || it.result_url)
            .map((it: any, idx: number) => ({
              id: it.id || `comm-api-${idx}`,
              col: 0,
              index: idx,
              title: it.community_title || it.title || "Arte Criada",
              tag: it.tag || (Array.isArray(it.community_tags) && it.community_tags[0]) || "Criativo",
              aspect: it.aspect || (it.dimensions === "9:16" ? "9 / 16" : it.dimensions === "16:9" ? "16 / 9" : it.dimensions === "1:1" ? "1 / 1" : "4 / 5"),
              author: it.autor?.nome || it.author || "Você",
              avatar: it.autor?.avatar_url || it.avatar || "",
              letter: (it.autor?.nome || it.author || "V")[0],
              baseVotes: it.upvote_count || it.baseVotes || 1,
              app: it.app || (it.agent_slug === "orion-pro" ? "Órion Pro" : "Zion Design"),
              src: it.src || it.image_url || it.thumbnail_url || it.result_url || "",
              prompt: it.prompt || ""
            }));

          setAllCards((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newFromApi = formatted.filter((c) => !existingIds.has(c.id));
            if (newFromApi.length > 0) {
              return [...newFromApi, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(() => {});

    // 2. Listen to real-time publish events from Design Builder Studio
    const handleNewPost = (e: any) => {
      const newPost = e?.detail;
      if (newPost && newPost.src) {
        setAllCards((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
      }
    };
    window.addEventListener("community:new_post", handleNewPost);
    return () => window.removeEventListener("community:new_post", handleNewPost);
  }, []);

  // Filtragem e Ordenação
  const filteredCards = useMemo(() => {
    let result = allCards.filter((c) => {
      // Filtro de Categoria (Todos ou Favoritos)
      if (selectedCategory === "favorites") {
        if (!favoriteCards.has(c.id)) return false;
      }

      // Filtro de App
      if (selectedApp !== "all") {
        const appObj = APPS.find((a) => a.id === selectedApp);
        if (appObj) {
          const appName = appObj.label.toLowerCase();
          const cardApp = (c.app || "").toLowerCase();
          const matches =
            cardApp.includes(appName) ||
            (appName.includes("orion") && cardApp.includes("orion")) ||
            (appName.includes("hydra") && cardApp.includes("hydra")) ||
            (appName.includes("ref") && cardApp.includes("ref")) ||
            (appName.includes("enhance") && cardApp.includes("enhance")) ||
            (appName.includes("altera") && cardApp.includes("altera")) ||
            (appName.includes("design builder") && cardApp.includes("design builder"));
          if (!matches) return false;
        }
      }

      // Filtro de Busca
      if (communitySearch.trim()) {
        const q = communitySearch.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.prompt.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.tag.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    // Ordenação
    if (sortOption === "popular") {
      result = [...result].sort((a, b) => {
        const votesA = (communityVotes[a.id] ?? 0) + (a.baseVotes || 0);
        const votesB = (communityVotes[b.id] ?? 0) + (b.baseVotes || 0);
        return votesB - votesA;
      });
    } else if (sortOption === "recent") {
      result = [...result].sort((a, b) => b.index - a.index);
    }

    return result;
  }, [selectedCategory, selectedApp, sortOption, communitySearch, communityVotes, favoriteCards]);

  // Distribuição dos cards em colunas (gap: 0px)
  const masonryColumns = useMemo(() => {
    const cols: CommunityCardItem[][] = Array.from({ length: columnCount }, () => []);
    filteredCards.forEach((card, idx) => {
      cols[idx % columnCount].push(card);
    });
    return cols;
  }, [filteredCards, columnCount]);

  const handleVote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCommunityVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    if (showToast) {
      showToast("+1 voto registrado!", "success");
    }
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (showToast) showToast("Removido dos favoritos", "info");
      } else {
        next.add(id);
        if (showToast) showToast("Arte favoritada!", "success");
      }
      return next;
    });
  };

  const handleReuse = (card: CommunityCardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const appMatch = APPS.find((a) => a.id !== "all" && card.app.toLowerCase().includes(a.label.toLowerCase()));
    const slug = appMatch ? appMatch.slug : "design-builder1-2";

    onOpenStudio(slug, card.prompt);
    if (showToast) {
      showToast(`Parâmetros de "${card.title || card.id}" carregados no Studio!`, "success");
    }
  };

  const modalCards = useMemo(() => {
    return filteredCards.map((c, idx) => ({
      id: c.id,
      index: idx,
      col: c.col,
      aspect: c.aspect,
      title: c.title,
      tag: c.tag,
      app: c.app,
      votes: (communityVotes[c.id] ?? 0) + (c.baseVotes || 0),
      author: c.author,
      avatar: c.avatar || "",
      letter: c.letter || c.author[0] || "U",
      src: c.src,
      prompt: c.prompt
    }));
  }, [filteredCards, communityVotes]);

  const activeAppObj = APPS.find((a) => a.id === selectedApp) || APPS[0];
  const activeSortObj = SORT_OPTIONS.find((s) => s.id === sortOption) || SORT_OPTIONS[0];
  const activeCatObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const ActiveSortIcon = activeSortObj.icon;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden relative z-[2] bg-black text-zinc-100 lg:-ml-[60px] lg:w-[calc(100%+60px)]">
      {/* Topo Sticky Oficial 1:1 do Design Builder */}
      <div className="sticky z-10 w-full border-b border-white/5 bg-zinc-950/95 backdrop-blur-md top-0 pl-4 lg:pl-[84px] pr-4 py-2.5">
        <div className="flex flex-col gap-2.5 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 lg:flex-row lg:items-center lg:gap-3 lg:py-2.5">
          {/* Título & Contador */}
          <div className="flex min-h-[44px] shrink-0 items-center gap-2 pr-14 lg:min-h-0 lg:pr-0">
            <h1 className="text-lg font-medium tracking-tight text-white">Comunidade</h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
              {filteredCards.length} gerações
            </span>
          </div>

          {/* Campo de Busca */}
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="relative w-full lg:max-w-sm"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Buscar na comunidade..."
              className="w-full border border-white/10 bg-zinc-900/80 pl-9 pr-10 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 [&::-webkit-search-cancel-button]:hidden rounded-xl py-2"
              type="search"
              value={communitySearch}
              onChange={(e) => setCommunitySearch(e.target.value)}
            />
            {communitySearch && (
              <button
                type="button"
                onClick={() => setCommunitySearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* 3 Botões Dropdown Oficiais com layout de opções 1:1 */}
          <div className="flex flex-wrap items-center gap-1.5 lg:shrink-0" data-dropdown-container>
            {/* 1. Dropdown Categoria (Todos / Favoritos) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCatOpen(!isCatOpen);
                  setIsAppOpen(false);
                  setIsSortOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-700 cursor-pointer"
              >
                <Globe className="h-3 w-3 text-violet-400" />
                <span>{activeCatObj.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`} />
              </button>

              {isCatOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl bg-zinc-900/95 p-1.5 shadow-2xl border border-white/10 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCatOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {/* Indicador circular de seleção (Rádio 1:1 do Design Builder) */}
                        {isSelected ? (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm shadow-violet-600/50">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-zinc-600" />
                        )}

                        <CatIcon className={`h-4 w-4 ${cat.iconColor}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Dropdown Apps (Todos os apps + 10 apps oficiais com lista rolável) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsAppOpen(!isAppOpen);
                  setIsCatOpen(false);
                  setIsSortOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-700 cursor-pointer"
              >
                <span className="h-2.5 w-2.5 rounded-full ring-[1.5px] ring-zinc-900 bg-zinc-500" />
                <span>{activeAppObj.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isAppOpen ? "rotate-180" : ""}`} />
              </button>

              {isAppOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-zinc-900/95 p-1.5 shadow-2xl border border-white/10 backdrop-blur-xl z-50 max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
                  {APPS.map((app) => {
                    const isSelected = selectedApp === app.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedApp(app.id);
                          setIsAppOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {/* Indicador circular de seleção (Rádio 1:1) */}
                        {isSelected ? (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm shadow-violet-600/50">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-zinc-600" />
                        )}

                        <span className="truncate">{app.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Dropdown Ordenação (Aleatório, Popular, Recentes) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsCatOpen(false);
                  setIsAppOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-700 cursor-pointer"
              >
                <ActiveSortIcon className={`h-3 w-3 ${activeSortObj.iconColor}`} />
                <span>{activeSortObj.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-zinc-900/95 p-1.5 shadow-2xl border border-white/10 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortOption === opt.id;
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortOption(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${
                          isSelected ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {/* Indicador circular de seleção (Rádio 1:1) */}
                        {isSelected ? (
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm shadow-violet-600/50">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-zinc-600" />
                        )}

                        <OptIcon className={`h-4 w-4 ${opt.iconColor}`} />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Masonry contínuo sem espaçamento (gap: 0px) Oficial 1:1 */}
      <main className="w-full flex-1 overflow-y-auto overscroll-contain pb-12 custom-scrollbar pl-0 lg:pl-[60px]">
        <div data-media-masonry="true" className="flex w-full pb-12" style={{ gap: "0px" }}>
          {masonryColumns.map((columnCards, colIdx) => (
            <div
              key={`col-${colIdx}`}
              data-media-column={colIdx}
              className="flex min-w-0 flex-1 flex-col"
              style={{ gap: "0px" }}
            >
              {columnCards.map((card) => {
                const globalIndex = filteredCards.findIndex((c) => c.id === card.id);
                const currentVotes = (communityVotes[card.id] ?? 0) + (card.baseVotes || 0);
                const isFav = favoriteCards.has(card.id);
                const aspectCss = card.aspect.replace(/\s+/g, "");

                return (
                  <div
                    key={card.id}
                    data-media-window="mounted"
                    className="w-full [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
                  >
                    <div data-media-index={card.index} className="w-full">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCardIndex(globalIndex >= 0 ? globalIndex : 0)}
                        className="group relative w-full cursor-pointer overflow-hidden bg-black text-left transition-all duration-300 hover:opacity-95 [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
                      >
                        <div
                          data-media-card="true"
                          data-media-loaded="true"
                          className="relative w-full overflow-hidden bg-zinc-900"
                          style={{ aspectRatio: aspectCss }}
                        >
                          {/* Imagem Principal */}
                          <img
                            alt={card.title ? `[${card.id}] ${card.title}` : `[${card.id}]`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 block h-full w-full object-cover opacity-100 transition-transform duration-500 group-hover:scale-[1.03]"
                            src={card.src}
                          />

                          {/* Desktop Hover Overlay Oficial */}
                          <div className="absolute inset-0 hidden bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block pointer-events-none">
                            {/* Título & Categoria */}
                            <div className="absolute left-3 right-16 bottom-14">
                              <p className="truncate text-sm font-semibold text-white drop-shadow-lg">
                                {card.title}
                              </p>
                              <p className="mt-0.5 text-[11px] capitalize text-white/60">
                                {card.tag}
                              </p>
                            </div>

                            {/* Botões do Canto Superior Direito (Reutilizar + Favoritar) */}
                            <div className="absolute right-3 top-3 flex items-center gap-1.5 pointer-events-auto">
                              <button
                                type="button"
                                title="Reutilizar"
                                onClick={(e) => handleReuse(card, e)}
                                className="flex items-center gap-1.5 rounded-full bg-violet-500/90 hover:bg-violet-400 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-95"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                <span>Reutilizar</span>
                              </button>

                              <button
                                type="button"
                                title="Favoritar"
                                onClick={(e) => handleToggleFavorite(card.id, e)}
                                className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all lg:h-8 lg:w-8 cursor-pointer active:scale-95 ${
                                  isFav
                                    ? "bg-black/80 text-pink-400 ring-1 ring-pink-500/60"
                                    : "bg-black/50 text-white/80 hover:bg-black/70 hover:text-pink-400"
                                }`}
                              >
                                <Heart className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                              </button>
                            </div>

                            {/* Botão Votar no Canto Inferior Direito */}
                            <div className="absolute bottom-3 right-3 pointer-events-auto">
                              <button
                                type="button"
                                title="Votar"
                                onClick={(e) => handleVote(card.id, e)}
                                className="flex items-center gap-1 rounded-full px-2.5 py-1.5 backdrop-blur-sm transition-all duration-200 text-xs font-bold tabular-nums bg-black/50 text-white/80 hover:bg-black/70 hover:text-violet-300 cursor-pointer active:scale-95"
                              >
                                <ArrowBigUp className="h-4 w-4" />
                                <span>{currentVotes}</span>
                              </button>
                            </div>
                          </div>

                          {/* Pílula de Autor no Canto Inferior Esquerdo (Animação retrátil ao passar o mouse) */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-2.5 pt-10 pb-2 pr-16 z-10">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            {card.avatar ? (
                              <img
                                alt={card.author}
                                loading="lazy"
                                className="relative h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                                src={card.avatar}
                              />
                            ) : (
                              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-[11px] font-semibold text-white ring-1 ring-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                                {card.letter || card.author[0] || "U"}
                              </span>
                            )}
                            <span className="relative min-w-0 max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:max-w-[240px] group-hover:translate-x-0 group-hover:opacity-100">
                              <span className="block truncate text-[12px] font-medium leading-tight text-white drop-shadow-md">
                                {card.author}
                              </span>
                            </span>
                          </div>

                          {/* Botão de Ações Mobile */}
                          <button
                            type="button"
                            aria-label="Ações"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCardIndex(globalIndex >= 0 ? globalIndex : 0);
                            }}
                            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors active:bg-black/70 lg:hidden cursor-pointer"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-white">Nenhuma criação encontrada</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Tente ajustar sua busca ou selecionar outra categoria e aplicativo.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedApp("all");
                setCommunitySearch("");
              }}
              className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </main>

      {/* Modal Detalhado de Inspeção de Imagem */}
      {selectedCardIndex !== null && (
        <ComunidadeDetailModal
          isOpen={selectedCardIndex !== null}
          onClose={() => setSelectedCardIndex(null)}
          cards={modalCards}
          currentIndex={selectedCardIndex}
          onNavigate={(idx) => setSelectedCardIndex(idx)}
          onVote={(cardId) => handleVote(cardId)}
          onFavorite={(cardId) => handleToggleFavorite(cardId)}
          votes={
            selectedCardIndex !== null && modalCards[selectedCardIndex]
              ? modalCards[selectedCardIndex].votes
              : 0
          }
          isFavorited={
            selectedCardIndex !== null && modalCards[selectedCardIndex]
              ? favoriteCards.has(modalCards[selectedCardIndex].id)
              : false
          }
        />
      )}
    </div>
  );
};

export default ComunidadeManager;
