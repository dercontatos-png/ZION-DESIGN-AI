import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Bot,
  FileText,
  GitFork,
  Sparkles,
  Send,
  User,
  Copy,
  Check,
  Download,
  Wand2,
  ChevronRight,
  Target,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Video,
  MessageSquare,
  DollarSign,
  Calendar,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  Plus,
  Trash2,
  Printer,
  Sparkle
} from "lucide-react";
import { FunilVisual } from "./FunilVisual";

interface CopilotoAgenciaProps {
  customApiKey?: string;
  myProfile?: any;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface OrcamentoData {
  agenciaNome: string;
  agenciaContato: string;
  clienteNome: string;
  clienteEmpresa: string;
  clienteNicho: string;
  doresObjetivos: string;
  escopoServicos: string[];
  escopoDetalhado: string;
  prazosCronograma: string;
  investimentoSetup: string;
  investimentoMensal: string;
  condicoesPagamento: string;
  termosLegais: string;
}

const ETAPAS_AGENCIA = [
  {
    id: 1,
    title: "1. Prospecção & Atração",
    subtitle: "Atração de clientes conscientes (Schwartz Níveis 3 e 4)",
    icon: Target,
    color: "from-zinc-900 to-[#c5a880]",
    badge: "Entrada de Leads",
    desc: "Atração ativa e passiva focando em dores reais e soluções prontas para clientes que já sabem o que precisam.",
    creativeIdeas: [
      "Vídeo 'Bastidores da Agência': Mostre o processo de criação de um anúncio que gerou R$50k em vendas para um cliente.",
      "Carrossel 'Antes e Depois': Compare o perfil/site de um cliente antes da agência e após a reformulação visual.",
      "Anúncio 'Calculadora de ROI': 'Se você fatora X por mês no seu nicho, está deixando Y na mesa por não ter um tráfego otimizado.'"
    ],
    scripts: {
      abordagem: "Olá [Nome], vi que vocês têm um produto incrível na [Empresa], mas percebi que o engajamento de tráfego pago pode aumentar até 3x com criativos direcionados. Preparei uma análise de 2 minutos sobre o seu nicho. Posso te enviar por aqui?",
      reuniao: "1. Qual seu objetivo de faturamento nos próximos 6 meses?\n2. O que tem sido o maior gargalo na captação de clientes hoje?\n3. Já trabalharam com agência antes? O que deu certo e o que faltou?"
    },
    checklist: [
      "Mapear perfil do cliente ideal (ICP) no nicho alvo",
      "Produzir 3 criativos de atração mostrando cases e soluções",
      "Fazer abordagem direta no WhatsApp/Instagram com script validado",
      "Agendar reunião de diagnóstico sem compromisso"
    ]
  },
  {
    id: 2,
    title: "2. Onboarding & Planejamento",
    subtitle: "Boas-vindas, briefing e estratégia",
    icon: Briefcase,
    color: "from-zinc-900 to-[#c5a880]",
    badge: "Alinhamento",
    desc: "Coleta de acessos, alinhamento de expectativas, assinatura do contrato e definição do plano estratégico dos primeiros 90 dias.",
    creativeIdeas: [
      "Vídeo de Boas-Vindas personalizado enviado ao cliente logo após a assinatura do contrato.",
      "Infográfico interativo com a linha do tempo do projeto enviada ao cliente."
    ],
    scripts: {
      abordagem: "Seja muito bem-vindo à [Nome da Agência]! Nosso time já iniciou o mapeamento estratégico. O próximo passo é preencher o Briefing Rápido para liberarmos os acessos.",
      reuniao: "Alinhamento de KPIs: Definir com clareza o que é sucesso para o cliente no Mês 1 (ex: estabilização do CPL) e Mês 3 (escala de ROAS)."
    },
    checklist: [
      "Assinatura do contrato digital",
      "Envio e preenchimento do formulário de Briefing",
      "Solicitação e validação de acessos (BM Meta Ads, Google Ads, Redes)",
      "Reunião de Kick-off com apresentação do cronograma"
    ]
  },
  {
    id: 3,
    title: "3. Execução & Produção",
    subtitle: "Criação, tráfego, design e campanhas",
    icon: Layers,
    color: "from-zinc-900 to-[#c5a880]",
    badge: "Mão na Massa",
    desc: "Produção contínua de criativos de alta conversão, configuração de públicos, publicação e lançamento de ofertas.",
    creativeIdeas: [
      "Combos visuais gerados no Zion Design Builder para criativos estáticos de alto impacto.",
      "Testes A/B de variação de headlines e cores principais."
    ],
    scripts: {
      abordagem: "Aprovação de Campanha: 'Olá [Nome]! Os novos criativos e copies da campanha do próximo mês já estão prontos. Veja no link e nos dê o de acordo.'",
      reuniao: "Reunião rápida de validação de ofertas e copys criadas antes de subir os anúncios no gerenciador."
    },
    checklist: [
      "Criação dos criativos visuais e edição de vídeos",
      "Redação de copy persuasiva para anúncios e landing page",
      "Subida das campanhas no Gerenciador de Anúncios",
      "Instalação e verificação de Pixels/APIs de Conversão"
    ]
  },
  {
    id: 4,
    title: "4. Otimização & Monitoramento",
    subtitle: "Análise contínua e testes A/B",
    icon: TrendingUp,
    color: "from-zinc-900 to-[#c5a880]",
    badge: "Melhoria Contínua",
    desc: "Acompanhamento diário das métricas principais (CTR, CPL, CPA, ROAS) e substituição de criativos saturados.",
    creativeIdeas: [
      "Análise de mapa de calor de conversões e ajuste de taxas de cliques.",
      "Rotatividade de criativos para combater fadiga do público."
    ],
    scripts: {
      abordagem: "Relatório de Meio de Mês: 'Conseguimos reduzir o CPL em 24% esta semana trocando o criativo X pelo novo modelo da agência.'",
      reuniao: "Análise estratégica semanal: Ajuste de orçamento entre campanhas campeãs e desativação das abaixo do benchmark."
    },
    checklist: [
      "Análise diária de métricas no gerenciador de anúncios",
      "Pausar anúncios com baixo CTR ou alto custo por conversão",
      "Realizar testes A/B de novos públicos e anúncios",
      "Ajustes de orçamento proporcional no que dá ROI"
    ]
  },
  {
    id: 5,
    title: "5. Relatórios & Renovação",
    subtitle: "Apresentação de resultados e LTV (Upsell)",
    icon: Award,
    color: "from-zinc-900 to-[#c5a880]",
    badge: "Fidelização & Upsell",
    desc: "Demonstração clara do retorno sobre o investimento gerado e oferta de expansão de escopo/contrato de longo prazo.",
    creativeIdeas: [
      "Dashboard executivo em PDF/Vídeo de 3 minutos resumindo o faturamento gerado pelas campanhas.",
      "Proposta de Upsell para incluir novos canais (ex: adicionar Google Ads ao serviço de Meta Ads)."
    ],
    scripts: {
      abordagem: "Apresentação de Relatório Mensal: 'No último mês investimos R$[X] e geramos R$[Y] em faturamento. Para o próximo ciclo, nossa recomendação para dobrar esse resultado é...'",
      reuniao: "Reunião de renovação trimestral com apresentação do plano de escala do próximo trimestre."
    },
    checklist: [
      "Gerar relatório consolidado de vendas/leads e ROI",
      "Agendar reunião mensal de resultados com o cliente",
      "Apresentar roadmap de crescimento para os próximos meses",
      "Enviar termo de renovação ou ampliação de contrato"
    ]
  }
];

export const CopilotoAgencia: React.FC<CopilotoAgenciaProps> = ({
  customApiKey,
  myProfile
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "orcamento" | "organograma">("chat");
  const [organogramaSubTab, setOrganogramaSubTab] = useState<"visual" | "checklists">("visual");

  // --- STATE CHAT ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: `👋 **Olá! Sou o Copiloto Estratégico da sua Agência Zion.**\n\nEstou configurado com a metodologia completa de marketing de agências — desde a **prospecção ativa/passiva**, reuniões de diagnóstico, proposta comercial com níveis de consciência de **Eugene Schwartz** (níveis 3 e 4), até a entrega final e renovação de contrato.\n\nComo posso te ajudar agora?\n\n- 💡 **Ideias de criativos e vídeos** para atrair clientes para a sua agência\n- 💬 **Scripts de abordagem no WhatsApp e Instagram**\n- 📊 **Preparação para Reunião de Fechamento** com o cliente\n- 📝 **Tirar dúvidas sobre a metodologia e contratos**`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- STATE ORÇAMENTO ---
  const [orcamento, setOrcamento] = useState<OrcamentoData>({
    agenciaNome: myProfile?.agenciaNome || "Agência Zion Digital",
    agenciaContato: myProfile?.contato || "(11) 99999-8888 | contato@agenciazion.com",
    clienteNome: "",
    clienteEmpresa: "",
    clienteNicho: "",
    doresObjetivos: "",
    escopoServicos: [
      "Gestão de Tráfego Pago (Meta Ads & Google Ads)",
      "Criação de Criativos de Alto Impacto",
      "Otimização de Conversões e Landing Pages"
    ],
    escopoDetalhado: "",
    prazosCronograma: "Início imediato após liberação de acessos. Ciclo quinzenal de relatórios e otimizações.",
    investimentoSetup: "1.500,00",
    investimentoMensal: "3.500,00",
    condicoesPagamento: "Pagamento via Pix ou Boleto com vencimento todo dia 10 de cada mês.",
    termosLegais: "Contrato de 6 meses com cláusula de confidencialidade (NDA). Os ativos criados permanecem sob propriedade do cliente. Cancelamento mediante aviso prévio de 30 dias."
  });

  const [isAiFilling, setIsAiFilling] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [selectedEtapaModal, setSelectedEtapaModal] = useState<typeof ETAPAS_AGENCIA[0] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const pdfPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getEffectiveApiKey = () => {
    return (
      customApiKey ||
      localStorage.getItem("custom_gemini_api_key") ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      ""
    );
  };

  // HANDLER CHAT AI
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    try {
      const apiKey = getEffectiveApiKey();

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: "copiloto-agencia",
          message: text,
          customApiKey: apiKey,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text
          }))
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erro ao se comunicar com o servidor.");
      }

      const data = await res.json();
      const aiReply = data.response || data.text || "Desculpe, não consegui gerar a resposta.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: `⚠️ Erro na comunicação com a IA: ${err.message || err}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // HANDLER PREENCHER ORÇAMENTO COM IA
  const handleAiPreencherOrcamento = async () => {
    setFormError(null);
    if (!orcamento.clienteNome || !orcamento.clienteNicho) {
      setFormError("Por favor, informe pelo menos o Nome do Cliente e o Nicho do Negócio para a IA gerar a proposta.");
      return;
    }

    setIsAiFilling(true);
    try {
      const apiKey = getEffectiveApiKey();
      const prompt = `Você é um diretor comercial sênior de agência de marketing digital.
Gere uma proposta comercial persuasiva para o seguinte cliente:
- Cliente / Empresa: ${orcamento.clienteNome} (${orcamento.clienteEmpresa || "Empresa"})
- Nicho / Segmento: ${orcamento.clienteNicho}
- Dores informadas (se houver): ${orcamento.doresObjetivos || "Precisa aumentar vendas e autoridade no ambiente digital."}

Retorne um JSON estrito com o seguinte formato:
{
  "doresObjetivos": "Descrição detalhada e empática das dores do cliente e como a agência resolverá",
  "escopoDetalhado": "Detalhamento estratégico das entregas divididas por fases (Ex: Mês 1 Setup & Lançamento, Mês 2 Otimização)",
  "prazosCronograma": "Detalhamento claro dos prazos de entrega e relatórios",
  "termosLegais": "Termos de contrato, propriedade intelectual dos arquivos e condições de rescisão amigável"
}`;

      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: "copiloto-agencia",
          message: prompt,
          customApiKey: apiKey
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erro ao se comunicar com o servidor.");
      }

      const resData = await res.json();
      const resultText = resData.response || resData.text || "{}";
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleaned);

      setOrcamento((prev) => ({
        ...prev,
        doresObjetivos: data.doresObjetivos || prev.doresObjetivos,
        escopoDetalhado: data.escopoDetalhado || prev.escopoDetalhado,
        prazosCronograma: data.prazosCronograma || prev.prazosCronograma,
        termosLegais: data.termosLegais || prev.termosLegais
      }));
    } catch (err: any) {
      setFormError("Erro ao gerar proposta com IA: " + (err.message || err));
    } finally {
      setIsAiFilling(false);
    }
  };

  // HELPER PARA EVITAR CRASH NO HTML2CANVAS COM OKLCH/OKLAB DO TAILWIND V4
  const replaceOklchAndOklab = (value: string): string => {
    if (!value) return value;
    return value.replace(/(oklch|oklab)\(([^)]+)\)/g, (match, type, content) => {
      const cleanContent = content.replace(/\//g, " ").trim();
      const parts = cleanContent.split(/\s+/);
      const lightnessVal = parseFloat(parts[0]);
      const alphaVal = parts.includes("/") || parts.length > 3 ? parts[parts.length - 1] : "1";
      
      if (value.includes("--color-gold") || value.includes("c5a880") || value.includes("gold")) {
        return `rgba(197, 168, 128, ${alphaVal})`;
      }
      
      if (!isNaN(lightnessVal)) {
        if (lightnessVal < 0.15) return `rgba(9, 9, 11, ${alphaVal})`;
        if (lightnessVal < 0.3) return `rgba(24, 24, 27, ${alphaVal})`;
        if (lightnessVal < 0.5) return `rgba(63, 63, 70, ${alphaVal})`;
        if (lightnessVal > 0.85) return `rgba(244, 244, 245, ${alphaVal})`;
        if (lightnessVal > 0.7) return `rgba(212, 212, 216, ${alphaVal})`;
      }
      return `rgba(161, 161, 170, ${alphaVal})`;
    });
  };

  // HANDLER GERAR PDF
  const handleGeneratePdf = async () => {
    if (!pdfPrintRef.current) return;
    setFormError(null);

    const originalGetComputedStyle = window.getComputedStyle;

    const customGetComputedStyle = (originalFunc: typeof window.getComputedStyle) => {
      return function (element: Element, pseudoElt?: string | null) {
        const style = originalFunc(element, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const value = target[prop as keyof CSSStyleDeclaration];
            if (typeof value === "string") {
              if (value.includes("oklch") || value.includes("oklab")) {
                return replaceOklchAndOklab(value);
              }
            }
            if (typeof value === "function") {
              return value.bind(target);
            }
            return value;
          }
        });
      };
    };

    try {
      // Aplicar o mock temporário no window atual
      window.getComputedStyle = customGetComputedStyle(originalGetComputedStyle);

      const element = pdfPrintRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#09090b",
        onclone: (clonedDoc) => {
          const clonedWin = clonedDoc.defaultView;
          if (clonedWin) {
            clonedWin.getComputedStyle = customGetComputedStyle(clonedWin.getComputedStyle);
          }

          // Sanitizar elementos de style para garantir que o parser não quebre nas regras CSS brutas
          clonedDoc.querySelectorAll("style").forEach((styleEl) => {
            if (styleEl.innerHTML) {
              styleEl.innerHTML = styleEl.innerHTML
                .replace(/oklch\(([^)]+)\)/g, "rgb(161, 161, 170)")
                .replace(/oklab\(([^)]+)\)/g, "rgb(161, 161, 170)");
            }
          });
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = `Proposta_${orcamento.clienteNome.replace(/\s+/g, "_") || "Cliente"}.pdf`;
      pdf.save(filename);
    } catch (e: any) {
      setFormError("Erro ao exportar PDF: " + e.message);
    } finally {
      // Restaurar o getComputedStyle original
      window.getComputedStyle = originalGetComputedStyle;
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(key);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-zinc-100 font-sans overflow-hidden">
      {/* HEADER DO COPILOTO DA AGÊNCIA */}
      <div className="px-6 py-4 bg-black border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#b39873] flex items-center justify-center text-black font-black shadow-lg shadow-[#c5a880]/10 shrink-0">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white uppercase tracking-wider">
                Copiloto da Agência
              </h1>
              <span className="bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                Zion AI Hub
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Atração, Vendas, Onboarding, Gerador de Propostas em PDF e Organograma Visual do Funil
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS INTERNAS */}
        <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-[#c5a880] text-black font-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-black"
            }`}
          >
            <Bot size={14} />
            <span>Assistente IA</span>
          </button>

          <button
            onClick={() => setActiveTab("orcamento")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "orcamento"
                ? "bg-[#c5a880] text-black font-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-black"
            }`}
          >
            <FileText size={14} />
            <span>Gerador de Propostas PDF</span>
          </button>

          <button
            onClick={() => setActiveTab("organograma")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "organograma"
                ? "bg-[#c5a880] text-black font-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-black"
            }`}
          >
            <GitFork size={14} />
            <span>Funil Antiprospecção</span>
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL DAS ABAS */}
      <div className="flex-1 overflow-hidden relative">
        {/* ==================== ABA 1: CHAT / ASSISTENTE IA ==================== */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden">
            {/* LADO ESQUERDO: BARRA LATERAL DE PROMPTS RÁPIDOS */}
            <div className="w-full md:w-80 bg-black/60 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#c5a880] tracking-wider">
                <Sparkles size={14} />
                <span>Atalhos Estratégicos</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Clique em um atalho para enviar uma consulta estruturada sobre a jornada da sua agência:
              </p>

              <div className="space-y-2">
                {[
                  {
                    label: "💡 Ideias de Criativos & Vídeos para Agência",
                    text: "Quais ideias de vídeos reels/tiktok e criativos visuais minha agência deve produzir para atrair clientes de ticket alto?"
                  },
                  {
                    label: "💬 Script de Abordagem WhatsApp",
                    text: "Gere 3 modelos de mensagens de primeiro contato no WhatsApp para oferecer gestão de tráfego e design para clínicas estéticas/restaurantes sem parecer chato."
                  },
                  {
                    label: "🤝 Roteiro da Reunião de Diagnóstico",
                    text: "Me passe um roteiro passo a passo do que falar na Reunião de Diagnóstico para entender as dores do cliente e apresentar a solução de forma irresistível."
                  },
                  {
                    label: "📊 Como Apresentar a Proposta Comercial",
                    text: "Como devo estruturar a apresentação da proposta comercial (preço, escopo, garantias) para o cliente fechar na hora sem pedir desconto?"
                  },
                  {
                    label: "🧠 Schwartz: Níveis 3 e 4 na Prática",
                    text: "Explique como aplicar os níveis 3 (Consciente da Solução) e 4 (Consciente do Produto) de Eugene Schwartz nos anúncios da minha agência."
                  },
                  {
                    label: "📈 Estratégia de Upsell e LTV",
                    text: "Como oferecer um novo serviço de landing page ou automação para um cliente atual de tráfego sem parecer forçado?"
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.text)}
                    className="w-full text-left p-3 rounded-xl bg-black border border-white/5 hover:border-[#c5a880]/40 hover:bg-black transition-all text-xs font-medium text-zinc-300 hover:text-white group flex items-center justify-between cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={12} className="text-zinc-600 group-hover:text-[#c5a880] shrink-0 ml-2" />
                  </button>
                ))}
              </div>

              <div className="mt-auto p-3.5 bg-black/80 rounded-xl border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#c5a880] uppercase">
                  <ShieldCheck size={12} />
                  <span>Dica Zion</span>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-snug">
                  Combine o gerador de imagem da aba **Design Builder** para criar os mockups e use este chat para afiar seu discurso de vendas!
                </p>
              </div>
            </div>

            {/* LADO DIREITO: CHAT FEED & INPUT */}
            <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
              {/* FEED DE MENSAGENS */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-3xl ${
                      msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.sender === "user"
                          ? "bg-[#c5a880] text-black"
                          : "bg-gradient-to-br from-[#c5a880] to-[#b39873] text-black"
                      }`}
                    >
                      {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 max-w-[85%] ${
                        msg.sender === "user"
                          ? "bg-[#c5a880] text-zinc-950 font-medium rounded-tr-none"
                          : "bg-black border border-white/5 text-zinc-200 rounded-tl-none shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/10 pb-1 text-[10px] opacity-70">
                        <span className="font-bold">
                          {msg.sender === "user" ? "Você" : "Copiloto Zion AI"}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {msg.sender === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="markdown-body space-y-2 text-zinc-200">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a880] to-[#b39873] text-black flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl bg-black border border-white/5 text-zinc-400 text-xs flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-[#c5a880]" />
                      <span>Estrategista pensando na melhor resposta...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* BARRA DE INPUT DE MENSAGEM */}
              <div className="p-4 bg-black/80 border-t border-white/5">
                <div className="flex items-center gap-2 max-w-4xl mx-auto bg-black border border-white/5 rounded-2xl p-2 focus-within:border-[#c5a880]/50 transition-colors">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Pergunte qualquer coisa sobre prospecção, reuniões, propostas e atendimento da agência..."
                    className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isTyping}
                    className="p-3 bg-[#c5a880] hover:bg-[#b39873] disabled:opacity-40 text-black font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ABA 2: GERADOR DE PROPOSTAS PDF ==================== */}
        {activeTab === "orcamento" && (
          <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-black">
            {/* PAINEL ESQUERDO: FORMULÁRIO */}
            <div className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-6 custom-scrollbar border-r border-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText size={18} className="text-[#c5a880]" />
                    Dados do Orçamento / Proposta Comercial
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Preencha os campos abaixo ou clique em "Preencher com IA" para a inteligência estruturar o documento.
                  </p>
                </div>

                <button
                  onClick={handleAiPreencherOrcamento}
                  disabled={isAiFilling}
                  className="px-4 py-2 bg-gradient-to-r from-[#c5a880] to-[#b39873] hover:from-[#b39873] hover:to-[#c5a880] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isAiFilling ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-black" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={14} />
                      <span>Preencher com IA</span>
                    </>
                  )}
                </button>
              </div>

              {formError && (
                <div className="p-4 bg-black border border-[#c5a880]/30 text-[#c5a880] text-xs rounded-xl flex items-start justify-between gap-2 animate-in fade-in duration-200">
                  <span className="font-medium">{formError}</span>
                  <button onClick={() => setFormError(null)} className="font-bold text-white hover:text-[#c5a880] shrink-0 cursor-pointer">✕</button>
                </div>
              )}

              {/* CAMPOS DO FORMULÁRIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Sua Agência / Empresa
                  </label>
                  <input
                    type="text"
                    value={orcamento.agenciaNome}
                    onChange={(e) => setOrcamento({ ...orcamento, agenciaNome: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: Agência Zion Marketing"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Contato da Agência
                  </label>
                  <input
                    type="text"
                    value={orcamento.agenciaContato}
                    onChange={(e) => setOrcamento({ ...orcamento, agenciaContato: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: (11) 99999-8888 | contato@zion.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Nome do Cliente / Responsável
                  </label>
                  <input
                    type="text"
                    value={orcamento.clienteNome}
                    onChange={(e) => setOrcamento({ ...orcamento, clienteNome: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: Dr. Roberto Mendes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Empresa / Marca do Cliente
                  </label>
                  <input
                    type="text"
                    value={orcamento.clienteEmpresa}
                    onChange={(e) => setOrcamento({ ...orcamento, clienteEmpresa: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: Clínica Odontológica Estética"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Nicho / Segmento do Cliente
                  </label>
                  <input
                    type="text"
                    value={orcamento.clienteNicho}
                    onChange={(e) => setOrcamento({ ...orcamento, clienteNicho: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: Odontologia de Alto Padrão / Implantes"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Dores e Objetivos do Cliente
                  </label>
                  <textarea
                    rows={3}
                    value={orcamento.doresObjetivos}
                    onChange={(e) => setOrcamento({ ...orcamento, doresObjetivos: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg p-3 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Descreva as dores que o cliente relatou na reunião (ex: baixa atração de pacientes particulares, dependência de convênios)..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                    Serviços do Escopo (Selecione)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Gestão de Tráfego Pago (Meta Ads & Google Ads)",
                      "Criação de Criativos no Zion (Design de Alto Impacto)",
                      "Copywriting & Redação Persuasiva",
                      "Otimização de Perfil do Instagram & Google Meu Negócio",
                      "Criação de Landing Page de Alta Conversão",
                      "Edição de Vídeos Curtos para Reels & TikTok",
                      "Relatório Mensal de ROI & Reunião Estratégica"
                    ].map((servico) => {
                      const isSelected = orcamento.escopoServicos.includes(servico);
                      return (
                        <label
                          key={servico}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#c5a880]/10 border-[#c5a880] text-white"
                              : "bg-black border-white/5 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOrcamento({ ...orcamento, escopoServicos: [...orcamento.escopoServicos, servico] });
                              } else {
                                setOrcamento({
                                  ...orcamento,
                                  escopoServicos: orcamento.escopoServicos.filter((s) => s !== servico)
                                });
                              }
                            }}
                            className="rounded bg-black border-white/5 text-[#c5a880] focus:ring-0 accent-[#c5a880]"
                          />
                          <span>{servico}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Detalhamento do Escopo & Entregas
                  </label>
                  <textarea
                    rows={3}
                    value={orcamento.escopoDetalhado}
                    onChange={(e) => setOrcamento({ ...orcamento, escopoDetalhado: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg p-3 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Mês 1: Setup da BM, Pixel e 10 criativos. Mês 2: Testes de públicos e escala..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Investimento Setup (R$)
                  </label>
                  <input
                    type="text"
                    value={orcamento.investimentoSetup}
                    onChange={(e) => setOrcamento({ ...orcamento, investimentoSetup: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: 1.500,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Investimento Mensal (R$)
                  </label>
                  <input
                    type="text"
                    value={orcamento.investimentoMensal}
                    onChange={(e) => setOrcamento({ ...orcamento, investimentoMensal: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: 3.000,00"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Condições de Pagamento & Prazos
                  </label>
                  <input
                    type="text"
                    value={orcamento.condicoesPagamento}
                    onChange={(e) => setOrcamento({ ...orcamento, condicoesPagamento: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Ex: Pix ou Boleto Bancário mensal. Vencimento todo dia 10."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
                    Termos Legais e Garantias
                  </label>
                  <textarea
                    rows={3}
                    value={orcamento.termosLegais}
                    onChange={(e) => setOrcamento({ ...orcamento, termosLegais: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-lg p-3 text-xs text-white focus:border-[#c5a880] focus:outline-none"
                    placeholder="Cláusulas de fidelidade, NDA, propriedade dos ativos e prazos de cancelamento..."
                  />
                </div>
              </div>
            </div>

            {/* PAINEL DIREITO: PREVISÃO & EXPORTAÇÃO PDF */}
            <div className="w-full lg:w-1/2 p-6 flex flex-col h-full bg-black/50 overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-[#c5a880]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Pré-visualização do PDF Comercial
                  </span>
                </div>

                <button
                  onClick={handleGeneratePdf}
                  className="px-5 py-2.5 bg-[#c5a880] hover:bg-[#b39873] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Baixar Proposta em PDF</span>
                </button>
              </div>

              {/* CONTÊINER PARA VISUALIZAÇÃO E PRINT HTML2CANVAS */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div
                  ref={pdfPrintRef}
                  className="w-full bg-[#09090b] border border-white/5 rounded-2xl p-8 space-y-6 text-zinc-200 shadow-2xl min-h-[700px]"
                >
                  {/* CABEÇALHO DO DOCUMENTO */}
                  <div className="flex items-center justify-between border-b border-[#c5a880]/30 pb-6">
                    <div>
                      <div className="text-xl font-black text-[#c5a880] uppercase tracking-widest">
                        {orcamento.agenciaNome || "AGÊNCIA ZION"}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {orcamento.agenciaContato}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#c5a880] text-[10px] font-black uppercase px-3 py-1 rounded-full">
                        PROPOSTA COMERCIAL
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-2">
                        Data: {new Date().toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  {/* IDENTIFICAÇÃO DO CLIENTE */}
                  <div className="p-4 rounded-xl bg-black/80 border border-white/5 space-y-1">
                    <div className="text-[10px] font-black text-[#c5a880] uppercase tracking-wider">
                      CLIENTE SELECIONADO
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {orcamento.clienteNome || "Nome do Cliente"} {orcamento.clienteEmpresa ? `(${orcamento.clienteEmpresa})` : ""}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Segmento: {orcamento.clienteNicho || "Não informado"}
                    </div>
                  </div>

                  {/* DORES & OBJETIVOS */}
                  {orcamento.doresObjetivos && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-[#c5a880] uppercase tracking-wider flex items-center gap-1.5">
                        <Target size={14} />
                        <span>1. Diagnóstico & Objetivos Estratégicos</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                        {orcamento.doresObjetivos}
                      </p>
                    </div>
                  )}

                  {/* ESCOPO DOS SERVIÇOS */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-[#c5a880] uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase size={14} />
                      <span>2. Escopo de Serviços Inclusos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {orcamento.escopoServicos.map((serv, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-200 bg-black/60 p-2.5 rounded-lg border border-white/5">
                          <CheckCircle2 size={14} className="text-[#c5a880] shrink-0" />
                          <span>{serv}</span>
                        </div>
                      ))}
                    </div>

                    {orcamento.escopoDetalhado && (
                      <p className="text-xs text-zinc-400 bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-wrap mt-2">
                        {orcamento.escopoDetalhado}
                      </p>
                    )}
                  </div>

                  {/* TABELA DE INVESTIMENTO */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-[#c5a880] uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={14} />
                      <span>3. Condições de Investimento</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-black border border-white/5 text-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Setup & Estruturação
                        </span>
                        <span className="text-base font-black text-white mt-1 block">
                          R$ {orcamento.investimentoSetup || "0,00"}
                        </span>
                        <span className="text-[9px] text-zinc-500">Taxa única inicial</span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/30 text-center">
                        <span className="text-[10px] font-bold text-[#c5a880] uppercase tracking-wider block">
                          Gestão & Execução Mensal
                        </span>
                        <span className="text-base font-black text-[#c5a880] mt-1 block">
                          R$ {orcamento.investimentoMensal || "0,00"} / mês
                        </span>
                        <span className="text-[9px] text-zinc-400">Mensalidade recorrente</span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 bg-black/40 p-3 rounded-lg border border-white/5">
                      <strong>Pagamento:</strong> {orcamento.condicoesPagamento}
                    </div>
                  </div>

                  {/* TERMOS LEGAIS E ASSINATURAS */}
                  {orcamento.termosLegais && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-[#c5a880] uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>4. Termos Legais & Validade</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                        {orcamento.termosLegais}
                      </p>
                    </div>
                  )}

                  {/* ASSINATURAS */}
                  <div className="pt-8 grid grid-cols-2 gap-8 border-t border-white/5 text-center text-xs">
                    <div>
                      <div className="border-b border-zinc-700 pb-1 font-extrabold text-white">
                        {orcamento.agenciaNome}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 uppercase">Contratada</div>
                    </div>

                    <div>
                      <div className="border-b border-zinc-700 pb-1 font-extrabold text-white">
                        {orcamento.clienteNome || "Contratante"}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1 uppercase">Contratante</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ABA 3: FUNIL ANTIPROSPECÇÃO (ORGANOGRAMA VISUAL) ==================== */}
        {activeTab === "organograma" && (
          <div className="h-full overflow-y-auto p-6 space-y-8 custom-scrollbar bg-black">
            {/* CABEÇALHO DO FUNIL */}
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="space-y-2">
                <span className="bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Metodologia Completa
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  Funil Antiprospecção & Ciclo da Agência
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
                  Seu mapa estratégico de atração de clientes qualificados. Alinhado com a metodologia antiprospecção visual para automatizar sua captação de design e tráfego.
                </p>
              </div>

              {/* TOGGLE SUB-TABS */}
              <div className="max-w-md mx-auto flex items-center justify-center bg-black p-1.5 rounded-xl border border-white/5 gap-2">
                <button
                  onClick={() => setOrganogramaSubTab("visual")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    organogramaSubTab === "visual"
                      ? "bg-[#c5a880] text-black shadow-lg font-black"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#111]/50"
                  }`}
                >
                  Mapa do Funil (Imagem)
                </button>
                <button
                  onClick={() => setOrganogramaSubTab("checklists")}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    organogramaSubTab === "checklists"
                      ? "bg-[#c5a880] text-black shadow-lg font-black"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#111]/50"
                  }`}
                >
                  Roteiros e Checklist (5 Etapas)
                </button>
              </div>
            </div>

            {organogramaSubTab === "visual" ? (
              <div className="max-w-6xl mx-auto">
                <FunilVisual />
              </div>
            ) : (
              <>
                {/* ORGANOGRAMA VISUAL DE FLUXO (STEP CARDS COM CONEXÃO) */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {ETAPAS_AGENCIA.map((etapa, idx) => {
                const IconComponent = etapa.icon;
                return (
                  <div key={etapa.id} className="flex flex-col items-center relative group">
                    {/* CARD DA ETAPA */}
                    <div
                      onClick={() => setSelectedEtapaModal(etapa)}
                      className="w-full bg-black border border-white/5 hover:border-[#c5a880] p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-xl hover:shadow-[#c5a880]/10 flex flex-col justify-between h-52 text-left relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${etapa.color} flex items-center justify-center text-black font-black`}>
                            <IconComponent size={16} />
                          </div>
                          <span className="text-[9px] font-black uppercase text-[#c5a880] bg-[#c5a880]/10 px-2 py-0.5 rounded-full border border-[#c5a880]/20">
                            {etapa.badge}
                          </span>
                        </div>

                        <h3 className="text-xs font-black text-white uppercase tracking-wider leading-snug">
                          {etapa.title}
                        </h3>

                        <p className="text-[10.5px] text-zinc-400 line-clamp-3 leading-snug">
                          {etapa.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-extrabold text-[#c5a880]">
                        <span>Ver Checklist & Scripts</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>

                    {/* SETA DE CONEXÃO FLUXO (Desktop) */}
                    {idx < ETAPAS_AGENCIA.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#c5a880]">
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DETALHAMENTO EXPANDIDO SELECIONADO OU MODAL */}
            {selectedEtapaModal ? (
              <div className="max-w-4xl mx-auto bg-black border border-[#c5a880]/40 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${selectedEtapaModal.color} flex items-center justify-center text-black font-black`}>
                      <selectedEtapaModal.icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">
                        {selectedEtapaModal.title}
                      </h3>
                      <p className="text-xs text-zinc-400">{selectedEtapaModal.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEtapaModal(null)}
                    className="px-3 py-1.5 bg-[#111] hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* IDEIAS DE CRIATIVOS E VÍDEOS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-[#c5a880] uppercase tracking-wider">
                      <Video size={16} />
                      <span>Ideias de Criativos & Vídeos para Divulgar</span>
                    </div>

                    <div className="space-y-2">
                      {selectedEtapaModal.creativeIdeas.map((idea, idx) => (
                        <div key={idx} className="p-3 bg-black rounded-xl border border-white/5 text-xs text-zinc-300 leading-relaxed">
                          💡 {idea}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CHECKLIST PRÁTICO */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-[#c5a880] uppercase tracking-wider">
                      <FileCheck size={16} />
                      <span>Checklist de Execução</span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedEtapaModal.checklist.map((check, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-black rounded-lg border border-white/5 text-xs text-zinc-300">
                          <CheckCircle2 size={15} className="text-[#c5a880] shrink-0 mt-0.5" />
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SCRIPTS VALIDADOS */}
                  <div className="md:col-span-2 space-y-3 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-[#c5a880] uppercase tracking-wider">
                        <MessageSquare size={16} />
                        <span>Scripts e Roteiros de Conversa Validados</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-black rounded-xl border border-white/5 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-400 uppercase">
                            Script de Abordagem / Primeiro Contato
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedEtapaModal.scripts.abordagem, "abordagem")}
                            className="text-[#c5a880] hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedScript === "abordagem" ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedScript === "abordagem" ? "Copiado!" : "Copiar"}</span>
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                          {selectedEtapaModal.scripts.abordagem}
                        </p>
                      </div>

                      <div className="p-4 bg-black rounded-xl border border-white/5 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-400 uppercase">
                            Roteiro de Reunião / Alinhamento
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedEtapaModal.scripts.reuniao, "reuniao")}
                            className="text-[#c5a880] hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedScript === "reuniao" ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedScript === "reuniao" ? "Copiado!" : "Copiar"}</span>
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                          {selectedEtapaModal.scripts.reuniao}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-black/50 border border-dashed border-white/5 text-center space-y-3">
                <GitFork size={32} className="text-[#c5a880] mx-auto" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Clique em qualquer etapa acima para ver o guia detalhado
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Você verá ideias de criativos para divulgar os serviços da sua agência, checklists de execução e scripts prontos para enviar pelo WhatsApp.
                </p>
              </div>
            )}
            </>)}
          </div>
        )}
      </div>
    </div>
  );
};
