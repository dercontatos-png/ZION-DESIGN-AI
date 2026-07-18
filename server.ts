import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI, Modality } from "@google/genai";
import { Jimp, ResizeStrategy, BlendMode } from "jimp";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const getAiClient = (customApiKey?: string) => {
  const credentialsPath = path.join(process.cwd(), 'chave-vertex.json');
  const hasChaveVertex = fs.existsSync(credentialsPath);
  
  if (hasChaveVertex) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
  }
  
  // Enforce correct Vertex AI configuration as requested by the user
  const clientInstance = new GoogleGenAI({
    vertexai: true,
    project: "gerador-de-imagens-ia-502303",
    location: "global",
    ...(hasChaveVertex ? { googleAuthOptions: { keyFilename: credentialsPath } } : {})
  });
  
  (clientInstance as any).debugInfo = {
    resolvedTokenSource: hasChaveVertex ? "chave-vertex.json" : "Default Project",
    isUsingVertex: true,
    projectIdUsed: "gerador-de-imagens-ia-502303",
    locationUsed: "global"
  };
  
  return clientInstance;
};

function getImageDimensions(buffer: Buffer, mimeType: string): { width: number; height: number } {
  if (buffer.length < 4) return { width: 0, height: 0 };
  
  // PNG dimensions parser
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    if (buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
  }
  
  // JPEG dimensions parser
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) break;
      const marker = buffer[offset + 1];
      if (marker === 0xD9 || marker === 0xDA) break; // End of image or Start of scan
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xC0 && marker <= 0xC3) { // SOF0, SOF1, SOF2 markers
        if (offset + 9 < buffer.length) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
      }
      offset += 2 + length;
    }
  }
  
  return { width: 0, height: 0 };
}

function getResolutionDimensions(resolution: string, aspectRatio: string): { width: number; height: number } {
  const is4K = resolution === "4K";
  const is2K = resolution === "2K";
  
  if (is4K) {
    switch (aspectRatio) {
      case "1:1": return { width: 4096, height: 4096 };
      case "16:9": return { width: 4096, height: 2304 };
      case "9:16": return { width: 2304, height: 4096 };
      case "4:3": return { width: 4096, height: 3072 };
      case "3:4": return { width: 3072, height: 4096 };
      case "3:2": return { width: 4096, height: 2730 };
      case "2:3": return { width: 2730, height: 4096 };
      case "4:5": return { width: 3276, height: 4096 };
      case "5:4": return { width: 4096, height: 3276 };
      default: return { width: 4096, height: 4096 };
    }
  } else if (is2K) {
    switch (aspectRatio) {
      case "1:1": return { width: 2048, height: 2048 };
      case "16:9": return { width: 2048, height: 1152 };
      case "9:16": return { width: 1152, height: 2048 };
      case "4:3": return { width: 2048, height: 1536 };
      case "3:4": return { width: 1536, height: 2048 };
      case "3:2": return { width: 2048, height: 1365 };
      case "2:3": return { width: 1365, height: 2048 };
      case "4:5": return { width: 1638, height: 2048 };
      case "5:4": return { width: 2048, height: 1638 };
      default: return { width: 2048, height: 2048 };
    }
  } else {
    // 1K
    switch (aspectRatio) {
      case "1:1": return { width: 1024, height: 1024 };
      case "16:9": return { width: 1024, height: 576 };
      case "9:16": return { width: 576, height: 1024 };
      case "4:3": return { width: 1024, height: 768 };
      case "3:4": return { width: 768, height: 1024 };
      case "3:2": return { width: 1024, height: 682 };
      case "2:3": return { width: 682, height: 1024 };
      case "4:5": return { width: 819, height: 1024 };
      case "5:4": return { width: 1024, height: 819 };
      default: return { width: 1024, height: 1024 };
    }
  }
}

