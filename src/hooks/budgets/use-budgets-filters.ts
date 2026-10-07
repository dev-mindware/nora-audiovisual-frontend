'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback } from 'react';
import type { BudgetFilters } from '@/services/budgets-service';

export function useBudgetsFilters() {
  const [search, setSearchState] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [status, setStatusState] = useQueryState(
    'status',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [clientId, setClientIdState] = useQueryState(
    'clientId',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [projectId, setProjectIdState] = useQueryState(
    'projectId',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [startDate, setStartDateState] = useQueryState(
    'startDate',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [endDate, setEndDateState] = useQueryState(
    'endDate',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [sortBy, setSortByState] = useQueryState(
    'sortBy',
    parseAsString.withDefault('createdAt').withOptions({ shallow: true })
  );
  const [sortOrder, setSortOrderState] = useQueryState(
    'sortOrder',
    parseAsString.withDefault('desc').withOptions({ shallow: true })
  );
  const [page, setPageState] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const [limit, setLimitState] = useQueryState(
    'limit',
    parseAsInteger.withDefault(10).withOptions({ shallow: true })
  );

  const setSearch = useCallback(
    (val: string) => {
      setSearchState(val || '');
      setPageState(1);
    },
    [setSearchState, setPageState]
  );

  const setStatus = useCallback(
    (val: string) => {
      setStatusState(val);
      setPageState(1);
    },
    [setStatusState, setPageState]
  );

  const setClientId = useCallback(
    (val: string) => {
      setClientIdState(val || '');
      setPageState(1);
    },
    [setClientIdState, setPageState]
  );

  const setProjectId = useCallback(
    (val: string) => {
      setProjectIdState(val || '');
      setPageState(1);
    },
    [setProjectIdState, setPageState]
  );

  const setSort = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
      setSortByState(newSortBy);
      setSortOrderState(newSortOrder);
      setPageState(1);
    },
    [setSortByState, setSortOrderState, setPageState]
  );

  const setDateRange = useCallback(
    (start?: string, end?: string) => {
      setStartDateState(start || '');
      setEndDateState(end || '');
      setPageState(1);
    },
    [setStartDateState, setEndDateState, setPageState]
  );

  const setPage = useCallback(
    (val: number) => {
      setPageState(val);
    },
    [setPageState]
  );

  const setLimit = useCallback(
    (val: number) => {
      setLimitState(val);
      setPageState(1);
    },
    [setLimitState, setPageState]
  );

  const resetFilters = useCallback(() => {
    setSearchState('');
    setStatusState('ALL');
    setClientIdState('');
    setProjectIdState('');
    setStartDateState('');
    setEndDateState('');
    setSortByState('createdAt');
    setSortOrderState('desc');
    setPageState(1);
  }, [
    setSearchState,
    setStatusState,
    setClientIdState,
    setProjectIdState,
    setStartDateState,
    setEndDateState,
    setSortByState,
    setSortOrderState,
    setPageState,
  ]);

  const filters: BudgetFilters = {
    search: search || undefined,
    status: status !== 'ALL' ? status : undefined,
    clientId: clientId || undefined,
    projectId: projectId || undefined,
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
    sortBy: sortBy || 'createdAt',
    sortOrder: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    page,
    limit,
  };

  return {
    filters,
    search,
    status,
    clientId,
    projectId,
    startDate,
    endDate,
    sortBy,
    sortOrder: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    page,
    limit,
    setSearch,
    setStatus,
    setClientId,
    setProjectId,
    setSort,
    setDateRange,
    setPage,
    setLimit,
    resetFilters,
  };
}
