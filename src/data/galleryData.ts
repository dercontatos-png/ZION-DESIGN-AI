export interface GalleryItem {
  id: string;
  status: "done" | "generating" | "failed";
  result_url: string;
  thumbnail_url: string;
  created_at: string;
  date_formatted: string;
  agent_slug: string;
  agent_name: string;
  dimensions: string;
  aspect_ratio: string;
  ai_model: string;
  ai_provider?: string;
  generation_duration_ms?: number;
  is_favorited?: boolean;
  is_upvoted?: boolean;
  upvote_count: number;
  color_palette?: {
    ambient_color?: string;
    complementary_color?: string;
    complementary_light?: string;
  };
  form_data?: any;
  input_image_urls?: any;
  prompt?: string;
  inputs?: Array<{ title: string; src: string; fallback?: string }>;
  fallback_url?: string;
}

export const REAL_USER_GENERATIONS: GalleryItem[] = [
  {
    id: "c7d66479-2abf-4a41-8114-545418b77ff2",
    status: "done",
    result_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/results/c7d66479-2abf-4a41-8114-545418b77ff2/result.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043712Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=36332431d1af48a9c34fe6b9744269dc6780bff01ecec69522ad2f7e9838072b",
    thumbnail_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/thumbnails/c7d66479-2abf-4a41-8114-545418b77ff2/thumbnail.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043712Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=4ff3cb8900ce79b834682112a23b5f5e61d6355e47af7d4277a4983675605b38",
    fallback_url: "/vitrine/ref-builder/ref-builder-3.avif",
    created_at: "2026-09-15T05:42:56.549711Z",
    date_formatted: "15 de setembro de 2026 às 02:42",
    agent_slug: "design-builder1-2",
    agent_name: "Design Builder 1.2",
    dimensions: "4:5",
    aspect_ratio: "4/5",
    generation_duration_ms: 37282,
    ai_model: "gemini-3.1-flash-image",
    ai_provider: "openrouter",
    is_favorited: false,
    is_upvoted: false,
    upvote_count: 0,
    color_palette: {
      ambient_color: "#ca00e5",
      complementary_color: "#39ed53",
      complementary_light: "#e85700"
    },
    prompt: "Design institucional e comercial para clínica odontológica de alta tecnologia, com iluminação de estúdio refinada e paleta elegante.",
    form_data: {
      plano: "medium",
      genero: "female",
      degrade: "false",
      quality: "4K",
      dimensions: "4:5",
      quantidade: "1",
      text_blocks: [
        { type: "h1", weight: 5, content: "Tenha o Melhor Sorriso" },
        { type: "h2", weight: 3, content: "Você merece o melhor" },
        { type: "text", weight: 2, content: "" },
        { type: "bullets", weight: 2, content: "Sua autoestima sempre alta" },
        { type: "cta", weight: 4, content: "venha com a gente" }
      ],
      color_palette: {
        ambient_color: "#ca00e5",
        complementary_color: "#39ed53",
        complementary_light: "#e85700"
      },
      estilo_visual: "ultra_realistic",
      posicao_do_texto: "align-center",
      prompt_adicional: "Composição institucional limpa",
      subject_position: "right",
      scene_description: "Ambiente de clínica odontológica contemporânea",
      usar_desfoque_blur: "false",
      subject_description: "Profissional com postura confiante em ambiente clínico moderno",
      elementos_flutuantes: "",
      sobriedade_criatividade: "50"
    }
  },
  {
    id: "d4506b8c-0d67-42c9-acbe-ca370b977dc6",
    status: "done",
    result_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/results/d4506b8c-0d67-42c9-acbe-ca370b977dc6/result.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043953Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=d708fe0ff152671a7d5ef557f1cbd0dee41acbd52b91cd282aa83bedd743a50e",
    thumbnail_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/thumbnails/d4506b8c-0d67-42c9-acbe-ca370b977dc6/thumbnail.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043953Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=bf79266ffa1b30d593320fe646912cb4690f343e4c3bf8ce981b3cd0e9476e34",
    fallback_url: "/vitrine/hydra/hydra-fotografia-1.avif",
    created_at: "2026-09-15T05:19:33.670058Z",
    date_formatted: "15 de setembro de 2026 às 02:19",
    agent_slug: "design-builder1-2",
    agent_name: "Design Builder 1.2",
    dimensions: "4:5",
    aspect_ratio: "4/5",
    generation_duration_ms: 39139,
    ai_model: "gemini-3.1-flash-image",
    ai_provider: "openrouter",
    is_favorited: false,
    is_upvoted: false,
    upvote_count: 0,
    prompt: "Composição visual de alto impacto com foco em design moderno, iluminação dramática e texturas ultra-realistas.",
    form_data: {
      dimensions: "4:5",
      estilo_visual: "ultra_realistic",
      sobriedade_criatividade: "50"
    }
  },
  {
    id: "b3acaa14-a197-4996-9db8-907954e4561d",
    status: "done",
    result_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/results/b3acaa14-a197-4996-9db8-907954e4561d/result.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043953Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=53ccfff3c6a26df2893ab093ebed615eb7f8a35e01487627c98d4a0dd4e993b6",
    thumbnail_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/thumbnails/b3acaa14-a197-4996-9db8-907954e4561d/thumbnail.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043953Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=f6b9b67e0a02327c101eba4b06102b1e4c52ed3993c4bcd246bcb39b771e0bfe",
    fallback_url: "/vitrine/orion/orion-1.avif",
    created_at: "2026-09-13T01:50:12.522818Z",
    date_formatted: "12 de setembro de 2026 às 22:50",
    agent_slug: "orion-pro",
    agent_name: "Órion Pro",
    dimensions: "4:5",
    aspect_ratio: "4/5",
    generation_duration_ms: 46552,
    ai_model: "gemini-3.1-flash-image",
    ai_provider: "openrouter",
    is_favorited: false,
    is_upvoted: false,
    upvote_count: 0,
    prompt: "Arte publicitária criada com Órion Pro com foco em identidade de marca e estética visual futurista.",
    form_data: {
      category: "Pessoa",
      dimensions: "4:5",
      sobriedade_criatividade: "10"
    }
  },
  {
    id: "6c01bbd7-c8d2-4442-b272-50c470824a4f",
    status: "done",
    result_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/results/6c01bbd7-c8d2-4442-b272-50c470824a4f/result.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043842Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=2a234d7024f907004614570101ee81202dd3142e3fdfb7468f90fe508158a568",
    thumbnail_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/thumbnails/6c01bbd7-c8d2-4442-b272-50c470824a4f/thumbnail.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043842Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=4db967aac08e539baeda34199ff1675e111377875b35a134a620cb1737fea108",
    fallback_url: "/vitrine/ref-builder/ref-builder-1.avif",
    created_at: "2026-09-07T23:10:23.674463Z",
    date_formatted: "07 de setembro de 2026 às 20:10",
    agent_slug: "ref-builder",
    agent_name: "Ref",
    dimensions: "9:16",
    aspect_ratio: "9/16",
    generation_duration_ms: 144084,
    ai_model: "gemini-3.1-flash-image",
    ai_provider: "openrouter",
    is_favorited: false,
    is_upvoted: false,
    upvote_count: 0,
    prompt: "Story vertical de alta resolução com composição estética de referência, iluminação cinematográfica de estúdio.",
    form_data: {
      dimensions: "9:16",
      sobriedade_criatividade: "50"
    }
  },
  {
    id: "08de7540-386a-4458-a62c-0e6a16828c0e",
    status: "done",
    result_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/results/08de7540-386a-4458-a62c-0e6a16828c0e/result.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043842Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=d0767c390d73117d2b3fc6d9de92578b58e81eddc6710e570390ee374e48efb2",
    thumbnail_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/thumbnails/08de7540-386a-4458-a62c-0e6a16828c0e/thumbnail.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043842Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=6390bb953c2b4c703dd9f7da98cccefa43cc6fbbccfeba1a3f6bd141adfcd153",
    fallback_url: "/vitrine/ref-builder/ref-builder-2.avif",
    created_at: "2026-09-05T20:12:25.210272Z",
    date_formatted: "05 de setembro de 2026 às 17:12",
    agent_slug: "ref-builder",
    agent_name: "Ref",
    dimensions: "4:5",
    aspect_ratio: "4/5",
    generation_duration_ms: 40014,
    ai_model: "gemini-3.1-flash-image",
    ai_provider: "openrouter",
    is_favorited: false,
    is_upvoted: false,
    upvote_count: 0,
    prompt: "Composição harmônica gerada por referências múltiplas de sujeito, iluminação e estilo fotográfico editorial.",
    form_data: {
      dimensions: "4:5",
      sobriedade_criatividade: "50"
    }
  },
  {
    id: "b46f3712-ae81-4712-91f8-2144fb10fb4c",
    status: "done",
    result_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/results/b46f3712-ae81-4712-91f8-2144fb10fb4c/result.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043842Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=bc335b26aef7956bc351b1b99b6ede0dfd975fdd78c80f172cb8bc5a4b7aa01c",
    thumbnail_url: "https://9b5acaa4fb5a7649b098778a4320abc3.r2.cloudflarestorage.com/designbuilder/thumbnails/b46f3712-ae81-4712-91f8-2144fb10fb4c/thumbnail.avif?response-cache-control=private%2C%20max-age%3D3600%2C%20immutable&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=be47a75ab606639bad00e60c1e0b22aa%2F20260916%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260916T043842Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=342e8f4cfc46b4f0090d338d5beb96d4d146d0f3ce09e6d81ed5dd40ce298122",
    fallback_url: "/vitrine/ref-builder/ref-builder-3.avif",
    created_at: "2026-09-05T18:07:54.657401Z",
    date_formatted: "05 de setembro de 2026 às 15:07",
    agent_slug: "ref-builder",
    agent_name: "Ref",
    dimensions: "1:1",
    aspect_ratio: "1/1",
    generation_duration_ms: 31009,
    ai_model: "gemini-3.1-flash-image",
    ai_provider: "openrouter",
    is_favorited: false,
    is_upvoted: false,
    upvote_count: 0,
    prompt: "Feed quadrado 1:1 com proporções perfeitas para anúncio com sujeito em destaque e acabamento de alto nível.",
    form_data: {
      dimensions: "1:1",
      sobriedade_criatividade: "50"
    }
  }
];
