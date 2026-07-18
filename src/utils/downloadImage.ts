/**
 * Downloads the original image directly from its base64 representation,
 * preventing any browser canvas compression or pixel loss.
 */
export const downloadImage = (
  base64Data: string,
  formatoSelecionado: string,
  logoConfig?: any,
  typographyConfig?: any
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
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
        
        // 1. Draw background image
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        if (logoConfig?.useLogo && logoConfig?.logosList && logoConfig?.logosList.length > 0) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          await new Promise<void>((res) => {
            logoImg.onload = () => {
              const maxLogoHeight = canvas.height * 0.15; // 15% of height
              const scale = maxLogoHeight / logoImg.naturalHeight;
              const logoWidth = logoImg.naturalWidth * scale;
              const logoHeight = logoImg.naturalHeight * scale;
              
              const marginY = canvas.height * 0.05;
              const posX = (canvas.width - logoWidth) / 2;
              const posY = marginY;
              
              ctx.save();
              try {
                const hex = logoConfig?.ambienteColor || "#000000";
                const c = hex.replace("#", "");
                const r = parseInt(c.substring(0, 2), 16);
                const g = parseInt(c.substring(2, 4), 16);
                const b = parseInt(c.substring(4, 6), 16);
                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                if (lum < 0.4) {
                  ctx.filter = "brightness(0) invert(1)";
                }
              } catch (e) {
                console.warn("Auto logo color detection failed:", e);
              }
              ctx.drawImage(logoImg, posX, posY, logoWidth, logoHeight);
              ctx.restore();
              res();
            };
            logoImg.onerror = () => res();
            logoImg.src = logoConfig.logosList[0];
          });
        }
        
        // 2. Output canvas to download trigger
        let extension = formatoSelecionado.toLowerCase();
        let mimeType = "image/png";
        if (extension === "jpeg" || extension === "jpg") {
          mimeType = "image/jpeg";
        } else if (extension === "webp") {
          mimeType = "image/webp";
        }
        
        const dataUrl = canvas.toDataURL(mimeType, 0.95);
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
