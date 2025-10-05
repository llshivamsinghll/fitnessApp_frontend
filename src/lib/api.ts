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

  // Handle API URL construction - always use direct backend URL
  let fullUrl: string;
  let backendUrl = config.api.baseUrl || config.dev.backendUrl;
  
  // Prevent requesting the frontend itself
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  if (!backendUrl || 
      backendUrl.includes('your-backend') || 
      backendUrl === currentOrigin ||
      backendUrl === '') {
    // Log the issue for debugging
    console.error('❌ Invalid backend URL detected:', {
      backendUrl,
      currentOrigin,
      configApiBaseUrl: config.api.baseUrl,
      configDevBackendUrl: config.dev.backendUrl,
      isDev: config.isDev,
      isProd: config.isProd
    });
    throw new Error(`Invalid backend URL configuration. Please set VITE_API_BASE_URL environment variable. Current value: ${backendUrl}`);
  }
  
  // Always use direct backend URL (no proxy)
  const cleanPath = path.startsWith('/api') ? path.substring(4) : path; // Remove /api prefix
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  fullUrl = `${backendUrl}/api${normalizedPath}`;
  
  // Debug logging in development AND production when debug is enabled
  if (config.features.debug) {
    console.log('🔗 API Request:', {
      originalPath: path,
      fullUrl,
      isDev: config.isDev,
      isProd: config.isProd,
      configApiBaseUrl: config.api.baseUrl,
      configDevBackendUrl: config.dev.backendUrl,
      baseUrl: config.api.baseUrl,
      method: options.method || 'GET'
    });
  }

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