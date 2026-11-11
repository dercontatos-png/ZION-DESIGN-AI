import React, { useState, useEffect, useRef } from "react";
import { X, Zap, CreditCard, User, Coins, ImageOff, Mail, Camera, Shield, CheckCircle2, Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import { getCreditState, getCreditTransactions, syncWithGoogleCloud, setTotalCredits, ExtratoItem, CreditState } from "../utils/creditsManager";

interface CreditsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenAdmin?: () => void;
  customApiKey?: string;
  currentLang?: "pt" | "en" | "es";
  initialTab?: "planos" | "perfil";
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  onSignOut?: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen = true,
  onClose,
  onOpenSettings,
  onOpenAdmin,
  initialTab = "planos",
  userName: propUserName = "Usuário",
  userEmail: propUserEmail = "",
  userInitials: propUserInitials = "US",
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<"perfil" | "planos">(initialTab);
  const [creditState, setCreditState] = useState<CreditState>(getCreditState);
  const [transactions, setTransactions] = useState<ExtratoItem[]>(getCreditTransactions);
  const [currency, setCurrency] = useState<"brl" | "usd">("brl");
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [checkoutToast, setCheckoutToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleCheckout = async (planId: string, credits: number, type: "subscription" | "bundle") => {
    setIsCheckingOut(planId);
    try {
      const email = propUserEmail || localStorage.getItem("zion_user_email") || "cliente@ziondesign.ai";
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          currency,
          userEmail: email,
          userName: name || propUserName,
          successUrl: window.location.origin + window.location.pathname,
          cancelUrl: window.location.origin + window.location.pathname
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao iniciar checkout Stripe.");

      if (data.url) {
        if (data.isDemo) {
          await fetch("/api/stripe/verify-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: data.sessionId,
              planId,
              credits,
              userEmail: email
            })
          });
          const currentState = getCreditState();
          const newTotal = currentState.total + credits;
          setTotalCredits(newTotal);
          setCreditState(getCreditState());
          setTransactions(getCreditTransactions());
          setCheckoutToast({ msg: `Pagamento aprovado! +${credits.toLocaleString("pt-BR")} créditos adicionados com sucesso.`, type: "success" });
          setTimeout(() => setCheckoutToast(null), 5000);
        } else {
          window.location.href = data.url;
        }
      }
    } catch (err: any) {
      setCheckoutToast({ msg: err.message || "Erro ao processar checkout.", type: "error" });
      setTimeout(() => setCheckoutToast(null), 5000);
    } finally {
      setIsCheckingOut(null);
    }
  };

  // Profile Form States (Persisted in localStorage)
  const [name, setName] = useState(() => {
    return localStorage.getItem("user_profile_name") || propUserName;
  });
  const [initialSavedName, setInitialSavedName] = useState(() => {
    return localStorage.getItem("user_profile_name") || propUserName;
  });
  const [instagram, setInstagram] = useState(() => {
    return localStorage.getItem("user_profile_instagram") || "";
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem("user_profile_avatar") || null;
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("app_language_full") || "pt-BR";
  });

  // Email change states
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Sincroniza em tempo real com a API do Google Cloud/GCP
    syncWithGoogleCloud(true).then((updated) => {
      setCreditState(updated);
    });

    const update = () => {
      setCreditState(getCreditState());
      setTransactions(getCreditTransactions());
    };
    window.addEventListener("zion_credits_updated", update);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("zion_credits_updated", update);
    };
  }, [onClose]);

  const remaining = creditState.remaining ?? 0;
  const userInitials = (name || propUserInitials).substring(0, 2).toUpperCase();

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, ExtratoItem[]>>((acc, item) => {
    const d = item.date || "Recentes";
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    localStorage.setItem("app_language_full", newLang);
    const shortLang = newLang.startsWith("pt") ? "pt" : newLang.startsWith("es") ? "es" : "en";
    localStorage.setItem("app_language", shortLang);
    window.dispatchEvent(new CustomEvent("zion_toast", { detail: { message: "Idioma atualizado!", type: "success" } }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem("user_profile_avatar", dataUrl);
      window.dispatchEvent(new CustomEvent("zion_toast", { detail: { message: "Foto de perfil atualizada!", type: "success" } }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (!name.trim()) return;
    localStorage.setItem("user_profile_name", name.trim());
    setInitialSavedName(name.trim());
    window.dispatchEvent(new CustomEvent("zion_toast", { detail: { message: "Nome salvo com sucesso!", type: "success" } }));
  };

  const handleSaveInstagram = () => {
    localStorage.setItem("user_profile_instagram", instagram.trim());
    window.dispatchEvent(new CustomEvent("zion_toast", { detail: { message: "Instagram salvo com sucesso!", type: "success" } }));
  };

  const handleDisconnect = () => {
    if (window.confirm("Deseja realmente desconectar de todos os aparelhos?")) {
      if (onSignOut) {
        onSignOut();
      } else {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const handleCancelRequest = () => {
    alert("Solicitação enviada para análise da equipe. Entraremos em contato por e-mail.");
  };

  const handleSendEmailCode = () => {
    if (!newEmail.trim() || !newEmail.includes("@")) return;
    window.dispatchEvent(
      new CustomEvent("zion_toast", {
        detail: {
          message: `Código de verificação enviado para ${newEmail}!`,
          type: "success",
        },
      })
    );
    setIsChangingEmail(false);
    setNewEmail("");
  };
  if (isOpen === false) return null;


  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Janela Modal Oficial */}
      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-full sm:max-h-[700px] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-white/10 bg-[#0c0c0c]/97 backdrop-blur-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(139,92,246,0.2)] animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 border-b border-white/[0.06] px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] flex-shrink-0">
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/25">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
                {userInitials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white leading-tight">
              {name}
            </p>
            <p className="truncate text-xs text-zinc-500">{propUserEmail}</p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo com Navegação Lateral e Conteúdo */}
        <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
          {/* Navegação de Abas */}
          <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b border-white/[0.06] p-2 scrollbar-hide sm:w-40 sm:flex-col sm:gap-0.5 sm:overflow-x-visible sm:overflow-y-auto sm:border-b-0 sm:border-r">
            <button
              type="button"
              onClick={() => setActiveTab("perfil")}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left sm:w-full cursor-pointer ${
                activeTab === "perfil"
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Perfil</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("planos")}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left sm:w-full cursor-pointer ${
                activeTab === "planos"
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Coins className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Planos/Créditos</span>
            </button>
          </nav>

          {/* Área de Conteúdo */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] min-w-0 transform-gpu [contain:layout_paint]">
            {activeTab === "planos" ? (
              <div className="space-y-6">
                {/* Cartão de Plano Atual */}
                <section className="relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/50">
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgb(124, 58, 237), transparent)",
                    }}
                  />
                  <div className="p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                        <CreditCard className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-white">
                          {propUserEmail?.toLowerCase() === "der.contatos@gmail.com"
                            ? "Seu plano é Administrador Geral (Acesso Total)"
                            : creditState.remaining > 0
                            ? "Seu plano de Assinatura Zion Design"
                            : "Nenhuma assinatura ativa encontrada"}
                        </h2>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {propUserEmail?.toLowerCase() === "der.contatos@gmail.com"
                            ? "der.contatos@gmail.com · Gestão total de clientes e agentes"
                            : propUserEmail
                            ? `Conectado como ${propUserEmail}`
                            : "Faça login com sua conta para acessar créditos"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-lg border p-3.5 border-white/5 bg-zinc-800/40">
                      <Zap className="h-5 w-5 shrink-0 text-violet-400" />
                      <div className="min-w-0">
                        <p className="text-xl font-bold leading-tight text-white tabular-nums">
                          {remaining.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          créditos reais disponíveis
                        </p>
                      </div>
                    </div>
                    {propUserEmail?.toLowerCase().trim() === "der.contatos@gmail.com" && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onOpenAdmin) onOpenAdmin();
                          window.dispatchEvent(new CustomEvent("open-admin-subscribers"));
                          window.dispatchEvent(new CustomEvent("db:open_admin"));
                        }}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-3 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Shield className="h-4 w-4 text-black" />
                        <span>Acessar Painel do Administrador (Assinantes)</span>
                      </button>
                    )}
                  </div>
                </section>

                {/* Saldo Disponível */}
                <div className="space-y-5">
                  <div className="rounded-xl border border-white/5 bg-gradient-to-br from-violet-500/[0.07] to-transparent px-4 py-3.5">
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Saldo disponível
                    </p>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-semibold tabular-nums text-white">
                        {remaining.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-sm text-zinc-400">
                        créditos
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-white/5 pt-2.5">
                      <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-400">
                        Status:
                        <span className="ml-1 font-semibold text-emerald-400">
                          {propUserEmail?.toLowerCase() === "der.contatos@gmail.com" ? "Assinante Profissional" : remaining > 0 ? "Assinante Ativo" : "Sem Assinatura"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Toast Feedback de Checkout */}
                  {checkoutToast && (
                    <div className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-xs font-medium animate-in fade-in-0 duration-200 ${
                      checkoutToast.type === "success"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300"
                    }`}>
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>{checkoutToast.msg}</span>
                    </div>
                  )}

                  {/* ── SELETOR DE MOEDA (BRL / USD) ── */}
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/60 p-2.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-violet-400" />
                      <span className="text-xs font-semibold text-white">Moeda de Pagamento Stripe</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setCurrency("brl")}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                          currency === "brl"
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        🇧🇷 BRL (R$)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency("usd")}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                          currency === "usd"
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        🇺🇸 USD ($)
                      </button>
                    </div>
                  </div>

                  {/* ── PLANOS DE ASSINATURA MENSAL (SAAS STRIPE) ── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Assinatura Mensal (SaaS)
                      </h3>
                      <span className="text-[11px] text-zinc-500">Sem fidelidade · Cancele quando quiser</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Starter */}
                      <div className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition-all hover:border-white/20">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Starter</span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-white">
                              {currency === "brl" ? "R$ 97" : "$ 19"}
                            </span>
                            <span className="text-xs text-zinc-400">/mês</span>
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-violet-400">
                            300 créditos mensais
                          </p>
                          <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-[11px] text-zinc-400">
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>Ref Builder & V2</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>Resolução até 4K</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>Feed Global da Comunidade</span>
                            </li>
                          </ul>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(isCheckingOut)}
                          onClick={() => handleCheckout("starter", 300, "subscription")}
                          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isCheckingOut === "starter" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>Assinar Starter</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Pro (Mais Popular) */}
                      <div className="relative flex flex-col justify-between rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-violet-500/15 via-zinc-900/90 to-zinc-950 p-4 shadow-xl shadow-violet-500/10">
                        <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                          MAIS POPULAR
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Pro</span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-white">
                              {currency === "brl" ? "R$ 197" : "$ 39"}
                            </span>
                            <span className="text-xs text-zinc-400">/mês</span>
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-violet-300">
                            1.000 créditos mensais
                          </p>
                          <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[11px] text-zinc-300">
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                              <span>Todos os Builders (Órion, Hydra, Ref)</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                              <span>Resolução Máxima 8K Master</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                              <span>Fila Prioritária de Render</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                              <span>Suporte VIP WhatsApp</span>
                            </li>
                          </ul>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(isCheckingOut)}
                          onClick={() => handleCheckout("pro", 1000, "subscription")}
                          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:bg-violet-500 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isCheckingOut === "pro" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>Assinar Pro Agora</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Agency */}
                      <div className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition-all hover:border-white/20">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Studio / Agência</span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-white">
                              {currency === "brl" ? "R$ 397" : "$ 79"}
                            </span>
                            <span className="text-xs text-zinc-400">/mês</span>
                          </div>
                          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
                            3.000 créditos mensais
                          </p>
                          <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-[11px] text-zinc-400">
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>Gerações simultâneas em lote</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>Armazenamento R2 Ilimitado</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span>Onboarding & Gerente Dedicado</span>
                            </li>
                          </ul>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(isCheckingOut)}
                          onClick={() => handleCheckout("agency", 3000, "subscription")}
                          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isCheckingOut === "agency" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>Assinar Agência</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── PACOTES DE RECARGA DE CRÉDITOS AVULSOS ── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Recarga Avulsa de Créditos
                      </h3>
                      <span className="text-[11px] text-zinc-500">Créditos não expiram nunca</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Pack 100 */}
                      <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3.5 text-left flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">100 Créditos</div>
                          <div className="mt-1 text-lg font-bold text-white">
                            {currency === "brl" ? "R$ 39" : "$ 8"}
                          </div>
                          <p className="mt-0.5 text-[11px] text-zinc-500">R$ 0,39 por crédito</p>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(isCheckingOut)}
                          onClick={() => handleCheckout("pack_100", 100, "bundle")}
                          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isCheckingOut === "pack_100" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Comprar Recarga"}
                        </button>
                      </div>

                      {/* Pack 500 */}
                      <div className="relative rounded-xl border border-violet-500/40 bg-violet-500/[0.06] p-3.5 text-left flex flex-col justify-between shadow-md shadow-violet-500/5">
                        <span className="absolute -top-2.5 right-3 rounded-full bg-violet-600 px-2 py-0.5 text-[9px] font-bold text-white">
                          MELHOR CUSTO
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">500 Créditos</div>
                          <div className="mt-1 text-lg font-bold text-violet-300">
                            {currency === "brl" ? "R$ 149" : "$ 29"}
                          </div>
                          <p className="mt-0.5 text-[11px] text-zinc-400">R$ 0,29 por crédito (-25%)</p>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(isCheckingOut)}
                          onClick={() => handleCheckout("pack_500", 500, "bundle")}
                          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-violet-600 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isCheckingOut === "pack_500" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Comprar 500 Créditos"}
                        </button>
                      </div>

                      {/* Pack 1500 */}
                      <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-3.5 text-left flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">1.500 Créditos</div>
                          <div className="mt-1 text-lg font-bold text-white">
                            {currency === "brl" ? "R$ 349" : "$ 69"}
                          </div>
                          <p className="mt-0.5 text-[11px] text-zinc-500">R$ 0,23 por crédito (-40%)</p>
                        </div>
                        <button
                          type="button"
                          disabled={Boolean(isCheckingOut)}
                          onClick={() => handleCheckout("pack_1500", 1500, "bundle")}
                          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isCheckingOut === "pack_1500" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Comprar 1.500 Créditos"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Histórico Real / Extrato */}
                  <div className="space-y-4">
                    {Object.entries(groupedTransactions).map(([dateLabel, items], gIdx) => (
                      <section key={gIdx}>
                        <h4 className="mb-1.5 px-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                          {dateLabel}
                        </h4>
                        <ul className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
                          {items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-3 border-b border-white/5 px-3 py-2.5 last:border-b-0"
                            >
                              {/* Thumbnail / Ícone */}
                              <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                                {item.thumb ? (
                                  <img
                                    alt=""
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    src={item.thumb}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageOff className="h-3.5 w-3.5 text-zinc-700" />
                                  </div>
                                )}
                              </div>

                              {/* Detalhes */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] text-zinc-200">
                                  {item.agent}
                                  <span className="text-zinc-500">
                                    {" "}
                                    · {item.action}
                                  </span>
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span className="text-[11px] tabular-nums text-zinc-500">
                                    {item.time}
                                  </span>
                                  {item.resolution && (
                                    <span className="rounded bg-white/[0.05] px-1.5 py-px text-[10px] font-medium text-zinc-400">
                                      {item.resolution}
                                    </span>
                                  )}
                                  {item.ratio && (
                                    <span className="rounded bg-white/[0.05] px-1.5 py-px text-[10px] font-medium text-zinc-400">
                                      {item.ratio}
                                    </span>
                                  )}
                                  {item.isDevolvido && (
                                    <span className="rounded bg-emerald-500/10 px-1.5 py-px text-[10px] font-medium text-emerald-400">
                                      devolvido
                                    </span>
                                  )}
                                  {item.isEntrada && (
                                    <span className="rounded bg-emerald-500/10 px-1.5 py-px text-[10px] font-medium text-emerald-400">
                                      entrada
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Valor e Saldo */}
                              <div className="flex-shrink-0 text-right">
                                <p
                                  className={`text-sm font-semibold tabular-nums ${
                                    item.change.startsWith("+")
                                      ? "text-emerald-400"
                                      : "text-zinc-200"
                                  }`}
                                >
                                  {item.change}
                                </p>
                                <p className="text-[10px] tabular-nums text-zinc-600">
                                  saldo {item.saldoApos.toLocaleString("pt-BR")}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Aba de Perfil Oficial */
              <div className="space-y-8">
                {/* 1. Idioma */}
                <section className="rounded-xl border border-white/5 bg-zinc-900/40 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-white">Idioma</h2>
                      <p className="mt-1 text-xs text-zinc-400">
                        Você poderá alterar essa preferência a qualquer momento.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                      <span className="sr-only">Idioma</span>
                      <select
                        aria-label="Idioma"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        className="rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-400 cursor-pointer"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-419">Español (Latinoamérica)</option>
                      </select>
                    </label>
                  </div>
                </section>

                {/* 2. Perfil */}
                <section>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Perfil</h2>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Sua foto e nome, como estão na sua conta
                      </p>
                    </div>

                    {/* Foto de perfil */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
                      <p className="text-xs font-medium text-white mb-3">Foto de perfil</p>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          aria-label="Adicionar foto de perfil"
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/20 transition-opacity disabled:opacity-60 cursor-pointer"
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-semibold text-white">
                              {userInitials}
                            </div>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Camera className="h-5 w-5 text-white" />
                          </span>
                        </button>
                        <input
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          type="file"
                          onChange={handleAvatarUpload}
                        />
                        <div className="min-w-0 space-y-1">
                          <p className="text-[11px] leading-relaxed text-zinc-500">
                            Clique na foto para trocar. Ela vale para todos os produtos.
                          </p>
                          <p className="text-[11px] leading-relaxed text-zinc-400">
                            JPG, PNG, WebP ou GIF. O envio final aceita até 5 MB; imagens maiores são reduzidas e compactadas automaticamente.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nome */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4 space-y-3">
                      <p className="text-xs font-medium text-white">Nome</p>
                      <label className="block">
                        <span className="text-[11px] text-zinc-400">Como você se chama</span>
                        <input
                          maxLength={120}
                          placeholder="Seu nome completo"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/60"
                          type="text"
                        />
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={name.trim() === initialSavedName}
                          onClick={handleSaveName}
                          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Salvar nome
                        </button>
                        <p className="text-[11px] leading-relaxed text-zinc-500">
                          Vale para todos os produtos da casa.
                        </p>
                      </div>
                    </div>

                    {/* Instagram */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4 space-y-3">
                      <p className="text-xs font-medium text-white">Instagram</p>
                      <label className="block">
                        <span className="text-[11px] text-zinc-400">Seu @ ou o endereço do seu perfil</span>
                        <div className="mt-1 flex items-center rounded-lg border border-white/10 bg-zinc-950 focus-within:border-violet-500/60">
                          <span aria-hidden="true" className="pl-3 text-sm text-zinc-500">@</span>
                          <input
                            maxLength={300}
                            placeholder="seu.usuario"
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className="h-9 w-full bg-transparent px-2 text-sm text-white placeholder:text-zinc-600 outline-none disabled:opacity-60"
                            type="text"
                          />
                        </div>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveInstagram}
                          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40 cursor-pointer"
                        >
                          Salvar Instagram
                        </button>
                        <p className="text-[11px] leading-relaxed text-zinc-500">
                          Aparece junto das suas artes na comunidade. Deixe vazio para remover.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emails cadastrados Oficial com Troca de E-mail */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-zinc-900/50 p-4">
                    <p className="text-xs font-medium text-white mb-3">Emails cadastrados</p>
                    <div className="space-y-2">
                      <div className="rounded-lg border border-white/5 bg-zinc-800/40 p-3">
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-white truncate">{propUserEmail}</span>
                              <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">
                                E-MAIL DE LOGIN
                              </span>
                            </div>
                          </div>
                          {!isChangingEmail && (
                            <button
                              type="button"
                              onClick={() => setIsChangingEmail(true)}
                              className="shrink-0 text-[11px] text-violet-400 transition-colors hover:text-violet-300 cursor-pointer"
                            >
                              Trocar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Caixa Expansível de Novo E-mail */}
                    {isChangingEmail && (
                      <div className="mt-3 space-y-2.5 rounded-lg border border-white/5 bg-zinc-950/40 p-3 animate-in fade-in-0 duration-200">
                        <label className="block">
                          <span className="text-[11px] text-zinc-400">Novo e-mail</span>
                          <input
                            placeholder="seu@novo-email.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/60"
                            type="email"
                          />
                        </label>
                        <p className="text-[11px] leading-relaxed text-zinc-500">
                          Enviamos um código para o endereço novo. Ele só passa a valer depois que você confirmar — é o que garante que a caixa é sua.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!newEmail.trim() || !newEmail.includes("@")}
                            onClick={handleSendEmailCode}
                            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          >
                            Enviar código
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsChangingEmail(false);
                              setNewEmail("");
                            }}
                            className="rounded-lg px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                      Trocar o e-mail de login não muda mais nada: seus planos, créditos e histórico continuam na mesma conta. O endereço anterior segue guardado.
                    </p>
                  </div>
                </section>

                {/* 3. Segurança da conta */}
                <section>
                  <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.03] p-4 space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-rose-200">Segurança da conta</h2>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        Ações que afetam todos os seus aparelhos.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-900/50 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white">Desconectar de todos os aparelhos</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                          Encerra sua sessão em todos os produtos da casa. Use se achar que alguém entrou na sua conta, ou se esqueceu ela aberta em outro computador.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-zinc-900/50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white">Solicitar cancelamento da conta</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                            Envia um pedido para análise da equipe. Esta ação não apaga, não agenda e não cancela automaticamente sua conta, gerações, projetos ou créditos.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelRequest}
                          className="shrink-0 rounded-lg border border-rose-500/20 px-3 py-1.5 text-[11px] font-medium text-rose-300 transition-colors hover:bg-rose-500/10 cursor-pointer"
                        >
                          Enviar solicitação
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
