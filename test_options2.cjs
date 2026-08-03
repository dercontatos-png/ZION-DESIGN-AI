const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ vertexai: true, project: "my-project", location: 'us-central1' });
console.log(ai.project, ai.location, ai.vertexai);
