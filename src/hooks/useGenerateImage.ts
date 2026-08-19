import { useProjectStore } from "../store/useProjectStore";
import { buildMasterPrompt } from "../utils/buildMasterPrompt";
import { optimizeBase64Image, optimizeBase64List } from "../utils/compressBase64";
import { recordImageGeneration } from "../utils/apiUsageManager";
import { checkAdminOrOpenPlan, getAuthHeaders, openPlanModal } from "../utils/userAuth";

export const useGenerateImage = (
  customApiKey: string,
  showToast: (msg: string, type: "success" | "error" | "warning") => void,
  onStart?: () => void,
  onSuccess?: () => void,
  onError?: (errMessage: string) => void
) => {
  const store = useProjectStore();

  const generatePremiumImage = async (options?: { isRefinement?: boolean; previousImageBase64?: string }) => {
    if (!checkAdminOrOpenPlan(customApiKey)) {
      showToast("🔒 Apenas o Administrador pode utilizar a geração de imagens. Assine um plano para liberar o acesso!", "error");
      return;
    }

    const targetProjectId = store.activeProjectId;
    if (!targetProjectId) {
      showToast("Nenhum projeto ativo selecionado.", "warning");
      return;
    }

    const targetProjectName = store.projectsList.find((p) => p.id === targetProjectId)?.name || "Projeto";

    // Validação se a imagem do Sujeito foi enviada
    let desativarSujeitoAtual = store.desativarSujeito;
    const hasSujeito = (store.sujeitoBase64 && store.sujeitoBase64.trim() !== "") || (store.sujeitosBase64List && store.sujeitosBase64List.length > 0);
    if (!desativarSujeitoAtual && !hasSujeito) {
      showToast("Nenhuma imagem de Sujeito detectada. Ativando modo 'Sem Sujeito' e gerando composição de Background...", "warning");
      store.updateConfig({ desativarSujeito: true });
      desativarSujeitoAtual = true;
    }

    store.setIsProjectGenerating(targetProjectId, true);
    onStart?.();
    
    // Build master prompt using the updated state
    const storeWithUpdatedSubject = {
      ...store,
      desativarSujeito: desativarSujeitoAtual
    };
    const masterPrompt = buildMasterPrompt(storeWithUpdatedSubject);
    console.log(`[DEBUG] Generation started for project ${targetProjectId} (${targetProjectName}). Prompt:`, masterPrompt);
    
    if (store.setLastGeneratedPrompt && store.activeProjectId === targetProjectId) {
      store.setLastGeneratedPrompt(masterPrompt);
    }

const currentActiveImg = store.galeriaImages?.[store.activeImageIndex] || "";
    const rawPreviousImage = options?.previousImageBase64 || (options?.isRefinement ? currentActiveImg : "");

    const is4K = (store.resolucao || "1K") === "4K";

    // Limite seguro do corpo da requisição (permite envio de imagens em alta definição sem bloqueio indevido no cliente)
    const MAX_PAYLOAD_BYTES = 35_000_000;

    const buildPayloadObj = async (maxDim: number, quality: number, essentialOnly: boolean) => {
      const [optPreviousImage, optSujeito, optSujeitosList, optCenario, optCenariosList, optTipografiaRef, optTipografiaRefsList, optDesignRef, optDesignRefsList, optLogo, optLogosList] = await Promise.all([
        optimizeBase64Image(rawPreviousImage, maxDim, quality - 0.03),
        optimizeBase64Image(store.sujeitoBase64 || "", maxDim, quality),
        optimizeBase64List(store.sujeitosBase64List || [], maxDim, quality),
        optimizeBase64Image(store.cenarioBase64 || "", maxDim, quality),
        optimizeBase64List(store.cenariosBase64List || [], maxDim, quality),
        optimizeBase64Image(store.tipografiaRefBase64 || "", maxDim, quality),
        optimizeBase64List(store.tipografiaRefsList || [], maxDim, quality),
        optimizeBase64Image(store.designRefBase64 || "", maxDim, quality),
        optimizeBase64List(store.designRefsList || [], maxDim, quality),
        optimizeBase64Image(store.logoBase64 || "", maxDim, 0.9, true),
        optimizeBase64List(store.logosList || [], maxDim, 0.9, true)
      ]);
      const optReferenciasEstilo = essentialOnly
        ? []
        : await Promise.all((store.referenciasEstilo || []).map(async (ref) => ({
            ...ref,
            data: await optimizeBase64Image(ref.data || "", maxDim, quality)
          })));

        return {
          previousImageBase64: optPreviousImage,
      base64DoSujeito: optSujeito,
      sujeitosBase64List: optSujeitosList,
      base64DoCenario: optCenario,
      cenariosBase64List: optCenariosList,
      promptTraduzido: masterPrompt,
      resolutionInput: store.resolucao || "1K",
      formato: store.formatoExportacao || "PNG",
      useEnvRef: store.useEnvRef,
      tipografiaRefBase64: optTipografiaRef,
      tipografiaRefsList: optTipografiaRefsList,
      designRefBase64: optDesignRef,
      designRefsList: optDesignRefsList,
      referenciasEstilo: optReferenciasEstilo,
      negativePrompt: store.negativePrompt || "",
      customApiKey: customApiKey || localStorage.getItem("custom_gemini_api_key") || "",
      desativarSujeito: desativarSujeitoAtual,
      logoBase64: optLogo,
      logosList: optLogosList,
      useLogo: store.useLogo,
      logoInclusionType: store.logoInclusionType || "overlay",
      logoPosOverlay: store.logoPosOverlay || "top_center",
      logoSizeOverlay: store.logoSizeOverlay || 20,
      dimensao: store.dimensao,
      somentePrompt: store.somentePrompt,
      modelId: store.modelId,
      coresAutomaticas: store.coresAutomaticas,
      seedUsuario: store.seedUsuario
    };
    };

    // Níveis progressivos de compressão: tenta alta qualidade, mas reduz automaticamente
    // até o payload caber no limite do servidor (evita 413 Payload Too Large)
    const compressionLevels: Array<[number, number]> = [
      [768, 0.75],
      [640, 0.68],
      [512, 0.60],
      [448, 0.52],
      [384, 0.45]
    ];

    const sendAttempt = async (payloadObj: any, isLastChance: boolean = false) => {
      const payloadString = JSON.stringify(payloadObj);
      console.log("[FRONT] Tamanho do Payload (bytes):", payloadString.length, "| Limite seguro:", MAX_PAYLOAD_BYTES);
      if (payloadString.length > MAX_PAYLOAD_BYTES && !isLastChance) {
        console.warn("[FRONT] Payload excede o limite seguro. Avançando para o próximo nível de compressão...");
        return null;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 300s (5 min) timeout estendido para alta qualidade 4K
      try {
        const response = await fetch("/api/gerar", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders(customApiKey) },
          body: payloadString,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return { response };
      } catch (firstErr: any) {
        clearTimeout(timeoutId);
        console.warn("[FRONT] Envio abortado ou falhou na rede. Tentando próximo nível de compressão...", firstErr?.message || firstErr);
        return null;
      }
    };

    let response: Response | null = null;

    if (is4K) {
      showToast("⏳ Gerando imagem em 4K Ultra HD...", "warning");
    }

    for (let i = 0; i < compressionLevels.length; i++) {
      const [maxDim, quality] = compressionLevels[i];
      const isLast = i === compressionLevels.length - 1;
      console.log(`[FRONT] Compressão nível ${maxDim}px / q${quality}...`);
      const payloadObj = await buildPayloadObj(maxDim, quality, false);
      const attempt = await sendAttempt(payloadObj, isLast);
      if (!attempt) continue;
      response = attempt.response;
      if (response.status !== 413) break;
      console.warn(`[FRONT] Erro 413 no nível ${maxDim}px. Esgotando retentativa do nível anterior e re-comprimindo...`);
    }

    // Último recurso: apenas referências essenciais (sem estilos) na compressão máxima
    if (!response || response.status === 413) {
      console.warn("[FRONT] 413 persistente ou envio pendente. Tentando último recurso com apenas referências essenciais...");
      const essentialPayload = await buildPayloadObj(400, 0.45, true);
      const attempt = await sendAttempt(essentialPayload, true);
      if (attempt) response = attempt.response;
    }

    // Se mesmo assim estourou o limite, informa o usuário de forma clara
    if (response && response.status === 413) {
      const errMsg = "Erro de Envio (413 Payload Too Large): As imagens anexadas ainda ultrapassam o limite do servidor. Por favor, reduza a quantidade de imagens de referência (principalmente as fotos de pessoas do layout).";
      showToast(errMsg, "error");
      onError?.(errMsg);
      store.setIsProjectGenerating(targetProjectId, false);
      return;
    }

    if (!response) {
      const errMsg = "⏱️ Conexão ou tempo limite de envio excedido. Clique em Gerar Novamente para reconectar automaticamente.";
      showToast(errMsg, "error");
      onError?.(errMsg);
      store.setIsProjectGenerating(targetProjectId, false);
      return;
    }

    try {
      if (response.status === 400) {
        const data = await response.json();
        const errMsg = data.error || "Por favor, faça o upload da imagem do Sujeito.";
        showToast(errMsg, "warning");
        onError?.(errMsg);
        return;
      }

      if (response.status === 403) {
        const errMsg = "Erro API (403): Permissão do Vertex rejeitada. Verifique as credenciais IAM do GCP.";
        showToast(errMsg, "error");
        onError?.(errMsg);
        return;
      }

      if (response.status === 504 || response.status === 524) {
        const errMsg = "⏱️ Timeout (504): O servidor demorou muito para responder. Tente novamente em alguns instantes ou use a resolução 1K/2K.";
        showToast(errMsg, "error");
        onError?.(errMsg);
        return;
      }

      if (response.status === 429) {
        const errMsg = "⚠️ Limite de Cota por Minuto Atingido (Erro 429). A API do Google limita gerações rápidas. Por favor, aguarde de 30 a 60 segundos antes de gerar a próxima imagem!";
        showToast(errMsg, "warning");
        onError?.(errMsg);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.prompt && store.activeProjectId === targetProjectId) store.setLastGeneratedPrompt(data.prompt);
        if (data.systemInstruction && store.activeProjectId === targetProjectId) store.setLastSystemInstruction(data.systemInstruction);
        throw new Error(data.error || `Erro de rede ou proxy. Status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.thought && store.activeProjectId === targetProjectId) store.setLastGeneratedPrompt(data.thought);
      if (data.prompt && store.activeProjectId === targetProjectId) store.setLastGeneratedPrompt(data.prompt);
      if (data.systemInstruction && store.activeProjectId === targetProjectId) store.setLastSystemInstruction(data.systemInstruction);
      
      if (store.somentePrompt) {
        showToast("Prompt e Instrução gerados com sucesso!", "success");
        onSuccess?.();
        return;
      }

      const imageUrl = data.image || data.imageUrl;
      const newImages: string[] = [];
      if (imageUrl) {
        newImages.push(imageUrl);
      } else if (data.images && data.images.length > 0) {
        newImages.push(...data.images);
      }

      if (newImages.length > 0) {
        recordImageGeneration(newImages.length);
        const isActive = store.addImagesToProjectGallery(targetProjectId, newImages);
        const clusterInfo = data.modelUsed ? ` (${data.modelUsed.replace(/Service Account Vertex AI\s*/i, "").replace(/\(gerador[^\)]+\)/i, "").trim()})` : "";
        if (isActive) {
          showToast(`Imagem ${is4K ? "4K Ultra HD" : "premium"} gerada com sucesso${clusterInfo}! ✅`, "success");
        } else {
          showToast(`Imagem do '${targetProjectName}' foi gerada no plano de fundo${clusterInfo}!`, "success");
        }
        onSuccess?.();
      } else {
        throw new Error("Nenhum dado de imagem retornado pela API.");
      }
    } catch (err: any) {
      console.error(`Geração falhou para o projeto ${targetProjectName}:`, err);
      let errMsg = err.message || "Falha de conexão com a API de geração.";
      if (err.name === "AbortError" || String(errMsg).toLowerCase().includes("aborted") || String(errMsg).toLowerCase().includes("signal")) {
        errMsg = "⏱️ Conexão ou tempo limite de geração excedido. Clique em Gerar Novamente para reconectar automaticamente.";
      }
      showToast(errMsg, "error");
      onError?.(errMsg);
    } finally {
      store.setIsProjectGenerating(targetProjectId, false);
      console.log(`[DEBUG] Generation finished for project ${targetProjectId}`);
    }
  };

  return {
    generatePremiumImage,
    isGenerating: store.isGenerating
  };
};

