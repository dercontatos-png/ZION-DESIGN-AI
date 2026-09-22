/**
 * ═══════════════════════════════════════════════════════════════════════
 * PROMPT ENGINE — Motor de Prompt Profissional para Geração de Imagens
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Este módulo é o "cérebro" do sistema de geração. Ele transforma os
 * campos simples do formulário em prompts de nível profissional de
 * fotografia cinematográfica, com descrições detalhadas de:
 * - Câmera, lente e enquadramento
 * - Iluminação e física da luz
 * - Foco e profundidade de campo
 * - Paleta de cores e cor grading
 * - Captura e textura de pele
 * - Pose e expressão facial
 * - Composição e checklist final
 */

// ─── TYPES ────────────────────────────────────────────────────────────

export interface PromptEngineParams {
  estilo_visual?: string;
  plano?: string;
  genero?: string;
  subject_description?: string;
  subject_position?: string;
  scene_description?: string;
  nicho_projeto?: string;
  prompt_adicional?: string;
  dimensions?: string;
  quality?: string;
  sobriedade?: string | number;
  color_palette?: Record<string, string> | null;
  text_blocks?: any[];
  elementos_flutuantes?: string;
  usar_desfoque_blur?: string;
  degrade?: string;
  posicao_do_texto?: string;
  categoria?: string;
  hasSubjectPhotos?: boolean;
  hasStyleRefs?: boolean;
  hasEnvironmentRefs?: boolean;
  hasBrandImages?: boolean;
}

export type PromptCategory =
  | "retrato_cinematico"
  | "retrato_editorial"
  | "acao"
  | "produto"
  | "gastronomia"
  | "cenario_pov"
  | "meme_social"
  | "publicitario"
  | "estilo_aplicado"
  | "card_social"
  | "banner_web"
  | "generico";

// ─── CAMERA PRESETS ───────────────────────────────────────────────────

const CAMERA_PRESETS: Record<string, string> = {
  portrait_85mm: `Lens 85mm on a full-frame sensor, camera at eye level, held perfectly level with no tilt, square to the subject. Aperture f/2 for shallow depth of field with creamy bokeh. The subject's head occupies roughly one third of the frame height, centred horizontally.`,

  portrait_50mm: `Lens 50mm on a full-frame sensor, camera at the subject's eye level, held level with no tilt. Aperture f/2.8. The subject fills the centre of the composition with comfortable headroom above and below.`,

  action_fisheye: `Lens 15mm fisheye on a full-frame sensor, camera placed at ground level and tilted up approximately 40 degrees. Aperture f/8 for broad depth. The wide lens bows every straight line outward from the centre — the horizon curves, kerbs bend, and objects nearest the lens are dramatically enlarged while those further away compress rapidly.`,

  product_low: `Lens 85mm on a full-frame sensor, camera positioned low at approximately 35 degrees above the surface plane. Aperture f/7.1. The product is strongly foreshortened, appearing wider at the near edge and narrower at the far edge, creating visual depth and monumentality.`,

  editorial_full: `Lens 85mm on a full-frame sensor, camera at the height of the seated chest, held perfectly level with no tilt. Aperture f/5.6. The entire figure and setting are contained within the frame. Vertical lines remain perfectly vertical with no distortion.`,

  pov_wide: `Lens 16mm on a full-frame sensor, camera placed inside an enclosed space (appliance, vehicle, container), pointing outward through an opening. Aperture f/4. The wide lens compresses depth and exaggerates near objects, creating a dramatic inside-looking-out perspective. Side walls converge sharply toward the opening.`,

  close_bust: `Lens 85mm on a full-frame sensor, camera at eye level, held perfectly level. Aperture f/2. Bust-length framing — the head is large and close, occupying approximately one third of the frame height, centred. The bottom edge crosses the torso at chest or waist level.`,

  medium_cinematic: `Lens 50mm on a full-frame sensor, camera at chest height, held level with a slight upward angle of 5 degrees. Aperture f/2.8. Medium shot framing captures from mid-chest up, with dramatic negative space in the composition.`,

  overhead_product: `Lens 50mm–70mm equivalent, camera positioned directly above the subject, looking down. Aperture f/4–f/5.6. Frontal, slightly elevated perspective. Clean, geometric composition with the product centred.`,
};

// ─── LIGHTING PRESETS ─────────────────────────────────────────────────

