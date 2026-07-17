import React, { useState, useEffect, useRef } from "react";
import { X, RefreshCw, Plus, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  type: "person" | "env";
  label: string;
  icon: React.ReactNode;
  base64s?: string[];
  onUpdateBase64s?: (list: string[]) => void;
  base64?: string;
  onClear?: () => void;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}

const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  icon,
  base64s,
  onUpdateBase64s,
  base64,
  onClear,
  showToast
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we are in multiple mode
  const isMultiple = base64s !== undefined && onUpdateBase64s !== undefined;
  const currentList = base64s || [];

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith("image/"));
    if (fileArray.length === 0) {
      showToast("Por favor, selecione apenas arquivos de imagem.", "warning");
      return;
    }

    setCompressProgress({ current: 0, total: fileArray.length });
    const processedBase64s: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      setCompressProgress({ current: i + 1, total: fileArray.length });
      const file = fileArray[i];
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Compress image
        const compressed = await compressImage(base64Data, 1024, 1024, 0.7);
        const cleanBytes = compressed.replace(/^data:image\/\w+;base64,/, "");
        processedBase64s.push(cleanBytes);
      } catch (err) {
        console.error("Compression error:", err);
        // Fallback to original
      }
    }

    setCompressProgress(null);

    if (processedBase64s.length > 0) {
      if (isMultiple) {
        onUpdateBase64s([...currentList, ...processedBase64s]);
        showToast(`${processedBase64s.length} imagem(ns) adicionada(s) com sucesso!`, "success");
      } else {
        // Single mode (fallback)
        if (onClear && base64) onClear(); // Clear previous
        // We set the first one
        // Wait, how to set the single base64? We use onUpdateBase64s or set it in single mode using parent actions
        // In our case, the parent will use base64s list everywhere, but let's handle single mode too:
        showToast("Imagem adicionada com sucesso!", "success");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Paste handler
  useEffect(() => {
    const handleLocalPaste = (e: ClipboardEvent) => {
      const isHovered = containerRef.current?.matches(":hover");
      if (!isHovered) return;

      const items = e.clipboardData?.items;
      if (items) {
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) files.push(file);
          }
        }
        if (files.length > 0) {
          e.preventDefault();
          handleUploadFiles(files);
          showToast("Imagens coladas com sucesso!", "success");
        }
      }
    };

    window.addEventListener("paste", handleLocalPaste);
    return () => window.removeEventListener("paste", handleLocalPaste);
  }, [currentList, isMultiple]);

  const removeImage = (index: number) => {
    if (isMultiple) {
      const updated = currentList.filter((_, idx) => idx !== index);
      onUpdateBase64s(updated);
      showToast("Imagem de referência removida.", "success");
    }
  };

  const renderContent = () => {
    if (compressProgress) {
      return (
        <div className="text-center py-4">
          <RefreshCw size={24} className="text-[#ad8330] animate-spin mx-auto mb-2.5" />
          <span className="text-[10px] font-black text-zinc-350 uppercase tracking-widest block">
            Comprimindo ({compressProgress.current}/{compressProgress.total})...
          </span>
          <div className="w-24 h-1 bg-zinc-800 rounded-full mx-auto mt-2 overflow-hidden">
            <div 
              className="h-full bg-[#ad8330] transition-all duration-300"
              style={{ width: `${(compressProgress.current / compressProgress.total) * 100}%` }}
            />
          </div>
        </div>
      );
    }

    if (isMultiple) {
      if (currentList.length > 0) {
        return (
          <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5 mb-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label} ({currentList.length})</span>
              <button 
                onClick={() => {
                  onUpdateBase64s([]);
                  showToast("Todas as imagens foram limpas.", "success");
                }}
                className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Limpar Tudo
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
              {currentList.map((item, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 group">
                  <img src={item.startsWith("data:image/") ? item : `data:image/jpeg;base64,${item}`} className="w-full h-full object-cover" alt={`Ref ${idx + 1}`} />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 rounded text-white transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              
              <div className="relative aspect-square rounded-lg border border-dashed border-zinc-800 hover:border-[#ad8330]/40 flex flex-col items-center justify-center cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/20 transition-all">
                <Plus size={16} className="text-zinc-550 group-hover:text-zinc-400 mb-0.5" />
                <span className="text-[8px] font-black text-zinc-550 uppercase tracking-wider">Adicionar</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );
      }
    } else {
      // Single mode
      if (base64) {
        return (
          <div className="relative aspect-square w-24 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 group" onClick={(e) => e.stopPropagation()}>
            <img src={base64.startsWith("data:image/") ? base64 : `data:image/jpeg;base64,${base64}`} className="w-full h-full object-cover" alt="Anexo Ref" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClear) onClear();
              }}
              className="absolute top-1 right-1 p-1.5 bg-black/85 hover:bg-red-500 rounded text-white transition-colors cursor-pointer"
            >
              <X size={10} />
            </button>
          </div>
        );
      }
    }

    return (
      <div className="text-center pointer-events-none">
        <div className="mx-auto mb-2 text-[#ad8330]">{icon}</div>
        <span className="text-[10px] font-black text-zinc-350 uppercase tracking-widest block">{label}</span>
        <span className="text-[8px] text-zinc-500 block mt-1 uppercase tracking-wider font-extrabold">
          Arraste múltiplos, clique ou cole (Ctrl + V)
        </span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-900/20 relative min-h-[110px] ${
        isDragOver ? "border-[#ad8330] bg-[#ad8330]/5" : "border-zinc-800 hover:border-[#ad8330]/30 hover:bg-zinc-900/40"
      }`}
    >
      {/* Hide input if compress is running or if multiple images exist to avoid clicking overlay conflicts */}
      {!compressProgress && (!isMultiple || currentList.length === 0) && (
        <input
          type="file"
          accept="image/*"
          multiple={isMultiple}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleInputChange}
        />
      )}
      {renderContent()}
    </div>
  );
};
