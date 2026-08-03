const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const jimpBlock = `
          let buffer = Buffer.from(rawData, "base64");
          
          // === JIMP LOGO OVERLAY ===
          if (useLogo && logoBase64 && logoInclusionType !== "embedded") {
            try {
              console.log("[api/gerar] Applying Jimp logo overlay on backend...");
              const { Jimp, BlendMode, ResizeStrategy } = await import("jimp");
              
              const bgImg = await Jimp.read(buffer);
              
              const logoClean = cleanBase64(logoBase64);
              const logoBuffer = Buffer.from(logoClean, "base64");
              const logoImg = await Jimp.read(logoBuffer);
              
              const percentage = Math.max(5, Math.min(100, Number(logoSizeOverlay) || 15)) / 100;
              const targetLogoWidth = bgImg.bitmap.width * percentage;
              
              logoImg.resize({ w: targetLogoWidth, mode: ResizeStrategy.BICUBIC });
              
              const paddingX = bgImg.bitmap.width * 0.05;
              const paddingY = bgImg.bitmap.height * 0.05;
              
              let x = 0;
              let y = 0;
              
              switch (logoPosOverlay) {
                case "top_left":
                  x = paddingX;
                  y = paddingY;
                  break;
                case "top_center":
                  x = (bgImg.bitmap.width - logoImg.bitmap.width) / 2;
                  y = paddingY;
                  break;
                case "top_right":
                  x = bgImg.bitmap.width - logoImg.bitmap.width - paddingX;
                  y = paddingY;
                  break;
                case "center_left":
                  x = paddingX;
                  y = (bgImg.bitmap.height - logoImg.bitmap.height) / 2;
                  break;
                case "center_center":
                  x = (bgImg.bitmap.width - logoImg.bitmap.width) / 2;
                  y = (bgImg.bitmap.height - logoImg.bitmap.height) / 2;
                  break;
                case "center_right":
                  x = bgImg.bitmap.width - logoImg.bitmap.width - paddingX;
                  y = (bgImg.bitmap.height - logoImg.bitmap.height) / 2;
                  break;
                case "bottom_left":
                  x = paddingX;
                  y = bgImg.bitmap.height - logoImg.bitmap.height - paddingY;
                  break;
                case "bottom_center":
                  x = (bgImg.bitmap.width - logoImg.bitmap.width) / 2;
                  y = bgImg.bitmap.height - logoImg.bitmap.height - paddingY;
                  break;
                case "bottom_right":
                  x = bgImg.bitmap.width - logoImg.bitmap.width - paddingX;
                  y = bgImg.bitmap.height - logoImg.bitmap.height - paddingY;
                  break;
                default:
                  x = (bgImg.bitmap.width - logoImg.bitmap.width) / 2;
                  y = paddingY;
                  break;
              }
              
              bgImg.composite(logoImg, x, y, {
                mode: BlendMode.SRC_OVER,
                opacitySource: 1,
                opacityDest: 1
              });
              
              buffer = await bgImg.getBuffer("image/jpeg");
              rawData = buffer.toString("base64");
              rawMime = "image/jpeg";
              responseImgUrl = \`data:image/jpeg;base64,\${rawData}\`;
              console.log("[api/gerar] Jimp logo overlay applied successfully.");
            } catch (overlayErr) {
              console.error("[api/gerar] Failed to apply Jimp logo overlay:", overlayErr);
            }
          }

          bytes = buffer.length;
`;

code = code.replace(/const buffer = Buffer\.from\(rawData, "base64"\);\s+bytes = buffer\.length;/g, jimpBlock);

fs.writeFileSync('server.ts', code);