const LIGHTING_PRESETS: Record<string, string> = {
  cinematic_portal: `Everything is lit by a single large backlight source — a glowing portal, ring, or panel directly behind the subject. Because it sits behind, it rims: a bright coloured edge runs along the top of the head, down the outer line of each shoulder and the outer edge of the near arm. That rim varies in width, brightens where form catches the source, and breaks completely where the form turns away — it must never run as a continuous even line. The same source spills forward just enough to reach the front of the face, opening features with soft shadow edges — a band under the brow, a short shadow under the nose, a soft shadow under the chin. The rest of the frame falls away to near-black at all four corners. Every transition curves with the surface it crosses; nothing is straight-edged. The lighting sets brightness and falloff only.`,

  hard_sun: `Hard direct sun, high and to the upper right and slightly behind the subject. It is a small hard source, so every shadow edge is crisp: the chin drops a defined shadow onto the chest, the nose lays a short defined shadow onto the cheek, and the muscles are cut apart by sharp shadow lines. Because the sun is behind and to the side, it rims the edge of the arm, the shoulder and the head with a bright hard line that varies in width and breaks where the form turns away. A large defined shadow falls on the ground, its edge crisp and its interior open and readable. Light bouncing off bright surfaces fills the shadow side so nothing blocks up. Every transition curves with the surface it crosses.`,

  studio_product: `A single hard source placed high and to the right and slightly behind, raking down across the scene. Because it is hard, every element casts a defined shadow: the product lays a clear shadow to the left, every object in the scene is modelled on one side and dark on the other. The rim highlights on metal edges are the brightest elements in the frame. The product sits about a stop below them. The background carries a soft brighter wedge where the light spills, falling off to two stops down at the far edge. Every transition curves with the surface it crosses.`,

  fridge_overhead: `A single source: the built-in overhead LED panel, directly above and slightly in front. It is small and close, so it lights everything from straight above with steep falloff. The top of the head and shoulders are brightest; the brow ridge drops a defined band of shadow into both eye sockets; the nose lays a short shadow straight down. The reaching hand, being closest and turned toward the camera, is lit by bounced light off the white walls. Objects on the shelf are lit on upper surfaces and dark on sides. The space behind receives none of this light and sits four stops down.`,

  fire_underlighting: `Three sources. The first is a fire/flame, low and central, close to the chest and below the face: it lights everything from beneath, so the underside of the chin, throat, lower lip, underside of the nose and fingers are all lit from below with crisp shadow edges running upward. The second is a coloured rim source placed high and behind, which rims the hair, cheekbone and shoulder with a coloured edge. The third is a weak fill from the opposite side that opens shadows just enough for readability.`,

  overcast_soft: `Open overcast daylight, very large and soft. On the subject it lays an even, almost shadowless light with only gentle modelling — a soft band under the brow, a short soft shadow under the nose, a soft shadow under the chin, all with wide gradual edges. Light bouncing off the ground fills the underside from below. Every transition is gradual with no hard edges.`,

  warm_frontal: `Two systems. Behind: a large circular ring or panel that owns the rims on hair, shoulders and arms and the entire background luminance. In front: a single soft source placed close to the camera axis and just above it, lighting the face frontally and evenly. The shadow under the nose is short and drops almost straight down, both eye sockets stay filled with catchlights, the brow ridge lays only a narrow soft band. The lit and shadow sides of the face are separated by only about one stop.`,

  commercial_studio: `Clean, bright commercial studio lighting. Large diffused softbox produces even, flattering illumination across the subject with gentle transition to soft shadows. Subtle rim light separates the subject from the background. Catchlights are crisp and natural in the eyes. Tonal transitions are smooth and professional with zero harsh shadows.`,

  cinematic_subtle: `Refined cinematic lighting with soft directional key light and gentle atmospheric fill. Highlights sculpt the subject naturally, shadows remain open with readable detail. Soft, organic separation between foreground and background.`,

  dramatic_stage: `Strong directional key light from the front-right with warm, slightly orange tint casting distinct highlights. Secondary softer fill light from front-left prevents harsh shadows. Cool-hued rim lighting along the opposite shoulder and hair separates the subject from the dark background. Deep shadows in fabric folds and under the chin with high contrast ratio.`,
};

// ─── FOCUS PRESETS ────────────────────────────────────────────────────

const FOCUS_PRESETS: Record<string, string> = {
  shallow_portrait: `Depth-of-field blur only, no motion blur anywhere; every edge is a still edge. Critical sharpness sits on the eyes — the individual lashes, the iris texture, the pores and fine lines across the cheekbone are all resolved — and carries through the spectacle frame, the collar and the near shoulder. Everything behind the subject dissolves into soft bokeh. Foreground elements closest to the lens are heavily out of focus.`,

  deep_action: `Depth-of-field blur only, no motion blur anywhere; every edge is a still edge and the stride is frozen. The wide-angle lens at this aperture holds almost everything sharp: skin texture, fabric mesh, road aggregate are all fully resolved. Only the very nearest edge at the extreme bottom is beginning to soften. Background buildings are marginally soft. The sky is smooth.`,

  product_selective: `Depth-of-field blur only, no motion blur anywhere; every edge is a still edge and nothing in the air is streaked. Critical sharpness sits on the near rim and the front third of the product surface. The far end is slightly soft. Objects nearest the lens are noticeably soft while their shapes stay completely readable. The background is smooth and entirely off the plane of sharpness.`,

  pov_enclosed: `Depth-of-field blur only, no motion blur anywhere. Critical sharpness sits on the eyes — lashes, iris texture, pores across the cheeks are all resolved. The plane of sharpness carries the whole face and collar. Objects inside the enclosure closest to the lens are noticeably softer, outlines spread while remaining identifiable. The exterior background is slightly soft.`,

  bust_shallow: `Depth-of-field blur only, no motion blur anywhere; every edge is a still edge. Critical sharpness on the eyes — individual lashes, iris texture, creases at the outer corners and pores across the cheeks are all resolved — and carries through the teeth, hair and neckline. Background elements are slightly soft. Fine grain is visible throughout.`,
};

// ─── COLOUR PRESETS ───────────────────────────────────────────────────

