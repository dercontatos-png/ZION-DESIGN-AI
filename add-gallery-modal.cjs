const fs = require('fs');
let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf8');

// 1. Add state for gallery modal
const stateInsertPoint = 'const [isTesting, setIsTesting] = useState(false);';
const stateAddition = '  const [showGalleryModal, setShowGalleryModal] = useState(false);\n';
code = code.replace(stateInsertPoint, stateInsertPoint + '\n' + stateAddition);

// 2. Remove right sidebar
const rightSidebarPattern = `          <div className="w-full md:w-[240px] lg:w-[300px] 2xl:w-[350px] bg-[#0A0A0A] border-t md:border-t-0 md:border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex-1 flex flex-col p-4 space-y-4">
                <div className="border border-white/5 bg-black/35 p-4 rounded-xl shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a880]">Galeria Masonry</span>
                  </div>
                  <MasonryGallery
                    exportFormat={exportFormat}
                    showToast={showToast}
                  />
                </div>
             </div>
          </div>`;
code = code.replace(rightSidebarPattern, '');

// 3. Add Galeria button to toolbar
const toolbarPattern = `                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center justify-center w-8 h-8 bg-[#1A1A1C] border border-white/10 text-white rounded-lg hover:bg-zinc-800 active:scale-95 transition-all shadow-xl cursor-pointer"
                    title="Tela Cheia"
                  >
                    <Maximize size={12} className="text-white stroke-[2.5px]" />
                  </button>`;
const toolbarAddition = `                  <button
                    onClick={() => setShowGalleryModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-800 active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    <ImageIcon size={12} className="stroke-[2.5px]" />
                    <span>Galeria</span>
                  </button>`;
code = code.replace(toolbarPattern, toolbarPattern + '\n' + toolbarAddition);

// 4. Add Gallery Modal at the end of the file
const modalAddition = `
  {showGalleryModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-zinc-950 rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#0A0A0A]">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="text-[#c5a880]" size={16} /> 
            Galeria de Criações
          </h3>
          <button onClick={() => setShowGalleryModal(false)} className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black">
          <MasonryGallery
            exportFormat={exportFormat}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  )}
`;
const endPattern = `</div>
  );
}`;
code = code.replace(endPattern, modalAddition + '\n' + endPattern);

fs.writeFileSync('src/components/DesignBuilder.tsx', code);
console.log("Gallery modal added and right sidebar removed.");
