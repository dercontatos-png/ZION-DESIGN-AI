const { GoogleGenAI } = require('@google/genai');
async function test() {
  const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6KB380yGDUAGhoPcvYmaQ27QYyIGKArNr_YvxlgIjBrBQ" });
  try {
    const res = await ai.models.generateContent({
      model: 'lyria-3-clip-preview',
      contents: "Uma musica rapida e animada"
    });
    console.log("Success gen:", res);
  } catch (e) {
    console.error("Failed gen:", e.message);
  }
}
test();
