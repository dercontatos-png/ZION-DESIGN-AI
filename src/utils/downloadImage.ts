/**
 * Downloads the original image directly, preventing any browser canvas compression or pixel loss
 * by fetching the original bytes from the server or utilizing the raw base64 data directly.
 */
export const downloadImage = (
  base64Data: string,
  formatoSelecionado: string,
  logoConfig?: any,
  typographyConfig?: any,
  backgroundColor?: string
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasBgColor = backgroundColor && backgroundColor !== "transparent";

      // If we don't have a background color to paint, download the original file directly
      // to ensure 100% identical byte size, quality, and resolution.
      if (!hasBgColor) {
        const extension = formatoSelecionado.toLowerCase();
        const isUrl = base64Data.startsWith("http") || base64Data.startsWith("/");
        
        if (isUrl) {
          try {
            const res = await fetch(base64Data);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `Zion_Premium_Card_${Date.now()}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            resolve();
            return;
          } catch (fetchErr) {
            console.warn("Direct file fetch failed, falling back to canvas download:", fetchErr);
          }
        } else if (base64Data.startsWith("data:")) {
          const link = document.createElement("a");
          link.href = base64Data;
          link.download = `Zion_Premium_Card_${Date.now()}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
          return;
        }
      }

      // Fallback or background painting via canvas with maximum 100% quality
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = bgImg.naturalWidth || 1024;
        canvas.height = bgImg.naturalHeight || 1024;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // 1. Draw solid background color if provided
        if (backgroundColor && backgroundColor !== "transparent") {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw background image (already contains backend-baked logo)
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);        
        
        // 3. Output canvas to download trigger
        let extension = formatoSelecionado.toLowerCase();
        let mimeType = "image/png";
        if (extension === "jpeg" || extension === "jpg") {
          mimeType = "image/jpeg";
        } else if (extension === "webp") {
          mimeType = "image/webp";
        }
        
        // Use 1.0 (maximum quality) to prevent quality degradation during canvas export
        const dataUrl = canvas.toDataURL(mimeType, 1.0);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Zion_Premium_Card_${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        resolve();
      };
      
      bgImg.onerror = (e) => {
        reject(new Error("Error loading background image: " + e));
      };
      
      bgImg.src = base64Data;
    } catch (err) {
      reject(err);
    }
  });
};
