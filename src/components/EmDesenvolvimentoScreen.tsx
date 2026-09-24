import React from "react";
import { Lock, Sparkles, ShieldCheck, LogOut, ArrowRight, Zap, Code2, AlertTriangle } from "lucide-react";

interface EmDesenvolvimentoScreenProps {
  currentUser: { email: string; role: "admin" | "client" } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const EmDesenvolvimentoScreen: React.FC<EmDesenvolvimentoScreenProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const isLoggedWithOtherAccount = currentUser && currentUser.email?.toLowerCase() !== "der.contatos@gmail.com";

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c3aed] via-[#a855f7] to-[#ffd500] p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0c0a15] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ffd500]" />
            </div>
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-base bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              ZION DESIGN AI
            </span>
            <span className="block text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              STUDIO PRO • v2.0
            </span>
          </div>
        </div>

        <div>
          {currentUser ? (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sair</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Entrar como Administrador</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto">
          {/* Card Container */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0d0b18]/80 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl shadow-purple-950/40 text-center overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#ffd500] to-transparent" />

            {/* Glowing Icon Badge */}
            <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-xl pointer-events-none" />
              {isLoggedWithOtherAccount ? (
                <AlertTriangle className="w-9 h-9 text-amber-400 animate-pulse" />
              ) : (
                <Lock className="w-9 h-9 text-[#ffd500]" />
              )}
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>EM DESENVOLVIMENTO • ACESSO RESTRITO</span>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">
              Plataforma em Atualização
            </h1>

            {isLoggedWithOtherAccount ? (
              <div className="space-y-4 mb-8">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Você está conectado com a conta{" "}
                  <span className="text-amber-300 font-semibold underline underline-offset-4 decoration-amber-400/40">
                    {currentUser?.email}
                  </span>
                  .
                </p>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-zinc-400 text-left space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Ambiente em homologação fechada</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    No momento, a geração de artes, ferramentas avançadas de IA e acesso ao Studio estão liberados
                    exclusivamente para a conta do administrador oficial (
                    <strong className="text-zinc-200">der.contatos@gmail.com</strong>).
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-md mx-auto">
                O <strong className="text-zinc-200">Zion Design AI</strong> está passando por aprimoramentos
                exclusivos de geração neural, fluxo de alta fidelidade e arquitetura de estúdio. O acesso ao sistema
                está temporariamente restrito ao administrador autorizado.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isLoggedWithOtherAccount ? (
                <>
                  <button
                    onClick={onSignOut}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair / Entrar com outra conta</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ffd500] to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Entrar com Conta de Administrador</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Feature Highlights Footer */}
            <div className="mt-10 pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center">
              <div className="p-2">
                <Zap className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
                <span className="block text-[11px] font-semibold text-zinc-300">Nano Banana Pro</span>
                <span className="block text-[9px] text-zinc-500">Flux 1.0 & Vertex AI</span>
              </div>
              <div className="p-2 border-x border-white/[0.06]">
                <Sparkles className="w-4 h-4 text-[#ffd500] mx-auto mb-1.5" />
                <span className="block text-[11px] font-semibold text-zinc-300">Fidelidade 100%</span>
                <span className="block text-[9px] text-zinc-500">Tipografia & Cores</span>
              </div>
              <div className="p-2">
                <Code2 className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                <span className="block text-[11px] font-semibold text-zinc-300">Multi-Projetos</span>
                <span className="block text-[9px] text-zinc-500">Isolamento Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full text-center py-6 text-zinc-600 text-[11px]">
        <span>© {new Date().getFullYear()} Zion Design AI Studio • Todos os direitos reservados.</span>
      </footer>
    </div>
  );
};
export default EmDesenvolvimentoScreen;
