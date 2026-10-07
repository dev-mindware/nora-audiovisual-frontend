'use client';

import { useState } from 'react';
import {
  CreditCard,
  Building2,
  Copy,
  Check,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonSubmit } from '@/components/ui/button-submit';
import { Input } from '@/components/ui/input';
import { portalService, ExtraPhotosCheckoutResponse } from '@/services/portal-service';
import { toast } from 'sonner';

interface ExtraPhotosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  selectedAssetIds: string[];
  extraPhotosCount: number;
  totalAmount: number;
  onPaymentSuccess?: () => void;
}

export function ExtraPhotosCheckoutModal({
  isOpen,
  onClose,
  token,
  selectedAssetIds,
  extraPhotosCount,
  totalAmount,
  onPaymentSuccess,
}: ExtraPhotosCheckoutModalProps) {
  const [method, setMethod] = useState<'MULTICAIXA' | 'BANK_TRANSFER' | 'STRIPE'>('MULTICAIXA');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<ExtraPhotosCheckoutResponse | null>(null);

  // Proof upload state
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofSent, setProofSent] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleStartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('Indique o seu nome completo para a factura/recibo.');
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const res = await portalService.checkoutExtraPhotos(token, {
        method,
        selectedAssetIds,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
      });
      setCheckoutData(res);
      toast.success(res.message || 'Dados de pagamento gerados com sucesso!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao processar checkout.');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData?.payment?.id) return;
    if (!receiptUrl.trim()) {
      toast.error('Insira a URL ou link do comprovativo.');
      return;
    }

    setIsUploadingProof(true);
    try {
      await portalService.uploadPaymentProof(token, {
        paymentId: checkoutData.payment.id,
        receiptUrl: receiptUrl.trim(),
      });
      setProofSent(true);
      toast.success('Comprovativo recebido com sucesso! A equipa irá validar.');
      onPaymentSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Falha ao submeter comprovativo.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Aquisição de Fotos Excedentes
              </h3>
              <p className="text-xs text-muted-foreground">
                Liquidação segura de fotografias adicionais selecionadas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Fotos Selecionadas além do contrato:</span>
            <span className="font-semibold text-foreground">{extraPhotosCount} foto(s)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Preço unitário:</span>
            <span className="font-semibold text-foreground">
              {new Intl.NumberFormat('pt-AO', {
                style: 'currency',
                currency: 'AOA',
              }).format(totalAmount / (extraPhotosCount || 1))}
            </span>
          </div>
          <div className="border-t border-border/40 pt-2 flex items-center justify-between text-sm font-semibold text-foreground">
            <span>Total a Liquidar:</span>
            <span className="text-primary text-base">
              {new Intl.NumberFormat('pt-AO', {
                style: 'currency',
                currency: 'AOA',
              }).format(totalAmount)}
            </span>
          </div>
        </div>

        {!checkoutData ? (
          /* Step 1: Client identification & payment method */
          <form onSubmit={handleStartCheckout} className="space-y-4">
            <div className="space-y-3">
              <Input
                label="Nome do Titular *"
                placeholder="Ex: Ana Paula Martins"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email de Confirmação"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <Input
                  label="Contacto Telefónico"
                  placeholder="+244 923 000 000"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Método de Pagamento Preferido
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('MULTICAIXA')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                    method === 'MULTICAIXA'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Multicaixa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('BANK_TRANSFER')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                    method === 'BANK_TRANSFER'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Transferência</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('STRIPE')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                    method === 'STRIPE'
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Cartão Visa</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancelar
              </Button>
              <ButtonSubmit
                isLoading={isProcessingCheckout}
                className="rounded-xl bg-primary text-primary-foreground gap-1.5"
              >
                Prosseguir para Pagamento <ArrowRight className="h-3.5 w-3.5" />
              </ButtonSubmit>
            </div>
          </form>
        ) : (
          /* Step 2: Payment details & proof upload */
          <div className="space-y-4">
            {method === 'MULTICAIXA' && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Referência Multicaixa / Express
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-primary/15">
                    <span className="text-muted-foreground">Entidade:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        {checkoutData.paymentDetails.multicaixa.entity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            checkoutData.paymentDetails.multicaixa.entity,
                            'entity'
                          )
                        }
                        className="text-muted-foreground hover:text-primary"
                      >
                        {copiedField === 'entity' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-primary/15">
                    <span className="text-muted-foreground">Referência:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground text-sm tracking-wider">
                        {checkoutData.paymentDetails.multicaixa.reference}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            checkoutData.paymentDetails.multicaixa.reference,
                            'reference'
                          )
                        }
                        className="text-muted-foreground hover:text-primary"
                      >
                        {copiedField === 'reference' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Montante:</span>
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-AO', {
                        style: 'currency',
                        currency: 'AOA',
                      }).format(checkoutData.paymentDetails.multicaixa.amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {method === 'BANK_TRANSFER' && (
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                <div className="text-xs font-semibold text-foreground">
                  Dados de Transferência Bancária
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Banco:</span>
                    <span className="font-semibold text-foreground">
                      {checkoutData.paymentDetails.bankTransfer.bankName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Titular:</span>
                    <span className="font-semibold text-foreground">
                      {checkoutData.paymentDetails.bankTransfer.accountHolder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 bg-muted/40 p-2 rounded-lg">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">IBAN:</span>
                      <span className="font-mono font-semibold text-foreground text-xs break-all">
                        {checkoutData.paymentDetails.bankTransfer.iban}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(checkoutData.paymentDetails.bankTransfer.iban, 'iban')
                      }
                      className="ml-2 text-muted-foreground hover:text-primary shrink-0"
                    >
                      {copiedField === 'iban' ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Proof upload section */}
            {!proofSent ? (
              <form
                onSubmit={handleUploadProof}
                className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Upload className="h-3.5 w-3.5 text-primary" /> Anexar Comprovativo de Pagamento
                </div>
                <Input
                  label="URL / Link do Comprovativo"
                  placeholder="https://storage... ou link público do recibo"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  required
                />
                <ButtonSubmit
                  isLoading={isUploadingProof}
                  className="w-full rounded-xl bg-primary text-primary-foreground text-xs"
                >
                  Enviar Comprovativo
                </ButtonSubmit>
              </form>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 mb-2">
                  <FileCheck className="h-4 w-4" />
                </div>
                <p className="font-semibold">Comprovativo Enviado!</p>
                <p className="text-[11px] text-muted-foreground">
                  A nossa equipa financeira confirmará a receção e libertará o pacote final.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
