export interface HydraCategory {
  id: string;
  name: string;
  sub: string;
  img?: string;
}

export interface HydraStyleCard {
  id: string;
  title: string;
  category: string;
  src: string;
  aspect?: string;
  tags: string[];
  isCurated?: boolean;
  isPopular?: boolean;
  isRecent?: boolean;
}

export const HYDRA_CATEGORIES: HydraCategory[] = [
  { id: "todos", name: "Todos", sub: "Todas as inspirações" },
  { id: "produto", name: "Produto", sub: "E-commerce, catálogo, packshot", img: "/3_files/a977564506e1224959235a016eae670d.jpg" },
  { id: "criativo", name: "Criativo", sub: "Banners, anúncios, peças de campanha", img: "/3_files/8ca5a25382cbc18ee673e5934d98f4ff.jpg" },
  { id: "thumbnail", name: "Thumbnail", sub: "Capas YouTube, blog, podcast", img: "/3_files/5a3cff9fd6ce979bf386e5d9cceea9ae.jpg" },
  { id: "post-social", name: "Post Social", sub: "Feed, stories, reels, carrosséis", img: "/3_files/0b9947ecacae791397339c63892b0786.png" },
  { id: "retrato", name: "Retrato", sub: "Headshot, fashion, editorial com pessoa", img: "/3_files/27e5a80025074a75608e084a0ecdb0fc.jpg" },
  { id: "mockup", name: "Mockup", sub: "Embalagens e frascos 3D", img: "/3_files/be4ac59853228fff32ba689579085bc0.jpg" },
  { id: "gastronomia", name: "Gastronomia", sub: "Pratos, drinks e delícias", img: "/3_files/e773d1a72ad06e009db728098ab41965.jpg" },
  { id: "esportes", name: "Esportes", sub: "Fitness, vestuário e atletas", img: "/3_files/02ee62630ec60d828bdb4c3679b78344.jpg" },
  { id: "moda", name: "Moda", sub: "Lookbook, acessórios e alfaiataria", img: "/3_files/ce28af2da9b97201679feee407e7f805.jpg" },
  { id: "capa-livro", name: "Capa de Livro", sub: "Livros e design editorial", img: "/3_files/cb2617c00318d88eebe4deab22531bd7.jpg" },
  { id: "banner-web", name: "Banner Web", sub: "E-commerce e landing pages", img: "/3_files/1023d73c9ce6cf35e05f7f7caa13072f.jpg" },
  { id: "ilustracao", name: "Ilustração", sub: "Conceitual e digital", img: "/3_files/75b09c5f1e33aec5b3e9161b26f44271.jpg" },
];

