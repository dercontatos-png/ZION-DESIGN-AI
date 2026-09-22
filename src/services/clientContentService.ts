import { ClientProfile, ContentItem, ContentSlide } from "../store/useClientStore";
import { getAuthHeaders } from "../utils/userAuth";

export interface AnalisePrintsResult {
  estiloVisual: string;
  paletaCores: string[];
  tomVozSugerido: string;
  resumoPerfil: string;
}

export async function analisarPrintsPerfil(
  prints: { name: string; data: string; type: string }[],
  customApiKey?: string
): Promise<AnalisePrintsResult> {
  const apiKey = customApiKey || localStorage.getItem("custom_gemini_api_key") || "";

  const prompt = `Você é um Diretor de Arte e Estrategista de Marcas de elite.
Analise os prints de perfil/feed do Instagram enviados.
Extraia com precisão cirúrgica:
1. "estiloVisual": Uma descrição concisa do estilo visual predominante das artes/fotos (ex: "Editorial Clean e Luminoso", "Dark Theme Minimalista com Acentos Dourados", "Fotografia Corporativa Sofisticada", etc.).
2. "paletaCores": Um array com 3 a 5 códigos HEX de cores reais identificadas nas artes/fotos (ordem: cor primária, secundária, fundo, destaque).
3. "tomVozSugerido": O tom de comunicação que mais combina com a estética do perfil (ex: "Autoridade médica acessível", "Premium e exclusivo", "Moderno e dinâmico").
4. "resumoPerfil": Um resumo de 2 frases sobre a identidade visual do cliente e o público que atrai.

Retorne OBRIGATORIAMENTE um bloco JSON válido no seguinte formato:
\`\`\`json
{
  "estiloVisual": "string",
  "paletaCores": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "tomVozSugerido": "string",
  "resumoPerfil": "string"
}
\`\`\``;

  try {
    const res = await fetch("/api/chat-agentes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
      body: JSON.stringify({
        assistantId: "diretor-de-arte",
        message: prompt,
        attachedFiles: prints.map((p, idx) => ({
          name: p.name || `print_${idx + 1}.jpg`,
          type: p.type || "image/jpeg",
          data: p.data,
          category: "style"
        })),
        customApiKey: apiKey,
        modelId: "gemini-2.5-flash"
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const text: string = data.response || "";
    
    // Parse JSON
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        estiloVisual: parsed.estiloVisual || "Editorial Contemporâneo",
        paletaCores: Array.isArray(parsed.paletaCores) && parsed.paletaCores.length ? parsed.paletaCores : ["#1A1A1A", "#8B5CF6", "#FFFFFF"],
        tomVozSugerido: parsed.tomVozSugerido || "Profissional e Atraente",
        resumoPerfil: parsed.resumoPerfil || "Identidade visual moderna com foco em clareza e autoridade."
      };
    }

    return {
      estiloVisual: "Editorial Clean",
      paletaCores: ["#18181B", "#A855F7", "#FAFAFA"],
      tomVozSugerido: "Autoridade e Confiança",
      resumoPerfil: "Perfil com comunicação visual direta e profissional."
    };
  } catch (err: any) {
    console.error("[analisarPrintsPerfil] Falha na análise de prints:", err);
    return {
      estiloVisual: "Design Clean e Moderno",
      paletaCores: ["#09090B", "#8B5CF6", "#FFFFFF"],
      tomVozSugerido: "Autoridade e Proximidade",
      resumoPerfil: "Identidade visual sofisticada com alto apelo visual."
    };
  }
}

export async function gerarConteudoCliente(
  cliente: ClientProfile,
  tipo: "carrossel" | "card_unico",
  instrucaoOpcional?: string,
  customApiKey?: string,
  quantidadeSlides: number = 5
): Promise<Omit<ContentItem, "id" | "criadoEm">> {
  const apiKey = customApiKey || localStorage.getItem("custom_gemini_api_key") || "";

  const historicoFormatado = (cliente.historicoConteudos && cliente.historicoConteudos.length > 0)
    ? cliente.historicoConteudos.map((item, idx) => 
        `${idx + 1}. [${item.tipo === "carrossel" ? "Carrossel" : "Card"}] "${item.titulo}" — Tema Central: ${item.temaCentral} (Gancho: ${item.gancho})`
      ).join("\n")
    : "Nenhum conteúdo registrado ainda. Este será o primeiro post do cliente.";

  const prompt = `Você é um Diretor de Criação & Estrategista de Conteúdo de ponta para redes sociais.
Sua missão é criar um conteúdo de altíssimo impacto para o cliente abaixo:

PERFIL DO CLIENTE:
- Nome da Marca/Profissional: ${cliente.name}
- Nicho/Especialidade: ${cliente.niche}
- Paleta de Cores: ${cliente.paletaCores?.join(", ") || "Neutros e acentos modernos"}
- Estilo Visual: ${cliente.estiloVisualExtraido || cliente.infoExtra || "Fotográfico Editorial de Alto Padrão"}
- Regras da Marca / Público / Diretrizes: ${cliente.regrasMarca || cliente.infoExtra || "Foco em público qualificado e valor percebido"}

MEMÓRIA PERMANENTE DE CONTEÚDOS JÁ GERADOS (REGRA CRÍTICA DE ANTI-REPETIÇÃO):
${historicoFormatado}

⚠️ MANDATO ABSOLUTO DE INEDITISMO:
É TERMINANTEMENTE PROIBIDO repetir ou reescrever qualquer um dos temas, ganchos ou abordagens listados na memória acima!
Proponha um ângulo INÉDITO, focado em uma dor diferente, uma curiosidade fascinante, um mito ainda não desbancado ou um tutorial prático e valioso.

${instrucaoOpcional ? `INSTRUÇÃO ESPECÍFICA DO USUÁRIO PARA ESTE POST: "${instrucaoOpcional}"` : "Crie o conteúdo mais estratégico e de maior potencial de compartilhamento e salvamento para este nicho."}

FORMATO SOLICITADO: ${
  tipo === "carrossel"
    ? `CARROSSEL COMPLETO COM EXATAMENTE ${quantidadeSlides} SLIDES (Slide 1: Capa, Slides 2 até ${quantidadeSlides - 1}: Conteúdo aprofundado, Slide ${quantidadeSlides}: CTA final).`
    : "CARD ÚNICO DE ALTO IMPACTO (1 SLIDE)."
}

REGRA RIGOROSA DE QUANTIDADE DE SLIDES:
${
  tipo === "carrossel"
    ? `O array "slides" no JSON DEVE CONTER RIGOROSAMENTE ${quantidadeSlides} OBJETOS (numerados de 1 a ${quantidadeSlides}). Não gere mais nem menos que ${quantidadeSlides} slides!`
    : 'O array "slides" no JSON deve conter exatamente 1 objeto.'
}

DIRETRIZES DE CONSTRUÇÃO DO PROMPT DO ÓRION PRO ('promptOrion'):
- O prompt do Órion Pro DEVE ser escrito em INGLÊS.
- Deve incluir: sujeito claro, iluminação sofisticada (ex: studio lighting, soft rim light, clean atmosphere), paleta de cores do cliente e proporção '--ar 4:5'.
- Para a Capa (Slide 1): inclua 'ample negative space on top and left for clean headline typography'.
- Para os slides de conteúdo: garanta a mesma atmosfera visual da capa.
- Para o Slide final (CTA): composição com espaço para botão ou chamada de ação.

Retorne OBRIGATORIAMENTE um bloco JSON com este formato exato:
\`\`\`json
{
  "tipo": "${tipo}",
  "titulo": "Título de impacto do post",
  "temaCentral": "Resumo do tema em 4 palavras",
  "gancho": "A frase exata de abertura que prende a atenção nos primeiros 3 segundos",
  "slides": [
    {
      "numero": 1,
      "tipo": "capa",
      "titulo": "Título da Capa",
      "conteudo": "Subtítulo ou gancho complementar",
      "sugestaoVisual": "Descrição visual em português da cena",
      "promptOrion": "Detailed English prompt for Orion Pro with clean composition, colors and --ar 4:5"
    }
    // se for carrossel, continue com slides de conteudo (tipo: "conteudo") e finalize com tipo: "cta"
  ],
  "legenda": "Texto completo e persuasivo para a legenda da publicação, com quebras de linha e chamada para ação",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "status": "rascunho"
}
\`\`\``;

  try {
    const res = await fetch("/api/chat-agentes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
      body: JSON.stringify({
        assistantId: "estrategista-conteudo",
        message: prompt,
        customApiKey: apiKey,
        modelId: "gemini-2.5-flash"
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const text: string = data.response || "";
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      const slides: ContentSlide[] = (parsed.slides || []).map((s: any, idx: number) => ({
        id: `slide_${idx + 1}_${Date.now()}`,
        numero: s.numero || idx + 1,
        tipo: s.tipo || (idx === 0 ? "capa" : idx === parsed.slides.length - 1 ? "cta" : "conteudo"),
        titulo: s.titulo || `Slide ${idx + 1}`,
        conteudo: s.conteudo || "",
        sugestaoVisual: s.sugestaoVisual || "Composição limpa alinhada à identidade visual da marca.",
        promptOrion: s.promptOrion || `Minimalist modern commercial composition, aesthetic studio lighting, clean background, --ar 4:5`
      }));

      return {
        tipo,
        titulo: parsed.titulo || "Novo Conteúdo Estratégico",
        temaCentral: parsed.temaCentral || cliente.niche,
        gancho: parsed.gancho || parsed.titulo || "",
        slides: slides.length ? slides : [
          {
            id: `slide_1_${Date.now()}`,
            numero: 1,
            tipo: "capa",
            titulo: parsed.titulo || "Capa",
            conteudo: "Destaque do post",
            sugestaoVisual: "Composição limpa e profissional",
            promptOrion: "Minimalist commercial composition, studio lighting, ample negative space --ar 4:5"
          }
        ],
        legenda: parsed.legenda || "Confira este conteúdo exclusivo preparado para você. Salve para consultar depois!",
        hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length ? parsed.hashtags : ["#marketing", "#autoridade", "#conteudo"],
        status: "rascunho"
      };
    }

    throw new Error("Formato de resposta JSON inválido da IA.");
  } catch (err: any) {
    console.warn("[gerarConteudoCliente] Usando fallback estruturado:", err.message || err);
    // Fallback inteligente caso a rede ou endpoint falhe temporariamente
    const fallbackTitle = tipo === "carrossel" 
      ? `3 Segredos de ${cliente.niche} que poucos revelam` 
      : `O maior erro em ${cliente.niche} hoje`;

    const fallbackSlides: ContentSlide[] = tipo === "carrossel" 
      ? [
          {
            id: `slide_1_${Date.now()}`,
            numero: 1,
            tipo: "capa",
            titulo: fallbackTitle,
            conteudo: "O que você precisa saber antes de tomar qualquer decisão.",
            sugestaoVisual: "Sujeito na direita com espaço negativo limpo na esquerda para tipografia.",
            promptOrion: `Modern minimalist 3D concept for ${cliente.niche}, studio softbox lighting, negative space on left, premium aesthetic --ar 4:5`
          },
          {
            id: `slide_2_${Date.now()}`,
            numero: 2,
            tipo: "conteudo",
            titulo: "Passo 1: Diagnóstico Correto",
            conteudo: "Não comece pela solução sem entender a causa raiz do problema.",
            sugestaoVisual: "Composição central limpa mantendo a mesma iluminação e paleta.",
            promptOrion: `Modern minimalist graphic elements for ${cliente.niche}, studio lighting, clean background --ar 4:5`
          },
          {
            id: `slide_3_${Date.now()}`,
            numero: 3,
            tipo: "conteudo",
            titulo: "Passo 2: Consistência Estratégica",
            conteudo: "Resultados duradouros são fruto de repetição qualificada e método.",
            sugestaoVisual: "Detalhe focado em progresso e precisão.",
            promptOrion: `Sleek high-tech abstract concept for ${cliente.niche}, soft rim lighting, dark background --ar 4:5`
          },
          {
            id: `slide_4_${Date.now()}`,
            numero: 4,
            tipo: "cta",
            titulo: "Gostou deste conteúdo?",
            conteudo: "Salve para consultar mais tarde e compartilhe com quem precisa saber disso.",
            sugestaoVisual: "Fechamento elegante com moldura para chamada para ação.",
            promptOrion: `Minimalist monolith concept with subtle light rays, clean edges for text, --ar 4:5`
          }
        ]
      : [
          {
            id: `slide_1_${Date.now()}`,
            numero: 1,
            tipo: "capa",
            titulo: fallbackTitle,
            conteudo: "Uma virada de chave para os seus resultados.",
            sugestaoVisual: "Composição de autoridade com iluminação direcional.",
            promptOrion: `Commercial advertising visual for ${cliente.niche}, cinematic lighting, modern composition, --ar 4:5`
          }
        ];

    return {
      tipo,
      titulo: fallbackTitle,
      temaCentral: `Estratégia de ${cliente.niche}`,
      gancho: "Você provavelmente está cometendo esse erro sem perceber.",
      slides: fallbackSlides,
      legenda: `Você já parou para analisar como pequenos detalhes fazem toda a diferença em ${cliente.niche}?\n\nNeste post, separamos os pontos fundamentais que você deve aplicar agora mesmo.\n\n💬 Deixe seu comentário ou salve para não perder!`,
      hashtags: [`#${cliente.niche.replace(/\s+/g, "").toLowerCase()}`, "#autoridade", "#crescimento", "#dicas"],
      status: "rascunho"
    };
  }
}

export async function ajustarConteudoComIA(
  conteudoAtual: ContentItem,
  pedidoAjuste: string,
  cliente: ClientProfile,
  customApiKey?: string
): Promise<ContentItem> {
  const apiKey = customApiKey || localStorage.getItem("custom_gemini_api_key") || "";

  const prompt = `Você é um Diretor de Arte e Copywriter sênior.
O usuário solicitou um ajuste específico em um conteúdo que já foi criado para o cliente "${cliente.name}" (${cliente.niche}).

CONTEÚDO ATUAL EM JSON:
\`\`\`json
${JSON.stringify(conteudoAtual, null, 2)}
\`\`\`

PEDIDO EXATO DE AJUSTE DO USUÁRIO:
"${pedidoAjuste}"

DIRETRIZES:
1. Aplique ESTRITAMENTE as alterações que o usuário pediu.
2. Mantenha intactos todos os títulos, slides ou textos que o usuário NÃO mencionou.
3. Se o usuário pediu para mudar o gancho, ajuste 'gancho' e o 'titulo' do Slide 1.
4. Se o usuário pediu para mudar a sugestão visual ou prompt do Órion, atualize 'sugestaoVisual' e 'promptOrion' do slide correspondente.
5. Preserve o mesmo 'id' e 'criadoEm'.

Retorne OBRIGATORIAMENTE um bloco JSON com o objeto atualizado:
\`\`\`json
${JSON.stringify(conteudoAtual, null, 2)}
\`\`\``;

  try {
    const res = await fetch("/api/chat-agentes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders(apiKey) },
      body: JSON.stringify({
        assistantId: "estrategista-conteudo",
        message: prompt,
        customApiKey: apiKey,
        modelId: "gemini-2.5-flash"
      })
    });

    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    const text: string = data.response || "";
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        ...conteudoAtual,
        ...parsed,
        id: conteudoAtual.id,
        criadoEm: conteudoAtual.criadoEm,
        slides: (parsed.slides || conteudoAtual.slides).map((s: any, idx: number) => ({
          ...s,
          id: s.id || `slide_${idx + 1}_${Date.now()}`
        }))
      };
    }
  } catch (err) {
    console.warn("[ajustarConteudoComIA] Erro ao ajustar com IA:", err);
  }

  return conteudoAtual;
}
