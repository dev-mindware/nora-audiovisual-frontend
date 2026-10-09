'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsService, InsightsOverview } from '@/services/insights-service';
import {
  Sparkles,
  Download,
  Calendar,
  Layers,
  Clapperboard,
  Camera,
  FileSpreadsheet,
  FileText,
  FileCode,
  Building2,
  Printer,
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
import { toast } from 'sonner';

import { InsightsKpis } from './insights-kpis';
import { InsightsRevenueChart } from './insights-revenue-chart';
import { InsightsDistributionCharts } from './insights-distribution-charts';
import { InsightsProjectMarginsTable } from './insights-project-margins-table';
import { InsightsAiFindings } from './insights-ai-findings';
import { InsightsExportModal } from './insights-export-modal';

export function InsightsPageContent() {
  const [period, setPeriod] = useState<string>('last_30_days');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data: overview, isLoading } = useQuery<InsightsOverview>({
    queryKey: ['insights-overview', period],
    queryFn: () => insightsService.getOverview(period),
  });

  const handleQuickExcelExport = () => {
    if (!overview) return;
    try {
      setIsExporting(true);
      const filename = `nora-insights-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      insightsService.exportToExcel(overview, filename);
      toast.success('Folha de cálculo Excel (.xlsx) exportada com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao gerar ficheiro Excel: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLegacy = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      await insightsService.exportReport(format);
      toast.success(`Relatório gerado em formato ${format.toUpperCase()} com sucesso!`);
    } catch {
      const blob = new Blob([JSON.stringify(overview, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nora-insights-report-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      toast.success(`Relatório descarregado em formato ${format.toUpperCase()}`);
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
    <div className="space-y-6 w-full">
      {/* Barra de Filtros e Acções de Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-primary/20 bg-primary/10 text-primary font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Nora Insights Executivo
          </span>
          <span className="hidden sm:inline">• Rentabilidade orçada vs realizada, ROI de equipamentos e estúdios</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          {/* Selector de Período */}
          <Select value={period} onValueChange={(val) => setPeriod(val)}>
            <SelectTrigger className="h-9 px-3 rounded-xs border border-border bg-background text-xs text-foreground min-w-[160px]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Selecione o período" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days" className="text-xs">Últimos 7 dias</SelectItem>
              <SelectItem value="last_30_days" className="text-xs">Últimos 30 dias</SelectItem>
              <SelectItem value="this_quarter" className="text-xs">Este Trimestre (Q4)</SelectItem>
              <SelectItem value="this_year" className="text-xs">Ano Fiscal 2026</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão de Exportação Principal (Abre Modal ou faz download direto) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickExcelExport}
            disabled={isExporting}
            className="text-xs gap-1.5 border-border shrink-0 rounded-xs h-9 font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Excel (.xlsx)
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="text-xs gap-1.5 bg-primary text-primary-foreground shrink-0 rounded-xs h-9 font-semibold"
          >
            <Printer className="h-3.5 w-3.5" />
            Relatório PDF
          </Button>
        </div>
      </div>

      {/* 4 KPIs Principais Padronizados */}
      <InsightsKpis overview={overview} />

      {/* Abas Executivas de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border border-border rounded-xs w-full sm:w-auto flex flex-wrap h-auto">
          <TabsTrigger value="overview" className="text-xs gap-1.5 rounded-xs">
            <Layers className="h-3.5 w-3.5" /> Visão Executiva
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs gap-1.5 rounded-xs">
            <Clapperboard className="h-3.5 w-3.5" /> Produções &amp; Margens
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs gap-1.5 rounded-xs">
            <Building2 className="h-3.5 w-3.5" /> Estúdios &amp; Câmaras
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs gap-1.5 rounded-xs">
            <Download className="h-3.5 w-3.5" /> Central de Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visão Executiva */}
        <TabsContent value="overview" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 gap-4">
            <InsightsRevenueChart data={overview.evolutionData} />
            <InsightsAiFindings findings={overview.noraFindings} />
          </div>
        </TabsContent>

        {/* Tab 2: Produções & Margens */}
        <TabsContent value="projects" className="space-y-4 mt-0">
          <InsightsProjectMarginsTable data={overview.projectMargins} />
        </TabsContent>

        {/* Tab 3: Estúdios & Câmaras */}
        <TabsContent value="resources" className="space-y-4 mt-0">
          <InsightsDistributionCharts
            revenueByGenre={overview.revenueByGenre}
            studioOccupancy={overview.studioOccupancy}
            equipmentRoi={overview.equipmentRoi}
          />
        </TabsContent>

        {/* Tab 4: Central de Relatórios */}
        <TabsContent value="export" className="space-y-4 mt-0">
          <div className="p-6 rounded-xs border border-border bg-card space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Central de Exportação &amp; Relatórios de Auditoria
              </h3>
              <p className="text-xs text-muted-foreground">
                Exporte o desempenho operacional completo da produtora nos formatos adequados para directoria executiva, parceiros ou contabilidade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card Excel */}
              <div className="p-4 rounded-xs border border-border bg-background/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <FileSpreadsheet className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase">Excel (.xlsx)</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Folha de Cálculo Multi-Aba</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Inclui 4 abas estruturadas com formatação em Kwanzas (Kz), desvio de projetos, ativos e estúdios.
                  </p>
                </div>
                <Button
                  onClick={handleQuickExcelExport}
                  disabled={isExporting}
                  size="sm"
                  className="w-full text-xs font-medium gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descarregar Excel
                </Button>
              </div>

              {/* Card PDF */}
              <div className="p-4 rounded-xs border border-border bg-background/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase">PDF Executivo</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Relatório Timbrado da Produtora</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Layout corporativo com logotipo, sumário executivo de KPIs, balanço orçamentário e assinatura.
                  </p>
                </div>
                <Button
                  onClick={() => setIsExportModalOpen(true)}
                  size="sm"
                  className="w-full text-xs font-medium gap-1.5 bg-primary text-primary-foreground rounded-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Visualizar &amp; Imprimir PDF
                </Button>
              </div>

              {/* Card CSV */}
              <div className="p-4 rounded-xs border border-border bg-background/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <FileSpreadsheet className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase">CSV Tabular</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Dados Tabulares Planos</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Ideal para importação rápida em ferramentas de BI como PowerBI, Tableau ou Google Sheets.
                  </p>
                </div>
                <Button
                  onClick={() => handleExportLegacy('csv')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium gap-1.5 border-border rounded-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descarregar CSV
                </Button>
              </div>

              {/* Card JSON */}
              <div className="p-4 rounded-xs border border-border bg-background/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <FileCode className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase">JSON Estruturado</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Snapshot para Automação</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Payload completo normalizado para consumo por webhooks, scripts Python ou integrações ERP.
                  </p>
                </div>
                <Button
                  onClick={() => handleExportLegacy('json')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-medium gap-1.5 border-border rounded-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descarregar JSON
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Pré-visualização e Impressão do Relatório Executivo */}
      <InsightsExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        overview={overview}
        period={period}
      />
    </div>
  );
}
