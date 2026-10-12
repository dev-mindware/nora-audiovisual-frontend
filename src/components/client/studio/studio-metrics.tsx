'use client';

import { DynamicMetricCard } from '@/components/shared/dynamic-metric-card';

interface StudioMetricsProps {
  totalSets: number;
  availableSets: number;
  activeBookings: number;
  totalCapacity: number;
}

export function StudioMetrics({
  totalSets,
  availableSets,
  activeBookings,
  totalCapacity,
}: StudioMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <DynamicMetricCard
        subtitle="Sets & Ilhas"
        title={totalSets}
        icon="Layers"
        description="Sets acústicos e ilhas de edição"
      />
      <DynamicMetricCard
        subtitle="Disponíveis"
        title={availableSets}
        icon="CheckCheck"
        description="Prontos para rodagem imediata"
      />
      <DynamicMetricCard
        subtitle="Ocupação / Agenda"
        title={activeBookings}
        icon="CalendarCheck"
        description="Marcações e rodagens ativas"
      />
      <DynamicMetricCard
        subtitle="Capacidade Total"
        title={`${totalCapacity} pax`}
        icon="Users"
        description="Lotação máxima de equipas e elenco"
      />
    </div>
  );
}
