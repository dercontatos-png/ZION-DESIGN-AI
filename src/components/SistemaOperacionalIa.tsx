import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Brain,
  FileText,
  Sparkles,
  Bot,
  Mic,
  MicOff,
  Upload,
  Play,
  CheckCircle2,
  Check,
  Copy,
  Download,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Users,
  Target,
  Send,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Folder,
  DollarSign,
  TrendingUp,
  Cpu,
  Workflow,
  Zap,
  BookOpen,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Calculator,
  Flame,
  CheckSquare
} from "lucide-react";
import { Client, Task } from "../types";
import { safeStorageSetItem } from "../utils/imageStorageManager";

interface SistemaOperacionalIaProps {
  customApiKey?: string;
  myProfile?: any;
  clients?: Client[];
  setClients?: React.Dispatch<React.SetStateAction<Client[]>>;
  tasks?: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  saveToFirestoreDirectly?: (data: any) => void;
  showToast?: (msg: string, type: "success" | "error" | "warning") => void;
}

export interface DocumentoMaestroData {
  id: string;
  nomeCampanha: string;
  status: "Rascunho" | "Ativo" | "Em Lançamento" | "Finalizado";
  negocio: {
    nome: string;
    nicho: string;
    avatarIcp: string;
    propostaValor: string;
    ticketPadrao: string;
  };
  upgrade: {
    produtoBase: string;
    produtoUpgrade: string;
    valorBase: string;
    valorUpgrade: string;
    valorTransicao: string;
    bonusExclusivos: string;
    ganchoPrincipal: string;
  };
  errosFatais: string[];
  bibliotecaNegocios: {
    nome: string;
    descricao: string;
    status: string;
    repo: string;
  }[];
  regrasDeterministicas: string;
  contextoPronto: string;
}

const DEFAULT_DOCUMENTO_MAESTRO: DocumentoMaestroData = {
  id: "maestro_master_1",
  nomeCampanha: "Campanha de Upgrade — Alunos Base 2026",
  status: "Ativo",
  negocio: {
    nome: "Builder Academy & Zion Design AI",
    nicho: "Educação em Tecnologia, IA & Design de Alta Conversão",
    avatarIcp: "Designers, donos de agência e empreendedores digitais que já utilizam as ferramentas base e querem escalar suas entregas com IA determinística e sistemas operacionais próprios.",
    propostaValor: "Construir um segundo cérebro empresarial com IA que transforma reuniões em tarefas automáticas, orquestra agentes de copy e gera criativos em 4K sem retrabalho.",
    ticketPadrao: "R$ 1.997,00"
  },
  upgrade: {
    produtoBase: "Easy Builder / Curso Introdutório",
    produtoUpgrade: "Design Builder Pro + Sistema Operacional IA",
    valorBase: "R$ 497,00",
    valorUpgrade: "R$ 1.997,00",
    valorTransicao: "R$ 997,00 (Desconto de R$ 1.000 para alunos da base)",
    bonusExclusivos: "1. Repositório Maestro Completo clonável\n2. Copiloto Jack configurado para CRM\n3. Agente de Atas Automáticas Whisper integrado",
    ganchoPrincipal: "Você já domina a base. Agora é a hora de transformar seu conhecimento em um sistema empresarial ciborgue onde a IA trabalha com você."
  },
  errosFatais: [
    "1. Delegar o pensamento cegamente para a IA sem dar contexto determinístico (gera respostas genéricas e alucinações).",
    "2. Não ter um Documento Maestro centralizado (cada membro da equipe dá comandos soltos e perde o alinhamento).",
    "3. Fazer reuniões longas sem automação de ata e tarefas (as decisões se perdem e não viram ação no ClickUp/CRM)."
  ],
  bibliotecaNegocios: [
    { nome: "Easy Builder", descricao: "Construtor de páginas e esteiras rápidas para iniciantes.", status: "Ativo", repo: "easy-builder-repo" },
    { nome: "Design Builder", descricao: "Estúdio de design e geração de criativos 4K com inteligência artificial.", status: "Ativo", repo: "design-builder-v2" },
    { nome: "Builder Academy", descricao: "Hub educacional com imersões práticas e treinamentos de IA.", status: "Em Lançamento", repo: "academy-core" }
  ],
  regrasDeterministicas: "1. Sempre responder em Português do Brasil com tom direto, profissional e consultivo.\n2. Nunca inventar promessas financeiras surreais; basear-se em eficiência de processos e aumento de entregas.\n3. Preservar rigorosamente as regras de preços e bônus estipulados no Documento Maestro.\n4. Todo roteiro ou copy deve atacar o erro fatal correspondente e apresentar a solução prática.",
  contextoPronto: ""
};

