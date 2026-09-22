import React, { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
  aspectRatio?: number;
}

const ASPECT_RATIOS = [
  { label: "Livre", value: NaN },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onConfirm,
  aspectRatio = NaN,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<number>(aspectRatio);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setSelectedAspect(aspectRatio);
    let cropper: Cropper | null = null;
    let active = true;

    const timer = setTimeout(() => {
      if (!imageRef.current || !active) return;
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }

      cropper = new Cropper(imageRef.current, {
        aspectRatio: isNaN(aspectRatio) ? NaN : aspectRatio,
        viewMode: 1,
        guides: true,
        center: true,
        background: false,
        responsive: true,
        autoCropArea: 0.9,
        checkOrientation: false,
      });

      cropperRef.current = cropper;
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [isOpen, imageUrl, aspectRatio]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAspectChange = (value: number) => {
    setSelectedAspect(value);
    if (cropperRef.current) {
      cropperRef.current.setAspectRatio(isNaN(value) ? NaN : value);
    }
  };

  const handleRotate = (degree: number) => {
    cropperRef.current?.rotate(degree);
  };

  const handleFlip = (axis: "x" | "y") => {
    if (!cropperRef.current) return;
    const data = cropperRef.current.getData();
    if (axis === "x") {
      cropperRef.current.scaleX(data.scaleX === -1 ? 1 : -1);
    } else {
      cropperRef.current.scaleY(data.scaleY === -1 ? 1 : -1);
    }
  };

  const handleConfirmCrop = () => {
    if (!cropperRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = cropperRef.current.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      if (!canvas) {
        setIsProcessing(false);
        return;
      }

      const croppedDataUrl = canvas.toDataURL("image/png");
      onConfirm(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error("Erro ao aplicar recorte:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recortar imagem"
      className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      style={{ zIndex: 999999998 }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-[95vw] max-w-3xl max-h-[90vh] rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-zinc-200">Recortar imagem</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body / Cropper Canvas */}
        <div className="flex-1 min-h-0 bg-black/40 p-2">
          <div style={{ height: "100%", maxHeight: "60vh", width: "100%" }}>
            <img
              ref={imageRef}
              alt="picture"
              src={imageUrl}
              style={{ opacity: 0, maxWidth: "100%" }}
              className="cropper-hidden"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-white/10">
          {/* Aspect Ratios */}
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-maximize2 lucide-maximize-2 h-3.5 w-3.5 text-zinc-500 mr-1"
              aria-hidden="true"
            >
              <path d="M15 3h6v6"></path>
              <path d="m21 3-7 7"></path>
              <path d="m3 21 7-7"></path>
              <path d="M9 21H3v-6"></path>
            </svg>

            {ASPECT_RATIOS.map((ratio) => {
              const isActive =
                (isNaN(selectedAspect) && isNaN(ratio.value)) ||
                selectedAspect === ratio.value;
              return (
                <button
                  key={ratio.label}
                  type="button"
                  onClick={() => handleAspectChange(ratio.value)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {ratio.label}
                </button>
              );
            })}
          </div>

          {/* Rotate & Mirror Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              title="Girar 90° esquerda"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-rotate-ccw h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              title="Girar 90° direita"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-rotate-cw h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleFlip("x")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              title="Espelhar horizontal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-square-centerline-dashed-horizontal h-4 w-4"
                aria-hidden="true"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"></path>
                <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"></path>
                <path d="M12 20v2"></path>
                <path d="M12 14v2"></path>
                <path d="M12 8v2"></path>
                <path d="M12 2v2"></path>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleFlip("y")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              title="Espelhar vertical"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-square-centerline-dashed-vertical h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                <path d="M4 12H2"></path>
                <path d="M10 12H8"></path>
                <path d="M16 12h-2"></path>
                <path d="M22 12h-2"></path>
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmCrop}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
              Confirmar recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
