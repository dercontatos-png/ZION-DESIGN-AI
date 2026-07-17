import React, { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Calendar,
  FileText,
  User,
  LogOut,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ExternalLink
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  status: "todo" | "doing" | "done";
  client: string;
  hasDeadline?: boolean;
  dueDate?: string;
};

type Client = {
  id: number;
  name: string;
  niche: string;
  status: "Ativo" | "Inativo" | "Prospecção";
  contact: string;
  plan?: string;
  planDetails?: string;
  planValue: number;
  dueDate: string;
  paymentStatus: "Em dia" | "Atrasado" | "Pendente";
  startDate?: string;
  notes?: string;
  avatarUrl?: string;
};

type Transaction = {
  id: number;
  description: string;
  type: "receita" | "despesa";
  amount: number;
  date: string;
  category: string;
  status: "pago" | "pendente";
  client?: string;
};

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  clientName: string;
  description?: string;
  type: "post" | "reuniao" | "entrega";
};

type SavedNote = {
  id: number;
  clientName: string;
  title: string;
  content: string;
  date: string;
  type: string;
};

interface ClientPortalProps {
  clients: Client[];
  tasks: Task[];
  transactions: Transaction[];
  calendarEvents: CalendarEvent[];
  savedNotes: SavedNote[];
  selectedClientId: number | null;
  onSelectClient: (id: number | null) => void;
  activeClientTab: string;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  clients,
  tasks,
  transactions,
  calendarEvents,
  savedNotes,
  selectedClientId,
  onSelectClient,
  activeClientTab,
}) => {
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);

  // Safe helpers for formatting dates and due dates
  const formatClientDueDate = (val: any): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes("-")) {
      const parts = str.split("-");
      if (parts.length >= 3) {
        return parts[2];
      }
    }
    return str;
  };

  const formatTaskDueDate = (val: any): string => {
    if (val === null || val === undefined || val === "") return "";
    const str = String(val);
    if (str.includes("-")) {
      return str.split("-").reverse().join("/");
    }
    return str;
  };

  // Find currently logged-in client
  const currentClient = clients.find((c) => c.id === selectedClientId);

  // Filter lists by the logged-in client's name
  const clientName = currentClient?.name || "";
  const clientTasks = tasks.filter(
    (t) => t.client?.toLowerCase() === clientName.toLowerCase()
  );
  const clientTransactions = transactions.filter(
    (t) =>
      t.client?.toLowerCase() === clientName.toLowerCase() &&
      t.type === "receita"
  );
  const clientEvents = calendarEvents.filter(
    (e) => e.clientName?.toLowerCase() === clientName.toLowerCase()
  );
  const clientNotes = savedNotes.filter(
    (n) => n.clientName?.toLowerCase() === clientName.toLowerCase()
  );

  // Stats
  const completedTasks = clientTasks.filter((t) => t.status === "done").length;
  const totalTasks = clientTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeTasksCount = clientTasks.filter((t) => t.status !== "done").length;
  const nextPayment = currentClient?.dueDate || "-";

  // If no client is selected, render a login / selection screen
  if (!currentClient) {
    const activeClients = clients.filter((c) => c.status === "Ativo");

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0b0b0c] border border-white/10 rounded-3xl p-6 sm:p-10 w-full max-w-lg text-center shadow-2xl relative overflow-hidden"
        >
          {/* Decorative light reflection */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a880]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-[#c5a880]/10 border border-[#c5a880]/20 rounded-xl flex items-center justify-center mx-auto mb-6 text-[#c5a880] shadow-lg">
            <User size={32} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Portal do Cliente
          </h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Selecione a sua empresa para acessar seu cronograma, acompanhar tarefas, visualizar faturas e briefings em tempo real.
          </p>

          {activeClients.length === 0 ? (
            <div className="bg-[#c5a880]/5 border border-[#c5a880]/10 rounded-xl p-4 text-left">
              <div className="flex gap-2 text-[#c5a880] mb-1">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Nenhum Cliente Ativo
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Não há clientes com status <strong>"Ativo"</strong> cadastrados nesta área de trabalho. Retorne ao <strong>Painel Admin</strong> e cadastre ou ative um cliente primeiro!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-left text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Selecione sua empresa:
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                {activeClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => onSelectClient(client.id)}
                    className="w-full text-left p-4 rounded-xl bg-[#050505] border border-white/5 hover:border-[#c5a880]/30 text-white flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt={client.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 text-[#c5a880] flex items-center justify-center text-sm font-bold uppercase shrink-0">
                          {client.name.substring(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="font-bold text-sm truncate group-hover:text-[#c5a880] transition-colors">
                          {client.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{client.niche}</p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-zinc-500 group-hover:text-[#c5a880] group-hover:translate-x-1 transition-all shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Active portal dashboard rendering
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a880]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          {currentClient.avatarUrl ? (
            <img
              src={currentClient.avatarUrl}
              alt={currentClient.name}
              className="w-16 h-16 rounded-xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-zinc-800 text-[#c5a880] flex items-center justify-center text-xl font-bold uppercase">
              {currentClient.name.substring(0, 2)}
            </div>
          )}
          <div>
            <span className="bg-[#c5a880]/10 text-[#c5a880] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#c5a880]/20">
              Área Exclusiva do Cliente
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              {currentClient.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Nicho: {currentClient.niche} • Conectado via Nuvem Segura.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectClient(null)}
          className="bg-zinc-800/80 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0 z-10 shadow-lg"
        >
          <LogOut size={14} /> Sair do Portal
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeClientTab === "overview" && (
        <div className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Seu Plano */}
            <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <span className="text-sm font-bold text-white block tracking-wider mb-1">
                Contrato & Plano
              </span>
              <p className="text-lg font-medium text-zinc-400 mt-1.5 truncate">
                {currentClient.plan || "Plano Personalizado"}
              </p>
              <span className="text-xs text-zinc-500 mt-1 block font-medium">
                R$ {currentClient.planValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
              </span>
              <p className="text-[10px] text-zinc-500 mt-2 italic truncate">
                {currentClient.planDetails || "Serviços digitais recorrentes."}
              </p>
            </div>

            {/* Card 2: Status Financeiro */}
            <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <span className="text-sm font-bold text-white block tracking-wider mb-1">
                Status Financeiro
              </span>
              <div className="flex items-center gap-2 mt-2">
                {currentClient.paymentStatus === "Em dia" ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold">
                    <CheckCircle2 size={12} /> Em dia
                  </span>
                ) : currentClient.paymentStatus === "Atrasado" ? (
                  <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-bold">
                    <AlertCircle size={12} /> Atrasado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[#c5a880]/10 text-[#c5a880] text-xs px-2.5 py-1 rounded-full font-bold">
                    <Clock size={12} /> Pendente
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-3 leading-tight">
                Vencimento: {currentClient.dueDate ? `Dia ${formatClientDueDate(currentClient.dueDate)}` : "Não definido"}
              </p>
            </div>

            {/* Card 3: Progresso de Entregas */}
            <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <span className="text-sm font-bold text-white block tracking-wider mb-1">
                Progresso de Entregas
              </span>
              <p className="text-2xl font-medium text-zinc-400 mt-1.5">
                {progressPercent}%
              </p>
              <div className="w-full bg-[#050505] h-1.5 rounded-full mt-2 overflow-hidden border border-white/5">
                <div
                  className="bg-[#c5a880] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                {completedTasks} de {totalTasks} tarefas concluídas.
              </p>
            </div>

            {/* Card 4: Tarefas Ativas */}
            <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <span className="text-sm font-bold text-white block tracking-wider mb-1">
                Fila de Trabalho (Pendente)
              </span>
              <p className="text-2xl font-medium text-zinc-400 mt-1.5">
                {activeTasksCount}
              </p>
              <span className="text-xs text-zinc-400 mt-1 block">
                Itens na esteira de produção
              </span>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight truncate">
                Acompanhe o detalhamento ao lado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Deliveries Checklist */}
            <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#c5a880]" /> Atividades Recentes
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Total: {totalTasks}
                </span>
              </div>

              {clientTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/5 rounded-xl">
                  <CheckSquare size={24} className="text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-500">Sem atividades registradas para este projeto.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {clientTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#050505] border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            t.status === "done"
                              ? "bg-emerald-500"
                              : t.status === "doing"
                              ? "bg-[#c5a880]"
                              : "bg-zinc-600"
                          }`}
                        />
                        <span className={`text-xs font-semibold truncate ${t.status === "done" ? "text-zinc-500 line-through font-normal" : "text-white"}`}>
                          {t.title}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-black shrink-0 ${
                          t.status === "done"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : t.status === "doing"
                            ? "bg-[#c5a880]/10 text-[#c5a880]"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {t.status === "done" ? "Entregue" : t.status === "doing" ? "Em Produção" : "Fila"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inbound Schedule Calendar Events */}
            <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-[#c5a880]" /> Próximos Compromissos & Postagens
              </h3>

              {clientEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/5 rounded-xl">
                  <Calendar size={24} className="text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-500">Nenhuma data marcada.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {clientEvents
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 rounded-xl bg-[#050505] border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-white/10 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                ev.type === "reuniao"
                                  ? "bg-[#c5a880]/10 text-[#c5a880]"
                                  : ev.type === "post"
                                  ? "bg-violet-500/10 text-violet-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {ev.type === "reuniao" ? "Reunião" : ev.type === "post" ? "Postagem" : "Entrega"}
                            </span>
                            <span className="text-xs font-bold text-white truncate">{ev.title}</span>
                          </div>
                          {ev.description && (
                            <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{ev.description}</p>
                          )}
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-xs font-bold text-[#c5a880]">
                            {ev.date.split("-").reverse().join("/")}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{ev.time}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Tab Content */}
      {activeClientTab === "deliveries" && (
        <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Esteira de Produção & Entregas</h3>
            <p className="text-xs text-zinc-400 mt-1">Acompanhe detalhadamente todas as tarefas e aprovações da sua agência digital.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Backlog / Todo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" /> Na Fila ({clientTasks.filter((t) => t.status === "todo").length})
                </span>
              </div>
              <div className="space-y-3">
                {clientTasks.filter((t) => t.status === "todo").map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#050505] border border-white/5 hover:border-white/10 transition-colors">
                    <p className="text-xs font-bold text-white leading-snug">{t.title}</p>
                    {t.dueDate && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Clock size={12} /> Limite: {formatTaskDueDate(t.dueDate)}
                      </div>
                    )}
                  </div>
                ))}
                {clientTasks.filter((t) => t.status === "todo").length === 0 && (
                  <p className="text-center py-6 text-xs text-zinc-600 italic">Nenhum item na fila.</p>
                )}
              </div>
            </div>

            {/* Column 2: In Production / Doing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-pulse" /> Em Execução ({clientTasks.filter((t) => t.status === "doing").length})
                </span>
              </div>
              <div className="space-y-3">
                {clientTasks.filter((t) => t.status === "doing").map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#050505] border border-[#c5a880]/10 hover:border-[#c5a880]/20 transition-colors">
                    <p className="text-xs font-bold text-white leading-snug">{t.title}</p>
                    {t.dueDate && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#c5a880]">
                        <Clock size={12} /> Limite: {formatTaskDueDate(t.dueDate)}
                      </div>
                    )}
                  </div>
                ))}
                {clientTasks.filter((t) => t.status === "doing").length === 0 && (
                  <p className="text-center py-6 text-xs text-zinc-600 italic">Sem tarefas em execução.</p>
                )}
              </div>
            </div>

            {/* Column 3: Completed / Done */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Concluído & Aprovado ({clientTasks.filter((t) => t.status === "done").length})
                </span>
              </div>
              <div className="space-y-3">
                {clientTasks.filter((t) => t.status === "done").map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-[#050505] border border-emerald-500/10 text-zinc-500">
                    <p className="text-xs font-semibold line-through leading-snug text-zinc-500">{t.title}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-500">
                      <CheckCircle2 size={12} /> Pronto para Publicação / Produção
                    </div>
                  </div>
                ))}
                {clientTasks.filter((t) => t.status === "done").length === 0 && (
                  <p className="text-center py-6 text-xs text-zinc-600 italic">Nenhum item concluído ainda.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Tab Content */}
      {activeClientTab === "finance" && (
        <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Status Financeiro & Faturas</h3>
              <p className="text-xs text-zinc-400 mt-1">Veja seu histórico de mensalidades, contratos e faturas pendentes da agência.</p>
            </div>
            <div className="bg-[#050505] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 self-start sm:self-center shrink-0">
              <span className="text-xs text-zinc-500 font-semibold">Mensalidade Atual:</span>
              <span className="text-sm font-black text-[#c5a880]">
                R$ {currentClient.planValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-[#050505] rounded-xl overflow-hidden border border-white/5">
            <div className="p-4 border-b border-white/5 bg-[#0b0b0c] flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Histórico de Mensalidades</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Vencimento: {currentClient.dueDate ? `Dia ${formatClientDueDate(currentClient.dueDate)}` : "-"}</span>
            </div>

            {clientTransactions.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <DollarSign size={28} className="text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-500">Nenhuma fatura registrada no sistema para este cliente.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {clientTransactions
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t) => (
                    <div key={t.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{t.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">{t.date.split("-").reverse().join("/")} • Categoria: {t.category}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <span className="text-xs font-black text-white font-mono">
                          R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        {t.status === "pago" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            <CheckCircle2 size={10} /> Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[#c5a880]/10 text-[#c5a880] text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            <Clock size={10} /> Aberto
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab Content */}
      {activeClientTab === "calendar" && (
        <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Cronograma do Projeto</h3>
            <p className="text-xs text-zinc-400 mt-1">Confira seu cronograma integrado de postagens nas mídias sociais, reuniões com a agência e entregas criativas.</p>
          </div>

          {clientEvents.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center">
              <Calendar size={32} className="text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500">Sem compromissos agendados no momento.</p>
            </div>
          ) : (
            <div className="relative border-l border-white/10 pl-6 space-y-6 ml-3">
              {clientEvents
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((ev) => (
                  <div key={ev.id} className="relative">
                    {/* Timeline Node Bullet */}
                    <div
                      className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-zinc-900 shadow-md ${
                        ev.type === "reuniao"
                          ? "bg-[#c5a880]"
                          : ev.type === "post"
                          ? "bg-violet-500"
                          : "bg-rose-500"
                      }`}
                    />

                    <div className="p-4 rounded-xl bg-[#050505] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#c5a880] font-mono">
                            {ev.date.split("-").reverse().join("/")} às {ev.time}
                          </span>
                          <span className="text-[10px] text-zinc-500">•</span>
                          <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {ev.type === "reuniao" ? "Reunião" : ev.type === "post" ? "Postagem" : "Entrega Criativa"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{ev.title}</h4>
                        {ev.description && (
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{ev.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Notes & Briefings Tab Content */}
      {activeClientTab === "notes" && (
        <div className="space-y-6">
          <div className="bg-[#0b0b0c] border border-white/5 rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]">
            <h3 className="text-lg font-bold text-white">Relatórios, Briefings & Copys</h3>
            <p className="text-xs text-zinc-400 mt-1">Notas técnicas, roteiros, ideias de conteúdo e textos aprovados criados pela agência para você.</p>
          </div>

          {clientNotes.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center bg-[#0b0b0c]">
              <FileText size={32} className="text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500">Nenhum briefing ou relatório compartilhado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="bg-[#0b0b0c] border border-white/5 hover:border-[#c5a880]/20 rounded-xl p-5 cursor-pointer flex flex-col justify-between h-52 group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase bg-[#c5a880]/10 text-[#c5a880] px-2.5 py-0.5 rounded-full border border-[#c5a880]/10">
                        {note.type || "Briefing"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {note.date.split("-").reverse().join("/")}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#c5a880] line-clamp-1 transition-colors">
                      {note.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-4 leading-normal">
                      {note.content}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#c5a880] flex items-center gap-1 mt-3 group-hover:underline">
                    Ver Completo <ExternalLink size={10} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Note Viewer Modal */}
          {selectedNote && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0b0b0c] border border-white/10 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
              >
                <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-[#c5a880]/10 text-[#c5a880] px-2.5 py-0.5 rounded-full border border-[#c5a880]/10">
                      {selectedNote.type || "Briefing"}
                    </span>
                    <h3 className="text-lg font-black text-white mt-2">{selectedNote.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">Data de compartilhamento: {selectedNote.date.split("-").reverse().join("/")}</p>
                  </div>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </div>
                <div className="flex-1 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed py-2">
                  {selectedNote.content}
                </div>
                <div className="border-t border-white/5 pt-4 mt-4 flex justify-end">
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Fechar Briefing
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
