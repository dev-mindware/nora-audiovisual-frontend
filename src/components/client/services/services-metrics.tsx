'use client';

import { DynamicMetricCard } from '@/components/shared/dynamic-metric-card';

interface ServicesMetricsProps {
  totalServices: number;
  activeServices: number;
  avgPrice: number;
  categoriesCount: number;
}

export function ServicesMetrics({
  totalServices,
  activeServices,
  avgPrice,
  categoriesCount,
}: ServicesMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      <DynamicMetricCard
        subtitle="Total no Catálogo"
        title={totalServices}
        icon="Briefcase"
        description="Pacotes configurados pela produtora"
      />
      <DynamicMetricCard
        subtitle="Serviços Ativos"
        title={activeServices}
        icon="CheckCheck"
        description="Disponíveis no catálogo público"
      />
      <DynamicMetricCard
        subtitle="Ticket Médio"
        title={`${Math.round(avgPrice).toLocaleString('pt-AO')} Kz`}
        icon="DollarSign"
        description="Valor base de referência dos pacotes"
      />
      <DynamicMetricCard
        subtitle="Categorias Cobertas"
        title={`${categoriesCount} Activas`}
        icon="Tag"
        description="Especialidades prontas no catálogo"
      />
    </div>
  );
}
