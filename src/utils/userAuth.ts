export function getCurrentUserRole(): "admin" | "client" {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zion_auth_user") || localStorage.getItem("zion_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === "admin" && parsed?.email?.toLowerCase()?.trim() === "der.contatos@gmail.com") return "admin";
        if (parsed?.role === "client") return "client";
      }
      const email = localStorage.getItem("zion_user_email")?.toLowerCase()?.trim();
      if (email === "der.contatos@gmail.com") {
        const savedAuth = localStorage.getItem("zion_auth_user");
        if (savedAuth && JSON.parse(savedAuth)?.role === "admin") return "admin";
      }
      if (email) return "client";
    }
  } catch (e) {}
  return "client"; // Default fallback is always non-privileged client
}

export function getCurrentUserEmail(): string {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zion_auth_user") || localStorage.getItem("zion_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) return parsed.email.trim();
      }
      const email = localStorage.getItem("zion_user_email");
      if (email) return email.trim();
    }
  } catch (e) {}
  return "";
}

export function isUserAdmin(): boolean {
  try {
    const role = getCurrentUserRole();
    const email = getCurrentUserEmail().toLowerCase().trim();
    return role === "admin" && email === "der.contatos@gmail.com";
  } catch (e) {
    return false;
  }
}

export function openPlanModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-credits-modal", { detail: { reason: "admin_required" } }));
  }
}

export function checkAdminOrOpenPlan(customApiKey?: string): boolean {
  if (isUserAdmin()) return true;
  if (customApiKey && customApiKey.trim().length > 10) return true;
  const email = getCurrentUserEmail().toLowerCase().trim();
  if (email) {
    return true;
  }
  openPlanModal();
  return false;
}

export function getAuthHeaders(customApiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "x-user-role": getCurrentUserRole(),
    "x-user-email": getCurrentUserEmail(),
  };
  const effectiveKey = customApiKey || (typeof window !== "undefined" ? localStorage.getItem("custom_gemini_api_key") : "");
  if (effectiveKey && effectiveKey.trim().length > 5) {
    headers["x-custom-api-key"] = effectiveKey.trim();
  }
  return headers;
}
