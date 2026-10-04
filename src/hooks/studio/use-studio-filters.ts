'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { useCallback } from 'react';

export function useStudioFilters() {
  const [resourceType, setResourceTypeState] = useQueryState(
    'resourceType',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [bookingStatus, setBookingStatusState] = useQueryState(
    'bookingStatus',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );
  const [resourceId, setResourceIdState] = useQueryState(
    'resourceId',
    parseAsString.withDefault('').withOptions({ shallow: true })
  );

  const setResourceType = useCallback(
    (val: string | null | undefined) => {
      setResourceTypeState(val || '');
    },
    [setResourceTypeState]
  );

  const setBookingStatus = useCallback(
    (val: string | null | undefined) => {
      setBookingStatusState(val || '');
    },
    [setBookingStatusState]
  );

  const setResourceId = useCallback(
    (val: string | null | undefined) => {
      setResourceIdState(val || '');
    },
    [setResourceIdState]
  );

  const resetFilters = useCallback(() => {
    setResourceTypeState('');
    setBookingStatusState('');
    setResourceIdState('');
  }, [setResourceTypeState, setBookingStatusState, setResourceIdState]);

  return {
    resourceType,
    bookingStatus,
    resourceId,
    setResourceType,
    setBookingStatus,
    setResourceId,
    resetFilters,
  };
}
