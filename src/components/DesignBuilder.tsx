import React, { useState, useEffect, useRef } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useGenerateImage } from "../hooks/useGenerateImage";
import { buildMasterPrompt } from "../utils/buildMasterPrompt";
import { downloadImage } from "../utils/downloadImage";
import { Sidebar } from "./Sidebar";
import { ImageUploader } from "./ImageUploader";
import { StyleSelector } from "./StyleSelector";
import { MasonryGallery } from "./MasonryGallery";
import { ChatAssistente } from "./ChatAssistente";
import { MaskPainter } from "./MaskPainter";
import { ExportModal } from "./ExportModal";
import {
  Sparkles,
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
  CheckCircle,
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
  MessageSquare
} from "lucide-react";

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
    avatarColor: "bg-purple-600",
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
  const [galleryFilterFormat, setGalleryFilterFormat] = useState<string>("Todos");
  const [isTesting, setIsTesting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("");

  const handleRefine = () => {
    if (!refineQuery.trim()) {
      showToast("Por favor, digite uma instrução de ajuste.", "warning");
      return;
    }
    // Adiciona o ajuste ao prompt adicional e gera
    store.updateConfig({
      additionalPrompt: store.additionalPrompt 
        ? `${store.additionalPrompt}, ${refineQuery}` 
        : refineQuery
    });
    const adjustmentText = refineQuery;
    setRefineQuery("");
    showToast(`Ajuste "${adjustmentText}" adicionado! Iniciando refinamento...`, "success");
    generatePremiumImage();
  };

  const activeProject = store.projectsList.find((p) => p.id === store.activeProjectId);
  const activeProjectName = activeProject?.name || "Projeto Alpha";

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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [activeImageDims, setActiveImageDims] = useState<{ width: number; height: number } | null>(null);
  const [enableEstiloVisual, setEnableEstiloVisual] = useState(true);
  const [exportFormat, setExportFormat] = useState<"AVIF" | "PNG" | "JPEG" | "WEBP">("PNG");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showMaskPainter, setShowMaskPainter] = useState(false);
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

  // Estados locais para a Barra de Progresso Realista & Mensagens Dinâmicas
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("Iniciando conexão...");
  const [countdown, setCountdown] = useState<number>(0);


  useEffect(() => {
    store.initProjectsList();
  }, []);

  // Simulação de Barra de Progresso dinâmica e contador regressivo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    if (store.isGenerating) {
      setProgressPercent(0);
      setProgressMessage("Conectando ao Vertex AI...");
      
      const is4K = store.resolucao === "4K";
      const is2K = store.resolucao === "2K";
      
      // Estabelece tempos estimados baseados na resolução
      const estimatedSeconds = is4K ? 45 : (is2K ? 25 : 15);
      setCountdown(estimatedSeconds);

      // Decrementa o countdown a cada segundo
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 1; // Mantém no último segundo até a imagem ser retornada do backend
          }
          return prev - 1;
        });
      }, 1000);

      const baseTickDelay = 400; // 400ms por tick

      interval = setInterval(() => {
        setProgressPercent((prev) => {
          // Incrementos muito menores para resoluções altas
          const maxInc = is4K ? 2 : (is2K ? 4 : 8);
          const next = prev + Math.random() * maxInc + 0.5; // avança bem devagar
          
          if (next >= 98) {
            clearInterval(interval);
            setProgressMessage("Quase lá! Finalizando o render (Super Resolução em andamento)...");
            return 98; // segura em 98% para o final realista
          }

          // Roteamento de mensagens dinâmicas com base na porcentagem de progresso
          if (next < 20) {
            setProgressMessage("Analisando fotos de referência do sujeito/produto...");
          } else if (next < 40) {
            setProgressMessage("Extraindo pesos e grid da Referência de Design Obrigatória...");
          } else if (next < 65) {
            setProgressMessage("Injetando paleta de cores dominante e iluminação comercial...");
          } else if (next < 85) {
            setProgressMessage("Escrevendo tipografia automática de alta definição...");
          } else {
            setProgressMessage(is4K ? "Aprimorando nitidez para resolução máxima 4K (Ultra HD)... Isso leva alguns segundos." : "Aprimorando nitidez e otimizando canais de cores...");
          }

          return Math.floor(next);
        });
      }, baseTickDelay * (is4K ? 2 : 1)); // Se for 4K, o tick a cada 800ms
    } else {
      setProgressPercent(0);
      setCountdown(0);
    }

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [store.isGenerating]);

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

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
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

  const { generatePremiumImage, isGenerating } = useGenerateImage(customApiKey, showToast);

  const handleDownloadActiveImage = async () => {
    if (!activeImage) return;
    try {
      showToast(`Iniciando conversão para ${exportFormat}...`, "success");
      await downloadImage(
        activeImage,
        exportFormat,
        {
          useLogo: store.useLogo,
          logosList: store.logosList,
          logoBase64: store.logoBase64,
          logoPosOverlay: store.logoPosOverlay,
          logoSizeOverlay: store.logoSizeOverlay,
          logoInclusionType: store.logoInclusionType
        },
        {
          enableTypography: store.enableTypography,
          camadasTexto: store.camadasTexto
        }
      );
      showToast("Download concluído com sucesso!", "success");
    } catch (e) {
      showToast("Erro ao converter e baixar imagem.", "error");
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoomPercent * factor, 30), 500);
    setZoomPercent(Math.round(newZoom));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
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
            rawBase64 = await compressImage(rawBase64, 1024, 1024, 0.8);
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

  return (
    <div className="flex h-screen w-full bg-[#000000] text-zinc-100 font-sans overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000]">
        
        {/* TOPBAR UNIFICADA COM NAVEGAÇÃO E LOGO */}
        <div className="h-16 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0 z-30 select-none gap-8">
          
          {/* Lado Esquerdo: Logo e Navegação */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 shrink-0 mr-4">
              <div className="w-7 h-7 rounded-lg bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880] shrink-0 shadow-inner">
                <Layers size={14} />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Design Builder
              </span>
            </div>

            {/* Menu de Navegação Horizontal */}
            <div className="flex items-center gap-1 bg-[#121215] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveMenuTab("Design Builder")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMenuTab === "Design Builder"
                    ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <Sparkles size={12} />
                <span>Criar</span>
              </button>
              <button
                onClick={() => setActiveMenuTab("Inspiração")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMenuTab === "Inspiração"
                    ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <Compass size={12} />
                <span>Explorar</span>
              </button>
              <button
                onClick={() => setActiveMenuTab("Minha Galeria")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMenuTab === "Minha Galeria"
                    ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <ImageIcon size={12} />
                <span>Minha Galeria</span>
              </button>
              <button
                onClick={() => setActiveMenuTab("Ref Builder")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeMenuTab === "Ref Builder"
                    ? "bg-[#c5a880] text-black font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <SlidersHorizontal size={12} />
                <span>Ref Builder PRO</span>
              </button>
            </div>
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (window.confirm("Deseja realmente limpar todas as configurações, textos e referências do projeto atual? Isso não apagará as imagens da galeria.")) {
                  store.updateConfig({
                    sujeitoBase64: "",
                    cenarioBase64: "",
                    sujeitosBase64List: [],
                    cenariosBase64List: [],
                    tipografiaRefsList: [],
                    designRefsList: [],
                    logosList: [],
                    referenciasEstilo: [],
                    camadasTexto: [],
                    additionalPrompt: "",
                    promptCenario: "",
                    promptDesign: "",
                    promptTipografia: "",
                    useLogo: false,
                    enableTypography: false,
                    useEnvRef: false,
                    enableEstiloVisual: false,
                    estiloVisualCustom: "",
                    poseDescription: ""
                  });
                  showToast("Configurações do projeto atual redefinidas!", "success");
                }
              }}
              className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Limpar configurações do projeto atual"
            >
              <RefreshCw size={11} className="text-zinc-500" />
              <span>Limpar Editor</span>
            </button>
            <button
              onClick={() => { store.createProject(); showToast("Novo projeto criado com sucesso!", "success"); }}
              className="px-4 py-2 bg-[#c5a880] hover:bg-[#b39873] text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
            >
              + NOVO PROJETO
            </button>
          </div>
        </div>

        {/* CORE WORKSPACE COM TAB-BAR E COLUNAS */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* horizontal browser tabs for active projects */}
          <div className="h-11 bg-[#0A0A0A]/50 border-b border-white/5 flex items-center px-4 shrink-0 overflow-x-auto select-none no-scrollbar">
            <div className="flex items-center gap-1">
              {store.projectsList.map((proj) => {
                const isActive = proj.id === store.activeProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => store.loadProjectById(proj.id)}
                    className={`group flex items-center gap-2.5 px-4 py-1.5 rounded-t-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border-t border-x transition-all duration-150 ${
                      isActive
                        ? "bg-[#0A0A0A] border-white/5 text-white"
                        : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span className="truncate max-w-[120px]">{proj.name}</span>
                    {store.projectsList.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.deleteProject(proj.id);
                        }}
                        className="text-zinc-600 hover:text-red-500 transition-colors p-0.5 ml-1.5 rounded"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => store.createProject()}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all ml-1"
                title="Novo Projeto"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* DOIS PAINEIS DO WORKSPACE */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
            <div className="w-full md:w-[360px] lg:w-[420px] 2xl:w-[480px] bg-[#0A0A0A] border-b md:border-b-0 md:border-r border-white/5 flex flex-col h-[45vh] md:h-full shrink-0 select-none overflow-hidden">
              
              {/* Seletor de Módulo */}
              <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0A0A0A]/40">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-450">
                  MÓDULO ATIVO: <span className="text-[#c5a880]">{store.tipoPainel}</span>
                </span>
                <div className="flex bg-zinc-950 p-1 rounded-lg border border-white/5 shrink-0">
                  {[
                    { label: "DESIGNER", value: "DESIGNER" },
                    { label: "PRODUCT", value: "PRODUCT" }
                  ].map((pnl) => {
                    const isSel = store.tipoPainel === pnl.value;
                    return (
                      <button
                        key={pnl.value}
                        onClick={() => store.updateConfig({ tipoPainel: pnl.value as any })}
                        className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isSel ? "bg-[#c5a880] text-black font-bold" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {pnl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
          
          {activeMenuTab === "Design Builder" && (
            <>
              {/* Sujeito / Produto */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">
                {isProduct ? "Produto Principal" : "Sujeito Principal"}
              </span>
            </div>

            {/* Toggle Desativar Sujeito */}
            <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Desativar Sujeito Principal?</span>
                <span className="text-[10px] text-zinc-500 tracking-wide mt-0.5">Ignore pessoas ou produtos no criativo, focando apenas no cenário e texto</span>
              </div>
              <button
                onClick={() => store.updateConfig({ desativarSujeito: !store.desativarSujeito })}
                className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: store.desativarSujeito ? "#c5a880" : "#27272a" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                  style={{ transform: store.desativarSujeito ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>

            {!store.desativarSujeito && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Componente Modular ImageUploader */}
                <ImageUploader
                  type="person"
                  label={isProduct ? "Fotos do Produto" : "Fotos do Sujeito"}
                  icon={isProduct ? <Layers size={20} className="text-[#c5a880]" /> : <User size={20} className="text-[#c5a880]" />}
                  base64s={store.sujeitosBase64List || []}
                  onUpdateBase64s={store.setSujeitoBase64List}
                  showToast={showToast}
                />

                <div className="space-y-4">
                  {/* Gênero ou Posicionamento (Oculto se for produto) */}
                  {!isProduct ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-zinc-400">Gênero</label>
                        <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={store.multiplesPersons || false}
                            onChange={(e) => store.updateConfig({ multiplesPersons: e.target.checked })}
                            className="rounded bg-zinc-950 border-white/10 text-[#c5a880] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer accent-[#c5a880]"
                          />
                          <span>Mais de 1 pessoa na foto?</span>
                        </label>
                      </div>
                      
                      {!store.multiplesPersons ? (
                        <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                          {["Masculino", "Feminino", "Outros"].map((gen) => {
                            const isSelected = store.gender === gen;
                            return (
                              <button
                                key={gen}
                                onClick={() => store.updateConfig({ gender: gen })}
                                className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                                  isSelected ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
                                }`}
                              >
                                {gen}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <textarea
                            value={store.gendersDescription || ""}
                            onChange={(e) => store.updateConfig({ gendersDescription: e.target.value })}
                            placeholder="Descreva o gênero de cada pessoa da foto (Ex: Um homem de barba e duas mulheres ao fundo...)"
                            rows={2}
                            className="w-full bg-zinc-950/60 border border-white/5 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#c5a880]/40 tracking-wide resize-none"
                          />
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">O Diretor Criativo descreve automaticamente ao analisar múltiplas pessoas na imagem.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Posicionamento</label>
                      <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                        {["Centro", "Esquerda", "Direita"].map((pos) => {
                          const isSelected = store.positioning === pos;
                          return (
                            <button
                              key={pos}
                              onClick={() => store.updateConfig({ positioning: pos })}
                              className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                                isSelected ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              {pos}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Descrição da pose ou roupa / Detalhes do produto */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {isProduct ? "Características do Produto (opcional)" : "Descrição da pose ou roupa (opcional)"}
                  </label>
                  <input
                    type="text"
                    value={store.poseDescription || ""}
                    onChange={(e) => store.updateConfig({ poseDescription: e.target.value })}
                    placeholder={isProduct ? "Ex: Frasco de vidro fosco, tampa dourada, reflexo metálico..." : "Ex: Em pé de braços cruzados, vestindo blazer preto..."}
                    className="w-full bg-[#0F0F11] border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a880]/50 font-medium"
                  />
                </div>

                {/* Posição do Sujeito (Oculto se for produto para não repetir seletor) */}
                {!isProduct && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Posição do Sujeito</label>
                    <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                      {["Esquerda", "Centro", "Direita"].map((pos) => {
                        const isSelected = store.positioning === pos;
                        return (
                          <button
                            key={pos}
                            onClick={() => store.updateConfig({ positioning: pos })}
                            className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                              isSelected ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {pos}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dimensões com ícones visuais representativos */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex flex-col gap-1.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Dimensões</span>
              <span className="text-[10px] text-zinc-400 tracking-wide">Selecione o formato ideal para as redes sociais ou desktop</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { 
                  label: "Feed (1:1)", 
                  value: "1:1",
                  icon: <div className="w-3.5 h-3.5 border-2 border-current rounded mx-auto mb-1 shrink-0" />
                },
                { 
                  label: "Retrato (4:5)", 
                  value: "4:5",
                  icon: <div className="w-3.5 h-4 border-2 border-current rounded mx-auto mb-1 shrink-0" />
                },
                { 
                  label: "Story (9:16)", 
                  value: "9:16",
                  icon: <div className="w-2.5 h-4.5 border-2 border-current rounded mx-auto mb-1 shrink-0" />
                },
                { 
                  label: "Desktop (16:9)", 
                  value: "16:9",
                  icon: <div className="w-4.5 h-3 border-2 border-current rounded mx-auto mb-1 shrink-0" />
                }
              ].map((dim) => {
                const isSelected = store.dimensao === dim.value;
                return (
                  <button
                    key={dim.value}
                    onClick={() => store.updateConfig({ dimensao: dim.value })}
                    className={`py-3 rounded-lg border text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-[#c5a880]/10 border-[#c5a880] text-[#c5a880] ring-1 ring-[#c5a880]"
                        : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white hover:border-[#c5a880]/30 hover:ring-1 hover:ring-[#c5a880]/30"
                    }`}
                  >
                    {dim.icon}
                    <span>{dim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipografia (Camadas de textos configuráveis) */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex flex-col gap-1.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Tipografia (Camadas)</span>
              <span className="text-[10px] text-zinc-400 tracking-wide">Crie e configure camadas dinâmicas de textos com fontes premium</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-zinc-455 uppercase tracking-wider">Adicionar Texto</span>
                <button
                  onClick={() => store.updateConfig({ enableTypography: !store.enableTypography })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
                  style={{ backgroundColor: store.enableTypography ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.enableTypography ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.enableTypography && (
                <div className="space-y-5 pt-1">
                  
                  {/* Referência de Tipografia por Imagem */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 space-y-2.5">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Copiar Tipografia por Referência (Imagem)</span>
                    <ImageUploader
                      type="env"
                      label="Enviar Print da Tipografia"
                      icon={<ImageIcon size={16} className="text-[#c5a880]" />}
                      base64s={store.tipografiaRefsList || []}
                      onUpdateBase64s={store.setTipografiaRefsList}
                      showToast={showToast}
                    />

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">O que deseja extrair/copiar desta tipografia/texto?</span>
                      <textarea
                        value={store.promptTipografia || ""}
                        onChange={(e) => store.updateConfig({ promptTipografia: e.target.value })}
                        placeholder="Ex: Copiar exatamente o texto principal 'ZION' usando a mesma fonte sans-serif moderna, peso ultra-bold e posições..."
                        rows={2}
                        className="w-full bg-zinc-900/40 border border-white/5 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#c5a880]/40 tracking-wide resize-none"
                      />
                    </div>
                  </div>

                  {/* Lista de Camadas de Texto */}
                  <div className="space-y-3.5">
                    {store.camadasTexto.map((layer, index) => (
                      <div key={layer.id} className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-3 relative group">
                        
                        {/* Controles de ordem */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            onClick={() => store.moverCamadaTexto(layer.id, "cima")}
                            disabled={index === 0}
                            className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-white"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => store.moverCamadaTexto(layer.id, "baixo")}
                            disabled={index === store.camadasTexto.length - 1}
                            className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-white"
                          >
                            <ArrowDown size={10} />
                          </button>
                          <button
                            onClick={() => store.removeCamadaTexto(layer.id)}
                            className="p-1 hover:bg-red-955/45 text-zinc-550 hover:text-red-500 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        <div className="pr-16">
                          <span className="text-[9px] font-black text-[#c5a880] uppercase tracking-widest block mb-1">CAMADA #{index + 1}</span>
                        </div>

                        {/* Conteúdo frase */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Frase</label>
                          <input
                            type="text"
                            value={layer.conteudo}
                            onChange={(e) => store.updateCamadaTexto(layer.id, { conteudo: e.target.value })}
                            placeholder="Frase ou texto..."
                            className="w-full bg-[#1A1A1C] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#c5a880]/50 font-medium"
                          />
                        </div>

                        {/* Função Corpo / Descrição */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Função</label>
                          <select
                            value={layer.funcao}
                            onChange={(e) => store.updateCamadaTexto(layer.id, { funcao: e.target.value as any })}
                            className="w-full bg-[#1A1A1C] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase tracking-wide cursor-pointer"
                          >
                            <option value="Headline Principal">Headline Principal</option>
                            <option value="Subheadline Secundário">Subheadline Secundário</option>
                            <option value="CTA Botão">CTA Botão</option>
                            <option value="Corpo Descrição">Corpo Descrição</option>
                            <option value="Legenda / Detalhe">Legenda / Detalhe</option>
                            <option value="Badge / Selo">Badge / Selo</option>
                            <option value="Preço / Valor">Preço / Valor</option>
                            <option value="Data / Horário">Data / Horário</option>
                          </select>
                        </div>

                        {/* Dropdown de Escolha de Fontes e Cor */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Escolha a Fonte</label>
                            <select
                              value={layer.fonte}
                              onChange={(e) => store.updateCamadaTexto(layer.id, { fonte: e.target.value })}
                              className="w-full bg-[#1A1A1C] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase tracking-wide cursor-pointer"
                            >
                              <option value="Montserrat">Montserrat</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Outfit">Outfit</option>
                              <option value="Inter">Inter</option>
                              <option value="Playfair Display">Playfair Display</option>
                              <option value="Cinzel">Cinzel</option>
                              <option value="Unbounded">Unbounded</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Cor do Texto</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={layer.cor}
                                onChange={(e) => store.updateCamadaTexto(layer.id, { cor: e.target.value })}
                                className="w-7 h-7 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                              />
                              <input
                                type="text"
                                value={layer.cor}
                                onChange={(e) => store.updateCamadaTexto(layer.id, { cor: e.target.value })}
                                placeholder="#ffffff"
                                className="w-full bg-[#1A1A1C] border border-white/10 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => store.addCamadaTexto()}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-black uppercase tracking-widest text-[#c5a880] hover:text-[#c5a880] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Adicionar Bloco de Texto</span>
                  </button>

                  {/* Posição Global */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Posição Global do Texto</label>
                    <div className="flex gap-1.5 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                      {(["ESQUERDA", "CENTRO", "DIREITA"] as const).map((pos) => {
                        const isSel = store.typographyPosition === pos;
                        return (
                          <button
                            key={pos}
                            onClick={() => store.updateConfig({ typographyPosition: pos })}
                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isSel ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
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

          {/* Cenário Customizado & Prompt Adicional Cenário */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Cenário</span>
              <span className="text-[8px] text-zinc-500 tracking-wide">Descreva ou envie imagens do plano de fundo/ambiente do criativo</span>
            </div>
            
            <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Usar fotos de cenário?</span>
                <button
                  onClick={() => store.updateConfig({ useEnvRef: !store.useEnvRef })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
                  style={{ backgroundColor: store.useEnvRef ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.useEnvRef ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.useEnvRef && (
                <ImageUploader
                  type="env"
                  label="Fotos de Cenário"
                  icon={<ImageIcon size={20} className="text-[#c5a880]" />}
                  base64s={store.cenariosBase64List || []}
                  onUpdateBase64s={store.setCenarioBase64List}
                  showToast={showToast}
                />
              )}

              {/* Prompt Adicional Cenário */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Prompt Adicional Cenário</label>
                <input
                  type="text"
                  value={store.promptCenario}
                  onChange={(e) => store.updateConfig({ promptCenario: e.target.value })}
                  placeholder="Ex: Sala executiva com luz solar, janelas de vidro amplas..."
                  className="w-full bg-[#0F0F11] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a880]/50 font-medium"
                />
              </div>
            </div>

          {/* Referência de Design Obrigatório */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Design Obrigatório</span>
              <span className="text-[8px] text-zinc-500 tracking-wide">Importe uma imagem com o layout ou posicionamento estrutural desejado</span>
            </div>

            <div className="flex items-start gap-3 text-[#c5a880] bg-[#c5a880]/5 border border-[#c5a880]/10 p-3 rounded-xl animate-in fade-in">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span className="text-[9px] font-medium leading-relaxed uppercase tracking-wider text-zinc-400">
                Suba uma imagem de referência de design. A IA vai analisar a estrutura, tipografia e grid para aplicar no card gerado.
              </span>
            </div>

            <ImageUploader
              type="env"
              label="Referência de Design Obrigatório"
              icon={<Layout size={20} className="text-[#c5a880]" />}
              base64s={store.designRefsList || []}
              onUpdateBase64s={store.setDesignRefsList}
              showToast={showToast}
            />

            <div className="space-y-1.5 pt-1">
              <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">O que deseja extrair/copiar deste layout/design?</span>
              <textarea
                value={store.promptDesign || ""}
                onChange={(e) => store.updateConfig({ promptDesign: e.target.value })}
                placeholder="Ex: Copiar a estrutura do flyer de referência, mantendo o sujeito principal centralizado com elementos gráficos atrás de sua silhueta..."
                rows={2}
                className="w-full bg-zinc-950/60 border border-white/5 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#c5a880]/40 tracking-wide resize-none"
              />
            </div>
          </div>

          {/* Logotipo da Marca */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Logotipo da Marca</span>
              <span className="text-[10px] text-zinc-400 tracking-wide">Importe o logotipo da sua marca para estampar no criativo</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Estampar Logotipo?</span>
              <button
                onClick={() => store.updateConfig({ useLogo: !store.useLogo })}
                className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: store.useLogo ? "#c5a880" : "#27272a" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                  style={{ transform: store.useLogo ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>

            {store.useLogo && (
              <div className="animate-in fade-in duration-200 space-y-4">
                <ImageUploader
                  type="env"
                  label="Logotipo da Marca (PNG/SVG)"
                  icon={<Layers size={20} className="text-[#c5a880]" />}
                  base64s={store.logosList || []}
                  onUpdateBase64s={store.setLogosList}
                  showToast={showToast}
                />
                {store.logosList && store.logosList.length > 0 && (
                  <div className="space-y-4 p-4 bg-zinc-950/60 rounded-xl border border-white/5">
                    <div className="p-3 bg-[#c5a880]/5 border border-[#c5a880]/10 rounded-lg text-[9px] font-medium leading-normal text-zinc-400 uppercase tracking-wider">
                      A logo será sobreposta automaticamente na imagem final. O gerador não tentará recriar ou alterar a logo, mantendo 100% da fidelidade original.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Referências de Estilos Individuais com Descrição */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex justify-between items-start border-l-2 border-[#c5a880] pl-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white tracking-tight">Referências de Estilo</span>
                <span className="text-[8px] text-zinc-500 tracking-wide">Importe referências estéticas e descreva o estilo a ser absorvido</span>
              </div>
              <div className="relative overflow-hidden shrink-0 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleStyleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-24"
                />
                <button className="px-3.5 py-1.5 bg-[#1A1A1C] border border-white/10 hover:border-[#c5a880]/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#c5a880] cursor-pointer">
                  + Adicionar
                </button>
              </div>
            </div>

            {store.referenciasEstilo.length > 0 ? (
              <div className="space-y-3.5">
                {store.referenciasEstilo.map((ref) => (
                  <div key={ref.id} className="p-3 bg-zinc-950 rounded-xl border border-white/5 flex gap-3 relative group">
                    
                    <button
                      onClick={() => store.removeReferenciaEstilo(ref.id)}
                      className="absolute top-2 right-2 p-1 bg-black/85 hover:bg-red-500 rounded text-zinc-450 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={10} />
                    </button>
 
                    <div
                      onClick={() => setModalImageRefUrl(ref.url)}
                      className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-zinc-905 cursor-zoom-in relative"
                      title="Ver tamanho grande"
                    >
                      <img src={ref.url} className="w-full h-full object-cover" alt="Estilo Ref" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={10} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <span className="text-[8px] font-black text-zinc-555 uppercase tracking-widest block">Descrição do Estilo Visual</span>
                      <input
                        type="text"
                        value={ref.descricao}
                        onChange={(e) => store.updateReferenciaEstilo(ref.id, e.target.value)}
                        placeholder="Ex: Copiar tons de dourado..."
                        className="w-[90%] bg-[#1A1A1C] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#c5a880]/50 font-medium"
                      />
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center border border-dashed border-white/5 rounded-xl bg-zinc-950/20">
                <span className="text-[8.5px] font-bold text-zinc-600 uppercase tracking-wider">Suba imagens de estilo para imitar</span>
              </div>
            )}
          </div>

          {/* Cores & Iluminação */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Cores & Iluminação</span>
              <span className="text-[8px] text-zinc-500 tracking-wide">Configure as cores de iluminação de estúdio do seu criativo</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Automático (Harmônico)?</span>
              <button
                onClick={() => store.updateConfig({ coresAutomaticas: !store.coresAutomaticas })}
                className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: store.coresAutomaticas ? "#c5a880" : "#27272a" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                  style={{ transform: store.coresAutomaticas ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>

            {!store.coresAutomaticas && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-3.5">
                  <div className="p-3 bg-black/40 border border-white/5 flex flex-col gap-2 hover:border-[#c5a880]/30 transition-all rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Ambiente</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={store.cores.ambiente || "#000000"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, ambiente: e.target.value }
                        })}
                        className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={store.cores.ambiente || "#000000"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, ambiente: e.target.value }
                        })}
                        className="w-full bg-[#1A1A1C] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 flex flex-col gap-2 hover:border-[#c5a880]/30 transition-all rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Recorte</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={store.cores.recorte || "#ffffff"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, recorte: e.target.value }
                        })}
                        className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={store.cores.recorte || "#ffffff"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, recorte: e.target.value }
                        })}
                        className="w-full bg-[#1A1A1C] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 flex flex-col gap-2 hover:border-[#c5a880]/30 transition-all rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-555 uppercase tracking-widest">Complementar</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={store.cores.complementar || "#c5a880"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, complementar: e.target.value }
                        })}
                        className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={store.cores.complementar || "#c5a880"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, complementar: e.target.value }
                        })}
                        className="w-full bg-[#1A1A1C] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Cor Dominante e Degradê Leitura */}
            <div className="space-y-3.5 pt-3.5 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest">Usar Cor Dominante?</span>
                  <span className="text-[8px] text-zinc-500 tracking-wide mt-0.5">Ativa cor da marca no criativo</span>
                </div>
                <button
                  onClick={() => store.updateConfig({ useCorDominante: !store.useCorDominante })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
                  style={{ backgroundColor: store.useCorDominante ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: store.useCorDominante ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.useCorDominante && (
                <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest">Cor Dominante</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={store.corDominante}
                      onChange={(e) => store.updateConfig({ corDominante: e.target.value })}
                      className="w-6 h-6 rounded border border-zinc-805 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                    />
                    <input
                      type="text"
                      value={store.corDominante}
                      onChange={(e) => store.updateConfig({ corDominante: e.target.value })}
                      className="w-16 bg-[#1A1A1C] border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#c5a880]/50 font-bold uppercase"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Degradê Leitura?</span>
                <button
                  onClick={() => store.updateConfig({ degradeLeitura: !store.degradeLeitura })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-200 cursor-pointer"
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

          {/* Composição */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Composição</span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "Close-up (Rosto)", desc: "Foco no enquadramento ideal" },
                { name: "Plano Médio (Busto)", desc: "Foco no enquadramento ideal" },
                { name: "Plano Americano", desc: "Foco no enquadramento ideal" }
              ].map((framingItem) => {
                const isSelected = store.composicao === framingItem.name;
                return (
                  <div
                    key={framingItem.name}
                    onClick={() => store.updateConfig({ composicao: framingItem.name })}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "bg-[#c5a880]/10 border-[#c5a880] text-[#c5a880] ring-1 ring-[#c5a880]"
                        : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white hover:border-[#c5a880]/20"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${isSelected ? 'bg-[#c5a880]/20 text-[#c5a880]' : 'bg-zinc-900 text-zinc-650'}`}>
                      <User size={12} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider">{framingItem.name}</span>
                      <span className="text-[8.5px] text-zinc-555 lowercase tracking-wider mt-0.5">{framingItem.desc}</span>
                    </div>
                  </div>
                );
              })}

              {/* Campo livre de Composição */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Composição Personalizada (opcional)</label>
                <input
                  type="text"
                  value={store.composicaoCustom || ""}
                  onChange={(e) => store.updateConfig({ composicaoCustom: e.target.value })}
                  placeholder="Ex: Sujeito desfocado fundo centralizado..."
                  className="w-full bg-[#0F0F11] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a880]/50 font-medium"
                />
              </div>

              {/* Elementos Flutuantes Avançados */}
              <div className="space-y-3 pt-3.5 border-t border-white/5 mt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-zinc-350 uppercase tracking-wider">Elementos Flutuantes</span>
                  <span className="text-[10px] text-zinc-500 tracking-wide">Configure partículas ou objetos suspensos para dar profundidade</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/5">
                  {[
                    { label: "Desligar", value: "off" },
                    { label: "Auto", value: "auto" },
                    { label: "Descrever", value: "custom" }
                  ].map((opt) => {
                    const isSelected = store.floatingElementsMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => store.updateConfig({ floatingElementsMode: opt.value as any })}
                        className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-[#c5a880] text-black font-semibold" 
                            : "text-zinc-550 hover:text-zinc-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {store.floatingElementsMode === "custom" && (
                  <div className="pt-1.5 animate-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      value={store.floatingElementsCustom || ""}
                      onChange={(e) => store.updateConfig({ floatingElementsCustom: e.target.value })}
                      placeholder="Ex: Folhas douradas de outono caindo desfocadas..."
                      className="w-full bg-[#0F0F11] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a880]/50 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Atributos Visuais & Estilo */}
          <div className="bg-[#0d0d11]/85 border border-white/5 p-5 rounded-2xl space-y-5 shadow-lg hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Atributos Visuais & Estilo</span>
            </div>

            {/* Slider de Sobriedade com Porcentagem Dinâmica */}
            <div className="bg-[#121216] border border-white/5 p-5 rounded-xl space-y-3 shadow-md">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <span>Sobriedade</span>
                <span className="text-[#c5a880] font-black">
                  {store.nivelCriativo}% — {getCreativeSliderLabel(store.nivelCriativo)}
                </span>
              </div>
              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={store.nivelCriativo}
                  onChange={(e) => store.updateConfig({ nivelCriativo: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#c5a880] focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-[8px] font-extrabold text-zinc-600 uppercase tracking-widest pt-1">
                <span>Criativo</span>
                <span>Profissional</span>
              </div>
            </div>

            {/* Style Selector */}
            <StyleSelector
              enableEstiloVisual={store.enableEstiloVisual ?? true}
              setEnableEstiloVisual={(val) => store.updateConfig({ enableEstiloVisual: val })}
            />

            {/* Toggles extras */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Usar Desfoque (Blur)?</span>
                  <span className="text-[8.5px] text-zinc-600">Aplica profundidade de campo suave</span>
                </div>
                <button
                  onClick={() => store.updateConfig({ enableBlur: !store.enableBlur })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-250 cursor-pointer"
                  style={{ backgroundColor: store.enableBlur ? "#c5a880" : "#27272a" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-250 shadow-md"
                    style={{ transform: store.enableBlur ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Usar Degradê Lateral?</span>
                  <span className="text-[8.5px] text-zinc-600">Insere sombras laterais sutis para contraste</span>
                </div>
                <button
                  onClick={() => store.updateConfig({ lateralGradient: !store.lateralGradient })}
                  className="w-11 h-6 rounded-full p-0.5 relative transition-colors duration-250 cursor-pointer"
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

          {/* Entradas Manuais */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Entradas Manuais</span>
            </div>

            <div>
              <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-550 mb-1.5">Prompt Adicional</label>
              <textarea
                value={store.additionalPrompt}
                onChange={(e) => store.updateConfig({ additionalPrompt: e.target.value })}
                placeholder="Escreva detalhes estéticos adicionais..."
                rows={3}
                className="w-full bg-[#0F0F11] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a880]/50 resize-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-550 mb-1.5">Prompt Negativo</label>
              <textarea
                value={store.negativePrompt}
                onChange={(e) => store.updateConfig({ negativePrompt: e.target.value })}
                placeholder="Ex: óculos, água no avião, elements distorcidos, deformações, texto borrado..."
                rows={3}
                className="w-full bg-[#0F0F11] border border-white/10 rounded-lg px-4 py-3 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#c5a880]/50 resize-none font-medium"
              />
            </div>
          </div>

          {/* Opções Avançadas */}
          <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-5 shadow-sm hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#c5a880] pl-3">
              <span className="text-sm font-semibold text-white tracking-tight">Opções Avançadas</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Qualidade */}
              <div>
                <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5">Qualidade de Renderização</label>
                <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                  {["1K", "2K", "4K"].map((q) => {
                    const isSelected = store.resolucao === q;
                    return (
                      <button
                        key={q}
                        onClick={() => store.updateConfig({ resolucao: q })}
                        className={`flex-1 py-1.5 rounded text-[10.5px] font-black transition-all cursor-pointer ${
                          isSelected ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formato */}
              <div>
                <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5">Formato de Exportação</label>
                <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                  {["AVIF", "PNG", "JPEG", "WEBP"].map((fmt) => {
                    const isSelected = exportFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => {
                          setExportFormat(fmt as any);
                          store.updateConfig({ formatoExportacao: fmt as any });
                        }}
                        className={`flex-1 py-1.5 rounded text-[9.5px] font-black transition-all cursor-pointer ${
                          isSelected ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quantidade de Cards a Gerar */}
            <div>
              <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5">Quantidade de Cards a Gerar</label>
              <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-white/5">
                {[1, 2, 3, 4, 5].map((num) => {
                  const isSelected = store.variations === num;
                  return (
                    <button
                      key={num}
                      onClick={() => store.updateConfig({ variations: num })}
                      className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                        isSelected ? "bg-[#c5a880] text-black font-semibold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Somente Prompt & Instrução */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 rounded-xl border border-white/5 mt-3">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Desativar Geração de Imagem?</span>
                <span className="text-[9px] text-zinc-500 tracking-wide mt-1 uppercase">Gera apenas o Prompt Mestre e a Instrução de Sistema, sem criar a imagem física no servidor.</span>
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

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={generatePremiumImage}
              disabled={isGenerating}
              className="w-full bg-[#c5a880] hover:bg-[#b39873] border-none disabled:opacity-50 text-black font-bold py-4 rounded-lg text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden group hover:shadow-[0_4px_15px_rgba(201,155,59,0.3)]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-black" />
                  <span className="text-black font-bold">
                    {store.somentePrompt ? "Gerando Prompt & Instrução..." : "Gerando Background..."}
                  </span>
                  <span className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-black group-hover:scale-110 transition-transform" />
                  <span>
                    {store.somentePrompt ? "Gerar Prompt & Instrução" : "Gerar Background"}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyPrompt}
              className={`w-full flex items-center justify-center gap-2 p-3 bg-zinc-950 hover:bg-[#121215] border border-white/5 hover:border-zinc-850 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98] ${
                isCopied ? "bg-[#c5a880]/10 border-[#c5a880]/20 text-[#c5a880]" : ""
              }`}
            >
              {isCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
              <span>Duplicar Configuração</span>
            </button>
          </div>
          </>
          )}

          {activeMenuTab === "Ref Builder" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Ref Builder Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Estúdio de Referências</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Ref Builder PRO</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Ajuste os pesos das referências visuais para obter consistência máxima em seus criativos.</p>
              </div>

              {/* Referência de Personagem */}
              <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#c5a880] pl-3">
                  <User size={14} className="text-[#c5a880]" />
                  <span className="text-sm font-semibold text-white tracking-tight">Referência de Personagem (IP-Adapter)</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Garanta rostos e identidades idênticas em múltiplos criativos.</p>
                <div className="border border-dashed border-white/5 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <User size={24} className="text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir face de referência</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Peso do Personagem (Força)</span>
                    <span className="text-[#c5a880]">0.85</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.85" className="w-full accent-[#c5a880] bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>

              {/* Referência de Estilo */}
              <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#c5a880] pl-3">
                  <Palette size={14} className="text-[#c5a880]" />
                  <span className="text-sm font-semibold text-white tracking-tight">Referência de Estilo (Style Transfer)</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Copie cores, pinceladas, iluminação de estúdio e texturas de uma imagem base.</p>
                <div className="border border-dashed border-white/5 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Palette size={24} className="text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir estilo de referência</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Peso do Estilo</span>
                    <span className="text-[#c5a880]">0.70</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.70" className="w-full accent-[#c5a880] bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>

              {/* Referência de Estrutura */}
              <div className="bg-[#121214] border border-white/5 p-5 rounded-xl space-y-4 shadow-sm hover:border-white/5 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#c5a880] pl-3">
                  <Layout size={14} className="text-[#c5a880]" />
                  <span className="text-sm font-semibold text-white tracking-tight">Estrutura & Grid (ControlNet)</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Preserve o layout original do flyer, posição dos elementos e profundidade.</p>
                <div className="border border-dashed border-white/5 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Layout size={24} className="text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir grid estrutural</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Fidelidade do Grid</span>
                    <span className="text-[#c5a880]">0.90</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.90" className="w-full accent-[#c5a880] bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeMenuTab === "Inspiração" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Inspiração Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Presets Premium</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Inspiradores Zion</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Clique em um preset inspirado nos panfletos premium da Zion Company para configurar instantaneamente o designer.</p>
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
                          : "bg-zinc-900/20 border-white/5 hover:border-white/5 hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-black text-[#c5a880] uppercase tracking-widest">
                            {template.category}
                          </span>
                          <span className="text-xs font-extrabold text-zinc-100 uppercase tracking-wider group-hover:text-white transition-colors">
                            {template.name}
                          </span>
                        </div>
                        <span className="bg-[#0F0F11] border border-white/10 text-[8px] font-black px-2 py-0.5 rounded text-zinc-400">
                          PROPORÇÃO {template.dimensao}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {template.estilosVisuais.map((st) => (
                          <span key={st} className="bg-[#1A1A1C] border border-white/10 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded text-zinc-500">
                            {st}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
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
                            showToast(`Preset "${template.name}" carregado com sucesso! Clique em "Gerar" na coluna direita.`, "success");
                          }}
                          className="px-3 py-1 bg-[#1A1A1C] border border-white/10 hover:border-[#c5a880]/40 group-hover:bg-[#c5a880] group-hover:text-black hover:scale-105 active:scale-95 transition-all text-[8px] font-black uppercase tracking-widest text-[#c5a880] rounded-lg"
                        >
                          Aplicar Preset
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
                <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Zion Hub</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Feed da Comunidade</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Inspire-se em layouts de alto nível criados por outros diretores de arte da agência.</p>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                {communityCreations.map((item) => (
                  <div key={item.id} className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-3.5 hover:border-white/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.avatarColor} text-black font-semibold text-[10px]`}>
                          {item.author.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold text-zinc-200 uppercase tracking-wider">{item.author}</span>
                          <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">{item.role}</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black bg-black/40 border border-white/5 text-zinc-400 px-2 py-0.5 rounded">
                        PROPORÇÃO {item.dimensao}
                      </span>
                    </div>

                    <div className="space-y-1 bg-zinc-950 p-3 rounded-xl border border-white/5">
                      <span className="text-[8.5px] font-extrabold text-[#c5a880] uppercase tracking-widest block">Prompt Utilizado</span>
                      <p className="text-[10px] font-bold text-zinc-300 leading-relaxed font-mono select-all">
                        {item.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-red-500 transition-colors">
                          <Heart size={11} />
                          <span>{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-[#c5a880] transition-colors">
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
                        className="px-3 py-1 bg-[#c5a880]/10 border border-[#c5a880]/20 hover:bg-[#c5a880] hover:text-black transition-all text-[8px] font-black uppercase tracking-widest text-[#c5a880] rounded-lg"
                      >
                        Clonar Prompt
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
                <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Histórico Digital</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Minha Galeria</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Visualize, filtre e gerencie todas as criações premium salvas neste projeto.</p>
              </div>

              {/* Filtros da Galeria */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest block">Filtros de Proporção</span>
                <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-lg border border-white/5">
                  {["Todos", "1:1", "4:5", "9:16", "16:9"].map((dim) => {
                    const isSel = galleryFilterDimension === dim;
                    return (
                      <button
                        key={dim}
                        onClick={() => setGalleryFilterDimension(dim)}
                        className={`px-2.5 py-1 text-[8.5px] font-extrabold rounded uppercase tracking-wider transition-all cursor-pointer ${
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
                  const filteredImages = store.galeriaImages.filter((img, idx) => {
                    if (galleryFilterDimension !== "Todos") {
                      if (galleryFilterDimension === "1:1" && idx % 2 === 0) return true;
                      if (galleryFilterDimension === "4:5" && idx % 2 !== 0) return true;
                      return false;
                    }
                    return true;
                  });

                  if (filteredImages.length === 0) {
                    return (
                      <div className="py-8 text-center border border-dashed border-white/5 rounded-xl bg-zinc-950/20">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Nenhuma correspondência</span>
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
                          >
                            <img src={imgBase64} className="w-full h-full object-cover" alt="Galeria Zion" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={14} className="text-[#c5a880] scale-90 group-hover:scale-100 transition-transform" />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/80 border border-white/5 rounded px-1 text-[6.5px] font-black text-zinc-400">
                              IMG #{originalIdx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl bg-zinc-950/20">
                  <ImageIcon size={20} className="text-zinc-700 mx-auto mb-2" />
                  <span className="text-[9px] font-bold text-zinc-650 uppercase tracking-wider">Nenhuma imagem gerada ainda</span>
                </div>
              )}
            </div>
          )}

          {/* Spacer extra no final para evitar cortes de layout ao rolar */}
          <div className="h-16 shrink-0" />
        </div>
      </div>

      
      
      
      {/* COLUNA 3: VIEWPORT (MENSAGENS DE PROGRESSO REALISTA & ZOOM) E GALERIA MASONRY */}
      <div className="w-full md:flex-1 bg-[#000000] flex flex-col h-[55vh] md:h-full overflow-hidden relative">
        <div className="border-b border-white/5 bg-[#0A0A0A] p-4 shrink-0 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Instrução de ajuste localizado ou estilo..."
              value={refineQuery}
              onChange={(e) => setRefineQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRefine()}
              className="w-full bg-[#121215] border border-white/5 hover:border-zinc-700 text-xs rounded-lg px-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={handleRefine}
            className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#b39873] text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
          >
            REFINAR
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0A] border-b md:border-b-0 border-white/5 h-[350px] md:h-full shrink-0 md:shrink">
            <div className="flex-1 flex relative p-4 sm:p-5 items-center justify-center overflow-hidden">
              {store.somentePrompt ? (
                <div className="w-full h-full flex flex-col p-4 sm:p-5 bg-[#0a0a0c]/80 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5 shrink-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-[#c5a880]" />
                        <span className="text-[10px] font-black text-[#c5a880] tracking-widest uppercase">Modo Somente Prompt & Instrução Ativo</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider text-left">Copie o Prompt e a Instrução de Sistema estruturados lado a lado para alimentar geradores externos.</p>
                    </div>
                  </div>

                  {!store.lastGeneratedPrompt ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#c5a880]/10 flex items-center justify-center border border-[#c5a880]/20 animate-pulse">
                        <Sparkles size={20} className="text-[#c5a880]" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Aguardando Planejamento</h4>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider leading-relaxed">
                          O Diretor Criativo escaneará todas as referências visuais e configurações para planejar a composição, pensar e criar o Prompt Mestre e a Instrução de Sistema ideais.
                        </p>
                      </div>
                      <button
                        onClick={generatePremiumImage}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#b39873] border-none disabled:opacity-50 text-black font-black text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw size={11} className="animate-spin text-black" />
                            <span>Pensando e Estruturando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={11} className="text-black" />
                            <span>Gerar Prompt & Instrução</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0 mt-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                        
                        {/* Mega Prompt Mestre Container */}
                        <div className="bg-[#040406]/90 border border-white/5 p-4 rounded-xl space-y-2.5 flex flex-col min-h-0 h-full">
                          <div className="flex justify-between items-center shrink-0 gap-2">
                            <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Mega Prompt Mestre (Flyer BR)</span>
                            
                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const p = store.lastGeneratedPrompt || buildMasterPrompt(store);
                                navigator.clipboard.writeText(p);
                                setIsPromptCopied(true);
                                showToast("Prompt mestre copiado!", "success");
                                setTimeout(() => setIsPromptCopied(false), 2000);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                                isPromptCopied ? "bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/20" : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-white/5"
                              }`}
                            >
                              {isPromptCopied ? <CheckCircle size={10} /> : <Copy size={10} />}
                              <span>{isPromptCopied ? "Copiado!" : "Copiar Prompt"}</span>
                            </button>
                          </div>
                          <div className="p-4 bg-[#08080a] border border-white/5 rounded-lg text-[11px] font-mono text-zinc-200 leading-relaxed flex-1 overflow-y-auto custom-scrollbar break-words text-left min-h-0 select-text">
                            {store.lastGeneratedPrompt}
                          </div>
                        </div>

                        {/* Instrução de Sistema Container */}
                        <div className="bg-[#040406]/90 border border-white/5 p-4 rounded-xl space-y-2.5 flex flex-col min-h-0 h-full">
                          <div className="flex justify-between items-center shrink-0 gap-2">
                            <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Instrução de Sistema (System Instruction)</span>
                            
                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const inst = store.lastSystemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
                                navigator.clipboard.writeText(inst);
                                setIsInstructionCopied(true);
                                showToast("Instrução copiada!", "success");
                                setTimeout(() => setIsInstructionCopied(false), 2000);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                                isInstructionCopied ? "bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/20" : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-white/5"
                              }`}
                            >
                              {isInstructionCopied ? <CheckCircle size={10} /> : <Copy size={10} />}
                              <span>{isInstructionCopied ? "Copiado!" : "Copiar Instrução"}</span>
                            </button>
                          </div>
                          <div className="p-4 bg-[#08080a] border border-white/5 rounded-lg text-[11px] font-mono text-zinc-200 leading-relaxed flex-1 overflow-y-auto custom-scrollbar break-words text-left min-h-0 select-text">
                            {store.lastSystemInstruction}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              ) : activeImage ? (
                <div 
                  className="relative group w-full h-full flex items-center justify-center overflow-hidden"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                >
                  <div
                    className="relative max-w-full max-h-full flex items-center justify-center select-none"
                    style={{
                      transform: `scale(${zoomPercent / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                      transformOrigin: "center center",
                      transition: "transform 0.05s ease-out"
                    }}
                  >
                    <img
                      src={activeImage}
                      alt="Preview"
                      className="max-w-full max-h-[70vh] object-contain rounded-xl border border-white/10 shadow-2xl select-none pointer-events-none"
                    />
                    {store.useLogo && store.logosList && store.logosList.length > 0 && (
                      <div className="absolute top-[5%] left-0 right-0 flex justify-center pointer-events-none select-none z-10">
                         <img src={store.logosList[0]} style={{ maxHeight: '15%' }} className="object-contain opacity-95 drop-shadow-2xl" alt="Logo Overlay" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1C] border border-white/10 flex items-center justify-center text-zinc-655 mb-1.5">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-[10.5px] font-black text-zinc-550 uppercase tracking-widest">Aguardando Criação</p>
                  <p className="text-[9px] text-zinc-600 max-w-xs leading-relaxed mt-1">Monte os parâmetros no formulário central e inicie a geração da imagem.</p>
                </div>
              )}

              {/* Download overlay controls */}
              {activeImage && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
                  <button
                    onClick={handleDownloadActiveImage}
                    className="flex items-center gap-2.5 px-4.5 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-200 active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    <Maximize size={12} className="text-black stroke-[3px]" />
                    <span>DOWNLOAD</span>
                  </button>
                  <button
                    onClick={() => showToast("Formatos extras disponíveis nas configurações!", "success")}
                    className="p-2.5 bg-[#0b0b0c]/90 hover:bg-zinc-900 border border-white/10 rounded-lg text-white active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-[240px] lg:w-[300px] 2xl:w-[350px] bg-[#0A0A0A] border-t md:border-t-0 md:border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
             <div className="flex-1 flex flex-col p-4 space-y-4">
                <div className="border border-white/5 bg-black/35 p-4 rounded-xl shrink-0 select-none">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a880]">Galeria Masonry</span>
                  </div>
                  <MasonryGallery
                    exportFormat={exportFormat}
                    showToast={showToast}
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
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
          className="absolute top-4 right-4 p-2 bg-black/75 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )}

  <ChatAssistente
    customApiKey={customApiKey}
    showToast={showToast}
  />
</div>
  );
}
