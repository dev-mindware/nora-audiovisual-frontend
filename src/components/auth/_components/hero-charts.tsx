"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TrendingUp, Package, DollarSign, ArrowUpRight } from "lucide-react";

// --- Mock Data Nora Audiovisual ---

const billingData = [
  { month: "Jan", revenue: 4200 },
  { month: "Fev", revenue: 5800 },
  { month: "Mar", revenue: 4900 },
  { month: "Abr", revenue: 7200 },
  { month: "Mai", revenue: 6400 },
  { month: "Jun", revenue: 8900 },
  { month: "Jul", revenue: 11400 },
];

const stockData = [
  { category: "Câmaras", qty: 28, fill: "var(--primary)" },
  { category: "Óticas", qty: 45, fill: "var(--primary-400)" },
  { category: "Iluminação", qty: 62, fill: "var(--primary-600)" },
  { category: "Áudio", qty: 34, fill: "var(--primary-800)" },
];

const pieData = [
  { name: "Produção", value: 550, fill: "var(--primary)" },
  { name: "Aluguer Técnico", value: 320, fill: "var(--primary-400)" },
  { name: "Estúdios & Pós", value: 240, fill: "var(--primary-700)" },
];

const radarData = [
  { subject: "Pontualidade Call Sheet", A: 135, fullMark: 150 },
  { subject: "Aprovações Vídeo", A: 142, fullMark: 150 },
  { subject: "Disponibilidade Stock", A: 128, fullMark: 150 },
  { subject: "Ocupação Estúdios", A: 118, fullMark: 150 },
  { subject: "Eficiência de Custos", A: 130, fullMark: 150 },
];

// --- Styles ---

const glassClasses =
  "backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden";

// --- Components ---

export function GlassWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(glassClasses, className)}>{children}</div>;
}

const billingConfig = {
  revenue: {
    label: "Facturação",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function HeroBillingChart() {
  return (
    <GlassWrapper className="p-4 w-72 h-48 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Volume de Produção
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">11.400h</h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-2 h-2" /> +18.4%
            </span>
          </div>
        </div>
        <div className="p-2 bg-primary/20 rounded-lg">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="h-24 w-full">
        <ChartContainer config={billingConfig}>
          <AreaChart data={billingData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.4}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </GlassWrapper>
  );
}

const stockConfig = {
  qty: {
    label: "Quantidade",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function HeroStockChart() {
  return (
    <GlassWrapper className="p-4 w-64 h-56 animate-in fade-in slide-in-from-left-4 duration-1000">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-primary" />
        <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
          Equipamentos Ativos
        </p>
      </div>
      <div className="h-32 w-full">
        <ChartContainer config={stockConfig}>
          <BarChart data={stockData}>
            <Bar
              dataKey="qty"
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>Inventário operacional</span>
        <TrendingUp className="w-3 h-3 text-emerald-400" />
      </div>
    </GlassWrapper>
  );
}

export function HeroPieChart() {
  return (
    <GlassWrapper className="p-4 w-56 h-56 animate-in fade-in slide-in-from-right-4 duration-1000">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 text-center">
        Distribuição de Receita
      </p>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassWrapper>
  );
}

export function HeroRadarChart() {
  return (
    <GlassWrapper className="p-4 w-64 h-64 animate-in fade-in zoom-in-90 duration-1000">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 text-center">
        Performance Global
      </p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            />
            <Radar
              name="Nora Audiovisual"
              dataKey="A"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassWrapper>
  );
}

export function HeroStatsWidget({
  icon: Icon,
  label,
  value,
  trend,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  trend: string;
  delay: string;
}) {
  return (
    <GlassWrapper
      className={cn(
        "p-4 w-44 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-700",
        delay,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="p-1.5 bg-white/10 rounded-md">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-[10px] text-green-400 font-medium">{trend}</span>
      </div>
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-tight">
          {label}
        </p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </GlassWrapper>
  );
}
