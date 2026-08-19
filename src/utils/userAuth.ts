export function getCurrentUserRole(): "admin" | "client" {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zion_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === "admin" || parsed?.email === "der.contatos@gmail.com") return "admin";
        if (parsed?.role) return parsed.role;
      }
      const email = localStorage.getItem("zion_user_email");
      if (email === "der.contatos@gmail.com") return "admin";
      if (email) return "client";
    }
  } catch (e) {}
  return "admin"; // Default fallback
}

export function getCurrentUserEmail(): string {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("zion_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) return parsed.email;
      }
      const email = localStorage.getItem("zion_user_email");
      if (email) return email;
    }
  } catch (e) {}
  return "der.contatos@gmail.com";
}

export function isUserAdmin(): boolean {
  return getCurrentUserRole() === "admin";
}

export function openPlanModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-credits-modal", { detail: { reason: "admin_required" } }));
  }
}

export function checkAdminOrOpenPlan(customApiKey?: string): boolean {
  // If user provided their own custom API key in settings, allow generation
  if (customApiKey && customApiKey.trim().length > 5) return true;
  const storedCustomKey = typeof window !== "undefined" ? localStorage.getItem("custom_gemini_api_key") : null;
  if (storedCustomKey && storedCustomKey.trim().length > 5) return true;

  if (!isUserAdmin()) {
    openPlanModal();
    return false;
  }
  return true;
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
