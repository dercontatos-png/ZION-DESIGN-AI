import { ProjectConfig } from "../types/designBuilder";

/**
 * Sanitiza placeholders e palavras de sistema para não poluir as camadas de texto reais
 */
const sanitizeText = (str?: string): string => {
  if (!str) return "";
  let cleaned = str.replace(/\[(headline|subtítulo|subtitulo|chamada|texto|cta|inserir|digite|seu texto|sua frase|conteúdo|conteudo|rodapé|rodape|logo|logotipo|imagem|nome|data|telefone|whatsapp|instagram|endereço|endereco|título|titulo|apoio|secundári[oa]|principal|slogan|tagline|description|title|subtitle|footer|header|body|content|image|date|phone|address|name|your text|insert|type)[^\]]*\]/gi, '').trim();
  if (/^\[.*\]$/.test(cleaned) || /^\[.*\]$/.test(str.trim())) return "";
  const purePlaceholders = /^(headline principal|chamada secund[áa]ria|texto de apoio|rodap[ée]|subt[ií]tulo|cta|call to action|seu t[ií]tulo|seu texto|inserir texto|centro|esquerda|direita|alinhamento|posição|posicao)$/i;
  if (purePlaceholders.test(cleaned)) return "";
  return cleaned;
};

const getLayoutRatioGuidance = (ratio: string): string => {
  switch (ratio) {
    case "4:5":
      return "Vertical portrait format (4:5). Full-bleed edge-to-edge composition, optimized for mobile social feeds and premium commercial campaigns.";
    case "9:16":
      return "Full vertical story/reel format (9:16). Seamless edge-to-edge visual architecture optimized for mobile vertical viewing.";
    case "16:9":
      return "Widescreen landscape format (16:9). Cinematic framing for broadcast and wide panoramic displays.";
    case "3:4":
      return "Classic vertical format (3:4). Balanced full-canvas framing for commercial editorial layouts.";
    default:
      return "Square standard format (1:1). Centered commercial framing with balanced negative space and full-bleed coverage.";
  }
};

/**
 * Construtor Mestre Universal (Design Builder / Órion Pro / Master Engine).
 * Implementa a arquitetura de blocos de alto impacto visual baseada no conhecimento de master prompts:
 * - SWAP SLOTS para Preservação Rigorosa de Identidade e Branding
 * - THE PICTURE & THE READING (Conceito Narrativo e Impacto)
 * - ANATOMIA E CONTAGEM ESTRITA DE MEMBROS (2 braços, 2 pernas, 5 dedos, deformação dérmica)
 * - LEI DE COMPOSIÇÃO FULL-BLEED (BANIMENTO ABSOLUTO DE CARDS/RETÂNGULOS FLUTUANTES)
 * - ÓPTICA E FÍSICA DA LUZ (Key light, rim light, ambient bounce, SSS 3 camadas)
 * - FINAL CHECKLIST
 */
