const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /if \(configJson\.camadasTexto && Array\.isArray\(configJson\.camadasTexto\)\) \{[\s\S]*?\} else if \(isReplaceMode\) \{/;
const replacement = `if (configJson.camadasTexto && Array.isArray(configJson.camadasTexto)) {
          updates.enableTypography = true;
          if (isReplaceMode) {
             updates.camadasTexto = configJson.camadasTexto.map((item, idx) => ({
                 id: \`text_\${Date.now()}_\${idx}\`,
                 conteudo: item.conteudo,
                 funcao: item.funcao || "Corpo Descrição",
                 fonte: item.fonte || "Outfit",
                 cor: item.cor || "#ffffff"
             }));
             filledItems.push(\`\${updates.camadasTexto.length} Textos (Substituídos)\`);
          } else {
             const updatedLayers = [...(store.camadasTexto || [])];
             configJson.camadasTexto.forEach((item) => {
                 const existingIdx = updatedLayers.findIndex(l => l.funcao === item.funcao);
                 if (existingIdx !== -1) {
                     updatedLayers[existingIdx] = {
                         ...updatedLayers[existingIdx],
                         conteudo: item.conteudo !== undefined ? item.conteudo : updatedLayers[existingIdx].conteudo,
                         fonte: item.fonte || updatedLayers[existingIdx].fonte,
                         cor: item.cor || updatedLayers[existingIdx].cor,
                     };
                 } else {
                     updatedLayers.push({
                         id: \`text_\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}\`,
                         conteudo: item.conteudo,
                         funcao: item.funcao || "Corpo Descrição",
                         fonte: item.fonte || "Outfit",
                         cor: item.cor || "#ffffff"
                     });
                 }
             });
             updates.camadasTexto = updatedLayers;
             filledItems.push(\`\${configJson.camadasTexto.length} Textos (Atualizados/Adicionados)\`);
          }
        } else if (isReplaceMode) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ChatAssistente.tsx', code);
