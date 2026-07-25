const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /try \{\n\s*console\.log\(\`\[api\/gerar\] Calling generateImages with model: imagen-3\.0-generate-002\`\);\n\s*const fallbackResponse = await \(client\.models as any\)\.generateImages\(\{/g;
const replacement = `try {
            console.log(\`[api/gerar] Calling generateImages with model: imagen-3.0-generate-002\`);
            
            // Create a dedicated client for Imagen 3 in us-central1 because it's not available in global
            const token = customApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyC3seHAMIgwPRxb-Ts1Q3Xds2PAL4mR89Q';
            const credentialsPath = path.join(process.cwd(), 'chave-vertex.json');
            const hasChaveVertex = fs.existsSync(credentialsPath);
            const fallbackClient = new GoogleGenAI({
              vertexai: true,
              project: "gerador-de-imagens-ia-502303",
              location: "us-central1",
              ...(hasChaveVertex ? { googleAuthOptions: { keyFilename: credentialsPath } } : {})
            });
            
            const fallbackResponse = await (fallbackClient.models as any).generateImages({`;

code = code.replace(regex, replacement);

const regex2 = /try \{\n\s*console\.log\(\`\[api\/gerar\] Calling generateImages with model: imagen-3\.0-generate-001\`\);\n\s*const fallbackResponse2 = await \(client\.models as any\)\.generateImages\(\{/g;
const replacement2 = `try {
              console.log(\`[api/gerar] Calling generateImages with model: imagen-3.0-generate-001\`);
              
              const token = customApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyC3seHAMIgwPRxb-Ts1Q3Xds2PAL4mR89Q';
              const credentialsPath = path.join(process.cwd(), 'chave-vertex.json');
              const hasChaveVertex = fs.existsSync(credentialsPath);
              const fallbackClient = new GoogleGenAI({
                vertexai: true,
                project: "gerador-de-imagens-ia-502303",
                location: "us-central1",
                ...(hasChaveVertex ? { googleAuthOptions: { keyFilename: credentialsPath } } : {})
              });

              const fallbackResponse2 = await (fallbackClient.models as any).generateImages({`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server.ts', code);
