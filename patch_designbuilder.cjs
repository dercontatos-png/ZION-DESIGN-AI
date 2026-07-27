const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

code = code.replace(
  `            {/* Quantidade de Cards a Gerar */}`,
  `            {/* Seed */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-black text-zinc-500 mb-1.5 flex items-center justify-between">
                <span>Seed (Opcional)</span>
                {store.seedUsuario && (
                  <button
                    onClick={() => store.setSeedUsuario(null)}
                    className="text-[9px] text-[#c5a880] hover:text-white"
                  >
                    LIMPAR
                  </button>
                )}
              </label>
              <div className="bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                <input
                  type="number"
                  placeholder="Aleatório (vazio)"
                  value={store.seedUsuario || ""}
                  onChange={(e) => store.setSeedUsuario(e.target.value ? e.target.value : null)}
                  className="w-full bg-transparent text-xs text-white placeholder-zinc-600 outline-none px-2 py-1"
                />
              </div>
            </div>

            {/* Quantidade de Cards a Gerar */}`
);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
