'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback } from 'react';
import type { DeliverableFilters } from '@/services/deliverables-service';

export function useDeliverablesFilters() {
  const [search, setSearchState] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [status, setStatusState] = useQueryState(
    'status',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [type, setTypeState] = useQueryState(
    'type',
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

  const setStatus = useCallback(
    (val: string) => {
      setStatusState(val);
      setPageState(1);
    },
    [setStatusState, setPageState]
  );

  const setType = useCallback(
    (val: string) => {
      setTypeState(val);
      setPageState(1);
    },
    [setTypeState, setPageState]
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
    setStatusState('ALL');
    setTypeState('ALL');
    setProjectIdState('');
    setPageState(1);
  }, [setSearchState, setStatusState, setTypeState, setProjectIdState, setPageState]);

  const filters: DeliverableFilters = {
    search: search || undefined,
    status: status !== 'ALL' ? status : undefined,
    type: type !== 'ALL' ? type : undefined,
    projectId: projectId || undefined,
    page,
    limit,
  };

  return {
    filters,
    search,
    status,
    type,
    projectId,
    page,
    limit,
    setSearch,
    setStatus,
    setType,
    setProjectId,
    setPage,
    setLimit,
    resetFilters,
  };
}
