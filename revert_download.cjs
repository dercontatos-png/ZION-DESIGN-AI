const fs = require('fs');
let code = fs.readFileSync('src/utils/downloadImage.ts', 'utf8');

const regex = /\/\/ 1\. Draw background image\n\s*ctx\.drawImage\(bgImg, 0, 0, canvas\.width, canvas\.height\);\n\n\s*if \(logoConfig\?\.useLogo && logoConfig\?\.logosList && logoConfig\?\.logosList\.length > 0\) \{[\s\S]*?\}\n/g;

const replacement = `// 1. Draw background image (already contains backend-baked logo)
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/utils/downloadImage.ts', code);
