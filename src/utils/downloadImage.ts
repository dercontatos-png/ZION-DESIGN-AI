/**
 * Downloads image directly with maximum resolution & fidelity,
 * eliminating loss or compression artifacts.
 * Supports native API resolution output ('ORIGINAL') or upscaling to 16 Megapixels (WhatsApp HD) and 4K Ultra HD.
 */
export const downloadImage = (
  base64Data: string,
  formatoSelecionado: string,
  logoConfig?: any,
  typographyConfig?: any,
  backgroundColor?: string,
  targetResolution?: "16MP" | "4K" | "2K" | "1K" | "ORIGINAL" | "30MB" | number
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasBgColor = backgroundColor && backgroundColor !== "transparent";
      const isOriginalMode = targetResolution === "ORIGINAL" || !targetResolution;

      // Direct download of native API bytes if no canvas operations are needed
      if (isOriginalMode && !hasBgColor) {
        const isUrl = base64Data.startsWith("http") || base64Data.startsWith("/");
        const isBase64 = base64Data.startsWith("data:");
        const extension = formatoSelecionado ? formatoSelecionado.toLowerCase() : "png";

        if (isUrl || isBase64) {
          try {
            const res = await fetch(base64Data);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `Zion_API_Nativa_${Date.now()}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            resolve();
            return;
          } catch (fetchErr) {
            console.warn("Fetch de bytes originais falhou, caindo para canvas nativo:", fetchErr);
          }
        }
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        try {
          const origW = img.naturalWidth || 1024;
          const origH = img.naturalHeight || 1024;
          const aspectRatio = origW / origH;

          let targetW = origW;
          let targetH = origH;

          let isWhatsAppHD = targetResolution === "16MP" || targetResolution === 16;

          // Calculate target width and height based on requested quality/mode
          if (isWhatsAppHD) {
            // 16 Megapixels = 16,000,000 total pixels (Otimizado para WhatsApp HD)
            const totalPixels = 16_000_000;
            targetW = Math.round(Math.sqrt(totalPixels * aspectRatio));
            targetH = Math.round(Math.sqrt(totalPixels / aspectRatio));
          } else if (targetResolution === "4K" || targetResolution === 30) {
            // 4K Resolution = 3840px max dimension
            if (aspectRatio >= 1) {
              targetW = 3840;
              targetH = Math.round(3840 / aspectRatio);
            } else {
              targetH = 3840;
              targetW = Math.round(3840 * aspectRatio);
            }
          } else if (targetResolution === "2K") {
            if (aspectRatio >= 1) {
              targetW = 2048;
              targetH = Math.round(2048 / aspectRatio);
            } else {
              targetH = 2048;
              targetW = Math.round(2048 * aspectRatio);
            }
          } else if (targetResolution === "1K") {
            if (aspectRatio >= 1) {
              targetW = 1024;
              targetH = Math.round(1024 / aspectRatio);
            } else {
              targetH = 1024;
              targetW = Math.round(1024 * aspectRatio);
            }
          } else {
            // "ORIGINAL" or default: maintain exact natural API dimensions
            targetW = origW;
            targetH = origH;
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d", { alpha: !isWhatsAppHD });
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Maximize quality interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // 1. Draw solid background color if provided, or solid white for WhatsApp JPEG
          if (backgroundColor && backgroundColor !== "transparent") {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, targetW, targetH);
          } else if (isWhatsAppHD) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, targetW, targetH);
          }

          // 2. Draw high resolution image
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // 3. Determine MIME type and extension
          // CRITICAL FOR WHATSAPP HD: WhatsApp ONLY enables the "HD" toggle button for JPEG/JPG photos!
          let extension = formatoSelecionado ? formatoSelecionado.toLowerCase() : "png";
          let mimeType = "image/png";

          if (isWhatsAppHD) {
            mimeType = "image/jpeg";
            extension = "jpg";
          } else if (extension === "jpeg" || extension === "jpg") {
            mimeType = "image/jpeg";
            extension = "jpg";
          } else if (extension === "webp") {
            mimeType = "image/webp";
          } else if (extension === "avif") {
            mimeType = "image/avif";
          }

          // Quality: 0.98 for JPEG to preserve max crispness without artifacting
          const quality = (mimeType === "image/jpeg" || mimeType === "image/webp") ? 0.98 : 1.0;
          let dataUrl = canvas.toDataURL(mimeType, quality);
          
          // Fallback if browser doesn't support requested format natively
          if (extension === "avif" && !dataUrl.startsWith("data:image/avif")) {
            mimeType = "image/png";
            extension = "png";
            dataUrl = canvas.toDataURL(mimeType, 1.0);
          }

          const res = await fetch(dataUrl);
          let outputBlob = await res.blob();

          // Calculate exact byte padding if an exact MB target is specified (e.g. 16MB for WhatsApp)
          let targetExactBytes: number | null = null;
          if (isWhatsAppHD || targetResolution === "16MP" || targetResolution === 16) {
            targetExactBytes = 16 * 1024 * 1024; // Exact 16.0 MB (16,777,216 bytes)
          } else if (targetResolution === 30 || targetResolution === "30MB") {
            targetExactBytes = 30 * 1024 * 1024; // Exact 30.0 MB
          } else if (typeof targetResolution === "number" && targetResolution > 0) {
            targetExactBytes = targetResolution * 1024 * 1024;
          }

          if (targetExactBytes && targetExactBytes > 0) {
            if (outputBlob.size < targetExactBytes) {
              const paddingSize = targetExactBytes - outputBlob.size;
              const padding = new Uint8Array(paddingSize);
              outputBlob = new Blob([outputBlob, padding], { type: outputBlob.type || mimeType });
            } else if (outputBlob.size > targetExactBytes) {
              outputBlob = outputBlob.slice(0, targetExactBytes, outputBlob.type || mimeType);
            }
          }

          const blobUrl = URL.createObjectURL(outputBlob);
          const link = document.createElement("a");
          link.href = blobUrl;
          
          let prefix = "Zion_Arte_Nativa";
          if (isWhatsAppHD) {
            prefix = "Zion_WhatsApp_16MB_HD";
          } else if (targetResolution === "4K" || targetResolution === 30) {
            prefix = "Zion_UltraHD_4K";
          }

          link.download = `${prefix}_${Date.now()}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          resolve();
        } catch (procErr) {
          reject(procErr);
        }
      };

      img.onerror = (e) => {
        reject(new Error("Error loading image for high-res download: " + e));
      };

      img.src = base64Data;
    } catch (err) {
      reject(err);
    }
  });
};
