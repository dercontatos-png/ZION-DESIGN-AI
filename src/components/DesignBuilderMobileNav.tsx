import React, { useState } from "react";
import { Shield, CreditCard, User, LogOut, X, Sparkles } from "lucide-react";

export interface DesignBuilderMobileNavProps {
  activeTab: "home" | "projetos" | "gallery" | "community" | "builder";
  onNavigateHome: () => void;
  onNavigateProjects: () => void;
  onNavigateGallery: () => void;
  onNavigateCommunity: () => void;
  onOpenAccount: () => void;
  onOpenAdmin?: () => void;
  onOpenCredits?: () => void;
  onOpenProfile?: () => void;
  onSignOut?: () => void;
  userInitial?: string;
  userEmail?: string;
  userName?: string;
  isAdmin?: boolean;
}

export const DesignBuilderMobileNav: React.FC<DesignBuilderMobileNavProps> = ({
  activeTab,
  onNavigateHome,
  onNavigateProjects,
  onNavigateGallery,
  onNavigateCommunity,
  onOpenAccount,
  onOpenAdmin,
  onOpenCredits,
  onOpenProfile,
  onSignOut,
  userInitial = "R",
  userEmail = "",
  userName = "Usuário",
  isAdmin = false,
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const cleanEmail = (userEmail || (typeof window !== "undefined" ? localStorage.getItem("zion_user_email") || "" : "")).toLowerCase().trim();
  const isActualAdmin = isAdmin || cleanEmail === "der.contatos@gmail.com";

  const handleAvatarClick = () => {
    if (!cleanEmail) {
      onOpenAccount();
      return;
    }
    setIsAccountMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* ── Menu de Conta / Admin no Celular ── */}
      {isAccountMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsAccountMenuOpen(false)}
          />

          {/* Card Flutuante */}
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d0b1a]/95 backdrop-blur-2xl p-4 shadow-2xl ring-1 ring-white/10 space-y-3 z-10 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header com Dados do Usuário */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                  isActualAdmin ? "bg-gradient-to-br from-amber-500 to-yellow-600 ring-2 ring-amber-400/50" : "bg-gradient-to-br from-violet-600 to-fuchsia-600 ring-2 ring-violet-500/30"
                }`}>
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{userName || "Equipe Zion"}</p>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{cleanEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Badge de Status / Acesso */}
            {isActualAdmin ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-amber-300">
                <Shield className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-extrabold uppercase tracking-wide block">Administrador Geral</span>
                  <span className="text-[10px] text-amber-300/80 block">Acesso total e gestão de clientes</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-violet-500/10 border border-violet-500/25 px-3 py-2 text-violet-300">
                <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold block">Assinante Oficial</span>
                  <span className="text-[10px] text-zinc-400 block">Gerações e estúdio criativo liberados</span>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-1.5 pt-1">
              {/* Botão EXCLUSIVO Painel Admin */}
              {isActualAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    if (onOpenAdmin) onOpenAdmin();
                    else {
                      window.dispatchEvent(new CustomEvent("open-admin-subscribers"));
                      window.dispatchEvent(new CustomEvent("db:open_admin"));
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-3 text-xs font-bold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-black shrink-0" />
                  <div className="text-left flex-1">
                    <span className="block font-black text-sm text-black">Painel do Administrador</span>
                    <span className="block text-[10px] font-semibold text-black/80">Liberar assinantes & créditos</span>
                  </div>
                </button>
              )}

              {/* Meus Créditos */}
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  if (onOpenCredits) onOpenCredits();
                  else onOpenAccount();
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all cursor-pointer active:scale-95"
              >
                <CreditCard className="h-4 w-4 text-violet-400" />
                <div className="text-left flex-1">
                  <span>Meus Créditos / Extrato</span>
                </div>
              </button>

              {/* Meu Perfil */}
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  if (onOpenProfile) onOpenProfile();
                  else window.dispatchEvent(new CustomEvent("open-profile-modal"));
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition-all cursor-pointer active:scale-95"
              >
                <User className="h-4 w-4 text-zinc-400" />
                <div className="text-left flex-1">
                  <span>Configurações do Perfil</span>
                </div>
              </button>

              {/* Sair da Conta */}
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  if (onSignOut) onSignOut();
                  else {
                    localStorage.removeItem("zion_auth_user");
                    localStorage.removeItem("zion_current_user");
                    localStorage.removeItem("zion_user_email");
                    window.location.reload();
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400 transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BARRA DE NAVEGAÇÃO MOBILE PERSISTENTE ── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav
          aria-label="Navegação principal"
          className="pointer-events-auto flex h-16 items-center rounded-[28px] bg-zinc-950/95 px-2 shadow-[0_8px_28px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-xl w-full max-w-md justify-around gap-1"
        >
          {/* Início */}
          <a
            aria-label="Início"
            aria-current={activeTab === "home" ? "page" : undefined}
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className={`group relative flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
              activeTab === "home" ? "text-violet-400" : "text-zinc-400"
            }`}
          >
            <span
              className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                activeTab === "home" ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
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
                className="lucide lucide-house lucide-home h-[22px] w-[22px]"
                aria-hidden="true"
              >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Início</span>
          </a>

          {/* Projetos */}
          <a
            aria-label="Projetos"
            aria-current={activeTab === "projetos" ? "page" : undefined}
            href="/projetos"
            onClick={(e) => {
              e.preventDefault();
              onNavigateProjects();
            }}
            className={`group relative flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
              activeTab === "projetos" ? "text-violet-400" : "text-zinc-400"
            }`}
          >
            <span
              className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                activeTab === "projetos" ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
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
                className="lucide lucide-briefcase h-[22px] w-[22px]"
                aria-hidden="true"
              >
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                <rect width="20" height="14" x="2" y="6" rx="2" />
              </svg>
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Projetos</span>
          </a>

          {/* Galeria */}
          <a
            aria-label="Galeria"
            aria-current={activeTab === "gallery" ? "page" : undefined}
            href="/gallery"
            onClick={(e) => {
              e.preventDefault();
              onNavigateGallery();
            }}
            className={`group relative flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
              activeTab === "gallery" ? "text-violet-400" : "text-zinc-400"
            }`}
          >
            <span
              className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                activeTab === "gallery" ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
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
                className="lucide lucide-images h-[22px] w-[22px]"
                aria-hidden="true"
              >
                <path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16" />
                <path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" />
                <circle cx="13" cy="7" r="1" fill="currentColor" />
                <rect x="8" y="2" width="14" height="14" rx="2" />
              </svg>
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Galeria</span>
          </a>

          {/* Comunidade */}
          <a
            aria-label="Comunidade"
            aria-current={activeTab === "community" ? "page" : undefined}
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              onNavigateCommunity();
            }}
            className={`group relative flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl outline-none transition-[transform,background-color] focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 flex-1 cursor-pointer ${
              activeTab === "community" ? "text-violet-400" : "text-zinc-400"
            }`}
          >
            <span
              className={`flex h-6 w-9 items-center justify-center rounded-full transition-colors ${
                activeTab === "community" ? "bg-violet-500/15" : "group-hover:bg-white/[0.06]"
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
                className="lucide lucide-globe h-[22px] w-[22px]"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </span>
            <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-tight">Comunidade</span>
          </a>

          {/* Avatar / Conta */}
          <button
            type="button"
            aria-label="Abrir conta e notificações"
            aria-haspopup="dialog"
            aria-expanded={isAccountMenuOpen}
            onClick={handleAvatarClick}
            className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 cursor-pointer"
          >
            <span className={`h-9 w-9 overflow-hidden rounded-full ring-2 transition-[box-shadow] ${
              isActualAdmin ? "ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]" : "ring-violet-500/30"
            }`}>
              <span className={`flex h-full w-full items-center justify-center text-sm font-semibold text-white ${
                isActualAdmin ? "bg-gradient-to-br from-amber-500 to-yellow-600" : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
              }`}>
                {userInitial}
              </span>
            </span>
            {isActualAdmin && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-black ring-1 ring-black">
                ★
              </span>
            )}
          </button>
        </nav>
      </div>
    </>
  );
};

export default DesignBuilderMobileNav;
