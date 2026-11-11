import fs from "fs";
import path from "path";
import os from "os";

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NOW_REGION
);

const LOCAL_STORAGE_DIR = isServerless
  ? path.join(os.tmpdir(), "zion_storage")
  : path.resolve(process.cwd(), "local_storage");

function ensureDir() {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
  } catch (_) {}
}

function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDir();
  const filePath = path.join(LOCAL_STORAGE_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[adminService] Erro ao ler ${filename}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDir();
  const filePath = path.join(LOCAL_STORAGE_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`[adminService] Erro ao escrever ${filename}:`, err);
  }
}

// ── 1. REPORTS & BUGS ──
export interface AdminReport {
  id: string;
  user: string;
  agent: string;
  type: "Bug" | "Sugestão" | "Outro" | string;
  title?: string;
  message: string;
  screenshot?: string;
  generationId?: string;
  status: "pendente" | "em_analise" | "resolvido";
  createdAt: string;
}

const DEFAULT_REPORTS: AdminReport[] = [
  {
    id: "REP-01",
    user: "lucas.mendes@gmail.com",
    agent: "Ref Builder",
    type: "Bug",
    title: "Proporção 9:16",
    message: "Gostaria de saber se a dimensão 9:16 funciona com logos em PNG transparente.",
    status: "pendente",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: "REP-02",
    user: "camila.design@outlook.com",
    agent: "Zion Design V2",
    type: "Sugestão",
    title: "Presets de Iluminação",
    message: "Adicionar mais presets de iluminação neon cyberpunk na aba de estilos.",
    status: "resolvido",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: "REP-03",
    user: "agencia.prime@gmail.com",
    agent: "Órion Pro",
    type: "Outro",
    title: "Nitidez 8K",
    message: "A nitidez da resolução 8K superou as expectativas para nossos clientes de ótica.",
    status: "resolvido",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  }
];

export function getAdminReports(): AdminReport[] {
  return readJsonFile<AdminReport[]>("admin_reports.json", DEFAULT_REPORTS);
}

export function saveAdminReport(reportData: Partial<AdminReport>): AdminReport {
  const reports = getAdminReports();
  const newReport: AdminReport = {
    id: reportData.id || `REP-${Date.now().toString(36).toUpperCase()}`,
    user: reportData.user || "usuario@anonimo.com",
    agent: reportData.agent || "Ref Builder",
    type: reportData.type || "Bug",
    title: reportData.title || "Report enviado pelo usuário",
    message: reportData.message || "",
    screenshot: reportData.screenshot,
    generationId: reportData.generationId,
    status: reportData.status || "pendente",
    createdAt: reportData.createdAt || new Date().toISOString()
  };

  const existingIdx = reports.findIndex(r => r.id === newReport.id);
  if (existingIdx >= 0) {
    reports[existingIdx] = { ...reports[existingIdx], ...newReport };
  } else {
    reports.unshift(newReport);
  }

  writeJsonFile("admin_reports.json", reports);
  return newReport;
}

export function updateAdminReportStatus(id: string, status: "pendente" | "em_analise" | "resolvido"): boolean {
  const reports = getAdminReports();
  const report = reports.find(r => r.id === id);
  if (!report) return false;
  report.status = status;
  writeJsonFile("admin_reports.json", reports);
  return true;
}

export function deleteAdminReport(id: string): boolean {
  const reports = getAdminReports();
  const filtered = reports.filter(r => r.id !== id);
  if (filtered.length === reports.length) return false;
  writeJsonFile("admin_reports.json", filtered);
  return true;
}

export function getUnreadReportsCount(): number {
  const reports = getAdminReports();
  return reports.filter(r => r.status === "pendente").length;
}

export function getReportsCounts(): { by_type: Record<string, number>; unread: number } {
  const reports = getAdminReports();
  const by_type: Record<string, number> = {};
  let unread = 0;
  for (const r of reports) {
    by_type[r.type] = (by_type[r.type] || 0) + 1;
    if (r.status === "pendente") unread++;
  }
  return { by_type, unread };
}

export function getDistinctReportAgents(): string[] {
  const reports = getAdminReports();
  const set = new Set<string>();
  for (const r of reports) {
    if (r.agent) set.add(r.agent);
  }
  return Array.from(set);
}