export const HYDRA_STYLE_CARDS: HydraStyleCard[] = [
  {
    "id": "hydra_card_1",
    "title": "Packshot Comercial Minimalista",
    "category": "produto",
    "src": "/3_files/a977564506e1224959235a016eae670d.jpg",
    "aspect": "1350 / 1688",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_2",
    "title": "Campanha Publicitária Bold",
    "category": "criativo",
    "src": "/3_files/8ca5a25382cbc18ee673e5934d98f4ff.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_3",
    "title": "Thumbnail Podcast Profissional",
    "category": "thumbnail",
    "src": "/3_files/5a3cff9fd6ce979bf386e5d9cceea9ae.jpg",
    "aspect": "1200 / 1500",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_4",
    "title": "Post Feed Moda Contemporânea",
    "category": "post-social",
    "src": "/3_files/0b9947ecacae791397339c63892b0786.png",
    "aspect": "600 / 1050",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_5",
    "title": "Fotografia Golden Hour",
    "category": "retrato",
    "src": "/3_files/27e5a80025074a75608e084a0ecdb0fc.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_6",
    "title": "Caixa Produto Luxury",
    "category": "mockup",
    "src": "/3_files/be4ac59853228fff32ba689579085bc0.jpg",
    "aspect": "720 / 1600",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_7",
    "title": "Burger Artesanal Rústico",
    "category": "gastronomia",
    "src": "/3_files/e773d1a72ad06e009db728098ab41965.jpg",
    "aspect": "1440 / 1920",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_8",
    "title": "Fitness Lifestyle Urbano",
    "category": "esportes",
    "src": "/3_files/02ee62630ec60d828bdb4c3679b78344.jpg",
    "aspect": "1086 / 1448",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_9",
    "title": "Lookbook Alfaiataria Moderna",
    "category": "moda",
    "src": "/3_files/ce28af2da9b97201679feee407e7f805.jpg",
    "aspect": "3316 / 4096",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_10",
    "title": "Capa Livro Tipografia Elegante",
    "category": "capa-livro",
    "src": "/3_files/cb2617c00318d88eebe4deab22531bd7.jpg",
    "aspect": "736 / 1308",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_11",
    "title": "Banner Promocional Black Week",
    "category": "banner-web",
    "src": "/3_files/1023d73c9ce6cf35e05f7f7caa13072f.jpg",
    "aspect": "1080 / 1343",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_12",
    "title": "Arte Digital Conceitual",
    "category": "ilustracao",
    "src": "/3_files/75b09c5f1e33aec5b3e9161b26f44271.jpg",
    "aspect": "1350 / 1688",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_13",
    "title": "Display de Cosméticos Studio",
    "category": "produto",
    "src": "/3_files/d58dd71bba16e18863929a96caa06bfe.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_14",
    "title": "Design Futurista High-Tech",
    "category": "criativo",
    "src": "/3_files/4f4e016758a7e535f65da015beb39721.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_15",
    "title": "Capa Vídeo Impactante",
    "category": "thumbnail",
    "src": "/3_files/8e40e2908f1bfbff50c91d8e88488b8c.png",
    "aspect": "1755 / 3120",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_16",
    "title": "Post Social Minimalista",
    "category": "post-social",
    "src": "/3_files/33c24115faad2c3f2f43d1dd56a7baae.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_17",
    "title": "Retrato Fotográfico Editorial",
    "category": "retrato",
    "src": "/3_files/c8192cb325a4283152054af57f2e8327.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_18",
    "title": "Mockup Frasco Vidro 3D",
    "category": "mockup",
    "src": "/3_files/34f427fcf92d62cb8119d89f46819846.png",
    "aspect": "1125 / 1398",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_19",
    "title": "Drink Tropical Artesanal",
    "category": "gastronomia",
    "src": "/3_files/80cb19fea9e65cf2a83da494085f1d3a.jpg",
    "aspect": "720 / 1280",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_20",
    "title": "Vestuário Esportivo Dinâmico",
    "category": "esportes",
    "src": "/3_files/cfcd40dc566c817b1bb0f52f80ea1423.png",
    "aspect": "1080 / 1920",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_21",
    "title": "Acessórios e Joias Close-up",
    "category": "moda",
    "src": "/3_files/0bf695c8cb704d0f61df8bd5728ee4af.jpg",
    "aspect": "1440 / 1800",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_22",
    "title": "Layout Editorial Minimalista",
    "category": "capa-livro",
    "src": "/3_files/0a204c165a4c4aecba32b18748b2a5e0.jpg",
    "aspect": "1638 / 2048",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_23",
    "title": "Web Banner Conversão",
    "category": "banner-web",
    "src": "/3_files/3b53154ba50402efb217500f206056ec.jpg",
    "aspect": "564 / 752",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_24",
    "title": "Ilustração Flat Design",
    "category": "ilustracao",
    "src": "/3_files/d24b7475da2714c165d706fc1d07fea4.jpg",
    "aspect": "720 / 1280",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_25",
    "title": "Packshot Comercial Minimalista",
    "category": "produto",
    "src": "/3_files/9fcdddfda92013ba13bbc5757f4fcd09.jpg",
    "aspect": "1152 / 2048",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_26",
    "title": "Campanha Publicitária Bold",
    "category": "criativo",
    "src": "/3_files/9e03acaa8d2b30b860a3ef427153e19f.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_27",
    "title": "Thumbnail Podcast Profissional",
    "category": "thumbnail",
    "src": "/3_files/1f190ce8d2d0446b9ae46bca3c76079b.png",
    "aspect": "1080 / 1920",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_28",
    "title": "Post Feed Moda Contemporânea",
    "category": "post-social",
    "src": "/3_files/66d48b9970ca470725decc7f34431245.jpg",
    "aspect": "1638 / 2048",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_29",
    "title": "Fotografia Golden Hour",
    "category": "retrato",
    "src": "/3_files/a14e30ac2ff589d1fe01081273769e0d.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_30",
    "title": "Caixa Produto Luxury",
    "category": "mockup",
    "src": "/3_files/ee2c73167ff05ce2ff9e71ddfa5dd735.jpg",
    "aspect": "720 / 1280",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_31",
    "title": "Burger Artesanal Rústico",
    "category": "gastronomia",
    "src": "/3_files/99e0434962d59f46d198029107735c2c.webp",
    "aspect": "1080 / 1920",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_32",
    "title": "Fitness Lifestyle Urbano",
    "category": "esportes",
    "src": "/3_files/247cc445e89ca13ac70ebf34320c18e7.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_33",
    "title": "Lookbook Alfaiataria Moderna",
    "category": "moda",
    "src": "/3_files/8b8ea57da60102de7aa1c6f46f3b42de.jpg",
    "aspect": "675 / 1200",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_34",
    "title": "Capa Livro Tipografia Elegante",
    "category": "capa-livro",
    "src": "/3_files/81ea89a9ee7d343ab84033a5649a31ba.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_35",
    "title": "Banner Promocional Black Week",
    "category": "banner-web",
    "src": "/3_files/fc2717950e15a29ad1390845d248b77e.jpg",
    "aspect": "720 / 1280",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_36",
    "title": "Arte Digital Conceitual",
    "category": "ilustracao",
    "src": "/3_files/05a96e04d447ad3826125ff8e79ef5f4.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_37",
    "title": "Display de Cosméticos Studio",
    "category": "produto",
    "src": "/3_files/85836dc5be1d3f82a84eb419ad9295b8.jpg",
    "aspect": "608 / 1080",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_38",
    "title": "Design Futurista High-Tech",
    "category": "criativo",
    "src": "/3_files/7fdcf2f0aebc642eec3973c3a5ba297f.jpg",
    "aspect": "3686 / 6550",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_39",
    "title": "Capa Vídeo Impactante",
    "category": "thumbnail",
    "src": "/3_files/188b5e8b471ada4a020b9b8d4d0eb3fd.jpg",
    "aspect": "3300 / 4096",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_40",
    "title": "Post Social Minimalista",
    "category": "post-social",
    "src": "/3_files/ed627a67695335e8fc459cddebf2f50e.png",
    "aspect": "2295 / 2869",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_41",
    "title": "Retrato Fotográfico Editorial",
    "category": "retrato",
    "src": "/3_files/91045c85f9f22ac7d77e2f692586843e.png",
    "aspect": "2160 / 2880",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_42",
    "title": "Mockup Frasco Vidro 3D",
    "category": "mockup",
    "src": "/3_files/1740f3855ba64d9bbb96f62c9993e55c.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_43",
    "title": "Drink Tropical Artesanal",
    "category": "gastronomia",
    "src": "/3_files/529de0f5bfb999359eb16ee2867e8ffb.jpg",
    "aspect": "810 / 1080",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_44",
    "title": "Vestuário Esportivo Dinâmico",
    "category": "esportes",
    "src": "/3_files/c4ff4a3c4f46e9a02bc99cea7ffbb16f.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_45",
    "title": "Acessórios e Joias Close-up",
    "category": "moda",
    "src": "/3_files/de9bc2e0ee293afafecdb9e1d6a99243.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_46",
    "title": "Layout Editorial Minimalista",
    "category": "capa-livro",
    "src": "/3_files/f8bb5f6a142b2b54026b969529bfb684.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_47",
    "title": "Web Banner Conversão",
    "category": "banner-web",
    "src": "/3_files/682ac7f568baf580035383287014e6fa.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_48",
    "title": "Ilustração Flat Design",
    "category": "ilustracao",
    "src": "/3_files/2314134cf9e0827545f0d016dd57c50b.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_49",
    "title": "Packshot Comercial Minimalista",
    "category": "produto",
    "src": "/3_files/1ea6863fe075abc1baf8fe51f1ed88c1.jpg",
    "aspect": "736 / 920",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_50",
    "title": "Campanha Publicitária Bold",
    "category": "criativo",
    "src": "/3_files/38d4c6af1924d28f7920c0407577e0a3.jpg",
    "aspect": "1152 / 2048",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_51",
    "title": "Thumbnail Podcast Profissional",
    "category": "thumbnail",
    "src": "/3_files/35e4177f3a30b4934e04e0e0743cae6f.jpg",
    "aspect": "600 / 750",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_52",
    "title": "Post Feed Moda Contemporânea",
    "category": "post-social",
    "src": "/3_files/46522b0c95c6a02ca0a6d5db525805a8.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_53",
    "title": "Fotografia Golden Hour",
    "category": "retrato",
    "src": "/3_files/f4bed37c5ebd6d0a3723efdfca991c11.jpg",
    "aspect": "3277 / 4096",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_54",
    "title": "Caixa Produto Luxury",
    "category": "mockup",
    "src": "/3_files/4cc0352032fff6199f88cc3e443f3813.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_55",
    "title": "Burger Artesanal Rústico",
    "category": "gastronomia",
    "src": "/3_files/a4b459518297e82cc53c33986a875680.jpg",
    "aspect": "474 / 842",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_56",
    "title": "Fitness Lifestyle Urbano",
    "category": "esportes",
    "src": "/3_files/a5b3df6d7008c69d035aaf1a921ae00b.png",
    "aspect": "2304 / 4096",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_57",
    "title": "Lookbook Alfaiataria Moderna",
    "category": "moda",
    "src": "/3_files/e4c38c2986e1e87170aebd891d889882.jpg",
    "aspect": "960 / 1200",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_58",
    "title": "Capa Livro Tipografia Elegante",
    "category": "capa-livro",
    "src": "/3_files/875e0bc41fc65c2fe019f103af79f082.jpg",
    "aspect": "1440 / 1800",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_59",
    "title": "Banner Promocional Black Week",
    "category": "banner-web",
    "src": "/3_files/e8540a2897142ad000fc22a448480ee0.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_60",
    "title": "Arte Digital Conceitual",
    "category": "ilustracao",
    "src": "/3_files/512d5149131618cba0c6c76882375f5a.jpg",
    "aspect": "736 / 1308",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_61",
    "title": "Display de Cosméticos Studio",
    "category": "produto",
    "src": "/3_files/3ba4fcf4d50a8e7d8b8c7e5258252ae7.png",
    "aspect": "1080 / 1920",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_62",
    "title": "Design Futurista High-Tech",
    "category": "criativo",
    "src": "/3_files/d418242a6fa2b32d88ca855e2bc77dd8.png",
    "aspect": "720 / 1280",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_63",
    "title": "Capa Vídeo Impactante",
    "category": "thumbnail",
    "src": "/3_files/3ea9c0ee1f926bdf3302aed10c5d98d2.jpg",
    "aspect": "720 / 1280",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_64",
    "title": "Post Social Minimalista",
    "category": "post-social",
    "src": "/3_files/def8dc16861d3b1186f8c191cc845b49.png",
    "aspect": "600 / 750",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_65",
    "title": "Retrato Fotográfico Editorial",
    "category": "retrato",
    "src": "/3_files/e715cc7771735e49226ae700e67688cd.png",
    "aspect": "600 / 1067",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_66",
    "title": "Mockup Frasco Vidro 3D",
    "category": "mockup",
    "src": "/3_files/dc1a7539b2f470aeb20766ce3c6c3e41.png",
    "aspect": "1170 / 2532",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_67",
    "title": "Drink Tropical Artesanal",
    "category": "gastronomia",
    "src": "/3_files/3870ad734cb2f41825ba32898e84a971.jpg",
    "aspect": "810 / 1080",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_68",
    "title": "Vestuário Esportivo Dinâmico",
    "category": "esportes",
    "src": "/3_files/bcf65d9e9baf6ff3d2060563cc342fde.jpg",
    "aspect": "1350 / 1688",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_69",
    "title": "Acessórios e Joias Close-up",
    "category": "moda",
    "src": "/3_files/b674f32f255663a3f0152558edc63169.jpg",
    "aspect": "1080 / 1440",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_70",
    "title": "Layout Editorial Minimalista",
    "category": "capa-livro",
    "src": "/3_files/fff4b6669e4dfecda9547a6d064644c0.jpg",
    "aspect": "675 / 1200",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_71",
    "title": "Web Banner Conversão",
    "category": "banner-web",
    "src": "/3_files/3e1233ca12b6bca6fb4dad36a8d7164d.jpg",
    "aspect": "1350 / 1687",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_72",
    "title": "Ilustração Flat Design",
    "category": "ilustracao",
    "src": "/3_files/b06acaa7c0996b4ef2722137d5475535.jpg",
    "aspect": "1000 / 1500",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_73",
    "title": "Packshot Comercial Minimalista",
    "category": "produto",
    "src": "/3_files/fc885301712ddb10ee87a7ed25120b69.jpg",
    "aspect": "736 / 917",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_74",
    "title": "Campanha Publicitária Bold",
    "category": "criativo",
    "src": "/3_files/d500c392eec14bca454aa3d2105d612f.jpg",
    "aspect": "720 / 1600",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_75",
    "title": "Thumbnail Podcast Profissional",
    "category": "thumbnail",
    "src": "/3_files/db702983b20e82e2546c77d1b8d7b602.jpg",
    "aspect": "1280 / 1600",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_76",
    "title": "Post Feed Moda Contemporânea",
    "category": "post-social",
    "src": "/3_files/2cef9c8e2610f9a3d6e4b1f9bb50e135.jpg",
    "aspect": "640 / 1136",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_77",
    "title": "Fotografia Golden Hour",
    "category": "retrato",
    "src": "/3_files/0dec4e876fc1bd0c1b0799fa32860523.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_78",
    "title": "Caixa Produto Luxury",
    "category": "mockup",
    "src": "/3_files/a9a78b7ab363296a8759b28fd87b7694.jpg",
    "aspect": "1200 / 1500",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_79",
    "title": "Burger Artesanal Rústico",
    "category": "gastronomia",
    "src": "/3_files/1b8f8950e716d3947ef2ec14537e16b0.jpg",
    "aspect": "736 / 920",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_80",
    "title": "Fitness Lifestyle Urbano",
    "category": "esportes",
    "src": "/3_files/3fc3c11f2966e33d9f922a153f87c814.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_81",
    "title": "Lookbook Alfaiataria Moderna",
    "category": "moda",
    "src": "/3_files/691c97a0e3651fddc3d1483daca5722d.png",
    "aspect": "1024 / 1536",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_82",
    "title": "Capa Livro Tipografia Elegante",
    "category": "capa-livro",
    "src": "/3_files/b251772e6c0ab7f8c29c51a5180db0df.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_83",
    "title": "Banner Promocional Black Week",
    "category": "banner-web",
    "src": "/3_files/e4f875cf49577de3c74133e9f1a4bd07.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_84",
    "title": "Arte Digital Conceitual",
    "category": "ilustracao",
    "src": "/3_files/59d2296ad04535e74545402921dac4e5.png",
    "aspect": "1080 / 1350",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_85",
    "title": "Display de Cosméticos Studio",
    "category": "produto",
    "src": "/3_files/fce776df0fbb810f211eae4b2a03f75a.png",
    "aspect": "1346 / 1728",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_86",
    "title": "Design Futurista High-Tech",
    "category": "criativo",
    "src": "/3_files/7eb423cf8f139bbe67ece096a33050e7.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_87",
    "title": "Capa Vídeo Impactante",
    "category": "thumbnail",
    "src": "/3_files/5062b540b7ca32b62cfa7d8bc081168f.jpg",
    "aspect": "736 / 920",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_88",
    "title": "Post Social Minimalista",
    "category": "post-social",
    "src": "/3_files/720790434f82b112e4d7032a8c8db621.png",
    "aspect": "1000 / 5394",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_89",
    "title": "Retrato Fotográfico Editorial",
    "category": "retrato",
    "src": "/3_files/f69cda7851f335c9a9b9b6ff309d94ab.jpg",
    "aspect": "640 / 1138",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_90",
    "title": "Mockup Frasco Vidro 3D",
    "category": "mockup",
    "src": "/3_files/219b1e4cbb52ca353e92b8e4b7431fe9.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_91",
    "title": "Drink Tropical Artesanal",
    "category": "gastronomia",
    "src": "/3_files/06286712848e5de948b0923317b20e9e.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_92",
    "title": "Vestuário Esportivo Dinâmico",
    "category": "esportes",
    "src": "/3_files/676293378a0091c715c6d6ed9686144b.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_93",
    "title": "Acessórios e Joias Close-up",
    "category": "moda",
    "src": "/3_files/04c1f225683a9ea318cf224765541de9.jpg",
    "aspect": "3024 / 4032",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_94",
    "title": "Layout Editorial Minimalista",
    "category": "capa-livro",
    "src": "/3_files/a6b9ddb79a1e4f840ef4a4d91c705f04.jpg",
    "aspect": "1350 / 1688",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_95",
    "title": "Web Banner Conversão",
    "category": "banner-web",
    "src": "/3_files/f35c5165e505c316ffa2fcdd2abfa34f.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_96",
    "title": "Ilustração Flat Design",
    "category": "ilustracao",
    "src": "/3_files/b06f284dd00872be535e44fbdfa46536.jpg",
    "aspect": "675 / 1200",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_97",
    "title": "Packshot Comercial Minimalista",
    "category": "produto",
    "src": "/3_files/43459e2bd513e398dda3d80c0b34ec1f.jpg",
    "aspect": "1080 / 1920",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_98",
    "title": "Campanha Publicitária Bold",
    "category": "criativo",
    "src": "/3_files/83171de8466a283825c70373340baa14.jpg",
    "aspect": "1080 / 1346",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_99",
    "title": "Thumbnail Podcast Profissional",
    "category": "thumbnail",
    "src": "/3_files/fc66af9e57fa20db70941042ac06471d.jpg",
    "aspect": "1080 / 1350",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_100",
    "title": "Post Feed Moda Contemporânea",
    "category": "post-social",
    "src": "/3_files/thumbnail.avif",
    "aspect": "4 / 5",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_101",
    "title": "Fotografia Golden Hour",
    "category": "retrato",
    "src": "/3_files/thumbnail(1).avif",
    "aspect": "16 / 9",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_102",
    "title": "Caixa Produto Luxury",
    "category": "mockup",
    "src": "/3_files/thumbnail(2).avif",
    "aspect": "4 / 5",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_103",
    "title": "Burger Artesanal Rústico",
    "category": "gastronomia",
    "src": "/3_files/thumbnail(3).avif",
    "aspect": "9 / 16",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_104",
    "title": "Fitness Lifestyle Urbano",
    "category": "esportes",
    "src": "/3_files/thumbnail(4).avif",
    "aspect": "4 / 5",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_105",
    "title": "Lookbook Alfaiataria Moderna",
    "category": "moda",
    "src": "/3_files/thumbnail(5).avif",
    "aspect": "4 / 5",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_106",
    "title": "Capa Livro Tipografia Elegante",
    "category": "capa-livro",
    "src": "/3_files/thumbnail(6).avif",
    "aspect": "16 / 9",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_107",
    "title": "Banner Promocional Black Week",
    "category": "banner-web",
    "src": "/3_files/thumbnail(7).avif",
    "aspect": "4 / 5",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_108",
    "title": "Arte Digital Conceitual",
    "category": "ilustracao",
    "src": "/3_files/thumbnail(8).avif",
    "aspect": "9 / 16",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_109",
    "title": "Display de Cosméticos Studio",
    "category": "produto",
    "src": "/3_files/thumbnail(9).avif",
    "aspect": "4 / 5",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_110",
    "title": "Design Futurista High-Tech",
    "category": "criativo",
    "src": "/3_files/thumbnail(10).avif",
    "aspect": "4 / 5",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_111",
    "title": "Capa Vídeo Impactante",
    "category": "thumbnail",
    "src": "/3_files/thumbnail(11).avif",
    "aspect": "9 / 16",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_112",
    "title": "Post Social Minimalista",
    "category": "post-social",
    "src": "/3_files/thumbnail(12).avif",
    "aspect": "16 / 9",
    "tags": [
      "Post-social",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_113",
    "title": "Retrato Fotográfico Editorial",
    "category": "retrato",
    "src": "/3_files/thumbnail(13).avif",
    "aspect": "9 / 16",
    "tags": [
      "Retrato",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_114",
    "title": "Mockup Frasco Vidro 3D",
    "category": "mockup",
    "src": "/3_files/thumbnail(14).avif",
    "aspect": "4 / 5",
    "tags": [
      "Mockup",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_115",
    "title": "Drink Tropical Artesanal",
    "category": "gastronomia",
    "src": "/3_files/thumbnail(15).avif",
    "aspect": "4 / 5",
    "tags": [
      "Gastronomia",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_116",
    "title": "Vestuário Esportivo Dinâmico",
    "category": "esportes",
    "src": "/3_files/thumbnail(16).avif",
    "aspect": "4 / 5",
    "tags": [
      "Esportes",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_117",
    "title": "Acessórios e Joias Close-up",
    "category": "moda",
    "src": "/3_files/thumbnail(17).avif",
    "aspect": "1 / 1",
    "tags": [
      "Moda",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": true
  },
  {
    "id": "hydra_card_118",
    "title": "Layout Editorial Minimalista",
    "category": "capa-livro",
    "src": "/3_files/thumbnail(18).avif",
    "aspect": "4 / 5",
    "tags": [
      "Capa-livro",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": true,
    "isRecent": false
  },
  {
    "id": "hydra_card_119",
    "title": "Web Banner Conversão",
    "category": "banner-web",
    "src": "/3_files/thumbnail(19).avif",
    "aspect": "4 / 5",
    "tags": [
      "Banner-web",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_120",
    "title": "Ilustração Flat Design",
    "category": "ilustracao",
    "src": "/3_files/thumbnail(20).avif",
    "aspect": "16 / 9",
    "tags": [
      "Ilustracao",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_121",
    "title": "Packshot Comercial Minimalista",
    "category": "produto",
    "src": "/3_files/thumbnail(21).avif",
    "aspect": "4 / 5",
    "tags": [
      "Produto",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": true,
    "isRecent": true
  },
  {
    "id": "hydra_card_122",
    "title": "Campanha Publicitária Bold",
    "category": "criativo",
    "src": "/3_files/thumbnail(22).avif",
    "aspect": "16 / 9",
    "tags": [
      "Criativo",
      "Inspiração",
      "IA"
    ],
    "isCurated": false,
    "isPopular": false,
    "isRecent": false
  },
  {
    "id": "hydra_card_123",
    "title": "Thumbnail Podcast Profissional",
    "category": "thumbnail",
    "src": "/3_files/thumbnail(23).avif",
    "aspect": "4 / 5",
    "tags": [
      "Thumbnail",
      "Inspiração",
      "IA"
    ],
    "isCurated": true,
    "isPopular": false,
    "isRecent": false
  }
];
