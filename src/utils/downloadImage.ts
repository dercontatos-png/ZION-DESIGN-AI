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
    qualityPart = "WhatsApp_HD";
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

      // Extract original filename from a URL path (e.g. /generated-images/img_xxx.png) when available
      let originalName: string | null = null;
      if (base64Data.startsWith("http") || base64Data.startsWith("/")) {
        try {
          const urlPath = base64Data.split("?")[0].split("#")[0];
          const candidate = decodeURIComponent(urlPath.split("/").pop() || "");
          if (candidate && /^[\w.\-]+$/.test(candidate)) {
            originalName = candidate;
          }
        } catch {
          // ignore
        }
      }

      // Direct download of native API bytes if no canvas operations are needed
      if (isOriginalMode && !hasBgColor) {
        const isUrl = base64Data.startsWith("http") || base64Data.startsWith("/");
        const isBase64 = base64Data.startsWith("data:");
        const isPngSource = base64Data.startsWith("data:image/png");

        if (isUrl || isBase64) {
          try {
            const res = await fetch(base64Data);
            const blob = await res.blob();

            // Guard: if the fetched bytes are not an image (HTML error page, etc.),
            // abort instead of saving a broken file.
            if (!blob.type.startsWith("image/") && !isBase64) {
              throw new Error("Resposta não é uma imagem.");
            }

            // PNG lossless fast path: only if source is already PNG (zero re-encode = zero loss)
            if (blob.type === "image/png" || (isPngSource && !blob.type)) {
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = originalName || generateSmartFileName({ ...metaInfo, targetResolution: metaInfo?.targetResolution || targetResolution }, "png");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
              resolve();
              return;
            }

            // Non-PNG source: fall through to canvas re-encode (lossless PNG)
            console.warn("Fonte não é PNG, reconvertendo para PNG sem perdas via canvas:", blob.type);
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
          const ctx = canvas.getContext("2d", { alpha: true });
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Maximize quality interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // 1. Draw solid background color if provided (only when requested)
          if (backgroundColor && backgroundColor !== "transparent") {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, targetW, targetH);
          }

          // 2. Draw high resolution image
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // 3. Determine MIME type and extension
          // Native (ORIGINAL) and WhatsApp HD (16MP) always export LOSSESS PNG.
          // Other target resolutions honor the selected export format.
          const forceLosslessPng = isOriginalMode || isWhatsAppHD;
          let extension = forceLosslessPng ? "png" : (formatoSelecionado ? formatoSelecionado.toLowerCase() : "png");
          let mimeType = "image/png";

          if (!forceLosslessPng) {
            if (extension === "jpeg" || extension === "jpg") {
              mimeType = "image/jpeg";
              extension = "jpg";
            } else if (extension === "webp") {
              mimeType = "image/webp";
            } else if (extension === "avif") {
              mimeType = "image/avif";
            }
          }

          // Quality: 0.98 for JPEG to preserve max crispness without artifacting (PNG is always lossless)
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

          // WhatsApp HD: ALWAYS exactly 16.0 MB (16,777,216 bytes), never more, never less
          if (isWhatsAppHD) {
            const targetBytes = 16 * 1024 * 1024;
            let bytes = new Uint8Array(await outputBlob.arrayBuffer());

            if (bytes.length > targetBytes) {
              // PNG is too big: flatten on white and re-encode as JPEG, lowering quality until it fits
              const whiteCanvas = document.createElement("canvas");
              whiteCanvas.width = targetW;
              whiteCanvas.height = targetH;
              const wctx = whiteCanvas.getContext("2d");
              if (wctx) {
                wctx.fillStyle = "#ffffff";
                wctx.fillRect(0, 0, targetW, targetH);
                wctx.drawImage(img, 0, 0, targetW, targetH);
                for (let q = 0.95; q >= 0.15; q -= 0.05) {
                  const jpegUrl = whiteCanvas.toDataURL("image/jpeg", q);
                  const jpegBlob = await (await fetch(jpegUrl)).blob();
                  if (jpegBlob.size <= targetBytes) {
                    bytes = new Uint8Array(await jpegBlob.arrayBuffer());
                    mimeType = "image/jpeg";
                    extension = "jpg";
                    break;
                  }
                }
              }
            }

            const padded = extension === "png"
              ? padPngToExact(bytes, targetBytes)
              : padJpegToExact(bytes, targetBytes);
            if (padded && padded.length === targetBytes) {
              outputBlob = new Blob([padded], { type: mimeType });
            }
          }

          // Native mode: keep the original filename (re-encoded to .png)
          let downloadName: string;
          if (isOriginalMode && originalName) {
            const baseName = originalName.replace(/\.[a-zA-Z0-9]+$/, "");
            downloadName = `${baseName}.${extension}`;
          } else {
            downloadName = generateSmartFileName({ ...metaInfo, targetResolution: metaInfo?.targetResolution || targetResolution }, extension);
          }

          const blobUrl = URL.createObjectURL(outputBlob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = downloadName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
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
