const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ 
    vertexai: true, 
    project: "gerador-de-imagens-ia-502303", 
    location: "global",
    apiKey: "AQ.Ab8RN6KB380yGDUAGhoPcvYmaQ27QYyIGKArNr_YvxlgIjBrBQ" 
  });
  try {
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [{ type: "text", text: "Uma musica rapida e animada" }]
    });
    console.log("Success vertex!");
  } catch (e) {
    console.error("Failed vertex:", e.message);
  }
}
test();
