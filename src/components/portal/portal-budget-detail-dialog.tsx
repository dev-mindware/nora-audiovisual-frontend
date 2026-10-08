'use client';

import { useState, useEffect } from 'react';
import { Budget, BudgetItem } from '@/types';
import { portalService, PortalBudget } from '@/services/portal-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ItemStatusBadge } from '@/components/common';
import { Input } from '@/components/ui/input';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  Sparkles,
  Layers,
  X,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';

interface PortalBudgetDetailDialogProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  CREW: 'Equipa Técnica & Elenco',
  EQUIPMENT: 'Câmaras, Lentes & Iluminação',
  STUDIO: 'Estúdio & Locações',
  POST_PRODUCTION: 'Montagem, Cor & VFX',
  LOGISTICS: 'Transporte & Alimentação',
  CONTINGENCY: 'Margem de Imprevistos',
};

export function PortalBudgetDetailDialog({
  budget,
  isOpen,
  onClose,
  onUpdated,
}: PortalBudgetDetailDialogProps) {
  const { user } = useAuthStore();

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [fullBudget, setFullBudget] = useState<PortalBudget | null>(null);

  // Acceptance form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setClientName(user.name);
      setClientEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (budget?.shareToken && isOpen) {
      setLoadingDetails(true);
      portalService
        .viewBudget(budget.shareToken)
        .then((data) => {
          setFullBudget(data);
        })
        .catch(() => {
          // fallback to budget props
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [budget?.shareToken, isOpen]);

  if (!budget) return null;

  const isPending = budget.status === 'SENT';
  const isApproved = budget.status === 'APPROVED';

  const formatCurrency = (val?: string | number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(Number(val) || 0);
  };

  const handleAcceptProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) {
      toast.error('Indique o seu nome e email corporativo para o aceite.');
      return;
    }

    if (!acceptTerms) {
      toast.error('Deve aceitar os termos da proposta para prosseguir.');
      return;
    }

    if (!budget.shareToken) {
      toast.error('Token da proposta não disponível.');
      return;
    }

    setIsAccepting(true);
    try {
      await portalService.acceptBudget(budget.shareToken, {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        notes: notes.trim() || undefined,
      });

      toast.success('Proposta comercial aceite com sucesso! O contrato e factura foram gerados.');
      onUpdated?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao aceitar proposta.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const items = fullBudget?.items || (budget.items as any[]) || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto bg-card border-border p-0 rounded-none shadow-2xl text-foreground">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border bg-muted/20 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-none border-primary/40 bg-primary/10 text-primary text-[10px] font-mono uppercase"
              >
                Proposta Orçamental Oficial
              </Badge>
              <ItemStatusBadge status={budget.status} />
              <span className="text-xs font-mono text-muted-foreground">
                v{budget.version}
              </span>
            </div>

            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground uppercase">
              {budget.title || `Orçamento de Produção v${budget.version}`}
            </DialogTitle>
            {budget.client?.name && (
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                <Building className="h-3 w-3 text-primary" />
                Destinatário: {budget.client.name}
              </DialogDescription>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="rounded-none gap-1.5 text-xs h-8 border-border hover:bg-muted"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        {/* Financial Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-muted/30 border-b border-border text-xs font-mono">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Subtotal</span>
            <span className="text-base font-semibold text-foreground">
              {formatCurrency(budget.subtotal)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Desconto Comercial</span>
            <span className="text-base font-semibold text-foreground">
              {formatCurrency(budget.discount || 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block">Impostos (IVA 14%)</span>
            <span className="text-base font-semibold text-foreground">
              {formatCurrency(budget.estimatedTax)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-primary uppercase block font-semibold">Total da Proposta</span>
            <span className="text-xl font-semibold text-primary">
              {formatCurrency(budget.total)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Itemized Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2 font-mono">
                <Layers className="h-4 w-4 text-primary" /> Discriminação de Serviços & Meios Técnicos
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">
                {items.length} linhas de custo
              </span>
            </div>

            <div className="border border-border divide-y divide-border text-xs">
              <div className="grid grid-cols-12 bg-muted/40 p-2.5 font-mono text-[10px] uppercase text-muted-foreground font-semibold">
                <div className="col-span-6">Serviço / Descrição Técnica</div>
                <div className="col-span-2 text-center">Categoria</div>
                <div className="col-span-1 text-center">Qtd</div>
                <div className="col-span-3 text-right">Valor Total</div>
              </div>

              {items.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs font-mono">
                  Nenhuma rubrica individual discriminada. O valor apresentado reflete o escopo global acordado.
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-3 items-center hover:bg-muted/10 transition-colors">
                    <div className="col-span-6 pr-2">
                      <p className="font-semibold text-foreground">{item.description}</p>
                      {item.unitPrice && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatCurrency(item.unitPrice)} por unidade/diária
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant="outline" className="rounded-none text-[9px] font-mono border-border">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-center font-mono font-semibold">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(item.total || (item.quantity * item.unitPrice))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Validity & Terms */}
          <div className="border border-border/80 bg-muted/20 p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] font-mono">
              Condições & Prazos de Pagamento
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Pagamento faseado: 50% na adjudicação (mobilização de equipa e reservas de estúdio/equipamento) e 50% na aprovação do master final. Proposta válida por 30 dias contados da data de emissão.
            </p>
            {budget.validUntil && (
              <p className="text-amber-600 dark:text-amber-400 font-mono text-[11px] flex items-center gap-1.5 pt-1">
                <Clock className="h-3.5 w-3.5" />
                Data limite para aceite sem alteração de cotação: {format(new Date(budget.validUntil), 'dd/MM/yyyy')}
              </p>
            )}
          </div>

          {/* Formal Acceptance Box */}
          {isApproved ? (
            <div className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-none space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                <CheckCircle2 className="h-5 w-5" />
                <span>Proposta Aceite Formalmente e Vinculada à Produção</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                O aceite formal foi auditado no sistema Nora Audiovisual. A produção executiva já iniciou o cronograma técnico.
              </p>
            </div>
          ) : isPending ? (
            <form onSubmit={handleAcceptProposal} className="border border-primary/40 bg-primary/5 p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Aceite Formal Digital
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  Ao confirmar, esta proposta comercial torna-se o plano orçamental oficial do projecto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nome do Responsável de Aprovação *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="rounded-none text-xs bg-background h-9"
                  required
                />
                <Input
                  label="Email Corporativo *"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="rounded-none text-xs bg-background h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Observações / PO Number (Opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Indique número de ordem de compra ou referências para facturação..."
                  className="w-full rounded-none border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="accept-terms-checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded-none border-border accent-primary h-4 w-4"
                />
                <label htmlFor="accept-terms-checkbox" className="text-[11px] text-muted-foreground cursor-pointer">
                  Confirmo a aceitação integral desta proposta comercial e dos serviços discriminados em nome da minha organização.
                </label>
              </div>

              <Button
                type="submit"
                disabled={isAccepting || !acceptTerms}
                className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 gap-2 font-semibold"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isAccepting ? 'A validar aceite...' : 'Assinar & Aceitar Proposta Comercial'}
              </Button>
            </form>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
