import { config } from './config';

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export function getToken(): string | null {
  return localStorage.getItem(config.auth.tokenKey);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(config.auth.tokenKey, token);
  else localStorage.removeItem(config.auth.tokenKey);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Use environment variable for API base URL in production, proxy in development
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = config.isProd && config.api.baseUrl 
    ? `${config.api.baseUrl}${apiPath}` 
    : apiPath; // In development, use proxy
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
  
  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
      const message = typeof body === "string" ? body : body?.error || "Request failed";
      throw new Error(message);
    }

    return body as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export const api = {
  post: <T>(path: string, data?: unknown) => apiFetch<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  get: <T>(path: string) => apiFetch<T>(path),
  put: <T>(path: string, data?: unknown) => apiFetch<T>(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
}; 