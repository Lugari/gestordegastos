import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as ReportService from '../services/reportConfigService';

// Reportes guardados (configuraciones reutilizables) sobre @reports.
export const useSavedReports = () => {
  const queryClient = useQueryClient();
  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: ReportService.getAllReports,
  });

  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ['reports'] });

  const saveMutation = useMutation({
    mutationFn: ({ name, config }) => ReportService.saveReport(name, config),
    onSuccess,
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => ReportService.deleteReportById(id),
    onSuccess,
  });

  return {
    reports,
    saveReport: saveMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
  };
};
