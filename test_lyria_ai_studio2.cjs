const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ apiKey: "dummy_key" });
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
