'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardRoleService } from '@/services/dashboard-role-service';
import type { DashboardFilterParams, RoleDashboardData } from '@/types';

export function useRoleDashboardMetrics(filters?: DashboardFilterParams) {
  return useQuery<RoleDashboardData, Error>({
    queryKey: ['role-dashboard-metrics', filters],
    queryFn: () => dashboardRoleService.getRoleDashboard(filters),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
    refetchOnWindowFocus: false,
  });
}
