import { api } from './client';
import type { ApiResponse, AuthTokens, User, LoginRequest, RegisterRequest } from '@cinevault/shared-types';

export async function login(credentials: LoginRequest) {
  const res = await api.post<ApiResponse<{ user: User; expiresIn: number }>>(
    '/auth/login',
    credentials,
    { skipAuth: true },
  );
  return res.data;
}

export async function register(data: RegisterRequest) {
  const res = await api.post<ApiResponse<{ user: User; expiresIn: number }>>(
    '/auth/register',
    data,
    { skipAuth: true },
  );
  return res.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe() {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data;
}
