const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ vertexai: true, project: "gerador-de-imagens-ia-502303", location: "us-central1" });
  try {
    const res = await ai.models.generateContent({
      model: 'lyria-3-clip-preview',
      contents: "Uma musica rapida e animada"
    });
    console.log("Success generated Content", res);
  } catch (e) {
    console.error("Failed generateContent:", e.message);
  }
}
test();
