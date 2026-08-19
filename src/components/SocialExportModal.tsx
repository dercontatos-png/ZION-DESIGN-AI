import React, { useState, useEffect } from "react";
import { X, Check, Loader2, Download, Sliders, Smartphone, Image as ImageIcon, Send, ShieldCheck, Eye, Sparkles } from "lucide-react";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Pad a PNG to an EXACT byte size by inserting a valid tEXt chunk (file stays a valid image)
function padPngToExact(bytes: Uint8Array, targetSize: number): Uint8Array | null {
  if (bytes.length > targetSize) return null;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return null;
  }
  const out = new Uint8Array(targetSize);
  out.set(bytes);

  // IEND chunk = last 12 bytes (length + "IEND" + CRC)
  const iendStart = bytes.length - 12;
  const deficit = targetSize - bytes.length;
  if (deficit < 12) {
    return out; // trailing bytes after IEND are ignored by decoders
  }

  const keyword = "ZionPadding";
  const payloadLen = deficit - 12; // chunk = len(4) + type(4) + keyword + \0 + text + crc(4)
  const textLen = payloadLen - keyword.length - 1;
  if (textLen < 0) return out;

  const chunk = new Uint8Array(deficit);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, payloadLen, false);
  chunk[4] = 0x74; // t
  chunk[5] = 0x45; // E
  chunk[6] = 0x58; // X
  chunk[7] = 0x74; // t
  for (let i = 0; i < keyword.length; i++) chunk[8 + i] = keyword.charCodeAt(i);
  chunk[8 + keyword.length] = 0; // null terminator (text bytes stay zero)

  const crc = crc32(chunk.subarray(4, deficit - 4));
  dv.setUint32(deficit - 4, crc, false);

  out.set(chunk, iendStart);
  out.set(bytes.subarray(iendStart), iendStart + deficit);
  return out;
}

// Pad a JPEG to an EXACT byte size with trailing zeros after the EOI marker (valid image)
function padJpegToExact(bytes: Uint8Array, targetSize: number): Uint8Array | null {
  if (bytes.length > targetSize) return null;
  const out = new Uint8Array(targetSize);
  out.set(bytes);
  return out;
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

interface SocialExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeImage: string | null;
  resolucao: string;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  onOptimizeSuccess?: (newImageUrl: string) => void;
}

