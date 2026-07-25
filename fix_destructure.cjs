const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /dimensao = "1:1",\n\s*somentePrompt = false\n\s*\} = req\.body;/;
const replacement = `dimensao = "1:1",
        somentePrompt = false,
        coresAutomaticas = true
      } = req.body;`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
