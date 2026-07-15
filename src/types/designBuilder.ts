export interface CoresConfig {
  ambiente: string;
  recorte: string;
  complementar: string;
  paleta?: string[];
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
    | "Data / Horário";
  fonte: string;
  cor: string;
}

export interface EstiloReferencia {
  id: string;
  url: string;
  data: string; // base64 limpa
  descricao: string; // descrição do estilo visual
}

export interface ProjectConfig {
  tipoPainel: "DESIGNER" | "PRODUCT"; // Designer Zion vs Product Zion
  sujeitoBase64: string; // Fotos do Sujeito ou Produto
  desativarSujeito: boolean; // Flag para ignorar/desativar sujeito principal no prompt e UI
  cenarioBase64: string;
  dimensao: string; // "1:1", "4:5", "9:16", "16:9"
  cores: CoresConfig;
  coresAutomaticas: boolean;
  corDominante: string; // Cor Dominante
  useCorDominante: boolean; // Flag para ativar/desativar Cor Dominante
  degradeLeitura: boolean; // Degradê Leitura
  composicao: string;
  composicaoCustom: string;
  estilosVisuais: string[];
  resolucao: string; // "1K", "2K", "4K"
  formatoExportacao: "AVIF" | "PNG" | "JPEG" | "WEBP";
  gender: string; // Masculino, Feminino, Outros
  positioning: string;
  poseDescription: string;
  useEnvRef: boolean;
  enableBlur: boolean;
  lateralGradient: boolean;
  additionalPrompt: string;
  promptCenario: string; // Prompt Adicional Cenário
  negativePrompt: string;
  enableTypography: boolean;
  
  // Camadas de tipografia
  camadasTexto: CamadaTexto[];
  
  // Referências
  referenciasEstilo: EstiloReferencia[];
  tipografiaRefBase64: string; // imagem de referência de tipografia
  designRefBase64: string; // Referência de Design Obrigatório
  logoBase64: string; // Logotipo da Marca
  useLogo: boolean;

  // Suporte a múltiplos arquivos
  sujeitosBase64List?: string[];
  cenariosBase64List?: string[];
  tipografiaRefsList?: string[];
  designRefsList?: string[];
  logosList?: string[];

  cenarioPredefinido?: string;
  typographyPosition?: string;
  noPeople?: boolean;

  variations: number;
  modoCriacao: string;
  nivelCriativo: number; // Slider de 0 a 100
  floatingElementsMode: "off" | "auto" | "custom";
  floatingElementsCustom: string;
}

export interface ImageResponse {
  image: string;
  error?: string;
}
