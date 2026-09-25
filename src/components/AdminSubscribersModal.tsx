import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  Infinity as InfinityIcon,
  X,
  CreditCard,
  Mail,
  User,
  Sliders,
  AlertCircle
} from "lucide-react";
import { Subscriber } from "../utils/subscriberService";

interface AdminSubscribersModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  showToast?: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export const AdminSubscribersModal: React.FC<AdminSubscribersModalProps> = ({
  isOpen,
  onClose,
  adminEmail,
  showToast
}) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form para novo assinante
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState<number>(100);
  const [newUnlimited, setNewUnlimited] = useState(false);
  const [newPlan, setNewPlan] = useState("Plano Pro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal rápido de créditos
  const [creditAdjustModal, setCreditAdjustModal] = useState<{
    isOpen: boolean;
    email: string;
    currentCredits: number;
    addAmount: number;
  }>({
    isOpen: false,
    email: "",
    currentCredits: 0,
    addAmount: 50
  });

  const loadSubscribers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/subscribers?userEmail=${encodeURIComponent(adminEmail)}`, {
        headers: {
          "x-user-email": adminEmail
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
      } else {
        showToast?.(data.error || "Erro ao carregar assinantes.", "error");
      }
    } catch (err: any) {
      showToast?.("Falha de conexão ao buscar assinantes.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSubscribers();
    }
  }, [isOpen]);

  const handleCreateSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes("@")) {
      showToast?.("Digite um e-mail válido para o cliente.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": adminEmail
        },
        body: JSON.stringify({
          adminEmail,
          email: newEmail.trim().toLowerCase(),
          name: newName.trim() || newEmail.split("@")[0],
          status: "ativo",
          credits: newUnlimited ? 999999 : Number(newCredits),
          unlimited: newUnlimited,
          plan: newPlan,
          notes: `Cadastrado pelo Admin em ${new Date().toLocaleDateString("pt-BR")}`
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast?.(`Acesso liberado com sucesso para ${newEmail.trim()}!`, "success");
        setNewEmail("");
        setNewName("");
        setNewCredits(100);
        setNewUnlimited(false);
        loadSubscribers();
      } else {
        showToast?.(data.error || "Erro ao salvar assinante.", "error");
      }
    } catch (err: any) {
      showToast?.("Erro ao comunicar com o servidor.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (sub: Subscriber) => {
    const nextStatus = sub.status === "ativo" ? "inativo" : "ativo";
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": adminEmail
        },
        body: JSON.stringify({
          adminEmail,
          email: sub.email,
          status: nextStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(
          nextStatus === "ativo"
            ? `Acesso de ${sub.email} reativado!`
            : `Acesso de ${sub.email} bloqueado!`,
          "info"
        );
        loadSubscribers();
      }
    } catch (_) {
      showToast?.("Erro ao alterar status.", "error");
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o acesso de ${email}?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": adminEmail
        },
        body: JSON.stringify({
          adminEmail,
          email
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`Assinante ${email} removido.`, "success");
        loadSubscribers();
      }
    } catch (_) {
      showToast?.("Erro ao excluir assinante.", "error");
    }
  };

  const handleApplyCreditsAdjustment = async () => {
    const { email, currentCredits, addAmount } = creditAdjustModal;
    const newTotal = Math.max(0, currentCredits + addAmount);

    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": adminEmail
        },
        body: JSON.stringify({
          adminEmail,
          email,
          credits: newTotal,
          unlimited: false
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`+${addAmount} créditos adicionados para ${email}! Saldo atual: ${newTotal}`, "success");
        setCreditAdjustModal({ isOpen: false, email: "", currentCredits: 0, addAmount: 50 });
        loadSubscribers();
      }
    } catch (_) {
      showToast?.("Erro ao atualizar créditos.", "error");
    }
  };

  if (!isOpen) return null;

  const filtered = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.plan && s.plan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAtivos = subscribers.filter((s) => s.status === "ativo").length;
  const totalCreditos = subscribers.reduce((acc, s) => acc + (s.unlimited ? 0 : (s.credits || 0)), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-[#0d0b18] shadow-2xl shadow-purple-950/50 overflow-hidden text-white">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Controle de Clientes & Assinaturas
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Painel Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Libere acesso, defina créditos e gerencie quem pode utilizar o Zion Design AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSubscribers}
              disabled={isLoading}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stat Badges Strip */}
        <div className="grid grid-cols-3 gap-3 px-6 py-3.5 bg-black/40 border-b border-white/5 shrink-0 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block">Total Cadastrados</span>
              <span className="font-bold text-white text-sm">{subscribers.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block">Assinantes Ativos</span>
              <span className="font-bold text-emerald-400 text-sm">{totalAtivos}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 block">Créditos em Circulação</span>
              <span className="font-bold text-amber-300 text-sm">{totalCreditos}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* 1. Form de Adicionar Novo Assinante */}
          <div className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/20 to-black/40 shadow-inner">
            <div className="flex items-center gap-2 mb-3.5">
              <UserPlus className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Liberar Acesso para Nova Conta
              </h3>
            </div>

            <form onSubmit={handleCreateSubscriber} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    E-mail do Cliente *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="cliente@gmail.com"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-zinc-500" />
                    Nome (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: João da Agência"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-zinc-500" />
                    Plano de Acesso
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090714] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="Plano Pro">Plano Pro (Gerações IAs)</option>
                    <option value="Plano VIP">Plano VIP Completo</option>
                    <option value="Plano Starter">Plano Starter</option>
                    <option value="Acesso Vitalício">Acesso Ilimitado VIP</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Créditos Iniciais
                    </span>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] text-violet-400 hover:text-violet-300">
                      <input
                        type="checkbox"
                        checked={newUnlimited}
                        onChange={(e) => setNewUnlimited(e.target.checked)}
                        className="rounded accent-violet-600"
                      />
                      Ilimitado
                    </label>
                  </label>
                  <input
                    type="number"
                    disabled={newUnlimited}
                    min="1"
                    max="100000"
                    value={newUnlimited ? 999999 : newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 disabled:opacity-50 transition-colors"
                  />
                </div>
              </div>

              {/* Botões Rápidos de Créditos */}
              {!newUnlimited && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                  <span>Atalhos de créditos:</span>
                  {[50, 100, 200, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewCredits(val)}
                      className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                        newCredits === val
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Liberando..." : "Salvar & Liberar Acesso"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Barra de Busca e Filtro */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por e-mail, nome ou plano..."
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>
            <span className="text-xs text-zinc-500 shrink-0">
              {filtered.length} {filtered.length === 1 ? "conta encontrada" : "contas encontradas"}
            </span>
          </div>

          {/* 3. Lista de Clientes */}
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/5 bg-black/20 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">Nenhum cliente cadastrado ainda.</p>
                <p className="text-[11px] text-zinc-600">
                  Use o formulário acima para liberar acesso e créditos para as contas dos seus clientes.
                </p>
              </div>
            ) : (
              filtered.map((sub) => {
                const isAtivo = sub.status === "ativo";
                return (
                  <div
                    key={sub.email}
                    className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Informações do Usuário */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-900/50 to-fuchsia-900/50 border border-white/10 flex items-center justify-center font-bold text-sm text-violet-300 shrink-0">
                        {(sub.name || sub.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {sub.name || sub.email.split("@")[0]}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              isAtivo
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? "bg-emerald-400" : "bg-red-400"}`} />
                            {isAtivo ? "Ativo" : "Bloqueado"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="truncate">{sub.email}</span>
                          <span>•</span>
                          <span className="text-zinc-500">{sub.plan || "Pro"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Créditos e Ações */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      {/* Badge de Créditos */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">
                          {sub.unlimited ? "Ilimitado" : `${sub.credits ?? 0} créditos`}
                        </span>
                      </div>

                      {/* Botão +Créditos */}
                      <button
                        type="button"
                        onClick={() =>
                          setCreditAdjustModal({
                            isOpen: true,
                            email: sub.email,
                            currentCredits: sub.credits || 0,
                            addAmount: 50
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-violet-600 hover:border-violet-500 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                        title="Adicionar mais créditos"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Créditos</span>
                      </button>

                      {/* Alternar Status (Ativar / Bloquear) */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(sub)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isAtivo
                            ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                        title={isAtivo ? "Bloquear acesso" : "Reativar acesso"}
                      >
                        {isAtivo ? "Bloquear" : "Ativar"}
                      </button>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSubscriber(sub.email)}
                        className="p-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                        title="Remover cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 shrink-0 bg-black/40">
          <span>
            Qualquer alteração entra em vigor instantaneamente em produção na Vercel e no R2.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-medium transition-all cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>

      {/* Modal Rápido de Adicionar Créditos */}
      {creditAdjustModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#120f22] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Adicionar Créditos
              </h4>
              <button
                type="button"
                onClick={() => setCreditAdjustModal({ ...creditAdjustModal, isOpen: false })}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-zinc-400">
                Cliente: <span className="text-white font-semibold">{creditAdjustModal.email}</span>
              </p>
              <p className="text-zinc-400">
                Saldo atual:{" "}
                <span className="text-amber-300 font-bold">{creditAdjustModal.currentCredits} créditos</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400">Quantidade a adicionar:</label>
              <div className="grid grid-cols-4 gap-2">
                {[20, 50, 100, 250].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCreditAdjustModal({ ...creditAdjustModal, addAmount: val })}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      creditAdjustModal.addAmount === val
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="10000"
                value={creditAdjustModal.addAmount}
                onChange={(e) =>
                  setCreditAdjustModal({ ...creditAdjustModal, addAmount: Number(e.target.value) })
                }
                className="w-full mt-2 px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreditAdjustModal({ ...creditAdjustModal, isOpen: false })}
                className="flex-1 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyCreditsAdjustment}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-lg shadow-violet-600/30 cursor-pointer"
              >
                Confirmar +{creditAdjustModal.addAmount}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribersModal;