const COLOUR_PRESETS: Record<string, string> = {
  clean_commercial: `Vibrant, high-end commercial color grading. Clean whites, authentic skin tones, and rich contrast. Colors are punchy, appealing, and true to life with zero artificial color cast.`,

  violet_warm_exception: `A violet picture with one warm exception, and the violet has a structure. At bright source cores the light reads as pure white. Moving outward it takes on colour — through hot magenta, then deep saturated violet, then dark blue-purple where the glow dies. The subject's skin keeps its natural tone and stays warm — this is the hardest thing to hold, because everything around it is violet, and the face must read as living flesh rather than as a violet surface.`,

  saturated_clashing: `Saturated and deliberately clashing. Three high-chroma notes carry the picture. Against them, neutral black in the dark clothing. Around all of that the setting is muted — a full step less saturated than the subject, so the figure separates hard from the background. The skin keeps its natural warm tone under the hard sun.`,

  single_hue_product: `A single-hue picture with one dark counterpoint. Everything in the frame except the contrast element is a version of the dominant colour: the background a deep saturated tone, the surface slightly darker, the product a pale creamy version. Against that, the contrast element is a deep near-black and is the only dark value. There is no colour outside this family.`,

  warm_amber_ring: `A single warm family with no exception, and the warmth has a structure rather than being a flat wash. At the brightest point the light reads as pure white. Moving outward the tone deepens and warms — through saturated orange, then amber, then rich amber-brown. Moving further it falls into deep warm brown and finally warm near-black at the corners — never cooling toward grey or blue. The skin keeps its own colour on top of the warm light.`,

  cool_domestic: `A cool, low-saturation picture with a few warm objects placed in it. The environment and lighting are cool: white, cool grey, blue-leaning shadow. Against that, a few warm accents: the product colours, skin tone. The skin stays warm and slightly ruddy and must not turn grey or blue under the cool light.`,

  natural_balanced: `Natural color grading, vibrant but not overly saturated. Balanced tones with authentic skin rendering. The palette follows the scene's own natural colours with no artificial colour cast. Warm and cool tones coexist naturally.`,

  cinematic_fire: `Two colour families in opposition. Cool: violet and deep purple across the background, coloured rims on hair and face. Warm: the fire/flame and everything it touches — underside of chin, throat, fingers. Skin tones are warmed and pushed golden where the fire reaches, cooled toward violet on the sides. There is no green except in specific accent objects.`,
};

// ─── CAPTURE RULES ────────────────────────────────────────────────────

const CAPTURE_RULE = `A real exposure made on a full-frame camera. Light falls off toward the four corners. Highlights on bright sources clip hard and stay small; lit surfaces clip softly and keep their modelling. Shadows stay open — dark areas hold readable detail and surface texture rather than collapsing to black. Every repeated element varies: no two textures, no two highlights, no two shadows are identical or evenly spaced. Render skin as a real camera renders skin, whatever skin the reference provides: pores and fine surface texture resolved, individual hairs at the hairline and brows resolved, tone varying across the face rather than running uniform, and a slight specular sheen on the forehead, nose and cheekbones. Do not smooth, retouch or plasticise it, and do not add or subtract any feature. Visible fine grain throughout, heavier in dark areas.`;

// ─── COMPOSITION & SAFE MARGIN RULES ──────────────────────────────────

const COMPOSITION_RULES = `
CRITICAL COMPOSITION & SAFE MARGIN LAW (HIGHEST PRIORITY):
- FULL-BLEED EDGE-TO-EDGE ARTWORK: The entire composition, background, and environment MUST fill the full canvas edge-to-edge. Never render the artwork as a miniature card sitting inside a border or framed background.
- ABSOLUTE BAN ON RECTANGULAR CARDS, BOXES, OR ENCLOSING CONTAINERS (CRITICAL — NON-NEGOTIABLE):
  * NEVER draw a floating rounded rectangle card, white box, dialog popup container, or framed outline panel in the middle of the canvas!
  * NEVER enclose headlines, text blocks, bullet points, or logos inside a central card or container box!
  * Typography, logos, and icons MUST float seamlessly and cleanly directly over the scene/background with natural contrast and subtle depth, exactly like top-tier commercial advertising and modern high-end posters.
- COLLAGE / MULTI-IMAGE REFERENCES: If any attached reference image contains a grid, split-screen, or multiple images, treat it as a collection of style inspirations. Render ONE (1) cohesive single full-canvas artwork — NEVER replicate a split-screen or multi-box grid!
- ABSOLUTE BAN ON GLUING TO BORDERS: Maintain a generous minimum padding/margin of 8% to 12% inward from ALL 4 outer canvas borders. Elements must never touch or be clipped by the borders.
- BRAND LOGO PLACEMENT (EXACTLY ONE SINGLE LOGO):
  * Render EXACTLY ONE (1) single brand logo on the entire canvas, centered horizontally in the top header with at least 8% to 10% margin from borders.
  * ABSOLUTE PROHIBITION AGAINST DUPLICATE LOGOS: ZERO duplicate logos, ZERO twin logos side by side, ZERO repeated crests! NEVER render more than one logo on the entire artwork!
- TOP & BOTTOM HEADROOM: Top handle/header must float with at least 6% to 8% margin from the top edge. Bottom contact info must float with at least 7% to 10% margin from the bottom edge.
- NEGATIVE RESTRICTIONS: ZERO duplicate logos, ZERO twin logos, ZERO multiple crests, ZERO empty canvas voids, ZERO awkward gaps between cards and footer.`;

// ─── ANATOMY SAFETY ───────────────────────────────────────────────────

const ANATOMY_RULE = `
ANATOMY SAFETY RULE (CRITICAL — non-negotiable):
Every human subject in the final image MUST have:
- EXACTLY 2 arms (not 3, not 4, not 1)
- EXACTLY 2 hands with 5 fingers each (no extra fingers)
- EXACTLY 2 legs (unless framing cuts them off)
- EXACTLY 1 head with normal human proportions
- Normal, symmetric, anatomically correct human body
No extra limbs, no floating hands, no duplicated body parts.`;

// ─── PHOTOREALISTIC QUALITY DIRECTIVES ────────────────────────────────

const PHOTOREALISM_DIRECTIVES = `
PHOTOREALISTIC QUALITY DIRECTIVES:

Skin & facial realism:
- Visible pores in T-zone and cheeks
- Natural skin texture with authentic grain
- Fine vellus hair visible in raking light
- Slight facial asymmetry, no perfect symmetry
- Organic, slightly imprecise catchlights
- No beauty filter, no digital retouching
- Natural skin tone variation (light blemishes, subtle redness)

Lens optics simulation:
- Focus plane: eyes sharp, ear tip soft
- Bokeh: circular highlights with slight cat-eye distortion at edges
- Chromatic aberration: subtle purple fringe at high-contrast edges

Film emulsion simulation:
- Grain visible in shadows, creamy in highlights
- Grain structure: organic, not uniform — varies by luminance zone
- Slight halation around light sources
- Shadow detail: crushed but not clipped (separation preserved)`;

