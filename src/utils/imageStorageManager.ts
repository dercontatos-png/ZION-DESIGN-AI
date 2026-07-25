/**
 * Gerenciador de Armazenamento Automático de Imagens
 *
 * Monitora o consumo do localStorage do navegador e realiza limpeza automática
 * EXCLUSIVAMENTE de dados de imagem (galeria, projetos antigos, cards e uploads temporários)
 * quando o limite do navegador (~5MB) estiver próximo do esgotamento ou estourar (QuotaExceededError).
 *
 * NUNCA altera ou apaga dados de clientes, tarefas, finanças, perfil ou eventos.
 */

const MAX_STORAGE_CHARS = 4_500_000; // ~4.5MB em UTF-16 (o limite típico do localStorage é 5MB)
const WARNING_THRESHOLD = 0.75; // 75% de ocupação (~3.4MB)

export interface StorageStats {
  totalChars: number;
  imageChars: number;
  percentageUsed: number;
  isNearLimit: boolean;
}

/**
 * Calcula o uso atual do localStorage
 */
export const getStorageStats = (): StorageStats => {
  let totalChars = 0;
  let imageChars = 0;

  const imageKeys = [
    'savedCards',
    'design_projects',
    'zion_project_list_v5',
    'logoRefs',
    'galeriaImages',
    'generatedImages'
  ];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        const length = key.length + val.length;
        totalChars += length;

        if (imageKeys.includes(key) || val.includes('data:image/')) {
          imageChars += length;
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao ler estatísticas do localStorage:', e);
  }

  const percentageUsed = Math.min(100, Math.round((totalChars / MAX_STORAGE_CHARS) * 100));
  const isNearLimit = totalChars >= MAX_STORAGE_CHARS * WARNING_THRESHOLD;

  return {
    totalChars,
    imageChars,
    percentageUsed,
    isNearLimit
  };
};

/**
 * Executa a limpeza automática focada SOMENTE no armazenamento de imagens
 */
export const cleanImageStorage = (forceAggressive = false): { freedChars: number; logMessage: string } => {
  const initialStats = getStorageStats();
  let freedChars = 0;
  const actionsTaken: string[] = [];

  try {
    // 1. Limpar / Reduzir savedCards (MANTÉM os 5 a 8 mais recentes)
    const savedCardsRaw = localStorage.getItem('savedCards');
    if (savedCardsRaw) {
      try {
        const cards = JSON.parse(savedCardsRaw);
        if (Array.isArray(cards) && cards.length > (forceAggressive ? 4 : 8)) {
          const limit = forceAggressive ? 4 : 8;
          const keptCards = cards.slice(0, limit);
          const newRaw = JSON.stringify(keptCards);
          freedChars += (savedCardsRaw.length - newRaw.length);
          localStorage.setItem('savedCards', newRaw);
          actionsTaken.push(`Galeria salva reduzida para os ${limit} mais recentes`);
        }
      } catch (e) {
        localStorage.removeItem('savedCards');
        actionsTaken.push('Galeria antiga corrompida removida');
      }
    }

    // 2. We no longer trim zion_project_list_v5 here because it uses IDB

    // 3. Limpar design_projects antigos em useImageStore
    const designProjRaw = localStorage.getItem('design_projects');
    if (designProjRaw) {
      try {
        const dProjects = JSON.parse(designProjRaw);
        if (Array.isArray(dProjects) && dProjects.length > (forceAggressive ? 3 : 5)) {
          const limit = forceAggressive ? 3 : 5;
          const kept = dProjects.slice(0, limit);
          const newRaw = JSON.stringify(kept);
          freedChars += (designProjRaw.length - newRaw.length);
          localStorage.setItem('design_projects', newRaw);
          actionsTaken.push(`Projetos de design reduzidos para ${limit} mais recentes`);
        }
      } catch (e) {
        localStorage.removeItem('design_projects');
      }
    }

    // 4. Limpar logoRefs caso haja acúmulo excessivo de base64
    const logoRefsRaw = localStorage.getItem('logoRefs');
    if (logoRefsRaw) {
      try {
        const logos = JSON.parse(logoRefsRaw);
        if (Array.isArray(logos) && logos.length > 3) {
          const keptLogos = logos.slice(0, 3);
          const newRaw = JSON.stringify(keptLogos);
          freedChars += (logoRefsRaw.length - newRaw.length);
          localStorage.setItem('logoRefs', newRaw);
          actionsTaken.push(`Logotipos em cache reduzidos para os 3 mais recentes`);
        }
      } catch (e) {
        localStorage.removeItem('logoRefs');
      }
    }

  } catch (err) {
    console.error('Erro na limpeza automática de imagens:', err);
  }

  const finalStats = getStorageStats();
  const logMessage = actionsTaken.length > 0
    ? `Limpeza automática de imagens: ${actionsTaken.join('; ')}. Liberação aproximada: ~${Math.round(freedChars / 1024)} KB.`
    : `Verificação de armazenamento de imagens concluída. Uso atual: ${finalStats.percentageUsed}%.`;

  console.log(`[AutoImageStorage] ${logMessage}`);
  return { freedChars, logMessage };
};

/**
 * Invoca um setItem seguro com fallback de limpeza automática de armazenamento de imagem
 */
export const safeStorageSetItem = (key: string, value: string): boolean => {
  // Proativamente limpa se estiver acima de 75% da capacidade estimada antes do setItem
  const statsBefore = getStorageStats();
  if (statsBefore.isNearLimit && (key.includes('image') || key.includes('card') || key.includes('project') || value.includes('data:image/'))) {
    console.log('[AutoImageStorage] Próximo do limite de armazenamento (~' + statsBefore.percentageUsed + '%). Executando limpeza proativa de imagens...');
    cleanImageStorage(false);
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    // Se for QuotaExceededError ou erro de gravação, faz limpeza agressiva de imagens e tenta de novo
    if (err?.name === 'QuotaExceededError' || err?.code === 22 || err?.code === 1014) {
      console.warn('[AutoImageStorage] QuotaExceededError detectado! Executando limpeza automática agressiva de imagens...');
      cleanImageStorage(true);
      try {
        localStorage.setItem(key, value);
        console.log('[AutoImageStorage] Sucesso ao salvar chave ' + key + ' após limpeza automática de imagens.');
        return true;
      } catch (retryErr) {
        console.error('[AutoImageStorage] Falha persistente ao salvar no localStorage mesmo após limpeza:', retryErr);
        return false;
      }
    }
    console.error('[AutoImageStorage] Erro ao salvar chave ' + key + ':', err);
    return false;
  }
};

/**
 * Função utilitária para verificar e garantir que a memória de imagens não exceda os limites
 */
export const autoCheckAndCleanImageStorage = (): void => {
  const stats = getStorageStats();
  if (stats.isNearLimit) {
    cleanImageStorage(false);
  }
};
