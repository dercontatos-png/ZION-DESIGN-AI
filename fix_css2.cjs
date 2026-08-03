const fs = require('fs');

let content = fs.readFileSync('src/components/AudioStudio.tsx', 'utf-8');
content = content.replace(/bg-gray-600/g, 'bg-white/10');
fs.writeFileSync('src/components/AudioStudio.tsx', content, 'utf-8');
