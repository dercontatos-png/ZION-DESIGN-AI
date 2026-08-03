const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ vertexai: true, project: "test-proj", location: 'us-central1' });
console.log(Object.keys(ai));
