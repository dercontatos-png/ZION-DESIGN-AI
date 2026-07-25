const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const processedBuffer = await pipeline\.toBuffer\(\);/g, 'const processedBuffer = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer(); mimeType = "image/jpeg";');

fs.writeFileSync('server.ts', code);
