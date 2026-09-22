export interface CommunityCardItem {
  id: string;
  col: number;
  index: number;
  title: string;
  tag: string;
  aspect: string;
  author: string;
  avatar?: string;
  letter?: string;
  baseVotes: number;
  app: string;
  src: string;
  prompt: string;
}

export const COMMUNITY_CARDS: CommunityCardItem[] = [
  {
    id: "HA50J",
    col: 0,
    index: 0,
    title: "Editorial Fashion Noir",
    tag: "minimalista",
    aspect: "4 / 5",
    author: "Easy Builder",
    avatar: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp",
    baseVotes: 1,
    app: "Órion Pro",
    src: "/comunidade_files/thumbnail.avif",
    prompt: "High fashion editorial portrait, moody cinematic dark atmosphere, dramatic rim lighting, luxury styling, 8k resolution, ultra-detailed textures."
  },
  {
    id: "W6M3N",
    col: 1,
    index: 1,
    title: "Cyber Neon Concept",
    tag: "3D",
    aspect: "1 / 1",
    author: "IGOR OLIVEIRA",
    avatar: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg",
    baseVotes: 1,
    app: "Design Builder 1.2",
    src: "/comunidade_files/thumbnail(2).avif",
    prompt: "Futuristic neon cyberpunk character, holographic accents, octane render 3D, glowing purple and cyan volumetric lights, ray tracing."
  },
  {
    id: "UH59A",
    col: 2,
    index: 2,
    title: "Cinematic Landscape Vista",
    tag: "cinema",
    aspect: "16 / 9",
    author: "Rodrigo da Costa e Silva",
    avatar: "/comunidade_files/e39ed91061504c7c89979acbf5969a6c__avatar_rodrigo.png",
    baseVotes: 0,
    app: "REF",
    src: "/comunidade_files/thumbnail(5).avif",
    prompt: "Breathtaking wide landscape, anamorphic lens flare, moody twilight skies, atmospheric haze, epic cinematic composition, 8k wallpaper."
  },
  {
    id: "NX225",
    col: 3,
    index: 3,
    title: "Retrato Clássico Elegance",
    tag: "retrato",
    aspect: "4 / 5",
    author: "Otávio L.",
    avatar: "/comunidade_files/b7368cbd839140b3a517f60e5eaa7b0a__retrato.jpg",
    baseVotes: 0,
    app: "Hydra",
    src: "/comunidade_files/thumbnail(8).avif",
    prompt: "Fine art studio portrait, soft diffused light, natural skin tones, timeless elegance, Hasselblad medium format photography."
  },
  {
    id: "O4OTM",
    col: 4,
    index: 4,
    title: "Minimalist Brand Identity",
    tag: "social media",
    aspect: "4 / 5",
    author: "Rafael Dias",
    letter: "R",
    baseVotes: 0,
    app: "Altera Fácil",
    src: "/comunidade_files/thumbnail(10).avif",
    prompt: "Modern minimalist brand identity aesthetic, clean geometric typography, refined color palette, sleek presentation layout."
  },
  {
    id: "0C1QN",
    col: 0,
    index: 5,
    title: "Streetwear Urban Style",
    tag: "social media",
    aspect: "4 / 5",
    author: "GABRIEL UNRUH",
    letter: "G",
    baseVotes: 0,
    app: "Enhance",
    src: "/comunidade_files/thumbnail(1).avif",
    prompt: "Contemporary urban streetwear lookbook, gritty city backdrop, subtle grain, stylish modern pose, dynamic candid shot."
  },
  {
    id: "J53QK",
    col: 1,
    index: 6,
    title: "Premium Product Showcase",
    tag: "e-commerce",
    aspect: "4 / 5",
    author: "LUCAS RAMOS",
    avatar: "/comunidade_files/062aba743f9ed86b874689f9d672bcd3.png",
    baseVotes: 0,
    app: "Design Builder 1.2",
    src: "/comunidade_files/thumbnail(3).avif",
    prompt: "Commercial luxury product photography, pedestal stand, subtle reflections, soft studio lighting, sharp details, commercial advertising."
  },
  {
    id: "7AEI9",
    col: 2,
    index: 7,
    title: "Bold Creative Visual",
    tag: "evento",
    aspect: "4 / 5",
    author: "kalyston lopes",
    letter: "K",
    baseVotes: 0,
    app: "Órion Pro",
    src: "/comunidade_files/thumbnail(6).avif",
    prompt: "Creative festival poster key visual, high contrast, vibrant saturated tones, dynamic motion blur, striking graphic design."
  },
  {
    id: "UTT0T",
    col: 3,
    index: 8,
    title: "Artistic Expression Series",
    tag: "retrato",
    aspect: "4 / 5",
    author: "Paulo Bruschi",
    avatar: "/comunidade_files/4d4f36ce7b23aa112fc7cb0a83abf898.jpg",
    baseVotes: 0,
    app: "Hydra",
    src: "/comunidade_files/thumbnail(9).avif",
    prompt: "Expressive fine art portraiture, double exposure effect, organic floral textures, emotive expression, gallery showcase quality."
  },
  {
    id: "W2RZV",
    col: 4,
    index: 9,
    title: "Futuristic Vehicle Design",
    tag: "3D",
    aspect: "4 / 5",
    author: "Vitor Macedo",
    avatar: "/comunidade_files/f772121a0f63b290be9b4557f781fc11.jpg",
    baseVotes: 0,
    app: "REF",
    src: "/comunidade_files/thumbnail(11).avif",
    prompt: "Concept hypercar design, aerodynamic lines, matte black and chrome finish, wet asphalt reflections, night city speed shot."
  },
  {
    id: "IWESV",
    col: 1,
    index: 10,
    title: "Architectural Symmetry",
    tag: "minimalista",
    aspect: "4 / 5",
    author: "LUCAS RAMOS",
    avatar: "/comunidade_files/062aba743f9ed86b874689f9d672bcd3.png",
    baseVotes: 1,
    app: "Design Builder 1.2",
    src: "/comunidade_files/thumbnail(4).avif",
    prompt: "Brutalist architecture study, stark dramatic shadows, concrete texture, minimalist geometric lines, clear blue sky contrast."
  },
  {
    id: "H4WFU",
    col: 2,
    index: 11,
    title: "Criativo MS Cabine",
    tag: "social media",
    aspect: "4 / 5",
    author: "Cássio Amorim",
    avatar: "/comunidade_files/f3a16ab44e43f2b5cd45d8f10940f07f.jpg",
    baseVotes: 1,
    app: "Hydra",
    src: "/comunidade_files/thumbnail(7).avif",
    prompt: "Criativo profissional para cabine fotográfica e eventos sociais, tipografia impactante, cores vibrantes e iluminação de palco."
  }
];
