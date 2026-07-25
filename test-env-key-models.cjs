const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.list();
    for await (const m of response) {
      if (m.name.includes("image") || m.name.includes("imagen") || m.name.includes("generate")) {
        console.log(m.name);
      }
    }
    console.log("Done");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
