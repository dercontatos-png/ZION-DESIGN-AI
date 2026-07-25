import React from "react";
import { useProjectStore } from "../store/useProjectStore";

const styleOptions = [
  "Clássico",
  "Formal",
  "Elegante",
  "Sexy",
  "Institucional",
  "Tecnológico",
  "Glassmorphism",
  "Interface UI",
  "Minimalista",
  "Lúdico",
  "Cartoon",
  "Infoproduto",
  "Jovial",
  "Gamer",
  "Retrato Profissional",
  "Ultra Realista",
  "Glow"
];

interface StyleSelectorProps {
  enableEstiloVisual: boolean;
  setEnableEstiloVisual: (val: boolean) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  enableEstiloVisual,
  setEnableEstiloVisual
}) => {
  const store = useProjectStore();

  const handleStyleClick = (style: string) => {
    if (store.estilosVisuais.includes(style)) {
      store.removeEstiloVisual(style);
    } else {
      store.addEstiloVisual(style);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-1">
        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Ativar Estilo Visual</span>
        <button
          onClick={() => setEnableEstiloVisual(!enableEstiloVisual)}
          className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
          style={{ backgroundColor: enableEstiloVisual ? "#c5a880" : "" }}
        >
          <div
            className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
            style={{ transform: enableEstiloVisual ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>

      {enableEstiloVisual && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap gap-2 py-2">
            {styleOptions.map((opt) => {
              const isSelected = store.estilosVisuais.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => handleStyleClick(opt)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all duration-200 uppercase tracking-wider cursor-pointer ${
                    isSelected
                      ? "bg-[#c5a880] border-[#c5a880] text-zinc-950 shadow-md shadow-amber-500/10"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#c5a880]/40 hover:bg-zinc-900/80"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Estilo Visual Customizado</span>
              <span className="text-[8px] text-zinc-500">Ex: Barroco, Cyberpunk distópico, 3D claymation...</span>
            </div>
            <input
              type="text"
              value={store.estiloVisualCustom || ""}
              onChange={(e) => store.updateConfig({ estiloVisualCustom: e.target.value })}
              placeholder="Descreva o estilo se não encontrar nas tags acima..."
              className="w-full bg-zinc-950/60 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#c5a880]/50 tracking-wide"
            />
          </div>
        </div>
      )}
    </div>
  );
};
