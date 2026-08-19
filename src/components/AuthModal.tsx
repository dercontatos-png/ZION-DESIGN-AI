import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles, User, Phone, CheckSquare, Square, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase, supabaseUrl, supabaseAnonKey } from "../supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; role: "admin" | "client" }) => void;
  initialViewMode?: "login" | "register" | "forgot" | "reset";
}

type AuthViewMode = "login" | "register" | "forgot" | "reset";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialViewMode = "login" }) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialViewMode);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const [slideProgress, setSlideProgress] = useState(0);

  // When arriving via a password-recovery link, force the "new password" screen
  useEffect(() => {
    if (isOpen && initialViewMode === "reset") {
      setViewMode("reset");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, initialViewMode]);

  // Timed carousel slider loop between Slide 01 and Slide 02
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Progress bar grows from 0 to 100% while each slide is on screen (synced with the 5s loop)
  useEffect(() => {
    if (!isOpen) return;
    setSlideProgress(0);
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setSlideProgress(Math.min(100, (elapsed / 5000) * 100));
    }, 50);
    return () => clearInterval(tick);
  }, [activeSlide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // ==================== REDEFINIR SENHA (via link de recuperação) ====================
    if (viewMode === "reset") {
      if (!password.trim()) {
        setErrorMsg("Digite a nova senha.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("As senhas não coincidem. Verifique e tente novamente.");
        return;
      }

      setIsLoading(true);
      try {
        const { error: updateErr } = await supabase.auth.updateUser({ password });
        if (updateErr) {
          setIsLoading(false);
          setErrorMsg(updateErr.message || "Erro ao alterar a senha. Tente novamente.");
          return;
        }

        // Encerra a sessão de recuperação e pede login com a nova senha
        await supabase.auth.signOut().catch(() => {});

        setIsLoading(false);
        setPassword("");
        setConfirmPassword("");
        setSuccessMsg("Senha alterada com sucesso! Agora faça login com a nova senha.");
        setViewMode("login");
      } catch (err: any) {
        setIsLoading(false);
        setErrorMsg(err?.message || "Erro ao redefinir a senha. Verifique sua internet.");
      }
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Por favor, preencha o e-mail.");
      return;
    }

    // Password Reset Flow
    if (viewMode === "forgot") {
      setIsLoading(true);
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin,
        });
      } catch (sbErr) {}

      setIsLoading(false);
      setSuccessMsg("Link de redefinição enviado para o e-mail! Verifique sua caixa de entrada.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Por favor, preencha a senha.");
      return;
    }

    if (viewMode === "register" && !agreeTerms) {
      setErrorMsg("Você precisa aceitar os Termos de Uso para criar uma conta.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      if (viewMode === "register") {
        // ==================== REGISTRO ====================
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: name, phone } }
        });

        if (signUpErr) {
          setIsLoading(false);
          setErrorMsg(signUpErr.message || "Erro ao cadastrar conta.");
          return;
        }

        if (!authData?.user) {
          setIsLoading(false);
          setErrorMsg("Erro inesperado ao criar a conta. Tente novamente.");
          return;
        }

        // Sync to users table (MERGE: nunca apaga dados de app existentes)
        try {
          const { data: existingUser } = await supabase
            .from("users")
            .select("data")
            .eq("id", authData.user.id)
            .maybeSingle();
          const prevUserData =
            existingUser?.data && typeof existingUser.data === "object" && !Array.isArray(existingUser.data)
              ? (existingUser.data as Record<string, unknown>)
              : {};
          await supabase.from("users").upsert({
            id: authData.user.id,
            email: cleanEmail,
            role: cleanEmail === "der.contatos@gmail.com" ? "admin" : "client",
            data: { ...prevUserData, full_name: name, phone, role: cleanEmail === "der.contatos@gmail.com" ? "admin" : "client" },
            updated_at: new Date().toISOString()
          });
        } catch (e) {}

        // After signup, Supabase may require email confirmation.
        // Check if session was created immediately
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const role: "admin" | "client" = cleanEmail === "der.contatos@gmail.com" ? "admin" : "client";
          const userPayload = { email: cleanEmail, role };
          localStorage.setItem("zion_auth_user", JSON.stringify(userPayload));
          setIsLoading(false);
          onLoginSuccess(userPayload);
          onClose();
        } else {
          setIsLoading(false);
          setSuccessMsg("Conta criada! Verifique seu e-mail para confirmar o cadastro, depois faça login.");
          setViewMode("login");
        }

      } else {
        // ==================== LOGIN ====================
        const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        // CRITICAL: If Supabase returns an error OR no user, BLOCK access immediately
        if (signInErr || !authData?.user) {
          setIsLoading(false);
          setErrorMsg("E-mail ou senha incorretos. Se ainda não possui conta, clique em 'Criar agora' abaixo.");
          return;
        }

        // SUCCESS: Supabase confirmed the user is real and password is correct
        const role: "admin" | "client" = cleanEmail === "der.contatos@gmail.com" ? "admin" : "client";
        const userPayload = { email: cleanEmail, role };

        // Sync to users table
        try {
          await supabase.from("users").upsert({
            id: authData.user.id,
            email: cleanEmail,
            role,
            updated_at: new Date().toISOString()
          });
        } catch (e) {}

        localStorage.setItem("zion_auth_user", JSON.stringify(userPayload));
        setIsLoading(false);
        onLoginSuccess(userPayload);
        onClose();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || "Erro de conexão ao autenticar. Verifique sua internet.");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}${window.location.pathname}`
        : "http://localhost:3000";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.warn("[SUPABASE] OAuth error:", error.message);
        setIsLoading(false);
        setErrorMsg(`Erro ao iniciar login com o Google: ${error.message}`);
      }
    } catch (err: any) {
      console.warn("Google OAuth exception:", err);
      setIsLoading(false);
      setErrorMsg("Erro de conexão ao autenticar com o Google.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#050608] flex select-none overflow-hidden font-sans">
      
      {/* VIEW MODE: REDEFINIR SENHA (chegou pelo link de recuperação) */}
      {viewMode === "reset" ? (
        <div className="w-full h-full flex flex-col justify-between p-8 sm:p-12 relative bg-[#050608] overflow-y-auto animate-in fade-in duration-300">

          {/* Centered Glassmorphic New Password Card */}
          <div className="w-full max-w-sm mx-auto my-auto p-8 bg-[#090b10] border border-white/10 rounded-2xl shadow-2xl text-center space-y-5">

            {/* Lock Icon Emblem */}
            <div className="w-12 h-12 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center mx-auto text-[#c5a880]">
              <Lock className="w-5 h-5 text-[#c5a880]" />
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-[#c5a880]">
                Definir nova senha
              </h2>
              <p className="text-xs text-zinc-400">
                Digite e confirme sua nova senha para acessar
              </p>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-[#c5a880]/15 border border-[#c5a880]/40 rounded-xl text-[#c5a880] text-xs text-center font-medium animate-in fade-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#c5a880] via-[#d2b68c] to-[#b08e58] hover:from-[#d2b68c] hover:to-[#be9b62] text-zinc-950 font-extrabold text-sm rounded-full shadow-lg shadow-[#c5a880]/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Alterar senha</span>
                )}
              </button>
            </form>

          </div>

          <div />
        </div>
      ) : viewMode === "forgot" ? (
        <div className="w-full h-full flex flex-col justify-between p-8 sm:p-12 relative bg-[#050608] overflow-y-auto animate-in fade-in duration-300">
          
          {/* Top Left Back Button */}
          <div>
            <button
              type="button"
              onClick={() => { setViewMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-[#c5a880] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao login</span>
            </button>
          </div>

          {/* Centered Glassmorphic Password Reset Card */}
          <div className="w-full max-w-sm mx-auto my-auto p-8 bg-[#090b10] border border-white/10 rounded-2xl shadow-2xl text-center space-y-5">
            
            {/* Lock Icon Emblem */}
            <div className="w-12 h-12 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center mx-auto text-[#c5a880]">
              <Lock className="w-5 h-5 text-[#c5a880]" />
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-[#c5a880]">
                Redefinir senha
              </h2>
              <p className="text-xs text-zinc-400">
                Digite seu email para receber o link de redefinição
              </p>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg.green-500/10 bg-[#c5a880]/15 border border-[#c5a880]/40 rounded-xl text-[#c5a880] text-xs text-center font-medium animate-in fade-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#c5a880] via-[#d2b68c] to-[#b08e58] hover:from-[#d2b68c] hover:to-[#be9b62] text-zinc-950 font-extrabold text-sm rounded-full shadow-lg shadow-[#c5a880]/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Enviar link</span>
                )}
              </button>
            </form>

          </div>

          <div />
        </div>
      ) : (

        /* DEFAULT LOGIN & REGISTER SPLIT SCREEN VIEW */
        <>
          {/* LEFT HALF (50%): High-Fashion Image Carousel (Slide Loop 01 / 02) */}
          <div className="hidden lg:flex w-1/2 h-full relative bg-black overflow-hidden select-none">

            {/* Slide 01 Image */}
            <img
              src="/login_banner.png"
              alt="Zion Creative AI Banner 1"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                activeSlide === 0 ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Slide 02 Image */}
            <img
              src="/login_banner_2.png"
              alt="Zion Creative AI Banner 2"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                activeSlide === 1 ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Subtle Bottom Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Progress Bars Side by Side, with Number Below the Start of Each Bar */}
            <div className="absolute bottom-10 left-10 right-10 z-10">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSlide(0)}
                  className="flex-1 h-1 bg-white/45 overflow-hidden cursor-pointer"
                >
                  <span
                    className="block h-full bg-white transition-[width] duration-75 ease-linear"
                    style={{ width: `${activeSlide === 0 ? slideProgress : 100}%` }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide(1)}
                  className="flex-1 h-1 bg-white/45 overflow-hidden cursor-pointer"
                >
                  <span
                    className="block h-full bg-white transition-[width] duration-75 ease-linear"
                    style={{ width: `${activeSlide === 1 ? slideProgress : 0}%` }}
                  />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <span className="flex-1 text-left text-[8px] font-bold text-white">01</span>
                <span className="flex-1 text-left text-[8px] font-bold text-white">02</span>
              </div>
            </div>

          </div>

          {/* RIGHT HALF (50%): Clean Login / Register Panel */}
          <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#050608] relative overflow-y-auto">
            
            <div className="w-full max-w-sm space-y-6 py-6">
              
              {/* Top Brand Logo */}
              <div className="text-center space-y-2.5">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#c5a880] via-[#d2b68c] to-[#ad8330] flex items-center justify-center text-zinc-950 shadow-lg shadow-[#c5a880]/20">
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white font-montserrat">
                    ZION <span className="text-[#c5a880]">DESIGN AI</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-[#c5a880]">
                    {viewMode === "register" ? "Criar conta" : "Bem-vindo de volta"}
                  </h2>
                  <p className="text-xs text-white/90">
                    {viewMode === "register"
                      ? "Crie sua conta para começar"
                      : "Entre para continuar criando imagens incríveis"}
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium animate-in fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-100 border border-white/10 rounded-full font-medium text-xs text-zinc-900 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 shadow-md group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar com Google</span>
              </button>

              {/* Divider "ou" */}
              <div className="relative flex items-center justify-center my-3">
                <div className="w-full border-t border-white/10" />
                <span className="bg-[#050608] px-3 text-[11px] font-medium text-white/80 uppercase tracking-widest absolute">
                  ou
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Additional Fields for "Criar Conta" mode */}
                {viewMode === "register" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Nome
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {viewMode === "login" && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => { setViewMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                        className="text-xs text-[#c5a880] hover:underline cursor-pointer font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkbox for "Criar Conta" mode */}
                {viewMode === "register" && (
                  <div className="flex items-start gap-2 pt-1 text-xs text-zinc-400">
                    <button
                      type="button"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className="mt-0.5 text-[#c5a880] cursor-pointer"
                    >
                      {agreeTerms ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-zinc-600" />}
                    </button>
                    <span className="leading-tight text-[11px]">
                      Li e concordo com os{" "}
                      <a href="#" onClick={(e) => { e.preventDefault(); alert("Termos de Uso do Zion Design AI."); }} className="text-[#c5a880] hover:underline">
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a href="#" onClick={(e) => { e.preventDefault(); alert("Política de Privacidade do Zion Design AI."); }} className="text-[#c5a880] hover:underline">
                        Política de Privacidade
                      </a>
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#c5a880] via-[#d2b68c] to-[#b08e58] hover:from-[#d2b68c] hover:to-[#be9b62] text-white font-extrabold text-sm rounded-full shadow-lg shadow-[#c5a880]/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-4"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{viewMode === "register" ? "Criar conta" : "Entrar"}</span>
                  )}
                </button>
              </form>

              {/* Footer Action Switcher */}
              <div className="pt-2 flex flex-col items-center gap-2 text-xs text-zinc-400">
                <div>
                  {viewMode === "register" ? "Já tem conta? " : "Não tem conta? "}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode(viewMode === "register" ? "login" : "register");
                      setErrorMsg("");
                    }}
                    className="text-[#c5a880] hover:underline font-semibold cursor-pointer"
                  >
                    {viewMode === "register" ? "Entrar" : "Criar agora"}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
