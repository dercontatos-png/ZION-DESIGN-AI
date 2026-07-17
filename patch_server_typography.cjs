const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /let fullPrompt = expandedPrompt;/;

const newCode = `let fullPrompt = expandedPrompt;

      // Extract typography block from the original prompt to ensure it is NOT lost in LLM translation
      const typoMatch = promptTraduzido.match(/=== TYPOGRAPHY & TEXT LAYOUT ===[\\s\\S]*?(?=\\n===|$)/);
      if (typoMatch && typoMatch[0]) {
        fullPrompt += "\\n\\n" + typoMatch[0];
      }
      
      // Also extract color palette if present
      const colorMatch = promptTraduzido.match(/Color Palette: [^\\n]*/);
      if (colorMatch && colorMatch[0]) {
        fullPrompt += "\\n\\n" + colorMatch[0];
      }
`;

code = code.replace(regex, newCode);
fs.writeFileSync('server.ts', code);
