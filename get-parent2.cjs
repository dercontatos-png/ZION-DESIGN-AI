const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes(') : activeImage ? ('));

if (startIndex > -1) {
    for (let i = Math.max(0, startIndex - 85); i < Math.min(lines.length, startIndex - 50); i++) {
        console.log((i+1) + ": " + lines[i]);
    }
}
