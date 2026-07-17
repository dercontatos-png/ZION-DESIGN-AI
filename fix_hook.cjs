const fs = require('fs');
let code = fs.readFileSync('src/hooks/useGenerateImage.ts', 'utf8');

code = code.replace(/logoInclusionType: store.logoInclusionType \|\| "overlay",/, 'logoInclusionType: store.logoInclusionType || "overlay",\n      logoPosOverlay: store.logoPosOverlay || "top_center",\n      logoSizeOverlay: store.logoSizeOverlay || 20,');

fs.writeFileSync('src/hooks/useGenerateImage.ts', code);
