const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex1 = /const logoSysInstructionRule = hasLogo \? `\\n5\. Logo & Text Replacement:[\s\S]*?` : "";/g;
const replacement1 = `const logoSysInstructionRule = hasLogo ? \`\\n5. Logo & Text Replacement: Instruct the generator to completely ignore any text, names, handles, or brand logos found in the background design reference. It must use ONLY the client's provided "Referência de Logotipo" EXACTLY as it is (without modifying any shapes, colors, or texts) and the explicitly requested text, pasting them directly on the card canvas with 100% complete exactness. Every piece of information provided in the prompt MUST be included in the final image.\` : "";`;
code = code.replace(regex1, replacement1);

const regex2 = /const logoEmbeddedRule = hasLogo \? `\\n9\. STRICT TYPOGRAPHY & LOGO REPLACEMENT RULE:[\s\S]*?` : "";/g;
const replacement2 = `const logoEmbeddedRule = hasLogo ? \`\\n9. STRICT TYPOGRAPHY & LOGO REPLACEMENT RULE: Dictate that the image generator MUST NOT hallucinate or copy old text/logos. It MUST print, write, embed, and render ONLY the provided texts, titles, words, acronyms, letters, numbers, and embed the provided brand logo ("Referência de Logotipo") EXACTLY AS PROVIDED (100% image-to-image fidelity) directly onto the image canvas. Ensure all provided information is present.\` : "";`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.ts', code);
