const fs = require('fs');
const code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// Print out the structure of the main row (flex-col md:flex-row)
const startRow = code.indexOf('<div className="flex-1 flex flex-col md:flex-row overflow-hidden">');
const block = code.substring(startRow, startRow + 5000); // rough chunk
console.log(block.substring(0, 1000));
