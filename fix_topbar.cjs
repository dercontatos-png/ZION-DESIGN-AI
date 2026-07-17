const fs = require('fs');

let code = fs.readFileSync('src/components/DesignBuilder.tsx', 'utf-8');

const sidebarStart = code.indexOf('{/* COLUNA 1: SIDEBAR ESQUERDA (EXCLUSIVA ESTILO SCREENSHOT) */}');
const coreWorkspaceStart = code.indexOf('{/* CORE WORKSPACE COM TAB-BAR E COLUNAS */}');

if (sidebarStart === -1 || coreWorkspaceStart === -1) {
   console.log("Markers not found");
   process.exit(1);
}

const beforePart = code.substring(0, sidebarStart);
const afterPart = code.substring(coreWorkspaceStart);

const newTopbar = `
      {/* CONTEÚDO PRINCIPAL HEADER + ESPAÇO CORE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000]">
        
        {/* TOPBAR UNIFICADA COM NAVEGAÇÃO E LOGO */}
        <div className="h-16 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0 z-30 select-none gap-8">
          
          {/* Lado Esquerdo: Logo e Navegação */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 shrink-0 mr-4">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                <Layers size={14} />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Design Builder
              </span>
            </div>

            {/* Menu de Navegação Horizontal */}
            <div className="flex items-center gap-1 bg-[#121215] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveMenuTab("Design Builder")}
                className={\`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer \${
                  activeMenuTab === "Design Builder"
                    ? "bg-[#c99b3b]/10 text-[#c99b3b] border border-[#c99b3b]/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }\`}
              >
                <Sparkles size={12} />
                <span>Criar</span>
              </button>
              <button
                onClick={() => setActiveMenuTab("Inspiração")}
                className={\`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer \${
                  activeMenuTab === "Inspiração"
                    ? "bg-[#c99b3b]/10 text-[#c99b3b] border border-[#c99b3b]/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }\`}
              >
                <Compass size={12} />
                <span>Explorar</span>
              </button>
              <button
                onClick={() => setActiveMenuTab("Minha Galeria")}
                className={\`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer \${
                  activeMenuTab === "Minha Galeria"
                    ? "bg-[#c99b3b]/10 text-[#c99b3b] border border-[#c99b3b]/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }\`}
              >
                <ImageIcon size={12} />
                <span>Minha Galeria</span>
              </button>
              <button
                onClick={() => setActiveMenuTab("Ref Builder")}
                className={\`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer \${
                  activeMenuTab === "Ref Builder"
                    ? "bg-[#c99b3b]/10 text-[#c99b3b] border border-[#c99b3b]/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }\`}
              >
                <SlidersHorizontal size={12} />
                <span>Ref Builder PRO</span>
              </button>
            </div>
          </div>

          {/* Centro: Barra de Busca (Opcional, escondida se apertado) */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121215] border border-white/5 hover:border-zinc-700/80 focus:border-zinc-700 text-xs rounded-full pl-9 pr-4 py-2 text-zinc-300 placeholder:text-zinc-650 focus:outline-none transition-colors font-medium"
              />
            </div>
          </div>

          {/* Lado Direito: Ações e Perfil */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleTestToken}
              disabled={isTesting}
              className="hidden md:flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-900/60 hover:bg-[#1A1A1C] border border-white/10 hover:border-zinc-700 hover:text-white text-[10px] font-bold tracking-wider uppercase text-zinc-400 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={11} className={isTesting ? "animate-spin text-amber-400" : "text-amber-400"} />
              <span>Testar Token</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c99b3b]/10 border border-[#c99b3b]/20 text-xs font-semibold text-[#c99b3b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c99b3b] animate-pulse" />
              <span>API OK</span>
            </div>
            <button 
              onClick={() => showToast("Assistente Zion AI pronto para ajudar!", "success")}
              className="w-9 h-9 rounded-full bg-[#121215] hover:bg-[#1A1A1C] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <MessageSquare size={14} />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#c99b3b]/20 border border-[#c99b3b]/40 flex items-center justify-center text-xs font-bold text-[#c99b3b]">
              {myProfile?.name ? myProfile.name.charAt(0).toUpperCase() : "D"}
            </div>
            <button
              onClick={() => { store.createProject(); showToast("Novo projeto criado com sucesso!", "success"); }}
              className="px-4 py-2 bg-[#c99b3b] hover:bg-[#b5872c] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md ml-1"
            >
              + Novo Projeto
            </button>
          </div>
        </div>
`;

// Wait, the original code had:
// {/* COLUNA 1: SIDEBAR ESQUERDA (EXCLUSIVA ESTILO SCREENSHOT) */}
// <div className="w-[16%] md:w-[13%] min-w-[200px] ..."> ... </div>
// {/* CONTEÚDO DA DIREITA (HEADER + ESPAÇO CORE WORKSPACE) */}
// <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000]">

// Since I removed the sidebar and the wrapping `flex-1` div that was inside the parent flex, 
// I need to make sure I didn't break depth!
// The parent is <div className="flex h-screen overflow-hidden bg-black text-white font-sans">
// Inside it, we had Sidebar + RightContent.
// RightContent was a <div className="flex-1 ...">.
// So I am keeping RightContent but removing Sidebar. This is perfect! No depth changes required!

fs.writeFileSync('src/components/DesignBuilder.tsx', beforePart + newTopbar + '\n        ' + afterPart);
console.log("Replaced topbar successfully!");
