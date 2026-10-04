'use client';

import { useQueryState, parseAsString } from 'nuqs';
import type { DashboardRange, DashboardFilterParams } from '@/types';

export function useDashboardFilters() {
  const [range, setRange] = useQueryState(
    'range',
    parseAsString.withDefault('last_30_days').withOptions({ shallow: true })
  );
  const [from, setFrom] = useQueryState(
    'from',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [to, setTo] = useQueryState(
    'to',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [studioId, setStudioId] = useQueryState(
    'studioId',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );

  const effectiveRange = (range || 'last_30_days') as DashboardRange;

  const filters: DashboardFilterParams = {
    range: effectiveRange,
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(studioId ? { studioId } : {}),
  };

  return {
    filters,
    range: effectiveRange,
    setRange: (val: DashboardRange) => setRange(val),
    from,
    setFrom: (val: string) => setFrom(val),
    to,
    setTo: (val: string) => setTo(val),
    studioId,
    setStudioId: (val: string) => setStudioId(val),
    resetFilters: () => {
      setRange('last_30_days');
      setFrom('');
      setTo('');
      setStudioId('');
    },
  };
}
