import React, { useState } from 'react';
import { Eye, EyeOff, Check, Trash2, Video, Key, Sparkles, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export interface ApiKeysState {
  geminiApiKey?: string;
  replicateApiKey?: string;
  heygenApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  openrouterApiKey?: string;
}

interface ApiKeyManagerTabProps {
  myProfile: any;
  setMyProfile: (profile: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface ProviderConfig {
  id: keyof ApiKeysState;
  storageKey: string;
  name: string;
  subtitle: string;
  docUrl: string;
  docLabel: string;
  videoUrl?: string;
  rates: { label: string; cost: string }[];
  placeholder: string;
  iconBg: string;
  iconColor: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'geminiApiKey',
    storageKey: 'custom_gemini_api_key',
    name: 'API Google Gemini',
    subtitle: 'Para gerar imagens (Banana Nano 2 / Gemini 3 Pro) e vídeos (Veo 3.1).',
    docUrl: 'https://aistudio.google.com/app/apikey',
    docLabel: 'Google AI Studio',
    videoUrl: 'https://aistudio.google.com',
    rates: [
      { label: 'Imagem 1K', cost: '~R$ 0,35' },
      { label: '2K', cost: '~R$ 0,53' },
      { label: '4K', cost: '~R$ 0,79' },
      { label: 'Vídeo Veo 3.1 (720p/1080p)', cost: '~R$ 2,10/seg' },
      { label: 'Vídeo Veo 3.1 (4K)', cost: '~R$ 3,10/seg' },
    ],
    placeholder: 'Nova chave para substituir...',
    iconBg: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  {
    id: 'replicateApiKey',
    storageKey: 'custom_replicate_api_key',
    name: 'API Replicate',
    subtitle: 'Para gerar vídeos com Kling e remover fundo de imagens.',
    docUrl: 'https://replicate.com/account/api-tokens',
    docLabel: 'replicate.com/account/api-tokens',
    rates: [
      { label: 'Vídeo Kling v3', cost: '~R$ 0,55 por segundo' },
      { label: 'Remoção de fundo', cost: '~R$ 0,01 por imagem' },
    ],
    placeholder: 'Cole sua chave API do Replicate (r8_...)',
    iconBg: 'bg-purple-500/10 border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  {
    id: 'heygenApiKey',
    storageKey: 'custom_heygen_api_key',
    name: 'API HeyGen',
    subtitle: 'Para gerar vídeos de avatar falando a sua narração.',
    docUrl: 'https://app.heygen.com/settings?nav=API',
    docLabel: 'app.heygen.com → API',
    rates: [
      { label: 'Avatar falante', cost: '~R$ 0,09 a R$ 0,37 por segundo, conforme o motor' },
    ],
    placeholder: 'Cole sua chave API da HeyGen',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400'
  },
  {
    id: 'openaiApiKey',
    storageKey: 'custom_openai_api_key',
    name: 'API OpenAI',
    subtitle: 'Para gerar imagens com gpt-image-2 (ChatGPT Images 2.0 / DALL-E 3).',
    docUrl: 'https://platform.openai.com/api-keys',
    docLabel: 'platform.openai.com/api-keys',
    rates: [
      { label: 'Imagem 1K', cost: '~R$ 0,28' },
      { label: '2K', cost: '~R$ 1,10' },
    ],
    placeholder: 'Cole sua chave API da OpenAI (sk-...)',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400'
  },
  {
    id: 'anthropicApiKey',
    storageKey: 'custom_anthropic_api_key',
    name: 'API Anthropic (Claude)',
    subtitle: 'Para usar os modelos Claude (Claude 3.7, Opus, Sonnet, Haiku) no construtor.',
    docUrl: 'https://console.anthropic.com/settings/keys',
    docLabel: 'console.anthropic.com/settings/keys',
    rates: [
      { label: 'Claude 3.7 Sonnet', cost: '~R$ 0,02 / 1k tokens' },
      { label: 'Claude 3.5 Haiku', cost: '~R$ 0,005 / 1k tokens' },
    ],
    placeholder: 'Cole sua chave API da Anthropic (sk-ant-...)',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  {
    id: 'openrouterApiKey',
    storageKey: 'custom_openrouter_api_key',
    name: 'API OpenRouter',
    subtitle: 'Uma chave só destrava Grok, DeepSeek V3/R1, Llama 3.3 e Qwen tanto na aba quanto no canvas.',
    docUrl: 'https://openrouter.ai/keys',
    docLabel: 'openrouter.ai/keys',
    rates: [
      { label: 'DeepSeek R1 / V3', cost: '~R$ 0,003 / 1k tokens' },
      { label: 'Llama 3.3 70B', cost: '~R$ 0,002 / 1k tokens' },
    ],
    placeholder: 'Cole sua chave API do OpenRouter (sk-or-...)',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    iconColor: 'text-indigo-400'
  }
];

export const ApiKeyManagerTab: React.FC<ApiKeyManagerTabProps> = ({
  myProfile,
  setMyProfile,
  showToast
}) => {
  const [keysInput, setKeysInput] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    PROVIDERS.forEach(p => {
      initial[p.id] = myProfile?.[p.id] || localStorage.getItem(p.storageKey) || '';
    });
    return initial;
  });

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  const toggleShowPassword = (providerId: string) => {
    setShowPassword(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleSaveKey = (provider: ProviderConfig) => {
    const value = (keysInput[provider.id] || '').trim();
    if (value) {
      localStorage.setItem(provider.storageKey, value);
      setMyProfile({ ...myProfile, [provider.id]: value });
      showToast(`Chave da ${provider.name} salva com sucesso! ✅`, 'success');
    } else {
      localStorage.removeItem(provider.storageKey);
      setMyProfile({ ...myProfile, [provider.id]: '' });
      showToast(`Chave da ${provider.name} removida.`, 'info');
    }

    setSavedStatus(prev => ({ ...prev, [provider.id]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [provider.id]: false }));
    }, 2000);
  };

  const handleRemoveKey = (provider: ProviderConfig) => {
    localStorage.removeItem(provider.storageKey);
    setKeysInput(prev => ({ ...prev, [provider.id]: '' }));
    setMyProfile({ ...myProfile, [provider.id]: '' });
    showToast(`Chave da ${provider.name} removida com sucesso.`, 'info');
  };

  const isConfigured = (provider: ProviderConfig) => {
    const keyVal = myProfile?.[provider.id] || localStorage.getItem(provider.storageKey) || '';
    return Boolean(keyVal && keyVal.trim().length > 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Informativo Superior Dourado */}
      <div className="bg-[#11141c] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#c5a880] to-[#8c7350]" />
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Antes de conectar suas chaves</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Pra começar a gerar, você precisa <strong className="text-white">conectar pelo menos uma chave</strong>. Cada provedor (Google, Replicate, OpenAI) tem um vídeo curto e direto logo abaixo do card explicando como gerar a chave dele — <strong className="text-white">assista do começo ao fim</strong>, isso evita 90% dos erros de configuração.
            </p>
            <p className="text-zinc-500 pt-1">
              Não precisa conectar todas — <strong className="text-zinc-300">só as que você vai usar</strong>. Se vai gerar só imagens com Gemini, conecta só a do Google e ignora as outras.
            </p>
            <p className="text-zinc-400 pt-1 flex items-center gap-1.5">
              <span>Travou em algo?</span>
              <a 
                href="https://wa.me/5575988588888" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#c5a880] font-semibold hover:underline"
              >
                Fale com a gente no suporte
              </a>
              <span>— respondemos rápido.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Cards de Provedores de API */}
      <div className="space-y-4">
        {PROVIDERS.map(provider => {
          const configured = isConfigured(provider);
          const currentInput = keysInput[provider.id] || '';
          const isVisible = showPassword[provider.id] || false;
          const isSaved = savedStatus[provider.id] || false;

          return (
            <div
              key={provider.id}
              className={`bg-[#0d121c] border ${configured ? 'border-white/10' : 'border-white/5'} rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-lg hover:border-white/20`}
            >
              {/* Header do Card com Nome e Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a880]">
                    <Key size={13} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {provider.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {provider.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {configured ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Configurada
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-zinc-800/60 border border-white/5 text-zinc-400 text-[11px] font-semibold rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      Não configurada
                    </span>
                  )}
                </div>
              </div>

              {/* Custos Médios por Geração */}
              <div className="bg-[#090d15] border border-white/5 rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-bold text-amber-400/90 flex items-center gap-1.5">
                  🔥 Custos médios por geração:
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-300">
                  {provider.rates.map((rate, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1">
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400">{rate.label}:</span>
                      <strong className="text-white font-mono">{rate.cost}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input da Chave & Ações */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={currentInput}
                      onChange={e => setKeysInput(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      placeholder={provider.placeholder}
                      className="w-full bg-[#050810] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]/60 font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                      title={isVisible ? 'Ocultar chave' : 'Mostrar chave'}
                    >
                      {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveKey(provider)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 ${
                        isSaved
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                      }`}
                    >
                      {isSaved ? <Check size={14} /> : configured ? 'Atualizar' : 'Salvar'}
                    </button>

                    {configured && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKey(provider)}
                        className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        title="Remover Chave"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Remover</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner de Aviso de Faturamento (Específico do Google) */}
                {provider.id === 'geminiApiKey' && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-amber-400" />
                    <span>
                      Ative o faturamento no{' '}
                      <a
                        href={provider.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold hover:text-white"
                      >
                        Google AI Studio
                      </a>{' '}
                      pra evitar bloqueio por limite de cota.
                    </span>
                  </div>
                )}

                {/* Link do Tutorial & Obtenção */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1">
                  <div className="text-zinc-500 flex items-center gap-1">
                    <span>Obtenha em</span>
                    <a
                      href={provider.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#c5a880] hover:underline flex items-center gap-1 font-medium"
                    >
                      {provider.docLabel}
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <a
                    href={provider.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3b82f6] hover:underline flex items-center gap-1 font-medium self-start sm:self-auto"
                  >
                    <Video size={12} />
                    <span>Não sabe como conectar sua chave? Clique e assista um vídeo rápido</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
