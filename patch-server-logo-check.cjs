const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '// 7. Add Logo References\n      if (logoBase64) {\n        addImagePart(logoBase64, "Referência de Logotipo");\n      }\n      if (Array.isArray(logosList)) {\n        logosList.forEach((ref: any, idx: number) => {\n          if (ref) addImagePart(ref, `Referência de Logotipo Adicional ${idx + 1}`);\n        });\n      }',
  '// 7. Add Logo References\n      if (useLogo) {\n        if (logoBase64) {\n          addImagePart(logoBase64, "Referência de Logotipo");\n        }\n        if (Array.isArray(logosList)) {\n          logosList.forEach((ref: any, idx: number) => {\n            if (ref) addImagePart(ref, `Referência de Logotipo Adicional ${idx + 1}`);\n          });\n        }\n      }'
);

fs.writeFileSync('server.ts', code);
console.log("Patched logo check.");
