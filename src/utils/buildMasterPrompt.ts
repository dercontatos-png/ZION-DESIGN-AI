import { ProjectConfig } from "../types/designBuilder";

/**
 * Helper to sanitize placeholder brackets from text
 */
const sanitizeText = (str?: string): string => {
  if (!str) return "";
  let cleaned = str.replace(/\[(headline|subtítulo|subtitulo|chamada|texto|cta|inserir|digite|seu texto|sua frase|conteúdo|conteudo|rodapé|rodape|logo|logotipo|imagem|nome|data|telefone|whatsapp|instagram|endereço|endereco|título|titulo|apoio|secundári[oa]|principal|slogan|tagline|description|title|subtitle|footer|header|body|content|image|date|phone|address|name|your text|insert|type)[^\]]*\]/gi, '').trim();
  if (/^\[.*\]$/.test(cleaned) || /^\[.*\]$/.test(str.trim())) return "";
  const purePlaceholders = /^(headline principal|chamada secund[áa]ria|texto de apoio|rodap[ée]|subt[ií]tulo|cta|call to action|seu t[ií]tulo|seu texto|inserir texto)$/i;
  if (purePlaceholders.test(cleaned)) return "";
  return cleaned;
};

/**
 * Builds the Master Creative Prompt from design builder configuration state in structured JSON format.
 * EXPERT DESIGNER "FLYER BR" & INSTITUTIONAL MASTER SYSTEM.
 */
