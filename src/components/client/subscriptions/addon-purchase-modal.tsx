'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddOnItem, noraSubscriptionsService, SubscriptionData } from '@/services/subscriptions-service';
import {
  Sparkles,
  HardDrive,
  Users,
  Camera,
  Zap,
  BarChart3,
  Calendar,
  AlertCircle,
  Plus,
  Minus,
  Loader2,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface AddOnPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  addOn: AddOnItem | null;
  subscription?: SubscriptionData;
  onSuccess: () => void;
  onOpenPlanCheckout: () => void;
}

export function AddOnPurchaseModal({
  isOpen,
  onClose,
  addOn,
  subscription,
  onSuccess,
  onOpenPlanCheckout,
}: AddOnPurchaseModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quote, setQuote] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'INSTANT' | 'TRANSFER'>('INSTANT');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  useEffect(() => {
    if (!isOpen || !addOn) {
      setQuantity(1);
      setQuote(null);
      return;
    }

    if (isActive) {
      let isMounted = true;
      setIsQuoting(true);

      noraSubscriptionsService
        .getProrationQuote(addOn.code, quantity)
        .then((res) => {
          if (isMounted) setQuote(res);
        })
        .catch(() => {
          if (isMounted) setQuote(null);
        })
        .finally(() => {
          if (isMounted) setIsQuoting(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, addOn, quantity, isActive]);

  if (!addOn) return null;

  const formatKz = (val: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getAddonIcon = (type: string, code: string) => {
    if (code.includes('AI')) return <Sparkles className="h-5 w-5 text-primary" />;
    if (code.includes('STORAGE')) return <HardDrive className="h-5 w-5 text-blue-500" />;
    if (code.includes('USER')) return <Users className="h-5 w-5 text-emerald-500" />;
    if (code.includes('EQUIPMENT')) return <Camera className="h-5 w-5 text-purple-500" />;
    if (code.includes('AUTOMATE')) return <Zap className="h-5 w-5 text-amber-500" />;
    if (code.includes('INSIGHTS')) return <BarChart3 className="h-5 w-5 text-indigo-500" />;
    return <Sparkles className="h-5 w-5 text-primary" />;
  };

  const isQuantityAllowed =
    addOn.code.includes('STORAGE') ||
    addOn.code.includes('USER') ||
    addOn.code.includes('EQUIPMENT');

  const maxQty = addOn.code.includes('STORAGE') ? 20 : addOn.code.includes('USER') ? 10 : 5;

  const handleConfirmPurchase = async () => {
    try {
      setIsSubmitting(true);
      await noraSubscriptionsService.purchaseAddOn(addOn.code, quantity);
      toast.success(`Add-on ${addOn.name} contratado com sucesso!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao contratar add-on.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preços calculados (sem IVA)
  const recurringNet = addOn.priceMonthly * quantity;
  const proratedNet = quote?.proratedNetAmount ?? quote?.netAmount ?? quote?.proratedGrossAmount ?? recurringNet;
  const remainingDays = quote?.remainingDays ?? 30;
  const totalDays = quote?.totalPeriodDays ?? 30;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-2xl bg-card border-border text-foreground shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                {getAddonIcon(addOn.type, addOn.code)}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  {addOn.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Expansão de capacidade para a sua produtora
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-semibold">
              {formatKz(addOn.priceMonthly)}/mês
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 bg-card">
          {/* Add-on description & details */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
            {addOn.description}
          </div>

          {!isActive ? (
            /* Warning if not on active subscription */
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Para contratar add-ons avulsos, a sua organização necessita de uma subscrição ativa de um dos Planos Nora. Pode também selecionar este add-on durante o checkout do plano.
                </span>
              </div>
              <Button
                onClick={() => {
                  onClose();
                  onOpenPlanCheckout();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
              >
                Subscrever um Plano Agora
              </Button>
            </div>
          ) : (
            <>
              {/* Quantity Selector */}
              {isQuantityAllowed && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Quantidade Desejada</div>
                    <div className="text-[11px] text-muted-foreground">
                      Unidades adicionais a associar à subscrição
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-lg border-border"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isSubmitting}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="font-mono font-semibold text-sm w-8 text-center text-foreground">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-lg border-border"
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty || isSubmitting}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Proration Quote Card */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Cálculo Pró-rata do Período
                  </span>
                  {isQuoting ? (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> A calcular...
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {remainingDays} de {totalDays} dias restantes
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Valor Prorrateado:</span>
                    <span className="font-mono text-foreground font-medium">{formatKz(proratedNet)}</span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground text-xs">Total Imediato a Liquidar:</span>
                      <div className="text-[10px] text-muted-foreground">
                        Cobrado apenas para os dias restantes do ciclo
                      </div>
                    </div>
                    <span className="font-extrabold text-primary text-base font-mono">
                      {formatKz(proratedNet)}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Renovação Mensal Futura:</span>
                    <span className="font-mono font-medium text-foreground">{formatKz(recurringNet)}/mês</span>
                  </div>
                </div>
              </div>

              {/* Payment Method / Mode Toggle */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('INSTANT')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${paymentMode === 'INSTANT'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 bg-card'
                      }`}
                  >
                    Ativação Imediata na Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('TRANSFER')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${paymentMode === 'TRANSFER'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 bg-card'
                      }`}
                  >
                    Transferência Bancária / Multicaixa
                  </button>
                </div>

                {paymentMode === 'TRANSFER' && (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">IBAN BAI:</span>
                      <div className="flex items-center gap-1 font-mono font-semibold text-foreground">
                        <span>AO06.0040.0000.8921.4510.1012.3</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('AO06004000008921451010123', 'iban')}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                        >
                          {copiedField === 'iban' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Referência Multicaixa Express:</span>
                      <span className="font-mono font-semibold text-primary">NORA-ADD-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-1/3 text-xs h-10 border-border text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting || isQuoting}
                  className="w-2/3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-10 font-semibold shadow-xs"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> A ativar...
                    </span>
                  ) : (
                    `Confirmar e Contratar (${formatKz(proratedNet)})`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
