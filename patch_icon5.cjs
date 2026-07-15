const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

// The replacement was failing because of line breaks format
code = code.replace(
  /import \{\s*ImageIcon,\s*useProjectStore \}\s*from "\.\.\/store\/useProjectStore";/,
  'import { useProjectStore } from "../store/useProjectStore";'
);

code = code.replace(
  /import \{\s*MessageSquare,/,
  'import {\n  Image as ImageIcon,\n  MessageSquare,'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
