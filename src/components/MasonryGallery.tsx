import React from "react";
import { Download, Trash2, Grid } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";

interface MasonryGalleryProps {
  exportFormat: string;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}

const MasonryGalleryComponent: React.FC<MasonryGalleryProps> = ({
  exportFormat,
  showToast
}) => {
  const store = useProjectStore();

  if (store.galeriaImages.length === 0) {
    return (
      <div className="py-5 text-center border border-dashed border-zinc-800/80 rounded-xl bg-zinc-900/10">
        <span className="text-[9px] font-black text-zinc-650 uppercase tracking-widest">Nenhuma imagem gerada nesta sessão</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid size={12} className="text-zinc-600" />
          <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Galeria Masonry</span>
        </div>

        <button
          onClick={() => {
            store.setGaleriaImages([]);
            showToast("Galeria local de visualizações limpa!", "success");
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-red-950/20 hover:text-red-500 text-zinc-500 text-[9px] font-black uppercase tracking-wider transition-all"
        >
          <Trash2 size={11} />
          <span>Limpar Galeria</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-36 custom-scrollbar p-0.5">
        {store.galeriaImages.map((img, index) => {
          const isActive = index === store.activeImageIndex;
          return (
            <div
              key={index}
              onClick={() => store.setActiveImageIndex(index)}
              className={`relative rounded-lg overflow-hidden border cursor-pointer aspect-square transition-all group ${
                isActive ? "border-[#ad8330] scale-[1.02] shadow shadow-[#ad8330]/5" : "border-zinc-800"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Thumb ${index}`} />
              
              {/* Overlay Glassmorphism */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-1.5">
                <a
                  href={img}
                  download={`zion-local-${index}-${store.resolucao}.${exportFormat.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-black/85 hover:bg-[#ad8330] hover:text-black border border-zinc-800 hover:border-[#ad8330] rounded-lg text-zinc-300 transition-all shadow-xl"
                  title={`Baixar em ${store.resolucao}`}
                >
                  <Download size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Envolver em React.memo para evitar re-renderizações desnecessárias ao digitar no formulário
export const MasonryGallery = React.memo(MasonryGalleryComponent);
