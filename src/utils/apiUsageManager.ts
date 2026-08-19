export interface UsageStats {
  generatedToday: number;
  generatedTotal: number;
  chatToday: number;
  lastDate: string;
  lastGenerationTimestamp?: number;
}

export interface LiveKeyStatus {
  status: "active" | "quota_exceeded" | "invalid_key" | "error";
  keyType: string;
  message: string;
  dailyEstimate: string;
}

export interface QuotaInfoGuide {
  maxRpm: string;
  recommendedIntervalSeconds: number;
  maxDailyFree: string;
  tips: string[];
}

const STORAGE_KEY = "zion_api_usage_stats";
export const RECOMMENDED_COOLDOWN_SECONDS = 30; // Intervalo recomendado de 30 segundos entre gerações seguidas

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getUsageStats(): UsageStats {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: UsageStats = JSON.parse(raw);
      // Reset daily counts if new day
      if (parsed.lastDate !== today) {
        parsed.generatedToday = 0;
        parsed.chatToday = 0;
        parsed.lastDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading usage stats:", e);
  }

  const initial: UsageStats = {
    generatedToday: 0,
    generatedTotal: 0,
    chatToday: 0,
    lastDate: today
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function recordImageGeneration(count = 1): UsageStats {
  const stats = getUsageStats();
  stats.generatedToday += count;
  stats.generatedTotal += count;
  stats.lastDate = getTodayString();
  stats.lastGenerationTimestamp = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}

export function recordChatRequest(count = 1): UsageStats {
  const stats = getUsageStats();
  stats.chatToday += count;
  stats.lastDate = getTodayString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}

export function getCooldownRemainingSeconds(): number {
  const stats = getUsageStats();
  if (!stats.lastGenerationTimestamp) return 0;
  const elapsed = Math.floor((Date.now() - stats.lastGenerationTimestamp) / 1000);
  const remaining = RECOMMENDED_COOLDOWN_SECONDS - elapsed;
  return remaining > 0 ? remaining : 0;
}

export function getQuotaGuideInfo(): QuotaInfoGuide {
  return {
    maxRpm: "2 a 5 artes por minuto",
    recommendedIntervalSeconds: RECOMMENDED_COOLDOWN_SECONDS,
    maxDailyFree: "~50 a 100 artes por dia (Plano Gratuito)",
    tips: [
      "⏱️ Intervalo Recomendado: Aguarde 30 segundos após cada geração de imagem antes de iniciar a próxima.",
      "⚠️ Evite o Erro 429: Se você clicar em 'Gerar' várias vezes em menos de 1 minuto, a API do Google bloqueará temporariamente a cota por excesso de requisições por minuto (RPM).",
      "📊 Limite Diário: Na cota gratuita do Google AI Studio você tem ~50-100 imagens e 1.500 mensagens de texto por dia.",
      "🚀 Sem limites por minuto: Para utilizar o gerador em alta velocidade sem esperar 30s, insira uma chave da Vertex AI (Conta de Serviço JSON)."
    ]
  };
}

export async function checkLiveApiQuota(customApiKey?: string): Promise<LiveKeyStatus> {
  try {
    const effectiveKey = customApiKey || localStorage.getItem("custom_gemini_api_key") || "";
    const res = await fetch("/api/check-api-quota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customApiKey: effectiveKey })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        status: "error",
        keyType: "Desconhecido",
        message: err.error || "Erro ao conectar com servidor.",
        dailyEstimate: "Indisponível"
      };
    }
    return await res.json();
  } catch (e: any) {
    return {
      status: "error",
      keyType: "Desconhecido",
      message: e.message || "Erro de conexão de rede.",
      dailyEstimate: "Indisponível"
    };
  }
}
