export interface UserProfile {
  email: string;
  name: string;
  role: "admin" | "client";
  initials: string;
}

export const ADMIN_EMAIL = "der.contatos@gmail.com";

export function getCurrentUser(): UserProfile | null {
  try {
    if (typeof window !== "undefined") {
      const isLoggedOut =
        sessionStorage.getItem("db_explicitly_logged_out") === "true" ||
        localStorage.getItem("zion_logged_out") === "true";

      if (isLoggedOut) {
        return null;
      }

      const saved = localStorage.getItem("zion_auth_user") || localStorage.getItem("zion_current_user") || localStorage.getItem("currentUser") || localStorage.getItem("zion_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          const email = parsed.email.trim();
          const cleanEmail = email.toLowerCase();
          const isAdmin = cleanEmail === ADMIN_EMAIL || cleanEmail === "ricardo.jrsr.gov@gmail.com" || parsed.role === "admin";
          const role = isAdmin ? "admin" : "client";
          const name = parsed.name || localStorage.getItem("zion_user_name") || (isAdmin ? "Ricardo" : email.split("@")[0]);
          const initials = name.slice(0, 2).toUpperCase();
          return { email, name, role, initials };
        }
      }
      const email = localStorage.getItem("zion_user_email");
      if (email && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        const isAdmin = cleanEmail === ADMIN_EMAIL || cleanEmail === "ricardo.jrsr.gov@gmail.com";
        const role = isAdmin ? "admin" : "client";
        const name = localStorage.getItem("zion_user_name") || (isAdmin ? "Ricardo" : cleanEmail.split("@")[0]);
        const initials = name.slice(0, 2).toUpperCase();
        return { email: cleanEmail, name, role, initials };
      }

      // Default active profile for the workspace is the admin (only if not explicitly logged out)
      return {
        email: ADMIN_EMAIL,
        name: "Ricardo",
        role: "admin",
        initials: "RI"
      };
    }
  } catch (e) {}
  return null;
}

export function getCurrentUserRole(): "admin" | "client" {
  try {
    const user = getCurrentUser();
    if (user) return user.role;
  } catch (e) {}
  return "client";
}

export function getCurrentUserEmail(): string {
  try {
    const user = getCurrentUser();
    if (user) return user.email;
  } catch (e) {}
  return "";
}

export function isUserAdmin(): boolean {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    const email = (user.email || "").toLowerCase().trim();
    if (email === ADMIN_EMAIL || email === "ricardo.jrsr.gov@gmail.com") return true;
    return user.role === "admin";
  } catch (e) {
    return false;
  }
}

export function performSignOut(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("zion_logged_out", "true");
      sessionStorage.setItem("db_explicitly_logged_out", "true");

      // Clear all auth and user profile storage keys
      const keysToRemove = [
        "zion_auth_user",
        "zion_current_user",
        "zion_user",
        "zion_user_email",
        "zion_user_name",
        "zion_user_instagram",
        "currentUser",
        "zion_user_role",
        "custom_gemini_api_key"
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Remove any Supabase or OAuth tokens from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase") || key.includes("auth-token")) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (e) {
    console.warn("Erro ao realizar logout:", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zion:auth_changed", { detail: { user: null } }));
    window.dispatchEvent(new CustomEvent("open-entry-modal"));
    window.dispatchEvent(new CustomEvent("open-public-entry-modal"));
  }
}

export function openPlanModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-credits-modal", { detail: { reason: "admin_required" } }));
  }
}

export function checkAdminOrOpenPlan(customApiKey?: string): boolean {
  if (isUserAdmin()) return true;
  const email = getCurrentUserEmail().toLowerCase().trim();
  if (email === ADMIN_EMAIL || email === "ricardo.jrsr.gov@gmail.com") return true;
  if (customApiKey && customApiKey.trim().length > 10) return true;
  if (email && email.length > 0) return true;
  openPlanModal();
  return false;
}

export function getAuthHeaders(customApiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "x-user-role": getCurrentUserRole(),
    "x-user-email": getCurrentUserEmail() || ADMIN_EMAIL,
  };
  const effectiveKey = customApiKey || (typeof window !== "undefined" ? localStorage.getItem("custom_gemini_api_key") : "");
  if (effectiveKey && effectiveKey.trim().length > 5) {
    headers["x-custom-api-key"] = effectiveKey.trim();
  }
  return headers;
}

