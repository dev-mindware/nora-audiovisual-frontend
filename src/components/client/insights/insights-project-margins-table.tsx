'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components';
import { ProjectMarginMetric } from '@/services/insights-service';
import { TrendingUp, TrendingDown, Users, Camera, Building2 } from 'lucide-react';

interface InsightsProjectMarginsTableProps {
  data: ProjectMarginMetric[];
}

export function InsightsProjectMarginsTable({ data }: InsightsProjectMarginsTableProps) {
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-card border-border shadow-none rounded-xs w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              Desvios Orçamentários: Orçado vs. Realizado
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Controle de margem líquida, custos diretos e fugas orçamentárias por projeto
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-border self-start sm:self-auto font-mono">
            {data.length} Produções Monitoradas
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-y border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Produção & Cliente</th>
                <th className="py-3 px-4">Orçado</th>
                <th className="py-3 px-4">Realizado</th>
                <th className="py-3 px-4 text-center">Margem</th>
                <th className="py-3 px-4 text-center">Desvio</th>
                <th className="py-3 px-4 hidden md:table-cell">Composição de Custos Diretos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {data.map((proj) => {
                const isPositive = proj.variancePercent >= 0;
                return (
                  <tr key={proj.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground text-xs">{proj.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{proj.client}</span>
                        <span>•</span>
                        <span className="text-primary font-medium">{proj.category}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {formatKz(proj.budgetedKz)}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-muted-foreground">
                      {formatKz(proj.actualKz)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-primary/10 text-primary">
                        {proj.marginPercent.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive ? '+' : ''}
                        {proj.variancePercent.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1" title="Custo de Equipa">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{formatKz(proj.crewCostKz)}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Custo de Equipamento">
                          <Camera className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{formatKz(proj.gearCostKz)}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Custo de Estúdio">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{formatKz(proj.studioCostKz)}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
