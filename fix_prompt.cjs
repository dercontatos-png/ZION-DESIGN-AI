const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const logoInclusionRule =.*?(?=const logoCompositionRule)/s, `const logoInclusionRule = logoBase64 ? \`\\n5. BRAND LOGO EMBEDDING (ABSOLUTELY CRITICAL): You MUST look for the brand logo region in the reference. You MUST COMPLETELY ERASE any generic logo present in the reference flyer. You MUST command the generator to DRAW, PAINT, and BAKE the client's provided brand logo ("Referência de Logotipo") directly into the image canvas. The logo must be perfectly integrated into the design. YOU ARE FORBIDDEN FROM MODIFYING THE LOGO. YOU MUST CREATE A 100% PERFECT, EXACT PIXEL CLONE OF THE PROVIDED LOGO. Do NOT alter fonts, do not alter shapes, do not alter spacing. It must be identical.\` : "";\n        `);

fs.writeFileSync('server.ts', code);
