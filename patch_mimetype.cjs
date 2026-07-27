const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/mimeType: ref.mimeType /g, 'mimeType: ref.mimeType || "image/jpeg" ');
code = code.replace(/mimeType: ref.mimeType\n/g, 'mimeType: ref.mimeType || "image/jpeg"\n');
code = code.replace(/mimeType: ref.mimeType }/g, 'mimeType: ref.mimeType || "image/jpeg" }');
code = code.replace(/mimeType: logo.mimeType }/g, 'mimeType: logo.mimeType || "image/jpeg" }');
code = code.replace(/mimeType: parsed.mimeType\n/g, 'mimeType: parsed.mimeType || "image/jpeg"\n');
fs.writeFileSync('server.ts', code);
