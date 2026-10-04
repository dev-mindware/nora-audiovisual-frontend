'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantAuditService, TenantAuditLogsResponse } from '@/services/tenant-audit-service';
import { InvestigativeAuditEvent } from '@/types/audit';

export function useTenantAudit() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [severity, setSeverity] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const query = useQuery<TenantAuditLogsResponse>({
    queryKey: ['tenant-audit-logs', { page, limit, search, category, severity }],
    queryFn: () =>
      tenantAuditService.listAuditLogs({
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(category !== 'ALL' ? { category } : {}),
        ...(severity !== 'ALL' ? { severity } : {}),
      }),
  });

  return {
    logs: query.data?.data || [],
    meta: query.data?.meta || { page: 1, limit: 50, total: 0, totalPages: 1 },
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    search,
    setSearch,
    category,
    setCategory,
    severity,
    setSeverity,
    page,
    setPage,
  };
}
