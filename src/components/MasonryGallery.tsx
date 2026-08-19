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
      <div className="py-5 text-center border border-dashed border-white/5 rounded-xl bg-black/20">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Nenhuma imagem gerada ainda</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid size={12} className="text-zinc-600" />
          <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Galeria de Visualizações</span>
        </div>
        <button
          onClick={() => {
            store.setGaleriaImages([]);
            showToast("Galeria local de visualizações limpa!", "success");
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/5 bg-black/60 hover:bg-red-950/20 hover:text-red-500 text-zinc-500 text-[9px] font-black uppercase tracking-wider transition-all"
        >
          <Trash2 size={11} />
          <span>Limpar Galeria</span>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto custom-scrollbar p-1 pb-3 items-center">
        {store.galeriaImages.map((img, index) => {
          const isActive = index === store.activeImageIndex;
          return (
            <div
              key={index}
              onClick={() => store.setActiveImageIndex(index)}
              className={`relative rounded-lg overflow-hidden cursor-pointer shrink-0 transition-all group ${
                isActive ? "scale-[1.02] shadow-xl opacity-100" : "opacity-50 hover:opacity-80"
              }`}
              style={{
                width: "80px",
                height: "80px",
              }}
            >
              <img src={img} className="w-full h-full object-contain" alt={`Thumb ${index}`} />
              
              {/* Overlay Glassmorphism */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-1.5">
                <a
                  href={img}
                  download={`Zion_Galeria_Item_${index + 1}_${(store.dimensao || "1x1").replace(":", "x")}_${store.resolucao || "HD"}.${(() => {
                    const m = /^data:image\/(png|jpeg|webp|avif|gif)/.exec(img);
                    return m ? (m[1] === "jpeg" ? "jpg" : m[1]) : exportFormat.toLowerCase();
                  })()}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-black/85 hover:bg-[#c99b3b] hover:text-black border border-white/5 hover:border-[#c99b3b] rounded-lg text-zinc-300 transition-all shadow-xl"
                  title={`Baixar em ${store.resolucao}`}
                >
                  <Download size={12} />
                </a>

                {/* Botão de Excluir Imagem Individual */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    store.setGaleriaImages((prev: string[]) => {
                      const next = prev.filter((_, idx) => idx !== index);
                      if (store.activeImageIndex >= next.length) {
                        store.setActiveImageIndex(Math.max(0, next.length - 1));
                      }
                      return next;
                    });
                    showToast("Imagem excluída da galeria!", "success");
                  }}
                  className="p-2 bg-black/85 hover:bg-red-950 hover:text-red-500 border border-white/5 hover:border-red-500/30 rounded-lg text-zinc-400 transition-all shadow-xl"
                  title="Excluir imagem"
                >
                  <Trash2 size={12} />
                </button>
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
