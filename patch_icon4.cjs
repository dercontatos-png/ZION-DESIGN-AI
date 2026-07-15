const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

// Fix the incorrect import
code = code.replace(
  'import {\\n  ImageIcon, useProjectStore } from "../store/useProjectStore";',
  'import { useProjectStore } from "../store/useProjectStore";'
);

code = code.replace(
  'import {\\n  MessageSquare,',
  'import {\\n  ImageIcon,\\n  MessageSquare,'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
