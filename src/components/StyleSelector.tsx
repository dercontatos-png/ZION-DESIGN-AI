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
          className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200"
          style={{ backgroundColor: enableEstiloVisual ? "#ad8330" : "" }}
        >
          <div
            className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
            style={{ transform: enableEstiloVisual ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>

      {enableEstiloVisual && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {styleOptions.map((opt) => {
            const isSelected = store.estilosVisuais.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => handleStyleClick(opt)}
                className={`px-3 py-2 rounded-full border text-[10px] font-black transition-all duration-300 uppercase tracking-wider cursor-pointer ${
                  isSelected
                    ? "bg-[#ad8330] border-[#ad8330] text-black ring-1 ring-[#ad8330]"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#ad8330]/20 hover:bg-zinc-900/80"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
