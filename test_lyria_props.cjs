const { GoogleGenAI } = require('@google/genai');
const sa = require('./chave-vertex.json');

async function test() {
  const ai = new GoogleGenAI({ 
    vertexai: true, 
    project: sa.project_id, 
    location: "global", 
    googleAuthOptions: { credentials: sa } 
  });
  
  try {
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [{ type: "text", text: "Uma musica rapida e animada" }]
    });
    console.log("res.output_audio:", typeof res.output_audio, Array.isArray(res.output_audio));
    console.log("res.output_text:", typeof res.output_text);
    console.log("JSON audio:", JSON.stringify(res.output_audio).substring(0, 100));
  } catch (e) {}
}
test();
