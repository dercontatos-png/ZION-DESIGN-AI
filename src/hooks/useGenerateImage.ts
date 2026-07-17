import { useProjectStore } from "../store/useProjectStore";
import { buildMasterPrompt } from "../utils/buildMasterPrompt";

export const useGenerateImage = (customApiKey: string, showToast: (msg: string, type: "success" | "error" | "warning") => void) => {
  const store = useProjectStore();

  const generatePremiumImage = async () => {
    // Validação se a imagem do Sujeito foi enviada
    const hasSujeito = (store.sujeitoBase64 && store.sujeitoBase64.trim() !== "") || (store.sujeitosBase64List && store.sujeitosBase64List.length > 0);
    if (!store.desativarSujeito && !hasSujeito) {
      showToast("Por favor, faça o upload de pelo menos uma imagem do Sujeito para prosseguir.", "warning");
      return;
    }

    store.setIsGenerating(true);

    const masterPrompt = buildMasterPrompt(store);
    if (store.setLastGeneratedPrompt) {
      store.setLastGeneratedPrompt(masterPrompt);
    }

    const payload = {
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
      desativarSujeito: store.desativarSujeito,
      logoBase64: store.logoBase64,
      logosList: store.logosList || [],
      useLogo: store.useLogo,
      logoInclusionType: store.logoInclusionType || "overlay",
      logoPosOverlay: store.logoPosOverlay || "top_center",
      logoSizeOverlay: store.logoSizeOverlay || 20,
      dimensao: store.dimensao,
      somentePrompt: store.somentePrompt
    };

    const payloadString = JSON.stringify(payload);
    console.log("[FRONT] Tamanho do Payload enviado (bytes):", payloadString.length);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 segundos de timeout

    try {
      const response = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadString,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // 7. TRATAMENTO DE ERROS VISUAIS
      if (response.status === 400) {
        const data = await response.json();
        showToast(data.error || "Por favor, faça o upload da imagem do Sujeito.", "warning");
        store.setIsGenerating(false);
        return;
      }

      if (response.status === 403) {
        showToast("Erro API (403): Permissão do Vertex rejeitada. Verifique as credenciais IAM do GCP.", "error");
        store.setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.prompt) store.setLastGeneratedPrompt(data.prompt);
        if (data.systemInstruction) store.setLastSystemInstruction(data.systemInstruction);
        throw new Error(data.error || "Erro ao processar a requisição de geração.");
      }

      const data = await response.json();
      if (data.thought) store.setLastGeneratedPrompt(data.thought);
      if (data.prompt) store.setLastGeneratedPrompt(data.prompt);
      if (data.systemInstruction) store.setLastSystemInstruction(data.systemInstruction);
      
      if (store.somentePrompt) {
        showToast("Prompt e Instrução gerados com sucesso!", "success");
        return;
      }

      if (data.image) {
        // Adiciona à lista de imagens geradas
        store.setGaleriaImages((prev) => [data.image, ...prev]);
        store.setActiveImageIndex(0);
        showToast("Imagem premium gerada com sucesso!", "success");
      } else if (data.images && data.images.length > 0) {
        store.setGaleriaImages((prev) => [...data.images, ...prev]);
        store.setActiveImageIndex(0);
        showToast("Imagens premium geradas com sucesso!", "success");
      } else {
        throw new Error("Nenhum dado de imagem retornado pela API.");
      }
    } catch (err: any) {
      console.error("Geração falhou:", err);
      console.error("Detalhes do erro:", err);
      showToast(err.message || "Falha de conexão com a API de geração.", "error");
    } finally {
      store.setIsGenerating(false);
    }
  };

  return {
    generatePremiumImage,
    isGenerating: store.isGenerating
  };
};
