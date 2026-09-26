import React, { useState } from "react";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  LogOut,
  RefreshCw,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wand2,
  Camera,
  Image as ImageIcon
} from "lucide-react";

interface NaoAssinanteScreenProps {
  currentUser: { email: string; role: "admin" | "client" } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onRecheck?: () => void;
  onOpenPlanModal?: () => void;
  subscriberInfo?: {
    reason?: string;
    credits?: number;
    plan?: string;
  };
}

export const NaoAssinanteScreen: React.FC<NaoAssinanteScreenProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
  onRecheck,
  onOpenPlanModal,
  subscriberInfo
}) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRecheckClick = async () => {
    if (!onRecheck) return;
    setIsChecking(true);
    try {
      await onRecheck();
    } finally {
      setTimeout(() => setIsChecking(false), 800);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Criei minha conta no Zion Design AI com o e-mail ${currentUser?.email || ""} e gostaria de liberar minha assinatura e créditos.`
  );
  const whatsappUrl = `https://wa.me/5575988588888?text=${whatsappMessage}`;

  const isSemCreditos = subscriberInfo?.reason === "sem_creditos";
  const isBloqueado = subscriberInfo?.reason === "bloqueado";

  return (
    <div className="relative min-h-screen w-full bg-[#07060c] text-white flex flex-col justify-between overflow-hidden font-sans selection:bg-[#7c3aed] selection:text-white">
      {/* Background Glows & Gradients */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-zion.svg"
            alt="Zion Design"
            className="h-9 w-auto"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo-zion.webp";
            }}
          />
        </div>

        <div>
          {currentUser ? (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sair da Conta</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Entrar / Criar Conta</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl mx-auto">
          {/* Card Container */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0d0b18]/80 backdrop-blur-2xl p-7 sm:p-10 shadow-2xl shadow-purple-950/40 text-center overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent" />

            {/* Glowing Icon Badge */}
            <div className="mx-auto mb-5 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 rounded-2xl bg-violet-600/10 blur-xl pointer-events-none" />
              {currentUser ? (
                <Lock className="w-8 h-8 sm:w-9 sm:h-9 text-violet-400" />
              ) : (
                <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 text-[#ffd500]" />
              )}
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-wide mb-4">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>
                {!currentUser
                  ? "AUTENTICAÇÃO NECESSÁRIA"
                  : isSemCreditos
                  ? "CRÉDITOS ESGOTADOS"
                  : isBloqueado
                  ? "ASSINATURA INATIVA"
                  : "ACESSO RESTRITO • PLANO NECESSÁRIO"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              {!currentUser
                ? "Acesse o Zion Design AI"
                : isSemCreditos
                ? "Seus Créditos Esgotaram"
                : "Você ainda não é assinante"}
            </h1>

            {currentUser ? (
              <div className="space-y-4 mb-6">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  A conta{" "}
                  <span className="text-violet-300 font-semibold underline underline-offset-4 decoration-violet-400/40">
                    {currentUser.email}
                  </span>{" "}
                  está conectada, mas{" "}
                  {isSemCreditos
                    ? "utilizou todos os créditos disponíveis."
                    : isBloqueado
                    ? "o acesso está temporariamente pausado."
                    : "ainda não possui uma assinatura ou créditos liberados pelo administrador."}
                </p>

                {/* Box de Recursos Exclusivos */}
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-xs text-left space-y-3">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold border-b border-white/5 pb-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span>Recursos liberados para assinantes:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Zion Design 1.2 & Flyers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Órion Pro Cinematográfico</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Hydra Packshots & Produtos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Altera Fácil (Poses & Rostos)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Ref Builder & Pinterest</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Enhance Upscale 4K Ultra</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 max-w-md mx-auto">
                Faça login para utilizar a plataforma profissional de criação gráfica e geração com inteligência artificial.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              {currentUser ? (
                <>
                  {/* Botão Principal: WhatsApp do Administrador */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp para Liberar Acesso</span>
                  </a>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Botão Já sou assinante / Atualizar */}
                    {onRecheck && (
                      <button
                        type="button"
                        onClick={handleRecheckClick}
                        disabled={isChecking}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                        <span>{isChecking ? "Verificando..." : "Já sou assinante (Atualizar)"}</span>
                      </button>
                    )}

                    {/* Botão Ver Planos */}
                    {onOpenPlanModal && (
                      <button
                        type="button"
                        onClick={onOpenPlanModal}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Planos & Preços</span>
                      </button>
                    )}
                  </div>

                  {/* Sair da Conta */}
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="mt-1 text-[11px] text-zinc-500 hover:text-zinc-300 hover:underline transition-all cursor-pointer"
                  >
                    Entrar com outra conta de e-mail
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Entrar com Minha Conta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 text-[11px] text-zinc-500">
        <span>© {new Date().getFullYear()} Zion Design AI • Todos os direitos reservados.</span>
        <span className="font-mono text-[10px] text-zinc-600">Ambiente Seguro • Supabase Auth & Cloudflare R2</span>
      </footer>
    </div>
  );
};

export default NaoAssinanteScreen;
