const fs = require('fs');
const { parse } = require('@babel/parser');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

try {
    parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
    });
    console.log("Parsed successfully!");
} catch (e) {
    console.log("Syntax error:");
    console.log(e.message);
}
