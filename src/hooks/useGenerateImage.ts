import { useProjectStore } from "../store/useProjectStore";
import { buildMasterPrompt } from "../utils/buildMasterPrompt";
import { recordImageGeneration } from "../utils/apiUsageManager";
import { checkAdminOrOpenPlan, getAuthHeaders, openPlanModal } from "../utils/userAuth";

/**
 * Converte uma string base64 (com ou sem prefixo data:) em um File/Blob nativo
 * para envio em FormData sem perda de qualidade (evita re-compressão).
 */
const imageSourceToFile = async (source: string, filename: string): Promise<File | null> => {
  if (!source || typeof source !== "string" || !source.trim()) return null;
  const cleanSource = source.trim();
  try {
    // 1. Data URL (base64)
    if (cleanSource.startsWith("data:")) {
      const res = await fetch(cleanSource);
      const blob = await res.blob();
      const mime = blob.type || "image/png";
      const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
      return new File([blob], `${filename}.${ext}`, { type: mime });
    }

    // 2. Relative or Absolute URL (/uploads/..., http..., /Design Builder...)
    const fullUrl = cleanSource.startsWith("http://") || cleanSource.startsWith("https://")
      ? cleanSource
      : `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}${cleanSource.startsWith("/") ? "" : "/"}${cleanSource}`;

    const res = await fetch(fullUrl);
    if (!res.ok) {
      console.warn(`[imageSourceToFile] Falha ao carregar imagem em ${fullUrl}: status ${res.status}`);
      return null;
    }
    const blob = await res.blob();
    const mime = blob.type && blob.type !== "application/octet-stream"
      ? blob.type
      : cleanSource.toLowerCase().endsWith(".png") ? "image/png"
      : cleanSource.toLowerCase().endsWith(".webp") ? "image/webp"
      : cleanSource.toLowerCase().endsWith(".avif") ? "image/avif"
      : "image/jpeg";
    const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("avif") ? "avif" : "jpg";
    return new File([blob], `${filename}.${ext}`, { type: mime });
  } catch (err) {
    console.error(`[imageSourceToFile] Erro ao converter imagem ${filename}: `, err);
    return null;
  }
};

