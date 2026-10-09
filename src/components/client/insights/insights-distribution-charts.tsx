'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components';
import { RevenueGenre, StudioOccupancyMetric, EquipmentRoiMetric } from '@/services/insights-service';

interface InsightsDistributionChartsProps {
  revenueByGenre: RevenueGenre[];
  studioOccupancy: StudioOccupancyMetric[];
  equipmentRoi: EquipmentRoiMetric[];
}

export function InsightsDistributionCharts({
  revenueByGenre,
  studioOccupancy,
  equipmentRoi,
}: InsightsDistributionChartsProps) {
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const genreColors = ['var(--primary)', '#3b82f6', '#a855f7', '#10b981'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      {/* 1. Donut: Faturação por Género Audiovisual */}
      <Card className="flex flex-col bg-card border-border shadow-none rounded-xs">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Receita por Género Audiovisual
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Composição das produções faturadas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByGenre}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="label"
                >
                  {revenueByGenre.map((_, index) => (
                    <Cell
                      key={`genre-cell-${index}`}
                      fill={genreColors[index % genreColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatKz(value), 'Faturado']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={44}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Donut: Ocupação e Rendimento por Estúdio */}
      <Card className="flex flex-col bg-card border-border shadow-none rounded-xs">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Ocupação de Estúdios & Ilhas
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Horas reservadas vs. capacidade mensal
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studioOccupancy}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="hoursBooked"
                  nameKey="name"
                >
                  {studioOccupancy.map((entry, index) => (
                    <Cell key={`studio-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} horas reservadas`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={44}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Bar Chart: ROI de Câmaras & Equipamentos */}
      <Card className="flex flex-col bg-card border-border shadow-none rounded-xs">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Utilização de Câmaras & Luz
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Taxa de ocupação dos principais kits (%)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={equipmentRoi}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickFormatter={(val) => `${val}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="model"
                  stroke="var(--muted-foreground)"
                  fontSize={9}
                  width={90}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.split(' ')[0] + ' ' + (val.split(' ')[1] || '')}
                />
                <Tooltip
                  formatter={(value: number, _, item) => [
                    `${value}% de utilização (${formatKz(item.payload.revenueGeneratedKz)})`,
                    item.payload.model,
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="utilizationRate"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
