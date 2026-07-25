const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /4\. IMAGE-TO-IMAGE REPLICATION & SECONDARY MOTIFS: The generator must act as an image-to-image engine\. You must explicitly describe ALL elements in the Design Layout Reference: every single icon, 3D element, texture, depth-of-field effect, gradient, drop shadow, glowing particle, and structural graphic\. Tell the generator it must recreate all of these elements identically with 100% fidelity, leaving nothing out\. Look for any secondary photos or decorative graphics in the reference card\.\.\. Look for any secondary photos or decorative graphics in the reference card\. For instance, if there is a photo of people's hands joining, hands holding, or any supporting imagery, you MUST specify its presence and describe its integration: "subtly integrated into the bottom or background layer is a clear, polished photographic motif of people's hands joining together, representing connection, with warm rim lighting\."/;
const replacement = `4. SIMPLICITY AND FOCUS (CRITICAL): Keep your description CONCISE and HIGH-QUALITY. DO NOT write gigantic, overly verbose paragraphs describing every single microscopic particle. Describe the core structural layout, the lighting, the background environment, and the main subject gracefully. Giant prompts confuse the image generator and cause hallucinations. Less is more.`;
code = code.replace(regex, replacement);

const regex2 = /1\. STRICT DESIGN FIDELITY & NO ARBITRARY INVENTIONS: You are strictly FORBIDDEN from inventing arbitrary backdrops, stage lights, lasers, smoke, stars, gold particles, dust, or geometric layers unless they are explicitly visible in the "Design Layout Reference" image\./;
const replacement2 = `1. NO HALLUCINATIONS & NO ARBITRARY INVENTIONS: You are strictly FORBIDDEN from inventing arbitrary backdrops, stage lights, lasers, smoke, stars, gold particles, dust, or geometric layers. Keep the design clean and high-end.`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.ts', code);
