'use client';

import { DynamicMetricCard } from '@/components';
import { InsightsOverview } from '@/services/insights-service';

interface InsightsKpisProps {
  overview: InsightsOverview;
}

export function InsightsKpis({ overview }: InsightsKpisProps) {
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      <DynamicMetricCard
        subtitle="Faturação Acumulada"
        title={formatKz(overview.totalRevenueKz)}
        icon="DollarSign"
        description={`+${overview.revenueVariationPercent}% vs. período anterior`}
      />
      <DynamicMetricCard
        subtitle="Margem Média de Produções"
        title={`${overview.averageProjectMarginPercent.toFixed(1)}%`}
        icon="Percent"
        description={`+${overview.marginVariationPercent}% de lucro operacional`}
      />
      <DynamicMetricCard
        subtitle="Ocupação Global de Estúdios"
        title={`${overview.studioOccupancyRatePercent}%`}
        icon="Building2"
        description={`+${overview.studioOccupancyVariationPercent}% taxa de reserva`}
      />
      <DynamicMetricCard
        subtitle="Câmaras & Luz em Rodagem"
        title={`${overview.allocatedEquipmentHours} hrs`}
        icon="Camera"
        description={`+${overview.allocatedEquipmentHoursVariationPercent}% diárias faturadas`}
      />
    </div>
  );
}
