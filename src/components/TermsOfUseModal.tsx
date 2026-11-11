import React from "react";
import { X, ShieldCheck, FileText, Scale, Coins, Lock, HelpCircle } from "lucide-react";

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10080] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Termos de Uso e Políticas</h2>
              <p className="text-xs text-zinc-400">Design Builder & Zion Design AI · Atualizado em 2025</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 text-xs leading-relaxed text-zinc-300 pr-1">
          {/* Seção 1 */}
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <FileText className="h-4 w-4 text-violet-400" />
              <span>1. Aceitação dos Termos</span>
            </div>
            <p>
              Ao utilizar a plataforma Design Builder e seus módulos de inteligência artificial (Ref Builder, Design Builder V2, Órion Pro, Hydra e Altera Fácil), você concorda integralmente com estes Termos de Uso. Caso não concorde, cesse imediatamente a utilização dos serviços.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>2. Direitos Autorais e Propriedade das Artes</span>
            </div>
            <p>
              Todas as imagens e layouts gerados por você através de seus prompts e assets pertencem exclusivamente a você para uso comercial, editorial ou publicitário irrestrito. A plataforma não reivindica direitos autorais sobre as criações finais de seus assinantes.
            </p>
          </section>

          {/* Seção 3 */}
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>3. Sistema de Créditos e Assinaturas (SaaS)</span>
            </div>
            <p>
              O serviço opera sob modelo SaaS de assinatura mensal e recargas avulsas via Stripe. Cada geração consome créditos de acordo com a resolução (HD / 4K / 8K). Caso o saldo de créditos atinja zero, novas gerações permanecerão bloqueadas até a renovação da assinatura ou a aquisição de um pacote de recarga.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>4. Privacidade e Segurança de Dados</span>
            </div>
            <p>
              Imagens e referências enviadas são tratadas com sigilo e criptografia de ponta a ponta. Apenas as artes voluntariamente publicadas no Feed Global da Comunidade se tornam públicas para outros criadores visualizarem e remixarem prompts.
            </p>
          </section>

          {/* Seção 5 */}
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <HelpCircle className="h-4 w-4 text-pink-400" />
              <span>5. Suporte e Cancelamento</span>
            </div>
            <p>
              Você pode cancelar sua assinatura mensal a qualquer momento sem fidelidade ou multas através do painel do cliente ou solicitando ao nosso suporte oficial via WhatsApp. O cancelamento interrompe cobranças futuras e mantém os créditos remanescentes ativos até o final do ciclo contratado.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer"
          >
            Entendi e concordo
          </button>
        </div>
      </div>
    </div>
  );
};
