import React, { useState } from "react";
import { useClientStore } from "../store/useClientStore";
import {
  Sparkles,
  User,
  Users,
  ChevronDown,
  Plus,
  Coins,
  Settings,
  Shield,
  LogOut,
  Menu,
  Check,
  CreditCard,
  Briefcase
} from "lucide-react";

interface DesignBuilderHeaderProps {
  onToggleSidebar?: () => void;
  onOpenCreditsModal?: () => void;
  onOpenSettings?: () => void;
  onOpenAdmin?: () => void;
  onSignOut?: () => void;
  userCredits?: number | string;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  isAdmin?: boolean;
}

export const DesignBuilderHeader: React.FC<DesignBuilderHeaderProps> = ({
  onToggleSidebar,
  onOpenCreditsModal,
  onOpenSettings,
  onOpenAdmin,
  onSignOut,
  userCredits = 6512,
  userName = "Ricardo",
  userEmail = "der.contatos@gmail.com",
  userInitials = "RI",
  isAdmin = true
}) => {
  const { clients, activeClientId, setActiveClient, addClient } = useClientStore();
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  const activeClient = clients.find((c) => c.id === activeClientId);

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    const newId = addClient({
      name: newClientName.trim(),
      niche: "Geral",
      paletaCores: ["#8b5cf6", "#ec4899", "#3b82f6"],
      corDominante: "#8b5cf6",
      infoExtra: "",
      bancoDeDadosIA: "",
      printsPerfil: [],
      estiloVisualExtraido: "Ultra Realista",
      regrasMarca: ""
    });
    setActiveClient(newId);
    setNewClientName("");
    setIsCreatingClient(false);
  };

  const formattedCredits =
    typeof userCredits === "number"
      ? userCredits.toLocaleString("pt-BR")
      : String(userCredits);

  return (
    <header className="relative z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-zinc-800 bg-[#09090b]/95 px-3 md:px-5 backdrop-blur-md">
      {/* Lado Esquerdo: Toggle Sidebar, Logo & Badge v1.2 */}
      <div className="flex items-center gap-3 md:gap-4">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Alternar Menu Lateral"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-violet-500/40 hover:text-white transition-all cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 group cursor-pointer">
            <img
              src="/logo-zion.svg"
              alt="Design Builder"
              className="h-6 w-auto transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/logo-zion.webp";
              }}
            />
            <span className="hidden sm:inline-block font-bold tracking-tight text-white text-sm">
              Design Builder
            </span>
          </a>
          <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[10px] font-bold text-violet-400 tracking-wide uppercase">
            v1.2
          </span>
        </div>
      </div>

      {/* Centro / Seletor de Clientes */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsClientDropdownOpen(!isClientDropdownOpen);
            setIsProfileDropdownOpen(false);
          }}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900 transition-all cursor-pointer"
        >
          <Briefcase className="h-3.5 w-3.5 text-violet-400" />
          {activeClient ? (
            <span className="flex items-center gap-1.5 max-w-[140px] truncate">
              <span
                className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: activeClient.corDominante || "#8b5cf6" }}
              />
              <span className="font-semibold text-white truncate">{activeClient.name}</span>
            </span>
          ) : (
            <span className="text-zinc-400">Cliente ativo</span>
          )}
          <ChevronDown className="h-3 w-3 text-zinc-500" />
        </button>

        {/* Dropdown de Clientes */}
        {isClientDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsClientDropdownOpen(false)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 rounded-2xl border border-zinc-800 bg-[#09090b]/98 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2 border-b border-zinc-800 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Clientes Cadastrados
                </span>
                <span className="text-[10px] text-zinc-500">{clients.length} clientes</span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-0.5 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveClient(null);
                    setIsClientDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer ${
                    activeClientId === null
                      ? "bg-violet-600/20 text-violet-200 font-semibold"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    <span>Nenhum (Modo Geral)</span>
                  </span>
                  {activeClientId === null && <Check className="h-3.5 w-3.5 text-violet-400" />}
                </button>

                {clients.map((client) => {
                  const isSelected = client.id === activeClientId;
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setActiveClient(client.id);
                        setIsClientDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-violet-600/20 text-violet-200 font-semibold"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: client.corDominante || "#8b5cf6" }}
                        />
                        <span className="truncate">{client.name}</span>
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-violet-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Criar Novo Cliente */}
              <div className="border-t border-zinc-800 pt-2 mt-1">
                {isCreatingClient ? (
                  <form onSubmit={handleCreateClientSubmit} className="flex gap-1.5 p-1">
                    <input
                      type="text"
                      autoFocus
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Nome do cliente..."
                      className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 cursor-pointer"
                    >
                      Salvar
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingClient(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-violet-400 hover:bg-violet-600/10 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Adicionar Novo Cliente</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lado Direito: Contador de Créditos + Perfil do Usuário */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Contador de Créditos */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreditsModal}
            title="Extrato e Recarga de Créditos"
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-white hover:border-violet-500/40 hover:bg-zinc-900 transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-violet-300 tabular-nums">
                {formattedCredits}
              </span>
              <span className="hidden md:inline text-zinc-400 font-normal">créditos</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenCreditsModal}
            className="hidden sm:flex items-center gap-1 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Recarregar</span>
          </button>
        </div>

        {/* Avatar e Perfil */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
              setIsClientDropdownOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white ring-2 ring-zinc-800 hover:ring-violet-500/50 transition-all cursor-pointer shadow-md"
          >
            {userInitials}
          </button>

          {isProfileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-zinc-800 bg-[#09090b]/98 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
                <div className="px-3.5 py-3 border-b border-zinc-800 mb-1">
                  <p className="text-sm font-bold text-white truncate">{userName}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{userEmail}</p>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px]">
                    <span className="text-zinc-400">Saldo Atual:</span>
                    <span className="font-bold text-violet-400 tabular-nums">
                      {formattedCredits} cr
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenSettings?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-zinc-400" />
                    <span>Configurações</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenCreditsModal?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  >
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span>Extrato de Créditos</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onOpenAdmin?.();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Painel Administrativo</span>
                    </button>
                  )}

                  <div className="border-t border-zinc-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onSignOut ? onSignOut() : window.location.reload();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default DesignBuilderHeader;
