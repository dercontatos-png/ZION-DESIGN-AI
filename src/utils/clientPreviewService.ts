export interface ClientPreviewSession {
  active: boolean;
  simulatedEmail: string;
  simulatedName: string;
  simulatedPlan: string;
  simulatedCredits: number;
  simulatedUnlimited: boolean;
}

const STORAGE_KEY = "zion_client_preview_session";

export const DEFAULT_CLIENT_PREVIEW: ClientPreviewSession = {
  active: false,
  simulatedEmail: "cliente.pro@zion.ai",
  simulatedName: "Designer Pro (Simulado)",
  simulatedPlan: "Plano Pro",
  simulatedCredits: 500,
  simulatedUnlimited: false
};

export function getClientPreviewSession(): ClientPreviewSession {
  if (typeof window === "undefined") return DEFAULT_CLIENT_PREVIEW;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        return { ...DEFAULT_CLIENT_PREVIEW, ...parsed };
      }
    }
  } catch (_) {}
  return DEFAULT_CLIENT_PREVIEW;
}

export function startClientPreview(data?: Partial<ClientPreviewSession>): ClientPreviewSession {
  const session: ClientPreviewSession = {
    ...DEFAULT_CLIENT_PREVIEW,
    ...data,
    active: true
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("zion:client_preview_changed", { detail: session }));
  }
  return session;
}

export function exitClientPreview(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("zion:client_preview_changed", { detail: { active: false } }));
  }
}

export function isClientPreviewActive(): boolean {
  return getClientPreviewSession().active;
}
