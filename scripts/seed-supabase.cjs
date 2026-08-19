const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dvpnwzinajfqxmfylkiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cG53emluYWpmcXhtZnlsa2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTA0NzIsImV4cCI6MjA5ODQ4NjQ3Mn0.zyRm4dkQmthVvnKdg0fLT9KNm0pdHDqivbYRvxaO2hI'
);

// Dados reais extraídos do Supabase
const clients = [
  {
    id: 999,
    name: "Equipe Zion / Geral",
    niche: "Marketing & Agência",
    status: "Ativo",
    contact: "Geral",
    planValue: 0,
    dueDate: "01",
    paymentStatus: "Em dia"
  },
  {
    id: 1,
    name: "SISPUMUMC",
    niche: "Associação / Sindicato",
    status: "Ativo",
    contact: "Coordenação",
    plan: "Premium (R$ 829/mês)",
    planValue: 829,
    dueDate: "10",
    paymentStatus: "Em dia"
  },
  {
    id: 2,
    name: "TV Chapada",
    niche: "Comunicação / TV",
    status: "Ativo",
    contact: "Direção",
    plan: "Premium (R$ 1.000/mês)",
    planValue: 1000,
    dueDate: "05",
    paymentStatus: "Em dia"
  },
  {
    id: 3,
    name: "Esfiha's House",
    niche: "Alimentação",
    status: "Ativo",
    contact: "Proprietário",
    plan: "Premium",
    planValue: 500,
    dueDate: "15",
    paymentStatus: "Em dia",
    bancoDeDadosIA: "[INFORMAÇÕES & MÉTODO REGISTRADOS EM 27/07/2026]:\npreciso criar 4 roteiros de videos reels de ate 60s. vou gravar dois com Pâmela e dois com Leticia. a esfihas house tem duas mas o instgram e o mesmo, uma fica em frente ao banco do brasil e o outro em frente a prefeitura. na em frente a prefeitura ele quer divulgar Esfihas, combos e pastéis. na outra quer divulgar sorvete, tapioca e cuscuz\n\nFica em Morro do Chapéu - Ba. Não tem concorrentes de esfihas"
  }
];

const tasks = [
  {
    id: 2,
    title: "Editar Programa Saúde da Gente",
    client: "TV Chapada",
    clientName: "TV Chapada",
    status: "done",
    dueDate: "2026-07-22",
    hasDeadline: false
  },
  {
    id: 3,
    title: "Gravar Vídeo Esfiha's House",
    client: "Esfiha's House",
    clientName: "Esfiha's House",
    status: "done",
    dueDate: "2026-07-27",
    hasDeadline: true
  },
  {
    id: 4,
    title: "Criar Roteiros de Reels",
    client: "Esfiha's House",
    clientName: "Esfiha's House",
    status: "done",
    dueDate: "2026-07-25",
    hasDeadline: true
  },
  {
    id: 5,
    title: "Editar 4 Vídeos Esfihas House",
    client: "Esfiha's House",
    clientName: "Esfiha's House",
    status: "done",
    dueDate: "2026-07-29",
    hasDeadline: false
  }
];

const transactions = [
  {
    id: 1,
    date: "2026-08-05",
    type: "receita",
    amount: 875,
    client: "TV Chapada",
    status: "pendente",
    category: "Serviços Avulsos",
    description: "Campeonato Municipal 2026"
  },
  // Mensalidades recorrentes dos clientes ativos
  {
    id: 10,
    date: "2026-08-01",
    type: "receita",
    amount: 829,
    client: "SISPUMUMC",
    status: "pendente",
    category: "Mensalidade",
    description: "Mensalidade Agosto/2026 - SISPUMUMC"
  },
  {
    id: 11,
    date: "2026-08-05",
    type: "receita",
    amount: 1000,
    client: "TV Chapada",
    status: "pendente",
    category: "Mensalidade",
    description: "Mensalidade Agosto/2026 - TV Chapada"
  },
  {
    id: 12,
    date: "2026-08-15",
    type: "receita",
    amount: 500,
    client: "Esfiha's House",
    status: "pendente",
    category: "Mensalidade",
    description: "Mensalidade Agosto/2026 - Esfiha's House"
  },
  // Julho pago
  {
    id: 20,
    date: "2026-07-01",
    type: "receita",
    amount: 829,
    client: "SISPUMUMC",
    status: "pago",
    category: "Mensalidade",
    description: "Mensalidade Julho/2026 - SISPUMUMC"
  },
  {
    id: 21,
    date: "2026-07-05",
    type: "receita",
    amount: 1000,
    client: "TV Chapada",
    status: "pago",
    category: "Mensalidade",
    description: "Mensalidade Julho/2026 - TV Chapada"
  },
  {
    id: 22,
    date: "2026-07-15",
    type: "receita",
    amount: 500,
    client: "Esfiha's House",
    status: "pago",
    category: "Mensalidade",
    description: "Mensalidade Julho/2026 - Esfiha's House"
  }
];

const myProfile = {
  name: "Equipe Zion",
  role: "Agência Digital",
  avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
  whatsappSettings: {
    ownerNumber: "7499786214",
    authorizedNumbers: "",
    respondOnlyToOwner: true
  }
};

async function run() {
  console.log("Lendo dados atuais do Supabase...");
  const { data: existing, error: readErr } = await supabase
    .from('users')
    .select('data')
    .eq('id', 'ZION-MASTER')
    .maybeSingle();

  if (readErr) {
    console.error("Erro ao ler:", readErr);
    return;
  }

  const currentData = existing?.data || {};
  console.log("Clientes atuais:", (currentData.clients || []).length);
  console.log("Transações atuais:", (currentData.transactions || []).length);

  // Merge: keep existing data, overwrite clients/tasks/transactions/myProfile
  const updatedData = {
    ...currentData,
    userId: "ZION-MASTER",
    updatedAt: new Date().toISOString(),
    clients,
    tasks,
    transactions,
    myProfile,
    calendarEvents: currentData.calendarEvents || [],
    notifications: currentData.notifications || [],
    savedNotes: currentData.savedNotes || [],
    logoRefs: currentData.logoRefs || [],
    savedCards: currentData.savedCards || [],
    messages: currentData.messages || [],
    transactionCategories: currentData.transactionCategories || [
      "Mensalidade", "Serviços Avulsos", "Tráfego Pago", "Ferramentas", "Despesas Gerais"
    ]
  };

  console.log("\nGravando dados atualizados no Supabase...");
  const { error: writeErr } = await supabase
    .from('users')
    .upsert({
      id: 'ZION-MASTER',
      updated_at: new Date().toISOString(),
      data: updatedData
    });

  if (writeErr) {
    console.error("Erro ao gravar:", writeErr);
    return;
  }

  console.log("✅ Dados gravados com sucesso!");
  console.log("  Clientes:", clients.length);
  console.log("  Tarefas:", tasks.length);
  console.log("  Transações:", transactions.length);
  console.log("  Perfil:", myProfile.name);
}

run();
