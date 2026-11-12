import React, { useState, useEffect } from "react";
import { Eye, Shield, Zap, Sparkles, ChevronDown, Check } from "lucide-react";
import {
  ClientPreviewSession,
  getClientPreviewSession,
  startClientPreview,
  exitClientPreview
} from "../utils/clientPreviewService";

interface ClientPreviewBannerProps {
  onReturnToAdmin?: () => void;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const ClientPreviewBanner: React.FC<ClientPreviewBannerProps> = ({
  onReturnToAdmin,
  showToast
}) => {
  const [session, setSession] = useState<ClientPreviewSession>(getClientPreviewSession);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);

  useEffect(() => {
    const handlePreviewChange = (e: any) => {
      if (e?.detail) {
        setSession({ ...getClientPreviewSession(), ...e.detail });
      } else {
        setSession(getClientPreviewSession());
      }
    };

    window.addEventListener("zion:client_preview_changed", handlePreviewChange);
    return () => {
      window.removeEventListener("zion:client_preview_changed", handlePreviewChange);
    };
  }, []);

  if (!session.active) return null;

  const handleSwitchPlan = (plan: string, credits: number, unlimited: boolean) => {
    startClientPreview({
      ...session,
      simulatedPlan: plan,
      simulatedCredits: credits,
      simulatedUnlimited: unlimited
    });
    setIsPlanDropdownOpen(false);
    showToast?.(`Simulando visão de ${plan}!`, "info");
  };

  const handleExit = () => {
    exitClientPreview();
    showToast?.("Modo Administrador Restaurado!", "success");
    if (onReturnToAdmin) {
      onReturnToAdmin();
    } else {
      window.dispatchEvent(new CustomEvent("open-admin-suite", { detail: { tab: "dashboard" } }));
    }
  };

  return (
    <div
      role="region"
      aria-label="Barra de visualização do cliente"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto flex max-w-[95vw] items-center gap-2.5 sm:gap-4 rounded-full border border-white/10 bg-[#090611]/90 px-3.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/5 animate-in fade-in slide-in-from-top-3 duration-300"
    >
      {/* Lado Esquerdo: Identificação do Modo */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#702bf7]/20 text-[#a855f7] ring-1 ring-[#702bf7]/30">
          <Eye className="h-3.5 w-3.5 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-xs truncate max-w-[120px] sm:max-w-[180px]">
            {session.simulatedName}
          </span>
          <span className="hidden md:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
            {session.simulatedPlan} · {session.simulatedUnlimited ? "∞ Ilimitado" : `${session.simulatedCredits} cr`}
          </span>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas & Voltar ao Admin */}
      <div className="flex items-center gap-2">
        {/* Seletor Rápido de Plano */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Zap className="h-3 w-3 text-[#a855f7]" />
            <span className="hidden sm:inline">Plano:</span>
            <span className="text-white font-medium text-[11px]">{session.simulatedPlan.replace("Plano ", "")}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {isPlanDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsPlanDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-2xl border border-white/10 bg-[#090611]/95 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/5">
                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Inicial Free", 20, false)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Plano Gratuito</div>
                    <div className="text-[10px] text-zinc-500">20 créditos</div>
                  </div>
                  {session.simulatedPlan === "Plano Inicial Free" && (
                    <Check className="h-3.5 w-3.5 text-[#a855f7]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Pro", 500, false)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Plano Pro</div>
                    <div className="text-[10px] text-zinc-500">500 créditos</div>
                  </div>
                  {session.simulatedPlan === "Plano Pro" && (
                    <Check className="h-3.5 w-3.5 text-[#a855f7]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Ilimitado", 999999, true)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Plano Ilimitado</div>
                    <div className="text-[10px] text-zinc-500">Créditos infinitos (∞)</div>
                  </div>
                  {session.simulatedPlan === "Plano Ilimitado" && (
                    <Check className="h-3.5 w-3.5 text-[#a855f7]" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Botão Sair da Visão do Cliente e Retornar ao Admin */}
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-1.5 rounded-full bg-[#702bf7] px-3.5 py-1 text-[11px] font-semibold text-white shadow-[0_0_16px_rgba(112,43,247,0.4)] hover:bg-[#5e21d6] transition-all cursor-pointer"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Voltar ao Admin</span>
        </button>
      </div>
    </div>
  );
};

export default ClientPreviewBanner;
