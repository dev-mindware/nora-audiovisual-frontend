'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components';
import { EvolutionPoint } from '@/services/insights-service';
import { TrendingUp } from 'lucide-react';

interface InsightsRevenueChartProps {
  data: EvolutionPoint[];
}

export function InsightsRevenueChart({ data }: InsightsRevenueChartProps) {
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="flex flex-col h-full bg-card border-border shadow-none rounded-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Evolução Financeira da Produtora
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Receitas de Produção vs Despesas Operacionais vs Lucro Líquido
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Margem Consistente</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4 pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="insightsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="insightsProfitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="insightsExpensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />

              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    revenue: 'Faturamento Bruto',
                    profit: 'Lucro Operacional',
                    expenses: 'Despesas Diretas',
                  };
                  return [formatKz(value), labels[name] || name];
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    revenue: 'Faturamento',
                    profit: 'Lucro Líquido',
                    expenses: 'Despesas',
                  };
                  return labels[value] || value;
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#insightsRevenueGradient)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#insightsProfitGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#insightsExpensesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