export const buildMasterPrompt = (config: ProjectConfig): string => {
  const isProduct = config.tipoPainel === "PRODUCT";
  const hasFlyerContext = !!(config.nicho?.trim() || (config.referenciasEstilo && config.referenciasEstilo.length > 0) || (config.camadasTexto && config.camadasTexto.length > 0));
  const isLogo = !hasFlyerContext && (
    config.tipoPainel === "LOGO" || 
    /(apenas.*logo|somente.*logo|logo.*isolad[ao]|criar.*logotipo|desenhar.*logotipo|apenas.*o.*s[íi]mbolo|s[íi]mbolo.*isolado)/i.test(config.additionalPrompt || "") ||
    /(apenas.*logo|somente.*logo|logo.*isolad[ao]|criar.*logotipo|desenhar.*logotipo|apenas.*o.*s[íi]mbolo|s[íi]mbolo.*isolado)/i.test(config.promptCenario || "")
  );
  const isGcTv = config.tipoPainel === "GC_TV";
  const isFoto = config.tipoPainel === "FOTO";
  
  const ratio = config.dimensao || (isLogo ? "1:1" : "4:5");
  const resolution = config.resolucao || "4K";
  const hasLogo = config.useLogo || !!config.logoBase64 || (Array.isArray(config.logosList) && config.logosList.length > 0);
  const isLogoOverlay = config.logoInclusionType === "overlay" && hasLogo;

  // Determinação se há sujeito humano real ou se o usuário pediu para NÃO colocar pessoas / apenas caixas
  const hasSubjectPhotos = !!(config.sujeitoBase64 || (config.sujeitosBase64List && config.sujeitosBase64List.length > 0));
  const allSubjectAndPromptText = `${config.poseDescription || ""} ${config.subject_description || ""} ${config.additionalPrompt || ""}`.toLowerCase();
  const userExplicitlyRequestedNoPerson = /sem (pessoa|modelo|mulher|homem|sujeito)|deixe.*quadrado|quadrados? branco|colocar foto depois|apenas (o )?layout|sem foto/i.test(allSubjectAndPromptText);
  const isPersonCategory = config.categoria === "Pessoa";
  const hasSubject = !isLogo && !config.desativarSujeito && !config.noPeople && !userExplicitlyRequestedNoPerson && (hasSubjectPhotos || (isPersonCategory && !userExplicitlyRequestedNoPerson));

  // Extração dinâmica de camadas de texto
  const rawLayers = (config.camadasTexto || [])
    .map(l => ({ ...l, conteudo: sanitizeText(l.conteudo) }))
    .filter(l => l.conteudo && l.conteudo.trim() && !/^(centro|esquerda|direita)$/i.test(l.conteudo.trim()));

  // Função auxiliar para identificar se uma camada é de contato/redes sociais
  const isContactLayer = (l: any) => {
    const c = l.conteudo || "";
    return c.includes("@") || /(\(\d{2}\)|\d{4,5}[-\s]?\d{4})/.test(c) || /whatsapp|instagram|facebook/i.test(l.funcao || "") || (l.tipoBloco === "CTA" && !/saiba mais|inscreva|clique|matricule/i.test(c));
  };

  // Posição de cada camada de contato
  const isBottomPosition = (posStr: string) => {
    const p = (posStr || "").toLowerCase();
    return p.includes("bottom") || p.includes("baixo") || p.includes("↓") || p.includes("↙") || p.includes("↘");
  };

  const isTopPosition = (posStr: string) => {
    const p = (posStr || "").toLowerCase();
    return p.includes("top") || p.includes("cima") || p.includes("↖") || p.includes("↑") || p.includes("↗");
  };

  const userRequestedBottomSocial = /em baixo|no rodap[ée]|em baixo meio/i.test(config.additionalPrompt || "");

  // Camadas de contato no rodapé (bottom)
  const bottomContactLayers = rawLayers.filter(l => isContactLayer(l) && (isBottomPosition(l.posicao) || userRequestedBottomSocial || (!isTopPosition(l.posicao) && (l.tipoBloco === "CTA" || l.funcao?.includes("CTA")))));

  // Camadas de contato no topo (top)
  const topContactLayers = rawLayers.filter(l => isContactLayer(l) && isTopPosition(l.posicao) && !userRequestedBottomSocial);

  // Extração de @handle social e telefone
  const allTextFields = `${config.additionalPrompt || ""} ${config.promptCenario || ""}`;
  const handleLayer = rawLayers.find(l => l.conteudo && l.conteudo.includes("@"));
  const cleanHandle = (handleLayer?.conteudo || (allTextFields.match(/@[a-zA-Z0-9._-]+/)?.[0]) || "").toLowerCase();
  const phoneLayer = rawLayers.find(l => l.conteudo && /(\(\d{2}\)|\d{4,5}[-\s]?\d{4})/.test(l.conteudo));
  const cleanPhone = phoneLayer?.conteudo || (allTextFields.match(/(\(\d{2}\)\s*\d{4,5}[-\s]?\d{4})/)?.[0]) || "";

  // Cores dinâmicas do projeto
  const ambientBg = config.cores?.ambiente || (isLogo ? "#0A0A0A" : "#0d1e49");
  const primaryAccent = config.cores?.recorte || "#128ab6";
  const secondaryAccent = config.cores?.complementar || "#ffffff";
  const isDarkCanvas = /^#[0-3]|^#0[0-9a-fA-F]{5}/.test(ambientBg);

  // Categorização dinâmica de títulos e corpo (excluindo contatos para não forçar contato no topo ou no canto)
  const nonContactLayers = rawLayers.filter(l => !isContactLayer(l));
  const headlineLayers = nonContactLayers.filter(l => l.funcao?.includes("Headline") || l.funcao?.includes("Título") || l.tipoBloco === "H1" || nonContactLayers.indexOf(l) === 0);
  const bodyLayers = nonContactLayers.filter(l => !headlineLayers.includes(l));

  // Fonte primária configurada no projeto
  const mainFont = headlineLayers[0]?.fonte || rawLayers[0]?.fonte || "Montserrat";
  const isSansSerif = !/serif|cinzel|playfair|bodoni|garamond/i.test(mainFont);

  // Determinação do modo de alinhamento principal baseado na headline
  const primaryHeadlinePos = (headlineLayers[0]?.posicao || config.typographyPosition || "").toLowerCase();
  let alignmentMode: "left" | "right" | "center" = "center";
  if (primaryHeadlinePos.includes("esq") || primaryHeadlinePos.includes("left")) {
    alignmentMode = "left";
  } else if (primaryHeadlinePos.includes("dir") || primaryHeadlinePos.includes("right")) {
    alignmentMode = "right";
  }

  // Função auxiliar para mapear a posição exata da camada (9 posições)
  const getPositionDescription = (pos?: string): string => {
    const p = (pos || "").toLowerCase();
    if (p.includes("top-left") || p === "↖") return "TOP-LEFT (upper section, flush left with 8% margin)";
    if (p.includes("top-center") || p === "↑") return "TOP-CENTER (upper section, horizontally centered)";
    if (p.includes("top-right") || p === "↗") return "TOP-RIGHT (upper section, flush right with 8% margin)";
    if (p.includes("middle-left") || p === "←" || p === "left" || p === "esquerda") return "MIDDLE-LEFT (middle section, left-aligned)";
    if (p.includes("middle-center") || p === "●" || p === "center" || p === "centro") return "MIDDLE-CENTER (middle section, horizontally centered)";
    if (p.includes("middle-right") || p === "→" || p === "right" || p === "direita") return "MIDDLE-RIGHT (middle section, right-aligned)";
    if (p.includes("bottom-left") || p === "↙") return "BOTTOM-LEFT (lower section, left-aligned)";
    if (p.includes("bottom-center") || p === "↓" || p === "bottom") return "BOTTOM-CENTER (lower section, horizontally centered)";
    if (p.includes("bottom-right") || p === "↘") return "BOTTOM-RIGHT (lower section, right-aligned)";
    return "HORIZONTALLY CENTERED";
  };

  const userRequestedBoxesOrCards = /quadrad|box|card|caixa|ret[âa]ngul|painel|container/i.test(config.additionalPrompt || "") || userExplicitlyRequestedNoPerson;

  const blocks: string[] = [];

  // ── BLOCO 1: GOVERNING LAW & SWAP SLOTS ──
  const imageBindingRules: string[] = [];
  imageBindingRules.push("GOVERNING LAW FOR THIS GENERATION (HIGHEST AUTHORITY):");
  if (isLogo) {
    imageBindingRules.push("The user has requested an ISOLATED LOGO / EMBLEM. Replicate ONLY the exact geometric shapes, lines, contours, and proportions of the logo mark.");
    imageBindingRules.push("ABSOLUTE PROHIBITION against creating advertising flyers, human portraits, real estate ads, dollar signs, floating coins, or complex cards.");
  } else {
    imageBindingRules.push("The visual references attached to this generation are THE VISUAL LAW. Replicate layout geometry, lighting, depth, and spatial hierarchy faithfully.");
  }
  
  if (config.designRefBase64 || (config.designRefsList && config.designRefsList.length > 0)) {
    if (isLogo) {
      imageBindingRules.push("- LOGO REFERENCE IMAGE: Replicate the EXACT logo emblem/mark geometry from this reference image, applying ONLY the requested color change.");
    } else {
      imageBindingRules.push("- LAYOUT REFERENCE IMAGE (Primary Visual Ground Truth): Replicate the visual layout structure, lighting quality, and spatial depth from the layout reference. Erase all original placeholder words, dates, and old logos; replace strictly with the requested custom text layers and client assets.");
      if (isSansSerif) {
        imageBindingRules.push("- TYPOGRAPHY OVERRIDE LAW: COMPLETELY OVERRIDE the font style from the layout reference. Do NOT copy slab-serif, serif, or decorative letterforms from the reference image. Render strictly in clean, modern, heavy geometric sans-serif typography matching the requested font family.");
      }
    }
  }
  // Non-negotiable aspect ratio & geometric fidelity law
  imageBindingRules.push("- PROPORTION INTEGRITY & ZERO DISTORTION LAW (MANDATORY - NON-NEGOTIABLE): NEVER stretch, squash, widen, or horizontally/vertically distort any logo, typography, human face/body, or reference graphic element. Circular emblems, seals, stamps, and icons MUST remain mathematically perfect 1:1 round circles - NEVER squashed into horizontal ovals or widened shapes! All subjects and logos MUST retain their authentic 1:1 native geometric proportions without any anamorphic stretching.");

  if (hasLogo && !isLogoOverlay) {
    imageBindingRules.push("- SWAP SLOT — THE BRANDING & LOGO FIDELITY: Every logo, coat of arms, and insignia comes from the reference files supplied. The reference logo contains the COMPLETE brand lockup: BOTH the brand name 'CEPAR' in clean capital serif typography at the top AND the coat of arms emblem (shield, laurel wreath, open book, graduation cap, pencil) below it. You MUST replicate the ENTIRE lockup together. NEVER crop out, cut off, or drop the name 'CEPAR'! NEVER alter or hallucinate the name (do not change 'CEPAR' to 'Centro CE-PAR'). Replicate 100% of the graphic mark geometry with the requested colors. Position the complete logo in the institutional header (top-left or top-center) with a MANDATORY generous safe margin of at least 16% to 20% down from the absolute top edge of the canvas (minimum 550 to 700 pixels in 4K resolution). NEVER touch, crop, or glue the logo to the top edge! OR in the footer endorsement bar. NEVER place the logo in the middle under headlines.");
    if (isDarkCanvas) {
      imageBindingRules.push("- LOGO CONTRAST & ADAPTATION LAW: On dark background canvas, render the brand logo in high-contrast vibrant colors or requested clean white/metallic finish without background boxes or stickers.");
    }
  }
  if (hasSubject && (config.sujeitoBase64 || (config.sujeitosBase64List && config.sujeitosBase64List.length > 0))) {
    imageBindingRules.push("- SWAP SLOT — Image 1 is the identity reference, and it owns the entire person. From image 1 come the face and all its features, the eye colour, the skin tone and every mark on it, the age, the gender, the build, and the hair's colour, length, texture, curl pattern and density along with any facial hair. None of those are described anywhere in this prompt and none of them are to be invented. Do not add or remove marks, lines or blemishes, do not smooth, retouch or rejuvenate anything, and do not reshape the face or the body proportions. From image 1 take only the person; take nothing else — not the clothing, not the eyewear, not the pose, not the expression, not the framing, not the lighting, not the background, not the colour palette. Preserve 100% authentic photographic fidelity.");
  }
  if (config.cenarioBase64 || (config.cenariosBase64List && config.cenariosBase64List.length > 0)) {
    imageBindingRules.push("- ENVIRONMENT INSPIRATION REFERENCES: Adapt visual atmosphere, lighting directions, and architectural environment from the attached inspiration images, situating the subject seamlessly inside the space.");
  }

  if (config.referenciasEstilo && config.referenciasEstilo.length > 0) {
    imageBindingRules.push("- STYLE & AESTHETIC REFERENCE IMAGE (Visual Law): Analyze and faithfully replicate the overall visual style, lighting atmosphere, optical depth, and color mood of the reference image. Seamlessly harmonize the client's brand colors (" + primaryAccent + ", " + secondaryAccent + ") into the lighting and accents. The scene must feel rich, natural, and immersive, matching the production value of the reference.");
    const styleNotes = config.referenciasEstilo
      .filter(r => r.descricao && r.descricao.trim())
      .map((r, i) => `  - Reference Note ${i + 1}: ${r.descricao.trim()}`);
    if (styleNotes.length > 0) {
      imageBindingRules.push(`${styleNotes.join("\n")}`);
    }
  }
  blocks.push(imageBindingRules.join("\n"));

  // ── BLOCO 2: THE PICTURE & THE READING ──
  const isInstitutional = /sa[uú]de|curso|ensino|escola|faculdade|educa|institucional|prefeitura|m[ée]dic|hospital|cl[ií]nica|treinamento/i.test(config.nicho || "") ||
    /sa[uú]de|curso|ensino|escola|faculdade|educa|institucional|prefeitura|m[ée]dic|hospital|cl[ií]nica|treinamento/i.test(config.additionalPrompt || "");

  if (isLogo) {
    blocks.push(`THE PICTURE — An isolated minimalist brand logo and vector emblem displayed centered on a clean, solid, ultra-refined background (${ambientBg}). Tack-sharp contours, luxurious specular highlights, and zero clutter.`);
  } else if (isInstitutional) {
    blocks.push(`THE PICTURE — A vertical commercial advertising master visual in ${ratio} aspect ratio: professional, prestigious, and deeply aesthetic institutional campaign. Full-bleed edge-to-edge canvas with rich atmospheric depth, cinematic lighting, and impeccably sharp commercial typography floating naturally over the scene.`);
    blocks.push(`THE READING — This is a high-authority institutional visual designed for instant trust and engagement. The composition is clean, monumental, and uncluttered. The subject commands presence with a composed, approachable posture, while the headline and information hierarchy are instantly readable with crisp contrast. Every element feels deliberate and agency-grade.`);
  } else if (isProduct) {
    blocks.push(`THE PICTURE — A high-end commercial product hero shot in ${ratio} aspect ratio: the product stands monumental in a premium studio environment, with dramatic raking key lighting, crisp highlights along its contours, and rich contextual depth.`);
    blocks.push(`THE READING — This is an abundance and precision packshot. The physical materials behave realistically: matte surfaces scatter light softly while glossy surfaces return bright, sharp specular reflections. The product is heroically staged as the absolute focal center.`);
  } else {
    blocks.push(`THE PICTURE — A vertical high-impact commercial visual in ${ratio} aspect ratio: edge-to-edge full canvas design, top-tier advertising agency grade, ultra-detailed, ${resolution} resolution, with authentic studio lighting, sharp focus, and compelling depth.`);
    blocks.push(`THE READING — This image is built on visual clarity, dynamism, and photographic conviction. The subject is naturally integrated with the environment and lighting, while all typography and graphic elements float seamlessly across the canvas with generous breathing room (10%+ padding from all canvas edges) and zero artificial borders. Full-bleed means the BACKGROUND extends edge-to-edge, but all content elements (text, logos, icons) MUST stay within the safe margin zone.`);
  }

  // ── BLOCO 3: DIRETRIZES LIVRES DO USUÁRIO & NICHO ──
  const directiveItems: string[] = [];
  if (config.nicho && config.nicho.trim()) {
    directiveItems.push(`Campaign Niche / Project Theme: ${config.nicho.trim()}`);
  }
  if (config.additionalPrompt && config.additionalPrompt.trim()) {
    directiveItems.push(`USER CUSTOM DIRECTIVES (SOVEREIGN HIGHEST AUTHORITY — OVERRIDES ALL GENERIC CONSTRAINTS):
${config.additionalPrompt.trim()}
MANDATORY: If the user explicitly requested white squares, cards, panels, or specific visual elements above, you MUST render them faithfully exactly as instructed! Generic layout constraints against central cards apply only to unprompted default containers, NEVER to elements explicitly requested by the user.`);
  }
  if (directiveItems.length > 0) {
    blocks.push(`USER MANDATORY DIRECTIVES & CAMPAIGN SPECIFICATIONS:\n${directiveItems.join("\n")}`);
  }

  // ── BLOCO 4: FRAMING AND CAMERA ──
  let cameraSetup = "Lens 85mm on a full-frame sensor, camera at eye level, held perfectly level with no tilt. Aperture f/2.0 for natural depth of field and soft background separation.";
  if (isLogo) {
    cameraSetup = "Macro studio prime lens, sensor centered dead-on with zero tilt. Aperture f/8 for tack-sharp geometric definition.";
  } else if (isProduct) {
    cameraSetup = "Lens 85mm on a full-frame sensor, camera positioned low at approximately 35 degrees above the surface plane. Aperture f/7.1 for monumental depth.";
  } else if (isFoto) {
    cameraSetup = "Lens 85mm f/1.4 portrait prime lens on a full-frame sensor, tack-sharp focal plane with creamy organic bokeh.";
  } else if (isGcTv) {
    cameraSetup = "Lens 35mm broadcast lens on a full-frame sensor, aperture f/2.8, cinematic 16:9 framing.";
  }

  const bgStyle = config.promptCenario?.trim()
    ? config.promptCenario.trim()
    : isLogo
      ? `Clean, sleek solid dark background (${ambientBg}) with zero clutter.`
      : isDarkCanvas
      ? `Deep luxury solid canvas environment (${ambientBg}) with subtle micro-textures, controlled ambient lighting, and rich depth.`
      : `Clean light canvas environment (${ambientBg}) with subtle, delicate architectural textures and watermark patterns matching the reference atmosphere.`;

  blocks.push(`FRAMING AND CAMERA — Aspect ratio ${ratio}, ${ratio === "9:16" || ratio === "4:5" || ratio === "3:4" ? "vertical" : ratio === "16:9" ? "horizontal" : "square"}. ${cameraSetup}\nBackground: ${bgStyle}\n${getLayoutRatioGuidance(ratio)}`);

  // ── BLOCO 5: LIMB COUNT AND ANATOMY SAFETY (CRITICAL) ──
  if (!isLogo && hasSubject) {
    blocks.push(`LIMB COUNT AND ANATOMY (CRITICAL SAFETY RULE — NON-NEGOTIABLE):
The body has EXACTLY two arms, two legs, two hands, and two feet.
Two hands exist in the picture and no more. Exactly 5 fingers per hand (no extra fingers, no fused digits, no floating hands).
Each limb is continuous from its joint to its endpoint in one unbroken line: shoulder -> upper arm -> elbow -> forearm -> wrist -> hand.
Dermal deformation on contact: realistic soft compression where digits touch objects or clothing.
Normal, symmetric, anatomically correct human proportions. Zero AI hallucinations, zero duplicated limbs.`);
  }

  // ── BLOCO 6: HERO EFFECTS & MATERIAL PHYSICS ──
  if (!isLogo) {
    if (hasSubject) {
      blocks.push(`HERO EFFECT — MATERIAL PHYSICS AND TACTILE TEXTURE:
- Skin: Rendered as real camera captures living human skin. 3-layer Subsurface Scattering (epidermis, dermis, subcutaneous fat) allows light to penetrate and scatter naturally in lit areas (forehead, cheekbones, nose). Pores and fine surface micro-displacement resolved at plane of sharpness. Vellus hairs catch raking light as fine bright filaments. Zero plastic smoothing, zero beauty filters.
- Fabrics: Authentic tactile materials. Matte cotton twills, crisp pressed shirt collars, textured knitwear with individual thread definition. Fabrics absorb and scatter light naturally without fake plastic sheen.
- Lighting Interaction: Specular highlights remain small and controlled. Shadows stay open with readable detail in folds rather than collapsing into flat black voids.`);
    } else {
      blocks.push(`HERO EFFECT — MATERIAL PHYSICS AND TACTILE TEXTURE:
- Surfaces & Materials: Tack-sharp architectural finishes, rich volumetric atmosphere, clean reflections on medical/technological equipment and glass.
- Typography & Vectors: Crisp, flawless anti-aliased vector edges on all lettering, logo marks, and iconography.
- Lighting Interaction: Balanced cinematic studio lighting with subtle ambient bounce and clean shadow falloff.`);
    }
  }

  // ── BLOCO 7: POSE & EXPRESSION OU CAIXAS DE FOTO VAZIAS ──
  if (!isLogo) {
    if (hasSubject) {
      const pose = config.poseDescription || "Professional, engaging, composed posture naturally integrated into the composition.";
      const subjectSpatialPlacement = alignmentMode === "left"
        ? "strictly on the RIGHT SIDE of the frame (occupying the right 55% of canvas width, facing slightly inward, leaving the left 45% of the canvas completely free for the left-aligned typography column)"
        : alignmentMode === "right"
        ? "strictly on the LEFT SIDE of the frame (occupying the left 55% of canvas width, facing slightly inward, leaving the right 45% of the canvas completely free for the right-aligned typography column)"
        : `at ${config.positioning?.toLowerCase() || "center"} of the frame`;
      blocks.push(`POSE & SPATIAL PLACEMENT — Standing or seated composedly ${subjectSpatialPlacement}. ${pose} Weight settled, shoulders relaxed and dropped. Torso naturally oriented with subtle organic angle.`);
      blocks.push(`EXPRESSION — Genuine, confident, approachable expression. The brows sit level and untensed. The eyes are warm, open and steady, holding the lens with clear catchlights. The mouth features an authentic, unforced expression engaging the cheeks with subtle natural creasing at the eye corners. The face reads as human, charismatic, and authentic.`);
      // Dynamic card detection from user prompt
      const promptToScan = (config.additionalPrompt || "").toLowerCase();
      const detectedCountMatch = promptToScan.match(/(\d+)\s*(quadrados?|cards?|caixas?|boxes?|espa[çc]os?|slots?)/i) ||
                                 promptToScan.match(/(quatro|4)\s*(quadrados?|cards?|caixas?|boxes?)/i) ||
                                 promptToScan.match(/(tr[êe]s|3)\s*(quadrados?|cards?|caixas?|boxes?)/i) ||
                                 promptToScan.match(/(dois|duas|2)\s*(quadrados?|cards?|caixas?|boxes?)/i);
      let detectedCards = 3;
      if (detectedCountMatch) {
        const w = detectedCountMatch[1].toLowerCase();
        if (w === "4" || w === "quatro") detectedCards = 4;
        else if (w === "3" || w === "três" || w === "tres") detectedCards = 3;
        else if (w === "2" || w === "dois" || w === "duas") detectedCards = 2;
        else if (w === "5" || w === "cinco") detectedCards = 5;
        else { const n = parseInt(w); if (!isNaN(n) && n >= 1 && n <= 6) detectedCards = n; }
      } else if (/mais um quadrado|adicione mais um quadrado/i.test(promptToScan)) {
        detectedCards = 4;
      }

      blocks.push(`PHOTO PLACEHOLDER SLOTS & HARMONIC VERTICAL PROPORTIONS:
- ABSOLUTE PROHIBITION OF HUMAN MODELS: ZERO people, ZERO women, ZERO nurses, ZERO doctors, ZERO human figures! Do NOT paint any human model into the artwork!
- EXACTLY ${detectedCards} HORIZONTAL PHOTO CARDS: Render exactly ${detectedCards} clean, prominent, white rectangular placeholder boxes arranged horizontally side-by-side across the middle of the canvas ("${detectedCards} quadrados um do lado do outro").
- Appearance: Pure solid white fill (#FFFFFF) with subtle elegant rounded corners and soft drop shadows separating them from the background.
- ELEGANT CARD PROPORTIONS & AVOID TALL VERTICAL STRETCHING (CRITICAL):
  * Because there are ${detectedCards} cards side-by-side, each card is narrower horizontally (~20% to 22% canvas width each for 4 cards).
  * Therefore, each card's vertical height MUST ALSO be scaled down proportionately (~32% to 38% canvas height max). They MUST NOT be stretched into overly tall vertical pillars!
  * Card vertical placement: The cards must start at ~38% of canvas height and END by ~60% of canvas height.
  * This guarantees generous vertical space (at least 38% to 42% canvas height) below them for:
    1) Course bullet points (e.g. 2 columns x 2 rows)
    2) Foreground floating elements (e.g. stethoscopes)
    3) WhatsApp contact phone numbers (stacked with matching font sizes)
    4) Instagram & Facebook icons + @handle
    5) PLUS the MANDATORY SAFE MARGIN (respiro de segurança) of at least 8% to 12% below the lowest text!
- ZERO CLIPPING & ZERO OVERCROWDING: All elements must have ample breathing room with zero text or icons touching or glued to borders.`);
    } else {
      blocks.push(`SCENE ENVIRONMENT (NO HUMAN MODEL):
- Clean, refined commercial institutional atmosphere without human models. Full-bleed edge-to-edge depth, architectural lighting, and pristine commercial clarity.`);
    }
  }

  // ── BLOCO 8: LIGHTING AND PHYSICS MAP ──
  const sobriety = config.nivelCriativo ?? 50;
  const sobrietyNote = sobriety < 30 ? " Conservative, clean commercial illumination." : sobriety > 70 ? " Expressive, vibrant rim lighting." : " Balanced studio illumination.";
  if (isLogo) {
    blocks.push(`LIGHTING — Clean studio macro lighting highlighting the contours and finish of the logo emblem. Specular reflections and soft metallic sheen.${sobrietyNote}`);
  } else {
    blocks.push(`LIGHTING — Commercial studio lighting with a directional key light and soft ambient fill.
Key light positioned to sculpt the scene features with soft shadow transitions.
Subtle rim light separates the foreground elements from the background.
Shadows: Soft-edged contact shadows anchoring elements naturally. Deep crevices exhibit controlled black clipping for rich contrast without muddy tones.${sobrietyNote}`);
  }

  // ── BLOCO 9: SOCIAL HEADER NO TOPO (SOMENTE SE CONFIGURADO PARA O TOPO) ──
  const isSocialAtTop = topContactLayers.length > 0 && !userRequestedBottomSocial;
  if (!isLogo && isSocialAtTop && cleanHandle) {
    blocks.push(`TOP SOCIAL MEDIA HEADER (CENTERED AT TOP):
Horizontally centered at the upper section of the layout with at least 16% to 20% margin (breathing room) from the top edge (minimum 550 to 700 pixels down in 4K) — STRICTLY FORBIDDEN from touching or appearing glued to the top border:
- Small, uniform, solid-color circular badges in accent color (${secondaryAccent}) placed side-by-side with clean white glyphs (Instagram camera and Facebook 'f' glyphs ONLY).
- Followed immediately by '${cleanHandle}' in clean, lowercase typography (${isDarkCanvas ? "#FFFFFF" : primaryAccent}).
- STRICT BAN: ZERO TikTok icons, zero unrequested social glyphs.`);
  }

  // ── BLOCO 10: TIPOGRAFIA DE HEADLINE E TÍTULOS ──
  if (!isLogo && headlineLayers.length > 0) {
    const headlineLines = headlineLayers.map((l, idx) => {
      const weightLabel = l.pesoVisual ? ` [Visual Weight: ${l.pesoVisual}/5]` : "";
      const colorDesc = l.cor ? `in ${l.cor}` : (isDarkCanvas ? "in pure solid white (#FFFFFF)" : "in dark contrasting color");
      const posDesc = `[Canvas Zone: ${getPositionDescription(l.posicao)}]`;
      return `  - Headline Line ${idx + 1}: "${l.conteudo}" ${colorDesc} ${posDesc}${weightLabel}`;
    }).join("\n");

    let fontStyleRule = isSansSerif 
      ? `Typography Rules: Render all headlines strictly in modern bold geometric sans-serif (${mainFont}). NO slab serifs, NO traditional serifs, NO slab brackets.`
      : `Typography Rules: Render headlines in refined serif (${mainFont}).`;

    let spatialDirectives = "";
    if (alignmentMode === "left") {
      const rightZoneDesc = hasSubject
        ? `* RIGHT 55% OF CANVAS: Reserved for the human subject / model.`
        : `* CENTRAL & RIGHT CANVAS: Reserved for the scene background and the three (3) horizontal white photo placeholder boxes. ZERO human models!`;
      spatialDirectives = `STRICT SPATIAL ALIGNMENT (LEFT-ALIGNED HEADLINE):
- HEADLINE POSITION: Anchored on the LEFT section (left 45% canvas width with 8% safe margin).
${rightZoneDesc}
- CRITICAL POSITIONING MANDATE: Each text layer MUST be rendered at its exact specified canvas zone (e.g. TOP-LEFT, MIDDLE-LEFT, or as explicitly indicated in each item tag).
- Footer contact info (WhatsApp phone and @ social handle) is exempt from the left column and MUST be anchored at the BOTTOM CENTER.`;
    } else if (alignmentMode === "right") {
      spatialDirectives = `STRICT SPATIAL ALIGNMENT (RIGHT-ALIGNED HEADLINE):
- HEADLINE POSITION: Anchored firmly on the RIGHT SIDE of the canvas (occupying right 40%-50% section).
- Footer contact info (WhatsApp phone and @ social handle) is exempt from the right column and MUST be anchored at the BOTTOM CENTER.`;
    } else {
      spatialDirectives = `STRICT SPATIAL ALIGNMENT (CENTERED / MULTI-ZONE TYPOGRAPHY):
- HEADLINE POSITION: Horizontally centered along the vertical central axis at its designated zone (e.g. TOP-CENTER).
- CRITICAL POSITIONING MANDATE: Each text layer and bullet item MUST be rendered in its designated canvas zone (e.g. TOP-CENTER, MIDDLE-CENTER). DO NOT displace centered text to the left or right borders!`;
    }

    blocks.push(`HEADLINE AND DISPLAY TYPOGRAPHY:
${spatialDirectives}
Display Stack:
${headlineLines}
${fontStyleRule}`);
  }

  // ── BLOCO 11: CONTEÚDO DE CORPO & TEXTO SEAMLESS (SEM RETÂNGULOS/CARDS) ──
  if (!isLogo && (bodyLayers.length > 0 || config.floatingElementsMode !== "off")) {
    const textItems = bodyLayers.map((l) => {
      const weightLabel = l.pesoVisual ? ` [Visual Weight: ${l.pesoVisual}/5]` : "";
      const isCta = (l.tipoBloco || "").toUpperCase() === "CTA" || (l.funcao || "").toLowerCase().includes("cta");
      const isBullet = (l.tipoBloco || "").toUpperCase() === "BULLETS" || (l.funcao || "").toLowerCase().includes("bullet");
      const roleTag = isCta ? "Action Badge" : isBullet ? "List Item" : "Content Text";
      const posDesc = `[Canvas Zone: ${getPositionDescription(l.posicao)}]`;
      return `  - ${roleTag}: "${l.conteudo}" ${posDesc}${weightLabel}`;
    }).join("\n");

    const hasBullets = bodyLayers.some(l => /planejamento|diálogo|estudos|análise|mobilização|técnico|auxiliar|✓|•|-/i.test(l.conteudo));
    let bulletDetail = "";
    if (hasBullets) {
      bulletDetail = `\nBullet points must include individual distinct colorful bullet markers (•) or small clean geometric accents.`;
    }

    let floatingAccentDesc = "";
    if (config.elementosFlutuantes && config.floatingElementsCustom && config.floatingElementsCustom.trim() && config.floatingElementsMode !== "off" && config.floatingElementsMode !== "none") {
      const customElement = config.floatingElementsCustom;
      floatingAccentDesc = `\nFloating 3D Elements:\n- Floating accents (${customElement}) rendered with realistic specular reflections, distinct contrasting colors from the palette, and subtle contact shadow.`;
    }

    const alignmentFollowRule = alignmentMode === "left"
      ? `CRITICAL ALIGNMENT LAW: Body copy and bullet points MUST follow their individual designated canvas zones (e.g. MIDDLE-LEFT or MIDDLE-CENTER) with natural vertical reading flow. (Note: Bottom contact info is anchored separately at the bottom center).`
      : alignmentMode === "right"
      ? `CRITICAL ALIGNMENT LAW: Body copy and bullet points MUST follow their individual designated canvas zones with clean spacing.`
      : `CRITICAL ALIGNMENT LAW: Horizontally centered or positioned according to each item's designated canvas zone with symmetrical breathing room.`;

    blocks.push(`BODY CONTENT & SECONDARY TYPOGRAPHY (SEAMLESS INTEGRATION):
Positioning: Integrated seamlessly directly into the open negative space of the artwork.
${alignmentFollowRule}
CRITICAL MANDATE: All text and bullet items MUST float directly over the scene background with natural contrast and subtle ambient depth.
${textItems || "Clean structured content"}${bulletDetail}${floatingAccentDesc}`);
  }

  // ── BLOCO 11.5: BARRA DE CONTATO & REDES SOCIAIS NO RODAPÉ (MANDATORY BOTTOM CENTER) ──
  const hasBottomContact = bottomContactLayers.length > 0 || userRequestedBottomSocial || (!isSocialAtTop && (cleanHandle || cleanPhone));
  if (!isLogo && hasBottomContact && (cleanPhone || cleanHandle)) {
    const contactColor = isDarkCanvas ? "pure solid white (#FFFFFF)" : primaryAccent;
    const phoneDirective = cleanPhone
      ? `- Phone / WhatsApp: Preceded by a clean, sharp WhatsApp green/white circular icon glyph, followed immediately by "${cleanPhone}" in bold high-contrast typography (${contactColor}).`
      : "";
    const handleDirective = cleanHandle
      ? `- Social Media Handle: Preceded by small, clean Instagram camera and Facebook 'f' circular glyphs placed side-by-side, followed immediately by "${cleanHandle}" in clean modern typography (${contactColor}).`
      : "";

    blocks.push(`FOOTER CONTACT & SOCIAL MEDIA BAR (MANDATORY PLACEMENT: BOTTOM CENTER):
Horizontally centered with generous breathing room, ending at least 16% to 20% ABOVE the absolute bottom edge of the canvas (minimum 550 to 700 pixels above the bottom edge in 4K resolution — NEVER touching, hugging, or glued to the bottom border):
${phoneDirective}
${handleDirective}
- HORIZONTAL PLACEMENT: Positioned together horizontally centered at the bottom (or neatly stacked centered at bottom) with ample breathing room.
- STRICT PROHIBITION:
  * DO NOT place the phone number on the left margin under the bullet points!
  * DO NOT place the social media handle at the top!
  * Both MUST be anchored at the BOTTOM CENTER as explicitly configured!
- STRICT BAN: ZERO TikTok icons, zero unrequested social glyphs.`);
  }

  // ── BLOCO 12: LEI SUPREMA DE COMPOSIÇÃO FULL-BLEED & BANIMENTO DE CARDS ──
  blocks.push(`CRITICAL COMPOSITION & FULL-BLEED LAW (HIGHEST PRIORITY):
- FULL-BLEED EDGE-TO-EDGE ARTWORK: The entire composition, background environment, and scene MUST fill the full canvas edge-to-edge. Never render the artwork as a miniature card sitting inside a border!
- BAN ON UNPROMPTED RECTANGULAR CARDS OR CONTAINERS:
  * NEVER draw an unprompted floating rounded rectangle card, white box, or container in the middle of the canvas UNLESS explicitly requested by the user in their custom directives. If the user explicitly requested white squares, panels, or boxes, you MUST render them faithfully with highest priority!
  * Typography and logos must float seamlessly and cleanly directly over the scene/background with natural contrast and subtle depth.
- PROHIBITION OF COLLAGES & EMPTY PLACEHOLDER BOXES: Do NOT draw empty placeholder frames or unrequested collage grids from reference templates.
- SAFE MARGINS (MANDATORY — NON-NEGOTIABLE):
  * ALL text, logos, icons, contact info, and graphic elements MUST maintain a minimum 16% to 20% safe padding (generous breathing room) from top and bottom canvas borders, and at least 10% from side borders (top, bottom, left, right).
  * NO element may ever touch, be clipped by, or appear glued to the canvas edges.
  * TOP MARGIN: Logo and top header elements MUST start at least 16% to 20% down from the absolute top edge (minimum 550 to 700 pixels in 4K). ZERO elements may touch or hug the top border!
  * BOTTOM MARGIN: Footer contact info (phone, social handle) MUST end at least 16% to 20% above the absolute bottom edge (minimum 550 to 700 pixels in 4K). ZERO elements may touch or hug the bottom border!
  * LEFT/RIGHT MARGINS: Headlines and body text must start/end at least 8% from the side edges.
  * This rule applies to EVERY single element without exception — even decorative accents, icons, and small type.`);

  // ── BLOCO 13: BRAND LOGO / EMBLEMA ──
  if (isLogo) {
    const logoColorTarget = secondaryAccent || primaryAccent || "metallic gold";
    blocks.push(`ISOLATED BRAND LOGO / EMBLEM SPECIFICATION:
- Output: Render ONLY the isolated brand logo/emblem centered on the canvas.
- ABSOLUTE BAN: STRICT PROHIBITION against generating flyers, commercial cards, real estate posters, dollar signs, floating coins, human models, or complex promotional layouts!
- Geometry Preservation: Replicate 100% of the exact geometric shapes, contours, thickness, and lines of the attached logo image.
- Target Color: Render the emblem in ${logoColorTarget} with a clean, luxurious, and sharp finish.`);
  } else if (hasLogo && !isLogoOverlay) {
    const logoTextColor = isDarkCanvas ? "pure solid white (#FFFFFF)" : "brand authentic color";
    blocks.push(`BRAND LOGO & EMBLEM INTEGRATION (EXACTLY ONE SINGLE LOGO — COMPLETE LOCKUP FIDELITY):
- EXACTLY ONE (1) SINGLE LOGO INSTANCE (MANDATORY — NON-NEGOTIABLE):
  * Render EXACTLY ONE (1) single brand logo lockup on the entire canvas, centered horizontally in the top header.
  * ABSOLUTE PROHIBITION AGAINST DUPLICATE LOGOS: ZERO duplicate logos, ZERO twin logos side by side! NEVER render more than one logo on the entire artwork!
- COMPLETE LOCKUP PRESERVATION: The logo asset consists of TWO INTEGRATED VERTICAL ELEMENTS in one unified lockup:
  1) TOP: The brand name "CEPAR" in clean capital serif lettering.
  2) BOTTOM: The coat of arms shield with laurel wreath, book, graduation cap, and pencil.
  * You MUST replicate the COMPLETE lockup together: BOTH the name "CEPAR" at the top AND the emblem shield at the bottom.
  * DO NOT cut off, crop out, or drop the name "CEPAR"! DO NOT mutate or hallucinate the name to "Centro CE-PAR" or anything other than "CEPAR".
- INSTITUTIONAL PLACEMENT: Position the ONE official brand logo centered horizontally in the top header (with 10% to 14% safe top margin). NEVER place the logo in the middle of the body text or floating awkwardly between headline lines!
- ABSOLUTE PROHIBITION against placing the logo touching or glued to the canvas borders or bottom edge (minimum 10% to 14% safe margins).
- EMBLEM & GRAPHIC MARK FIDELITY: Replicate the EXACT graphic mark geometry, shield/escudo contours, laurel wreath, book, graduation cap, and symbols from the attached logo reference image.
- BRAND TYPOGRAPHY: Render the brand name "CEPAR" in ${logoTextColor} with crisp vector sharpness.
- TRANSPARENCY: Render the single logo cleanly floating directly over the canvas environment with sharp, crisp contrast and subtle depth, without any artificial white card, pill box, or sticker background behind it.`);
  } else if (isLogoOverlay) {
    blocks.push(`BRAND LOGO DIRECTIVE:
DIGITAL OVERLAY MODE: Leave the designated logo area clean with ample negative space; the official high-resolution vector logo will be overlaid post-generation.`);
  }

  // ── BLOCO 14: PALETA DE CORES & HARMONIZAÇÃO ──
  blocks.push(`COLOR HARMONY:
- Dominant Atmospheric Tone: ${ambientBg}
- Primary Accent: ${primaryAccent}
- Secondary Accent: ${secondaryAccent}
- Text Legibility: High-contrast readability using white or contrasting brand accents.
- Material Quality: ${resolution} resolution, sharp typography vector edges, zero chromatic aberration.`);

  // ── BLOCO 15: REGRAS ESTRITAS & FINAL CHECK ──
  const antiFontHallucination = isSansSerif ? "slab-serif font, serif font, slab brackets, chunky slab typography, " : "";
  const antiLogoBox = isDarkCanvas ? "white circular badge behind logo, white container box behind logo, dark unreadable logo text on dark background, " : "";
  const antiMetadataLabels = "H1, H2, CTA, Bullets, Headline, Subheadline, [H1], [CTA], [BULLETS], [H2], bracketed tags, metadata labels, technical tags painted as text, ";
  const antiCardBox = userRequestedBoxesOrCards ? "" : "floating rectangular card in center, white card container, rounded rectangle box around text, popup dialog box, central card panel, ";
  const antiHumanSubject = !hasSubject ? "human model, woman, nurse, doctor, person, man, human portrait, female model, photograph of person, " : "";

  blocks.push(`STRICT GOVERNING RULES:
1. LANGUAGE: 100% Brazilian Portuguese (pt-BR). Never translate words to English.
2. TEXT FIDELITY & METADATA BAN: Render ONLY the exact text enclosed in quotation marks! ABSOLUTE BAN: NEVER paint or write words like 'H1', 'H2', 'CTA', 'Bullets', 'Headline', 'Subheadline', '[H1]', '[CTA]', '[BULLETS]' on the image! Those words are technical tags for formatting only, NOT text to be displayed. Erase 100% of old reference text and dates.
3. FONT ENFORCEMENT: Strictly use the specified font family (${mainFont}). Do NOT copy unrequested font styles or serif/slab serifs from the reference layout.
4. ANTI-HALLUCINATION: Zero duplicate words, zero system alignment keywords rendered as text, zero unrequested TikTok icons.
5. NO UNPROMPTED RECTANGULAR CARDS: Typography and elements MUST float directly on the canvas without unprompted card boxes in the center (unless explicitly requested by user).
6. SAFE MARGINS & BORDER PADDING (CRITICAL): Maintain a minimum 10% to 14% safe breathing room from ALL 4 canvas borders. ABSOLUTE BAN on gluing, cramming, or slicing text, logos, icons, or contact badges against the top, bottom, left, or right canvas edges! Every element must have generous visual breathing space around it — nothing should ever feel crammed or pushed against the border.
7. TEXT ALIGNMENT & CONTACT BAR: If left alignment ('Esquerda') is selected, the headlines and bullet items MUST be anchored flush-left on the left side of the canvas. Contact elements (WhatsApp phone and @ social handle) marked for bottom MUST be anchored at the BOTTOM CENTER with their respective WhatsApp, Instagram, and Facebook icons.
8. SUBJECT CONTROL: ${hasSubject ? "Preserve subject photographic fidelity." : "ZERO human models, ZERO women, ZERO nurses! Do NOT generate any people. Render the requested three (3) white photo placeholder boxes side-by-side in the middle."}`);

  const negPrompt = config.negativePrompt?.trim()
    ? config.negativePrompt
    : `duplicate logo, two logos, multiple logos, twin logos, double logo, repeated brand emblem, two crests, floating duplicate logo, ${antiHumanSubject}${antiCardBox}${antiMetadataLabels}${antiFontHallucination}${antiLogoBox}distorted logo, stretched logo, squashed logo, squished logo, flattened logo, widened logo, aspect ratio distortion, anamorphic distortion, stretched face, squashed face, black text on dark background, unreadable text, TikTok icon, blurry text, displaced elements, extra limbs, extra fingers, three arms, floating hands, low resolution.`;

  blocks.push(`NEGATIVE PROMPT:\n${negPrompt}`);

  // ── FINAL CHECK ──
  const finalCheckList: string[] = [];
  if (hasSubject) {
    finalCheckList.push("Subject's face, skin, hair, and features match Image 1 with 100% fidelity — nothing invented or retouched.");
    finalCheckList.push("Anatomy is flawless: exactly 2 arms, 2 legs, 2 hands, 5 fingers each.");
  }
  finalCheckList.push("Composition is full-bleed edge-to-edge with NO central card or rectangular container box around text.");
  finalCheckList.push(`Aspect ratio ${ratio}. Lossless quality ${resolution}.`);
  finalCheckList.push("SAFE MARGINS VERIFIED: All text, logos, icons, and contact elements have at least 10% breathing room from all 4 canvas edges — nothing touches or is glued to any border.");
  blocks.push(`FINAL CHECK — ${finalCheckList.join(" ")}`);

  return blocks.join("\n\n");
};

