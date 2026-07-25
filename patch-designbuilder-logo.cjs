const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

code = code.replace(
  'base64s={store.logosList || []}\n                  onUpdateBase64s={store.setLogosList}\n                  showToast={showToast}',
  'base64s={store.logosList || []}\n                  onUpdateBase64s={store.setLogosList}\n                  showToast={showToast}\n                  maxUploads={1}'
);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("Patched Logo Uploader in DesignBuilder.");
