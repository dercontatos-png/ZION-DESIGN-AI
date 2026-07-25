const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  '// Aplica a Paleta de Cores do cliente\n        if (client.paletaCores && client.paletaCores.length > 0) {\n          const newColors = { ...store.cores };\n          newColors.ambiente = client.paletaCores[0] || "#000000";\n          newColors.recorte = client.paletaCores[1] || "#ffffff";\n          newColors.complementar = client.paletaCores[2] || "#c5a880";\n          delete newColors.paleta;\n          \n          store.updateConfig({ cores: newColors, coresAutomaticas: false });\n          if (!filledItems.includes("Paleta do Cliente")) filledItems.push("Paleta do Cliente");\n        }',
  '// Aplica a Paleta de Cores do cliente apenas se a IA não sugeriu cores novas\n        if (client.paletaCores && client.paletaCores.length > 0 && !updates.cores) {\n          const newColors = { ...store.cores };\n          newColors.ambiente = client.paletaCores[0] || "#000000";\n          newColors.recorte = client.paletaCores[1] || "#ffffff";\n          newColors.complementar = client.paletaCores[2] || "#c5a880";\n          delete newColors.paleta;\n          \n          store.updateConfig({ cores: newColors, coresAutomaticas: false });\n          if (!filledItems.includes("Paleta do Cliente")) filledItems.push("Paleta do Cliente");\n        }'
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched chat colors.");
