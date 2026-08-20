import { ProjectConfig } from "../types/designBuilder";

/**
 * Builds the Master Creative Prompt from design builder configuration state.
 * EXPERT DESIGNER "FLYER BR" SYSTEM.
 * This prompt engine thinks like a top-tier Brazilian Event/Commercial Flyer Designer.
 * It perfectly blends typography, subject, lighting, floating elements, and reference images
 * into a single cohesive, high-end masterpiece prompt.
 */
export const buildMasterPrompt = (config: ProjectConfig): string => {
  const isProduct = config.tipoPainel === "PRODUCT";
  const isLogo = config.tipoPainel === "LOGO";
  const isGcTv = config.tipoPainel === "GC_TV";
  const isFoto = config.tipoPainel === "FOTO";
  
  // 1. MASTER DIRECTIVE & STYLE
  let promptParts: string[] = [
    isLogo ? "Professional logo design masterpiece, vector graphic style, high contrast, clean minimalist, flat, scalable, white background, high quality, flawless colors, no pixelation."
           : isGcTv ? "Professional Television Broadcast Graphic (GC / Lower Third / Character Generator) overlay for TV shows, news, sports, and podcasts. Ultra-high resolution 8K, crisp broadcast typography, modern lower-third graphic bar, high-contrast TV studio production value, flawless colors, no pixelation."
           : isFoto ? "Professional Ultra-Realistic Studio Portrait & Editorial Masterpiece. Shot on Sony A1 / Canon EOS R5 with 85mm f/1.4 GM lens at f/2.0, 3-layer Subsurface Scattering (SSS) on skin, micro-displacement pore detail, natural tactile skin texture, authentic specular highlights, precise catchlights in eyes, zero beauty filter, zero plastic smoothing. True cinematic depth, directional studio lighting with controlled black clipping, and professional color grading."
           : "Premium agency graphic design and cinematic photography masterpiece. 8K resolution, photorealistic textures, 3-layer Subsurface Scattering on skin, tactile fabric textures, cinematic depth of field, sharp focus, professional color grading, flawless colors, zero AI artifacts.",
  ];

  // CINEMATOGRAPHY & LIGHT PHYSICS DIRECTIVES
  promptParts.push(`[OPTICS & SENSOR SIMULATION] Full-frame camera sensor with 85mm f/1.4 G-Master prime lens, tack-sharp focal plane on subject's eyes, organic circular bokeh with natural cat-eye edge falloff, zero chromatic distortion, zero synthetic smoothing.
[LIGHTING & DERMAL PHYSICS] 3-layer Subsurface Scattering (epidermis, dermis, subcutaneous) for authentic biological skin translucency. Micro-displacement pores and fine skin grain visible under directional key light. Strategic chiaroscuro with controlled black clipping in deepest shadow crevices (zero fill light, 100% shadow opacity for deep contrast). Authentic tactile fabric friction (wool knits, cotton twill, linen textures).
[ANATOMY & KINESIOLOGY LAW] Strictly normal, anatomically correct human proportions: EXACTLY 2 arms, 2 hands with 5 fingers each, natural joint articulation. Body-to-head torque with subtle tension in neck muscles (sternocleidomastoid) aligning gaze vector directly with optical lens axis. Tactile dermal deformation where fingers touch fabric, objects, or skin.`);

  // 2. VISUAL AESTHETICS & CREATIVE LEVEL
  const creativeWeight = config.nivelCriativo ?? 50;
  if (creativeWeight < 30) {
    promptParts.push("Minimalist, clean, luxury corporate design, refined.");
  } else if (creativeWeight < 70) {
    promptParts.push("Dynamic, vibrant, balanced commercial advertisement.");
  } else {
    promptParts.push("Aggressive 'Flyer BR' style, high contrast, stunning glow effects, intricate details, explosive energy.");
  }

  if (config.estilosVisuais && config.estilosVisuais.length > 0) {
    promptParts.push(`Themes: ${config.estilosVisuais.join(", ")}.`);
  }

  if (config.enableEstiloVisual && config.estiloVisualCustom?.trim()) {
    promptParts.push(`Custom Aesthetic Atmosphere: ${config.estiloVisualCustom.trim()}.`);
  }

  if (isGcTv) {
    promptParts.push("TV Broadcast Overlay Specifications: Lower Third TV Bar / Gerador de Caracteres. Include a clean graphical banner bar across the lower section of the screen, with crisp high-legibility broadcast typography for presenter/guest names, titles, badges, and TV station branding.");
  }

  // 3. DIMENSIONS & COMPOSITION
  const ratio = config.dimensao || "1:1";
  promptParts.push(`Aspect ratio: ${ratio}. Target render fidelity: ${config.resolucao || "1K"} HD.`);

  if (config.formatoExportacao === "PNG") {
    promptParts.push("Color fidelity: 32-bit RGBA depth, ultra-smooth lossless gradient transitions, high dynamic range color precision.");
  }

  // 4. SUBJECT / PRODUCT FOCUS (Positioning, Framing, Gender, Pose)
  if (isLogo) {
    promptParts.push(`Central subject: Brand name '${config.additionalPrompt || "Company Name"}', iconic logo concept.`);
  } else if (config.desativarSujeito) {
    promptParts.push("Focus: Background atmosphere, typography, atmospheric elements.");
  } else {
    const poseText = config.poseDescription?.trim() ? `, Pose/Clothing: ${config.poseDescription.trim()}` : "";
    let finalPlacement = config.positioning ? config.positioning.toUpperCase() : "CENTER";
    if (config.composicaoCustom?.trim()) {
      if (/centro|center/i.test(config.composicaoCustom)) finalPlacement = "CENTER";
      else if (/esquerda|left/i.test(config.composicaoCustom)) finalPlacement = "LEFT";
      else if (/direita|right/i.test(config.composicaoCustom)) finalPlacement = "RIGHT";
    }
    const posText = `, Horizontal Placement: Place the subject strictly in the ${finalPlacement} of canvas`;
    const compText = (config.composicaoCustom?.trim() || config.composicao) ? `, Shot Framing & Custom Composition: ${config.composicaoCustom?.trim() || config.composicao}` : "";
    const genderText = config.multiplesPersons 
      ? `, Multiple Subjects: ${config.gendersDescription?.trim() || config.gender || 'Group'}` 
      : (config.gender ? `, Gender: ${config.gender}` : "");

    promptParts.push(`Central Subject & Framing Directives${poseText}${posText}${compText}${genderText}: The exact person/people/subjects from the attached reference photo(s) ('Referência do Sujeito Principal' / 'Referência de Design/Layout'). ABSOLUTE CRITICAL FACIAL IDENTITY, INDIVIDUAL EXPRESSION & POSE PRESERVATION MANDATE: Preserve 100% of the EXACT faces, facial features, expressions, eyes, nose, mouth posture, individual smile state (do NOT force a smile or teeth on any individual with a closed-mouth or subtle expression), hair, skin tone, clothing, physical body poses, spatial ordering, and exact positions of ALL people/subjects in the reference photo. YOU ARE STRICTLY FORBIDDEN from altering, redesigning, changing facial features, changing individual facial expressions, swapping faces, recreating different individuals, changing poses, or moving people to different positions! Each person MUST maintain their exact individual facial expression and mouth appearance as shown in the reference photo.`);
  }

  // 5. SCENARIO / BACKGROUND ENVIRONMENT
  const hasRefImage = !!(config.designRefBase64 || config.useEnvRef || config.cenarioBase64 || (config.designRefsList && config.designRefsList.length > 0) || (config.cenariosBase64List && config.cenariosBase64List.length > 0));

  if (isLogo) {
    promptParts.push("Background: Solid white, clean and minimalist.");
  } else if (hasRefImage) {
    const isExplicitScenarioPhoto = !!(config.cenarioBase64 || (config.cenariosBase64List && config.cenariosBase64List.length > 0) || config.useEnvRef);
    const cenarioText = config.promptCenario?.trim() ? ` Additional background details: ${config.promptCenario.trim()}.` : "";
    
    if (isExplicitScenarioPhoto) {
      promptParts.push(`Background & Environment: STRICT ATTACHED SCENARIO PHOTO USE MANDATE: You MUST render and use the EXACT background scene, room, landscape, architecture, texture, and environment from the attached scenario reference image ('Referência de Cenário' / 'Additional Scenario Reference'). YOU ARE ABSOLUTELY FORBIDDEN FROM HALLUCINATING, INVENTING, OR GENERATING A RANDOM OR NEW BACKGROUND. Place the subjects and texts directly in front of the exact backdrop from the attached scenario image.${cenarioText}`);
    } else {
      promptParts.push(`Background & Environment: STRICT ORIGINAL BACKGROUND & ROOM PRESERVATION MANDATE: Preserve 100% of the exact original background scene, room, walls, architecture, furniture, textures, and lighting from the attached reference photo ('Referência de Design/Layout' / 'Referência de Cenário'). Do NOT replace, change, redesign, or substitute the background with a new generated room, studio set, or different backdrop! Keep the exact same room, walls, and setting from the reference photo, applying ONLY the specific edits requested.${cenarioText}`);
    }
  } else if (config.promptCenario?.trim()) {
    promptParts.push(`Background: ${config.promptCenario.trim()}.`);
  } else {
    promptParts.push("Background: A completely flat, uniform digital graphic design color fill. Do NOT render the background as a 3D scene, studio, or photographic backdrop. It must be a single, solid, pixel-perfect hex color block, completely flat, with no textures, no grain, no noise, no gradients, no lighting effects, no shading, no seams, and no artifacts.");
  }

  // 6. LIGHTING & COLOR GRADING
  if (config.coresAutomaticas) {
    promptParts.push("Lighting/Colors: Cohesive, professional grading, balanced lighting for the subject only.");
  } else {
    promptParts.push(`Lighting/Colors & Palette: The primary background color and overall ambient light of the entire composition MUST BE EXACTLY HEX ${config.cores?.ambiente || "#000000"}. The rim lighting, highlights, contour glow, and laser highlights on the subject MUST BE EXACTLY HEX ${config.cores?.recorte || "#ffffff"}. The auxiliary elements, glows, and secondary lights MUST BE EXACTLY HEX ${config.cores?.complementar || "#c5a880"}. Create a high-contrast theme strictly using this custom palette: ${config.cores?.ambiente || "#000000"} (background/ambient), ${config.cores?.recorte || "#ffffff"} (rim lights/accents), and ${config.cores?.complementar || "#c5a880"} (secondary glows).`);
  }
  if (config.corDominante && config.corDominante !== "#000000" && config.corDominante !== "transparent") {
    promptParts.push(`Color Palette Dominant override: The dominant theme color, main background color, AND any text container box backgrounds MUST BE EXACTLY HEX ${config.corDominante}. Apply this specific hex value as the primary background color and container fill color with high, rich vibrance and zero color drift. Do not deviate from this exact hex value.`);
  }

  // 7. ATMOSPHERIC GRADIENTS, BLUR & FLOATING DEPTH ELEMENTS
  if (config.degradeLeitura) {
    promptParts.push("Typography Contrast Vignette: Render a smooth, high-contrast dark vignette gradient overlay behind text areas in the footer/header to guarantee 100% legibility.");
  }
  if (config.lateralGradient) {
    promptParts.push("Side Vignette Shadows: Render soft dark gradient shadow borders along the left and right edges for cinematic framing.");
  }
  if (config.enableBlur) {
    promptParts.push("Depth of Field: Apply soft background depth-of-field blur behind the subject to create sharp visual separation.");
  }
  if (config.floatingElementsMode === "custom" && config.floatingElementsCustom?.trim()) {
    promptParts.push(`Floating Depth Elements: ${config.floatingElementsCustom.trim()}.`);
  } else if (config.floatingElementsMode === "auto") {
    promptParts.push("Floating Depth Elements: Render subtle thematic floating elements (if any) with moderation for realistic depth. DO NOT render particles, sparkles, dust, embers, confetti, glitter, or lens flares.");
  }

  // Helper to sanitize placeholder brackets
  const sanitizeText = (str?: string): string => {
    if (!str) return "";
    let cleaned = str.replace(/\[(headline|subtítulo|subtitulo|chamada|texto|cta|inserir|digite|seu texto|sua frase|conteúdo|conteudo|rodapé|rodape|logo|logotipo|imagem|nome|data|telefone|whatsapp|instagram|endereço|endereco|título|titulo|apoio|secundári[oa]|principal|slogan|tagline|description|title|subtitle|footer|header|body|content|image|date|phone|address|name|your text|insert|type)[^\]]*\]/gi, '').trim();
    if (/^\[.*\]$/.test(cleaned) || /^\[.*\]$/.test(str.trim())) return "";
    const purePlaceholders = /^(headline principal|chamada secund[áa]ria|texto de apoio|rodap[ée]|subt[ií]tulo|cta|call to action|seu t[ií]tulo|seu texto|inserir texto)$/i;
    if (purePlaceholders.test(cleaned)) return "";
    return cleaned;
  };

  // 8. TYPOGRAPHY & TEXT LAYOUT (With Exact Font Family, Hex Colors, Global Alignment & Layer Order)
  if (config.camadasTexto && config.camadasTexto.length > 0) {
    const activeLayers = config.camadasTexto
      .map(l => ({ ...l, conteudo: sanitizeText(l.conteudo) }))
      .filter(l => l.conteudo?.trim());

    if (activeLayers.length > 0) {
      const globalPosText = config.typographyPosition ? `Global Alignment: ${config.typographyPosition.toUpperCase()}` : "Global Alignment: CENTERED";
      const formattedTexts = activeLayers.map((l, idx) => {
        const funcao = l.funcao ? `[${l.funcao.toUpperCase()}]` : `[CAMADA #${idx + 1}]`;
        const fontStr = l.fonte ? `, Font style: "${l.fonte}"` : '';
        const colorStr = l.cor ? `, Hex Color: ${l.cor}` : '';
        return `Layer #${idx + 1} ${funcao}${fontStr}${colorStr}: "${l.conteudo.trim()}"`;
      }).join("\n");
      
      promptParts.push(`\n=== MANDATORY CUSTOM TEXT LAYERS (EXACT FONT, COLOR, ORDER & ALIGNMENT) ===\n${globalPosText}\nRender ONLY these custom text layers in their EXACT numerical order:\n${formattedTexts}\nSTRICT FONT FAMILY & COLOR COMPLIANCE MANDATE: You MUST apply the specified Font style for each text layer (the font name is only a STYLING DIRECTIVE for the letterforms — the font name as a WORD must NEVER be printed, written, or rendered as text on the canvas) and use the exact Hex Text Color for the text glyphs. Render Layer #1 as the primary top headline, Layer #2 below as subtitle/detail, etc. Maintain generous line spacing.\nTEXT LANGUAGE MANDATE: ALL text rendered on the canvas MUST be written in BRAZILIAN PORTUGUESE, exactly as supplied by the client (which is already in Portuguese). NEVER translate the supplied texts, NEVER mix English words into the supplied texts, and NEVER add English filler words like "PREMIUM", "LIVE", "NEW", "BEST", "NOW", "SALE", "SPECIAL" or any other English words UNLESS the client's supplied text explicitly includes them.\nCRITICAL TEXT OVERWRITE RULE: You MUST completely ERASE and OVERWRITE 100% of original text, titles, dates, handles, and numbers from the Design Layout Reference image. Do NOT keep or copy any words from the reference photo. Print ONLY these custom text layers!\nSAFETY MARGINS & SPACING MANDATE: Maintain safe margins of at least 8% padding from all canvas borders.`);
    }
  }

  if (config.promptTipografia?.trim() || config.tipografiaRefBase64 || (config.tipografiaRefsList && config.tipografiaRefsList.length > 0)) {
    const typoExtractText = config.promptTipografia?.trim() ? ` Notes: ${config.promptTipografia.trim()}` : "";
    promptParts.push(`\n=== TYPOGRAPHY REFERENCE EXTRACTION MANDATE ===\nAnalyze the attached Typography Reference Print ('Referência de Tipografia'). Copy the exact lettering style, font weight, text effects, and placement style from the reference print.${typoExtractText}`);
  }

  // 9. LOGO & DESIGN FIDELITY
  if (config.useLogo || config.logoBase64 || config.logosList?.length) {
    if (config.logoInclusionType === "overlay") {
      promptParts.push(`DIGITAL LOGO OVERLAY MODE (EXACT POST-PROCESS INSTALLATION):
The client's brand logo ("Referência de Logotipo da Marca") will be installed digitally with 100% pixel-exact fidelity AFTER the image generation.
- ABSOLUTE NO-LOGO RENDERING MANDATE (CRITICAL): YOU ARE STRICTLY FORBIDDEN FROM DRAWING, RENDERING, PAINTING, OR HALLUCINATING ANY LOGO, BRAND EMBLEM, SYMBOL, OR "PREMIUM/DESIGNER WATERMARK" ANYWHERE ON THE CANVAS!
- ABSOLUTE REFERENCE OLD LOGO ERASE MANDATE (CRITICAL): You MUST COMPLETELY ERASE, OMIT, AND REMOVE 100% OF ANY OLD LOGO, BRAND EMBLEM, OR SYMBOL PRESENT IN THE DESIGN LAYOUT REFERENCE PHOTO ('Referência de Design/Layout'). YOU ARE STRICTLY FORBIDDEN FROM COPYING, TRACING, DRAWING, OR KEEPING THE OLD LOGO FROM THE REFERENCE CARD PHOTO!
- RESERVED CLEAN LOGO SPACE: Leave the designated logo area (top-left or top-right corner, away from subject hair/face/body, in clean continuous background) completely empty, clean, and unobstructed so the digital logo can be overlaid there without any visual collision.`);
    } else {
      promptParts.push(`NATIVE BRAND LOGO INTEGRATION (EXACT SPATIAL REPLACEMENT):
Draw and embed the client's provided brand logo ("Referência de Logotipo da Marca") natively directly onto the image canvas.
- EXACT SPATIAL SUBSTITUTION IN PLACE (CRITICAL): If the attached Design Layout Reference ('Referência de Design/Layout') has a logo in the BOTTOM-LEFT or BOTTOM-RIGHT FOOTER, embed the client's new brand logo AT THE EXACT SAME FOOTER LOCATION and scale! If the reference has the logo in the top header, embed it in the top header. NEVER move a footer logo to the top header!
- ABSOLUTE REFERENCE LOGO ERASE MANDATE (CRITICAL): You MUST COMPLETELY ERASE, OMIT, AND REMOVE 100% OF ANY OLD LOGO, BRAND EMBLEM, OR SYMBOL PRESENT IN THE DESIGN LAYOUT REFERENCE PHOTO ('Referência de Design/Layout'). YOU ARE STRICTLY FORBIDDEN FROM COPYING, TRACING, DRAWING, OR KEEPING THE OLD LOGO FROM THE REFERENCE CARD PHOTO! Render STRICTLY AND ONLY the client's uploaded brand logo ('Referência de Logotipo da Marca').
- SINGLE INSTANCE MANDATE (CRITICAL): Draw EXACTLY ONE SINGLE INSTANCE of the brand logo on the entire artwork. Absolute prohibition against duplicate logos, double logos, twin logos, extra logo placements, or repeating the logo anywhere else on the canvas.
- LOGO NATURAL ASPECT RATIO MANDATE (CRITICAL): Preserve 100% of the original width-to-height natural aspect ratio of the brand logo. YOU ARE STRICTLY FORBIDDEN from stretching, distorting, squishing, compressing, or warping the logo horizontally or vertically to force it into any container box.
- LOGO CONTRAST & LEGIBILITY MANDATE (CRITICAL): If the logo contains black or dark text and is rendered over a dark background, automatically apply a clean subtle light/white glow/halo backdrop behind the logo text so that dark logo typography stands out with 100% crisp contrast and legibility. If the background is light, ensure dark logo text is crisp. The logo MUST be 100% readable.
- POSITIONING & HAIR/FACE AVOIDANCE (CRITICAL): The logo MUST NEVER be rendered on top of the subject's hair, head, face, or body.
- SEAMLESS INTEGRATION: Render the logo cleanly onto the background. DO NOT draw an artificial black box, dark container rectangle, or inverted background box around the logo unless those shapes are part of the original logo file.`);
    }
  }

  if (config.designRefBase64 || config.designRefsList?.length || config.useEnvRef || config.cenarioBase64) {
    const designExtractNotes = config.promptDesign?.trim() ? ` Layout extraction notes: ${config.promptDesign.trim()}.` : "";
    promptParts.push(`Layout & Reference Fidelity: Maintain 100% MAXIMUM FIDELITY to the attached reference photo's design layout ('Referência de Design/Layout'). Replicate the exact grid composition, card panel divisions, frame borders, background setting, room architecture, spatial positioning, subject placement, and body poses. Do NOT redesign the layout grid! Do NOT change panel shapes! Keep 100% of the composition grid, cards, and structure identical to the reference image.${designExtractNotes}`);
    const userHasProvidedHandle = (config.camadasTexto || []).some(l => l.conteudo && l.conteudo.includes("@")) ||
      (config.additionalPrompt && config.additionalPrompt.includes("@"));

    if (userHasProvidedHandle) {
      promptParts.push("SOCIAL MEDIA @ HANDLE PLACEMENT & EXACT FORMAT: Position the social media @ handle and icons according to the Design Layout Reference (e.g. if the reference has the @ handle in the top-center header, render it in the top-center header; if in the footer, render in the footer). Format it STRICTLY as a single '@' followed by the username in lowercase (e.g. '@sispumumc'). ABSOLUTELY NEVER PRINT DUPLICATE '@@' SYMBOLS OR EXTRA '@' ICONS!");
    } else {
      promptParts.push("ZERO UNREQUESTED PROFILE HANDLES MANDATE (CRITICAL): You ARE STRICTLY FORBIDDEN from adding, inventing, generating, or rendering any Instagram @ handle, profile username (such as @perfil, @seu.perfil, @instagram, @usuario, or any fictional @handle), or profile text on the image canvas unless explicitly provided by the user in the custom text parameters! Completely erase any @ handle from reference photos. Keep the canvas clean of unrequested handles.");
    }
    promptParts.push("STRICT SOCIAL MEDIA ICONS & USER EXCLUSIONS MANDATE: If social media handles or icons are requested, render STRICTLY and ONLY the exact social media icons requested by the user (e.g. Instagram and Facebook). You MUST completely ERASE, EXCLUDE, AND REMOVE any unrequested social media icons originally present in the reference image (such as TikTok, YouTube, WhatsApp, Twitter/X, LinkedIn). Do NOT copy unrequested social media icons from the reference image. DO NOT print duplicate '@' symbols next to icons.");
    promptParts.push("LIGHTROOM PHOTO RETOUCHING & SHADOW ERASURE ENGINE: Completely erase and dissolve all harsh camera flash cast shadows on walls behind people, dark shadow outlines, and unwanted shadows on background surfaces. Apply full Adobe Lightroom treatment: balanced exposure/highlights/shadows, natural temperature/tint, vibrant skin tones, Texture/Clarity/Dehaze definition, fine S-curve tone curve, HSL color balance, subtle split-toning color grading, sharpening with luminance noise reduction, subtle vignette, and AI subject/face masking for crisp, professional, clean cinematic clarity.");
  }

  // 10. VISUAL STYLE & PHOTOGRAPHY TREATMENT
  if (config.promptEstilo?.trim()) {
    promptParts.push(`Visual Style & Photography Treatment: ${config.promptEstilo.trim()}.`);
  } else if (config.estiloVisualCustom?.trim()) {
    promptParts.push(`Visual Style & Atmosphere: ${config.estiloVisualCustom.trim()}.`);
  }
  if (config.referenciasEstilo && config.referenciasEstilo.length > 0) {
    const styleDescs = config.referenciasEstilo.map(r => r.descricao).filter(Boolean);
    if (styleDescs.length > 0) {
      promptParts.push(`Style Reference Notes: ${styleDescs.join("; ")}.`);
    }
  }

  // 11. ADDITIONAL USER INSTRUCTIONS & MANDATORY PHOTO EDITING DIRECTIVES
  if (config.additionalPrompt?.trim()) {
    const isRefinementReq = config.additionalPrompt.includes("EXPLICIT INSTRUCTION FOR THIS REFINEMENT:");
    if (isRefinementReq) {
      promptParts.unshift(`=== ABSOLUTE IMAGE CORRECTION, ULTRA-VIBRANCE & PRESERVE EVERYTHING ELSE MANDATE ===
THIS IS A PRECISE LOCAL CORRECTION REQUEST ON THE PREVIOUSLY GENERATED IMAGE ('Imagem Gerada Anterior').
YOU ARE STRICTLY MANDATED TO PERFORM AN EXACT IMAGE-TO-IMAGE CORRECTION:
1. PRESERVE 100% OF THE PREVIOUS IMAGE'S COMPOSITION, LAYOUT, TEXTS, LOGOS, SUBJECTS, FACES, BACKGROUND, LIGHTING, CONTRAST, AND RICH COLOR SATURATION.
2. ULTRA-VIBRANCE & SATURATION LOCK: Maintain 100% of the dynamic color saturation and warmth. YOU ARE STRICTLY FORBIDDEN FROM DULLING, DESATURATING, FADING, OR WASHING OUT COLORS.
3. MODIFY ONLY AND EXCLUSIVELY WHAT IS REQUESTED IN THIS CORRECTION DIRECTIVE: "${config.additionalPrompt.trim()}".
4. DO NOT REDESIGN THE CANVAS, DO NOT REGENERATE A DIFFERENT BACKDROP, AND DO NOT ALTER ANY UNREQUESTED ELEMENT.`);
    }

    promptParts.push(`\n=== CRITICAL USER PHOTO EDITING & MODIFICATION DIRECTIVES (HIGH PRIORITY) ===\n${config.additionalPrompt.trim()}\nEXPLICIT MANDATE: Execute EVERY SINGLE edit, icon restriction, object removal, lighting fix, color correction, skin retouch, background blur, shadow removal, and table/surface cleanup listed above with 100% precision.`);
  }

  // Add default anti-duplicate logo, photo & anti-unrequested icon constraints
  const defaultAntiDuplicate = "duplicate logos, double logos, twin logos, multiple logos, repeated brand logos, extra logo placements, unrequested social media icons, tiktok icon, tiktok logo, musical.ly logo, invented @ handles, unrequested instagram handles, @perfil, @seu.perfil, @instagram, unrequested profile usernames, duplicate photos, repeated background image, repeating same image in multiple panels, same subject repeated in background and card, duplicate image boxes, dull colors, faded colors, desaturated colors, washed out contrast, particles, floating particles, dust particles, sparkles, glitter, confetti, glowing embers, lens flares, light leaks, floating sparks, bokeh spots, floating light dots";
  const finalNegativePrompt = config.negativePrompt?.trim() 
    ? `${config.negativePrompt.trim()}, ${defaultAntiDuplicate}`
    : defaultAntiDuplicate;

  promptParts.push(`\n=== STRICT UNWANTED ELEMENTS & NEGATIVE CONSTRAINTS (MUST REMOVE / DO NOT RENDER) ===\n${finalNegativePrompt}\nEXPLICIT NEGATIVE DIRECTIVE: Do NOT include, render, or keep any of the unwanted items or duplicate logos listed above. Render EXACTLY 1 single logo and ONLY the requested social media icons.`);

  promptParts.push(`\n=== ABSOLUTE ZERO DUPLICATE IMAGES & UNIQUE PANEL ASSIGNMENT MANDATE (CRITICAL) ===
1. STRICT ZERO REPEATED/DUPLICATE IMAGES RULE: You are STRICTLY FORBIDDEN from repeating, duplicating, or re-using the SAME photo or image in multiple places on the canvas!
2. DISTINCT BACKGROUND vs. CARD PANELS: The background image MUST BE COMPLETELY DIFFERENT from the images used inside individual card panels, frames, or subject boxes. NEVER put the same image in the background AND inside a card box.
3. UNIQUE PHOTO ASSIGNMENT: If multiple reference photos are provided ('Referência do Sujeito Principal', 'Referência de Cenário', 'Referência de Design/Layout'), assign a DIFFERENT, UNIQUE photo to each distinct card/panel box. Each image block on the layout MUST show a different photo with ZERO repetition.`);

  const isRemovalOrCountRequest = /remov|tir|apag|sem|excluir|delet|limp|não adici|nao adici|mesma quantid|sem extra|sem adici|igual a referencia|mude todas|duplic|repet/i.test(
    `${config.additionalPrompt || ''} ${config.negativePrompt || ''}`
  );

  if (isRemovalOrCountRequest) {
    promptParts.push(`\n=== STRICT REMOVAL & EXACT IMAGE COUNT PRESERVATION DIRECTIVE ===
1. REMOVE SPECIFIED OBJECTS / PANELS: Completely erase, delete, and remove the specified unwanted elements: ${finalNegativePrompt}.
2. PRESERVE EXACT IMAGE COUNT: Do NOT add extra photos, extra image cards, extra panels, extra frames, or extra subjects. Maintain the exact same number of images/photos as shown in the reference design.
3. NO DUPLICATE IMAGES ACROSS PANELS: Do NOT repeat the same image in the background and inside a card box. Keep background image and panel images completely distinct.
4. DO NOT ALTER OR SWAP UNRELATED IMAGES: Keep 100% of all other existing images, faces, subjects, and layout elements untouched. Modifying unrequested images on the canvas is STRICTLY FORBIDDEN.`);
  }

  promptParts.push(`\n=== REAL PHOTOGRAPH EMBEDDING & NO RECREATION MANDATE (CRITICAL) ===
When a real photograph is attached ('Referência do Sujeito Principal', 'Referência de Cenário', 'Referência de Design/Layout' - such as a church, building, facade, landscape, person, product, or scenery), you MUST USE AND EMBED THAT REAL PHOTOGRAPH DIRECTLY inside the artwork composition and background! YOU ARE STRICTLY FORBIDDEN from redrawing, re-rendering, illustrating, 3D animating, cartoonifying, or recreating real photographs as digital drawings or AI illustrations. The real photograph MUST maintain 100% authentic photographic realism, real-world textures, lighting, and real architectural details.

=== ZERO HALLUCINATED TEXT, UNREQUESTED HANDLES & UNREQUESTED ICONS MANDATE (CRITICAL) ===
1. ZERO HALLUCINATED TEXT & UNREQUESTED HANDLES: You MUST ONLY print, write, and render the custom texts explicitly supplied by the client in the text parameters! NEVER invent, hallucinate, write, or add any unrequested titles, subtitles, dates, event names, addresses, or random words! DO NOT invent or render any @ handles, profile usernames, or @perfil text unless explicitly provided by the client in the text parameters!
2. ZERO UNREQUESTED ICONS: You MUST NOT draw unrequested social media icons (such as TikTok, YouTube, WhatsApp, Twitter/X, LinkedIn). Render ONLY the exact social media icons requested by the user.

=== ${config.logoInclusionType === "overlay" && (config.useLogo || config.logoBase64 || config.logosList?.length) ? "DIGITAL LOGO OVERLAY MODE — ABSOLUTE NO-LOGO RENDERING MANDATE (CRITICAL)" : "STRICT ORIGINAL BRAND LOGO MANDATE (CRITICAL)"} ===
${config.logoInclusionType === "overlay" && (config.useLogo || config.logoBase64 || config.logosList?.length)
  ? "YOU ARE STRICTLY FORBIDDEN FROM DRAWING, RENDERING, PAINTING, OR HALLUCINATING ANY LOGO, BRAND EMBLEM, SYMBOL, OR WATERMARK ANYWHERE ON THE CANVAS! You MUST completely ERASE and REMOVE any old logo present in the reference design photo. Leave the designated logo area (top-left or top-right corner) clean, empty and unobstructed — the client's real logo will be installed digitally with 100% pixel-exact fidelity after generation."
  : "Draw and embed the client's provided brand logo ('Referência de Logotipo') with 100% PERFECT EXACT COLOR AND SHAPE FIDELITY. You ARE STRICTLY FORBIDDEN from changing the logo's colors, modifying logo typography or symbols, warping or stretching logo proportions, or adding artificial dark container boxes around it."}

=== SURGICAL REFINEMENT & UNRELATED ELEMENT PRESERVATION MANDATE (CRITICAL) ===
When the user requests a specific edit or refinement, apply ONLY that specific requested change! You ARE STRICTLY FORBIDDEN from modifying, altering, redesigning, or replacing unrelated elements, background photos, church facades, logos, or text layers. Keep 100% of all unmentioned elements completely untouched. Preserve 100% of rich color saturation and dynamic contrast.`);

  promptParts.push(`\n=== FINAL EXPLICIT MANDATE ===\n1. REAL PHOTOGRAPHS (CHURCHES, SCENERY, PEOPLE, PRODUCTS) MUST BE EMBEDDED DIRECTLY AS REAL PHOTOS - NEVER RECREATED AS DRAWINGS.\n2. FACES, EXPRESSIONS AND POSES MUST REMAIN 100% IDENTICAL TO THE REFERENCE PHOTO.\n3. ${config.logoInclusionType === "overlay" && (config.useLogo || config.logoBase64 || config.logosList?.length) ? "NEVER DRAW ANY LOGO ON THE CANVAS (DIGITAL OVERLAY MODE): The real client logo is installed digitally after generation — leave the logo area empty and erase any old logo from the reference." : "RENDER EXACTLY 1 SINGLE BRAND LOGO WITH 100% ORIGINAL COLORS AND SHAPE (ZERO DUPLICATE LOGOS, ZERO LOGO MODIFICATIONS)."}\n4. RENDER STRICTLY ONLY THE SOCIAL MEDIA ICONS REQUESTED (ERASE TIKTOK OR OTHER UNREQUESTED ICONS FROM REFERENCE).\n5. ABSOLUTE ANTI-HALLUCINATION TEXT & HANDLE MANDATE: NEVER invent unrequested dates, titles, text, or @ handles (@perfil, @seu.perfil, etc.). If no @ handle is explicitly provided by the user in the text parameters, DO NOT RENDER ANY @ HANDLE OR PROFILE NAME ON THE CANVAS. NEVER render text containing brackets like [HEADLINE], [SUBTÍTULO], [CHAMADA], [RODAPÉ], [CTA]. NEVER print font names as text (words like "Montserrat", "Bebas Neue", "Outfit", "Anton", "Cinzel" are STYLE COMMANDS for the letterforms, NOT words to be written on the canvas). ALL text rendered on the canvas MUST be real, final custom content explicitly provided.\n6. ALL PORTUGUESE TEXT MUST BE GRAMMATICALLY PERFECT: Zero spelling errors, zero accent errors, zero concordance errors. Proper capitalization of names, cities and brands. ALL displayed text MUST be in BRAZILIAN PORTUGUESE. NEVER mix English words (like PREMIUM, LIVE, NEW, SALE, BEST, NOW, SPECIAL) into the displayed texts unless the client supplied text literally contains them.\n7. ULTRA-VIBRANCE LOCK: Maintain high contrast and vibrant color saturation; zero dull, faded, or washed-out tones.`);

  let masterPrompt = promptParts.join(" ");
  return masterPrompt;
};

