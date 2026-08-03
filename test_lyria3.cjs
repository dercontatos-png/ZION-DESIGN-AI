const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ vertexai: true, project: "gerador-de-imagens-ia-502303", location: 'us-central1' });
const vertexOptions = { ...ai._options, location: 'global' };
console.log(vertexOptions);
const lyriaAi = new GoogleGenAI(vertexOptions);
console.log(lyriaAi.location);
