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
  const hasSubject = !isLogo && !config.desativarSujeito && !config.noPeople;

  // Extração dinâmica de camadas de texto
  const rawLayers = (config.camadasTexto || [])
    .map(l => ({ ...l, conteudo: sanitizeText(l.conteudo) }))
    .filter(l => l.conteudo && l.conteudo.trim() && !/^(centro|esquerda|direita)$/i.test(l.conteudo.trim()));

  // Extração dinâmica de @handle social
  const providedHandleLayer = rawLayers.find(l => l.conteudo && l.conteudo.includes("@"))?.conteudo;
  const allTextFields = `${config.additionalPrompt || ""} ${config.promptCenario || ""}`;
  const userHasProvidedHandle = !!providedHandleLayer || allTextFields.includes("@");
  const cleanHandle = (providedHandleLayer || (allTextFields.match(/@[a-zA-Z0-9._-]+/)?.[0]) || "").toLowerCase();

  // Cores dinâmicas do projeto
  const ambientBg = config.cores?.ambiente || (isLogo ? "#0A0A0A" : "#0d1e49");
  const primaryAccent = config.cores?.recorte || "#128ab6";
  const secondaryAccent = config.cores?.complementar || "#ffffff";
  const isDarkCanvas = /^#[0-3]|^#0[0-9a-fA-F]{5}/.test(ambientBg);

  // Categorização dinâmica de títulos e corpo
  const headlineLayers = rawLayers.filter(l => !l.conteudo.includes("@") && (l.funcao?.includes("Headline") || l.funcao?.includes("Título") || rawLayers.indexOf(l) === 0));
  const bodyLayers = rawLayers.filter(l => !l.conteudo.includes("@") && (!l.funcao?.includes("Headline") && !l.funcao?.includes("Título") && rawLayers.indexOf(l) > 0));

  // Fonte primária configurada no projeto
  const mainFont = headlineLayers[0]?.fonte || rawLayers[0]?.fonte || "Montserrat";
  const isSansSerif = !/serif|cinzel|playfair|bodoni|garamond/i.test(mainFont);

  // Determinação antecipada do modo de alinhamento para balanceamento espacial estrito
  const rawTypoPos = (config.typographyPosition || "").toLowerCase();
  const anyBlockLeft = (config.camadasTexto || []).some((c: any) => /left|esq/i.test(c.posicao || ""));
  const anyBlockRight = (config.camadasTexto || []).some((c: any) => /right|dir/i.test(c.posicao || ""));
  let alignmentMode: "left" | "right" | "center" = "center";
  if (rawTypoPos.includes("esq") || rawTypoPos.includes("left") || anyBlockLeft) {
    alignmentMode = "left";
  } else if (rawTypoPos.includes("dir") || rawTypoPos.includes("right") || anyBlockRight) {
    alignmentMode = "right";
  }

  const userRequestedBoxesOrCards = /quadrad|box|card|caixa|ret[âa]ngul|painel|container/i.test(config.additionalPrompt || "");

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
  if (hasLogo && !isLogoOverlay) {
    imageBindingRules.push("- SWAP SLOT — THE BRANDING & LOGO FIDELITY: Every logo, coat of arms, and insignia comes from the reference files supplied. The reference logo contains the COMPLETE brand lockup: BOTH the brand name 'CEPAR' in clean capital serif typography at the top AND the coat of arms emblem (shield, laurel wreath, open book, graduation cap, pencil) below it. You MUST replicate the ENTIRE lockup together. NEVER crop out, cut off, or drop the name 'CEPAR'! NEVER alter or hallucinate the name (do not change 'CEPAR' to 'Centro CE-PAR'). Replicate 100% of the graphic mark geometry with the requested colors. Position the complete logo in the institutional header (top-left or top-center with safe margin) OR in the footer endorsement bar. NEVER place the logo in the middle under headlines.");
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
    blocks.push(`THE READING — This image is built on visual clarity, dynamism, and photographic conviction. The subject is naturally integrated with the environment and lighting, while all typography and graphic elements float seamlessly across the canvas with generous breathing room and zero artificial borders.`);
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
    blocks.push(`HERO EFFECT — MATERIAL PHYSICS AND TACTILE TEXTURE:
- Skin: Rendered as real camera captures living human skin. 3-layer Subsurface Scattering (epidermis, dermis, subcutaneous fat) allows light to penetrate and scatter naturally in lit areas (forehead, cheekbones, nose). Pores and fine surface micro-displacement resolved at plane of sharpness. Vellus hairs catch raking light as fine bright filaments. Zero plastic smoothing, zero beauty filters.
- Fabrics: Authentic tactile materials. Matte cotton twills, crisp pressed shirt collars, textured knitwear with individual thread definition. Fabrics absorb and scatter light naturally without fake plastic sheen.
- Lighting Interaction: Specular highlights remain small and controlled. Shadows stay open with readable detail in folds rather than collapsing into flat black voids.`);
  }

  // ── BLOCO 7: POSE & EXPRESSION ──
  if (!isLogo && hasSubject) {
    const pose = config.poseDescription || "Professional, engaging, composed posture naturally integrated into the composition.";
    const subjectSpatialPlacement = alignmentMode === "left"
      ? "strictly on the RIGHT SIDE of the frame (occupying the right 55% of canvas width, facing slightly inward, leaving the left 45% of the canvas completely free for the left-aligned typography column)"
      : alignmentMode === "right"
      ? "strictly on the LEFT SIDE of the frame (occupying the left 55% of canvas width, facing slightly inward, leaving the right 45% of the canvas completely free for the right-aligned typography column)"
      : `at ${config.positioning?.toLowerCase() || "center"} of the frame`;
    blocks.push(`POSE & SPATIAL PLACEMENT — Standing or seated composedly ${subjectSpatialPlacement}. ${pose} Weight settled, shoulders relaxed and dropped. Torso naturally oriented with subtle organic angle.`);
    blocks.push(`EXPRESSION — Genuine, confident, approachable expression. The brows sit level and untensed. The eyes are warm, open and steady, holding the lens with clear catchlights. The mouth features an authentic, unforced expression engaging the cheeks with subtle natural creasing at the eye corners. The face reads as human, charismatic, and authentic.`);
  }

  // ── BLOCO 8: LIGHTING AND PHYSICS MAP ──
  const sobriety = config.nivelCriativo ?? 50;
  const sobrietyNote = sobriety < 30 ? " Conservative, clean commercial illumination." : sobriety > 70 ? " Expressive, vibrant rim lighting." : " Balanced studio illumination.";
  if (isLogo) {
    blocks.push(`LIGHTING — Clean studio macro lighting highlighting the contours and finish of the logo emblem. Specular reflections and soft metallic sheen.${sobrietyNote}`);
  } else {
    blocks.push(`LIGHTING — Commercial studio lighting with a directional key light and soft ambient fill.
Key light positioned to sculpt the subject's features with soft shadow transitions under the brow and nose.
Subtle rim light separates the subject and foreground elements from the background.
Shadows: Soft-edged contact shadows anchoring elements naturally. Deep crevices exhibit controlled black clipping for rich contrast without muddy tones.${sobrietyNote}`);
  }

  // ── BLOCO 9: SOCIAL HEADER (SE INFORMADO) ──
  if (!isLogo && userHasProvidedHandle && cleanHandle) {
    blocks.push(`TOP SOCIAL MEDIA HEADER (CENTERED AT TOP):
Horizontally centered at the upper section of the layout with at least 8% margin from the top edge:
- Small, uniform, solid-color circular badges in accent color (${secondaryAccent}) placed side-by-side with clean white glyphs (Instagram camera and Facebook 'f' glyphs ONLY).
- Followed immediately by '${cleanHandle}' in clean, lowercase typography (${isDarkCanvas ? "#FFFFFF" : primaryAccent}).
- STRICT BAN: ZERO TikTok icons, zero unrequested social glyphs.`);
  }

  // ── BLOCO 10: TIPOGRAFIA DE HEADLINE E TÍTULOS ──
  if (!isLogo && headlineLayers.length > 0) {
    const headlineLines = headlineLayers.map((l, idx) => {
      const weightLabel = l.pesoVisual ? ` [Visual Weight: ${l.pesoVisual}/5]` : "";
      const colorDesc = l.cor ? `in ${l.cor}` : (isDarkCanvas ? "in pure solid white (#FFFFFF)" : "in dark contrasting color");
      return `  - Headline Line ${idx + 1}: "${l.conteudo}" ${colorDesc}${weightLabel}`;
    }).join("\n");

    let fontStyleRule = isSansSerif 
      ? `Typography Rules: Render all headlines strictly in modern bold geometric sans-serif (${mainFont}). NO slab serifs, NO traditional serifs, NO slab brackets.`
      : `Typography Rules: Render headlines in refined serif (${mainFont}).`;

    let spatialDirectives = "";
    if (alignmentMode === "left") {
      spatialDirectives = `STRICT SPATIAL ALIGNMENT & TWO-COLUMN CANVAS DIVISION (HIGHEST COMPOSITION LAW):
- ALIGNMENT: STRICTLY LEFT-ALIGNED (FLUSH LEFT).
- TWO-COLUMN SPATIAL DIVISION (NON-NEGOTIABLE):
  * LEFT 45% OF CANVAS: Reserved EXCLUSIVELY for all typography (Headlines, Subheadlines, Bullets, CTA button). Every line must start flush from the left margin (8% safe margin).
  * RIGHT 55% OF CANVAS: Reserved for the human subject / model (e.g. nurse/doctor/person).
- ABSOLUTE PROHIBITIONS:
  * NEVER place the headline in the horizontal center! NEVER right-align! DO NOT scatter headlines across the center or right!
  * The human subject / model is STRICTLY FORBIDDEN from being placed on the left side of the frame, because the subject would displace the left-aligned typography.
  * DO NOT push bullet points or CTA to the right or center. The entire text column must remain anchored flush-left.`;
    } else if (alignmentMode === "right") {
      spatialDirectives = `STRICT SPATIAL ALIGNMENT & TWO-COLUMN CANVAS DIVISION (HIGHEST COMPOSITION LAW):
- ALIGNMENT: STRICTLY RIGHT-ALIGNED (FLUSH RIGHT).
- CANVAS POSITION: The entire typography headline stack MUST be anchored firmly on the RIGHT SIDE of the canvas, occupying the right 40% to 50% horizontal area.
- PROHIBITION: NEVER place the headline in the center! NEVER left-align!
- BALANCE & COMPOSITION: The main subject or graphic imagery must balance on the LEFT side to leave clean, open negative space on the RIGHT for this right-aligned typography stack.`;
    } else {
      spatialDirectives = `STRICT SPATIAL ALIGNMENT:
- ALIGNMENT: HORIZONTALLY CENTERED.
- CANVAS POSITION: Centered along the vertical central axis of the canvas with balanced symmetrical visual weight.`;
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
      const roleTag = isCta ? "Action Button / Contact" : isBullet ? "List Item" : "Content Text";
      return `  - ${roleTag}: "${l.conteudo}"${weightLabel}`;
    }).join("\n");

    const hasBullets = bodyLayers.some(l => /planejamento|diálogo|estudos|análise|mobilização|✓|•|-/i.test(l.conteudo));
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
      ? `CRITICAL ALIGNMENT LAW: All body copy, bullet points, and call-to-action badges MUST be strictly LEFT-ALIGNED (flush-left) directly beneath the headline on the LEFT side of the canvas (left 45% margin), perfectly continuing the left-aligned vertical reading flow. DO NOT center or right-align body text!`
      : alignmentMode === "right"
      ? `CRITICAL ALIGNMENT LAW: All body copy, bullet points, and call-to-action badges MUST be strictly RIGHT-ALIGNED (flush-right) directly beneath the headline on the RIGHT side of the canvas (right 45% margin). DO NOT center or left-align body text!`
      : `CRITICAL ALIGNMENT LAW: Horizontally centered directly beneath the headline stack with symmetrical breathing room.`;

    blocks.push(`BODY CONTENT & SECONDARY TYPOGRAPHY (SEAMLESS INTEGRATION):
Positioning: Integrated seamlessly directly into the open negative space of the artwork.
${alignmentFollowRule}
CRITICAL MANDATE: All text, bullet items, and contact badges MUST float directly over the scene background with natural contrast and subtle ambient depth.
${textItems || "Clean structured content"}${bulletDetail}${floatingAccentDesc}`);
  }

  // ── BLOCO 12: LEI SUPREMA DE COMPOSIÇÃO FULL-BLEED & BANIMENTO DE CARDS ──
  blocks.push(`CRITICAL COMPOSITION & FULL-BLEED LAW (HIGHEST PRIORITY):
- FULL-BLEED EDGE-TO-EDGE ARTWORK: The entire composition, background environment, and scene MUST fill the full canvas edge-to-edge. Never render the artwork as a miniature card sitting inside a border!
- BAN ON UNPROMPTED RECTANGULAR CARDS OR CONTAINERS:
  * NEVER draw an unprompted floating rounded rectangle card, white box, or container in the middle of the canvas UNLESS explicitly requested by the user in their custom directives. If the user explicitly requested white squares, panels, or boxes, you MUST render them faithfully with highest priority!
  * Typography and logos must float seamlessly and cleanly directly over the scene/background with natural contrast and subtle depth.
- PROHIBITION OF COLLAGES & EMPTY PLACEHOLDER BOXES: Do NOT draw empty placeholder frames or unrequested collage grids from reference templates.
- SAFE MARGINS: Maintain at least 8% to 12% safe padding from all 4 canvas borders. Elements must never touch or be clipped by the edges.`);

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
    blocks.push(`BRAND LOGO & EMBLEM INTEGRATION (COMPLETE LOCKUP FIDELITY & SAFE MARGINS):
- COMPLETE LOCKUP PRESERVATION: The logo asset consists of TWO INTEGRATED VERTICAL ELEMENTS in one unified lockup:
  1) TOP: The brand name "CEPAR" in clean capital serif lettering.
  2) BOTTOM: The coat of arms shield with laurel wreath, book, graduation cap, and pencil.
  * You MUST replicate the COMPLETE lockup together: BOTH the name "CEPAR" at the top AND the emblem shield at the bottom.
  * DO NOT cut off, crop out, or drop the name "CEPAR"! DO NOT mutate or hallucinate the name to "Centro CE-PAR" or anything other than "CEPAR".
- INSTITUTIONAL PLACEMENT: Position the official brand logo/emblem in the top header (top-left or top-center with safe margin) OR in the footer endorsement bar. NEVER place the logo in the middle of the body text or floating awkwardly between headline lines!
- ABSOLUTE PROHIBITION against placing the logo touching or glued to the canvas borders or bottom edge (minimum 8% to 10% safe margins).
- EMBLEM & GRAPHIC MARK FIDELITY: Replicate the EXACT graphic mark geometry, shield/escudo contours, laurel wreath, book, graduation cap, and symbols from the attached logo reference image.
- BRAND TYPOGRAPHY: Render the brand name "CEPAR" in ${logoTextColor} with crisp vector sharpness.
- TRANSPARENCY: Render the logo cleanly floating directly over the canvas environment with sharp, crisp contrast and subtle depth, without any artificial white card, pill box, or sticker background behind it.`);
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

  blocks.push(`STRICT GOVERNING RULES:
1. LANGUAGE: 100% Brazilian Portuguese (pt-BR). Never translate words to English.
2. TEXT FIDELITY & METADATA BAN: Render ONLY the exact text enclosed in quotation marks! ABSOLUTE BAN: NEVER paint or write words like 'H1', 'H2', 'CTA', 'Bullets', 'Headline', 'Subheadline', '[H1]', '[CTA]', '[BULLETS]' on the image! Those words are technical tags for formatting only, NOT text to be displayed. Erase 100% of old reference text and dates.
3. FONT ENFORCEMENT: Strictly use the specified font family (${mainFont}). Do NOT copy unrequested font styles or serif/slab serifs from the reference layout.
4. ANTI-HALLUCINATION: Zero duplicate words, zero system alignment keywords rendered as text, zero unrequested TikTok icons.
5. NO UNPROMPTED RECTANGULAR CARDS: Typography and elements MUST float directly on the canvas without unprompted card boxes in the center (unless explicitly requested by user).
6. SAFE MARGINS & BORDER PADDING: Maintain at least 8% to 12% safe padding from all 4 borders. ABSOLUTE BAN on gluing or slicing text, logos, or contact badges against canvas edges!
7. TEXT ALIGNMENT ENFORCEMENT: If left alignment ('Esquerda') is selected, ALL text elements (headline, bullet items, CTA) MUST be anchored flush-left on the left 45% of the canvas. The subject MUST balance on the right 55%. Centering left-aligned text or moving it to the right is STRICTLY FORBIDDEN.`);

  const negPrompt = config.negativePrompt?.trim()
    ? config.negativePrompt
    : `${antiCardBox}${antiMetadataLabels}${antiFontHallucination}${antiLogoBox}distorted logo, black text on dark background, unreadable text, TikTok icon, blurry text, displaced elements, extra limbs, extra fingers, three arms, floating hands, low resolution.`;

  blocks.push(`NEGATIVE PROMPT:\n${negPrompt}`);

  // ── FINAL CHECK ──
  const finalCheckList: string[] = [];
  if (hasSubject) {
    finalCheckList.push("Subject's face, skin, hair, and features match Image 1 with 100% fidelity — nothing invented or retouched.");
    finalCheckList.push("Anatomy is flawless: exactly 2 arms, 2 legs, 2 hands, 5 fingers each.");
  }
  finalCheckList.push("Composition is full-bleed edge-to-edge with NO central card or rectangular container box around text.");
  finalCheckList.push(`Aspect ratio ${ratio}. Lossless quality ${resolution}.`);
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
