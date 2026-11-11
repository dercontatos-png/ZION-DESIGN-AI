import fs from "fs";
import path from "path";
import os from "os";
import { uploadToR2, downloadFromR2, isR2Active } from "./r2StorageService";

export interface CommunityPost {
  id: string;
  title: string;
  prompt: string;
  image_url: string;
  thumbnail_url: string;
  src: string;
  aspect: string; // "9 / 16" | "4 / 5" | "1 / 1" | "16 / 9"
  dimensions: string; // "9:16" | "4:5" | "1:1" | "16:9"
  tag: string;
  app: string;
  agent_slug: string;
  author: string;
  autor: {
    nome: string;
    avatar_url: string;
    instagram?: string;
    country?: string;
  };
  upvote_count: number;
  baseVotes: number;
  published_at: string;
  createdAt: string;
  community_moderation_status: "active" | "flagged";
}

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NOW_REGION
);

const LOCAL_STORAGE_DIR = isServerless
  ? path.join(os.tmpdir(), "zion_storage")
  : path.resolve(process.cwd(), "local_storage");

const COMMUNITY_FILE = path.join(LOCAL_STORAGE_DIR, "community_posts.json");
const R2_COMMUNITY_KEY = "system/community_posts.json";

function ensureDirExists(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (_) {}
}

