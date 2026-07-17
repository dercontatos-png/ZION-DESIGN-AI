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
  
  // 1. MASTER DIRECTIVE & STYLE
  let promptParts: string[] = [
    "Design a breathtaking, premium layout in the style of 'Flyer BR' top-tier professional graphic design.",
    "Masterpiece, ultra-detailed, 8k resolution, impeccable typography layout, stunning visual composition, agency-level commercial art."
  ];

  // 2. VISUAL AESTHETICS & CREATIVE LEVEL
  const creativeWeight = config.nivelCriativo ?? 50;
  if (creativeWeight < 30) {
    promptParts.push("Aesthetic: Clean, minimalist corporate branding, highly organized, elegant negative space, premium luxury feel.");
  } else if (creativeWeight < 70) {
    promptParts.push("Aesthetic: Dynamic commercial advertisement, vibrant but balanced, engaging professional flyer composition.");
  } else {
    promptParts.push("Aesthetic: Highly creative, aggressive 'Flyer BR' party/event style, heavy contrast, stunning glow effects, intricate background details, explosive visual energy.");
  }

  if (config.estilosVisuais && config.estilosVisuais.length > 0) {
    promptParts.push(`Visual Themes: ${config.estilosVisuais.join(", ")}.`);
  }

  // 3. DIMENSIONS & COMPOSITION
  const ratio = config.dimensao || "1:1";
  const framing = config.composicao || "Plano Médio";
  let compositionDesc = `Layout Aspect Ratio: ${ratio}. `;
  
  if (config.composicaoCustom && config.composicaoCustom.trim() !== "") {
    compositionDesc += `Camera/Framing Setup: ${config.composicaoCustom.trim()}. `;
  } else {
    compositionDesc += `Camera/Framing Setup: ${isProduct ? "Commercial product catalog framing" : framing} with sharp depth of field. `;
  }
  promptParts.push(compositionDesc);

  // 4. SUBJECT / PRODUCT FOCUS (Integrating References)
  if (config.desativarSujeito) {
    promptParts.push("Subject: No central human subject. Focus entirely on the background environment, typography, and atmospheric elements.");
  } else {
    const positioning = config.positioning || "Centro";
    const poseText = config.poseDescription && config.poseDescription.trim() !== "" 
      ? `styled/posing as: ${config.poseDescription.trim()}`
      : "";
      
    if (isProduct) {
      promptParts.push(`Main Focus: A premium e-commerce product ${poseText}, perfectly positioned at the ${positioning.toLowerCase()} of the canvas. (If a product reference image is provided, integrate it seamlessly retaining its core identity).`);
    } else {
      const gender = config.gender || "Masculino";
      promptParts.push(`Main Focus: A high-end commercial model (${gender}) ${poseText}, positioned at the ${positioning.toLowerCase()} of the canvas. (Match the provided subject reference image exactly if supplied).`);
    }
  }

  // 5. SCENARIO / BACKGROUND ENVIRONMENT
  if (config.promptCenario && config.promptCenario.trim() !== "") {
    promptParts.push(`Background/Scenario: ${config.promptCenario.trim()}. (If a background reference image is provided, blend its scenery flawlessly behind the subject).`);
  } else if (config.additionalPrompt && config.additionalPrompt.toLowerCase().includes("cenário")) {
    promptParts.push("Background: Custom atmospheric environment matching the creative details.");
  } else {
    promptParts.push("Background: Abstract premium studio backdrop with deep textures.");
  }

  // 6. LIGHTING & COLOR GRADING
  if (config.coresAutomaticas) {
    promptParts.push("Lighting & Colors: Harmonious automatic studio lighting, flawless skin/material reflections, cohesive color grading.");
  } else {
    const envColor = config.cores?.ambiente || "#000000";
    const rimColor = config.cores?.recorte || "#ffffff";
    const compColor = config.cores?.complementar || "#827df6";
    promptParts.push(`Lighting Setup: Complex 3-point studio lighting. Ambient background light tone: ${envColor}. Sharp edge rim-light (backlight): ${rimColor}. Fill/Complementary light: ${compColor}.`);
  }

  if (config.useCorDominante && config.corDominante && config.corDominante !== "#000000") {
    promptParts.push(`Color Palette: The dominant accent color throughout the flyer must be ${config.corDominante}. Use this for text accents, glows, and graphical shapes.`);
  }

  // 7. EFFECTS & FLOATING ELEMENTS
  let effectsList = [];
  if (config.degradeLeitura) effectsList.push("dark gradient overlay behind text areas for maximum legibility");
  if (config.enableBlur) effectsList.push("cinematic background bokeh blur");
  if (config.lateralGradient) effectsList.push("subtle lateral color gradient fade");
  if (effectsList.length > 0) {
    promptParts.push(`Post-Processing Effects: ${effectsList.join(", ")}.`);
  }

  if (config.floatingElementsMode === "auto") {
    promptParts.push("Graphic Elements: Include premium floating particles, light dust, or thematic elements passing in front of and behind the subject to create 3D depth.");
  } else if (config.floatingElementsMode === "custom" && config.floatingElementsCustom && config.floatingElementsCustom.trim() !== "") {
    promptParts.push(`Graphic Elements: Floating 3D elements including ${config.floatingElementsCustom.trim()} interacting with the lighting.`);
  }

  // 8. TYPOGRAPHY & TEXT LAYOUT (The true Flyer BR magic)
  if (config.camadasTexto && config.camadasTexto.length > 0) {
    const activeLayers = config.camadasTexto.filter(l => l.conteudo && l.conteudo.trim() !== "");
    if (activeLayers.length > 0) {
      promptParts.push(`\n=== TYPOGRAPHY & TEXT LAYOUT ===\nThe design MUST include the following text layers arranged professionally, aligned to the ${(config.typographyPosition || "Centro").toUpperCase()}:`);
      
      activeLayers.forEach((layer) => {
        const isSocialHandle = layer.conteudo.trim().startsWith("@") || layer.funcao.toLowerCase().includes("social") || layer.funcao.toLowerCase().includes("insta");
        const lowercaseRule = isSocialHandle ? " (CRITICAL: Write this text strictly in LOWERCASE letters, e.g. '" + layer.conteudo.trim().toLowerCase() + "'. Do NOT capitalize it.)" : "";
        promptParts.push(`- [${layer.funcao.toUpperCase()}]: Write exactly "${layer.conteudo.trim()}"${lowercaseRule} using a ${layer.fonte} style font. Text color: ${layer.cor}.`);
      });
      
      promptParts.push("Ensure perfect typographic hierarchy, kerning, and contrast. Text should look like it was designed by a human art director in Photoshop, integrating with the lighting and shadows. Social media handles starting with '@' must remain strictly in lowercase.");
    }
  }

  // 9. LOGO INTEGRATION
  if (config.useLogo && (config.logoBase64 || (config.logosList && config.logosList.length > 0))) {
    promptParts.push("Brand Identity: Integrate the client's provided brand logo ('Referência de Logotipo') naturally into the composition layout (e.g., top center or bottom corner). CRITICAL DESIGN DIRECTIVE: You MUST completely ignore and omit any logo, symbol, or brand mark that is present in the background design reference flyer image. Do NOT copy the reference flyer's logo under any circumstances; use exclusively the client's provided brand logo exactly as is, preserving its original colors, sharp shapes, and exact design without modifications or hallucinations.");
  }

  // 9.5 DESIGN REFERENCE FIDELITY
  if (config.designRefBase64 || (config.designRefsList && config.designRefsList.length > 0)) {
    promptParts.push("\n=== DESIGN REFERENCE FIDELITY ===\nCRITICAL DIRECTIVE: A 'Design Layout Reference' image is supplied. You MUST perfectly match its composition structure, layout grid, text positions, light source direction, background elements, gradients, textures, and overall visual balance. Do NOT invent a random or creative layout or deviate from this composition. Replicate its visual structure and atmosphere faithfully while integrating the custom subject and the provided brand logo. Completely ignore any logos present inside the Design Layout Reference, substituting them with the client's brand logo.");
  }

  // 10. STYLE REFERENCES
  if (config.referenciasEstilo && config.referenciasEstilo.length > 0) {
    const stylesDesc = config.referenciasEstilo
      .filter(ref => ref.descricao && ref.descricao.trim() !== "")
      .map(ref => ref.descricao.trim())
      .join(" | ");
    if (stylesDesc) {
      promptParts.push(`Visual Style Reference Details: Emulate these specific aesthetic cues -> ${stylesDesc}.`);
    }
  }

  // 11. ADDITIONAL USER INSTRUCTIONS
  if (config.additionalPrompt && config.additionalPrompt.trim() !== "") {
    promptParts.push(`\nAdditional Client Requirements: ${config.additionalPrompt.trim()}`);
  }

  let masterPrompt = promptParts.join(" ");

  // Anti-slop engineering: Ensure we don't trigger typical AI artifact terms.
  masterPrompt = masterPrompt.replace(/\b(film|cinematic|movie|cinematográfico|filme)\b/gi, "high-end commercial photography, professional studio lighting, extremely detailed");

  return masterPrompt;
};

