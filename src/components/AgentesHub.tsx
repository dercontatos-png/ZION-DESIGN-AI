import React from "react";
import { Bot, Sparkles, ArrowRight } from "lucide-react";

interface AgentesHubProps {
  onSelectAgent?: (slug: string) => void;
  onOpenStudio?: () => void;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const AgentesHub: React.FC<AgentesHubProps> = ({
  onSelectAgent,
  onOpenStudio,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-black text-white p-6 sm:p-10 flex flex-col items-center justify-center overscroll-contain select-none">
      <div className="max-w-xl w-full text-center space-y-6 my-auto py-12">
        {/* Ícone com aura */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-violet-600/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-violet-400 shadow-2xl">
            <Bot size={36} />
          </div>
        </div>

        {/* Badges de Topo */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 border border-white/10 text-zinc-400">
          <Sparkles size={13} className="text-amber-400" />
          <span>Ecossistema de Agentes</span>
          <span className="text-zinc-600">•</span>
          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Em breve</span>
        </div>

        {/* Título & Descrição */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Central de Agentes IA
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md mx-auto">
            Estamos desenvolvendo o ecossistema de agentes autônomos. Em breve novas integrações e assistentes estarão disponíveis aqui.
          </p>
        </div>

        {/* Ação Primária: Voltar ao Studio */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onOpenStudio}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-950/50 cursor-pointer"
          >
            <span>Voltar ao Studio</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentesHub;