// Catálogo base de sementes globais com artes do mundo todo
const SEED_AUTHORS = [
  { nome: "Lucas Mendes", country: "🇧🇷 Brasil", avatar: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp" },
  { nome: "Sophie Laurent", country: "🇫🇷 França", avatar: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg" },
  { nome: "Kenji Sato", country: "🇯🇵 Japão", avatar: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp" },
  { nome: "Mateo Rossi", country: "🇮🇹 Itália", avatar: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg" },
  { nome: "Camila Duarte", country: "🇧🇷 Brasil", avatar: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp" },
  { nome: "David Vance", country: "🇺🇸 Estados Unidos", avatar: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg" },
  { nome: "Elena Rostova", country: "🇬🇧 Reino Unido", avatar: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp" },
  { nome: "Arthur Lima", country: "🇧🇷 Brasil", avatar: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg" }
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: "CP_BURGER_01",
    title: "Smash Burger Artesanal Gourmet",
    prompt: "Commercial food photography of a juicy double smash burger with melted cheddar cheese dripping, crispy bacon strips, black brioche bun, flying sesame seeds, dramatic dark moody background, dynamic warm rim lights, condensation on beer glass in background, 8k resolution, photorealistic master shot.",
    image_url: "/1_files/1-1.avif",
    thumbnail_url: "/1_files/1-1.avif",
    src: "/1_files/1-1.avif",
    aspect: "4 / 5",
    dimensions: "4:5",
    tag: "alimentação",
    app: "Ref Builder",
    agent_slug: "ref-builder",
    author: "Lucas Mendes · 🇧🇷 Brasil",
    autor: {
      nome: "Lucas Mendes",
      avatar_url: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp",
      instagram: "@lucas_design",
      country: "Brasil"
    },
    upvote_count: 342,
    baseVotes: 342,
    published_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_FASHION_02",
    title: "Editorial Streetwear Cyber Neon",
    prompt: "High-end fashion editorial, futuristic streetwear model wearing reflective holographic puffer jacket, neon cyberpunk city alleyway at night, wet asphalt reflections, magenta and cyan rim light, cinematic anamorphic lens flare, sharp eyes, hyperdetailed 8k.",
    image_url: "/1_files/2-1.avif",
    thumbnail_url: "/1_files/2-1.avif",
    src: "/1_files/2-1.avif",
    aspect: "9 / 16",
    dimensions: "9:16",
    tag: "moda",
    app: "Zion Design V2",
    agent_slug: "design-builder-v2",
    author: "Sophie Laurent · 🇫🇷 França",
    autor: {
      nome: "Sophie Laurent",
      avatar_url: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg",
      instagram: "@sophie_paris",
      country: "França"
    },
    upvote_count: 512,
    baseVotes: 512,
    published_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_OPTICA_03",
    title: "Ótica & Relojoaria Elegance Prime",
    prompt: "Luxury eyewear and watch advertising poster, elegant doctor and stylish female model wearing titanium designer glasses, sophisticated gold and black aesthetic, studio lighting, bokeh reflections, clean modern typography zone, 8k commercial quality.",
    image_url: "/1_files/3-1.avif",
    thumbnail_url: "/1_files/3-1.avif",
    src: "/1_files/3-1.avif",
    aspect: "4 / 5",
    dimensions: "4:5",
    tag: "minimalista",
    app: "Ref Builder",
    agent_slug: "ref-builder",
    author: "Camila Duarte · 🇧🇷 Brasil",
    autor: {
      nome: "Camila Duarte",
      avatar_url: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp",
      instagram: "@camiladuarte_art",
      country: "Brasil"
    },
    upvote_count: 289,
    baseVotes: 289,
    published_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_FITNESS_04",
    title: "Black Edition Suplementos & Gym",
    prompt: "Dark aesthetic bodybuilding and crossfit athlete performing heavy deadlift, dynamic chalk dust explosion in air, dramatic top spot light, intense muscle vascularity, high contrast shadows, metallic gold typography highlights, sports commercial poster 8k.",
    image_url: "/1_files/1-2.avif",
    thumbnail_url: "/1_files/1-2.avif",
    src: "/1_files/1-2.avif",
    aspect: "9 / 16",
    dimensions: "9:16",
    tag: "esportes",
    app: "Órion Pro",
    agent_slug: "orion-pro",
    author: "David Vance · 🇺🇸 Estados Unidos",
    autor: {
      nome: "David Vance",
      avatar_url: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg",
      instagram: "@vance_creative",
      country: "Estados Unidos"
    },
    upvote_count: 420,
    baseVotes: 420,
    published_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_SUSHI_05",
    title: "Festival Sushi Fusion & Omakase",
    prompt: "Premium Japanese sushi platter with torched salmon nigiri, gold leaf garnish, flying caviar drops, dark slate stone texture, delicate bamboo steamer vapor smoke, cherry blossom petals, macro food photography, Hasselblad 100MP detail.",
    image_url: "/1_files/2-2.avif",
    thumbnail_url: "/1_files/2-2.avif",
    src: "/1_files/2-2.avif",
    aspect: "1 / 1",
    dimensions: "1:1",
    tag: "alimentação",
    app: "Altera Fácil",
    agent_slug: "altera-facil",
    author: "Kenji Sato · 🇯🇵 Japão",
    autor: {
      nome: "Kenji Sato",
      avatar_url: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp",
      instagram: "@kenji_omakase",
      country: "Japão"
    },
    upvote_count: 630,
    baseVotes: 630,
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_PARTY_06",
    title: "Sunset Summer Sunset Music Festival",
    prompt: "Electronic dance music festival mainstage concert poster, massive crowd cheering with hands in the air, laser light show, pyrotechnics fireworks, sunset golden hour horizon, deep purple and orange color grading, festival flyer design 8k.",
    image_url: "/1_files/3-2.avif",
    thumbnail_url: "/1_files/3-2.avif",
    src: "/1_files/3-2.avif",
    aspect: "9 / 16",
    dimensions: "9:16",
    tag: "eventos",
    app: "Hydra Builder",
    agent_slug: "hydra",
    author: "Mateo Rossi · 🇮🇹 Itália",
    autor: {
      nome: "Mateo Rossi",
      avatar_url: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg",
      instagram: "@rossi_events",
      country: "Itália"
    },
    upvote_count: 785,
    baseVotes: 785,
    published_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_AUTO_07",
    title: "Porsche GT3 RS Speed & Precision",
    prompt: "Commercial automotive advertising for Porsche 911 GT3 RS, parked on slick wet asphalt circuit track at dawn, mist and tire smoke rolling off rear spoiler, aggressive LED headlights glowing, carbon fiber details, cinematic car commercial 8k.",
    image_url: "/1_files/1-3.avif",
    thumbnail_url: "/1_files/1-3.avif",
    src: "/1_files/1-3.avif",
    aspect: "16 / 9",
    dimensions: "16:9",
    tag: "automotivo",
    app: "Ref Builder",
    agent_slug: "ref-builder",
    author: "Arthur Lima · 🇧🇷 Brasil",
    autor: {
      nome: "Arthur Lima",
      avatar_url: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp",
      instagram: "@arthur_motion",
      country: "Brasil"
    },
    upvote_count: 914,
    baseVotes: 914,
    published_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    community_moderation_status: "active"
  },
  {
    id: "CP_PODCAST_08",
    title: "The Tech Vision Podcast Cover",
    prompt: "Modern professional podcast cover art, charismatic tech host with Shure SM7B studio microphone, acoustic foam studio backdrop, glowing violet and amber ambient tube lights, clean modern layout, 3d typography zone, hyperrealistic studio photography.",
    image_url: "/1_files/2-3.avif",
    thumbnail_url: "/1_files/2-3.avif",
    src: "/1_files/2-3.avif",
    aspect: "1 / 1",
    dimensions: "1:1",
    tag: "social media",
    app: "Órion Pro",
    agent_slug: "orion-pro",
    author: "Elena Rostova · 🇬🇧 Reino Unido",
    autor: {
      nome: "Elena Rostova",
      avatar_url: "/comunidade_files/f205c77e149854d68507fb93daedf1fb.jpg",
      instagram: "@elena_sound",
      country: "Reino Unido"
    },
    upvote_count: 367,
    baseVotes: 367,
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    community_moderation_status: "active"
  }
];

let memoryCommunityCache: CommunityPost[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 10000; // 10 segundos

/**
 * Carrega todos os posts da comunidade (Memória -> Disco -> R2 -> Sementes)
 */
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const now = Date.now();
  if (memoryCommunityCache && now - lastCacheTime < CACHE_TTL) {
    return memoryCommunityCache;
  }

  // 1. Tentar ler do Cloudflare R2
  if (isR2Active()) {
    try {
      const r2Obj = await downloadFromR2(R2_COMMUNITY_KEY);
      if (r2Obj && r2Obj.body) {
        const parsed = JSON.parse(r2Obj.body.toString("utf8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCommunityCache = parsed;
          lastCacheTime = now;
          return parsed;
        }
      }
    } catch (_) {}
  }

  // 2. Tentar ler do disco local
  if (fs.existsSync(COMMUNITY_FILE)) {
    try {
      const data = fs.readFileSync(COMMUNITY_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCommunityCache = parsed;
        lastCacheTime = now;
        return parsed;
      }
    } catch (_) {}
  }

  // 3. Fallback inicial com sementes
  memoryCommunityCache = [...SEED_POSTS];
  lastCacheTime = now;
  saveCommunityPosts(memoryCommunityCache).catch(() => {});
  return memoryCommunityCache;
}

/**
 * Salva a lista de posts no disco local e sincroniza com Cloudflare R2
 */
export async function saveCommunityPosts(posts: CommunityPost[]): Promise<void> {
  memoryCommunityCache = posts;
  lastCacheTime = Date.now();

  try {
    ensureDirExists(COMMUNITY_FILE);
    fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch (err) {
    console.error("[Community] Erro ao gravar local:", err);
  }

  if (isR2Active()) {
    try {
      await uploadToR2(
        R2_COMMUNITY_KEY,
        Buffer.from(JSON.stringify(posts), "utf8"),
        "application/json"
      );
    } catch (err) {
      console.error("[Community] Erro ao sincronizar com Cloudflare R2:", err);
    }
  }
}

/**
 * Publica uma nova arte no Feed Global em tempo real
 */
export async function publishCommunityPost(data: {
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
  app?: string;
  authorName?: string;
  authorEmail?: string;
  tag?: string;
}): Promise<CommunityPost> {
  const posts = await getCommunityPosts();
  const id = `CP_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const aspect = (data.aspectRatio || "9:16").replace(":", " / ");
  const dimensions = data.aspectRatio || "9:16";

  const appName = data.app === "ref" ? "Ref Builder" : data.app === "orion-pro" ? "Órion Pro" : data.app === "altera-facil" ? "Altera Fácil" : data.app === "hydra" ? "Hydra" : "Zion Design";
  const author = data.authorName || (data.authorEmail ? data.authorEmail.split("@")[0] : "Criador Zion");

  const newPost: CommunityPost = {
    id,
    title: (data.prompt || "Nova Arte Oficial").substring(0, 40) + "...",
    prompt: data.prompt,
    image_url: data.imageUrl,
    thumbnail_url: data.imageUrl,
    src: data.imageUrl,
    aspect,
    dimensions,
    tag: data.tag || "destaque",
    app: appName,
    agent_slug: data.app || "ref",
    author: `${author} · 🌐 Global`,
    autor: {
      nome: author,
      avatar_url: "/comunidade_files/7fb12cf205c84d5993b6ea0aeaaa60ba__image_300.webp",
      country: "Global"
    },
    upvote_count: 1,
    baseVotes: 1,
    published_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    community_moderation_status: "active"
  };

  // Adiciona no topo do feed global
  const updated = [newPost, ...posts];
  await saveCommunityPosts(updated);

  return newPost;
}

/**
 * Votar / Curtir um post no Feed
 */
export async function upvoteCommunityPost(id: string): Promise<number> {
  const posts = await getCommunityPosts();
  const target = posts.find((p) => p.id === id);
  if (!target) return 0;

  target.upvote_count = (target.upvote_count || 0) + 1;
  target.baseVotes = target.upvote_count;
  await saveCommunityPosts(posts);

  return target.upvote_count;
}
