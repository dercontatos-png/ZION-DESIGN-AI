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
  Smartphone
} from "lucide-react";

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
    corDominante: "#ad8330",
    estilosVisuais: ["Ultra Realista", "Glow"],
    nivelCriativo: 65,
    promptCenario: "Ambiente rústico de boteco premium, balcão de madeira nobre, luz quente âmbar desfocada, copos de cerveja trincando de gelados",
    additionalPrompt: "Luxury night club event flyer, glowing gold neon borders, premium beer drops on cold glass, high-end commercial bar photography, 8k, cinematic lighting.",
    camadasTexto: [
      { conteudo: "BOTECO PREMIUM", funcao: "Headline Principal", fonte: "Montserrat", cor: "#ad8330" },
      { conteudo: "OPEN BAR BRAHMA", funcao: "Subheadline Secundário", fonte: "Unbounded", cor: "#ffffff" },
      { conteudo: "MARCOS & ROBERT", funcao: "Corpo Descrição", fonte: "Montserrat", cor: "#ad8330" },
      { conteudo: "25 DE ABRIL - SEXTA-FEIRA", funcao: "Data / Horário", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#08020f",
    textColor: "#ffffff",
    accentColor: "#ad8330",
    mockBgStyle: {
      background: "radial-gradient(circle at center, #1e1105 0%, #050201 100%)",
      borderColor: "#ad8330"
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
    corDominante: "#ad8330",
    estilosVisuais: ["Elegante", "Clássico"],
    nivelCriativo: 40,
    promptCenario: "Silhueta de cruz de madeira no topo de uma colina ao entardecer, raios de sol dourados passando pelas nuvens, névoa suave, tom solene",
    additionalPrompt: "Sober and solemn Good Friday poster, classical painting style, elegant warm light rays, high-contrast chiaroscuro, spiritual, highly detailed, professional composition.",
    camadasTexto: [
      { conteudo: "SEXTA-FEIRA SANTA", funcao: "Headline Principal", fonte: "Playfair Display", cor: "#ad8330" },
      { conteudo: "Hoje é dia de silêncio, gratidão e reflexão diante do sacrifício.", funcao: "Corpo Descrição", fonte: "Inter", cor: "#e2e8f0" },
      { conteudo: "03 DE ABRIL - SEXTA-FEIRA", funcao: "Data / Horário", fonte: "Outfit", cor: "#ffffff" }
    ],
    bgColor: "#0f0d1a",
    textColor: "#e2e8f0",
    accentColor: "#ad8330",
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
      { conteudo: "Brahma por R$ 5,90", funcao: "Legenda / Detalhe", fonte: "Inter", cor: "#ad8330" }
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("boteco_premium");
  const [galleryFilterDimension, setGalleryFilterDimension] = useState<string>("Todos");
  const [galleryFilterFormat, setGalleryFilterFormat] = useState<string>("Todos");
  const [isTesting, setIsTesting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("");

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

  // Controle de colapso de seções para maximizar a área do preview da imagem
  const [isSystemInstructionExpanded, setIsSystemInstructionExpanded] = useState<boolean>(false);
  const [isFullPromptExpanded, setIsFullPromptExpanded] = useState<boolean>(false);

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
      await downloadImage(activeImage, exportFormat);
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

  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
    return Promise.resolve(base64Str);
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
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ad8330;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* HEADER SUPERIOR (NAVBAR) DE NAVEGAÇÃO COMPACTA */}
      <div className="h-16 border-b border-zinc-800 bg-[#0f0f11] flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30 select-none gap-2">
        {/* Lado Esquerdo: Logo DZ + Título + Seletor de Projetos */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded bg-[#ad8330] flex items-center justify-center font-bold text-black text-sm shrink-0">
              DZ
            </div>
            <span className="font-extrabold text-xs sm:text-sm uppercase tracking-widest text-[#ad8330] hidden md:block">
              Designer Zion
            </span>
          </div>

          <div className="w-[1px] h-4 bg-zinc-800 hidden md:block" />

          {/* Nome do projeto ativo editável */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 p-1.5 sm:p-2 rounded-lg border border-zinc-800 min-w-0">
            {isEditingName ? (
              <input
                type="text"
                value={tempProjectName}
                onChange={(e) => setTempProjectName(e.target.value)}
                onBlur={saveProjectName}
                onKeyDown={(e) => e.key === "Enter" && saveProjectName()}
                className="bg-transparent border-0 text-[10px] text-white focus:outline-none focus:ring-0 w-20 sm:w-32 font-bold uppercase tracking-wider"
                autoFocus
              />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 truncate max-w-[80px] sm:max-w-[120px]">
                {activeProjectName}
              </span>
            )}
            <button
              onClick={isEditingName ? saveProjectName : startEditingName}
              className="text-zinc-500 hover:text-[#ad8330] transition-colors shrink-0 cursor-pointer"
            >
              {isEditingName ? <CheckCircle size={12} /> : <Edit2 size={12} />}
            </button>
          </div>
        </div>

        {/* Centro: Links de Navegação Horizontais da SPA */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none px-1 py-1 max-w-[45%] md:max-w-none shrink-0">
          {[
            { name: "Designer Zion", value: "Design Builder" },
            { name: "Ref Builder", value: "Ref Builder" },
            { name: "Inspiração", value: "Inspiração" },
            { name: "Comunidade", value: "Comunidade" },
            { name: "Minha Galeria", value: "Minha Galeria" }
          ].map((tab) => {
            const isSel = activeMenuTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveMenuTab(tab.value)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  isSel 
                    ? "bg-[#ad8330]/10 border border-[#ad8330]/25 text-[#ad8330]" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Lado Direito: Status e Testar Conexão compactos */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${store.apiStatus === "Online" ? "bg-emerald-500 animate-pulse" : "bg-red-500"} shrink-0`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:inline">
              {store.apiStatus === "Online" ? "API: Online" : "Erro API"}
            </span>
          </div>

          <button
            onClick={handleTestToken}
            disabled={isTesting}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9.5px] font-extrabold uppercase tracking-widest text-zinc-350 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw size={11} className="animate-spin text-[#ad8330]" />
            ) : (
              <Play size={11} className="text-[#ad8330]" />
            )}
            <span className="hidden sm:inline">Testar</span>
          </button>
        </div>
      </div>

      {/* CONTAINER DAS COLUNAS (2 COLUNAS PRINCIPAIS) */}
      <div className="flex flex-col lg:flex-row flex-1 w-full overflow-hidden lg:overflow-hidden overflow-y-auto lg:overflow-y-hidden">

        {/* COLUNA 2: PAINEL DE CONFIGURAÇÕES (52%) */}
        <div className="w-full lg:w-[52%] bg-[#121214] border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col h-[50vh] lg:h-full shrink-0 select-none overflow-hidden">
        
        {/* Topbar/Projetos e Seletor de Módulo */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-black/10">
          
          {/* Listagem horizontal de projetos */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar flex-1 mr-4 py-1">
            {store.projectsList.map((proj) => {
              const isActive = proj.id === store.activeProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => store.loadProjectById(proj.id)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                    isActive
                      ? "bg-zinc-900 border-zinc-800 text-white ring-1 ring-zinc-800"
                      : "bg-[#121214] border-transparent text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  <span className="truncate max-w-[70px]">{proj.name}</span>
                  {store.projectsList.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.deleteProject(proj.id);
                      }}
                      className="hover:text-red-500 transition-colors p-0.5"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => store.createProject()}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all border border-zinc-800 bg-zinc-900"
              title="Novo Projeto"
            >
              <Plus size={10} />
            </button>
          </div>

          {/* Seletor de Painel: Designer Zion vs Product Zion */}
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 shrink-0">
            {[
              { label: "Designer", value: "DESIGNER" },
              { label: "Product", value: "PRODUCT" }
            ].map((pnl) => {
              const isSel = store.tipoPainel === pnl.value;
              return (
                <button
                  key={pnl.value}
                  onClick={() => store.updateConfig({ tipoPainel: pnl.value as any })}
                  className={`px-3 py-1 rounded text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isSel ? "bg-[#ad8330] text-black" : "text-zinc-500 hover:text-zinc-300"
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
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-xs font-black tracking-widest text-zinc-200 uppercase">
                {isProduct ? "Produto Principal" : "Sujeito Principal"}
              </span>
            </div>

            {/* Toggle Desativar Sujeito */}
            <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Desativar Sujeito Principal?</span>
                <span className="text-[10px] text-zinc-500 tracking-wide mt-0.5">Ignore pessoas ou produtos no criativo, focando apenas no cenário e texto</span>
              </div>
              <button
                onClick={() => store.updateConfig({ desativarSujeito: !store.desativarSujeito })}
                className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200"
                style={{ backgroundColor: store.desativarSujeito ? "#ad8330" : "" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
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
                  icon={isProduct ? <Layers size={20} /> : <User size={20} />}
                  base64s={store.sujeitosBase64List || []}
                  onUpdateBase64s={store.setSujeitoBase64List}
                  showToast={showToast}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Quantidade */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 mb-1.5 font-bold">Quantidade</label>
                    <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = store.variations === num;
                        return (
                          <button
                            key={num}
                            onClick={() => store.updateConfig({ variations: num })}
                            className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                              isSelected ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gênero (Oculto se for produto) */}
                  {!isProduct ? (
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 mb-1.5 font-bold">Gênero</label>
                      <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                        {["Masculino", "Feminino", "Outros"].map((gen) => {
                          const isSelected = store.gender === gen;
                          return (
                            <button
                              key={gen}
                              onClick={() => store.updateConfig({ gender: gen })}
                              className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                                isSelected ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              {gen}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 mb-1.5 font-bold">Posicionamento</label>
                      <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                        {["Centro", "Esquerda", "Direita"].map((pos) => {
                          const isSelected = store.positioning === pos;
                          return (
                            <button
                              key={pos}
                              onClick={() => store.updateConfig({ positioning: pos })}
                              className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                                isSelected ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
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
                  <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 mb-1.5 font-bold">
                    {isProduct ? "Características do Produto (opcional)" : "Descrição da pose ou roupa (opcional)"}
                  </label>
                  <input
                    type="text"
                    value={store.poseDescription || ""}
                    onChange={(e) => store.updateConfig({ poseDescription: e.target.value })}
                    placeholder={isProduct ? "Ex: Frasco de vidro fosco, tampa dourada, reflexo metálico..." : "Ex: Em pé de braços cruzados, vestindo blazer preto..."}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#ad8330]/50 font-medium"
                  />
                </div>

                {/* Posição do Sujeito (Oculto se for produto para não repetir seletor) */}
                {!isProduct && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-black text-zinc-400 mb-1.5 font-bold">Posição do Sujeito</label>
                    <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      {["Esquerda", "Centro", "Direita"].map((pos) => {
                        const isSelected = store.positioning === pos;
                        return (
                          <button
                            key={pos}
                            onClick={() => store.updateConfig({ positioning: pos })}
                            className={`flex-1 py-1.5 rounded text-xs font-black transition-all cursor-pointer ${
                              isSelected ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
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
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex flex-col gap-1.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-xs font-black tracking-widest text-zinc-200 uppercase">Dimensões</span>
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
                        ? "bg-[#ad8330]/10 border-[#ad8330] text-[#ad8330] ring-1 ring-[#ad8330]"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#ad8330]/20 hover:ring-1 hover:ring-[#ad8330]/20"
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
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex flex-col gap-1.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-xs font-black tracking-widest text-zinc-200 uppercase">Tipografia (Camadas)</span>
              <span className="text-[10px] text-zinc-400 tracking-wide">Crie e configure camadas dinâmicas de textos com fontes premium</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-zinc-450 uppercase tracking-wider">Adicionar Texto</span>
                <button
                  onClick={() => store.updateConfig({ enableTypography: !store.enableTypography })}
                  className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200"
                  style={{ backgroundColor: store.enableTypography ? "#ad8330" : "" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    style={{ transform: store.enableTypography ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.enableTypography && (
                <div className="space-y-5 pt-1">
                  
                  {/* Referência de Tipografia por Imagem */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-900/60 space-y-2">
                    <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">Copiar Tipografia por Referência (Imagem)</span>
                    <ImageUploader
                      type="env"
                      label="Enviar Print da Tipografia"
                      icon={<ImageIcon size={16} />}
                      base64s={store.tipografiaRefsList || []}
                      onUpdateBase64s={store.setTipografiaRefsList}
                      showToast={showToast}
                    />
                  </div>

                  {/* Lista de Camadas de Texto */}
                  <div className="space-y-3.5">
                    {store.camadasTexto.map((layer, index) => (
                      <div key={layer.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 space-y-3 relative group">
                        
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
                          <span className="text-[9px] font-black text-[#ad8330] uppercase tracking-widest block mb-1">CAMADA #{index + 1}</span>
                        </div>

                        {/* Conteúdo frase */}
                        <div>
                          <label className="block text-[8.5px] uppercase tracking-widest font-black text-zinc-555 mb-1">Frase</label>
                          <input
                            type="text"
                            value={layer.conteudo}
                            onChange={(e) => store.updateCamadaTexto(layer.id, { conteudo: e.target.value })}
                            placeholder="Frase ou texto..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#ad8330]/40 font-medium"
                          />
                        </div>

                        {/* Função Corpo / Descrição */}
                        <div>
                          <label className="block text-[8.5px] uppercase tracking-widest font-black text-zinc-555 mb-1">Função</label>
                          <select
                            value={layer.funcao}
                            onChange={(e) => store.updateCamadaTexto(layer.id, { funcao: e.target.value as any })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase tracking-wide cursor-pointer"
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
                            <label className="block text-[8px] uppercase tracking-widest font-black text-zinc-555 mb-1">Escolha a Fonte</label>
                            <select
                              value={layer.fonte}
                              onChange={(e) => store.updateCamadaTexto(layer.id, { fonte: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase tracking-wide cursor-pointer"
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
                            <label className="block text-[8px] uppercase tracking-widest font-black text-zinc-555 mb-1">Cor do Texto</label>
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
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => store.addCamadaTexto()}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-black uppercase tracking-widest text-[#ad8330] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Adicionar Bloco de Texto</span>
                  </button>

                  {/* Posição Global */}
                  <div>
                    <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5 font-bold">Posição Global do Texto</label>
                    <div className="flex gap-1.5 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                      {(["ESQUERDA", "CENTRO", "DIREITA"] as const).map((pos) => {
                        const isSel = store.typographyPosition === pos;
                        return (
                          <button
                            key={pos}
                            onClick={() => store.updateConfig({ typographyPosition: pos })}
                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isSel ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
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
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Cenário</span>
              <span className="text-[8px] text-zinc-500 tracking-wide">Descreva ou envie imagens do plano de fundo/ambiente do criativo</span>
            </div>
            
            <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Usar fotos de cenário?</span>
                <button
                  onClick={() => store.updateConfig({ useEnvRef: !store.useEnvRef })}
                  className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200"
                  style={{ backgroundColor: store.useEnvRef ? "#ad8330" : "" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    style={{ transform: store.useEnvRef ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.useEnvRef && (
                <ImageUploader
                  type="env"
                  label="Fotos de Cenário"
                  icon={<ImageIcon size={20} />}
                  base64s={store.cenariosBase64List || []}
                  onUpdateBase64s={store.setCenarioBase64List}
                  showToast={showToast}
                />
              )}

              {/* Prompt Adicional Cenário */}
              <div className="pt-2">
                <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5 font-bold">Prompt Adicional Cenário</label>
                <input
                  type="text"
                  value={store.promptCenario}
                  onChange={(e) => store.updateConfig({ promptCenario: e.target.value })}
                  placeholder="Ex: Sala executiva com luz solar, janelas de vidro amplas..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#ad8330]/50 font-medium"
                />
              </div>
            </div>

          {/* Referência de Design Obrigatório */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Design Obrigatório</span>
              <span className="text-[8px] text-zinc-500 tracking-wide">Importe uma imagem com o layout ou posicionamento estrutural desejado</span>
            </div>

            <div className="flex items-start gap-3 text-[#ad8330] bg-[#ad8330]/5 border border-[#ad8330]/10 p-3 rounded-xl animate-in fade-in">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span className="text-[9px] font-medium leading-relaxed uppercase tracking-wider text-zinc-400">
                Suba uma imagem de referência de design. A IA vai analisar a estrutura, tipografia e grid para aplicar no card gerado.
              </span>
            </div>

            <ImageUploader
              type="env"
              label="Referência de Design Obrigatório"
              icon={<Layout size={20} />}
              base64s={store.designRefsList || []}
              onUpdateBase64s={store.setDesignRefsList}
              showToast={showToast}
            />
          </div>

          {/* Logotipo da Marca */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#ad8330] pl-3">
              <span className="text-xs font-black tracking-widest text-zinc-200 uppercase">Logotipo da Marca</span>
              <span className="text-[10px] text-zinc-400 tracking-wide">Importe o logotipo da sua marca para estampar no criativo</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Estampar Logotipo?</span>
              <button
                onClick={() => store.updateConfig({ useLogo: !store.useLogo })}
                className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200"
                style={{ backgroundColor: store.useLogo ? "#ad8330" : "" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                  style={{ transform: store.useLogo ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>

            {store.useLogo && (
              <div className="animate-in fade-in duration-200">
                <ImageUploader
                  type="env"
                  label="Logotipo da Marca (PNG/SVG)"
                  icon={<Layers size={20} />}
                  base64s={store.logosList || []}
                  onUpdateBase64s={store.setLogosList}
                  showToast={showToast}
                />
              </div>
            )}
          </div>

          {/* Referências de Estilos Individuais com Descrição */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex justify-between items-start border-l-2 border-[#ad8330] pl-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Referências de Estilo</span>
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
                <button className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-[#ad8330]/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#ad8330] cursor-pointer">
                  + Adicionar
                </button>
              </div>
            </div>

            {store.referenciasEstilo.length > 0 ? (
              <div className="space-y-3.5">
                {store.referenciasEstilo.map((ref) => (
                  <div key={ref.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex gap-3 relative group">
                    
                    <button
                      onClick={() => store.removeReferenciaEstilo(ref.id)}
                      className="absolute top-2 right-2 p-1 bg-black/85 hover:bg-red-500 rounded text-zinc-450 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={10} />
                    </button>

                    <div
                      onClick={() => setModalImageRefUrl(ref.url)}
                      className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-905 cursor-zoom-in relative"
                      title="Ver tamanho grande"
                    >
                      <img src={ref.url} className="w-full h-full object-cover" alt="Estilo Ref" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={10} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <span className="text-[8px] font-black text-zinc-550 uppercase tracking-widest block">Descrição do Estilo Visual</span>
                      <input
                        type="text"
                        value={ref.descricao}
                        onChange={(e) => store.updateReferenciaEstilo(ref.id, e.target.value)}
                        placeholder="Ex: Copiar tons de dourado..."
                        className="w-[90%] bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-[#ad8330]/40 font-medium"
                      />
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 text-center border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/20">
                <span className="text-[8.5px] font-bold text-zinc-600 uppercase tracking-wider">Suba imagens de estilo para imitar</span>
              </div>
            )}
          </div>

          {/* Cores & Iluminação */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex flex-col gap-1 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Cores & Iluminação</span>
              <span className="text-[8px] text-zinc-500 tracking-wide">Configure as cores de iluminação de estúdio do seu criativo</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Automático (Harmônico)?</span>
              <button
                onClick={() => store.updateConfig({ coresAutomaticas: !store.coresAutomaticas })}
                className="w-11 h-6 bg-zinc-855 rounded-full p-0.5 relative transition-colors duration-200"
                style={{ backgroundColor: store.coresAutomaticas ? "#ad8330" : "" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                  style={{ transform: store.coresAutomaticas ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>

            {!store.coresAutomaticas && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-3.5">
                  <div className="p-3 bg-zinc-950 border border-zinc-900 flex flex-col gap-2 hover:border-[#ad8330]/30 transition-all rounded-lg">
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-900 flex flex-col gap-2 hover:border-[#ad8330]/30 transition-all rounded-lg">
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-900 flex flex-col gap-2 hover:border-[#ad8330]/30 transition-all rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Complementar</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={store.cores.complementar || "#ad8330"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, complementar: e.target.value }
                        })}
                        className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={store.cores.complementar || "#ad8330"}
                        onChange={(e) => store.updateConfig({
                          cores: { ...store.cores, complementar: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest">Paleta Adicional de Cores ({store.cores?.paleta?.length || 0})</span>
                    <button
                      onClick={() => store.updateConfig({
                        cores: { ...store.cores, paleta: [...(store.cores?.paleta || []), "#ffffff"] }
                      })}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {store.cores?.paleta?.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 relative group">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newPaleta = [...(store.cores?.paleta || [])];
                            newPaleta[idx] = e.target.value;
                            store.updateConfig({ cores: { ...store.cores, paleta: newPaleta } });
                          }}
                          className="w-6 h-6 rounded border-0 cursor-pointer overflow-hidden bg-transparent p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newPaleta = [...(store.cores?.paleta || [])];
                            newPaleta[idx] = e.target.value;
                            store.updateConfig({ cores: { ...store.cores, paleta: newPaleta } });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                        />
                        <button
                          onClick={() => {
                            const newPaleta = store.cores.paleta.filter((_, i) => i !== idx);
                            store.updateConfig({ cores: { ...store.cores, paleta: newPaleta } });
                          }}
                          className="absolute -right-2 -top-2 w-4 h-4 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cor Dominante e Degradê Leitura */}
            <div className="space-y-3.5 pt-3.5 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Usar Cor Dominante?</span>
                  <span className="text-[8px] text-zinc-500 tracking-wide mt-0.5">Ativa cor da marca no criativo</span>
                </div>
                <button
                  onClick={() => store.updateConfig({ useCorDominante: !store.useCorDominante })}
                  className="w-11 h-6 bg-zinc-855 rounded-full p-0.5 relative transition-colors duration-200"
                  style={{ backgroundColor: store.useCorDominante ? "#ad8330" : "" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    style={{ transform: store.useCorDominante ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {store.useCorDominante && (
                <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-900 animate-in slide-in-from-top-2 duration-200">
                  <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Cor Dominante</span>
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
                      className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#ad8330]/40 font-bold uppercase"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Degradê Leitura?</span>
                <button
                  onClick={() => store.updateConfig({ degradeLeitura: !store.degradeLeitura })}
                  className="w-11 h-6 bg-zinc-855 rounded-full p-0.5 relative transition-colors duration-200"
                  style={{ backgroundColor: store.degradeLeitura ? "#ad8330" : "" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    style={{ transform: store.degradeLeitura ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Composição */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Composição</span>
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
                        ? "bg-[#ad8330]/10 border-[#ad8330] text-[#ad8330] ring-1 ring-[#ad8330]"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#ad8330]/20"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${isSelected ? 'bg-[#ad8330]/20 text-[#ad8330]' : 'bg-zinc-900 text-zinc-650'}`}>
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
                <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5 font-bold">Composição Personalizada (opcional)</label>
                <input
                  type="text"
                  value={store.composicaoCustom || ""}
                  onChange={(e) => store.updateConfig({ composicaoCustom: e.target.value })}
                  placeholder="Ex: Sujeito desfocado fundo centralizado..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#ad8330]/50 font-medium"
                />
              </div>

              {/* Elementos Flutuantes Avançados */}
              <div className="space-y-3 pt-3.5 border-t border-zinc-800/60 mt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-zinc-350 uppercase tracking-wider">Elementos Flutuantes</span>
                  <span className="text-[10px] text-zinc-500 tracking-wide">Configure partículas ou objetos suspensos para dar profundidade</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
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
                            ? "bg-[#ad8330] text-black" 
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-[#ad8330]/50 font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Atributos Visuais & Estilo */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Atributos Visuais & Estilo</span>
            </div>

            {/* Slider de Sobriedade com Porcentagem Dinâmica */}
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl space-y-3 shadow-md">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-450">
                <span>Sobriedade</span>
                <span className="text-[#ad8330] font-bold">
                  {store.nivelCriativo}% — {getCreativeSliderLabel(store.nivelCriativo)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={store.nivelCriativo}
                onChange={(e) => store.updateConfig({ nivelCriativo: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#ad8330]"
              />
              <div className="flex justify-between text-[8px] font-extrabold text-zinc-600 uppercase tracking-widest pt-1">
                <span>Criativo</span>
                <span>Profissional</span>
              </div>
            </div>

            {/* Style Selector */}
            <StyleSelector
              enableEstiloVisual={enableEstiloVisual}
              setEnableEstiloVisual={setEnableEstiloVisual}
            />

            {/* Toggles extras */}
            <div className="space-y-3 border-t border-zinc-800 pt-5">
              <div className="flex items-center justify-between py-1">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Usar Desfoque (Blur)?</span>
                <button
                  onClick={() => store.updateConfig({ enableBlur: !store.enableBlur })}
                  className="w-11 h-6 bg-zinc-800 rounded-full p-0.5 relative transition-colors duration-200"
                  style={{ backgroundColor: store.enableBlur ? "#ad8330" : "" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    style={{ transform: store.enableBlur ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">Usar Degradê Lateral?</span>
                <button
                  onClick={() => store.updateConfig({ lateralGradient: !store.lateralGradient })}
                  className="w-11 h-6 bg-zinc-855 rounded-full p-0.5 relative transition-colors duration-200"
                  style={{ backgroundColor: store.lateralGradient ? "#ad8330" : "" }}
                >
                  <div
                    className="w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    style={{ transform: store.lateralGradient ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Entradas Manuais */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Entradas Manuais</span>
            </div>

            <div>
              <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-550 mb-1.5">Prompt Adicional</label>
              <textarea
                value={store.additionalPrompt}
                onChange={(e) => store.updateConfig({ additionalPrompt: e.target.value })}
                placeholder="Escreva detalhes estéticos adicionais..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#ad8330]/50 resize-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-550 mb-1.5">Prompt Negativo</label>
              <textarea
                value={store.negativePrompt}
                onChange={(e) => store.updateConfig({ negativePrompt: e.target.value })}
                placeholder="Ex: óculos, água no avião, elementos distorcidos, deformações, texto borrado..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#ad8330]/50 resize-none font-medium"
              />
            </div>
          </div>

          {/* Opções Avançadas */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-5 shadow-sm hover:border-zinc-800/80 transition-colors">
            <div className="flex items-center gap-2.5 border-l-2 border-[#ad8330] pl-3">
              <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Opções Avançadas</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Qualidade */}
              <div>
                <label className="block text-[9.5px] uppercase tracking-widest font-black text-zinc-500 mb-1.5">Qualidade de Renderização</label>
                <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                  {["1K", "2K", "4K"].map((q) => {
                    const isSelected = store.resolucao === q;
                    return (
                      <button
                        key={q}
                        onClick={() => store.updateConfig({ resolucao: q })}
                        className={`flex-1 py-1.5 rounded text-[10.5px] font-black transition-all cursor-pointer ${
                          isSelected ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
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
                <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
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
                          isSelected ? "bg-[#ad8330] text-black" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={generatePremiumImage}
              disabled={isGenerating}
              className="w-full bg-[#ad8330] hover:bg-[#8e6b27] disabled:opacity-50 text-black font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.98] hover:shadow-[0_0_15px_rgba(173,131,48,0.4)] cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-black" />
                  <span>Gerando Pixels...</span>
                  <span className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-black" />
                  <span>Gerar Imagem</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyPrompt}
              className={`w-full flex items-center justify-center gap-2 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98] ${
                isCopied ? "bg-[#ad8330]/20 border-[#ad8330] text-[#ad8330]" : ""
              }`}
            >
              {isCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
              Duplicar Configuração
            </button>
          </div>
          </>
          )}

          {activeMenuTab === "Ref Builder" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Ref Builder Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-zinc-800">
                <span className="text-[10px] font-black text-[#ad8330] tracking-widest uppercase">Estúdio de Referências</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Ref Builder PRO</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Ajuste os pesos das referências visuais para obter consistência máxima em seus criativos.</p>
              </div>

              {/* Referência de Personagem */}
              <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#ad8330] pl-3">
                  <User size={14} className="text-[#ad8330]" />
                  <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Referência de Personagem (IP-Adapter)</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Garanta rostos e identidades idênticas em múltiplos criativos.</p>
                <div className="border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <User size={24} className="text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir face de referência</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Peso do Personagem (Força)</span>
                    <span className="text-[#ad8330]">0.85</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.85" className="w-full accent-[#ad8330] bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>

              {/* Referência de Estilo */}
              <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#ad8330] pl-3">
                  <Palette size={14} className="text-[#ad8330]" />
                  <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Referência de Estilo (Style Transfer)</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Copie cores, pinceladas, iluminação de estúdio e texturas de uma imagem base.</p>
                <div className="border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Palette size={24} className="text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir estilo de referência</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Peso do Estilo</span>
                    <span className="text-[#ad8330]">0.70</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.70" className="w-full accent-[#ad8330] bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>

              {/* Referência de Estrutura */}
              <div className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-2 border-l-2 border-[#ad8330] pl-3">
                  <Layout size={14} className="text-[#ad8330]" />
                  <span className="text-[10.5px] font-black tracking-widest text-zinc-300 uppercase">Estrutura & Grid (ControlNet)</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Preserve o layout original do flyer, posição dos elementos e profundidade.</p>
                <div className="border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <Layout size={24} className="text-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Arraste ou clique para subir grid estrutural</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Fidelidade do Grid</span>
                    <span className="text-[#ad8330]">0.90</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" defaultValue="0.90" className="w-full accent-[#ad8330] bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {activeMenuTab === "Inspiração" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Inspiração Header */}
              <div className="flex flex-col gap-1 pb-4 border-b border-zinc-800">
                <span className="text-[10px] font-black text-[#ad8330] tracking-widest uppercase">Presets Premium</span>
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
                          ? "bg-[#ad8330]/10 border-[#ad8330] shadow-[0_0_15px_rgba(173,131,48,0.1)]"
                          : "bg-zinc-900/20 border-zinc-800 hover:border-zinc-800 hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-black text-[#ad8330] uppercase tracking-widest">
                            {template.category}
                          </span>
                          <span className="text-xs font-extrabold text-zinc-100 uppercase tracking-wider group-hover:text-white transition-colors">
                            {template.name}
                          </span>
                        </div>
                        <span className="bg-zinc-950 border border-zinc-800 text-[8px] font-black px-2 py-0.5 rounded text-zinc-400">
                          PROPORÇÃO {template.dimensao}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {template.estilosVisuais.map((st) => (
                          <span key={st} className="bg-zinc-900 border border-zinc-800 text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded text-zinc-500">
                            {st}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
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
                          className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-[#ad8330]/40 group-hover:bg-[#ad8330] group-hover:text-black hover:scale-105 active:scale-95 transition-all text-[8px] font-black uppercase tracking-widest text-[#ad8330] rounded-lg"
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
              <div className="flex flex-col gap-1 pb-4 border-b border-zinc-800">
                <span className="text-[10px] font-black text-[#ad8330] tracking-widest uppercase">Zion Hub</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Feed da Comunidade</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Inspire-se em layouts de alto nível criados por outros diretores de arte da agência.</p>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                {communityCreations.map((item) => (
                  <div key={item.id} className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl space-y-3.5 hover:border-zinc-800 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.avatarColor} text-black font-extrabold text-[10px]`}>
                          {item.author.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold text-zinc-200 uppercase tracking-wider">{item.author}</span>
                          <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-widest">{item.role}</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-black bg-zinc-950 border border-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                        PROPORÇÃO {item.dimensao}
                      </span>
                    </div>

                    <div className="space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                      <span className="text-[8.5px] font-extrabold text-[#ad8330] uppercase tracking-widest block">Prompt Utilizado</span>
                      <p className="text-[10px] font-bold text-zinc-300 leading-relaxed font-mono select-all">
                        {item.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-red-500 transition-colors">
                          <Heart size={11} />
                          <span>{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-[#ad8330] transition-colors">
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
                        className="px-3 py-1 bg-[#ad8330]/10 border border-[#ad8330]/20 hover:bg-[#ad8330] hover:text-black transition-all text-[8px] font-black uppercase tracking-widest text-[#ad8330] rounded-lg"
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
              <div className="flex flex-col gap-1 pb-4 border-b border-zinc-800">
                <span className="text-[10px] font-black text-[#ad8330] tracking-widest uppercase">Histórico Digital</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Minha Galeria</h3>
                <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">Visualize, filtre e gerencie todas as criações premium salvas neste projeto.</p>
              </div>

              {/* Filtros da Galeria */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-550 uppercase tracking-widest block">Filtros de Proporção</span>
                <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
                  {["Todos", "1:1", "4:5", "9:16", "16:9"].map((dim) => {
                    const isSel = galleryFilterDimension === dim;
                    return (
                      <button
                        key={dim}
                        onClick={() => setGalleryFilterDimension(dim)}
                        className={`px-2.5 py-1 text-[8.5px] font-extrabold rounded uppercase tracking-wider transition-all cursor-pointer ${
                          isSel ? "bg-[#ad8330] text-black" : "text-zinc-500 hover:text-zinc-300"
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
                      <div className="py-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
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
                                ? "border-[#ad8330] ring-2 ring-[#ad8330]/20"
                                : "border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            <img src={imgBase64} className="w-full h-full object-cover" alt="Galeria Zion" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={14} className="text-[#ad8330] scale-90 group-hover:scale-100 transition-transform" />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/80 border border-zinc-800/80 rounded px-1 text-[6.5px] font-black text-zinc-400">
                              IMG #{originalIdx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="py-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                  <ImageIcon size={20} className="text-zinc-700 mx-auto mb-2" />
                  <span className="text-[9px] font-bold text-zinc-650 uppercase tracking-wider">Nenhuma imagem gerada ainda</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* COLUNA 3: VIEWPORT (MENSAGENS DE PROGRESSO REALISTA & ZOOM) E GALERIA MASONRY (48%) */}
      <div className="w-full lg:w-[48%] bg-[#0a0a0a] flex flex-col h-[50vh] lg:h-full overflow-hidden relative">
        
        {/* Workspace Canvas / Viewport com Zoom e Pan */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#070708]">
          
          {/* Barra superior de controle do Zoom */}
          {activeImage && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/85 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-lg text-zinc-350">
              <button
                onClick={() => setZoomPercent(prev => Math.max(prev - 10, 30))}
                className="hover:text-white p-1 cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[9.5px] font-black tracking-wider uppercase px-1 min-w-[36px] text-center text-[#ad8330]">
                {zoomPercent}%
              </span>
              <button
                onClick={() => setZoomPercent(prev => Math.min(prev + 10, 500))}
                className="hover:text-white p-1 cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <div className="w-[1px] h-3.5 bg-zinc-800 mx-1" />
              <button
                onClick={resetZoomAndPan}
                className="hover:text-white text-[8px] font-black uppercase tracking-widest cursor-pointer px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800"
              >
                Resetar
              </button>
            </div>
          )}

          {/* Area Interativa de Imagem com Loading Progressivo Realista */}
          <div
            ref={viewportRef}
            onWheel={activeImage ? handleWheel : undefined}
            onMouseDown={activeImage ? handleMouseDown : undefined}
            onMouseMove={activeImage ? handleMouseMove : undefined}
            onMouseUp={activeImage ? handleMouseUpOrLeave : undefined}
            onMouseLeave={activeImage ? handleMouseUpOrLeave : undefined}
            className={`flex-1 flex items-center justify-center p-6 relative select-none overflow-hidden ${
              activeImage ? "cursor-grab" : ""
            } ${isDragging ? "cursor-grabbing" : ""}`}
          >
            {activeMenuTab === "Inspiração" ? (
              (() => {
                const template = templatePresets.find(t => t.id === selectedTemplateId) || templatePresets[0];
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="text-center mb-4">
                      <span className="text-[10px] font-black text-[#ad8330] uppercase tracking-widest block mb-0.5">Pré-Visualização do Layout</span>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100">{template.name}</h4>
                    </div>
                    
                    {/* Mockup Canvas */}
                    <div 
                      className="relative rounded-2xl shadow-2xl border flex flex-col justify-between p-6 overflow-hidden transition-all duration-500"
                      style={{
                        ...template.mockBgStyle,
                        width: template.dimensao === "16:9" ? "320px" : template.dimensao === "9:16" ? "210px" : template.dimensao === "4:5" ? "250px" : "280px",
                        height: template.dimensao === "16:9" ? "180px" : template.dimensao === "9:16" ? "370px" : template.dimensao === "4:5" ? "312px" : "280px",
                        boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 25px ${template.accentColor}25`
                      }}
                    >
                      {/* Abstract background elements for high quality */}
                      <div className="absolute inset-0 opacity-25 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: template.corDominante }} />
                        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: template.accentColor }} />
                        {/* Grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:15px_15px]" />
                      </div>

                      {/* Header Logo */}
                      <div className="z-10 flex justify-between items-center w-full">
                        <div className="flex items-center gap-1.5 opacity-80">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: template.accentColor, color: "#000" }}>
                            Z
                          </div>
                          <span className="text-[7.5px] font-black uppercase tracking-widest" style={{ color: "#fff" }}>ZION COMPANY</span>
                        </div>
                        <div className="text-[6.5px] font-bold uppercase px-1.5 py-0.5 rounded border opacity-60" style={{ color: template.accentColor, borderColor: `${template.accentColor}40` }}>
                          PRESET
                        </div>
                      </div>

                      {/* Middle Graphic Silhouette (Simulating Sujeito/Produto) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        {template.id.includes("boteco") || template.id.includes("combo") ? (
                          <div className="w-24 h-32 rounded-t-full border border-dashed border-zinc-600 flex items-center justify-center">
                            <span className="text-[8px] uppercase tracking-wider font-bold">Produto/Sujeito</span>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full border border-dashed border-zinc-600 flex items-center justify-center">
                            <span className="text-[8px] uppercase tracking-wider font-bold">Elemento Focal</span>
                          </div>
                        )}
                      </div>

                      {/* Main Typography content */}
                      <div className="z-10 flex flex-col gap-2.5 w-full mt-auto relative">
                        {template.camadasTexto.map((layer, idx) => {
                          const isHeadline = layer.funcao === "Headline Principal";
                          const isSub = layer.funcao === "Subheadline Secundário";
                          const isPrice = layer.funcao === "Preço / Valor";
                          const isDate = layer.funcao === "Data / Horário";
                          return (
                            <div 
                              key={idx} 
                              className={`leading-tight text-center`}
                              style={{ 
                                color: layer.cor,
                                fontFamily: layer.fonte === "Cinzel" ? "Cinzel" : layer.fonte === "Playfair Display" ? "Playfair Display" : "Montserrat",
                              }}
                            >
                              {isHeadline && (
                                <h1 className="text-sm font-black uppercase tracking-tighter" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                                  {layer.conteudo}
                                </h1>
                              )}
                              {isSub && (
                                <p className="text-[8.5px] font-bold uppercase tracking-wide opacity-90">
                                  {layer.conteudo}
                                </p>
                              )}
                              {isPrice && (
                                <span className="inline-block px-2.5 py-0.5 bg-white text-black font-black text-[10px] uppercase rounded shadow-lg mt-0.5">
                                  {layer.conteudo}
                                </span>
                              )}
                              {isDate && (
                                <span className="text-[7.5px] font-black uppercase tracking-widest block mt-0.5 opacity-75">
                                  {layer.conteudo}
                                </span>
                              )}
                              {!isHeadline && !isSub && !isPrice && !isDate && (
                                <p className="text-[8px] font-medium leading-relaxed max-w-[90%] mx-auto opacity-80">
                                  {layer.conteudo}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Info */}
                      <div className="z-10 w-full text-center mt-2 opacity-50">
                        <span className="text-[6px] font-bold uppercase tracking-widest text-zinc-400">DESIGNER ZION DIGITAL ENGINE</span>
                      </div>
                    </div>

                    <div className="mt-4 max-w-xs text-center">
                      <p className="text-[9px] text-zinc-400 leading-relaxed uppercase tracking-wider">
                        Este layout utiliza a fonte <strong className="text-zinc-200">{template.camadasTexto[0]?.fonte}</strong> e tons de <strong style={{ color: template.accentColor }}>{template.corDominante}</strong>.
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              activeImage ? (
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                  {/* Resolution & Model Badge */}
                  {activeImageDims && (
                    <div className="absolute top-4 left-4 bg-[#0a0a0a]/95 backdrop-blur-md border border-zinc-800 rounded-xl px-3 py-2 flex flex-col gap-0.5 select-none text-[10px] pointer-events-auto font-mono text-zinc-400 z-10 shadow-2xl">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ad8330]" />
                        <span className="text-zinc-200 font-bold uppercase text-[9px]">gemini-3-pro-image</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px]">
                        <span>RESOLUÇÃO REAL:</span>
                        <span className="text-[#ad8330] font-bold">{activeImageDims.width} x {activeImageDims.height}</span>
                      </div>
                    </div>
                  )}
                  {/* The zoomable layer */}
                  <div
                    className="transition-transform duration-75 ease-out shadow-2xl border border-zinc-800 rounded-2xl bg-zinc-950 flex items-center justify-center overflow-hidden pointer-events-auto"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomPercent / 100})`,
                      maxWidth: "90%",
                      maxHeight: "90%",
                      aspectRatio: store.dimensao === "16:9" ? "16/9" : store.dimensao === "9:16" ? "9/16" : store.dimensao === "4:5" ? "4/5" : "1/1"
                    }}
                  >
                    <img
                      src={activeImage}
                      alt="Resultado Ativo"
                      className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                  </div>
                  
                  {/* Floating Action Menu */}
                  <div className="absolute bottom-6 left-[10%] pointer-events-auto flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                    {showImageOptions && (
                      <div className="w-56 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1">
                        <button 
                          onClick={() => { setShowImageOptions(false); setShowMaskPainter(true); }}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg text-zinc-300 hover:text-white transition-colors text-xs font-medium"
                        >
                          <PenTool size={14} className="text-[#ad8330]" />
                          Pintar Máscara
                        </button>
                        <button 
                          className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg text-zinc-300 hover:text-white transition-colors text-xs font-medium"
                        >
                          <Smartphone size={14} className="text-[#ad8330]" />
                          Versão Vertical (9:16)
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowExportMenu(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-lg"
                      >
                        <Maximize size={14} />
                        DOWNLOAD
                      </button>
                      <button 
                        onClick={() => setShowImageOptions(!showImageOptions)}
                        className={`p-2 rounded-lg transition-colors shadow-lg ${showImageOptions ? 'bg-[#ad8330] text-black' : 'bg-[#ad8330] text-black hover:bg-[#c2963a]'}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 select-none w-full max-w-sm">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-5 w-full">
                      
                      {/* Animação do Progress Ring ou Barra Horizontal elegante */}
                      <div className="w-full bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          <span className="text-[#ad8330] flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            Renderizando Card Premium
                          </span>
                          <span className="font-mono text-[#ad8330]">{progressPercent}%</span>
                        </div>
                        
                        {/* Contador Regressivo Inteligente */}
                        <div className="text-center py-2 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-1">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-extrabold block">Tempo Estimado Restante</span>
                          <span className="text-2xl font-black text-white font-mono tracking-tight block">
                            {countdown > 1 ? `${countdown}s` : "Finalizando..."}
                          </span>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden p-[2px] border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-[#ad8330] via-yellow-500 to-amber-600 transition-all duration-300 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Mensagem atual */}
                        <p className="text-[9px] text-zinc-400 font-medium tracking-wide text-center pt-1 transition-all duration-300 leading-relaxed min-h-[24px]">
                          {progressMessage}
                        </p>
                      </div>

                      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">Conectado ao Engine de IA</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-655 mb-1.5">
                        <Eye size={16} />
                      </div>
                      <p className="text-[10.5px] font-black text-zinc-550 uppercase tracking-widest">Aguardando Criação</p>
                      <p className="text-[9px] text-zinc-600 max-w-xs leading-relaxed mt-1">Monte os parâmetros no formulário central e inicie a geração da imagem.</p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

        </div>

        {/* Instrução do Sistema (Colapsável) */}
        {store.lastSystemInstruction && (
          <div className="border-t border-zinc-900 bg-[#ad8330]/5 shrink-0 transition-all duration-300">
            {/* Header / Gatilho */}
            <div 
              onClick={() => setIsSystemInstructionExpanded(!isSystemInstructionExpanded)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#ad8330]/10 transition-colors select-none"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ad8330] flex items-center gap-1.5">
                {isSystemInstructionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Sparkles size={11} /> Instrução do Sistema (Para Modelo AI)
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(store.lastSystemInstruction);
                  showToast("Instrução do sistema copiada!", "success");
                }}
                className="text-[9px] font-bold uppercase tracking-wider text-[#ad8330] hover:text-[#d4af37] transition-colors px-2 py-1 bg-[#ad8330]/10 border border-[#ad8330]/30 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Copy size={9} /> Copiar Instrução
              </button>
            </div>

            {/* Conteúdo Expansível */}
            {isSystemInstructionExpanded && (
              <div className="p-4 pt-0 border-t border-zinc-900/40 animate-in fade-in duration-200">
                <div className="bg-zinc-950/80 border border-zinc-900 p-3.5 rounded-xl max-h-[90px] overflow-y-auto font-mono text-[10px] text-zinc-300 leading-relaxed scrollbar-thin select-all">
                  {store.lastSystemInstruction}
                </div>
                <p className="text-[8px] text-zinc-500 mt-1.5 font-semibold">
                  Coloque esta instrução do sistema no console do Google Cloud Agent Platform.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Prompt Completo (Colapsável) */}
        <div className="border-t border-zinc-900 bg-black/40 shrink-0 transition-all duration-300">
          {/* Header / Gatilho */}
          <div 
            onClick={() => setIsFullPromptExpanded(!isFullPromptExpanded)}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/60 transition-colors select-none"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ad8330] flex items-center gap-1.5">
              {isFullPromptExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Sparkles size={11} /> Prompt Completo de Geração (Pensamento da IA)
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(store.lastGeneratedPrompt || buildMasterPrompt(store));
                showToast("Prompt mestre copiado!", "success");
              }}
              className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-[#ad8330] transition-colors px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Copy size={9} /> Copiar Prompt Completo
            </button>
          </div>

          {/* Conteúdo Expansível */}
          {isFullPromptExpanded && (
            <div className="p-4 pt-0 border-t border-zinc-900/40 animate-in fade-in duration-200">
              <div className="bg-zinc-950/80 border border-zinc-900 p-3.5 rounded-xl max-h-[90px] overflow-y-auto font-mono text-[10px] text-zinc-400 leading-relaxed scrollbar-thin select-all">
                {store.lastGeneratedPrompt || buildMasterPrompt(store)}
              </div>
              <p className="text-[8px] text-zinc-600 mt-1.5">
                Use este prompt completo em outras ferramentas de IA para recriar ou aprimorar sua imagem com as mesmas diretrizes.
              </p>
            </div>
          )}
        </div>

        {/* Galeria Masonry inferior - Memoized */}
        <div className="border-t border-zinc-900 bg-black/25 p-5 shrink-0 select-none">
          <MasonryGallery
            exportFormat={exportFormat}
            showToast={showToast}
          />
        </div>
      </div>
      </div>

      {/* 9. MODAL GRANDE DE PREVIEW DE ESTILO VISUAL */}
      {modalImageRefUrl && (
        <div
          onClick={() => setModalImageRefUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90%] flex flex-col items-center justify-center">
            <img
              src={modalImageRefUrl}
              alt="Estilo Ref Zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
            />
            <button
              onClick={() => setModalImageRefUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/75 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ad8330] mt-3">Imagem de Referência de Estilo</span>
          </div>
        </div>
      )}

      {/* Toasts de Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f0f11] border border-zinc-800 p-5 rounded-xl shadow-2xl flex items-center gap-3.5 animate-in slide-in-from-bottom-5 max-w-sm">
          {toast.type === "warning" && <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
          {toast.type === "error" && <X size={16} className="text-red-500 shrink-0" />}
          {toast.type === "success" && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
          <span className="text-xs font-bold text-zinc-300">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-zinc-600 hover:text-white ml-2 shrink-0 cursor-pointer">
            <X size={15} />
          </button>
        </div>
      )}

      {showExportMenu && (
        <ExportModal 
          onClose={() => setShowExportMenu(false)}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          zoomPercent={zoomPercent}
          setZoomPercent={setZoomPercent}
          resolution={store.resolucao}
        />
      )}

      {showMaskPainter && activeImage && (
        <MaskPainter 
          imageUrl={activeImage}
          onCancel={() => setShowMaskPainter(false)}
          onConfirm={(maskBase64) => {
            // No futuro isso pode ser enviado para a API de Inpainting
            setShowMaskPainter(false);
            showToast("Máscara salva. (Pronto para API de Inpainting)", "success");
          }}
        />
      )}

      {/* Assistente Zion AI Chat Drawer */}
      <ChatAssistente
        customApiKey={customApiKey}
        showToast={showToast}
      />

    </div>
  );
}