export const buildMasterPrompt = (config: ProjectConfig): string => {
  const isProduct = config.tipoPainel === "PRODUCT";
  const isLogo = config.tipoPainel === "LOGO";
  const isGcTv = config.tipoPainel === "GC_TV";
  const isFoto = config.tipoPainel === "FOTO";
  
  const ratio = config.dimensao || "3:4";
  const resolution = config.resolucao || "4K";
  const hasLogo = config.useLogo || !!config.logoBase64 || (Array.isArray(config.logosList) && config.logosList.length > 0);
  const isLogoOverlay = config.logoInclusionType === "overlay" && hasLogo;

  // Extract active text layers
  const rawLayers = (config.camadasTexto || [])
    .map(l => ({ ...l, conteudo: sanitizeText(l.conteudo) }))
    .filter(l => l.conteudo?.trim());

  const userHasProvidedHandle = rawLayers.some(l => l.conteudo && l.conteudo.includes("@")) ||
    (config.additionalPrompt && config.additionalPrompt.includes("@"));

  const isCastingSwapRequested = /mude|troque|outra mulher|nova modelo|diferente|substituir|novo modelo|new model|change woman|swap/i.test(`${config.poseDescription || ""} ${config.additionalPrompt || ""}`);

  let finalPlacement = config.positioning ? config.positioning.toUpperCase() : "RIGHT";
  if (config.composicaoCustom?.trim()) {
    if (/centro|center/i.test(config.composicaoCustom)) finalPlacement = "CENTER";
    else if (/esquerda|left/i.test(config.composicaoCustom)) finalPlacement = "LEFT";
    else if (/direita|right/i.test(config.composicaoCustom)) finalPlacement = "RIGHT";
  }

  const promptJson = {
    "engine": "ZION_DESIGN_AI_MASTER_PROMPT",
    "version": "4.0_JSON_SPEC",
    "project_metadata": {
      "project_type": isLogo ? "LOGO_IDENTITY" : isGcTv ? "TV_BROADCAST_LOWER_THIRD" : isFoto ? "EDITORIAL_STUDIO_PORTRAIT" : "INSTITUTIONAL_CAMPAIGN_CARD",
      "aspect_ratio": ratio,
      "render_target": `${resolution}_UHD_LOSSLESS`,
      "creative_intensity_percent": config.nivelCriativo ?? 50
    },
    "spatial_layout_zones": {
      "top_center_header": {
        "status": userHasProvidedHandle ? "ACTIVE" : "INACTIVE",
        "elements": userHasProvidedHandle ? [
          "instagram_glyph_in_red_circular_badge",
          "facebook_glyph_in_red_circular_badge",
          "tiktok_glyph_in_red_circular_badge",
          (rawLayers.find(l => l.conteudo.includes("@"))?.conteudo || "@sispumumc").toLowerCase()
        ] : [],
        "alignment": "HORIZONTAL_CENTER_TOP",
        "icon_rendering": "Social media icons inside solid vibrant red circular badges (#E52421) with clean white glyphs inside (Instagram camera, Facebook 'f', TikTok), followed by the handle text '@sispumumc' in clean black typography.",
        "styling": {
          "color": "#111111",
          "font_family": "Montserrat",
          "font_weight": "Bold",
          "case": "strictly_lowercase"
        },
        "exclusions": ["no_unrequested_icons", "no_duplicate_at_symbols", "no_bracketed_letters"]
      },
      "top_left_headline": {
        "typography_style": "Chunky bold display font with retro editorial curves (Cooper Black / Recoleta style)",
        "title_stack": rawLayers.filter(l => !l.conteudo.includes("@") && (l.funcao?.includes("Headline") || l.funcao?.includes("Título") || rawLayers.indexOf(l) === 0)).map((l, idx) => ({
          "line_number": idx + 1,
          "text": l.conteudo,
          "font_family": "Chunky_Bold_Display_Serif",
          "font_weight": "Extra_Bold_Black_900",
          "hex_color": l.cor || (idx === 0 ? "#00A650" : idx === 1 ? "#E52421" : "#FF5A00")
        })),
        "alignment": config.typographyPosition ? config.typographyPosition.toUpperCase() : "LEFT",
        "scale": "MASSIVE_HERO_IMPACT"
      },
      "middle_left_body_text": {
        "text_blocks": rawLayers.filter(l => !l.conteudo.includes("@") && (!l.funcao?.includes("Headline") && !l.funcao?.includes("Título") && rawLayers.indexOf(l) > 0)).map((l, idx) => ({
          "block_number": idx + 1,
          "text": l.conteudo,
          "font_family": l.fonte || "Montserrat",
          "font_weight": "SemiBold_600",
          "hex_color": l.cor || "#111111",
          "has_checkmark": l.conteudo.includes("✓") || l.conteudo.includes("Mas para continuar")
        })),
        "alignment": config.typographyPosition ? config.typographyPosition.toUpperCase() : "LEFT",
        "line_spacing": "COMFORTABLE_LEGIBLE"
      },
      "bottom_left_footer_logo": {
        "status": hasLogo ? "ACTIVE" : "INACTIVE",
        "logo_mode": isLogoOverlay ? "DIGITAL_POST_OVERLAY" : "NATIVE_CANVAS_EMBEDDED",
        "exact_spatial_position": "BOTTOM_LEFT_CORNER_BELOW_TEXT",
        "rendering_directive": "EXACT_1_TO_1_LOGO_CLONE: Replicate the EXACT client brand logo from the attached logo reference image with 100% fidelity. The logo consists of a 3D circle of colorful sculpted figures with arms around each other's shoulders (red, magenta, purple, blue, green, yellow, orange), positioned directly above the bold black condensed typography: 'SISPUMUMC' on the top line and 'MORRO DO CHAPÉU-BA' on the bottom line. Position this exact logo in the bottom-left footer under the body text. Do NOT simplify into a flat 2D wheel, do NOT alter the 3D sculpted figures, and do NOT change the typography.",
        "rules": [
          "Embed strictly in bottom-left footer under the body text layers",
          "NEVER place the logo in the top header or over the subject",
          "Preserve 100% of original 3D sculpted figure circle and exact black typography",
          "Zero dark container boxes or artificial black borders"
        ]
      },
      "bottom_right_quadrant_subject": {
        "status": config.desativarSujeito ? "INACTIVE" : "ACTIVE",
        "casting_directive": isCastingSwapRequested ? "NEW_PROFESSIONAL_MODEL" : "PRESERVE_REFERENCE_SUBJECT",
        "subject_profile": {
          "description": config.poseDescription || "Young Black Brazilian woman with natural short afro curly hair, wearing bright orange long-sleeve top and red hoop earrings",
          "wardrobe": "Vibrant orange long-sleeve knit top with red hoop earrings",
          "pose": "Thoughtful, reflective posture holding a dark smartphone in both hands and looking upwards to the left toward the headline",
          "framing": "Medium shot / bust from waist up",
          "quadrant": finalPlacement
        }
      }
    },
    "background_and_optics": {
      "background_type": "WHITE_WITH_SUBTLE_WAVY_DOODLE_LINES",
      "base_color_hex": "#FFFFFF",
      "texture_details": "Pristine white canvas with subtle, delicate light-gray wavy doodle line patterns throughout the background for depth and institutional modern design feel.",
      "camera_optics": {
        "sensor": "Full-frame 8K",
        "lens": "85mm f/1.4 G-Master Prime (stopped down to f/2.0)",
        "lighting": "Commercial studio softbox key light with delicate rim light separation from background",
        "dermal_physics": "Authentic 3-layer Subsurface Scattering (SSS) with visible micro-pores, zero beauty filter smoothing"
      }
    },
    "color_palette_lock": {
      "ambient_background": "#FFFFFF",
      "green_headline": "#00A650",
      "red_headline_and_badges": "#E52421",
      "orange_headline_and_outfit": "#FF5A00",
      "dark_text": "#111111"
    },
    "strict_governing_rules": {
      "language_lock": "pt-BR (Strictly Brazilian Portuguese)",
      "text_overwrite": "Completely erase all text, titles, numbers, and logos from reference images; render ONLY specified custom text layers",
      "font_name_policy": "Font names like Montserrat are style commands ONLY and must never be rendered as text",
      "anti_hallucination": "Zero duplicate words, zero unrequested dates, zero unrequested social media icons"
    }
  };

  return JSON.stringify(promptJson, null, 2);
};

