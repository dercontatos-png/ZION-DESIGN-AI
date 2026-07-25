const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex1 = /4\. SECONDARY PHOTOS & VISUAL MOTIFS:/g;
const replacement1 = `4. IMAGE-TO-IMAGE REPLICATION & SECONDARY MOTIFS: The generator must act as an image-to-image engine. You must explicitly describe ALL elements in the Design Layout Reference: every single icon, 3D element, texture, depth-of-field effect, gradient, drop shadow, glowing particle, and structural graphic. Tell the generator it must recreate all of these elements identically with 100% fidelity, leaving nothing out. Look for any secondary photos or decorative graphics in the reference card...`;
code = code.replace(regex1, replacement1);

const regex2 = /- EXACT VISUAL CLONE OF DESIGN REFERENCE: You MUST perfectly trace and clone the exact shapes, layout grids, panel structures, background gradients, textures, and geometric dimensions of the provided Design Layout Reference\. Do NOT invent new shapes, structures, or change the composition grid\. It must look 100% identical in layout and structural design, simply applying the new text, logos, and colors\./g;
const replacement2 = `- EXACT VISUAL CLONE OF DESIGN REFERENCE (IMAGE-TO-IMAGE): You MUST act as an Image-to-Image engine. You MUST perfectly trace and clone the exact shapes, layout grids, panel structures, background gradients, textures, geometric dimensions, 3D elements, icons, particles, lighting effects, and overall depth of the provided Design Layout Reference. Do NOT invent new shapes, structures, or change the composition grid. It must look 100% identical in layout, structural design, and visual elements, simply applying the new text, logos, and colors.`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.ts', code);
