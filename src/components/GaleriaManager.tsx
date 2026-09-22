import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ImageOff,
  ChevronDown,
  Copy,
  Heart,
  ArrowBigUp,
  Trash2,
  Download,
  MoreHorizontal,
  Share2,
  Layers,
  X,
  Check,
  Filter,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { REAL_USER_GENERATIONS, GalleryItem } from "../data/galleryData";
import { GaleriaDetailModal, GaleriaCardItem } from "./GaleriaDetailModal";
import { useProjectStore, addDeletedImage, getDeletedImages } from "../store/useProjectStore";

interface GaleriaManagerProps {
  onOpenVitrine?: () => void;
  onOpenStudio: (agentSlug?: string, prompt?: string, formData?: any) => void;
  onOpenCommunity?: () => void;
  showToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const GaleriaManager: React.FC<GaleriaManagerProps> = ({
  onOpenVitrine,
  onOpenStudio,
  onOpenCommunity,
  showToast
}) => {
  const store = useProjectStore();

  // Itens da Galeria: combina itens reais do HAR com gerações recentes do store
  const [generations, setGenerations] = useState<GalleryItem[]>(() => {
    const list = [...REAL_USER_GENERATIONS];

    // Se o store tiver imagens geradas pelo usuário que não estão no mock, adiciona no topo
    if (store.galeriaImages && store.galeriaImages.length > 0) {
      store.galeriaImages.forEach((imgUrl, idx) => {
        if (!list.some((g) => g.result_url === imgUrl || g.thumbnail_url === imgUrl)) {
          list.unshift({
            id: `local-gen-${idx}-${Date.now()}`,
            status: "done",
            result_url: imgUrl,
            thumbnail_url: imgUrl,
            fallback_url: "/vitrine/hydra/hydra-fotografia-1.avif",
            created_at: new Date().toISOString(),
            date_formatted: "Hoje",
            agent_slug: "design-builder1-2",
            agent_name: "Design Builder 1.2",
            dimensions: "4:5",
            aspect_ratio: "4/5",
            ai_model: "gemini-3.1-flash-image",
            is_favorited: false,
            is_upvoted: false,
            upvote_count: 0,
            prompt: "Imagem gerada no Studio Design Builder."
          });
        }
      });
    }
    return list;
  });

  // Buscar gerações atualizadas do servidor (BFF + Histórico)
  useEffect(() => {
    let isMounted = true;
    const loadServerGenerations = async () => {
      try {
        const [bffRes, histRes] = await Promise.all([
          fetch("/api/bff/api/generations").catch(() => null),
          fetch("/api/historico-imagens").catch(() => null)
        ]);

        const newItems: GalleryItem[] = [];

        if (bffRes && bffRes.ok) {
          const bffData = await bffRes.json();
          if (Array.isArray(bffData.items)) {
            bffData.items.forEach((item: any, idx: number) => {
              newItems.push({
                id: item.id || `bff-gen-${idx}`,
                status: item.status || "done",
                result_url: item.result_url,
                thumbnail_url: item.thumbnail_url || item.result_url,
                fallback_url: "/Design%20Builder1%202_files/result.avif",
                created_at: item.created_at || new Date().toISOString(),
                date_formatted: "Hoje",
                agent_slug: item.agent_slug || "design-builder1-2",
                agent_name: "Design Builder 1.2",
                dimensions: item.dimensions || item.form_data?.dimensions || "4:5",
                aspect_ratio: item.dimensions === "1:1" ? "1/1" : item.dimensions === "9:16" ? "9/16" : item.dimensions === "16:9" ? "16/9" : "4/5",
                ai_model: "gemini-3.1-flash-image",
                is_favorited: false,
                is_upvoted: false,
                upvote_count: 0,
                prompt: item.form_data?.subject_description || item.form_data?.scene_description || "Design gerado no Studio Design Builder."
              });
            });
          }
        }

        if (histRes && histRes.ok) {
          const histData = await histRes.json();
          if (Array.isArray(histData.images)) {
            histData.images.forEach((img: any, idx: number) => {
              const url = img.url;
              if (!newItems.some(item => item.result_url === url || item.thumbnail_url === url)) {
                newItems.push({
                  id: `hist-gen-${idx}-${img.filename}`,
                  status: "done",
                  result_url: url,
                  thumbnail_url: url,
                  fallback_url: "/Design%20Builder1%202_files/result.avif",
                  created_at: img.createdAt || new Date().toISOString(),
                  date_formatted: "Hoje",
                  agent_slug: "design-builder1-2",
                  agent_name: "Design Builder 1.2",
                  dimensions: img.aspect || "4:5",
                  aspect_ratio: img.aspect || "4/5",
                  ai_model: "gemini-3.1-flash-image",
                  is_favorited: false,
                  is_upvoted: false,
                  upvote_count: 0,
                  prompt: `Arte gerada: ${img.filename}`
                });
              }
            });
          }
        }

        if (isMounted && newItems.length > 0) {
          setGenerations((prev) => {
            const combined = [...newItems];
            prev.forEach((existing) => {
              if (!combined.some(c => c.result_url === existing.result_url || c.id === existing.id)) {
                combined.push(existing);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn("[GaleriaManager] Erro ao carregar gerações:", err);
      }
    };

    loadServerGenerations();
    return () => { isMounted = false; };
  }, []);

  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState<boolean>(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [activeCardDownloadId, setActiveCardDownloadId] = useState<string | null>(null);
  const appFilterButtonRef = useRef<HTMLButtonElement | null>(null);
  const appDropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 56, left: 228 });

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        appDropdownMenuRef.current &&
        !appDropdownMenuRef.current.contains(e.target as Node) &&
        appFilterButtonRef.current &&
        !appFilterButtonRef.current.contains(e.target as Node)
      ) {
        setIsAppDropdownOpen(false);
      }
      setActiveCardMenuId(null);
      setActiveCardDownloadId(null);
    };
    if (activeCardMenuId || activeCardDownloadId || isAppDropdownOpen) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [activeCardMenuId, activeCardDownloadId, isAppDropdownOpen]);

  // Filtro de apps oficial 1:1
  const appOptions = [
    { value: "", label: "Todos os Apps" },
    { value: "ref", label: "REF" },
    { value: "hydra", label: "Hydra" },
    { value: "enhance", label: "Enhance" },
    { value: "design-builder", label: "Design Builder 1.2" },
    { value: "orion-pro", label: "Órion Pro" },
    { value: "altera-facil", label: "Altera Fácil" }
  ];

  const filteredGenerations = useMemo(() => {
    if (!selectedApp) return generations;
    return generations.filter((g) => {
      const slug = (g.agent_slug || "").toLowerCase();
      if (selectedApp === "ref") return slug.includes("ref");
      if (selectedApp === "hydra") return slug.includes("hydra");
      if (selectedApp === "enhance") return slug.includes("enhance");
      if (selectedApp === "design-builder") return slug.includes("design-builder") || slug.includes("design_builder") || slug === "" || !g.agent_slug;
      if (selectedApp === "orion-pro") return slug.includes("orion");
      if (selectedApp === "altera-facil") return slug.includes("altera");
      return slug === selectedApp.toLowerCase();
    });
  }, [generations, selectedApp]);

  // Ações de Seleção
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set(filteredGenerations.map((g) => g.id));
    setSelectedIds(all);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  // Ações de Favoritar e Upvote
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGenerations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextFav = !item.is_favorited;
          if (showToast) {
            showToast(nextFav ? "Adicionado aos favoritos!" : "Removido dos favoritos", "info");
          }
          return { ...item, is_favorited: nextFav };
        }
        return item;
      })
    );
  };

  const toggleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGenerations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextUp = !item.is_upvoted;
          const nextCount = (item.upvote_count || 0) + (nextUp ? 1 : -1);
          if (showToast) {
            showToast(nextUp ? "Voto adicionado!" : "Voto removido", "info");
          }
          return { ...item, is_upvoted: nextUp, upvote_count: Math.max(0, nextCount) };
        }
        return item;
      })
    );
  };

  // Excluir Geração Permanentemente
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const item = generations.find((g) => g.id === id);
    const targetUrl = item?.result_url || item?.thumbnail_url || "";
    const filename = targetUrl.split("/").pop() || "";

    // 1. Grava na lista negra permanente de excluídos
    addDeletedImage(id);
    if (targetUrl) addDeletedImage(targetUrl);
    if (filename) addDeletedImage(filename);

    // 2. Remove do Zustand useProjectStore e IDB
    useProjectStore.getState().deleteGaleriaImage(targetUrl || id);

    // 3. Aciona remoção física no backend
    fetch(`/api/bff/api/generations/${id}`, { method: "DELETE" }).catch(() => {});
    if (filename && (filename.endsWith(".png") || filename.endsWith(".avif") || filename.endsWith(".webp") || filename.endsWith(".jpg"))) {
      fetch(`/api/historico-imagens/${filename}`, { method: "DELETE" }).catch(() => {});
    }

    // 4. Atualiza estado e localStorage da Galeria
    setGenerations((prev) => {
      const next = prev.filter((it) => it.id !== id && it.result_url !== targetUrl);
      try {
        localStorage.setItem("zion_gallery_generations", JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (detailIndex !== null) {
      setDetailIndex(null);
    }
    if (showToast) {
      showToast("Geração excluída permanentemente.", "success");
    }
  };

  // Excluir em Lote Permanentemente
  const handleBatchDelete = () => {
    const toDelete = generations.filter((g) => selectedIds.has(g.id));
    toDelete.forEach((item) => {
      const targetUrl = item.result_url || item.thumbnail_url || "";
      const filename = targetUrl.split("/").pop() || "";
      addDeletedImage(item.id);
      if (targetUrl) addDeletedImage(targetUrl);
      if (filename) addDeletedImage(filename);

      useProjectStore.getState().deleteGaleriaImage(targetUrl || item.id);
      fetch(`/api/bff/api/generations/${item.id}`, { method: "DELETE" }).catch(() => {});
      if (filename && (filename.endsWith(".png") || filename.endsWith(".avif") || filename.endsWith(".webp") || filename.endsWith(".jpg"))) {
        fetch(`/api/historico-imagens/${filename}`, { method: "DELETE" }).catch(() => {});
      }
    });

    setGenerations((prev) => {
      const next = prev.filter((item) => !selectedIds.has(item.id));
      try {
        localStorage.setItem("zion_gallery_generations", JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    if (showToast) {
      showToast(`${selectedIds.size} artes excluídas permanentemente.`, "success");
    }
    clearSelection();
  };


  const handleSingleDownload = (item: GalleryItem, format: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCardDownloadId(null);
    setActiveCardMenuId(null);
    const url = item.result_url || item.thumbnail_url;
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = `zion_${item.agent_slug || "design"}_${Date.now()}.${format.toLowerCase()}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (showToast) {
      showToast(`Download em ${format.toUpperCase()} iniciado!`, "success");
    }
  };

  // Download em Lote
  const handleBatchDownload = () => {
    const selected = generations.filter((g) => selectedIds.has(g.id));
    selected.forEach((item, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = item.result_url || item.thumbnail_url;
        a.download = `geracao_${item.agent_slug}_${idx + 1}.avif`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 250);
    });
    if (showToast) {
      showToast(`Baixando ${selected.length} imagens...`, "info");
    }
  };

  // Reutilizar no Studio
  const handleReuse = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onOpenStudio(item.agent_slug, item.prompt, item.form_data);
    if (showToast) {
      showToast(`Parâmetros de "${item.agent_name}" carregados no Studio!`, "success");
    }
  };

  // Adaptador para GaleriaDetailModal
  const modalCards: GaleriaCardItem[] = useMemo(() => {
    return filteredGenerations.map((g, idx) => ({
      id: g.id,
      index: idx,
      aspect: g.dimensions,
      app: g.agent_name,
      src: g.result_url || g.thumbnail_url,
      fallback: g.fallback_url || g.thumbnail_url,
      date: g.date_formatted,
      resolution: g.dimensions === "9:16" ? "1080x1920" : "2160x2700",
      prompt: g.prompt,
      isFavorited: g.is_favorited,
      isLiked: g.is_upvoted
    }));
  }, [filteredGenerations]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-black relative w-full lg:-ml-[60px] lg:w-[calc(100%+60px)]">
      {/* Orb de Iluminação Violeta de app.designbuilder.co */}
      <div className="absolute top-0 left-[30%] w-[500px] h-[500px] bg-brand-violet/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Área Principal com Scroll */}
      <main className="flex-1 overflow-y-auto z-10 relative custom-scrollbar">
        {/* Sticky Header Oficial de Galeria (Chunk 856969) */}
        <div className="sticky top-0 z-20 border-b border-white/[0.03] bg-black/60 backdrop-blur-xl pl-4 lg:pl-[84px] pr-4 lg:pr-6 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] lg:pt-4">
          {selectionMode ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {selectedIds.size} selecionados de {filteredGenerations.length}
              </span>
              <div className="flex items-center gap-2">
                {selectedIds.size < filteredGenerations.length && (
                  <button
                    type="button"
                    onClick={selectAll}
                    className="rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    Selecionar todos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20 transition-colors cursor-pointer"
                >
                  Limpar seleção
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none max-lg:flex-wrap max-lg:gap-y-2 max-lg:overflow-x-visible">
              <h1 className="text-lg max-lg:text-base font-medium tracking-tight text-white shrink-0">
                Minhas gerações
              </h1>

              {/* Filtro de Apps Dropdown Oficial */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative">
                  <button
                    ref={appFilterButtonRef}
                    type="button"
                    onClick={() => {
                      if (!isAppDropdownOpen && appFilterButtonRef.current) {
                        const rect = appFilterButtonRef.current.getBoundingClientRect();
                        setDropdownPos({ top: rect.bottom + 6, left: rect.left });
                      }
                      setIsAppDropdownOpen(!isAppDropdownOpen);
                    }}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-200 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <span>
                      {appOptions.find((o) => o.value === selectedApp)?.label || "Todos os Apps"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-zinc-400" />
                  </button>

                  {isAppDropdownOpen && (
                    <div
                      ref={appDropdownMenuRef}
                      className="fixed z-[9999] max-h-[280px] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/60"
                      style={{
                        top: `${dropdownPos.top}px`,
                        left: `${dropdownPos.left}px`,
                        width: "180px",
                        animation: "150ms ease-out 0s 1 normal none running dropdown-in"
                      }}
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp("");
                            setIsAppDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${
                            selectedApp === "" ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-all ${
                              selectedApp === ""
                                ? "border-violet-500 bg-violet-500"
                                : "border-zinc-600"
                            }`}
                          >
                            {selectedApp === "" && (
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
                                className="lucide lucide-check h-2.5 w-2.5 text-white"
                                aria-hidden="true"
                              >
                                <path d="M20 6 9 17l-5-5"></path>
                              </svg>
                            )}
                          </span>
                          <span className="truncate">Todos os Apps</span>
                        </button>
                        <div className="mx-2.5 my-0.5 border-t border-white/5"></div>
                      </div>

                      {appOptions
                        .filter((o) => o.value !== "")
                        .map((opt) => {
                          const isSelected = selectedApp === opt.value;
                          return (
                            <div key={opt.value}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedApp(opt.value);
                                  setIsAppDropdownOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${
                                  isSelected ? "text-white" : "text-zinc-400"
                                }`}
                              >
                                <span
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-all ${
                                    isSelected
                                      ? "border-violet-500 bg-violet-500"
                                      : "border-zinc-600"
                                  }`}
                                >
                                  {isSelected && (
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
                                      className="lucide lucide-check h-2.5 w-2.5 text-white"
                                      aria-hidden="true"
                                    >
                                      <path d="M20 6 9 17l-5-5"></path>
                                    </svg>
                                  )}
                                </span>
                                <span className="truncate">{opt.label}</span>
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {selectedApp && (
                  <button
                    type="button"
                    onClick={() => setSelectedApp("")}
                    className="rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectionMode(!selectionMode)}
                  className="rounded-full border border-white/10 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Selecionar
                </button>
              </div>

              <span className="ml-auto text-xs text-zinc-500 shrink-0 whitespace-nowrap">
                {filteredGenerations.length} imagens
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo da Galeria Masonry */}
        <div className="w-full group/gallery relative focus-within:ring-0 outline-none lg:pl-[60px] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          {filteredGenerations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <ImageOff className="h-7 w-7 text-zinc-600" />
              </div>
              <h3 className="text-sm font-medium text-zinc-300">Nenhuma geração encontrada</h3>
              <p className="text-xs text-zinc-600 mt-1">
                {selectedApp ? "Tente remover os filtros" : "Comece gerando sua primeira imagem"}
              </p>
            </div>
          ) : (
            <div className="p-3 pb-12">
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
                {filteredGenerations.map((item, idx) => {
                  const isSelected = selectedIds.has(item.id);
                  const isFav = !!item.is_favorited;
                  const isUp = !!item.is_upvoted;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (selectionMode) {
                          toggleSelect(item.id, { stopPropagation: () => {} } as any);
                        } else {
                          setDetailIndex(idx);
                        }
                      }}
                      className={`break-inside-avoid group relative w-full overflow-hidden rounded-2xl bg-zinc-900/60 border text-left cursor-pointer transition-all duration-300 mb-3 ${
                        isSelected
                          ? "border-violet-500 ring-2 ring-violet-500/50 shadow-lg shadow-violet-600/20"
                          : "border-white/[0.06] hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-600/10"
                      }`}
                    >
                      {/* Container com Aspect Ratio */}
                      <div
                        className={`relative w-full bg-zinc-950 overflow-hidden ${
                          item.dimensions === "9:16"
                            ? "aspect-[9/16]"
                            : item.dimensions === "1:1"
                            ? "aspect-square"
                            : "aspect-[4/5]"
                        }`}
                      >
                        <img
                          alt={`Geração ${item.agent_name}`}
                          loading="lazy"
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          src={item.thumbnail_url || item.result_url}
                          onError={(e) => {
                            if (item.fallback_url && e.currentTarget.src !== item.fallback_url) {
                              e.currentTarget.src = item.fallback_url;
                            }
                          }}
                        />

                        {/* Checkbox de Seleção */}
                        {selectionMode && (
                          <div
                            onClick={(e) => toggleSelect(item.id, e)}
                            className="absolute top-2.5 left-2.5 z-30 flex h-6 w-6 items-center justify-center rounded-lg border bg-black/60 backdrop-blur-md transition-all cursor-pointer"
                            style={{
                              borderColor: isSelected ? "#8b5cf6" : "rgba(255,255,255,0.3)",
                              backgroundColor: isSelected ? "#8b5cf6" : "rgba(0,0,0,0.6)"
                            }}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                        )}

                        {/* Overlay no Hover com Ações Oficiais */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col justify-between p-3 pointer-events-none">
                          {/* Top Right: Reutilizar, Download c/ Opções, Favoritar, Mais Opções (...), Excluir */}
                          <div className="flex items-center justify-end gap-1.5 pointer-events-auto">
                            <button
                              type="button"
                              title="Reutilizar no Studio"
                              onClick={(e) => handleReuse(item, e)}
                              className="flex items-center gap-1 rounded-full bg-violet-600/90 hover:bg-violet-500 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-all shadow-md cursor-pointer active:scale-95"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Reutilizar</span>
                            </button>

                            {/* Botão Download com Dropdown de Opções */}
                            <div className="relative">
                              <button
                                type="button"
                                title="Opções de Download"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCardDownloadId(activeCardDownloadId === item.id ? null : item.id);
                                  setActiveCardMenuId(null);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>

                              {activeCardDownloadId === item.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-white/10 bg-zinc-950/95 p-1 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-100"
                                >
                                  <p className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Baixar formato</p>
                                  {["PNG", "JPEG", "WebP", "AVIF"].map((fmt) => (
                                    <button
                                      key={fmt}
                                      type="button"
                                      onClick={(e) => handleSingleDownload(item, fmt, e)}
                                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    >
                                      <span>{fmt}</span>
                                      <Download className="h-3 w-3 text-zinc-500" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Botão Três Pontinhos (...) com Menu de Opções Completo */}
                            <div className="relative">
                              <button
                                type="button"
                                title="Mais opções"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCardMenuId(activeCardMenuId === item.id ? null : item.id);
                                  setActiveCardDownloadId(null);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all cursor-pointer"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>

                              {activeCardMenuId === item.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-100"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      handleReuse(item, e);
                                      setActiveCardMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-violet-400" />
                                    <span>Reutilizar no Studio</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCardMenuId(null);
                                      setActiveCardDownloadId(item.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>Baixar imagem...</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      useProjectStore.getState().setSujeitoBase64(item.result_url || item.thumbnail_url);
                                      setActiveCardMenuId(null);
                                      if (showToast) showToast("Definido como referência do sujeito no Studio!", "success");
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                    <span>Usar como imagem base</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(window.location.origin + (item.result_url || item.thumbnail_url));
                                      setActiveCardMenuId(null);
                                      if (showToast) showToast("Link copiado para a área de transferência!", "success");
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Share2 className="h-3.5 w-3.5 text-blue-400" />
                                    <span>Copiar link</span>
                                  </button>
                                  <div className="h-px bg-white/10 my-1" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      handleDelete(item.id, e);
                                      setActiveCardMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors cursor-pointer text-left"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                    <span>Excluir permanentemente</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              title="Favoritar"
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className={`flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all cursor-pointer ${
                                isFav ? "text-pink-400 bg-black/80" : "text-white/80 hover:text-pink-400 hover:bg-black/80"
                              }`}
                            >
                              <Heart className="h-3.5 w-3.5" fill={isFav ? "currentColor" : "none"} />
                            </button>

                            <button
                              type="button"
                              title="Curtir"
                              onClick={(e) => toggleUpvote(item.id, e)}
                              className={`flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all cursor-pointer ${
                                isUp ? "text-violet-300 bg-black/80" : "text-white/80 hover:text-violet-300 hover:bg-black/80"
                              }`}
                            >
                              <ArrowBigUp className="h-4 w-4" fill={isUp ? "currentColor" : "none"} />
                            </button>

                            <button
                              type="button"
                              title="Excluir"
                              onClick={(e) => handleDelete(item.id, e)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-red-400 hover:bg-black/80 backdrop-blur-sm transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Bottom Badges: App & Formato */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                                {item.agent_name}
                              </span>
                              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md">
                                {item.dimensions}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 shrink-0 drop-shadow-sm">
                              {item.date_formatted.split("às")[0].trim()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Barra Flutuante de Ações em Lote */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/95 backdrop-blur-xl px-5 py-2.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <span className="text-xs font-semibold text-white">
            {selectedIds.size} selecionado{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={handleBatchDownload}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Baixar
          </button>
          <button
            type="button"
            onClick={handleBatchDelete}
            className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
        </div>
      )}

      {/* Modal de Detalhes da Geração Oficial */}
      {detailIndex !== null && modalCards[detailIndex] && (
        <GaleriaDetailModal
          isOpen={detailIndex !== null}
          onClose={() => setDetailIndex(null)}
          cards={modalCards}
          currentIndex={detailIndex}
          onNavigate={(newIdx) => setDetailIndex(newIdx)}
          onReuseSettings={(card) => {
            const item = filteredGenerations[card.index];
            if (item) {
              handleReuse(item);
              setDetailIndex(null);
            }
          }}
          onShareCommunity={(card) => {
            if (showToast) {
              showToast("Arte publicada no Feed da Comunidade!", "success");
            }
          }}
          onToggleFavorite={(cardId) => toggleFavorite(cardId)}
          onToggleLike={(cardId) => toggleUpvote(cardId)}
          onDelete={(cardId) => handleDelete(cardId)}
          onOpenApp={(appSlug) => {
            onOpenStudio(appSlug);
            setDetailIndex(null);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default GaleriaManager;
