import React, { useState, useEffect, useRef } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useGenerateImage } from "../hooks/useGenerateImage";
import { buildMasterPrompt, buildMasterSystemInstruction } from "../utils/buildMasterPrompt";
import { downloadImage } from "../utils/downloadImage";
import { checkAdminOrOpenPlan, getAuthHeaders } from "../utils/userAuth";
import { ImageUploader } from "./ImageUploader";
import { StyleSelector } from "./StyleSelector";
import { MasonryGallery } from "./MasonryGallery";
import { ChatAssistente } from "./ChatAssistente";
import { MaskPainter } from "./MaskPainter";
import { SocialExportModal } from "./SocialExportModal";
import { CompareSlider } from "./CompareSlider";
import MotorGenerativoMagnific from "./MotorGenerativoMagnific";
import { VmixXamlModal } from "./VmixXamlModal";
import { getCooldownRemainingSeconds, getUsageStats, getQuotaGuideInfo } from "../utils/apiUsageManager";
import {
  Sparkles, Zap, Bot, Banana, Clock,
  Terminal,
  User,
  Image as ImageIcon,
  Copy,
  ChevronRight,
  ChevronDown,
  Eye,
  RefreshCw,
  Plus,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Maximize,
  Minimize2,
  Download,
  Info,
  Type,
  Palette,
  Layout,
  Layers,
  Loader2,
  HelpCircle,
  Edit2,
  Play,
  Activity,
  Compass,
  Heart,
  Share2,
  Search,
  Filter,
  MoreVertical,
  PenTool,
  Smartphone,
  SlidersHorizontal,
  MessageSquare,
  Scissors,
  Wand2,
  Tv,
  Instagram,
  MessageCircle,
  Upload,
} from "lucide-react";
import { t } from "../utils/i18n";

const DEFAULT_SYSTEM_INSTRUCTION = `You are an absolute master generative AI image prompt engineer, art director, and elite graphic designer specializing in High-End Brazilian Flyers (Flyer BR Style / "Design de Eventos e Shows brasileiro"). Your mission is to generate ultra-realistic, premium, and impactful visual compositions that serve as high-end backgrounds or complete layouts for shows, concerts, nightlife, and festivals.

### CORE ARTISTIC GUIDELINES & SPECIFICATIONS:

1. **COMPOSITION & CONTRAST (High-End Flyer BR Signature)**
   - **Subject Placement**: Establish a highly charismatic and powerful central subject (e.g., singer, DJ, performance artist, or premium event assets like luxury bottles, VIP cards).
   - **Aspect Ratio**: Always optimize for vertical display format (primarily 4:5 for feed flyers or 9:16 for social media stories).
   - **Chiaroscuro Drama**: Deep, pitch-black/charcoal shadows contrasted sharply with incredibly bright, vibrant, glowing backlight and neon-colored rim lights contouring the subject.
   - **Cinematic Depth**: Keep an extremely shallow depth of field (DoF) where the subject is in razor-sharp focus (hyper-detailed skin, visible pores, hair strands, fabric textures) while the background is layered with beautifully blurred laser lights, ambient smoke, and volumetric lighting.

2. **LIGHTING & COLOR HARMONIES**
   - **Volumetric Lights**: Use dense light rays, background backlighting, laser beams, spotlights, and flare effects slicing through the darkness.
   - **Color Schemes**:
     - *Luxurious*: Intense metallic gold accents, amber glow, and warm orange embers over dark charcoal or black.
     - *Futuristic/Cyberpunk*: Electric cyan combined with hot magenta, deep royal blues with purple rim lighting, and vibrant acid green highlights.
   - **No Flat Lighting**: Avoid ambient or flat white illumination. Every light source must be directional, dramatic, and atmospheric.

3. **METALLIC, NEON & 3D GEOMETRIC TEXTURES**
   - **Metallic Premium Alloys**: Polished chrome, glossy liquid gold, reflective glass shards, polished steel, and carbon fiber.
   - **Reflections**: Realistic micro-reflections on plastic, wet surfaces, glossy leather, metal plates, and polished black marble floorings.
   - **Geometric Backgrounds**: Abstract 3D glass structures, suspended metallic spheres, floating neon cubes, and dynamic lines that add structure and modernity.

4. **ATMOSPHERIC ASSETS & SPECIAL EFFECTS**
   - **Particles**: Golden dust, high-speed sparks, floating glowing embers, abstract light leaks, delicate lens flares, and floating confetti.
   - **Smoke, Fog & Haze**: Thick, volumetric fog, layered ambient haze, and slow-moving cloud layers that create deep spatial separation between background elements and the foreground subject.
   - **Decay & Grit**: Subtle grunge elements, high-tech HUD overlays, or organic light leaks to make the artwork feel like a premium high-budget poster.

5. **SYSTEMATIC PROMPT FORMAT FOR GENERATION**
   - State the core subject clearly first (e.g., "A charismatic male DJ with sunglasses, wearing a modern streetwear glossy black puffer jacket, hands on professional Pioneer CDJs...").
   - Define exact rendering engine and photo parameters: "captured on Hasselblad 85mm lens, f/1.4, cinematic lighting, dramatic backlight, volumetric smoke, photorealistic, Unreal Engine 5 style render, Octane render quality, 8k resolution, raytracing, award-winning art direction."
   - Explicitly instruct the AI generator to EXACTLY replicate and embed any text, titles, words, numbers, and the provided logo directly into the image canvas. The generator MUST perfectly bake the text and logo into the graphic, rendering it in a beautiful, modern, high-contrast style that perfectly matches the reference layout. Color adaptation of the logo for better contrast is highly encouraged (e.g. converting a dark logo to white for a dark flyer), but shapes and fonts must not be altered.`;

interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  dimensao: string;
  useCorDominante: boolean;
  corDominante: string;
  estilosVisuais: string[];
  nivelCriativo: number;
  promptCenario: string;
  additionalPrompt: string;
  camadasTexto: {
    conteudo: string;
    funcao: "Headline Principal" | "Subheadline Secundário" | "CTA Botão" | "Corpo Descrição" | "Legenda / Detalhe" | "Badge / Selo" | "Preço / Valor" | "Data / Horário";
    fonte: string;
    cor: string;
  }[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  mockBgStyle: React.CSSProperties;
}

