import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Code, Check, Megaphone, Trash2, Zap, AudioWaveform, Mic, Music, SlidersHorizontal, Sliders } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "model";
  content: string;
  configApplied?: boolean;
}

interface AssistantConfig {
  id: string;
  label: string;
  sublabel: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  suggestions: string[];
}

const assistants: AssistantConfig[] = [
  { 
    id: "engenheiro-som", 
    label: "Engenheiro de Som (SFX)", 
    sublabel: "Sound Design & Efeitos", 
    desc: "Gere efeitos sonoros imersivos, foleys realistas e ambiências com máxima definição.", 
    icon: <Zap size={14} />, 
    color: "#38bdf8",
    suggestions: [
      "Crie um efeito sonoro de explosão espacial intensa com fumaça e foley.",
      "Gere um som de interface (UI) de biometria aceita em tom futurista.",
      "Crie um efeito de impacto dramático para fechamento de trailer."
    ]
  },
  { 
    id: "diretor-musical", 
    label: "Diretor Musical (Lyria)", 
    sublabel: "Produção de Trilhas", 
    desc: "Produza trilhas cinematográficas, comerciais ou instrumentais com foco em progressão e emoção.", 
    icon: <AudioWaveform size={14} />, 
    color: "#ad8330",
    suggestions: [
      "Trilha cinematográfica de suspense com violinos e metais épicos.",
      "Música Pop animada para vídeo de lançamento de produto no Instagram.",
      "Trilha Lo-fi calma com piano e beats suaves para fundo de vídeo."
    ]
  },
  {
    id: "locucao-tts",
    label: "Especialista em Voz / Locução & TTS",
    sublabel: "ElevenLabs V2.5 & Narração",
    desc: "Configure parâmetros de locução, narração corporativa, entonação e escolha de idiomas (32 idiomas).",
    icon: <Mic size={14} />,
    color: "#10b981",
    suggestions: [
      "Configure uma locução comercial motivacional em Português com voz feminina.",
      "Monte um roteiro de anúncio de rádio com voz marcante e trilha de fundo.",
      "Ajuste o painel para uma narração estilo documentário em tom solene."
    ]
  },
  {
    id: "produtor-vinhetas",
    label: "Produtor de Vinhetas & Jingles",
    sublabel: "Aberturas & Comerciais",
    desc: "Crie vinhetas marcantes de 15 a 30s para rádio, TV, podcasts e programas ao vivo.",
    icon: <Sliders size={14} />,
    color: "#a855f7",
    suggestions: [
      "Vinheta de jornalismo urgente de 15 segundos com percussão marcante.",
      "Jingle corporativo alegre para abertura de podcast de negócios.",
      "Abertura eletrônica futurista de 20s para canal de tecnologia."
    ]
  }
];

