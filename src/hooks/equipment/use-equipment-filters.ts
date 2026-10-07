'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback } from 'react';
import type { EquipmentFilters } from '@/services/equipment-service';

export function useEquipmentFilters() {
  const [search, setSearchState] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [category, setCategoryState] = useQueryState(
    'category',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [status, setStatusState] = useQueryState(
    'status',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
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

  const setCategory = useCallback(
    (val: string) => {
      setCategoryState(val);
      setPageState(1);
    },
    [setCategoryState, setPageState]
  );

  const setStatus = useCallback(
    (val: string) => {
      setStatusState(val);
      setPageState(1);
    },
    [setStatusState, setPageState]
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
    setCategoryState('ALL');
    setStatusState('ALL');
    setStartDateState('');
    setEndDateState('');
    setSortByState('createdAt');
    setSortOrderState('desc');
    setPageState(1);
  }, [
    setSearchState,
    setCategoryState,
    setStatusState,
    setStartDateState,
    setEndDateState,
    setSortByState,
    setSortOrderState,
    setPageState,
  ]);

  const filters: EquipmentFilters = {
    search: search || undefined,
    category: category !== 'ALL' ? category : undefined,
    status: status !== 'ALL' ? status : undefined,
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
    category,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    page,
    limit,
    setSearch,
    setCategory,
    setStatus,
    setSort,
    setDateRange,
    setPage,
    setLimit,
    resetFilters,
  };
}
