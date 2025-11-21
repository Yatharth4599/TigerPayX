// Auth utility functions for client-side auth state management

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("tigerpayx_token");
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tigerpayx_token");
}

export function getAuthEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tigerpayx_email");
}

export function setAuth(token: string, email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("tigerpayx_token", token);
  localStorage.setItem("tigerpayx_email", email);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tigerpayx_token");
  localStorage.removeItem("tigerpayx_email");
  localStorage.removeItem("tigerpayx_auth"); // Legacy
}

export function requireAuth(): boolean {
  if (typeof window === "undefined") return false;
  return isAuthenticated();
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
