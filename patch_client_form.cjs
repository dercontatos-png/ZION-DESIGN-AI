const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

const clientFormStr = `
const ClientForm = () => {
  const [colors, setColors] = useState(["#000000", "#ff0000", "#ffffff"]);
  const [newColor, setNewColor] = useState("#000000");

  const handleAddColor = () => {
    setColors([...colors, newColor]);
  };

  const handleRemoveColor = (idx) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const form = e.target;
      
      let logoBase64 = undefined;
      const fileInput = form.logoFile;
      if (fileInput.files && fileInput.files.length > 0) {
         const file = fileInput.files[0];
         logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result);
            reader.readAsDataURL(file);
         });
      }

      useClientStore.getState().addClient({
        name: form.name.value,
        niche: form.niche.value,
        infoExtra: form.infoExtra.value,
        logoBase64: logoBase64,
        bancoDeDadosIA: "",
        paletaCores: colors
      });
      form.reset();
      setColors(["#000000", "#ff0000", "#ffffff"]);
    }} className="space-y-3">
      <input name="name" placeholder="Nome" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
      <input name="niche" placeholder="Nicho" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
      <input name="infoExtra" placeholder="Info Adicional (ex: Estilo favorito)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" />
      
      <div>
        <label className="text-[8px] text-zinc-500 uppercase">Logo do Cliente (Opcional)</label>
        <input name="logoFile" type="file" accept="image/*" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-300" />
      </div>

      <div>
        <label className="text-[8px] text-zinc-500 uppercase">Paleta de Cores (Quantas quiser)</label>
        <div className="flex gap-2 items-center mt-1 mb-2">
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-8 h-8 rounded border border-zinc-800 p-0 cursor-pointer" />
          <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white w-20" placeholder="#HEX" />
          <button type="button" onClick={handleAddColor} className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-xs font-bold">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded pl-1 pr-1 py-1">
              <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c}} />
              <span className="text-[10px] text-zinc-400 uppercase">{c}</span>
              <button type="button" onClick={() => handleRemoveColor(idx)} className="text-zinc-600 hover:text-red-500 ml-1">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" className="w-full bg-[#ad8330]/20 text-[#ad8330] border border-[#ad8330]/40 p-2 text-xs font-bold uppercase rounded-lg hover:bg-[#ad8330]/30 transition-colors">Cadastrar Cliente</button>
    </form>
  );
};
`;

const replaceFormStr = `<div className="border-t border-zinc-800 pt-4 mt-2">
                  <h4 className="text-[10px] font-black text-[#ad8330] uppercase tracking-widest mb-2">Novo Cliente</h4>
                  <ClientForm />
                </div>`;

const searchFormStr = `<div className="border-t border-zinc-800 pt-4 mt-2">
                  <h4 className="text-[10px] font-black text-[#ad8330] uppercase tracking-widest mb-2">Novo Cliente</h4>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    
                    let logoBase64 = undefined;
                    const fileInput = form.logoFile;
                    if (fileInput.files && fileInput.files.length > 0) {
                       const file = fileInput.files[0];
                       logoBase64 = await new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => resolve(ev.target?.result);
                          reader.readAsDataURL(file);
                       });
                    }

                    useClientStore.getState().addClient({
                      name: form.name.value,
                      niche: form.niche.value,
                      infoExtra: form.infoExtra.value,
                      logoBase64: logoBase64,
                      bancoDeDadosIA: "",
                      cores: {
                        ambiente: form.corAmbiente.value,
                        recorte: form.corRecorte.value,
                        complementar: form.corComp.value
                      }
                    });
                    form.reset();
                  }} className="space-y-3">
                    <input name="name" placeholder="Nome" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
                    <input name="niche" placeholder="Nicho" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
                    <input name="infoExtra" placeholder="Info Adicional (ex: Estilo favorito)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" />
                    
                    <div>
                      <label className="text-[8px] text-zinc-500 uppercase">Logo do Cliente (Opcional)</label>
                      <input name="logoFile" type="file" accept="image/*" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-300" />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Ambiente</label>
                        <input name="corAmbiente" type="color" defaultValue="#000000" className="w-full h-6 rounded border border-zinc-800" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Recorte</label>
                        <input name="corRecorte" type="color" defaultValue="#ff0000" className="w-full h-6 rounded border border-zinc-800" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[8px] text-zinc-500 uppercase">Complementar</label>
                        <input name="corComp" type="color" defaultValue="#ffffff" className="w-full h-6 rounded border border-zinc-800" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-[#ad8330]/20 text-[#ad8330] border border-[#ad8330]/40 p-2 text-xs font-bold uppercase rounded-lg hover:bg-[#ad8330]/30 transition-colors">Cadastrar Cliente</button>
                  </form>
                </div>`;

code = code.split(searchFormStr).join(replaceFormStr);

// add ClientForm to the top of the file
const exportIndex = code.indexOf('export const ChatAssistente');
code = code.substring(0, exportIndex) + clientFormStr + "\n" + code.substring(exportIndex);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
