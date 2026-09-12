const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

// Auth tokens are now managed by HttpOnly cookies

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = API_BASE, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  private async fetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth = false, params, ...init } = options;
    
    // Merge default SSR headers (like Cookie) with request headers
    const headers = new Headers(this.defaultHeaders);
    if (init.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Build URL with query params
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
      credentials: 'include', // for refresh token cookie
    });

    // Try to refresh if 401
    if (response.status === 401 && !skipAuth && !path.includes('/auth/')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry with new cookie
        const retryResponse = await fetch(url, {
          ...init,
          headers,
          credentials: 'include',
        });
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({}));
          throw new ApiError(retryResponse.status, error?.error?.message ?? 'Request failed', error?.error?.code);
        }
        return retryResponse.json() as Promise<T>;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      let errorMessage = error?.error?.message ?? 'Request failed';
      if (response.status >= 500) {
        errorMessage = 'Service is currently unavailable. Please try again.';
      }
      throw new ApiError(response.status, errorMessage, error?.error?.code);
    }

    if (response.status === 204) return {} as T;
    return response.json() as Promise<T>;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
