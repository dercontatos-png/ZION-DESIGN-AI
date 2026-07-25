import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eye, X, Eraser, RotateCcw, Trash2, Sparkles, Loader2, Wand2, PlusCircle, Palette, RefreshCw } from 'lucide-react';

interface MaskPainterProps {
  imageUrl: string;
  onConfirm: (maskBase64: string, promptText: string) => Promise<void> | void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const MaskPainter: React.FC<MaskPainterProps> = ({ imageUrl, onConfirm, onCancel, isProcessing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [showMask, setShowMask] = useState(true);
  const [isEraser, setIsEraser] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [promptText, setPromptText] = useState("");
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          // Save initial blank state to history
          const blank = ctx.getImageData(0, 0, img.width, img.height);
          setHistory([blank]);
        }
      }
    };
  }, [imageUrl]);

  const saveStateToHistory = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const currentData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory(prev => [...prev.slice(-15), currentData]); // max 15 steps
  };

  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const newHistory = [...history];
    newHistory.pop(); // remove current
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveStateToHistory();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!showMask || isProcessing) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.beginPath();
      }
      saveStateToHistory();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !showMask || !canvasRef.current || isProcessing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(235, 180, 50, 0.8)'; // Semi-transparent gold overlay
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const generateBlackWhiteMask = (): string => {
    if (!canvasRef.current || !imageSize.width || !imageSize.height) return "";
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = imageSize.width;
    exportCanvas.height = imageSize.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return "";

    // 1. Fill black background
    exportCtx.fillStyle = '#000000';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 2. Composite mask area as white
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageSize.width;
    tempCanvas.height = imageSize.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvasRef.current, 0, 0);
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, imageSize.width, imageSize.height);

      exportCtx.drawImage(tempCanvas, 0, 0);
    }

    return exportCanvas.toDataURL('image/png');
  };

  const handleConfirm = () => {
    if (!promptText.trim()) {
      alert("Por favor, escreva a instrução do que fazer na área pintada.");
      return;
    }
    const maskBase64 = generateBlackWhiteMask();
    onConfirm(maskBase64, promptText.trim());
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#09090b] flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Controls */}
      <div className="h-16 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center text-[#c5a880]">
            <PenTool size={16} />
          </div>
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wider uppercase">Pintar e Editar Área</h2>
            <p className="text-[10px] text-zinc-400 hidden sm:block">Selecione o local da imagem onde deseja fazer uma alteração com IA</p>
          </div>
        </div>

        {/* Center Brush Controls */}
        <div className="flex items-center gap-3 bg-zinc-900/80 border border-white/5 rounded-xl px-3 py-1.5">
          <button
            onClick={() => setIsEraser(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${!isEraser ? 'bg-[#c5a880] text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            title="Pincel"
          >
            <PenTool size={13} />
            <span className="hidden sm:inline">Pincel</span>
          </button>
          
          <button
            onClick={() => setIsEraser(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${isEraser ? 'bg-[#c5a880] text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
            title="Borracha"
          >
            <Eraser size={13} />
            <span className="hidden sm:inline">Borracha</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Tam:</span>
            <input 
              type="range" 
              min="8" 
              max="150" 
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 sm:w-28 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
            />
            <span className="text-[10px] font-mono text-amber-300 w-6">{brushSize}</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 disabled:opacity-40 rounded-lg transition-colors"
            title="Desfazer"
          >
            <RotateCcw size={15} />
          </button>

          <button 
            onClick={handleClear}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-red-400 hover:text-red-300 rounded-lg transition-colors"
            title="Limpar Pintura"
          >
            <Trash2 size={15} />
          </button>

          <button 
            onClick={() => setShowMask(!showMask)}
            className={`p-2 rounded-lg border transition-colors ${showMask ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
            title="Visualizar Máscara"
          >
            <Eye size={15} />
          </button>
          
          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded-lg transition-colors"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#050506] relative p-4 sm:p-8" ref={containerRef}>
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#c5a880]/30 border-t-[#c5a880] animate-spin"></div>
              <Wand2 size={24} className="text-[#c5a880] absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Processando Edição na Área Pintada...</h3>
              <p className="text-xs text-zinc-400 max-w-sm">A inteligência artificial está aplicando sua solicitação exatamente na área selecionada.</p>
            </div>
          </div>
        )}

        <div className="relative shadow-2xl rounded-xl overflow-hidden border border-white/10" style={{
            maxWidth: '100%', 
            maxHeight: '100%', 
            aspectRatio: imageSize.width && imageSize.height ? `${imageSize.width}/${imageSize.height}` : 'auto',
            height: '100%'
        }}>
            <img 
              src={imageUrl} 
              alt="Base para pintar" 
              className="w-full h-full object-contain pointer-events-none"
              style={{ display: 'block' }}
            />
            
            <canvas
              ref={canvasRef}
              width={imageSize.width || 1080}
              height={imageSize.height || 1080}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
              style={{ opacity: showMask ? 1 : 0 }}
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
      
      {/* Bottom Command Bar */}
      <div className="border-t border-white/10 bg-zinc-950 p-4 shrink-0 flex flex-col gap-3 z-20">
        {/* Preset quick prompt suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
          <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0 text-[10px]">Sugestões:</span>
          
          <button
            onClick={() => setPromptText("Remover completamente o elemento da área pintada e substituir por fundo perfeito e limpo")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-medium shrink-0 transition-colors"
          >
            <Trash2 size={12} />
            <span>Remover Objeto</span>
          </button>

          <button
            onClick={() => setPromptText("Alterar a cor e estilo do elemento selecionado para ")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium shrink-0 transition-colors"
          >
            <Palette size={12} />
            <span>Alterar Cor/Estilo</span>
          </button>

          <button
            onClick={() => setPromptText("Adicionar ")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium shrink-0 transition-colors"
          >
            <PlusCircle size={12} />
            <span>Adicionar Algo Novo</span>
          </button>

          <button
            onClick={() => setPromptText("Refinar detalhes, nitidez e iluminação nesta área específica")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-medium shrink-0 transition-colors"
          >
            <Sparkles size={12} />
            <span>Melhorar Detalhes</span>
          </button>
        </div>

        {/* Prompt Input & Execute Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input 
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Digite o comando do que fazer na área pintada (ex: remover pessoa, mudar cor para azul, adicionar relógio)..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && promptText.trim() && !isProcessing) {
                  handleConfirm();
                }
              }}
            />
            {promptText && (
              <button
                onClick={() => setPromptText("")}
                className="absolute right-3 top-0 bottom-0 m-auto text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={isProcessing || !promptText.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-[#c5a880] hover:bg-[#b39873] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Aplicar na Área Pintada</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
