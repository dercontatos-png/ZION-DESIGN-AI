const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const toolbarIdx = code.indexOf('Action Toolbar - moved from overlay');
console.log(code.substring(toolbarIdx, toolbarIdx + 2000));
