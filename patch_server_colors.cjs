const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Get coresAutomaticas from req.body
const regex1 = /dimensao,\n\s*somentePrompt\n\s*\} = req\.body;/;
const replacement1 = `dimensao,
      somentePrompt,
      coresAutomaticas
    } = req.body;`;
code = code.replace(regex1, replacement1);

// 2. Adjust color enforcement rule in expansion prompt
const regex2 = /CRITICAL OVERRIDE: If the client specifies custom brand colors in their layout specification \(e\.g\. "Color Palette: #xxxxxx" or explicit ambient, rim, and complementary colors\), you MUST completely override the reference's color palette with the client's custom brand colors\./;
const replacement2 = `CRITICAL OVERRIDE: \${!coresAutomaticas ? "The client HAS specified custom brand colors. You MUST completely override the reference's color palette with the client's custom brand colors." : "The client HAS NOT specified custom colors. You MUST strictly copy the original color palette of the Design Layout Reference."}`;
code = code.replace(regex2, replacement2);

const regex3 = /7\. BRAND COLOR PALETTE ENFORCEMENT \(CRITICAL\): Look closely at the client's specification in: "\\$\\{promptTraduzido\\}"\. If the client has provided custom brand colors, specific hex codes \(#xxxxxx\), or specific colors for "Color Palette" or "Lighting Setup" \(e\.g\., specific ambient color, rim color, or fill color\), you MUST strictly enforce these custom brand colors as the primary, dominant colors of the flyer's design, lighting, glows, and accents\. Do NOT copy the color palette of the Design Layout Reference if the client has specified their own custom brand colors! Instead, adapt the layout, composition structure, and atmospheric depth of the reference to be perfectly styled under the client's custom brand colors\./;
const replacement3 = `7. BRAND COLOR PALETTE ENFORCEMENT (CRITICAL): \${!coresAutomaticas ? "The client HAS specified custom brand colors in the prompt. You MUST strictly enforce these custom brand colors as the primary, dominant colors of the flyer's design, lighting, glows, and accents. Do NOT copy the color palette of the Design Layout Reference! Instead, adapt the layout and atmospheric depth of the reference to be perfectly styled under the client's custom brand colors." : "The client HAS NOT specified custom colors. You MUST perfectly copy the exact original color palette, lighting colors, and gradient tones of the Design Layout Reference."}`;
code = code.replace(regex3, replacement3);

const regex4 = /- BRAND COLOR PALETTE ENFORCEMENT \(CRITICAL\): If custom colors, hex codes, or light setup colors are specified in the prompt above, you MUST strictly and aggressively use those EXACT colors for the entire graphic composition, background panels, highlights, glows, and ambient lighting\. You MUST completely OVERRIDE the original reference flyer's colors with the requested colors\. Do NOT use the reference colors if custom colors are provided!/;
const replacement4 = `- BRAND COLOR PALETTE ENFORCEMENT (CRITICAL): \${!coresAutomaticas ? "The client HAS specified custom brand colors in the prompt. You MUST strictly and aggressively use those EXACT colors for the entire graphic composition, background panels, highlights, glows, and ambient lighting. You MUST completely OVERRIDE the original reference flyer's colors with the requested colors." : "The client HAS NOT specified custom colors. You MUST perfectly copy the exact original color palette of the Design Layout Reference."}`;
code = code.replace(regex4, replacement4);

fs.writeFileSync('server.ts', code);
