import { useProjectStore } from "../store/useProjectStore";
import { buildMasterPrompt } from "../utils/buildMasterPrompt";

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
    const previousImageBase64ToSend = options?.previousImageBase64 || (options?.isRefinement ? currentActiveImg : (store.additionalPrompt && store.additionalPrompt.trim() !== "" ? currentActiveImg : ""));

    const payload = {
      previousImageBase64: previousImageBase64ToSend,
      base64DoSujeito: store.sujeitoBase64,
      sujeitosBase64List: store.sujeitosBase64List || [],
      base64DoCenario: store.cenarioBase64,
      cenariosBase64List: store.cenariosBase64List || [],
      promptTraduzido: masterPrompt,
      resolutionInput: store.resolucao || "1K",
      formato: store.formatoExportacao || "PNG",
      useEnvRef: store.useEnvRef,
      tipografiaRefBase64: store.tipografiaRefBase64,
      tipografiaRefsList: store.tipografiaRefsList || [],
      designRefBase64: store.designRefBase64,
      designRefsList: store.designRefsList || [],
      referenciasEstilo: store.referenciasEstilo,
      negativePrompt: store.negativePrompt || "",
      customApiKey: customApiKey || localStorage.getItem("custom_gemini_api_key") || "",
      desativarSujeito: desativarSujeitoAtual,
      logoBase64: store.logoBase64,
      logosList: store.logosList || [],
      useLogo: store.useLogo,
      logoInclusionType: store.logoInclusionType || "overlay",
      logoPosOverlay: store.logoPosOverlay || "top_center",
      logoSizeOverlay: store.logoSizeOverlay || 20,
      dimensao: store.dimensao,
      somentePrompt: store.somentePrompt,
      modelId: store.modelId,
      coresAutomaticas: store.coresAutomaticas
    };

    const payloadString = JSON.stringify(payload);
    console.log("[FRONT] Tamanho do Payload enviado (bytes):", payloadString.length);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 360000); // 6 minutos de timeout

    try {
      const response = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadString,
        signal: controller.signal
      });
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
