import React, { useRef, useState, useEffect } from 'react';

interface InpaintCanvasProps {
  imageUrl: string;
  brushSize: number;
  brushMode: 'draw' | 'erase';
  onSaveMask: (maskBase64: string) => void;
  onClear: () => void;
}

export const InpaintCanvas: React.FC<InpaintCanvasProps> = ({
  imageUrl,
  brushSize,
  brushMode,
  onSaveMask,
  onClear
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update canvas size on image load/resize
  const updateDimensions = () => {
    if (imageRef.current) {
      const { clientWidth, clientHeight } = imageRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize canvas overlay setup when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Clear canvas with black background (represents unmasked areas in inpainting)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [dimensions]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineWidth = brushSize;
      // Drawing mode: White color = Masked area. Erase mode: Black color = Keep original.
      ctx.strokeStyle = brushMode === 'draw' ? '#ffffff' : '#000000';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    exportMask();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      exportMask();
    }
    onClear();
  };

  const exportMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export base64 of the black & white mask image
    const dataUrl = canvas.toDataURL('image/png');
    onSaveMask(dataUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div ref={containerRef} className="relative border border-white/5 rounded-xl overflow-hidden bg-black flex items-center justify-center max-w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Inpainting editor"
          className="max-h-[400px] object-contain pointer-events-none"
          onLoad={updateDimensions}
        />
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 cursor-crosshair mix-blend-screen opacity-50"
          style={{ width: dimensions.width, height: dimensions.height }}
        />
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-[#111] hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold border border-white/5 transition-colors"
        >
          Limpar Pintura
        </button>
        <span className="text-[10px] text-zinc-500 italic">
          (Pinte de branco a área a ser modificada)
        </span>
      </div>
    </div>
  );
};
