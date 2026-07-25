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
    promptParts.push(`Central subject${poseText}: The exact person/subject from 'Referência do Sujeito Principal'. Preserve 100% of the exact face, facial features, eyes, hair, skin tone, clothing, and visual identity of the subject provided in 'Referência do Sujeito Principal' without altering, redesigning, or recreating them into a different person or changing their appearance.`);
  }

  // 5. SCENARIO / BACKGROUND ENVIRONMENT
  if (isLogo) {
    promptParts.push("Background: Solid white, clean and minimalist.");
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
  if (config.useCorDominante && config.corDominante && config.corDominante !== "#000000") {
    promptParts.push(`Color Palette Dominant override: The dominant theme color and primary background color MUST BE EXACTLY HEX ${config.corDominante}. Apply this specific hex value as the primary background color and primary theme color with high, intense vibrance. Do not deviate from this exact hex value.`);
  }

  // 8. TYPOGRAPHY & TEXT LAYOUT (The true Flyer BR magic)
  if (config.camadasTexto && config.camadasTexto.length > 0) {
    const activeLayers = config.camadasTexto.filter(l => l.conteudo?.trim());
    if (activeLayers.length > 0) {
      promptParts.push(`\n=== TEXT ===\nInclude text layers: ${activeLayers.map(l => `"${l.conteudo.trim()}"`).join(", ")}. Professional hierarchy.`);
    }
  }

  // 9. LOGO & DESIGN FIDELITY
  if (config.useLogo && (config.logoBase64 || config.logosList?.length)) {
    promptParts.push(`Include brand logo at: ${config.logoPosOverlay || "top_center"}. Ensure the logo is highly visible against the background. Do NOT modify the logo's design, text, or original colors. If needed to increase contrast against the background, apply a subtle drop shadow, outer glow, or outline to the logo container, do not alter the logo itself.`);
  }

  if (config.designRefBase64 || config.designRefsList?.length) {
    promptParts.push("Layout: Replicate composition structure, spatial positioning, and layout grid from reference.");
  }

  // 11. ADDITIONAL USER INSTRUCTIONS
  if (config.additionalPrompt?.trim()) {
    promptParts.push(`Client notes: ${config.additionalPrompt.trim()}`);
  }

  let masterPrompt = promptParts.join(" ");
  return masterPrompt;
};


