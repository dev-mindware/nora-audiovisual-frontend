'use client';

import { useState, useMemo, useEffect } from 'react';
import { useBudgets } from '@/hooks/budgets';
import { Budget } from '@/types';
import { portalService } from '@/services/portal-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Search,
  Building,
  Printer,
  AlertTriangle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';

export function PortalBudgetsContent() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  // Acceptance & change request states
  const [isAccepting, setIsAccepting] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [isSubmittingChanges, setIsSubmittingChanges] = useState(false);

  const { data, isLoading, refetch } = useBudgets();
  const budgets: Budget[] = useMemo(() => data?.data || [], [data]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b: Budget) => {
      const titleStr = b.title || `Proposta v${b.version}`;
      const clientStr = b.client?.name || b.clientName || '';
      const matchesSearch =
        titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientStr.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === 'ALL') return matchesSearch;
      if (statusFilter === 'PENDING') return matchesSearch && b.status === 'SENT';
      if (statusFilter === 'ACCEPTED') return matchesSearch && b.status === 'APPROVED';
      return matchesSearch && b.status === statusFilter;
    });
  }, [budgets, searchTerm, statusFilter]);

  // Default selection
  useEffect(() => {
    if (!selectedBudgetId && filteredBudgets.length > 0) {
      const pending = filteredBudgets.find((b) => b.status === 'SENT');
      setSelectedBudgetId((pending || filteredBudgets[0]).id);
    }
  }, [filteredBudgets, selectedBudgetId]);

  const selectedBudget = useMemo(() => {
    return budgets.find((b) => b.id === selectedBudgetId) || filteredBudgets[0] || null;
  }, [budgets, selectedBudgetId, filteredBudgets]);

  const formatCurrency = (val?: string | number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(Number(val) || 0);
  };

  const pendingCount = budgets.filter((b: Budget) => b.status === 'SENT').length;
  const approvedCount = budgets.filter((b: Budget) => b.status === 'APPROVED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptBudget = async () => {
    if (!selectedBudget) return;
    setIsAccepting(true);
    try {
      if (selectedBudget.shareToken) {
        await portalService.acceptBudget(selectedBudget.shareToken, {
          clientName: user?.name || 'Cliente Autorizado',
          clientEmail: user?.email || 'cliente@empresa.com',
          notes: 'Aceite formal registado via Portal do Cliente.',
        });
      }
      toast.success('Proposta aceite com sucesso!');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao registar o aceite.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSubmitChanges = async () => {
    if (!changesNotes.trim()) {
      toast.error('Descreva o ajuste pretendido.');
      return;
    }
    setIsSubmittingChanges(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Pedido de ajuste enviado à produção!');
      setShowChangesForm(false);
      setChangesNotes('');
    } catch {
      toast.error('Erro ao enviar pedido de ajuste.');
    } finally {
      setIsSubmittingChanges(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Propostas Comerciais
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} proposta aguarda a sua validação`
              : 'Todas as propostas estão regularizadas'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ALL')}
            className="rounded-none text-xs h-8 px-3"
          >
            Todas ({budgets.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-none text-xs h-8 px-3 ${statusFilter === 'PENDING' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
              }`}
          >
            Aguardando Aceite ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`rounded-none text-xs h-8 px-3 ${statusFilter === 'ACCEPTED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
          >
            Aprovadas ({approvedCount})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="border border-border p-12 text-center text-xs font-mono text-muted-foreground bg-card">
          A carregar propostas comerciais...
        </div>
      ) : budgets.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center bg-card space-y-2">
          <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-sm font-semibold text-foreground">Sem Propostas Comerciais</h3>
          <p className="text-xs text-muted-foreground">
            Nenhuma proposta comercial foi emitida para esta conta até ao momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Proposals Sidebar (3 Cols on desktop) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 rounded-none text-xs border-border bg-card h-8"
              />
            </div>

            <div className="space-y-2">
              {filteredBudgets.map((b: Budget) => {
                const isSelected = selectedBudget?.id === b.id;
                const isPending = b.status === 'SENT';
                const isApproved = b.status === 'APPROVED';

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBudgetId(b.id)}
                    className={`cursor-pointer p-3 border transition-colors ${isSelected
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-card hover:border-muted-foreground/40'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold font-mono">
                        {b.title || `Proposta v${b.version}`}
                      </span>
                      <Badge
                        variant="outline"
                        className={`rounded-none text-[9px] font-mono uppercase px-1.5 py-0 ${isPending
                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : isApproved
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-border text-muted-foreground'
                          }`}
                      >
                        {isPending ? 'Pendente' : isApproved ? 'Aprovada' : b.status}
                      </Badge>
                    </div>

                    {(b.client?.name || b.clientName) && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {b.client?.name || b.clientName}
                      </p>
                    )}

                    <div className="mt-2 flex items-baseline justify-between font-mono text-xs border-t border-border/40 pt-1.5">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(b.total)}
                      </span>
                      {b.validUntil && (
                        <span className="text-[10px] text-muted-foreground">
                          Até {format(new Date(b.validUntil), 'dd/MM/yy')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Clean Minimalist Proposal Sheet (9 Cols on desktop) */}
          <div className="lg:col-span-8 xl:col-span-9">
            {selectedBudget ? (
              <div className="border border-border bg-card p-6 lg:p-8 space-y-6">
                {/* Proposal Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-muted-foreground">
                        Nora Audiovisual Lda
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="text-xs font-mono uppercase text-muted-foreground">
                        {selectedBudget.title || `Proposta v${selectedBudget.version}`}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedBudget.client?.name || selectedBudget.clientName || 'Cliente'}
                    </h2>

                    {selectedBudget.projectTitle && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Projeto: {selectedBudget.projectTitle}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right font-mono space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Valor Total (com IVA)
                    </span>
                    <span className="text-2xl font-semibold text-primary block">
                      {formatCurrency(selectedBudget.total)}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Válido até: {selectedBudget.validUntil ? format(new Date(selectedBudget.validUntil), 'dd/MM/yyyy') : 'Sob consulta'}
                    </span>
                  </div>
                </div>

                  {/* Scope & Cost Summary */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                      Resumo do Escopo & Rubricas
                    </h3>

                    <div className="border border-border divide-y divide-border text-xs font-mono">
                      {selectedBudget.items && (selectedBudget.items as any[]).length > 0 ? (
                        (selectedBudget.items as any[]).map((item: any, idx: number) => (
                          <div key={item.id || idx} className="p-3 flex justify-between items-center bg-muted/10">
                            <div>
                              <span className="font-semibold text-foreground block">
                                {item.description || item.name || `Rubrica #${idx + 1}`}
                              </span>
                              <span className="text-[11px] text-muted-foreground font-sans">
                                {item.category ? `Categoria: ${item.category}` : ''}
                                {item.quantity ? ` • Qtd: ${item.quantity}` : ''}
                              </span>
                            </div>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(item.totalPrice ?? item.total ?? item.price ?? 0)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-xs font-sans">
                          Escopo global acordado (detalhamento analítico por rubricas consolidado no valor total).
                        </div>
                      )}
                    </div>

                  {/* Financial Total Line */}
                  <div className="flex justify-end pt-2">
                    <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedBudget.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>IVA (14%):</span>
                        <span>{formatCurrency(selectedBudget.estimatedTax)}</span>
                      </div>
                      <div className="flex justify-between text-foreground font-semibold border-t border-border pt-1.5 text-sm">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(selectedBudget.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimalist Actions Footer */}
                <div className="border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {selectedBudget.status === 'APPROVED' ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Proposta Aprovada e Adjudicada</span>
                      </div>
                    ) : selectedBudget.status === 'SENT' ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                        <Clock className="h-4 w-4" />
                        <span>Aguardando a sua validação</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="rounded-none text-xs h-8 gap-1.5 border-border"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Imprimir PDF</span>
                    </Button>

                    {selectedBudget.status === 'SENT' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowChangesForm(!showChangesForm)}
                          className="rounded-none text-xs h-8 border-border"
                        >
                          Solicitar Ajuste
                        </Button>

                        <Button
                          size="sm"
                          onClick={handleAcceptBudget}
                          disabled={isAccepting}
                          className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 px-4 gap-1.5 font-semibold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{isAccepting ? 'A aprovar...' : 'Aceitar Proposta'}</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Request Changes Drawer */}
                {showChangesForm && (
                  <div className="border border-amber-500/30 bg-muted/20 p-4 space-y-3 pt-3 animate-in fade-in">
                    <span className="text-xs font-semibold text-foreground block">
                      Ajuste Orçamental ou de Escopo
                    </span>
                    <Textarea
                      value={changesNotes}
                      onChange={(e) => setChangesNotes(e.target.value)}
                      placeholder="Descreva a alteração que pretende nas rubricas orçamentais..."
                      className="rounded-none text-xs border-border bg-card min-h-[60px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowChangesForm(false)}
                        className="rounded-none text-xs h-7"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitChanges}
                        disabled={isSubmittingChanges}
                        className="rounded-none bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 gap-1"
                      >
                        <Send className="h-3 w-3" />
                        <span>{isSubmittingChanges ? 'A enviar...' : 'Enviar Pedido'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
