const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [{ type: "text", text: "Uma musica rapida e animada" }]
    });
    console.log("Success interactions", res);
  } catch (e) {
    console.error("Failed interactions:", e.message);
  }
}
test();
