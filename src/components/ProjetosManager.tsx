import React, { useState, useEffect, useRef } from "react";
import { set as idbSet, get as idbGet } from "idb-keyval";
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  MoreHorizontal,
  Upload,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Edit2,
  Download,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Layers
} from "lucide-react";

export interface AssetFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  dimensions?: { width: number; height: number };
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

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

const STORAGE_KEY = "zion_db_projetos_clients_v8";

const INITIAL_DEMO_CLIENTS: ClientItem[] = [
  {
    id: "client-ghgf",
    name: "ghgf",
    color: "#ec4899",
    createdAt: Date.now() - 14400000,
    folders: []
  },
  {
    id: "client-kjkh",
    name: "kjkh",
    color: "rgb(168, 85, 247)",
    createdAt: Date.now() - 10800000,
    folders: []
  },
  {
    id: "client-bbbg",
    name: "bbbg",
    color: "rgb(139, 92, 246)",
    createdAt: Date.now() - 7200000,
    folders: [
      {
        id: "folder-gbgbg",
        name: "gbgbg",
        clientId: "client-bbbg",
        createdAt: Date.now() - 7200000,
        files: [
          {
            id: "asset-demo-1",
            name: "WhatsApp Image 2026-09-08 at 10.10.51 AM (1).avif",
            url: "/galeria/thumbnail(23).avif",
            size: 45200,
            type: "image/avif",
            createdAt: Date.now() - 3600000
          }
        ]
      }
    ]
  },
  {
    id: "client-fefe",
    name: "fefe",
    color: "rgb(99, 102, 241)",
    createdAt: Date.now() - 3600000,
    folders: [
      {
        id: "folder-grgf",
        name: "grgf",
        clientId: "client-fefe",
        createdAt: Date.now() - 3600000,
        files: []
      }
    ]
  }
];

interface ProjetosManagerProps {
  onOpenVitrine?: () => void;
  onOpenStudio?: (agentSlug?: string) => void;
  onOpenGallery?: () => void;
  onOpenCommunity?: () => void;
  onOpenChat?: () => void;
  onUseImageAsReference?: (imageBase64: string) => void;
  showToast?: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const ProjetosManager: React.FC<ProjetosManagerProps> = ({
  onOpenVitrine,
  onOpenStudio,
  onOpenGallery,
  onOpenCommunity,
  onOpenChat,
  onUseImageAsReference,
  showToast = () => {}
}) => {
  // Estado principal de clientes
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

  // Carrega clientes persistidos permanentemente no servidor e no IndexedDB
  useEffect(() => {
    let isMounted = true;
    const loadClients = async () => {
      try {
        const res = await fetch("/api/clientes");
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.clients) && data.clients.length > 0) {
            if (isMounted) {
              setClients(data.clients);
              try { idbSet("zion_projetos_clients", data.clients); } catch (_) {}
            }
            return;
          }
        }
      } catch (err) {
        console.warn("[ProjetosManager] Falha ao carregar do backend:", err);
      }

      try {
        const idbClients = await idbGet("zion_projetos_clients");
        if (idbClients && Array.isArray(idbClients) && idbClients.length > 0) {
          if (isMounted) setClients(idbClients);
        }
      } catch (_) {}
    };

