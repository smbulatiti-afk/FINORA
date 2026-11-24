import { apiFetch, setAccessToken } from "./api-client";
import type { AppUser } from "@/types";
export interface AuthResult { accessToken: string; user: AppUser }
export const authService = {
  register: (value: { name: string; username: string; email: string; password: string; confirmPassword: string }) =>
    apiFetch<{ user: AppUser }>("/auth/register", { method: "POST", body: JSON.stringify(value) }),
  requestPasswordReset: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (value: { token: string; password: string; confirmPassword: string }) =>
    apiFetch<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify(value) }),
  login: async (identifier: string, password: string) => {
    const result = await apiFetch<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
    setAccessToken(result.accessToken);
    return result;
  },
  me: () => apiFetch<AppUser>("/auth/me"),
  logout: async () => { await apiFetch<{ success: boolean }>("/auth/logout", { method: "POST" }); setAccessToken(null); },
};
