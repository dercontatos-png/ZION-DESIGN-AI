const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

code = code.replace(/Instagram\n  Upload,\n\} from "lucide-react";/, 'Instagram,\n  Upload,\n} from "lucide-react";');
fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log('Import patched');
