sed -i '/const expModels =/c\
        const expModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];\
        let expText = "";\
        let lastExpErr: any = null;\
        for (const expModel of expModels) {\
          try {\
            console.log(`[api/gerar] Expanding prompt with model: ${expModel}...`);\
            const expResponse = await client.models.generateContent({\
              model: expModel,\
              contents: [{ role: "user", parts: expansionParts }],\
              config: {\
                responseMimeType: "application/json",\
                responseSchema: {\
                  type: "object",\
                  properties: {\
                    prompt: { type: "string" },\
                    systemInstruction: { type: "string" }\
                  },\
                  required: ["prompt", "systemInstruction"]\
                }\
              }\
            });\
            if (expResponse?.text) {\
              expText = expResponse.text;\
              break;\
            }\
          } catch (expErr: any) {\
            lastExpErr = expErr;\
            console.warn(`[api/gerar] Prompt expansion with ${expModel} failed:`, expErr?.message || expErr);\
            if (expErr?.message?.includes("429") || expErr?.message?.includes("RESOURCE_EXHAUSTED")) {\
              break;\
            }\
          }\
        }\
        if (!expText && lastExpErr) {\
          throw lastExpErr;\
        }' server.ts
