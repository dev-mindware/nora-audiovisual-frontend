'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback } from 'react';
import type { FileFilters } from '@/services/files-service';

export function useFilesFilters() {
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
  const [projectId, setProjectIdState] = useQueryState(
    'projectId',
    parseAsString.withDefault('').withOptions({ shallow: true })
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

  const setProjectId = useCallback(
    (val: string) => {
      setProjectIdState(val || '');
      setPageState(1);
    },
    [setProjectIdState, setPageState]
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
    setProjectIdState('');
    setPageState(1);
  }, [setSearchState, setCategoryState, setStatusState, setProjectIdState, setPageState]);

  const filters: FileFilters = {
    search: search || undefined,
    fileType: category !== 'ALL' ? category : undefined,
    status: status !== 'ALL' ? status : undefined,
    projectId: projectId || undefined,
    page,
    limit,
  };

  return {
    filters,
    search,
    category,
    status,
    projectId,
    page,
    limit,
    setSearch,
    setCategory,
    setStatus,
    setProjectId,
    setPage,
    setLimit,
    resetFilters,
  };
}
