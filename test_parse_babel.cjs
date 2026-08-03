const fs = require('fs');
const { parse } = require('@babel/parser');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

try {
    parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
    });
} catch (e) {
    console.log("Error at", e.loc);
    console.log("Line content:", code.split('\n')[e.loc.line - 1]);
}
