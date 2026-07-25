const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// replace the hook to always update if it's different and not manually set recently
// but honestly, just setting it if empty or if it differs from the known default
app = app.replace(
  'if (data.key && !myProfile.geminiApiKey) {',
  'if (data.key && myProfile.geminiApiKey !== data.key) {'
);

fs.writeFileSync('src/App.tsx', app);
console.log("Patched App.tsx");
