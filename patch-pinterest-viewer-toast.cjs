const fs = require('fs');
let code = fs.readFileSync('src/components/PinterestViewer.tsx', 'utf8');

code = code.replace(/import \{ showToast \} from "\.\.\/utils\/toast";\n/g, "");
code = code.replace(/showToast\([^)]+\);/g, "");

fs.writeFileSync('src/components/PinterestViewer.tsx', code);
console.log("Removed showToast from PinterestViewer");
