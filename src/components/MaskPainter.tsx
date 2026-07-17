import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eye, Check, X } from 'lucide-react';

interface MaskPainterProps {
  imageUrl: string;
  onConfirm: (maskBase64: string) => void;
  onCancel: () => void;
}

export const MaskPainter: React.FC<MaskPainterProps> = ({ imageUrl, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [showMask, setShowMask] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      if (canvasRef.current && containerRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!showMask) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !showMask || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Adjust for scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = 'rgba(173, 131, 48, 0.7)'; // Gold color for mask

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleConfirm = () => {
    if (canvasRef.current) {
      // Export mask as base64
      // We might need to convert it to a white/black mask or just send the RGBA
      const mask = canvasRef.current.toDataURL('image/png');
      onConfirm(mask);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col font-sans select-none">
      {/* Top Bar */}
      <div className="h-16 border-b border-zinc-800 bg-[#0f0f11] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3 text-zinc-100">
          <PenTool size={18} className="text-[#b8942b]" />
          <span className="font-bold text-sm tracking-wider uppercase">Pintar Área de Ajuste</span>
          
          <div className="ml-8 flex items-center gap-3">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Tamanho</span>
            <input 
              type="range" 
              min="5" 
              max="100" 
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#b8942b]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMask(!showMask)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border ${showMask ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'} transition-colors`}
            title="Mostrar/Esconder Máscara"
          >
            <Eye size={16} />
          </button>
          
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
          >
            <X size={14} /> Cancelar
          </button>

          <button 
            onClick={handleConfirm}
            className="px-6 py-2 bg-[#b8942b] hover:bg-[#c2963a] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
          >
            Confirmar
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#050505] relative p-8" ref={containerRef}>
        <div className="relative shadow-2xl" style={{
            maxWidth: '100%', 
            maxHeight: '100%', 
            aspectRatio: imageSize.width && imageSize.height ? `${imageSize.width}/${imageSize.height}` : 'auto',
            height: '100%'
        }}>
            <img 
              src={imageUrl} 
              alt="Base for mask" 
              className="w-full h-full object-contain pointer-events-none"
              style={{ display: 'block' }}
            />
            
            <canvas
              ref={canvasRef}
              width={imageSize.width}
              height={imageSize.height}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              style={{ opacity: showMask ? 1 : 0, touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
        </div>
      </div>
      
      {/* Bottom helper text */}
      <div className="h-12 border-t border-zinc-800 bg-[#0f0f11] flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-medium">
          <div className="w-2 h-2 rounded-full bg-[#b8942b]"></div>
          Pinte sobre as áreas que deseja regenerar ou substituir no background.
        </div>
      </div>
    </div>
  );
};
