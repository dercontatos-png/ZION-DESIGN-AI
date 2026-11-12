import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, X, ShieldCheck } from "lucide-react";
import { startUpdateSentinel, executeSafeReload, CanvasEmergencySnapshot } from "../utils/projectSafetyService";

interface PlatformUpdateBannerProps {
  getSnapshotData?: () => Partial<CanvasEmergencySnapshot>;
  showToast?: (msg: string, type?: string) => void;
}

export const PlatformUpdateBanner: React.FC<PlatformUpdateBannerProps> = ({ getSnapshotData, showToast }) => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Inicia a sentinela silenciosa em segundo plano
    const cleanup = startUpdateSentinel(() => {
      setHasUpdate(true);
    });
    return cleanup;
  }, []);

  if (!hasUpdate || isDismissed) return null;

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    showToast?.("💾 Salvando seu projeto antes de atualizar...", "info");
    await new Promise((r) => setTimeout(r, 600));
    await executeSafeReload(getSnapshotData);
  };

  return (
    <aside
      aria-label="Atualização do sistema"
      className="fixed bottom-20 md:bottom-5 right-4 z-[9990] max-w-sm w-[calc(100vw-2rem)] md:w-96 rounded-2xl border border-[#702bf7]/40 bg-[#0c0c0c]/95 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_-10px_rgba(112,43,247,0.35)] backdrop-blur-2xl ring-1 ring-white/10 text-white animate-in slide-in-from-bottom-5 duration-300 font-sans"
    >
      {/* Linha Roxa do Topo */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#702bf7] to-transparent rounded-t-2xl" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#702bf7]/20 border border-[#702bf7]/40 text-[#a855f7]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Nova Versão Disponível</span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                Online
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Uma nova atualização do DesignBuilder foi aplicada no servidor. Seu projeto e referências serão <span className="text-zinc-200 font-medium">salvos automaticamente</span>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          title="Lembrar mais tarde"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="flex-1 py-1.5 px-3 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-center"
        >
          Depois
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={handleUpdateNow}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-[#702bf7] hover:bg-[#5e21d6] text-[11px] font-bold text-white shadow-[0_0_16px_rgba(112,43,247,0.4)] transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isUpdating ? "animate-spin" : ""}`} />
          <span>{isUpdating ? "Salvando..." : "Salvar & Atualizar"}</span>
        </button>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
        <ShieldCheck className="h-3 w-3 text-emerald-400" />
        <span>Proteção Zero-Perda ativa (Rascunho preservado)</span>
      </div>
    </aside>
  );
};

