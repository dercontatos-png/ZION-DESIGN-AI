const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');
code = code.replace(/import \{([\s\S]*?)\} from "lucide-react";/, (match, p1) => {
  if (!p1.includes('Upload')) {
    return "import {" + p1 + ", Upload} from 'lucide-react';";
  }
  return match;
});
fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log('Import patched properly');
