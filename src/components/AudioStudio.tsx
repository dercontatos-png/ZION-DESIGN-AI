import React, { useState, useEffect } from "react";
import { 
  Music, Loader2, Download, Sparkles, Volume2, Mic, Settings2, Zap, 
  AudioWaveform, FileVideo, Cpu, ShieldCheck, CreditCard, RefreshCw, 
  Play, Pause, Trash2, Key, HelpCircle, CheckCircle2, History, AlertCircle, Clock 
} from "lucide-react";
import { ChatAudioAssistente } from "./ChatAudioAssistente";
import { t } from "../utils/i18n";
import { checkAdminOrOpenPlan, getAuthHeaders } from "../utils/userAuth";

interface GeneratedAudioItem {
  id: string;
  prompt: string;
  model: string;
  audioUrl: string;
  timestamp: string;
  duration?: number;
}

export default function AudioStudio() {
  const [creationMode, setCreationMode] = useState<'voice' | 'music' | 'sfx' | 'auto'>('voice');
  const [prompt, setPrompt] = useState("");
  const [speechText, setSpeechText] = useState("");
  const [model, setModel] = useState("auto"); // Default to Voice mode model
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [error, setError] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [voiceId, setVoiceId] = useState("EXAVITQu4vr4xnSDxMaL"); // Default Pâmela / Bella (Young Female)
  const [selectedDurationSec, setSelectedDurationSec] = useState<number>(15);

  // Switch creation modes cleanly
  const switchMode = (newMode: 'voice' | 'music' | 'sfx' | 'auto') => {
    setCreationMode(newMode);
    setError("");
    if (newMode === 'voice') {
      setModel('auto');
    } else if (newMode === 'music') {
      setModel('lyria-3-pro-preview');
      if (selectedDurationSec < 15) setSelectedDurationSec(30);
    } else if (newMode === 'sfx') {
      setModel('auto');
      if (selectedDurationSec > 20) setSelectedDurationSec(10);
    } else {
      setModel('auto');
    }
  };

  // API & Credits Status State

  const [geminiKey, setGeminiKey] = useState(() => {
    try {
      return localStorage.getItem("custom_gemini_api_key") || "";
    } catch (e) {
      return "";
    }
  });

  const saveGeminiKey = (key: string) => {
    setGeminiKey(key);
    try {
      localStorage.setItem("custom_gemini_api_key", key);
    } catch (e) {}
  };

  const [apiInfo, setApiInfo] = useState<{
    status: string;
    message: string;
    characterCount: number;
    characterLimit: number;
    remainingCharacters?: number;
    tier: string;
  }>({
    status: "loading",
    message: "Verificando saldo e cota da API...",
    characterCount: 0,
    characterLimit: 10000,
    tier: "Free / Default"
  });

  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);

  // Get active Gemini Key if saved in browser
  const getActiveApiKey = () => {
    try {
      const localKey = localStorage.getItem("custom_gemini_api_key");
      if (localKey && localKey.trim()) return localKey.trim();
    } catch (e) {}
    return geminiKey || "";
  };

  // AI Prompt Enhancer
  const handleEnhancePrompt = async (targetField: 'speech' | 'prompt') => {
    const textToImprove = targetField === 'speech' ? speechText : prompt;
    if (!textToImprove || !textToImprove.trim()) {
      setError("Digite uma ideia ou texto no campo antes de clicar em Melhorar com IA.");
      return;
    }

    if (!checkAdminOrOpenPlan(getActiveApiKey())) return;
    setIsImprovingPrompt(true);
    setError("");

    try {
      const res = await fetch("/api/melhorar-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(getActiveApiKey()) },
        body: JSON.stringify({
          prompt: textToImprove,
          assistantId: creationMode === 'voice' ? "audio-voice-director" : creationMode === 'music' ? "audio-music-director" : "audio-sfx-director",
          agentName: creationMode === 'voice' ? "Diretor de Locução & Voz" : creationMode === 'music' ? "Diretor Musical & Trilhas" : "Diretor de Efeitos SFX",
          customApiKey: getActiveApiKey()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao aprimorar prompt.");
      }

      if (data.improvedPrompt) {
        if (targetField === 'speech') {
          setSpeechText(data.improvedPrompt);
        } else {
          setPrompt(data.improvedPrompt);
        }
      }
    } catch (err: any) {
      setError(err.message || "Não foi possível aprimorar o prompt no momento.");
    } finally {
      setIsImprovingPrompt(false);
    }
  };


  // Quick prompt chips
  const applyPromptPreset = (presetText: string) => {
    if (creationMode === 'voice') {
      setSpeechText(presetText);
    } else {
      setPrompt(presetText);
    }
  };

  const handleGenerate = async () => {
    let finalPayloadPrompt = prompt.trim();
    let finalPayloadSpeechText = speechText.trim();

    if (creationMode === 'voice') {
      if (!finalPayloadSpeechText && !referenceFile) {
        setError("Por favor, digite o texto exato que a voz deve falar no campo 'Texto Exato a Ser Falado'.");
        return;
      }
    } else if (creationMode === 'music' || creationMode === 'sfx') {
      if (!finalPayloadPrompt && !referenceFile) {
        setError(`Por favor, descreva ${creationMode === 'music' ? 'a trilha musical' : 'o efeito sonoro'} no campo de descrição.`);
        return;
      }
      // Guarantee speechText is clear for music/SFX mode to avoid false speech triggers
      finalPayloadSpeechText = "";

      // Append duration requirement if user didn't explicitly write seconds
      if (finalPayloadPrompt && !/\d+\s*(s|segundos|seg|sec)\b/i.test(finalPayloadPrompt)) {
        finalPayloadPrompt += ` de ${selectedDurationSec} segundos`;
      }
    } else {
      if (!finalPayloadPrompt && !finalPayloadSpeechText && !referenceFile) {
        setError("Por favor, preencha o campo de texto ou o campo de instruções.");
        return;
      }
    }

    if (!checkAdminOrOpenPlan(getActiveApiKey())) return;
    setError("");
    setIsGenerating(true);
    setAudioUrl(null);
    setWarningMessage("");

    try {
      const formData = new FormData();
      formData.append("prompt", finalPayloadPrompt);
      formData.append("speechText", finalPayloadSpeechText);
      formData.append("modelId", model);
      formData.append("voiceId", voiceId);
      formData.append("durationSec", String(selectedDurationSec));
      formData.append("customApiKey", getActiveApiKey());
      
      if (referenceFile) {
        formData.append("file", referenceFile);
      }

      const authHdrs = getAuthHeaders(getActiveApiKey());
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "x-user-role": authHdrs["x-user-role"],
          "x-user-email": authHdrs["x-user-email"],
          ...(authHdrs["x-custom-api-key"] ? { "x-custom-api-key": authHdrs["x-custom-api-key"] } : {})
        },
        body: formData,
      });

      let data: any = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => ({}));
      } else {
        const textResponse = await res.text();
        if (!res.ok) {
          const cleanMessage = textResponse.replace(/<[^>]*>?/gm, '').trim().slice(0, 200);
          throw new Error(cleanMessage || `Erro do servidor (${res.status})`);
        }
      }

      if (!res.ok) {
        throw new Error(data.error || `Erro (${res.status}) ao gerar áudio.`);
      }

      if (data.audioBase64) {
        if (data.warning) {
          setWarningMessage(data.warning);
        }
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Add to history
        const displayTitle = speechText.trim() 
          ? `Fala: "${speechText.slice(0, 40)}${speechText.length > 40 ? '...' : ''}"`
          : (prompt || "Áudio Gerado por Referência");

        const newItem: GeneratedAudioItem = {
          id: String(Date.now()),
          prompt: displayTitle,
          model: model === "auto" ? "IA Automática" : "Lyria 2",
          audioUrl: url,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          duration: data.duration || 10
        };
        setHistory(prev => [newItem, ...prev]);

        // Refresh usage info
        
      } else {
        throw new Error("Nenhum áudio foi retornado pela API.");
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado na geração de áudio.");
    } finally {
      setIsGenerating(false);
    }
  };

  const remainingQuota = apiInfo.remainingCharacters !== undefined 
    ? apiInfo.remainingCharacters 
    : Math.max(0, apiInfo.characterLimit - apiInfo.characterCount);

  const quotaPercent = Math.min(100, Math.round((apiInfo.characterCount / (apiInfo.characterLimit || 10000)) * 100));

  return (
    <div className="flex flex-col h-full bg-[#030304] text-zinc-100 font-sans selection:bg-[#c5a880]/30 selection:text-white">
      {/* Studio Top Navigation Bar */}
      <header className="p-4 md:p-6 border-b border-white/10 bg-[#0a0a0d] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c5a880]/20 to-emerald-500/10 border border-[#c5a880]/40 flex items-center justify-center shrink-0 shadow-lg shadow-[#c5a880]/10">
            <Music size={22} className="text-[#c5a880]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              Estúdio de Áudio & Som
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                IA Inteligente Ativa
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Crie trilhas sonoras, vinhetas de TV, efeitos SFX e narrações com suporte a duração exata
            </p>
          </div>
        </div>

        {/* Creation Mode Tabs Selector */}
        <div className="flex flex-wrap items-center bg-[#050507] p-1.5 rounded-2xl border border-white/10 gap-1.5 shadow-inner">
          <button
            onClick={() => switchMode("voice")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              creationMode === "voice"
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/25 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            <Mic size={14} />
            🎤 Voz & Locução (IA)
          </button>
          <button
            onClick={() => switchMode("music")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              creationMode === "music"
                ? "bg-[#c5a880] text-zinc-950 font-bold shadow-lg shadow-[#c5a880]/25 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            <Music size={14} />
            🎵 Trilha Musical
          </button>
          <button
            onClick={() => switchMode("sfx")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              creationMode === "sfx"
                ? "bg-cyan-500 text-zinc-950 font-bold shadow-lg shadow-cyan-500/25 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            <Zap size={14} />
            ⚡ Efeitos Sonoros (SFX)
          </button>
          <button
            onClick={() => switchMode("auto")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              creationMode === "auto"
                ? "bg-purple-500 text-zinc-950 font-bold shadow-lg shadow-purple-500/25 scale-[1.02]"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            <Sparkles size={14} />
            ✨ IA Automática (Livre)
          </button>
        </div>
      </header>

      {/* Main Studio Body Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Simple Creation & Inputs (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Quick Preset Ideas Chips - Dependent on Creation Mode */}
          <div className="bg-[#0b0b0e] p-4 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#c5a880] flex items-center justify-between uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sparkles size={14} /> Ideias para {creationMode === 'voice' ? 'Locução & Fala' : creationMode === 'music' ? 'Trilhas Musicais' : creationMode === 'sfx' ? 'Efeitos SFX' : 'Áudio em Geral'}:</span>
              <span className="text-[10px] text-zinc-500 font-normal">Clique para aplicar</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {(creationMode === 'voice' ? [
                'Oi gente, eu sou a Pâmela! Sejam bem-vindos ao meu canal.',
                'Atenção para esta oferta imperdível de internet fibra óptica com instalação grátis!',
                'Bem-vindo ao nosso aplicativo. Escolha uma das opções abaixo para prosseguir.',
                'Hoje vamos apresentar a nova tecnologia de síntese de voz hiper-realista.'
              ] : creationMode === 'music' ? [
                'Trilha sonora corporativa e inspiradora de 15 segundos para vídeo de internet fibra',
                'Vinheta alegre, dinâmica e animada de 10s para abertura de canal de notícias',
                'Música calma estilo lo-fi com piano suave e ritmo sutil para estudo',
                'Abertura épica de podcast com sintetizadores e percussão marcante'
              ] : creationMode === 'sfx' ? [
                'Efeito sonoro futurista de portal sci-fi se abrindo com eco e energia de 5s',
                'Passos pesados de botas em terreno com cascalho e vento suave',
                'Transição de vídeo rápida tipo swoosh com impacto de grave no final',
                'Som de aplausos e vibração de plateia em auditório lotado'
              ] : [
                'Trilha para comercial de TV de internet fibra de 15 segundos',
                'Locução cativante e profissional em português para anúncio',
                'Efeito sonoro futurista de portal abrindo com eco de 5s'
              ]).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPromptPreset(chip)}
                  className="bg-[#141419] hover:bg-[#c5a880]/20 hover:text-[#c5a880] hover:border-[#c5a880]/40 text-xs text-zinc-300 px-3 py-1.5 rounded-xl border border-white/10 transition-all text-left leading-relaxed shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt & Reference Container */}
          <div className="bg-[#0c0c0f] p-5 md:p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-5">
            
            {/* MODE 1: VOICE & SPEECH MODE */}
            {(creationMode === 'voice' || creationMode === 'auto') && (
              <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Mic size={16} />
                    Texto Exato a Ser Falado (Roteiro / Fala)
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Modo Voz Ativo
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Escreva AQUI o texto exato que a voz dirá. A IA narrará <strong>exatamente estas palavras</strong> em português fluente.
                </p>

                <div className="relative">
                  <textarea
                    className="w-full bg-[#050507] border border-emerald-500/30 rounded-xl p-3.5 pr-36 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-none min-h-[110px] leading-relaxed"
                    placeholder='Exemplo: "Oi gente, eu sou a Pâmela! Sejam todos muito bem-vindos ao meu canal."'
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleEnhancePrompt('speech')}
                    disabled={isImprovingPrompt || !speechText.trim()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Aprimorar este roteiro com Inteligência Artificial"
                  >
                    {isImprovingPrompt ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-emerald-400" />
                        <span>Aprimorando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                        <span>✨ Melhorar Roteiro</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Voice Selection Section inside Voice Mode */}
                <div className="pt-2 border-t border-emerald-500/10 flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
                    <span>Escolha a Voz do Narrador / Locutor:</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Voz Nativa do Google</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "EXAVITQu4vr4xnSDxMaL", name: "Pâmela / Bella", desc: "Feminina Jovem, Comercial", icon: "👩" },
                      { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", desc: "Masculino Grave, Narração", icon: "👨" },
                      { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", desc: "Feminina Suave, Documentário", icon: "👩" },
                      { id: "ErXwobaYiN019PkySvjV", name: "Antoni", desc: "Masculino Firme, Dinâmico", icon: "👨" },
                      { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", desc: "Feminina Forte, Apresentadora", icon: "👩" },
                      { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", desc: "Masculino Jovem & Cativante", icon: "👨" }
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoiceId(v.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                          voiceId === v.id
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold shadow-md shadow-emerald-500/10"
                            : "bg-[#050507] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{v.icon}</span> {v.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Tone / Style Instructions for Voice */}
                <div className="pt-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Estilo, Tom ou Emoção da Fala (Opcional):
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    placeholder='Ex: "Entusiasmada, ritmo dinâmico para vídeo de Instagram, tom jovem e alegre"'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* MODE 2: MUSIC & TRACK MODE */}
            {creationMode === 'music' && (
              <div className="bg-[#c5a880]/5 p-4 rounded-xl border border-[#c5a880]/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#c5a880] flex items-center gap-2">
                    <Music size={16} />
                    Descrição da Trilha Musical / Estilo
                  </label>
                  <span className="text-[10px] bg-[#c5a880]/20 text-[#c5a880] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Modo Trilha Ativo
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Descreva os instrumentos, ritmo e estilo da música de fundo desejada.
                </p>

                <div className="relative">
                  <textarea
                    className="w-full bg-[#050507] border border-[#c5a880]/30 rounded-xl p-3.5 pr-36 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880] transition-all resize-none min-h-[110px] leading-relaxed"
                    placeholder='Exemplo: "Trilha sonora corporativa e inspiradora para propaganda de internet fibra óptica, estilo synth-pop com piano e batida animada"'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleEnhancePrompt('prompt')}
                    disabled={isImprovingPrompt || !prompt.trim()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#c5a880]/20 hover:bg-[#c5a880]/35 border border-[#c5a880]/40 text-[#e6c687] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Aprimorar descrição da trilha com Inteligência Artificial"
                  >
                    {isImprovingPrompt ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#c5a880]" />
                        <span>Aprimorando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-[#c5a880] animate-pulse" />
                        <span>✨ Melhorar Trilha</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Duration Selector for Music */}
                <div className="pt-2 border-t border-[#c5a880]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#c5a880]" />
                      Duração exata da trilha:
                    </label>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={11} /> Síntese musical contínua sem emendas ou cortes
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[15, 30, 45, 60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedDurationSec(sec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedDurationSec === sec
                            ? "bg-[#c5a880] text-zinc-950 font-bold shadow-md shadow-[#c5a880]/20"
                            : "bg-[#050507] text-zinc-400 border border-white/10 hover:text-white"
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Music Engine choice */}
                <div className="pt-2 border-t border-[#c5a880]/10 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-zinc-300">Motor de Geração:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModel("lyria-3-pro-preview")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        model === "lyria-3-pro-preview"
                          ? "bg-[#c5a880] text-zinc-950 font-bold"
                          : "bg-[#050507] text-zinc-400 border border-white/10"
                      }`}
                    >
                      Lyria 2 (Música HD)
                    </button>

                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: SFX SOUND EFFECTS MODE */}
            {creationMode === 'sfx' && (
              <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Zap size={16} />
                    Descrição do Efeito Sonoro (SFX)
                  </label>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Modo SFX Ativo
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Descreva o som ambiente, impacto, textura ou transição sonora.
                </p>

                <div className="relative">
                  <textarea
                    className="w-full bg-[#050507] border border-cyan-500/30 rounded-xl p-3.5 pr-36 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none min-h-[110px] leading-relaxed"
                    placeholder='Exemplo: "Passos pesados de botas em cascalho com vento suave ao fundo e galhos quebrando"'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleEnhancePrompt('prompt')}
                    disabled={isImprovingPrompt || !prompt.trim()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Aprimorar efeito sonoro com Inteligência Artificial"
                  >
                    {isImprovingPrompt ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-cyan-400" />
                        <span>Aprimorando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                        <span>✨ Melhorar SFX</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Duration Selector for SFX */}
                <div className="pt-2 border-t border-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Clock size={14} className="text-cyan-400" />
                    Duração do efeito sonoro:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[3, 5, 10, 15, 20].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedDurationSec(sec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedDurationSec === sec
                            ? "bg-cyan-400 text-zinc-950 font-bold"
                            : "bg-[#050507] text-zinc-400 border border-white/10 hover:text-white"
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reference File Dropzone */}
            <div className="bg-[#050507] border border-dashed border-white/15 hover:border-[#c5a880]/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#c5a880]">
                  <FileVideo size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Vídeo ou Áudio de Referência (Opcional)</h4>
                  <p className="text-[11px] text-zinc-500">Envie um arquivo para sincronizar o tempo e ritmo exatos com o vídeo.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  id="reference-file-input"
                  accept="audio/*,video/*,image/*"
                  onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="reference-file-input"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 px-3.5 py-2 rounded-xl cursor-pointer transition-all font-medium"
                >
                  {referenceFile ? "Alterar Arquivo" : "Anexar Mídia"}
                </label>
                {referenceFile && (
                  <button
                    onClick={() => setReferenceFile(null)}
                    className="text-xs text-red-400 hover:text-red-300 p-2"
                    title="Remover referência"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {referenceFile && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg flex items-center justify-between">
                <span>Anexado: <strong>{referenceFile.name}</strong></span>
                <span className="text-[10px] text-zinc-400">({(referenceFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>

                {(error.toLowerCase().includes("cota") ||
                  error.toLowerCase().includes("crédito") ||
                  error.toLowerCase().includes("chave") ||
                  error.toLowerCase().includes("quota") ||
                  error.toLowerCase().includes("429")) && (
                  <div className="pt-2 border-t border-red-500/20 flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-red-500/20">
                    <span className="text-[11px] font-bold text-[#c5a880] flex items-center gap-1.5">
                      <Key size={13} /> Insira sua chave para continuar gerando sem limites:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="password"
                        placeholder="Cole sua GEMINI_API_KEY (AI Studio)..."
                        value={geminiKey}
                        onChange={(e) => saveGeminiKey(e.target.value)}
                        className="flex-1 bg-[#050507] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-[#c5a880] hover:bg-[#b59870] text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-[#c5a880]/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin text-zinc-950" />
                  <span>Sintetizando Áudio via IA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Gerar Áudio com IA</span>
                </>
              )}
            </button>
          </div>

          {/* API Information & Credit Quota Widget */}
          

        </div>

        {/* Right Column: Audio Preview & Output (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Player Display Box */}
          <div className="bg-[#0c0c0f] p-5 md:p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col flex-1 min-h-[380px]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Resultado da Geração</span>
              {audioUrl && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono uppercase">
                  Pronto
                </span>
              )}
            </h3>

            <div className="flex-1 bg-[#050507] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#c5a880]/20 rounded-full" />
                    <div className="w-20 h-20 border-4 border-[#c5a880] border-t-transparent rounded-full animate-spin absolute inset-0" />
                    <AudioWaveform size={28} className="absolute inset-0 m-auto text-[#c5a880] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#c5a880] mb-1">
                      {creationMode === 'music' ? "Compondo trilha em HD (Lyria 2)..." : "Processando áudio com IA..."}
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
                      {creationMode === 'music' 
                        ? "O modelo Lyria do Google está analisando os arranjos e estruturando sua música instrumental completa de alta fidelidade. O limite gratuito pode demorar um pouco." 
                        : "Sintetizando frequências e renderizando a trilha na duração solicitada."}
                    </p>
                  </div>
                </div>
              ) : audioUrl ? (
                <div className="w-full flex flex-col items-center gap-6 my-auto">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#c5a880]/20 to-emerald-500/20 border border-[#c5a880]/40 flex items-center justify-center shadow-[0_0_50px_rgba(197,168,128,0.25)]">
                    <Music size={44} className="text-[#c5a880]" />
                  </div>

                  <div className="w-full bg-[#0c0c0f] p-4 rounded-xl border border-white/10 shadow-inner">
                    <audio controls src={audioUrl} className="w-full h-11 outline-none" autoPlay />
                  </div>

                  {warningMessage && (
                    <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs p-3 rounded-lg flex items-start gap-2 shadow-inner">
                      <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{warningMessage}</p>
                    </div>
                  )}

                  <a
                    href={audioUrl}
                    download={`audio-studio-${Date.now()}.mp3`}
                    className="w-full bg-[#c5a880] hover:bg-[#b59870] text-zinc-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-[#c5a880]/20 active:scale-[0.99]"
                  >
                    <Download size={16} /> Baixar Arquivo em Alta Qualidade
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center text-zinc-500">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                    <Volume2 size={28} className="text-zinc-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-400">Nenhum áudio gerado ainda</h4>
                  <p className="text-[11px] text-zinc-500 max-w-[220px]">
                    Escreva o que precisa no campo ao lado e clique em "Gerar Áudio com IA".
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* History / Recent Tracks List */}
          {history.length > 0 && (
            <div className="bg-[#0c0c0f] p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-[#c5a880]" />
                Histórico Recente de Áudios ({history.length})
              </h4>
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#050507] p-3 rounded-xl border border-white/5 hover:border-white/20 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <button
                        onClick={() => setAudioUrl(item.audioUrl)}
                        className="w-8 h-8 rounded-lg bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                      >
                        <Play size={14} />
                      </button>
                      <div className="truncate">
                        <p className="text-xs text-zinc-200 font-medium truncate">{item.prompt}</p>
                        <span className="text-[10px] text-zinc-500">{item.model} • {item.timestamp}</span>
                      </div>
                    </div>
                    <a
                      href={item.audioUrl}
                      download={`audio-${item.id}.mp3`}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                      title="Baixar"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Floating Assistant Modal */}
      <ChatAudioAssistente
        customApiKey={getActiveApiKey()}
        showToast={(msg, type) => (type === "error" ? setError(msg) : alert(msg))}
        currentConfig={{ prompt, model }}
        onApplyConfig={(cfg) => {
          if (cfg.prompt) setPrompt(cfg.prompt);
          if (cfg.model) setModel(cfg.model);
        }}
      />
    </div>
  );
}
