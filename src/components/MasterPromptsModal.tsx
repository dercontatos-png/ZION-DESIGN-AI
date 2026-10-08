import React, { useState, useMemo } from "react";
import { DESIGN_BUILDER_MASTER_PROMPTS, DesignBuilderPromptItem } from "../data/designBuilderMasterPrompts";

interface MasterPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (item: DesignBuilderPromptItem) => void;
}

export const MasterPromptsModal: React.FC<MasterPromptsModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPrompt, setSelectedPrompt] = useState<DesignBuilderPromptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    DESIGN_BUILDER_MASTER_PROMPTS.forEach((p) => {
      const cat = p.category || "Outros";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const filteredPrompts = useMemo(() => {
    return DESIGN_BUILDER_MASTER_PROMPTS.filter((p) => {
      const matchesCat =
        selectedCategory === "all" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "marcal" &&
          (p.title.toLowerCase().includes("marçal") || p.prompt.toLowerCase().includes("marçal")));

      if (!matchesCat) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.tags?.some((t) => t.toLowerCase().includes(term)) ||
        p.prompt?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, selectedCategory]);

  const handleCopy = (e: React.MouseEvent, item: DesignBuilderPromptItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApply = (item: DesignBuilderPromptItem) => {
    if (onSelectPrompt) {
      onSelectPrompt(item);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[90vh] bg-zinc-900 border border-zinc-700/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Biblioteca Oficial de Master Prompts
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {DESIGN_BUILDER_MASTER_PROMPTS.length} Modelos Pro
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Arquitetura de prompts avançada com calibração óptica, iluminação física e torque biomecânico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Category Filters */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, nicho, tag ou prompt..."
              className="w-full bg-zinc-950/80 border border-zinc-700/60 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20"
                  : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              Todos ({DESIGN_BUILDER_MASTER_PROMPTS.length})
            </button>
            <button
              onClick={() => setSelectedCategory("marcal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === "marcal"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md"
                  : "bg-zinc-800/80 text-blue-400 hover:bg-zinc-800 border border-blue-500/30"
              }`}
            >
              🔥 Série Marçal (5)
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {cat} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Content Area: Grid + Preview Drawer */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* List / Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-500 text-sm">
                <span className="text-3xl mb-2">🔍</span>
                Nenhum prompt encontrado para a busca atual.
              </div>
            ) : (
              filteredPrompts.map((item) => {
                const isSelected = selectedPrompt?.id === item.id;
                const isMarcal = item.title.toLowerCase().includes("marçal");
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPrompt(item)}
                    className={`group relative rounded-xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-zinc-800/90 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10"
                        : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isMarcal
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {item.category || "Geral"}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {item.prompt.length.toLocaleString()} caracteres
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-[10px] text-zinc-600">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-auto">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, item)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        {copiedId === item.id ? "✓ Copiado" : "📋 Copiar"}
                      </button>

                      {onSelectPrompt && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(item);
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-colors shadow-sm"
                        >
                          Aplicar ✨
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details / Preview Panel (Desktop Side, Mobile Bottom) */}
          {selectedPrompt && (
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-none">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                    {selectedPrompt.category}
                  </span>
                  <button
                    onClick={() => setSelectedPrompt(null)}
                    className="text-zinc-500 hover:text-zinc-300 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {selectedPrompt.title}
                </h3>

                {selectedPrompt.description && (
                  <p className="text-xs text-zinc-300 mb-4 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                    {selectedPrompt.description}
                  </p>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-semibold">
                    <span>Estrutura do Master Prompt:</span>
                    <span>{selectedPrompt.prompt.length.toLocaleString()} caracteres</span>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-zinc-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                    {selectedPrompt.prompt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, selectedPrompt)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedId === selectedPrompt.id ? "✓ Prompt Copiado!" : "📋 Copiar Texto Completo"}
                </button>

                {onSelectPrompt && (
                  <button
                    type="button"
                    onClick={() => handleApply(selectedPrompt)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                  >
                    Usar Este Prompt 🚀
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
