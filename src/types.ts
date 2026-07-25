export type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  client: string;
  hasDeadline?: boolean;
  dueDate?: string;
};

export type Client = {
  id: number;
  name: string;
  niche: string;
  status: "Ativo" | "Inativo" | "Prospecção";
  contact: string;
  plan?: string;
  planDetails?: string;
  paymentType?: "Mensal" | "Projeto" | "Sob Demanda";
  planValue: number;
  dueDate: string;
  paymentStatus: "Em dia" | "Atrasado" | "Pendente";
  startDate?: string;
  notes?: string;
  avatarUrl?: string;
};

export type Transaction = {
  id: number;
  description: string;
  type: "receita" | "despesa";
  amount: number;
  date: string;
  category: string;
  status: "pago" | "pendente";
  client?: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  clientName: string;
  description?: string;
  type: "post" | "reuniao" | "entrega";
};

export type NotificationItem = {
  id: number;
  message: string;
  date: string;
  read: boolean;
  type: "warning" | "info" | "success";
};

export type SavedNote = {
  id: number;
  clientName: string;
  title: string;
  content: string;
  date: string;
  type: string;
};
