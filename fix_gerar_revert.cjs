const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove Jimp logo overlay block completely
code = code.replace(/\/\/ === JIMP LOGO OVERLAY ===[\s\S]*?bytes = buffer\.length;/g, 'bytes = buffer.length;');

// We will change the prompt to ALWAYS embed the logo natively if a logo is provided, 
// ignoring logoInclusionType because the user strictly wants the AI to generate it.
// We also need to allow color adjustments but STRICTLY forbid shape/font modifications.

const regex = /const logoInclusionRule =[\s\S]*?: "";/g;
const logoInclusionRule = `const logoInclusionRule = logoBase64 ? \`\\n5. BRAND LOGO EMBEDDING (ABSOLUTELY CRITICAL): You MUST look for the brand logo region in the reference. You MUST COMPLETELY ERASE any generic logo present in the reference flyer. You MUST DRAW, PAINT, and BAKE the client's provided brand logo ("Referência de Logotipo") directly into the image canvas. YOU ARE FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE OR FONT. The ONLY allowed modification is altering the logo's color (e.g., making it all white or all black) to ensure perfect contrast with the background. Otherwise, it must be an exact structural clone.\` : "";`;

const compRegex = /const logoCompositionRule =[\s\S]*?: "";/g;
const logoCompositionRule = `const logoCompositionRule = logoBase64 ? \`\\n10. FULL COMPOSITION WITH HIGH-FIDELITY EMBEDDED TYPOGRAPHY AND LOGOS (CRITICAL): Do NOT generate just a blank background. You MUST generate the complete graphic composition, including all layouts, panel cards, curved borders, divided sections, background textures, lighting setups, and the beautifully stylized subject photo, WITH all text layers and the client's original brand logo ("Referência de Logotipo") professionally rendered, printed, and embedded directly inside their corresponding visual sectors as beautiful, crisp, un-deformed elements, preserving the logo's original symbols, texts, and exact branding structures with 100% fidelity (color adaptation for contrast is allowed).\` : "";`;

const promptRegex = /const logoPromptRule =[\s\S]*?: "";/g;
const logoPromptRule = `const logoPromptRule = logoBase64 ? \`\\n5. Text & Logo Integration: Explicitly instruct the generator to analyze and replicate the provided brand logo ("Referência de Logotipo") with 100% exact structural fidelity. Direct the generator to print, draw, and bake this logo directly on the card canvas, replacing any old logo from the reference. Color changes to the logo (e.g. to white) for better contrast are allowed, but shapes and fonts must not change. Also instruct it to ONLY use the text provided in the prompt, replacing any text from the reference while respecting the original text placements.\` : "";`;

const printRegex = /const logoPrintRule =[\s\S]*?: "";/g;
const logoPrintRule = `const logoPrintRule = logoBase64 ? \`\\n9. EXACT TEXT & LOGO REPLACEMENT: Explicitly instruct the generator to NEVER copy text or logos from the Design Reference. It must print all specified titles, social handles, event details, and the brand logo reference directly on the flyer, ensuring old text/logos from the reference are completely erased and replaced by the new ones requested. If a specific information piece was provided in the prompt, it MUST be placed exactly where the corresponding information was in the reference.\` : "";`;

const sysRegex = /const logoSysInstructionRule =[\s\S]*?: "";/g;
const logoSysInstructionRule = `const logoSysInstructionRule = logoBase64 ? \`\\n5. Logo & Text Replacement: Instruct the generator to completely ignore any text, names, handles, or brand logos found in the background design reference. It must use ONLY the client's provided "Referência de Logotipo" and the explicitly requested text, drawing and printing them directly on the card canvas with 100% complete exactness. Every piece of information provided in the prompt MUST be included in the final image.\` : "";`;

const embeddedRegex = /const logoEmbeddedRule =[\s\S]*?: "";/g;
const logoEmbeddedRule = `const logoEmbeddedRule = logoBase64 ? \`\\n9. STRICT TYPOGRAPHY & LOGO REPLACEMENT RULE: Dictate that the image generator MUST NOT hallucinate or copy old text/logos. It MUST print, write, embed, and render ONLY the provided texts, titles, words, acronyms, letters, numbers, and the provided brand logo ("Referência de Logotipo") directly onto the image canvas. Ensure all provided information is present.\` : "";`;

const mandatoryRegex = /const logoMandatoryRule =[\s\S]*?from the reference image\.`;/g;
const logoMandatoryRule = `const logoMandatoryRule = logoBase64
        ? \`- BRAND LOGO CLONING (MANDATORY): You MUST perfectly clone the client's provided brand logo ("Referência de Logotipo"). You MUST completely erase any old logos from the Design Layout Reference image and perfectly draw the client's logo directly onto the image. ABSOLUTE CRITICAL RULE: YOU ARE STRICTLY FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE, TEXT, OR FONT. The only allowed change is recoloring the logo (e.g. changing dark blue to white) if necessary for background contrast.\`
        : \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.\`;`;

code = code.replace(regex, logoInclusionRule)
           .replace(compRegex, logoCompositionRule)
           .replace(promptRegex, logoPromptRule)
           .replace(printRegex, logoPrintRule)
           .replace(sysRegex, logoSysInstructionRule)
           .replace(embeddedRegex, logoEmbeddedRule)
           .replace(mandatoryRegex, logoMandatoryRule);

fs.writeFileSync('server.ts', code);
