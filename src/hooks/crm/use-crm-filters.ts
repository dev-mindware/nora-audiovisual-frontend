'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback } from 'react';
import type { ClientFilters } from '@/services/clients-service';

export function useCrmFilters() {
  const [search, setSearchState] = useQueryState(
    'search',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [type, setTypeState] = useQueryState(
    'type',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
  );
  const [status, setStatusState] = useQueryState(
    'status',
    parseAsString.withDefault('ALL').withOptions({ shallow: true })
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

  const setType = useCallback(
    (val: string) => {
      setTypeState(val);
      setPageState(1);
    },
    [setTypeState, setPageState]
  );

  const setStatus = useCallback(
    (val: string) => {
      setStatusState(val);
      setPageState(1);
    },
    [setStatusState, setPageState]
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
    setTypeState('ALL');
    setStatusState('ALL');
    setPageState(1);
  }, [setSearchState, setTypeState, setStatusState, setPageState]);

  const filters: ClientFilters = {
    search: search || undefined,
    type: type !== 'ALL' ? type : undefined,
    status: status !== 'ALL' ? status : undefined,
    page,
    limit,
  };

  return {
    filters,
    search,
    type,
    status,
    page,
    limit,
    setSearch,
    setType,
    setStatus,
    setPage,
    setLimit,
    resetFilters,
  };
}