export const useGenerateImage = (
  customApiKey: string,
  showToast: (msg: string, type: "success" | "error" | "warning") => void,
  onStart?: () => void,
  onSuccess?: (newImage?: string, previousImage?: string) => void,
  onError?: (errMessage: string) => void
) => {
  const store = useProjectStore();

  const generatePremiumImage = async (options?: { isRefinement?: boolean; previousImageBase64?: string }) => {
    if (!checkAdminOrOpenPlan(customApiKey)) {
      showToast("🔒 Apenas o Administrador pode utilizar a geração de imagens. Assine um plano para liberar o acesso!", "error");
      return;
    }

    let targetProjectId = store.activeProjectId;
    if (!targetProjectId) {
      if (store.projectsList && store.projectsList.length > 0) {
        targetProjectId = store.projectsList[0].id;
        store.loadProjectById(targetProjectId);
      } else {
        store.createProject();
        targetProjectId = useProjectStore.getState().activeProjectId;
      }
    }

    if (!targetProjectId) {
      showToast("Criando projeto inicial para salvar sua arte...", "warning");
      store.createProject();
      targetProjectId = useProjectStore.getState().activeProjectId;
      if (!targetProjectId) {
        showToast("Nenhum projeto ativo selecionado.", "warning");
        return;
      }
    }

    const targetProjectName = store.projectsList.find((p) => p.id === targetProjectId)?.name || "Projeto";

    // Validação se a imagem do Sujeito foi enviada
    let desativarSujeitoAtual = store.desativarSujeito;
    const hasSujeito = (store.sujeitoBase64 && store.sujeitoBase64.trim() !== "") || (store.sujeitosBase64List && store.sujeitosBase64List.length > 0);
    if (!desativarSujeitoAtual && !hasSujeito) {
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

    const selectedQuality = store.qualidade || store.resolucao || "1K";
    const is4K = selectedQuality === "4K";
    const is2K = selectedQuality === "2K";

    if (is4K) {
      showToast("⏳ Gerando imagem em 4K Ultra HD...", "warning");
    } else if (is2K) {
      showToast("⏳ Gerando imagem em 2K Alta Definição...", "warning");
    } else {
      showToast("⏳ Gerando imagem em 1K Rápido...", "warning");
    }

    try {
      // ══════════════════════════════════════════════════════════════
      // PIPELINE OFICIAL DESIGN BUILDER 1.2: FormData + SSE/Polling
      // ══════════════════════════════════════════════════════════════

      // 1. Construir o FormData com os 21 campos oficiais
      const formData = new FormData();
      const activeSlug = (store as any).activeAgentSlug || (store as any).activeAgent || (store as any).selectedAgent || "orion-pro";
      formData.append("agent_slug", activeSlug);

      // Campo 1: fotos_do_sujeito_produto (File) - Coleta TODAS as fotos enviadas
      const allSubjectPhotos: string[] = [];
      if (store.sujeitoBase64 && store.sujeitoBase64.trim()) {
        allSubjectPhotos.push(store.sujeitoBase64);
      }
      if (Array.isArray(store.sujeitosBase64List)) {
        for (const s of store.sujeitosBase64List) {
          const sStr = typeof s === "string" ? s : ((s as any)?.url || (s as any)?.data || "");
          if (sStr && !allSubjectPhotos.includes(sStr)) {
            allSubjectPhotos.push(sStr);
          }
        }
      }
      for (let i = 0; i < allSubjectPhotos.length; i++) {
        const file = await imageSourceToFile(allSubjectPhotos[i], `sujeito_${i}`);
        if (file) {
          formData.append("fotos_do_sujeito_produto", file);
          console.log(`[FRONT] Anexado fotos_do_sujeito_produto #${i + 1}: ${file.name} (${file.size} bytes)`);
        }
      }

      // Brand Identity / Logotipos da Marca (Órion Pro e Design Builder)
      const allLogos: string[] = [];
      if (store.logoBase64 && store.logoBase64.trim()) {
        allLogos.push(store.logoBase64.trim());
      }
      if (Array.isArray(store.logosList)) {
        for (const l of store.logosList) {
          const lStr = typeof l === "string" ? l.trim() : (((l as any)?.url || (l as any)?.data || "") as string).trim();
          if (lStr && !allLogos.includes(lStr)) {
            // Se já temos logoBase64 e a lista só tem 1 item, trata-se do mesmo logo
            if (allLogos.length > 0 && store.logosList.length === 1) {
              continue;
            }
            allLogos.push(lStr);
          }
        }
      }
      // DEDUPLICAÇÃO INTELIGENTE DE LOGO:
      // Para campanhas padrão, apenas 1 logotipo principal deve ser enviado para evitar que a IA desenhe logos gêmeos/duplos.
      const finalLogos = allLogos.slice(0, 1);
      for (let i = 0; i < finalLogos.length; i++) {
        const file = await imageSourceToFile(finalLogos[i], `brand_logo_${i}`);
        if (file) {
          formData.append("brand_identity_images", file);
          console.log(`[FRONT] Anexado brand_identity_images #${i + 1}: ${file.name} (${file.size} bytes)`);
        }
      }
      if (finalLogos.length > 0) {
        formData.append("brand_identity_images_descriptions", JSON.stringify(finalLogos.map(() => "Logotipo oficial da marca")));
      }

      // Campo 2: quantidade
      formData.append("quantidade", String(store.quantidade || 1));

      // Campo 3: genero ("female" | "male")
      const rawGender = (store.gender || "Masculino").toLowerCase();
      const mappedGender = rawGender.includes("fem") || rawGender === "female" ? "female" : "male";
      formData.append("genero", mappedGender);

      // Campo 4: subject_description
      formData.append("subject_description", store.poseDescription || store.composicaoCustom || "");

      // Determinação antecipada do alinhamento do texto para balanceamento espacial do sujeito
      const rawTextPos = (store.typographyPosition || "").toLowerCase();
      const hasLeftBlock = (store.camadasTexto || []).some((c: any) => /left|esq/i.test(c.posicao || ""));
      const hasRightBlock = (store.camadasTexto || []).some((c: any) => /right|dir/i.test(c.posicao || ""));
      const isLeft = rawTextPos.includes("esq") || rawTextPos.includes("left") || hasLeftBlock;
      const isRight = rawTextPos.includes("dir") || rawTextPos.includes("right") || hasRightBlock;
      const mappedTextPos = isLeft ? "align-left" : isRight ? "align-right" : "align-center";
      const defaultBlockPos = isLeft ? "left" : isRight ? "right" : "center";

      // Campo 5: subject_position ("left" | "right" | "center")
      const rawPos = (store.positioning || "Centro").toLowerCase();
      let mappedPos = rawPos.includes("esq") || rawPos === "left" ? "left" : rawPos.includes("dir") || rawPos === "right" ? "right" : "center";
      if (isLeft) {
        // Regra de ouro da composição: se o texto é à esquerda, o sujeito DEVE ficar à direita para não haver colisão nem deslocamento
        mappedPos = "right";
      } else if (isRight) {
        mappedPos = "left";
      }
      formData.append("subject_position", mappedPos);

      // Campo 6: dimensions ("1:1", "4:5", "9:16", "16:9")
      formData.append("dimensions", store.dimensao || "1:1");

      // Campo 7: quality ("1K", "2K", "4K")
      formData.append("quality", selectedQuality);

      // Campo 8: nicho_projeto
      formData.append("nicho_projeto", store.nicho || store.additionalPrompt?.split(".")[0] || "");

      // Campo 9: scene_description
      formData.append("scene_description", store.promptCenario || store.cenarioPredefinido || store.cenario || "");

      // Campo 10: referencias_de_ambiente (File) - Coleta TODAS as referências de ambiente
      const allEnvPhotos: string[] = [];
      if (store.cenarioBase64 && store.cenarioBase64.trim()) {
        allEnvPhotos.push(store.cenarioBase64);
      }
      if (Array.isArray(store.cenariosBase64List)) {
        for (const c of store.cenariosBase64List) {
          const cStr = typeof c === "string" ? c : ((c as any)?.url || (c as any)?.data || "");
          if (cStr && !allEnvPhotos.includes(cStr)) {
            allEnvPhotos.push(cStr);
          }
        }
      }
      for (let i = 0; i < allEnvPhotos.length; i++) {
        const file = await imageSourceToFile(allEnvPhotos[i], `ambiente_${i}`);
        if (file) {
          formData.append("referencias_de_ambiente", file);
          console.log(`[FRONT] Anexado referencias_de_ambiente #${i + 1}: ${file.name} (${file.size} bytes)`);
        }
      }
      if (allEnvPhotos.length > 0) {
        formData.append("referencias_de_ambiente_descriptions", JSON.stringify(allEnvPhotos.map(() => "estilo de formato")));
      }

      // Referência de Layout/Design (se presente no RefBuilder)
      if (store.designRefBase64) {
        const designFile = await imageSourceToFile(store.designRefBase64, "design_ref");
        if (designFile) {
          formData.append("design_reference", designFile);
        }
      }

      // Campo 11: text_blocks (JSON array com { type, weight, content } exato do HAR)
      const textBlocks = (store.camadasTexto || [])
        .filter((c: any) => c.conteudo && c.conteudo.trim())
        .map((c: any) => {
          let type = "text";
          const fn = (c.funcao || "").toLowerCase();
          const tb = (c.tipoBloco || "").toLowerCase();
          if (tb === "h1" || fn.includes("headline") || fn.includes("h1")) type = "h1";
          else if (tb === "h2" || fn.includes("subheadline") || fn.includes("h2")) type = "h2";
          else if (tb === "cta" || fn.includes("cta")) type = "cta";
          else if (tb === "bullets" || fn.includes("bullet")) type = "bullets";
          else type = "text";

          let rawPos = (c.posicao || (c as any).position || "").trim();
          let pos = "middle-center";
          if (rawPos === "Esquerda" || rawPos === "left") pos = "middle-left";
          else if (rawPos === "Direita" || rawPos === "right") pos = "middle-right";
          else if (rawPos === "Centro" || rawPos === "center") pos = "middle-center";
          else if (rawPos) pos = rawPos;

          return {
            type,
            weight: c.pesoVisual || (type === "h1" ? 5 : type === "h2" ? 3 : type === "cta" ? 4 : 2),
            content: c.conteudo.trim(),
            color: c.cor || "#FFFFFF",
            position: pos
          };
        });
      formData.append("text_blocks", JSON.stringify(textBlocks));

      // Campo 12: degrade ("false" | "true")
      formData.append("degrade", String(store.degradeLeitura || false));

      // Campo 13: posicao_do_texto ("align-left" | "align-right" | "align-center")
      formData.append("posicao_do_texto", mappedTextPos);

      // Campo 14: color_palette (JSON)
      const colorPalette = {
        ambient_color: store.cores?.ambiente || "#1A1A2E",
        complementary_color: store.cores?.complementar || "#E2E2E2",
        complementary_light: store.cores?.recorte || "#FFD500"
      };
      formData.append("color_palette", JSON.stringify(colorPalette));

      // Campo 15: plano ("close-up" | "medium" | "american")
      const rawPlano = (store.composicao || "medium").toLowerCase();
      const mappedPlano = rawPlano.includes("close") ? "close-up" : rawPlano.includes("american") ? "american" : "medium";
      formData.append("plano", mappedPlano);

      // Campo 16: elementos_flutuantes
      const shouldIncludeFloating = !!store.elementosFlutuantes && store.floatingElementsMode !== "none" && store.floatingElementsMode !== "off";
      const floatingVal = shouldIncludeFloating ? (store.floatingElementsCustom || store.elementosFlutuantesTexto || "").trim() : "";
      formData.append("elementos_flutuantes", floatingVal);

      // Campo 17: estilo_visual ("ultra_realistic" | "3d_render" | "cinematic" | etc.)
      const rawEstilo = (store.estiloVisual || (store.estilosVisuais || ["Ultra Realista"])[0] || "ultra_realistic").toLowerCase();
      const mappedEstilo = rawEstilo.includes("realis") ? "ultra_realistic" : rawEstilo.includes("3d") ? "3d_render" : rawEstilo.includes("cinema") ? "cinematic" : rawEstilo.replace(/\s+/g, "_");
      formData.append("estilo_visual", mappedEstilo);

      // Campo 18: referencias_de_estilo (File) - Coleta TODAS as referências de estilo
      if (Array.isArray(store.referenciasEstilo) && store.referenciasEstilo.length > 0) {
        const descList: string[] = [];
        for (let i = 0; i < store.referenciasEstilo.length; i++) {
          const styleRef = store.referenciasEstilo[i];
          const styleData = styleRef?.data || styleRef?.url || (typeof styleRef === "string" ? styleRef : "");
          if (styleData) {
            const styleFile = await imageSourceToFile(styleData, `estilo_${i}`);
            if (styleFile) {
              formData.append("referencias_de_estilo", styleFile);
              descList.push(styleRef.descricao || "estilo");
              console.log(`[FRONT] Anexado referencias_de_estilo #${i + 1}: ${styleFile.name} (${styleFile.size} bytes)`);
            }
          }
        }
        if (descList.length > 0) {
          formData.append("referencias_de_estilo_descriptions", JSON.stringify(descList));
        }
      }

      // Campo 19: sobriedade_criatividade
      formData.append("sobriedade_criatividade", String(store.nivelCriativo ?? 50));

      // Campo 20: usar_desfoque_blur
      formData.append("usar_desfoque_blur", String(store.enableBlur || false));

      // Campo 21: prompt_adicional
      formData.append("prompt_adicional", store.additionalPrompt || "");

      // Master prompt completo compilado (Directives de Flyer BR, Composição e Iluminação)
      if (masterPrompt) {
        formData.append("master_prompt", masterPrompt);
      }

      // Custom API key
      if (customApiKey) {
        formData.append("customApiKey", customApiKey);
      }

      console.log("[FRONT] Pipeline Design Builder 1.2: Enviando FormData para /api/bff/api/generate...");

      // 2. Enviar POST /api/bff/api/generate com FormData
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min timeout

      let response: Response;
      try {
        response = await fetch("/api/bff/api/generate", {
          method: "POST",
          headers: { ...getAuthHeaders(customApiKey) },
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        // Fallback to legacy /api/gerar endpoint
        console.warn("[FRONT] /api/bff/api/generate failed, falling back to /api/gerar...", fetchErr?.message);
        await fallbackLegacyGeneration(masterPrompt, rawPreviousImage, targetProjectId, targetProjectName, is4K);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const createData = await response.json();
      const generationId = createData.generation_id;
      const taskId = createData.task_id;

      if (!generationId) {
        throw new Error("Nenhum generation_id retornado pela API.");
      }

      console.log(`[FRONT] Generation criada: id=${generationId}, task=${taskId}, status=${createData.status}`);
      store.setLastGeneratedId(generationId);

      // 3. Conectar no SSE stream para acompanhar progresso em tempo real
      const resultUrl = await new Promise<string>((resolve, reject) => {
        let resolved = false;
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        const sseController = new AbortController();

        // Timeout de segurança (5 min)
        const safetyTimeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            sseController.abort();
            if (pollTimer) clearInterval(pollTimer);
            reject(new Error("⏱️ Tempo limite de geração excedido (5 min). Tente novamente."));
          }
        }, 300000);

        const cleanup = () => {
          clearTimeout(safetyTimeout);
          if (pollTimer) clearInterval(pollTimer);
          sseController.abort();
        };

        // SSE stream
        fetch(`/api/bff/api/generations/${generationId}/stream`, {
          headers: { Accept: "text/event-stream" },
          signal: sseController.signal
        }).then(async (sseRes) => {
          if (!sseRes.ok || !sseRes.body) {
            // SSE failed, fall back to polling
            console.warn("[FRONT] SSE stream failed, falling back to polling...");
            startPolling();
            return;
          }

          const reader = sseRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done || resolved) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                try {
                  const payload = JSON.parse(line.slice(6));
                  console.log(`[FRONT] SSE: status=${payload.status}, progress=${payload.progress}`);

                  if (payload.status === "done" && payload.result_url) {
                    if (!resolved) {
                      resolved = true;
                      cleanup();
                      resolve(payload.result_url);
                    }
                    return;
                  }

                  if (payload.status === "error") {
                    if (!resolved) {
                      resolved = true;
                      cleanup();
                      reject(new Error(payload.error_message || payload.message || "Falha na geração."));
                    }
                    return;
                  }
                } catch { /* ignore parse errors */ }
              }
            }
          } catch (readErr: any) {
            if (!resolved && readErr?.name !== "AbortError") {
              console.warn("[FRONT] SSE read error, falling back to polling:", readErr?.message);
              startPolling();
            }
          }
        }).catch((sseErr) => {
          if (!resolved && sseErr?.name !== "AbortError") {
            console.warn("[FRONT] SSE connection failed, falling back to polling:", sseErr?.message);
            startPolling();
          }
        });

        // Polling fallback
        function startPolling() {
          if (pollTimer || resolved) return;
          console.log("[FRONT] Starting status polling...");
          pollTimer = setInterval(async () => {
            if (resolved) {
              if (pollTimer) clearInterval(pollTimer);
              return;
            }
            try {
              const statusRes = await fetch(`/api/bff/api/generations/${generationId}/status`);
              if (!statusRes.ok) return;
              const statusData = await statusRes.json();
              console.log(`[FRONT] Poll: status=${statusData.status}, progress=${statusData.progress}`);

              if (statusData.status === "done" && statusData.result_url) {
                if (!resolved) {
                  resolved = true;
                  cleanup();
                  resolve(statusData.result_url);
                }
              } else if (statusData.status === "error") {
                if (!resolved) {
                  resolved = true;
                  cleanup();
                  reject(new Error(statusData.error_message || statusData.message || "Falha na geração."));
                }
              }
            } catch { /* ignore poll errors */ }
          }, 3000);
        }
      });

      // 4. Imagem recebida! Carregar no projeto
      console.log(`[FRONT] ✅ Imagem recebida: ${resultUrl}`);
      recordImageGeneration(1);
      const isActive = store.addImagesToProjectGallery(targetProjectId, [resultUrl]);
      store.addGaleriaImage(resultUrl, { app: "design-builder" });
      if (isActive) {
        showToast(`Imagem ${is4K ? "4K Ultra HD" : "premium"} gerada com sucesso! ✅`, "success");
      } else {
        showToast(`Imagem do '${targetProjectName}' foi gerada no plano de fundo!`, "success");
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: resultUrl, projectId: targetProjectId } }));
      }
      onSuccess?.(resultUrl, rawPreviousImage);

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

  /**
   * Fallback: usa o pipeline legado /api/gerar com JSON + base64
   * Ativado apenas quando /api/bff/api/generate está indisponível.
   */
  const fallbackLegacyGeneration = async (
    masterPrompt: string,
    rawPreviousImage: string,
    targetProjectId: string,
    targetProjectName: string,
    is4K: boolean
  ) => {
    try {
      console.log("[FRONT] Fallback: Enviando para /api/gerar (legado)...");
      const { optimizeBase64Image, optimizeBase64List } = await import("../utils/compressBase64");

      const maxDim = is4K ? 2048 : 1536;
      const quality = is4K ? 0.9 : 0.88;

      // Coletar todas as imagens de sujeito e cenário para o payload
      const allSubjectPhotos: string[] = [];
      if (store.sujeitoBase64 && store.sujeitoBase64.trim()) {
        allSubjectPhotos.push(store.sujeitoBase64);
      }
      if (Array.isArray(store.sujeitosBase64List)) {
        for (const s of store.sujeitosBase64List) {
          const sStr = typeof s === "string" ? s : ((s as any)?.url || (s as any)?.data || "");
          if (sStr && !allSubjectPhotos.includes(sStr)) {
            allSubjectPhotos.push(sStr);
          }
        }
      }

      const allEnvPhotos: string[] = [];
      if (store.cenarioBase64 && store.cenarioBase64.trim()) {
        allEnvPhotos.push(store.cenarioBase64);
      }
      if (Array.isArray(store.cenariosBase64List)) {
        for (const c of store.cenariosBase64List) {
          const cStr = typeof c === "string" ? c : ((c as any)?.url || (c as any)?.data || "");
          if (cStr && !allEnvPhotos.includes(cStr)) {
            allEnvPhotos.push(cStr);
          }
        }
      }

      const allLogos: string[] = [];
      if (store.logoBase64 && store.logoBase64.trim()) {
        allLogos.push(store.logoBase64.trim());
      }
      if (Array.isArray(store.logosList)) {
        for (const l of store.logosList) {
          const lStr = typeof l === "string" ? l.trim() : (((l as any)?.url || (l as any)?.data || "") as string).trim();
          if (lStr && !allLogos.includes(lStr)) {
            if (allLogos.length > 0 && store.logosList.length === 1) {
              continue;
            }
            allLogos.push(lStr);
          }
        }
      }
      const finalLogos = allLogos.slice(0, 1);

      const [optSujeito, optCenario, optSujeitosList, optCenariosList] = await Promise.all([
        optimizeBase64Image(store.sujeitoBase64 || allSubjectPhotos[0] || "", maxDim, quality),
        optimizeBase64Image(store.cenarioBase64 || allEnvPhotos[0] || "", maxDim, quality),
        optimizeBase64List(allSubjectPhotos, maxDim, quality),
        optimizeBase64List(allEnvPhotos, maxDim, quality)
      ]);

      const payload = {
        base64DoSujeito: optSujeito || optSujeitosList[0] || "",
        sujeitosBase64List: optSujeitosList,
        base64DoCenario: optCenario || optCenariosList[0] || "",
        cenariosBase64List: optCenariosList,
        logoBase64: store.logoBase64 || finalLogos[0] || "",
        logosList: finalLogos,
        useLogo: finalLogos.length > 0,
        referenciasEstilo: store.referenciasEstilo || [],
        designRefBase64: store.designRefBase64 || "",
        promptTraduzido: masterPrompt,
        resolutionInput: store.resolucao || "1K",
        formato: store.formatoExportacao || "PNG",
        useEnvRef: store.useEnvRef,
        negativePrompt: store.negativePrompt || "",
        customApiKey: customApiKey || localStorage.getItem("custom_gemini_api_key") || "",
        desativarSujeito: store.desativarSujeito,
        dimensao: store.dimensao,
        somentePrompt: store.somentePrompt,
        modelId: store.modelId,
        coresAutomaticas: store.coresAutomaticas,
        seedUsuario: store.seedUsuario
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      const response = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(customApiKey) },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.image || data.imageUrl;
      const newImages: string[] = [];
      if (imageUrl) newImages.push(imageUrl);
      else if (data.images?.length > 0) newImages.push(...data.images);

      if (newImages.length > 0) {
        recordImageGeneration(newImages.length);
        store.addImagesToProjectGallery(targetProjectId, newImages);
        if (newImages[0]) {
          store.addGaleriaImage(newImages[0], { app: "design-builder" });
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("zion-generation-done", { detail: { imageUrl: newImages[0], projectId: targetProjectId } }));
        }
        onSuccess?.(newImages[0], rawPreviousImage);
      } else {
        throw new Error("Nenhum dado de imagem retornado pela API.");
      }
    } catch (err: any) {
      console.error("[FRONT] Fallback /api/gerar also failed:", err);
      showToast(err.message || "Falha na geração.", "error");
      onError?.(err.message || "Falha na geração.");
    }
  };

  return {
    generatePremiumImage,
    isGenerating: store.isGenerating
  };
};
