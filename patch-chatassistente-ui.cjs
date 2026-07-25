const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

code = code.replace(
  '<button\n                  onClick={() => setIsExpanded(!isExpanded)}',
  `<button
                  onClick={() => setShowModelSettings(!showModelSettings)}
                  className={\`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer \${showModelSettings ? "text-[#ad8330] bg-zinc-900" : "text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900"}\`}
                  title="Modelo de IA"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}`
);

code = code.replace(
  '{/* History Dropdown */}',
  `{/* Model Settings Dropdown */}
            {showModelSettings && (
              <div className="absolute top-14 left-3 right-3 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 block">Selecione o Modelo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedModel("gemini-3.6-flash")}
                    className={\`flex-1 flex flex-col items-center justify-center py-2.5 text-xs rounded-lg transition-all \${selectedModel === "gemini-3.6-flash" ? "bg-[#ad8330]/20 text-[#d4af37] border border-[#ad8330]/50 font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-white/5"}\`}
                  >
                    <Zap size={16} className="mb-1" />
                    Gemini Flash
                  </button>
                  <button
                    onClick={() => setSelectedModel("gemini-3-pro-image")}
                    className={\`flex-1 flex flex-col items-center justify-center py-2.5 text-xs rounded-lg transition-all \${selectedModel === "gemini-3-pro-image" ? "bg-[#ad8330]/20 text-[#d4af37] border border-[#ad8330]/50 font-bold" : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-white/5"}\`}
                  >
                    <Sparkles size={16} className="mb-1" />
                    Gemini Pro
                  </button>
                </div>
              </div>
            )}
            
            {/* History Dropdown */}`
);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("Patched UI.");
