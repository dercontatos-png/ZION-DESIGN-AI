import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useClientStore } from "../store/useClientStore";
import {
  Image as ImageIcon,
  MessageSquare,
  X,
  Send,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Paperclip,
  Code,
  Megaphone,
  Layers,
  FileText,
  Search,
  Eye,
  UploadCloud,
  Zap,
  Bot,
  Trash2,
  File,
  Check
} from "lucide-react";

interface ChatFile {
  name: string;
  type: string;
  data: string; // base64 string
  size?: number;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
  files?: ChatFile[];
}

interface AssistantConfig {
  id: string;
  label: string;
  sublabel: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

interface ChatAssistenteProps {
  customApiKey: string;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
}


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


const formatMessage = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-black text-white">{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
};

const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
  return Promise.resolve(base64Str);
};


const ClientForm = () => {
  const [colors, setColors] = useState(["#000000", "#ff0000", "#ffffff"]);
  const [newColor, setNewColor] = useState("#000000");

  const handleAddColor = () => {
    setColors([...colors, newColor]);
  };

  const handleRemoveColor = (idx) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const form = e.target;
      
      let logoBase64 = undefined;
      const fileInput = form.logoFile;
      if (fileInput.files && fileInput.files.length > 0) {
         const file = fileInput.files[0];
         logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result);
            reader.readAsDataURL(file);
         });
      }

      useClientStore.getState().addClient({
        name: (form.elements.namedItem("name") as HTMLInputElement).value,
        niche: (form.elements.namedItem("niche") as HTMLInputElement).value,
        infoExtra: (form.elements.namedItem("infoExtra") as HTMLTextAreaElement).value,
        logoBase64: logoBase64,
        bancoDeDadosIA: "",
        paletaCores: colors
      });
      form.reset();
      setColors(["#000000", "#ff0000", "#ffffff"]);
    }} className="space-y-3">
      <input name="name" placeholder="Nome" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
      <input name="niche" placeholder="Nicho" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" required />
      <input name="infoExtra" placeholder="Info Adicional (ex: Estilo favorito)" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white" />
      
      <div>
        <label className="text-[8px] text-zinc-500 uppercase">Logo do Cliente (Opcional)</label>
        <input name="logoFile" type="file" accept="image/*" className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-300" />
      </div>

      <div>
        <label className="text-[8px] text-zinc-500 uppercase">Paleta de Cores (Quantas quiser)</label>
        <div className="flex gap-2 items-center mt-1 mb-2">
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-8 h-8 rounded border border-zinc-800 p-0 cursor-pointer" />
          <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white w-20" placeholder="#HEX" />
          <button type="button" onClick={handleAddColor} className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-xs font-bold">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded pl-1 pr-1 py-1">
              <div className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: c}} />
              <span className="text-[10px] text-zinc-400 uppercase">{c}</span>
              <button type="button" onClick={() => handleRemoveColor(idx)} className="text-zinc-600 hover:text-red-500 ml-1">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" className="w-full bg-[#ad8330]/20 text-[#ad8330] border border-[#ad8330]/40 p-2 text-xs font-bold uppercase rounded-lg hover:bg-[#ad8330]/30 transition-colors">Cadastrar Cliente</button>
    </form>
  );
};

