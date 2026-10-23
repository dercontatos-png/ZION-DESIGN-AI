import React, { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  Sparkles,
  Eye,
  ArrowUpRight,
  ArrowLeft,
  Layers,
  Camera,
  Sliders,
  Flame,
  X,
  Zap,
  Tag
} from "lucide-react";
import promptsData from "../data/prompts24.json";

export interface PromptItem {
  index: number;
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image_url: string;
  image_width: number;
  image_height: number;
  public_view_count: number;
  public_copy_count: number;
  prompts_reference_required: boolean;
  prompt: string;
}

interface PromptsGalleryProps {
  onOpenStudio?: (agentSlug?: string, prompt?: string) => void;
  onGoHome?: () => void;
}

export const PromptsGallery: React.FC<PromptsGalleryProps> = ({
  onOpenStudio,
  onGoHome,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [activePrompt, setActivePrompt] = useState<PromptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedResult, setSynthesizedResult] = useState<string | null>(null);
  const [adaptationInput, setAdaptationInput] = useState("");

  const prompts: PromptItem[] = promptsData as PromptItem[];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    prompts.forEach((p) => cats.add(p.category));
    return ["todos", ...Array.from(cats)];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      const matchCat =
        selectedCategory === "todos" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        search.trim() === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        p.prompt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [prompts, selectedCategory, search]);

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenStudioWithPrompt = (promptItem: PromptItem) => {
    let slug = "orion-pro";
    if (promptItem.category === "produto" || promptItem.category === "gastronomia") {
      slug = "product-builder-v2";
    }
    if (onOpenStudio) {
      onOpenStudio(slug, promptItem.prompt);
    }
  };

  const handleSynthesizeAdaptation = async () => {
    if (!activePrompt || !adaptationInput.trim()) return;
    setIsSynthesizing(true);
    setSynthesizedResult(null);

    try {
      const res = await fetch("/api/bff/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_type: "nlp-copywriting",
          prompt: `Adapt this 15-layer master prompt for the new subject: "${adaptationInput.trim()}". Preserve all camera optics, 15-layer structure, lighting physics and optical behaviors intact.\n\nORIGINAL PROMPT:\n${activePrompt.prompt.substring(0, 3000)}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.text || data.result || data.output || "";
        if (text) {
          setSynthesizedResult(text);
        } else {
          fallbackLocalSynthesize();
        }
      } else {
        fallbackLocalSynthesize();
      }
    } catch {
      fallbackLocalSynthesize();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const fallbackLocalSynthesize = () => {
    if (!activePrompt) return;
    const generated = `SWAP SLOT — Image 1 is the subject reference. Take from it only: "${adaptationInput.trim()}". Keep all framing, 85mm optical perspective, 3:1 lighting ratio and 15-layer physics map intact.\n\n${activePrompt.prompt.replace(activePrompt.title, adaptationInput.trim())}`;
    setSynthesizedResult(generated);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-white overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-purple-950/20 via-zinc-900/50 to-transparent px-6 py-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-4 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Voltar para o Início
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {prompts.length} Prompts Oficiais Extraídos (15 Camadas de Engenharia Reversa)
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                Galeria Mestre de Prompts
              </h1>
              <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl">
                Extraídos diretamente de <code className="text-purple-400">prompts.designbuilder.co</code>. 
                Cada prompt possui entre 12.000 e 20.000 caracteres de óptica, anatomia muscular e iluminação 
                cinematográfica para eliminar o aspecto plástico de IA.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-3 text-right">
                <div className="text-xs text-zinc-500 font-medium">Fórmula Ativa</div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  15 Camadas Ópticas
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por conceito, alimento, retrato, iluminação..."
                className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                        : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 w-full flex-1">
        <div className="flex items-center justify-between mb-6 text-xs text-zinc-400">
          <span>Mostrando <strong>{filteredPrompts.length}</strong> prompts de alta fidelidade</span>
          <span>Proporção Oficial: 4:5 / 1:1</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrompts.map((item) => {
            const isCopied = copiedId === item.id;
            const charCountK = (item.prompt.length / 1000).toFixed(1);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl bg-zinc-900/70 border border-white/10 overflow-hidden hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-950/20 transition-all duration-300"
              >
                {/* Image Container with aspect ratio 4:5 */}
                <div
                  className="relative aspect-[4/5] bg-zinc-950 overflow-hidden cursor-pointer"
                  onClick={() => setActivePrompt(item)}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

                  {/* Badge Category & Index */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
                      #{String(item.index).padStart(2, "0")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  {/* Char count badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {charCountK}k chars
                    </span>
                  </div>

                  {/* Quick inspect overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs shadow-2xl">
                      <Eye className="w-3.5 h-3.5" />
                      Ver Fórmula Completa
                    </span>
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setActivePrompt(item)}
                      className="text-sm font-bold text-white line-clamp-1 hover:text-purple-400 cursor-pointer transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.prompt.substring(0, 160).replace(/SWAP SLOT.*?—/g, "")}...
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.prompt, item.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar Prompt
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenStudioWithPrompt(item)}
                      title="Abrir no Estúdio Oficial"
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Full Prompt Inspection & AI Synthesis */}
      {activePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                  #{String(activePrompt.index).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    {activePrompt.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    <span className="capitalize text-purple-400">{activePrompt.category}</span>
                    <span>•</span>
                    <span>{activePrompt.prompt.length.toLocaleString()} caracteres</span>
                    <span>•</span>
                    <span className="text-emerald-400">15 Camadas de Física</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePrompt(null);
                  setSynthesizedResult(null);
                  setAdaptationInput("");
                }}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Preview & Key Metadata */}
              <div className="flex flex-col md:flex-row gap-6 items-center bg-zinc-900/60 p-4 rounded-xl border border-white/10">
                <img
                  src={activePrompt.image_url}
                  alt={activePrompt.title}
                  className="w-32 h-40 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1 space-y-2 text-xs">
                  <div className="font-semibold text-white">Estrutura de Captura:</div>
                  <div className="grid grid-cols-2 gap-2 text-zinc-400">
                    <div>Lente: <span className="text-white">85mm f/1.8 Prime</span></div>
                    <div>Sensor: <span className="text-white">Full-Frame 35mm</span></div>
                    <div>Proporção: <span className="text-white">4:5 Vertical</span></div>
                    <div>Iluminação: <span className="text-white">Octabox 120cm + Rim Light</span></div>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {activePrompt.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-zinc-400 border border-white/5">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Adaptation Input Box */}
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Adaptar para seu produto ou modelo com Google AI Studio
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adaptationInput}
                    onChange={(e) => setAdaptationInput(e.target.value)}
                    placeholder="Ex: Frasco de perfume masculino em pedra vulcânica molhada..."
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSynthesizeAdaptation}
                    disabled={isSynthesizing || !adaptationInput.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSynthesizing ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Sintetizar
                  </button>
                </div>

                {synthesizedResult && (
                  <div className="mt-4 p-3 rounded-lg bg-zinc-950 border border-emerald-500/30">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                      <span>✓ Prompt Sintetizado na Fórmula Invisível:</span>
                      <button
                        onClick={() => handleCopy(synthesizedResult, "synthesized")}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copiar Adaptado
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {synthesizedResult}
                    </pre>
                  </div>
                )}
              </div>

              {/* Full Original Prompt View */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Prompt Original de Produção
                  </span>
                  <button
                    onClick={() => handleCopy(activePrompt.prompt, activePrompt.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    {copiedId === activePrompt.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Tudo
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 font-mono text-xs text-zinc-300 leading-relaxed max-h-96 overflow-y-auto select-text whitespace-pre-wrap">
                  {activePrompt.prompt}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-zinc-950 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setActivePrompt(null);
                  setSynthesizedResult(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => handleCopy(activePrompt.prompt, activePrompt.id)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Prompt
              </button>
              <button
                onClick={() => {
                  handleOpenStudioWithPrompt(activePrompt);
                  setActivePrompt(null);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                Abrir no Estúdio Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptsGallery;
