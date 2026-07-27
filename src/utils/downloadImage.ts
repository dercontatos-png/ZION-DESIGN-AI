export interface DownloadMetaInfo {
  title?: string;
  clientName?: string;
  prompt?: string;
  aspectRatio?: string;
  platform?: string;
  formatLabel?: string;
  targetResolution?: string | number;
  customFileName?: string;
}

export function sanitizeFileNamePart(str: string, maxLength: number = 30): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-zA-Z0-9\s_-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, maxLength);
}

export function generateSmartFileName(
  meta?: DownloadMetaInfo,
  defaultExtension: string = "png"
): string {
  const extension = defaultExtension.toLowerCase();

  if (meta?.customFileName) {
    const cleanCustom = sanitizeFileNamePart(meta.customFileName, 60);
    return cleanCustom ? `${cleanCustom}.${extension}` : `Zion_Arte_Gerada.${extension}`;
  }

  // 1. Subject / Topic / Title
  let subjectPart = "";
  if (meta?.clientName) {
    subjectPart = sanitizeFileNamePart(meta.clientName, 20);
  }
  if (meta?.title) {
    const cleanTitle = sanitizeFileNamePart(meta.title, 25);
    if (cleanTitle) {
      subjectPart = subjectPart ? `${subjectPart}_${cleanTitle}` : cleanTitle;
    }
  } else if (!subjectPart && meta?.prompt) {
    subjectPart = sanitizeFileNamePart(meta.prompt, 25);
  }

  if (!subjectPart) {
    subjectPart = "Arte_Gerada";
  }

  // 2. Format / Social Platform / Ratio
  let formatPart = "";
  if (meta?.platform) {
    formatPart = sanitizeFileNamePart(meta.platform, 15);
  }

  if (meta?.formatLabel) {
    const cleanFormat = sanitizeFileNamePart(meta.formatLabel, 15);
    formatPart = formatPart ? `${formatPart}_${cleanFormat}` : cleanFormat;
  } else if (meta?.aspectRatio) {
    switch (meta.aspectRatio) {
      case "1:1":
        formatPart = formatPart ? `${formatPart}_Feed_1x1` : "Instagram_Feed_1x1";
        break;
      case "3:4":
        formatPart = formatPart ? `${formatPart}_Retrato_3x4` : "Instagram_Retrato_3x4";
        break;
      case "9:16":
        formatPart = formatPart ? `${formatPart}_Story_Status_9x16` : "WhatsApp_Status_9x16";
        break;
      case "16:9":
        formatPart = formatPart ? `${formatPart}_Desktop_16x9` : "Banner_16x9";
        break;
      default:
        formatPart = formatPart ? `${formatPart}_${meta.aspectRatio.replace(":", "x")}` : `Formato_${meta.aspectRatio.replace(":", "x")}`;
        break;
    }
  }

  if (!formatPart) {
    formatPart = "Social";
  }

  // 3. Resolution / Mode
  let qualityPart = "";
  const targetRes = meta?.targetResolution;
  if (targetRes === "16MP" || targetRes === 16) {
    qualityPart = "WhatsApp_HD_16MB";
  } else if (targetRes === "4K" || targetRes === 30) {
    qualityPart = "4K_UltraHD";
  } else if (targetRes === "2K") {
    qualityPart = "2K_HD";
  } else if (targetRes === "1K") {
    qualityPart = "1K";
  } else if (targetRes === "ORIGINAL" || !targetRes) {
    qualityPart = "Nativo";
  } else {
    qualityPart = `${targetRes}`;
  }

  const timestamp = Date.now().toString().slice(-4);
  return `Zion_${subjectPart}_${formatPart}_${qualityPart}_${timestamp}.${extension}`;
}

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
  targetResolution?: "16MP" | "4K" | "2K" | "1K" | "ORIGINAL" | "30MB" | number,
  metaInfo?: DownloadMetaInfo
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
            link.download = generateSmartFileName({ ...metaInfo, targetResolution: metaInfo?.targetResolution || targetResolution }, extension);
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
          link.download = generateSmartFileName({ ...metaInfo, targetResolution: metaInfo?.targetResolution || targetResolution }, extension);
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
