const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf8');

// Add file state
const fileStateRegex = /const \[mood, setMood\] = useState\("Nenhum"\);/;
if (code.match(fileStateRegex)) {
  code = code.replace(fileStateRegex, `const [mood, setMood] = useState("Nenhum");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);`);
}

// Update handleGenerate
const handleGenerateRegex = /const res = await fetch\("\/api\/generate-audio", \{\s*method: "POST",\s*headers: \{ "Content-Type": "application\/json" \},\s*body: JSON\.stringify\(\{[\s\S]*?\}\),\s*\}\);/;
if (code.match(handleGenerateRegex)) {
  const newFetch = `
      const formData = new FormData();
      formData.append("prompt", finalPrompt);
      formData.append("modelId", model);
      formData.append("customApiKey", getActiveApiKey());
      if (referenceFile) {
        formData.append("file", referenceFile);
      }

      const res = await fetch("/api/generate-audio", {
        method: "POST",
        body: formData,
      });`;
  code = code.replace(handleGenerateRegex, newFetch);
}

// Update condition
const conditionRegex = /if \(\!prompt\.trim\(\)\) \{[\s\S]*?return;\s*\}/;
if (code.match(conditionRegex)) {
  code = code.replace(conditionRegex, `if (!prompt.trim() && !referenceFile) {
      setError("Digite um prompt ou anexe um arquivo de referência.");
      return;
    }`);
}

// Update UI
const promptAreaRegex = /<div className="bg-\[#1a1a1a\] p-5 rounded-2xl border border-gray-800 shadow-xl flex-1 flex flex-col">/;
if (code.match(promptAreaRegex)) {
  const newUI = `<div className="bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800 shadow-xl flex-1 flex flex-col">
            {/* File Upload Area */}
            <div className="mb-4 bg-[#111] border border-gray-700 rounded-xl p-3 flex flex-col items-start gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                Referência de Vídeo ou Áudio
              </label>
              <div className="flex items-center gap-3 w-full">
                <input 
                  type="file" 
                  accept="audio/*,video/*"
                  onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
                  className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
                />
                {referenceFile && (
                  <button 
                    onClick={() => setReferenceFile(null)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remover
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-500">Envie um vídeo para que a IA analise e crie a trilha ideal, ou um áudio de referência.</p>
            </div>`;
  code = code.replace(promptAreaRegex, newUI);
}

fs.writeFileSync('src/components/AudioStudio.tsx', code);
console.log("Patched file upload in AudioStudio.tsx!");
