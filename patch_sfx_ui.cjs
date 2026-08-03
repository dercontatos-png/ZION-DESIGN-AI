const fs = require('fs');
let code = fs.readFileSync('src/components/AudioStudio.tsx', 'utf8');

// Add new state variables
const stateRegex = /const \[structure, setStructure\] = useState\(""\);/;
if (code.match(stateRegex)) {
  code = code.replace(stateRegex, `const [structure, setStructure] = useState("");
  const [sfxIntent, setSfxIntent] = useState("Impacto");
  const [sfxEnv, setSfxEnv] = useState("Estúdio (clean)");
  const [sfxMix, setSfxMix] = useState("Dry (sem reverb)");
  const [sfxLayers, setSfxLayers] = useState("");`);
}

// Inject SFX parameters into the prompt builder
const finalPromptRegex = /if \(duration !== "Padrão"\) attrs\.push\(\`Duration: \$\{duration\}\`\);/;
if (code.match(finalPromptRegex)) {
  code = code.replace(finalPromptRegex, `if (duration !== "Padrão") attrs.push(\`Duration: \${duration}\`);
      
      if (audioType === "Efeito Sonoro (SFX)") {
        attrs.push(\`Intent: \${sfxIntent}\`);
        attrs.push(\`Environment: \${sfxEnv}\`);
        attrs.push(\`Mix/Processing: \${sfxMix}\`);
        if (sfxLayers) attrs.push(\`Audio Layers: \${sfxLayers}\`);
      }`);
}

// Conditionally hide Fileira 4 and 5
const fileira4Regex = /\{\/\* Fileira 4: Energia, Emoção e BPM \*\/\}/;
if (code.match(fileira4Regex)) {
  code = code.replace(fileira4Regex, `{audioType !== "Efeito Sonoro (SFX)" && (<>
                {/* Fileira 4: Energia, Emoção e BPM */}`);
}
const fileira5EndRegex = /\{\/\* Fileira 6: Qualidade e Negative Prompt \*\/\}/;
if (code.match(fileira5EndRegex)) {
  code = code.replace(fileira5EndRegex, `</>)}
  
                {/* SFX Block */}
                {audioType === "Efeito Sonoro (SFX)" && (
                  <div className="bg-[#222] p-4 rounded-xl border border-gray-700 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><Waveform size={14}/> Configurações de Efeito Sonoro</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Intenção do Som</label>
                        <select value={sfxIntent} onChange={e => setSfxIntent(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm">
                          <option>Impacto</option>
                          <option>Transição</option>
                          <option>Suspense</option>
                          <option>Ação</option>
                          <option>Interface UI</option>
                          <option>Notificação</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Ambiente</label>
                        <select value={sfxEnv} onChange={e => setSfxEnv(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm">
                          <option>Estúdio (clean)</option>
                          <option>Indoor seco</option>
                          <option>Outdoor</option>
                          <option>Urbano</option>
                          <option>Guerra</option>
                          <option>Espaço</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase mb-1">Controle de Mixagem</label>
                        <select value={sfxMix} onChange={e => setSfxMix(e.target.value)} className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm">
                          <option>Dry (sem reverb)</option>
                          <option>Com reverb</option>
                          <option>Eco</option>
                          <option>Compressão</option>
                          <option>Punch</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase mb-1">Camadas de Áudio (Ex: Gunshot, Echo, Mechanical click)</label>
                      <input 
                        type="text" 
                        value={sfxLayers} 
                        onChange={e => setSfxLayers(e.target.value)} 
                        placeholder="Adicionar camadas separadas por vírgula"
                        className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {/* Fileira 6: Qualidade e Negative Prompt */}`);
}

fs.writeFileSync('src/components/AudioStudio.tsx', code);
console.log("Patched UI successfully!");
