import React from "react";

export interface NoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string; // Ex: "Operação Design Builder"
  onViewCredits?: () => void;
  buyUrl?: string;
}

export function NoCreditsModal({
  isOpen,
  onClose,
  planName = "Operação Design Builder",
  onViewCredits,
  buyUrl = "https://link.designbuilder.co/comprar",
}: NoCreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
      {/* 1. Backdrop escuro com desfoque */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      {/* 2. Caixa do Modal */}
      <div className="relative z-[10021] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 text-left shadow-2xl shadow-black/50 outline-none sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Botão Fechar (X) */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Ícone de Moedas (Coins) em Âmbar/Dourado */}
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
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
            className="h-6 w-6 text-amber-300"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
            <path d="m7 6 2 4" />
            <path d="m15 14 2 4" />
          </svg>
        </div>

        {/* Título */}
        <h2 className="pr-8 text-xl font-semibold leading-snug text-white sm:text-2xl">
          Os créditos do seu plano acabaram
        </h2>

        {/* Descrição */}
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          O saldo de créditos do plano {planName} chegou a zero. Para voltar a gerar, você pode comprar mais créditos.
        </p>

        {/* Botões de Ação */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {/* Botão Roxo: Comprar mais créditos */}
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 cursor-pointer text-center"
          >
            Comprar mais créditos
          </a>
          {/* Botão Escuro: Ver meus créditos */}
          <button
            type="button"
            onClick={onViewCredits || onClose}
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer"
          >
            Ver meus créditos
          </button>
        </div>

      </div>
    </div>
  );
}

export default NoCreditsModal;
