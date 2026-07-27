const fs = require('fs');
let code = fs.readFileSync('src/components/GeradorRoteiros.tsx', 'utf8');

const target1 = `data: img.url.split(',')[1],`;
const replacement1 = `data: img.url.includes(',') ? img.url.split(',')[1] : img.url,`;
code = code.replace(target1, replacement1);

const target2 = `files: m.images ? m.images.map(img => ({ data: img.split(',')[1], mimeType: 'image/jpeg' })) : []`;
const replacement2 = `files: m.images ? m.images.map(img => ({ data: img.includes(',') ? img.split(',')[1] : img, mimeType: 'image/jpeg' })) : []`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/GeradorRoteiros.tsx', code);
