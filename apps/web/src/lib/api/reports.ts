import { api } from './client';
import type { CreateReportRequest, Report } from '@cinevault/shared-types';

export const reportsApi = {
  createReport: (payload: CreateReportRequest) =>
    api.post<{ data: Report }>('/reports', payload),
};
