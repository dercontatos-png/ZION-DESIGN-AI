const fs = require('fs');
let code = fs.readFileSync('src/utils/downloadImage.ts', 'utf8');

const regex = /\/\/ 1\. Draw background image \(already contains backend-baked logo\)\n\s*ctx\.drawImage\(bgImg, 0, 0, canvas\.width, canvas\.height\);/g;

const replacement = `// 1. Draw background image
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
              
              ctx.drawImage(logoImg, posX, posY, logoWidth, logoHeight);
              res();
            };
            logoImg.onerror = () => res();
            logoImg.src = logoConfig.logosList[0];
          });
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/utils/downloadImage.ts', code);
