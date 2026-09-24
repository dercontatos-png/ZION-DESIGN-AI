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
    "id": "664f8b25-9082-49e8-85b3-83fe656384d5",
    "status": "done",
    "result_url": "/galeria/thumbnail(1).avif",
    "thumbnail_url": "/galeria/thumbnail(1).avif",
    "fallback_url": "/galeria/thumbnail(1).avif",
    "created_at": "2026-09-15T03:18:35.246461Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "enhance-builder",
    "agent_name": "Enhance",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Enhance no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "1e7fd33d-d50c-494e-b54e-d7813b1efb2e",
    "status": "done",
    "result_url": "/galeria/thumbnail(2).avif",
    "thumbnail_url": "/galeria/thumbnail(2).avif",
    "fallback_url": "/galeria/thumbnail(2).avif",
    "created_at": "2026-09-15T03:06:29.104648Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "enhance-builder",
    "agent_name": "Enhance",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Enhance no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "3943fa3d-4754-458e-b440-934e862eaef6",
    "status": "done",
    "result_url": "/galeria/thumbnail(3).avif",
    "thumbnail_url": "/galeria/thumbnail(3).avif",
    "fallback_url": "/galeria/thumbnail(3).avif",
    "created_at": "2026-09-15T00:13:26.887589Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "orion-pro",
    "agent_name": "Órion Pro",
    "dimensions": "16:9",
    "aspect_ratio": "16/9",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Órion Pro no Studio Zion (16:9).",
    "form_data": {
      "dimensions": "16:9",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "ba01ba12-c2a0-48bf-9ef6-86c421f6f382",
    "status": "done",
    "result_url": "/galeria/thumbnail(4).avif",
    "thumbnail_url": "/galeria/thumbnail(4).avif",
    "fallback_url": "/galeria/thumbnail(4).avif",
    "created_at": "2026-09-14T21:26:59.769978Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "enhance-builder",
    "agent_name": "Enhance",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Enhance no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "f0f8abf9-86ac-4ff9-9a04-e7a2f218afc2",
    "status": "done",
    "result_url": "/galeria/thumbnail(5).avif",
    "thumbnail_url": "/galeria/thumbnail(5).avif",
    "fallback_url": "/galeria/thumbnail(5).avif",
    "created_at": "2026-09-14T21:26:59.438761Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "design-builder1-2",
    "agent_name": "Zion Design",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Zion Design no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "972435a3-0bf6-43c2-80e1-291644bd2c0d",
    "status": "done",
    "result_url": "/galeria/thumbnail(6).avif",
    "thumbnail_url": "/galeria/thumbnail(6).avif",
    "fallback_url": "/galeria/thumbnail(6).avif",
    "created_at": "2026-09-14T21:26:59.097638Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "enhance-builder",
    "agent_name": "Enhance",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Enhance no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "8abd352e-b208-472b-b3d7-2bdbf2b4768c",
    "status": "done",
    "result_url": "/galeria/thumbnail(7).avif",
    "thumbnail_url": "/galeria/thumbnail(7).avif",
    "fallback_url": "/galeria/thumbnail(7).avif",
    "created_at": "2026-09-14T21:26:58.714288Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "enhance-builder",
    "agent_name": "Enhance",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Enhance no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "5d702e51-2040-444b-b30a-529c79964bf5",
    "status": "done",
    "result_url": "/galeria/thumbnail(8).avif",
    "thumbnail_url": "/galeria/thumbnail(8).avif",
    "fallback_url": "/galeria/thumbnail(8).avif",
    "created_at": "2026-09-14T20:49:48.092773Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "9:16",
    "aspect_ratio": "9/16",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (9:16).",
    "form_data": {
      "dimensions": "9:16",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "fa64e891-5ea6-4b65-acf8-929cd062d825",
    "status": "done",
    "result_url": "/galeria/thumbnail(9).avif",
    "thumbnail_url": "/galeria/thumbnail(9).avif",
    "fallback_url": "/galeria/thumbnail(9).avif",
    "created_at": "2026-09-14T19:52:20.998853Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "orion-pro",
    "agent_name": "Órion Pro",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Órion Pro no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "bad63bc1-0276-457b-b762-6f8aeaf3c06e",
    "status": "done",
    "result_url": "/galeria/thumbnail(10).avif",
    "thumbnail_url": "/galeria/thumbnail(10).avif",
    "fallback_url": "/galeria/thumbnail(10).avif",
    "created_at": "2026-09-14T19:50:57.365804Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "orion-pro",
    "agent_name": "Órion Pro",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Órion Pro no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "4465798d-a803-444b-9824-752545eb04a9",
    "status": "done",
    "result_url": "/galeria/thumbnail(11).avif",
    "thumbnail_url": "/galeria/thumbnail(11).avif",
    "fallback_url": "/galeria/thumbnail(11).avif",
    "created_at": "2026-09-14T19:14:25.940859Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "1:1",
    "aspect_ratio": "1/1",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (1:1).",
    "form_data": {
      "dimensions": "1:1",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "2a6fc9ae-f040-41a7-b399-274a26863aff",
    "status": "done",
    "result_url": "/galeria/thumbnail(12).avif",
    "thumbnail_url": "/galeria/thumbnail(12).avif",
    "fallback_url": "/galeria/thumbnail(12).avif",
    "created_at": "2026-09-14T15:10:16.487840Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "9:16",
    "aspect_ratio": "9/16",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (9:16).",
    "form_data": {
      "dimensions": "9:16",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "d9c93537-8008-4461-90a6-593faacba1c1",
    "status": "done",
    "result_url": "/galeria/thumbnail(13).avif",
    "thumbnail_url": "/galeria/thumbnail(13).avif",
    "fallback_url": "/galeria/thumbnail(13).avif",
    "created_at": "2026-09-14T15:08:35.217845Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "1:1",
    "aspect_ratio": "1/1",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (1:1).",
    "form_data": {
      "dimensions": "1:1",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "49b94963-78ec-4937-aa97-98f49c69ce32",
    "status": "done",
    "result_url": "/galeria/thumbnail(14).avif",
    "thumbnail_url": "/galeria/thumbnail(14).avif",
    "fallback_url": "/galeria/thumbnail(14).avif",
    "created_at": "2026-09-14T14:14:26.456551Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "5b353914-177f-4154-977b-6e22821a551b",
    "status": "done",
    "result_url": "/galeria/thumbnail(15).avif",
    "thumbnail_url": "/galeria/thumbnail(15).avif",
    "fallback_url": "/galeria/thumbnail(15).avif",
    "created_at": "2026-09-14T14:12:09.471381Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "1:1",
    "aspect_ratio": "1/1",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (1:1).",
    "form_data": {
      "dimensions": "1:1",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "0031c802-76da-449d-b19e-e4455c85de14",
    "status": "done",
    "result_url": "/galeria/thumbnail(16).avif",
    "thumbnail_url": "/galeria/thumbnail(16).avif",
    "fallback_url": "/galeria/thumbnail(16).avif",
    "created_at": "2026-09-14T14:06:57.618413Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "1:1",
    "aspect_ratio": "1/1",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (1:1).",
    "form_data": {
      "dimensions": "1:1",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "e1c3aa26-07de-44a8-acb5-34abb2a5ecf2",
    "status": "done",
    "result_url": "/galeria/thumbnail(17).avif",
    "thumbnail_url": "/galeria/thumbnail(17).avif",
    "fallback_url": "/galeria/thumbnail(17).avif",
    "created_at": "2026-09-14T12:47:04.947117Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "9:16",
    "aspect_ratio": "9/16",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (9:16).",
    "form_data": {
      "dimensions": "9:16",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "511681a0-4bc3-4385-9353-bbc99c9e60c2",
    "status": "done",
    "result_url": "/galeria/thumbnail(18).avif",
    "thumbnail_url": "/galeria/thumbnail(18).avif",
    "fallback_url": "/galeria/thumbnail(18).avif",
    "created_at": "2026-09-14T12:43:16.897757Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "1:1",
    "aspect_ratio": "1/1",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (1:1).",
    "form_data": {
      "dimensions": "1:1",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "0b630d24-dd8a-4474-ba48-339872ce8b1f",
    "status": "done",
    "result_url": "/galeria/thumbnail(19).avif",
    "thumbnail_url": "/galeria/thumbnail(19).avif",
    "fallback_url": "/galeria/thumbnail(19).avif",
    "created_at": "2026-09-14T12:34:12.577138Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "9:16",
    "aspect_ratio": "9/16",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (9:16).",
    "form_data": {
      "dimensions": "9:16",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "bc4bdd24-beda-4c1e-bc98-70b0a4fdeecb",
    "status": "done",
    "result_url": "/galeria/thumbnail(20).avif",
    "thumbnail_url": "/galeria/thumbnail(20).avif",
    "fallback_url": "/galeria/thumbnail(20).avif",
    "created_at": "2026-09-14T12:20:00.280452Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "9:16",
    "aspect_ratio": "9/16",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (9:16).",
    "form_data": {
      "dimensions": "9:16",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "7d56a6af-488c-421c-b530-e425df91e21f",
    "status": "done",
    "result_url": "/galeria/thumbnail(21).avif",
    "thumbnail_url": "/galeria/thumbnail(21).avif",
    "fallback_url": "/galeria/thumbnail(21).avif",
    "created_at": "2026-09-14T12:08:25.687669Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "19f6eeb6-318a-4909-9ac3-613c49623079",
    "status": "done",
    "result_url": "/galeria/thumbnail(22).avif",
    "thumbnail_url": "/galeria/thumbnail(22).avif",
    "fallback_url": "/galeria/thumbnail(22).avif",
    "created_at": "2026-09-14T12:08:25.348716Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "ref-builder",
    "agent_name": "Ref",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Ref no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "810434dd-56dd-421c-9213-b45607943d70",
    "status": "done",
    "result_url": "/galeria/thumbnail(23).avif",
    "thumbnail_url": "/galeria/thumbnail(23).avif",
    "fallback_url": "/galeria/thumbnail(23).avif",
    "created_at": "2026-09-14T12:08:25.015052Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "orion-pro",
    "agent_name": "Órion Pro",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Órion Pro no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  },
  {
    "id": "6b351423-d4ad-4bbe-a70d-660386245c56",
    "status": "done",
    "result_url": "/galeria/thumbnail.avif",
    "thumbnail_url": "/galeria/thumbnail.avif",
    "fallback_url": "/galeria/thumbnail.avif",
    "created_at": "2026-09-14T12:08:24.687618Z",
    "date_formatted": "15 de setembro de 2026",
    "agent_slug": "orion-pro",
    "agent_name": "Órion Pro",
    "dimensions": "4:5",
    "aspect_ratio": "4/5",
    "ai_model": "gemini-3.1-flash-image",
    "ai_provider": "openrouter",
    "is_favorited": false,
    "is_upvoted": false,
    "upvote_count": 0,
    "prompt": "Design profissional de alto impacto criado com Órion Pro no Studio Zion (4:5).",
    "form_data": {
      "dimensions": "4:5",
      "quality": "4K",
      "estilo_visual": "ultra_realistic",
      "sobriedade_criatividade": "50"
    }
  }
];
