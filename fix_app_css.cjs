const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  'activeTab === "ai-tools" || activeTab === "roteiros" || activeTab === "photo-editor" ?',
  'activeTab === "ai-tools" || activeTab === "roteiros" || activeTab === "photo-editor" || activeTab === "audio" ?'
);
fs.writeFileSync('src/App.tsx', code);
