export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  if (
    response.status === 401 &&
    retry &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register")
  ) {
    if (await refreshSession()) return apiFetch<T>(path, init, false);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === "string"
        ? body.message
        : Array.isArray(body?.message)
          ? body.message.join(", ")
          : "The FINORA server could not complete your request.";
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export async function refreshSession(): Promise<boolean> {
  try {
    const result = await apiFetch<{ accessToken: string }>(
      "/auth/refresh",
      { method: "POST" },
      false,
    );
    setAccessToken(result.accessToken);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}
