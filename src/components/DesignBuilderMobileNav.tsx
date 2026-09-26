import React from "react";

export interface DesignBuilderMobileNavProps {
  activeTab: "home" | "projetos" | "gallery" | "community";
  onNavigateHome: () => void;
  onNavigateProjects: () => void;
  onNavigateGallery: () => void;
  onNavigateCommunity: () => void;
  onOpenAccount: () => void;
  userInitial?: string;
}

export const DesignBuilderMobileNav: React.FC<DesignBuilderMobileNavProps> = ({
  activeTab,
  onNavigateHome,
  onNavigateProjects,
  onNavigateGallery,
  onNavigateCommunity,
  onOpenAccount,
  userInitial = "R"
}) => {
  return (
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
          aria-expanded="false"
          onClick={onOpenAccount}
          className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-95 cursor-pointer"
        >
          <span className="h-9 w-9 overflow-hidden rounded-full ring-2 transition-[box-shadow] ring-violet-500/30">
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
              {userInitial}
            </span>
          </span>
        </button>
      </nav>
    </div>
  );
};

export default DesignBuilderMobileNav;
