const { GoogleGenAI } = require("@google/genai");

async function test() {
  try {
    const ai = new GoogleGenAI({
      vertexai: true,
      apiKey: process.env.GEMINI_API_KEY // This is an AI Studio key
    });
    console.log("Generating with AI Studio key + vertexai: true...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Say hi',
    });
    console.log("Success!", response.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
