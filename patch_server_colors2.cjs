const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex3 = /7\. BRAND COLOR PALETTE ENFORCEMENT \(CRITICAL\): Look closely at the client's specification in: "\\\$\\{promptTraduzido\\}"\. If the client has provided custom brand colors[\s\S]*?styled under the client's custom brand colors\./;
const replacement3 = `7. BRAND COLOR PALETTE ENFORCEMENT (CRITICAL): \${!coresAutomaticas ? "The client HAS specified custom brand colors in the prompt. You MUST strictly enforce these custom brand colors as the primary, dominant colors of the flyer's design, lighting, glows, and accents. Do NOT copy the color palette of the Design Layout Reference! Instead, adapt the layout and atmospheric depth of the reference to be perfectly styled under the client's custom brand colors." : "The client HAS NOT specified custom colors. You MUST perfectly copy the exact original color palette, lighting colors, and gradient tones of the Design Layout Reference."}`;
code = code.replace(regex3, replacement3);

// And let's check if req.body destruction actually happened!
const regex1 = /dimensao,\n\s*somentePrompt\n\s*\} = req\.body;/;
const replacement1 = `dimensao,
      somentePrompt,
      coresAutomaticas
    } = req.body;`;
code = code.replace(regex1, replacement1);


fs.writeFileSync('server.ts', code);
