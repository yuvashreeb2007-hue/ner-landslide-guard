'use client';

import { useState, useEffect } from 'react';
import { reportingService } from './ReportingService';
import { MockComputerVisionService } from './vision/MockComputerVisionService';
import { VisionProvider } from './vision/VisionProvider';
import { FieldReportRecord, FieldReportInput, ReportStatus } from './types';

export const visionService: VisionProvider = new MockComputerVisionService();

export function useFieldReports(statusFilter?: string, typeFilter?: string) {
  const [reports, setReports] = useState<FieldReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = reportingService.subscribe((list) => {
      if (!isMounted) return;
      let filtered = [...list];
      if (statusFilter && statusFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
      if (typeFilter && typeFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.incidentType === typeFilter);
      }
      setReports(filtered);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [statusFilter, typeFilter]);

  return {
    reports,
    isLoading,
    submitReport: (input: FieldReportInput) => reportingService.submitReport(input),
    updateReportStatus: (id: string, status: ReportStatus, notes?: string) =>
      reportingService.updateReportStatus(id, status, notes),
  };
}

export * from './types';
export * from './ReportingService';
export * from './vision/VisionProvider';
export * from './vision/MockComputerVisionService';
