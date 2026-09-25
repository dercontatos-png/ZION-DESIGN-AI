import fs from "fs";
import path from "path";
import os from "os";
import { uploadToR2, downloadFromR2, isR2Active } from "./r2StorageService";

export interface Subscriber {
  email: string;
  name?: string;
  status: "ativo" | "inativo";
  credits: number;
  unlimited?: boolean;
  plan?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

const SUBSCRIBERS_CACHE_FILE = path.join(LOCAL_STORAGE_DIR, "subscribers.json");
const R2_SUBSCRIBERS_KEY = "system/subscribers.json";

let memoryCache: Subscriber[] | null = null;
let lastSyncTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds memory cache

function ensureDirExists(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (_) {}
}

/**
 * Carrega a lista de assinantes (Memória -> Disco -> R2)
 */
export async function getSubscribersList(): Promise<Subscriber[]> {
  const now = Date.now();
  if (memoryCache && now - lastSyncTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  // 1. Tentar ler do Cloudflare R2 se ativo (fonte global da verdade)
  if (isR2Active()) {
    try {
      const r2Obj = await downloadFromR2(R2_SUBSCRIBERS_KEY);
      if (r2Obj && r2Obj.data) {
        const parsed = JSON.parse(r2Obj.data.toString("utf-8"));
        if (Array.isArray(parsed)) {
          memoryCache = parsed;
          lastSyncTime = now;
          // Atualiza cache em disco
          try {
            ensureDirExists(SUBSCRIBERS_CACHE_FILE);
            fs.writeFileSync(SUBSCRIBERS_CACHE_FILE, JSON.stringify(parsed, null, 2), "utf-8");
          } catch (_) {}
          return memoryCache;
        }
      }
    } catch (r2Err) {
      console.warn("[subscriberService] Falha ao ler do R2, tentando cache local:", r2Err);
    }
  }

  // 2. Fallback: ler do cache local em disco
  try {
    if (fs.existsSync(SUBSCRIBERS_CACHE_FILE)) {
      const fileData = fs.readFileSync(SUBSCRIBERS_CACHE_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        memoryCache = parsed;
        lastSyncTime = now;
        return memoryCache;
      }
    }
  } catch (diskErr) {
    console.warn("[subscriberService] Falha ao ler cache local:", diskErr);
  }

  memoryCache = [];
  lastSyncTime = now;
  return memoryCache;
}

/**
 * Salva a lista inteira de assinantes no disco e no R2
 */
async function persistSubscribers(subscribers: Subscriber[]): Promise<boolean> {
  memoryCache = subscribers;
  lastSyncTime = Date.now();

  const jsonStr = JSON.stringify(subscribers, null, 2);

  // 1. Salvar no disco local
  try {
    ensureDirExists(SUBSCRIBERS_CACHE_FILE);
    fs.writeFileSync(SUBSCRIBERS_CACHE_FILE, jsonStr, "utf-8");
  } catch (err) {
    console.warn("[subscriberService] Erro ao salvar subscribers no disco:", err);
  }

  // 2. Salvar no R2
  if (isR2Active()) {
    try {
      const res = await uploadToR2(R2_SUBSCRIBERS_KEY, Buffer.from(jsonStr, "utf-8"), "application/json");
      return res.success;
    } catch (err) {
      console.error("[subscriberService] Erro ao salvar subscribers no R2:", err);
    }
  }

  return true;
}

/**
 * Busca um assinante pelo e-mail
 */
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const list = await getSubscribersList();
  return list.find((s) => s.email.toLowerCase().trim() === cleanEmail) || null;
}

/**
 * Cadastra ou atualiza um assinante
 */
export async function saveSubscriber(data: {
  email: string;
  name?: string;
  status?: "ativo" | "inativo";
  credits?: number;
  unlimited?: boolean;
  plan?: string;
  notes?: string;
}): Promise<Subscriber> {
  const cleanEmail = data.email.toLowerCase().trim();
  if (!cleanEmail) throw new Error("E-mail do assinante é obrigatório.");

  const list = await getSubscribersList();
  const existingIndex = list.findIndex((s) => s.email.toLowerCase().trim() === cleanEmail);
  const now = new Date().toISOString();

  let updatedSubscriber: Subscriber;

  if (existingIndex >= 0) {
    const existing = list[existingIndex];
    updatedSubscriber = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      status: data.status !== undefined ? data.status : existing.status,
      credits: data.credits !== undefined ? Number(data.credits) : existing.credits,
      unlimited: data.unlimited !== undefined ? Boolean(data.unlimited) : existing.unlimited,
      plan: data.plan !== undefined ? data.plan : existing.plan,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      updatedAt: now,
    };
    list[existingIndex] = updatedSubscriber;
  } else {
    updatedSubscriber = {
      email: cleanEmail,
      name: data.name || cleanEmail.split("@")[0],
      status: data.status || "ativo",
      credits: data.credits !== undefined ? Number(data.credits) : 100,
      unlimited: Boolean(data.unlimited),
      plan: data.plan || "Plano Pro",
      notes: data.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(updatedSubscriber);
  }

  await persistSubscribers(list);
  return updatedSubscriber;
}

/**
 * Remove um assinante
 */
export async function deleteSubscriber(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const list = await getSubscribersList();
  const filtered = list.filter((s) => s.email.toLowerCase().trim() !== cleanEmail);
  if (filtered.length === list.length) return false;
  await persistSubscribers(filtered);
  return true;
}

/**
 * Valida o acesso de uma conta:
 * Retorna se está autorizado, créditos restantes e motivo se negado.
 */
export async function checkSubscriberAccess(email: string): Promise<{
  allowed: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  credits: number;
  unlimited: boolean;
  plan?: string;
  reason?: string;
}> {
  const cleanEmail = (email || "").toLowerCase().trim();

  // Admin oficial sempre tem acesso total e irrestrito
  if (cleanEmail === "der.contatos@gmail.com") {
    return {
      allowed: true,
      isAdmin: true,
      isSubscriber: true,
      credits: 999999,
      unlimited: true,
      plan: "Administrador Geral",
    };
  }

  if (!cleanEmail) {
    return {
      allowed: false,
      isAdmin: false,
      isSubscriber: false,
      credits: 0,
      unlimited: false,
      reason: "nao_autenticado",
    };
  }

  const sub = await getSubscriberByEmail(cleanEmail);
  if (!sub) {
    return {
      allowed: false,
      isAdmin: false,
      isSubscriber: false,
      credits: 0,
      unlimited: false,
      reason: "nao_cadastrado",
    };
  }

  if (sub.status !== "ativo") {
    return {
      allowed: false,
      isAdmin: false,
      isSubscriber: false,
      credits: sub.credits || 0,
      unlimited: Boolean(sub.unlimited),
      plan: sub.plan,
      reason: "bloqueado",
    };
  }

  const isUnlimited = Boolean(sub.unlimited);
  const hasCredits = isUnlimited || (typeof sub.credits === "number" && sub.credits > 0);

  if (!hasCredits) {
    return {
      allowed: false,
      isAdmin: false,
      isSubscriber: false,
      credits: 0,
      unlimited: false,
      plan: sub.plan,
      reason: "sem_creditos",
    };
  }

  return {
    allowed: true,
    isAdmin: false,
    isSubscriber: true,
    credits: isUnlimited ? 999999 : sub.credits,
    unlimited: isUnlimited,
    plan: sub.plan,
  };
}

/**
 * Consome crédito de um assinante após uma geração bem-sucedida
 */
export async function deductCredit(email: string, amount: number = 1): Promise<{
  success: boolean;
  remainingCredits: number;
}> {
  const cleanEmail = (email || "").toLowerCase().trim();
  if (cleanEmail === "der.contatos@gmail.com") {
    return { success: true, remainingCredits: 999999 };
  }

  const list = await getSubscribersList();
  const subIndex = list.findIndex((s) => s.email.toLowerCase().trim() === cleanEmail);
  if (subIndex === -1) {
    return { success: false, remainingCredits: 0 };
  }

  const sub = list[subIndex];
  if (sub.unlimited) {
    return { success: true, remainingCredits: 999999 };
  }

  const current = Number(sub.credits) || 0;
  const newCredits = Math.max(0, current - amount);

  list[subIndex] = {
    ...sub,
    credits: newCredits,
    updatedAt: new Date().toISOString(),
  };

  await persistSubscribers(list);
  return { success: true, remainingCredits: newCredits };
}
