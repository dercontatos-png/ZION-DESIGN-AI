const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

const target1 = `              ) : activeImage ? (
                <div 
                  className="relative group w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-4"`;

const replacement1 = `              ) : activeImage ? (
                <div 
                  className="relative group w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden p-2 sm:p-4"`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('src/components/DesignBuilder.tsx', code);
    console.log("Layout patched successfully!");
} else {
    console.log("Pattern not found");
}
