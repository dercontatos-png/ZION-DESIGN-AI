const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexInclusion = /const logoInclusionRule = hasLogo \? `\\n5\. BRAND LOGO EMBEDDING[\s\S]*?` : "";/g;
const replacementInclusion = `const logoInclusionRule = hasLogo ? \`\\n5. BRAND LOGO EMBEDDING (ABSOLUTELY CRITICAL): You MUST look for the brand logo region in the reference. You MUST COMPLETELY ERASE any generic logo present in the reference flyer. You MUST use the client's provided brand logo ("Referência de Logotipo") EXACTLY AS IT IS. DO NOT change its colors, DO NOT change its style, DO NOT remove any words. You MUST preserve the EXACT image-to-image 100% original fidelity of the logo. Put the EXACT SAME logo image directly into the generated card.\` : "";`;
code = code.replace(regexInclusion, replacementInclusion);

const regexComposition = /const logoCompositionRule = hasLogo \? `\\n10\. FULL COMPOSITION WITH HIGH-FIDELITY EMBEDDED TYPOGRAPHY AND LOGOS \(CRITICAL\)[\s\S]*?` : "";/g;
const replacementComposition = `const logoCompositionRule = hasLogo ? \`\\n10. FULL COMPOSITION WITH HIGH-FIDELITY EMBEDDED TYPOGRAPHY AND LOGOS (CRITICAL): Do NOT generate just a blank background. You MUST generate the complete graphic composition, including all layouts, panel cards, curved borders, divided sections, background textures, lighting setups, and the beautifully stylized subject photo, WITH all text layers and the client's original brand logo ("Referência de Logotipo") EXACTLY AS PROVIDED. Preserve the logo's original symbols, texts, exact branding structures, and original COLORS with absolute 100% fidelity. DO NOT adapt colors.\` : "";`;
code = code.replace(regexComposition, replacementComposition);

const regexPromptRule = /const logoPromptRule = hasLogo \? `\\n5\. Text & Logo Integration:[\s\S]*?` : "";/g;
const replacementPromptRule = `const logoPromptRule = hasLogo ? \`\\n5. Text & Logo Integration: Explicitly instruct the generator to analyze and replicate the provided brand logo ("Referência de Logotipo") with ABSOLUTE 100% EXACT image-to-image fidelity. Direct the generator to bake this EXACT logo directly on the card canvas, replacing any old logo from the reference. DO NOT change the color of the logo, DO NOT change shapes, DO NOT drop any words. Keep it 100% identical to the uploaded image. Also instruct it to ONLY use the text provided in the prompt, replacing any text from the reference while respecting the original text placements.\` : "";`;
code = code.replace(regexPromptRule, replacementPromptRule);

const regexMandatoryRule = /const logoMandatoryRule = logoBase64 \|\| \(logosList && logosList\.length > 0\)\n\s*\? `- BRAND LOGO CLONING \(MANDATORY\)[\s\S]*?`\n\s*: `- NO RANDOM LOGOS[\s\S]*?`;/g;
const replacementMandatoryRule = `const logoMandatoryRule = logoBase64 || (logosList && logosList.length > 0)
        ? \`- EXACT BRAND LOGO IMAGE-TO-IMAGE (MANDATORY): You MUST perfectly use the client's provided brand logo ("Referência de Logotipo") exactly as it is. You MUST completely erase any old logos from the Design Layout Reference image and perfectly draw the client's exact logo directly onto the image. ABSOLUTE CRITICAL RULE: YOU ARE STRICTLY FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE, TEXT, FONT, OR COLORS. DO NOT recolor the logo. Keep every word and element exactly as it is in the uploaded image.\`
        : \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.\`;`;
code = code.replace(regexMandatoryRule, replacementMandatoryRule);

fs.writeFileSync('server.ts', code);
