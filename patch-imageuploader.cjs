const fs = require('fs');
let code = fs.readFileSync('src/components/ImageUploader.tsx', 'utf8');

code = code.replace(
  'showToast: (msg: string, type: "success" | "error" | "warning") => void;\n}',
  'showToast: (msg: string, type: "success" | "error" | "warning") => void;\n  maxUploads?: number;\n}'
);

code = code.replace(
  'showToast\n}) => {',
  'showToast,\n  maxUploads\n}) => {'
);

code = code.replace(
  'onUpdateBase64s([...currentList, ...processedBase64s]);',
  'if (maxUploads === 1) {\n          onUpdateBase64s([processedBase64s[processedBase64s.length - 1]]);\n        } else {\n          onUpdateBase64s([...currentList, ...processedBase64s]);\n        }'
);

fs.writeFileSync('src/components/ImageUploader.tsx', code);
console.log("Patched ImageUploader.");
