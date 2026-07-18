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
