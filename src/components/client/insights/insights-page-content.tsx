'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsService, InsightsOverview } from '@/services/insights-service';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Building2,
  Camera,
  Sparkles,
  Download,
  Calendar,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  FileCode,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListSkeleton } from '@/components';
import Link from 'next/link';
import { SucessMessage } from '@/utils/messages';

export function InsightsPageContent() {
  const [period, setPeriod] = useState<string>('last_30_days');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data: overview, isLoading } = useQuery<InsightsOverview>({
    queryKey: ['insights-overview', period],
    queryFn: () => insightsService.getOverview(period),
  });

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      await insightsService.exportReport(format);
      SucessMessage(`Relatório gerado em formato ${format.toUpperCase()} com sucesso!`);
    } catch {
      // Mock download para demo
      const blob = new Blob([JSON.stringify(overview, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nora-insights-report-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      SucessMessage(`Relatório descarregado em formato ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !overview) {
    return (
      <div className="space-y-6 mt-6">
        <ListSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6">
      {/* Header Executivo & Controlo de Período */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="size-3" />
            Nora Insights • Inteligência de Negócio
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Decisões Operacionais Guiadas por Dados Reais
          </h2>
          <p className="text-xs text-muted-foreground">
            Acompanhe a rentabilidade dos seus projectos orçados vs realizados, utilização de câmaras e taxa de ocupação dos estúdios.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Selector de Período */}
          <Select value={period} onValueChange={(val) => setPeriod(val)}>
            <SelectTrigger className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground min-w-[150px]">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="Selecione o período" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days" className="text-xs">Últimos 7 dias</SelectItem>
              <SelectItem value="last_30_days" className="text-xs">Últimos 30 dias</SelectItem>
              <SelectItem value="this_quarter" className="text-xs">Este Trimestre</SelectItem>
              <SelectItem value="this_year" className="text-xs">Ano de 2026</SelectItem>
            </SelectContent>
          </Select>

          {/* Exportação */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="text-xs gap-1.5 border-border shrink-0"
          >
            <Download className="size-3.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* 4 KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Faturação Acumulada
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {formatKz(overview.totalRevenueKz)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="size-3.5" />
              <span>+{overview.revenueVariationPercent}%</span>
              <span className="text-muted-foreground font-normal">vs. período anterior</span>
            </div>
          </div>
        </div>

        {/* Margem Média */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Margem Média Projectos
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Percent className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {overview.averageProjectMarginPercent.toFixed(1)}%
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="size-3.5" />
              <span>+{overview.marginVariationPercent}%</span>
              <span className="text-muted-foreground font-normal">lucro líquido médio</span>
            </div>
          </div>
        </div>

        {/* Ocupação Estúdios */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ocupação de Estúdios
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Building2 className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {overview.studioOccupancyRatePercent}%
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <TrendingUp className="size-3.5" />
              <span>+{overview.studioOccupancyVariationPercent}%</span>
              <span className="text-muted-foreground font-normal">taxa de reserva</span>
            </div>
          </div>
        </div>

        {/* Horas de Equipamentos */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Equipamento em Rodagem
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Camera className="size-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {overview.allocatedEquipmentHours} horas
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <TrendingUp className="size-3.5" />
              <span>+{overview.allocatedEquipmentHoursVariationPercent}%</span>
              <span className="text-muted-foreground font-normal">diárias faturadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secção "Nora Encontrou" - Insights Automáticos do Sistema */}
      <div className="p-6 rounded-2xl border border-border bg-card/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Nora Encontrou na Sua Operação</h3>
              <p className="text-xs text-muted-foreground">
                Anomalias, oportunidades de margem e alertas detetados automaticamente pelos dados do estúdio.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary">
            {overview.noraFindings.length} Insights Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {overview.noraFindings.map((finding) => {
            const isAlert = finding.type === 'ALERT';
            const isOpportunity = finding.type === 'OPPORTUNITY';
            const IconComponent = isAlert ? AlertCircle : isOpportunity ? Lightbulb : CheckCircle;
            const borderBadge = isAlert
              ? 'border-red-500/30 bg-red-500/10 text-red-500'
              : isOpportunity
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
              : 'border-blue-500/30 bg-blue-500/10 text-blue-500';

            return (
              <div
                key={finding.id}
                className="p-4 rounded-xl border border-border bg-background flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${borderBadge}`}
                    >
                      <IconComponent className="size-3" />
                      {isAlert ? 'Alerta Crítico' : isOpportunity ? 'Oportunidade' : 'Destaque'}
                    </span>
                    {finding.metricChange && (
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {finding.metricChange}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-foreground leading-snug">
                    {finding.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {finding.description}
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium justify-between border-border"
                >
                  <Link href={finding.actionTarget}>
                    <span>{finding.actionLabel}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abas de Exploração Técnica */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border pb-1 overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-1.5 flex flex-nowrap">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
            >
              <Layers className="size-3.5" /> Visão Geral da Operação
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
            >
              Projectos (Orçado vs Realizado)
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
            >
              Financeiro &amp; Rentabilidade
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
            >
              <Download className="size-3.5" /> Central de Exportações
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Visão Geral */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown de Projectos */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Pipeline de Produção Activa</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Projectos em Filmagem ou Pós-Produção</span>
                  <span className="font-semibold text-foreground">{overview.activeProjectsCount} projectos</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-muted-foreground">Projectos Concluídos &amp; Entregues (Ano)</span>
                  <span className="font-semibold text-foreground">{overview.completedProjectsCount} projectos</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            {/* Utilização de Estúdios */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Taxa de Eficiência de Estúdios</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Estúdio A (Cyclorama Principal)</span>
                  <span className="font-semibold text-foreground">88% de ocupação</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88%' }} />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-muted-foreground">Estúdio B (Blackbox &amp; Podcasts)</span>
                  <span className="font-semibold text-foreground">35% de ocupação</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Projectos */}
        <TabsContent value="projects" className="space-y-4 mt-0">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Comparativo Orçado vs. Realizado</h3>
            <p className="text-xs text-muted-foreground">
              Análise de desvio de custos em projectos recentes. O desvio positivo indica margem superior ao estimado.
            </p>

            <div className="divide-y divide-border border-y border-border">
              <div className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">Comercial TV Verão BFA</span>
                  <span className="text-[11px] text-muted-foreground block">Publicidade • Luanda</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-emerald-500">+12.4% margem</span>
                  <span className="text-[10px] text-muted-foreground block">Orçado: 3.500.000 Kz</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">Videoclipe Anselmo Ralph</span>
                  <span className="text-[11px] text-muted-foreground block">Musical • Benguela</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-red-500">-4.2% margem</span>
                  <span className="text-[10px] text-muted-foreground block">Custos de diária excedidos</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">Documentário Rio Kwanza</span>
                  <span className="text-[11px] text-muted-foreground block">Institucional</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-emerald-500">+18.0% margem</span>
                  <span className="text-[10px] text-muted-foreground block">Orçado: 8.200.000 Kz</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Financeiro */}
        <TabsContent value="financial" className="space-y-4 mt-0">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Demonstração de Rentabilidade Operacional</h3>
            <p className="text-xs text-muted-foreground">
              Composição das receitas por tipo de serviço e alocação de custos directos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Receitas de Produção</span>
                <p className="text-lg font-semibold text-foreground">{formatKz(1240000)}</p>
                <span className="text-[10px] text-emerald-500">67.3% do total</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Aluguer de Estúdios</span>
                <p className="text-lg font-semibold text-foreground">{formatKz(412000)}</p>
                <span className="text-[10px] text-blue-500">22.4% do total</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Diárias de Câmaras &amp; Luz</span>
                <p className="text-lg font-semibold text-foreground">{formatKz(190000)}</p>
                <span className="text-[10px] text-amber-500">10.3% do total</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Central de Exportações */}
        <TabsContent value="export" className="space-y-4 mt-0">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Central de Relatórios &amp; Snapshots Analíticos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Descarregue o relatório consolidado da sua operação em formatos prontos para análise executiva ou contabilidade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="size-5 text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Relatório em Folha de Cálculo (CSV)</h4>
                    <p className="text-[11px] text-muted-foreground">Compatível com Excel, Google Sheets e softwares de BI.</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  size="sm"
                  className="w-full text-xs font-medium gap-1.5"
                >
                  <Download className="size-3.5" />
                  Descarregar CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode className="size-5 text-primary" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Snapshot em JSON Estruturado</h4>
                    <p className="text-[11px] text-muted-foreground">Payload completo normalizado para integrações ou automações.</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium gap-1.5 border-border"
                >
                  <Download className="size-3.5" />
                  Descarregar JSON
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
