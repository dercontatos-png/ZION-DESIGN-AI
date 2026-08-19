import React, { useState } from "react";
import { X, Zap, Sparkles, Check, Crown, Briefcase } from "lucide-react";

interface CreditsModalProps {
  onClose: () => void;
  onOpenSettings?: () => void;
  customApiKey?: string;
  currentLang?: "pt" | "en" | "es";
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose, currentLang: propLang }) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const lang: "pt" | "en" | "es" = propLang || (typeof window !== "undefined" && (localStorage.getItem("app_language") as any)) || "pt";

  const t = (key: string): string => {
    const dict: Record<"pt" | "en" | "es", Record<string, string>> = {
      pt: {
        title: "Escolha seu plano",
        mensal: "Mensal",
        anual: "Anual",
        desconto: "32% OFF",
        starter_desc: "Para quem está começando a criar com IA",
        premium_desc: "Para criativos que buscam uso intensivo e flexível",
        business_desc: "Para profissionais e equipes com alta demanda",
        popular: "MAIS POPULAR",
        profissional: "PROFISSIONAL",
        mes: "/mês",
        ano: "/ano",
        cobrado_anual_starter: "cobrado anualmente — R$ 797,00/ano",
        cobrado_anual_premium: "cobrado anualmente — R$ 1.597,00/ano",
        cobrado_anual_business: "cobrado anualmente — R$ 2.997,00/ano",
        cobranca_info: "Cobrança anual à vista, renovação automática todo ano.",
        cobrado_mensalmente: "Cobrado Mensalmente",
        assinar_starter: "Assinar Starter",
        assinar_premium: "Assinar Premium",
        assinar_business: "Assinar Business",
        f1: "Até 10 projetos ativos",
        f2: "Templates essenciais",
        f3: "Acesso completo à biblioteca de referências",
        f4: "Instagram: até 3 contas",
        f5: "Meta Ads: até 3 BMs (contas de anúncio ilimitadas)",
        f6: "Até 30 projetos ativos",
        f7: "Acesso a todos os Templates de Fluxos",
        f8: "Instagram: até 10 contas",
        f9: "Meta Ads: até 10 BMs (contas de anúncio ilimitadas)",
        f10: "Equipe: até 5 usuários",
        f11: "Até 100 projetos ativos",
        f12: "Instagram: até 30 contas",
        f13: "Meta Ads: até 30 BMs (contas de anúncio ilimitadas)",
        f14: "Equipe: até 10 usuários",
        footer_sec: "Pagamento seguro · Cancele quando quiser",
      },
      en: {
        title: "Choose your plan",
        mensal: "Monthly",
        anual: "Yearly",
        desconto: "32% OFF",
        starter_desc: "For those getting started with AI creation",
        premium_desc: "For creatives seeking intensive and flexible usage",
        business_desc: "For professionals and teams with high demand",
        popular: "MOST POPULAR",
        profissional: "PROFESSIONAL",
        mes: "/month",
        ano: "/year",
        cobrado_anual_starter: "billed annually — R$ 797.00/year",
        cobrado_anual_premium: "billed annually — R$ 1,597.00/year",
        cobrado_anual_business: "billed annually — R$ 2,997.00/year",
        cobranca_info: "Annual one-time charge, automatic renewal every year.",
        cobrado_mensalmente: "Billed Monthly",
        assinar_starter: "Subscribe Starter",
        assinar_premium: "Subscribe Premium",
        assinar_business: "Subscribe Business",
        f1: "Up to 10 active projects",
        f2: "Essential templates",
        f3: "Full access to reference library",
        f4: "Instagram: up to 3 accounts",
        f5: "Meta Ads: up to 3 BMs (unlimited ad accounts)",
        f6: "Up to 30 active projects",
        f7: "Access to all Workflow Templates",
        f8: "Instagram: up to 10 accounts",
        f9: "Meta Ads: up to 10 BMs (unlimited ad accounts)",
        f10: "Team: up to 5 users",
        f11: "Up to 100 active projects",
        f12: "Instagram: up to 30 accounts",
        f13: "Meta Ads: up to 30 BMs (unlimited ad accounts)",
        f14: "Team: up to 10 users",
        footer_sec: "Secure payment · Cancel anytime",
      },
      es: {
        title: "Elige tu plan",
        mensal: "Mensual",
        anual: "Anual",
        desconto: "32% OFF",
        starter_desc: "Para quienes están comenzando a crear con IA",
        premium_desc: "Para creativos que buscan uso intensivo y flexible",
        business_desc: "Para profesionales y equipos con alta demanda",
        popular: "MÁS POPULAR",
        profissional: "PROFESIONAL",
        mes: "/mes",
        ano: "/año",
        cobrado_anual_starter: "cobrado anualmente — R$ 797,00/año",
        cobrado_anual_premium: "cobrado anualmente — R$ 1.597,00/año",
        cobrado_anual_business: "cobrado anualmente — R$ 2.997,00/año",
        cobranca_info: "Cobro anual en un pago, renovación automática cada año.",
        cobrado_mensalmente: "Cobrado Mensualmente",
        assinar_starter: "Suscribir Starter",
        assinar_premium: "Suscribir Premium",
        assinar_business: "Suscribir Business",
        f1: "Hasta 10 proyectos activos",
        f2: "Plantillas esenciales",
        f3: "Acceso completo a la biblioteca de referencias",
        f4: "Instagram: hasta 3 cuentas",
        f5: "Meta Ads: hasta 3 BMs (cuentas de anuncios ilimitadas)",
        f6: "Hasta 30 proyectos activos",
        f7: "Acceso a todas las Plantillas de Flujos",
        f8: "Instagram: hasta 10 cuentas",
        f9: "Meta Ads: hasta 10 BMs (cuentas de anuncios ilimitadas)",
        f10: "Equipo: hasta 5 usuarios",
        f11: "Hasta 100 proyectos activos",
        f12: "Instagram: hasta 30 cuentas",
        f13: "Meta Ads: hasta 30 BMs (cuentas de anuncios ilimitadas)",
        f14: "Equipo: hasta 10 usuarios",
        footer_sec: "Pago seguro · Cancela cuando quieras",
      },
    };
    return dict[lang]?.[key] || dict["pt"][key] || key;
  };

  const handleSubscribePlan = (planName: string) => {
    const period = billingCycle === "yearly" ? t("anual") : t("mensal");
    alert(`Redirecionando para checkout seguro do plano ${planName} (${period})...`);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#000000] border border-[#c5a880]/25 rounded-3xl p-6 sm:p-8 w-full max-w-5xl shadow-[0_25px_70px_rgba(0,0,0,1)] max-h-[94vh] overflow-y-auto custom-scrollbar relative space-y-6">
        
        {/* Header Dourado, Preto Sólido e Branco */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#c5a880]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shadow-md shadow-[#c5a880]/10 shrink-0">
              <Sparkles size={20} className="text-[#c5a880]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {t("title")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Seletor Global Mensal / Anual */}
            <div className="flex items-center bg-[#050505] p-1 rounded-xl border border-[#c5a880]/20 text-xs font-bold shadow-inner">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-center transition-all cursor-pointer ${
                  billingCycle === "monthly" 
                    ? "bg-gradient-to-r from-[#c5a880] to-[#ad8330] text-zinc-950 font-black shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t("mensal")}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-lg text-center transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "yearly" 
                    ? "bg-gradient-to-r from-[#c5a880] to-[#ad8330] text-zinc-950 font-black shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{t("anual")}</span>
                <span className="bg-[#10b981]/20 text-[#10b981] text-[10px] px-2 py-0.5 rounded-full font-black">{t("desconto")}</span>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#050505] hover:bg-white/10 border border-[#c5a880]/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-8 animate-fade-in">
          {/* Grid dos 3 Planos Preto Sólido & Dourado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch">
            
            {/* Card 1: Starter */}
            <div className="bg-[#050505] border border-[#c5a880]/20 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative hover:border-[#c5a880]/50 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[#c5a880]" />
                  <h3 className="text-xl font-black text-white">Starter</h3>
                </div>
                <p className="text-xs text-zinc-400 min-h-[36px]">
                  {t("starter_desc")}
                </p>

                {/* Preço */}
                <div className="pt-2 min-h-[85px] flex flex-col justify-end">
                  {billingCycle === "yearly" ? (
                    <div>
                      <span className="text-xs text-zinc-500 line-through block font-bold">R$ 97</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">R$ 66</span>
                        <span className="text-xs text-zinc-400 font-semibold">{t("mes")}</span>
                      </div>
                      <span className="text-[10.5px] text-[#c5a880] font-bold block mt-1">
                        {t("cobrado_anual_starter")}
                      </span>
                      <span className="text-[9.5px] text-zinc-400 block mt-0.5 leading-tight">
                        {t("cobranca_info")}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">R$ 97</span>
                        <span className="text-xs text-zinc-400 font-semibold">{t("mes")}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mt-1 font-bold">
                        {t("cobrado_mensalmente")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tokens Box */}
                <div className="bg-[#000000] border border-[#c5a880]/20 p-3 rounded-xl text-center text-xs font-black text-white flex items-center justify-center gap-2">
                  <Sparkles size={14} className="text-[#c5a880]" />
                  <span>10000 tokens/{t("mes").replace("/", "")}</span>
                </div>

                {/* Botão Assinar Dourado */}
                <button
                  onClick={() => handleSubscribePlan("Starter")}
                  className="w-full py-3 bg-gradient-to-r from-[#c5a880] to-[#ad8330] hover:from-[#d4b991] hover:to-[#be9441] active:scale-95 text-zinc-950 font-black rounded-full text-xs transition-all shadow-lg shadow-[#c5a880]/20 cursor-pointer"
                >
                  {t("assinar_starter")}
                </button>

                {/* Lista de Recursos */}
                <div className="space-y-2.5 pt-2 text-xs font-medium text-zinc-300">
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f1")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f2")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f3")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f4")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f5")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Premium (MAIS POPULAR - Destaque em Dourado) */}
            <div className="bg-[#050505] border-2 border-[#c5a880] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative shadow-[0_0_35px_rgba(197,168,128,0.2)] hover:scale-[1.02] transition-all">
              
              {/* Badge Mais Popular */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#c5a880] to-[#ad8330] text-zinc-950 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md shadow-[#c5a880]/30 whitespace-nowrap">
                {t("popular")}
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-[#c5a880]" />
                  <h3 className="text-xl font-black text-white">Premium</h3>
                </div>
                <p className="text-xs text-zinc-400 min-h-[36px]">
                  {t("premium_desc")}
                </p>

                {/* Preço */}
                <div className="pt-2 min-h-[85px] flex flex-col justify-end">
                  {billingCycle === "yearly" ? (
                    <div>
                      <span className="text-xs text-zinc-500 line-through block font-bold">R$ 197</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">R$ 133</span>
                        <span className="text-xs text-zinc-400 font-semibold">{t("mes")}</span>
                      </div>
                      <span className="text-[10.5px] text-[#c5a880] font-bold block mt-1">
                        {t("cobrado_anual_premium")}
                      </span>
                      <span className="text-[9.5px] text-zinc-400 block mt-0.5 leading-tight">
                        {t("cobranca_info")}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">R$ 197</span>
                        <span className="text-xs text-zinc-400 font-semibold">{t("mes")}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mt-1 font-bold">
                        {t("cobrado_mensalmente")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tokens Box Dourado */}
                <div className="bg-[#000000] border border-[#c5a880]/40 p-3 rounded-xl text-center text-xs font-black text-[#c5a880] flex items-center justify-center gap-2 shadow-inner">
                  <Sparkles size={14} className="text-[#c5a880]" />
                  <span>30000 tokens/{t("mes").replace("/", "")}</span>
                </div>

                {/* Botão Assinar Dourado */}
                <button
                  onClick={() => handleSubscribePlan("Premium")}
                  className="w-full py-3 bg-gradient-to-r from-[#c5a880] via-[#d4b991] to-[#ad8330] hover:brightness-110 active:scale-95 text-zinc-950 font-black rounded-full text-xs transition-all shadow-lg shadow-[#c5a880]/30 cursor-pointer"
                >
                  {t("assinar_premium")}
                </button>

                {/* Lista de Recursos */}
                <div className="space-y-2.5 pt-2 text-xs font-medium text-zinc-300">
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f6")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f7")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f3")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f8")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f9")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f10")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Business (PROFISSIONAL) */}
            <div className="bg-[#050505] border border-[#c5a880]/20 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative hover:border-[#c5a880]/50 transition-all shadow-xl">
              
              {/* Badge Profissional */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0a0a0a] text-zinc-300 border border-[#c5a880]/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                {t("profissional")}
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-[#c5a880]" />
                  <h3 className="text-xl font-black text-white">Business</h3>
                </div>
                <p className="text-xs text-zinc-400 min-h-[36px]">
                  {t("business_desc")}
                </p>

                {/* Preço */}
                <div className="pt-2 min-h-[85px] flex flex-col justify-end">
                  {billingCycle === "yearly" ? (
                    <div>
                      <span className="text-xs text-zinc-500 line-through block font-bold">R$ 397</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">R$ 249</span>
                        <span className="text-xs text-zinc-400 font-semibold">{t("mes")}</span>
                      </div>
                      <span className="text-[10.5px] text-[#c5a880] font-bold block mt-1">
                        {t("cobrado_anual_business")}
                      </span>
                      <span className="text-[9.5px] text-zinc-400 block mt-0.5 leading-tight">
                        {t("cobranca_info")}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">R$ 397</span>
                        <span className="text-xs text-zinc-400 font-semibold">{t("mes")}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mt-1 font-bold">
                        {t("cobrado_mensalmente")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tokens Box */}
                <div className="bg-[#000000] border border-[#c5a880]/20 p-3 rounded-xl text-center text-xs font-black text-white flex items-center justify-center gap-2">
                  <Sparkles size={14} className="text-[#c5a880]" />
                  <span>70000 tokens/{t("mes").replace("/", "")}</span>
                </div>

                {/* Botão Assinar Dourado */}
                <button
                  onClick={() => handleSubscribePlan("Business")}
                  className="w-full py-3 bg-gradient-to-r from-[#c5a880] to-[#ad8330] hover:from-[#d4b991] hover:to-[#be9441] active:scale-95 text-zinc-950 font-black rounded-full text-xs transition-all shadow-lg shadow-[#c5a880]/20 cursor-pointer"
                >
                  {t("assinar_business")}
                </button>

                {/* Lista de Recursos */}
                <div className="space-y-2.5 pt-2 text-xs font-medium text-zinc-300">
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f11")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f7")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f3")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f12")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f13")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                    <span>{t("f14")}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Subtítulo no Rodapé */}
          <p className="text-center text-xs text-zinc-400 font-medium pt-2">
            {t("footer_sec")}
          </p>
        </div>

      </div>
    </div>
  );
};
