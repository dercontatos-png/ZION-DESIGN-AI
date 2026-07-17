const { GoogleGenAI } = require('@google/genai');
const path = require('path');

async function testGemini() {
  const credentialsPath = path.join(process.cwd(), 'chave-vertex.json');
  console.log("Initializing GoogleGenAI client with Vertex AI location: global...");
  
  const client = new GoogleGenAI({
    vertexai: true,
    project: "gerador-de-imagens-ia-502303",
    location: "global",
    googleAuthOptions: {
      keyFilename: credentialsPath
    }
  });

  try {
    console.log("Calling generateContent with gemini-2.5-flash...");
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, responding from Vertex AI! Say 'Success' if you can read this."
    });

    console.log("Response:", response.text);
  } catch (error) {
    console.error("Gemini global test failed:", error);
  }
}

testGemini();
