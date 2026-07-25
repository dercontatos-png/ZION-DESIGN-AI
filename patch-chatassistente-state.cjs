const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  'const [isExpanded, setIsExpanded] = useState(false);',
  'const [isExpanded, setIsExpanded] = useState(false);\n  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.6-flash");\n  const [showModelSettings, setShowModelSettings] = useState(false);'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched state.");