// ── 2. FEEDBACKS & RATINGS ──
export interface AdminRating {
  id: string;
  user: string;
  agent: string;
  rating: number; // 1 to 5
  comment?: string;
  notes?: string;
  generationId?: string;
  adminStatus: "novo" | "lido" | "arquivado";
  createdAt: string;
}

const DEFAULT_RATINGS: AdminRating[] = [
  {
    id: "RAT-01",
    user: "fernando.art@gmail.com",
    agent: "Ref Builder",
    rating: 5,
    comment: "Fidelidade de iluminação absurda! Ficou idêntico à referência que enviei.",
    notes: "Cliente satisfeito - Plano Pro",
    adminStatus: "lido",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: "RAT-02",
    user: "agencia.impacto@gmail.com",
    agent: "Órion Pro",
    rating: 5,
    comment: "Renderização 8K impecável para flyer impresso em lona gigante.",
    notes: "Recomendado para case de sucesso",
    adminStatus: "lido",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: "RAT-03",
    user: "roberto.design@gmail.com",
    agent: "Hydra",
    rating: 4,
    comment: "Muito bom, só tive que ajustar o contraste do texto de rodapé.",
    notes: "Ajustar headroom de tipografia no Hydra",
    adminStatus: "novo",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

export function getAdminRatings(): AdminRating[] {
  return readJsonFile<AdminRating[]>("admin_ratings.json", DEFAULT_RATINGS);
}

export function saveAdminRating(ratingData: Partial<AdminRating>): AdminRating {
  const ratings = getAdminRatings();
  const newRating: AdminRating = {
    id: ratingData.id || `RAT-${Date.now().toString(36).toUpperCase()}`,
    user: ratingData.user || "cliente@design.com",
    agent: ratingData.agent || "Ref Builder",
    rating: Math.max(1, Math.min(5, Number(ratingData.rating) || 5)),
    comment: ratingData.comment || "",
    notes: ratingData.notes || "",
    generationId: ratingData.generationId,
    adminStatus: ratingData.adminStatus || "novo",
    createdAt: ratingData.createdAt || new Date().toISOString()
  };
  ratings.unshift(newRating);
  writeJsonFile("admin_ratings.json", ratings);
  return newRating;
}

export function updateAdminRatingNotes(id: string, notes: string): boolean {
  const ratings = getAdminRatings();
  const r = ratings.find(item => item.id === id);
  if (!r) return false;
  r.notes = notes;
  writeJsonFile("admin_ratings.json", ratings);
  return true;
}

export function updateAdminRatingStatus(id: string, status: "novo" | "lido" | "arquivado"): boolean {
  const ratings = getAdminRatings();
  const r = ratings.find(item => item.id === id);
  if (!r) return false;
  r.adminStatus = status;
  writeJsonFile("admin_ratings.json", ratings);
  return true;
}

export function batchUpdateRatingStatus(ids: string[], status: "novo" | "lido" | "arquivado"): number {
  const ratings = getAdminRatings();
  let count = 0;
  for (const r of ratings) {
    if (ids.includes(r.id)) {
      r.adminStatus = status;
      count++;
    }
  }
  if (count > 0) {
    writeJsonFile("admin_ratings.json", ratings);
  }
  return count;
}

export function getDistinctRatingAgents(): string[] {
  const ratings = getAdminRatings();
  const set = new Set<string>();
  for (const r of ratings) {
    if (r.agent) set.add(r.agent);
  }
  return Array.from(set);
}

export function getAdminRatingStats() {
  const ratings = getAdminRatings();
  const total = ratings.length;
  if (total === 0) {
    return {
      average: 5.0,
      total: 0,
      unread: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  const average = Number((sum / total).toFixed(2));
  const unread = ratings.filter(r => r.adminStatus === "novo").length;
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of ratings) {
    const star = Math.round(r.rating);
    breakdown[star] = (breakdown[star] || 0) + 1;
  }
  return { average, total, unread, breakdown };
}

// ── 3. POLÍTICA DE IA & AGENTES ──
export interface AgentPolicy {
  slug: string;
  name: string;
  category: string;
  status: "Ativo" | "Manutenção" | "Em breve";
  model: string;
  safeMargins: string; // ex: "18% Safe Headroom"
  safeMarginPercent: number; // ex: 18
  priority: "Ultra Alta" | "Alta" | "Padrão";
  promptGuidelines?: string;
  updatedAt?: string;
}

const DEFAULT_AGENTS_POLICY: AgentPolicy[] = [
  {
    slug: "ref",
    name: "Ref Builder",
    category: "Reengenharia Reversa 1:1",
    status: "Ativo",
    model: "Google Cloud Vertex AI (Imagen 3 High Quality)",
    safeMargins: "18% a 20% Top & Bottom",
    safeMarginPercent: 18,
    priority: "Ultra Alta",
    promptGuidelines: "Priorizar preservação da paleta de cores original, iluminação tridimensional de estúdio, hierarquia tipográfica precisa e 0 corte de elementos em safe areas 9:16 e 4:5."
  },
  {
    slug: "design-builder-v2",
    name: "Zion Design V2",
    category: "Composição Modular Multicamadas",
    status: "Ativo",
    model: "Google GenAI Multi-modal Pro",
    safeMargins: "16% Safe Margins",
    safeMarginPercent: 16,
    priority: "Alta",
    promptGuidelines: "Composição harmônica de planos, luz volumétrica, separação nítida de primeiro e segundo plano, estética comercial de alto impacto."
  },
  {
    slug: "orion-pro",
    name: "Órion Pro",
    category: "Fotografia de Estúdio 8K Master",
    status: "Ativo",
    model: "Vertex AI Studio Master 8K",
    safeMargins: "20% Safe Headroom",
    safeMarginPercent: 20,
    priority: "Ultra Alta",
    promptGuidelines: "Micro-detalhes, texturas hiper-realistas de pele e vidro, iluminação de refletor difuso softbox 85mm, sem ruído digital."
  },
  {
    slug: "altera-facil",
    name: "Altera Fácil",
    category: "Inpainting & Substituição Inteligente",
    status: "Ativo",
    model: "Selective Mask Inpainting Engine",
    safeMargins: "Preserva Contorno Original",
    safeMarginPercent: 10,
    priority: "Alta",
    promptGuidelines: "Substituir apenas a área selecionada pela máscara com correspondência exata de balanço de branco, sombras e textura do ambiente."
  },
  {
    slug: "hydra",
    name: "Hydra Builder",
    category: "Flyers e Posters Temáticos",
    status: "Ativo",
    model: "Hydra Engine V3 Multi-layer",
    safeMargins: "18% Dynamic Margins",
    safeMarginPercent: 18,
    priority: "Alta",
    promptGuidelines: "Flyers de baladas, eventos, gastronomia e shows com alto contraste, luz neon cinematográfica e reserva de espaço limpo para títulos."
  }
];

export function getAgentsPolicy(): AgentPolicy[] {
  return readJsonFile<AgentPolicy[]>("admin_agents_policy.json", DEFAULT_AGENTS_POLICY);
}

export function updateAgentPolicy(slug: string, update: Partial<AgentPolicy>): AgentPolicy | null {
  const policies = getAgentsPolicy();
  const idx = policies.findIndex(p => p.slug === slug);
  if (idx < 0) return null;
  policies[idx] = {
    ...policies[idx],
    ...update,
    updatedAt: new Date().toISOString()
  };
  writeJsonFile("admin_agents_policy.json", policies);
  return policies[idx];
}

// ── 4. MODO LIVE (SESSÕES AO VIVO) ──
export interface LiveSession {
  id: string;
  title: string;
  description?: string;
  status: "idle" | "live" | "ended";
  startedAt?: string;
  endedAt?: string;
  viewersCount: number;
  unlimitedCreditsRule: boolean;
  unlockProAgentsRule: boolean;
  challengeTopic?: string;
}

const DEFAULT_LIVE_SESSION: LiveSession = {
  id: "LIVE-MAIN",
  title: "Workshop Masterclass: Criação de Flyers 8K ao Vivo",
  description: "Treinamento prático de composição de artes com a comunidade de designers",
  status: "idle",
  viewersCount: 142,
  unlimitedCreditsRule: true,
  unlockProAgentsRule: true,
  challengeTopic: "Flyer de Hamburgueria Artesanal Noturna"
};

export function getLiveSession(): LiveSession {
  return readJsonFile<LiveSession>("admin_live_sessions.json", DEFAULT_LIVE_SESSION);
}

export function updateLiveSession(data: Partial<LiveSession>): LiveSession {
  const current = getLiveSession();
  const updated: LiveSession = {
    ...current,
    ...data
  };
  writeJsonFile("admin_live_sessions.json", updated);
  return updated;
}

// ── 5. HYDRA OBJECTIVES & TAXONOMIA ──
export interface HydraObjective {
  id: string;
  title: string;
  category: string;
  palette: string;
  lighting: string;
  lens: string;
  active: boolean;
}

const DEFAULT_HYDRA_OBJECTIVES: HydraObjective[] = [
  {
    id: "obj-01",
    title: "Gastronomia Gourmet",
    category: "Alimentos & Bebidas",
    palette: "Tons quentes, madeira e dourado",
    lighting: "Rim light quente e fumaça sutil",
    lens: "Macro 50mm f/1.8",
    active: true
  },
  {
    id: "obj-02",
    title: "Nightclub & Balada",
    category: "Música & Festas",
    palette: "Roxo eletrizante, ciano e neon magenta",
    lighting: "Luz estroboscópica e laser volumétrico",
    lens: "Ultra-wide 16mm",
    active: true
  },
  {
    id: "obj-03",
    title: "Streetwear & Moda",
    category: "Vestuário & Lifestyle",
    palette: "Monocromático com detalhes fluorescentes",
    lighting: "Luz de passarela e contraste brutalista",
    lens: "85mm retrato vertical",
    active: true
  },
  {
    id: "obj-04",
    title: "Ótica & Saúde",
    category: "Comércio & Saúde",
    palette: "Azul hospitalar, branco puro e reflexos dourados",
    lighting: "Difusor suave softbox sem reflexo indesejado",
    lens: "Macro detalhe de armação",
    active: true
  },
  {
    id: "obj-05",
    title: "Automotivo GT",
    category: "Veículos & Performance",
    palette: "Preto acetinado, fibra de carbono e faróis LED",
    lighting: "Linha de reflexo fluido no capô",
    lens: "35mm dinâmica em curva",
    active: true
  },
  {
    id: "obj-06",
    title: "Podcast Cover",
    category: "Mídia & Entretenimento",
    palette: "Gradiente moderno e tipografia bold",
    lighting: "Luz de estúdio acústico",
    lens: "50mm enquadramento peito",
    active: true
  },
  {
    id: "obj-07",
    title: "Imóveis de Luxo",
    category: "Arquitetura & Real Estate",
    palette: "Tons de mármore, pôr do sol dourado e vegetação",
    lighting: "Golden hour arquitetônica",
    lens: "Wide 24mm tilt-shift",
    active: true
  },
  {
    id: "obj-08",
    title: "Barbearia Vintage",
    category: "Beleza Masculina",
    palette: "Couro envelhecido, cobre e marrom âmbar",
    lighting: "Lâmpadas de filamento Edison vintage",
    lens: "50mm f/1.4",
    active: true
  }
];

export function getHydraObjectives(): HydraObjective[] {
  return readJsonFile<HydraObjective[]>("admin_hydra_objectives.json", DEFAULT_HYDRA_OBJECTIVES);
}

export function saveHydraObjective(obj: Partial<HydraObjective>): HydraObjective {
  const list = getHydraObjectives();
  const newObj: HydraObjective = {
    id: obj.id || `obj-${Date.now().toString(36)}`,
    title: obj.title || "Novo Objetivo",
    category: obj.category || "Geral",
    palette: obj.palette || "Equilibrada",
    lighting: obj.lighting || "Estúdio",
    lens: obj.lens || "50mm",
    active: obj.active !== undefined ? obj.active : true
  };
  const idx = list.findIndex(o => o.id === newObj.id);
  if (idx >= 0) {
    list[idx] = newObj;
  } else {
    list.push(newObj);
  }
  writeJsonFile("admin_hydra_objectives.json", list);
  return newObj;
}

export function deleteHydraObjective(id: string): boolean {
  const list = getHydraObjectives();
  const filtered = list.filter(o => o.id !== id);
  if (filtered.length === list.length) return false;
  writeJsonFile("admin_hydra_objectives.json", filtered);
  return true;
}

