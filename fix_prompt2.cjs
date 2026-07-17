const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const logoMandatoryRule = logoBase64[\s\S]*?: `- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.`;/, `const logoMandatoryRule = logoBase64
        ? \`- BRAND LOGO CLONING (MANDATORY): You MUST perfectly clone the client's provided brand logo ("Referência de Logotipo"). You MUST completely erase any old logos from the Design Layout Reference image and perfectly draw the client's logo directly onto the image. ABSOLUTE CRITICAL RULE: YOU ARE STRICTLY FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE, TEXT, OR FONT. It must be a 100% exact pixel-perfect clone.\`
        : \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.\`;`);

fs.writeFileSync('server.ts', code);
