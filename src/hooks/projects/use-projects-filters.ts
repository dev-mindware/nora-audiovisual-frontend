'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback } from 'react';
import type { ProjectFilters } from '@/services/projects-service';

export function useProjectsFilters() {
  const [search, setSearchState] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [stage, setStageState] = useQueryState(
    'stage',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [status, setStatusState] = useQueryState(
    'status',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [clientId, setClientIdState] = useQueryState(
    'clientId',
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

  const setStage = useCallback(
    (val: string) => {
      setStageState(val);
      setPageState(1);
    },
    [setStageState, setPageState]
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
    setStageState('ALL');
    setStatusState('ALL');
    setClientIdState('');
    setPageState(1);
  }, [setSearchState, setStageState, setStatusState, setClientIdState, setPageState]);

  const filters: ProjectFilters = {
    search: search || undefined,
    stage: stage !== 'ALL' ? stage : undefined,
    status: status !== 'ALL' ? status : undefined,
    clientId: clientId || undefined,
    page,
    limit,
  };

  return {
    filters,
    search,
    stage,
    status,
    clientId,
    page,
    limit,
    setSearch,
    setStage,
    setStatus,
    setClientId,
    setPage,
    setLimit,
    resetFilters,
  };
}
