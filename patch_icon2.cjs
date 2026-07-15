const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');
code = code.replace(
  'import {\\n  ImageIcon,\\n useProjectStore }',
  'import { useProjectStore }'
);
code = code.replace(
  'import { ImageIcon,\\n useProjectStore }',
  'import { useProjectStore }'
);
code = code.replace(
  'import {\\n  ImageIcon, useProjectStore }',
  'import { useProjectStore }'
);

// Properly insert ImageIcon to lucide-react import
code = code.replace(
  'import {\\n  MessageSquare,',
  'import {\\n  ImageIcon,\\n  MessageSquare,'
);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
