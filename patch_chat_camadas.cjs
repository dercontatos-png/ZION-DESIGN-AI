const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const regex = /const newLayers = configJson\.camadasTexto\.map\(\(item: any, idx: number\) => \(\{[\s\S]*?\}\)\);/;

const replacement = `const currentLayers = store.camadasTexto || [];
          const newLayers = configJson.camadasTexto.map((item: any, idx: number) => {
             const existingLayer = currentLayers.find(l => l.funcao === item.funcao);
             return {
               id: existingLayer ? existingLayer.id : \`text_\${Date.now()}_\${idx}\`,
               conteudo: item.conteudo,
               funcao: item.funcao || "Corpo Descrição",
               fonte: item.fonte || (existingLayer ? existingLayer.fonte : "Outfit"),
               cor: item.cor || (existingLayer ? existingLayer.cor : "#ffffff")
             };
          });`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/ChatAssistente.tsx', code);
  console.log("Success");
} else {
  console.log("Not found");
}