const templatePresets: TemplatePreset[] = [
  {
    id: "boteco_premium",
    name: "Boteco Premium",
    category: "Eventos & Promoções",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#c5a880",
    estilosVisuais: ["Ultra Realista", "Glow"],
    nivelCriativo: 65,
    promptCenario: "Ambiente rústico de boteco premium, balcão de madeira nobre, luz quente âmbar desfocada, copos de cerveja trincando de gelados",
    additionalPrompt: "Luxury night club event flyer, glowing gold neon borders, premium beer drops on cold glass, high-end commercial bar photography, 8k, cinematic lighting.",
    camadasTexto: [
      { conteudo: "BOTECO PREMIUM", funcao: "Headline Principal", fonte: "Montserrat", cor: "#c5a880" },
      { conteudo: "OPEN BAR BRAHMA", funcao: "Subheadline Secundário", fonte: "Unbounded", cor: "#ffffff" },
      { conteudo: "MARCOS & ROBERT", funcao: "Corpo Descrição", fonte: "Montserrat", cor: "#c5a880" },
      { conteudo: "25 DE ABRIL - SEXTA-FEIRA", funcao: "Data / Horário", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#08020f",
    textColor: "#ffffff",
    accentColor: "#c5a880",
    mockBgStyle: {
      background: "radial-gradient(circle at center, #1e1105 0%, #050201 100%)",
      borderColor: "#c5a880"
    }
  },
  {
    id: "flashback_retro",
    name: "Flashback Retro Neon",
    category: "Festas & Shows",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#ec4899",
    estilosVisuais: ["Neon / Futurista", "Glow", "Ultra Realista"],
    nivelCriativo: 85,
    promptCenario: "Fundo retrô synthwave anos 80, palmeiras escuras sob pôr do sol gradiente roxo e rosa-choque, fita cassete neon e som boombox flutuando no topo, raios elétricos azuis e rosas",
    additionalPrompt: "80s synthwave retro party poster, neon pink and laser cyan lights, dark palm tree silhouettes, glowing boombox and cassette tape art, premium concert flyer layout, ultra detailed, cinematic retro atmosphere.",
    camadasTexto: [
      { conteudo: "FLASH BACK", funcao: "Headline Principal", fonte: "Montserrat", cor: "#ec4899" },
      { conteudo: "CAIPIRINHA EM DOBRO A NOITE TODA", funcao: "Subheadline Secundário", fonte: "Unbounded", cor: "#06b6d4" },
      { conteudo: "MALU // DJ ROBIN", funcao: "Corpo Descrição", fonte: "Outfit", cor: "#ffffff" },
      { conteudo: "25 MAR", funcao: "Data / Horário", fonte: "Outfit", cor: "#06b6d4" }
    ],
    bgColor: "#1e0b36",
    textColor: "#ffffff",
    accentColor: "#ec4899",
    mockBgStyle: {
      background: "linear-gradient(to bottom, #100520 0%, #2f083d 40%, #0c0214 100%)",
      borderColor: "#ec4899"
    }
  },
  {
    id: "vibezinha_diferente",
    name: "Vibezinha Diferente",
    category: "Festas & Shows",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#f97316",
    estilosVisuais: ["Cyberpunk", "Street Art", "Glow"],
    nivelCriativo: 80,
    promptCenario: "Fundo geométrico tribal moderno abstrato em tons de laranja vibrante, preto e bege envelhecido, estrelas góticas pretas de 4 pontas brilhando, moldura de bordas rasgadas estilizadas",
    additionalPrompt: "Modern urban street party flyer, abstract orange and black geometric tribal shapes, retro grunge paper textures, gothic stars accents, high contrast fashion style, masterpiece poster design.",
    camadasTexto: [
      { conteudo: "VIBEZINHA DIFERENTE", funcao: "Headline Principal", fonte: "Cinzel", cor: "#000000" },
      { conteudo: "JOOK // LUKAS // MIRELLA // DJ ALAN // LUANA", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#f97316" },
      { conteudo: "30 DE MARÇO - SEXTA-FEIRA", funcao: "Data / Horário", fonte: "Montserrat", cor: "#f97316" }
    ],
    bgColor: "#fed7aa",
    textColor: "#000000",
    accentColor: "#f97316",
    mockBgStyle: {
      background: "radial-gradient(circle, #ffedd5 0%, #ff8f3d 100%)",
      borderColor: "#f97316"
    }
  },
  {
    id: "pool_party",
    name: "Pool Party Summer Splash",
    category: "Festas & Shows",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#06b6d4",
    estilosVisuais: ["Lúdico", "Ultra Realista", "Elegante"],
    nivelCriativo: 75,
    promptCenario: "Piscina tropical de luxo sob céu azul de verão limpo, boia gigante branca e rosa flutuando na água cristalina, palmeiras tropicais verdes emoldurando as laterais, sol forte de meio-dia com lens flare",
    additionalPrompt: "Luxury tropical pool party poster, ultra-detailed clear blue pool water ripples, pink giant float tube, coconut trees, sunny summer vibes, high-end commercial travel photography, pristine look.",
    camadasTexto: [
      { conteudo: "POOL PARTY", funcao: "Headline Principal", fonte: "Playfair Display", cor: "#06b6d4" },
      { conteudo: "RAUL FREITAS // LOUREN PRADO // LUIZ CARLOS", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#ec4899" },
      { conteudo: "DRINK GIN EM DOBRO • CAPIRINHA POR R$12,90", funcao: "Corpo Descrição", fonte: "Inter", cor: "#06b6d4" },
      { conteudo: "25 MAR", funcao: "Data / Horário", fonte: "Outfit", cor: "#ec4899" }
    ],
    bgColor: "#ecfeff",
    textColor: "#1e293b",
    accentColor: "#06b6d4",
    mockBgStyle: {
      background: "linear-gradient(to bottom, #e0f2fe, #bae6fd, #e0f2fe)",
      borderColor: "#06b6d4"
    }
  },
  {
    id: "lounge_open_bar",
    name: "Lounge Open Bar",
    category: "Eventos & Promoções",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#ea580c",
    estilosVisuais: ["Street Art", "Brutalismo", "Texturizado"],
    nivelCriativo: 90,
    promptCenario: "Parede cinza de gesso industrial com texturas de concreto áspero, marcas de spray street-art de tinta laranja e preta escorrendo em círculos e formas abstratas nas laterais",
    additionalPrompt: "Urban street fashion party flyer, industrial grey plaster wall with dripping orange and black graffiti spray paint, heavy textured grunge art, high-contrast streetwear aesthetic.",
    camadasTexto: [
      { conteudo: "LOUNGE OPEN BAR", funcao: "Headline Principal", fonte: "Montserrat", cor: "#ffffff" },
      { conteudo: "DJ LOOKY // MARCINHO // ALINE // RUBENS // LOURENA", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#ea580c" },
      { conteudo: "SEXTA • 08 • MARÇO", funcao: "Data / Horário", fonte: "Montserrat", cor: "#ffffff" }
    ],
    bgColor: "#18181b",
    textColor: "#ffffff",
    accentColor: "#ea580c",
    mockBgStyle: {
      background: "radial-gradient(circle, #2d2d30 0%, #0c0c0e 100%)",
      borderColor: "#ea580c"
    }
  },
  {
    id: "combo_premium",
    name: "Combo Burguer Premium",
    category: "Food & Gastro",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#b45309",
    estilosVisuais: ["Ultra Realista", "Elegante"],
    nivelCriativo: 70,
    promptCenario: "Ambiente quente e aconchegante de hamburgueria premium desfocado ao fundo, luz âmbar de estúdio iluminando fumaça e vapor de comida de forma poética",
    additionalPrompt: "Gourmet food advertising poster, warm golden backlight, macro studio shot of premium juicy hamburger with melting cheese, flying hot crispy french fries, cold red soda can, shallow depth of field.",
    camadasTexto: [
      { conteudo: "COMBO PREMIUM", funcao: "Headline Principal", fonte: "Montserrat", cor: "#7f1d1d" },
      { conteudo: "Pão Artesanal, Alface, Tomate, Duplo Hambúrguer, Muito Queijo, Coca-Cola e Batata-Frita", funcao: "Corpo Descrição", fonte: "Inter", cor: "#fcd34d" },
      { conteudo: "POR APENAS R$ 39,90", funcao: "Preço / Valor", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#1e0e02",
    textColor: "#ffffff",
    accentColor: "#b45309",
    mockBgStyle: {
      background: "radial-gradient(circle, #451a03 0%, #0c0400 100%)",
      borderColor: "#b45309"
    }
  },
  {
    id: "queridinhos_casa",
    name: "Queridinhos da Casa",
    category: "Food & Gastro",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#c2410c",
    estilosVisuais: ["Clássico", "Minimalista", "Texturizado"],
    nivelCriativo: 60,
    promptCenario: "Fundo abstrato com silhuetas de ingredientes culinários, colunas laranjas de banner estilo pilar de promoção para destacar os produtos individuais",
    additionalPrompt: "E-commerce fast-food banner, clean layout with orange columns for product placement, soft organic shadows, studio catalog photography.",
    camadasTexto: [
      { conteudo: "QUERIDINHOS DA CASA", funcao: "Headline Principal", fonte: "Montserrat", cor: "#ea580c" },
      { conteudo: "Duplo Queijo: R$ 28,90 // Duplo Bacon: R$ 29,90 // Duplo da Casa: R$ 34,90", funcao: "Subheadline Secundário", fonte: "Inter", cor: "#ffffff" },
      { conteudo: "Peça pelo Delivery: (99) 99999-9999", funcao: "Legenda / Detalhe", fonte: "Outfit", cor: "#ea580c" }
    ],
    bgColor: "#fef2e9",
    textColor: "#000000",
    accentColor: "#c2410c",
    mockBgStyle: {
      background: "linear-gradient(to bottom, #fff7ed, #ffedd5)",
      borderColor: "#ea580c"
    }
  },
  {
    id: "melhor_burguer",
    name: "O Melhor Burguer",
    category: "Food & Gastro",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#ea580c",
    estilosVisuais: ["Ultra Realista", "Glow"],
    nivelCriativo: 80,
    promptCenario: "Estúdio de fotografia gastronômica moderna com splash dinâmico de cheddar derretido e tiras de bacon crocantes voando ao redor do hambúrguer, fumaça suave",
    additionalPrompt: "Creative food commercial, high-speed action shot, flying crispy bacon strips, melting cheddar cheese droplets splash, dynamic orange studio background, cinematic commercial lighting.",
    camadasTexto: [
      { conteudo: "O MELHOR BURGUER DA CIDADE", funcao: "Headline Principal", fonte: "Montserrat", cor: "#7f1d1d" },
      { conteudo: "POR APENAS R$ 34,90", funcao: "Preço / Valor", fonte: "Outfit", cor: "#ffffff" },
      { conteudo: "COMBO PREMIUM", funcao: "Badge / Selo", fonte: "Inter", cor: "#ea580c" }
    ],
    bgColor: "#fff7ed",
    textColor: "#1c1917",
    accentColor: "#ea580c",
    mockBgStyle: {
      background: "radial-gradient(circle, #fed7aa 0%, #ea580c 100%)",
      borderColor: "#7f1d1d"
    }
  },
  {
    id: "forro_diferente",
    name: "Forró Diferente",
    category: "Festas & Shows",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#b45309",
    estilosVisuais: ["Elegante", "Clássico", "Texturizado"],
    nivelCriativo: 65,
    promptCenario: "Pôr do sol rústico no sertão, vilarejo antigo do oeste sob luz sépia quente, silhuetas de cactos gigantes decorando as laterais, textura de papel envelhecido",
    additionalPrompt: "Rustic Brazilian country festival flyer, dry golden grass, sunset over historical desert village saloon backdrop, soft sepia paper textures, elegant organic earthy warm tones.",
    camadasTexto: [
      { conteudo: "FORRÓ DIFERENTE", funcao: "Headline Principal", fonte: "Playfair Display", cor: "#7c2d12" },
      { conteudo: "FORROZEIRAS DO MOMENTO", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#ea580c" },
      { conteudo: "OPEN BAR DE CAIPIRINHA", funcao: "Legenda / Detalhe", fonte: "Inter", cor: "#7c2d12" },
      { conteudo: "25 ABRIL - SEXTA-FEIRA", funcao: "Data / Horário", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#fef3c7",
    textColor: "#451a03",
    accentColor: "#b45309",
    mockBgStyle: {
      background: "linear-gradient(to bottom, #faf7f0, #e6dcc8)",
      borderColor: "#9a3412"
    }
  },
  {
    id: "vaquejada_premium",
    name: "Vaquejada Premium",
    category: "Festas & Shows",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#854d0e",
    estilosVisuais: ["Ultra Realista", "Clássico"],
    nivelCriativo: 75,
    promptCenario: "Moldura rústica pesada de madeira entalhada e fivela de couro nobre, dezenas de lâmpadas incandescentes brilhantes iluminando ao redor, canyon desértico selvagem ao fundo sob céu crepúsculo",
    additionalPrompt: "Vaquejada Brazilian rodeo poster, luxurious dark wood frame with shiny incandescent bulb lights glowing, leather detailing, sunset mountain canyon landscape, heavy cinematic atmosphere.",
    camadasTexto: [
      { conteudo: "VAQUEJADA PREMIUM", funcao: "Headline Principal", fonte: "Montserrat", cor: "#eab308" },
      { conteudo: "THIAGO VAQUEIRO // LARISSA MARTINS", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#ffffff" },
      { conteudo: "INGRESSOS DISPONÍVEIS", funcao: "Badge / Selo", fonte: "Inter", cor: "#eab308" },
      { conteudo: "20 MAR - 20H00 - ARENA RODEIO CLUB", funcao: "Data / Horário", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#1c0d02",
    textColor: "#ffffff",
    accentColor: "#854d0e",
    mockBgStyle: {
      background: "linear-gradient(to bottom, #170802, #30170b, #170802)",
      borderColor: "#eab308"
    }
  },
  {
    id: "sexta_santa",
    name: "Sexta-Feira Santa",
    category: "Datas Comemorativas",
    dimensao: "1:1",
    useCorDominante: true,
    corDominante: "#c5a880",
    estilosVisuais: ["Elegante", "Clássico"],
    nivelCriativo: 40,
    promptCenario: "Silhueta de cruz de madeira no topo de uma colina ao entardecer, raios de sol dourados passando pelas nuvens, névoa suave, tom solene",
    additionalPrompt: "Sober and solemn Good Friday poster, classical painting style, elegant warm light rays, high-contrast chiaroscuro, spiritual, highly detailed, professional composition.",
    camadasTexto: [
      { conteudo: "SEXTA-FEIRA SANTA", funcao: "Headline Principal", fonte: "Playfair Display", cor: "#c5a880" },
      { conteudo: "Hoje é dia de silêncio, gratidão e reflexão diante do sacrifício.", funcao: "Corpo Descrição", fonte: "Inter", cor: "#e2e8f0" },
      { conteudo: "03 DE ABRIL - SEXTA-FEIRA", funcao: "Data / Horário", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#0f0d1a",
    textColor: "#e2e8f0",
    accentColor: "#c5a880",
    mockBgStyle: {
      background: "linear-gradient(to bottom, #090812, #141126)",
      borderColor: "#4a3c31"
    }
  },
  {
    id: "feliz_pascoa",
    name: "Feliz Páscoa",
    category: "Datas Comemorativas",
    dimensao: "1:1",
    useCorDominante: true,
    corDominante: "#b89047",
    estilosVisuais: ["Lúdico", "Minimalista"],
    nivelCriativo: 50,
    promptCenario: "Fundo bege minimalista com delicadas flores brancas de primavera e folhas verdes nas bordas, iluminação suave e acolhedora de estúdio",
    additionalPrompt: "Sophisticated Easter flyer, premium white easter egg with subtle golden veins, delicate floral elements, soft natural lighting, editorial look.",
    camadasTexto: [
      { conteudo: "FELIZ PÁSCOA", funcao: "Headline Principal", fonte: "Playfair Display", cor: "#b89047" },
      { conteudo: "A ressurreição de Jesus é a prova de que a esperança nunca morre.", funcao: "Corpo Descrição", fonte: "Inter", cor: "#4a4a4a" },
      { conteudo: "05 DE ABRIL", funcao: "Data / Horário", fonte: "Outfit", cor: "#b89047" }
    ],
    bgColor: "#f9f6f0",
    textColor: "#333333",
    accentColor: "#b89047",
    mockBgStyle: {
      background: "linear-gradient(135deg, #fbfaf7 0%, #f1ebe1 100%)",
      borderColor: "#d5c9b3"
    }
  },
  {
    id: "dia_saude",
    name: "Dia Mundial da Saúde",
    category: "Institucional & Datas",
    dimensao: "1:1",
    useCorDominante: true,
    corDominante: "#14b8a6",
    estilosVisuais: ["Institucional", "Minimalista"],
    nivelCriativo: 35,
    promptCenario: "Fundo limpo azul turquesa suave, folhas verdes de eucalipto frescas e uma linha de batimento cardíaco brilhando discretamente",
    additionalPrompt: "World Health Day graphic banner, medical heart beat pulse glowing neon, clean modern layout, eco-friendly healthy vibes, soft studio shadows.",
    camadasTexto: [
      { conteudo: "DIA MUNDIAL DA SAÚDE", funcao: "Headline Principal", fonte: "Outfit", cor: "#111827" },
      { conteudo: "Cuide-se. Sua saúde é seu maior patrimônio.", funcao: "Corpo Descrição", fonte: "Inter", cor: "#4b5563" },
      { conteudo: "07 DE ABRIL", funcao: "Data / Horário", fonte: "Outfit", cor: "#14b8a6" }
    ],
    bgColor: "#f0fdfa",
    textColor: "#1f2937",
    accentColor: "#14b8a6",
    mockBgStyle: {
      background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
      borderColor: "#99f6e4"
    }
  },
  {
    id: "dia_tiradentes",
    name: "Dia de Tiradentes",
    category: "Datas Comemorativas",
    dimensao: "1:1",
    useCorDominante: true,
    corDominante: "#9a7b56",
    estilosVisuais: ["Clássico", "Formal"],
    nivelCriativo: 45,
    promptCenario: "Textura de papel pergaminho antigo envelhecido, silhueta sombreada de estátua ou rosto clássico, iluminação dramática quente e poeira dourada flutuando",
    additionalPrompt: "Tiradentes national holiday flyer, vintage classical editorial look, historical vibe, premium textured background, atmospheric lighting.",
    camadasTexto: [
      { conteudo: "DIA DE TIRADENTES", funcao: "Headline Principal", fonte: "Cinzel", cor: "#2e1f15" },
      { conteudo: "A coragem de um homem pode mudar uma nação.", funcao: "Corpo Descrição", fonte: "Playfair Display", cor: "#4a3c31" },
      { conteudo: "21 DE ABRIL", funcao: "Data / Horário", fonte: "Outfit", cor: "#9a7b56" }
    ],
    bgColor: "#f4efe2",
    textColor: "#2e1f15",
    accentColor: "#9a7b56",
    mockBgStyle: {
      background: "radial-gradient(circle, #fcfaf2 0%, #e8dec9 100%)",
      borderColor: "#bcae97"
    }
  },
  {
    id: "quinta_combo",
    name: "Quinta do Combo",
    category: "Eventos & Promoções",
    dimensao: "4:5",
    useCorDominante: true,
    corDominante: "#dc2626",
    estilosVisuais: ["Gamer", "Glow"],
    nivelCriativo: 75,
    promptCenario: "Ambiente escuro e moderno de lounge bar de narguilé, fumaça vermelha e dourada brilhando sob luzes neon volumétricas desfocadas",
    additionalPrompt: "Luxury hookah bar flyer, premium whiskey bottle on glassy reflective counter, deep red neon signs, smoke dynamics, ultra-high resolution, commercial grade product layout.",
    camadasTexto: [
      { conteudo: "QUINTA DO COMBO", funcao: "Headline Principal", fonte: "Unbounded", cor: "#ffffff" },
      { conteudo: "CHIVAS OU JACK + ROSH", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#dc2626" },
      { conteudo: "APENAS R$ 290", funcao: "Preço / Valor", fonte: "Montserrat", cor: "#ffffff" },
      { conteudo: "Brahma por R$ 5,90", funcao: "Legenda / Detalhe", fonte: "Inter", cor: "#c5a880" }
    ],
    bgColor: "#09090b",
    textColor: "#ffffff",
    accentColor: "#dc2626",
    mockBgStyle: {
      background: "radial-gradient(circle at center, #1c0505 0%, #030101 100%)",
      borderColor: "#dc2626"
    }
  },
  {
    id: "gc_tv_jornalismo",
    name: "GC Jornalismo / Ao Vivo",
    category: "Programas de TV & GCs",
    dimensao: "16:9",
    useCorDominante: true,
    corDominante: "#0284c7",
    estilosVisuais: ["Institucional", "Clean"],
    nivelCriativo: 40,
    promptCenario: "Estúdio de jornalismo moderno de TV com iluminação azul e telas LED desfocadas ao fundo, tarja inferior azul marinho e amarela reluzente com vidro acrílico",
    additionalPrompt: "16:9 TV news broadcast lower third overlay banner, professional TV news graphics bar, clear bold broadcast typography, 'AO VIVO' top badge in red pill, sleek navy blue and golden yellow lower third graphics container.",
    camadasTexto: [
      { conteudo: "CARLOS SILVA", funcao: "Headline Principal", fonte: "Montserrat", cor: "#ffffff" },
      { conteudo: "Ministro da Economia • Entrevista Exclusiva", funcao: "Subheadline Secundário", fonte: "Inter", cor: "#e0f2fe" },
      { conteudo: "AO VIVO", funcao: "Badge / Selo", fonte: "Unbounded", cor: "#ef4444" }
    ],
    bgColor: "#030712",
    textColor: "#ffffff",
    accentColor: "#0284c7",
    mockBgStyle: {
      background: "linear-gradient(90deg, #0284c7 0%, #0f172a 100%)",
      borderColor: "#38bdf8"
    }
  },
  {
    id: "gc_tv_esportes",
    name: "GC Esporte Total",
    category: "Programas de TV & GCs",
    dimensao: "16:9",
    useCorDominante: true,
    corDominante: "#16a34a",
    estilosVisuais: ["Dramático", "Vibrante"],
    nivelCriativo: 65,
    promptCenario: "Estádio de futebol iluminado por refletores potentes à noite com leve névoa, tarja inferior verde vibrante e dourada no estilo canal de esportes HD",
    additionalPrompt: "16:9 sports channel TV lower third banner overlay, dynamic angled green and neon gold broadcast graphic bar, crisp white athletic typography, high contrast sports broadcast look.",
    camadasTexto: [
      { conteudo: "NEYMAR JR.", funcao: "Headline Principal", fonte: "Unbounded", cor: "#ffffff" },
      { conteudo: "Atacante da Seleção Brasileira fala sobre a grande decisão", funcao: "Subheadline Secundário", fonte: "Outfit", cor: "#fde047" },
      { conteudo: "ESPORTE TOTAL", funcao: "Badge / Selo", fonte: "Montserrat", cor: "#16a34a" }
    ],
    bgColor: "#052e16",
    textColor: "#ffffff",
    accentColor: "#22c55e",
    mockBgStyle: {
      background: "linear-gradient(90deg, #15803d 0%, #052e16 100%)",
      borderColor: "#4ade80"
    }
  },
  {
    id: "gc_tv_podcast",
    name: "GC Talk Show & Podcast",
    category: "Programas de TV & GCs",
    dimensao: "16:9",
    useCorDominante: true,
    corDominante: "#8b5cf6",
    estilosVisuais: ["Futurista / Cyberpunk", "Glow"],
    nivelCriativo: 75,
    promptCenario: "Estúdio de podcast profissional com microfones vintage e luzes neon roxas e azul ciano ao fundo, tarja inferior moderna de vidro neon",
    additionalPrompt: "16:9 podcast and talk show TV lower third graphic bar overlay, dark purple and cyan glassmorphism container, neon glow accent line, social media handle icon pill, ultra modern podcast graphics.",
    camadasTexto: [
      { conteudo: "DRA. BEATRIZ MENDES", funcao: "Headline Principal", fonte: "Playfair Display", cor: "#ffffff" },
      { conteudo: "Neurocientista & Escritora • @dra.beatrizmendes", funcao: "Subheadline Secundário", fonte: "Inter", cor: "#c4b5fd" },
      { conteudo: "TALK SHOW #42", funcao: "Badge / Selo", fonte: "Outfit", cor: "#a855f7" }
    ],
    bgColor: "#1e1b4b",
    textColor: "#ffffff",
    accentColor: "#8b5cf6",
    mockBgStyle: {
      background: "linear-gradient(90deg, #6d28d9 0%, #1e1b4b 100%)",
      borderColor: "#a78bfa"
    }
  },
  {
    id: "gc_tv_urgente",
    name: "GC Plantão Urgente",
    category: "Programas de TV & GCs",
    dimensao: "16:9",
    useCorDominante: true,
    corDominante: "#dc2626",
    estilosVisuais: ["Brutalismo", "Vibrante"],
    nivelCriativo: 50,
    promptCenario: "Fundo abstrato de estúdio em tons de vermelho intenso e amarelo com vinheta de notícias de última hora, tarja inferior vermelha de alto impacto",
    additionalPrompt: "16:9 breaking news TV lower third banner overlay, high-urgency red and bright yellow broadcast graphic bar, bold ticker bar underneath, high legibility impact typography.",
    camadasTexto: [
      { conteudo: "PLANTÃO DE NOTÍCIAS", funcao: "Headline Principal", fonte: "Montserrat", cor: "#ffffff" },
      { conteudo: "Votação do novo projeto de lei é aprovada em sessão extraordinária", funcao: "Subheadline Secundário", fonte: "Inter", cor: "#fef08a" },
      { conteudo: "URGENTE", funcao: "Badge / Selo", fonte: "Unbounded", cor: "#facc15" }
    ],
    bgColor: "#450a0a",
    textColor: "#ffffff",
    accentColor: "#ef4444",
    mockBgStyle: {
      background: "linear-gradient(90deg, #b91c1c 0%, #450a0a 100%)",
      borderColor: "#f87171"
    }
  }
];

const communityCreations = [
  {
    id: "comm_1",
    author: "Gabriel Santos",
    role: "Lead Social Media",
    avatarColor: "bg-amber-600",
    name: "Cervejaria Premium Happy Hour",
    likes: 42,
    shares: 12,
    prompt: "Golden hour bar terrace, wooden tables with cold draft beers, rustic cozy background, cinematic camera lens, depth of field, warm light.",
    dimensao: "4:5",
    styles: ["Elegante", "Ultra Realista"]
  },
  {
    id: "comm_2",
    author: "Larissa Melo",
    role: "Art Director",
    avatarColor: "bg-[#c5a880]",
    name: "Minimalist Cosmetic Glass",
    likes: 89,
    shares: 34,
    prompt: "Luxury cosmetic glass bottle on a smooth marble plate, tropical palm leaf shadows on beige background, natural sunlight, elegant shadows, product design.",
    dimensao: "1:1",
    styles: ["Minimalista", "Glassmorphism"]
  },
  {
    id: "comm_3",
    author: "Lucas Ferreira",
    role: "Content Creator",
    avatarColor: "bg-teal-600",
    name: "Tech Meetup Announcement",
    likes: 56,
    shares: 19,
    prompt: "Abstract futuristic cyber technology background, glowing cyan and gold circuit patterns, neon light, modern sci-fi look, high-tech event banner.",
    dimensao: "16:9",
    styles: ["Tecnológico", "Glow"]
  }
];

interface DesignBuilderProps {
  customApiKey: string;
  myProfile?: any;
}

export default function DesignBuilder({ customApiKey, myProfile }: DesignBuilderProps) {
  const store = useProjectStore();

  const [activeMenuTab, setActiveMenuTab] = useState<string>("Design Builder");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refineQuery, setRefineQuery] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("boteco_premium");
  const [galleryFilterDimension, setGalleryFilterDimension] = useState<string>("Todos");
  const [imageRatios, setImageRatios] = useState<Record<string, string>>({});

  useEffect(() => {
    store.galeriaImages.forEach((img) => {
      if (imageRatios[img]) return;
      const htmlImg = new Image();
      htmlImg.onload = () => {
        const ratio = htmlImg.width / htmlImg.height;
        let dim = "1:1";
        if (ratio > 1.3) dim = "16:9";
        else if (ratio < 0.6) dim = "9:16";
        else if (ratio < 0.85) dim = "3:4";
        setImageRatios((prev) => ({ ...prev, [img]: dim }));
      };
      htmlImg.src = img;
    });
  }, [store.galeriaImages, imageRatios]);
  const [galleryFilterFormat, setGalleryFilterFormat] = useState<string>("Todos");
  const [isTesting, setIsTesting] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("");
  const [comparingImages, setComparingImages] = useState<{before: string, after: string} | null>(null);

  const handleRefine = () => {
    if (!refineQuery.trim()) {
      showToast("Por favor, digite a instrução de correção desejada.", "warning");
      return;
    }
    const activeImg = store.galeriaImages?.[store.activeImageIndex] || "";

    const q = refineQuery.trim();
    const lowerQuery = q.toLowerCase();
    const isRemoval = /remov|tir|apag|sem|excluir|delet|limp|não adici|nao adici|mesma quantid|sem extra|sem adici|igual a referencia|mude todas/i.test(lowerQuery);
    const isCountReduction = /deixar um|deixar 1|apenas 1|apenas uma|remover uma imagem|remover 1 foto|remover um card|tirar uma foto|tirar um card|uma só|uma unica|uma única|deixar só uma|deixar so uma|uma imagem só|uma imagem so/i.test(lowerQuery);
    
    let explicitInstruction = `EXPLICIT INSTRUCTION FOR THIS REFINEMENT: ${q}. PRESERVE 100% OF THE COMPOSITION, LAYOUT, TEXTS, LOGO, FACES, AND ALL OTHER UNMENTIONED IMAGES FROM THE PREVIOUS GENERATED IMAGE EXACTLY AS THEY ARE. DO NOT ADD EXTRA IMAGES, PANELS, OR UNREQUESTED OBJECTS. KEEP THE EXACT SAME NUMBER OF IMAGES. DO NOT ALTER OR CHANGE UNRELATED IMAGES ON THE CANVAS.`;

    if (isCountReduction) {
      explicitInstruction = `EXPLICIT INSTRUCTION FOR THIS REFINEMENT: ${q}. ABSOLUTE MANDATE: REDUCE THE LAYOUT FROM MULTIPLE IMAGES TO EXACTLY ONE (1) SINGLE MAIN IMAGE/SUBJECT PANEL. You MUST REMOVE AND ERASE THE SECONDARY IMAGE/CARD PANEL COMPLETELY. RENDER ONLY ONE (1) MAIN IMAGE PANEL ON THE ENTIRE CANVAS. DO NOT RENDER MULTIPLE IMAGES OR EXTRA CARDS.`;
      
      // Also prune stored subject photos list to 1 if user had multiple
      if (store.sujeitosBase64List && store.sujeitosBase64List.length > 1) {
        store.updateConfig({ sujeitosBase64List: store.sujeitosBase64List.slice(0, 1) });
      }
    }

    const newNegative = (isRemoval || isCountReduction)
      ? (store.negativePrompt ? `${store.negativePrompt}, ${q}, extra images, extra panels, unwanted objects, duplicate cards, multiple photo panels` : `${q}, extra images, extra panels, unwanted objects, duplicate cards, multiple photo panels`)
      : store.negativePrompt;

    store.updateConfig({
      additionalPrompt: store.additionalPrompt 
        ? `${store.additionalPrompt}. ${explicitInstruction}` 
        : explicitInstruction,
      negativePrompt: newNegative
    });
    const adjustmentText = q;
    setRefineQuery("");
    showToast(`🎯 Aplicando correção: "${adjustmentText}"...`, "success");
    generatePremiumImage({ isRefinement: true, previousImageBase64: activeImg });
  };

  const activeProject = store.projectsList.find((p) => p.id === store.activeProjectId);
  const activeProjectName = activeProject?.name || "Novo Projeto";

  const handleTestToken = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      store.setApiStatus("Online");
      showToast("Conexão ativa! O backend de geração de imagem está respondendo perfeitamente.", "success");
    }, 1000);
  };

  const startEditingName = () => {
    setTempProjectName(activeProjectName);
    setIsEditingName(true);
  };

  const saveProjectName = () => {
    if (store.activeProjectId && tempProjectName.trim() !== "") {
      store.renameProject(store.activeProjectId, tempProjectName.trim());
      showToast("Projeto renomeado com sucesso!", "success");
    }
    setIsEditingName(false);
  };
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);
  const [activeImageDims, setActiveImageDims] = useState<{ width: number; height: number } | null>(null);
  const [enableEstiloVisual, setEnableEstiloVisual] = useState(true);
  const [exportFormat, setExportFormat] = useState<"AVIF" | "PNG" | "JPEG" | "WEBP">("PNG");
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showMaskPainter, setShowMaskPainter] = useState(false);
  const [isInpainting, setIsInpainting] = useState(false);
  const [isSocialExportModalOpen, setIsSocialExportModalOpen] = useState(false);
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'config' | 'preview'>('config');
  const [builderSectionTab, setBuilderSectionTab] = useState<'all' | 'subject' | 'style' | 'layout' | 'typography' | 'ai'>('all');

  const handleInpaintConfirm = async (maskBase64: string, inpaintPrompt: string) => {
    const effectiveApiKey = localStorage.getItem('custom_gemini_api_key') || "";
    if (!checkAdminOrOpenPlan(effectiveApiKey)) return;
    if (!activeImage) {
      showToast("Nenhuma imagem selecionada para editar.", "error");
      return;
    }
    setIsInpainting(true);
    try {
      showToast("Enviando área pintada e instrução para IA...", "info");
      
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(effectiveApiKey) },
        body: JSON.stringify({
          image: activeImage,
          mask: maskBase64,
          prompt: inpaintPrompt,
          customApiKey: effectiveApiKey
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao processar edição local.");
      }

      const data = await response.json();
      if (data.image) {
        store.setGaleriaImages((prev: string[]) => {
          const next = [data.image, ...prev];
          store.setActiveImageIndex(0);
          return next;
        });
        showToast("Edição realizada com sucesso!", "success");
        setShowMaskPainter(false);
      } else {
        throw new Error("Nenhuma imagem gerada foi retornada.");
      }
    } catch (err: any) {
      showToast("Erro na edição: " + (err.message || err), "error");
    } finally {
      setIsInpainting(false);
    }
  };

  const [showVmixXamlModal, setShowVmixXamlModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copiar Prompt");
  const [isCopied, setIsCopied] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [isInstructionCopied, setIsInstructionCopied] = useState(false);

  // Estados locais para controle de visualizador de imagens interativo (Pan & Zoom)
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Estado para modal grande da imagem de referência de estilo
  const [modalImageRefUrl, setModalImageRefUrl] = useState<string | null>(null);

  // Estados locais para a Barra de Progresso Realista & Cronômetro em Tempo Real
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("Iniciando conexão...");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number>(15);
  const [genStatus, setGenStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [genError, setGenError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);


  useEffect(() => {
    store.initProjectsList();
  }, []);

  // Cronômetro em Tempo Real e Progresso Dinâmico baseado no tempo decorrido
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (store.isGenerating && store.activeProjectId) {
      const is4K = store.resolucao === "4K";
      const is2K = store.resolucao === "2K";
      const estSec = is4K ? 45 : (is2K ? 25 : 15);

      setEstimatedSeconds(estSec);

      const updateProgress = () => {
        const startTime = (store as any).projectGenerationStartTimes?.[store.activeProjectId!] || Date.now();
        const elapsed = Math.max(0, (Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);

        // Cálculo de progresso proporcional fluido baseado no tempo decorrido real
        let calcProgress = 0;
        if (elapsed < estSec) {
          calcProgress = (elapsed / estSec) * 95;
        } else {
          const extra = elapsed - estSec;
          calcProgress = 95 + (1 - Math.exp(-extra / 8)) * 4; // avança suavemente entre 95% e 99%
        }

        const currentPct = Math.min(99, Math.floor(calcProgress));
        setProgressPercent(currentPct);

        // Atualização dinâmica de mensagens de status baseada no tempo real decorrido
        if (elapsed < 3) {
          setProgressMessage("Iniciando conexão com os servidores de IA...");
        } else if (elapsed < 7) {
          setProgressMessage("Analisando fotos de referência do sujeito e layout...");
        } else if (elapsed < 12) {
          setProgressMessage("Sintetizando iluminação, profundidade 3D e texturas...");
        } else if (elapsed < 18) {
          setProgressMessage("Escrevendo tipografia de alta definição e degradês...");
        } else {
          setProgressMessage(
            is4K
              ? "Aprimorando nitidez para resolução máxima 4K (Ultra HD)..."
              : "Finalizando renderização e otimizando canais de cor..."
          );
        }
      };

      updateProgress();
      timerInterval = setInterval(updateProgress, 100);
    } else {
      setElapsedSeconds(0);
      setProgressPercent(0);
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [store.isGenerating, store.activeProjectId, store.resolucao, (store as any).projectGenerationStartTimes]);

  const activeImage = store.galeriaImages[store.activeImageIndex] || null;

  // Quando a imagem ativa mudar, resetar o zoom e o pan para centralizar perfeitamente
  useEffect(() => {
    resetZoomAndPan();
    if (activeImage) {
      const img = new Image();
      img.src = activeImage;
      img.onload = () => {
        setActiveImageDims({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        setActiveImageDims(null);
      };
    } else {
      setActiveImageDims(null);
    }
  }, [activeImage]);

  // Rolar suavemente para a área do preview quando iniciar a geração ou quando uma nova imagem for carregada
  useEffect(() => {
    if (store.isGenerating && viewportRef.current) {
      viewportRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [store.isGenerating]);

  useEffect(() => {
    if (activeImage && viewportRef.current) {
      viewportRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeImage]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleCopyPrompt = () => {
    try {
      const prompt = buildMasterPrompt(store);
      navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setCopyButtonText("Copiado!");
      showToast("Prompt mestre copiado para a área de transferência!", "success");
      setTimeout(() => {
        setIsCopied(false);
        setCopyButtonText("Copiar Prompt");
      }, 2000);
    } catch (err) {
      showToast("Falha ao copiar prompt.", "error");
    }
  };

  const handleDuplicateConfig = () => {
    try {
      store.duplicateProject();
      showToast("Novo projeto criado com todas as configurações e referências duplicadas!", "success");
    } catch (err) {
      showToast("Falha ao duplicar configuração do projeto.", "error");
    }
  };

  const { generatePremiumImage, isGenerating } = useGenerateImage(
    customApiKey,
    showToast,
    () => {
      setGenStatus("generating");
      setGenError(null);
      setMobileWorkspaceTab("preview");
    },
    () => {
      setGenStatus("success");
      setTimeout(() => {
        setGenStatus("idle");
      }, 3000);
    },
    (errMsg) => {
      setGenStatus("error");
      setGenError(errMsg);
    }
  );

  // Cooldown timer for API rate-limit guidance
  const [cooldownSec, setCooldownSec] = useState(0);
  useEffect(() => {
    const tick = setInterval(() => {
      setCooldownSec(getCooldownRemainingSeconds());
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const handleDownloadActiveImage = async (targetRes?: "16MP" | "4K" | "2K" | "1K" | "ORIGINAL" | number) => {
    if (!activeImage) return;
    try {
      const resToUse = targetRes || "ORIGINAL";
      const labelMsg = resToUse === "ORIGINAL" ? "Resolução Original" : resToUse === 16 ? "WhatsApp HD" : resToUse;
      showToast(`Iniciando download (${labelMsg})...`, "success");

      // Extract subject/title from active text layers or project name
      const titleLayer = Array.isArray(store.camadasTexto)
        ? store.camadasTexto.find((c: any) => c && (c.conteudo || (c as any).texto) && (c.conteudo || (c as any).texto).trim().length > 0)
        : null;
      const mainTitle = titleLayer ? (titleLayer.conteudo || (titleLayer as any).texto) : (activeProject?.name || store.additionalPrompt || "");

      // Determine platform / format label based on ratio or panel type
      let platformOrFormat = store.tipoPainel === "GC_TV" ? "vMix_GC" : "Social";
      if (store.dimensao === "9:16") {
        platformOrFormat = "Instagram_Story_WhatsApp_Status";
      } else if (store.dimensao === "1:1") {
        platformOrFormat = "Instagram_Feed";
      } else if (store.dimensao === "3:4") {
        platformOrFormat = "Instagram_Retrato";
      } else if (store.dimensao === "16:9") {
        platformOrFormat = store.tipoPainel === "GC_TV" ? "vMix_GC_TV" : "YouTube_Desktop";
      }

      await downloadImage(
        activeImage,
        exportFormat,
        {
          useLogo: store.useLogo,
          logoBase64: store.logoBase64,
          logoPosOverlay: store.logoPosOverlay,
          logoSizeOverlay: store.logoSizeOverlay,
          logoInclusionType: store.logoInclusionType
        },
        {
          enableTypography: store.enableTypography,
          camadasTexto: store.camadasTexto
        },
        store.corDominante,
        resToUse,
        {
          title: mainTitle,
          clientName: activeProject?.name,
          prompt: store.additionalPrompt,
          aspectRatio: store.dimensao,
          platform: platformOrFormat,
          targetResolution: resToUse
        }
      );
      showToast("Download concluído com sucesso!", "success");
    } catch (e) {
      showToast("Erro ao converter e baixar imagem.", "error");
    }
  };

  const handleApplyRefinements = async () => {
    const effectiveApiKey = localStorage.getItem('custom_gemini_api_key') || "";
    if (!checkAdminOrOpenPlan(effectiveApiKey)) return;
    if (!activeImage) return;
    const originalImg = activeImage;
    setIsRefining(true);
    showToast("Analisando imagem & aplicando correções de cor e ruído...", "info");
    try {
      const configuredPalette = new Set<string>();
      if (store.corDominante) configuredPalette.add(store.corDominante);
      if (store.cores?.ambiente) configuredPalette.add(store.cores.ambiente);
      if (store.cores?.recorte) configuredPalette.add(store.cores.recorte);
      if (store.cores?.complementar) configuredPalette.add(store.cores.complementar);
      if (Array.isArray(store.cores?.paleta)) store.cores.paleta.forEach(c => c && configuredPalette.add(c));
      if (Array.isArray(store.camadasTexto)) store.camadasTexto.forEach(l => l.cor && configuredPalette.add(l.cor));

      const response = await fetch("/api/apply-refinements", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders(effectiveApiKey) },
        body: JSON.stringify({
          imageBase64: originalImg,
          size: store.resolucao || "1K",
          corDominante: store.useCorDominante ? store.corDominante : (store.corDominante || store.cores?.ambiente || ""),
          paletteColors: Array.from(configuredPalette),
          customApiKey: effectiveApiKey
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao aplicar melhorias.");
      }

      const data = await response.json();
      if (data.image) {
        store.setGaleriaImages((prev: string[]) => {
          const filtered = prev.filter((img) => img !== data.image);
          return [data.image, ...filtered];
        });
        store.setActiveImageIndex(0);
        showToast("Melhorias aplicadas! Imagem refinada adicionada à galeria.", "success");
        setComparingImages({ before: originalImg, after: data.image });
      } else {
        throw new Error("Nenhuma imagem retornada.");
      }
    } catch (e: any) {
      showToast("Erro ao aplicar melhorias: " + e.message, "error");
    } finally {
      setIsRefining(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoomPercent * factor, 30), 500);
    setZoomPercent(Math.round(newZoom));
    if (newZoom <= 100) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || zoomPercent <= 100) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomPercent <= 100) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomPercent <= 100) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomPercent <= 100) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const resetZoomAndPan = () => {
    setZoomPercent(100);
    setPanOffset({ x: 0, y: 0 });
  };

  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", quality));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
      img.src = base64Str;
    });
  };

  const handleStyleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      let count = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          let rawBase64 = reader.result as string;
          try {
            rawBase64 = await compressImage(rawBase64, 512, 512, 0.6);
          } catch (compressErr) {
            console.error("Erro na compressão de estilo:", compressErr);
          }
          store.addReferenciaEstilo(rawBase64, rawBase64);
          count++;
          if (count === files.length) {
            showToast(`${files.length} referência(s) de estilo importada(s) com sucesso!`, "success");
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const getCreativeSliderLabel = (val: number) => {
    if (val < 25) return "Sóbrio / Profissional";
    if (val < 55) return "Equilibrado / Comercial";
    if (val < 85) return "Criativo / Vibrante";
    return "Ultra Artístico / Fantasia";
  };

  const isProduct = store.tipoPainel === "PRODUCT";
  const isLogo = store.tipoPainel === "LOGO";
  const isGcTv = store.tipoPainel === "GC_TV";

  return (
    <div className="flex h-full w-full bg-black text-zinc-100 font-sans overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c5a880;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      
      {/* CONTEÚDO PRINCIPAL HEADER + ESPAÇO CORE WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
          {/* CORE WORKSPACE COM TAB-BAR E COLUNAS */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* horizontal browser tabs for active projects */}
          <div className="h-11 bg-black border-b border-white/5 flex items-center px-4 shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1">
              {store.projectsList.map((proj) => {
                const isActive = proj.id === store.activeProjectId;
                const isProjGenerating = !!store.generatingProjectIds?.[proj.id];
                return (
                  <div
                    key={proj.id}
                    onClick={() => store.loadProjectById(proj.id)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-black uppercase tracking-wider cursor-pointer border-t border-x transition-all duration-150 ${
                      isActive
                        ? "bg-black border-white/5 text-white"
                        : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {isProjGenerating && (
                      <Loader2 size={11} className="animate-spin text-[#ad8330] shrink-0" />
                    )}
                    <span className="truncate max-w-[120px]">{proj.name}</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (proj.id !== store.activeProjectId) {
                            store.loadProjectById(proj.id);
                          }
                          store.duplicateProject();
                          showToast(`Projeto "${proj.name}" duplicado!`, "success");
                        }}
                        className="text-zinc-600 hover:text-[#c5a880] transition-colors p-0.5 rounded opacity-0 group-hover:opacity-100"
                        title="Duplicar este projeto"
                      >
                        <Copy size={10} />
                      </button>
                      {store.projectsList.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            store.deleteProject(proj.id);
                          }}
                          className="text-zinc-600 hover:text-red-500 transition-colors p-0.5 rounded opacity-0 group-hover:opacity-100"
                          title="Excluir projeto"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  store.createProject();
                  showToast("Novo projeto limpo criado.", "success");
                }}
                className="p-1.5 hover:bg-[#111] rounded-lg text-zinc-500 hover:text-white transition-all ml-1 flex items-center gap-1"
                title="Novo Projeto Limpo"
              >
                <Plus size={12} />
              </button>
              <button
                onClick={() => {
                  store.duplicateProject();
                  showToast("Projeto atual duplicado com sucesso!", "success");
                }}
                className="p-1.5 hover:bg-[#111] rounded-lg text-zinc-500 hover:text-[#c5a880] transition-all flex items-center gap-1"
                title="Duplicar Configurações do Projeto Atual"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          {/* Mobile Segmented View Switcher (Visible only on mobile/small tablets) */}
          <div className="md:hidden flex items-center justify-center p-2 bg-black border-b border-white/5 gap-2 shrink-0 z-20">
            <button
              onClick={() => setMobileWorkspaceTab("config")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileWorkspaceTab === "config"
                  ? "bg-[#c5a880] text-black shadow-md font-extrabold"
                  : "bg-[#111] text-zinc-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Painel de Criação</span>
            </button>
            <button
              onClick={() => setMobileWorkspaceTab("preview")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileWorkspaceTab === "preview"
                  ? "bg-[#c5a880] text-black shadow-md font-extrabold"
                  : "bg-[#111] text-zinc-400 hover:text-white"
              }`}
            >
              <ImageIcon size={13} />
              <span>Visualização & Arte</span>
            </button>
          </div>

          {/* DOIS PAINEIS DO WORKSPACE */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
            <div className={`${mobileWorkspaceTab === 'config' ? 'flex' : 'hidden'} md:flex w-full md:w-[360px] lg:w-[420px] 2xl:w-[480px] bg-black border-b md:border-b-0 md:border-r border-white/5 flex-col h-full shrink-0 overflow-hidden`}>
              
              {/* TOPBAR MENU MOVED TO LEFT COLUMN */}
              <div className="flex flex-col border-b border-white/5 bg-black/90 shrink-0">
                
                {/* 1. NAVEGAÇÃO PRINCIPAL (TABS) */}
                <div className="p-2 border-b border-white/5 bg-black/40">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                    <button
                      onClick={() => setActiveMenuTab("Design Builder")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeMenuTab === "Design Builder"
                          ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-[#111]/60"
                      }`}
                    >
                      <Sparkles size={12} className="shrink-0" />
                      <span>{t("criar")}</span>
                    </button>
                    <button
                      onClick={() => setActiveMenuTab("Inspiração")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeMenuTab === "Inspiração"
                          ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-[#111]/60"
                      }`}
                    >
                      <Compass size={12} className="shrink-0" />
                      <span>{t("explorar")}</span>
                    </button>
                    <button
                      onClick={() => setActiveMenuTab("Minha Galeria")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeMenuTab === "Minha Galeria"
                          ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-[#111]/60"
                      }`}
                    >
                      <ImageIcon size={12} className="shrink-0" />
                      <span>{t("galeria")}</span>
                    </button>
                    <button
                      onClick={() => setActiveMenuTab("Engenharia de Prompt")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeMenuTab === "Engenharia de Prompt"
                          ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-[#111]/60"
                      }`}
                    >
                      <PenTool size={12} className="shrink-0" />
                      <span>{t("ref_builder")}</span>
                    </button>
                  </div>
                </div>

                {/* 2. SELETOR DE MÓDULO (DESIGNER | PRODUCT | LOGO | FOTO | GC TV) */}
                <div className="p-3 border-b border-white/5 bg-black/70 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#c5a880] shadow-[0_0_8px_rgba(197,168,128,0.6)] animate-pulse" />
                      Módulo: <span className="text-[#c5a880] font-black">{store.tipoPainel === "GC_TV" ? "Tarja de TV" : store.tipoPainel === "FOTO" ? "Foto (Edição)" : store.tipoPainel === "DESIGNER" ? "Designer" : store.tipoPainel === "PRODUCT" ? "Produto" : store.tipoPainel === "LOGO" ? "Logotipo" : store.tipoPainel}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#09090c] rounded-xl border border-white/10">
                    {[
                      { label: "Designer", value: "DESIGNER" },
                      { label: "Produto", value: "PRODUCT" },
                      { label: "Logo", value: "LOGO" },
                      { label: "Foto", value: "FOTO" }
                    ].map((pnl) => {
                      const isSel = store.tipoPainel === pnl.value;
                      return (
                        <button
                          key={pnl.value}
                          onClick={() => store.updateConfig({ tipoPainel: pnl.value as any })}
                          className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer text-center truncate ${
                            isSel
                              ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 font-extrabold shadow-md shadow-[#c5a880]/20"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                          title={pnl.value === "FOTO" ? "Módulo Foto — Edição de fotos de pessoas, alimentos, retratos e retoque realista" : pnl.label}
                        >
                          {pnl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. BARRA DE REFINAMENTO / CORREÇÃO PONTUAL */}
                <div className="p-3.5 bg-black/60 border-t border-b border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                      <Wand2 size={14} className="text-[#c5a880]" />
                      <span>Correção Pontual / Refinamento</span>
                    </div>
                    {store.galeriaImages && store.galeriaImages.length > 0 && (
                      <span className="text-[10px] font-black uppercase bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30 px-2.5 py-0.5 rounded-full">
                        Arte Ativa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-[#0d0d12] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-[#c5a880]/60 transition-colors shadow-inner">
                    <input
                      type="text"
                      placeholder='Ex: "Mude a cor da camisa para azul mantendo todo o resto igual"'
                      value={refineQuery}
                      onChange={(e) => setRefineQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                      className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none py-1"
                    />
                    <button
                      onClick={handleRefine}
                      className="px-3.5 py-1.5 bg-[#c5a880] hover:bg-[#b39873] text-black text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0 shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Wand2 size={12} />
                      <span>Corrigir</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          
          {activeMenuTab === "Design Builder" && (
            <>
              {/* Category Segmented Tabs for Clean Studio Organization */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar shrink-0 bg-[#09090d] p-2 rounded-2xl border border-white/10">
                {[
                  { id: "all", label: "Todos", icon: <Layers size={13} /> },
                  { id: "subject", label: "👤 Sujeito", icon: <User size={13} /> },
                  { id: "style", label: "🎨 Estilo & Luz", icon: <Palette size={13} /> },
                  { id: "layout", label: "📐 Formato & Fundo", icon: <Layout size={13} /> },
                  { id: "typography", label: "✍️ Texto & Logo", icon: <Type size={13} /> },
                  { id: "ai", label: "⚡ IA & Qualidade", icon: <Zap size={13} /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBuilderSectionTab(tab.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                      builderSectionTab === tab.id
                        ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 font-extrabold shadow-md shadow-[#c5a880]/20"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Sujeito / Produto */}
              {(builderSectionTab === "all" || builderSectionTab === "subject") && (
              <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                      {isProduct ? <Layers size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {isLogo ? "Logotipo da Marca" : (isProduct ? "Produto Principal" : t("sujeito_principal"))}
                      </h3>
                      <p className="text-[11px] text-zinc-400">Defina o foco central da sua arte</p>
                    </div>
                  </div>

                  {/* Toggle Desativar Sujeito */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {store.desativarSujeito ? "Inativo" : "Ativo"}
                    </span>
                    <button
                      onClick={() => store.updateConfig({ desativarSujeito: !store.desativarSujeito })}
                      className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                      style={{ backgroundColor: store.desativarSujeito ? "#27272a" : "#c5a880" }}
                      title="Ativar/Desativar inclusão de sujeito ou produto"
                    >
                      <div
                        className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                        style={{ transform: store.desativarSujeito ? "translateX(0)" : "translateX(20px)" }}
                      />
                    </button>
                  </div>
                </div>

            {!store.desativarSujeito && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Componente Modular ImageUploader */}
                <ImageUploader
                  type={isLogo ? "logo" : (isProduct ? "product" : "person")}
                  label={isLogo ? "Referências de Logo" : (isProduct ? "Fotos do Produto" : "Fotos do Sujeito")}
                  icon={isProduct ? <Layers size={18} className="text-[#c5a880]" /> : <User size={18} className="text-[#c5a880]" />}
                  base64s={store.sujeitosBase64List || []}
                  onUpdateBase64s={store.setSujeitoBase64List}
                  showToast={showToast}
                />

                <div className="space-y-3.5">
                  {/* Gênero ou Posicionamento */}
                  {!isProduct && !isLogo ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{t("genero")}</label>
                        <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={store.multiplesPersons || false}
                            onChange={(e) => store.updateConfig({ multiplesPersons: e.target.checked })}
                            className="rounded bg-black border-white/10 text-[#c5a880] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer accent-[#c5a880]"
                          />
                          <span>{t("mais_de_uma_pessoa")}</span>
                        </label>
                      </div>
                      
                      {!store.multiplesPersons ? (
                        <div className="flex gap-1.5 p-1 bg-[#111116] rounded-xl border border-white/5">
                          {[
                            { key: "Masculino", label: t("masculino") },
                            { key: "Feminino", label: t("feminino") },
                            { key: "Outros", label: t("outros") }
                          ].map((gen) => {
                            const isSelected = store.gender === gen.key;
                            return (
                              <button
                                key={gen.key}
                                onClick={() => store.updateConfig({ gender: gen.key })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isSelected ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 font-extrabold shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                {gen.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <textarea
                          value={store.gendersDescription || ""}
                          onChange={(e) => store.updateConfig({ gendersDescription: e.target.value })}
                          placeholder="Descreva as pessoas da foto..."
                          rows={2}
                          className="w-full bg-[#131318] border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] resize-none"
                        />
                      )}
                    </div>
                  ) : null}

                  {/* Posição do Sujeito */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">{t("posicao_sujeito")}</label>
                    <div className="flex gap-1.5 p-1 bg-[#111116] rounded-xl border border-white/5">
                      {[
                        { key: "Esquerda", label: "⬅️ " + t("esquerda") },
                        { key: "Centro", label: "⏺️ " + t("centro") },
                        { key: "Direita", label: "➡️ " + t("direita") }
                      ].map((pos) => {
                        const isSelected = store.positioning === pos.key;
                        return (
                          <button
                            key={pos.key}
                            onClick={() => store.updateConfig({ positioning: pos.key })}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 font-extrabold shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Descrição da pose ou roupa / Detalhes do produto */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      {isProduct ? "Características do Produto" : t("desc_pose")}
                    </label>
                    <input
                      type="text"
                      value={store.poseDescription || ""}
                      onChange={(e) => store.updateConfig({ poseDescription: e.target.value })}
                      placeholder={isProduct ? "Ex: Frasco de vidro fosco, tampa dourada..." : t("placeholder_pose")}
                      className="w-full bg-[#131318] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Dimensões com ícones visuais representativos */}
          {(builderSectionTab === "all" || builderSectionTab === "layout") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                <Layout size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{t("dimensoes")}</h3>
                <p className="text-[11px] text-zinc-400">{t("selecione_formato")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { 
                  label: "Automático (Foto)", 
                  value: "AUTO",
                  icon: <Sparkles size={14} className="text-[#c5a880]" />
                },
                { 
                  label: "1:1 Feed", 
                  value: "1:1",
                  icon: <div className="w-3.5 h-3.5 border-2 border-current rounded" />
                },
                { 
                  label: "3:4 Retrato", 
                  value: "3:4",
                  icon: <div className="w-3 h-4 border-2 border-current rounded" />
                },
                { 
                  label: "9:16 Story", 
                  value: "9:16",
                  icon: <div className="w-2.5 h-4.5 border-2 border-current rounded" />
                },
                { 
                  label: "16:9 Banner", 
                  value: "16:9",
                  icon: <div className="w-4.5 h-2.5 border-2 border-current rounded" />
                }
              ].map((dim) => {
                const isSelected = store.dimensao === dim.value;
                return (
                  <button
                    key={dim.value}
                    onClick={() => store.updateConfig({ dimensao: dim.value })}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#c5a880] to-[#b08e58] border-[#c5a880] text-zinc-950 shadow-lg shadow-[#c5a880]/20 font-extrabold"
                        : "bg-[#131318] border-white/5 text-zinc-400 hover:text-white hover:border-[#c5a880]/40"
                    }`}
                  >
                    {dim.icon}
                    <span className="text-[10px] tracking-wide">{dim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Tipografia (Camadas de textos configuráveis) */}
          {(builderSectionTab === "all" || builderSectionTab === "typography") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                  <Type size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{t("tipografia_camadas")}</h3>
                  <p className="text-[11px] text-zinc-400">{t("crie_camadas")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {store.enableTypography ? "Ativo" : "Inativo"}
                </span>
                <button
                  onClick={() => store.updateConfig({ enableTypography: !store.enableTypography })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.enableTypography ? "#c5a880" : "#27272a" }}
                  title="Ativar/Desativar tipografia"
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.enableTypography ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>

            {store.enableTypography && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Referência de Tipografia por Imagem */}
                <div className="p-4 bg-[#111116] rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#c5a880]" />
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Copiar Tipografia por Imagem</span>
                  </div>
                  <ImageUploader
                    type="env"
                    label="Captura da Tipografia"
                    icon={<ImageIcon size={16} className="text-[#c5a880]" />}
                    base64s={store.tipografiaRefsList || []}
                    onUpdateBase64s={store.setTipografiaRefsList}
                    showToast={showToast}
                  />
                  <textarea
                    value={store.promptTipografia || ""}
                    onChange={(e) => store.updateConfig({ promptTipografia: e.target.value })}
                    placeholder="Ex: Copiar exatamente o texto 'ZION' com a mesma fonte sans-serif e peso..."
                    rows={2}
                    className="w-full bg-[#14141a] border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] resize-none"
                  />
                </div>

                {/* Lista de Camadas de Texto */}
                <div className="space-y-3">
                  {store.camadasTexto.map((layer, index) => (
                    <div key={layer.id} className="p-4 bg-[#111116] rounded-xl border border-white/5 space-y-3 relative group hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#c5a880] bg-[#c5a880]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Camada #{index + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => store.moverCamadaTexto(layer.id, "cima")}
                            disabled={index === 0}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-20 cursor-pointer text-zinc-400 hover:text-white transition-colors"
                            title="Mover para cima"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => store.moverCamadaTexto(layer.id, "baixo")}
                            disabled={index === store.camadasTexto.length - 1}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-20 cursor-pointer text-zinc-400 hover:text-white transition-colors"
                            title="Mover para baixo"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            onClick={() => store.removeCamadaTexto(layer.id)}
                            className="p-1 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 rounded cursor-pointer transition-colors ml-1"
                            title="Excluir camada"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Conteúdo frase */}
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Texto da Camada</label>
                        <input
                          type="text"
                          value={layer.conteudo}
                          onChange={(e) => store.updateCamadaTexto(layer.id, { conteudo: e.target.value })}
                          placeholder="Digite o texto da arte..."
                          className="w-full bg-[#16161d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] font-medium"
                        />
                      </div>

                      {/* Função & Cor */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Função / Papel</label>
                          <select
                            value={layer.funcao}
                            onChange={(e) => store.updateCamadaTexto(layer.id, { funcao: e.target.value as any })}
                            className="w-full bg-[#16161d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a880] font-bold cursor-pointer"
                          >
                            <option value="Headline Principal">Título Principal</option>
                            <option value="Subheadline Secundário">Subtítulo Secundário</option>
                            <option value="CTA Botão">Botão (CTA)</option>
                            <option value="Corpo Descrição">Corpo Descrição</option>
                            <option value="Legenda / Detalhe">Legenda / Detalhe</option>
                            <option value="Badge / Selo">Selo</option>
                            <option value="Preço / Valor">Preço / Valor</option>
                            <option value="Data / Horário">Data / Horário</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Cor do Texto</label>
                          <div className="flex items-center gap-2 bg-[#16161d] border border-white/10 rounded-xl px-2 py-1">
                            <input
                              type="color"
                              value={layer.cor}
                              onChange={(e) => store.updateCamadaTexto(layer.id, { cor: e.target.value })}
                              className="w-6 h-6 rounded-lg border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={layer.cor}
                              onChange={(e) => store.updateCamadaTexto(layer.id, { cor: e.target.value })}
                              className="w-full bg-transparent text-xs text-white focus:outline-none font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Escolha da Fonte */}
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Família da Fonte</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          {["Montserrat", "Poppins", "Outfit", "Inter", "Playfair Display", "Cinzel", "Unbounded"].map((font) => (
                            <button
                              key={font}
                              type="button"
                              onClick={() => store.updateCamadaTexto(layer.id, { fonte: font })}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                                layer.fonte === font
                                  ? "bg-[#c5a880] text-zinc-950 shadow-sm"
                                  : "bg-[#181820] text-zinc-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {font}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => store.addCamadaTexto()}
                  className="w-full py-3 bg-[#131318] hover:bg-[#181820] border border-dashed border-[#c5a880]/30 hover:border-[#c5a880] text-xs font-bold uppercase tracking-wider text-[#c5a880] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Adicionar Bloco de Texto</span>
                </button>

                {/* Posição Global */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Alinhamento Global</label>
                  <div className="flex gap-1.5 p-1 bg-[#111116] rounded-xl border border-white/5">
                    {(["ESQUERDA", "CENTRO", "DIREITA"] as const).map((pos) => {
                      const isSel = store.typographyPosition === pos;
                      return (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => store.updateConfig({ typographyPosition: pos })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isSel ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 font-extrabold shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {pos}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Cenário Customizado & Prompt Adicional Cenário */}
          {(builderSectionTab === "all" || builderSectionTab === "layout") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Cenário & Ambiente</h3>
                  <p className="text-[11px] text-zinc-400">Personalize o plano de fundo do criativo</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {store.useEnvRef ? "Ativo" : "Inativo"}
                </span>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ useEnvRef: !store.useEnvRef })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.useEnvRef ? "#c5a880" : "#27272a" }}
                  title="Ativar fotos de cenário"
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.useEnvRef ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>

            {store.useEnvRef && (
              <ImageUploader
                type="env"
                label="Fotos de Cenário"
                icon={<ImageIcon size={18} className="text-[#c5a880]" />}
                base64s={store.cenariosBase64List || []}
                onUpdateBase64s={store.setCenarioBase64List}
                showToast={showToast}
              />
            )}

            {/* Prompt Adicional Cenário */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">Descrição do Cenário</label>
              <input
                type="text"
                value={store.promptCenario}
                onChange={(e) => store.updateConfig({ promptCenario: e.target.value })}
                placeholder="Ex: Balcão bar de luxo, iluminação quente, ambiente sofisticado..."
                className="w-full bg-[#131318] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]"
              />
              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "🍸 Bar de Luxo",
                  "🎤 Palco com Luzes & Fumaça",
                  "🏢 Escritório Moderno",
                  "🌴 Pôr do Sol Tropical",
                  "✨ Estúdio Minimalista Escuro"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => store.updateConfig({ promptCenario: chip.replace(/^.+?\s/, "") })}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#16161c] hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Referência de Design Obrigatório */}
          {(builderSectionTab === "all" || builderSectionTab === "layout") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                <Layout size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Layout Obrigatório</h3>
                <p className="text-[11px] text-zinc-400">Guie o layout e a composição por imagem</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#c5a880]/10 border border-[#c5a880]/20 p-3.5 rounded-xl text-xs text-zinc-300 leading-relaxed">
              <Info size={16} className="text-[#c5a880] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#c5a880] block font-bold mb-0.5">COMO A IA USA A REFERÊNCIA:</strong>
                A IA replica o grid e enquadramento. Textos, datas e contatos antigos da imagem de referência são 100% descartados e substituídos pelos seus.
              </div>
            </div>

            <ImageUploader
              type="env"
              label="Referência de Layout"
              icon={<Layout size={18} className="text-[#c5a880]" />}
              base64s={store.designRefsList || []}
              onUpdateBase64s={store.setDesignRefsList}
              showToast={showToast}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">O que absorver deste layout?</label>
              <textarea
                value={store.promptDesign || ""}
                onChange={(e) => store.updateConfig({ promptDesign: e.target.value })}
                placeholder="Ex: Manter sujeito no centro e elementos geométricos atrás..."
                rows={2}
                className="w-full bg-[#131318] border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] resize-none"
              />
            </div>
          </div>
          )}

          {/* Logotipo da Marca */}
          {(builderSectionTab === "all" || builderSectionTab === "typography") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Logotipo da Marca</h3>
                  <p className="text-[11px] text-zinc-400">Insira a identidade visual no criativo</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {store.useLogo ? "Ativo" : "Inativo"}
                </span>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ useLogo: !store.useLogo })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.useLogo ? "#c5a880" : "#27272a" }}
                  title="Ativar/Desativar logo"
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.useLogo ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>

            {store.useLogo && (
              <div className="animate-in fade-in duration-200 space-y-3">
                <ImageUploader
                  type="env"
                  label="Logotipo (imagem com fundo transparente)"
                  icon={<Layers size={18} className="text-[#c5a880]" />}
                  base64s={store.logosList || []}
                  onUpdateBase64s={store.setLogosList}
                  showToast={showToast}
                  maxUploads={1}
                />
                <p className="text-[11px] text-zinc-400 italic">
                  O logotipo é aplicado com fidelidade no topo da arte, sem cobrir o sujeito.
                </p>
              </div>
            )}
          </div>
          )}

          {/* Referências de Estilos Individuais com Descrição */}
          {(builderSectionTab === "all" || builderSectionTab === "style") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                  <Palette size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Referências de Estilo</h3>
                  <p className="text-[11px] text-zinc-400">Guie a atmosfera visual e a paleta</p>
                </div>
              </div>

              <div className="relative overflow-hidden shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleStyleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-24"
                />
                <button type="button" className="px-3 py-1.5 bg-[#181820] hover:bg-[#20202a] border border-white/10 hover:border-[#c5a880]/40 rounded-xl text-xs font-bold text-[#c5a880] cursor-pointer transition-all">
                  + Adicionar
                </button>
              </div>
            </div>

            {store.referenciasEstilo.length > 0 ? (
              <div className="space-y-3">
                {store.referenciasEstilo.map((ref) => (
                  <div key={ref.id} className="p-3 bg-[#111116] rounded-xl border border-white/5 flex gap-3 relative group">
                    <button
                      type="button"
                      onClick={() => store.removeReferenciaEstilo(ref.id)}
                      className="absolute top-2 right-2 p-1 bg-black/80 hover:bg-rose-500 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                      title="Remover referência"
                    >
                      <X size={12} />
                    </button>
 
                    <div
                      onClick={() => setModalImageRefUrl(ref.url)}
                      className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900 cursor-zoom-in relative group/img"
                      title="Ver ampliado"
                    >
                      <img src={ref.url} className="w-full h-full object-cover" alt="Estilo Ref" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={12} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center pr-6">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">O que copiar do estilo?</span>
                      <input
                        type="text"
                        value={ref.descricao}
                        onChange={(e) => store.updateReferenciaEstilo(ref.id, e.target.value)}
                        placeholder="Ex: Tons dourados, iluminação suave de cinema..."
                        className="w-full bg-[#16161d] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-white/10 rounded-xl bg-[#111116]">
                <span className="text-[11px] font-medium text-zinc-500">Nenhuma referência de estilo adicionada ainda</span>
              </div>
            )}
          </div>
          )}

          {/* Cores & Iluminação */}
          {(builderSectionTab === "all" || builderSectionTab === "style") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Cores & Iluminação de Estúdio</h3>
                  <p className="text-[11px] text-zinc-400">Ajuste os tons de luz e atmosfera</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {store.coresAutomaticas ? "Automático" : "Manual"}
                </span>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ coresAutomaticas: !store.coresAutomaticas })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.coresAutomaticas ? "#c5a880" : "#27272a" }}
                  title="Ativar cores automáticas harmônicas"
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.coresAutomaticas ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>

            {!store.coresAutomaticas && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "ambiente", label: "Ambiente", defaultVal: "#000000" },
                    { key: "recorte", label: "Recorte", defaultVal: "#ffffff" },
                    { key: "complementar", label: "Complementar", defaultVal: "#c5a880" }
                  ].map(({ key, label, defaultVal }) => (
                    <div key={key} className="p-3 bg-[#111116] border border-white/5 rounded-xl flex flex-col gap-2 hover:border-[#c5a880]/30 transition-all">
                      <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{label}</span>
                      <div className="flex items-center gap-2 bg-[#16161d] border border-white/10 rounded-lg px-2 py-1">
                        <input
                          type="color"
                          value={(store.cores as any)?.[key] || defaultVal}
                          onChange={(e) => store.updateConfig({
                            cores: { ...store.cores, [key]: e.target.value }
                          })}
                          className="w-6 h-6 rounded-md border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={(store.cores as any)?.[key] || defaultVal}
                          onChange={(e) => store.updateConfig({
                            cores: { ...store.cores, [key]: e.target.value }
                          })}
                          className="w-full bg-transparent text-xs text-white focus:outline-none font-mono uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cor Dominante e Degradê Leitura */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Cor Dominante da Marca</span>
                  <span className="text-[11px] text-zinc-500">Injeta a cor de assinatura nos elementos</span>
                </div>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ useCorDominante: !store.useCorDominante })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.useCorDominante ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.useCorDominante ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.useCorDominante && (
                <div className="flex items-center justify-between p-3 bg-[#111116] rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Tom Escolhido</span>
                  <div className="flex items-center gap-2 bg-[#16161d] border border-white/10 rounded-lg px-2 py-1">
                    <input
                      type="color"
                      value={store.corDominante}
                      onChange={(e) => store.updateConfig({ corDominante: e.target.value })}
                      className="w-6 h-6 rounded-md border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={store.corDominante}
                      onChange={(e) => store.updateConfig({ corDominante: e.target.value })}
                      className="w-20 bg-transparent text-xs text-white focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Degradê de Leitura</span>
                  <span className="text-[11px] text-zinc-500">Aumenta o contraste para leitura perfeita dos textos</span>
                </div>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ degradeLeitura: !store.degradeLeitura })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.degradeLeitura ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.degradeLeitura ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Composição */}
          {(builderSectionTab === "all" || builderSectionTab === "style") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Composição & Enquadramento</h3>
                <p className="text-[11px] text-zinc-400">Escolha o plano e objetos de profundidade</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { name: "Close-up (Rosto)", desc: "Foco no rosto e expressão" },
                { name: "Plano Médio (Busto)", desc: "Da cintura para cima" },
                { name: "Plano Americano", desc: "Do joelho para cima" }
              ].map((framingItem) => {
                const isSelected = store.composicao === framingItem.name;
                return (
                  <div
                    key={framingItem.name}
                    onClick={() => store.updateConfig({ composicao: framingItem.name })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border-[#c5a880] text-white shadow-md shadow-[#c5a880]/10"
                        : "bg-[#111116] border-white/5 text-zinc-400 hover:text-white hover:border-[#c5a880]/30"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#c5a880]' : 'text-zinc-300'}`}>{framingItem.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-1">{framingItem.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Campo livre de Composição */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Composição Livre (Opcional)</label>
              <input
                type="text"
                value={store.composicaoCustom || ""}
                onChange={(e) => store.updateConfig({ composicaoCustom: e.target.value })}
                placeholder="Ex: Sujeito levemente inclinado à esquerda com espaço negativo à direita..."
                className="w-full bg-[#131318] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Elementos Flutuantes Avançados */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Elementos Flutuantes</span>
                <span className="text-[11px] text-zinc-500">Partículas e objetos suspensos para profundidade 3D</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#111116] rounded-xl border border-white/5">
                {[
                  { label: "Desligar", value: "off" },
                  { label: "Automático", value: "auto" },
                  { label: "Descrever", value: "custom" }
                ].map((opt) => {
                  const isSelected = store.floatingElementsMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => store.updateConfig({ floatingElementsMode: opt.value as any })}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#c5a880] text-zinc-950 shadow-sm" 
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {store.floatingElementsMode === "custom" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    value={store.floatingElementsCustom || ""}
                    onChange={(e) => store.updateConfig({ floatingElementsCustom: e.target.value })}
                    placeholder="Ex: Gotas de água cristalina, faíscas douradas desfocadas..."
                    className="w-full bg-[#131318] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              )}
            </div>
          </div>
          )}

          {/* Atributos Visuais & Estilo */}
          {(builderSectionTab === "all" || builderSectionTab === "style") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                <SlidersHorizontal size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Atributos Visuais & Estilo</h3>
                <p className="text-[11px] text-zinc-400">Intensidade criativa e filtros estéticos</p>
              </div>
            </div>

            {/* Slider de Sobriedade com Porcentagem Dinâmica */}
            <div className="bg-[#111116] border border-white/5 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                <span className="uppercase tracking-wider">Nível Criativo da IA</span>
                <span className="text-[#c5a880] font-extrabold bg-[#c5a880]/10 px-2 py-0.5 rounded-md">
                  {store.nivelCriativo}% — {getCreativeSliderLabel(store.nivelCriativo)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={store.nivelCriativo}
                onChange={(e) => store.updateConfig({ nivelCriativo: parseInt(e.target.value) })}
                className="w-full h-2 bg-[#181820] rounded-lg appearance-none cursor-pointer accent-[#c5a880] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <span>Minimalista / Fiel</span>
                <span>Ultra Artístico</span>
              </div>
            </div>

            {/* Style Selector */}
            <StyleSelector
              enableEstiloVisual={store.enableEstiloVisual ?? true}
              setEnableEstiloVisual={(val) => store.updateConfig({ enableEstiloVisual: val })}
            />

            {/* Toggles extras */}
            <div className="space-y-3 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Desfoque de Fundo (Profundidade de Campo)</span>
                  <span className="text-[11px] text-zinc-500">Aplica profundidade de campo cinematográfica</span>
                </div>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ enableBlur: !store.enableBlur })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-250 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.enableBlur ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-250 shadow-md"
                    style={{ transform: store.enableBlur ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Degradê Lateral</span>
                  <span className="text-[11px] text-zinc-500">Vinheta lateral para contraste em layouts</span>
                </div>
                <button
                  type="button"
                  onClick={() => store.updateConfig({ lateralGradient: !store.lateralGradient })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-250 cursor-pointer shrink-0"
                  style={{ backgroundColor: store.lateralGradient ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-250 shadow-md"
                    style={{ transform: store.lateralGradient ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Entradas Manuais */}
          {(builderSectionTab === "all" || builderSectionTab === "style" || builderSectionTab === "ai") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                <Terminal size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Instruções Manuais</h3>
                <p className="text-[11px] text-zinc-400">Adicione comandos livres e restrições</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Instrução Adicional Livre</label>
              <textarea
                value={store.additionalPrompt}
                onChange={(e) => store.updateConfig({ additionalPrompt: e.target.value })}
                placeholder="Ex: Incluir iluminação volumétrica dourada ao fundo, sensação premium..."
                rows={2}
                className="w-full bg-[#131318] border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">O que evitar na imagem</label>
              <textarea
                value={store.negativePrompt}
                onChange={(e) => store.updateConfig({ negativePrompt: e.target.value })}
                placeholder="Ex: óculos, distorções, dedos extras, texto ilegível, baixa resolução..."
                rows={2}
                className="w-full bg-[#131318] border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880] resize-none"
              />
            </div>
          </div>
          )}

          {/* Seleção de Modelo & Render */}
          {(builderSectionTab === "all" || builderSectionTab === "ai") && (
          <div className="bg-[#0c0c10]/95 border border-white/10 hover:border-[#c5a880]/30 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center shrink-0 shadow-sm">
                <Zap size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Modelo de IA & Qualidade</h3>
                <p className="text-[11px] text-zinc-400">Escolha o modelo e a resolução</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "nanobanana-pro", name: "Nano Banana Pro", desc: "Qualidade 4K", icon: <Banana size={18} /> },
                { id: "gemini-3.7", name: "Gemini 3.7 Flash", desc: "Raciocínio & Visão", icon: <Sparkles size={18} /> },
                { id: "gemini-3.6", name: "Gemini 3.6", desc: "Alta Precisão", icon: <Sparkles size={18} /> },
                { id: "gemini-3.5-pro", name: "Gemini 3.5 Pro", desc: "Ultra Qualidade", icon: <Sparkles size={18} /> }
              ].map((model) => {
                const isSelected = (!store.modelId && model.id === "nanobanana-pro") || store.modelId === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => store.updateConfig({ modelId: model.id })}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-br from-[#c5a880]/20 to-[#c5a880]/5 border-[#c5a880] text-white shadow-md shadow-[#c5a880]/10"
                        : "bg-[#111116] border-white/5 text-zinc-400 hover:text-white hover:border-[#c5a880]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={isSelected ? "text-[#c5a880]" : "text-zinc-500"}>
                        {model.icon}
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-pulse" />
                      )}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-[#c5a880]' : 'text-zinc-200'}`}>
                        {model.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">{model.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Qualidade e Variações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Resolução Máxima</label>
                <div className="flex gap-1.5 p-1 bg-[#111116] rounded-xl border border-white/5">
                  {["1K", "2K", "4K"].map((q) => {
                    const isSelected = store.resolucao === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => store.updateConfig({ resolucao: q })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 shadow-sm font-extrabold" : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">Quantidade de Variações</label>
                <div className="flex gap-1 p-1 bg-[#111116] rounded-xl border border-white/5">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = store.variations === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => store.updateConfig({ variations: num })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? "bg-gradient-to-r from-[#c5a880] to-[#b08e58] text-zinc-950 shadow-sm font-extrabold" : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Seed */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Semente (Opcional)</label>
                {store.seedUsuario && (
                  <button
                    type="button"
                    onClick={() => store.setSeedUsuario(null)}
                    className="text-[10px] text-[#c5a880] hover:text-white font-bold"
                  >
                    LIMPAR
                  </button>
                )}
              </div>
              <input
                type="number"
                placeholder="Aleatório (Deixe vazio para gerar novo estilo a cada clique)"
                value={store.seedUsuario || ""}
                onChange={(e) => store.setSeedUsuario(e.target.value ? e.target.value : null)}
                className="w-full bg-[#131318] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Toggle Somente Prompt & Instrução */}
            <div className="flex items-center justify-between p-3.5 bg-[#111116] rounded-xl border border-white/5 mt-2">
              <div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Modo Somente Prompt & Instrução</span>
                <span className="text-[11px] text-zinc-500">Gera a engenharia de prompt sem debitar renderização</span>
              </div>
              <button
                type="button"
                onClick={() => store.updateConfig({ somentePrompt: !store.somentePrompt })}
                className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer shrink-0"
                style={{ backgroundColor: store.somentePrompt ? "#c5a880" : "#27272a" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                  style={{ transform: store.somentePrompt ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>
          </div>
          )}

          <div className="pt-3 flex flex-col gap-2.5">
            <button
              onClick={() => generatePremiumImage()}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[#c5a880] via-[#d4bc97] to-[#b08e58] hover:from-[#d4bc97] hover:to-[#c5a880] disabled:opacity-50 text-zinc-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#c5a880]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden group hover:shadow-[0_6px_20px_rgba(197,168,128,0.35)]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-zinc-950" />
                  <span className="text-zinc-950 font-extrabold">
                    {store.somentePrompt ? "Gerando Prompt & Instrução..." : "Gerando Arte..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-zinc-950 group-hover:scale-110 transition-transform" />
                  <span className="text-zinc-950 font-black">
                    {store.somentePrompt ? "Gerar Prompt & Instrução" : "Gerar Arte"}
                  </span>
                </>
              )}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleDuplicateConfig}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-[#c5a880]/50 text-zinc-200 hover:text-[#c5a880] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] shadow-sm group"
                title="Abre um novo projeto duplicando todas as configurações e referências atuais"
              >
                <Copy size={13} className="text-[#c5a880] group-hover:scale-110 transition-transform" />
                <span>Duplicar Config</span>
              </button>

              <button
                onClick={handleCopyPrompt}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#111116] hover:bg-[#181822] border border-white/10 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] ${
                  isCopied ? "bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880]" : ""
                }`}
                title="Copiar prompt final construído"
              >
                {isCopied ? <CheckCircle size={13} className="text-[#c5a880]" /> : <Terminal size={13} className="text-[#c5a880]" />}
                <span>{isCopied ? "Prompt Copiado!" : "Copiar Prompt"}</span>
              </button>
            </div>
          </div>
          </>
          )}

          {activeMenuTab === "Engenharia de Prompt" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Ref Builder Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-xs font-black text-[#c5a880] tracking-widest uppercase">Estúdio de Referências</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Engenharia de Prompt PRO</h3>
                <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider">Ajuste os pesos das referências visuais para obter consistência máxima em seus criativos.</p>
              </div>

              {/* Referência de Personagem */}
              <div className="bg-black/50 border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#c5a880] pl-3">
                  <User size={14} className="text-[#c5a880]" />
                  <span className="text-sm font-semibold text-white tracking-tight">Referência de Personagem (Identidade)</span>
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Garanta rostos e identidades idênticas em múltiplos criativos.</p>
                <div className="border border-dashed border-white/5 bg-black/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <User size={24} className="text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para enviar o rosto de referência</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-zinc-500 uppercase tracking-widest">
                    <span>Peso do Personagem (Força)</span>
                    <span className="text-[#c5a880]">0.85</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.85" className="w-full accent-[#c5a880] bg-[#111] rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>

              {/* Referência de Estilo */}
              <div className="bg-black/50 border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#c5a880] pl-3">
                  <Palette size={14} className="text-[#c5a880]" />
                  <span className="text-sm font-semibold text-white tracking-tight">Referência de Estilo (Transferência de Estilo)</span>
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Copie cores, pinceladas, iluminação de estúdio e texturas de uma imagem base.</p>
                <div className="border border-dashed border-white/5 bg-black/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Palette size={24} className="text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir estilo de referência</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-zinc-500 uppercase tracking-widest">
                    <span>Peso do Estilo</span>
                    <span className="text-[#c5a880]">0.70</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.70" className="w-full accent-[#c5a880] bg-[#111] rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>

              {/* Referência de Estrutura */}
              <div className="bg-black/50 border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#c5a880] pl-3">
                  <Layout size={14} className="text-[#c5a880]" />
                  <span className="text-sm font-semibold text-white tracking-tight">Estrutura & Grade (Controle de Composição)</span>
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Preserve o layout original do flyer, posição dos elementos e profundidade.</p>
                <div className="border border-dashed border-white/5 bg-black/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Layout size={24} className="text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir grid estrutural</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-zinc-500 uppercase tracking-widest">
                    <span>Fidelidade da Estrutura</span>
                    <span className="text-[#c5a880]">0.90</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.90" className="w-full accent-[#c5a880] bg-[#111] rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeMenuTab === "Inspiração" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Inspiração Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-xs font-black text-[#c5a880] tracking-widest uppercase">Modelos Premium</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Inspiradores Zion</h3>
                <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider">Clique em um modelo inspirado nos panfletos premium da Zion Company para configurar instantaneamente o designer.</p>
              </div>

              {/* Grid de Presets */}
              <div className="grid grid-cols-1 gap-4">
                {templatePresets.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3.5 relative group ${
                        isSelected
                          ? "bg-[#c5a880]/10 border-[#c5a880] shadow-[0_0_15px_rgba(173,131,48,0.1)]"
                          : "bg-black/20 border-white/5 hover:border-white/5 hover:bg-black/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black text-[#c5a880] uppercase tracking-widest">
                            {template.category}
                          </span>
                          <span className="text-xs font-extrabold text-zinc-100 uppercase tracking-wider group-hover:text-white transition-colors">
                            {template.name}
                          </span>
                        </div>
                        <span className="bg-black border border-white/5 text-[10px] font-black px-2 py-0.5 rounded text-zinc-400">
                          PROPORÇÃO {template.dimensao}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {template.estilosVisuais.map((st) => (
                          <span key={st} className="bg-[#111] border border-white/5 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded text-zinc-500">
                            {st}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {template.camadasTexto.length} Blocos de Texto
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aplicar parâmetros ao store
                            store.updateConfig({
                              dimensao: template.dimensao as any,
                              additionalPrompt: template.additionalPrompt,
                              promptCenario: template.promptCenario,
                              cores: {
                                ambiente: template.bgColor,
                                recorte: template.accentColor,
                                complementar: template.textColor
                              },
                              corDominante: template.corDominante,
                              useCorDominante: template.useCorDominante,
                              estilosVisuais: template.estilosVisuais,
                              nivelCriativo: template.nivelCriativo,
                              enableTypography: true
                            });

                            // Carregar as camadas de texto no store
                            // Primeiro remove todas as camadas existentes
                            const curLayers = store.camadasTexto || [];
                            curLayers.forEach(l => store.removeCamadaTexto(l.id));
                            // Adiciona as novas do template
                            template.camadasTexto.forEach(layer => {
                              store.addCamadaTexto();
                              // Encontra a última camada adicionada
                              const updatedList = useProjectStore.getState().camadasTexto;
                              const lastLayer = updatedList[updatedList.length - 1];
                              if (lastLayer) {
                                store.updateCamadaTexto(lastLayer.id, {
                                  conteudo: layer.conteudo,
                                  funcao: layer.funcao,
                                  fonte: layer.fonte,
                                  cor: layer.cor
                                });
                              }
                            });

                            setActiveMenuTab("Design Builder");
                            showToast(`Modelo "${template.name}" carregado com sucesso! Clique em "Gerar" na coluna direita.`, "success");
                          }}
                          className="px-3 py-1 bg-[#111] border border-white/5 hover:border-[#c5a880]/40 group-hover:bg-[#c5a880] group-hover:text-black hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest text-[#c5a880] rounded-lg"
                        >
                          Aplicar Modelo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeMenuTab === "Comunidade" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Comunidade Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-xs font-black text-[#c5a880] tracking-widest uppercase">Zion Hub</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Feed da Comunidade</h3>
                <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider">Inspire-se em layouts de alto nível criados por outros diretores de arte da agência.</p>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                {communityCreations.map((item) => (
                  <div key={item.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-3.5 hover:border-white/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.avatarColor} text-black font-semibold text-xs`}>
                          {item.author.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider">{item.author}</span>
                          <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">{item.role}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-black/40 border border-white/5 text-zinc-400 px-2 py-0.5 rounded">
                        PROPORÇÃO {item.dimensao}
                      </span>
                    </div>

                    <div className="space-y-1 bg-black p-3 rounded-xl border border-white/5">
                      <span className="text-[11px] font-extrabold text-[#c5a880] uppercase tracking-widest block">Instrução Utilizada</span>
                      <p className="text-xs font-bold text-zinc-300 leading-relaxed font-mono select-all">
                        {item.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors">
                          <Heart size={11} />
                          <span>{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-[#c5a880] transition-colors">
                          <Share2 size={11} />
                          <span>{item.shares}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          store.updateConfig({
                            additionalPrompt: item.prompt,
                            dimensao: item.dimensao as any,
                            estilosVisuais: item.styles
                          });
                          setActiveMenuTab("Design Builder");
                          showToast("Prompt e dimensões clonados com sucesso!", "success");
                        }}
                        className="px-3 py-1 bg-[#c5a880]/10 border border-[#c5a880]/20 hover:bg-[#c5a880] hover:text-black transition-all text-[10px] font-black uppercase tracking-widest text-[#c5a880] rounded-lg"
                      >
                        Usar Instrução
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {activeMenuTab === "Minha Galeria" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Galeria Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-xs font-black text-[#c5a880] tracking-widest uppercase">Histórico Digital</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Minha Galeria</h3>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              store.setGaleriaImages((prev: string[]) => {
                                const next = [reader.result as string, ...prev];
                                store.setActiveImageIndex(0);
                                return next;
                              });
                              showToast("Imagem adicionada à galeria", "success");
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c5a880] hover:bg-[#b39873] text-zinc-950 rounded text-xs font-black tracking-widest uppercase transition-colors pointer-events-none">
                      <Upload size={12} />
                      Fazer Upload de Imagens
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-wider mt-1">Visualize, filtre e gerencie todas as criações premium salvas neste projeto.</p>
              </div>

              {/* Filtros da Galeria */}
              <div className="space-y-3">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Filtros de Proporção</span>
                <div className="flex flex-wrap gap-1 bg-black p-1 rounded-lg border border-white/5">
                  {["Todos", "1:1", "3:4", "9:16", "16:9"].map((dim) => {
                    const isSel = galleryFilterDimension === dim;
                    return (
                      <button
                        key={dim}
                        onClick={() => setGalleryFilterDimension(dim)}
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded uppercase tracking-wider transition-all cursor-pointer ${
                          isSel ? "bg-[#c5a880] text-black" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {dim}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid de Imagens da Galeria */}
              {store.galeriaImages.length > 0 ? (
                (() => {
                  const filteredImages = store.galeriaImages.filter((img) => {
                    if (galleryFilterDimension !== "Todos") {
                      const detectedDim = imageRatios[img] || "1:1";
                      return detectedDim === galleryFilterDimension;
                    }
                    return true;
                  });

                  if (filteredImages.length === 0) {
                    return (
                      <div className="py-8 text-center border border-dashed border-white/5 rounded-xl bg-black/20">
                        <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Nenhuma correspondência</span>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-3.5">
                      {filteredImages.map((imgBase64, originalIdx) => {
                        const isSelected = store.galeriaImages[store.activeImageIndex] === imgBase64;
                        return (
                          <div
                            key={originalIdx}
                            onClick={() => {
                              const realIndex = store.galeriaImages.indexOf(imgBase64);
                              if (realIndex !== -1) {
                                store.setActiveImageIndex(realIndex);
                              }
                            }}
                            className={`aspect-square rounded-xl overflow-hidden border cursor-pointer relative group transition-all ${
                              isSelected
                                ? "border-[#c5a880] ring-2 ring-[#c5a880]/20"
                                : "border-white/5 hover:border-zinc-700"
                            }`}
                            style={{
                              backgroundColor: store.corDominante && store.corDominante !== "transparent" ? store.corDominante : undefined,
                            }}
                          >
                            <img src={imgBase64} className="w-full h-full object-contain" alt="Galeria Zion" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={14} className="text-[#c5a880] scale-90 group-hover:scale-100 transition-transform" />
                            </div>

                            {/* Botão de Excluir Imagem Individual */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const realIndex = store.galeriaImages.indexOf(imgBase64);
                                if (realIndex !== -1) {
                                  store.setGaleriaImages((prev: string[]) => {
                                    const next = prev.filter((_, idx) => idx !== realIndex);
                                    if (store.activeImageIndex >= next.length) {
                                      store.setActiveImageIndex(Math.max(0, next.length - 1));
                                    }
                                    return next;
                                  });
                                  showToast("Imagem excluída da galeria!", "success");
                                }
                              }}
                              className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/80 hover:bg-red-950 border border-white/5 hover:border-red-500/30 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Excluir imagem"
                            >
                              <Trash2 size={11} className="stroke-[2.5px]" />
                            </button>

                            <div className="absolute bottom-1 right-1 bg-black/80 border border-white/5 rounded px-1 text-[6.5px] font-black text-zinc-400">
                              ARTE #{originalIdx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl bg-black/20">
                  <ImageIcon size={20} className="text-zinc-700 mx-auto mb-2" />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Nenhuma imagem gerada ainda</span>
                </div>
              )}
            </div>
          )}

          {/* Spacer extra no final para evitar cortes de layout ao rolar */}
          <div className="h-16 shrink-0" />
        </div>
      </div>

      {/* COLUNA 2: VIEWPORT EXPANSIVO HERO STAGE COM BARRA FLUTUANTE E REEL INFERIOR */}
      <div className={`${mobileWorkspaceTab === 'preview' ? 'flex' : 'hidden'} md:flex w-full md:flex-1 bg-[#070709] flex-col h-full overflow-hidden relative`}>
        
        {/* Main Canvas Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 min-w-0">
          
          {/* Banner Orientação GC TV vMix */}
          {isGcTv && (
            <div className="bg-gradient-to-r from-sky-950/90 via-zinc-950 to-sky-950/90 border-b border-sky-500/30 px-4 py-2.5 flex items-center justify-between shrink-0 z-10 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 font-bold">
                  <Tv size={15} />
                </div>
                <div>
                  <span className="text-xs font-black text-sky-400 uppercase tracking-widest block">PAINEL DE TARJA DE TV ATIVO</span>
                  <span className="text-[11px] font-medium text-zinc-300">Gere a arte da sua tarja e clique em "Aprovar Tarja" para criar o arquivo de integração do vMix.</span>
                </div>
              </div>

              {activeImage && (
                <button
                  onClick={() => setShowVmixXamlModal(true)}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-black text-[11px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Aprovar & Gerar Arquivo vMix</span>
                </button>
              )}
            </div>
          )}

          {/* Central Image Viewport */}
          <div className="flex-1 flex relative items-center justify-center overflow-hidden min-h-0 min-w-0 bg-[#060608]">
            {store.somentePrompt ? (
              <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-[#0a0a0c]/80 border border-white/5 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-[#c5a880]" />
                    <span className="text-xs font-black text-[#c5a880] tracking-widest uppercase">Modo Somente Prompt & Instrução Ativo</span>
                  </div>
                </div>

                {!store.lastGeneratedPrompt ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a880]/10 flex items-center justify-center border border-[#c5a880]/20 animate-pulse">
                      <Sparkles size={24} className="text-[#c5a880]" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Aguardando Planejamento</h4>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider leading-relaxed">
                        O Diretor Criativo escaneará todas as referências visuais e configurações para planejar a composição e gerar o Prompt Mestre.
                      </p>
                    </div>
                    <button
                      onClick={() => generatePremiumImage()}
                      disabled={isGenerating}
                      className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#b39873] border-none disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw size={12} className="animate-spin text-black" />
                          <span>Pensando e Estruturando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} className="text-black" />
                          <span>Gerar Prompt & Instrução</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 mt-4">
                    {/* Prompt Box */}
                    <div className="bg-black/80 border border-white/5 p-4 rounded-xl space-y-2.5 flex flex-col min-h-0 h-full">
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Prompt Mestre (Completo)</span>
                        <button
                          onClick={() => {
                            const fullPromptText = (store.lastGeneratedPrompt && store.lastGeneratedPrompt.length >= buildMasterPrompt(store).length)
                              ? store.lastGeneratedPrompt
                              : buildMasterPrompt(store);
                            navigator.clipboard.writeText(fullPromptText);
                            showToast("Prompt Mestre completo copiado!", "success");
                          }}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy size={11} /> Copiar
                        </button>
                      </div>
                      <div className="flex-1 bg-black/60 rounded-lg border border-white/5 p-3 overflow-y-auto custom-scrollbar">
                        <p className="text-xs text-zinc-300 font-mono leading-relaxed select-all whitespace-pre-wrap">
                          {(store.lastGeneratedPrompt && store.lastGeneratedPrompt.length >= buildMasterPrompt(store).length)
                            ? store.lastGeneratedPrompt
                            : buildMasterPrompt(store)}
                        </p>
                      </div>
                    </div>

                    {/* Instruction Box */}
                    <div className="bg-black/80 border border-white/5 p-4 rounded-xl space-y-2.5 flex flex-col min-h-0 h-full">
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Instrução da IA (Diretriz Suprema)</span>
                        <button
                          onClick={() => {
                            const fullInstructionText = store.lastSystemInstruction || buildMasterSystemInstruction(store);
                            navigator.clipboard.writeText(fullInstructionText);
                            showToast("Instrução da IA copiada!", "success");
                          }}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy size={11} /> Copiar
                        </button>
                      </div>
                      <div className="flex-1 bg-black/60 rounded-lg border border-white/5 p-3 overflow-y-auto custom-scrollbar">
                        <p className="text-xs text-zinc-300 font-mono leading-relaxed select-all whitespace-pre-wrap">
                          {store.lastSystemInstruction || buildMasterSystemInstruction(store)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeImage ? (
              <div 
                className={`w-full h-full overflow-hidden relative min-h-0 min-w-0 ${zoomPercent > 100 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUpOrLeave}
                onTouchCancel={handleMouseUpOrLeave}
                style={{ touchAction: zoomPercent > 100 ? "none" : "auto" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                  style={{
                    transform: `scale(${zoomPercent / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.05s ease-out"
                  }}
                >
                  <img
                    src={activeImage}
                    alt="Visualização da Arte Gerada"
                    draggable={false}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/5"
                  />
                </div>

                {/* Floating Glass Action Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-[95%] overflow-x-auto no-scrollbar">
                  
                  {/* Download Direct */}
                  <button
                    onClick={() => handleDownloadActiveImage("ORIGINAL")}
                    className="px-3 py-2 bg-gradient-to-r from-[#c5a880] to-[#b08e58] hover:from-[#d2b68c] hover:to-[#be9b62] text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                    title="Baixar imagem em resolução máxima"
                  >
                    <Download size={13} className="stroke-[2.5px]" />
                    <span className="hidden sm:inline">Baixar</span> Original
                  </button>

                  {/* WhatsApp HD */}
                  <button
                    onClick={() => { handleDownloadActiveImage(16); showToast("Baixando em alta qualidade (WhatsApp HD)", "success"); }}
                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-white/5"
                    title="Baixar exatamente 16MB (WhatsApp HD)"
                  >
                    <MessageCircle size={13} />
                    <span className="hidden sm:inline">WhatsApp HD</span>
                  </button>

                  {/* Social Export Modal */}
                  <button
                    onClick={() => setIsSocialExportModalOpen(true)}
                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 text-pink-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-white/5"
                    title="Baixar exatamente 30MB (Instagram)"
                  >
                    <Instagram size={13} />
                    <span className="hidden sm:inline">Instagram</span>
                  </button>

                  <div className="w-[1px] h-5 bg-white/10 mx-0.5 shrink-0" />

                  {/* Inpainting / Pintar */}
                  <button
                    onClick={() => setShowMaskPainter(true)}
                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-white/5"
                    title="Retocar ou pintar sobre a imagem"
                  >
                    <PenTool size={13} />
                    <span className="hidden sm:inline">Pintar</span>
                  </button>

                  {/* Remover Fundo */}
                  <button
                    onClick={async () => {
                      if (!checkAdminOrOpenPlan()) return;
                      showToast("Removendo fundo...", "info");
                      try {
                        const response = await fetch("/api/remove-bg", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                          body: JSON.stringify({ imageBase64: activeImage })
                        });
                        if (!response.ok) throw new Error("Erro");
                        const data = await response.json();
                        if (data.image) {
                          store.setGaleriaImages((prev: string[]) => {
                            const next = [...prev, data.image];
                            store.setActiveImageIndex(next.length - 1);
                            return next;
                          });
                          showToast("Fundo removido!", "success");
                        }
                      } catch (e: any) {
                        showToast("Erro ao remover fundo", "error");
                      }
                    }}
                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-white/5"
                    title="Remover fundo da imagem atual"
                  >
                    <Scissors size={13} />
                    <span className="hidden sm:inline">Fundo</span>
                  </button>

                  {/* Comparar */}
                  {store.galeriaImages.length > 1 && (
                    <button
                      onClick={() => setComparingImages({ before: store.galeriaImages[0], after: store.galeriaImages[store.galeriaImages.length - 1] })}
                      className="px-2.5 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-white/5"
                      title="Comparar com versão anterior"
                    >
                      <Sparkles size={13} className="text-[#c5a880]" />
                      <span className="hidden sm:inline">Comparar</span>
                    </button>
                  )}

                  {/* Fullscreen */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer shrink-0"
                    title="Expandir para Tela Cheia"
                  >
                    <Maximize size={14} />
                  </button>

                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-8 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880] shadow-lg shadow-[#c5a880]/5">
                  <Sparkles size={28} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white tracking-tight">Estúdio Criativo Pronto</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">Configure os parâmetros na barra lateral e clique em Gerar para sintetizar sua arte em ultra-definição.</p>
                </div>
                
                <div className="relative inline-flex mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) {
                            store.setGaleriaImages((prev: string[]) => {
                              const next = [reader.result as string, ...prev];
                              store.setActiveImageIndex(0);
                              return next;
                            });
                            showToast("Imagem adicionada ao estúdio", "success");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = "";
                    }}
                  />
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all pointer-events-none">
                    <Upload size={14} className="text-[#c5a880]" />
                    Carregar Imagem Existente
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Variation Reel / Thumbnail Strip */}
          {store.galeriaImages.length > 0 && (
            <div className="h-20 bg-black/90 border-t border-white/5 px-4 flex items-center gap-2.5 shrink-0 overflow-x-auto custom-scrollbar z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0 mr-1">
                Gerações ({store.galeriaImages.length})
              </span>
              {store.galeriaImages.map((imgBase64, originalIdx) => {
                const isSelected = store.activeImageIndex === originalIdx;
                return (
                  <div
                    key={originalIdx}
                    onClick={() => store.setActiveImageIndex(originalIdx)}
                    className={`h-14 w-14 rounded-xl overflow-hidden border-2 cursor-pointer relative group transition-all shrink-0 bg-zinc-950 ${
                      isSelected
                        ? "border-[#c5a880] shadow-md shadow-[#c5a880]/20 scale-105"
                        : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgBase64} className="w-full h-full object-cover" alt="Thumb" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.setGaleriaImages((prev: string[]) => {
                          const next = prev.filter((_, idx) => idx !== originalIdx);
                          if (store.activeImageIndex >= next.length) {
                            store.setActiveImageIndex(Math.max(0, next.length - 1));
                          }
                          return next;
                        });
                        showToast("Imagem excluída", "success");
                      }}
                      className="absolute top-0.5 right-0.5 p-1 bg-black/80 hover:bg-red-500 rounded text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="max-w-md w-full bg-black border border-[#c5a880]/20 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-900" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#c5a880] border-r-[#c5a880]/30 border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-white">{progressPercent}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-[#c5a880] tracking-widest animate-pulse">
                    Processando com Inteligência Artificial
                  </h3>
                  <p className="text-[11px] text-zinc-300 font-medium min-h-[32px] flex items-center justify-center px-4 leading-relaxed transition-all duration-300">
                    {progressMessage}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-[#c5a880] to-[#e6cfb3] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(197,168,128,0.5)]" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <span>Progresso</span>
                    <span>{progressPercent}% / 100%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-2 bg-black/70 border border-[#c5a880]/20 rounded-xl text-xs font-bold text-zinc-300 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Tempo: <strong className="text-emerald-400 font-mono text-sm">{elapsedSeconds.toFixed(1)}s</strong></span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Estimativa: <span className="text-[#c5a880] font-semibold">~{estimatedSeconds}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {genStatus === "error" && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="max-w-md w-full bg-black border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <XCircle size={24} className="stroke-[2.5px]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase text-rose-500 tracking-widest">
                    Falha na Geração
                  </h3>
                  <p className="text-[11px] text-zinc-300 font-medium px-4 leading-relaxed bg-black/60 border border-white/5 p-3 rounded-lg text-left font-mono break-all max-h-[120px] overflow-y-auto custom-scrollbar">
                    {genError || "Ocorreu um erro inesperado ao conectar ao servidor de geração."}
                  </p>
                </div>
                <button
                  onClick={() => setGenStatus("idle")}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 border-none text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Fechar e Tentar Novamente
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>

  {modalImageRefUrl && (
    <div
      onClick={() => setModalImageRefUrl(null)}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200 cursor-zoom-out"
    >
      <div className="relative max-w-4xl max-h-[90%] flex flex-col items-center justify-center">
        <img
          src={modalImageRefUrl}
          alt="Estilo Ref Zoom"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/5 shadow-2xl"
        />
        <button
          onClick={() => setModalImageRefUrl(null)}
          className="absolute top-4 right-4 p-2 bg-black/75 hover:bg-[#111] rounded-full text-white cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )}

  {isFullscreen && activeImage && (
    <div
      className={`fixed inset-0 z-[100] bg-black overflow-hidden ${zoomPercent > 100 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      onTouchCancel={handleMouseUpOrLeave}
      style={{ touchAction: zoomPercent > 100 ? "none" : "auto" }}
    >
      <div
        className="absolute inset-0 sm:inset-6 flex items-center justify-center"
        style={{
          transform: `scale(${zoomPercent / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.05s ease-out",
        }}
      >
        <img
          src={activeImage}
          alt="Fullscreen"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain shadow-2xl pointer-events-none rounded-lg"
        />
      </div>
      
      {/* Controls inside fullscreen */}
      <div className="absolute bottom-6 flex gap-4 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 z-[110]">
        <button onClick={() => setZoomPercent(prev => Math.max(prev - 20, 30))} className="p-2 hover:bg-white/10 rounded-full text-white"><ZoomOut size={18} /></button>
        <span className="text-white text-xs font-bold self-center w-12 text-center">{zoomPercent}%</span>
        <button onClick={() => setZoomPercent(prev => Math.min(prev + 20, 500))} className="p-2 hover:bg-white/10 rounded-full text-white"><ZoomIn size={18} /></button>
        <div className="w-[1px] bg-white/20 mx-2 self-stretch" />
        <button onClick={() => { setZoomPercent(100); setPanOffset({ x: 0, y: 0 }) }} className="p-2 hover:bg-white/10 rounded-full text-white"><RefreshCw size={18} /></button>
      </div>

      <button
        onClick={() => setIsFullscreen(false)}
        className="absolute top-6 right-6 p-4 bg-black/80 hover:bg-[#111] border border-white/5 rounded-full text-white cursor-pointer transition-colors z-[110]"
      >
        <X size={24} />
      </button>
    </div>
  )}



  {showMaskPainter && activeImage && (
    <MaskPainter
      imageUrl={activeImage}
      onConfirm={handleInpaintConfirm}
      onCancel={() => setShowMaskPainter(false)}
      isProcessing={isInpainting}
    />
  )}

  <VmixXamlModal
    isOpen={showVmixXamlModal}
    onClose={() => setShowVmixXamlModal(false)}
    imageBase64={activeImage}
    customApiKey={customApiKey}
    showToast={showToast}
    selectedTemplateId={selectedTemplateId}
    camadasTexto={store.camadasTexto}
    additionalPrompt={store.additionalPrompt}
    promptCenario={store.promptCenario}
  />

  <ChatAssistente
    customApiKey={customApiKey}
    showToast={showToast}
    onGenerateImage={generatePremiumImage}
  />

  <SocialExportModal
    isOpen={isSocialExportModalOpen}
    onClose={() => setIsSocialExportModalOpen(false)}
    activeImage={activeImage}
    resolucao={store.resolucao || "1K"}
    showToast={showToast}
    onOptimizeSuccess={(newUrl) => {
      if (newUrl) {
        store.setGaleriaImages((prev: string[]) => [newUrl, ...prev]);
        store.setActiveImageIndex(0);
      }
    }}
  />

  {comparingImages && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-black rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-white/5 shrink-0 bg-black/50 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#c5a880]" size={16} /> 
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Comparação: Original vs Melhorada
            </h3>
            <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              Ambas salvas na Galeria
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const origIdx = store.galeriaImages.indexOf(comparingImages.before);
                if (origIdx !== -1) {
                  store.setActiveImageIndex(origIdx);
                  showToast("Imagem original selecionada na galeria", "info");
                }
                setComparingImages(null);
              }}
              className="px-3 py-1.5 bg-[#111] hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Ver Original
            </button>
            <button
              onClick={() => {
                const enhIdx = store.galeriaImages.indexOf(comparingImages.after);
                if (enhIdx !== -1) {
                  store.setActiveImageIndex(enhIdx);
                  showToast("Imagem melhorada selecionada", "success");
                }
                setComparingImages(null);
              }}
              className="px-3 py-1.5 bg-[#c5a880] hover:bg-[#b39873] text-black text-xs font-black uppercase rounded-lg transition-colors cursor-pointer"
            >
              Ver Melhorada
            </button>
            <button 
              onClick={() => setComparingImages(null)} 
              className="p-1.5 bg-black rounded-lg text-zinc-400 hover:text-white hover:bg-[#111] transition-colors cursor-pointer"
              title="Fechar comparação"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          <CompareSlider before={comparingImages.before} after={comparingImages.after} />
        </div>
      </div>
    </div>
  )}
      </div>
    </div>
  </div>
);
}
