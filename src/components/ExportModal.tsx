import React from 'react';
import { X, ZoomIn, ZoomOut, Download, RefreshCw, Maximize, Crop } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
  exportFormat: "AVIF" | "PNG" | "JPEG" | "WEBP";
  setExportFormat: (format: "AVIF" | "PNG" | "JPEG" | "WEBP") => void;
  zoomPercent: number;
  setZoomPercent: (zoom: number) => void;
  resolution: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  onClose, exportFormat, setExportFormat, zoomPercent, setZoomPercent, resolution 
}) => {
  return (
    <div className="absolute top-16 right-6 w-72 bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <span className="font-bold text-sm text-zinc-100">Exportar</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Design gerado em {resolution}</p>
        
        <div className="space-y-2">
          {[
            { id: "AVIF", label: "Otimização original" },
            { id: "PNG", label: "Sem perdas" },
            { id: "JPEG", label: "Alta qualidade" },
            { id: "WEBP", label: "Leve, otimizada" }
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setExportFormat(fmt.id as any)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                exportFormat === fmt.id 
                ? 'bg-[#ad8330]/10 border-[#ad8330] text-[#ad8330]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              <Download size={14} className={exportFormat === fmt.id ? 'text-[#ad8330]' : 'text-zinc-500'} />
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold">{fmt.id}</span>
                <span className={`text-[10px] ${exportFormat === fmt.id ? 'text-[#ad8330]/70' : 'text-zinc-500'}`}>{fmt.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3">Zoom</p>
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button 
              onClick={() => setZoomPercent(Math.max(10, zoomPercent - 10))}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-bold text-zinc-200">{zoomPercent}%</span>
            <button 
              onClick={() => setZoomPercent(Math.min(500, zoomPercent + 10))}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all group">
          <RefreshCw size={14} className="text-zinc-500 group-hover:text-[#ad8330]" />
          Recortar rosto
        </button>
      </div>
    </div>
  );
};