// ─── CATEGORY DETECTION ───────────────────────────────────────────────

function detectCategory(params: PromptEngineParams): PromptCategory {
  const desc = (
    (params.subject_description || "") +
    " " +
    (params.scene_description || "") +
    " " +
    (params.nicho_projeto || "") +
    " " +
    (params.prompt_adicional || "") +
    " " +
    (params.estilo_visual || "") +
    " " +
    (params.categoria || "")
  ).toLowerCase();

  // POV / Inside scenes
  if (/dentro|inside|pov|geladeira|maquina.*lavar|refrigerador|fridge|washing|toilet|banheiro/i.test(desc)) {
    return "cenario_pov";
  }
  // Action / Sports
  if (/acao|action|correndo|running|esporte|sport|fitness|atleta|athlete|fisheye|dinamico/i.test(desc)) {
    return "acao";
  }
  // Food / Gastronomy
  if (/comida|food|gastronomia|gastro|prato|drink|gelato|sorvete|restaurante|chef|culinaria/i.test(desc)) {
    return "gastronomia";
  }
  // Product / Packshot
  if (/produto|product|packshot|embalagem|can|lata|frasco|garrafa|bottle|telefone|phone|celular|mockup/i.test(desc)) {
    return "produto";
  }
  // Meme / Social
  if (/meme|delivery|entrega|comemoracao|celebration|humor|engracado|funny/i.test(desc)) {
    return "meme_social";
  }
  // Style applied / Voxel / Geometric
  if (/voxel|pixel|geometric|estilo.*aplicado|blocky|style.*transfer|filtro/i.test(desc)) {
    return "estilo_aplicado";
  }
  // Advertising / Stage
  if (/palco|stage|show|concert|artista|musical|publicidade|advertising|campanha/i.test(desc)) {
    return "publicitario";
  }
  // Editorial portrait
  if (/editorial|lookbook|moda|fashion|corpo.*inteiro|full.*length|full.*body|formal|blazer|terno|suit/i.test(desc)) {
    return "retrato_editorial";
  }
  // Card / Social post / Banner
  if (/card|social|post|feed|stories|flyer|banner|anuncio|promo/i.test(desc)) {
    return "card_social";
  }
  // Cinematic portrait (default for person-focused)
  if (params.hasSubjectPhotos || /retrato|portrait|pessoa|person|face|rosto|headshot|busto|bust/i.test(desc)) {
    return "retrato_cinematico";
  }
  // Banner web
  if (/banner.*web|landing|ecommerce|e-commerce|loja|header/i.test(desc)) {
    return "banner_web";
  }

  return "generico";
}

// ─── PRESET SELECTION ─────────────────────────────────────────────────

interface PresetSelection {
  camera: string;
  lighting: string;
  focus: string;
  colour: string;
}

function selectPresets(category: PromptCategory, params: PromptEngineParams): PresetSelection {
  switch (category) {
    case "retrato_cinematico": {
      const isPortalTheme = /portal|violet|roxo|neon|backlight|cyber/i.test((params.prompt_adicional || "") + " " + (params.scene_description || ""));
      return {
        camera: CAMERA_PRESETS.portrait_85mm,
        lighting: isPortalTheme ? LIGHTING_PRESETS.cinematic_portal : LIGHTING_PRESETS.cinematic_subtle,
        focus: FOCUS_PRESETS.shallow_portrait,
        colour: isPortalTheme ? COLOUR_PRESETS.violet_warm_exception : COLOUR_PRESETS.natural_balanced,
      };
    }
    case "retrato_editorial":
      return {
        camera: CAMERA_PRESETS.editorial_full,
        lighting: LIGHTING_PRESETS.warm_frontal,
        focus: FOCUS_PRESETS.bust_shallow,
        colour: COLOUR_PRESETS.natural_balanced,
      };
    case "acao":
      return {
        camera: CAMERA_PRESETS.action_fisheye,
        lighting: LIGHTING_PRESETS.hard_sun,
        focus: FOCUS_PRESETS.deep_action,
        colour: COLOUR_PRESETS.saturated_clashing,
      };
    case "produto":
      return {
        camera: CAMERA_PRESETS.product_low,
        lighting: LIGHTING_PRESETS.studio_product,
        focus: FOCUS_PRESETS.product_selective,
        colour: COLOUR_PRESETS.single_hue_product,
      };
    case "gastronomia":
      return {
        camera: CAMERA_PRESETS.product_low,
        lighting: LIGHTING_PRESETS.studio_product,
        focus: FOCUS_PRESETS.product_selective,
        colour: COLOUR_PRESETS.single_hue_product,
      };
    case "cenario_pov":
      return {
        camera: CAMERA_PRESETS.pov_wide,
        lighting: LIGHTING_PRESETS.fridge_overhead,
        focus: FOCUS_PRESETS.pov_enclosed,
        colour: COLOUR_PRESETS.cool_domestic,
      };
    case "meme_social":
      return {
        camera: CAMERA_PRESETS.portrait_50mm,
        lighting: LIGHTING_PRESETS.hard_sun,
        focus: FOCUS_PRESETS.deep_action,
        colour: COLOUR_PRESETS.saturated_clashing,
      };
    case "publicitario":
      return {
        camera: CAMERA_PRESETS.medium_cinematic,
        lighting: LIGHTING_PRESETS.commercial_studio,
        focus: FOCUS_PRESETS.shallow_portrait,
        colour: COLOUR_PRESETS.clean_commercial,
      };
    case "estilo_aplicado":
      return {
        camera: CAMERA_PRESETS.portrait_50mm,
        lighting: LIGHTING_PRESETS.overcast_soft,
        focus: FOCUS_PRESETS.bust_shallow,
        colour: COLOUR_PRESETS.natural_balanced,
      };
    case "card_social":
      return {
        camera: CAMERA_PRESETS.portrait_85mm,
        lighting: LIGHTING_PRESETS.commercial_studio,
        focus: FOCUS_PRESETS.shallow_portrait,
        colour: COLOUR_PRESETS.clean_commercial,
      };
    case "banner_web":
      return {
        camera: CAMERA_PRESETS.medium_cinematic,
        lighting: LIGHTING_PRESETS.commercial_studio,
        focus: FOCUS_PRESETS.shallow_portrait,
        colour: COLOUR_PRESETS.clean_commercial,
      };
    default:
      return {
        camera: CAMERA_PRESETS.portrait_85mm,
        lighting: LIGHTING_PRESETS.commercial_studio,
        focus: FOCUS_PRESETS.shallow_portrait,
        colour: COLOUR_PRESETS.clean_commercial,
      };
  }
}

