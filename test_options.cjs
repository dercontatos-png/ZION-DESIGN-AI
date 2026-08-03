const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ vertexai: true, project: "test", location: 'us-central1' });
console.log(ai.options || ai._options || Object.keys(ai));