    loadClients();
    return () => { isMounted = false; };
  }, []);

  const [selectedClientId, setSelectedClientId] = useState<string | null>("client-bbbg");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>("folder-gbgbg");

  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>(() => {
    return {
      "client-bbbg": true,
      "client-fefe": true,
    };
  });

  // Modais e inputs de criação/edição
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientColor, setNewClientColor] = useState(PRESET_COLORS[0]);

  const [isCreatingFolderForClientId, setIsCreatingFolderForClientId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editClientName, setEditClientName] = useState("");

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  const [clientMenuOpenId, setClientMenuOpenId] = useState<string | null>(null);

  // Drag and drop & upload
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview modal para imagem do projeto
  const [previewImage, setPreviewImage] = useState<AssetFile | null>(null);

  // Responsividade mobile (alternar lista de clientes vs conteúdo da pasta)
  const [mobileView, setMobileView] = useState<"sidebar" | "content">("sidebar");

  // Salvar permanentemente no servidor, IndexedDB e LocalStorage sempre que houver alteração
  useEffect(() => {
    if (!Array.isArray(clients) || clients.length === 0) return;

    // 1. Salvar no IndexedDB (sem limite de 5MB)
    idbSet("zion_projetos_clients", clients).catch((err) => {
      console.warn("[ProjetosManager] IDB write error:", err);
    });

    // 2. Salvar fisicamente no disco do servidor (/api/clientes)
    fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clients })
    }).catch((err) => {
      console.warn("[ProjetosManager] Erro ao sincronizar projetos com servidor:", err);
    });

    // 3. Salvar cópia limpa no LocalStorage
    try {
      const sanitized = clients.map((c) => ({
        ...c,
        folders: c.folders.map((f) => ({
          ...f,
          files: f.files.map((file) => ({
            ...file,
            url: file.url && file.url.startsWith("data:") && file.url.length > 500 ? "" : file.url
          }))
        }))
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Falha ao salvar projetos no localStorage:", e);
    }
  }, [clients]);

  // Cliente e pasta ativos atualmente
  const activeClient = clients.find((c) => c.id === selectedClientId) || null;
  const activeFolder = activeClient?.folders.find((f) => f.id === selectedFolderId) || null;

  const toggleClientExpand = (clientId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleSelectFolder = (clientId: string, folderId: string) => {
    setSelectedClientId(clientId);
    setSelectedFolderId(folderId);
    setMobileView("content");
  };

  const handleCreateClient = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newClientName.trim();
    if (!trimmed) {
      showToast("Digite o nome do cliente.", "warning");
      return;
    }

    const colorIndex = clients.length % PRESET_COLORS.length;
    const newClient: ClientItem = {
      id: `client-${Date.now()}`,
      name: trimmed,
      color: PRESET_COLORS[colorIndex],
      createdAt: Date.now(),
      folders: []
    };

    setClients((prev) => [newClient, ...prev]);
    setSelectedClientId(newClient.id);
    setSelectedFolderId(null);
    setExpandedClients((prev) => ({ ...prev, [newClient.id]: true }));
    setNewClientName("");
    setIsCreatingClient(false);
    showToast(`Cliente "${trimmed}" criado com sucesso!`, "success");
  };

  const handleDeleteClient = (clientId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const c = clients.find((x) => x.id === clientId);
    if (!c) return;
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${c.name}" e todas as suas pastas?`)) {
      setClients((prev) => prev.filter((x) => x.id !== clientId));
      if (selectedClientId === clientId) {
        const remaining = clients.filter((x) => x.id !== clientId);
        if (remaining.length > 0) {
          setSelectedClientId(remaining[0].id);
          setSelectedFolderId(remaining[0].folders[0]?.id || null);
        } else {
          setSelectedClientId(null);
          setSelectedFolderId(null);
        }
      }
      setClientMenuOpenId(null);
      showToast(`Cliente "${c.name}" excluído.`, "info");
    }
  };

  const handleSaveRenameClient = (clientId: string) => {
    const trimmed = editClientName.trim();
    if (!trimmed) return;
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, name: trimmed } : c))
    );
    setEditingClientId(null);
    setEditClientName("");
    showToast("Cliente renomeado com sucesso!", "success");
  };

  const handleCreateFolder = (clientId: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      showToast("Digite o nome da pasta.", "warning");
      return;
    }

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: trimmed,
      clientId,
      createdAt: Date.now(),
      files: []
    };

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            folders: [...c.folders, newFolder]
          };
        }
        return c;
      })
    );

    setSelectedClientId(clientId);
    setSelectedFolderId(newFolder.id);
    setNewFolderName("");
    setIsCreatingFolderForClientId(null);
    showToast(`Pasta "${trimmed}" criada!`, "success");
  };

  const handleDeleteFolder = (clientId: string, folderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const c = clients.find((x) => x.id === clientId);
    const f = c?.folders.find((x) => x.id === folderId);
    if (!f) return;

    if (window.confirm(`Excluir pasta "${f.name}"?`)) {
      setClients((prev) =>
        prev.map((cl) => {
          if (cl.id === clientId) {
            const nextFolders = cl.folders.filter((x) => x.id !== folderId);
            return { ...cl, folders: nextFolders };
          }
          return cl;
        })
      );

      if (selectedFolderId === folderId) {
        const remainingFolders = c?.folders.filter((x) => x.id !== folderId) || [];
        setSelectedFolderId(remainingFolders[0]?.id || null);
      }
      showToast(`Pasta "${f.name}" excluída.`, "info");
    }
  };

  // Upload de arquivos
  const handleFilesUpload = async (filesList: FileList | File[]) => {
    if (!selectedClientId || !selectedFolderId) {
      showToast("Selecione uma pasta para enviar os arquivos.", "warning");
      return;
    }

    const filesArray = Array.from(filesList);
    const validFiles = filesArray.filter((f) => f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      showToast("Por favor envie imagens válidas (PNG, JPEG, WebP, GIF, AVIF).", "warning");
      return;
    }

    showToast(`Enviando ${validFiles.length} arquivo(s)...`, "info");

    const newAssetFiles: AssetFile[] = [];

    for (const file of validFiles) {
      try {
        let fileUrl = "";

        // Envia ao servidor para persistência física no disco (/public/uploads)
        try {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData?.url) {
              fileUrl = uploadData.url;
            }
          }
        } catch (_) {}

        // Se falhar upload físico, gera base64
        if (!fileUrl) {
          fileUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        // Obter dimensões
        const dims = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = fileUrl;
        });

        newAssetFiles.push({
          id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: fileUrl,
          size: file.size,
          type: file.type,
          dimensions: dims.width > 0 ? dims : undefined,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Erro ao processar arquivo:", err);
      }
    }

    if (newAssetFiles.length > 0) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === selectedClientId) {
            return {
              ...c,
              folders: c.folders.map((f) => {
                if (f.id === selectedFolderId) {
                  return {
                    ...f,
                    files: [...newAssetFiles, ...f.files]
                  };
                }
                return f;
              })
            };
          }
          return c;
        })
      );
      showToast(`${newAssetFiles.length} imagem(ns) adicionada(s) à pasta!`, "success");
    }
  };

  const handleDeleteFile = (fileId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedClientId || !selectedFolderId) return;

    if (window.confirm("Deseja excluir esta imagem da pasta?")) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === selectedClientId) {
            return {
              ...c,
              folders: c.folders.map((f) => {
                if (f.id === selectedFolderId) {
                  return {
                    ...f,
                    files: f.files.filter((fl) => fl.id !== fileId)
                  };
                }
                return f;
              })
            };
          }
          return c;
        })
      );
      showToast("Imagem excluída.", "info");
    }
  };

  const handleDownloadFile = (file: AssetFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name || "projeto-imagem.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Download iniciado!", "success");
  };

  const handleSendToRefBuilder = (file: AssetFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onUseImageAsReference) {
      onUseImageAsReference(file.url);
    } else if (onOpenStudio) {
      onOpenStudio("ref");
    }
    showToast("Imagem enviada para o REF Builder como referência!", "success");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 min-h-0 max-lg:overflow-x-hidden lg:pb-0 overflow-y-auto overscroll-contain pb-mobile-nav lg:overflow-y-auto w-full select-none text-zinc-100 font-sans">
      <div className="max-lg:h-full max-lg:min-h-0 max-lg:overflow-hidden flex min-h-screen">
        
        {/* ── COLUNA LATERAL DE CLIENTES ── */}
        <div className={`w-full shrink-0 lg:flex lg:w-auto ${mobileView === "sidebar" || !selectedClientId ? "flex" : "hidden lg:flex"}`}>
          <div className="flex w-full shrink-0 flex-col bg-zinc-950 max-lg:h-full max-lg:min-h-0 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-white/[0.06] lg:-ml-[60px] lg:w-[340px] lg:min-w-[300px] lg:pl-[60px]">
            {/* Header da Sidebar */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <span className="text-sm font-semibold text-zinc-200">Clientes</span>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingClient(true);
                  setIsCreatingFolderForClientId(null);
                }}
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-zinc-800 px-3 text-[13px] font-medium text-zinc-200 shadow-depth-rest transition-[transform,box-shadow,background-color] duration-150 ease-out active:scale-[.985] active:bg-zinc-700 active:shadow-depth-press cursor-pointer"
                title="Novo cliente"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Novo</span>
              </button>
            </div>

            {/* Lista de Clientes e Pastas */}
            <div className="flex-1 overflow-y-auto py-1 pb-mobile-nav">
              {/* Formulário Inline Oficial de Criação de Cliente (1:1 com produção) */}
              {isCreatingClient && (
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  <input
                    autoFocus
                    placeholder="Nome do cliente"
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50"
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newClientName.trim()) {
                        handleCreateClient();
                      }
                      if (e.key === "Escape") {
                        setIsCreatingClient(false);
                        setNewClientName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!newClientName.trim()}
                    onClick={() => handleCreateClient()}
                    className="shrink-0 rounded-md bg-violet-600 px-2 py-1.5 text-[10px] font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingClient(false);
                      setNewClientName("");
                    }}
                    className="shrink-0 rounded-md px-1.5 py-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              )}
              {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
                    <Folder size={24} />
                  </div>
                  <p className="text-xs font-medium text-zinc-400 mb-1">Nenhum cliente ainda</p>
                  <p className="text-[11px] text-zinc-600 mb-4 max-w-[200px]">
                    Organize seus projetos e referências criando seu primeiro cliente.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingClient(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors shadow-lg shadow-violet-600/20 cursor-pointer"
                  >
                    <Plus size={14} /> Criar primeiro cliente
                  </button>
                </div>
              ) : (
                clients.map((client) => {
                  const isExpanded = !!expandedClients[client.id];
                  const isClientSelected = selectedClientId === client.id;
                  const isRenaming = editingClientId === client.id;

                  return (
                    <div key={client.id}>
                      {/* Linha do Cliente */}
                      {isRenaming ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 rounded-lg mx-1 my-0.5">
                          <input
                            type="text"
                            autoFocus
                            value={editClientName}
                            onChange={(e) => setEditClientName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRenameClient(client.id);
                              if (e.key === "Escape") setEditingClientId(null);
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRenameClient(client.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingClientId(null)}
                            className="p-1 text-zinc-500 hover:text-zinc-300"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Card do Cliente Mobile (1:1 com snippet 1) */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedClientId(client.id);
                              if (client.folders && client.folders.length > 0) {
                                setSelectedFolderId(client.folders[0].id);
                              }
                              setMobileView("content");
                            }}
                            className="mx-2 my-1 flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl px-3 transition-[transform,box-shadow,background-color] duration-150 ease-out active:scale-[.985] active:shadow-depth-press shadow-depth-rest hover:bg-zinc-900/60 lg:hidden"
                          >
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: client.color || "rgb(139, 92, 246)" }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-medium text-zinc-100">{client.name}</p>
                              <p className="truncate text-[11px] text-zinc-500">Toque para ver pastas</p>
                            </div>
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setClientMenuOpenId(clientMenuOpenId === client.id ? null : client.id);
                                }}
                                className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 active:text-zinc-300 cursor-pointer"
                              >
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                            <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600" aria-hidden="true" />
                          </div>

                          {/* Desktop Tree View Item */}
                          <div
                            className="hidden lg:flex group items-center gap-2 px-3 mx-1 cursor-pointer py-2 rounded-lg transition-colors hover:bg-zinc-800/80 border-l-2 border-transparent"
                            onClick={() => {
                              setSelectedClientId(client.id);
                              if (!expandedClients[client.id]) {
                                setExpandedClients((prev) => ({ ...prev, [client.id]: true }));
                              }
                              if (client.folders && client.folders.length > 0) {
                                setSelectedFolderId(client.folders[0].id);
                              }
                            }}
                          >
                          {/* Botão de Expandir / Recolher */}
                          <button
                            type="button"
                            onClick={(e) => toggleClientExpand(client.id, e)}
                            className="shrink-0 p-0.5 text-zinc-400 hover:text-zinc-200"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </button>

                          {/* Ponto Colorido do Cliente */}
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: client.color || "rgb(139, 92, 246)" }}
                          />

                          {/* Nome do Cliente */}
                          <button
                            type="button"
                            className="flex-1 text-left text-[13px] font-medium text-zinc-200 truncate hover:text-white transition-colors"
                          >
                            {client.name}
                          </button>

                          {/* Menu Três Pontos */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClientMenuOpenId(clientMenuOpenId === client.id ? null : client.id);
                              }}
                              className="shrink-0 p-0.5 text-zinc-500 opacity-100 transition-all hover:text-zinc-300 lg:text-zinc-700 lg:opacity-0 lg:hover:text-zinc-400 lg:group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-3 w-3" aria-hidden="true" />
                            </button>

                            {/* Popover do Menu do Cliente */}
                            {clientMenuOpenId === client.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCreatingFolderForClientId(client.id);
                                    setExpandedClients((p) => ({ ...p, [client.id]: true }));
                                    setClientMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/[0.08] hover:text-white rounded-lg transition-colors text-left cursor-pointer"
                                >
                                  <Plus size={12} /> Nova pasta
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingClientId(client.id);
                                    setEditClientName(client.name);
                                    setClientMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/[0.08] hover:text-white rounded-lg transition-colors text-left cursor-pointer"
                                >
                                  <Edit2 size={12} /> Renomear
                                </button>
                                <div className="h-px bg-zinc-800 my-1" />
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteClient(client.id, e)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-500/15 hover:text-red-300 rounded-lg transition-colors text-left cursor-pointer"
                                >
                                  <Trash2 size={12} /> Excluir cliente
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Pastas Aninhadas (quando expandido no desktop) */}
                    {isExpanded && (
                      <div className="hidden lg:block ml-6 border-l border-zinc-800 pl-1">
                          {client.folders.map((folder) => {
                            const isFolderSelected =
                              selectedClientId === client.id && selectedFolderId === folder.id;

                            return (
                              <div key={folder.id}>
                                <div
                                  onClick={() => handleSelectFolder(client.id, folder.id)}
                                  className={`group flex items-center gap-2 px-2.5 mx-1 cursor-pointer py-1.5 rounded-lg transition-colors max-lg:min-h-[44px] max-lg:rounded-xl max-lg:transition-[transform,box-shadow,background-color] max-lg:duration-150 max-lg:active:scale-[.985] ${
                                    isFolderSelected
                                      ? "bg-violet-500/15 text-violet-300 max-lg:shadow-depth-raised max-lg:bg-violet-500/20"
                                      : "hover:bg-zinc-800/60 text-zinc-400 max-lg:active:bg-zinc-800/50 max-lg:active:shadow-depth-press"
                                  }`}
                                >
                                  <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                  <button
                                    type="button"
                                    className="flex-1 text-left text-[12px] font-medium truncate hover:text-zinc-200 transition-colors"
                                  >
                                    {folder.name}
                                  </button>

                                  {/* Botão de Deletar Pasta */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteFolder(client.id, folder.id, e)}
                                    className="shrink-0 p-0.5 text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                    title="Deletar projeto"
                                  >
                                    <Trash2 className="lucide-trash-2 h-2.5 w-2.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Formulário Inline de Criação de Pasta */}
                          {isCreatingFolderForClientId === client.id ? (
                            <div className="flex items-center gap-1 px-2 py-1">
                              <input
                                autoFocus
                                placeholder="Nome da pasta"
                                className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50"
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCreateFolder(client.id);
                                  if (e.key === "Escape") setIsCreatingFolderForClientId(null);
                                }}
                              />
                              <button
                                type="button"
                                disabled={!newFolderName.trim()}
                                onClick={() => handleCreateFolder(client.id)}
                                className="shrink-0 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
                              >
                                Criar
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsCreatingFolderForClientId(null)}
                                className="shrink-0 rounded-md px-1 py-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                                title="Cancelar"
                              >
                                <X className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingFolderForClientId(client.id);
                                setNewFolderName("");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-md mx-1 transition-colors"
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                              Nova pasta
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── PAINEL PRINCIPAL À DIREITA (CONTEÚDO DA PASTA OU ESTADO VAZIO) ── */}
        {activeClient && activeFolder ? (
          <div
            className={`relative flex-1 overflow-y-auto ${
              mobileView === "content" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
            }`}
          >
            <div className="flex min-h-full flex-col max-lg:pb-mobile-nav gap-6 px-4 py-6 lg:px-8 lg:py-10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Voltar à lista"
                    onClick={() => setMobileView("sidebar")}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-[transform,background-color] duration-150 hover:bg-white/[0.06] hover:text-white active:scale-90 active:bg-white/[0.08] lg:hidden"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: activeClient.color || "rgb(139, 92, 246)" }}
                      />
                      <span>{activeClient.name}</span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-300">{activeFolder.name}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white max-lg:[text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                      {activeFolder.name}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-40 max-lg:min-h-[44px] max-lg:rounded-xl max-lg:shadow-depth-raised max-lg:transition-[transform,box-shadow,background-color] max-lg:duration-150 max-lg:active:scale-95 max-lg:active:shadow-depth-press"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesUpload(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              {/* Contador Oficial de Arquivos */}
              <p className="text-sm text-zinc-400">
                {activeFolder.files && activeFolder.files.length > 0
                  ? `${activeFolder.files.length} ${activeFolder.files.length === 1 ? "arquivo" : "arquivos"}`
                  : "0 arquivos"}
              </p>

              {/* Masonry 3 colunas (quando houver arquivos) */}
              {activeFolder.files && activeFolder.files.length > 0 && (
                <div data-media-masonry="true" className="flex w-full" style={{ gap: 12 }}>
                  {[0, 1, 2].map((colIndex) => {
                    const colFiles = activeFolder.files.filter((_, idx) => idx % 3 === colIndex);

                    return (
                      <div
                        key={colIndex}
                        data-media-column={colIndex}
                        className="flex min-w-0 flex-1 flex-col"
                        style={{ gap: 12 }}
                      >
                        {colFiles.map((file) => {
                          const ext = file.name
                            ? file.name.split(".").pop()?.toLowerCase() || "img"
                            : "img";
                          const globalIdx = activeFolder.files.indexOf(file);

                          return (
                            <div
                              key={file.id}
                              data-media-window="mounted"
                              className="w-full [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
                            >
                              <div data-media-index={globalIdx} className="w-full">
                                <div className="group/card relative w-full overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_400px] rounded-2xl transition-all duration-300 ease-in-out max-lg:rounded-3xl max-lg:shadow-depth-rest max-lg:[contain:layout_paint] max-lg:transition-[transform,box-shadow] max-lg:duration-150 max-lg:ease-out max-lg:active:scale-[.98] max-lg:active:shadow-depth-press">
                                  <div className="relative overflow-hidden w-full">
                                    <span className="absolute bottom-2 left-2 z-10 hidden max-lg:flex items-center rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wide text-white/85 ring-1 ring-white/10 shadow-depth-raised backdrop-blur-md">
                                      {ext}
                                    </span>
                                    <img
                                      alt=""
                                      loading="eager"
                                      decoding="async"
                                      className="block w-full transition-opacity duration-500 h-auto object-contain opacity-100 cursor-pointer"
                                      src={file.url}
                                      onClick={() => setPreviewImage(file)}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFile(file.id, e);
                                      }}
                                      className="absolute top-2 right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 lg:h-7 lg:w-7 max-lg:shadow-depth-raised max-lg:ring-1 max-lg:ring-white/10 max-lg:active:scale-90 bg-black/60 text-white/80 opacity-100 scale-100 hover:bg-red-500 hover:text-white lg:opacity-0 lg:scale-90 lg:group-hover/card:opacity-100 lg:group-hover/card:scale-100 cursor-pointer"
                                      title="Excluir"
                                    >
                                      <X className="lucide-x h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botão de Upload e Dropzone Oficial 1:1 com a Produção */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFilesUpload(e.dataTransfer.files);
                  }
                }}
                className={`flex w-full flex-1 min-h-[96px] items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:border-violet-500/40 hover:bg-zinc-900/40 hover:text-violet-300 transition-colors max-lg:rounded-3xl max-lg:shadow-depth-well max-lg:transition-[transform,box-shadow] max-lg:duration-150 max-lg:active:scale-[.99] max-lg:active:shadow-depth-press cursor-pointer ${
                  isDraggingOver ? "border-violet-500/80 bg-zinc-900/80 text-violet-300" : ""
                }`}
              >
                <Plus className="lucide-plus h-4 w-4" aria-hidden="true" />
                <span className="text-xs">Arraste ou clique para enviar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Estado Vazio: Nenhum cliente selecionado (1:1 com app.designbuilder.co/projetos) */
          <div className="relative flex-1 overflow-y-auto hidden lg:block">
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-zinc-600">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-white/[0.06] max-lg:rounded-3xl max-lg:shadow-depth-raised">
                <FolderOpen className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-400">Selecione um projeto</p>
                <p className="mt-1 text-xs text-zinc-600">Clique em um projeto na barra lateral para ver os assets</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL FULLSCREEN DE PREVIEW DA IMAGEM ── */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-violet-400" />
                <span className="text-sm font-semibold text-white truncate max-w-md">
                  {previewImage.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleDownloadFile(previewImage, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs transition-colors"
                >
                  <Download size={13} /> Baixar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleSendToRefBuilder(previewImage, e);
                    setPreviewImage(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-md"
                >
                  <Sparkles size={13} /> Usar no REF Builder
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[400px]">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Tamanho: {formatFileSize(previewImage.size)}</span>
              {previewImage.dimensions && (
                <span>Dimensões: {previewImage.dimensions.width} x {previewImage.dimensions.height} px</span>
              )}
              <span>Data: {new Date(previewImage.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjetosManager;
