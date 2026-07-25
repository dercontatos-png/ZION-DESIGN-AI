const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 2870; i < 2960; i++) {
    console.log((i+1) + ": " + lines[i]);
}