export const SistemaOperacionalIa: React.FC<SistemaOperacionalIaProps> = ({
  customApiKey,
  myProfile,
  clients = [],
  setClients,
  tasks = [],
  setTasks,
  saveToFirestoreDirectly,
  showToast = (msg) => console.log(msg)
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "maestro" | "copychief" | "reuniao" | "notebook" | "copiloto_jack" | "ciborgue"
  >("maestro");

  // Documento Maestro State
  const [maestro, setMaestro] = useState<DocumentoMaestroData>(() => {
    try {
      const saved = localStorage.getItem("zion_documento_maestro");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DOCUMENTO_MAESTRO;
  });

  const [isGeneratingMaestro, setIsGeneratingMaestro] = useState(false);
  const [maestroPromptInput, setMaestroPromptInput] = useState("");
  const [copiedMaestro, setCopiedMaestro] = useState(false);

  // Copy Chief State
  const [selectedAgent, setSelectedAgent] = useState<
    "upgrade_playbook" | "vsl_lp" | "ads_creatives" | "objecoes_breaker" | "email_whatsapp"
  >("upgrade_playbook");
  const [copyTom, setCopyTom] = useState<"Consultivo" | "Direto & Agressivo" | "Storytelling" | "Urgência & Escassez">("Consultivo");
  const [copyNivelConsciencia, setCopyNivelConsciencia] = useState("Nível 4 - Consciente do Produto (Quer Upgrade)");
  const [copyCustomPrompt, setCopyCustomPrompt] = useState("");
  const [copyOutput, setCopyOutput] = useState("");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [copiedCopy, setCopiedCopy] = useState(false);

  // Reunião ➔ Ação State
  const [meetingInputType, setMeetingInputType] = useState<"transcript" | "audio">("transcript");
  const [meetingTranscriptText, setMeetingTranscriptText] = useState(
    `(0:00 - 0:33): Sentei com os 2 vendedores da equipe comercial para alinhar a campanha de upgrade dos alunos.\n(0:33 - 1:15): Definimos o Documento Maestro como cérebro da campanha e revisamos os 3 erros que matam a venda.\n(1:15 - 1:48): Vamos espelhar as tarefas no ClickUp e deixar o NotebookLM pronto para o time de vendas estudar.\n(15:36 - 20:24): O Jack precisa dar o script de contorno de objeção em tempo real para os 3 vendedores.`
  );
  const [isTranscribingMeeting, setIsTranscribingMeeting] = useState(false);
  const [isRecordingMeeting, setIsRecordingMeeting] = useState(false);
  const [meetingResult, setMeetingResult] = useState<{
    ataExecutiva: string;
    decisoesTomadas: string[];
    tarefasExtraidas: { title: string; client: string; priority: string; dueDate: string }[];
    pontosAtencao: string[];
  } | null>(null);
  const [isProcessingMeeting, setIsProcessingMeeting] = useState(false);

  // NotebookLM Base de Conhecimento State
  const [notebookDocs, setNotebookDocs] = useState<
    { id: string; titulo: string; categoria: string; conteudo: string; data: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem("zion_notebook_docs");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "doc_1",
        titulo: "Manual de Upgrade para Vendedores",
        categoria: "Comercial",
        conteudo: "Regra de ouro: O aluno já confia no nosso método. O foco não é vender do zero, mas mostrar o abismo de tempo e esforço entre ficar no plano manual vs ter o Sistema Operacional com IA determinística.",
        data: "2026-09-01"
      },
      {
        id: "doc_2",
        titulo: "Os 3 Erros que Matam a Venda de IA",
        categoria: "Estratégia",
        conteudo: "Erro 1: Não saber a diferença entre IA generativa solta e IA determinística com contexto.\nErro 2: Vender recurso técnico em vez de tempo economizado e lucro gerado.\nErro 3: Não ter esteira de produtos conectada.",
        data: "2026-09-01"
      },
      {
        id: "doc_3",
        titulo: "Regras de Pessoas e Workspace (10 Membros)",
        categoria: "Gestão",
        conteudo: "A equipe é dividida em 3 vendedores no comercial (1 focado na base interna), 4 produtores de design/conteúdo e 3 desenvolvedores/gestores. Todas as decisões saem de reuniões transcritas e viram tarefas no ClickUp.",
        data: "2026-09-01"
      }
    ];
  });
  const [notebookNewTitle, setNotebookNewTitle] = useState("");
  const [notebookNewCategory, setNotebookNewCategory] = useState("Comercial");
  const [notebookNewContent, setNotebookNewContent] = useState("");
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [notebookChatMessages, setNotebookChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Olá! Sou o assistente de estudo da base de conhecimento (estilo NotebookLM). Pode me fazer perguntas sobre o Manual de Upgrade, Regras de Pessoas, Produtos ou Objeções do time."
    }
  ]);
  const [notebookQuestion, setNotebookQuestion] = useState("");
  const [isNotebookSearching, setIsNotebookSearching] = useState(false);

  // Copiloto CRM Jack State
  const [jackLeadType, setJackLeadType] = useState<"aluno_base" | "lead_frio" | "lead_indeciso" | "lead_sem_limite">("aluno_base");
  const [jackLeadName, setJackLeadName] = useState("Carlos Silva");
  const [jackCursoAtual, setJackCursoAtual] = useState("Easy Builder");
  const [jackValorPago, setJackValorPago] = useState("497");
  const [jackValorNovoPlano, setJackValorNovoPlano] = useState("1997");
  const [jackSelectedObjecao, setJackSelectedObjecao] = useState<string | null>(null);
  const [jackScriptGerado, setJackScriptGerado] = useState("");
  const [isJackGenerating, setIsJackGenerating] = useState(false);

  // Salvar Documento Maestro localmente
  useEffect(() => {
    try {
      safeStorageSetItem("zion_documento_maestro", JSON.stringify(maestro));
    } catch (e) {}
  }, [maestro]);

  // Salvar Notebook Docs localmente
  useEffect(() => {
    try {
      safeStorageSetItem("zion_notebook_docs", JSON.stringify(notebookDocs));
    } catch (e) {}
  }, [notebookDocs]);

  // Gerar contexto mestre compilado
  const buildCompiledContext = () => {
    return `# DOCUMENTO MAESTRO — ${maestro.nomeCampanha.toUpperCase()}
Status: ${maestro.status}

## 1. DADOS DO NEGÓCIO & ECOSSISTEMA
- Negócio Principal: ${maestro.negocio.nome}
- Nicho de Atuação: ${maestro.negocio.nicho}
- Público-Alvo / Avatar ICP: ${maestro.negocio.avatarIcp}
- Proposta de Valor Única: ${maestro.negocio.propostaValor}
- Ticket Médio Padrão: ${maestro.negocio.ticketPadrao}

## 2. MECÂNICA DE UPGRADE (ALUNOS & BASE INTERNA)
- Produto de Origem: ${maestro.upgrade.produtoBase} (Investido: ${maestro.upgrade.valorBase})
- Produto de Upgrade: ${maestro.upgrade.produtoUpgrade} (Valor Cheio: ${maestro.upgrade.valorUpgrade})
- Condição Especial de Transição: ${maestro.upgrade.valorTransicao}
- Gancho Principal de Upgrade: "${maestro.upgrade.ganchoPrincipal}"
- Bônus Exclusivos de Transição:
${maestro.upgrade.bonusExclusivos}

## 3. OS 3 ERROS FATAIS QUE O PRODUTO RESOLVE
${maestro.errosFatais.join("\n")}

## 4. BIBLIOTECA DE NEGÓCIOS & REPOSITÓRIOS
${maestro.bibliotecaNegocios.map((b) => `- ${b.nome} (${b.status}): ${b.descricao} [Repo: ${b.repo}]`).join("\n")}

## 5. REGRAS DETERMINÍSTICAS PARA AGENTES DE IA
${maestro.regrasDeterministicas}`;
  };

  const handleCopyMaestroContext = () => {
    const context = buildCompiledContext();
    navigator.clipboard.writeText(context);
    setCopiedMaestro(true);
    showToast("Documento Maestro compilado e copiado para a área de transferência!", "success");
    setTimeout(() => setCopiedMaestro(false), 2500);
  };

  // Gerador Automático de Documento Maestro por IA
  const handleGenerateMaestroByAi = async () => {
    if (!maestroPromptInput.trim()) {
      showToast("Insira uma descrição básica do seu negócio ou lançamento para a IA gerar o Maestro.", "warning");
      return;
    }

    setIsGeneratingMaestro(true);
    try {
      const prompt = `Você é um Arquiteto de Sistemas de IA e Copy Chief especialista em criação de 'Documentos Maestro' empresariais para lançamentos, esteiras de produtos e campanhas de upgrade.
O usuário forneceu a seguinte ideia/resumo do negócio:
"${maestroPromptInput.trim()}"

Crie uma estrutura completa de Documento Maestro no formato JSON estrito (sem markdown em volta do JSON, apenas JSON puro).
A estrutura JSON deve conter exatamente:
{
  "nomeCampanha": "string",
  "status": "Ativo",
  "negocio": {
    "nome": "string",
    "nicho": "string",
    "avatarIcp": "string detalhada",
    "propostaValor": "string clara e persuasiva",
    "ticketPadrao": "string (ex: R$ 1.997,00)"
  },
  "upgrade": {
    "produtoBase": "string",
    "produtoUpgrade": "string",
    "valorBase": "string",
    "valorUpgrade": "string",
    "valorTransicao": "string",
    "bonusExclusivos": "string com 3 itens",
    "ganchoPrincipal": "string"
  },
  "errosFatais": [
    "1. ...",
    "2. ...",
    "3. ..."
  ],
  "bibliotecaNegocios": [
    { "nome": "Produto 1", "descricao": "...", "status": "Ativo", "repo": "..." },
    { "nome": "Produto 2", "descricao": "...", "status": "Ativo", "repo": "..." }
  ],
  "regrasDeterministicas": "string com 4 diretrizes claras"
}`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "Responda APENAS com JSON válido sem texto adicional.",
          customApiKey
        })
      });

      if (!res.ok) throw new Error("Erro na chamada de IA.");
      const data = await res.json();
      let text = data.response || "";
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      const parsed = JSON.parse(text);
      setMaestro({
        id: `maestro_${Date.now()}`,
        ...parsed,
        contextoPronto: ""
      });
      setMaestroPromptInput("");
      showToast("Documento Maestro estruturado com sucesso pela IA!", "success");
    } catch (e: any) {
      console.error(e);
      showToast("Não foi possível gerar automaticamente. Verifique os dados ou a conexão com a IA.", "error");
    } finally {
      setIsGeneratingMaestro(false);
    }
  };

  // Gerador do Copy Chief orientado pelo Maestro
  const handleGenerateCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const compiledContext = buildCompiledContext();
      let agentInstruction = "";

      if (selectedAgent === "upgrade_playbook") {
        agentInstruction = `Você é o Copy Chief e Estrategista Comercial. Sua missão é criar um PLAYBOOK COMERCIAL COMPLETO para o time de vendedores realizarem UPGRADE de alunos da base interna.
Estruture o playbook em:
1. PITCH DE ABORDAGEM NO WHATSAPP (3 variações: Consultiva, Oportunidade Única e Análise de Perfil).
2. SCRIPT DE FECHAMENTO EM LIGAÇÃO / ÁUDIO DE 2 MINUTOS.
3. TABELA DE CONTORNO DE OBJEÇÕES (Preço, Tempo, Já tenho outra ferramenta).
4. QUEBRA DE GARGALO DOS 3 ERROS FATAIS.`;
      } else if (selectedAgent === "vsl_lp") {
        agentInstruction = `Você é o Copy Chief especialista em Landing Pages e VSLs de alta conversão. Crie a ESTRUTURA COMPLETA DA PÁGINA DE VENDAS (LP) / ROTEIRO DE VSL.
Estruture em:
1. HEADLINE PRINCIPAL (Quebra de padrão) + SUB-HEADLINE.
2. GANCHO DE 5 SEGUNDOS (Hook da VSL).
3. HISTÓRIA & CONEXÃO (Apresentação do inimigo comum e dos 3 Erros).
4. MECANISMO ÚNICO DO SISTEMA OPERACIONAL COM IA.
5. EMPILHAMENTO DE OFERTA & BÔNUS DE TRANSIÇÃO.
6. CTA COM BOTÃO DE AÇÃO CLARA.`;
      } else if (selectedAgent === "ads_creatives") {
        agentInstruction = `Você é o Diretor Criativo e Copywriter de Anúncios. Crie 3 ROTEIROS DE VÍDEO CURTO (Reels/TikTok/Shorts de 30 a 60s) e 3 CONCEITOS DE CRIATIVO ESTÁTICO (para gerar no Zion Design Builder).
Estruture em:
- Anúncio 1: Focado na dor do erro fatal 1.
- Anúncio 2: Focado no contraste Antes vs Depois (O Ciborgue).
- Anúncio 3: Focado em Prova e Bastidores do Sistema Operacional.
Inclua para cada um: Hook visual, Texto falado, Texto na tela e CTA.`;
      } else if (selectedAgent === "objecoes_breaker") {
        agentInstruction = `Você é o Especialista em Fechamento de Vendas e Negociação. Crie o MATADOR DE OBJEÇÕES BLINDADO para os vendedores usarem no WhatsApp e Telefone.
Cubra as objeções:
1. "Não tenho dinheiro / Tá caro"
2. "Não tenho tempo para aprender mais uma coisa agora"
3. "Preciso conversar com meu sócio / esposa"
4. "Eu já uso ChatGPT / Gemini grátis, por que preciso disso?"
5. "E se eu não conseguir aplicar na minha equipe?"
Para cada objeção, forneça a resposta exata palavra por palavra que o vendedor deve enviar.`;
      } else {
        agentInstruction = `Você é o Estrategista de Lançamentos. Crie a SEQUÊNCIA DE 4 MENSAGENS DE DISPARO (WhatsApp & E-mail) para a Campanha de Upgrade.
Mensagem 1: Aquecimento & Revelação do Bastidor (Apresentando o Documento Maestro).
Mensagem 2: Abertura das Vagas de Upgrade com Condição Especial.
Mensagem 3: Quebra de Objeção & Prova do Sistema.
Mensagem 4: Últimas Horas / Encerramento do Desconto de R$ 1.000.`;
      }

      const prompt = `CONTEXTO DO DOCUMENTO MAESTRO ATIVO:
${compiledContext}

DIRETRIZES DO COPY CHIEF:
- Tom de Voz Selecionado: ${copyTom}
- Nível de Consciência do Público: ${copyNivelConsciencia}
${copyCustomPrompt ? `- Instruções Adicionais do Usuário: "${copyCustomPrompt}"` : ""}

MISSÃO:
${agentInstruction}

REGRAS:
- Seja extremamente prático, persuasivo e rico em detalhes.
- Formate a saída em Markdown limpo e bem organizado.
- Mantenha total fidelidade aos valores, produtos e erros informados no Documento Maestro.`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "Você é um Copy Chief sênior de classe mundial.",
          customApiKey
        })
      });

      if (!res.ok) throw new Error("Erro ao gerar copy.");
      const data = await res.json();
      setCopyOutput(data.response || "Nenhuma resposta gerada.");
      showToast("Copy gerada com sucesso pelo Copy Chief!", "success");
    } catch (e: any) {
      console.error(e);
      showToast("Erro ao gerar copy. Tente novamente.", "error");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // Processador de Reunião ➔ Ação Automática
  const handleProcessMeeting = async () => {
    if (!meetingTranscriptText.trim()) {
      showToast("Insira ou grave a transcrição da reunião para processar.", "warning");
      return;
    }

    setIsProcessingMeeting(true);
    try {
      const prompt = `Você é um Gerente de Operações e Secretário Executivo com IA. Sua missão é analisar a seguinte transcrição de reunião da equipe e transformá-la em AÇÕES DIRETAS E AUTOMÁTICAS.

TRANSCRIÇÃO DA REUNIÃO:
"${meetingTranscriptText.trim()}"

Gere a resposta rigorosamente no seguinte formato JSON estrito:
{
  "ataExecutiva": "Resumo executivo em 1 parágrafo dos temas centrais discutidos.",
  "decisoesTomadas": [
    "Decisão 1 batida o martelo",
    "Decisão 2 batida o martelo"
  ],
  "pontosAtencao": [
    "Alerta ou risco 1 identificado",
    "Ponto de atenção comercial 2"
  ],
  "tarefasExtraidas": [
    {
      "title": "Ação clara e objetiva",
      "client": "Equipe Interna / Lançamento",
      "priority": "Alta",
      "dueDate": "2026-09-05"
    }
  ]
}`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "Responda APENAS com JSON válido sem texto adicional.",
          customApiKey
        })
      });

      if (!res.ok) throw new Error("Erro ao processar reunião.");
      const data = await res.json();
      let text = data.response || "";
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      const parsed = JSON.parse(text);
      setMeetingResult(parsed);
      showToast("Reunião analisada! Ata e tarefas geradas com sucesso.", "success");
    } catch (e: any) {
      console.error(e);
      showToast("Erro ao processar transcrição da reunião.", "error");
    } finally {
      setIsProcessingMeeting(false);
    }
  };

  // Exportar Tarefas Extraídas para a lista de tarefas do Zion / ClickUp
  const handleExportTasksToZion = () => {
    if (!meetingResult || !meetingResult.tarefasExtraidas.length) return;

    const newTasks: Task[] = meetingResult.tarefasExtraidas.map((t, idx) => ({
      id: Date.now() + idx,
      title: t.title,
      description: `Gerado automaticamente da reunião. Prioridade: ${t.priority}`,
      status: "todo",
      client: t.client || "Equipe Comercial",
      hasDeadline: !!t.dueDate,
      dueDate: t.dueDate || new Date().toISOString().split("T")[0]
    }));

    if (setTasks) {
      setTasks((prev) => [...newTasks, ...prev]);
    }
    if (saveToFirestoreDirectly) {
      saveToFirestoreDirectly({ tasks: [...newTasks, ...tasks] });
    }

    showToast(`${newTasks.length} tarefas criadas e integradas ao painel de tarefas do Zion!`, "success");
  };

  // Chat com a Base de Conhecimento (NotebookLM)
  const handleAskNotebook = async () => {
    if (!notebookQuestion.trim()) return;

    const userMsg = notebookQuestion.trim();
    setNotebookChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setNotebookQuestion("");
    setIsNotebookSearching(true);

    try {
      const docsContext = notebookDocs
        .map((d, i) => `[FONTE ${i + 1}: ${d.titulo} (${d.categoria})]\n${d.conteudo}`)
        .join("\n\n");

      const compiledMaestro = buildCompiledContext();

      const prompt = `Você é o Assistente Especialista da Base de Conhecimento e Treinamento do time (estilo NotebookLM).
Sua missão é responder à dúvida do usuário baseando-se EXCLUSIVAMENTE nas fontes de documentos fornecidas e no Documento Maestro.

BASE DE DOCUMENTOS:
${docsContext}

CONTEXTO DO DOCUMENTO MAESTRO:
${compiledMaestro}

PERGUNTA DO VENDEDOR / USUÁRIO:
"${userMsg}"

REGRAS:
1. Responda de forma clara, didática e direta.
2. Sempre cite em qual fonte você se baseou (ex: "De acordo com o Manual de Upgrade..." ou "Conforme o Documento Maestro...").
3. Se a informação não constar nos documentos, alerte honestamente e sugira o alinhamento com a coordenação.`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "Você é um assistente RAG de base de conhecimento empresarial.",
          customApiKey
        })
      });

      if (!res.ok) throw new Error("Erro na consulta.");
      const data = await res.json();
      setNotebookChatMessages((prev) => [
        ...prev,
        { role: "ai", text: data.response || "Não foi possível encontrar a resposta." }
      ]);
    } catch (e: any) {
      console.error(e);
      setNotebookChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Erro ao consultar a base de conhecimento. Tente novamente." }
      ]);
    } finally {
      setIsNotebookSearching(false);
    }
  };

  // Adicionar novo documento à base
  const handleAddNotebookDoc = () => {
    if (!notebookNewTitle.trim() || !notebookNewContent.trim()) {
      showToast("Preencha o título e o conteúdo do documento.", "warning");
      return;
    }

    const newDoc = {
      id: `doc_${Date.now()}`,
      titulo: notebookNewTitle.trim(),
      categoria: notebookNewCategory,
      conteudo: notebookNewContent.trim(),
      data: new Date().toISOString().split("T")[0]
    };

    setNotebookDocs((prev) => [newDoc, ...prev]);
    setNotebookNewTitle("");
    setNotebookNewContent("");
    setIsAddingDoc(false);
    showToast("Documento indexado na Base de Conhecimento!", "success");
  };

  // Copiloto CRM Jack — Gerar Pitch e Resposta
  const handleGenerateJackScript = async (objecaoEspecifica?: string) => {
    setIsJackGenerating(true);
    try {
      const vPago = Number(jackValorPago) || 497;
      const vNovo = Number(jackValorNovoPlano) || 1997;
      const vDiferenca = Math.max(0, vNovo - vPago);

      const prompt = `Você é o 'Jack', o Copiloto de Vendas com IA integrado ao CRM da equipe comercial.
Você está prestando assistência em tempo real para o vendedor fechar um UPGRADE agora.

DADOS DO CLIENTE / LEAD:
- Nome do Lead: ${jackLeadName}
- Perfil do Lead: ${jackLeadType === "aluno_base" ? "Aluno da Base (já comprou)" : jackLeadType === "lead_sem_limite" ? "Lead sem limite total no cartão" : "Lead interessado"}
- Curso/Produto Atual: ${jackCursoAtual}
- Valor que já investiu: R$ ${vPago}
- Valor do Novo Plano de Upgrade: R$ ${vNovo}
- Valor Final de Transição: R$ ${vDiferenca} (Abatimento de 100% do valor já investido!)
${objecaoEspecifica ? `- Objeção Específica a Contornar Agora: "${objecaoEspecifica}"` : ""}

CONTEXTO DO DOCUMENTO MAESTRO:
- Gancho de Upgrade: "${maestro.upgrade.ganchoPrincipal}"
- Bônus: ${maestro.upgrade.bonusExclusivos}

MISSÃO DO JACK:
Gere uma mensagem pronta, empática, persuasiva e direta em formato de WhatsApp (usando formatações com asteriscos *negrito* onde couber).
A mensagem deve:
1. Chamar o lead pelo nome com cordialidade.
2. Reconhecer a jornada dele no ${jackCursoAtual}.
3. Apresentar a condição de transição como um privilégio exclusivo para ele (R$ ${vDiferenca} ou 12x no cartão).
4. Se houver objeção, quebrar o padrão com clareza.
5. Fazer uma chamada para ação (CTA) simples de fechamento.`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "Você é o Jack, o melhor copiloto de vendas do mercado.",
          customApiKey
        })
      });

      if (!res.ok) throw new Error("Erro ao gerar script do Jack.");
      const data = await res.json();
      setJackScriptGerado(data.response || "");
      showToast("Script do Copiloto Jack gerado!", "success");
    } catch (e: any) {
      console.error(e);
      showToast("Erro ao gerar script do Jack.", "error");
    } finally {
      setIsJackGenerating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-zinc-100 overflow-hidden select-none">
      
      {/* Top Header com Seletor dos 6 Módulos do Sistema Operacional */}
      <div className="p-4 sm:p-5 border-b border-violet-500/20 bg-gradient-to-r from-black via-[#0a0a0c] to-black shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-black shadow-lg shadow-violet-600/20 shrink-0">
              <Brain size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-white via-zinc-200 to-[#a855f7] bg-clip-text text-transparent">
                  Sistema Operacional IA & Documento Maestro
                </h1>
                <span className="text-[9px] bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-mono font-black uppercase">
                  Segundo Cérebro
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Orquestração determinística: Documento Maestro, Copy Chief, Transcrição de Reuniões e Copiloto CRM.
              </p>
            </div>
          </div>

          {/* Seletor de Abas estilo Pill Glow */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1 bg-[#09090b] border border-white/10 rounded-2xl shrink-0">
            {[
              { id: "maestro", label: "Doc Maestro", icon: FileText, badge: "Cérebro" },
              { id: "copychief", label: "Copy Chief", icon: Bot, badge: "Agentes" },
              { id: "reuniao", label: "Reunião ➔ Ação", icon: Mic, badge: "Whisper" },
              { id: "notebook", label: "Base de Estudo", icon: BookOpen, badge: "NotebookLM" },
              { id: "copiloto_jack", label: "Copiloto Jack", icon: Zap, badge: "CRM" },
              { id: "ciborgue", label: "O Ciborgue", icon: Cpu, badge: "Hub" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/25 font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-black" : "text-violet-400"} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? "bg-black/20 text-black font-extrabold" : "bg-violet-500/10 text-violet-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ========================================================================= */}
          {/* ABA 1: DOCUMENTO MAESTRO (O Cérebro da Campanha & Context Engine) */}
          {/* ========================================================================= */}
          {activeTab === "maestro" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Card de Boas-vindas & Ação Rápida */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d0d10] via-black to-[#0d0d10] border border-violet-500/30 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                      Documento Maestro Ativo: {maestro.nomeCampanha}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    Este documento é o cérebro central da sua campanha. Todos os agentes de copy, páginas, playbooks de venda e copilotos carregam este contexto antes de qualquer ação para garantir total consistência.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={handleCopyMaestroContext}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#a855f7] hover:bg-[#a9751e] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    {copiedMaestro ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedMaestro ? "Contexto Copiado!" : "Copiar Contexto Mestre"}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("copychief")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 cursor-pointer"
                  >
                    <Bot size={14} className="text-violet-400" />
                    <span>Enviar para Copy Chief</span>
                  </button>
                </div>
              </div>

              {/* Gerador com IA do Documento Maestro */}
              <div className="p-5 bg-[#09090b] border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-violet-400 flex items-center gap-2">
                    <Sparkles size={14} /> Gerador Automático de Documento Maestro por IA
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">1-Clique Structure Engine</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={maestroPromptInput}
                    onChange={(e) => setMaestroPromptInput(e.target.value)}
                    placeholder="Descreva seu negócio ou lançamento (ex: 'Plataforma de IA para designers vendendo upgrade de R$ 997 para quem comprou o curso de R$ 497...')"
                    className="flex-1 bg-black border border-white/10 focus:border-violet-500/60 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateMaestroByAi()}
                  />
                  <button
                    onClick={handleGenerateMaestroByAi}
                    disabled={isGeneratingMaestro}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingMaestro ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{isGeneratingMaestro ? "Gerando..." : "Estruturar com IA"}</span>
                  </button>
                </div>
              </div>

              {/* Grid com os Blocos Estruturados do Documento Maestro */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Bloco 1: Dados do Negócio & ICP */}
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Target size={15} className="text-violet-400" /> 1. Negócio, ICP & Proposta de Valor
                    </h3>
                    <span className="text-[10px] text-violet-400 font-mono font-bold">BASE</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Nome do Negócio / Campanha</label>
                      <input
                        type="text"
                        value={maestro.negocio.nome}
                        onChange={(e) => setMaestro({ ...maestro, negocio: { ...maestro.negocio, nome: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Nicho de Atuação</label>
                      <input
                        type="text"
                        value={maestro.negocio.nicho}
                        onChange={(e) => setMaestro({ ...maestro, negocio: { ...maestro.negocio, nicho: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Avatar / ICP (Público-Alvo)</label>
                      <textarea
                        rows={2}
                        value={maestro.negocio.avatarIcp}
                        onChange={(e) => setMaestro({ ...maestro, negocio: { ...maestro.negocio, avatarIcp: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Proposta de Valor Única</label>
                      <textarea
                        rows={2}
                        value={maestro.negocio.propostaValor}
                        onChange={(e) => setMaestro({ ...maestro, negocio: { ...maestro.negocio, propostaValor: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Mecânica de Upgrade & Oferta */}
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Flame size={15} className="text-violet-400" /> 2. Mecânica da Campanha de Upgrade
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">UPGRADE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Produto Base (Já Comprado)</label>
                      <input
                        type="text"
                        value={maestro.upgrade.produtoBase}
                        onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, produtoBase: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Produto do Upgrade</label>
                      <input
                        type="text"
                        value={maestro.upgrade.produtoUpgrade}
                        onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, produtoUpgrade: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Valor Base</label>
                      <input
                        type="text"
                        value={maestro.upgrade.valorBase}
                        onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, valorBase: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Valor Normal</label>
                      <input
                        type="text"
                        value={maestro.upgrade.valorUpgrade}
                        onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, valorUpgrade: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Transição Aluno</label>
                      <input
                        type="text"
                        value={maestro.upgrade.valorTransicao}
                        onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, valorTransicao: e.target.value } })}
                        className="w-full bg-[#0a0a0c] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Gancho Central de Upgrade</label>
                    <input
                      type="text"
                      value={maestro.upgrade.ganchoPrincipal}
                      onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, ganchoPrincipal: e.target.value } })}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Bônus Exclusivos de Transição</label>
                    <textarea
                      rows={2}
                      value={maestro.upgrade.bonusExclusivos}
                      onChange={(e) => setMaestro({ ...maestro, upgrade: { ...maestro.upgrade, bonusExclusivos: e.target.value } })}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* Bloco 3: Os 3 Erros Fatais & Inimigo Comum */}
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <AlertCircle size={15} className="text-red-400" /> 3. Os 3 Erros que Matam a Venda
                    </h3>
                    <span className="text-[10px] text-red-400 font-mono font-bold">GARGALOS</span>
                  </div>

                  <div className="space-y-2.5">
                    {maestro.errosFatais.map((erro, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Erro Fatal #{idx + 1}</label>
                        <textarea
                          rows={2}
                          value={erro}
                          onChange={(e) => {
                            const newErros = [...maestro.errosFatais];
                            newErros[idx] = e.target.value;
                            setMaestro({ ...maestro, errosFatais: newErros });
                          }}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-400/50 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloco 4: Biblioteca de Negócios / Repositórios */}
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <Folder size={15} className="text-violet-400" /> 4. Biblioteca de Negócios & Repositórios
                    </h3>
                    <button
                      onClick={() => {
                        const newLib = [...maestro.bibliotecaNegocios, { nome: "Novo Negócio", descricao: "Descrição breve...", status: "Ativo", repo: "repo-name" }];
                        setMaestro({ ...maestro, bibliotecaNegocios: newLib });
                      }}
                      className="text-[10px] text-violet-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} /> Adicionar Negócio
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {maestro.bibliotecaNegocios.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0a0a0c] border border-white/5 rounded-xl flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.nome}</span>
                            <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.2 rounded font-mono">{item.status}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{item.descricao}</p>
                          <span className="text-[9px] text-zinc-500 font-mono">Repo: {item.repo}</span>
                        </div>
                        <button
                          onClick={() => {
                            const newLib = maestro.bibliotecaNegocios.filter((_, i) => i !== idx);
                            setMaestro({ ...maestro, bibliotecaNegocios: newLib });
                          }}
                          className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bloco 5: Regras Determinísticas de IA */}
              <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-violet-400" /> 5. Regras Determinísticas & Tom de Voz dos Agentes
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Zero Alucinação</span>
                </div>
                <textarea
                  rows={4}
                  value={maestro.regrasDeterministicas}
                  onChange={(e) => setMaestro({ ...maestro, regrasDeterministicas: e.target.value })}
                  placeholder="Instruções fixas e rígidas para qualquer agente que executar com este contexto..."
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none font-mono"
                />
              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: COPY CHIEF (Orquestrador Multi-Agentes de IA) */}
          {/* ========================================================================= */}
          {activeTab === "copychief" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Painel Esquerdo: Seleção do Agente e Parâmetros */}
                <div className="lg:col-span-1 space-y-4">
                  
                  <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Bot size={16} className="text-violet-400" /> Seletor de Agente Especialista
                      </h3>
                      <span className="text-[10px] text-violet-400 font-mono font-bold">CHIEF</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: "upgrade_playbook", title: "Playbook Comercial & Upgrade", desc: "Scripts 1 a 1 para o comercial atacar a base de alunos." },
                        { id: "vsl_lp", title: "Estrutura de Página (LP) & VSL", desc: "Headlines, gancho de 5s, mecanismo único e empilhamento de oferta." },
                        { id: "ads_creatives", title: "Anúncios & Criativos Visuais", desc: "3 roteiros de vídeo curto + 3 briefings de criativos estáticos." },
                        { id: "objecoes_breaker", title: "Matador de Objeções Blindado", desc: "Respostas imediatas para as 5 maiores resistências de preço/tempo." },
                        { id: "email_whatsapp", title: "Sequência de Lançamento", desc: "4 mensagens de aquecimento, abertura e fechamento." }
                      ].map((ag) => (
                        <div
                          key={ag.id}
                          onClick={() => setSelectedAgent(ag.id as any)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedAgent === ag.id
                              ? "bg-violet-500/15 border-violet-500 text-white shadow-md shadow-violet-600/10"
                              : "bg-[#0a0a0c] border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{ag.title}</span>
                            {selectedAgent === ag.id && <CheckCircle2 size={13} className="text-violet-400" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{ag.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Tom de Voz</label>
                        <select
                          value={copyTom}
                          onChange={(e) => setCopyTom(e.target.value as any)}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                        >
                          <option value="Consultivo">Consultivo & Estratégico</option>
                          <option value="Direto & Agressivo">Direto & Focado em ROI</option>
                          <option value="Storytelling">Storytelling & Conexão</option>
                          <option value="Urgência & Escassez">Urgência & Vagas Limitadas</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Nível de Consciência</label>
                        <select
                          value={copyNivelConsciencia}
                          onChange={(e) => setCopyNivelConsciencia(e.target.value)}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                        >
                          <option value="Nível 4 - Consciente do Produto (Quer Upgrade)">Nível 4 - Aluno da Base (Quer Upgrade)</option>
                          <option value="Nível 3 - Consciente da Solução (Sabe que precisa de IA)">Nível 3 - Consciente da Solução</option>
                          <option value="Nível 2 - Consciente do Problema (Gargalos de tempo/vendas)">Nível 2 - Consciente do Problema</option>
                          <option value="Nível 5 - Mais Consciente (Pronto para Comprar)">Nível 5 - Mais Consciente (Oferta Direta)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Instrução Adicional (Opcional)</label>
                        <textarea
                          rows={2}
                          value={copyCustomPrompt}
                          onChange={(e) => setCopyCustomPrompt(e.target.value)}
                          placeholder="Ex: 'Enfatize que os bônus encerram hoje às 23:59...'"
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 resize-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateCopy}
                      disabled={isGeneratingCopy}
                      className="w-full py-3 bg-[#a855f7] hover:bg-[#a9751e] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isGeneratingCopy ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                      <span>{isGeneratingCopy ? "Copy Chief Redigindo..." : "Executar Agente Copy Chief"}</span>
                    </button>

                  </div>

                </div>

                {/* Painel Direito: Saída da Copy & Ações Rápidas */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-5 bg-black border border-white/10 rounded-2xl min-h-[520px] flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-ping" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">
                            Entrega do Copy Chief ({selectedAgent.replace("_", " ").toUpperCase()})
                          </h3>
                        </div>

                        {copyOutput && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(copyOutput);
                                setCopiedCopy(true);
                                showToast("Copy copiada com sucesso!", "success");
                                setTimeout(() => setCopiedCopy(false), 2000);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 rounded-lg border border-white/10 transition-all cursor-pointer"
                            >
                              {copiedCopy ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              <span>{copiedCopy ? "Copiado!" : "Copiar"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isGeneratingCopy ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center">
                          <Loader2 size={32} className="animate-spin text-violet-400" />
                          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">O Copy Chief está estruturando a entrega...</p>
                          <p className="text-[11px] text-zinc-500">Consultando o Documento Maestro e aplicando as regras determinísticas.</p>
                        </div>
                      ) : copyOutput ? (
                        <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-zinc-300 leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{copyOutput}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-center py-24 space-y-3 text-zinc-600">
                          <Bot size={40} className="mx-auto opacity-40" />
                          <p className="text-xs font-bold uppercase tracking-wider">Nenhuma copy gerada ainda</p>
                          <p className="text-[11px] max-w-sm mx-auto">Selecione o agente especialista à esquerda e clique em 'Executar Agente Copy Chief' para gerar com base no Documento Maestro.</p>
                        </div>
                      )}
                    </div>

                    {copyOutput && (
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>Alinhado ao Documento Maestro: {maestro.nomeCampanha}</span>
                        <span className="text-violet-400 font-mono font-bold">100% Determinístico</span>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: REUNIÃO ➔ AÇÃO AUTOMÁTICA (Whisper / IA Audio-to-Action) */}
          {/* ========================================================================= */}
          {activeTab === "reuniao" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Painel Esquerdo: Entrada da Reunião (Gravação / Transcrição) */}
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Mic size={16} className="text-violet-400" /> Entrada da Reunião / Whisper
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setMeetingInputType("transcript")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          meetingInputType === "transcript" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" : "bg-white/5 text-zinc-400"
                        }`}
                      >
                        Texto / Whisper
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Cole a Transcrição da Reunião (ou anotações em áudio):
                    </label>
                    <textarea
                      rows={10}
                      value={meetingTranscriptText}
                      onChange={(e) => setMeetingTranscriptText(e.target.value)}
                      placeholder="Ex: (0:00 - 0:33) Sentei com os vendedores para alinhar a campanha de upgrade... Definimos que o Jack precisa ter os scripts de contorno de objeção prontos..."
                      className="w-full bg-[#0a0a0c] border border-white/10 focus:border-violet-500/60 rounded-xl p-3 text-xs text-white focus:outline-none custom-scrollbar resize-none font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleProcessMeeting}
                      disabled={isProcessingMeeting}
                      className="flex-1 py-3 bg-[#a855f7] hover:bg-[#a9751e] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isProcessingMeeting ? <Loader2 size={15} className="animate-spin" /> : <Workflow size={15} />}
                      <span>{isProcessingMeeting ? "Extraindo Ações..." : "Processar Reunião com IA"}</span>
                    </button>
                  </div>
                </div>

                {/* Painel Direito: Ata Executiva & Tarefas Extraídas */}
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <CheckSquare size={16} className="text-emerald-400" /> Ata Executiva & Tarefas Extraídas
                    </h3>
                    {meetingResult && (
                      <button
                        onClick={handleExportTasksToZion}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Criar no Painel de Tarefas</span>
                      </button>
                    )}
                  </div>

                  {isProcessingMeeting ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center">
                      <Loader2 size={32} className="animate-spin text-violet-400" />
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Transformando conversa em ações práticas...</p>
                      <p className="text-[11px] text-zinc-500">Mapeando decisões, responsáveis e prazos de entrega.</p>
                    </div>
                  ) : meetingResult ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                      
                      {/* Ata Resumida */}
                      <div className="p-3 bg-[#0a0a0c] border border-white/5 rounded-xl space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Ata Executiva</span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{meetingResult.ataExecutiva}</p>
                      </div>

                      {/* Decisões Tomadas */}
                      <div className="p-3 bg-[#0a0a0c] border border-white/5 rounded-xl space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Decisões Batidas o Martelo</span>
                        <ul className="space-y-1">
                          {meetingResult.decisoesTomadas?.map((dec, i) => (
                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                              <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span>{dec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tarefas Extraídas */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 block">
                          Tarefas Acionáveis ({meetingResult.tarefasExtraidas?.length || 0})
                        </span>
                        {meetingResult.tarefasExtraidas?.map((task, i) => (
                          <div key={i} className="p-2.5 bg-[#0a0a0c] border border-white/5 rounded-xl flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shrink-0" />
                              <span className="text-xs font-bold text-white truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded font-mono font-bold">
                                {task.client}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono">{task.dueDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-24 space-y-3 text-zinc-600">
                      <Workflow size={40} className="mx-auto opacity-40" />
                      <p className="text-xs font-bold uppercase tracking-wider">Aguardando transcrição</p>
                      <p className="text-[11px] max-w-sm mx-auto">Insira a transcrição da reunião para que a IA extraia a ata e crie as tarefas automaticamente no sistema.</p>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* ABA 4: BASE DE ESTUDO DO TIME (NotebookLM) */}
          {/* ========================================================================= */}
          {activeTab === "notebook" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Painel Esquerdo: Lista de Documentos & Adicionar */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <BookOpen size={16} className="text-violet-400" /> Documentos Indexados ({notebookDocs.length})
                      </h3>
                      <button
                        onClick={() => setIsAddingDoc(!isAddingDoc)}
                        className="text-[10px] text-violet-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Novo Doc
                      </button>
                    </div>

                    {isAddingDoc && (
                      <div className="p-3 bg-[#0a0a0c] border border-violet-500/30 rounded-xl space-y-2.5 animate-fade-in">
                        <input
                          type="text"
                          value={notebookNewTitle}
                          onChange={(e) => setNotebookNewTitle(e.target.value)}
                          placeholder="Título do Documento..."
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        />
                        <select
                          value={notebookNewCategory}
                          onChange={(e) => setNotebookNewCategory(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="Comercial">Comercial / Vendas</option>
                          <option value="Estratégia">Estratégia & Lançamento</option>
                          <option value="Gestão">Gestão & Pessoas</option>
                          <option value="Produto">Produtos & Especificações</option>
                        </select>
                        <textarea
                          rows={3}
                          value={notebookNewContent}
                          onChange={(e) => setNotebookNewContent(e.target.value)}
                          placeholder="Conteúdo ou transcrição para o time estudar..."
                          className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsAddingDoc(false)}
                            className="px-2.5 py-1 text-[10px] text-zinc-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAddNotebookDoc}
                            className="px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-[10px] rounded-lg"
                          >
                            Salvar Doc
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                      {notebookDocs.map((doc) => (
                        <div key={doc.id} className="p-3 bg-[#0a0a0c] border border-white/5 rounded-xl space-y-1 group hover:border-violet-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">{doc.titulo}</span>
                            <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.2 rounded font-mono font-bold">{doc.categoria}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{doc.conteudo}</p>
                          <span className="text-[9px] text-zinc-500 font-mono">{doc.data}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Painel Direito: Chat RAG de Consulta Inteligente */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-5 bg-black border border-white/10 rounded-2xl h-[580px] flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">
                            Chat de Consulta & Treinamento do Time (NotebookLM)
                          </h3>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">Indexado com {notebookDocs.length} Docs</span>
                      </div>

                      {/* Mensagens do Chat */}
                      <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
                        {notebookChatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-tr-none"
                                  : "bg-[#0a0a0c] border border-white/10 text-zinc-200 rounded-tl-none prose prose-invert prose-xs"
                              }`}
                            >
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                        {isNotebookSearching && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Loader2 size={14} className="animate-spin text-violet-400" />
                            <span>Consultando os manuais e o Documento Maestro...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input do Chat */}
                    <div className="pt-3 border-t border-white/5 flex gap-2">
                      <input
                        type="text"
                        value={notebookQuestion}
                        onChange={(e) => setNotebookQuestion(e.target.value)}
                        placeholder="Faça uma pergunta sobre o manual, regras de upgrade ou objeções..."
                        className="flex-1 bg-[#0a0a0c] border border-white/10 focus:border-violet-500/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleAskNotebook()}
                      />
                      <button
                        onClick={handleAskNotebook}
                        disabled={isNotebookSearching}
                        className="px-4 py-2.5 bg-[#a855f7] hover:bg-[#a9751e] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send size={14} />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* ABA 5: COPILOTO CRM JACK (Vendas em Tempo Real) */}
          {/* ========================================================================= */}
          {activeTab === "copiloto_jack" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Painel Esquerdo: Calculadora de Upgrade & Perfil do Lead */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Calculator size={16} className="text-violet-400" /> Calculadora & Perfil de Upgrade
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">JACK</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Nome do Lead / Aluno</label>
                        <input
                          type="text"
                          value={jackLeadName}
                          onChange={(e) => setJackLeadName(e.target.value)}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Perfil do Lead</label>
                        <select
                          value={jackLeadType}
                          onChange={(e) => setJackLeadType(e.target.value as any)}
                          className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50"
                        >
                          <option value="aluno_base">Aluno da Base (Já comprou curso base)</option>
                          <option value="lead_frio">Lead Frio (Nunca comprou)</option>
                          <option value="lead_sem_limite">Sem Limite Total (Precisa de parcelamento inteligente)</option>
                          <option value="lead_indeciso">Indeciso (Precisa de prova social)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Já Investiu (R$)</label>
                          <input
                            type="number"
                            value={jackValorPago}
                            onChange={(e) => setJackValorPago(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Novo Plano (R$)</label>
                          <input
                            type="number"
                            value={jackValorNovoPlano}
                            onChange={(e) => setJackValorNovoPlano(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Display da Diferença de Upgrade */}
                      <div className="p-3.5 bg-gradient-to-r from-[#a855f7]/15 to-emerald-500/15 border border-violet-500/40 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Diferença de Upgrade:</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            R$ {(Math.max(0, Number(jackValorNovoPlano) - Number(jackValorPago))).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                          100% ABATIDO
                        </span>
                      </div>

                      {/* Botões Rápidos de Objeção */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Quebra Imediata de Objeção:</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            "Tá caro / Sem dinheiro",
                            "Sem tempo agora",
                            "Falar com sócio/cônjuge",
                            "Já uso ChatGPT grátis"
                          ].map((obj, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setJackSelectedObjecao(obj);
                                handleGenerateJackScript(obj);
                              }}
                              className="p-2 bg-[#0a0a0c] hover:bg-white/5 border border-white/5 hover:border-violet-500/40 rounded-lg text-[10px] font-bold text-zinc-300 text-left transition-all cursor-pointer"
                            >
                              {obj}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerateJackScript()}
                        disabled={isJackGenerating}
                        className="w-full py-3 bg-[#a855f7] hover:bg-[#a9751e] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isJackGenerating ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                        <span>{isJackGenerating ? "Jack Calculando Script..." : "Gerar Pitch Personalizado"}</span>
                      </button>

                    </div>

                  </div>
                </div>

                {/* Painel Direito: Script Pronto do Jack & Enviar WhatsApp */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-5 bg-black border border-white/10 rounded-2xl min-h-[520px] flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-white">
                            Script em Tempo Real do Copiloto Jack
                          </h3>
                        </div>

                        {jackScriptGerado && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(jackScriptGerado);
                                showToast("Script copiado para a área de transferência!", "success");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 rounded-lg border border-white/10 transition-all cursor-pointer"
                            >
                              <Copy size={12} />
                              <span>Copiar</span>
                            </button>

                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(jackScriptGerado)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-lg transition-all shadow-md cursor-pointer"
                            >
                              <MessageSquare size={12} />
                              <span>Abrir no WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {isJackGenerating ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center">
                          <Loader2 size={32} className="animate-spin text-violet-400" />
                          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">O Jack está calculando o melhor ângulo de fechamento...</p>
                          <p className="text-[11px] text-zinc-500">Abatendo valor já pago e construindo o pitch de upgrade.</p>
                        </div>
                      ) : jackScriptGerado ? (
                        <div className="p-4 bg-[#0a0a0c] border border-white/10 rounded-xl text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {jackScriptGerado}
                        </div>
                      ) : (
                        <div className="text-center py-24 space-y-3 text-zinc-600">
                          <Zap size={40} className="mx-auto opacity-40" />
                          <p className="text-xs font-bold uppercase tracking-wider">Copiloto Jack Pronto</p>
                          <p className="text-[11px] max-w-sm mx-auto">Insira os dados do aluno à esquerda e gere um script de abordagem ou quebra de objeção instantânea.</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Equipe Comercial: 3 Vendedores Ativos</span>
                      <span className="text-emerald-400 font-mono font-bold">CRM Live Co-Pilot</span>
                    </div>

                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* ABA 6: O CIBORGUE (Visão Integrada do Sistema Operacional) */}
          {/* ========================================================================= */}
          {activeTab === "ciborgue" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Card Central de Visão do Ciborgue */}
              <div className="p-6 bg-gradient-to-br from-[#121008] via-black to-[#0a0a0d] border border-violet-500/40 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-3xl space-y-3">
                  <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-violet-400">
                    <Cpu size={14} /> Filosofia Humano + IA
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                    Construindo o Ciborgue: O Sistema Operacional Empresarial
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    "A inteligência artificial não substitui o profissional; ela remove a fricção e o retrabalho, criando uma simbiose onde 1 pessoa na equipe tem a produtividade de 5. Com o Documento Maestro como cérebro e agentes orquestrados, você tem uma máquina de execução determinística 24/7."
                  </p>
                </div>
              </div>

              {/* Grid de Pilares do Ecossistema */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                    <FileText size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">1. Documento Maestro</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Contexto mestre centralizado. Garante que qualquer terminal, agente ou membro da equipe opere sob as mesmas regras e ofertas.
                  </p>
                </div>

                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                    <Bot size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">2. Copy Chief Orquestrado</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Agentes especializados em Playbooks de Venda, Landing Pages, VSLs e Criativos que executam sem alucinar.
                  </p>
                </div>

                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                    <Mic size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">3. Reuniões em Ação Automática</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Transcrições via Whisper geram atas executivas, decisões e tarefas automáticas conectadas ao ClickUp/CRM.
                  </p>
                </div>

                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">4. Base de Estudo (NotebookLM)</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Repositório de conhecimento indexado onde os vendedores tiram dúvidas em segundos com respostas fundamentadas.
                  </p>
                </div>

                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                    <Zap size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">5. Copiloto Jack no CRM</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Assistente em tempo real calculando condições de upgrade e fornecendo respostas imediatas para contornar objeções.
                  </p>
                </div>

                <div className="p-5 bg-black border border-white/10 rounded-2xl space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                    <Users size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">6. Gestão da Equipe (10 Membros)</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Repositório espelhado no Drive e ClickUp permitindo que 3 vendedores, 4 designers e 3 gestores operem no mesmo ritmo.
                  </p>
                </div>

              </div>

            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
};
