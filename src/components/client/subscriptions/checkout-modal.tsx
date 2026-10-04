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
import { Input } from '@/components/ui/input';
import { PlanItem, AddOnItem } from '@/services/subscriptions-service';
import {
  Building2,
  Copy,
  Check,
  UploadCloud,
  FileText,
  AlertCircle,
  CreditCard,
  QrCode,
  X,
  Sparkles,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanItem | null;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  onCycleChange: (cycle: 'MONTHLY' | 'ANNUAL') => void;
  onSuccess: (refNumber: string) => void;
  onCheckout: (data: {
    planCode: string;
    billingInterval: 'MONTHLY' | 'SEMIANNUAL' | 'ANNUAL';
    paymentMethod: 'BANK_TRANSFER' | 'MULTICAIXA_EXPRESS' | 'UNITEL_MONEY';
    proofFileUrl: string;
    referenceNumber?: string;
    notes?: string;
    addOns?: Array<{ code: string; quantity: number }>;
  }) => Promise<any>;
  isSubmitting: boolean;
  availableAddOns?: AddOnItem[];
}

export function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onCycleChange,
  onSuccess,
  onCheckout,
  isSubmitting,
  availableAddOns = [],
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'MULTICAIXA_EXPRESS'>('BANK_TRANSFER');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedAddOnCodes, setSelectedAddOnCodes] = useState<string[]>([]);
  const [orderRef] = useState(() => `NORA-SUB-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!plan) return null;

  const basePrice = billingCycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
  const isAnnual = billingCycle === 'ANNUAL';
  const discountSavings = isAnnual ? (plan.priceMonthly * 12) - plan.priceAnnual : 0;

  // Cálculo de Add-ons selecionados
  const addOnsTotal = selectedAddOnCodes.reduce((sum, code) => {
    const item = availableAddOns.find((a) => a.code === code);
    if (!item) return sum;
    const multiplier = isAnnual ? 12 : 1;
    return sum + item.priceMonthly * multiplier;
  }, 0);

  const totalAmount = basePrice + addOnsTotal;

  const formatKz = (val: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleAddOn = (code: string) => {
    setSelectedAddOnCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('O ficheiro não pode exceder 10MB.');
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProofDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    setProofDataUrl(null);
  };

  const handleSubmit = async () => {
    if (!proofDataUrl) {
      toast.error('Por favor, anexe o comprovativo de pagamento bancário.');
      return;
    }

    try {
      await onCheckout({
        planCode: plan.code,
        billingInterval: billingCycle,
        paymentMethod,
        proofFileUrl: proofDataUrl,
        referenceNumber: orderRef,
        notes: notes.trim() || undefined,
        addOns: selectedAddOnCodes.map((code) => ({ code, quantity: 1 })),
      });

      onSuccess(orderRef);
      onClose();
      handleRemoveFile();
      setSelectedAddOnCodes([]);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl bg-card border-border text-foreground shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Finalizar Subscrição Nora Audiovisual
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Efetue o pagamento por transferência bancária ou Multicaixa Express e anexe o comprovativo.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-semibold">
              {plan.name}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border max-h-[80vh] overflow-y-auto">
          {/* Left Column: Payment Details, Add-ons & Proof Upload */}
          <div className="md:col-span-7 p-6 space-y-6 bg-card">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${paymentMethod === 'BANK_TRANSFER'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:border-primary/40 bg-card'
                    }`}
                >
                  <Building2 className={`h-4 w-4 ${paymentMethod === 'BANK_TRANSFER' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="text-xs font-semibold text-foreground">Transferência Bancária</div>
                    <div className="text-[10px] text-muted-foreground">BAI / BFA (AO06)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MULTICAIXA_EXPRESS')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${paymentMethod === 'MULTICAIXA_EXPRESS'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:border-primary/40 bg-card'
                    }`}
                >
                  <CreditCard className={`h-4 w-4 ${paymentMethod === 'MULTICAIXA_EXPRESS' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="text-xs font-semibold text-foreground">Multicaixa Express</div>
                    <div className="text-[10px] text-muted-foreground">Referência de Pagamento</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bank Coordinates Card */}
            {paymentMethod === 'BANK_TRANSFER' ? (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Coordenadas Bancárias
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-card text-muted-foreground border-border">
                    Conta Oficial Nora
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground">Banco:</span>
                    <span className="font-semibold text-foreground">Banco Angolano de Investimentos (BAI)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground">Beneficiário:</span>
                    <span className="font-semibold text-foreground">Mindware Tecnologias Lda</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                    <div>
                      <div className="text-muted-foreground text-[11px]">IBAN:</div>
                      <div className="font-mono font-semibold text-foreground text-xs">AO06.0040.0000.8921.4510.1012.3</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('AO06004000008921451010123', 'iban')}
                      className="h-7 px-2 text-muted-foreground hover:text-primary"
                    >
                      {copiedField === 'iban' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                    <div>
                      <div className="text-muted-foreground text-[11px]">Referência de Pagamento:</div>
                      <div className="font-mono font-semibold text-primary text-xs">{orderRef}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(orderRef, 'ref')}
                      className="h-7 px-2 text-muted-foreground hover:text-primary"
                    >
                      {copiedField === 'ref' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-primary" /> Pagamento por Referência
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-card text-muted-foreground border-border">
                    Multicaixa Express
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground">Referência:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-primary">{orderRef}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(orderRef, 'ref-mcx')}
                        className="h-7 px-2 text-muted-foreground hover:text-primary"
                      >
                        {copiedField === 'ref-mcx' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-muted-foreground">Montante Total:</span>
                    <span className="font-semibold text-foreground">{formatKz(totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Add-Ons Selection */}
            {availableAddOns.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Adicionar Add-ons Opcionais</span>
                  <span className="text-[10px] font-normal text-muted-foreground">Contratação conjunta</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAddOns.slice(0, 4).map((add) => {
                    const isSelected = selectedAddOnCodes.includes(add.code);
                    const addPrice = isAnnual ? add.priceMonthly * 12 : add.priceMonthly;
                    return (
                      <button
                        key={add.code}
                        type="button"
                        onClick={() => handleToggleAddOn(add.code)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${isSelected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border hover:border-primary/40 bg-card'
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-primary-foreground ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                            }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {add.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            +{formatKz(addPrice)}/{isAnnual ? 'ano' : 'mês'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Proof Upload Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Comprovativo de Pagamento (Obrigatório)</span>
                <span className="text-[10px] font-normal text-muted-foreground">PDF, PNG, JPG (máx. 10MB)</span>
              </label>

              {!proofFile ? (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/40 hover:border-primary/50 cursor-pointer transition-all">
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold text-foreground">Clique para carregar ou arraste o comprovativo</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Recibo emitido pelo banco ou app bancária</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground max-w-[200px] truncate">
                        {proofFile.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {(proofFile.size / 1024).toFixed(1)} KB • Pronto para submissão
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Notas ou Nº de Operação Bancária (Opcional)
              </label>
              <Input
                placeholder="Ex: Pagamento efetuado via BAI Directo por João Silva"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs h-9 bg-card border-border"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation */}
          <div className="md:col-span-5 p-6 bg-muted/30 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resumo da Subscrição
              </h4>

              {/* Cycle Toggle inside Modal */}
              <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shadow-xs">
                <Button
                  size="sm"
                  type="button"
                  variant={billingCycle === 'MONTHLY' ? 'default' : 'ghost'}
                  onClick={() => onCycleChange('MONTHLY')}
                  className={`w-1/2 text-xs h-8 ${billingCycle === 'MONTHLY' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                >
                  Mensal
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant={billingCycle === 'ANNUAL' ? 'default' : 'ghost'}
                  onClick={() => onCycleChange('ANNUAL')}
                  className={`w-1/2 text-xs h-8 ${billingCycle === 'ANNUAL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                >
                  Anual (-17%)
                </Button>
              </div>

              {/* Plan Card Mini */}
              <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">{plan.name}</span>
                  <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                    {isAnnual ? 'Ciclo Anual' : 'Ciclo Mensal'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>

              {/* Selected Add-ons Mini List */}
              {selectedAddOnCodes.length > 0 && (
                <div className="p-3 bg-card rounded-xl border border-border space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Add-ons Selecionados ({selectedAddOnCodes.length}):
                  </div>
                  {selectedAddOnCodes.map((code) => {
                    const add = availableAddOns.find((a) => a.code === code);
                    if (!add) return null;
                    const addPrice = isAnnual ? add.priceMonthly * 12 : add.priceMonthly;
                    return (
                      <div key={code} className="flex items-center justify-between text-muted-foreground">
                        <span className="truncate max-w-[160px]">• {add.name}</span>
                        <span className="font-mono text-foreground font-semibold">{formatKz(addPrice)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Valor do Plano:</span>
                  <span className="font-mono text-foreground font-medium">{formatKz(basePrice)}</span>
                </div>

                {addOnsTotal > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Add-ons Adicionais:</span>
                    <span className="font-mono text-foreground font-medium">+{formatKz(addOnsTotal)}</span>
                  </div>
                )}

                {isAnnual && discountSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Desconto Anual (2 meses grátis):</span>
                    <span className="font-mono font-semibold">-{formatKz(discountSavings)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">Total a Liquidar:</span>
                  <span className="font-extrabold text-primary text-xl font-mono">
                    {formatKz(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  O seu comprovativo será validado pela equipa de faturamento em até 2 horas úteis. As quotas são ativadas após aprovação.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !proofFile}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 text-xs shadow-xs"
              >
                {isSubmitting ? 'A submeter comprovativo...' : 'Confirmar e Enviar Comprovativo'}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full text-muted-foreground hover:text-foreground text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
