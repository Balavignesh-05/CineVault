import { api } from './client';
import type {
  AdminStats,
  AdminLog,
  PublicUser,
  Review,
  Collection,
  Report,
  PaginatedResult,
} from '@cinevault/shared-types';

export const adminApi = {
  getStats: () => api.get<{ data: AdminStats }>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: PaginatedResult<PublicUser & { email: string; role: string; status: string }> }>(
      '/admin/users',
      { params }
    ),

  suspendUser: (id: string) => api.patch<{ data: PublicUser }>(`/admin/users/${id}/suspend`),

  banUser: (id: string) => api.patch<{ data: PublicUser }>(`/admin/users/${id}/ban`),

  restoreUser: (id: string) => api.patch<{ data: PublicUser }>(`/admin/users/${id}/restore`),

  getReviews: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: PaginatedResult<Review> }>('/admin/reviews', { params }),

  approveReview: (id: string) => api.patch<{ data: Review }>(`/admin/reviews/${id}/approve`),

  featureReview: (id: string) => api.patch<{ data: Review }>(`/admin/reviews/${id}/feature`),

  deleteReview: (id: string) => api.delete<void>(`/admin/reviews/${id}`),

  getCollections: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: PaginatedResult<Collection> }>('/admin/collections', { params }),

  featureCollection: (id: string) => api.patch<{ data: Collection }>(`/admin/collections/${id}/feature`),

  deleteCollection: (id: string) => api.delete<void>(`/admin/collections/${id}`),

  getReports: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ data: PaginatedResult<Report> }>('/admin/reports', { params }),

  resolveReport: (id: string, status: string) =>
    api.patch<{ data: Report }>(`/admin/reports/${id}/resolve`, { status }),

  getLogs: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: PaginatedResult<AdminLog> }>('/admin/logs', { params }),
};
