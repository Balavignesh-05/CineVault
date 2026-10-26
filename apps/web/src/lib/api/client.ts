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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(url, {
        ...init,
        headers,
        credentials: 'include', // for refresh token cookie
        signal: controller.signal,
      });

      // Try to refresh if 401
      if (response.status === 401 && !skipAuth && !path.includes('/auth/')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry with new cookie and dedicated timeout
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 15_000);
          try {
            const retryResponse = await fetch(url, {
              ...init,
              headers,
              credentials: 'include',
              signal: retryController.signal,
            });
            if (!retryResponse.ok) {
              const error = await retryResponse.json().catch(() => ({}));
              const errorCode: string = error?.error?.code ?? '';
              let errorMessage: string = error?.error?.message ?? 'Request failed';
              const AUTH_PASSTHROUGH_CODES = new Set([
                'REDIRECT_URI_MISMATCH', 'INVALID_OAUTH_CLIENT', 'GOOGLE_NOT_CONFIGURED',
                'INVALID_AUTH_CODE', 'MISSING_ID_TOKEN', 'INVALID_ID_TOKEN',
                'EMAIL_NOT_VERIFIED', 'INCOMPLETE_PROFILE',
              ]);
              if (retryResponse.status >= 500 && !AUTH_PASSTHROUGH_CODES.has(errorCode)) {
                errorMessage = 'Service is currently unavailable. Please try again.';
              }
              throw new ApiError(retryResponse.status, errorMessage, errorCode);
            }
            if (retryResponse.status === 204) return {} as T;
            return retryResponse.json() as Promise<T>;
          } finally {
            clearTimeout(retryTimeoutId);
          }
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorCode: string = error?.error?.code ?? '';
        let errorMessage: string = error?.error?.message ?? 'Request failed';
        // For 5xx responses, show a generic message unless it's a known auth-specific error
        // that has a meaningful user-facing message (e.g., REDIRECT_URI_MISMATCH, INVALID_OAUTH_CLIENT)
        const AUTH_PASSTHROUGH_CODES = new Set([
          'REDIRECT_URI_MISMATCH',
          'INVALID_OAUTH_CLIENT',
          'GOOGLE_NOT_CONFIGURED',
          'INVALID_AUTH_CODE',
          'MISSING_ID_TOKEN',
          'INVALID_ID_TOKEN',
          'EMAIL_NOT_VERIFIED',
          'INCOMPLETE_PROFILE',
        ]);
        if (response.status >= 500 && !AUTH_PASSTHROUGH_CODES.has(errorCode)) {
          errorMessage = 'Service is currently unavailable. Please try again.';
        }
        throw new ApiError(response.status, errorMessage, errorCode);
      }

      if (response.status === 204) return {} as T;
      return response.json() as Promise<T>;
    } catch (err) {
      if ((err instanceof DOMException && err.name === 'AbortError') || (err instanceof Error && err.name === 'AbortError')) {
        throw new ApiError(0, 'Request timed out. Please check your connection and try again.', 'TIMEOUT');
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(0, 'Network error. Please check your connection.', 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async refreshToken(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
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
