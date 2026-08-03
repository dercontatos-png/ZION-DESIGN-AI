const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6KB380yGDUAGhoPcvYmaQ27QYyIGKArNr_YvxlgIjBrBQ" });
  try {
    const res = await ai.interactions.create({
      model: 'lyria-3-clip-preview',
      input: [{ type: "text", text: "Uma musica rapida e animada" }]
    });
    console.log("Success interactions! Outputs:", (res.outputs || []).length);
  } catch (e) {
    console.error("Failed interactions:", e.message, "\nError:", e);
  }
}
test();
