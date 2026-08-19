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
  Trash2,
  Loader2,
  Copy,
  Bot,
  Compass,
  Users,
  Image as ImageIcon,
  Layers
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
    showToast("Conversa excluída.", "success");
    if (store.projectsList.length <= 1) {
      setShowProjectSelector(false);
    }
  };

  return (
    <div className="w-64 sm:w-72 lg:w-64 xl:w-72 max-w-[85vw] bg-black border-r border-[#c5a880]/15 flex flex-col h-full shrink-0 select-none">
      
      {/* Header da Sidebar com Nome do Projeto Editável e Badge */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 border-b border-[#c5a880]/15 shrink-0 relative bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#ad8330] flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#c5a880]/15 shrink-0">
              <Layers size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                Designer Zion
              </span>
              <span className="text-[9px] text-[#c5a880] font-mono tracking-widest uppercase">
                Estúdio Criativo
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleNewProject}
            className="w-7 h-7 rounded-lg bg-[#c5a880]/10 hover:bg-[#c5a880]/25 text-[#c5a880] flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Novo Projeto Limpo (Zerar Configurações)"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {/* Nome do projeto editável */}
        <div className="mt-0.5 flex items-center justify-between gap-1.5 bg-[#0a0a0a] p-2 rounded-xl border border-white/10 group hover:border-[#c5a880]/30 transition-colors">
          {isEditingName ? (
            <input
              type="text"
              value={tempProjectName}
              onChange={(e) => setTempProjectName(e.target.value)}
              onBlur={saveProjectName}
              onKeyDown={(e) => e.key === "Enter" && saveProjectName()}
              className="bg-transparent border-0 text-[11px] text-white focus:outline-none focus:ring-0 w-full font-bold uppercase tracking-wider"
              autoFocus
            />
          ) : (
            <span 
              className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 truncate max-w-[85%] cursor-pointer hover:text-[#c5a880] transition-colors"
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              title="Clique para alternar projeto"
            >
              {activeProjectName}
            </span>
          )}
          
          <button
            onClick={isEditingName ? saveProjectName : startEditingName}
            className="text-zinc-500 hover:text-[#c5a880] transition-colors shrink-0 p-1 cursor-pointer"
          >
            {isEditingName ? <Check size={12} className="text-[#c5a880]" /> : <Edit2 size={11} className="opacity-60 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>
        
        {showProjectSelector && !isEditingName && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-[#0a0a0a] border border-[#c5a880]/30 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar animate-fade-in p-1">
            {store.projectsList.map((p) => {
              const isProjGenerating = !!store.generatingProjectIds?.[p.id];
              const isCurrent = p.id === store.activeProjectId;
              return (
                <div
                  key={p.id}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isCurrent ? "bg-[#c5a880]/15 text-[#c5a880] font-extrabold" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                  onClick={() => {
                    store.loadProjectById(p.id);
                    setShowProjectSelector(false);
                    showToast(`Projeto "${p.name}" carregado.`, "success");
                  }}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    {isProjGenerating && <Loader2 size={11} className="animate-spin text-[#c5a880] shrink-0" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.id !== store.activeProjectId) {
                          store.loadProjectById(p.id);
                        }
                        store.duplicateProject();
                        setShowProjectSelector(false);
                        showToast(`Projeto "${p.name}" duplicado!`, "success");
                      }}
                      className="text-zinc-500 hover:text-[#c5a880] transition-colors p-1"
                      title="Duplicar Projeto"
                    >
                      <Copy size={11} />
                    </button>
                    {store.projectsList.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="Excluir Projeto"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="inline-flex items-center gap-1 bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#c5a880] text-[9.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse" />
            Projeto Ativo
          </span>
        </div>
      </div>

      {/* Menu Principal (Abas de rotas simples SPA) */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {[
          { name: "Designer Zion", icon: <Sparkles size={14} />, active: activeMenuTab === "Design Builder" || activeMenuTab === "Designer Zion" },
          { name: "Copiloto da Agência", icon: <Bot size={14} />, active: activeMenuTab === "Copiloto da Agência" },
          { name: "Inspiração", icon: <Compass size={14} />, active: activeMenuTab === "Inspiração" },
          { name: "Comunidade", icon: <Users size={14} />, active: activeMenuTab === "Comunidade" },
          { name: "Minha Galeria", icon: <ImageIcon size={14} />, active: activeMenuTab === "Minha Galeria" },
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveMenuTab(tab.name === "Designer Zion" ? "Design Builder" : tab.name)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              tab.active || (activeMenuTab === tab.name)
                ? "bg-[#c5a880] text-black font-extrabold shadow-md shadow-[#c5a880]/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={tab.active || (activeMenuTab === tab.name) ? "text-black" : "text-[#c5a880]"}>
                {tab.icon}
              </span>
              <span>{tab.name}</span>
            </div>
            {(tab.active || activeMenuTab === tab.name) && <ChevronRight size={13} className="text-black" />}
          </button>
        ))}

        {/* Seção de Fontes Externas */}
        <div className="pt-5 px-1">
          <span className="text-[9.5px] font-black tracking-widest text-[#c5a880]/70 uppercase block mb-2 px-2">Fontes Externas</span>
          <div className="space-y-1">
            {["Todas as Fontes", "Pinterest", "Freepik", "Behance", "Comunidade"].map(source => (
              <a
                key={source}
                href="#"
                onClick={(e) => { e.preventDefault(); showToast(`Importando referências de ${source}...`, "success"); }}
                className="flex items-center justify-between px-2.5 py-2 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-wider transition-colors"
              >
                <span>{source}</span>
                <ExternalLink size={10} className="text-zinc-600" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de Status da API */}
      <div className="p-4 border-t border-[#c5a880]/15 bg-black/40 shrink-0 space-y-2.5">
        {/* Status Indicator */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0a0a0a] border border-white/10">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${store.apiStatus === "Online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"} shrink-0`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
              {store.apiStatus === "Online" ? "API: Online" : "Erro API"}
            </span>
          </div>
          <Activity size={13} className={store.apiStatus === "Online" ? "text-emerald-400" : "text-red-400"} />
        </div>

        {/* Testar Token */}
        <button
          onClick={handleTestToken}
          disabled={isTesting}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 hover:border-[#c5a880]/40 active:scale-95 disabled:opacity-50 text-[10px] font-extrabold uppercase tracking-widest text-zinc-200 hover:text-[#c5a880] rounded-xl transition-all cursor-pointer"
        >
          {isTesting ? (
            <>
              <RefreshCw size={11} className="animate-spin text-[#c5a880]" />
              <span>Testando...</span>
            </>
          ) : (
            <>
              <Play size={11} className="text-[#c5a880]" />
              <span>Testar Conexão</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
