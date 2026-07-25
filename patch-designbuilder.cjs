const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

code = code.replace(
  '{/* Opções Avançadas */}',
  `{/* Seleção de Modelo */}
          <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Modelo Base de Geração</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => store.updateConfig({ modelId: "gemini-3-pro-image" })}
                className={\`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all \${(!store.modelId || store.modelId === "gemini-3-pro-image") ? "bg-[#ad8330]/20 border-[#ad8330]/50 text-[#d4af37]" : "bg-zinc-950 border-white/5 text-zinc-400 hover:text-zinc-200"}\`}
              >
                <Sparkles size={24} className="mb-2" />
                <span className="font-bold text-sm">NanoBanana Pro</span>
                <span className="text-[10px] opacity-70">Alta Qualidade & Raciocínio</span>
              </button>
              
              <button
                onClick={() => store.updateConfig({ modelId: "gemini-3.1-flash-image" })}
                className={\`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all \${store.modelId === "gemini-3.1-flash-image" ? "bg-[#ad8330]/20 border-[#ad8330]/50 text-[#d4af37]" : "bg-zinc-950 border-white/5 text-zinc-400 hover:text-zinc-200"}\`}
              >
                <Zap size={24} className="mb-2" />
                <span className="font-bold text-sm">NanoBanana 2</span>
                <span className="text-[10px] opacity-70">Velocidade & Criatividade</span>
              </button>
            </div>
          </div>

          {/* Opções Avançadas */}`
);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("Patched DesignBuilder.");
