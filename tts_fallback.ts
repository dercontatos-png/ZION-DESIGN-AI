  5261	      // Helper for ElevenLabs TTS with Automatic Premade Voice Fallback and Multi-Key Pool Iteration
  5262	      const callElevenLabsTtsWithFallback = async (
  5263	        promptText: string,
  5264	        voice: string,
  5265	        modelId: string,
  5266	        apiKeyStr: string
  5267	      ): Promise<Buffer> => {
  5268	        const keyPool = getElevenLabsKeysPool(apiKeyStr);
  5269	        if (keyPool.length === 0) {
  5270	          throw new Error("Nenhuma chave ElevenLabs configurada.");
  5271	        }
  5272	
  5273	        // List of guaranteed free premade voice IDs to try sequentially if a voice fails or is restricted
  5274	        const candidateVoices = [
  5275	          voice,
  5276	          "pNInz6obpgDQGcFmaJgB", // Adam (Male)
  5277	          "AZnzlk1XvdvUeBnXmlld", // Domi (Female)
  5278	          "EXAVITQu4vr4xnSDxMaL", // Bella (Female)
  5279	          "ErXwobaYiN019PkySvjV", // Antoni (Male)
  5280	          "TxGEqnHWrfWFTfGW9XjX"  // Josh (Male)
  5281	        ].filter((v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx);
  5282	
  5283	        let lastErrMessage = "";
  5284	
  5285	        for (const key of keyPool) {
  5286	          console.log(`[ElevenLabs TTS Pool] Trying ElevenLabs key '${key.slice(0, 10)}...' (${keyPool.length} keys in pool)...`);
  5287	          for (const targetVoice of candidateVoices) {
  5288	            try {
  5289	              console.log(`[ElevenLabs TTS] Attempting synthesis with voice '${targetVoice}' on key '${key.slice(0, 10)}...'`);
  5290	              const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(targetVoice)}`, {
  5291	                method: "POST",
  5292	                headers: {
  5293	                  "Accept": "audio/mpeg",
  5294	                  "Content-Type": "application/json",
  5295	                  "xi-api-key": key
  5296	                },
  5297	                body: JSON.stringify({
  5298	                  text: promptText,
  5299	                  model_id: modelId || "eleven_turbo_v2_5",
  5300	                  voice_settings: { stability: 0.5, similarity_boost: 0.75 }
  5301	                })
  5302	              });
  5303	
  5304	              if (elRes.ok) {
  5305	                const arrayBuf = await elRes.arrayBuffer();
  5306	                if (arrayBuf.byteLength > 0) {
  5307	                  console.log(`[ElevenLabs TTS Success] Narration generated with key '${key.slice(0, 10)}...' and voice '${targetVoice}'`);
  5308	                  return Buffer.from(arrayBuf);
  5309	                } else {
  5310	                  console.warn(`[ElevenLabs TTS] Key '${key.slice(0, 10)}...' voice '${targetVoice}' returned 200 OK but empty buffer!`);
  5311	                  lastErrMessage = "A API retornou uma resposta vazia (0 bytes).";
  5312	                  continue; // Try next voice or key
  5313	                }
  5314	              }
  5315	
  5316	              const elErr = await elRes.json().catch(() => ({}));
  5317	              lastErrMessage = elErr?.detail?.message || elErr?.message || `Status ${elRes.status}`;
  5318	              console.warn(`[ElevenLabs TTS] Key '${key.slice(0, 10)}...' voice '${targetVoice}' returned: ${lastErrMessage}`);
  5319	
  5320	              const isKeyQuotaErr = elRes.status === 429 || elRes.status === 401 ||
  5321	                lastErrMessage.toLowerCase().includes("quota") ||
  5322	                lastErrMessage.toLowerCase().includes("credit") ||
  5323	                lastErrMessage.toLowerCase().includes("unauthorized") ||
  5324	                lastErrMessage.toLowerCase().includes("exceeds");
  5325	
  5326	              if (isKeyQuotaErr) {
  5327	                console.warn(`[ElevenLabs TTS Pool] Key '${key.slice(0, 10)}...' exhausted/quota limit (${lastErrMessage}). Moving to next key in pool...`);
  5328	                break;
  5329	              }
  5330	            } catch (attemptErr: any) {
  5331	              lastErrMessage = attemptErr?.message || String(attemptErr);
  5332	              console.warn(`[ElevenLabs TTS] Network error on key '${key.slice(0, 10)}...':`, lastErrMessage);
  5333	            }
  5334	          }
  5335	        }
  5336	
  5337	        throw new Error(lastErrMessage || `Não foi possível gerar narração em nenhuma das ${keyPool.length} chaves ElevenLabs.`);
  5338	      };
