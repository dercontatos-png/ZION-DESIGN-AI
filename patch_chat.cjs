const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf-8');

// 1. Add all assistants
const newAssistantsCode = `
const assistants: AssistantConfig[] = [
  // Designers / Creators
  { id: "prompt-extrator", label: "Prompt Extractor", sublabel: "Technical Analyst", desc: "Extrai prompts técnicos de referências visuais.", icon: <Code size={14} />, color: "#ad8330" },
  { id: "creative-assistant", label: "Assistente Criativo", sublabel: "Creative Assistant", desc: "Ideias para cenários, iluminação e composições.", icon: <Sparkles size={14} />, color: "#d4af37" },
  { id: "diretor-criativo", label: "Diretor Cr[IA]tivo", sublabel: "Creative Director", desc: "Saia da tela em branco com maestria e torne seu design ainda mais incrível.", icon: <Eye size={14} />, color: "#ad8330" },
  { id: "analisador-paginas", label: "Analisador de Páginas", sublabel: "Critical Design Analyzer", desc: "Receba opiniões profissionais de uma IA treinada pra extrair seu melhor.", icon: <Search size={14} />, color: "#ffffff" },
  
  // Copywriters & Marketers
  { id: "copy-ads", label: "Copy Builder [Ads]", sublabel: "Copywriter", desc: "Crie anúncios estáticos que param o scroll, ativam dor e puxam o clique.", icon: <Megaphone size={14} />, color: "#ad8330" },
  { id: "copy-carroseis", label: "Copy Builder [Carrossel]", sublabel: "Copywriter", desc: "Crie carrosséis N3 que prendem, aprofundam a consciência e transformam atenção em ação.", icon: <Layers size={14} />, color: "#d4af37" },
  { id: "easy-copy", label: "Easy Copy", sublabel: "Copywriter", desc: "Crie copys de alta conversão para sites/lps de qualquer nicho com alta qualidade.", icon: <FileText size={14} />, color: "#ad8330" },
  
  // Strategists
  { id: "analise-estrategica", label: "Análise Estratégica", sublabel: "Estrategista", desc: "Investigue seu lead a fundo, descubra dores reais e entre com vantagem estratégica.", icon: <Check size={14} />, color: "#4f46e5" },
  { id: "icp", label: "ICP e Posicionamento", sublabel: "Estrategista", desc: "Fortaleça seu posicionamento, transmita autoridade e atraia clientes prontos para comprar.", icon: <Check size={14} />, color: "#4f46e5" },
  
  // Sales
  { id: "atendimento", label: "Atendimento e Negociação", sublabel: "Vendas", desc: "Feche mais projetos com conversas estratégicas que geram confiança e conduzem ao sim.", icon: <Check size={14} />, color: "#10b981" },
  { id: "webson-vendedor", label: "Webson Vendedor", sublabel: "Vendas", desc: "Envie sua mensagem ou histórico da conversa que eu vou te ajudar a fechar a venda.", icon: <Check size={14} />, color: "#10b981" },
  
  // Dev & Sites
  { id: "estrutura-sites", label: "Estrutura Sites [IA]", sublabel: "UX/Web", desc: "Esse agente entende o seu briefing e cria a estrutura do site como um mestre.", icon: <Code size={14} />, color: "#3b82f6" },
  { id: "easy-coder", label: "Easy Coder", sublabel: "Developer", desc: "Crie e faça alteração nos códigos dos seus projetos de maneira fácil e otimizada.", icon: <Code size={14} />, color: "#3b82f6" },
  { id: "easy-image", label: "Easy Image", sublabel: "Image Gen", desc: "Gere imagens e extraia prompts com uma maior nível de detalhes e assertividade.", icon: <ImageIcon size={14} />, color: "#ec4899" },
  
];
`;

code = code.replace(/const assistants: AssistantConfig\[\] = \[[\s\S]*?\];/g, newAssistantsCode);

// 2. Change how activeAssistant is initialized and how isOpen is handled
if (!code.includes('const { chatDrawerOpen, setChatDrawerOpen, chatActiveAssistantId } = useProjectStore();')) {
  code = code.replace(
    'const [activeAssistant, setActiveAssistant] = useState<AssistantConfig>(assistants[0]);',
    'const { chatDrawerOpen, setChatDrawerOpen, chatActiveAssistantId, setChatActiveAssistantId } = useProjectStore();\n  const [activeAssistant, setActiveAssistant] = useState<AssistantConfig>(assistants[0]);\n\n  useEffect(() => {\n    if (chatActiveAssistantId) {\n      const found = assistants.find(a => a.id === chatActiveAssistantId);\n      if (found) {\n        setActiveAssistant(found);\n        if (!isOpen) setIsOpen(true);\n      }\n    }\n  }, [chatActiveAssistantId]);\n\n  useEffect(() => {\n    if (chatDrawerOpen && !isOpen) {\n      setIsOpen(true);\n    }\n    if (!chatDrawerOpen && isOpen) {\n      setIsOpen(false);\n    }\n  }, [chatDrawerOpen]);\n\n  useEffect(() => {\n    if (isOpen) {\n      setChatDrawerOpen(true);\n    } else {\n      setChatDrawerOpen(false);\n    }\n  }, [isOpen]);'
  );
}

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
