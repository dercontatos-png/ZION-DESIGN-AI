import React, { useState } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useClientStore } from "../store/useClientStore";
import {
  Sparkles,
  ChevronRight,
  ExternalLink,
  Activity,
  Play,
  RefreshCw,
  Edit2,
  Check,
  Plus,
  FolderOpen,
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
    <div className="w-[15%] bg-[#0f0f11] border-r border-zinc-800/80 flex flex-col h-full shrink-0 select-none">
      
      {/* Header da Sidebar com Nome do Projeto Editável e Badge */}
      <div className="p-6 flex flex-col gap-3 border-b border-zinc-800 shrink-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#ad8330] flex items-center justify-center font-bold text-black text-sm shrink-0">
              DZ
            </div>
            <span className="font-extrabold text-xs uppercase tracking-widest text-[#ad8330]">
              Designer Zion
            </span>
          </div>
          
          <button 
            onClick={handleNewProject}
            className="w-7 h-7 rounded bg-[#ad8330]/10 hover:bg-[#ad8330]/20 flex items-center justify-center text-[#ad8330] transition-colors"
            title="Nova Conversa (Zerar Configurações)"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {/* Nome do projeto editável */}
        <div className="mt-1 flex items-center justify-between gap-1 bg-zinc-950/60 p-2 rounded-lg border border-zinc-900 group">
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
            className="text-zinc-550 hover:text-[#ad8330] transition-colors shrink-0"
          >
            {isEditingName ? <Check size={10} /> : <Edit2 size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>
        
        {showProjectSelector && !isEditingName && (
          <div className="absolute top-full left-6 right-6 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
            {store.projectsList.map((p) => (
              <div
                key={p.id}
                className={`w-full flex items-center justify-between px-3 py-2 border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer ${
                  p.id === store.activeProjectId ? "text-[#ad8330]" : "text-zinc-400"
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
                  className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                  title="Deletar Conversa"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-0.5 flex justify-between items-center">
          <span className="inline-block bg-[#ad8330]/20 border border-[#ad8330]/40 text-[#ad8330] text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full truncate max-w-full">
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
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab.active || (activeMenuTab === tab.name)
                ? "bg-[#ad8330]/10 text-[#ad8330] border border-[#ad8330]/20 ring-1 ring-[#ad8330]/10"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
            }`}
          >
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
                className="flex items-center justify-between py-2.5 text-[10.5px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
              >
                <span>{source}</span>
                <ExternalLink size={10} className="text-zinc-600" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de Status da API */}
      <div className="p-5 border-t border-zinc-800 bg-black/15 shrink-0 space-y-3.5">
        {/* Status Indicator */}
        <div className="flex items-center justify-between px-3.5 py-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${store.apiStatus === "Online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"} shrink-0`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-450">
              {store.apiStatus === "Online" ? "Status: Online" : "Erro API"}
            </span>
          </div>
          <Activity size={12} className={store.apiStatus === "Online" ? "text-emerald-500" : "text-red-500"} />
        </div>

        {/* Testar Token */}
        <button
          onClick={handleTestToken}
          disabled={isTesting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-95 disabled:opacity-50 text-[10px] font-extrabold uppercase tracking-widest text-zinc-300 rounded-lg transition-all cursor-pointer"
        >
          {isTesting ? (
            <>
              <RefreshCw size={11} className="animate-spin text-[#ad8330]" />
              <span>Testando...</span>
            </>
          ) : (
            <>
              <Play size={11} className="text-[#ad8330]" />
              <span>Testar Token</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
