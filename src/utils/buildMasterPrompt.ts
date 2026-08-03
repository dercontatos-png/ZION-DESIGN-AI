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
  
  // 1. MASTER DIRECTIVE & STYLE
  let promptParts: string[] = [
    isLogo ? "Professional logo design masterpiece, vector graphic style, high contrast, clean minimalist, flat, scalable, white background, high quality, flawless colors, no pixelation."
           : isGcTv ? "Professional Television Broadcast Graphic (GC / Lower Third / Character Generator) overlay for TV shows, news, sports, and podcasts. Ultra-high resolution 8K, crisp broadcast typography, modern lower-third graphic bar, high-contrast TV studio production value, flawless colors, no pixelation."
           : "Premium graphic design masterpiece. Ultra-high resolution 8K, extreme detail, agency-level quality, sharp focus, cinematic lighting, flawless colors, perfectly smooth, no pixelation or artifacts.",
  ];

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

  if (isGcTv) {
    promptParts.push("TV Broadcast Overlay Specifications: Lower Third TV Bar / Gerador de Caracteres. Include a clean graphical banner bar across the lower section of the screen, with crisp high-legibility broadcast typography for presenter/guest names, titles, badges, and TV station branding.");
  }

  // 3. DIMENSIONS & COMPOSITION
  const ratio = config.dimensao || "1:1";
  promptParts.push(`Aspect ratio: ${ratio}.`);

  if (config.formatoExportacao === "PNG") {
    promptParts.push("Color fidelity: 32-bit RGBA depth, ultra-smooth lossless gradient transitions, high dynamic range color precision.");
  }

  // 4. SUBJECT / PRODUCT FOCUS (Integrating References)
  if (isLogo) {
    promptParts.push(`Central subject: Brand name '${config.additionalPrompt || "Company Name"}', iconic logo concept.`);
  } else if (config.desativarSujeito) {
    promptParts.push("Focus: Background atmosphere, typography, atmospheric elements.");
  } else {
    const poseText = config.poseDescription?.trim() ? `, ${config.poseDescription.trim()}` : "";
    promptParts.push(`Central subject / People in Photo${poseText}: The exact person/people/subjects from the attached reference photo(s) ('Referência do Sujeito Principal' / 'Referência de Design/Layout'). ABSOLUTE CRITICAL FACIAL IDENTITY, INDIVIDUAL EXPRESSION & POSE PRESERVATION MANDATE: Preserve 100% of the EXACT faces, facial features, expressions, eyes, nose, mouth posture, individual smile state (do NOT force a smile or teeth on any individual with a closed-mouth or subtle expression), hair, skin tone, clothing, physical body poses, spatial ordering, and exact positions of ALL people/subjects in the reference photo. YOU ARE STRICTLY FORBIDDEN from altering, redesigning, changing facial features, changing individual facial expressions, swapping faces, recreating different individuals, changing poses, or moving people to different positions! Each person MUST maintain their exact individual facial expression and mouth appearance as shown in the reference photo.`);
  }

  // 5. SCENARIO / BACKGROUND ENVIRONMENT
  const hasRefImage = !!(config.designRefBase64 || config.useEnvRef || config.cenarioBase64 || (config.designRefsList && config.designRefsList.length > 0) || (config.cenariosBase64List && config.cenariosBase64List.length > 0));

  if (isLogo) {
    promptParts.push("Background: Solid white, clean and minimalist.");
  } else if (hasRefImage) {
    const cenarioText = config.promptCenario?.trim() ? ` Additional background details: ${config.promptCenario.trim()}.` : "";
    promptParts.push(`Background & Environment: STRICT ORIGINAL BACKGROUND & ROOM PRESERVATION MANDATE: Preserve 100% of the exact original background scene, room, walls, architecture, furniture, textures, and lighting from the attached reference photo ('Referência de Design/Layout' / 'Referência de Cenário'). Do NOT replace, change, redesign, or substitute the background with a new generated room, studio set, or different backdrop! Keep the exact same room, walls, and setting from the reference photo, applying ONLY the specific edits requested (such as erasing cast shadows from the wall/behind subjects, removing clutter/objects from tables, or adjusting exposure/blur).${cenarioText}`);
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

  // 8. TYPOGRAPHY & TEXT LAYOUT (The true Flyer BR magic)
  if (config.camadasTexto && config.camadasTexto.length > 0) {
    const activeLayers = config.camadasTexto.filter(l => l.conteudo?.trim());
    if (activeLayers.length > 0) {
      const formattedTexts = activeLayers.map(l => {
        const funcao = l.funcao ? `[${l.funcao.toUpperCase()}]` : '[TEXTO]';
        return `${funcao}: "${l.conteudo.trim()}"`;
      }).join(", ");
      
      promptParts.push(`\n=== MANDATORY CUSTOM TEXT LAYERS (ERASE ALL REFERENCE TEXT) ===\nRender ONLY these new custom text layers on the canvas: ${formattedTexts}.\nCRITICAL TEXT OVERWRITE RULE: You MUST completely ERASE and OVERWRITE 100% of the original text, titles, dates, handles, and numbers from the Design Layout Reference image. Do NOT keep or copy any words from the reference photo. Print ONLY these new custom text layers!`);
    }
  }

  // 9. LOGO & DESIGN FIDELITY
  if (config.useLogo || config.logoBase64 || config.logosList?.length) {
    promptParts.push(`NATIVE BRAND LOGO INTEGRATION (MANDATORY & EXACT POSITIONING):
Draw and embed the client's provided brand logo ("Referência de Logotipo") natively directly onto the image canvas.
- POSITIONING & HAIR/FACE AVOIDANCE (CRITICAL): The logo MUST NEVER be rendered on top of the subject's hair, head, face, or body. If the subject's hair or head extends near the top center, place the brand logo in clean negative background space in the top-left or top-right corner, ensuring zero collision or overlap with the subject's hair, head, face, or body.
- SEAMLESS INTEGRATION: Render the logo cleanly onto the background. DO NOT draw an artificial black box, dark container rectangle, or inverted background box around the logo unless those shapes are part of the original logo file.
- FIDELITY & NO DUPLICATE TEXT: Replicate 100% of the original logo's shapes, symbols, numbers, typography, and original colors without inverting or distorting any details. Do NOT print the logo's name as a separate text layer or headline in typography.`);
  }

  if (config.designRefBase64 || config.designRefsList?.length || config.useEnvRef || config.cenarioBase64) {
    promptParts.push("Layout & Reference Fidelity: Maintain 100% fidelity to the original photo's composition, background setting, room, furniture, spatial positioning, faces, and body poses of all subjects. Do NOT remove, erase, or replace the background environment. Do NOT alter facial features, do NOT change poses, and do NOT swap people's positions. Keep the exact same room/background setting and exact same people/poses from the reference photo.");
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
    promptParts.push(`\n=== CRITICAL USER PHOTO EDITING & MODIFICATION DIRECTIVES (HIGH PRIORITY) ===\n${config.additionalPrompt.trim()}\nEXPLICIT MANDATE: Execute EVERY SINGLE edit, object removal, lighting fix, color correction, skin retouch, background blur, shadow removal, and table/surface cleanup listed above with 100% precision.`);
  }

  if (config.negativePrompt?.trim()) {
    promptParts.push(`\n=== STRICT UNWANTED ELEMENTS & NEGATIVE CONSTRAINTS (MUST REMOVE / DO NOT RENDER) ===\n${config.negativePrompt.trim()}\nEXPLICIT NEGATIVE DIRECTIVE: Do NOT include, render, or keep any of the unwanted items listed above. You must completely erase and dissolve all dark cast shadows on walls, specifically the dark shadow outline behind the second person on the right. HOWEVER, DO NOT REMOVE THE ORIGINAL BACKGROUND AND DO NOT MAKE THE BACKGROUND WHITE! Replace all shadow areas strictly by cloning the clean, flat wall texture/color matching the rest of the illuminated wall in the reference.`);
  }

  promptParts.push(`\n=== FINAL EXPLICIT MANDATE ===\n1. FACES, EXPRESSIONS AND POSES MUST REMAIN 100% IDENTICAL TO THE REFERENCE PHOTO.\n2. STRICT BACKGROUND PRESERVATION: DO NOT MAKE THE BACKGROUND WHITE. YOU MUST PRESERVE THE EXACT ORIGINAL WALL TEXTURE AND COLOR FROM THE REFERENCE. ALL SHADOWS ON THE WALL (ESPECIALLY THE DARK CAST SHADOW BEHIND THE SECOND PERSON ON THE RIGHT) MUST BE COMPLETELY PAINTED OVER USING THE SAME ORIGINAL WALL COLOR, BLENDING SEAMLESSLY. DO NOT RENDER ANY SHADOWS BEHIND THE PEOPLE.`);

  let masterPrompt = promptParts.join(" ");
  return masterPrompt;
};


