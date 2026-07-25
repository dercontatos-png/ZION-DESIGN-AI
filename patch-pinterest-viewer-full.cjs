const fs = require('fs');

const code = `import React, { useState, useEffect } from "react";
import { Folder, Image as ImageIcon, LogIn, LogOut, Loader2, Search, LayoutGrid, Globe, Download } from "lucide-react";

export const PinterestViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"search" | "boards">("search");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("logo design");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pinterest Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem("pinterest_access_token"));
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initial search
    handleSearch("logo design");
  }, []);

  useEffect(() => {
    if (token && activeTab === "boards") {
      fetchBoards();
    }
  }, [token, activeTab]);

  useEffect(() => {
    if (selectedBoard && activeTab === "boards") {
      fetchPins(selectedBoard);
    }
  }, [selectedBoard]);

  const handleSearch = async (queryToSearch?: string) => {
    const q = queryToSearch || searchQuery;
    if (!q) return;
    
    setIsSearching(true);
    setError("");
    try {
      // Append site:pinterest.com to focus results on Pinterest
      const res = await fetch(\`/api/search/images?q=\${encodeURIComponent(q + " site:pinterest.com")}\`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.items || []);
      } else {
        setError(data.error || "Erro ao buscar imagens.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pinterest/auth");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao obter URL de autenticação");

      const authWindow = window.open(data.url, 'pinterest_oauth', 'width=600,height=700');
      if (!authWindow) {
        setError("Por favor, permita popups neste site para conectar sua conta.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'PINTEREST_AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem("pinterest_access_token", event.data.token);
        setToken(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pinterest/boards", {
        headers: { "Authorization": \`Bearer \${token}\` }
      });
      const data = await res.json();
      if (res.ok) {
        setBoards(data.items || []);
      } else {
        if (res.status === 401) {
          logout();
        }
        setError(data.message || "Erro ao carregar pastas.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPins = async (boardId: string) => {
    setLoading(true);
    setError("");
    setPins([]);
    try {
      const res = await fetch(\`/api/pinterest/boards/\${boardId}/pins\`, {
        headers: { "Authorization": \`Bearer \${token}\` }
      });
      const data = await res.json();
      if (res.ok) {
        setPins(data.items || []);
      } else {
        setError(data.message || "Erro ao carregar pins.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("pinterest_access_token");
    setToken(null);
    setBoards([]);
    setPins([]);
    setSelectedBoard(null);
  };

  return (
    <div className="bg-[#0f0f11] rounded-2xl border border-zinc-800 p-6 flex flex-col h-full max-h-[85vh]">
      
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Referências Pinterest</h3>
            <p className="text-sm text-zinc-400">Busque imagens ou acesse suas pastas salvas</p>
          </div>
        </div>
        
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveTab("search")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors \${
              activeTab === "search" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }\`}
          >
            <Globe className="w-4 h-4" />
            Busca Global
          </button>
          <button
            onClick={() => setActiveTab("boards")}
            className={\`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors \${
              activeTab === "boards" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }\`}
          >
            <LayoutGrid className="w-4 h-4" />
            Meus Painéis
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-900/50 flex items-center gap-3 shrink-0">
          <Folder className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Busca Global View */}
      {activeTab === "search" && (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex gap-2 mb-6 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar referências (ex: Tech Logo, Brand Manual)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !searchQuery}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors whitespace-nowrap"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Buscar"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
            {isSearching ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-zinc-500 p-12 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p>Nenhuma imagem encontrada. Tente outros termos.</p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {searchResults.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden bg-zinc-900 break-inside-avoid border border-zinc-800/50 hover:border-red-500/50 transition-colors">
                    <img
                      src={url}
                      alt="Referência Pinterest"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-white bg-black/50 px-3 py-1.5 rounded backdrop-blur-md uppercase tracking-wider font-bold hover:bg-red-600 transition-colors flex items-center gap-2">
                         <Download size={12} /> Salvar/Copiar
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meus Painéis View */}
      {activeTab === "boards" && (
        <div className="flex flex-col h-full overflow-hidden">
          {!token ? (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
                <LogIn className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Conecte sua Conta</h3>
              <p className="text-zinc-400 text-sm mb-8 max-w-md leading-relaxed">
                Para visualizar seus painéis e pins privados, você precisa conectar sua conta do Pinterest.
              </p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-3"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Conectar com Pinterest
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-end mb-4 shrink-0">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-red-900/30 text-zinc-400 hover:text-red-500 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider border border-zinc-800"
                >
                  <LogOut className="w-3 h-3" /> Desconectar
                </button>
              </div>

              {!selectedBoard ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                    </div>
                  ) : boards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-zinc-500 p-12 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                      <Folder className="w-12 h-12 text-zinc-700 mb-4" />
                      <h4 className="text-zinc-300 font-bold mb-2">Nenhum painel encontrado</h4>
                      <p className="text-sm max-w-md">Crie um painel no Pinterest e recarregue.</p>
                      <button 
                        onClick={fetchBoards}
                        className="mt-6 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-red-900/30"
                      >
                        Atualizar Painéis
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {boards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => setSelectedBoard(board.id)}
                          className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-red-600/50 hover:bg-zinc-900 transition-all group"
                        >
                          <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-red-600/10 flex items-center justify-center mb-4 transition-colors">
                            <Folder className="w-8 h-8 text-zinc-500 group-hover:text-red-500 transition-colors" />
                          </div>
                          <span className="text-sm font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider line-clamp-2">{board.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-center gap-4 mb-6 shrink-0">
                    <button
                      onClick={() => setSelectedBoard(null)}
                      className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      &larr; Voltar aos Painéis
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
                    {loading ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                      </div>
                    ) : pins.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-zinc-500 p-12 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                        <ImageIcon className="w-12 h-12 text-zinc-700 mb-4" />
                        <h4 className="text-zinc-300 font-bold mb-2">Nenhum pin encontrado</h4>
                        <button 
                          onClick={() => fetchPins(selectedBoard)}
                          className="mt-6 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-red-900/30"
                        >
                          Atualizar Painel
                        </button>
                      </div>
                    ) : (
                      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {pins.map((pin) => (
                          <div key={pin.id} className="relative group rounded-xl overflow-hidden bg-zinc-900 break-inside-avoid">
                            {pin.media?.images?.['400x300']?.url || pin.media?.images?.['1200x']?.url || pin.media?.images?.['150x150']?.url ? (
                              <img
                                src={pin.media.images['1200x']?.url || pin.media.images['400x300']?.url || pin.media.images['150x150']?.url}
                                alt={pin.title || pin.description || 'Pin'}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-40 flex items-center justify-center text-zinc-600">
                                <ImageIcon className="w-8 h-8 opacity-50" />
                              </div>
                            )}
                            {(pin.title || pin.description) && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                                <p className="text-white text-xs font-medium line-clamp-3 leading-relaxed">
                                  {pin.title || pin.description}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync('src/components/PinterestViewer.tsx', code);
console.log("Updated PinterestViewer to support Global Search");