// ─── EXPRESSION BUILDERS ──────────────────────────────────────────────

function buildExpressionBlock(category: PromptCategory): string {
  switch (category) {
    case "retrato_cinematico":
      return `EXPRESSION — Composed and unreacting. The brows sit level and untensed, with only the faintest crease between them. The upper eyelids are open and steady and the lower lids relaxed, the eyes holding the lens without narrowing. The lips are closed and lightly together, the corners exactly level. The jaw is loose and the cheeks are still. Nothing in the face responds to the environment, and that stillness is the point.`;

    case "meme_social":
      return `EXPRESSION — Both subjects are laughing genuinely. The cheeks lift high, pushing the lower eyelids up so each eye narrows into a shallow curve and creases fan from the outer corners. The corners of the mouth pull up and back, the jaw drops, the mouth opens wide with upper teeth showing and lower lip relaxed and curved. The fold from nostril to mouth corner deepens sharply. The whole upper face moves with the mouth rather than staying still.`;

    case "acao":
      return `EXPRESSION — Effort held rather than shown. The brows are lowered slightly and drawn together, raising one shallow vertical crease between them. The eyelids are narrowed against the sun, the gaze locked ahead. The nostrils are widened. The lips are closed and pressed into a level line. The jaw is set but not clenched. The cheeks are still.`;

    case "cenario_pov":
      return `EXPRESSION — Both brows are raised slightly into shallow arches, the eyes open wide and steady, fixed on the lens. The lips are parted a small amount with the jaw dropped a fraction, the corners level. The whole face reads as caught mid-thought rather than as reacting — natural and unposed.`;

    case "publicitario":
      return `EXPRESSION — A pleasant, confident, engaged expression. The brows sit naturally. The eyes are warm and direct, meeting the lens with confidence. A slight, natural smile engages the cheeks without exaggeration. The overall mood is professional, approachable and charismatic.`;

    case "produto":
    case "gastronomia":
      return ""; // No expression needed for product/food shots

    case "retrato_editorial":
      return `EXPRESSION — Neutral and controlled. The brows sit low and level. The eyes are open and steady, the gaze fixed and direct. The lips are closed into a straight line. The jaw is set. The whole expression sits in the gaze — deliberate and focused.`;

    default:
      return `EXPRESSION — Natural and direct. The eyes meet the lens with confidence, the face relaxed but engaged. The expression is authentic and unforced.`;
  }
}

// ─── MAIN PROMPT BUILDER ──────────────────────────────────────────────

/**
 * Builds a professional-level prompt from simple form fields.
 * Detects the generation category and applies the appropriate
 * cinematographic presets for camera, lighting, focus, colour, and capture.
 */
