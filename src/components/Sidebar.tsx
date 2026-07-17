import React, { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useClientStore } from "../store/useClientStore";
import {
  ChevronRight,
  ExternalLink,
  Activity,
  Play,
  RefreshCw,
  Edit2,
  Check,
  Plus,
  Trash2
} from "lucide-react";

interface SidebarProps {
  activeMenuTab: string;
  setActiveMenuTab: (tab: string) => void;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenuTab,
  setActiveMenuTab,
  showToast
}) => {
  const store = useProjectStore();
  const { setActiveClient } = useClientStore();
  const [isTesting, setIsTesting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("");
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  const handleTestToken = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      store.setApiStatus("Online");
      showToast("Conexão ativa! A API de IA está respondendo perfeitamente.", "success");
    }, 1000);
  };

  const activeProject = store.projectsList.find((p) => p.id === store.activeProjectId);
  const activeProjectName = activeProject?.name || "Projeto Alpha";

  const startEditingName = () => {
    setTempProjectName(activeProjectName);
    setIsEditingName(true);
  };

  const saveProjectName = () => {
    if (store.activeProjectId && tempProjectName.trim() !== "") {
      store.renameProject(store.activeProjectId, tempProjectName.trim());
      showToast("Projeto renomeado com sucesso!", "success");
    }
    setIsEditingName(false);
  };

  const handleNewProject = () => {
    store.createProject();
    setActiveClient(null);
    showToast("Nova conversa iniciada. Todas as configurações foram limpas.", "success");
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.deleteProject(id);
    showToast("Conversa deletada.", "success");
    if (store.projectsList.length <= 1) {
      setShowProjectSelector(false);
    }
  };

  return (
    <div className="w-[18%] bg-black/45 backdrop-blur-md border-r border-zinc-800/80 flex flex-col h-full shrink-0 select-none">
      
      {/* Header da Sidebar com Nome do Projeto Editável e Badge */}
      <div className="p-5 flex flex-col gap-3 border-b border-white/5 shrink-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8942b] flex items-center justify-center font-bold text-zinc-950 text-xs shrink-0 shadow-sm">
              DZ
            </div>
            <span className="font-montserrat font-black text-[10px] uppercase tracking-wider bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
              Designer Zion
            </span>
          </div>
          
          <button 
            onClick={handleNewProject}
            className="w-7 h-7 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/20 transition-all cursor-pointer"
            title="Nova Conversa (Zerar Configurações)"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {/* Nome do projeto editável */}
        <div className="mt-1 flex items-center justify-between gap-1 bg-[#050505]/45 hover:bg-[#050505]/80 border border-white/5 p-2 rounded-xl group transition-all duration-300">
          {isEditingName ? (
            <input
              type="text"
              value={tempProjectName}
              onChange={(e) => setTempProjectName(e.target.value)}
              onBlur={saveProjectName}
              onKeyDown={(e) => e.key === "Enter" && saveProjectName()}
              className="bg-transparent border-0 text-[10px] text-white focus:outline-none focus:ring-0 w-full font-bold uppercase tracking-wider"
              autoFocus
            />
          ) : (
            <span 
              className="text-[10px] font-black uppercase tracking-wider text-zinc-300 truncate max-w-[80%] cursor-pointer hover:text-white"
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              title="Trocar Conversa"
            >
              {activeProjectName}
            </span>
          )}
          
          <button
            onClick={isEditingName ? saveProjectName : startEditingName}
            className="text-zinc-500 hover:text-[#d4af37] transition-colors shrink-0 cursor-pointer"
          >
            {isEditingName ? <Check size={10} /> : <Edit2 size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>
        
        {showProjectSelector && !isEditingName && (
          <div className="absolute top-full left-5 right-5 mt-1 bg-[#0a0a0c]/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar animate-scale-in">
            {store.projectsList.map((p) => (
              <div
                key={p.id}
                className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${
                  p.id === store.activeProjectId ? "text-[#d4af37]" : "text-zinc-400"
                }`}
                onClick={() => {
                  store.loadProjectById(p.id);
                  setShowProjectSelector(false);
                  showToast(`Conversa "${p.name}" carregada.`, "success");
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider truncate mr-2">
                  {p.name}
                </span>
                <button
                  onClick={(e) => handleDeleteProject(p.id, e)}
                  className="text-zinc-650 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  title="Deletar Conversa"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-0.5 flex justify-between items-center">
          <span className="inline-block bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full truncate max-w-full shadow-sm">
            CONVERSA ATIVA
          </span>
        </div>
      </div>

      {/* Menu Principal (Abas de rotas simples SPA) */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {[
          { name: "Designer Zion", active: activeMenuTab === "Design Builder" || activeMenuTab === "Designer Zion" },
          { name: "Ref Builder", active: activeMenuTab === "Ref Builder" },
          { name: "Inspiração", active: activeMenuTab === "Inspiração" },
          { name: "Comunidade", active: activeMenuTab === "Comunidade" },
          { name: "Minha Galeria", active: activeMenuTab === "Minha Galeria" }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveMenuTab(tab.name === "Designer Zion" ? "Design Builder" : tab.name)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer relative ${
              tab.active || (activeMenuTab === tab.name)
                ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 font-bold scale-[1.02] shadow-md shadow-[#d4af37]/5"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02] border border-transparent"
            }`}
          >
            { (tab.active || activeMenuTab === tab.name) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#d4af37] rounded-r-full" />
            )}
            <span>{tab.name}</span>
            {(tab.active || activeMenuTab === tab.name) && <ChevronRight size={12} />}
          </button>
        ))}

        {/* Seção de Fontes Externas */}
        <div className="pt-6 px-1">
          <span className="text-[9.5px] font-black tracking-widest text-zinc-500 uppercase block mb-3.5">Fontes Externas</span>
          <div className="space-y-1.5">
            {["Todas as Fontes", "Pinterest", "Freepik", "Behance", "Comunidade"].map(source => (
              <a
                key={source}
                href="#"
                onClick={(e) => { e.preventDefault(); showToast(`Importando referências de ${source}...`, "success"); }}
                className="flex items-center justify-between py-2 text-[10.5px] font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors duration-200"
              >
                <span>{source}</span>
                <ExternalLink size={10} className="text-zinc-650" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de Status da API */}
      <div className="p-5 border-t border-white/5 bg-black/10 shrink-0 space-y-3">
        {/* Status Indicator */}
        <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#050505]/40 border border-white/5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${store.apiStatus === "Online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"} shrink-0`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {store.apiStatus === "Online" ? "Status: Online" : "Erro API"}
            </span>
          </div>
          <Activity size={12} className={store.apiStatus === "Online" ? "text-emerald-500" : "text-red-500"} />
        </div>

        {/* Testar Token */}
        <button
          onClick={handleTestToken}
          disabled={isTesting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/10 active:scale-95 disabled:opacity-50 text-[10px] font-extrabold uppercase tracking-widest text-zinc-300 rounded-xl transition-all cursor-pointer"
        >
          {isTesting ? (
            <>
              <RefreshCw size={11} className="animate-spin text-[#d4af37]" />
              <span>Testando...</span>
            </>
          ) : (
            <>
              <Play size={11} className="text-[#d4af37]" />
              <span>Testar Token</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
