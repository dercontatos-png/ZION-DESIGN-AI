const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldJson = `"cores": { "ambiente": "#hex", "recorte": "#hex", "complementar": "#hex", "paleta": ["#hex1", "#hex2", "#hex3"] }, // Pode ter quantas cores quiser na paleta
  "corDominante": "#hex",
  "dimensao": "1:1", // ou "9:16", "16:9", "4:5"
  "sobriedade": 50, // número de 0 (muito criativo/caótico) a 100 (muito profissional/sóbrio)
  "typographyPosition": "Centro", // ou "Top", "Bottom"
  "promptCenario": "descrição curta do cenário em inglês",
  "additionalPrompt": "prompt geral principal em inglês. SEMPRE reescreva/inclua este campo atualizado se o usuário pedir qualquer alteração visual. OBRIGATÓRIO: Crie um MEGA PROMPT estilo Midjourney v6. Especifique com riqueza absoluta de detalhes técnicos: sujeito, texturas, cenário, 3-point studio lighting, rim light, ambient occlusion, reflexos, glows, cores, câmera (lente, ISO), e estilo (masterpiece, high-end commercial).",
  "negativePrompt": "prompt negativo em inglês",
  "estilosVisuais": ["Cyberpunk", "Minimalista", "Neon"], // Lista de estilos aplicáveis
  "substituirImagens": true, // Retorne true se o usuário pediu para trocar/substituir a imagem atual pela que ele acabou de enviar.
  "mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo" }, // IMPORTANTE: O nome do arquivo DEVE ser EXATAMENTE igual ao que o usuário enviou (veja na tag [Imagem Anexada: NOME]). Classifique como "subject", "logo", "scene" ou "style".
  "descricoesEstilo": { "nome_do_arquivo.png": "Descrição detalhada do estilo e paleta de cores dessa referência" }, // Se uma imagem for classificada como "style", forneça a descrição dela aqui.
  "camadasTexto": [
    { "funcao": "Headline Principal", "conteudo": "SEU TITULO", "fonte": "Outfit", "cor": "#ffffff" },
    { "funcao": "Subheadline Secundário", "conteudo": "SEU SUBTITULO", "fonte": "Outfit", "cor": "#ffffff" }
  ]`;

const newJson = `"cores": { "ambiente": "#hex", "recorte": "#hex", "complementar": "#hex", "paleta": ["#hex1", "#hex2", "#hex3"] }, 
  "coresAutomaticas": false, // true se você acha que as cores devem ser escolhidas automaticamente
  "corDominante": "#hex",
  "useCorDominante": true, // false se não houver cor dominante
  "dimensao": "1:1", 
  "sobriedade": 50,
  "desativarSujeito": false, // true se NÃO houver pessoa/sujeito na arte (ex: arte puramente textual/cenário)
  "noPeople": false, // true se a imagem NÃO deve ter pessoas
  "useEnvRef": true, // true se estiver usando referência de cenário
  "useLogo": true, // true se houver logo para aplicar
  "enableTypography": true, // true se for usar textos na arte
  "degradeLeitura": true, // true se o cenário precisar de escurecimento para leitura do texto
  "enableBlur": false, // true para fundo desfocado
  "lateralGradient": false, // true para gradiente lateral
  "floatingElementsMode": "auto", // "off" ou "auto"
  "gender": "Masculino", // "Masculino", "Feminino", "Outros", ou ""
  "poseDescription": "descrição da pose do sujeito (em inglês)", 
  "positioning": "Centro",
  "typographyPosition": "Centro", // "Top", "Bottom", "Centro"
  "promptCenario": "descrição do cenário em inglês",
  "additionalPrompt": "MEGA PROMPT MASTERPIECE com texturas, iluminação 3-point, glows, câmera e estética",
  "negativePrompt": "prompt negativo em inglês",
  "estilosVisuais": ["Cyberpunk", "Minimalista", "Neon"], 
  "substituirImagens": true,
  "mapeamentoImagens": { "nome_do_arquivo.png": "subject", "outro_arquivo.jpg": "logo" }, 
  "descricoesEstilo": { "nome_do_arquivo.png": "Descrição O QUE COPIAR (Textura, luz, vibe, etc) dessa referência" },
  "camadasTexto": [
    { "funcao": "Headline Principal", "conteudo": "SEU TITULO", "fonte": "Outfit", "cor": "#ffffff" }
  ]`;

code = code.replace(oldJson, newJson);

fs.writeFileSync('server.ts', code);
console.log("Server JSON schema patched!");
