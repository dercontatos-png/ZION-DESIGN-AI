const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const logoInclusionRule = logoBase64 \? `[\\s\\S]*?` : "";/g;
code = code.replace(regex, `const logoInclusionRule = (logoBase64 && logoInclusionType === "embedded") ? \`\\n5. BRAND LOGO EMBEDDING (ABSOLUTELY CRITICAL): You MUST look for the brand logo region in the reference. You MUST COMPLETELY ERASE any generic logo present in the reference flyer. You MUST command the generator to DRAW, PAINT, and BAKE the client's provided brand logo ("Referência de Logotipo") directly into the image canvas. The logo must be perfectly integrated into the design. YOU ARE FORBIDDEN FROM MODIFYING THE LOGO. YOU MUST CREATE A 100% PERFECT, EXACT PIXEL CLONE OF THE PROVIDED LOGO. Do NOT alter fonts, do not alter shapes, do not alter spacing. It must be identical.\` : "";`);

const compRegex = /const logoCompositionRule = logoBase64 \? `[\\s\\S]*?` : "";/g;
code = code.replace(compRegex, `const logoCompositionRule = (logoBase64 && logoInclusionType === "embedded") ? \`\\n10. FULL COMPOSITION WITH HIGH-FIDELITY EMBEDDED TYPOGRAPHY AND LOGOS (CRITICAL): Do NOT generate just a blank background. You MUST generate the complete graphic composition, including all layouts, panel cards, curved borders, divided sections, background textures, lighting setups, and the beautifully stylized subject photo, WITH all text layers and the client's original brand logo ("Referência de Logotipo") professionally rendered, printed, and embedded directly inside their corresponding visual sectors as beautiful, crisp, un-deformed elements, preserving the logo's original symbols, texts, and exact branding with 100% fidelity.\` : "";`);

const promptRegex = /const logoPromptRule = logoBase64 \? `[\\s\\S]*?` : "";/g;
code = code.replace(promptRegex, `const logoPromptRule = (logoBase64 && logoInclusionType === "embedded") ? \`\\n5. Text & Logo Integration: Explicitly instruct the generator to analyze and replicate the provided brand logo ("Referência de Logotipo") with 100% exact fidelity. Direct the generator to print, draw, and bake this logo directly on the card canvas, replacing any old logo from the reference. Also instruct it to ONLY use the text provided in the prompt, replacing any text from the reference.\` : "";`);

const printRegex = /const logoPrintRule = logoBase64 \? `[\\s\\S]*?` : "";/g;
code = code.replace(printRegex, `const logoPrintRule = (logoBase64 && logoInclusionType === "embedded") ? \`\\n9. EXACT TEXT & LOGO REPLACEMENT: Explicitly instruct the generator to NEVER copy text or logos from the Design Reference. It must print all specified titles, social handles, event details, and the brand logo reference directly on the flyer, ensuring old text/logos from the reference are completely erased and replaced by the new ones requested.\` : "";`);

const sysRegex = /const logoSysInstructionRule = logoBase64 \? `[\\s\\S]*?` : "";/g;
code = code.replace(sysRegex, `const logoSysInstructionRule = (logoBase64 && logoInclusionType === "embedded") ? \`\\n5. Logo & Text Replacement: Instruct the generator to completely ignore any text, names, handles, or brand logos found in the background design reference. It must use ONLY the client's provided "Referência de Logotipo" and the explicitly requested text, drawing and printing them directly on the card canvas with 100% complete exactness.\` : "";`);

const embeddedRegex = /const logoEmbeddedRule = logoBase64 \? `[\\s\\S]*?` : "";/g;
code = code.replace(embeddedRegex, `const logoEmbeddedRule = (logoBase64 && logoInclusionType === "embedded") ? \`\\n9. STRICT TYPOGRAPHY & LOGO REPLACEMENT RULE: Dictate that the image generator MUST NOT hallucinate or copy old text/logos. It MUST print, write, embed, and render ONLY the provided texts, titles, words, acronyms, letters, numbers, and the provided brand logo ("Referência de Logotipo") directly onto the image canvas.\` : "";`);

const mandatoryRegex = /const logoMandatoryRule = logoBase64[\s\S]*?: `- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.`;/g;
code = code.replace(mandatoryRegex, `const logoMandatoryRule = logoBase64
        ? \`- BRAND LOGO CLONING (MANDATORY): You MUST perfectly clone the client's provided brand logo ("Referência de Logotipo"). You MUST completely erase any old logos from the Design Layout Reference image and perfectly draw the client's logo directly onto the image. ABSOLUTE CRITICAL RULE: YOU ARE STRICTLY FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE, TEXT, OR FONT. It must be a 100% exact pixel-perfect clone.\`
        : \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.\`;`);

// Wait, if it's overlay, we should tell the model to ERASE all logos and leave it blank so Jimp can overlay cleanly.
code = code.replace(/const logoMandatoryRule = logoBase64[\s\S]*?: `- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.`;/, `const logoMandatoryRule = (logoBase64 && logoInclusionType === "embedded")
        ? \`- BRAND LOGO CLONING (MANDATORY): You MUST perfectly clone the client's provided brand logo ("Referência de Logotipo"). You MUST completely erase any old logos from the Design Layout Reference image and perfectly draw the client's logo directly onto the image. ABSOLUTE CRITICAL RULE: YOU ARE STRICTLY FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE, TEXT, OR FONT. It must be a 100% exact pixel-perfect clone.\`
        : \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.\`;`);

fs.writeFileSync('server.ts', code);
