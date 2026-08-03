const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  'import { Music, Play, Square, Loader2, Download, Sparkles, Volume2, Mic } from "lucide-react";',
  'import { Music, Play, Square, Loader2, Download, Sparkles, Volume2, Mic, Settings2, Clock, Activity } from "lucide-react";'
);

// 2. Add states
const stateRegex = /const \[error, setError\] = useState\(""\);/;
if (code.match(stateRegex)) {
  code = code.replace(stateRegex, `const [error, setError] = useState("");
  const [audioType, setAudioType] = useState("Música");
  const [duration, setDuration] = useState("Padrão");
  const [mood, setMood] = useState("Nenhum");`);
}

// 3. Update handleGenerate
const promptCheckRegex = /const res = await fetch\("\/api\/generate-audio", \{\s*method: "POST",\s*headers: \{ "Content-Type": "application\/json" \},\s*body: JSON\.stringify\(\{\s*prompt,\s*modelId: model,\s*customApiKey: getActiveApiKey\(\),\s*\}\),\s*\}\);/;
if (code.match(promptCheckRegex)) {
  const newFetch = `
      let finalPrompt = prompt;
      if (audioType !== "Música" || duration !== "Padrão" || mood !== "Nenhum") {
        finalPrompt = \`\${prompt}. Instruções de Formato - Tipo de Áudio: \${audioType}, Duração: \${duration}, Estilo/Humor: \${mood}.\`;
      }
      
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          modelId: model,
          customApiKey: getActiveApiKey(),
        }),
      });`;
  code = code.replace(promptCheckRegex, newFetch);
}

// 4. Inject advanced settings UI
const promptUIRegex = /\{\/\* Prompt \*\/\}/;
if (code.match(promptUIRegex)) {
  const newUI = `{/* Advanced Settings */}
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="text-sm font-semibold mb-4 text-gray-300 flex items-center gap-2">
              <Settings2 size={16} className="text-blue-400" />
              Configurações do Áudio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1"><Volume2 size={12}/> Tipo</label>
                <select 
                  value={audioType}
                  onChange={(e) => setAudioType(e.target.value)}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Música">Música (Completa)</option>
                  <option value="Trilha Sonora">Trilha Sonora (Soundtrack)</option>
                  <option value="Efeito Sonoro (SFX)">Efeito Sonoro (SFX)</option>
                  <option value="Vinheta / Jingle">Vinheta / Jingle</option>
                  <option value="Som Ambiente">Som Ambiente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Duração (Aprox.)</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Padrão">Padrão</option>
                  <option value="Muito Curto (5-10s)">Muito Curto (5-10s)</option>
                  <option value="Curto (15-30s)">Curto (15-30s)</option>
                  <option value="Médio (1 min)">Médio (1 min)</option>
                  <option value="Longo (2 min+)">Longo (2 min+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1"><Activity size={12}/> Estilo / Clima</label>
                <select 
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="Nenhum">Nenhum (Usar do Prompt)</option>
                  <option value="Épico e Cinematográfico">Épico / Cinematográfico</option>
                  <option value="Tenso e Misterioso">Tenso / Misterioso</option>
                  <option value="Relaxante e Calmo">Relaxante / Calmo</option>
                  <option value="Animado e Energético">Animado / Energético</option>
                  <option value="Triste e Melancólico">Triste / Melancólico</option>
                  <option value="Assustador (Terror)">Assustador (Terror)</option>
                  <option value="Futurista / Sci-Fi">Futurista / Sci-Fi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prompt */}`;
  code = code.replace(promptUIRegex, newUI);
}

fs.writeFileSync('src/components/AudioStudio.tsx', code);
console.log("Audio Studio updated with advanced settings!");
