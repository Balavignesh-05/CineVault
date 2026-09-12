import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import type { CreateReportRequest } from '@cinevault/shared-types';
import { toast } from 'sonner';

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportRequest) => reportsApi.createReport(payload),
    onSuccess: () => {
      toast.success('Thank you. Your report has been submitted for moderation review.');
    },
    onError: () => toast.error('Failed to submit report. Please try again.'),
  });
}
