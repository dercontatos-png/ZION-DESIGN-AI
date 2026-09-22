import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  FolderPlus,
  Upload,
  X,
  Plus,
  ChevronDown,
  Loader2,
  Trash2,
  Check
} from "lucide-react";

export interface AssetFile {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  createdAt: number;
}

export interface FolderItem {
  id: string;
  name: string;
  clientId: string;
  files: AssetFile[];
  createdAt: number;
}

export interface ClientItem {
  id: string;
  name: string;
  color: string;
  folders: FolderItem[];
  createdAt: number;
}

const STORAGE_KEY = "zion_db_projetos_clients_v2";

const INITIAL_DEMO_CLIENTS: ClientItem[] = [
  {
    id: "client-fefe",
    name: "fefe",
    color: "#8b5cf6",
    createdAt: Date.now() - 3600000,
    folders: [
      {
        id: "pasta-7d5327a0-d12f-4edd-bbcb-2777de279fd2",
        name: "grgf",
        clientId: "client-fefe",
        createdAt: Date.now() - 3600000,
        files: []
      }
    ]
  }
];

interface ProjetosWorkspaceProps {
  compacto?: boolean;
  aoEscolher?: (asset: { url: string; name: string; id: string }) => void;
  className?: string;
}

export const ProjetosWorkspace: React.FC<ProjetosWorkspaceProps> = ({
  compacto = true,
  aoEscolher,
  className = ""
}) => {
  // Estado dos clientes e pastas compartilhados no localStorage
  const [clients, setClients] = useState<ClientItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_DEMO_CLIENTS;
  });

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    return clients[0]?.id || "client-fefe";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const targetFolderUploadRef = useRef<string | null>(null);

  // Sincronizar com o localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {
      console.warn("Falha ao salvar no localStorage:", e);
    }
  }, [clients]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    if (isClientDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isClientDropdownOpen]);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  const folders = activeClient?.folders || [];

  // Criar nova pasta
  const handleCreateFolder = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed || !activeClient) return;

    const newFolder: FolderItem = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pasta-${Date.now()}`,
      name: trimmed,
      clientId: activeClient.id,
      files: [],
      createdAt: Date.now()
    };

    setClients((prev) =>
      prev.map((c) =>
        c.id === activeClient.id ? { ...c, folders: [...c.folders, newFolder] } : c
      )
    );
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  // Criar novo cliente
  const handleCreateClient = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newClientName.trim();
    if (!trimmed) return;

    const newClient: ClientItem = {
      id: `client-${Date.now()}`,
      name: trimmed,
      color: "#8b5cf6",
      createdAt: Date.now(),
      folders: [
        {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pasta-${Date.now()}`,
          name: "Geral",
          clientId: `client-${Date.now()}`,
          files: [],
          createdAt: Date.now()
        }
      ]
    };

    setClients((prev) => [...prev, newClient]);
    setSelectedClientId(newClient.id);
    setNewClientName("");
    setIsCreatingClient(false);
    setIsClientDropdownOpen(false);
  };

  // Upload de arquivos para uma pasta específica
  const handleTriggerUpload = (folderId: string) => {
    targetFolderUploadRef.current = folderId;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const folderId = targetFolderUploadRef.current;
    if (!files || files.length === 0 || !folderId || !activeClient) return;

    setUploadingFolderId(folderId);

    const fileList = Array.from(files);
    const newAssets: AssetFile[] = [];

    for (const f of fileList) {
      if (!f.type.startsWith("image/")) continue;
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });

        newAssets.push({
          id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: f.name,
          url: dataUrl,
          size: f.size,
          type: f.type,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
      }
    }

    if (newAssets.length > 0) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === activeClient.id) {
            return {
              ...c,
              folders: c.folders.map((fld) => {
                if (fld.id === folderId) {
                  return { ...fld, files: [...newAssets, ...fld.files] };
                }
                return fld;
              })
            };
          }
          return c;
        })
      );
    }

    setUploadingFolderId(null);
    e.target.value = "";
  };

  // Excluir imagem de pasta
  const handleDeleteAsset = (folderId: string, assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeClient) return;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === activeClient.id) {
          return {
            ...c,
            folders: c.folders.map((fld) => {
              if (fld.id === folderId) {
                return { ...fld, files: fld.files.filter((fl) => fl.id !== assetId) };
              }
              return fld;
            })
          };
        }
        return c;
      })
    );
  };

  const normSearch = searchQuery.trim().toLowerCase();

  return (
    <div className={`flex flex-col h-full w-full bg-zinc-950/60 overflow-hidden ${className}`}>
      {/* ── SNIPPET 1: CABEÇALHO COM SELETOR DE CLIENTE E BUSCA ── */}
      <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-zinc-950/60 px-3 py-2">
        <div className="flex flex-col gap-0.5 relative" ref={dropdownRef}>
          <span className="pl-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Cliente
          </span>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-label={`Cliente: ${activeClient?.name || "fefe"}`}
            aria-expanded={isClientDropdownOpen}
            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
            className="flex h-8 max-w-[15rem] items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-colors border-violet-500/40 bg-violet-500/10 text-violet-200 cursor-pointer hover:bg-violet-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-users h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <path d="M16 3.128a4 4 0 0 1 0 7.744" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span className="truncate">{activeClient?.name || "fefe"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`lucide lucide-chevron-down h-3 w-3 shrink-0 transition-transform ${
                isClientDropdownOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Listbox de Clientes */}
          {isClientDropdownOpen && (
            <div
              role="listbox"
              className="absolute top-12 left-0 z-30 max-h-72 w-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="space-y-0.5">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={c.id === selectedClientId}
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setIsClientDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full truncate rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      c.id === selectedClientId
                        ? "bg-violet-500/20 text-violet-200 font-medium"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.color || "#8b5cf6" }}
                    />
                    <span className="truncate flex-1">{c.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {c.folders.length} pasta(s)
                    </span>
                  </button>
                ))}
              </div>

              {/* Criar Novo Cliente */}
              <div className="border-t border-white/10 mt-1.5 pt-1.5">
                {isCreatingClient ? (
                  <form onSubmit={handleCreateClient} className="flex items-center gap-1.5 p-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nome do cliente"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="h-7 flex-1 rounded-lg border border-white/10 bg-zinc-950 px-2 text-xs text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newClientName.trim()}
                      className="h-7 px-2.5 rounded-lg bg-violet-600 text-[11px] font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingClient(false);
                        setNewClientName("");
                      }}
                      className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingClient(true)}
                    className="flex items-center gap-1.5 w-full rounded-lg px-2.5 py-1.5 text-xs text-violet-300 hover:bg-violet-500/10 transition-colors cursor-pointer font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Novo cliente
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Campo de Busca */}
        <div className="relative ml-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-search pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          >
            <path d="m21 21-4.34-4.34" />
            <circle cx="11" cy="11" r="8" />
          </svg>
          <input
            placeholder="buscar arquivo…"
            aria-label="Buscar arquivo nesta pasta"
            className="h-8 w-52 rounded-lg border border-white/10 bg-zinc-900 pl-7 pr-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none transition-colors"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── CORPO PRINCIPAL COM AS PASTAS EM PILHA ── */}
      <div className="relative flex-1 overflow-y-auto p-4">
        {folders.length === 0 ? (
          /* ── SNIPPET 2 & 3: ESTADO VAZIO (NENHUMA PASTA NESTE CLIENTE) ── */
          <div className="flex flex-col items-center gap-4 px-4 py-16" data-testid="pastas-em-pilha">
            <p className="text-center text-sm text-zinc-500">Nenhuma pasta neste cliente</p>
            {isCreatingFolder ? (
              /* Snippet 3: Input inline para criar pasta */
              <div className="flex items-center gap-2 mx-auto w-full max-w-sm animate-in fade-in duration-150">
                <input
                  autoFocus
                  placeholder="Nome da pasta"
                  aria-label="Nova pasta"
                  className="h-9 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none disabled:opacity-50"
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") {
                      setIsCreatingFolder(false);
                      setNewFolderName("");
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!newFolderName.trim()}
                  onClick={() => handleCreateFolder()}
                  className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40 cursor-pointer"
                >
                  Criar
                </button>
                <button
                  type="button"
                  title="Cancelar"
                  aria-label="Cancelar"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="shrink-0 rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Snippet 2: Botão Nova Pasta */
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500 transition-colors hover:border-violet-500/40 hover:text-violet-300 mx-auto w-full max-w-sm py-4 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-folder-plus h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M12 10v6" />
                  <path d="M9 13h6" />
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                </svg>
                Nova pasta
              </button>
            )}
          </div>
        ) : (
          /* ── SNIPPET 4: COM PASTAS EM PILHA ── */
          <div className="flex flex-col gap-6" data-testid="pastas-em-pilha">
            {folders.map((folder) => {
              const matchingFiles = folder.files.filter((fl) =>
                normSearch ? fl.name.toLowerCase().includes(normSearch) : true
              );

              return (
                <section
                  key={folder.id}
                  data-testid={`pasta-${folder.id}`}
                  className="flex flex-col gap-2"
                >
                  {/* Cabeçalho da pasta */}
                  <header className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500/60" />
                    <h3 className="min-w-0 truncate text-sm font-medium text-zinc-200">
                      {folder.name}
                    </h3>
                    <span className="shrink-0 text-xs text-zinc-600">
                      {folder.files.length}
                    </span>
                    <button
                      type="button"
                      title="Arraste ou clique para enviar"
                      aria-label={`Arraste ou clique para enviar — ${folder.name}`}
                      onClick={() => handleTriggerUpload(folder.id)}
                      className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-violet-300 disabled:opacity-40 cursor-pointer"
                    >
                      {uploadingFolderId === folder.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-upload h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path d="M12 3v12" />
                          <path d="m17 8-5-5-5 5" />
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        </svg>
                      )}
                    </button>
                  </header>

                  {/* Grid de Imagens da Pasta (se houver arquivos) */}
                  {matchingFiles.length > 0 && (
                    <div
                      className="grid gap-2 grid-cols-4"
                      style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
                    >
                      {matchingFiles.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => aoEscolher?.({ url: asset.url, name: asset.name, id: asset.id })}
                          role={aoEscolher ? "button" : undefined}
                          tabIndex={aoEscolher ? 0 : undefined}
                          className={`group/card relative w-full overflow-hidden rounded-2xl transition-all duration-300 ease-in-out border border-white/5 bg-zinc-900 ${
                            aoEscolher
                              ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                              : ""
                          }`}
                        >
                          {/* Hover Overlay com Botão "+ Selecionar" */}
                          {aoEscolher && (
                            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-violet-950/70 via-violet-950/30 to-transparent opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
                              <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-br from-violet-500/45 via-violet-600/35 to-fuchsia-500/30 ring-1 ring-white/30 shadow-xl shadow-violet-900/50 backdrop-blur-md">
                                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                                Selecionar
                              </div>
                            </div>
                          )}

                          <div className="relative overflow-hidden w-full aspect-square bg-zinc-950 flex items-center justify-center">
                            <img
                              src={asset.url}
                              alt={asset.name}
                              loading="lazy"
                              className="block w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                            />

                            {/* Botão de Excluir */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAsset(folder.id, asset.id, e)}
                              className="absolute top-1.5 right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 opacity-0 group-hover/card:opacity-100 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                              title="Excluir arquivo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropzone / Upload button da pasta */}
                  <button
                    type="button"
                    onClick={() => handleTriggerUpload(folder.id)}
                    disabled={uploadingFolderId === folder.id}
                    className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-600 transition-colors hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-40 cursor-pointer ${
                      matchingFiles.length === 0 ? "py-6" : "py-3"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-upload h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path d="M12 3v12" />
                      <path d="m17 8-5-5-5 5" />
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    </svg>
                    Arraste ou clique para enviar
                  </button>
                </section>
              );
            })}

            {/* Input inline ou Botão Nova Pasta no final das pastas */}
            {isCreatingFolder ? (
              <div className="flex items-center gap-2 py-1 animate-in fade-in duration-150">
                <input
                  autoFocus
                  placeholder="Nome da pasta"
                  aria-label="Nova pasta"
                  className="h-9 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none disabled:opacity-50"
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") {
                      setIsCreatingFolder(false);
                      setNewFolderName("");
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!newFolderName.trim()}
                  onClick={() => handleCreateFolder()}
                  className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40 cursor-pointer"
                >
                  Criar
                </button>
                <button
                  type="button"
                  title="Cancelar"
                  aria-label="Cancelar"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="shrink-0 rounded-xl p-2 text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500 transition-colors hover:border-violet-500/40 hover:text-violet-300 py-3 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-folder-plus h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M12 10v6" />
                  <path d="M9 13h6" />
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                </svg>
                Nova pasta
              </button>
            )}

            {/* Input de Arquivos Oculto */}
            <input
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              type="file"
              onChange={handleFilesSelected}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjetosWorkspace;
