const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf8');

const durationSelectRegex = /<select value=\{duration\} onChange=\{\(e\) => setDuration\(e\.target\.value\)\} className="w-full bg-\[#111\] border border-gray-700 rounded-lg p-2\.5 text-sm text-gray-200">[\s\S]*?<\/select>/;
if (code.match(durationSelectRegex)) {
  const newSelect = `<select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200">
                      <option value="Padrão">Padrão</option>
                      <option value="Microsound (1s)">Microsound (1s)</option>
                      <option value="Impacto Curto (3s)">Impacto Curto (3s)</option>
                      <option value="Muito Curto (5s)">Muito Curto (5s)</option>
                      <option value="Curto (10s)">Curto (10s)</option>
                      <option value="Vinheta (15-30s)">Vinheta (15-30s)</option>
                      <option value="Médio (1 min)">Médio (1 min)</option>
                      <option value="Longo (2 min+)">Longo (2 min+)</option>
                    </select>`;
  code = code.replace(durationSelectRegex, newSelect);
}

// Ensure the preset is updated for SFX to use one of the new durations
code = code.replace(/setDuration\("Muito Curto \(5-10s\)"\);/g, 'setDuration("Impacto Curto (3s)");');
code = code.replace(/setDuration\("Curto \(15-30s\)"\);/g, 'setDuration("Vinheta (15-30s)");');

fs.writeFileSync('src/components/AudioStudio.tsx', code);
console.log("Patched duration successfully!");
