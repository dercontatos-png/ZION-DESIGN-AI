import React, { useState, useEffect } from "react";
import { Eye, Shield, Zap, ChevronDown, Check } from "lucide-react";
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

const getShortPlanName = (plan: string): string => {
  if (!plan) return "Pro";
  const p = plan.toLowerCase();
  if (p.includes("free") || p.includes("gratuito") || p.includes("inicial")) return "Gratuito";
  if (p.includes("ilimitado") || p.includes("unlimited")) return "Ilimitado";
  if (p.includes("pro") || p.includes("premium")) return "Pro";
  return plan.replace(/^Plano\s+/i, "");
};

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

  const shortPlan = getShortPlanName(session.simulatedPlan);
  const creditsDisplay = session.simulatedUnlimited ? "∞" : `${session.simulatedCredits} cr`;

  return (
    <div
      role="region"
      aria-label="Barra de visualização do cliente"
      className="fixed top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto flex flex-nowrap items-center whitespace-nowrap gap-1.5 sm:gap-2.5 rounded-full border border-white/10 bg-[#090611]/95 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.75)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200 select-none max-w-[calc(100vw-16px)] sm:max-w-[calc(100vw-24px)]"
    >
      {/* Lado Esquerdo: Identificação */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#702bf7]/20 text-[#a855f7] ring-1 ring-[#702bf7]/40">
          <Eye className="h-3 w-3 animate-pulse" />
        </div>
        <span className="font-semibold text-white text-[11px] shrink-0 whitespace-nowrap hidden md:inline">
          Visão do Cliente
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-300 whitespace-nowrap">
          <span className="text-[#a855f7] font-semibold">{shortPlan}</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-300">{creditsDisplay}</span>
        </span>
      </div>

      {/* Divisor Vertical */}
      <div className="h-3.5 w-px bg-white/10 shrink-0" />

      {/* Lado Direito: Ações Rápidas & Voltar ao Admin */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        {/* Seletor Rápido de Plano */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 sm:px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Zap className="h-3 w-3 text-[#a855f7] shrink-0" />
            <span className="text-zinc-400 text-[10px] hidden sm:inline">Plano:</span>
            <span className="text-white font-semibold text-[11px] whitespace-nowrap">{shortPlan}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0" />
          </button>

          {isPlanDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsPlanDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-2xl border border-white/10 bg-[#090611]/95 p-1 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Gratuito", 20, false)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="font-medium text-white">Gratuito</div>
                    <div className="text-[10px] text-zinc-500">(20 cr)</div>
                  </div>
                  {shortPlan === "Gratuito" && (
                    <Check className="h-3.5 w-3.5 text-[#a855f7] shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Pro", 500, false)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="font-medium text-white">Pro</div>
                    <div className="text-[10px] text-zinc-500">(500 cr)</div>
                  </div>
                  {shortPlan === "Pro" && (
                    <Check className="h-3.5 w-3.5 text-[#a855f7] shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchPlan("Plano Ilimitado", 999999, true)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 text-left cursor-pointer transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="font-medium text-white">Ilimitado</div>
                    <div className="text-[10px] text-zinc-500">(∞ cr)</div>
                  </div>
                  {shortPlan === "Ilimitado" && (
                    <Check className="h-3.5 w-3.5 text-[#a855f7] shrink-0" />
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
          className="flex items-center gap-1 rounded-full bg-[#702bf7] px-2.5 sm:px-3 py-1 text-[11px] font-semibold text-white shadow-[0_0_14px_rgba(112,43,247,0.45)] hover:bg-[#5e21d6] transition-all cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
          title="Sair da simulação e voltar ao painel administrativo"
        >
          <Shield className="h-3 w-3 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Voltar ao Admin</span>
          <span className="sm:hidden whitespace-nowrap">Admin</span>
        </button>
      </div>
    </div>
  );
};

export default ClientPreviewBanner;