export const ChatAudioAssistente = ({
  customApiKey,
  showToast,
  currentConfig,
  onApplyConfig,
}: {
  customApiKey?: string;
  showToast: (msg: string, type: "success" | "error" | "warning") => void;
  currentConfig: any;
  onApplyConfig: (config: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState<AssistantConfig>(assistants[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    return Object.fromEntries(assistants.map((a) => [a.id, []]));
  });
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeAssistant.id, isTyping, isOpen]);

  const activeMessages = chats[activeAssistant.id] || [];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend) return;
    
    const userMsg: ChatMessage = { role: "user", content: textToSend };
    
    setChats(prev => ({ ...prev, [activeAssistant.id]: [...(prev[activeAssistant.id] || []), userMsg] }));
    if (!customPrompt) setInputText("");
    setIsTyping(true);

    try {
      const savedKey = customApiKey || localStorage.getItem("custom_gemini_api_key");
      let activeKey = savedKey;
      if (!activeKey) {
        try {
          const response = await fetch("/api/google-key");
          const data = await response.json();
          activeKey = data.key;
        } catch (e) {}
      }
      
      if (!activeKey) {
        throw new Error("Chave de API Gemini não encontrada. Adicione nas configurações.");
      }

      const ai = new GoogleGenAI({ apiKey: activeKey });
      
      const systemInstruction = `Você é um ${activeAssistant.label}, especialista de alto nível em áudio, sound design, música e síntese de voz (TTS ElevenLabs V2.5 / Lyria).
O usuário está usando um painel avançado de criação de áudio. A configuração atual do painel é:
${JSON.stringify(currentConfig, null, 2)}

Sua missão é dar assessoria completa de áudio ao usuário, tirar dúvidas, sugerir prompts descritivos ricos e SEMPRE QUE SOLICITADO OU CONVENIENTE, ajustar os parâmetros do painel de áudio do usuário automaticamente.

Quando for alterar o painel, inclua um bloco JSON VÁLIDO no final da sua mensagem, delimitado estritamente com \`\`\`json.
Exemplo:
\`\`\`json
{
  "audioType": "Efeito Sonoro (SFX)",
  "prompt": "Som de impacto de rajada de energia cósmica em alta frequência com eco de estúdio",
  "sfxIntent": "Impacto",
  "sfxEnv": "Estúdio (clean)",
  "sfxMix": "Dry (sem reverb)",
  "duration": "Impacto Curto (3s)",
  "model": "lyria-3-clip-preview"
}
\`\`\`

Chaves válidas que você pode usar no JSON:
- prompt (string)
- model (string: "lyria-3-pro-preview" ou "lyria-3-clip-preview")
- audioType (string: "Música", "Vinheta / Jingle", "Efeito Sonoro (SFX)", "Trilha de Fundo", "Locução / Narração")
- duration (string: "Curto (30s)", "Padrão (1 min)", "Longo (2 min+)", "Vinheta (15-30s)", "Impacto Curto (3s)")
- vocalMode (string: "Sem voz (Instrumental)", "Com voz", "Sussurrado", "Acapella")
- vocalType (string: "Masculina", "Feminina", "Dupla (M+F)", "Coral", "Infantil", "Robótica / Sintética")
- vocalStyle (string: "Cantado melódico", "Rap / Falado", "Narrador / Locutor", "Lírico / Operístico", "Grito / Rasgado")
- language (string: "Português", "Inglês", "Espanhol", "Japonês", "Italiano", "Multilíngue (32 línguas)")
- lyricsMode (string: "Sem letra", "Gerar automaticamente", "Letra customizada")
- lyricsText (string)
- genre (string: "Cinemático", "Pop", "Trap", "Funk BR", "Eletrônico", "Orquestral", "Rock", "Lo-fi", "Gospel", "Corporativo", "Jornal / News", "Suspense / Terror", "Customizado")
- customGenre (string)
- instruments (array de strings ex ["Piano", "Strings (Violinos)", "Drums (Bateria)"])
- energy (string: "Baixa", "Média", "Alta", "Extrema")
- mood (string: "Nenhum", "Poderoso", "Alegre", "Triste", "Misterioso", "Urgente", "Relaxante e Calmo", "Épico / Heróico")
- tempo (string: "Lento", "Médio", "Rápido", "Muito Rápido")
- customBPM (string)
- structure (string)
- sfxIntent (string: "Impacto", "Foley / Movimento", "Ambiência / Passagem", "Interface / UI", "Mágico / Sci-Fi")
- sfxEnv (string: "Estúdio (clean)", "Espaço Aberto / Reverb", "Sala Pequena", "Caverna / Subterrâneo")
- sfxMix (string: "Dry (sem reverb)", "Wet (com espacialidade)", "Compressão Pesada")
- sfxLayers (string)
- finalization (string: "Padrão", "Fade out", "Corte seco", "Impacto final")
- loop (boolean)
- blockMusicality (boolean)
- quality (string: "Alta produção (Studio quality)", "Lo-fi Vintage", "Radio Broadcast")
- negativePrompt (string)

Seja muito solícito, técnico e direto ao ponto. Responda em Português do Brasil.
`;

      const history = activeMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const chatSession = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        history,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const result = await chatSession.sendMessage({ message: textToSend });
      let responseText = result.text || "";
      let applied = false;
      
      // Parse JSON if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/i);
      if (jsonMatch) {
        try {
          const newConfig = JSON.parse(jsonMatch[1]);
          onApplyConfig(newConfig);
          responseText = responseText.replace(/```json\n?[\s\S]*?\n?```/gi, '').trim();
          applied = true;
          showToast("Configurações aplicadas no painel de áudio!", "success");
        } catch(e) {
          console.error("Erro ao parsear JSON do assistente de áudio:", e);
        }
      }

      const modelMsg: ChatMessage = {
        role: "model",
        content: responseText || "Pronto! Atualizei o painel de áudio de acordo com seu pedido.",
        configApplied: applied
      };

      setChats(prev => ({ ...prev, [activeAssistant.id]: [...(prev[activeAssistant.id] || []), modelMsg] }));
    } catch (e: any) {
      console.error(e);
      showToast("Erro ao chamar assistente: " + (e.message || e), "error");
      setChats(prev => ({ ...prev, [activeAssistant.id]: [...(prev[activeAssistant.id] || []), { role: "model", content: "Ocorreu um erro ao processar sua solicitação de áudio. Verifique sua chave API ou tente novamente." }] }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div ref={chatPanelRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_4px_24px_rgba(197,168,128,0.25)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-black/90 border border-[#c5a880]/30 hover:border-[#c5a880]/60 text-[#c5a880]"
        title="Assistente de Áudio"
      >
        {isOpen ? <X size={20} className="text-[#c5a880]" /> : <MessageSquare size={20} className="text-[#c5a880]" />}
        {!isOpen && <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#c5a880]" />}
      </button>

      {isOpen && (
        <div className={`border border-zinc-800 bg-black shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 transition-all fixed sm:absolute bottom-20 right-4 left-4 sm:left-auto sm:right-0 sm:bottom-[68px] rounded-2xl w-[calc(100vw-32px)] sm:w-[440px] h-[580px] max-h-[82vh]`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 shrink-0">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-xl transition-all"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner" 
                  style={{ backgroundColor: `${activeAssistant.color}20`, color: activeAssistant.color }}
                >
                  {activeAssistant.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white leading-none mb-1 flex items-center gap-2">
                    {activeAssistant.label}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{activeAssistant.sublabel}</p>
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[310px] bg-[#111] border border-white/10 rounded-xl shadow-2xl p-1 z-[110]">
                  {assistants.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setActiveAssistant(a); setIsDropdownOpen(false); }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg transition-all text-left ${activeAssistant.id === a.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0" style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                        {a.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{a.label}</p>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{a.sublabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setChats(prev => ({...prev, [activeAssistant.id]: []}))} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl" title="Limpar Histórico">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 relative custom-scrollbar">
            {activeMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg" style={{ backgroundColor: `${activeAssistant.color}15`, color: activeAssistant.color }}>
                  {activeAssistant.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{activeAssistant.label}</h3>
                <p className="text-xs text-zinc-400 mb-5 max-w-[280px] leading-relaxed">
                  {activeAssistant.desc}
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 text-left mb-1">Sugestões rápidas:</p>
                  {activeAssistant.suggestions.map((sug, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSendMessage(sug)} 
                      className="text-[11px] text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-[#c5a880]/30 py-2.5 px-3 rounded-xl text-left transition-all truncate flex items-center justify-between group"
                    >
                      <span className="truncate">{sug}</span>
                      <Sparkles size={12} className="text-[#c5a880] opacity-50 group-hover:opacity-100 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user" 
                      ? "bg-[#c5a880] text-zinc-950 rounded-tr-sm font-medium shadow-md" 
                      : "bg-[#18181b] border border-white/10 text-zinc-200 rounded-tl-sm shadow-md whitespace-pre-wrap"
                  }`}>
                    {m.content}
                    {m.configApplied && (
                      <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-400" />
                        <span>Painel atualizado automaticamente!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-[#18181b] border border-white/5 p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-[#c5a880] rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-[#c5a880] rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-[#c5a880] rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-zinc-950 border-t border-white/5 shrink-0">
            <div className="flex items-end gap-2 bg-[#111] border border-white/10 p-2 rounded-2xl focus-within:border-[#c5a880]/50 focus-within:bg-black transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Peça ajuda com o áudio, trilha, voz ou vinheta..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-200 p-2 max-h-32 min-h-[44px] resize-none focus:outline-none custom-scrollbar"
                rows={1}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className={`p-3 rounded-xl shrink-0 transition-all ${
                  inputText.trim() && !isTyping
                    ? "bg-[#c5a880] text-zinc-950 hover:bg-[#b59b75] shadow-lg shadow-[#c5a880]/20"
                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                <Send size={16} className={inputText.trim() && !isTyping ? "translate-x-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

