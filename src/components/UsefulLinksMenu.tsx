import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Headphones, FileText, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { TermsOfUseModal } from "./TermsOfUseModal";

interface UsefulLinksMenuProps {
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
}

export const UsefulLinksMenu: React.FC<UsefulLinksMenuProps> = ({
  className = "",
  buttonClassName = "",
  align = "right"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={containerRef} className={`relative ${className}`}>
        <button
          type="button"
          aria-label="Links úteis"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title="Links úteis"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer ${
            isOpen ? "bg-white/10 text-white" : ""
          } ${buttonClassName}`}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 lg:block">
            Links úteis
          </span>
        </button>

        {isOpen && (
          <div
            role="menu"
            className={`absolute top-full mt-2 z-[10070] w-72 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* Discord */}
            <a
              role="menuitem"
              href="https://link.easybuilder.com.br/convitediscord-fundadores"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group/link flex items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(88, 101, 242, 0.15)", border: "1px solid rgba(88, 101, 242, 0.25)" }}
              >
                <svg className="h-4 w-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold leading-tight">Discord</span>
                <span className="block text-xs text-zinc-500">Comunidade de fundadores</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
            </a>

            {/* Suporte */}
            <a
              role="menuitem"
              href="https://link.designbuilder.co/fale-com-suporte-db"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group/link flex items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(167, 139, 250, 0.15)", border: "1px solid rgba(167, 139, 250, 0.25)" }}
              >
                <Headphones className="h-4 w-4 text-violet-400" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold leading-tight">Suporte</span>
                <span className="block text-xs text-zinc-500">Fale com o suporte</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
            </a>

            {/* Termos de Uso */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsTermsOpen(true);
              }}
              className="group/link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer text-left"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.25)" }}
              >
                <FileText className="h-4 w-4 text-emerald-400" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold leading-tight">Termos de Uso</span>
                <span className="block text-xs text-zinc-500">Políticas e condições legais</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
            </button>

            {/* Documentação */}
            <a
              role="menuitem"
              href="https://docs.designbuilder.co/docs/onboarding"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group/link flex items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-all hover:bg-white/10 cursor-pointer"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(251, 191, 36, 0.15)", border: "1px solid rgba(251, 191, 36, 0.25)" }}
              >
                <BookOpen className="h-4 w-4 text-amber-400" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold leading-tight">Documentação</span>
                <span className="block text-xs text-zinc-500">Guias e tutoriais</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-600 transition-colors group-hover/link:text-zinc-400" />
            </a>
          </div>
        )}
      </div>

      <TermsOfUseModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </>
  );
};

