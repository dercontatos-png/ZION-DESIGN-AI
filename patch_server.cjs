const fs = require('fs');

const fileContent = fs.readFileSync('server.ts', 'utf-8');
const lines = fileContent.split('\n');

const startLine = 5688; // "                  for (const currentModel of lyriaModelsToTry) {"
const endLine = 5809; // Find the end of the loop replacing block

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('console.log(`[Gemini Native Audio] Success on model ${m}! Audio data length: ${part.inlineData.data.length}`);') && startIndex === -1) {
    startIndex = i;
  }
  if (lines[i].includes('let fallbackWarning = "";') && i > startIndex) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `                    console.log(\`[Gemini Native Audio] Success on model \${m}! Audio data length: \${part.inlineData.data.length}\`);
                    return {
                      audioBase64: part.inlineData.data,
                      mimeType: part.inlineData.mimeType || "audio/wav"
                    };
                  }
                }
              } catch (modErr: any) {
                lastErr = modErr?.message || String(modErr);
                console.warn(\`[Gemini Native Audio] Model \${m} on '\${cand.name}' failed:\`, lastErr);
              }
            }
          } catch (candErr: any) {
            console.warn(\`[Gemini Native Audio] Candidate '\${cand.name}' error:\`, candErr?.message || candErr);
          }
        }
        throw new Error(lastErr || "Sintetizador nativo Gemini indisponível no momento.");
      };

      // Filter candidate clients to prefer pure Google AI Studio API key clients over Vertex AI service accounts
      const candidateClientsList = getCandidateClients(customApiKey);
      const pureApiKeyClients = candidateClientsList.filter((c: any) => !c.instance.isVertexAI);
      const lyriaCandidatesToTry = pureApiKeyClients.length > 0 ? pureApiKeyClients : candidateClientsList;

      let lyriaSuccess = false;
      let lastLyriaErr = "";

      const lyriaModelsToTry = [targetLyriaModel, targetLyriaModel === "lyria-3-pro-preview" ? "lyria-3-clip-preview" : "lyria-3-pro-preview"];

      for (const currentModel of lyriaModelsToTry) {
        if (lyriaSuccess) break;

        // Try direct Interactions API first if we have a raw API key
        let activeApiKey = "";
        if (customApiKey && !customApiKey.trim().startsWith("{") && !customApiKey.trim().startsWith("AIzaSy")) {
            activeApiKey = customApiKey.trim();
        } else if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.trim().startsWith("{")) {
            activeApiKey = process.env.GEMINI_API_KEY.trim();
        } else if (customApiKey && customApiKey.trim().startsWith("AIza")) {
            activeApiKey = customApiKey.trim();
        }

        if (activeApiKey) {
            try {
              console.log(\`[Lyria API] Invoking model \${currentModel} via direct Interactions API...\`);
              const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
                method: 'POST',
                headers: {
                  'x-goog-api-key': activeApiKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: currentModel,
                  input: finalPrompt,
                  response_format: { type: 'audio' }
                })
              });
              
              if (!response.ok) {
                 const errText = await response.text();
                 throw new Error(\`Interactions API failed with status \${response.status}: \${errText}\`);
              }
              const responseData = await response.json();
              const steps = responseData.steps || [];
              for (const step of steps) {
                if (step.model_output && step.model_output.parts) {
                  const audioPart = step.model_output.parts.find((part: any) => part.type === 'audio' || part.inline_data || (part.inlineData && part.inlineData.data));
                  if (audioPart) {
                    const rawData = audioPart.inline_data ? audioPart.inline_data.data : (audioPart.inlineData ? audioPart.inlineData.data : audioPart.data);
                    if (rawData) {
                       audioBase64 = rawData;
                       if (audioPart.mime_type || audioPart.mimeType) {
                           mimeType = audioPart.mime_type || audioPart.mimeType;
                       }
                       lyriaSuccess = true;
                       break;
                    }
                  }
                }
              }
              if (lyriaSuccess) {
                  console.log(\`[Lyria API] Success via Interactions API for model \${currentModel}! Output audio length: \${audioBase64.length}\`);
                  break;
              }
            } catch (err: any) {
              console.warn(\`[Lyria API] Direct Interactions API failed for \${currentModel}:\`, err.message);
              lastLyriaErr = err.message;
            }
        }

        if (lyriaSuccess) break;

        for (const cand of lyriaCandidatesToTry) {
          try {
            console.log(\`[Lyria API] Invoking model \${currentModel} via generateContentStream on candidate '\${cand.name}'...\`);
            
            try {
              const lyriaStream = await cand.instance.models.generateContentStream({
                model: currentModel,
                contents: lyriaContentsParts
              });

              for await (const chunk of lyriaStream) {
                const parts = chunk.candidates?.[0]?.content?.parts;
                if (!parts) continue;

                for (const part of parts) {
                  if (part.inlineData?.data) {
                    if (!mimeType || mimeType === "audio/wav") {
                      mimeType = part.inlineData.mimeType || "audio/wav";
                    }
                    audioBase64 += part.inlineData.data;
                  }
                  if (part.text && !lyrics) {
                    lyrics = part.text;
                  }
                }
              }
            } catch (streamErr: any) {
              console.warn(\`[Lyria Stream Error on \${cand.name}]:\`, streamErr?.message || streamErr, "- Trying generateContent direct...");
              
              const lyriaDirect = await cand.instance.models.generateContent({
                model: currentModel,
                contents: lyriaContentsParts
              });

              const parts = lyriaDirect.candidates?.[0]?.content?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data) {
                  audioBase64 += part.inlineData.data;
                  if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
                }
                if (part.text && !lyrics) lyrics = part.text;
              }
            }

            if (audioBase64 && audioBase64.length > 100) {
              lyriaSuccess = true;
              console.log(\`[Lyria API] Success on '\${cand.name}' with model \${currentModel}! Output audio length: \${audioBase64.length}\`);
              break;
            }
          } catch (candErr: any) {
            lastLyriaErr = candErr?.message || String(candErr);
            console.warn(\`[Lyria API] Model \${currentModel} on candidate '\${cand.name}' failed:\`, lastLyriaErr);
          }
        }
      }`;

  lines.splice(startIndex, endIndex - startIndex, replacement);
  fs.writeFileSync('server.ts', lines.join('\n'), 'utf-8');
  console.log('Fixed server.ts successfully');
} else {
  console.log('Could not find boundaries', startIndex, endIndex);
}