/**
 * Diretriz Suprema do Sistema (Instrução da IA)
 */
export const buildMasterSystemInstruction = (config: ProjectConfig): string => {
  return `ROLE: Supreme Creative Director & Master Generative Art Director — Photographic & Commercial Advertising Architecture.

CORE DIRECTIVES:
1. FIDELITY TO REFERENCE: Replicate layout geometry, typography weights, color palettes, and spatial hierarchy from attached references with 100% fidelity.
2. TEXT INTEGRITY & BAN ON LABELS: Render custom text layers cleanly in pt-BR with crisp edges. STRICT PROHIBITION: Render ONLY the clean text inside quotation marks! NEVER paint technical metadata labels such as 'H1', 'H2', 'CTA', 'Bullets', 'Headline', '[H1]', '[CTA]', '[BULLETS]' on the graphic canvas. Never print font family names or system alignment words.
3. ABSOLUTE BAN ON FLOATING CARDS/BOXES: NEVER draw a floating white card, rounded rectangle container, or box in the center enclosing text. All text and elements must float seamlessly over the full-bleed artwork.
4. LOGO CLONING: When logo image is attached, replicate the exact graphical mark with original colors, adapting text contrast dynamically to the background without background container boxes.
5. PHOTO-REALISM: Biological skin realism with 3-layer subsurface scattering. Zero AI beauty filters, zero plastic smoothing.
6. ANATOMY: Exactly 2 arms, 2 legs, 2 hands with 5 fingers each.
7. ANTI-HALLUCINATION: Never invent unrequested dates, text, or social media icons (NO TikTok).`;
};