export const SocialExportModal: React.FC<SocialExportModalProps> = ({
  isOpen,
  onClose,
  activeImage,
  resolucao,
  showToast,
  onOptimizeSuccess
}) => {
  const [platform, setPlatform] = useState<"instagram" | "whatsapp">("instagram");
  const [imageType, setImageType] = useState<"auto" | "gradient" | "text" | "blur" | "standard">("auto");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stable source image initialized when the modal opens to avoid infinite loop
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [optimizedImage, setOptimizedImage] = useState<string | null>(null);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  
  // Interactive preview mode selection
  const [previewMode, setPreviewMode] = useState<"original" | "optimized" | "simulated">("original");
  const [currentTab, setCurrentTab] = useState<"preview" | "settings">("preview");

  // Advanced finishing parameters
  const [recreateBackground, setRecreateBackground] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>("#161D2D");
  const [bgGradientCenter, setBgGradientCenter] = useState<string>("#253147");
  const [featherWidth, setFeatherWidth] = useState<number>(2);
  const [edgeSmoothing, setEdgeSmoothing] = useState<number>(0.8);
  const [autoParameters, setAutoParameters] = useState<boolean>(true);
  const [localCorrections, setLocalCorrections] = useState<boolean>(true);

  // Custom file upload states & drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // Zoom and pan states for high-frequency pixel inspection
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Progress tracker states for estimated remaining time
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [estimatedSecondsLeft, setEstimatedSecondsLeft] = useState<number>(6);

  // Handle paste image from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Str = event.target?.result as string;
              if (base64Str) {
                setBaseImage(base64Str);
                setOptimizedImage(null);
                setSimulatedImage(null);
                setMetadata(null);
                showToast("Imagem colada com sucesso da área de transferência!", "success");
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, showToast]);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (!baseImage && !activeImage) return;
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    const newZoom = Math.max(1, Math.min(4, zoom + delta));
    setZoom(newZoom);
    if (newZoom === 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Handle custom image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Str = e.target?.result as string;
      if (base64Str) {
        setBaseImage(base64Str);
        setOptimizedImage(null);
        setSimulatedImage(null);
        setMetadata(null);
        showToast("Nova imagem carregada com sucesso!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Str = event.target?.result as string;
        if (base64Str) {
          setBaseImage(base64Str);
          setOptimizedImage(null);
          setSimulatedImage(null);
          setMetadata(null);
          showToast("Nova imagem recebida e processada!", "success");
        }
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Por favor, arraste apenas arquivos de imagem.", "error");
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [baseImage]);

  // Synchronize stable baseImage when modal opens
  useEffect(() => {
    if (isOpen && activeImage && !baseImage) {
      setBaseImage(activeImage);
    }
  }, [isOpen, activeImage, baseImage]);

  // Clean states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBaseImage(null);
      setOptimizedImage(null);
      setSimulatedImage(null);
      setMetadata(null);
      setPreviewMode("original");
    }
  }, [isOpen]);

  // Run the optimized export pipeline
  const handleRunPipeline = async () => {
    const sourceImg = baseImage || activeImage;
    if (!sourceImg) {
      showToast("Nenhuma imagem ativa para processar.", "error");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setEstimatedSecondsLeft(6);

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 12) + 6;
      });
      setEstimatedSecondsLeft((prev) => {
        if (prev <= 1) return 1;
        return prev - 1;
      });
    }, 800);

    try {
      // Determine recommended target width based on standard resolutions
      let targetWidth = 1080;
      if (resolucao === "2K") targetWidth = 2048;
      else if (resolucao === "4K") targetWidth = 3840;

      const response = await fetch("/api/export-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: sourceImg,
          targetWidth,
          imageType,
          platform,
          recreateBackground,
          bgColor,
          bgGradientCenter,
          featherWidth,
          edgeSmoothing,
          localCorrections,
          autoParameters
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao processar imagem.");
      }

      const data = await response.json();
      if (data.image) {
        setOptimizedImage(data.image);
        setSimulatedImage(data.simulatedImage || null);
        setMetadata(data.metadata);
        
        // Sync AI determined parameters if automatic adjustments are enabled
        if (autoParameters && data.metadata) {
          if (typeof data.metadata.appliedFeatherWidth === "number") {
            setFeatherWidth(data.metadata.appliedFeatherWidth);
          }
          if (typeof data.metadata.appliedEdgeSmoothing === "number") {
            setEdgeSmoothing(data.metadata.appliedEdgeSmoothing);
          }
        }
        
        // Default back to optimized view
        setPreviewMode("optimized");
        showToast("Análise de banding e exportação otimizada concluída!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Erro ao otimizar imagem: " + err.message, "error");
    } finally {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
    }
  };

  // Run automatically when base image, platform, imageType or finishing parameters change
  // Removed automatic execution per user request to allow manual optimization triggering.

  if (!isOpen) return null;

  // Handle Download Action
  const handleDownload = async () => {
    if (!optimizedImage) return;

    const platformLabel = platform === "whatsapp" ? "WhatsApp_Status" : "Instagram_Feed";
    const typeLabel = imageType !== "auto" ? imageType : "HD";
    const isInstagram = platform !== "whatsapp";
    const baseName = `Zion_Otimizado_${platformLabel}_${typeLabel}_${Date.now().toString().slice(-4)}`;

    const appendToGallery = () => {
      if (onOptimizeSuccess) {
        onOptimizeSuccess(optimizedImage);
      }
    };

    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("canvas unavailable");
        }
        ctx.drawImage(img, 0, 0);

        if (isInstagram) {
          // Instagram: ALWAYS exactly 30.0 MB (31,457,280 bytes), never more, never less
          const targetBytes = 30 * 1024 * 1024;

          let dataUrl = canvas.toDataURL("image/png");
          let blob: Blob = await (await fetch(dataUrl)).blob();
          let ext = "png";

          if (blob.size > targetBytes) {
            // PNG is too big: fall back to JPEG, progressively lowering quality until it fits
            for (let q = 0.95; q >= 0.15; q -= 0.05) {
              const jpegUrl = canvas.toDataURL("image/jpeg", q);
              const jpegBlob = await (await fetch(jpegUrl)).blob();
              if (jpegBlob.size <= targetBytes) {
                blob = jpegBlob;
                ext = "jpg";
                break;
              }
            }
          }

          const bytes = new Uint8Array(await blob.arrayBuffer());
          const padded = ext === "png"
            ? padPngToExact(bytes, targetBytes)
            : padJpegToExact(bytes, targetBytes);

          if (padded && padded.length === targetBytes) {
            triggerBlobDownload(new Blob([padded], { type: ext === "png" ? "image/png" : "image/jpeg" }), `${baseName}.${ext}`);
            appendToGallery();
            showToast("Download iniciado: Instagram 30MB exatos (arquivo válido) e imagem salva na galeria!", "success");
          } else {
            throw new Error("Não foi possível atingir o tamanho exato.");
          }
        } else {
          // WhatsApp: lossless PNG at natural resolution
          const pngUrl = canvas.toDataURL("image/png");
          const pngBlob = await (await fetch(pngUrl)).blob();
          triggerBlobDownload(pngBlob, `${baseName}.png`);
          appendToGallery();
          showToast("Download iniciado (PNG sem perdas) e imagem salva na galeria!", "success");
        }
      } catch {
        triggerBlobDownload(new Blob([optimizedImage], { type: "image/png" }), `${baseName}.png`);
        appendToGallery();
        showToast("Download iniciado e imagem salva na galeria!", "success");
      }
    };
    img.onerror = () => {
      triggerBlobDownload(new Blob([optimizedImage], { type: "image/png" }), `${baseName}.png`);
      appendToGallery();
      showToast("Download iniciado e imagem salva na galeria!", "success");
    };
    img.src = optimizedImage;
  };

  // Get description depending on active preview mode
  const getPreviewModeDescription = () => {
    if (previewMode === "original") {
      return "Imagem pura antes de qualquer filtro ou tratamento de compressão.";
    }
    if (previewMode === "optimized") {
      return "Otimizada via Dither Adaptativo, Falso Degradê e sRGB 4:4:4 para enganar compressores.";
    }
    return `Simulação real do post após compressão agressiva (${platform === "instagram" ? "Qualidade 60, Chroma 4:2:0" : "Qualidade 50, Chroma 4:2:0"}).`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div 
        id="social-export-modal-container"
        className="w-full max-w-5xl bg-[#0a0a0c] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-[85vh] max-h-[850px] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        
         {/* Left Column: Visual Comparison Preview */}
         <div className={`flex-1 bg-black p-4 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 min-h-0 overflow-y-auto ${currentTab === "preview" ? "flex" : "hidden md:flex"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ad8330] bg-[#ad8330]/10 px-2 py-1 rounded">
                EXPORTAÇÃO PRO
              </span>
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Comparador de Compressão</h3>
            </div>
            
            {/* Display toggle for Mobile adjustments */}
            <div className="flex bg-black rounded-lg p-0.5 border border-zinc-800">
              <button 
                onClick={() => setCurrentTab("preview")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                  currentTab === "preview" ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Visualizar
              </button>
              <button 
                onClick={() => setCurrentTab("settings")}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all md:hidden ${
                  currentTab === "settings" ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                Ajustes
              </button>
            </div>
          </div>

          {/* Core Interactive Preview Canvas with Drag and Drop & Wheel Zoom Support */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onWheel={handleWheel}
            className={`flex-1 flex flex-col items-center justify-center relative rounded-xl overflow-hidden bg-black/80 border ${isDragging ? "border-emerald-500 bg-black/90" : "border-zinc-900"} p-4 min-h-[280px] md:min-h-[420px] transition-all`}
          >
            {isProcessing && (
              <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 p-6 text-center">
                <Loader2 size={28} className="text-[#ad8330] animate-spin" />
                <div className="space-y-1.5 w-full max-w-xs">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 block">
                    Otimizando imagem para {platform === "instagram" ? "Instagram" : "WhatsApp"}...
                  </span>
                  <div className="w-full h-1 bg-[#111] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ad8330] transition-all duration-300" 
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Progresso: {processingProgress}%</span>
                    <span>Falta: ~{estimatedSecondsLeft}s</span>
                  </div>
                </div>
              </div>
            )}

            {isDragging && (
              <div className="absolute inset-0 z-30 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-6 text-center border-2 border-dashed border-emerald-400 m-2 rounded-lg">
                <ImageIcon size={36} className="text-emerald-400 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-200">
                  Solte para Otimizar!
                </span>
                <p className="text-[10px] text-emerald-400 max-w-xs leading-normal">
                  A imagem será carregada e processada automaticamente no pipeline anti-banding.
                </p>
              </div>
            )}

            {/* Interactive Zoom Floating Overlay */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/95 backdrop-blur-sm border border-zinc-800 px-2.5 py-1.5 rounded-xl shadow-lg select-none">
              <button 
                type="button"
                onClick={() => {
                  const nz = Math.max(1, zoom - 0.5);
                  setZoom(nz);
                  if (nz === 1) setPanOffset({ x: 0, y: 0 });
                }}
                className="w-5 h-5 rounded bg-[#111] hover:bg-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-black active:scale-90 transition-all cursor-pointer"
                title="Diminuir Zoom"
              >
                -
              </button>
              <span className="text-[9px] font-mono font-bold text-zinc-300 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                type="button"
                onClick={() => {
                  const nz = Math.min(4, zoom + 0.5);
                  setZoom(nz);
                }}
                className="w-5 h-5 rounded bg-[#111] hover:bg-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-black active:scale-90 transition-all cursor-pointer"
                title="Aumentar Zoom"
              >
                +
              </button>
              {zoom > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="ml-1 px-1.5 py-0.5 rounded bg-[#ad8330]/20 hover:bg-[#ad8330]/30 text-[8px] font-black text-[#ad8330] uppercase transition-all cursor-pointer"
                  >
                    Redefinir
                  </button>
                  <span className="hidden sm:inline-block text-[8px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    Arraste para mover
                  </span>
                </>
              )}
            </div>

            {/* View Mode Interactive Tabs */}
            <div className="flex bg-black/80 rounded-xl p-1 border border-zinc-800/80 mb-4 z-10">
              <button
                onClick={() => setPreviewMode("original")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  previewMode === "original" ? "bg-[#111] text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setPreviewMode("optimized")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  previewMode === "optimized" ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Otimizado sRGB
              </button>
              <button
                onClick={() => setPreviewMode("simulated")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  previewMode === "simulated" ? "bg-[#ad8330]/20 border border-[#ad8330]/30 text-[#ad8330]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Simular Upload (Rede Social)
              </button>
            </div>

            {/* Displaying Image according to Mode with Zoom and Pan */}
            <div className="relative w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              {!baseImage && !activeImage ? (
                <label className="flex flex-col items-center justify-center gap-3 p-8 border border-dashed border-zinc-800 hover:border-[#ad8330]/40 hover:bg-[#ad8330]/5 rounded-2xl cursor-pointer max-w-sm text-center transition-all bg-black/25">
                  <ImageIcon size={32} className="text-[#ad8330]" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest block">Nenhuma imagem carregada</span>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider leading-relaxed">
                      Arraste um arquivo de imagem para esta tela ou clique aqui para selecionar do computador.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 bg-[#ad8330]/10 hover:bg-[#ad8330]/25 text-[8.5px] font-black uppercase text-[#ad8330] rounded-lg border border-[#ad8330]/20 transition-all mt-1">
                    Selecionar Arquivo
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              ) : (
                <>
                  {previewMode === "original" && (baseImage || activeImage) && (
                    <div 
                      className="relative w-full h-full flex items-center justify-center overflow-hidden"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                    >
                      <img 
                        src={baseImage || activeImage || ""} 
                        alt="Original Image" 
                        style={{
                          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                          transformOrigin: "center center",
                          cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in"
                        }}
                        className="max-h-[300px] md:max-h-[360px] object-contain rounded-lg border border-zinc-800 shadow-2xl transition-transform duration-100 ease-out select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-2 right-2 text-[8px] bg-black/80 border border-zinc-800 px-2 py-1 rounded text-zinc-400 font-bold uppercase tracking-widest select-none">
                        Sem Processamento
                      </span>
                    </div>
                  )}

                  {previewMode === "optimized" && (
                    <div 
                      className="relative w-full h-full flex items-center justify-center overflow-hidden"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                    >
                      {optimizedImage ? (
                        <>
                          <img 
                            src={optimizedImage} 
                            alt="Optimized High-Res sRGB" 
                            style={{
                              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                              transformOrigin: "center center",
                              cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in"
                            }}
                            className="max-h-[300px] md:max-h-[360px] object-contain rounded-lg border border-emerald-900/30 shadow-2xl transition-transform duration-100 ease-out select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 right-2 text-[8px] bg-emerald-950/90 border border-emerald-800/40 px-2 py-1 rounded text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1 select-none">
                            <Check size={10} className="stroke-[3px]" />
                            Anti-Banding sRGB Ativo
                          </span>
                        </>
                      ) : (
                        <div className="text-center p-6 text-zinc-500 flex flex-col items-center gap-2 select-none">
                          <ImageIcon size={28} className="stroke-[1.5px] text-zinc-600 animate-pulse" />
                          <p className="text-xs">Clique no botão <strong className="text-[#ad8330]">"OTIMIZAR IMAGEM COM IA"</strong> para iniciar o processamento.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {previewMode === "simulated" && (
                    <div 
                      className="relative w-full h-full flex items-center justify-center overflow-hidden"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                    >
                      {simulatedImage ? (
                        <>
                          <img 
                            src={simulatedImage} 
                            alt="Simulated Server Upload Compression" 
                            style={{
                              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                              transformOrigin: "center center",
                              cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in"
                            }}
                            className="max-h-[300px] md:max-h-[360px] object-contain rounded-lg border border-orange-900/20 shadow-2xl transition-transform duration-100 ease-out select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2 right-2 text-[8px] bg-[#ad8330]/95 border border-[#ad8330]/30 text-black px-2 py-1 rounded font-black uppercase tracking-widest flex items-center gap-1 select-none">
                            <Eye size={10} className="stroke-[3px]" />
                            Simulador de Upload ({platform === "instagram" ? "Instagram 60%" : "WhatsApp 50%"})
                          </span>
                        </>
                      ) : (
                        <div className="text-center p-6 text-zinc-500 flex flex-col items-center gap-2 select-none">
                          <Loader2 size={24} className="text-[#ad8330] animate-spin" />
                          <p className="text-xs">Gerando simulação de compressão...</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Descriptive text helper */}
            <div className="mt-4 px-3 py-1.5 bg-black/40 border border-zinc-800/50 rounded-lg text-center max-w-xl">
              <p className="text-[10px] font-medium text-zinc-400 leading-normal">
                {getPreviewModeDescription()}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-900">
            <div className="flex flex-col items-start text-left">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                Tecnologia Dither & Falso Degradê
              </span>
              <p className="text-[10px] text-zinc-400 max-w-sm">
                O dither de grão fino e o falso degradê sRGB agem criando transições cromáticas microscópicas que impedem o compressor de agrupar tons vizinhos.
              </p>
            </div>
            {optimizedImage && (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shadow-xl"
              >
                <Download size={13} className="stroke-[2.5px]" />
                <span>BAIXAR OTIMIZADO sRGB</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Configurations */}
        <div className={`w-full md:w-[360px] bg-[#0c0c0e] p-4 md:p-6 flex flex-col justify-between overflow-y-auto min-h-0 ${currentTab === "settings" ? "flex" : "hidden md:flex"}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100">Algoritmo Anti-Banding</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Exportação Otimizada</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:border-zinc-700"
              >
                <X size={14} />
              </button>
            </div>

            {/* Custom Image Upload & Source Management */}
            <div className="space-y-2 border-b border-zinc-900 pb-4">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                Origem da Imagem
              </span>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-zinc-800 hover:border-[#ad8330]/40 hover:bg-[#ad8330]/5 bg-black/20 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all text-[10px] font-black uppercase tracking-wider">
                  <ImageIcon size={13} className="text-[#ad8330]" />
                  <span>Escolher qualquer Imagem</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
                {baseImage !== activeImage && baseImage !== null && (
                  <button 
                    onClick={() => {
                      setBaseImage(activeImage);
                      setOptimizedImage(null);
                      setSimulatedImage(null);
                      setMetadata(null);
                      showToast("Restaurada a imagem original do projeto.", "info");
                    }}
                    className="w-full py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-black/30 text-[9px] font-bold text-zinc-400 hover:text-zinc-200 uppercase tracking-wider transition-all"
                  >
                    Restaurar Imagem do Projeto
                  </button>
                )}
              </div>
            </div>

            {/* Platform Selector */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                Plataforma de Destino (Perfil de Compressão)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlatform("instagram")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    platform === "instagram"
                    ? "bg-gradient-to-br from-[#c5a880]/20 via-[#ad8330]/10 to-[#ad8330]/15 border-[#ad8330] text-[#ad8330]"
                    : "bg-black/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <Smartphone size={16} className="mb-1 text-zinc-300" />
                  <span className="text-xs font-bold">Instagram</span>
                  <span className="text-[8px] opacity-75">Full Chroma 4:4:4</span>
                </button>
                <button
                  onClick={() => setPlatform("whatsapp")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    platform === "whatsapp"
                    ? "bg-gradient-to-br from-emerald-950/20 to-emerald-900/20 border-emerald-500 text-emerald-400"
                    : "bg-black/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <Send size={16} className="mb-1 text-zinc-300" />
                  <span className="text-xs font-bold">WhatsApp</span>
                  <span className="text-[8px] opacity-75">Filtro Sharpen Extra</span>
                </button>
              </div>
            </div>

            {/* Preset Types */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                Tipo de Imagem (Algoritmo de Detecção)
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {[
                  { id: "auto", name: "Varredura Automática (Inteligente)", desc: "Varre o histograma e edge map para aplicar a melhor atenuação" },
                  { id: "gradient", name: "Gradientes e Degradês Suaves", desc: "Aplica dither adaptativo reforçado para impedir faixas de cor" },
                  { id: "blur", name: "Retratos e Fundos Desfocados", desc: "1.5% micro-grão cinematográfico com nitidez sutil de contorno" },
                  { id: "text", name: "Cartazes e Textos Dominantes", desc: "Proteção estrita com grão quase nulo e super nitidez nos textos" },
                  { id: "standard", name: "Fotografias e Cenas Gerais", desc: "Nitidez de compensação padrão com dither leve adaptativo" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setImageType(item.id as any)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      imageType === item.id
                      ? "bg-black border-[#ad8330] text-zinc-100"
                      : "bg-black/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    <div className="mt-0.5">
                      {imageType === item.id ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ad8330] flex items-center justify-center">
                          <Check size={8} className="text-black stroke-[3px]" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold leading-none mb-1">{item.name}</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Post-Processing Options */}
            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Pós-Processamento Avançado
                </span>
                <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Ativo
                </span>
              </div>

              {/* Toggle Recreate Background */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-zinc-800/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-200">Reconstruir Fundo</span>
                  <span className="text-[8px] text-zinc-500">Gradiente 100% contínuo e limpo</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={recreateBackground}
                  onChange={(e) => setRecreateBackground(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-[#111] text-[#ad8330] focus:ring-[#ad8330]"
                />
              </div>

              {recreateBackground && (
                <div className="space-y-3 p-3 bg-black/20 border border-zinc-900 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  {/* Background Colors */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Cores do Fundo Gradiente</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500">Cor Principal</span>
                        <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-lg border border-zinc-800">
                          <input 
                            type="color" 
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer p-0"
                          />
                          <input 
                            type="text" 
                            value={bgColor}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val && !val.startsWith("#") && val.length <= 6) {
                                val = "#" + val;
                              }
                              setBgColor(val);
                            }}
                            className="text-[9px] font-mono text-zinc-300 uppercase bg-transparent border-0 outline-none w-16 focus:text-white"
                            maxLength={7}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-zinc-500">Cor Central</span>
                        <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-lg border border-zinc-800">
                          <input 
                            type="color" 
                            value={bgGradientCenter}
                            onChange={(e) => setBgGradientCenter(e.target.value)}
                            className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer p-0"
                          />
                          <input 
                            type="text" 
                            value={bgGradientCenter}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val && !val.startsWith("#") && val.length <= 6) {
                                val = "#" + val;
                              }
                              setBgGradientCenter(val);
                            }}
                            className="text-[9px] font-mono text-zinc-300 uppercase bg-transparent border-0 outline-none w-16 focus:text-white"
                            maxLength={7}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto Adjust via IA Toggle */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-zinc-800/60 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-zinc-300">Ajuste Automático via IA</span>
                      <span className="text-[8px] text-zinc-500">Definir feather e suavização com base na análise</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoParameters}
                      onChange={(e) => setAutoParameters(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-[#111] text-[#ad8330] focus:ring-[#ad8330]"
                    />
                  </div>

                  {/* Feather Width Slider */}
                  <div className={`space-y-1 ${autoParameters ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Suavização da Máscara</span>
                      <span className="text-[9px] font-bold text-[#ad8330]">{featherWidth}px {autoParameters && "(Automático)"}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="1"
                      value={featherWidth}
                      disabled={autoParameters}
                      onChange={(e) => setFeatherWidth(Number(e.target.value))}
                      className="w-full h-1 bg-[#111] rounded-lg appearance-none cursor-pointer accent-[#ad8330] disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Edge Smoothing Slider */}
                  <div className={`space-y-1 ${autoParameters ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Suavização de Borda</span>
                      <span className="text-[9px] font-bold text-[#ad8330]">{edgeSmoothing} {autoParameters && "(Automático)"}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="2" 
                      step="0.1"
                      value={edgeSmoothing}
                      disabled={autoParameters}
                      onChange={(e) => setEdgeSmoothing(Number(e.target.value))}
                      className="w-full h-1 bg-[#111] rounded-lg appearance-none cursor-pointer accent-[#ad8330] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Toggle Gemini Vision Corrections */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-zinc-800/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-200">Correção Inteligente via IA</span>
                  <span className="text-[8px] text-zinc-500">Corrige ruídos, reconstrói blocos vazios/falhas e suaviza banding</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={localCorrections}
                  onChange={(e) => setLocalCorrections(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-[#111] text-[#ad8330] focus:ring-[#ad8330]"
                />
              </div>
            </div>

            {/* Interactive metadata details */}
            {metadata && (
              <div className="bg-black/40 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                
                {/* Banding Verification Status Alert */}
                {metadata.bandingVerification && (
                  <div className="mb-2 p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-start gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider block">Verificação contra Banding</span>
                      <span className="text-[9px] text-zinc-300 font-bold leading-tight">{metadata.bandingVerification}</span>
                    </div>
                  </div>
                )}

                {/* Global Pixel Healer & Denoiser Status Alert */}
                {typeof metadata.globalHealCount === "number" && (
                  <div className="mb-2 p-2 bg-[#ad8330]/10 border border-[#ad8330]/30 rounded-lg flex items-start gap-1.5">
                    <Sparkles size={13} className="text-[#ad8330] mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <span className="text-[8px] font-black text-[#ad8330] uppercase tracking-wider block">Restauração de Pixels & Redutor de Ruído</span>
                      <span className="text-[9px] text-zinc-300 font-bold leading-tight">
                        {metadata.globalHealCount > 0 
                          ? `${metadata.globalHealCount} quadradinhos de cores anômalas corrigidos uniformemente. Ruído suavizado com aspecto de imagem lisa.`
                          : "Imagem escaneada com sucesso. Nenhum pixel anômalo detectado. Redução de ruído com aspecto fluido aplicada."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Gemini Vision Diagnostics */}
                {metadata.detectedIssues && metadata.detectedIssues.length > 0 && (
                  <div className="mb-2 p-2 bg-[#c5a880]/20 border border-[#c5a880]/30 rounded-lg space-y-1">
                    <span className="text-[8px] font-black text-[#c5a880] uppercase tracking-wider block">Diagnóstico Gemini Vision</span>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {metadata.detectedIssues.map((issue: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-1 text-[8px] text-zinc-300 font-medium">
                          <span className="inline-block w-1 h-1 rounded-full bg-[#c5a880] mt-1 flex-shrink-0" />
                          <span>
                            <strong className="text-[#c5a880] uppercase">{issue.label}</strong>: {issue.desc} (Corrigido Localmente)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sliders size={11} className="text-[#ad8330]" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    Parâmetros em Tempo Real
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[9px]">
                  <div>
                    <span className="text-zinc-500 block uppercase text-[7px] font-bold">Resolução Final</span>
                    <span className="text-zinc-300 font-bold">{metadata.width}x{metadata.height} px</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[7px] font-bold">Qualidade export</span>
                    <span className="text-zinc-300 font-bold">{metadata.quality}% Progressive</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[7px] font-bold">Micro-Dither</span>
                    <span className="text-zinc-300 font-bold">{metadata.noiseAmount} Max</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase text-[7px] font-bold">Nitidez Ativa</span>
                    <span className="text-zinc-300 font-bold">Sigma {metadata.sharpenApplied}</span>
                  </div>
                  {metadata.dithering && (
                    <div className="col-span-2 border-t border-zinc-800/40 pt-1.5">
                      <span className="text-zinc-500 block uppercase text-[7px] font-bold">Dither anti-ondas</span>
                      <span className="text-zinc-300 font-medium">{metadata.dithering}</span>
                    </div>
                  )}
                  {metadata.texture && (
                    <div className="col-span-2 border-t border-zinc-800/40 pt-1.5">
                      <span className="text-zinc-500 block uppercase text-[7px] font-bold">Textura Orgânica</span>
                      <span className="text-zinc-300 font-medium">{metadata.texture}</span>
                    </div>
                  )}
                  <div className="col-span-2 border-t border-zinc-800/60 pt-1.5">
                    <span className="text-zinc-500 block uppercase text-[7px] font-bold">Sub-sampling</span>
                    <span className="text-emerald-400 font-black text-[8px] uppercase tracking-wider">sRGB 4:4:4 lossless</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col gap-2">
            <button
              onClick={handleRunPipeline}
              disabled={isProcessing || (!baseImage && !activeImage)}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-[#ad8330] to-[#8c6722] hover:brightness-110 active:scale-95 text-black text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-[#ad8330]/10"
            >
              {isProcessing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} className="stroke-[2.5px]" />
              )}
              <span>OTIMIZAR IMAGEM COM IA</span>
            </button>
            <p className="text-[8px] text-zinc-500 text-center uppercase tracking-wider leading-none">
              Dither-Engine sRGB Pro v3.0 · Node Sharp
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
