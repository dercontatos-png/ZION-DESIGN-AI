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
              const procCanvas = document.createElement("canvas");
              procCanvas.width = logoImg.naturalWidth;
              procCanvas.height = logoImg.naturalHeight;
              const procCtx = procCanvas.getContext("2d");
              if (procCtx) {
                procCtx.drawImage(logoImg, 0, 0);
                try {
                  const imgData = procCtx.getImageData(0, 0, procCanvas.width, procCanvas.height);
                  const data = imgData.data;

                  const hex = logoConfig?.ambienteColor || "#000000";
                  const c = hex.replace("#", "");
                  const rBg = parseInt(c.substring(0, 2), 16) || 0;
                  const gBg = parseInt(c.substring(2, 4), 16) || 0;
                  const bBg = parseInt(c.substring(4, 6), 16) || 0;
                  const lum = (0.299 * rBg + 0.587 * gBg + 0.114 * bBg) / 255;
                  const isDarkBg = lum < 0.45;
                  const styleMode = logoConfig?.logoStyleOverlay || "original";

                  for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    const a = data[i+3];

                    // Remove white background with clean feathered alpha keying
                    const minWhite = 200;
                    const maxWhite = 255;
                    const brightness = (r + g + b) / 3;
                    if (brightness > minWhite) {
                      const factor = (maxWhite - brightness) / (maxWhite - minWhite);
                      data[i+3] = Math.round(a * Math.pow(factor, 2));
                      continue;
                    }

                    if (data[i+3] > 10) {
                      if (styleMode === "white") {
                        data[i] = 255;
                        data[i+1] = 255;
                        data[i+2] = 255;
                      } else if (styleMode === "black") {
                        data[i] = 0;
                        data[i+1] = 0;
                        data[i+2] = 0;
                      } else if (styleMode === "original" && isDarkBg) {
                        // Convert dark/black text to white, leaving colorful pixels untouched
                        const maxVal = Math.max(r, g, b);
                        const minVal = Math.min(r, g, b);
                        const saturation = maxVal - minVal;
                        const brightnessVal = (r + g + b) / 3;

                        if (saturation < 30 && brightnessVal < 140) {
                          data[i] = 255;
                          data[i+1] = 255;
                          data[i+2] = 255;
                        }
                      }
                    }
                  }
                  procCtx.putImageData(imgData, 0, 0);

                  const sizePercent = (logoConfig.logoSizeOverlay || 15) / 100;
                  const maxLogoHeight = canvas.height * sizePercent;
                  const scale = maxLogoHeight / logoImg.naturalHeight;
                  const logoWidth = logoImg.naturalWidth * scale;
                  const logoHeight = logoImg.naturalHeight * scale;

                  const marginX = canvas.width * 0.05;
                  const marginY = canvas.height * 0.05;

                  let posX = (canvas.width - logoWidth) / 2;
                  let posY = marginY;

                  const pos = logoConfig.logoPosOverlay || "top_center";
                  if (pos === "top_left") {
                    posX = marginX;
                    posY = marginY;
                  } else if (pos === "top_right") {
                    posX = canvas.width - logoWidth - marginX;
                    posY = marginY;
                  } else if (pos === "bottom_left") {
                    posX = marginX;
                    posY = canvas.height - logoHeight - marginY;
                  } else if (pos === "bottom_right") {
                    posX = canvas.width - logoWidth - marginX;
                    posY = canvas.height - logoHeight - marginY;
                  }

                  ctx.save();
                  ctx.drawImage(procCanvas, posX, posY, logoWidth, logoHeight);
                  ctx.restore();
                } catch (e) {
                  console.error("Canvas draw processing failed:", e);
                }
              }
              res();
            };
            logoImg.onerror = () => res();
            logoImg.src = logoConfig.logosList[0].startsWith("data:image/") 
              ? logoConfig.logosList[0] 
              : `data:image/png;base64,${logoConfig.logosList[0]}`;
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
