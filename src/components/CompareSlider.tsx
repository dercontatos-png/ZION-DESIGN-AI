import React, { useState, useRef, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";

export function CompareSlider({ before, after }: { before: string; after: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden flex items-center justify-center bg-black touch-none cursor-ew-resize"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        {/* After image (background) */}
        <img src={after} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="After" draggable={false} />
        
        {/* Before image (clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img src={before} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Before" draggable={false} />
        </div>
        
        {/* Slider line & handle */}
        <div 
          className="absolute inset-y-0 w-0.5 bg-amber-500 pointer-events-none z-10 flex items-center justify-center"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-8 h-8 rounded-full bg-black shadow-xl flex items-center justify-center border-2 border-amber-500">
            <MoveHorizontal size={14} className="text-amber-500" />
          </div>
        </div>
        
        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/5 text-white font-black tracking-widest text-[10px] uppercase z-10 pointer-events-none">Antes</div>
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-500/20 backdrop-blur-md rounded-lg border border-amber-500/50 text-amber-500 font-black tracking-widest text-[10px] uppercase z-10 pointer-events-none">Depois (Refinado)</div>
      </div>
    </div>
  );
}
