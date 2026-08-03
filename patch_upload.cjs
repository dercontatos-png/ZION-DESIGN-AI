const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/fs\.writeFileSync\(credentialsPath, JSON\.stringify\(parsed, null, 2\)\);/g, `
      try {
        fs.writeFileSync(credentialsPath, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.warn("Could not save credentials to disk on this environment, saving to /tmp instead.");
        credentialsPath = require('path').join(require('os').tmpdir(), "chave-vertex.json");
        try { fs.writeFileSync(credentialsPath, JSON.stringify(parsed, null, 2)); } catch(e2){}
      }
`);

fs.writeFileSync('server.ts', code);
