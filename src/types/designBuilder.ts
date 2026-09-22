export interface CoresConfig {
  ambiente: string;
  recorte: string;
  complementar: string;
  paleta?: string[];
  primaria?: string;
  secundaria?: string;
  acento?: string;
  fundo?: string;
}

export interface CamadaTexto {
  id: string;
  conteudo: string;
  funcao: 
    | "Headline Principal" 
    | "Subheadline Secundário" 
    | "CTA Botão" 
    | "Corpo Descrição" 
    | "Legenda / Detalhe" 
    | "Badge / Selo" 
    | "Preço / Valor" 
    | "Data / Horário"
    | "Lista de Benefícios"
    | "H1"
    | "H2"
    | "Texto"
    | "Bullets"
    | "CTA";
  tipoBloco?: "H1" | "H2" | "Texto" | "Bullets" | "CTA";
  pesoVisual?: number; // 1 a 5 (1=discreto, 5=protagonista)
  fonte?: string;
  cor?: string;
  posicao?: string;
}

export interface EstiloReferencia {
  id: string;
  url: string;
  data: string; // base64 limpa
  descricao: string; // descrição do estilo visual
  base64?: string;
}

export interface ProjectConfig {
  clientId?: string | null;
  tipoPainel?: "DESIGNER" | "PRODUCT" | "LOGO" | "GC_TV" | "FOTO" | string; // Designer Zion vs Product Zion vs Logo Creator vs GC TV Broadcast vs Foto Studio/Editing
  sujeitoBase64?: string; // Fotos do Sujeito ou Produto
  desativarSujeito?: boolean; // Flag para ignorar/desativar sujeito principal no prompt e UI
  cenarioBase64?: string;
  dimensao?: string; // "1:1", "4:5", "9:16", "16:9"
  cores?: CoresConfig;
  coresAutomaticas?: boolean;
  corDominante?: string; // Cor Dominante
  useCorDominante?: boolean; // Flag para ativar/desativar Cor Dominante
  useDominantColors?: boolean;
  degradeLeitura?: boolean; // Degradê Leitura
  composicao?: string;
  composicaoCustom?: string;
  estilosVisuais?: string[];
  resolucao?: string; // "1K", "2K", "4K"
  promptSujeito?: string;
  selectedModel?: string;
  formatoExportacao?: "AVIF" | "PNG" | "JPEG" | "WEBP" | string;
  gender?: string; // Masculino, Feminino, Outros
  genero?: string;
  positioning?: string;
  poseDescription?: string;
  useEnvRef?: boolean;
  enableBlur?: boolean;
  lateralGradient?: boolean;
  additionalPrompt?: string;
  promptCenario?: string; // Prompt Adicional Cenário
  promptDesign?: string; // Descrição de extração do layout do design obrigatório
  promptTipografia?: string; // Descrição de extração do texto/tipografia do print
  promptEstilo?: string; // Descrição de estilo visual e tratamento fotográfico
  negativePrompt?: string;
  enableTypography?: boolean;
  
  // Camadas de tipografia
  camadasTexto?: CamadaTexto[];
  
  // Referências
  referenciasEstilo?: EstiloReferencia[];
  tipografiaRefBase64?: string; // imagem de referência de tipografia
  designRefBase64?: string; // Referência de Design Obrigatório
  logoBase64?: string; // Logotipo da Marca
  useLogo?: boolean;
  logoPosOverlay?: "top_center" | "top_left" | "top_right" | "bottom_left" | "bottom_right" | string;
  logoSizeOverlay?: number;
  logoInclusionType?: "overlay" | "embedded" | string;

  // Suporte a múltiplos arquivos
  sujeitosBase64List?: string[];
  cenariosBase64List?: string[];
  tipografiaRefsList?: string[];
  designRefsList?: string[];
  logosList?: string[];

  cenarioPredefinido?: string;
  typographyPosition?: string;
  noPeople?: boolean;

  variations?: number;
  multiplesPersons?: boolean;
  floatingElementsMode?: "off" | "auto" | "custom" | string;
  floatingElementsCustom?: string;
  nivelCriativo?: number;
  gendersDescription?: string;
  modoCriacao?: string;
  somentePrompt?: boolean;
  modelId?: string;
  enableEstiloVisual?: boolean;
  estiloVisualCustom?: string;
  seedUsuario?: string; // Seed para geração de imagens (Imagem 3)
  nicho?: string;
  estiloVisual?: string;
  cenario?: string;
  elementosFlutuantes?: boolean;
  elementosFlutuantesTexto?: string;
  qualidade?: string;
  modoCriativo?: string;
  quantidade?: number;
  espacoTexto?: string;
  corAuto?: boolean;
  corPrincipal?: string;
  categoria?: string;
  subject_description?: string;
  prompt_adicional?: string;
}

export interface ImageResponse {
  image: string;
  error?: string;
}
