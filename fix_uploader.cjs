const fs = require('fs');
let code = fs.readFileSync('src/components/ImageUploader.tsx', 'utf8');

code = code.replace(/canvas\.toDataURL\("image\/jpeg", quality\)/g, 'canvas.toDataURL("image/webp", quality)');

fs.writeFileSync('src/components/ImageUploader.tsx', code);
