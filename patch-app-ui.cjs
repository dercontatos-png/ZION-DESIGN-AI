const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'Gemini Flash (Rápido)\n              </button>',
  '<Zap size={14} /> Flash\n              </button>'
);

code = code.replace(
  'Gemini Pro Image\n              </button>',
  '<Sparkles size={14} /> Pro\n              </button>'
);

code = code.replace(
  'className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${selectedModel === "gemini-3.6-flash"',
  'className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs rounded-lg transition-all ${selectedModel === "gemini-3.6-flash"'
);

code = code.replace(
  'className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${selectedModel === "gemini-3-pro-image"',
  'className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 text-xs rounded-lg transition-all ${selectedModel === "gemini-3-pro-image"'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched UI App.tsx");
