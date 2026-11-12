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
      className="sticky top-0 left-0 right-0 z-[99999] w-full shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/95 via-zinc-950/95 to-amber-950/95 px-4 py-2 text-xs backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-200"
    >
      {/* Lado Esquerdo: Identificação do Modo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Eye className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-amber-400 text-[11px] uppercase">
              Modo Visão do Cliente Ativo
            </span>
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
              O escudo e o painel admin estão ocultos para o cliente
            </span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Simulando: <strong className="text-white">{session.simulatedName}</strong> ({session.simulatedEmail}) ·{" "}
            <span className="text-amber-300 font-semibold">{session.simulatedPlan}</span> (
            {session.simulatedUnlimited ? "∞ Ilimitado" : `${session.simulatedCredits} créditos`})
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas & Voltar ao Admin */}
      <div className="flex items-center gap-2">
        {/* Seletor Rápido de Plano para teste */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Mudar Plano Simulado</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {isPlanDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsPlanDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 z-20 w-52 rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Inicial Free", 20, false)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white">Plano Gratuito</div>
                    <div className="text-[10px] text-zinc-500">20 créditos</div>
                  </div>
                  {session.simulatedPlan === "Plano Inicial Free" && (
                    <Check className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Pro", 500, false)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white">Plano Pro</div>
                    <div className="text-[10px] text-zinc-500">500 créditos</div>
                  </div>
                  {session.simulatedPlan === "Plano Pro" && (
                    <Check className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Ilimitado", 999999, true)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white">Plano Ilimitado</div>
                    <div className="text-[10px] text-zinc-500">Créditos infinitos (∞)</div>
                  </div>
                  {session.simulatedPlan === "Plano Ilimitado" && (
                    <Check className="h-3.5 w-3.5 text-amber-400" />
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
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Voltar ao Modo Admin</span>
        </button>
      </div>
    </div>
  );
};

export default ClientPreviewBanner;
