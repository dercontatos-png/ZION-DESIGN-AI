const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex1 = /const logoMandatoryRule = logoBase64\n\s*\? \`- BRAND LOGO CLONING \(MANDATORY\): You MUST perfectly clone the client's provided brand logo \("Referência de Logotipo"\)\. You MUST completely erase any old logos from the Design Layout Reference image and perfectly draw the client's logo directly onto the image\. ABSOLUTE CRITICAL RULE: YOU ARE STRICTLY FORBIDDEN FROM MODIFYING THE LOGO'S SHAPE, TEXT, OR FONT\. The only allowed change is recoloring the logo \(e\.g\. changing dark blue to white\) if necessary for background contrast\.\`\n\s*: \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided\. Erase any existing logos from the reference image\.\`;/g;

const replacement1 = `const logoMandatoryRule = logosList && logosList.length > 0
        ? \`- LOGO PLACEMENT: Do NOT attempt to draw, write, or hallucinate the logo. The UI will automatically overlay the client's logo on top of the image later. You must leave an appropriate empty space (preferably at the top center) for the logo to be placed. Do NOT generate any text for the logo.\`
        : \`- NO RANDOM LOGOS: Do not invent or hallucinate logos if not provided. Erase any existing logos from the reference image.\`;`;

const regex2 = /const logoPromptRule = logoBase64 \? \`\\n5\. Text & Logo Integration: Explicitly instruct the generator to analyze and replicate the provided brand logo \("Referência de Logotipo"\) with 100% exact structural fidelity\. Direct the generator to print, draw, and bake this logo directly on the card canvas, replacing any old logo from the reference\. Color changes to the logo \(e\.g\. to white\) for better contrast are allowed, but shapes and fonts must not change\. Also instruct it to ONLY use the text provided in the prompt, replacing any text from the reference while respecting the original text placements\.\` : "";/g;

const replacement2 = `const logoPromptRule = logosList && logosList.length > 0 ? \`\\n5. Text & Logo Integration: Explicitly instruct the generator to NOT draw any logos. The system will overlay the original logo file on top of the generated image. Instruct it to ONLY use the text provided in the prompt, replacing any text from the reference while respecting the original text placements, and leave space for the logo.\` : "";`;

const regex3 = /const logoPrintRule = logoBase64 \? \`\\n9\. EXACT TEXT & LOGO REPLACEMENT: Explicitly instruct the generator to NEVER copy text or logos from the Design Reference\. It must print all specified titles, social handles, event details, and the brand logo reference directly on the flyer, ensuring old text\/logos from the reference are completely erased and replaced by the new ones requested\. If a specific information piece was provided in the prompt, it MUST be placed exactly where the corresponding information was in the reference\.\` : "";/g;

const replacement3 = `const logoPrintRule = logosList && logosList.length > 0 ? \`\\n9. EXACT TEXT REPLACEMENT: Explicitly instruct the generator to NEVER copy text or logos from the Design Reference. It must print all specified titles, social handles, and event details. It MUST NOT draw any logos.\` : "";`;

const regex4 = /const logoSysInstructionRule = logoBase64 \? \`\\n5\. Logo & Text Replacement: Instruct the generator to completely ignore any text, names, handles, or brand logos found in the background design reference\. It must use ONLY the client's provided "Referência de Logotipo" and the explicitly requested text, drawing and printing them directly on the card canvas with 100% complete exactness\. Every piece of information provided in the prompt MUST be included in the final image\.\` : "";/g;

const replacement4 = `const logoSysInstructionRule = logosList && logosList.length > 0 ? \`\\n5. Logo & Text Replacement: Instruct the generator to completely ignore any text, names, handles, or brand logos found in the background design reference. It must use ONLY the explicitly requested text, drawing and printing them directly on the card canvas with 100% complete exactness.\` : "";`;

const regex5 = /const logoEmbeddedRule = logoBase64 \? \`\\n9\. STRICT TYPOGRAPHY & LOGO REPLACEMENT RULE: Dictate that the image generator MUST NOT hallucinate or copy old text\/logos\. It MUST print, write, embed, and render ONLY the provided texts, titles, words, acronyms, letters, numbers, and the provided brand logo \("Referência de Logotipo"\) directly onto the image canvas\. Ensure all provided information is present\.\` : "";/g;

const replacement5 = `const logoEmbeddedRule = logosList && logosList.length > 0 ? \`\\n9. STRICT TYPOGRAPHY REPLACEMENT RULE: Dictate that the image generator MUST NOT hallucinate or copy old text/logos. It MUST print, write, embed, and render ONLY the provided texts, titles, words, acronyms, letters, numbers directly onto the image canvas.\` : "";`;

code = code.replace(regex1, replacement1);
code = code.replace(regex2, replacement2);
code = code.replace(regex3, replacement3);
code = code.replace(regex4, replacement4);
code = code.replace(regex5, replacement5);
fs.writeFileSync('server.ts', code);