export const ChatAssistente: React.FC<ChatAssistenteProps> = ({ customApiKey, showToast }) => {
  const store = useProjectStore();
  const { clients, activeClientId, setActiveClient, appendAiLearnings } = useClientStore();
  const [isOpen, setIsOpen] = useState(false);
  const { chatDrawerOpen, setChatDrawerOpen, chatActiveAssistantId, setChatActiveAssistantId } = useProjectStore();
  const [activeAssistant, setActiveAssistant] = useState<AssistantConfig>(assistants[0]);

  useEffect(() => {
    if (chatActiveAssistantId) {
      const found = assistants.find(a => a.id === chatActiveAssistantId);
      if (found) {
        setActiveAssistant(found);
        if (!isOpen) setIsOpen(true);
      }
    }
  }, [chatActiveAssistantId]);

  useEffect(() => {
    if (chatDrawerOpen && !isOpen) {
      setIsOpen(true);
    }
    if (!chatDrawerOpen && isOpen) {
      setIsOpen(false);
    }
  }, [chatDrawerOpen]);

  useEffect(() => {
    if (isOpen) {
      setChatDrawerOpen(true);
    } else {
      setChatDrawerOpen(false);
    }
  }, [isOpen]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem("zion_assistant_chats_v2");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
    return Object.fromEntries(assistants.map((a) => [a.id, []]));
  });
  const [inputText, setInputText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeMessages = chats[activeAssistant.id] || [];

  useEffect(() => {
    try {
      localStorage.setItem("zion_assistant_chats_v2", JSON.stringify(chats));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeAssistant.id, isTyping]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatPanelRef.current && !chatPanelRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAttachFiles = useCallback((files: FileList | File[], triggerFlow = false) => {
    setIsUploading(true);
    const fileList = Array.from(files);
    let count = 0;

    fileList.forEach(async (file) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let b64 = reader.result as string;

        // Se for imagem, aplica compressão local para reduzir de MBs para KBs
        if (file.type.startsWith("image/")) {
          try {
            b64 = await compressImage(b64, 1024, 1024, 0.8);
          } catch (compressErr) {
            console.error("Erro na compressão automática do chat:", compressErr);
          }
        }

        const cleanBytes = b64.replace(/^data:[^;]+;base64,/, "");

        const newFile: ChatFile = {
          name: file.name,
          type: file.type || "application/octet-stream",
          data: cleanBytes,
          size: file.size
        };

        setAttachedFiles((prev) => [...prev, newFile]);
        count++;
        
        if (count === fileList.length) {
          setIsUploading(false);
          showToast(`${fileList.length} arquivo(s) anexado(s) com sucesso!`, "success");
        }

        if (triggerFlow && activeAssistant.id === "prompt-extrator" && file.type.startsWith("image/")) {
          setTimeout(() => {
            setChats((prev) => ({
              ...prev,
              "prompt-extrator": [
                ...(prev["prompt-extrator"] || []),
                {
                  role: "model",
                  content: "Recebi sua imagem de referência! Para extrair o prompt perfeito, me diga o que deseja priorizar:\n\n**Textura** — materiais e superfícies\n**Iluminação** — setup de luz e sombras\n**Paleta de Cores** — tons e contraste\n**Composição** — enquadramento e regra dos terços\n**Sujeito** — pose, expressão e vestimenta\n**Estilo Geral** — vibe estética completa"
                }
              ]
            }));
          }, 500);
        }
      };
      reader.onerror = () => {
        setIsUploading(false);
        showToast(`Erro ao carregar o arquivo: ${file.name}`, "error");
      };
      reader.readAsDataURL(file);
    });
  }, [activeAssistant, showToast]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const file = items[i].getAsFile();
        if (file) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleAttachFiles(files, true);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, activeAssistant, handleAttachFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAttachFiles(e.dataTransfer.files, true);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAttachFiles(e.target.files, true);
    }
    e.target.value = "";
  };

  const handleSend = async () => {
    if (inputText.trim() === "" && attachedFiles.length === 0) return;
    const userMsg: ChatMessage = { 
      role: "user", 
      content: inputText.trim(), 
      files: attachedFiles.length > 0 ? attachedFiles : undefined 
    };
    const currentMessages = chats[activeAssistant.id] || [];
    setChats((prev) => ({ ...prev, [activeAssistant.id]: [...currentMessages, userMsg] }));
    setInputText("");
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    const activeClient = clients.find(c => c.id === activeClientId);
    const clientContext = activeClient ? `\n\n[CONTEXTO DO CLIENTE ATUAL]:\nCliente: ${activeClient.name}\nNicho: ${activeClient.niche}\nPaleta de Cores: ${activeClient.paletaCores?.join(', ') || 'Nenhuma'}\nInfo Adicional: ${activeClient.infoExtra}\nHistórico IA: ${activeClient.bancoDeDadosIA}\n[IMPORTANTE]: Use essa paleta de cores e informações para guiar o design. Se aprender algo novo sobre o cliente, retorne no JSON no campo "aprendizado_cliente".` : "";

    try {
      const res = await fetch("/api/chat-agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistant.id,
          message: (userMsg.content || "Analise os arquivos enviados.") + clientContext,
          attachedFiles: userMsg.files,
          history: currentMessages.map((m) => ({ 
            role: m.role, 
            content: m.content,
            files: m.files 
          })),
          customApiKey: customApiKey || localStorage.getItem("custom_gemini_api_key") || ""
        })
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro no servidor.");
      }
      const data = await res.json();
      setChats((prev) => ({
        ...prev,
        [activeAssistant.id]: [
          ...(prev[activeAssistant.id] || []),
          { role: "model", content: data.response || "Sem resposta." }
        ]
      }));
    } catch (err: any) {
      showToast(err.message || "Falha na comunicação com a IA.", "error");
    } finally {
      setIsTyping(false);
    }
  };

  const applyModelMessageToEditor = (msgIndex: number, content: string) => {
    let filledItems: string[] = [];
    let jsonImageMap: Record<string, string> = {};
    let jsonStyleDescMap: Record<string, string> = {};
    let parsedConfigJson: any = null;
    let isReplaceMode = false;

    // Tenta extrair JSON do texto gerado pela IA
    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const configJson = JSON.parse(jsonMatch[1]);
        parsedConfigJson = configJson;
        const updates: any = {};
        
        if (configJson.substituirImagens === true) {
          isReplaceMode = true;
        }

        if (configJson.mapeamentoImagens) {
          jsonImageMap = configJson.mapeamentoImagens;
        } else if (configJson.imagemAnexadaTipo) {
          // fallback legad
          jsonImageMap = { "*": configJson.imagemAnexadaTipo };
        }

        if (configJson.descricoesEstilo) {
          jsonStyleDescMap = configJson.descricoesEstilo;
        }

        if (configJson.cores && Object.keys(configJson.cores).length > 0) {
          updates.cores = { ...store.cores, ...configJson.cores };
          updates.coresAutomaticas = false;
          filledItems.push("Cores Específicas");
        }
        
        if (configJson.corDominante) {
          updates.corDominante = configJson.corDominante;
          updates.useCorDominante = true;
          filledItems.push("Cor Dominante");
        }

        if (configJson.dimensao) {
          updates.dimensao = configJson.dimensao;
          filledItems.push(`Proporção (${configJson.dimensao})`);
        }
        
        if (typeof configJson.sobriedade === "number") {
          updates.nivelCriativo = configJson.sobriedade;
          filledItems.push(`Sobriedade (${configJson.sobriedade}%)`);
        }
        
        if (configJson.typographyPosition) {
          updates.typographyPosition = configJson.typographyPosition;
        }

        if (configJson.camadasTexto && Array.isArray(configJson.camadasTexto)) {
          updates.enableTypography = true;
          const currentLayers = store.camadasTexto || [];
          const newLayers = configJson.camadasTexto.map((item: any, idx: number) => {
             const existingLayer = currentLayers.find(l => l.funcao === item.funcao);
             return {
               id: existingLayer ? existingLayer.id : `text_${Date.now()}_${idx}`,
               conteudo: item.conteudo,
               funcao: item.funcao || "Corpo Descrição",
               fonte: item.fonte || (existingLayer ? existingLayer.fonte : "Outfit"),
               cor: item.cor || (existingLayer ? existingLayer.cor : "#ffffff")
             };
          });
          updates.camadasTexto = newLayers;
          filledItems.push(`${newLayers.length} Textos`);
        }
        
        if (configJson.promptCenario) {
          updates.promptCenario = configJson.promptCenario;
          filledItems.push("Cenário");
        }
        
        if (configJson.additionalPrompt) {
          updates.additionalPrompt = configJson.additionalPrompt;
          filledItems.push("Prompt Principal");
        }
        
        if (configJson.negativePrompt) {
          updates.negativePrompt = configJson.negativePrompt;
          filledItems.push("Prompt Negativo");
        }
        
        if (configJson.estilosVisuais && Array.isArray(configJson.estilosVisuais)) {
          updates.estilosVisuais = configJson.estilosVisuais;
          filledItems.push("Estilos Visuais");
        }

        store.updateConfig(updates);
      } catch (e) {
        console.error("Falha ao fazer parse do JSON: ", e);
      }
    }

    // Se o JSON falhou ou não extraiu tudo, aplicar fallback de regex para o texto
    if (filledItems.length === 0) {
      // 1. Extrair e preencher cores em HEX
      const hexMatches = content.match(/#[0-9A-Fa-f]{6}\b/g);
      if (hexMatches && hexMatches.length > 0) {
        const uniqueColors = Array.from(new Set(hexMatches));
        
        const newColors = { ...store.cores };
        if (uniqueColors[0]) newColors.ambiente = uniqueColors[0];
        if (uniqueColors[1]) newColors.recorte = uniqueColors[1];
        if (uniqueColors[2]) newColors.complementar = uniqueColors[2];
        
        store.updateConfig({ cores: newColors, coresAutomaticas: false });
        filledItems.push(`${uniqueColors.length} Cores`);
        
        if (uniqueColors.length === 1) {
          store.updateConfig({ corDominante: uniqueColors[0], useCorDominante: true });
        }
      }

      // 2. Extrair e preencher camadas de texto
      const lines = content.split("\n");
      const foundTexts: { conteudo: string; funcao: any }[] = [];
      
      lines.forEach(line => {
        const h1Match = line.match(/(?:Headline|Título|H1|Title):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:Headline|Título|H1|Title):\s*([^\n]+)/i);
        if (h1Match) foundTexts.push({ conteudo: h1Match[1].trim(), funcao: "Headline Principal" });
        
        const h2Match = line.match(/(?:Subheadline|Subtítulo|H2|Subtitle):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:Subheadline|Subtítulo|H2|Subtitle):\s*([^\n]+)/i);
        if (h2Match) foundTexts.push({ conteudo: h2Match[1].trim(), funcao: "Subheadline Secundário" });
        
        const ctaMatch = line.match(/(?:CTA|Botão|Button|Chamada):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:CTA|Botão|Button|Chamada):\s*([^\n]+)/i);
        if (ctaMatch) foundTexts.push({ conteudo: ctaMatch[1].trim(), funcao: "CTA Botão" });
        
        const captionMatch = line.match(/(?:Legenda|Caption|Texto|Corpo):\s*["'“]([^"'”]+)["'”]/i) || line.match(/(?:Legenda|Caption|Texto|Corpo):\s*([^\n]+)/i);
        if (captionMatch && !line.includes("Instagram")) {
          foundTexts.push({ conteudo: captionMatch[1].trim(), funcao: "Corpo Descrição" });
        }
      });
      
      if (foundTexts.length > 0) {
        store.updateConfig({ enableTypography: true });
        const currentLayers = [...(store.camadasTexto || [])];
        
        foundTexts.forEach(item => {
          const existingIdx = currentLayers.findIndex(l => l.funcao === item.funcao);
          if (existingIdx !== -1) {
            currentLayers[existingIdx] = { ...currentLayers[existingIdx], conteudo: item.conteudo };
          } else {
            currentLayers.push({
              id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              conteudo: item.conteudo,
              funcao: item.funcao,
              fonte: "Outfit",
              cor: "#ffffff"
            });
          }
        });
        
        store.updateConfig({ camadasTexto: currentLayers });
        filledItems.push(`${foundTexts.length} Textos`);
      }

      // 3. Extrair prompt (inglês ou blocos de código)
      let promptText = "";
      const promptMatch = content.match(/(?:PROMPT EXTRATOR|PROMPT|SUGESTÃO DE PROMPT|PROMPT SUGERIDO):\s*([\s\S]+)$/i) || content.match(/(?:PROMPT EXTRATOR|PROMPT):\s*(.+)/i);
      if (promptMatch) {
        promptText = promptMatch[1].trim();
        promptText = promptText.split(/\b(CORES|TEXTO|CAMADAS|FONTES):\b/i)[0].trim();
      } else {
        const codeBlockMatch = content.match(/```(?:prompt|text|english|)\n([\s\S]+?)```/i);
        if (codeBlockMatch) {
          promptText = codeBlockMatch[1].trim();
        }
      }

      if (!promptText && activeAssistant.id === "prompt-extrator") {
        promptText = content.replace(/PROMPT EXTRATOR:\s*/i, "").trim();
      }

      if (promptText) {
        if (promptText.startsWith('"') && promptText.endsWith('"')) {
          promptText = promptText.slice(1, -1);
        }
        store.updateConfig({ additionalPrompt: promptText });
        filledItems.push("Prompt");
      }

      // 2.5 Extrair Prompt Negativo
      const negativeMatch = content.match(/(?:Prompt Negativo|Negative Prompt):\s*["'“]?([^"'\n]+)["'”]?/i) || content.match(/(?:Prompt Negativo|Negative Prompt):\s*([\s\S]+?)(?=\n|$)/i);
      if (negativeMatch && negativeMatch[1].trim() !== "") {
        store.updateConfig({ negativePrompt: negativeMatch[1].trim() });
        filledItems.push("Prompt Negativo");
      }
    }

    // 4. Extrair e preencher imagens de referência do histórico
    let precedingUserMsg = null;
    if (msgIndex > 0) {
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (activeMessages[i].role === 'user') {
          if (activeMessages[i].files && activeMessages[i].files.length > 0) {
            precedingUserMsg = activeMessages[i];
          }
          break; // Stop at the first preceding user message
        }
      }
    }

    if (precedingUserMsg && precedingUserMsg.files) {
      const imagesOnly = precedingUserMsg.files.filter(f => f.type.startsWith("image/"));
      if (imagesOnly.length > 0) {
        const textLower = content.toLowerCase() + " " + (precedingUserMsg.content || "").toLowerCase();
        
        let subCount = 0;
        let sceCount = 0;
        let logCount = 0;
        let styCount = 0;
        
        let newSubjects: string[] = [];
        let newScenes: string[] = [];
        let newLogos: string[] = [];
        
        const jsonMapKeys = Object.keys(jsonImageMap);
        const jsonStyleDescKeys = Object.keys(jsonStyleDescMap);
        const singleMappingVal = jsonMapKeys.length === 1 ? jsonImageMap[jsonMapKeys[0]] : null;
        const singleStyleDescVal = jsonStyleDescKeys.length === 1 ? jsonStyleDescMap[jsonStyleDescKeys[0]] : null;

        imagesOnly.forEach(img => {
          let targetType = "style";
          let styleDescription = "Referência de estilo gerada pelo assistente.";
          
          let matchedKey = null;
          if (img.name && jsonImageMap[img.name]) {
            matchedKey = img.name;
          } else if (img.name) {
            // fuzzy match
            const nameLower = img.name.toLowerCase();
            matchedKey = jsonMapKeys.find(k => k.toLowerCase() === nameLower || nameLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nameLower.split('.')[0]));
          }

          if (matchedKey && jsonImageMap[matchedKey]) {
            targetType = jsonImageMap[matchedKey];
          } else if (imagesOnly.length === 1 && singleMappingVal) {
            targetType = singleMappingVal;
          } else if (jsonImageMap["*"]) {
            targetType = jsonImageMap["*"];
          } else if (textLower.includes("logo") || textLower.includes("marca") || textLower.includes("logomarca") || textLower.includes("logotipo")) {
            targetType = "logo";
          } else if (textLower.includes("sujeito") || textLower.includes("produto") || textLower.includes("subject") || textLower.includes("product") || textLower.includes("pessoa") || textLower.includes("modelo")) {
            targetType = "subject";
          } else if (textLower.includes("cenário") || textLower.includes("background") || textLower.includes("cenario") || textLower.includes("ambiente") || textLower.includes("scene") || textLower.includes("fundo")) {
            targetType = "scene";
          }

          if (targetType === "style") {
             let descMatchedKey = null;
             if (img.name && jsonStyleDescMap[img.name]) {
               descMatchedKey = img.name;
             } else if (img.name) {
               const nameLower = img.name.toLowerCase();
               descMatchedKey = jsonStyleDescKeys.find(k => k.toLowerCase() === nameLower || nameLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nameLower.split('.')[0]));
             }
             
             if (descMatchedKey && jsonStyleDescMap[descMatchedKey]) {
               styleDescription = jsonStyleDescMap[descMatchedKey];
             } else if (imagesOnly.length === 1 && singleStyleDescVal) {
               styleDescription = singleStyleDescVal;
             } else if (jsonStyleDescMap["*"]) {
               styleDescription = jsonStyleDescMap["*"];
             }
          }

          const rawBase64 = `data:${img.type};base64,${img.data}`;

          if (targetType === "subject") {
            newSubjects.push(rawBase64);
            subCount++;
          } else if (targetType === "scene") {
            newScenes.push(rawBase64);
            sceCount++;
          } else if (targetType === "logo") {
            newLogos.push(rawBase64);
            logCount++;
          } else {
            // style reference
            if (isReplaceMode && styCount === 0 && store.referenciasEstilo) {
              // Limpa as atuais se for a primeira do replace
              store.referenciasEstilo.forEach(r => store.removeReferenciaEstilo(r.id));
            }
            if (!store.referenciasEstilo?.find(r => r.url === rawBase64)) {
               store.addReferenciaEstilo(rawBase64, styleDescription);
               styCount++;
            }
          }
        });
        
        if (subCount > 0) {
          const currentList = isReplaceMode ? [] : (store.sujeitosBase64List || []);
          store.setSujeitoBase64List([...currentList, ...newSubjects]);
          store.updateConfig({ noPeople: false, desativarSujeito: false });
          filledItems.push(`${subCount} Sujeito(s)`);
        }
        if (sceCount > 0) {
          const currentList = isReplaceMode ? [] : (store.cenariosBase64List || []);
          store.setCenarioBase64List([...currentList, ...newScenes]);
          store.updateConfig({ useEnvRef: true });
          filledItems.push(`${sceCount} Cenário(s)`);
        }
        if (logCount > 0) {
          const currentList = isReplaceMode ? [] : (store.logosList || []);
          store.setLogosList([...currentList, ...newLogos]);
          store.updateConfig({ useLogo: true });
          filledItems.push(`${logCount} Logo(s)`);
        }
        if (logCount === 0 && activeClientId) {
          const client = clients.find(c => c.id === activeClientId);
          if (client && client.logoBase64) {
             const currentList = isReplaceMode ? [] : (store.logosList || []);
             store.setLogosList([...currentList, client.logoBase64]);
             store.updateConfig({ useLogo: true });
             filledItems.push("Logo do Cliente");
          }
        }

        if (parsedConfigJson && parsedConfigJson.aprendizado_cliente && activeClientId) {
           appendAiLearnings(activeClientId, parsedConfigJson.aprendizado_cliente);
        }

        if (styCount > 0) {
          filledItems.push(`${styCount} Estilo(s)`);
        }
      }
    }

    // Fallback
    if (filledItems.length === 0) {
      const fallbackText = content.length > 300 ? content.slice(0, 300) + "..." : content;
      store.updateConfig({ additionalPrompt: fallbackText });
      filledItems.push("Prompt (Mapeado)");
    }

    showToast(`Preenchido no editor: ${filledItems.join(", ")}!`, "success");
  };

  const switchAgent = (agent: AssistantConfig) => {
    setActiveAssistant(agent);
    setIsDropdownOpen(false);
    setAttachedFiles([]);
    setInputText("");
  };

  const clearChat = () => {
    setChats((prev) => ({ ...prev, [activeAssistant.id]: [] }));
    setAttachedFiles([]);
    showToast(`Conversa com ${activeAssistant.label} reiniciada.`, "success");
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div ref={chatPanelRef} className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsDropdownOpen(false);
        }}
        className="relative w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(173,131,48,0.3)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 bg-black border border-[#ad8330]"
        title="Assistente ZION AI"
      >
        {isOpen ? <X size={22} className="text-[#ad8330]" /> : <MessageSquare size={22} className="text-[#ad8330]" />}
        {!isOpen && <span className="absolute inset-0 rounded-full animate-ping opacity-25 bg-[#ad8330]" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-[72px] right-0 w-[440px] h-[600px] rounded-2xl border border-zinc-800 bg-[#070708] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="shrink-0 p-4 border-b border-zinc-900 bg-black/80 backdrop-blur-md relative z-20">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 flex-1 group cursor-pointer rounded-xl p-1.5 -ml-1.5 hover:bg-zinc-900/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg text-black bg-[#ad8330]">
                  {activeAssistant.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-white uppercase tracking-wide">{activeAssistant.label}</span>
                    <ChevronDown size={12} className="text-[#ad8330] group-hover:text-zinc-200 transition-all duration-200" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase mt-0.5 block text-[#ad8330]">{activeAssistant.sublabel}</span>
                </div>
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer border border-transparent hover:border-[#ad8330]/30"
                  title="Gerenciar Clientes"
                >
                  {activeClientId ? clients.find(c => c.id === activeClientId)?.name : "Clientes"}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-zinc-500 hover:text-[#ad8330] hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                  title="Limpar conversa"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Quick agent bar */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {assistants.map((a) => {
                const isActive = activeAssistant.id === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => switchAgent(a)}
                    title={a.label}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white transition-all duration-200 cursor-pointer relative group ${
                      isActive 
                        ? "ring-1 ring-[#ad8330] scale-110 shadow-md bg-zinc-900" 
                        : "opacity-45 hover:opacity-100 hover:scale-105 bg-zinc-950"
                    }`}
                  >
                    <span className={isActive ? "text-[#ad8330]" : "text-zinc-400"}>{a.icon}</span>
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[8px] font-black uppercase tracking-widest text-white px-2 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {a.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Client Modal */}
          {isClientModalOpen && (
            <div className="absolute inset-0 z-50 bg-[#09090b]/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl relative mb-4">
                <button
                  onClick={() => setIsClientModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Banco de Clientes</h3>
                
                <div className="space-y-4 max-h-[200px] overflow-y-auto mb-4">
                  {clients.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Nenhum cliente cadastrado.</p>
                  ) : (
                    clients.map(c => (
                      <div key={c.id} className={`p-3 rounded-xl border ${activeClientId === c.id ? 'border-[#ad8330] bg-[#ad8330]/5' : 'border-zinc-800 bg-zinc-900/50'} flex justify-between items-start`}>
                        <div className="flex-1 cursor-pointer" onClick={() => setActiveClient(activeClientId === c.id ? null : c.id)}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-white uppercase tracking-wider">{c.name}</span>
                            {activeClientId === c.id && <span className="text-[8px] bg-[#ad8330]/20 text-[#ad8330] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#ad8330]/30">Ativo</span>}
                          </div>
                          <p className="text-[10px] text-zinc-400">Nicho: {c.niche}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                             {c.paletaCores?.map((color, idx) => (
                               <div key={idx} className="w-4 h-4 rounded-full border border-zinc-700" style={{backgroundColor: color}} title={color} />
                             ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-2">
                  <h4 className="text-[10px] font-black text-[#ad8330] uppercase tracking-widest mb-2">Novo Cliente</h4>
                  <ClientForm />
                </div>
              </div>
            </div>
          )}

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-[130px] left-3 right-3 z-50 bg-[#09090b] border border-zinc-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2.5 border-b border-zinc-900">
                <p className="text-[9px] font-black text-[#ad8330] uppercase tracking-widest">Selecionar Especialista</p>
              </div>
              <div className="overflow-y-auto max-h-[320px] divide-y divide-zinc-900/60" style={{ scrollbarWidth: "none" }}>
                {assistants.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => switchAgent(a)}
                    className={`w-full px-4 py-3 flex items-center gap-3.5 hover:bg-zinc-900/30 transition-colors cursor-pointer text-left ${
                      activeAssistant.id === a.id ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-black bg-[#ad8330] shadow-md">
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-black text-white uppercase tracking-wider truncate">{a.label}</span>
                        {activeAssistant.id === a.id && (
                          <span className="text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 bg-[#ad8330]/10 text-[#ad8330] border border-[#ad8330]/20">
                            Ativo
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest block mt-0.5 text-zinc-500">{a.sublabel}</span>
                      <p className="text-[9px] text-zinc-450 mt-0.5 leading-snug">{a.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 relative bg-zinc-950/20"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ scrollbarWidth: "none" }}
          >
            {isDraggingOver && (
              <div className="absolute inset-3 bg-black/95 border-2 border-dashed border-[#ad8330] rounded-2xl flex flex-col items-center justify-center gap-3 z-30 animate-in fade-in duration-150">
                <div className="w-14 h-14 rounded-full flex items-center justify-center animate-bounce bg-[#ad8330]/10 border border-[#ad8330]/20">
                  <UploadCloud size={28} className="text-[#ad8330]" />
                </div>
                <p className="text-xs font-black text-white uppercase tracking-wider">Solte para Anexar Qualquer Arquivo</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Imagens, PDFs, Documentos de Texto</p>
              </div>
            )}

            {activeMessages.length === 0 && !isTyping && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[#ad8330] shadow-xl bg-[#ad8330]/5 border border-[#ad8330]/15">
                  <Bot size={28} />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">{activeAssistant.label}</p>
                  <p className="text-[9px] text-zinc-450 max-w-[260px] leading-relaxed mt-2">{activeAssistant.desc}</p>
                  <p className="text-[8.5px] text-zinc-550 mt-4 leading-relaxed uppercase tracking-wider">
                    Suporta imagens, PDFs e textos • Cole com Ctrl+V • Arraste
                  </p>
                </div>
              </div>
            )}

            {activeMessages.map((msg, index) => {
              const isModel = msg.role === "model";
              return (
                <div key={index} className={`flex flex-col gap-1.5 ${isModel ? "items-start" : "items-end"}`}>
                  
                  {/* File attachments renderer inside bubbles */}
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-1 max-w-[85%]">
                      {msg.files.map((file, fIdx) => {
                        const isImg = file.type.startsWith("image/");
                        if (isImg) {
                          return (
                            <div key={fIdx} className="rounded-xl overflow-hidden border border-zinc-800 w-36 shadow-md bg-zinc-900/60">
                              <img src={`data:${file.type};base64,${file.data}`} className="w-full object-cover" alt={file.name} />
                            </div>
                          );
                        }
                        return (
                          <div 
                            key={fIdx} 
                            className="flex items-center gap-2.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl w-48 shadow-sm text-left"
                          >
                            <File size={16} className="text-[#ad8330] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-white truncate">{file.name}</p>
                              <p className="text-[8px] text-zinc-500 uppercase mt-0.5">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] px-4 py-3 rounded-2xl text-[12px] leading-relaxed font-medium ${
                      isModel 
                        ? "bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-tl-sm shadow-sm" 
                        : "rounded-tr-sm text-white bg-[#ad8330]/10 border border-[#ad8330]/25 shadow-sm"
                    }`}
                  >
                    {isModel ? formatMessage(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>

                  {isModel && (
                    <button
                      onClick={() => applyModelMessageToEditor(index, msg.content)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 hover:scale-[1.02] shadow-md bg-[#ad8330]/10 border border-[#ad8330]/35 text-[#ad8330]"
                    >
                      <Zap size={11} />
                      <span>Preencher Projeto ⚡</span>
                    </button>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-2 animate-pulse">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-black bg-[#ad8330]">
                  {activeAssistant.icon}
                </div>
                <div className="px-4 py-3 bg-zinc-900/70 border border-zinc-800 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#ad8330]" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#ad8330]" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-[#ad8330]" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Area */}
          <div className="shrink-0 p-3.5 border-t border-zinc-900 bg-black/80 backdrop-blur-md space-y-2.5">
            
            {/* Multiple files preview before send */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-col gap-1.5 px-1 py-0.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                {attachedFiles.map((file, idx) => {
                  const isImg = file.type.startsWith("image/");
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl animate-in slide-in-from-bottom-2 duration-150"
                    >
                      {isImg ? (
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-750 shrink-0">
                          <img src={`data:${file.type};base64,${file.data}`} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      ) : (
                        <File size={14} className="text-[#ad8330] shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-zinc-350 truncate">{file.name}</p>
                        <p className="text-[8px] text-zinc-650 mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                      
                      <button 
                        onClick={() => removeAttachedFile(idx)} 
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-550 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-end gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInput} 
                className="hidden" 
                multiple 
                accept="*" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all cursor-pointer shrink-0 mb-0.5 disabled:opacity-40"
                title="Anexar qualquer tipo de arquivo"
              >
                {isUploading ? <RefreshCw size={15} className="animate-spin text-[#ad8330]" /> : <Paperclip size={15} />}
              </button>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Fale com ${activeAssistant.label}...`}
                rows={1}
                className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-[12px] text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#ad8330]/50 resize-none font-medium leading-relaxed transition-colors focus:ring-1 focus:ring-[#ad8330]/20"
                style={{ minHeight: "40px", maxHeight: "100px", scrollbarWidth: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || isUploading || (inputText.trim() === "" && attachedFiles.length === 0)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-black bg-[#ad8330] cursor-pointer transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 shrink-0 shadow-md mb-0.5"
              >
                {isTyping ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            <p className="text-[8.5px] text-zinc-700 text-center font-bold tracking-wide uppercase">
              Shift+Enter nova linha • Ctrl+V colar arquivo • Envie qualquer tipo de arquivo
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
