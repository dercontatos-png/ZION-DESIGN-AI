const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add logoPosOverlay and logoSizeOverlay to the destructured body of /api/gerar
code = code.replace(/logoInclusionType = "overlay",/, 'logoInclusionType = "overlay",\n        logoPosOverlay = "top_center",\n        logoSizeOverlay = 20,');

fs.writeFileSync('server.ts', code);
