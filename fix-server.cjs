const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Undo the mess
code = code.replace(/const expModels = \["gemini-1\.5-flash", "gemini-2\.0-flash", "gemini-1\.5-pro"\];[\s\S]*?let cleanedExpText = expText\.trim\(\);/, 
`const expModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
        let expText = "";
        let lastExpErr: any = null;
        for (const expModel of expModels) {
          try {
            console.log(\`[api/gerar] Expanding prompt with model: \${expModel}...\`);
            const expResponse = await client.models.generateContent({
              model: expModel,
              contents: [{ role: "user", parts: expansionParts }],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    prompt: { type: "string" },
                    systemInstruction: { type: "string" }
                  },
                  required: ["prompt", "systemInstruction"]
                }
              }
            });
            if (expResponse?.text) {
              expText = expResponse.text;
              break;
            }
          } catch (expErr: any) {
            lastExpErr = expErr;
            console.warn(\`[api/gerar] Prompt expansion with \${expModel} failed:\`, expErr?.message || expErr);
            if (expErr?.message?.includes("429") || expErr?.message?.includes("RESOURCE_EXHAUSTED")) {
              break;
            }
          }
        }
        
        if (!expText && lastExpErr) {
          throw lastExpErr;
        }

        let cleanedExpText = expText.trim();`);

code = code.replace(/const extractModels = \["gemini-2\.5-flash", "gemini-2\.5-flash", "gemini-3\.1-pro-preview"\];/g, 'const extractModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];');
code = code.replace(/const scanModels = \["gemini-2\.5-flash", "gemini-2\.5-flash", "gemini-3\.1-pro-preview"\];/g, 'const scanModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];');
code = code.replace(/const textModels = \["gemini-2\.5-flash", "gemini-2\.5-flash", "gemini-3\.1-pro-preview"\];/g, 'const textModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];');
code = code.replace(/const thinkModels = \["gemini-2\.5-flash", "gemini-2\.5-flash", "gemini-3\.1-pro-preview"\];/g, 'const thinkModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];');


fs.writeFileSync('server.ts', code);
