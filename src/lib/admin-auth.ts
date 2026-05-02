const KEY = "jh_admin_auth";
const ADMIN_EMAIL = "admin@aarambh.com";
const ADMIN_PASSWORD = "aArambhaSports";

export const ADMIN_CREDENTIALS = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function login(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    window.localStorage.setItem(KEY, "true");
    window.dispatchEvent(new Event("jh-auth-change"));
    return true;
  }
  return false;
}

export function logout() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("jh-auth-change"));
}