/**
 * Builds the Supreme Master AI System Instruction Directive
 * Enforces biological light physics (3-Layer SSS), kinesiology pose torque,
 * optical lens simulation (Sony A1 85mm GM f/2.0), and strict Brazilian Portuguese typography rules.
 */
export const buildMasterSystemInstruction = (config: ProjectConfig): string => {
  const isLogo = config.tipoPainel === "LOGO";
  const isFoto = config.tipoPainel === "FOTO";
  const hasLogo = config.useLogo || !!config.logoBase64 || (Array.isArray(config.logosList) && config.logosList.length > 0);
  const isLogoOverlay = config.logoInclusionType === "overlay" && hasLogo;

  return `=== ZION SUPREME AI SYSTEM INSTRUCTION DIRECTIVE ===
[AUTHORITY & CORE MANDATE]
You are the Supreme Creative Director, Lead Cinematographer, and Master Visual Art Director. You operate with absolute authority over visual fidelity, lighting physics, anatomical correctness, and typography aesthetics.

[1. BIOLOGICAL SKIN REALISM & 3-LAYER SUBSURFACE SCATTERING (SSS)]
- 3-LAYER DERMAL PHYSICS: Apply physically authentic 3-layer Subsurface Scattering (Epidermis, Dermis, Subcutaneous Adipose) to all human skin. Light must penetrate translucent dermal layers, scattering warmth along shadow terminators with zero synthetic waxy sheen or plastic beauty smoothing.
- MICRO-DISPLACEMENT TEXTURE: Natural pores, fine skin grain, microscopic vellus hair under raking light, and authentic specular sebum highlights must be rendered with razor-sharp micro-displacement.
- ZERO AI BEAUTY FILTER: Strictly forbid over-smoothed skin, doll-like faces, or airbrushed textures. Preserve authentic biological realism.

[2. CHIAROSCURO, BLACK CLIPPING & PHOTON BUDGET]
- STRATEGIC CONTRAST: Manage photon budgets intentionally. Deepest shadow crevices must exhibit controlled black clipping (Zero Fill Light, 100% Shadow Opacity) to establish dramatic chiaroscuro and sculptural volumetric depth.
- HIGHLIGHT ROLL-OFF: Smooth highlight roll-off with natural specular transitions on glossy surfaces, jewelry, metallic trims, and wet textures.

[3. KINESIOLOGY, ANATOMICAL RIGOR & POSE LAWS]
- STRICT HUMAN TOPOLOGY: Human subjects must have EXACTLY 2 arms, 2 legs, and 2 hands with 5 distinct, naturally articulated fingers. Absolute prohibition of extra limbs, fused digits, or chimeric bodies.
- BODY-TO-HEAD TORQUE: Replicate realistic muscular tension in the sternocleidomastoid and trapezius muscles when the head rotates relative to the torso.
- GAZE VECTOR & CORNEAL CATCHLIGHTS: Align the subject's gaze vector directly with the camera's optical axis. Pupils must contain crisp, natural corneal catchlights reflecting the primary key light.
- TACTILE DERMAL DEFORMATION: Fingers gripping objects (microphones, garments, glass) must exhibit authentic physical contact flattening on finger pads and knuckles, respecting Z-depth layering (Skin > Fabric > Object).

[4. OPTICAL SENSOR & CAMERA SIMULATION]
- SENSOR & OPTICS: Simulate a full-frame sensor paired with a Sony G-Master 85mm f/1.4 prime lens stopped down to f/2.0-f/2.8.
- TACK-SHARP FOCAL PLANE: Pin-sharp focus on the subject's nearest iris, with creamy circular bokeh and organic cat-eye edge falloff in out-of-focus background elements.
- FILM TONAL RESPONSE: Kodak Portra 400 tonal curve with natural color transitions, rich midtone contrast, and zero digital haloing.

[5. BRAZILIAN PORTUGUESE TYPOGRAPHY & FONT DIRECTIVES]
- LANGUAGE LOCK: ALL displayed text on the canvas MUST remain strictly in BRAZILIAN PORTUGUESE (pt-BR) exactly as provided. Never translate or inject unrequested English filler words (PREMIUM, LIVE, SALE, NEW, SPECIAL, TICKET).
- FONT NAMES ARE STYLE DIRECTIVES: Font family names (Montserrat, Bebas Neue, Outfit, Anton, Cinzel) are styling directives for letterforms ONLY and must NEVER be printed or rendered as written words on the canvas.
- TEXT RENDERING: All custom text layers must be crisply embedded on the canvas with perfect legibility, proper kerning, and designated hex colors.

[6. REFERENCE PRESERVATION & LOGO RULES]
- GOVERNING LAW: When Design/Layout references are provided, preserve the composition grid, panel shapes, lighting direction, and 3D depth.
- TEXT & LOGO ERASURE: Erase all old reference texts, handles, and logos. Render exclusively the new custom text and client brand logo.
${isLogoOverlay ? "- DIGITAL LOGO OVERLAY: Do NOT draw the brand logo on the canvas; leave designated space clean for post-generation overlay." : hasLogo ? "- NATIVE BRAND LOGO SUBSTITUTION IN PLACE: Embed the client's brand logo with 100% color and shape fidelity AT THE EXACT SAME SPATIAL LOCATION (e.g. bottom-left footer if the reference had the logo in the bottom-left, or top header if in the header) where the reference logo was located. Never move a footer logo to the top header." : "- NO RANDOM LOGOS: Erase any existing logos from reference images; do not invent new logos."}

[7. ANTI-HALLUCINATION & ZERO ARTIFACT LAW]
- Strictly forbid duplicate logos, unwanted social media icons (TikTok, YouTube, etc.), floating random dust/particles, unrequested @ handles, and visual glitches.`;
};