/**
 * Builds the Supreme Master AI System Instruction Directive in structured JSON format.
 */
export const buildMasterSystemInstruction = (config: ProjectConfig): string => {
  const hasLogo = config.useLogo || !!config.logoBase64 || (Array.isArray(config.logosList) && config.logosList.length > 0);
  const isLogoOverlay = config.logoInclusionType === "overlay" && hasLogo;

  const systemInstructionJson = {
    "system_instruction": "ZION_SUPREME_AI_DIRECTIVE",
    "role": "Supreme Creative Director & Master Generative Art Director",
    "core_principles": {
      "1_biological_skin_realism": {
        "subsurface_scattering": "3-Layer Dermal Physics (Epidermis, Dermis, Subcutaneous Adipose) with warmth scattering along shadow terminators",
        "micro_displacement": "Authentic pores, fine skin grain, natural specular sebum highlights",
        "prohibition": "Zero AI beauty filters, zero plastic skin smoothing, zero doll-like faces"
      },
      "2_chiaroscuro_and_contrast": {
        "photon_budget": "Intentional directional lighting with strategic black clipping in deepest shadow crevices (100% shadow opacity)",
        "highlight_roll_off": "Natural specular roll-off on fabrics, jewelry, and metallic trims"
      },
      "3_kinesiology_and_anatomy": {
        "human_topology": "Strictly 2 arms, 2 legs, 2 hands with 5 distinct articulated fingers each",
        "pose_torque": "Natural body-to-head torque with realistic muscular tension in neck and shoulders",
        "gaze_vector": "Coherent gaze vector directed toward the specified focal point with crisp corneal catchlights",
        "dermal_deformation": "Physical contact flattening where fingers grip objects (e.g. smartphone)"
      },
      "4_optical_simulation": {
        "sensor_lens": "Sony A1 / Canon EOS R5 full-frame sensor with 85mm f/1.4 GM lens at f/2.0",
        "focal_plane": "Tack-sharp focus on subject eyes with organic circular bokeh and natural cat-eye edge falloff",
        "tonal_response": "Kodak Portra 400 tonal curve with rich midtone contrast"
      },
      "5_typography_and_layout_rigor": {
        "language_lock": "100% Brazilian Portuguese (pt-BR). Never translate, never add English filler words",
        "font_interpretation": "Font family names (Montserrat, Bebas Neue, etc.) are typographic style directives ONLY; never render font names as written text",
        "headline_weight": "Weight 900 (Black / Extra-Bold) for primary headlines with compact line height",
        "spatial_mirroring": "Strictly respect zone placement: Top-Center Header for social handle, Top-Left for headline, Middle-Left for body text, Bottom-Left for brand logo, Bottom-Right for model"
      },
      "6_branding_and_logo_placement": {
        "spatial_rule": isLogoOverlay
          ? "DIGITAL_OVERLAY_MODE: Leave logo space clean; real logo is overlaid post-generation"
          : hasLogo
          ? "NATIVE_LOGO_MIRRORING: Embed the client's official brand logo at the EXACT spatial location (bottom-left footer) where the reference logo was located. Never move a footer logo to the top header"
          : "NO_LOGO: Erase any logos from reference images; do not invent new logos",
        "fidelity": "100% exact 1:1 visual clone of the attached logo image (reproducing the circular group of colorful 3D sculpted figures with arms around each other's shoulders and the exact bold black condensed 'SISPUMUMC' and 'MORRO DO CHAPÉU-BA' typography underneath). Zero flat 2D reinterpretation, zero shape alteration.",
        "prohibition": "Zero unrequested logo transformations, zero container boxes, zero artificial borders"
      },
      "7_anti_hallucination_law": {
        "mandates": [
          "Render ONLY explicitly provided custom text layers",
          "Erase 100% of old reference text, dates, handles, and logos",
          "Render social media header with official Instagram camera glyph and Facebook 'f' glyph — never render bracketed plain letters like [O] or [f]",
          "Zero unrequested social media icons (no TikTok, no YouTube unless requested)",
          "Zero duplicate words or duplicate @ symbols"
        ]
      }
    }
  };

  return JSON.stringify(systemInstructionJson, null, 2);
};
