const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove Jimp logo overlay block
code = code.replace(/\/\/ === JIMP LOGO OVERLAY ===[\s\S]*?bytes = buffer.length;/, 'bytes = buffer.length;');

fs.writeFileSync('server.ts', code);
