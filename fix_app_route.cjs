const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tabRenderOriginal = `          {activeTab === "photo-editor" && (
            <PhotoEditor />
          )}`;

const tabRenderReplacement = `          {activeTab === "photo-editor" && (
            <PhotoEditor />
          )}
          {activeTab === "audio" && (
            <AudioStudio />
          )}`;

code = code.replace(tabRenderOriginal, tabRenderReplacement);
fs.writeFileSync('src/App.tsx', code);
