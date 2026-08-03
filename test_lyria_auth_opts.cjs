const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({
  vertexai: true,
  project: "test-proj",
  location: "us-central1",
  googleAuthOptions: { credentials: { client_email: "test@test.com" } }
});
console.log(ai._options);
