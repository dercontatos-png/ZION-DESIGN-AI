import { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";

const compressImage = (base64Str: string, maxWidth = 512, maxHeight = 512, quality = 0.6): Promise<string> => {
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
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const setSujeitoBase64 = useProjectStore((s) => s.setSujeitoBase64);
  const setCenarioBase64 = useProjectStore((s) => s.setCenarioBase64);

  const uploadAndProcess = async (file: File, type: "person" | "env"): Promise<string> => {
    setIsUploading(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          // Processamento e compressão assíncrona que não congela a UI
          const compressed = await compressImage(rawBase64, 1024, 1024, 0.7);
          const cleanBytes = compressed.replace(/^data:image\/\w+;base64,/, "");
          
          if (type === "person") {
            setSujeitoBase64(cleanBytes);
          } else {
            setCenarioBase64(cleanBytes);
          }
          setIsUploading(false);
          resolve(compressed);
        } catch (err) {
          const cleanBytes = rawBase64.replace(/^data:image\/\w+;base64,/, "");
          if (type === "person") {
            setSujeitoBase64(cleanBytes);
          } else {
            setCenarioBase64(cleanBytes);
          }
          setIsUploading(false);
          resolve(rawBase64);
        }
      };
      reader.onerror = (e) => {
        setIsUploading(false);
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    uploadAndProcess,
    isUploading
  };
};