export function buildEnhancedPrompt(params: PromptEngineParams): string {
  const category = detectCategory(params);
  const presets = selectPresets(category, params);
  const sobriety = Number(params.sobriedade) || 50;
  const sobrietyText = sobriety < 30
    ? "sober and conservative"
    : sobriety > 70
      ? "highly creative and expressive"
      : "balanced";
  const targetQuality = (params.quality || "1K").toUpperCase();
  const aspectRatio = params.dimensions || "1:1";

  // Detect if this is an institutional/educational context
  const isInstitutional = /sa[uú]de|curso|ensino|escola|faculdade|educa|institucional|prefeitura|m[ée]dic|hospital/i.test(params.nicho_projeto || "") ||
    /sa[uú]de|curso|ensino|escola|faculdade|educa|institucional|prefeitura|m[ée]dic|hospital/i.test(params.prompt_adicional || "");

  // Determinação prévia do alinhamento para balanceamento espacial
  const validTextBlocksList = (params.text_blocks || []).filter((b: any) => b && typeof b === "object" && String(b.content || b.text || "").trim());
  const rawTextPosMode = (params.posicao_do_texto || "").toLowerCase();
  const hasLeftBlockCheck = validTextBlocksList.some((b: any) => /left|esq/i.test(b.position || ""));
  const hasRightBlockCheck = validTextBlocksList.some((b: any) => /right|dir/i.test(b.position || ""));
  const isLeftAlign = rawTextPosMode.includes("left") || rawTextPosMode.includes("esq") || hasLeftBlockCheck;
  const isRightAlign = rawTextPosMode.includes("right") || rawTextPosMode.includes("dir") || hasRightBlockCheck;
  const alignmentModeGlobal = isLeftAlign ? "left" : isRightAlign ? "right" : "center";

  let effectiveSubjectPosition = params.subject_position || "center";
  if (alignmentModeGlobal === "left") {
    effectiveSubjectPosition = "strictly on the RIGHT SIDE of the frame (occupying the right 55% of canvas width, leaving the left 45% clear for the typography stack)";
  } else if (alignmentModeGlobal === "right") {
    effectiveSubjectPosition = "strictly on the LEFT SIDE of the frame (occupying the left 55% of canvas width, leaving the right 45% clear for the typography stack)";
  }

  const parts: string[] = [];

  // ── OPENING ──
  if (isInstitutional) {
    parts.push(`Professional premium institutional advertising artwork, edge-to-edge full canvas design, masterpiece, top-tier agency quality, ultra-detailed, ${targetQuality} resolution, commercial studio lighting, sharp focus, highly aesthetic.`);
  } else if (category === "card_social" || category === "banner_web") {
    parts.push(`Professional premium commercial advertising visual, edge-to-edge full canvas artwork, masterpiece, top-tier agency quality, ultra-detailed, ${targetQuality} resolution, commercial studio lighting, sharp focus, highly aesthetic.`);
  } else {
    parts.push(`Professional ${targetQuality} cinematic photograph, masterpiece quality, ultra-detailed, photorealistic.`);
  }

  // ── VISUAL STYLE ──
  parts.push(`Visual Style: ${params.estilo_visual || "Ultra Realista"}. Creative Level: ${sobrietyText} (${sobriety}/100).`);

  // ── SUBJECT ──
  const allSubText = `${params.subject_description || ""} ${params.prompt_adicional || ""}`.toLowerCase();
  const userRequestedNoPerson = /sem (pessoa|modelo|mulher|homem|sujeito)|deixe.*quadrado|quadrados? branco|colocar foto depois|apenas (o )?layout|sem foto/i.test(allSubText);

  if (userRequestedNoPerson || (!params.hasSubjectPhotos && params.categoria === "livre")) {
    parts.push(`ABSOLUTE PROHIBITION OF HUMAN MODELS: ZERO people, ZERO women, ZERO nurses, ZERO doctors, ZERO human figures! The user explicitly did not attach a person photo and requested empty boxes for later insertion. Do NOT paint any human model into the artwork!
Photo Slots & Gap Elimination (Zero Dead Space):
- Render exactly THREE (3) clean, prominent, large white rectangular placeholder boxes arranged horizontally side-by-side ("um do lado do outro no meio grande") with clean rounded corners and pure solid white fill (#FFFFFF).
- VERTICAL HARMONY & GAP ELIMINATION: The composition MUST NOT have any vacant dead space or empty gap between the photo boxes and the bottom footer contact bar!
- If the technical course bullet points are positioned above the three boxes, the three white boxes MUST be tall portrait cards (aspect ratio 3:4) that extend with generous vertical height downwards to sit comfortably right above the footer contact bar (maintaining only 6% to 8% safe breathing room above the WhatsApp phone and social handle), completely eliminating any empty void beneath them!
- If the technical course bullet points are positioned below the three boxes, they must neatly occupy and balance the lower-middle zone, bridging smoothly into the bottom footer contact bar.
- ZERO EMPTY VOIDS: Every vertical section of the canvas must have balanced purpose and presence!`);
  } else {
    const isGroupSubject = /todos|grupo|equipe|turma|pessoas|foto/i.test(params.subject_description || "");
    if (isGroupSubject) {
      parts.push(`Main subjects / Group: ${params.subject_description || "Replicate all people from the reference photo"}. Ensure all individuals from the photo appear naturally in the composition, positioned at ${effectiveSubjectPosition}.`);
    } else {
      const subDesc = (params.subject_description || "").toLowerCase();
      const hasFemaleClue = /mulher|feminina?|garota|menina|m[ée]dica|doutora|enfermeira|atriz|modelo\s*feminina|woman|female|girl/i.test(subDesc);
      const hasMaleClue = /homem|masculino?|garoto|menino|m[ée]dico|doutor|enfermeiro|ator|modelo\s*masculino|man|male|boy/i.test(subDesc);
      let resolvedGender = params.genero;
      if (hasFemaleClue && !hasMaleClue) resolvedGender = "female";
      else if (hasMaleClue && !hasFemaleClue) resolvedGender = "male";

      let subjectText = "";
      if (resolvedGender && resolvedGender !== "Não aplicável" && resolvedGender !== "Livre" && params.categoria !== "livre") {
        const genLabel = resolvedGender === "female" ? "female person/woman" : resolvedGender === "male" ? "male person/man" : resolvedGender;
        subjectText = `${genLabel}${params.subject_description ? `, ${params.subject_description}` : ""}`;
      } else if (params.subject_description) {
        subjectText = params.subject_description;
      }

      if (subjectText) {
        parts.push(`MANDATORY PROMINENT SUBJECT: The composition MUST prominently feature the main subject: ${subjectText}, positioned ${effectiveSubjectPosition}, naturally and realistically integrated into the scene and dressed in attire appropriate for the context (e.g. professional uniform, work clothes, or context-appropriate apparel). DO NOT omit or hide the subject!`);
      }
    }
  }

  // ── REFERENCE IMAGES HARMONIZATION ──
  if (params.hasStyleRefs || params.hasEnvironmentRefs) {
    parts.push(`\nVISUAL REFERENCE INTEGRATION (MANDATORY):
- Faithfully adopt the aesthetic style, photographic lighting quality, spatial depth, and color mood of the attached reference images.
- The environment and scene must feel rich, natural, and immersive, matching the production value of the references.
- If reference images show multiple panels or a collage grid, render ONE (1) unified, seamless full-canvas scene — NEVER replicate split-screen collages!`);
  }

  // ── NICHE ──
  if (params.nicho_projeto) {
    parts.push(`Business niche/theme: ${params.nicho_projeto}.`);
  }

  // ── SCENE / ENVIRONMENT ──
  if (params.scene_description) {
    parts.push(`Environment/Background: ${params.scene_description}.`);
  }

  // ── CAMERA & FRAMING (Professional) ──
  parts.push(`\nFRAMING AND CAMERA — Aspect ratio ${aspectRatio}, ${aspectRatio === "9:16" || aspectRatio === "3:4" ? "vertical" : aspectRatio === "16:9" || aspectRatio === "4:3" ? "horizontal" : "square"}. ${presets.camera}`);

  // ── EXPRESSION (when applicable) ──
  const expressionBlock = buildExpressionBlock(category);
  if (expressionBlock) {
    parts.push(`\n${expressionBlock}`);
  }

  // ── LIGHTING (Professional) ──
  parts.push(`\nLIGHTING — ${presets.lighting}`);

  // ── FOCUS (Professional) ──
  parts.push(`\nFOCUS — ${presets.focus}`);

  // ── COLOUR (Professional) ──
  parts.push(`\nCOLOUR — ${presets.colour}`);

  // ── BRAND COLOR PALETTE ──
  if (params.color_palette && Object.keys(params.color_palette).length > 0) {
    const bg = params.color_palette.ambient_color || "#0d1e49";
    const primary = params.color_palette.complementary_light || "#128ab6";
    const secondary = params.color_palette.complementary_color || "#ffffff";
    parts.push(`\nBRAND COLOR PALETTE:
- Ambient/Atmospheric Tone: ${bg}.
- Primary Brand Accent: ${primary}.
- Secondary / Text Color: ${secondary}.
- Harmonize these brand colors elegantly with the lighting and environment of the reference images.`);
  }

  // ── TYPOGRAPHY ──
  if (params.text_blocks && params.text_blocks.length > 0) {
    const validTextBlocks = params.text_blocks.filter((b: any) => b && typeof b === "object" && String(b.content || b.text || "").trim());
    if (validTextBlocks.length > 0) {
      const rawTextPos = (params.posicao_do_texto || "").toLowerCase();
      const h1Block = validTextBlocks.find((b: any) => (b.type || "").toLowerCase() === "h1") || validTextBlocks[0];
      const h1Pos = (h1Block?.position || rawTextPos).toLowerCase();
      const isLeft = h1Pos.includes("left") || h1Pos.includes("esq");
      const isRight = h1Pos.includes("right") || h1Pos.includes("dir");
      const alignmentMode = isLeft ? "left" : isRight ? "right" : "center";

      const formatZone = (raw: string) => {
        const r = (raw || "").toLowerCase().replace(/_/g, "-");
        if (r.includes("bottom-left") || (r.includes("baixo") && r.includes("esq"))) return "BOTTOM-LEFT";
        if (r.includes("bottom-right") || (r.includes("baixo") && r.includes("dir"))) return "BOTTOM-RIGHT";
        if (r.includes("bottom") || r.includes("baixo") || r.includes("↓") || r.includes("footer") || r.includes("rodapé")) return "BOTTOM-CENTER";
        if (r.includes("top-left") || (r.includes("cima") && r.includes("esq"))) return "TOP-LEFT";
        if (r.includes("top-right") || (r.includes("cima") && r.includes("dir"))) return "TOP-RIGHT";
        if (r.includes("top") || r.includes("cima") || r.includes("↑") || r.includes("header") || r.includes("cabeçalho")) return "TOP-CENTER";
        if (r.includes("middle-left") || (r.includes("meio") && r.includes("esq")) || r === "left" || r.includes("esquerda")) return "MIDDLE-LEFT";
        if (r.includes("middle-right") || (r.includes("meio") && r.includes("dir")) || r === "right" || r.includes("direita")) return "MIDDLE-RIGHT";
        if (r.includes("middle-center") || (r.includes("meio") && r.includes("cen")) || r === "center" || r.includes("centro")) return "MIDDLE-CENTER";
        return "MIDDLE-CENTER";
      };

      const textHierarchy = validTextBlocks.map((b: any) => {
        const content = b.content || b.text || "";
        const role = (b.type || "text").toUpperCase();
        const weight = b.weight || 3;
        const color = b.color || "white";
        const zone = formatZone(b.position || params.posicao_do_texto || "");
        if (role === "H1") return `  - PRIMARY HEADLINE (H1) [Canvas Zone: ${zone}, Color: ${color}, Weight: ${weight}/5]: "${content}"`;
        if (role === "H2") return `  - SUBHEADLINE (H2) [Canvas Zone: ${zone}, Color: ${color}, Weight: ${weight}/5]: "${content}"`;
        if (role === "BULLETS") return `  - BULLET LIST ITEM [Canvas Zone: ${zone}, Color: ${color}, Weight: ${weight}/5]: "• ${content}"`;
        if (role === "CTA") return `  - CALL TO ACTION [Canvas Zone: ${zone}, Color: ${color}, Weight: ${weight}/5]: "${content}"`;
        return `  - BODY TEXT [Canvas Zone: ${zone}, Color: ${color}, Weight: ${weight}/5]: "${content}"`;
      }).join("\n");

      let alignmentCommand = "";
      if (alignmentMode === "left") {
        const rightZoneDesc = userRequestedNoPerson || !params.hasSubjectPhotos
          ? `* CENTRAL & RIGHT CANVAS: Reserved for the background environment and the three (3) horizontal white photo placeholder boxes. ZERO human models!`
          : `* RIGHT 55% OF CANVAS: Reserved for the human subject / model.`;
        alignmentCommand = `MANDATORY TEXT ALIGNMENT & CANVAS DIVISION:
- HEADLINE POSITION: Left-aligned on the left 45% of the canvas.
- TWO-COLUMN SPATIAL DIVISION:
  * LEFT 45% OF CANVAS: Primary text column for left-aligned headline and bullet points. Every line must start flush from the left margin (8% safe margin).
  ${rightZoneDesc}
- Footer contact info (WhatsApp phone and @ social handle) is exempt from the left column and MUST be anchored at the BOTTOM CENTER.`;
      } else if (alignmentMode === "right") {
        alignmentCommand = `MANDATORY TEXT ALIGNMENT & CANVAS DIVISION:
- HEADLINE POSITION: Right-aligned on the right side of the canvas.
- Footer contact info (WhatsApp phone and @ social handle) is exempt from the right column and MUST be anchored at the BOTTOM CENTER.`;
      } else {
        alignmentCommand = `MANDATORY TEXT ALIGNMENT MANDATE (MULTI-ZONE / BALANCED):
- Each text layer MUST be rendered strictly at its designated Canvas Zone (e.g. TOP-CENTER, MIDDLE-CENTER, BOTTOM-CENTER).
- If the primary headline is marked [Canvas Zone: TOP-CENTER], render it centered horizontally across the upper section of the canvas. DO NOT displace it to the left or right borders!
- Bullet points marked [Canvas Zone: MIDDLE-CENTER] MUST be rendered neatly stacked in the center area.`;
      }

      parts.push(`\nTYPOGRAPHY & TEXT SPECIFICATION:
${alignmentCommand}
Display Stack:
${textHierarchy}
CRITICAL TEXT GOVERNING RULES:
1. Render ONLY the exact text enclosed in quotation marks! ABSOLUTE BAN: NEVER paint technical metadata labels like 'H1', 'H2', 'CTA', 'Bullets' anywhere on the graphic!
2. Render bullet items with clean bullet symbols (•) and crisp legible font.
3. The Call-to-Action and social handle/phone must be rendered with high visual contrast.
4. UNPROMPTED CONTAINERS: DO NOT place text inside an unprompted white card, box, or container in the middle of the screen UNLESS the user explicitly requested white squares, cards, or boxes in additional instructions. Any visual elements explicitly requested by the user take highest priority!
5. ABSOLUTE BAN ON EMPTY PLACEHOLDER BOXES FROM TEMPLATES: DO NOT paint empty white boxes, placeholder rectangles, or sub-photo collage grids from layout references! Render one continuous full-bleed scene (except for white boxes explicitly requested by user).`);

      const hasBottomSocialOrPhone = validTextBlocks.some((b: any) => {
        const p = formatZone(b.position || "").toLowerCase();
        const c = b.content || b.text || "";
        return p.includes("bottom") || (/(\(\d{2}\)|\d{4,5})/.test(c) && !p.includes("top")) || (c.includes("@") && !p.includes("top"));
      }) || /em baixo|no rodap[ée]|em baixo meio/i.test(params.prompt_adicional || "");

      if (hasBottomSocialOrPhone) {
        parts.push(`\nFOOTER CONTACT & SOCIAL MEDIA BAR (MANDATORY BOTTOM CENTER):
- The phone number and @ social media handle MUST be placed together at the BOTTOM CENTER of the canvas (in the footer zone with safe margin).
- Precede the phone number with a clean WhatsApp green circular icon glyph.
- Precede the social handle with Instagram and Facebook circular icon glyphs.
- STRICT PROHIBITION: DO NOT place the social handle at the top! DO NOT place the phone number on the left margin under the bullet points! Both belong centered at the bottom.`);
      }

      if (String(params.degrade).toLowerCase() === "true") {
        parts.push(`Gradient behind text for optimal readability.`);
      }
    }
  }

  // ── FLOATING ELEMENTS ──
  if (params.elementos_flutuantes && params.elementos_flutuantes.trim() && params.elementos_flutuantes !== "none" && params.elementos_flutuantes !== "__enabled__" && params.elementos_flutuantes !== "false") {
    parts.push(`Floating 3D elements: ${params.elementos_flutuantes}.`);
  }

  // ── DEPTH OF FIELD ──
  if (String(params.usar_desfoque_blur).toLowerCase() === "true") {
    parts.push(`Shallow depth of field with bokeh background for subject emphasis.`);
  }

  // ── ADDITIONAL INSTRUCTIONS ──
  if (params.prompt_adicional) {
    parts.push(`\nAdditional instructions: ${params.prompt_adicional}.`);
  }

  // ── CAPTURE (Professional) ──
  parts.push(`\nCAPTURE — ${CAPTURE_RULE}`);

  // ── ANATOMY SAFETY ──
  if (params.hasSubjectPhotos || params.genero) {
    parts.push(ANATOMY_RULE);
  }

  // ── PHOTOREALISM ──
  if (category !== "card_social" && category !== "banner_web" && category !== "estilo_aplicado") {
    parts.push(PHOTOREALISM_DIRECTIVES);
  }

  // ── COMPOSITION & SAFE MARGINS ──
  parts.push(COMPOSITION_RULES);

  // ── FINAL QUALITY DIRECTIVE ──
  parts.push(`\nCRITICAL: Perfect sharpness, zero blur, zero flickers, cinematic ${targetQuality} resolution, flawless skin pores, professional studio output. Perfect typography kerning and hierarchy.`);

  // ── FINAL CHECK ──
  const finalCheck: string[] = [];
  if (params.hasSubjectPhotos) {
    finalCheck.push("The subject's face, skin, hair and features are exactly as the reference image shows — nothing invented or altered.");
  }
  if (params.subject_description) {
    finalCheck.push(`Subject: ${params.subject_description}.`);
  }
  if (params.scene_description) {
    finalCheck.push(`Scene: ${params.scene_description}.`);
  }
  finalCheck.push(`Aspect ratio ${aspectRatio}. Quality: ${targetQuality}.`);

  if (finalCheck.length > 0) {
    parts.push(`\nFINAL CHECK — ${finalCheck.join(" ")}`);
  }

  return parts.join(" ");
}