async function upscaleImage(base64Image: string, targetWidth: number, formatInput?: string): Promise<{ image: string; width: number; height: number }> {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    
    console.log(`[upscaleImage] Decoding image to check dimensions...`);
    const image = await Jimp.read(buffer);
    const originalWidth = image.width;
    const originalHeight = image.height;
    const maxDim = Math.max(originalWidth, originalHeight);
    
    console.log(`[upscaleImage] Native Gemini image dimensions: ${originalWidth}x${originalHeight} (Max dimension: ${maxDim}px)`);

    // If the image is already at or above the target resolution, skip the upscale.
    if (maxDim >= targetWidth) {
      console.log(`[upscaleImage] Image is already high-resolution (${originalWidth}x${originalHeight}). Skipping redundant upscale.`);
      return { image: base64Image, width: originalWidth, height: originalHeight };
    }

    let targetW = originalWidth;
    let targetH = originalHeight;

    if (originalWidth >= originalHeight) {
      targetW = targetWidth;
      targetH = Math.round(targetWidth * (originalHeight / originalWidth));
    } else {
      targetH = targetWidth;
      targetW = Math.round(targetWidth * (originalWidth / originalHeight));
    }

    console.log(`[upscaleImage] Applying Jimp upscale from ${originalWidth}x${originalHeight} to ${targetW}x${targetH}...`);
    
    try {
      image.resize({ w: targetW, h: targetH, mode: ResizeStrategy.BICUBIC });
    } catch (resizeErr) {
      console.warn("[upscaleImage] Jimp object resize failed, trying classic method:", resizeErr);
      (image as any).resize(targetW, targetH);
    }

    const fmt = (formatInput || "PNG").toUpperCase();
    if (fmt === "PNG") {
      const scaledBuffer = await image.getBuffer("image/png");
      return {
        image: `data:image/png;base64,${scaledBuffer.toString("base64")}`,
        width: image.width,
        height: image.height
      };
    } else if (fmt === "WEBP") {
      const scaledBuffer = await image.getBuffer("image/webp");
      return {
        image: `data:image/webp;base64,${scaledBuffer.toString("base64")}`,
        width: image.width,
        height: image.height
      };
    } else {
      image.quality(98);
      const scaledBuffer = await image.getBuffer("image/jpeg");
      return {
        image: `data:image/jpeg;base64,${scaledBuffer.toString("base64")}`,
        width: image.width,
        height: image.height
      };
    }
  } catch (err: any) {
    console.error("Super-Resolution scaling failed, returning original image:", err.message || err);
    return { image: base64Image, width: 1024, height: 1024 };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://zion-builder-prod.vercel.app"
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".run.app") ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS Policy Violation: Origin not allowed."));
      }
    }
  }));
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));

  // Initialize WhatsApp Bot routes (locally only, as Vercel is stateless and read-only)
  if (!process.env.VERCEL) {
    const { initWhatsAppEndpoints } = await import("./src/whatsapp-server.js");
    initWhatsAppEndpoints(app);
  }

  app.post("/api/parse-task", upload.single("file"), async (req, res) => {
    try {
      const prompt = req.body.prompt;
      const file = req.file;
      const customApiKey = req.body.apiKey;
      const currentDate = req.body.currentDate || new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const currentISODate = req.body.currentISODate || new Date().toISOString().split("T")[0];
      const existingClientsRaw = req.body.existingClients;
      let existingClients: string[] = [];
      try {
        if (existingClientsRaw) {
          existingClients = JSON.parse(existingClientsRaw);
        }
      } catch (e) {}

      if (!prompt && !file) {
        return res.status(400).json({ error: "No prompt or file provided" });
      }

      const currentAi = getAiClient(customApiKey);

      if (!currentAi) {
        return res.status(400).json({ error: "API Key nÃ£o configurada. Por favor, adicione sua chave nas configuraÃ§Ãµes." });
      }

      let textContent = prompt || "";
      const parts: any[] = [];
      
      if (file) {
        if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
          parts.push({
            inlineData: {
              data: file.buffer.toString("base64"),
              mimeType: file.mimetype
            }
          });
        } else {
          textContent += "\n\nFile Content:\n" + file.buffer.toString("utf-8");
        }
      }

      parts.push({
        text: `You are an AI assistant that extracts task information from unstructured text, chats, notes, or files in Portuguese.
Extract multiple task details and return ONLY a JSON object with this exact structure:
{
  "tasks": [
    {
      "title": "Short title of the task in Portuguese (max 50 chars)",
      "description": "Detailed, rich description, steps, or notes in Portuguese explaining what needs to be done. Try to capture as much detail as possible from the input.",
      "client": "Name of the client. Match and resolve against the existing clients list below if there is a similar, misspelled, or matching name. If no client is mentioned, use empty string (\"\").",
      "hasDeadline": boolean (true if a specific date, relative day, or timeline is mentioned),
      "dueDate": "YYYY-MM-DD" (calculate correctly using the current date reference below, otherwise null),
      "amount": number (extracted monetary amount if mentioned, otherwise null),
      "isPaid": boolean (true if mentioned as already paid/received, false otherwise)
    }
  ]
}

Context for Relative Dates:
- Today is: ${currentDate}
- Today's date in YYYY-MM-DD format: ${currentISODate}
- IMPORTANT: When the text says "hoje" (today), "amanhÃ£" (tomorrow), "segunda" (monday), "fim de semana" (weekend), "quarta-feira", etc., calculate the exact calendar date (YYYY-MM-DD) based on the current date reference above.

Context for Clients:
- Existing Clients list: ${JSON.stringify(existingClients)}
- IMPORTANT: If a client is mentioned in the text (even if misspelled, partially written, lowercase, or a nickname), find the best match from the list of existing clients and return the EXACT name from the list. If it does not match any existing client, use the name mentioned in the text (properly formatted). If no client is mentioned, return empty string ("").

Input Text:
${textContent}`
      });

      const response = await currentAi.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: parts
          }
        ]
      });

      let jsonStr = response.text || "{}";
      // Clean up markdown code blocks if any
      jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

      const taskData = JSON.parse(jsonStr);
      res.json(taskData);
    } catch (error: any) {
      console.error("Gemini Parse Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/inpaint-image", async (req, res) => {
    try {
      const { image, mask, prompt, customApiKey } = req.body;
      const currentAi = getAiClient(customApiKey);
      if (!currentAi) {
        return res.status(400).json({ error: "API Key nÃ£o configurada." });
      }

      if (!image || !mask || !prompt) {
        return res.status(400).json({ error: "ParÃ¢metros 'image', 'mask' ou 'prompt' ausentes." });
      }

      const cleanImg = image.replace(/^data:image\/\w+;base64,/, "");
      const cleanMask = mask.replace(/^data:image\/\w+;base64,/, "");

      const parts = [
        { text: `Modify this image by replacing the masked regions strictly with: ${prompt}` },
        { inlineData: { data: cleanImg, mimeType: "image/png" } },
        { inlineData: { data: cleanMask, mimeType: "image/png" } }
      ];

      console.log("Calling Gemini for inpainting image editing...");
      const response = await currentAi.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          imageConfig: {
            aspectRatio: "1:1", // default square edit
          },
        },
      });

      let inpaintedImgUrl = "";
      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const mime = part.inlineData.mimeType || "image/png";
            inpaintedImgUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!inpaintedImgUrl) {
        return res.status(500).json({ error: "Nenhuma imagem de inpainting retornada pelo modelo." });
      }

      res.json({ image: inpaintedImgUrl });
    } catch (error: any) {
      console.error("Inpaint API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post(["/api/generate-image", "/api/generate-design", "/api/zion-ai-generate"], async (req, res) => {
    try {
      const {
        imgConfig,
        backgroundSettings,
        personRefs = [],
        envRefs = [],
        styleRefs = [],
        logoRefs = [],
        customApiKey,
        aspectRatioOverride
      } = req.body;

      const currentAi = getAiClient(customApiKey);

      if (!currentAi) {
        return res.status(400).json({ error: "API Key nÃ£o configurada. Por favor, adicione sua chave nas configuraÃ§Ãµes." });
      }

      const colorsStr = backgroundSettings?.colors?.join(", ") || "#000000, #ffffff";
      const bgType = backgroundSettings?.type || "color";

      // 1. Art Director "AI Thinking" step
      const formattingStyle = imgConfig?.style || imgConfig?.visualStyle || "Ultra Realista";
      const userH1 = imgConfig?.h1 || "";
      const userH2 = imgConfig?.h2 || "";
      const userCta = imgConfig?.cta || "";
      const userSmall = imgConfig?.textSmall || "";
      
      const sobrietyText = (imgConfig?.sobriety || 50) < 50 
        ? "Altamente Criativo, dinâmico, cores vibrantes, efeitos luminosos" 
        : "Limpo, elegante, corporativo, minimalista, profissional";

      // Compile active floating elements
      const floatEls = [];
      if (imgConfig?.floatElementParticles) floatEls.push("partículas brilhantes");
      if (imgConfig?.floatElementMoney) floatEls.push("cédulas de dinheiro voando");
      if (imgConfig?.floatElementFog) floatEls.push("névoa misteriosa");
      if (imgConfig?.floatElementSmoke) floatEls.push("fumaça densa");
      if (imgConfig?.floatElementLightning) floatEls.push("raios e faíscas elétricas");
      if (imgConfig?.floatElementFire) floatEls.push("chamas de fogo reais");
      if (imgConfig?.floatElementRain) floatEls.push("gotas de chuva caindo");
      if (imgConfig?.floatElementSnow) floatEls.push("flocos de neve flutuando");
      if (imgConfig?.floatElementConfetti) floatEls.push("confetes festivos e coloridos");
      const floatElsText = floatEls.length > 0 ? floatEls.join(", ") : "Nenhum";

      // Compile camera effects
      const cameraEffects = [];
      if (imgConfig?.efeitoGrain) cameraEffects.push("grão de filme analógico sutil");
      if (imgConfig?.efeitoBloom) cameraEffects.push("efeito glow Bloom suave de luzes");
      if (imgConfig?.efeitoLensFlare) cameraEffects.push("reflexo de lente (lens flare)");
      if (imgConfig?.efeitoHDR) cameraEffects.push("alto alcance dinâmico (HDR) com detalhes nítidos nas sombras");
      if (imgConfig?.efeitoChromaticAberration) cameraEffects.push("leve aberração cromática nas bordas");
      if (imgConfig?.efeitoVignette) cameraEffects.push("vinheta escura sutil nas bordas");
      if (imgConfig?.efeitoMotionBlur) cameraEffects.push("desfoque de movimento de velocidade");
      const cameraEffectsText = cameraEffects.length > 0 ? cameraEffects.join(", ") : "Nenhum";

      const thinkPrompt = `
You are an Elite Creative Art Director. Your job is to analyze a graphic design brief and expand it into a precise, highly optimized prompt in English for the Imagen model to generate a pristine, high-end commercial design card.

Here are the user's selected configurations:
- Generation Mode: ${imgConfig?.modoCriacao || "Criativo (Padrão)"}
- Layout Type: ${imgConfig?.tipoLayout || "Social Media"}
- Style/Aesthetic: ${formattingStyle}
- Sobriety/Creative Level: ${imgConfig?.sobriety || 50}/100 (${sobrietyText})
- Subject details:
  - Gender: ${imgConfig?.gender || "Qualquer"}
  - Age: ${imgConfig?.age || "Adulto"}
  - Ethnicity/Features: ${imgConfig?.ethnicity || "Livre"}
  - Facial Expression: ${imgConfig?.expression || "Natural"}
  - Look Direction: ${imgConfig?.lookCamera ? "Looking directly at the camera" : "Looking away from camera"}
  - Identity Weight/Influence: ${imgConfig?.identityWeight || 0.8}
  - Framing: ${imgConfig?.framing || "Plano Médio"}
  - Positioning: ${imgConfig?.positioning || "Centro"}
  - Clothing & Pose: ${imgConfig?.clothingPose || "Not specified"}
  - Allowed people: ${imgConfig?.noPeople ? "STRICTLY NO humans/faces/bodies" : "Humans allowed"}
- Theme/Niche: ${imgConfig?.niche || "Not specified"}
- Background/Environment:
  - Category: ${imgConfig?.ambienteCategoria || "Estúdio"}
  - Type: ${bgType}
  - Colors/Palette: ${colorsStr}
  - Environment details: ${imgConfig?.environment || "Not specified"}
  - Background Weight/Influence: ${imgConfig?.envRefWeight || 0.5}
- Lighting setup:
  - Color Temperature: ${imgConfig?.temperaturaLuz || "Neutra"}
  - Time of Day: ${imgConfig?.horaDia || "Tarde"}
  - Ambient Color: ${imgConfig?.enableAmbientColor ? imgConfig?.colorCode : "Standard"}
  - Key Light Color: ${imgConfig?.luzPrincipalColor || "Branca"}
  - Rim Light Color: ${imgConfig?.enableRimLight ? imgConfig?.rimLight || imgConfig?.luzRecorteColor : "None"}
  - Complementary Light Color: ${imgConfig?.enableCompLight ? imgConfig?.compLight || imgConfig?.luzCompColor : "None"}
- Additional Elements:
  - Blur (Bokeh): ${imgConfig?.enableBlur ? "Yes, shallow depth of field, soft background blur" : "No blur"}
  - Gradient Overlay Direction: ${imgConfig?.degradeDirecao || "None"} (Lateral gradient: ${imgConfig?.lateralGradient ? "Yes" : "No"})
  - Floating Elements Selected: ${floatElsText} (Description notes: ${imgConfig?.floatingElementsDescription || "None"})
  - Active Camera Filters: ${cameraEffectsText}
- Typography and Text to integrate into the graphic:
  - Enable Text: ${imgConfig?.enableText ? "Yes" : "No"}
  - H1 Title: "${userH1}"
  - H2 Subtitle: "${userH2}"
  - CTA Button Text: "${userCta}"
  - Small Caption/Legenda: "${userSmall}"
  - Typography Effect: ${imgConfig?.textEffect || "Nenhum"}
  - Preferred Font Style: ${imgConfig?.fontFamily || "Inter"}
  - Text Position: ${imgConfig?.textPosition || "Centro"}
  - Gradient Text Background: ${imgConfig?.gradient ? "Yes, styled backdrop" : "No"}
- Logo Layout (Include watermark if logo image is provided):
  - Position: ${imgConfig?.logoPosition || "Bottom Right"}
  - Scale: ${imgConfig?.logoScale || 1}
  - Opacity: ${imgConfig?.logoOpacity || 100}%
  - Safe Area Border Margin: ${imgConfig?.logoSafeArea ? "Yes" : "No"}
- Extra Notes from User: "${imgConfig?.additionalPrompt || ""}"
- Negative Constraints (AVOID these at all costs): "${imgConfig?.negativePrompt || "deformed, blurry, low resolution, bad hands, distorted text"}"

Write a single-paragraph English prompt that synthesizes all of this with professional graphic design vocabulary.
To ensure the highest precision:
1. Describe the layout, composition, color scheme, and lighting in vivid detail.
2. Instruct the model precisely where and how to render the text. The text "${userH1}" (H1), "${userH2}" (H2), "${userCta}" (CTA), and "${userSmall}" (Caption) must be rendered clearly with elegant modern typography corresponding to font style ${imgConfig?.fontFamily || "Inter"}, with effect "${imgConfig?.textEffect || "Nenhum"}", high legibility, and integrated seamlessly into the design.
3. Keep the prompt professional, avoiding buzzwords. Focus on structural instructions.
4. If there are no people allowed, strictly specify that.
5. IMPORTANT FOR VISUAL FAITHFULNESS: Look closely at any provided Person Reference Images. In your prompt, describe the subject's physical features (gender, hair style, facial shape, facial hair, approximate age, expression) with precision so the generator recreates a similar face. Do not use names, describe the details.
6. Look closely at any provided Style Reference Images. Describe their specific lighting setup, color values, composition, textures, and artistic treatment, and translate that into prompt instructions.
7. Integrate the negative constraints in a way that directs the layout output to avoid glitches, overlapping layers, and illegibility.

Output ONLY the expanded prompt text. Do not include any explanations, introduction, or conversational filler.
`;

      const thinkParts: any[] = [];
      
      // Inject person reference images into Art Director's vision
      personRefs.forEach((ref: any, idx: number) => {
        thinkParts.push({ inlineData: { data: ref.data, mimeType: ref.mimeType || "image/jpeg" } });
        thinkParts.push({ text: `This is "Person Reference Image ${idx + 1}". Look closely at this face. You must describe this person's key physical appearance (hair, age, expression, features) in detail in the output prompt to maintain facial likeness.` });
      });

      // Inject style reference images into Art Director's vision
      styleRefs.forEach((ref: any, idx: number) => {
        thinkParts.push({ inlineData: { data: ref.data, mimeType: ref.mimeType || "image/jpeg" } });
        thinkParts.push({ text: `This is "Style Reference Image ${idx + 1}". Replicate the aesthetic, layout, colors, lighting, and textures of this image in your prompt instructions.` });
      });

      thinkParts.push({ text: thinkPrompt });

      let finalPrompt = "";
      try {
        const thinkResponse = await currentAi.models.generateContent({
          model: "gemini-2.5-flash",
          contents: thinkParts,
        });
        finalPrompt = thinkResponse.text || "";
      } catch (thinkError) {
        console.warn("Error in thinking step, using raw prompt builder:", thinkError);
      }

      if (!finalPrompt.trim()) {
        // Fallback prompt builder if thinking step failed
        let prompt = `Create a premium ${formattingStyle} ${imgConfig?.tipoLayout || "Social Media"} layout. `;
        prompt += `Subject: A ${imgConfig?.gender || "Qualquer"} (${imgConfig?.age || "Adulto"}, ${imgConfig?.ethnicity || "Livre"}), exhibiting a ${imgConfig?.expression || "Natural"} expression, ${imgConfig?.lookCamera ? "looking directly at the camera" : "looking away"}. Shot type: ${imgConfig?.framing || "Plano Médio"} shot, positioned on the ${imgConfig?.positioning || "Centro"}. `;
        const bgColor = bgType === "color" ? colorsStr : "image-based background";
        prompt += `Background/Colors: ${bgColor} (${imgConfig?.ambienteCategoria || "Estúdio"}). Details: ${imgConfig?.environment || "Not specified"}. `;
        if (imgConfig?.clothingPose) prompt += `Wearing/Doing: ${imgConfig?.clothingPose}. `;
        if (imgConfig?.niche) prompt += `Theme/Niche: ${imgConfig?.niche}. `;
        prompt += `Lighting: ${imgConfig?.temperaturaLuz || "Neutra"} tone, shot during ${imgConfig?.horaDia || "Tarde"}. Principal light: ${imgConfig?.luzPrincipalColor || "Branca"}. `;
        if (imgConfig?.enableAmbientColor) prompt += `Ambient glow color: ${imgConfig?.colorCode}. `;
        if (imgConfig?.enableRimLight && imgConfig?.rimLight !== "Nenhuma") prompt += `${imgConfig?.rimLight} rim light. `;
        if (imgConfig?.enableCompLight && imgConfig?.compLight !== "Nenhuma") prompt += `${imgConfig?.compLight} complementary light. `;
        if (floatEls.length > 0) prompt += `Include floating elements: ${floatElsText}. `;
        if (cameraEffects.length > 0) prompt += `Apply filters: ${cameraEffectsText}. `;
        if (imgConfig?.degradeDirecao && imgConfig?.degradeDirecao !== "Nenhhum") prompt += `Apply a ${imgConfig?.degradeDirecao} gradient overlay. `;
        if (imgConfig?.enableBlur) prompt += `Shallow depth of field with background bokeh. `;
        if (imgConfig?.noPeople) prompt += `STRICTLY NO people, faces, or humans. `;
        if (imgConfig?.enableText) {
          prompt += `Include readable text: H1: "${userH1}", H2: "${userH2}", CTA: "${userCta}", Small caption: "${userSmall}". Styled with "${imgConfig?.textEffect || "Nenhum"}" effects, using font style "${imgConfig?.fontFamily || "Inter"}", positioned at "${imgConfig?.textPosition || "Centro"}". `;
        }
        if (imgConfig?.additionalPrompt) prompt += `Details: ${imgConfig?.additionalPrompt}.`;
        if (imgConfig?.negativePrompt) prompt += ` Avoid: ${imgConfig?.negativePrompt}.`;
        finalPrompt = prompt;
      }

      console.log("Optimized Prompt generated by AI Thought:", finalPrompt);

      // 2. Build contents parts with reference images
      const parts: any[] = [{ text: finalPrompt }];

      // Handle reference images
      personRefs.forEach((ref: any, i: number) => {
        parts.push({ text: `Reference image ${i + 1} for the person/subject:` });
        parts.push({ inlineData: { data: ref.data, mimeType: ref.mimeType } });
      });

      if (imgConfig?.useEnvRef) {
        envRefs.forEach((ref: any, i: number) => {
          parts.push({ text: `Reference image ${i + 1} for the environment/background:` });
          parts.push({ inlineData: { data: ref.data, mimeType: ref.mimeType } });
        });
      }

      styleRefs.forEach((ref: any, i: number) => {
        parts.push({ 
          text: `Reference image ${i + 1} for the desired style/aesthetic:${imgConfig?.extractTypography ? " Analyze and extract the typographic style, including effects, 3D elements, etc." : ""}` 
        });
        parts.push({ inlineData: { data: ref.data, mimeType: ref.mimeType } });
        if (imgConfig?.extractTypography && ref.description) {
          parts.push({ text: `Description of this reference style: ${ref.description}` });
        }
      });

      logoRefs.forEach((logo: any) => {
        parts.push({ text: `Reference image for a logo to be included at position: ${logo.position || "Top Left"}:` });
        parts.push({ inlineData: { data: logo.data, mimeType: logo.mimeType } });
      });

      // 3. Generation Strategy: Use gemini-3-pro-image with Vertex AI Global
      const results: string[] = [];
      const variationsCount = Math.min(Math.max(imgConfig?.variations || 1, 1), 4);
      
      // Adapt aspect ratios to official model standards (1:1, 3:4, 4:3, 9:16 or 16:9)
      let selectedRatio = aspectRatioOverride || imgConfig?.aspectRatio || "1:1";
      const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (!validRatios.includes(selectedRatio)) {
        if (selectedRatio === "2:3") selectedRatio = "3:4";
        else if (selectedRatio === "3:2") selectedRatio = "4:3";
        else selectedRatio = "1:1";
      }

      const targetModel = "gemini-3-pro-image-preview";
      const inputSize = imgConfig?.imageSize || "1K";
        const sizeSelected = inputSize === "8K" ? "4K" : inputSize;
      let modelUsed = `Vertex AI (${targetModel})`;
      let lastErrors: string[] = [];

      for (let i = 0; i < variationsCount; i++) {
        let responseImgUrl = "";
        let errorDetails = "";

        try {
          console.log(`Variation ${i + 1}/${variationsCount}: Generating image using ${targetModel} on Vertex AI Global...`);
          
          // REQUIRED BEFORE LOG
          console.log({
            provider: "Vertex AI",
            location: "global",
            model: "gemini-3-pro-image-preview",
            requestedSize: sizeSelected,
            aspectRatio: selectedRatio
          });

          let rawData = "";
          let mimeType = "image/png";

          try {
            const response = await currentAi.models.generateContent({
              model: targetModel,
              contents: [
                {
                  role: "user",
                  parts: parts
                }
              ],
              config: {
                responseModalities: ["IMAGE"],
                imageConfig: {
                  aspectRatio: selectedRatio,
                  imageSize: sizeSelected,
                  outputMimeType: "image/png"
                }
              }
            });

            if (response?.candidates?.[0]?.content?.parts) {
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  rawData = part.inlineData.data;
                  mimeType = part.inlineData.mimeType || "image/png";
                  responseImgUrl = `data:${mimeType};base64,${rawData}`;
                  break;
                }
              }
            }

            if (!responseImgUrl) {
              throw new Error("No image data returned in candidate parts.");
            }

            modelUsed = `Vertex AI (gemini-3-pro-image)`;

          } catch (imagenErr: any) {
            console.warn(`[api/generate-image] Primary model gemini-3-pro-image failed. Attempting fallback to imagen-3.0-generate-002...`, imagenErr.message || imagenErr);
            
            try {
              console.log(`[api/generate-image] Calling generateImages with model: imagen-3.0-generate-002`);
              const fallbackResponse = await (currentAi.models as any).generateImages({
                model: "imagen-3.0-generate-002",
                prompt: finalPrompt,
                config: {
                  numberOfImages: 1,
                  aspectRatio: selectedRatio,
                  outputMimeType: "image/png"
                }
              });

              if (fallbackResponse?.generatedImages?.[0]?.image?.imageBytes) {
                rawData = fallbackResponse.generatedImages[0].image.imageBytes;
                mimeType = "image/png";
                responseImgUrl = `data:image/png;base64,${rawData}`;
                modelUsed = `Vertex AI (imagen-3.0-generate-002 - Fallback)`;
                console.log("[BACK] Fallback imagen-3.0-generate-002 gerou imagem com sucesso.");
              } else {
                throw new Error("Nenhum byte de imagem retornado no fallback imagen-3.0-generate-002.");
              }
            } catch (fallbackErr: any) {
              console.warn("[api/generate-image] Fallback to imagen-3.0-generate-002 failed. Attempting fallback to imagen-3.0-generate-001...", fallbackErr.message || fallbackErr);
              
              try {
                console.log(`[api/generate-image] Calling generateImages with model: imagen-3.0-generate-001`);
                const fallbackResponse2 = await (currentAi.models as any).generateImages({
                  model: "imagen-3.0-generate-001",
                  prompt: finalPrompt,
                  config: {
                    numberOfImages: 1,
                    aspectRatio: selectedRatio,
                    outputMimeType: "image/png"
                  }
                });

                if (fallbackResponse2?.generatedImages?.[0]?.image?.imageBytes) {
                  rawData = fallbackResponse2.generatedImages[0].image.imageBytes;
                  mimeType = "image/png";
                  responseImgUrl = `data:image/png;base64,${rawData}`;
                  modelUsed = `Vertex AI (imagen-3.0-generate-001 - Fallback 2)`;
                  console.log("[BACK] Fallback imagen-3.0-generate-001 gerou imagem com sucesso.");
                } else {
                  throw new Error("Nenhum byte de imagem retornado no fallback imagen-3.0-generate-001.");
                }
              } catch (fallbackErr2: any) {
                console.error("[api/generate-image] All image generation attempts and fallbacks failed.");
                errorDetails += `[${targetModel} error: ${imagenErr.message || imagenErr}] `;
              }
            }
          }

          let width = 0;
          let height = 0;
          let bytes = 0;

          if (rawData) {
            
          let buffer = Buffer.from(rawData, "base64");
          
          bytes = buffer.length;

            const dims = getImageDimensions(buffer, mimeType);
            width = dims.width;
            height = dims.height;
          }

          // REQUIRED AFTER LOG
          console.log({
            mimeType,
            bytes,
            width,
            height
          });

          // 4K Warning Validation
          if (sizeSelected === "4K" && (width < 3000 || height < 3000)) {
            console.warn(`[api/generate-image] WARNING: Requested 4K, but received resolution of ${width}x${height}px. Skipping any upscaling or modifications.`);
          }

        } catch (catastrophicErr: any) {
          console.error("[api/generate-image] Catastrophic error in loop iteration:", catastrophicErr);
          errorDetails += `[Catastrophic loop error: ${catastrophicErr.message || catastrophicErr}] `;
        }

        if (responseImgUrl) {
          results.push(responseImgUrl);
        } else {
          lastErrors.push(`Variação ${i + 1} falhou: ${errorDetails}`);
        }
      }

      if (results.length === 0) {
        const errDetailsString = lastErrors.join("\n");
        return res.status(500).json({ 
          error: `Google API Error: ${errDetailsString}`,
          details: errDetailsString
        });
      }

      res.json({ images: results, thought: finalPrompt, modelUsed });
    } catch (error: any) {
      console.error("Backend Generate Image Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const {
        imgConfig,
        personRefs = [],
        styleRefs = [],
        envRefs = [],
        logoRefs = [],
        customApiKey
      } = req.body;

      console.log("\n--- CONFIGURAÇÃO DE GERAÇÃO (/api/generate) ---");
      console.log({
        model: "gemini-3-pro-image-preview",
        resolution: imgConfig?.imageSize || "1K",
        aspectRatio: imgConfig?.aspectRatio || "1:1",
        variations: imgConfig?.variations || 1,
      });

      const client = getAiClient(customApiKey);

      if (!client) {
        return res.status(400).json({ error: "Cliente GenAI não pôde ser inicializado." });
      }

      const token = customApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyC3seHAMIgwPRxb-Ts1Q3Xds2PAL4mR89Q';
      const credentialsPath = path.join(process.cwd(), 'chave-vertex.json');
      const isVertex = fs.existsSync(credentialsPath) || token.startsWith('AQ.');

      // HIDDEN PROMPT MOTOR - EXPERT DESIGNER FLYER BR STYLE
      let promptBuilder = "Professional premium Brazilian event flyer (Flyer BR style), masterpiece, top-tier agency quality, ultra-detailed, 8k resolution, cinematic lighting, sharp focus, highly aesthetic. ";
      
      // 1. SUBJECT & NICHE
      if (!imgConfig?.noPeople) {
        const gender = imgConfig?.gender !== "Livre" ? imgConfig?.gender : "person";
        const age = imgConfig?.age !== "Livre" ? imgConfig?.age : "";
        const ethnicity = imgConfig?.ethnicity !== "Livre" ? imgConfig?.ethnicity : "";
        const expression = imgConfig?.expression !== "Livre" ? `with a ${imgConfig?.expression} expression` : "";
        const lookCamera = imgConfig?.lookCamera ? "looking directly at the camera" : "looking away";
        const clothing = imgConfig?.clothingPose ? `wearing ${imgConfig.clothingPose}` : "wearing stylish modern clothes";
        
        promptBuilder += `Main subject: ${age} ${ethnicity} ${gender}, ${expression}, ${lookCamera}, ${clothing}. `;
        
        if (imgConfig?.framing && imgConfig.framing !== "Livre") {
          promptBuilder += `Framing: ${imgConfig.framing}. `;
        }
        if (imgConfig?.positioning && imgConfig.positioning !== "Livre") {
          promptBuilder += `Positioning: Subject placed in the ${imgConfig.positioning} of the image. `;
        }
      } else {
        promptBuilder += "No people in the image. Focus purely on the environment, product or typography. ";
      }

      if (imgConfig?.niche) {
        promptBuilder += `Niche/Theme: ${imgConfig.niche}. `;
      }

      // 2. ENVIRONMENT & BACKGROUND
      const environment = imgConfig?.environment || imgConfig?.ambienteCategoria || "Abstract studio background";
      promptBuilder += `Environment/Background: ${environment}. `;
      if (imgConfig?.enableAmbientColor && imgConfig?.envColor) {
        promptBuilder += `The environment features strong ambient tones of ${imgConfig.envColor}. `;
      }

      // 3. LIGHTING & COLOR GRADING
      promptBuilder += `Lighting setup: `;
      const luzPrincipal = imgConfig?.luzPrincipalColor !== "Nenhuma" ? imgConfig?.luzPrincipalColor : "neutral";
      promptBuilder += `Main key light is ${luzPrincipal}, `;
      
      if (imgConfig?.enableRimLight && imgConfig?.rimLight !== "Nenhuma") {
        promptBuilder += `with a strong striking rim light (backlight) colored ${imgConfig.rimLight}, `;
      }
      if (imgConfig?.enableCompLight && imgConfig?.compLight !== "Nenhuma") {
        promptBuilder += `and a complementary fill light colored ${imgConfig.compLight}. `;
      }
      if (imgConfig?.temperaturaLuz && imgConfig.temperaturaLuz !== "Neutra") {
        promptBuilder += `Overall lighting temperature is ${imgConfig.temperaturaLuz}. `;
      }
      if (imgConfig?.horaDia && imgConfig.horaDia !== "Nenhuma") {
        promptBuilder += `Time of day: ${imgConfig.horaDia}. `;
      }
      
      const dominantColor = imgConfig?.colorCode || "#ad8330";
      promptBuilder += `Dominant accent color for details and branding: ${dominantColor}. `;

      // 4. STYLE & EFFECTS
      const visualStyle = imgConfig?.style || imgConfig?.visualStyle || "Ultra Realista";
      promptBuilder += `Visual Style: ${visualStyle}. `;
      
      if (visualStyle.toUpperCase().includes("ULTRA REALISTA")) {
        promptBuilder += "Hyper-realistic photography, raw photo, realistic skin texture, intricate details, volumetric light. ";
      } else if (visualStyle.toUpperCase().includes("CINEMATIC")) {
        promptBuilder += "Cinematic film still, anamorphic lens, dramatic chiaroscuro, rich color grading, epic atmosphere. ";
      } else if (visualStyle.toUpperCase().includes("GLOW") || visualStyle.toUpperCase().includes("NEON")) {
        promptBuilder += "Cyberpunk aesthetic, neon glow, glowing luminous elements, vibrant backlit halo, ethereal particle effects. ";
      } else if (visualStyle.toUpperCase().includes("MINIMALISTA")) {
        promptBuilder += "Minimalist layout, clean negative space, sleek modern design, premium luxury aesthetic. ";
      } else if (visualStyle.toUpperCase().includes("3D")) {
        promptBuilder += "Octane render, Unreal Engine 5, 3D modeling, smooth materials, glossy reflections. ";
      }
      
      // Post-Processing / Special Effects
      let effects = [];
      if (imgConfig?.efeitoGrain) effects.push("film grain");
      if (imgConfig?.efeitoBloom) effects.push("bloom lighting");
      if (imgConfig?.efeitoLensFlare) effects.push("lens flares");
      if (imgConfig?.efeitoHDR) effects.push("HDR high dynamic range");
      if (imgConfig?.efeitoChromaticAberration) effects.push("chromatic aberration");
      if (imgConfig?.efeitoVignette) effects.push("vignette edges");
      if (imgConfig?.efeitoMotionBlur) effects.push("dynamic motion blur");
      if (imgConfig?.enableBlur) effects.push("shallow depth of field (bokeh background)");
      
      if (effects.length > 0) {
        promptBuilder += `Post-processing effects: ${effects.join(", ")}. `;
      }

      // 5. FLOATING ELEMENTS / PARTICLES
      if (imgConfig?.floatingElements || imgConfig?.floatElementParticles || imgConfig?.floatElementMoney || imgConfig?.floatElementFog) {
        let floats = [];
        if (imgConfig?.floatElementParticles) floats.push("glowing dust particles");
        if (imgConfig?.floatElementMoney) floats.push("flying money bills");
        if (imgConfig?.floatElementFog) floats.push("cinematic fog/mist");
        if (imgConfig?.floatElementSmoke) floats.push("volumetric smoke");
        if (imgConfig?.floatElementLightning) floats.push("electric lightning strikes");
        if (imgConfig?.floatElementFire) floats.push("fire embers and sparks");
        if (imgConfig?.floatElementRain) floats.push("cinematic rain drops");
        if (imgConfig?.floatElementSnow) floats.push("falling snow");
        if (imgConfig?.floatElementConfetti) floats.push("celebration confetti");
        if (imgConfig?.floatingElementsDescription) floats.push(imgConfig.floatingElementsDescription);
        
        if (floats.length > 0) {
          promptBuilder += `Floating environment elements: ${floats.join(", ")}, adding depth and motion to the composition. `;
        }
      }

      // 6. TYPOGRAPHY & TEXT (Crucial for Flyer BR)
      if (imgConfig?.enableText) {
        promptBuilder += `\n\nTYPOGRAPHY & TEXT LAYOUT: Integrate bold, highly readable, premium typography directly into the design (Flyer BR style). `;
        if (imgConfig.textPosition && imgConfig.textPosition !== "Centro") {
          promptBuilder += `Place the main text blocks aligned to the ${imgConfig.textPosition}. `;
        }
        promptBuilder += `Font family style: ${imgConfig?.fontFamily || "Modern Sans-Serif"}. `;
        
        if (imgConfig.h1) promptBuilder += `The primary massive Headline must read exactly: "${imgConfig.h1}". `;
        if (imgConfig.h2) promptBuilder += `The bold Subheadline should read exactly: "${imgConfig.h2}". `;
        if (imgConfig.textSmall) promptBuilder += `Small descriptive body text must read exactly: "${imgConfig.textSmall}". `;
        if (imgConfig.cta) promptBuilder += `The Call-To-Action (badge/button) should read exactly: "${imgConfig.cta}". `;
        
        promptBuilder += `Make the typography look professionally kerned, with correct visual hierarchy, perhaps some text passing behind the main subject for a 3D depth effect. `;
      }

      // 7. USER SPECIFIC OVERRIDES
      if (imgConfig?.additionalPrompt) {
        promptBuilder += `\n\nADDITIONAL SPECIFIC INSTRUCTIONS: ${imgConfig.additionalPrompt}.`;
      }
      
      if (imgConfig?.negativePrompt) {
        promptBuilder += `\n\nAVOID (Negative Prompt constraints): ${imgConfig.negativePrompt}.`;
      }

      const finalPrompt = promptBuilder;
      console.log("Hidden Prompt Motor Output:", finalPrompt);

      // Adapt aspect ratios (1:1, 3:4, 9:16, 16:9)
      let selectedRatio = imgConfig?.aspectRatio || "1:1";
      const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (!validRatios.includes(selectedRatio)) {
        if (selectedRatio === "4:5" || selectedRatio === "2:3") selectedRatio = "3:4";
        else if (selectedRatio === "3:2") selectedRatio = "4:3";
        else selectedRatio = "1:1";
      }

      const promptCompleto = "Fotografia comercial profissional, resolução 4k UHD, textura de pele hiper-realista, foco nítido, estilo premium de luxo, paleta com preto, branco e dourado #ad8330, " + finalPrompt;

      const cleanBase64 = (dataStr: string) => {
        if (!dataStr) return "";
        if (dataStr.includes(",")) {
          return dataStr.split(",")[1];
        }
        return dataStr;
      };

      // Construct multiple text and image parts
      const parts: any[] = [];

      // 1. Text Prompt Completo
      parts.push({
        text: promptCompleto
      });

      // 2. Outros textos informativos da configuração
      if (imgConfig?.h1) {
        parts.push({ text: `Texto Principal (Headline): "${imgConfig.h1}"` });
      }
      if (imgConfig?.h2) {
        parts.push({ text: `Subtexto (Subheadline): "${imgConfig.h2}"` });
      }
      if (imgConfig?.additionalPrompt) {
        parts.push({ text: `Prompt adicional do usuário: "${imgConfig.additionalPrompt}"` });
      }

      // 3. Imagens de referência de pessoas/sujeito
      if (Array.isArray(personRefs) && personRefs.length > 0) {
        personRefs.forEach((ref: any, idx: number) => {
          const b64 = cleanBase64(ref.data || ref.url);
          if (b64) {
            parts.push({
              inlineData: {
                data: b64,
                mimeType: ref.mimeType || "image/jpeg"
              }
            });
            parts.push({ text: `Referência de Pessoa/Sujeito ${idx + 1}` });
          }
        });
      }

      // 4. Imagens de referência de ambiente/background
      if (Array.isArray(envRefs) && envRefs.length > 0) {
        envRefs.forEach((ref: any, idx: number) => {
          const b64 = cleanBase64(ref.data || ref.url);
          if (b64) {
            parts.push({
              inlineData: {
                data: b64,
                mimeType: ref.mimeType || "image/jpeg"
              }
            });
            parts.push({ text: `Referência de Ambiente/Cenário ${idx + 1}` });
          }
        });
      }

      // 5. Imagens de referência de estilo/estética
      if (Array.isArray(styleRefs) && styleRefs.length > 0) {
        styleRefs.forEach((ref: any, idx: number) => {
          const b64 = cleanBase64(ref.data || ref.url);
          if (b64) {
            parts.push({
              inlineData: {
                data: b64,
                mimeType: ref.mimeType || "image/jpeg"
              }
            });
            parts.push({ text: `Referência de Estilo/Estética ${idx + 1}${ref.description ? `: ${ref.description}` : ''}` });
          }
        });
      }

      // 6. Imagens de referência de logotipo
      if (Array.isArray(logoRefs) && logoRefs.length > 0) {
        logoRefs.forEach((ref: any, idx: number) => {
          const b64 = cleanBase64(ref.data || ref.url);
          if (b64) {
            parts.push({
              inlineData: {
                data: b64,
                mimeType: ref.mimeType || "image/jpeg"
              }
            });
            parts.push({ text: `Referência de Logotipo ${idx + 1} para o design (Posição: ${ref.position || "Livre"})` });
          }
        });
      }

      const results: string[] = [];
      const variationsCount = Math.min(Math.max(imgConfig?.variations || 1, 1), 4);
      const targetModel = "gemini-3-pro-image-preview";
      let modelUsed = `Google AI Studio (${targetModel})`;
      let lastErrors: string[] = [];

      for (let i = 0; i < variationsCount; i++) {
        let responseImgUrl = "";
        let errorDetails = "";
        const sizeSelected = imgConfig?.imageSize || "1K";

        try {
          console.log(`[api/generate] Variation ${i + 1}/${variationsCount}: Generating with ${targetModel} - Target resolution: ${sizeSelected}...`);
          
          // REQUIRED BEFORE LOG
          console.log({
            provider: "Vertex AI",
            location: "global",
            model: "gemini-3-pro-image-preview",
            requestedSize: sizeSelected,
            aspectRatio: selectedRatio
          });

          let rawData = "";
          let rawMime = "image/png";

          try {
            const response = await client.models.generateContent({
              model: targetModel,
              contents: [
                {
                  role: "user",
                  parts: parts
                }
              ],
              config: {
                responseModalities: ["IMAGE"],
                imageConfig: {
                  aspectRatio: selectedRatio,
                  imageSize: sizeSelected,
                  outputMimeType: "image/png"
                }
              }
            });

            if (response?.candidates?.[0]?.content?.parts) {
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  rawData = part.inlineData.data;
                  rawMime = part.inlineData.mimeType || "image/png";
                  responseImgUrl = `data:${rawMime};base64,${rawData}`;
                  break;
                }
              }
            }

            if (!responseImgUrl) {
              throw new Error("Nenhuma imagem gerada retornada no corpo da resposta.");
            }

            modelUsed = `Google AI Studio (gemini-3-pro-image)`;

          } catch (imagenErr: any) {
            console.warn(`[api/generate] Primary model gemini-3-pro-image failed. Attempting fallback to imagen-3.0-generate-002...`, imagenErr.message || imagenErr);
            
            try {
              console.log(`[api/generate] Calling generateImages with model: imagen-3.0-generate-002`);
              const fallbackResponse = await (client.models as any).generateImages({
                model: "imagen-3.0-generate-002",
                prompt: promptCompleto,
                config: {
                  numberOfImages: 1,
                  aspectRatio: selectedRatio,
                  outputMimeType: "image/png"
                }
              });

              if (fallbackResponse?.generatedImages?.[0]?.image?.imageBytes) {
                rawData = fallbackResponse.generatedImages[0].image.imageBytes;
                rawMime = "image/png";
                responseImgUrl = `data:image/png;base64,${rawData}`;
                modelUsed = `Google AI Studio (imagen-3.0-generate-002 - Fallback)`;
                console.log("[BACK] Fallback imagen-3.0-generate-002 gerou imagem com sucesso.");
              } else {
                throw new Error("Nenhum byte de imagem retornado no fallback imagen-3.0-generate-002.");
              }
            } catch (fallbackErr: any) {
              console.warn("[api/generate] Fallback to imagen-3.0-generate-002 failed. Attempting fallback to imagen-3.0-generate-001...", fallbackErr.message || fallbackErr);
              
              try {
                console.log(`[api/generate] Calling generateImages with model: imagen-3.0-generate-001`);
                const fallbackResponse2 = await (client.models as any).generateImages({
                  model: "imagen-3.0-generate-001",
                  prompt: promptCompleto,
                  config: {
                    numberOfImages: 1,
                    aspectRatio: selectedRatio,
                    outputMimeType: "image/png"
                  }
                });

                if (fallbackResponse2?.generatedImages?.[0]?.image?.imageBytes) {
                  rawData = fallbackResponse2.generatedImages[0].image.imageBytes;
                  rawMime = "image/png";
                  responseImgUrl = `data:image/png;base64,${rawData}`;
                  modelUsed = `Google AI Studio (imagen-3.0-generate-001 - Fallback 2)`;
                  console.log("[BACK] Fallback imagen-3.0-generate-001 gerou imagem com sucesso.");
                } else {
                  throw new Error("Nenhum byte de imagem retornado no fallback imagen-3.0-generate-001.");
                }
              } catch (fallbackErr2: any) {
                console.error("[api/generate] All image generation attempts and fallbacks failed.");
                errorDetails += `[Generation error: ${imagenErr.message || imagenErr}] `;
              }
            }
          }

          let width = 0;
          let height = 0;
          let bytes = 0;

          if (rawData) {
            
          let buffer = Buffer.from(rawData, "base64");
          
          bytes = buffer.length;

            const dims = getImageDimensions(buffer, rawMime);
            width = dims.width;
            height = dims.height;
          }

          // REQUIRED AFTER LOG
          console.log({
            mimeType: rawMime,
            bytes,
            width,
            height
          });

          // 4K Warning Validation
          if (sizeSelected === "4K" && (width < 3000 || height < 3000)) {
            console.warn(`[api/generate] WARNING: Requested 4K, but received resolution of ${width}x${height}px. Skipping any upscaling or modifications.`);
          }

        } catch (catastrophicErr: any) {
          console.error("[api/generate] Catastrophic error in loop iteration:", catastrophicErr);
          errorDetails += `[Catastrophic loop error: ${catastrophicErr.message || catastrophicErr}] `;
        }

        modelUsed = `Google AI Studio (${sizeSelected})`;

        if (responseImgUrl) {
          results.push(responseImgUrl);
        } else {
          lastErrors.push(`Variação ${i + 1} falhou: ${errorDetails}`);
        }
      }

      const debugInfo = (client as any)?.debugInfo || {};

      if (results.length === 0) {
        return res.status(500).json({ 
          error: `Geração falhou no backend. Detalhes: ${lastErrors.join("; ")}`,
          debugInfo
        });
      }

      res.json({ images: results, thought: finalPrompt, modelUsed, debugInfo });
    } catch (err: any) {
      console.error("Route /api/generate Error:", err);
      res.status(500).json({ 
        error: `Erro catastrófico na rota generate: ${err.message}`, 
        rawError: { message: err.message, stack: err.stack }
      });
    }
  });

  app.post("/api/gerar", async (req, res) => {
    console.log(`\n\n[api/gerar] --> STARTING REQUEST AT ${new Date().toISOString()}`);
    console.log(`[api/gerar] Body size: ${JSON.stringify(req.body).length} bytes`);
    try {
      const {
        base64DoSujeito,
        sujeitosBase64List = [],
        base64DoCenario,
        cenariosBase64List = [],
        promptTraduzido,
        resolutionInput = "1K",
        formato = "PNG",
        useEnvRef = false,
        tipografiaRefBase64 = "",
        tipografiaRefsList = [],
        designRefBase64 = "",
        designRefsList = [],
        referenciasEstilo = [],
        negativePrompt = "",
        customApiKey,
        desativarSujeito = false,
        logoBase64 = "",
        logosList = [],
        useLogo = false,
        logoInclusionType = "overlay",
        logoPosOverlay = "top_center",
        logoSizeOverlay = 20,
        dimensao = "1:1",
        somentePrompt = false
      } = req.body;

      console.log("\n--- CONFIGURAÇÃO DE GERAÇÃO (/api/gerar) ---");
      console.log({
        model: "gemini-3-pro-image-preview",
        resolution: resolutionInput,
        aspectRatio: dimensao,
        format: formato,
        useEnvRef,
        desativarSujeito
      });

      const cleanBase64 = (str: string): string => {
        if (!str) return "";
        return str.replace(/^data:image\/\w+;base64,/, "");
      };

      const sujeitoLimpo = cleanBase64(base64DoSujeito);
      const cenarioLimpo = cleanBase64(base64DoCenario);
      
      console.log("[BACK] Recebeu a requisição. Base64 Sujeito recebido? ", !!sujeitoLimpo);

      const hasSujeito = sujeitoLimpo || (Array.isArray(sujeitosBase64List) && sujeitosBase64List.some((s: any) => s && (typeof s === 'string' ? s.trim() !== "" : (s.data || s.url))));
      const hasCenario = cenarioLimpo || (Array.isArray(cenariosBase64List) && cenariosBase64List.some((c: any) => c && (typeof c === 'string' ? c.trim() !== "" : (c.data || c.url))));

      if (!somentePrompt && !desativarSujeito && !hasSujeito) {
        return res.status(400).json({ error: "Por favor, faça o upload de pelo menos uma imagem do Sujeito Principal antes de gerar." });
      }

      if (!somentePrompt && useEnvRef && !hasCenario) {
        return res.status(400).json({ error: "Por favor, faça o upload de pelo menos uma imagem de Cenário antes de gerar." });
      }

      const client = getAiClient(customApiKey);
      if (!client) {
        return res.status(403).json({ error: "Cliente GenAI não pôde ser inicializado. Verifique as credenciais IAM no console do GCP." });
      }

      const debugInfo = (client as any).debugInfo || {};
      const token = customApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyC3seHAMIgwPRxb-Ts1Q3Xds2PAL4mR89Q';
      const credentialsPath = path.join(process.cwd(), 'chave-vertex.json');
      const isVertex = fs.existsSync(credentialsPath) || token.startsWith('AQ.');

      // We use the requested model gemini-3-pro-image
      const targetModel = "gemini-3-pro-image-preview";
      
      let targetAspectRatio = "1:1";
      const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (validRatios.includes(dimensao)) {
        targetAspectRatio = dimensao;
      } else if (dimensao === "4:5" || dimensao === "2:3") {
        targetAspectRatio = "3:4";
      } else if (dimensao === "3:2") {
        targetAspectRatio = "4:3";
      }

      // --- START PROMPT & SYSTEM INSTRUCTION EXPANSION (MAXIMUM SIZE & DETAIL) ---
      let expandedPrompt = promptTraduzido;
      let expandedSystemInstruction = `You are an absolute master generative AI image prompt engineer, art director, and elite graphic designer capable of generating any niche of design, corporate cards, commercial advertisements, products, services, flyers, or social media posts across any niche (including events, clinics, unions, e-commerce, corporate, luxury, or minimal styles). Your mission is to generate ultra-realistic, premium, and impactful visual compositions tailored to the requested niche, layout grid, and branding style.`;

      try {
        console.log("[api/gerar] Initiating premium multimodal prompt & instruction expansion...");
        const expansionParts: any[] = [];

        // Helper to add clean base64 image part to prompt expansion
        const addImagePartToExpansion = (b64: string, label: string) => {
          const cleaned = cleanBase64(b64);
          if (cleaned) {
            expansionParts.push({
              inlineData: {
                data: cleaned,
                mimeType: "image/jpeg"
              }
            });
            expansionParts.push({ text: `[Multimodal Visual Reference for ${label}]` });
          }
        };

        // Attach design references (up to 2) to the prompt expansion model so it can analyze the layout!
        let addedDesignCount = 0;
        if (designRefBase64) {
          addImagePartToExpansion(designRefBase64, "Primary Design Layout Reference");
          addedDesignCount++;
        }
        if (Array.isArray(designRefsList)) {
          for (const ref of designRefsList) {
            if (addedDesignCount >= 2) break;
            const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
            if (dataStr) {
              addImagePartToExpansion(dataStr, `Design Layout Reference #${addedDesignCount + 1}`);
              addedDesignCount++;
            }
          }
        }

        // Attach subject reference (up to 1) so it knows what subject/object we are dealing with
        if (base64DoSujeito) {
          addImagePartToExpansion(base64DoSujeito, "Subject/Person Reference");
        }

        const logoInclusionRule = `\n5. LOGO & CONTAINER ERASURE (CRITICAL): You MUST completely ignore and erase any brand logos, logo symbols, logo container boxes, or header banners meant to hold logos that are present in the Design Layout Reference image. Do NOT copy them, do NOT describe them, and do NOT write "LOGO" or generate any white square placeholder cards. The area must remain completely clean and uniform with the rest of the background.`;
        const logoCompositionRule = `\n10. LOGO AREA CLEANLINESS: Replicate the background layout of the reference but leave the logo placement zone completely empty and clean, with 0% text, 0% placeholders, and 0% card container borders.`;
        const logoPromptRule = `\n5. Brand Logo Rendering: Instruct the generator to NEVER draw any logo shapes, text, or blank white squares. The background in the logo banner must remain perfectly clean, solid, and uniform.`;
        const logoPrintRule = `\n9. LOGO AREA CLEANLINESS: Replicate the background layout of the reference but leave the logo placement zone completely empty and clean, with 0% text or placeholders.`;
        const logoSysInstructionRule = `\n5. Logo Rendering: Strictly instruct the generator to NOT print any logo symbol, text, or blank white boxes on the layout. Keep the background clean.`;
        const logoEmbeddedRule = `\n9. LOGO INTEGRATION: Command the generator to keep the logo area completely solid and clean without rendering any white squares or text.`;
        const instructionPrompt = `You are the absolute ultimate master Generative AI Image Prompt Engineer, Art Director, and Elite Graphic Designer capable of generating any niche of design, corporate cards, commercial advertisements, products, services, flyers, or social media posts across any niche (including events, clinics, unions, e-commerce, corporate, luxury, or minimal styles).
Your job is to analyze the attached visual references (especially the Design Layout Reference images) along with the following initial layout and composition specification:
"${promptTraduzido}"

Based on this complete multimodal context, you must generate an extremely descriptive, highly accurate, professional prompt and system instruction. The absolute number one goal is extreme structural, compositional, stylistic, and visual faithfulness to the design details of the reference image.

CRITICAL VISUAL DESIGN RULES TO EXTRACT FROM THE ATTACHED DESIGN LAYOUT REFERENCE:
1. ABSOLUTE STYLE CLONING & VISUAL FIDELITY (CRITICAL): You MUST carefully analyze and extract the entire visual style, aesthetics, and design choices of the primary "Design Layout Reference" image and instruct the generator to copy them perfectly onto the new image:
   - MEDIUM & ART STYLE DETECTION (2D VS 3D): Identify if the Design Layout Reference is a 2D flat vector illustration, cartoon drawing, flat graphic design, or a 3D realistic render/photo. If it is a 2D flat vector/cartoon (like flat colored outlines of a hand/phone), you MUST strictly command the generator to produce a "2D flat vector illustration, flat cartoon graphics, clean vector outlines, uniform flat colors, solid fills, 0% 3D depth, 0% realism, 0% gradients, 0% drop shadows".
   - ARTISTIC MEDIUM OVERRIDE (CRITICAL): If you detect that the primary Design Layout Reference is a 2D flat vector illustration, cartoon, drawing, flat layout, or minimalist graphic design, you MUST completely ignore and override any instructions in the prompt asking for "realism, 3D renders, studio lighting, volumetric light, realistic skin, photography, or depth of field". You MUST strictly command the image generator to produce: "Flat 2D vector illustration style, clean cartoon drawing, solid flat color fills, thick clean borders, uniform shapes, 0% 3D depth, 0% gradients, 0% light reflections, 0% shading, 0% drop shadows".
   - TEXT EFFECTS & SHADING: Replicate the exact styling of the titles and texts. Describe if they have 3D bevels, glowing neon outlines, metallic textures, cursive calligraphic styling overlaid on bold fonts, solid color-blocked backgrounds (badges/labels), drop shadows, or layered masks.
   - LIGHTING & ATMOSPHERE: Describe the exact lighting setup of the reference (e.g. volumetric stage laser beams, soft warm golden bokeh backgrounds, colorful neon spotlights, backlights, high-contrast shadows).
   - BACKGROUND TEXTURES & GEOMETRY: Replicate the background texture exactly (e.g. grunge paper tears, paint splatters, clean color blocking, halftone dots, solid sheets).
   - DECORATIVE GRAPHIC ELEMENTS: Replicate any structural decorations, diagonal stripes, borders, stars, floating sparkles, or leaf motifs.
2. STRICT LAYOUT & COMPOSITION GRID: Mirror the exact positioning and composition of the reference (e.g., if the main subject is centered, or if there is a group of models, replicate that layout). Put the user's requested text in the exact corresponding spatial positions as the reference design text blocks.
3. ADAPTATION TO USER BRAND PALETTE: If the user provides custom brand colors (like black and gold or blue), adapt the layout and structural elements of the reference to use these brand colors, but preserve the style (e.g., use black/gold instead of orange/black, but keep the paint splatters, fonts, and drop shadows).
3. SUPPORTING GRAPHIC ELEMENTS & SOCIAL MEDIA: Look for any social media handles, symbols, or small details (like the Instagram logo/handle, website text, small badges). Command the generator to write and render these elements beautifully and cleanly on the image canvas in their exact corresponding positions.
4. SECONDARY PHOTOS & VISUAL MOTIFS: Look for any secondary photos or decorative graphics in the reference card. For instance, if there is a photo of people's hands joining, hands holding, or any supporting imagery, you MUST specify its presence and describe its integration: "subtly integrated into the bottom or background layer is a clear, polished photographic motif of people's hands joining together, representing connection, with warm rim lighting."
${logoInclusionRule}
6. SOCIAL HANDLE CASE FIDELITY (STRICTLY LOWERCASE): Explicitly instruct the generator to render any social media usernames or handles (containing "@") strictly in lowercase letters, using a thin, modern, high-contrast sans-serif font.
7. BRAND COLOR PALETTE ENFORCEMENT (CRITICAL): Look closely at the client's specification in: "${promptTraduzido}". If the client has provided custom brand colors, specific hex codes (#xxxxxx), or specific colors for "Color Palette" or "Lighting Setup" (e.g., specific ambient color, rim color, or fill color), you MUST strictly enforce these custom brand colors as the primary, dominant colors of the flyer's design, lighting, glows, and accents. Do NOT copy the color palette of the Design Layout Reference if the client has specified their own custom brand colors! Instead, adapt the layout, composition structure, and atmospheric depth of the reference to be perfectly styled under the client's custom brand colors.
8. ANTI-ARTIFACTS & CLEAN BACKGROUNDS (CRITICAL): If the design reference or prompt specifies a solid, flat, or clean background (e.g. solid dark blue, clean flat shapes), you MUST explicitly command the generator to use "0% film grain, 0% noise, 0% compression blocks, 0% texture artifacts, perfectly smooth flat solid colors, uniform gradients, and sharp clean vector lines". Do NOT allow the generator to add random textures, grunge effects, particle dust, lights, or blurs on top of solid background areas. There must be 0% rectangular seams, 0% blending borders, 0% grid boundaries, or color mismatch squares. The background must flow perfectly under and around all elements as a single, continuous, uniform plane.
8. FULL TYPOGRAPHY EMBEDDING (CRITICAL): You MUST command the generator to write, draw, print, and beautifully integrate all titles, text layers, event dates, contact details, and social handles directly onto the image canvas. Style them with gorgeous, sharp, modern typography, ensuring high legibility and precise alignment matching the reference design layout.
9. SUBJECT IDENTITY PRESERVATION VS DESIGN REFERENCE INTERPRETATION (CRITICAL): Look closely at the provided references. If a "Referência do Sujeito" (Subject Reference) image is provided, you MUST command the generator to perfectly copy, preserve, and clone the exact faces, identities, hair styles, facial features, and likenesses of ALL people / models present in that Subject Reference image into the generated design flyer (e.g., if there are two people, a couple, or a family, generate ALL of them together in their respective positions). Do NOT generate new faces or change their identities. However, if there is a person inside the "Design Layout Reference" image, you MUST NOT copy the face/person from that design layout reference; instead, interpret their pose/category and substitute them with the exact faces/likenesses of the client's provided "Referência do Sujeito" (Subject Reference).
${logoCompositionRule}
11. CARD DESIGN PRESERVATION: Replicate the exact shape of the card panels (e.g., if there's a rounded panel on the right side of the canvas where the photo of hands is placed, generate a rounded panel exactly there). The image must contain the full, beautiful card layouts and panels, not just a plain backdrop.
12. STRICT REFERENCE PRESERVATION (WHEN EDITING): If the user's specification requests an edit to a specific reference image (e.g. "remove text and keep the symbol" on a logo), you MUST instruct the generator to preserve the original visual structure, shapes, colors, and details of the provided reference with absolute 100% exact fidelity. DO NOT redesign, reimagine, stylize, or alter the core shapes of the reference. It must look identical, only applying the requested edit (e.g. erasing the text).

The output must be returned as a JSON object with exactly two string fields:
{
  "prompt": "...",
  "systemInstruction": "..."
}

CRITICAL RULES FOR "prompt" (Mega Prompt Mestre):
1. Must be written in technical, descriptive, high-fidelity English to achieve absolute perfection in image generators (like gemini-3-pro-image, Imagen 3, or Midjourney V6).
2. Do NOT write generic text-to-image filler text. Keep the description concise, precise, and targeted directly at copying the reference image's true structure, background, lighting, and elements.
3. Replicate the precise lighting direction and color palette of the Design Layout Reference. If the reference is dark gray and white, do not add golden elements. If the reference is warm brown, make it warm brown. CRITICAL OVERRIDE: If the client specifies custom brand colors in their layout specification (e.g. "Color Palette: #xxxxxx" or explicit ambient, rim, and complementary colors), you MUST completely override the reference's color palette with the client's custom brand colors. Apply these client colors to all background shades, ambient glows, lighting beams, and graphic highlights, ensuring the layout layout strictly matches the reference, but the color styling strictly matches the client's brand colors.
4. Exclusions/Negative constraints: specify exactly what should NOT appear (e.g. generic templates, deformed faces, text hallucinations, bad hands, low resolution).
${logoPromptRule}
6. Lowercase Social Handles: Mandate that all social media usernames/handles (containing "@") be written strictly in lowercase letters and printed directly on the image canvas.
7. Typography Rendering: Replicate and write all custom texts, titles, websites, numbers, and handles directly on the card canvas, styling them with high-definition, sharp, professional typography.
8. Request a completely new, high-end, original custom subject (person or element) matching the context of the reference photo, avoiding exact face or identity copies.
9. Exact Visual Trace (Edit Mode): If the user edits a reference, demand the generator to perfectly trace and retain the exact shape and proportions of the original, without hallucinating variations.
${logoPrintRule}

CRITICAL RULES FOR "systemInstruction":
1. Must be written in highly professional, technical, authoritative English, serving as a strict rules guide for the image generator.
2. It must act as the ultimate set of strict rules/guidelines for the image generator, dictating exactly how to interpret, parse, and execute the prompt with absolute visual fidelity.
3. Strict Adherence to Card Layout and Panels: Instruct the generator to replicate the full layout structure, panel divisions, cards, background textures, lighting style, and overall styling of the reference image. Do NOT generate just a plain background backdrop; generate all card panels, split backgrounds, and graphic dividers exactly.
4. Custom Brand Color Palette Override: Explicitly instruct the image generator that if custom brand color hex codes or palette colors are defined in the prompt (e.g., custom accent colors or specific lighting colors), it must strictly use those exact colors for the scene's ambient lighting, highlights, text colors, card panels, and backdrop accents, completely overriding the colors of the design layout reference image while preserving its design composition structure.
${logoSysInstructionRule}
6. Lowercase Instagram Handles: Require the generator to render any social media handle containing "@" strictly in lowercase letters, printing them directly on the canvas.
7. Custom Text Enforcement & Printing: Strictly instruct the generator to replace any text content, social media usernames, or contact details present in the visual reference with the customized text parameters supplied in the prompt, and write/render them beautifully and cleanly onto the card image canvas.
8. Subject Likeness & Identity Preservation: Instruct the generator to perfectly preserve the faces, likenesses, expressions, and identities of ALL people / models provided in the "Referência do Sujeito" (Subject Reference) image (e.g. if the image contains two models, clone and place BOTH models together in the final design layout). It must place these exact people into the design layout, adapting only their lighting/shadows to match the scene. If no Subject Reference is provided, only then generate a new high-quality model.
9. Strict Visual Fidelity on Edited References: If the user explicitly asks to edit a provided reference (like stripping text from a logo), command the image generator to treat the remaining parts of that reference as a holy artifact, preserving 100% of its original shape, vector lines, colors, and proportions without any hallucinated alterations.
${logoEmbeddedRule}

Return ONLY the JSON object. Do not include any conversational text or markdown formatting except the json code block itself.`;

        expansionParts.push({ text: instructionPrompt });

        const expResponse = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: expansionParts
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                systemInstruction: { type: "string" }
              },
              required: ["prompt", "systemInstruction"]
            }
          }
        });

        const expText = expResponse.text || "";
        console.log("[api/gerar] Gemini prompt/system instruction expanded. Raw response length:", expText.length);
        
        let cleanedExpText = expText.trim();
        if (cleanedExpText.startsWith("```")) {
          cleanedExpText = cleanedExpText.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
        }
        try {
          const parsed = JSON.parse(cleanedExpText);
          if (parsed.prompt && parsed.prompt.trim() !== "") {
            expandedPrompt = parsed.prompt.trim();
          }
          if (parsed.systemInstruction && parsed.systemInstruction.trim() !== "") {
            expandedSystemInstruction = parsed.systemInstruction.trim();
          }
          console.log("[api/gerar] JSON parsed successfully. Expanded prompt length:", expandedPrompt.length, "Expanded instruction length:", expandedSystemInstruction.length);
        } catch (jsonErr) {
          console.warn("[api/gerar] Failed to parse expanded JSON, trying regex...", jsonErr);
          const promptMatch = expText.match(/"prompt"\s*:\s*"([^"]+)"/);
          const sysMatch = expText.match(/"systemInstruction"\s*:\s*"([^"]+)"/);
          if (promptMatch && promptMatch[1]) {
            expandedPrompt = promptMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          }
          if (sysMatch && sysMatch[1]) {
            expandedSystemInstruction = sysMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          }
        }
      } catch (expErr) {
        console.error("[api/gerar] Error generating premium prompt/system expansion with Gemini:", expErr);
      }
      // --- END PROMPT & SYSTEM INSTRUCTION EXPANSION ---

      // Build the parts array for gemini-3-pro-image (multimodal generateContent)
      const parts: any[] = [];

      // 1. Core text prompt (using the beautiful, mega expanded prompt!)
      let fullPrompt = expandedPrompt;

      // Extract typography block from the original prompt to ensure it is NOT lost in LLM translation
      const typoMatch = promptTraduzido.match(/=== TYPOGRAPHY & TEXT LAYOUT ===[\s\S]*?(?=\n===|$)/);
      if (typoMatch && typoMatch[0]) {
        fullPrompt += "\n\n" + typoMatch[0];
      }
      
      // Also extract color palette if present
      const colorMatch = promptTraduzido.match(/Color Palette: [^\n]*/);
      if (colorMatch && colorMatch[0]) {
        fullPrompt += "\n\n" + colorMatch[0];
      }

      
      // Force append absolute critical constraints to the prompt so both gemini-3-pro-image and fallbacks receive them
      const logoMandatoryRule = `- NO LOGO CONTAINERS OR SQUARES (CRITICAL): The AI generator is STRICTLY FORBIDDEN from drawing, printing, or creating any logo placeholder, blank square, white box, text, label, or colored container/card backgrounds to hold the logo (e.g. no black/yellow/blue squares or rectangles behind the logo). Erase any logo container boxes from the reference design. The background behind the logo must be 100% continuous and uniform with the main background, with absolutely NO local squares or borders holding it.`;

      const mandatorySuffix = `\n\n=== ABSOLUTE CRITICAL CONSTRAINTS (MANDATORY) ===
- TOTAL FIDELITY & ZERO OMISSIONS (CRITICAL): If a Design Layout Reference is provided, you MUST perfectly clone EVERYTHING from it (the layout, the spatial positioning of texts, the graphic elements, the background, the subject pose/lighting). You MUST put the texts EXACTLY in the same spatial locations as they are in the reference. DO NOT skip any text fields. Replicate the exact typography hierarchy.
- EXACT VISUAL CLONE OF DESIGN REFERENCE: You MUST perfectly trace and clone the exact shapes, layout grids, panel structures, background gradients, textures, and geometric dimensions of the provided Design Layout Reference. Do NOT invent new shapes, structures, or change the composition grid. It must look 100% identical in layout and structural design, simply applying the new text, logos, and colors.
- BRAND COLOR PALETTE ENFORCEMENT (CRITICAL): If custom colors, hex codes, or light setup colors are specified in the prompt above, you MUST strictly and aggressively use those EXACT colors for the entire graphic composition, background panels, highlights, glows, and ambient lighting. You MUST completely OVERRIDE the original reference flyer's colors with the requested colors. Do NOT use the reference colors if custom colors are provided!
- TEXT COMPLETENESS & PLACEMENT (CRITICAL): You MUST print ALL provided text fields, titles, and words exactly as requested. DO NOT SKIP ANY TEXT. You MUST place the text EXACTLY in the same spatial positions as the original text blocks found in the Design Layout Reference. DO NOT put text in random places. Replicate the original typographical hierarchy and alignment perfectly, but using the new text.
- COMPLETE CARD LAYOUT GENERATION: Do NOT generate just a plain empty background backdrop. You MUST generate the complete graphic composition, including all layouts, cards, panels, curved border divides, background textures, lighting setups, and the main visual subjects (e.g., joining hands, models, or products) in their exact spatial positions, proportions, and layouts as shown in the Design Layout Reference image.
- EMBEDDED TYPOGRAPHY (MANDATORY): You MUST print, write, embed, and render all actual written texts, titles, words, acronyms, letters, numbers, and website URLs directly onto the image canvas. Style them with beautiful, modern, extremely crisp, and highly-legible typography matching the alignments and visual style of the reference design. All social media usernames or handles (starting with "@") must be printed strictly in lowercase letters.
${logoMandatoryRule}`;

      if (negativePrompt && negativePrompt.trim() !== "") {
        fullPrompt += `\nAvoid / Negative constraints: old logos, original reference text, hallucinated words, ${negativePrompt.trim()}`;
      } else {
        fullPrompt += `\nAvoid / Negative constraints: old logos, original reference text, original reference logos, hallucinated words, incorrect spelling`;
      }
      
      fullPrompt += mandatorySuffix;
      parts.push({ text: fullPrompt });

      // Helper to add base64 images to parts
      const addImagePart = (b64: string, label: string) => {
        const cleaned = cleanBase64(b64);
        if (cleaned) {
          parts.push({
            inlineData: {
              data: cleaned,
              mimeType: "image/jpeg"
            }
          });
          parts.push({ text: label });
        }
      };

      // 2. Add Subject References
      if (!desativarSujeito) {
        if (base64DoSujeito) {
          addImagePart(base64DoSujeito, "Referência do Sujeito Principal");
        }
        if (Array.isArray(sujeitosBase64List)) {
          sujeitosBase64List.forEach((ref: any, idx: number) => {
            const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
            if (dataStr) {
              addImagePart(dataStr, `Referência de Sujeito Adicional ${idx + 1}`);
            }
          });
        }
      }

      // 3. Add Scenario References
      if (useEnvRef) {
        if (base64DoCenario) {
          addImagePart(base64DoCenario, "Referência de Cenário/Ambiente");
        }
        if (Array.isArray(cenariosBase64List)) {
          cenariosBase64List.forEach((ref: any, idx: number) => {
            const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
            if (dataStr) {
              addImagePart(dataStr, `Referência de Cenário Adicional ${idx + 1}`);
            }
          });
        }
      }

      // 4. Add Typography References
      if (tipografiaRefBase64) {
        addImagePart(tipografiaRefBase64, "Referência de Tipografia");
      }
      if (Array.isArray(tipografiaRefsList)) {
        tipografiaRefsList.forEach((ref: any, idx: number) => {
          const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
          if (dataStr) {
            addImagePart(dataStr, `Referência de Tipografia Adicional ${idx + 1}`);
          }
        });
      }

      // 5. Add Design References
      // We ALWAYS feed the design reference image so that gemini-3-pro-image knows the exact layout, structure, panel divisions, and geometry to replicate.
      if (designRefBase64) {
        addImagePart(designRefBase64, "Referência de Design/Layout");
      }
      if (Array.isArray(designRefsList)) {
        designRefsList.forEach((ref: any, idx: number) => {
          const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
          if (dataStr) {
            addImagePart(dataStr, `Referência de Design Adicional ${idx + 1}`);
          }
        });
      }

      // 6. Add Style References (referenciasEstilo)
      if (Array.isArray(referenciasEstilo)) {
        referenciasEstilo.forEach((ref: any, idx: number) => {
          const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
          if (dataStr) {
            addImagePart(dataStr, `Referência de Estilo ${idx + 1}`);
          }
        });
      }

      // 7. Add Logo References
      if (logoBase64) {
        addImagePart(logoBase64, "Referência de Logotipo");
      }
      if (Array.isArray(logosList)) {
        logosList.forEach((ref: any, idx: number) => {
          const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
          if (dataStr) {
            addImagePart(dataStr, `Referência de Logotipo Adicional ${idx + 1}`);
          }
        });
      }

      if (somentePrompt) {
        return res.json({
          image: "",
          prompt: expandedPrompt,
          systemInstruction: expandedSystemInstruction,
          modelUsed: "Zion AI (Premium Prompt Generator)",
          requestedResolution: resolutionInput,
          returnedWidth: 0,
          returnedHeight: 0
        });
      }

      // Build separate parts for the image generator so it recreates layout from scratch ("do zero")
      // and does NOT try to stitch/patch the reference layout image.
      const imageGeneratorParts: any[] = [];
      imageGeneratorParts.push({ text: promptCompleto });
      
      if (!desativarSujeito) {
        if (base64DoSujeito) {
          const cleaned = cleanBase64(base64DoSujeito);
          if (cleaned) {
            imageGeneratorParts.push({
              inlineData: {
                data: cleaned,
                mimeType: "image/jpeg"
              }
            });
            imageGeneratorParts.push({ text: "Referência do Sujeito Principal" });
          }
        }
        if (Array.isArray(sujeitosBase64List)) {
          sujeitosBase64List.forEach((ref: any, idx: number) => {
            const dataStr = typeof ref === 'string' ? ref : (ref?.data || ref?.url);
            const cleaned = dataStr ? cleanBase64(dataStr) : null;
            if (cleaned) {
              imageGeneratorParts.push({
                inlineData: {
                  data: cleaned,
                  mimeType: "image/jpeg"
                }
              });
              imageGeneratorParts.push({ text: `Referência de Sujeito Adicional ${idx + 1}` });
            }
          });
        }
      }

      let responseImgUrl = "";
      let modelUsed = `Google AI Studio (${targetModel})`;

      try {
        const sizeSelected = (resolutionInput === "4K" || resolutionInput === "8K") ? "4K" : (resolutionInput === "2K" ? "2K" : "1K");
        console.log(`[api/gerar] Generating image with ${targetModel} - Target resolution: ${sizeSelected}...`);
        
        // REQUIRED BEFORE LOG
        console.log({
          provider: "Vertex AI",
          location: "global",
          model: "gemini-3-pro-image-preview",
          requestedSize: sizeSelected,
          aspectRatio: targetAspectRatio
        });

        let rawData = "";
        let rawMime = "image/png";
        let width = 0;
        let height = 0;
        let bytes = 0;

        try {
          const response = await client.models.generateContent({
            model: targetModel,
            contents: [
              {
                role: "user",
                parts: imageGeneratorParts
              }
            ],
            config: {
              systemInstruction: expandedSystemInstruction,
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio: targetAspectRatio,
                imageSize: sizeSelected,
                outputMimeType: "image/png"
              }
            }
          });

          console.log("[BACK] Resposta recebida com sucesso de gemini-3-pro-image.");

          if (response?.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                rawData = part.inlineData.data;
                rawMime = part.inlineData.mimeType || "image/png";
                responseImgUrl = `data:${rawMime};base64,${rawData}`;
                break;
              }
            }
          }

          if (!responseImgUrl) {
            throw new Error("Nenhuma imagem gerada retornada no corpo da resposta do gemini-3-pro-image.");
          }

          modelUsed = `Vertex AI (gemini-3-pro-image)`;

        } catch (genErr: any) {
          console.warn("[api/gerar] Primary model gemini-3-pro-image failed. Attempting fallback to imagen-3.0-generate-002...", genErr.message || genErr);
          
          try {
            console.log(`[api/gerar] Calling generateImages with model: imagen-3.0-generate-002`);
            const fallbackResponse = await (client.models as any).generateImages({
              model: "imagen-3.0-generate-002",
              prompt: fullPrompt,
              config: {
                numberOfImages: 1,
                aspectRatio: targetAspectRatio,
                outputMimeType: "image/png"
              }
            });

            if (fallbackResponse?.generatedImages?.[0]?.image?.imageBytes) {
              rawData = fallbackResponse.generatedImages[0].image.imageBytes;
              rawMime = "image/png";
              responseImgUrl = `data:image/png;base64,${rawData}`;
              modelUsed = `Vertex AI (imagen-3.0-generate-002 - Fallback)`;
              console.log("[BACK] Fallback imagen-3.0-generate-002 gerou imagem com sucesso.");
            } else {
              throw new Error("Nenhum byte de imagem retornado no fallback imagen-3.0-generate-002.");
            }
          } catch (fallbackErr: any) {
            console.warn("[api/gerar] Fallback to imagen-3.0-generate-002 failed. Attempting fallback to imagen-3.0-generate-001...", fallbackErr.message || fallbackErr);
            
            try {
              console.log(`[api/gerar] Calling generateImages with model: imagen-3.0-generate-001`);
              const fallbackResponse2 = await (client.models as any).generateImages({
                model: "imagen-3.0-generate-001",
                prompt: fullPrompt,
                config: {
                  numberOfImages: 1,
                  aspectRatio: targetAspectRatio,
                  outputMimeType: "image/png"
                }
              });

              if (fallbackResponse2?.generatedImages?.[0]?.image?.imageBytes) {
                rawData = fallbackResponse2.generatedImages[0].image.imageBytes;
                rawMime = "image/png";
                responseImgUrl = `data:image/png;base64,${rawData}`;
                modelUsed = `Vertex AI (imagen-3.0-generate-001 - Fallback 2)`;
                console.log("[BACK] Fallback imagen-3.0-generate-001 gerou imagem com sucesso.");
              } else {
                throw new Error("Nenhum byte de imagem retornado no fallback imagen-3.0-generate-001.");
              }
            } catch (fallbackErr2: any) {
              console.error("[api/gerar] All image generation attempts and fallbacks failed.");
              throw genErr; // throw original gemini-3-pro-image error to show user the core quota limit or error
            }
          }
        }

        if (rawData) {
          
          let buffer = Buffer.from(rawData, "base64");
          
          bytes = buffer.length;

          const dims = getImageDimensions(buffer, rawMime);
          width = dims.width;
          height = dims.height;
        }

        // REQUIRED AFTER LOG
        console.log({
          mimeType: rawMime,
          bytes,
          width,
          height
        });

        // === VALIDATION ===
        if (sizeSelected === "4K" && (width < 3000 || height < 3000)) {
          console.warn(`[api/gerar] WARNING: Requested 4K, but received resolution of ${width}x${height}px. Skipping any upscaling or modifications.`);
        }

        let finalImage = responseImgUrl;
        let finalWidth = width;
        let finalHeight = height;

        if (resolutionInput === "8K" && responseImgUrl) {
          console.log(`[api/gerar] 8K requested! Applying bicubic Super-Resolution upscale to 7680px...`);
          try {
            const upscaled = await upscaleImage(responseImgUrl, 7680, formato);
            finalImage = upscaled.image;
            finalWidth = upscaled.width;
            finalHeight = upscaled.height;
            modelUsed = `${modelUsed} + 8K Super-Resolution Upscale`;
          } catch (err) {
            console.error("[api/gerar] Upscale error:", err);
          }
        }

        res.json({ 
          image: finalImage, 
          prompt: expandedPrompt, 
          systemInstruction: expandedSystemInstruction,
          modelUsed,
          debugInfo,
          requestedResolution: resolutionInput,
          returnedWidth: finalWidth,
          returnedHeight: finalHeight
        });

      } catch (genErr: any) {
        console.error("[api/gerar] Generation core error:", genErr.message || genErr);
        const errorMsg = genErr.message || String(genErr);
        const errorStack = genErr.stack || "";
        const rawResponse = genErr.response || genErr.status || "no raw response details";

        return res.status(500).json({ 
          error: `Erro bruto da API do Google: ${errorMsg}`, 
          rawError: {
            message: errorMsg,
            stack: errorStack,
            rawResponse: rawResponse,
            status: genErr.status,
            statusCode: genErr.statusCode
          },
          debugInfo: debugInfo,
          prompt: promptTraduzido
        });
      }
    } catch (err: any) {
      console.error("Route /api/gerar Error:", err);
      res.status(500).json({ 
        error: `Erro catastrófico da rota: ${err.message}`, 
        rawError: { message: err.message, stack: err.stack }
      });
    }
  });

  // Prompt Extractor: analyze an image and return the prompt that describes its composition
  app.post("/api/extract-prompt", async (req, res) => {
    try {
      const { imageData, mimeType, customApiKey } = req.body;
      if (!imageData) return res.status(400).json({ error: "Imagem não fornecida." });
      const currentAi = getAiClient(customApiKey);
      if (!currentAi) return res.status(400).json({ error: "API Key não configurada." });

      const cleanData = imageData.replace(/^data:image\/\w+;base64,/, "");
      const response = await currentAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: cleanData, mimeType: mimeType || "image/jpeg" } },
              { text: `You are an expert creative director and AI prompt engineer. Analyze this image in extreme detail and reconstruct the precise generative AI prompt that would have been used to create it. Focus on: subject description, pose, expression, clothing, lighting setup (key light, rim light, ambient color), background/environment, color palette, visual style, mood, composition, framing (close-up/medium/wide), any text elements, graphic design elements, and technical specifications. Format your response as a single detailed paragraph in English, suitable for use as a generative AI image prompt. Output ONLY the prompt text, no explanations.` }
            ]
          }
        ]
      });
      res.json({ prompt: response.text || "" });
    } catch (error: any) {
      console.error("Extract Prompt Error:", error);
      const errorMsg = error.message || String(error);
      const isQuota = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("exhausted") || errorMsg.includes("quota");
      
      let userMessage = error.message;
      let status = 500;
      
      if (isQuota) {
        userMessage = "Cota de requisições excedida (429) ou créditos esgotados. Por favor, aguarde alguns minutos ou insira sua própria API Key nas configurações.";
        status = 429;
      }
      
      res.status(status).json({ error: userMessage });
    }
  });

  // Chat Assistant Endpoint: routes user chats to different expert personas
  app.post(["/api/chat-assistente", "/api/chat-agentes"], async (req, res) => {
    try {
      const { assistantId, message, imageBase64, attachedFiles = [], history = [], customApiKey } = req.body;
      const currentAi = getAiClient(customApiKey);
      if (!currentAi) return res.status(400).json({ error: "API Key não configurada." });

      const baseInstructions = `REGRAS ABSOLUTAS DE ESTILO FLYER BR:
1. Pense como um Diretor de Arte de Flyers Brasileiros Profissionais (Shows, Eventos, Corporativos, Produtos).
2. Você DEVE incluir O MÁXIMO DE INFORMAÇÕES e detalhes técnicos possíveis para alcançar resultados "Masterpiece".
3. Especifique detalhadamente: Textura, Iluminação 3 Pontos (Key light, Fill light, Rim light/Luz de Recorte), Paleta de Cores, Glow, Tipografia/Texto e Elementos Flutuantes (particles, smoke, flares).
4. QUALIDADE ABSOLUTA E ZERO BUGS: Especifique que a imagem deve ter resolução EXTREMAMENTE ALTA (8K, uncompressed, raw, masterpiece, insanely detailed). Não deve haver NENHUM ruído (noise), nenhuma cintilação, nenhuma aberração cromática. Textos e elementos devem ser gerados 100% PERFEITOS, sem deformações. Ao dar zoom máximo, a qualidade deve ser impecável.
5. Diagramação & Margens MILIMÉTRICAS: Diagramações perfeitamente balanceadas e bonitas. Respeite estritamente as margens de respiro, safety areas e a proporção da arte (1:1, 4:5, 9:16). Os espaçamentos entre os elementos, textos e laterais devem ser calculados milimetricamente. Crie uma profundidade 3D perfeita onde elementos se entrelaçam harmoniosamente.
6. Posicionamento de Logos: Identifique o melhor lugar para colocar logos sem fugir da diagramação e organização da arte. Mantenha os espaçamentos corretos nas laterais.
7. Contraste e Cores Inteligentes: Use as cores corretamente em cada elemento. NUNCA coloque um elemento em cima de outro com a mesma cor ou cor parecida (ex: texto claro em fundo claro), garanta contraste perfeito para legibilidade e estética.
8. Integração: Integração impecável do sujeito ao fundo (ambient occlusion, edge blending).
9. Remoções: Se o usuário pedir para remover algo (texto, logo, pessoa), OBEDEÇA ESTRITAMENTE (Negative Prompting rígido).
10. Textos: Nunca adicione textos aleatórios ou logos que não foram pedidos. Deixe claro no prompt: "DO NOT add extra logos or unrequested text".
11. Ao criar prompts, crie MEGA PROMPTS estilo Midjourney v6 com extrema riqueza descritiva, enfatizando sempre a maior qualidade e tamanho de arquivo possível.\n\n`;

      let systemInstruction = baseInstructions;
      switch (assistantId) {
        case "prompt-extrator":
          systemInstruction += `Você é o Prompt Extrator da Zion, assumindo a persona de um DESIGNER EXPERIENTE PROFISSIONAL. Seu objetivo máximo é analisar as imagens de referência enviadas e extrair um MEGA PROMPT técnico e detalhado para IA.
Você deve compreender CADA IMAGEM de referência enviada. Se receber um Sujeito e um Cenário, você DEVE descrevê-los com riqueza de detalhes no prompt, mapeando onde cada um deve ficar. NUNCA use palavras como 'filme', 'cinematográfico', 'cinema' (use 'high-end commercial photography', 'studio lighting', 'sharp focus', 'flyer br style', 'masterpiece'). Responda em Português, mas gere o prompt da imagem em INGLÊS TÉCNICO.`;
          break;
        case "creative-assistant":
          systemInstruction += "Você é o Assistente Criativo da Zion, um MESTRE do DESIGN ESTILO FLYER BR. Sua missão é ter ideias brilhantes, ousadas e de nível de agência internacional para flyers, artes e banners. Sugira paletas de neon, iluminação agressiva (recorte, glow), posicionamento 3D de elementos flutuantes e contrastes perfeitos, independente do nicho (eventos, produtos, lançamentos, gospel, etc). O resultado deve ser sempre 'TUDO PERFEITO', orquestrando texto, elementos, cenário e pessoa em uma visão criativa única.";
          break;
        case "diretor-criativo":
          systemInstruction += `Você é o Diretor Criativo da Zion (O 'Guru' do Flyer BR). Você mentora designers a elevarem o nível de suas artes para o padrão Premium/Masterpiece de Eventos e Publicidade.
Você tem OLHO CLÍNICO e INTELIGÊNCIA DE DESIGN:
1. PENSE e DECIDA de forma inteligente se a arte deve usar um Sujeito Principal (pessoa, modelo, artista, palestrante, atleta, ou um produto físico de destaque como perfume, bebida, tênis, etc.):
   - Se SIM (se houver fotos de sujeito/produto, se o usuário descrever um sujeito/personagem central, ou se for um flyer típico de shows, eventos de pessoas, etc.), você DEVE definir explicitamente "desativarSujeito": false no JSON.
   - Se NÃO (se for uma arte puramente tipográfica, minimalista, institucional de avisos, apenas cenário urbano/abstrato sem foco em pessoas/produtos, ou se o usuário pediu para não ter sujeitos/pessoas), você DEVE definir "desativarSujeito": true no JSON.
2. Se o usuário mandar uma imagem de flyer completo (card de referência) sem dizer nada, analise esse card imediatamente, descubra que se trata de uma referência de layout, mapeie-o OBRIGATORIAMENTE como "design" no seu JSON em "mapeamentoImagens" para preenchimento automático.
3. Se o estilo visual que você quer aplicar a essa geração exigir alguma característica estética especial do card ou se o usuário quiser que você copie, defina "enableEstiloVisual": true e descreva detalhadamente em "estiloVisualCustom" (O estilo visual customizado deve ser preenchido automaticamente, detalhando texturas, iluminação, atmosfera e vibe). Se não for necessário nenhum estilo visual, você pode desativar explicitamente ("enableEstiloVisual": false).
4. No fotos de cenário (promptCenario): se não houver um cenário específico enviado pelo usuário, você deve colocar a imagem do card de referência como cenário também e descrever em "promptCenario" o que quer extrair daquele cenário (ex: descrever a atmosfera urbana, o céu dramático ou as luzes de holofotes).
Sua mente processa design analisando:
1. Foco e Recorte (Saber separar Sujeito e Cenário).
2. Profundidade 3D (O que passa na frente do texto, o que fica atrás).
3. Iluminação Dramática e Cores (Glow, Luz de Contraste, Reflexos).
4. Tipografia Impecável (Hierarquia de textos pesados, metálicos ou neon).
Analise qualquer imagem de referência e diga como reproduzir aquela excelência técnica em Midjourney, Leonardo AI ou outras plataformas, mapeando a estrutura perfeita para cada botão/opção da arte.

MUITO IMPORTANTE: O usuário EXIGE que você automatize a interface. No final da sua resposta, você DEVE SEMPRE incluir um bloco \`\`\`json { ... } \`\`\` contendo TODOS os parâmetros. 
Se a arte não tiver pessoas, retorne "desativarSujeito": true e "noPeople": true. Se tiver, retorne "desativarSujeito": false. 
Você deve usar a inteligência para preencher "cores", "promptCenario", "estiloVisualCustom", "useLogo", "enableTypography", etc. GERE O JSON PARA APLICAR AS ALTERAÇÕES NA INTERFACE!`;;
          break;
        case "copy-ads":
          systemInstruction += "Você é o Copy Zion Ads, especialista em copywriting para anúncios estáticos de alta conversão. Você deve OBRIGATORIAMENTE estruturar todas as suas copys utilizando a técnica AIDA (Atenção, Interesse, Desejo, Ação). É TERMINANTEMENTE PROIBIDO inventar ou inserir marcações de perfis de terceiros (@) em qualquer sugestão de texto. Responda em português do Brasil.";
          break;
        case "copy-carroseis":
          systemInstruction += "Você é o Copy Zion Carrosséis, especialista em roteiros e copywriting slide-a-slide para carrosséis do Instagram de alto engajamento. Você deve OBRIGATORIAMENTE estruturar a copy utilizando a técnica AIDA (Atenção, Interesse, Desejo, Ação) distribuída nos slides. É TERMINANTEMENTE PROIBIDO inventar ou inserir marcações de perfis de terceiros (@) em qualquer sugestão de texto. Responda em português do Brasil.";
          break;
        case "copy-sites":
        case "easy-copy":
          systemInstruction += "Você é o Easy Copy (Copy Zion Sites e LPs), especialista em copywriting de alta conversão para landing pages, páginas de vendas e sites institucionais. Você deve OBRIGATORIAMENTE estruturar a estrutura e as sessões de copy utilizando a técnica AIDA (Atenção, Interesse, Desejo, Ação). É TERMINANTEMENTE PROIBIDO inventar ou inserir marcações de perfis de terceiros (@) em qualquer sugestão de texto. Responda em português do Brasil.";
          break;
        case "analisador-design":
          systemInstruction += "Você é o Analisador Crítico de Design da Zion. Com um 'olho de águia' de um especialista de Elite em Flyers BR, avalie rigorosamente cada pixel das artes enviadas. Pontue exatamente o que não está funcionando em: 1) Recorte/Integração do Sujeito no cenário; 2) Tipografia e Contraste; 3) Iluminação (falta de luz de recorte, flat lighting, etc); 4) Poluição Visual. Seja cirúrgico para levar o designer do amador ao nível Masterpiece.";
          break;
        case "analise-estrategica":
          systemInstruction += "Você é um mestre em Análise Estratégica. Sua missão é investigar o lead a fundo com base nas informações fornecidas, descobrir dores reais, necessidades ocultas e traçar uma vantagem estratégica infalível para a negociação. Forneça insights práticos de como abordar e converter esse lead.";
          break;
        case "icp":
          systemInstruction += "Você é um estrategista especialista em ICP (Ideal Customer Profile) e Posicionamento de Marca. Sua missão é ajudar a definir e fortalecer o posicionamento do usuário, transmitir autoridade no mercado e criar um perfil detalhado do cliente ideal para atrair pessoas prontas para comprar.";
          break;
        case "atendimento":
          systemInstruction += "Você é um especialista em Atendimento Premium e Negociação. Sua missão é ajudar a fechar mais projetos fornecendo scripts, respostas e conduções estratégicas de conversa que geram extrema confiança, quebram objeções facilmente e conduzem o cliente ao 'sim'.";
          break;
        case "webson-vendedor":
          systemInstruction += "Você é Webson Vendedor, um expert implacável em fechamento de vendas. Analise as mensagens ou o histórico da conversa fornecida e entregue a resposta exata (copy-paste) ou a estratégia perfeita e agressiva (porém elegante) para fechar a venda imediatamente.";
          break;
        case "estrutura-sites":
          systemInstruction += "Você é um arquiteto e mestre em Estrutura de Sites [IA]. Você entende o briefing do usuário e cria a estrutura visual (wireframe em texto) e o sitemap do site como um especialista em UX/UI, focando em conversão, retenção e jornada do usuário.";
          break;
        case "easy-coder":
          systemInstruction += "Você é o Easy Coder [IA], um Engenheiro de Software Sênior especialista em desenvolvimento web moderno (React, Tailwind, Node, TypeScript). Ajude com códigos, desenvolvimento web, scripts e soluções técnicas. Forneça respostas diretas, códigos limpos e funcionais sem muita enrolação.";
          break;
        case "easy-image":
          systemInstruction += "Você é o Easy Image, um diretor de arte especialista em Prompt Engineering para Midjourney V6 e Dall-e 3. Gere ideias criativas de imagens e extraia prompts precisos com o maior nível de detalhes, parâmetros técnicos de câmera e assertividade estética.";
          break;
        case "analisador-paginas":
          systemInstruction += "Você é o Analisador Crítico de Páginas. Com um olhar de CRO e Web Design de Elite, analise as descrições ou prints de landing pages e pontue melhorias críticas em usabilidade, conversão, copywriting e design (acima da dobra, CTA, contraste, fluxo).";
          break;
        default:
          systemInstruction += "Você é o ZION AI, um assistente premium focado em criação de design e copy com o conhecimento absoluto de um Designer Master do mercado brasileiro (Estilo Flyer BR).";
      }
      
      // Adiciona regra de formatação universal para o parser do frontend funcionar 100%
      systemInstruction += `\n\nDIRETRIZES DE ESTILO FLYER BR:
Lembre-se sempre das características de altíssima qualidade de Flyers Brasileiros Profissionais (Eventos, Shows, Lançamentos, Corporativo):
1. Estilo & Qualidade: Nível de agência premium, masterpiece, high-end commercial design.
2. Diagramação & Margens: Diagramações perfeitamente balanceadas e bonitas. Respeite sempre as margens de respiro, safety areas e a proporção da arte (1:1, 4:5, 9:16).
3. Sombras & Efeitos: Luzes de recorte dramáticas, glows perfeitamente mesclados, reflexos, integração impecável do sujeito ao fundo e texturas ricas.
4. Remoção & Exclusões: Se o usuário pedir para remover algo (ex: sem texto, sem pessoas, sem logos), isso deve ser tratado como uma REGRA ABSOLUTA (Negative Prompting rígido).

AUTONOMIA TOTAL E INTELIGÊNCIA DE DESIGN (AUTO-FILL):
Você tem AUTONOMIA ABSOLUTA para tomar decisões de design. Analise rigorosamente se a arte deve ter um Sujeito Principal (pessoa ou produto central):
- Se o usuário enviar uma ou mais fotos de pessoas/produtos, ou se o briefing descrever um sujeito/personagem central, ou se for uma arte típica que exige modelo/produto, você DEVE ativar o sujeito ("desativarSujeito": false, "noPeople": false), identificar o gênero ("Masculino"/"Feminino"/"") e descrever a pose ("poseDescription").
- Se não houver pessoa nem produto focado (arte puramente de cenário, tipográfica, avisos institucionais limpos, etc.), você DEVE desativar o sujeito ("desativarSujeito": true, "noPeople": true).
Se o usuário enviar uma foto que parece um logo, ATIVE o logo (useLogo=true) e faça o mapeamento.
Você DEVE habilitar, desabilitar e configurar TODOS OS EFEITOS (degradeLeitura, enableTypography, coresAutomaticas, blur, floatingElementsMode, enableEstiloVisual, estiloVisualCustom) de acordo com o que você achar melhor para gerar a arte MAIS ABSURDA E PROFISSIONAL possível. Tenha pensamento próprio, confie no seu instinto de Diretor de Arte. 
Se você achar que a arte se beneficia de estilo visual ou se o usuário enviar uma imagem de referência, use "enableEstiloVisual": true e descreva detalhadamente e obrigatoriamente a atmosfera em "estiloVisualCustom". Se você ou o usuário desejarem desativar o estilo visual, use "enableEstiloVisual": false.
Na referência de estilo, extraia exatamente o que o usuário quer copiar (iluminação, texturas, vibe) em "descricoesEstilo".

REGRAS OBRIGATÓRIAS DE DESIGN CARD (REFERÊNCIA COMPLETA):
- Sempre que houver uma imagem de flyer/card de referência de layout completo, mapeie-a obrigatoriamente como "design" no "mapeamentoImagens".
- Se nenhuma outra imagem de cenário foi enviada, você DEVE mapear a imagem do card de referência também como "scene" (cenário/fundo), e descrever detalhadamente em "promptCenario" o que extrair dali.
- Se nenhuma outra imagem de referência de estilo visual foi enviada, você DEVE preencher "enableEstiloVisual": true e descrever detalhadamente em "estiloVisualCustom" o estilo/atmosfera a ser extraído do card.
- Se nenhuma outra imagem de referência de tipografia/texto foi enviada e o usuário quiser copiar ou se inspirar em algum bloco de texto do card, mapeie a imagem do card também como "typography" (ou "typographyRefBase64") para copiar o estilo tipográfico ou print de texto.
- RESPEITE AS CORES DO CLIENTE: Ao extrair esses elementos do card de referência, você deve manter o padrão das cores passadas pelo usuário ou as que pertencem à paleta salva dos clientes do usuário.

DETECÇÃO DE NOVO PEDIDO (NOVA ARTE / NOVO BRIEFING) - CRÍTICO:
Se o usuário mandar uma mensagem ou briefing que indica que ele está iniciando um NOVO PEDIDO, uma NOVA ARTE, ou uma nova ideia temática (ex: "agora faz um flyer de padaria", "novo pedido: show de sertanejo", "cria uma arte para pizzaria", ou se ele enviar novas fotos de referências que não têm relação alguma com o flyer/pedido anterior do chat), você DEVE:
1. Definir obrigatoriamente "substituirImagens": true no seu JSON de resposta.
2. Definir obrigatoriamente "substituirConfig": true no seu JSON de resposta.
3. LIMPAR E RE-CRIAR as "camadasTexto" inteiramente do zero! Você está TERMINANTEMENTE PROIBIDO de reaproveitar, mesclar, ou carregar textos, títulos, datas, perfis de instagram ou telefones do flyer antigo (presentes no histórico do chat). Crie novas camadas de texto adequadas EXCLUSIVAMENTE ao novo tema solicitado.
4. Redefinir e reescrever "additionalPrompt", "promptCenario", "promptDesign", "promptTipografia" e as cores do projeto com base apenas na nova solicitação, limpando qualquer rastro da arte antiga.
A IA deve obedecer estritamente ao usuário e garantir uma transição limpa, sem misturar dados do pedido antigo com o novo!

REGRAS CRÍTICAS DE SAÍDA (AUTO-FILL):
Sempre que você gerar uma sugestão de configuração, copys, prompt ou extração de estilo, você DEVE incluir OBRIGATORIAMENTE no final da sua resposta um bloco de código JSON para preenchimento automático.
O JSON deve ser formatado exatamente assim (inclua apenas as chaves que você conseguir inferir):
\`\`\`json
{
  "cores": { "ambiente": "#hex", "recorte": "#hex", "complementar": "#hex", "paleta": ["#hex1", "#hex2", "#hex3"] }, 
  "coresAutomaticas": false, // true se você acha que as cores devem ser escolhidas automaticamente, false se definiu cores específicas
  "corDominante": "#hex",
  "useCorDominante": true, // false se não houver cor dominante
  "dimensao": "1:1", // ou "9:16", "16:9", "4:5"
  "sobriedade": 50, // de 0 (criativo/caótico) a 100 (sóbrio)
  "desativarSujeito": false, // IMPORTANTE: true se NÃO houver pessoa/sujeito na arte, false se houver sujeito (pessoa ou produto)
  "noPeople": false, // true se a imagem NÃO deve ter pessoas de jeito nenhum
  "useEnvRef": true, // true se estiver usando referência de cenário ou cenário carregado
  "useLogo": true, // true se houver logo para aplicar
  "enableTypography": true, // true se for usar textos na arte
  "degradeLeitura": true, // true se o cenário precisar de escurecimento para leitura do texto, false se não
  "enableBlur": false, // true se o cenário precisar de desfoque (fundo desfocado), false se não
  "lateralGradient": false, // true se quiser gradiente/degradê lateral, false se não
  "floatingElementsMode": "auto", // "off" para desligar, "auto" para ativar automático, "custom" para descrever os elementos flutuantes personalizados
  "floatingElementsCustom": "Ex: golden dust and glowing sparks flying behind the subject", // preencher caso use modo "custom"
  "gender": "Masculino", // "Masculino", "Feminino", "Outros", ou "" (vazio se sem sujeito)
  "poseDescription": "descrição curta em inglês da pose ou enquadramento (ex: confident pose, looking at camera)", 
  "positioning": "Centro", // "Centro", "Esquerda", "Direita"
  "typographyPosition": "CENTRO", // OBRIGATÓRIO: Escolha exatamente "ESQUERDA", "CENTRO" ou "DIREITA"
  "composicao": "Plano Americano", // "Close-up (Rosto)", "Plano Médio (Busto)", "Plano Americano", "Customizada"
  "composicaoCustom": "Ex: Dramatic low angle cinematic shot", // preencher se quiser uma composição personalizada
  "promptCenario": "descrição do cenário em inglês",
  "promptDesign": "descrição curta do que extrair do layout/design do card de referência (ex: Copy the diagonal structures and asymmetric composition)",
  "promptTipografia": "descrição curta do que extrair da tipografia/texto do card de referência (ex: Copy the bold modern headlines and centered CTA button)",
  "additionalPrompt": "MEGA PROMPT MASTERPIECE com texturas, iluminação 3-point, glows, câmera e estética",
  "negativePrompt": "prompt negativo em inglês",
  "enableEstiloVisual": true, // true para ativar o estilo visual, false para desativar
  "estilosVisuais": ["Cyberpunk", "Minimalista", "Neon"], 
  "estiloVisualCustom": "Pintura barroca dramática com iluminação de Caravaggio", // Descreva o estilo detalhadamente se não estiver nas opções predefinidas
  "substituirImagens": true,
  "mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo", "layout.jpg": "design", "estilo.jpg": "style" }, // IMPORTANTE: Classifique cada arquivo como: "subject" (sujeito), "logo" (logotipo), "scene" (cenário/fundo), "design" (referência de layout/design completo) ou "style" (referência de estilo visual/estética). Se receber um flyer/card de referência de design, SEMPRE mapeie como "design".
  "descricoesEstilo": { "estilo.jpg": "Descrição detalhada do estilo e paleta de cores dessa referência (O que copiar: texturas, luz, cores, etc). Obrigatorio se o tipo for 'style'" },
  "camadasTexto": [
    { "funcao": "Headline Principal", "conteudo": "SEU TITULO", "fonte": "Outfit", "cor": "#ffffff" }
  ]
}
\`\`\`
IMPORTANTE: As funções de texto DEVEM ser uma das opções listadas acima.
Se o usuário enviou imagens, o nome original do arquivo aparecerá no texto como [Imagem Anexada: NOME_DO_ARQUIVO.ext].
Ao preencher o mapeamentoImagens, VOCÊ DEVE USAR ESTE NOME EXATO para que o sistema consiga vincular o arquivo.
Ao montar o prompt (additionalPrompt e promptCenario), USE ESSE NOME exato entre colchetes (ex: "integrate the subject from [produto.png] in the center") para que a IA de geração consiga localizar o asset.
Sempre avise no texto de forma natural se identificou uma logo ou foto de sujeito.`;

      const contents: any[] = [];

      // Map history payload
      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          const parts: any[] = [];
          if (Array.isArray(h.files) && h.files.length > 0) {
            h.files.forEach((file: any) => {
              if (file.name) {
                parts.push({ text: `[Imagem Anexada: ${file.name}]` });
              }
              parts.push({
                inlineData: {
                  data: file.data,
                  mimeType: file.type
                }
              });
            });
          }
          parts.push({ text: h.content || "" });
          contents.push({
            role: h.role === "model" ? "model" : "user",
            parts: parts
          });
        });
      }

      // Add current message
      const userParts: any[] = [];
      if (Array.isArray(attachedFiles) && attachedFiles.length > 0) {
        attachedFiles.forEach((file: any) => {
          if (file.name) {
            userParts.push({ text: `[Imagem Anexada: ${file.name}]` });
          }
          userParts.push({
            inlineData: {
              data: file.data,
              mimeType: file.type
            }
          });
        });
      } else if (imageBase64 && imageBase64.trim() !== "") {
        const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        userParts.push({ inlineData: { data: cleanData, mimeType: "image/jpeg" } });
      }
      
      userParts.push({ text: message || "Analise a referência enviada." });

      contents.push({
        role: "user",
        parts: userParts
      });

      const response = await currentAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction
        }
      });
      res.json({ response: response.text || "" });
    } catch (error: any) {
      console.error("Chat Assistente Error:", error);
      const errorMsg = error.message || String(error);
      const isQuota = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("exhausted") || errorMsg.includes("quota");
      
      let userMessage = error.message;
      let status = 500;
      
      if (isQuota) {
        userMessage = "Cota de requisições excedida (429) ou créditos esgotados. Por favor, aguarde alguns minutos ou insira sua própria API Key nas configurações.";
        status = 429;
      }
      
      res.status(status).json({ error: userMessage });
    }
  });

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    server.timeout = 360000; // 6 minutos de timeout para geração 4K
    server.headersTimeout = 360000;
    server.requestTimeout = 360000;
  }

  return app;
}

let appPromise: Promise<any> | null = null;
export async function getApp() {
  if (!appPromise) {
    appPromise = startServer();
  }
  return appPromise;
}

if (!process.env.VERCEL) {
  startServer();
}

