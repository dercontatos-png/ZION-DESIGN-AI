import { useProjectStore } from "../store/useProjectStore";
import { buildMasterPrompt } from "../utils/buildMasterPrompt";
import { optimizeBase64Image, optimizeBase64List } from "../utils/compressBase64";

export const useGenerateImage = (
  customApiKey: string,
  showToast: (msg: string, type: "success" | "error" | "warning") => void,
  onStart?: () => void,
  onSuccess?: () => void,
  onError?: (errMessage: string) => void
) => {
  const store = useProjectStore();

  const generatePremiumImage = async (options?: { isRefinement?: boolean; previousImageBase64?: string }) => {
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
    const rawPreviousImage = options?.previousImageBase64 || (options?.isRefinement ? currentActiveImg : (store.additionalPrompt && store.additionalPrompt.trim() !== "" ? currentActiveImg : ""));

    // Otimiza/comprime imagens base64 cliente-side para prevenir erro HTTP 413 (Payload Too Large)
    const [
      optPreviousImage,
      optSujeito,
      optSujeitosList,
      optCenario,
      optCenariosList,
      optTipografiaRef,
      optTipografiaRefsList,
      optDesignRef,
      optDesignRefsList,
      optReferenciasEstilo,
      optLogo,
      optLogosList
    ] = await Promise.all([
      optimizeBase64Image(rawPreviousImage, 1024, 0.8),
      optimizeBase64Image(store.sujeitoBase64 || "", 1024, 0.8),
      optimizeBase64List(store.sujeitosBase64List || [], 1024, 0.8),
      optimizeBase64Image(store.cenarioBase64 || "", 1024, 0.8),
      optimizeBase64List(store.cenariosBase64List || [], 1024, 0.8),
      optimizeBase64Image(store.tipografiaRefBase64 || "", 1024, 0.8),
      optimizeBase64List(store.tipografiaRefsList || [], 1024, 0.8),
      optimizeBase64Image(store.designRefBase64 || "", 1024, 0.8),
      optimizeBase64List(store.designRefsList || [], 1024, 0.8),
      Promise.all((store.referenciasEstilo || []).map(async (ref) => ({
        ...ref,
        data: await optimizeBase64Image(ref.data || "", 1024, 0.8)
      }))),
      optimizeBase64Image(store.logoBase64 || "", 1024, 0.8),
      optimizeBase64List(store.logosList || [], 1024, 0.8)
    ]);

    const buildPayloadObj = (maxDim = 1024, qual = 0.8) => ({
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
      logoInclusionType: store.logoInclusionType || "embedded",
      logoPosOverlay: store.logoPosOverlay || "top_center",
      logoSizeOverlay: store.logoSizeOverlay || 20,
      dimensao: store.dimensao,
      somentePrompt: store.somentePrompt,
      modelId: store.modelId,
      coresAutomaticas: store.coresAutomaticas,
      seedUsuario: store.seedUsuario
    });

    let payloadObj = buildPayloadObj();
    let payloadString = JSON.stringify(payloadObj);
    console.log("[FRONT] Tamanho do Payload otimizado (bytes):", payloadString.length);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 360000); // 6 minutos de timeout

    try {
      let response = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadString,
        signal: controller.signal
      });

      // Se ocorrer erro 413 (Payload Too Large), aplica compressão ultra-agressiva e tenta novamente
      if (response.status === 413) {
        console.warn("[FRONT] Erro 413 detectado. Re-comprimindo imagens para limite seguro...");
        showToast("Tamanho das imagens excede limite do proxy (413). Re-comprimindo para envio seguro...", "warning");
        
        const ultraSujeito = await optimizeBase64Image(store.sujeitoBase64 || "", 600, 0.65);
        const ultraCenario = await optimizeBase64Image(store.cenarioBase64 || "", 600, 0.65);
        const ultraLogo = await optimizeBase64Image(store.logoBase64 || "", 600, 0.65);
        const ultraPrev = await optimizeBase64Image(rawPreviousImage, 600, 0.65);

        payloadObj = {
          ...payloadObj,
          previousImageBase64: ultraPrev,
          base64DoSujeito: ultraSujeito,
          sujeitosBase64List: await optimizeBase64List(store.sujeitosBase64List || [], 600, 0.65),
          base64DoCenario: ultraCenario,
          cenariosBase64List: await optimizeBase64List(store.cenariosBase64List || [], 600, 0.65),
          logoBase64: ultraLogo,
          logosList: await optimizeBase64List(store.logosList || [], 600, 0.65)
        };
        
        payloadString = JSON.stringify(payloadObj);
        console.log("[FRONT] Tamanho do Payload com compressão extrema (bytes):", payloadString.length);

        response = await fetch("/api/gerar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payloadString,
          signal: controller.signal
        });
      }

      clearTimeout(timeoutId);

      // TRATAMENTO DE ERROS VISUAIS
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

      if (response.status === 413) {
        const errMsg = "Erro de Envio (413 Payload Too Large): As imagens anexadas ultrapassam o limite do servidor. Por favor, reduza o número de imagens de referência.";
        showToast(errMsg, "error");
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

      const newImages: string[] = [];
      if (data.image) {
        newImages.push(data.image);
      } else if (data.images && data.images.length > 0) {
        newImages.push(...data.images);
      }

      if (newImages.length > 0) {
        const isActive = store.addImagesToProjectGallery(targetProjectId, newImages);
        if (isActive) {
          showToast("Imagem premium gerada com sucesso!", "success");
        } else {
          showToast(`Imagem do '${targetProjectName}' foi gerada no plano de fundo!`, "success");
        }
        onSuccess?.();
      } else {
        throw new Error("Nenhum dado de imagem retornado pela API.");
      }
    } catch (err: any) {
      console.error(`Geração falhou para o projeto ${targetProjectName}:`, err);
      const errMsg = err.message || "Falha de conexão com a API de geração.";
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
