const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const galleryIdx = code.indexOf('<div className="w-full md:w-[240px]');
console.log(code.substring(galleryIdx, galleryIdx + 1000));
