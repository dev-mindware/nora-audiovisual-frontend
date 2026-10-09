'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Calendar,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { InsightsOverview, insightsService } from '@/services/insights-service';
import { toast } from 'sonner';

interface InsightsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview: InsightsOverview;
  period: string;
}

export function InsightsExportModal({
  isOpen,
  onClose,
  overview,
  period,
}: InsightsExportModalProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const periodLabels: Record<string, string> = {
    last_7_days: 'Últimos 7 dias',
    last_30_days: 'Últimos 30 dias',
    this_quarter: 'Este Trimestre (Q4 2026)',
    this_year: 'Ano Fiscal 2026',
  };

  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const filename = `nora-insights-relatorio-${new Date().toISOString().slice(0, 10)}.xlsx`;
      insightsService.exportToExcel(overview, filename);
      toast.success('Folha de cálculo Excel (.xlsx) exportada com sucesso com 4 abas estruturadas!');
    } catch (err: any) {
      toast.error('Erro ao gerar ficheiro Excel: ' + (err?.message || 'Erro desconhecido'));
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto bg-card border-border p-0 rounded-xs shadow-2xl text-foreground">
        {/* Header de Ações do Modal (oculto na impressão) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border bg-muted/20 gap-3 print:hidden">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                Central de Relatórios &amp; Exportação Executiva
              </DialogTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                Relatório Premium
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Descarregue a planilha analítica em Excel ou imprima o relatório timbrado em PDF.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              size="sm"
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs h-9 font-medium"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {isExportingExcel ? 'Gerando...' : 'Descarregar Excel (.xlsx)'}
            </Button>

            <Button
              onClick={handlePrintPdf}
              size="sm"
              className="text-xs gap-1.5 bg-primary text-primary-foreground rounded-xs h-9 font-medium"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        {/* Folha do Relatório Timbrado Executivo (visível na tela e perfeitamente formatada na impressão) */}
        <div className="p-6 sm:p-8 space-y-6 bg-card text-foreground print:p-0 print:space-y-4">
          {/* Cabeçalho Timbrado Nora Studio */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
                <Sparkles className="h-5 w-5" />
                <span>NORA STUDIO • AUDIOVISUAL MANAGEMENT</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Relatório Consolidado de Desempenho Operacional, Margens &amp; Ocupação Técnica
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <div className="font-semibold text-foreground">
                Período: {periodLabels[period] || 'Período Selecionado'}
              </div>
              <div className="text-muted-foreground">
                Emitido em: {new Date().toLocaleDateString('pt-AO')} às {new Date().toLocaleTimeString('pt-AO')}
              </div>
              <div className="text-primary font-mono text-[11px]">ID de Auditoria: #INS-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</div>
            </div>
          </div>

          {/* Sumário de KPIs Executivos */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Indicadores Chave de Desempenho (KPIs)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xs border border-border bg-background/50 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Faturação Acumulada</span>
                <div className="text-base font-bold font-mono text-foreground">{formatKz(overview.totalRevenueKz)}</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">+{overview.revenueVariationPercent}% vs anterior</span>
              </div>
              <div className="p-3.5 rounded-xs border border-border bg-background/50 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Margem Líquida Média</span>
                <div className="text-base font-bold font-mono text-primary">{overview.averageProjectMarginPercent.toFixed(1)}%</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">+{overview.marginVariationPercent}% de rentabilidade</span>
              </div>
              <div className="p-3.5 rounded-xs border border-border bg-background/50 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ocupação de Estúdios</span>
                <div className="text-base font-bold font-mono text-foreground">{overview.studioOccupancyRatePercent}%</div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium font-mono">+{overview.studioOccupancyVariationPercent}% taxa de reserva</span>
              </div>
              <div className="p-3.5 rounded-xs border border-border bg-background/50 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Equipamentos em Campo</span>
                <div className="text-base font-bold font-mono text-foreground">{overview.allocatedEquipmentHours} hrs</div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium font-mono">+{overview.allocatedEquipmentHoursVariationPercent}% diárias faturadas</span>
              </div>
            </div>
          </div>

          {/* Tabela de Desvios de Produção */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Balanço de Produções (Orçado vs. Realizado)
            </h3>
            <div className="border border-border rounded-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Produção &amp; Cliente</th>
                    <th className="py-2.5 px-3">Orçado</th>
                    <th className="py-2.5 px-3">Realizado</th>
                    <th className="py-2.5 px-3 text-center">Margem</th>
                    <th className="py-2.5 px-3 text-right">Desvio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {overview.projectMargins.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground">{p.title}</div>
                        <div className="text-[10px] text-muted-foreground">{p.client} • {p.category}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{formatKz(p.budgetedKz)}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{formatKz(p.actualKz)}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-center text-primary">{p.marginPercent.toFixed(1)}%</td>
                      <td className={`py-2.5 px-3 font-mono font-semibold text-right ${p.variancePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {p.variancePercent >= 0 ? '+' : ''}{p.variancePercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo de Ativos & Ocupação de Estúdios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Rendimento por Estúdio
              </h3>
              <div className="border border-border rounded-xs divide-y divide-border text-xs">
                {overview.studioOccupancy.map((s) => (
                  <div key={s.name} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">{s.hoursBooked} de {s.capacityHours} horas reservadas</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-foreground">{formatKz(s.revenueKz)}</div>
                      <span className="text-[10px] font-mono text-emerald-600 font-semibold">{s.occupancyRate.toFixed(1)}% ocupação</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                4. ROI dos Principais Kits de Câmaras
              </h3>
              <div className="border border-border rounded-xs divide-y divide-border text-xs">
                {overview.equipmentRoi.slice(0, 3).map((g) => (
                  <div key={g.model} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{g.model}</div>
                      <div className="text-[10px] text-muted-foreground">{g.daysRented} diárias faturadas</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-foreground">{formatKz(g.revenueGeneratedKz)}</div>
                      <span className="text-[10px] font-mono text-primary font-semibold">{g.utilizationRate.toFixed(1)}% utilização</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rodapé e Assinatura */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-3">
            <div>
              <span>Documento confidencial gerado pelo Nora Audiovisual Management Platform.</span>
            </div>
            <div className="font-mono text-xs text-foreground font-semibold">
              Validação Executiva Nora Insights ✓
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
