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
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {}
}
test();
