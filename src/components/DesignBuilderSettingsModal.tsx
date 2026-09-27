import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  User,
  History,
  BookOpen,
  Headphones,
  Briefcase,
  ExternalLink,
  Camera,
  Mail,
  Shield,
  Check,
  Sparkles
} from "lucide-react";

export interface DesignBuilderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  onOpenCredits?: () => void;
  onOpenAdmin?: () => void;
}

export const DesignBuilderSettingsModal: React.FC<DesignBuilderSettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail: propUserEmail,
  userName: propUserName,
  onOpenCredits,
  onOpenAdmin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"perfil" | "plano" | "uso" | "documentacao">("perfil");

  const [name, setName] = useState<string>(() => {
    if (propUserName) return propUserName;
    if (typeof window !== "undefined") {
      return localStorage.getItem("zion_user_name") || "Ricardo";
    }
    return "Ricardo";
  });

  const [instagram, setInstagram] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zion_user_instagram") || "";
    }
    return "";
  });

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zion_language") || "pt-BR";
    }
    return "pt-BR";
  });

  const [isSavedName, setIsSavedName] = useState(false);
  const [isSavedInsta, setIsSavedInsta] = useState(false);

  const userEmail = propUserEmail || (typeof window !== "undefined" ? localStorage.getItem("zion_user_email") || "der.contatos@gmail.com" : "der.contatos@gmail.com");
  const userInitials = (name ? name.slice(0, 2) : "RI").toUpperCase();
  const isAdmin = userEmail.toLowerCase().trim() === "der.contatos@gmail.com";

  const handleSaveName = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("zion_user_name", name);
      try {
        const u = localStorage.getItem("zion_auth_user");
        if (u) {
          const parsed = JSON.parse(u);
          parsed.name = name;
          localStorage.setItem("zion_auth_user", JSON.stringify(parsed));
        }
      } catch (_) {}
    }
    setIsSavedName(true);
    setTimeout(() => setIsSavedName(false), 2000);
  };

  const handleSaveInstagram = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("zion_user_instagram", instagram);
    }
    setIsSavedInsta(true);
    setTimeout(() => setIsSavedInsta(false), 2000);
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zion_auth_user");
      localStorage.removeItem("currentUser");
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-full sm:max-h-[min(850px,calc(100dvh-2rem))] sm:rounded-2xl sm:border sm:border-white/10 sm:max-w-3xl bg-[#0c0c0c]/97 backdrop-blur-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(139,92,246,0.2)] animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Header Oficial */}
        <div className="flex items-center gap-3.5 border-b border-white/[0.06] px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] flex-shrink-0">
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/25">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
              {userInitials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white leading-tight">{name}</p>
            <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Corpo com Subnav e Conteúdo */}
        <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
          
          {/* Navegação Lateral Oficial */}
          <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b border-white/[0.06] p-2 scrollbar-hide sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-3 sm:w-52 sm:gap-4 select-none">
            
            {/* Seção Conta */}
            <section aria-label="Conta" className="min-w-0">
              <h2 className="px-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600 hidden sm:block">
                Conta
              </h2>
              <div className="flex gap-1 sm:flex-col sm:gap-0.5">
                <button
                  type="button"
                  aria-label="Plano"
                  onClick={() => setActiveSubTab("plano")}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left sm:w-full cursor-pointer ${
                    activeSubTab === "plano"
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Plano</span>
                </button>

                <button
                  type="button"
                  aria-label="Perfil"
                  onClick={() => setActiveSubTab("perfil")}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left sm:w-full cursor-pointer ${
                    activeSubTab === "perfil"
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Perfil</span>
                </button>
              </div>
            </section>

            {/* Seção Uso */}
            <section aria-label="Uso" className="min-w-0">
              <h2 className="px-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600 hidden sm:block">
                Uso
              </h2>
              <div className="flex gap-1 sm:flex-col sm:gap-0.5">
                <button
                  type="button"
                  aria-label="Histórico de uso"
                  onClick={() => setActiveSubTab("uso")}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left sm:w-full cursor-pointer ${
                    activeSubTab === "uso"
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <History className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Histórico de uso</span>
                </button>
              </div>
            </section>

            {/* Seção Ajuda */}
            <section aria-label="Ajuda" className="min-w-0">
              <h2 className="px-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600 hidden sm:block">
                Ajuda
              </h2>
              <div className="flex gap-1 sm:flex-col sm:gap-0.5">
                <button
                  type="button"
                  aria-label="Documentação"
                  onClick={() => setActiveSubTab("documentacao")}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left sm:w-full cursor-pointer ${
                    activeSubTab === "documentacao"
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Documentação</span>
                </button>

                <a
                  href="https://link.easybuilder.com.br/fale-com-o-suporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Falar com o suporte"
                  title="Falar com o suporte"
                  className="flex w-full items-center rounded-lg text-left font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white gap-2.5 px-3 py-2 text-xs cursor-pointer"
                >
                  <Headphones className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">Falar com o suporte</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" aria-hidden="true" />
                </a>

                <a
                  href="https://link.easybuilder.com.br/fale-com-luiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Falar com comercial"
                  title="Falar com comercial"
                  className="flex w-full items-center rounded-lg text-left font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white gap-2.5 px-3 py-2 text-xs cursor-pointer"
                >
                  <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">Falar com comercial</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" aria-hidden="true" />
                </a>
              </div>
            </section>
          </nav>

          {/* Área de Conteúdo da Aba */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-w-0 transform-gpu [contain:layout_paint] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] custom-scrollbar">
            
            {/* 1. ABA PERFIL */}
            {activeSubTab === "perfil" && (
              <div className="space-y-8 animate-in fade-in duration-150">
                {/* Idioma */}
                <section className="rounded-xl border border-white/5 bg-zinc-900/40 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-white">Idioma</h2>
                      <p className="mt-1 text-xs text-zinc-400">Você poderá alterar essa preferência a qualquer momento.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                      <span className="sr-only">Idioma</span>
                      <select
                        aria-label="Idioma"
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value);
                          if (typeof window !== "undefined") localStorage.setItem("zion_language", e.target.value);
                        }}
                        className="rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-400 cursor-pointer"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-419">Español (Latinoamérica)</option>
                      </select>
                    </label>
                  </div>
                </section>

                {/* Perfil */}
                <section>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Perfil</h2>
                      <p className="mt-0.5 text-xs text-zinc-500">Sua foto e nome, como estão na sua conta</p>
                    </div>

                    {/* Foto de perfil */}
                    <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-4">
                      <p className="text-xs font-medium text-white mb-3">Foto de perfil</p>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          aria-label="Adicionar foto de perfil"
                          className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-violet-500/20 transition-opacity disabled:opacity-60 cursor-pointer"
                        >
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-semibold text-white">
                            {userInitials}
                          </div>
                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Camera className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </button>
                        <div className="min-w-0 space-y-1">
                          <p className="text-[11px] leading-relaxed text-zinc-500">Clique na foto para trocar. Ela vale para todos os produtos.</p>
                          <p className="text-[11px] leading-relaxed text-zinc-400">JPG, PNG, WebP ou GIF. O envio final aceita até 5 MB; imagens maiores são reduzidas e compactadas automaticamente.</p>
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
                          onClick={handleSaveName}
                          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-violet-500 cursor-pointer"
                        >
                          {isSavedName ? <Check className="h-3 w-3" /> : null}
                          {isSavedName ? "Salvo!" : "Salvar nome"}
                        </button>
                        <p className="text-[11px] leading-relaxed text-zinc-500">Vale para todos os produtos da casa.</p>
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
                            className="h-9 w-full bg-transparent px-2 text-sm text-white placeholder:text-zinc-600 outline-none"
                            type="text"
                          />
                        </div>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveInstagram}
                          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-violet-500 cursor-pointer"
                        >
                          {isSavedInsta ? <Check className="h-3 w-3" /> : null}
                          {isSavedInsta ? "Salvo!" : "Salvar Instagram"}
                        </button>
                        <p className="text-[11px] leading-relaxed text-zinc-500">Aparece junto das suas artes na comunidade. Deixe vazio para remover.</p>
                      </div>
                    </div>
                  </div>

                  {/* Emails cadastrados */}
                  <div className="mt-4 rounded-xl border border-white/5 bg-zinc-900/50 p-4">
                    <p className="text-xs font-medium text-white mb-3">Emails cadastrados</p>
                    <div className="space-y-2">
                      <div className="rounded-lg border border-white/5 bg-zinc-800/40 p-3">
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-white truncate">{userEmail}</span>
                              <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">
                                E-MAIL DE LOGIN
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                      Trocar o e-mail de login não muda mais nada: seus planos, créditos e histórico continuam na mesma conta.
                    </p>
                  </div>
                </section>

                {/* Segurança da Conta */}
                <section>
                  <div className="rounded-xl border border-rose-500/15 bg-rose-500/[0.03] p-4 space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-rose-200">Segurança da conta</h2>
                      <p className="mt-0.5 text-[11px] text-zinc-500">Ações que afetam todos os seus aparelhos.</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-900/50 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white">Desconectar de todos os aparelhos</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">Encerra sua sessão em todos os produtos da casa.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.06] cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-zinc-900/50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white">Solicitar cancelamento da conta</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">Envia um pedido para análise da equipe.</p>
                        </div>
                        <button
                          type="button"
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

            {/* 2. ABA PLANO */}
            {activeSubTab === "plano" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Seu Plano Ativo</span>
                      <h3 className="text-xl font-bold text-white mt-1">Assinante Profissional</h3>
                      <p className="text-xs text-zinc-400 mt-1">6.612 créditos disponíveis (Saldo Vertex AI: $264.48 USD)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCredits?.();
                      }}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Gerenciar Plano
                    </button>
                  </div>
                </div>

                {isAdmin && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-amber-400" />
                        <div>
                          <p className="text-sm font-bold text-white">Painel de Administrador Geral</p>
                          <p className="text-xs text-zinc-400">Acesso ilimitado ao gerenciador de assinantes e créditos.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAdmin?.();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition-colors cursor-pointer border border-amber-500/30"
                      >
                        Abrir Painel Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. ABA HISTÓRICO DE USO */}
            {activeSubTab === "uso" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-semibold text-white">Histórico de Uso</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Suas atividades recentes e consumo de gerações.</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 text-center py-10">
                  <Sparkles className="h-8 w-8 text-violet-400 mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-medium text-white">Todas as gerações são salvas em sua Galeria e Projetos.</p>
                  <p className="text-xs text-zinc-500 mt-1">Suas criações recentes estão sincronizadas com o armazenamento local e na nuvem.</p>
                </div>
              </div>
            )}

            {/* 4. ABA DOCUMENTAÇÃO */}
            {activeSubTab === "documentacao" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h2 className="text-base font-semibold text-white">Documentação e Guias</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Aprenda a extrair o máximo do Studio IA.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                      Engenharia de Prompt
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Use os controles de Sujeito, Estilo e Paleta para refinar sua composição com clareza sem redundâncias.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                      Resoluções 1K e 4K
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Criações rápidas em 1K para testes e 4K Ultra HD para outdoors, mídias sociais e materiais impressos.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignBuilderSettingsModal;
