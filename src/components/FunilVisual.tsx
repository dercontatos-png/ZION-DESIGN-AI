import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Instagram,
  Zap,
  TrendingUp,
  Share2,
  FileText,
  UserCheck,
  Video,
  DollarSign,
  HelpCircle,
  RotateCcw,
  MessageSquare,
  VideoOff,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  Link,
  ChevronDown,
  Info,
  X,
  Target,
  Briefcase,
  Play,
  HeartHandshake,
  Quote,
  Aperture
} from "lucide-react";

interface NodeDetail {
  title: string;
  stage: string;
  metric: string;
  desc: string;
  checklist: string[];
  script?: string;
  tips: string[];
  howToExecute: string[];
}

export const FunilVisual: React.FC = () => {
  // Simulator State
  const [visitorCount, setVisitorCount] = useState<number>(5000);
  const [ticketMedio, setTicketMedio] = useState<number>(3000);
  const [activeSim, setActiveSim] = useState<boolean>(true);

  // Selected Node State
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Interactive metrics calculations
  const igConversion = 0.40; // 40% visit Link Bio
  const linkBioToPage = 0.70; // 70% go to Página de Vendas or Behance
  const pageToWhatsApp = 0.15; // 15% click WhatsApp
  const whatsAppToMeeting = 0.40; // 40% schedule a meeting
  const meetingToOffer = 0.85; // 85% get an offer
  const offerToClosed = 0.25; // 25% close

  // Calculated visitor numbers
  const igVisitors = Math.round(visitorCount);
  const linkBioVisitors = Math.round(igVisitors * igConversion);
  const assetVisitors = Math.round(linkBioVisitors * linkBioToPage);
  const whatsAppContacts = Math.round(assetVisitors * pageToWhatsApp);
  const meetingsScheduled = Math.round(whatsAppContacts * whatsAppToMeeting);
  const offersPresented = Math.round(meetingsScheduled * meetingToOffer);
  const clientsClosed = Math.round(offersPresented * offerToClosed);
  const monthlyRevenue = clientsClosed * ticketMedio;

  // Node details dictionary
  const nodeDetails: Record<string, NodeDetail> = {
    plano_icp: {
      title: "Plano de Negócios e ICP",
      stage: "A Base de Tudo",
      metric: "Fundação Estratégica",
      desc: "O ponto de partida do Funil Antiprospecção. Consiste em definir com clareza o seu Plano de Negócios e o seu ICP (Indivíduo com Cara de Pix). Sem esta clareza matemática e comportamental de para quem você está vendendo, qualquer ação de tráfego, design ou conteúdo subsequente falhará.",
      checklist: [
        "Definir o ICP (Indivíduo com Cara de Pix) com riqueza de detalhes",
        "Calcular o Ticket Médio viável para atingir as metas financeiras",
        "Estruturar os pacotes de serviço e escopos de entrega da agência",
        "Alinhar a promessa principal ao problema mais doloroso do ICP"
      ],
      tips: ["Se você tenta vender para todo mundo, acaba não vendendo para ninguém.", "O seu posicionamento premium depende diretamente de rejeitar clientes fora do ICP."],
      howToExecute: [
        "1. Escreva o perfil ideal do seu cliente focando no ICP (Indivíduo com Cara de Pix), definindo nicho e faturamento mínimo.",
        "2. Desenhe seu escopo de serviço simplificado (focado em resolver apenas a principal dor do ICP).",
        "3. Faça a matemática do negócio: quanto você precisa cobrar por contrato para atingir sua meta de faturamento com poucos clientes.",
        "4. Crie uma grande promessa irrecusável que demonstre o retorno financeiro direto de trabalhar com você."
      ]
    },
    pesca_balde: {
      title: "Pesca em Balde",
      stage: "Atração Externa",
      metric: "Atração Ativa",
      desc: "Abordagem direcionada em nichos específicos de potenciais clientes que já demonstram intenção de compra ou têm perfis compatíveis com seu ICP (Ideal Customer Profile).",
      checklist: [
        "Identificar 20 perfis ideais de clientes por semana no Instagram",
        "Interagir de forma genuína nas postagens mais recentes antes do contato",
        "Enviar mensagem inicial personalizada focando em uma oportunidade rápida observada",
        "Conduzir o lead para ver o seu Instagram Posicionado"
      ],
      script: "Olá [Nome]! Notei que as campanhas de vocês na [Empresa] estão muito bem estruturadas, mas vi um detalhe técnico no pixel que pode estar fazendo vocês perderem vendas. Preparei um vídeo rápido de 2 minutos explicando. Posso te mandar por aqui?",
      tips: ["Nunca tente vender na primeira mensagem.", "O objetivo único do primeiro contato é gerar curiosidade e direcionar para o seu perfil."],
      howToExecute: [
        "1. Faça uma lista de 10 perfis de Instagram de potenciais clientes no seu nicho de atuação.",
        "2. Curta e comente em posts recentes de forma inteligente para que seu nome apareça nas notificações do lead.",
        "3. Envie uma mensagem no direct apontando de forma educada um gargalo visível no site ou anúncios deles.",
        "4. Ofereça um breve diagnóstico em vídeo (de até 2 minutos) sem cobrar nada, estimulando-os a visitar seu perfil para ver mais soluções."
      ]
    },
    conteudo: {
      title: "Conteúdo N3 / Orgânico",
      stage: "Atração Passiva",
      metric: "Engajamento",
      desc: "Conteúdos que elevam o nível de consciência do cliente. Explicam processos, desmistificam o tráfego pago/design e provam sua autoridade de forma sutil.",
      checklist: [
        "Publicar 2 carrosséis técnicos por semana que resolvem uma dor específica",
        "Fazer stories diários mostrando bastidores da agência e processos de entrega",
        "Criar destaques estratégicos: 'Comece Aqui', 'Resultados', 'Serviços'",
        "Utilizar CTAs sutis que estimulam a visita ao link da bio"
      ],
      tips: ["Foque em conteúdo voltado para o cliente final, não para outros profissionais de agência.", "Utilize títulos de alta curiosidade baseados em prejuízos evitados."],
      howToExecute: [
        "1. Escreva uma lista com as 5 principais dúvidas ou desconfianças que o seu ICP tem sobre o seu serviço.",
        "2. Crie carrosséis focados em 'Como resolver o problema X' de forma simples e técnica, mostrando domínio do assunto.",
        "3. Grave Stories mostrando o seu dia a dia e compartilhando pequenos aprendizados práticos da sua equipe.",
        "4. Termine sempre seus posts instruindo o leitor a clicar no link da sua biografia caso queira uma análise personalizada."
      ]
    },
    busca_seo: {
      title: "Busca SEO / Posicionamento",
      stage: "Atração Orgânica",
      metric: "Intenção Alta",
      desc: "Captação de leads qualificados que estão ativamente buscando no Google, YouTube ou redes sociais por soluções que sua agência oferece.",
      checklist: [
        "Otimizar a bio do Instagram com palavras-chave claras (ex: 'Tráfego Pago', 'Design Estratégico')",
        "Otimizar postagens com hashtags e palavras-chave indexadas pelo algoritmo",
        "Registrar a agência no Google Meu Negócio para atração local",
        "Manter portfólio atualizado com tags de busca relevantes"
      ],
      tips: ["A maioria dos bons clientes pesquisa pelo termo da solução. Esteja presente e bem posicionado."],
      howToExecute: [
        "1. Mude o seu nome principal no Instagram para conter sua especialidade (ex: 'Zion | Tráfego Pago' em vez de apenas 'Zion').",
        "2. Adicione tags e palavras-chave que seu cliente de fato busca (como 'Agência de Tráfego', 'Gestão de Anúncios') nas legendas e bio.",
        "3. Registre gratuitamente sua empresa no Google Meu Negócio, adicionando fotos e pedindo avaliações para aparecer nas buscas de sua região.",
        "4. Use títulos descritivos e claros nos seus projetos de portfólio para indexar bem nos buscadores."
      ]
    },
    behance_intencional: {
      title: "Behance Intencional",
      stage: "Qualificação & Portfólio",
      metric: "Autoridade Visual",
      desc: "Um portfólio projetado não para impressionar designers, mas para provar capacidade técnica e valor comercial direto para clientes de alto ticket.",
      checklist: [
        "Apresentar projetos com foco no retorno financeiro e decisões estratégicas",
        "Incluir depoimentos e contexto do desafio de cada cliente",
        "Adicionar chamada direta para reunião ou WhatsApp no final do projeto",
        "Criar capas minimalistas e de altíssimo impacto estético"
      ],
      tips: ["Mostre o processo estratégico por trás do visual. O cliente compra o raciocínio, não apenas o desenho."],
      howToExecute: [
        "1. Selecione de 2 a 3 projetos excepcionais de seu portfólio para dar foco total.",
        "2. Escreva uma narrativa para cada projeto estruturada em: O Desafio, A Solução Estratégica e Os Resultados Obtidos.",
        "3. Evite termos técnicos incompreensíveis e foque na clareza comercial de como aquele design aumentou as vendas ou conversão.",
        "4. Finalize cada publicação do Behance com um banner de alta qualidade contendo um link direto para seu contato do WhatsApp."
      ]
    },
    indicacoes: {
      title: "Indicações (Mecanismo)",
      stage: "Atração de Confiança",
      metric: "Conversão Elevada",
      desc: "Alimentado pelo loop de 'Cliente Satisfeito'. Um sistema estruturado onde cada cliente atendido é incentivado a indicar novos parceiros de negócios.",
      checklist: [
        "Oferecer bônus ou descontos na mensalidade para indicações fechadas",
        "Pedir indicações formalmente na reunião de entrega do primeiro mês",
        "Enviar um presente físico/mimo de agradecimento ao cliente que indica",
        "Manter canal aberto e facilitado para que clientes enviem novos contatos"
      ],
      tips: ["Indicações têm o ciclo de vendas 3x mais rápido.", "Peça indicações exatamente no momento de maior euforia do cliente (ex: logo após um recorde de vendas)."],
      howToExecute: [
        "1. Estruture um programa formal: ofereça uma bonificação em dinheiro ou 20% de desconto na mensalidade para cada indicação que fechar contrato.",
        "2. No momento de entrega de bons resultados, mencione de forma leve que está abrindo novas vagas e peça indicações de parceiros de confiança.",
        "3. Envie uma lembrança ou mimo físico personalizado à empresa do cliente que indicou um contato como forma de valorização.",
        "4. Facilite o processo criando um modelo simples de mensagem que seu cliente possa repassar para os amigos empresários."
      ]
    },
    trafego_gratuito: {
      title: "Tráfego Gratuito / Parcerias",
      stage: "Atração por Relacionamento",
      metric: "Alavancagem",
      desc: "Co-produção de conteúdo, lives, webinários ou parcerias estratégicas com outros profissionais que atendem o mesmo ICP, mas não concorrem diretamente (ex: contadores, agências de branding).",
      checklist: [
        "Mapear 5 profissionais parceiros complementares",
        "Propor lives ou carrosséis em collab focados na dor mútua do cliente",
        "Disponibilizar materiais ou planilhas gratuitas com seu link em canais de parceiros",
        "Criar uma rede de recomendação mútua formalizada"
      ],
      tips: ["As pessoas confiam em indicações de especialistas parceiros. Estabeleça relações ganha-ganha."],
      howToExecute: [
        "1. Identifique profissionais que prestam serviços complementares ao mesmo tipo de cliente (ex: contadores, programadores, copywriters).",
        "2. Sugira uma postagem colaborativa ('Collab') abordando um tema que junte as duas áreas para resolver uma dor do cliente final.",
        "3. Crie ferramentas úteis gratuitas (como planilhas de precificação ou checklists) e peça para esses parceiros distribuírem com suas bases de leads.",
        "4. Defina um acordo de benefício mútuo onde um indica o serviço do outro de forma formal e confiável."
      ]
    },
    trafego_pago: {
      title: "Tráfego Pago (Anúncios)",
      stage: "Escala & Tração",
      metric: "Volume de Entrada",
      desc: "Campanhas contínuas de Meta Ads e Google Ads direcionando proprietários de negócios diretamente para o seu Instagram Posicionado ou Landing Page de Vendas.",
      checklist: [
        "Rodar campaigns de distribuição de conteúdo técnico de alto engajamento",
        "Criar anúncios focados em dores e gargalos de vendas comuns do nicho",
        "Utilizar criativos dinâmicos em formato de vídeo bastidor ou depoimento",
        "Direcionar o público morno para o Instagram Posicionado para criar relacionamento antes da abordagem"
      ],
      tips: ["Anúncios diretos de 'contrate minha agência' costumam ter CPL alto. Prefira atrair pelo conteúdo, case ou análise rápida."],
      howToExecute: [
        "1. Use o Gerenciador de Anúncios para criar uma campanha de engajamento direcionando o tráfego para seu perfil do Instagram.",
        "2. Como criativo, use um vídeo seu de até 1 minuto analisando um site ruim do seu nicho e mostrando como deixá-lo altamente lucrativo.",
        "3. Configure a segmentação do público para focar em 'Proprietários de pequenas empresas' ou interesses de negócios do seu nicho.",
        "4. Mantenha um post fixado no seu perfil que receba esses visitantes novos com uma aula gratuita ou estudo de caso robusto."
      ]
    },
    instagram_posicionado: {
      title: "Instagram Posicionado",
      stage: "O Hub Central",
      metric: "Retenção de Audiência",
      desc: "Seu principal ativo de conversão passiva. Um perfil impecável que funciona como um escritório digital de luxo. Transmite autoridade instantânea ao visitante e direciona para o próximo passo.",
      checklist: [
        "Bio ultra clara com sua grande promessa, nicho de atuação e chamada para ação (CTA)",
        "Destaques estratégicos com casos de sucesso reais e estruturados",
        "Fotos profissionais e paleta de cores sóbria que transmite sofisticação",
        "Grade de posts fixados mostrando seu principal case de sucesso e sua metodologia"
      ],
      tips: ["O visitante leva apenas 3 segundos para decidir se vai seguir seu perfil e clicar no seu link. Capriche na bio e no design visual."],
      howToExecute: [
        "1. Escreva a biografia em formato vertical: O problema que resolve + O método inovador + Chamada de clique (CTA) com emoji.",
        "2. Organize 4 destaques objetivos com títulos curtos: 1. Cases (Provas de resultado), 2. Método (Como entrega), 3. Equipe (Sua autoridade), 4. Reunião (Como agendar).",
        "3. Produza e fixe três posts na parte superior do perfil que expliquem detalhadamente sua metodologia de trabalho e resultados reais.",
        "4. Garanta que todas as imagens de capa usem a mesma paleta de cores sofisticada e fontes premium alinhadas ao seu posicionamento."
      ]
    },
    link_bio: {
      title: "Link na Bio",
      stage: "Filtro de Destino",
      metric: "Taxa de Clique: 40%",
      desc: "O ponto de transição onde o lead decide se aprofundar na sua agência. Deve ser extremamente limpo, rápido e focado em apenas duas ações principais.",
      checklist: [
        "Utilizar uma página própria ou linktree altamente minimalista",
        "Colocar botão de destaque para a Página de Vendas principal",
        "Colocar botão secundário para o Portfólio (Behance)",
        "Remover links desnecessários que distraem o usuário (ex: links de redes sociais secundárias)"
      ],
      tips: ["Menos opções = Maior taxa de cliques no botão principal.", "Garanta carregamento instantâneo no celular."],
      howToExecute: [
        "1. Crie uma página simples usando ferramentas de link rápido ou seu próprio site, garantindo um design escuro e luxuoso.",
        "2. Adicione no máximo dois botões principais com textos acionáveis (ex: 'Falar Conosco no WhatsApp' e 'Ver Casos de Sucesso').",
        "3. Remova qualquer link de distração, como redes secundárias pessoais, artigos antigos ou canais que não gerem vendas diretas.",
        "4. Teste a abertura no celular para certificar-se de que a página carrega em menos de 1.5 segundos na rede de dados móveis."
      ]
    },
    pagina_vendas: {
      title: "Página de Vendas (V0)",
      stage: "Doutrinação & Conversão",
      metric: "Desejo Elevado",
      desc: "Landing page estruturada que quebra todas as objeções do cliente em relação a agências. Explica sua metodologia, mostra depoimentos, define o perfil de cliente que você atende e convida para o contato no WhatsApp.",
      checklist: [
        "Headline focada no resultado financeiro final e crescimento previsível",
        "Seção detalhando o método de trabalho (ex: 'O Método Antiprospecção')",
        "Mockup visual de entregas reais e cases de sucesso estruturados",
        "Seção de qualificação de público: para quem é e para quem NÃO é o serviço"
      ],
      tips: ["Mostre sua cara e conte sua história. Negócios de alto ticket são fechados de pessoa para pessoa."],
      howToExecute: [
        "1. Use uma estrutura clássica de copy: Headline atraente -> O Grande Problema do mercado -> Sua Solução de Valor -> Cases reais -> Garantia e CTA.",
        "2. Coloque um vídeo explicativo curto na parte superior da página para converter visitantes em leads qualificados sem que precisem ler tudo.",
        "3. Inclua prints nítidos de resultados de clientes no meio da página para validar instantaneamente sua autoridade estratégica.",
        "4. Distribua botões de ação ('Agende uma Análise Comercial') de forma ritmada ao longo de toda a rolagem da página."
      ]
    },
    qualificacao_vsl: {
      title: "Vídeo de Qualificação (VSL)",
      stage: "Educação de Valor",
      metric: "Quebra de Objeções",
      desc: "Um vídeo estratégico curto (5-10 min) posicionado na Página de Vendas. Explica sua visão de mercado, mostra seu diferencial único e pré-qualifica o cliente antes de ele falar com você.",
      checklist: [
        "Gancho inicial prendendo atenção com uma verdade contraintuitiva",
        "Apresentação do grande problema das agências tradicionais",
        "Sua solução inovadora e os resultados alcançados",
        "Chamada para ação clara para agendar um diagnóstico gratuito no WhatsApp"
      ],
      tips: ["O vídeo faz o trabalho pesado de vendas por você. Quando o cliente chega no WhatsApp, ele já está convencido da sua competência."],
      howToExecute: [
        "1. Grave um vídeo de tela gravada (usando Loom ou similar) mostrando slides organizados e de design minimalista.",
        "2. Comece revelando uma verdade chocante do mercado (ex: 'Por que a maioria das agências só queima seu dinheiro e como evitar isso').",
        "3. Mostre sua metodologia na prática, abrindo o Figma ou ferramentas operacionais para dar sensação de bastidor real.",
        "4. Conclua pedindo para o usuário clicar no botão logo abaixo do vídeo para agendar uma reunião comercial de triagem."
      ]
    },
    whatsapp: {
      title: "WhatsApp Comercial",
      stage: "Fundo de Funil (Interação e Oferta)",
      metric: "Abertura de Canal & Triagem",
      desc: "O cliente chega ao seu WhatsApp (via mensagem, reunião ou agente de IA). O ponto de conexão crucial aqui é: você faz perguntas estratégicas para extrair as dores e necessidades mais profundas do cliente antes de apresentar qualquer preço ou solução.",
      checklist: [
        "Utilizar mensagem de saudação automática com perguntas de triagem",
        "Fazer perguntas estratégicas para extrair as dores e necessidades reais",
        "Evitar mandar propostas ou preços de imediato sem entender o cenário do lead",
        "Agendar a reunião de diagnóstico apenas para os leads qualificados (ICP)"
      ],
      script: "Excelente, [Nome]! Para entender melhor o gargalo comercial atual de vocês e desenhar a melhor solução sob medida, vou te fazer 3 perguntas rápidas. Qual é o faturamento médio atual da empresa e qual o principal canal de aquisição de clientes hoje?",
      tips: ["O WhatsApp é um filtro estratégico de qualificação, não uma linha de panfletagem.", "Extraia as dores primeiro, para que sua futura oferta pareça uma prescrição médica exata."],
      howToExecute: [
        "1. Configure um WhatsApp Business com uma mensagem de saudação profissional e curta.",
        "2. Ao receber o contato, faça perguntas estratégicas para extrair as dores antes de falar qualquer preço.",
        "3. Responda em no máximo 15 minutos; a agilidade no WhatsApp triplica as taxas de agendamento.",
        "4. Direcione leads qualificados diretamente para o agendamento da reunião de Diagnóstico."
      ]
    },
    reuniao_diagnostico: {
      title: "Reunião de Diagnóstico",
      stage: "Vendas Avançadas",
      metric: "Mapeamento de Dores",
      desc: "Chamada de vídeo rápida focada 100% em escutar o cliente, identificar os reais gargalos comerciais e criar um ambiente de diagnóstico médico (autoridade total).",
      checklist: [
        "Fazer perguntas estratégicas sobre metas de faturamento e canais atuais",
        "Descobrir os exatos pontos de dor (ex: lead caro, time comercial parado)",
        "Não apresentar proposta ainda; focar em coletar os insumos necessários",
        "Marcar o segundo encontro (apresentação de proposta) em até 48 horas"
      ],
      tips: ["Quem fala mais na reunião de diagnóstico é o cliente.", "Anotar as palavras exatas que ele usa para descrever as dores para usá-las na proposta."],
      howToExecute: [
        "1. Inicie a chamada de vídeo criando empatia e estabelecendo o controle do tempo e da dinâmica.",
        "2. Faça perguntas abertas sobre metas de faturamento, faturamento atual e principais gargalos de vendas.",
        "3. Pratique escuta ativa e anote as dores descritas pelo cliente, usando as mesmas palavras dele na futura proposta.",
        "4. Agende o segundo encontro para apresentar a Proposta Comercial personalizada em até 48 horas."
      ]
    },
    proposta_comercial: {
      title: "Proposta Comercial Premium",
      stage: "Vendas Avançadas",
      metric: "Valor Percebido",
      desc: "Envio de uma proposta sob medida, baseada nos níveis de consciência de Eugene Schwartz. Mostra o plano estratégico claro para os primeiros 90 dias, o investimento e as garantias.",
      checklist: [
        "Estruturar a proposta em formato PDF premium ou apresentação interativa",
        "Definir escopo de serviços claro com entregáveis objetivos",
        "Apresentar 3 opções de pacotes (ex: Start, Scale, VIP) para ancorar preço",
        "Deixar explícitas as responsabilidades e prazos mútuos"
      ],
      tips: ["Sempre apresente a proposta ao vivo por chamada de vídeo. Nunca envie apenas o arquivo PDF por e-mail ou WhatsApp."],
      howToExecute: [
        "1. Desenvolva uma apresentação de design impecável, usando a própria marca do lead para gerar conexão visual.",
        "2. Estruture o documento mostrando os Gargalos identificados, o Plano Estratégico de 90 dias e as Condições Comerciais.",
        "3. Ancore o preço ideal oferecendo 3 opções de pacotes (Start, Scale, VIP).",
        "4. Apresente a proposta sempre ao vivo em chamada de vídeo compartilhando a tela, nunca enviando apenas o arquivo avulso."
      ]
    },
    mensagem_fechamento: {
      title: "Fechamento / Follow-up",
      stage: "Vendas Avançadas",
      metric: "Conversão Direta",
      desc: "Processo de negociação final, quebra de objeções de preço ou tempo, e assinatura do contrato.",
      checklist: [
        "Enviar proposta revisada com os pontos acordados",
        "Quebrar objeção de risco oferecendo prazos de teste ou garantias de entrega",
        "Disponibilizar o contrato digital em plataforma de assinatura simplificada",
        "Confirmar o pagamento da primeira parcela (Setup / Retainer)"
      ],
      tips: ["Se o lead sumir, faça follow-ups de valor: envie uma ideia estratégica nova ao invés de perguntar 'vamos fechar?'."],
      howToExecute: [
        "1. Envie a proposta em PDF e as opções comerciais resumidas por mensagem de WhatsApp logo após a reunião.",
        "2. Use termos contratuais simplificados e plataformas como Clicksign ou DocuSign para facilitar a assinatura pelo celular.",
        "3. Se o cliente demorar, faça follow-ups trazendo novas ideias para o mercado dele, demonstrando interesse real em somar.",
        "4. Reduza as objeções de risco oferecendo garantias claras ou prazos curtos de teste operacional."
      ]
    },
    oferta_apresentada: {
      title: "Oferta Apresentada",
      stage: "Decisão do Cliente",
      metric: "Ancoragem de Preço",
      desc: "O momento exato em que o lead recebe o plano estratégico completo e o valor financeiro do serviço.",
      checklist: [
        "Ancorar o valor mostrando quanto o cliente está perdendo sem a solução",
        "Apresentar o escopo como um investimento produtivo, não um custo",
        "Oferecer condições especiais de pagamento para fechamento imediato",
        "Deixar claros os próximos passos práticos pós-assinatura"
      ],
      tips: ["Fique em silêncio logo após falar o preço da proposta. Deixe o cliente falar primeiro."],
      howToExecute: [
        "1. Posicione os valores financeiros como investimento estratégico de retorno, nunca como um custo ou despesa.",
        "2. Compare o valor mensal cobrado com a quantidade de vendas necessárias para o cliente pagar o serviço e lucrar.",
        "3. Crie gatilhos de ação rápida (ex: isenção do setup se fechar o contrato nas primeiras 24 horas).",
        "4. Mantenha absoluto silêncio logo após proferir o preço e aguarde a reação inicial do cliente para negociar."
      ]
    },
    cliente_fechado: {
      title: "Cliente Fechado",
      stage: "Vitória Comercial",
      metric: "LTV Iniciado",
      desc: "O marco do fechamento do contrato. O início oficial da parceria comercial onde a expectativa vira responsabilidade de entrega.",
      checklist: [
        "Emitir a primeira nota fiscal e fatura de setup",
        "Coletar assinatura formal do contrato de prestação de serviços",
        "Iniciar processo de onboarding imediatamente para manter o cliente empolgado",
        "Criar grupo de comunicação oficial com o cliente (WhatsApp / Slack)"
      ],
      tips: ["Celebre o fechamento, mas lembre-se: a venda de verdade começa agora na qualidade do onboarding."],
      howToExecute: [
        "1. Envie uma mensagem profissional e calorosa celebrando a nova parceria no WhatsApp comercial.",
        "2. Envie o formulário de Onboarding digital imediatamente para colher acessos técnicos, logotipos e dados da empresa.",
        "3. Crie o grupo oficial de comunicação (Slack ou WhatsApp) incluindo o time técnico envolvido no projeto.",
        "4. Agende e realize a reunião de Kickoff em até 5 dias para oficializar o cronograma e alinhar as primeiras entregas."
      ]
    },
    cliente_insatisfeito: {
      title: "Cliente Não Satisfeito",
      stage: "Alerta de Churn",
      metric: "Risco de Cancelamento",
      desc: "Ponto crítico de desalinhamento de expectativas ou falha de entrega técnica. Exige intervenção estratégica rápida para evitar cancelamentos e feedbacks negativos.",
      checklist: [
        "Realizar call de emergência para escutar as frustrações sem justificativas defensivas",
        "Refazer o planejamento estratégico realinhando prazos e KPIs",
        "Focar esforços do time sênior para entregar um resultado rápido (quick win)",
        "Oferecer bonificação ou compensação caso o erro tenha sido operacional da agência"
      ],
      tips: ["Um cliente salvo de uma insatisfação costuma se tornar o cliente mais fiel da sua carteira.", "Use a frase: 'Entendo perfeitamente sua frustração e vim te apresentar o plano exato para resolvermos isso.'"],
      howToExecute: [
        "1. Agende uma chamada de vídeo em menos de 24 horas após detectar o menor sinal de insatisfação do cliente.",
        "2. Pratique a escuta ativa: ouça todos os pontos de insatisfação sem debater ou apresentar justificativas técnicas defensivas.",
        "3. Monte um plano de ação emergencial focado em resolver as dores apontadas, definindo marcos curtos de 15 dias.",
        "4. Envolva os profissionais mais experientes da equipe para entregar um resultado rápido (quick win) e resgatar a confiança."
      ]
    },
    bom_relacionamento: {
      title: "Bom Relacionamento",
      stage: "Entrega & Sucesso",
      metric: "Confiança Recíproca",
      desc: "Comunicação transparente, relatórios de fácil compreensão e alinhamento constante. O cliente precisa se sentir seguro e informado de todos os passos da agência.",
      checklist: [
        "Enviar atualizações semanais resumidas por vídeo curto (Loom de 3 min)",
        "Manter respostas rápidas no canal de atendimento comercial",
        "Ser proativo em propor melhorias antes do cliente cobrar",
        "Tratar o cliente como um parceiro de crescimento de longo prazo"
      ],
      tips: ["Clientes não cancelam agências por falta de resultados rápidos se o relacionamento for extraordinário e transparente."],
      howToExecute: [
        "1. Envie atualizações quinzenais em formato de vídeo rápido via Loom (máximo 3 minutos) simplificando os dados principais.",
        "2. Garanta respostas no canal oficial em no máximo 2 horas úteis para manter o sentimento de atenção.",
        "3. Apresente melhorias, novos testes e otimizações de forma proativa antes que o cliente sinta necessidade de cobrar.",
        "4. Cultive uma comunicação humana, ouvindo e alinhando expectativas constantemente com empatia."
      ]
    },
    boa_entrega: {
      title: "Boa Entrega Técnica",
      stage: "Entrega & Sucesso",
      metric: "ROI Comprovado",
      desc: "Excelência técnica, campanhas de tráfego otimizadas, criativos que convertem e foco absoluto nas métricas de negócio do cliente (vendas e faturamento, não apenas curtidas).",
      checklist: [
        "Configurar pixels e conversões com precisão matemática",
        "Substituir criativos saturados de forma preventiva a cada 15 dias",
        "Fazer reuniões quinzenais de otimização de funil junto ao comercial do cliente",
        "Entregar relatórios focados no faturamento gerado pelo tráfego pago"
      ],
      tips: ["Métricas de vaidade (cliques, impressões) não mantêm contratos. Faturamento no bolso do cliente mantém."],
      howToExecute: [
        "1. Realize testes exaustivos e minuciosos na instalação de pixels, tags e rastreio de anúncios antes do lançamento operacional.",
        "2. Monitore o CPL diariamente e faça substituições criativas e textuais preventivamente a cada 15 dias para evitar saturação.",
        "3. Faça reuniões rápidas e diretas focadas no funil de vendas integrado do cliente (anúncios + comercial deles).",
        "4. Apresente relatórios financeiros focados no caixa e ROI obtido através do tráfego ou design."
      ]
    },
    cliente_satisfeito: {
      title: "Cliente Satisfeito",
      stage: "O Loop de Ouro",
      metric: "Fidelização & LTV",
      desc: "O cliente alcançou os resultados desejados e confia cegamente no trabalho da agência. Este é o ponto ideal para iniciar os loops de indicação, depoimentos e upsell de novos serviços.",
      checklist: [
        "Apresentar relatório mensal consolidado mostrando ROI altamente positivo",
        "Solicitar depoimento em vídeo gravado ou mensagem estruturada de WhatsApp",
        "Propor renovação do contrato para longo prazo com ampliação de escopo (Upsell)",
        "Ativar o mecanismo de indicações estruturadas para novos parceiros"
      ],
      tips: ["O custo de aquisição de um novo cliente é 5x maior que manter um atual. Faça da entrega sua maior arma de vendas."],
      howToExecute: [
        "1. Faça uma apresentação didática do balanço de faturamento mensal consolidando o retorno financeiro positivo gerado.",
        "2. Solicite um breve depoimento em vídeo ou mensagem de WhatsApp estruturada relatando a satisfação com a parceria.",
        "3. Apresente propostas naturais de Upsell para novos canais, serviços complementares de design de criativos ou escala de investimento.",
        "4. Lembre o cliente do programa de indicações e incentive-o a indicar outros amigos empresários da confiança dele."
      ]
    },
    depoimento_loop: {
      title: "Mecanismo de Depoimentos",
      stage: "Retroalimentação",
      metric: "Prova Social Inabalável",
      desc: "Transformar o sucesso do cliente em criativos e conteúdos altamente persuasivos que atrairão novos clientes qualificados pelo topo do funil.",
      checklist: [
        "Solicitar um depoimento em vídeo estruturado (Problema -> Jornada -> Resultado)",
        "Transformar o print de resultados do WhatsApp em post carrossel na rede social",
        "Criar um estudo de caso detalhado (Case Study) para a Página de Vendas",
        "Rodar anúncios pagos de remarketing utilizando o depoimento do cliente satisfeito"
      ],
      tips: ["Nada vende mais do que a prova social de um cliente igual a quem está assistindo.", "Use depoimentos específicos: 'A agência me fez faturar R$120k em 45 dias'."],
      howToExecute: [
        "1. Tire prints das mensagens espontâneas e positivas do cliente satisfeito no WhatsApp.",
        "2. Crie posts carrossel altamente atraentes contendo a história daquele resultado (Briefing -> Ajustes técnicos -> Sucesso).",
        "3. Utilize esses materiais em campanhas de tráfego pago de remarketing impactando leads que já conhecem sua marca.",
        "4. Coloque estes depoimentos de forma estruturada e visível no topo da sua biografia e da Landing Page."
      ]
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const selectedNodeData = selectedNode ? nodeDetails[selectedNode] : null;

  return (
    <div className="w-full space-y-8 pb-12">
      {/* SEÇÃO SUPERIOR: CONTROL PANEL & SIMULATOR */}
      <div className="bg-black/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c5a880] animate-pulse"></span>
              <h3 className="text-sm font-black text-[#c5a880] uppercase tracking-wider">
                Simulador Dinâmico do Funil
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Arraste os controles para simular as taxas de conversão e faturamento real gerado pelo fluxo do funil.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setVisitorCount(5000);
                setTicketMedio(3000);
              }}
              className="px-3 py-1.5 bg-[#111] hover:bg-zinc-700 transition text-zinc-300 rounded-lg text-2xs font-extrabold uppercase flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={10} />
              Resetar
            </button>
            <div className="bg-black px-3 py-1.5 rounded-lg border border-white/5 text-2xs font-black text-[#c5a880] uppercase">
              Modelo Matemático Ativo
            </div>
          </div>
        </div>

        {/* CONTROLES DO SIMULADOR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
          <div className="space-y-2 bg-black/50 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between text-2xs font-black text-zinc-400 uppercase">
              <span>Tráfego Inicial (Visitas/Mês)</span>
              <span className="text-[#c5a880]">{visitorCount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={visitorCount}
              onChange={(e) => setVisitorCount(parseInt(e.target.value))}
              className="w-full accent-[#c5a880]"
            />
            <div className="flex justify-between text-3xs text-zinc-500 font-mono">
              <span>500</span>
              <span>10.000</span>
              <span>20.000</span>
            </div>
          </div>

          <div className="space-y-2 bg-black/50 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between text-2xs font-black text-zinc-400 uppercase">
              <span>Ticket Médio Contrato (R$)</span>
              <span className="text-[#c5a880]">R$ {ticketMedio.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={ticketMedio}
              onChange={(e) => setTicketMedio(parseInt(e.target.value))}
              className="w-full accent-[#c5a880]"
            />
            <div className="flex justify-between text-3xs text-zinc-500 font-mono">
              <span>R$ 1k</span>
              <span>R$ 5k</span>
              <span>R$ 10k</span>
            </div>
          </div>

          <div className="space-y-1 bg-[#c5a880]/5 p-4 rounded-xl border border-[#c5a880]/15 flex flex-col justify-center">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              Contratos Fechados/Mês
            </span>
            <span className="text-2xl font-black text-white">
              {clientsClosed} <span className="text-xs text-[#c5a880]">Novos clientes</span>
            </span>
            <span className="text-3xs text-zinc-500 font-bold leading-tight">
              Taxa Geral de Conversão: ~{( (clientsClosed / visitorCount) * 100 ).toFixed(2)}%
            </span>
          </div>

          <div className="space-y-1 bg-[#c5a880]/5 p-4 rounded-xl border border-[#c5a880]/15 flex flex-col justify-center">
            <span className="text-[10px] font-black text-[#c5a880] uppercase tracking-wider">
              Faturamento Recorrente Novo (MRR)
            </span>
            <span className="text-2xl font-black text-[#c5a880]">
              R$ {monthlyRevenue.toLocaleString()}
            </span>
            <span className="text-3xs text-zinc-500 font-bold leading-tight">
              Aumento de capital estimado para a agência
            </span>
          </div>
        </div>
      </div>

      {/* EXPLICATIVO: LÓGICA DE CONEXÃO DE PONTA A PONTA */}
      <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-[#c5a880]/10 flex items-center justify-center text-[#c5a880]">
            <Sparkles size={16} />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Ecossistema Conectado: O Funil Antiprospecção de Ponta a Ponta
            </h4>
            <p className="text-[10px] text-zinc-400">
              Cada etapa alimenta a próxima de forma automática, eliminando a necessidade de buscar clientes manualmente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base */}
          <div className="space-y-2 text-left bg-black/40 p-4 rounded-xl border border-white/5 relative group hover:border-[#c5a880]/20 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#c5a880]/15 text-[#c5a880] flex items-center justify-center text-2xs font-extrabold">1</span>
              <span className="text-[10px] font-black text-[#c5a880] uppercase tracking-widest">A Base Fundamental</span>
            </div>
            <h5 className="text-xs font-bold text-zinc-100 uppercase">Plano de Negócios e ICP</h5>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Tudo começa com a definição do seu Plano de Negócios e do seu <strong>ICP (Indivíduo com Cara de Pix)</strong>. Sem isso, as conexões seguintes falham porque não há clareza de para quem você está vendendo.
            </p>
          </div>

          {/* O Fluxo */}
          <div className="space-y-2 text-left bg-black/40 p-4 rounded-xl border border-white/5 relative group hover:border-[#c5a880]/20 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#c5a880]/15 text-[#c5a880] flex items-center justify-center text-2xs font-extrabold">2</span>
              <span className="text-[10px] font-black text-[#c5a880] uppercase tracking-widest">O Fluxo do Funil</span>
            </div>
            <h5 className="text-xs font-bold text-zinc-100 uppercase">Conexão das Etapas</h5>
            <div className="space-y-1 text-[11px] text-zinc-450 leading-relaxed">
              <p>• <strong className="text-zinc-300">Topo (Atração):</strong> Tráfego orgânico/pago ou prospecção sniper direcionando leads para o seu Instagram.</p>
              <p>• <strong className="text-zinc-300">Meio (Qualificação):</strong> Perfil, Portfólio (Behance) e Site funcionam como filtros de autoridade.</p>
              <p>• <strong className="text-zinc-300">Fundo (Interação/Oferta):</strong> No WhatsApp, perguntas estratégicas extraem as dores antes de apresentar o preço.</p>
            </div>
          </div>

          {/* O Ciclo */}
          <div className="space-y-2 text-left bg-black/40 p-4 rounded-xl border border-white/5 relative group hover:border-[#c5a880]/20 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#c5a880]/15 text-[#c5a880] flex items-center justify-center text-2xs font-extrabold">3</span>
              <span className="text-[10px] font-black text-[#c5a880] uppercase tracking-widest">O Ciclo de Retroalimentação</span>
            </div>
            <h5 className="text-xs font-bold text-zinc-100 uppercase">A Roda Antiprospecção</h5>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              A <strong>Boa Entrega e o Bom Relacionamento</strong> fecham e reiniciam o funil. Um cliente bem atendido gera depoimentos/resultados, que viram novos conteúdos no Instagram, reforçando seu posicionamento e atraindo mais leads qualificados sem custo extra.
            </p>
          </div>
        </div>

        {/* Resumo da Lógica */}
        <div className="bg-black/80 border border-[#c5a880]/10 p-3.5 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-black text-[#c5a880] uppercase tracking-wider shrink-0 bg-[#c5a880]/10 px-2 py-0.5 rounded">
            Resumo da Lógica de Conexão
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-3xs font-mono font-bold text-zinc-300">
            <span className="bg-black border border-white/5 px-2 py-1 rounded">ICP / Plano</span>
            <span className="text-[#c5a880]">➔</span>
            <span className="bg-black border border-white/5 px-2 py-1 rounded">Comunicação</span>
            <span className="text-[#c5a880]">➔</span>
            <span className="bg-black border border-[#c5a880]/20 px-2 py-1 rounded text-[#c5a880]">Posicionamento</span>
            <span className="text-[#c5a880]">➔</span>
            <span className="bg-black border border-white/5 px-2 py-1 rounded">Qualificação de Lead</span>
            <span className="text-[#c5a880]">➔</span>
            <span className="bg-black border border-white/5 px-2 py-1 rounded text-white">Venda Fechada</span>
            <span className="text-[#c5a880]">➔</span>
            <span className="bg-black border border-[#c5a880]/20 px-2 py-1 rounded text-[#c5a880]">Resultado / Depoimento</span>
            <span className="text-[#c5a880]">➔</span>
            <span className="bg-black border border-[#c5a880]/40 px-2 py-1 rounded text-white font-extrabold">Posicionamento Reforçado (Loop)</span>
          </div>
        </div>
      </div>

      {/* COMPONENTE DO MAPA VISUAL DO FUNIL */}
      <div className="relative bg-black border border-white/5 rounded-3xl p-6 overflow-hidden shadow-2xl">
        {/* Grid dots background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Divisor de Região Visual (Fronteira Atração / Retenção) */}
        <div className="absolute top-[340px] left-0 right-0 h-[2px] bg-[#c5a880]/10 border-t border-dashed border-[#c5a880]/30 z-0">
          <span className="absolute top-1 right-6 text-3xs text-[#c5a880] uppercase font-black tracking-wider bg-black px-2 py-0.5 rounded-full border border-[#c5a880]/20 shadow-sm">
            Linha de Qualificação / Divisão de Ambientes
          </span>
        </div>

        {/* FUNIL CANVAS CONTAINER */}
        <div className="relative z-10 w-full min-w-[900px] overflow-x-auto select-none py-8 space-y-12">
          
          {/* =========================================================================
              CAMADA 0: A BASE FUNDAMENTAL (PLANO DE NEGÓCIOS & ICP)
              ========================================================================= */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-white/5 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => handleNodeClick("plano_icp")}
              className={`cursor-pointer w-full max-w-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border-2 rounded-2xl p-4 shadow-xl flex items-center gap-4 transition-all ${
                selectedNode === "plano_icp" ? "border-[#c5a880] shadow-[#c5a880]/15" : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#ad8330] text-zinc-950 flex items-center justify-center shrink-0 shadow-lg shadow-[#c5a880]/10">
                <Target size={22} className="text-black" />
              </div>
              <div className="flex-1 text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#c5a880] tracking-widest bg-[#c5a880]/10 px-1.5 py-0.5 rounded">PASSO 1: A BASE</span>
                  <span className="text-[10px] text-zinc-500 font-bold">• O início de tudo</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Plano de Negócios & ICP</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Definição do seu posicionamento estratégico e do seu <strong>ICP (Indivíduo com Cara de Pix)</strong>. Toque para ver o checklist e dicas de mestre.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[9px] bg-[#c5a880]/20 text-[#c5a880] px-2 py-0.5 rounded-full uppercase font-black tracking-wider">Fundação</span>
                <ChevronDown size={16} className={`text-[#c5a880] transition-transform duration-300 ${selectedNode === "plano_icp" ? "rotate-180" : ""}`} />
              </div>
            </motion.div>
            
            {/* Downward connecting line from Base to Atração */}
            <div className="h-6 w-[2px] bg-gradient-to-b from-[#c5a880]/40 to-transparent mt-3"></div>
          </div>
          
          {/* =========================================================================
              CAMADA 1 E 2 UNIFICADAS: CANVAS DO ECOSSISTEMA INTERATIVO
              ========================================================================= */}
          <div className="relative w-[1000px] h-[1650px] mx-auto select-none mt-4">
            
            {/* SVG OVERLAY FOR PRECISION CONNECTING PATHS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 1650" fill="none">
              <defs>
                <marker id="blue-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                </marker>
                <marker id="blue-arrow-dashed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" opacity="0.8" />
                </marker>
                <marker id="gold-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#c5a880" />
                </marker>
                <marker id="green-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#25d366" />
                </marker>
              </defs>

              {/* CAMADA 1: PATHS FROM INPUTS TO CENTRAL HUB */}
              {/* Pesca em Balde to left edge of Instagram Hub */}
              <path d="M 148 400 C 230 400, 270 340, 362 340" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Conteúdo N3 to left edge of Instagram Hub */}
              <path d="M 148 280 C 210 280, 260 340, 362 340" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Busca SEO to left edge of Instagram Hub */}
              <path d="M 198 160 C 240 160, 280 340, 362 340" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Behance Intencional to top-left edge of Instagram Hub */}
              <path d="M 255 140 C 275 220, 310 340, 362 340" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Prospecção Sniper to top edge of Instagram Hub */}
              <path d="M 475 128 C 475 150, 485 160, 485 192" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Indicações to top edge of Instagram Hub */}
              <path d="M 630 128 C 630 155, 525 155, 525 192" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Tráfego Gratuito to right edge of Instagram Hub */}
              <path d="M 767 160 C 705 160, 680 340, 638 340" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* [1] Tráfego Pago to right edge of Instagram Hub */}
              <path d="M 867 280 C 790 280, 710 340, 638 340" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* Line from Instagram Posicionado to [2] Tráfego Pago */}
              <path d="M 630 340 C 690 380, 740 450, 740 580" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />

              {/* CAMADA 2: DOWNWARD PATHS FROM HUB TO LINK BIO */}
              {/* Instagram Hub bottom edge to Link Bio top */}
              <path d="M 500 480 L 500 512" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#blue-arrow)" />

              {/* LINE FROM INSTAGRAM POSICIONADO TO QUALIFICAÇÃO */}
              <path d="M 370 450 C 310 470, 260 510, 260 580" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />

              {/* PATHS FROM SIDES TO LINK BIO MOBILE MOCKUP */}
              {/* Qualificação to Link Bio Mockup */}
              <path d="M 310 638 L 382 638" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />
              
              {/* [2] Tráfego Pago to Link Bio Mockup */}
              <path d="M 690 638 L 618 638" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow)" />

              {/* PATHS FROM LINK BIO MOCKUP TO SALES ASSETS */}
              {/* Link Bio to Behance Intencional (Emerges from the bottom of Link Bio mockup and routes cleanly) */}
              <path d="M 440 740 C 440 780, 285 770, 285 814" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#blue-arrow)" />
              
              {/* Link Bio to Página de Vendas (VSL) (Emerges from the bottom of Link Bio mockup and routes cleanly) */}
              <path d="M 560 740 C 550 780, 715 770, 715 814" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#blue-arrow)" />

              {/* Link Bio directly to WhatsApp (Goes externally far around the left to avoid touching any elements) */}
              <path d="M 390 680 C -50 680, -50 1070, 410 1070" stroke="#25d366" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#green-arrow)" />

              {/* Vertical Text Label for direct WhatsApp line, balanced in the clearance gap */}
              <text x="105" y="870" fill="#25d366" className="text-[9px] font-black uppercase tracking-wider select-none pointer-events-none opacity-85" transform="rotate(-90 105 870)">
                WhatsApp Direto (Link da Bio)
              </text>

              {/* PATHS FROM SALES ASSETS TO WHATSAPP */}
              {/* Behance Intencional to WhatsApp */}
              <path d="M 285 990 C 285 1025, 420 1045, 465 1050" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />
              
              {/* Página de Vendas (VSL) to WhatsApp */}
              <path d="M 715 990 C 715 1025, 580 1045, 535 1050" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />

              {/* SEPARATE PATHS FROM WHATSAPP TO REUNIÃO, PROPOSTA, MENSAGEM */}
              {/* WhatsApp to Reunião */}
              <path d="M 500 1110 C 500 1170, 260 1170, 260 1230" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />
              
              {/* WhatsApp to Proposta */}
              <path d="M 500 1110 L 500 1230" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />
              
              {/* WhatsApp to Mensagem */}
              <path d="M 500 1110 C 500 1170, 740 1170, 740 1230" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />

              {/* PATHS FROM REUNIÃO, PROPOSTA, MENSAGEM TO OFERTA APRESENTADA */}
              {/* Reunião to Oferta Apresentada */}
              <path d="M 260 1290 C 260 1350, 500 1350, 500 1410" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />
              
              {/* Proposta to Oferta Apresentada */}
              <path d="M 500 1290 L 500 1410" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />
              
              {/* Mensagem to Oferta Apresentada */}
              <path d="M 740 1290 C 740 1350, 500 1350, 500 1410" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />

              {/* Arrow down from Oferta Apresentada to next section */}
              <path d="M 500 1470 L 500 1550" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed)" />
            </svg>

            {/* ==========================================
                CAMADA 1 NODES (ABSOLUTELY POSITIONED)
                ========================================== */}
            
            {/* Pesca em Balde */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("pesca_balde")}
              className={`absolute cursor-pointer flex flex-col items-center gap-1.5 transition-all z-10 ${selectedNode === "pesca_balde" ? "scale-110" : ""}`}
              style={{ left: "70px", top: "350px", width: "100px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">Pesca em Balde</div>
              <div className="w-14 h-14 rounded-full bg-[#e1306c] flex items-center justify-center text-white shadow-lg border border-white/5 relative">
                <Instagram size={20} />
                <div className="absolute -top-1 -right-1 bg-black border border-[#c5a880]/30 px-1 py-0.5 rounded-full text-[7px] font-black text-[#c5a880] uppercase">Active</div>
              </div>
            </motion.div>

            {/* Conteúdo N3 */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("conteudo")}
              className={`absolute cursor-pointer flex flex-col items-center gap-1.5 transition-all z-10 ${selectedNode === "conteudo" ? "scale-110" : ""}`}
              style={{ left: "70px", top: "230px", width: "100px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">Conteúdo N3</div>
              <div className="w-14 h-14 rounded-full bg-[#e1306c] flex items-center justify-center text-white shadow-lg border border-white/5 relative">
                <Instagram size={20} />
                {selectedNode === "conteudo" && <div className="absolute inset-0 rounded-full border border-[#c5a880] animate-ping opacity-75"></div>}
              </div>
            </motion.div>

            {/* Busca SEO */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("busca_seo")}
              className={`absolute cursor-pointer flex flex-col items-center gap-1.5 transition-all z-10 ${selectedNode === "busca_seo" ? "scale-110" : ""}`}
              style={{ left: "120px", top: "110px", width: "100px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">Busca SEO</div>
              <div className="w-14 h-14 rounded-full bg-[#e1306c] flex items-center justify-center text-white shadow-lg border border-white/5 relative">
                <Instagram size={20} />
              </div>
            </motion.div>

            {/* Behance Intencional Mockup */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleNodeClick("behance_intencional")}
              className={`absolute cursor-pointer transition-all z-10 ${selectedNode === "behance_intencional" ? "scale-105" : ""}`}
              style={{ left: "200px", top: "30px", width: "110px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center pb-1">Behance Intencional</div>
              <div className="w-full h-24 bg-black border border-white/5 rounded-lg overflow-hidden shadow-md flex flex-col">
                {/* Browser Bar */}
                <div className="flex items-center gap-1 bg-black px-2 py-1 border-b border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="flex-1 bg-black rounded px-1.5 py-0.5 text-[6px] text-zinc-500 text-center truncate">
                    behance.net/portfolio
                  </div>
                </div>
                {/* Page Content */}
                <div className="p-1.5 grid grid-cols-2 gap-1 flex-1 overflow-hidden bg-black">
                  <div className="bg-[#111] rounded-xs flex items-center justify-center text-[8px] font-black text-white p-1">
                    Be
                  </div>
                  <div className="bg-black rounded-xs p-1 flex flex-col gap-0.5">
                    <div className="h-1 bg-zinc-750 w-full rounded-xs"></div>
                    <div className="h-1 bg-zinc-750 w-2/3 rounded-xs"></div>
                  </div>
                  <div className="bg-black aspect-video rounded-xs"></div>
                  <div className="bg-black aspect-video rounded-xs"></div>
                </div>
              </div>
            </motion.div>

            {/* Prospecção Sniper */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("pesca_balde")}
              className="absolute cursor-pointer flex flex-col items-center gap-1.5 z-10"
              style={{ left: "420px", top: "50px", width: "110px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">Prospecção Sniper</div>
              <div className="w-14 h-14 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-lg border border-white/5">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.15-.31.3-.46.45-1.51 1.51-3.02 3.01-4.54 4.52-.16.16-.32.32-.49.46l-2.07.69c-.19.06-.35-.11-.29-.3l.69-2.07c.14-.17.3-.33.46-.49l4.52-4.54c.15-.15.3-.31.45-.46a.71.71 0 0 1 1-.02l.75.75c.29.28.29.74-.01 1.02z" />
                </svg>
              </div>
            </motion.div>

            {/* Indicações */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("indicacoes")}
              className={`absolute cursor-pointer flex flex-col items-center gap-1.5 transition-all z-10 ${selectedNode === "indicacoes" ? "scale-110" : ""}`}
              style={{ left: "580px", top: "50px", width: "100px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">Indicações</div>
              <div className="w-14 h-14 rounded-full bg-[#25d366] flex items-center justify-center text-white shadow-lg border border-white/5">
                <Share2 size={20} className="text-white" />
              </div>
            </motion.div>

            {/* Tráfego Gratuito */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("trafego_gratuito")}
              className={`absolute cursor-pointer flex flex-col items-center gap-1.5 transition-all z-10 ${selectedNode === "trafego_gratuito" ? "scale-110" : ""}`}
              style={{ left: "745px", top: "110px", width: "100px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">Tráfego Gratuito</div>
              <div className="w-14 h-14 rounded-full bg-black border-2 border-white/5 flex items-center justify-center text-white shadow-lg">
                <Zap size={20} className="text-white" fill="currentColor" />
              </div>
            </motion.div>

            {/* [1] Tráfego Pago */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              onClick={() => handleNodeClick("trafego_pago")}
              className={`absolute cursor-pointer flex flex-col items-center gap-1.5 transition-all z-10 ${selectedNode === "trafego_pago" ? "scale-110" : ""}`}
              style={{ left: "845px", top: "230px", width: "100px" }}
            >
              <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight">[1] Tráfego Pago</div>
              <div className="w-14 h-14 rounded-full bg-[#e1306c] flex items-center justify-center text-white shadow-lg border border-white/5 relative">
                <Instagram size={20} />
                <div className="absolute -bottom-1 -right-1 bg-white w-5 h-5 rounded-full flex items-center justify-center text-[#e1306c] text-[10px] font-black shadow-md border border-[#e1306c]/15">$</div>
              </div>
            </motion.div>

            {/* ==========================================
                HUB CENTRAL: INSTAGRAM POSICIONADO
                ========================================== */}
            <div
              className="absolute bg-teal-950/10 border border-[#3b82f6]/20 rounded-2xl p-4 flex flex-col items-center shadow-lg"
              style={{ left: "370px", top: "200px", width: "260px", height: "280px" }}
            >
              <span className="text-[10px] font-black uppercase text-[#3b82f6] tracking-wider mb-2">Instagram Posicionado</span>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNodeClick("instagram_posicionado")}
                className={`w-full bg-black rounded-xl border transition-all cursor-pointer p-3.5 shadow-2xl overflow-hidden relative flex-1 flex flex-col justify-between ${
                  selectedNode === "instagram_posicionado" ? "border-[#c5a880] shadow-[#c5a880]/15" : "border-zinc-850 hover:border-zinc-800"
                }`}
              >
                {/* Profile Info */}
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-full border border-[#c5a880] p-0.5 bg-black overflow-hidden flex items-center justify-center font-black text-[9px] text-white">
                    ZION
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="text-[10px] font-extrabold text-white">agencia_zion</div>
                    <div className="text-[8px] text-[#c5a880] font-bold">Design & Tráfego Premium</div>
                  </div>
                </div>

                {/* Bio */}
                <div className="text-[8px] text-zinc-400 pt-1.5 leading-normal flex-1">
                  ⚙️ Criamos funis de vendas de altíssimo ticket.<br/>
                  💼 O fim da prospecção fria.<br/>
                  📈 <span className="text-[#c5a880] font-bold">Aperte no link abaixo</span> e mude sua escala:
                </div>

                {/* Link bio mock */}
                <div className="mt-1 p-1 bg-black rounded text-center text-[8px] font-black text-[#c5a880] uppercase tracking-wider border border-white/5 flex items-center justify-center gap-1">
                  <Link size={8} />
                  linktree.ms/zion_agencia
                </div>

                {/* Grid Preview (3 items) */}
                <div className="grid grid-cols-3 gap-1 pt-2">
                  <div className="aspect-square bg-black border border-white/5 rounded-xs flex flex-col justify-end p-0.5">
                    <span className="text-[6px] font-black text-[#c5a880] text-center">CASE</span>
                  </div>
                  <div className="aspect-square bg-[#c5a880] rounded-xs flex flex-col justify-end p-0.5">
                    <span className="text-[6px] font-black text-black text-center">MÉTODO</span>
                  </div>
                  <div className="aspect-square bg-black border border-white/5 rounded-xs flex flex-col justify-end p-0.5">
                    <span className="text-[6px] font-black text-[#c5a880] text-center">DEPOIMENTOS</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ==========================================
                CAMADA 2 NODES: CENTRAL LINK BIO MOCKUP + QUALIFICAÇÃO + TRÁFEGO PAGO [2]
                ========================================== */}
            
            {/* Qualificação (Red Diamond Play Button - Left side) */}
            <div className="absolute" style={{ left: "210px", top: "590px", width: "100px" }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={() => handleNodeClick("qualificacao_vsl")}
                className={`cursor-pointer flex flex-col items-center gap-1.5 transition-all ${
                  selectedNode === "qualificacao_vsl" ? "scale-110" : ""
                }`}
              >
                <div className="text-[10px] text-zinc-300 font-extrabold uppercase tracking-wide text-center">Qualificação</div>
                <div className="w-12 h-12 bg-red-600 rotate-45 flex items-center justify-center text-white shadow-xl relative rounded-md border border-white/5 hover:bg-red-500 transition-colors">
                  <div className="-rotate-45">
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>
                <div className="text-[8px] text-zinc-500 uppercase font-black">YouTube / VSL</div>
              </motion.div>
            </div>

            {/* Link Bio - Vertical Mobile Mockup (Center) */}
            <div className="absolute" style={{ left: "390px", top: "520px", width: "220px" }}>
              <div className="text-[10px] text-zinc-400 font-black uppercase text-center tracking-widest pb-1.5">Link Bio</div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNodeClick("link_bio")}
                className={`cursor-pointer w-full bg-black border-2 rounded-2xl overflow-hidden shadow-2xl transition-all ${
                  selectedNode === "link_bio" ? "border-[#c5a880] shadow-[#c5a880]/10" : "border-white/5 hover:border-white/20"
                }`}
              >
                {/* Browser Bar */}
                <div className="flex items-center gap-1 bg-black px-2 py-1.5 border-b border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="flex-1 bg-black rounded px-1.5 py-0.5 text-[6px] text-zinc-500 text-center truncate">
                    zion.ag/bio
                  </div>
                </div>
                {/* Mobile Screen Content */}
                <div className="p-2 space-y-1.5 bg-black h-[190px] overflow-y-auto scrollbar-none text-left">
                  {/* Mini Profile Header */}
                  <div className="flex flex-col items-center text-center pb-1.5 border-b border-white/5">
                    <div className="w-7 h-7 rounded-full border border-[#c5a880] p-0.5 bg-black overflow-hidden flex items-center justify-center font-black text-[7px] text-white">
                      ZION
                    </div>
                    <div className="text-[7px] font-extrabold text-white mt-0.5">@agencia_zion</div>
                  </div>
                  {/* Mock Button 1 */}
                  <div className="p-1 bg-black rounded border border-white/5 text-center text-[7px] font-bold text-[#c5a880]">
                    💼 Ver Portfólio Premium
                  </div>
                  {/* Mock Button 2 */}
                  <div className="p-1 bg-[#c5a880] rounded text-center text-[7px] font-black text-black">
                    ⚡ Quero meu Funil de Vendas
                  </div>
                   {/* Mock Button 3 */}
                  <div className="p-1 bg-[#25d366]/10 rounded border border-[#25d366]/30 text-center text-[7px] font-extrabold text-[#25d366] flex items-center justify-center gap-1 hover:bg-[#25d366]/20 transition-all">
                    <span>💬</span> Falar no WhatsApp (Direto)
                  </div>
                </div>
                {activeSim && (
                  <div className="text-[8px] text-[#c5a880] font-black bg-[#c5a880]/10 py-1 border-t border-[#c5a880]/10 text-center">
                    {linkBioVisitors.toLocaleString()} cliques/mês
                  </div>
                )}
              </motion.div>
            </div>

            {/* [2] Tráfego Pago (Instagram Coin - Right side) */}
            <div className="absolute" style={{ left: "690px", top: "590px", width: "100px" }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={() => handleNodeClick("trafego_pago")}
                className={`cursor-pointer flex flex-col items-center gap-1.5 transition-all ${
                  selectedNode === "trafego_pago" ? "scale-110" : ""
                }`}
              >
                <div className="text-[10px] text-zinc-300 font-extrabold text-center leading-tight uppercase">[2] Tráfego Pago</div>
                <div className="w-14 h-14 rounded-full bg-[#e1306c] flex items-center justify-center text-white shadow-lg border border-white/5 relative">
                  <Instagram size={20} />
                  <div className="absolute -bottom-1 -right-1 bg-white w-5 h-5 rounded-full flex items-center justify-center text-[#e1306c] text-[10px] font-black shadow-md border border-[#e1306c]/15">$</div>
                </div>
                <div className="text-[8px] text-zinc-500 uppercase font-black">Meta Ads / Insta</div>
              </motion.div>
            </div>

            {/* ==========================================
                CAMADA 3 NODES: SALES ASSETS (BEHANCE & PÁGINA DE VENDAS)
                ========================================== */}
            
            {/* ==========================================
                CAMADA 3 NODES: SALES ASSETS (BEHANCE & PÁGINA DE VENDAS)
                ========================================== */}
            
            {/* Left Asset: Behance Intencional Details */}
            <div className="absolute" style={{ left: "165px", top: "820px", width: "240px" }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => handleNodeClick("behance_intencional")}
                className={`cursor-pointer w-full bg-zinc-100 border-2 rounded-2xl overflow-hidden shadow-2xl transition-all ${
                  selectedNode === "behance_intencional" ? "border-[#c5a880] shadow-[#c5a880]/15" : "border-white/5 hover:border-white/20"
                }`}
              >
                {/* Browser Bar */}
                <div className="flex items-center gap-1 bg-zinc-200 px-2 py-1.5 border-b border-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="flex-1 bg-white rounded px-1.5 py-0.5 text-[5px] text-zinc-400 text-center truncate select-none">
                    behance.net/zion_agency
                  </div>
                </div>
                
                {/* Behance Portal Content (Split Layout: Sidebar & Project Grid) */}
                <div className="flex h-[135px] bg-white text-zinc-950 font-sans">
                  {/* Left Column: Sidebar */}
                  <div className="w-[65px] bg-zinc-50 border-r border-zinc-200 p-1.5 flex flex-col items-center justify-between">
                    <div className="flex flex-col items-center">
                      {/* Avatar with gradient */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-800 p-0.5 border border-zinc-200 flex items-center justify-center font-black text-[7px] text-white shadow-sm mt-0.5">
                        ZION
                      </div>
                      <div className="text-[6px] font-black text-zinc-900 mt-1 uppercase text-center leading-tight">Zion Agencia</div>
                      <div className="text-[4px] text-zinc-400 font-medium text-center leading-none mt-0.5">São Paulo, BR</div>
                    </div>
                    
                    {/* Follow button */}
                    <div className="w-full bg-blue-600 text-white text-[4.5px] font-bold py-0.5 rounded shadow-xs text-center select-none hover:bg-blue-700 mb-0.5">
                      Seguir
                    </div>
                    
                    {/* Decorative lines for stats */}
                    <div className="w-full space-y-0.5 border-t border-zinc-200 pt-1">
                      <div className="flex justify-between items-center text-[3.5px] font-bold text-zinc-400">
                        <span>Cases</span>
                        <span className="text-zinc-600">12</span>
                      </div>
                      <div className="flex justify-between items-center text-[3.5px] font-bold text-zinc-400">
                        <span>Acessos</span>
                        <span className="text-zinc-600">89k</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Project Grid */}
                  <div className="flex-1 p-1.5 flex flex-col">
                    <div className="text-[5px] font-black text-zinc-400 uppercase tracking-widest mb-1">Portfolio Premium</div>
                    <div className="grid grid-cols-2 gap-1 overflow-y-auto scrollbar-none flex-1">
                      {/* Card 1 */}
                      <div className="rounded overflow-hidden h-[34px] relative bg-gradient-to-br from-[#c5a880] to-zinc-900 p-1 flex flex-col justify-between shadow-xs">
                        <div className="text-[4px] font-black text-white leading-none uppercase bg-black/40 px-1 py-0.5 rounded-xs w-fit">
                          Design System
                        </div>
                        <div className="text-[3px] text-zinc-300 flex justify-between">
                          <span>👁️ 1.2k</span>
                          <span>❤️ 450</span>
                        </div>
                      </div>
                      {/* Card 2 */}
                      <div className="rounded overflow-hidden h-[34px] relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 flex flex-col justify-between shadow-xs">
                        <div className="text-[4px] font-black text-white leading-none uppercase bg-black/40 px-1 py-0.5 rounded-xs w-fit">
                          Web N3
                        </div>
                        <div className="text-[3px] text-zinc-300 flex justify-between">
                          <span>👁️ 3.1k</span>
                          <span>❤️ 890</span>
                        </div>
                      </div>
                      {/* Card 3 */}
                      <div className="rounded overflow-hidden h-[34px] relative bg-gradient-to-br from-emerald-400 to-teal-600 p-1 flex flex-col justify-between shadow-xs">
                        <div className="text-[4px] font-black text-white leading-none uppercase bg-black/40 px-1 py-0.5 rounded-xs w-fit">
                          Brand Identity
                        </div>
                        <div className="text-[3px] text-zinc-300 flex justify-between">
                          <span>👁️ 890</span>
                          <span>❤️ 320</span>
                        </div>
                      </div>
                      {/* Card 4 */}
                      <div className="rounded overflow-hidden h-[34px] relative bg-gradient-to-br from-zinc-800 to-zinc-950 p-1 flex flex-col justify-between shadow-xs border border-white/5">
                        <div className="text-[4px] font-black text-white leading-none uppercase bg-black/40 px-1 py-0.5 rounded-xs w-fit">
                          Social Growth
                        </div>
                        <div className="text-[3px] text-zinc-300 flex justify-between">
                          <span>👁️ 2.4k</span>
                          <span>❤️ 1.1k</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Simulation / Stats info overlay */}
                {activeSim && (
                  <div className="text-[8px] text-[#c5a880] font-black bg-black py-1 border-t border-white/5 text-center">
                    Cliques: {Math.round(assetVisitors * 0.4).toLocaleString()} /mês
                  </div>
                )}
              </motion.div>
              <div className="text-center text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest mt-1.5">Behance Intencional</div>
            </div>

            {/* Right Asset: Página de Vendas (VSL) */}
            <div className="absolute" style={{ left: "595px", top: "820px", width: "240px" }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => handleNodeClick("pagina_vendas")}
                className={`cursor-pointer w-full bg-black border-2 rounded-2xl overflow-hidden shadow-2xl transition-all ${
                  selectedNode === "pagina_vendas" ? "border-[#c5a880] shadow-[#c5a880]/15" : "border-white/5 hover:border-white/20"
                }`}
              >
                {/* Browser Bar */}
                <div className="flex items-center gap-1 bg-black px-2 py-1.5 border-b border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <div className="flex-1 bg-black rounded px-1.5 py-0.5 text-[5px] text-zinc-500 text-center truncate select-none">
                    zion.ag/vendas
                  </div>
                </div>

                {/* Sales Page Content (Hero & Video section) */}
                <div className="p-2 space-y-1.5 bg-black h-[135px] flex flex-col justify-between text-left">
                  <div className="flex gap-2 flex-1 items-center">
                    {/* Left Hero Column */}
                    <div className="flex-1 space-y-1">
                      <div className="text-[5px] font-black text-[#c5a880] uppercase tracking-wider">Metodologia N3</div>
                      <div className="text-[8px] font-black text-white leading-tight uppercase">COMO ESCALAR SUA AGÊNCIA</div>
                      <div className="text-[4px] text-zinc-400 leading-snug">
                        Assista ao vídeo curto e aprenda como captar e filtrar leads qualificados em piloto automático.
                      </div>
                      
                      {/* Mini CTA button */}
                      <div className="bg-[#c5a880] hover:bg-[#b0936d] text-zinc-950 text-[4.5px] font-black py-0.5 px-1.5 rounded-xs w-fit flex items-center gap-0.5 shadow-sm select-none">
                        ASSISTIR VSL <Play size={4} fill="currentColor" />
                      </div>
                    </div>

                    {/* Right Video Mockup Column (Highly Styled) */}
                    <div className="w-[105px] h-[95px] bg-black rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner group">
                      {/* Ambient Background Light Overlay */}
                      <div className="absolute inset-0 bg-radial-gradient from-[#c5a880]/20 to-transparent pointer-events-none"></div>
                      
                      {/* Abstract SVG Portrait Face with Glasses (Highly polished, resembling Lorenzi) */}
                      <svg className="w-full h-full absolute inset-0 z-0" viewBox="0 0 105 95" fill="none">
                        {/* Shoulder silhouette */}
                        <path d="M 15 95 C 20 70, 85 70, 90 95 Z" fill="#18181b" />
                        {/* Neck */}
                        <rect x="44" y="62" width="17" height="15" rx="3" fill="#2e2e33" />
                        {/* Face */}
                        <rect x="35" y="22" width="35" height="42" rx="10" fill="#3f3f46" />
                        {/* Hair */}
                        <path d="M 33 26 C 33 12, 72 12, 72 26 C 65 18, 40 18, 33 26 Z" fill="#18181b" />
                        {/* Thick Black Glasses */}
                        <g stroke="#09090b" strokeWidth="2.5">
                          {/* Left lens frame */}
                          <rect x="38" y="34" width="13" height="9" rx="2.5" fill="none" />
                          {/* Right lens frame */}
                          <rect x="54" y="34" width="13" height="9" rx="2.5" fill="none" />
                          {/* Bridge */}
                          <line x1="51" y1="38" x2="54" y2="38" />
                          {/* Left temple */}
                          <line x1="35" y1="36" x2="38" y2="36" />
                          {/* Right temple */}
                          <line x1="67" y1="36" x2="70" y2="36" />
                        </g>
                        {/* Sleek Golden Earring or highlights */}
                        <circle cx="36" cy="48" r="1" fill="#c5a880" />
                        <circle cx="69" cy="48" r="1" fill="#c5a880" />
                      </svg>

                      {/* Play Button Overlay */}
                      <div className="absolute w-7 h-7 bg-black/60 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-xs shadow-lg group-hover:scale-110 transition-transform z-10">
                        <Play size={10} className="text-white ml-0.5" fill="currentColor" />
                      </div>

                      {/* Video Scrubber and Control Bar */}
                      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40 backdrop-blur-xs flex items-center px-1 justify-between z-10 border-t border-white/5">
                        <div className="flex-1 h-0.5 bg-zinc-700 rounded-full overflow-hidden mr-1">
                          <div className="w-[45%] h-full bg-[#c5a880]"></div>
                        </div>
                        <span className="text-[4px] text-zinc-400 font-mono">03:14 / 08:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {activeSim && (
                  <div className="text-[8px] text-[#c5a880] font-black bg-black py-1 border-t border-white/5 text-center">
                    Cliques: {Math.round(assetVisitors * 0.6).toLocaleString()} /mês
                  </div>
                )}
              </motion.div>
              <div className="text-center text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest mt-1.5">Página de Vendas (VSL)</div>
            </div>

            {/* WhatsApp Node */}
            <div className="absolute" style={{ left: "410px", top: "1040px", width: "180px" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNodeClick("whatsapp")}
                className={`cursor-pointer w-full flex flex-col items-center gap-1 transition-all ${
                  selectedNode === "whatsapp" ? "scale-105" : ""
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#25d366] flex items-center justify-center text-white shadow-2xl hover:shadow-[#25d366]/40 relative">
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.977 0c3.222.001 6.25 1.257 8.526 3.536 2.277 2.278 3.531 5.308 3.53 8.532-.003 6.643-5.327 11.968-11.977 11.968-2.002-.001-3.971-.5-5.744-1.452L0 24zm6.59-4.846c1.6.95 3.197 1.452 4.817 1.453 5.461 0 9.902-4.441 9.905-9.905.002-2.646-1.027-5.133-2.9-7.007C16.592 1.82 14.108.79 11.464.79c-5.462 0-9.904 4.441-9.908 9.905-.001 1.761.479 3.48 1.392 5.002L1.884 21.92l6.22-1.63a9.83 9.83 0 0 0 4.543 1.115zm10.605-7.464c-.29-.146-1.722-.85-1.99-.948-.267-.097-.463-.146-.657.146-.194.291-.749.948-.919 1.14-.17.194-.34.218-.63.073-.29-.146-1.229-.453-2.34-1.445-.864-.772-1.448-1.725-1.618-2.017-.17-.29-.018-.447.127-.592.13-.13.29-.34.436-.509.145-.17.194-.291.29-.485.097-.194.049-.364-.025-.509-.073-.146-.657-1.583-.9-2.171-.237-.57-.478-.492-.658-.501-.17-.008-.364-.01-.557-.01-.194 0-.509.073-.776.364-.267.29-1.02.996-1.02 2.43 0 1.434 1.043 2.817 1.189 3.012.146.194 2.054 3.136 4.975 4.394.694.3 1.237.478 1.66.612.698.222 1.334.191 1.838.116.561-.083 1.722-.704 1.965-1.385.243-.68.243-1.263.17-1.385-.073-.122-.267-.194-.557-.34z" />
                  </svg>
                  {activeSim && (
                    <div className="absolute -top-1 -right-3 bg-black border border-[#25d366]/30 px-2 py-0.5 rounded-full text-[8px] font-black text-[#25d366] uppercase animate-none">
                      {whatsAppContacts.toLocaleString()} leads
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-black text-white tracking-wide uppercase text-center mt-1">WhatsApp Comercial</div>
                <div className="text-[8px] text-zinc-500 text-center">Primeiro Contato / Triagem</div>
              </motion.div>
            </div>

            {/* Reunião (Zoom) */}
            <div className="absolute" style={{ left: "180px", top: "1230px", width: "160px" }}>
              <motion.div
                whileHover={{ scale: 1.12 }}
                onClick={() => handleNodeClick("reuniao_diagnostico")}
                className="cursor-pointer w-full flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Reunião</div>
                <div className={`w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl border-2 transition-colors duration-200 ${
                  selectedNode === "reuniao_diagnostico" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                }`}>
                  <Video size={22} fill="currentColor" />
                </div>
                {activeSim && (
                  <div className="text-[8px] text-blue-400 font-black bg-black border border-white/5 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                    {meetingsScheduled.toLocaleString()} agendamentos
                  </div>
                )}
              </motion.div>
            </div>

            {/* Proposta (Presenter) */}
            <div className="absolute" style={{ left: "420px", top: "1230px", width: "160px" }}>
              <motion.div
                whileHover={{ scale: 1.12 }}
                onClick={() => handleNodeClick("proposta_comercial")}
                className="cursor-pointer w-full flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Proposta</div>
                <div className={`w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl border-2 transition-colors duration-200 ${
                  selectedNode === "proposta_comercial" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <path d="M10 8l5 3-5 3V8z" fill="currentColor" />
                  </svg>
                </div>
                {activeSim && (
                  <div className="text-[8px] text-orange-400 font-black bg-black border border-white/5 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                    {offersPresented.toLocaleString()} geradas
                  </div>
                )}
              </motion.div>
            </div>

            {/* Mensagem (Followup) */}
            <div className="absolute" style={{ left: "660px", top: "1230px", width: "160px" }}>
              <motion.div
                whileHover={{ scale: 1.12 }}
                onClick={() => handleNodeClick("mensagem_fechamento")}
                className="cursor-pointer w-full flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Mensagem</div>
                <div className={`w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-xl border-2 transition-colors duration-200 ${
                  selectedNode === "mensagem_fechamento" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                }`}>
                  <MessageSquare size={22} className="text-white" fill="currentColor" />
                </div>
                {activeSim && (
                  <div className="text-[8px] text-sky-400 font-black bg-black border border-white/5 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                    Negociação
                  </div>
                )}
              </motion.div>
            </div>

            {/* Oferta Apresentada */}
            <div className="absolute" style={{ left: "440px", top: "1410px", width: "120px" }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={() => handleNodeClick("oferta_apresentada")}
                className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
              >
                <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Oferta Apresentada</div>
                <div className={`w-14 h-14 bg-orange-600 rotate-45 flex items-center justify-center text-white shadow-xl relative rounded-md border transition-all ${
                  selectedNode === "oferta_apresentada" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                }`}>
                  <div className="-rotate-45">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>
                <div className="text-[8px] text-zinc-500 uppercase font-black">Decisão & Parceria</div>
              </motion.div>
            </div>

          </div>

          {/* Arrow down from Oferta to Cliente Fechado */}
          <div className="relative w-[1000px] h-[1150px] mx-auto select-none mt-4">
              
              {/* SVG OVERLAY FOR PRECISION CONNECTING PATHS */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 1000 1150" fill="none">
                <defs>
                  <marker id="blue-arrow-dashed-bottom" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                  </marker>
                  <marker id="black-arrow-handdrawn" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="black" />
                  </marker>
                </defs>

                {/* [1] Arrow down from Oferta Apresentada to Cliente Fechado */}
                <path d="M 500 -70 L 500 75" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [2] Arrow left from Cliente Fechado to Cliente Não Satisfeito */}
                <path d="M 472 103 C 350 103, 180 145, 180 185" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [3] Arrows from Cliente Fechado splitting down to Bom Relacionamento and Boa Entrega */}
                <path d="M 500 131 C 500 190, 360 190, 360 265" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />
                <path d="M 500 131 C 500 190, 640 190, 640 265" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [4] Arrows converging from Bom Relacionamento and Boa Entrega down to Cliente Satisfeito */}
                <path d="M 360 321 C 360 370, 500 370, 500 405" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />
                <path d="M 640 321 C 640 370, 500 370, 500 405" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [5] Arrow left from Cliente Satisfeito to Depoimento */}
                <path d="M 472 433 L 278 433" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [6] Arrow down from Depoimento to Conteúdo */}
                <path d="M 250 461 C 250 510, 310 510, 310 545" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [7] Arrow down from Cliente Satisfeito to Indicações */}
                <path d="M 500 461 C 500 510, 470 510, 470 545" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [8] Arrow down-left from Boa Entrega to Tráfego Gratuito */}
                <path d="M 640 321 C 640 440, 630 440, 630 545" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [8b] Arrow down-right from Boa Entrega to Behance Intencional */}
                <path d="M 640 321 C 640 440, 815 440, 815 545" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [8c] Line from Cliente Satisfeito going outside (por fora) directly to Mensagem */}
                <path d="M 528 433 C 650 433, 940 433, 940 800 C 940 1150, 740 1150, 740 1230" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* [8d] Descending feedback paths to the bottom Instagram Posicionado card */}
                {/* Pesca Balde to Bottom Instagram */}
                <path d="M 150 634 C 150 680, 410 680, 410 720" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />
                {/* Conteúdo to Bottom Instagram */}
                <path d="M 310 634 C 310 680, 450 680, 450 720" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />
                {/* Indicações to Bottom Instagram */}
                <path d="M 470 634 C 470 680, 500 680, 500 720" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />
                {/* Tráfego Gratuito to Bottom Instagram */}
                <path d="M 630 634 C 630 680, 550 680, 550 720" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />
                {/* Behance to Bottom Instagram */}
                <path d="M 815 621 C 815 680, 590 680, 590 720" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* Bottom Instagram Posicionado to Looping */}
                <path d="M 500 1000 L 500 1050" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#blue-arrow-dashed-bottom)" />

                {/* Hand-drawn CARROSSEL Arrow from Behance Intencional to Instagram */}
                <path d="M 815 577 C 750 680, 650 740, 630 780" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#black-arrow-handdrawn)" />


              </svg>

              {/* Hand-drawn text "CARROSSEL" */}
              <div className="absolute text-zinc-900 font-black text-xl rotate-[-3deg] tracking-wider select-none pointer-events-none" style={{ left: "675px", top: "725px", fontFamily: "'Marker Felt', 'Comic Sans MS', cursive" }}>
                CARROSSEL
              </div>

              {/* NODE: Cliente Fechado (Centered) */}
              <div className="absolute" style={{ left: "400px", top: "75px", width: "200px" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNodeClick("cliente_fechado")}
                  className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Cliente Fechado</div>
                  <div className={`w-14 h-14 bg-emerald-600 rotate-45 flex items-center justify-center text-white shadow-xl relative rounded-md border-2 transition-all duration-200 ${
                    selectedNode === "cliente_fechado" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                  }`}>
                    <div className="-rotate-45">
                      <DollarSign size={24} className="text-white" />
                    </div>
                  </div>
                  {activeSim && (
                    <div className="text-[8px] text-emerald-400 font-black bg-black border border-white/5 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                      + {clientsClosed} clientes/mês
                    </div>
                  )}
                </motion.div>
              </div>

              {/* NODE: Cliente Não Satisfeito (Left side) */}
              <div className="absolute" style={{ left: "80px", top: "185px", width: "200px" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNodeClick("cliente_insatisfeito")}
                  className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Cliente não satisfeito</div>
                  <div className={`w-14 h-14 bg-teal-800 rotate-45 flex items-center justify-center text-white shadow-xl relative rounded-md border-2 transition-all duration-200 ${
                    selectedNode === "cliente_insatisfeito" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                  }`}>
                    <div className="-rotate-45 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        <line x1="8" y1="16" x2="16" y2="8" strokeWidth="2.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-black uppercase">Volte pras aulas.</div>
                </motion.div>
              </div>

              {/* NODE: Bom relacionamento (Left column) */}
              <div className="absolute" style={{ left: "260px", top: "265px", width: "200px" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNodeClick("bom_relacionamento")}
                  className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Bom relacionamento</div>
                  <div className={`w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 transition-all duration-200 ${
                    selectedNode === "bom_relacionamento" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                  }`}>
                    <MessageSquare size={24} fill="currentColor" />
                  </div>
                  <div className="text-[9px] text-zinc-500 font-black uppercase mt-1">Transparência</div>
                </motion.div>
              </div>

              {/* NODE: Boa entrega (Right column) */}
              <div className="absolute" style={{ left: "540px", top: "265px", width: "200px" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNodeClick("boa_entrega")}
                  className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Boa entrega</div>
                  <div className={`w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-xl border-2 transition-all duration-200 ${
                    selectedNode === "boa_entrega" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                  }`}>
                    <Zap size={24} fill="currentColor" className="text-white" />
                  </div>
                  <div className="text-[9px] text-zinc-500 font-black uppercase mt-1">ROI Comprovado</div>
                </motion.div>
              </div>

              {/* NODE: Cliente Satisfeito (Centered) */}
              <div className="absolute" style={{ left: "400px", top: "405px", width: "200px" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNodeClick("cliente_satisfeito")}
                  className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Cliente Satisfeito</div>
                  <div className={`w-14 h-14 bg-emerald-500 rotate-45 flex items-center justify-center text-white shadow-xl relative rounded-md border-2 transition-all duration-200 ${
                    selectedNode === "cliente_satisfeito" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                  }`}>
                    <div className="-rotate-45">
                      <HeartHandshake size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="text-[9px] text-emerald-400 font-black uppercase mt-1">Loop de Ouro</div>
                </motion.div>
              </div>

              {/* NODE: Depoimento (Left of Cliente Satisfeito) */}
              <div className="absolute" style={{ left: "150px", top: "405px", width: "200px" }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleNodeClick("depoimento_loop")}
                  className="cursor-pointer flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Depoimento</div>
                  <div className={`w-14 h-14 bg-red-600 rotate-45 flex items-center justify-center text-white shadow-xl relative rounded-md border-2 transition-all duration-200 ${
                    selectedNode === "depoimento_loop" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                  }`}>
                    <div className="-rotate-45">
                      <Play size={20} fill="currentColor" className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-black uppercase mt-1">Prova Social</div>
                </motion.div>
              </div>

              {/* CONTAINER: The Feedback Loop (Transparent container so background vector lines are completely visible and not covered) */}
              <div className="absolute p-4 animate-none" style={{ left: "100px", top: "540px", width: "810px", height: "140px" }}>
                
                {/* Columns inside the Feedback Loop container */}
                <div className="relative w-full h-full">
                  
                  {/* 0. Pesca Balde */}
                  <div className="absolute" style={{ left: "15px", top: "10px", width: "120px" }}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleNodeClick("pesca_balde")}
                      className="cursor-pointer flex flex-col items-center gap-1 transition-all text-center"
                    >
                      <div className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest">Pesca Balde</div>
                      <div className={`w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all duration-200 ${
                        selectedNode === "pesca_balde" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                      }`}>
                        <Target size={18} className="text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* 1. Conteúdo */}
                  <div className="absolute" style={{ left: "175px", top: "10px", width: "120px" }}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleNodeClick("conteudo")}
                      className="cursor-pointer flex flex-col items-center gap-1 transition-all text-center"
                    >
                      <div className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest">Conteúdo</div>
                      <div className={`w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all duration-200 ${
                        selectedNode === "conteudo" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                      }`}>
                        <Play size={18} fill="currentColor" className="text-white ml-0.5" />
                      </div>
                    </motion.div>
                  </div>

                  {/* 2. Indicações */}
                  <div className="absolute" style={{ left: "335px", top: "10px", width: "120px" }}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleNodeClick("indicacoes")}
                      className="cursor-pointer flex flex-col items-center gap-1 transition-all text-center"
                    >
                      <div className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest">Indicações</div>
                      <div className={`w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all duration-200 ${
                        selectedNode === "indicacoes" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-white/20"
                      }`}>
                        <Share2 size={18} className="text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* 3. Tráfego Gratuito */}
                  <div className="absolute" style={{ left: "495px", top: "10px", width: "120px" }}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleNodeClick("trafego_gratuito")}
                      className="cursor-pointer flex flex-col items-center gap-1 transition-all text-center"
                    >
                      <div className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest">Tráfego Gratuito</div>
                      <div className={`w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all duration-200 ${
                        selectedNode === "trafego_gratuito" ? "border-[#c5a880] shadow-[#c5a880]/25" : "border-white/5 hover:border-[#c5a880]/20"
                      }`}>
                        <TrendingUp size={18} className="text-white" />
                      </div>
                    </motion.div>
                  </div>

                  {/* 4. Behance Intencional (Novo) */}
                  <div className="absolute" style={{ left: "655px", top: "5px", width: "120px" }}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleNodeClick("behance_intencional")}
                      className={`cursor-pointer transition-all z-10 ${selectedNode === "behance_intencional" ? "scale-105" : ""}`}
                    >
                      <div className="text-[9px] text-zinc-300 font-extrabold text-center pb-1 uppercase tracking-wider">Behance Intencional</div>
                      <div className="w-full h-16 bg-black border border-white/5 rounded-lg overflow-hidden shadow-md flex flex-col">
                        {/* Browser Bar */}
                        <div className="flex items-center gap-1 bg-black px-1 py-0.5 border-b border-white/5">
                          <div className="w-1 h-1 rounded-full bg-red-500"></div>
                          <div className="w-1 h-1 rounded-full bg-yellow-500"></div>
                          <div className="w-1 h-1 rounded-full bg-green-500"></div>
                          <div className="flex-1 bg-black rounded px-1 py-0.2 text-[5px] text-zinc-500 text-center truncate scale-90">
                            behance.net/portfolio
                          </div>
                        </div>
                        {/* Simulated Content */}
                        <div className="p-1 flex-1 flex flex-col justify-between">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="h-4 bg-black rounded border border-white/5 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex items-center justify-center text-[4px] text-white font-bold">B</div>
                            </div>
                            <div className="h-4 bg-black rounded border border-white/5 flex items-center justify-center">
                              <div className="w-3 h-0.5 bg-zinc-700 rounded-full"></div>
                            </div>
                          </div>
                          <div className="text-[4.5px] text-zinc-500 font-bold leading-tight scale-90 origin-left">
                            Design Estratégico & ROI
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                </div>

              </div>

              {/* Bottom Instagram Posicionado card */}
              <div
                className="absolute bg-transparent flex flex-col items-center"
                style={{ left: "370px", top: "720px", width: "260px", height: "280px" }}
              >
                <span className="text-[10px] font-black text-zinc-400 mb-1">Instagram Posicionado</span>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleNodeClick("instagram_posicionado")}
                  className={`w-full bg-black rounded-xl border transition-all cursor-pointer p-3.5 shadow-2xl overflow-hidden relative flex-1 flex flex-col justify-between ${
                    selectedNode === "instagram_posicionado" ? "border-[#c5a880] shadow-[#c5a880]/15" : "border-zinc-850 hover:border-zinc-800"
                  }`}
                >
                  {/* Profile Info */}
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full border border-[#c5a880] p-0.5 bg-black overflow-hidden flex items-center justify-center font-black text-[9px] text-white">
                      ZION
                    </div>
                    <div className="flex-1 space-y-0.5 text-left">
                      <div className="text-[10px] font-extrabold text-white">agencia_zion</div>
                      <div className="text-[8px] text-[#c5a880] font-bold">Design & Tráfego Premium</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="text-[8px] text-zinc-400 pt-1.5 leading-normal flex-1 text-left">
                    ⚙️ Criamos funis de vendas de altíssimo ticket.<br/>
                    💼 O fim da prospecção fria.<br/>
                    📈 <span className="text-[#c5a880] font-bold">Aperte no link abaixo</span> e mude sua escala:
                  </div>

                  {/* Link bio mock */}
                  <div className="mt-1 p-1 bg-black rounded text-center text-[8px] font-black text-[#c5a880] uppercase tracking-wider border border-white/5 flex items-center justify-center gap-1">
                    <Link size={8} />
                    linktree.ms/zion_agencia
                  </div>

                  {/* Grid Preview (3 items) */}
                  <div className="grid grid-cols-3 gap-1 pt-2">
                    <div className="aspect-square bg-black border border-white/5 rounded-xs flex flex-col justify-end p-0.5">
                      <span className="text-[6px] font-black text-[#c5a880] text-center">CASE</span>
                    </div>
                    <div className="aspect-square bg-[#c5a880] rounded-xs flex flex-col justify-end p-0.5">
                      <span className="text-[6px] font-black text-black text-center">MÉTODO</span>
                    </div>
                    <div className="aspect-square bg-black border border-white/5 rounded-xs flex flex-col justify-end p-0.5">
                      <span className="text-[6px] font-black text-[#c5a880] text-center">DEPOIMENTOS</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Looping Node */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ left: "450px", top: "1050px", width: "100px" }}>
                <div className="text-[12px] text-zinc-300 font-extrabold text-center leading-tight">Looping</div>
                <div className="w-14 h-14 rounded-full bg-black border-2 border-zinc-700 flex items-center justify-center text-white shadow-xl hover:border-white transition-colors cursor-pointer">
                  <Aperture size={28} className="text-white" />
                </div>
                <div className="text-[9px] text-zinc-400 text-center leading-tight">Analisa, Ajusta, melhora e repete</div>
              </div>

              {/* Yellow Text Box from the Image */}
              <div className="absolute" style={{ left: "680px", top: "800px", width: "300px" }}>
                <div className="bg-[#fce9a6] rounded-md p-4 text-[#1a1a1a] shadow-lg border border-[#e6cc68]">
                  <p className="text-[10px] font-bold mb-3">
                    A partir de agora prospecção e tráfego é A MAIS, e não prioridade.
                  </p>
                  <p className="text-[10px] leading-relaxed mb-3">
                    Cada novo cliente atendido trás novos clientes com ele. Lotando agenda você aumenta o preço, escolhe com quem quer trabalhar e finalmente passa a ter previsibilidade e crescimento sólido.
                  </p>
                  <p className="text-[10px] leading-relaxed mb-4">
                    O cliente fecha, volta, indica, trás tráfego, você tem portfólio, novo post, que melhora seu posicionamento e atrai ainda mais interessados... que viram clientes... e o céu é o limite.
                  </p>
                  <div className="text-[8px] font-bold opacity-60 text-right uppercase">
                    Agência Ar3
                  </div>
                </div>
              </div>

            </div>

        </div>

      </div>

      {/* NODE DRAWER / DETAILS DRAWER (ANIME-IN FADE) */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-black border-2 border-[#c5a880]/40 rounded-2xl p-6 space-y-6 shadow-2xl text-left"
          >
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="bg-[#c5a880]/20 text-[#c5a880] text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-[#c5a880]/30">
                  {selectedNodeData.stage}
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-[#c5a880]" />
                  {selectedNodeData.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 hover:bg-[#111] rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DESCRIÇÃO E TIPS */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">O que é este Passo?</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-black p-4 rounded-xl border border-white/5">
                    {selectedNodeData.desc}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Dicas de Mestre</h4>
                  <div className="space-y-1.5">
                    {selectedNodeData.tips.map((tip, idx) => (
                      <div key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-[#c5a880] mt-0.5">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedNodeData.script && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Script Recomendado</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedNodeData.script || "");
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="text-2xs font-bold text-[#c5a880] hover:text-white transition cursor-pointer"
                      >
                        {copiedScript ? "Copiado!" : "Copiar Script"}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 bg-black/50 p-3 rounded-lg border border-white/5 font-mono leading-relaxed whitespace-pre-wrap">
                      {selectedNodeData.script}
                    </p>
                  </div>
                )}
              </div>

              {/* CHECKLIST & COMO EXECUTAR */}
              <div className="space-y-4">
                <div className="space-y-3 bg-black p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <UserCheck size={16} className="text-[#c5a880]" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Checklist Prático do Copiloto</h4>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {selectedNodeData.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-zinc-300">
                        <input
                          type="checkbox"
                          id={`chk-${idx}`}
                          className="mt-0.5 rounded border-zinc-700 bg-[#111] text-[#c5a880] focus:ring-[#c5a880]/30 animate-none"
                        />
                        <label htmlFor={`chk-${idx}`} className="leading-relaxed cursor-pointer hover:text-white transition">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedNodeData.howToExecute && selectedNodeData.howToExecute.length > 0 && (
                  <div className="space-y-3 bg-black/80 p-5 rounded-2xl border border-[#c5a880]/15">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Sparkles size={14} className="text-[#c5a880]" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Como Executar Passo a Passo</h4>
                    </div>
                    <div className="space-y-3 pt-2">
                      {selectedNodeData.howToExecute.map((step, idx) => (
                        <div key={idx} className="text-xs text-zinc-300 leading-relaxed bg-black/60 p-3 rounded-lg border border-white/5">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
