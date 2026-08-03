const fs = require('fs');
const content = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');
console.log(content.split('\n')[2784]);
