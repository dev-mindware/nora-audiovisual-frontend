'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface EntityFilters {
  search: string | null;
  status: string | null;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc' | null;
  page: number;
  limit: number;
  [key: string]: any;
}

export function useEntityFilters(options?: { defaultLimit?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultLimit = options?.defaultLimit ?? 10;

  const filters = useMemo<EntityFilters>(() => {
    return {
      search: searchParams?.get('search') || null,
      status: searchParams?.get('status') || null,
      sortBy: searchParams?.get('sortBy') || null,
      sortOrder: (searchParams?.get('sortOrder') as 'asc' | 'desc') || null,
      page: Number(searchParams?.get('page')) || 1,
      limit: Number(searchParams?.get('limit')) || defaultLimit,
    };
  }, [searchParams, defaultLimit]);

  const setFilters = useCallback(
    (newFilters: Partial<Record<string, any>>) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      if (!('page' in newFilters)) {
        params.set('page', '1');
      }
      const qs = params.toString();
      router.push(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router, searchParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      setFilters({ search: search.trim() || null });
    },
    [setFilters]
  );

  const setStatus = useCallback(
    (status: string | null) => {
      setFilters({ status });
    },
    [setFilters]
  );

  const setPage = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  const clearAllFilters = useCallback(() => {
    router.push('?', { scroll: false });
  }, [router]);

  return {
    filters,
    search: filters.search,
    status: filters.status,
    page: filters.page,
    limit: filters.limit,
    setFilters,
    setSearch,
    setStatus,
    setPage,
    clearAllFilters,
  };
}
