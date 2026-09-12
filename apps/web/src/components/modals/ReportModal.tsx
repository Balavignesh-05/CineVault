'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateReport } from '@/hooks/useReports';
import type { ReportEntityType, ReportReason } from '@cinevault/shared-types';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: ReportEntityType;
  entityId: string;
  entityTitle?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'spam', label: 'Spam', description: 'Commercial self-promotion, repeated content, or misleading links' },
  { value: 'harassment', label: 'Harassment', description: 'Personal attacks, bullying, or targeted hostility' },
  { value: 'hate_speech', label: 'Hate Speech', description: 'Discrimatory content targeting protected characteristics' },
  { value: 'nsfw', label: 'NSFW / Explicit Content', description: 'Sexually explicit material or graphic violence' },
  { value: 'fake_info', label: 'Fake Information', description: 'Intentionally false metadata or impersonation' },
  { value: 'other', label: 'Other Issue', description: 'Violates community guidelines' },
];

export function ReportModal({ open, onClose, entityType, entityId, entityTitle }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
  const createReport = useCreateReport();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReport.mutate(
      {
        entityType,
        entityId,
        reason: selectedReason,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            Report {entityType}
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-muted)]">
            Reporting {entityTitle ? <strong>&ldquo;{entityTitle}&rdquo;</strong> : `this ${entityType}`}. Help us keep CineVault safe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select Reason</Label>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]'
                      : 'bg-[var(--color-bg-base)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => setSelectedReason(reason.value)}
                    className="mt-1 accent-[var(--color-accent-primary)]"
                  />
                  <div>
                    <div className="font-semibold text-sm text-[var(--color-text-primary)]">
                      {reason.label}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {reason.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReport.isPending}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              {createReport.isPending ? 'Submitting…' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
