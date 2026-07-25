const fs = require('fs');
let code = fs.readFileSync('src/utils/buildMasterPrompt.ts', 'utf8');

const regex1 = /promptParts\.push\(\`\\n=== TYPOGRAPHY & TEXT LAYOUT ===\\nThe design MUST include the following text layers arranged professionally, aligned to the \$\{\(config\.typographyPosition \|\| "Centro"\)\.toUpperCase\(\)\}:\`\);/;
const replacement1 = `promptParts.push(\`\\n=== TYPOGRAPHY & TEXT LAYOUT (SPATIAL POSITIONING) ===\\nThe design MUST include the following text layers arranged professionally. SPATIAL ALIGNMENT: \${(config.typographyPosition || "Centro").toUpperCase()}. You MUST position these texts EXACTLY in the logical layout regions associated with this alignment (e.g. if Top, place at top; if Center, anchor in the middle). Do NOT place text randomly.\`);`;
code = code.replace(regex1, replacement1);

const regex2 = /if \(config\.useLogo && \(config\.logoBase64 \|\| \(config\.logosList && config\.logosList\.length > 0\)\)\) \{[\s\S]*?promptParts\.push\("Brand Identity: Integrate the client's provided brand logo \('Referência de Logotipo'\) naturally into the composition layout \(e\.g\., top center or bottom corner\)\. CRITICAL DESIGN DIRECTIVE: You MUST completely ignore and omit any logo, symbol, or brand mark that is present in the background design reference flyer image\. Do NOT copy the reference flyer's logo under any circumstances; use exclusively the client's provided brand logo exactly as is, preserving its original colors, sharp shapes, and exact design without modifications or hallucinations\."\);[\s\S]*?\}/;
const replacement2 = `if (config.useLogo && (config.logoBase64 || (config.logosList && config.logosList.length > 0))) {
    const pos = config.logoPosOverlay || "top_center";
    promptParts.push(\`Brand Identity: Integrate the client's provided brand logo ('Referência de Logotipo') EXACTLY at the SPATIAL POSITION: \${pos.toUpperCase()}. Do NOT scatter or place the logo randomly. CRITICAL DESIGN DIRECTIVE: You MUST completely ignore and omit any logo, symbol, or brand mark that is present in the background design reference flyer image. Use exclusively the client's provided brand logo exactly as is.\`);
  }`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('src/utils/buildMasterPrompt.ts', code);
