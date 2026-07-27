const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `            h.files.forEach((file: any) => {
              if (file.name) {
                parts.push({ text: \`[Imagem Anexada: \${file.name}]\` });
              }
              parts.push({
                inlineData: {
                  data: file.data,
                  mimeType: file.type
                }
              });
            });`;

const replacement1 = `            h.files.forEach((file: any) => {
              if (file.name) {
                parts.push({ text: \`[Imagem Anexada: \${file.name}]\` });
              }
              parts.push({
                inlineData: {
                  data: file.data,
                  mimeType: file.mimeType || file.type || "image/jpeg"
                }
              });
            });`;

code = code.replace(target1, replacement1);

const target2 = `        attachedFiles.forEach((file: any) => {
          if (file.name) {
            userParts.push({ text: \`[Imagem Anexada: \${file.name}]\` });
          }
          userParts.push({
            inlineData: {
              data: file.data,
              mimeType: file.type
            }
          });
        });`;

const replacement2 = `        attachedFiles.forEach((file: any) => {
          if (file.name) {
            userParts.push({ text: \`[Imagem Anexada: \${file.name}]\` });
          }
          userParts.push({
            inlineData: {
              data: file.data,
              mimeType: file.mimeType || file.type || "image/jpeg"
            }
          });
        });`;

code = code.replace(target2, replacement2);
fs.writeFileSync('server.ts', code);
