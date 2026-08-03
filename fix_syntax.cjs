const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `        if (out.type === "text" && out.text) {
          // It could be lyrics or description, append both or just lyrics
          lyrics += out.text + "\\n\\n";
        }
      }
      }

      res.json({ audioBase64, lyrics, mimeType });`;

const newCode = `        if (out.type === "text" && out.text) {
          // It could be lyrics or description, append both or just lyrics
          lyrics += out.text + "\\n\\n";
        }
      }

      res.json({ audioBase64, lyrics, mimeType });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
