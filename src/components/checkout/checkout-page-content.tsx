'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  ButtonSubmit,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';
import { useNoraSubscriptions } from '@/hooks/subscriptions';
import { PlanItem, AddOnItem } from '@/services/subscriptions-service';
import {
  Check,
  ShieldCheck,
  Building2,
  Phone,
  UploadCloud,
  FileText,
  Trash2,
  Copy,
  ArrowLeft,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPlanCode = searchParams.get('plan') || 'PROFISSIONAL';
  const initialCycle = searchParams.get('cycle') === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
  const initialAddOnCode = searchParams.get('addon');

  const {
    plans,
    addOns,
    checkout,
    isCheckingOut,
  } = useNoraSubscriptions();

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>(initialCycle);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(initialPlanCode);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'MULTICAIXA_EXPRESS'>('BANK_TRANSFER');
  const [mcxPhone, setMcxPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize add-on if provided in query params
  useEffect(() => {
    if (initialAddOnCode) {
      setSelectedAddOns((prev) => ({
        ...prev,
        [initialAddOnCode]: (prev[initialAddOnCode] || 0) + 1,
      }));
    }
  }, [initialAddOnCode]);

  useEffect(() => {
    if (initialPlanCode) {
      setSelectedPlanCode(initialPlanCode);
    }
  }, [initialPlanCode]);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.code === selectedPlanCode) || plans[1] || plans[0];
  }, [plans, selectedPlanCode]);

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  const isCapacityAddOn = (code: string) => {
    const upper = code.toUpperCase();
    return upper.includes('STORAGE') || upper.includes('USERS') || upper.includes('MEMBER');
  };

  const handleToggleAddOn = (addOnCode: string) => {
    setSelectedAddOns((prev) => {
      const next = { ...prev };
      if (next[addOnCode]) {
        delete next[addOnCode];
      } else {
        next[addOnCode] = 1;
      }
      return next;
    });
  };

  const handleUpdateAddOnQty = (addOnCode: string, qty: number) => {
    if (!isCapacityAddOn(addOnCode)) {
      if (qty <= 0) {
        setSelectedAddOns((prev) => {
          const next = { ...prev };
          delete next[addOnCode];
          return next;
        });
      } else {
        setSelectedAddOns((prev) => ({
          ...prev,
          [addOnCode]: 1,
        }));
      }
      return;
    }

    if (qty <= 0) {
      setSelectedAddOns((prev) => {
        const next = { ...prev };
        delete next[addOnCode];
        return next;
      });
    } else {
      setSelectedAddOns((prev) => ({
        ...prev,
        [addOnCode]: qty,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O comprovativo deve ter no máximo 10MB.');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProofDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O comprovativo deve ter no máximo 10MB.');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProofDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculations
  const planPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    return billingCycle === 'ANNUAL' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;
  }, [selectedPlan, billingCycle]);

  const addOnsTotal = useMemo(() => {
    return Object.entries(selectedAddOns).reduce((sum, [code, qty]) => {
      const item = addOns.find((a) => a.code === code);
      if (!item) return sum;
      const itemPrice = billingCycle === 'ANNUAL' ? item.priceMonthly * 10 : item.priceMonthly;
      return sum + itemPrice * qty;
    }, 0);
  }, [selectedAddOns, addOns, billingCycle]);

  const totalAmount = planPrice + addOnsTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast.error('Selecione um plano para continuar.');
      return;
    }

    if (!proofFile && !proofDataUrl) {
      toast.error('Por favor anexe o comprovativo da transferência ou pagamento.');
      return;
    }

    if (paymentMethod === 'MULTICAIXA_EXPRESS' && !mcxPhone.trim()) {
      toast.error('Informe o número de telefone associado ao Multicaixa Express.');
      return;
    }

    const orderRef = `REF-SUB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const addOnsPayload = Object.entries(selectedAddOns).map(([code, quantity]) => ({
        code,
        quantity,
      }));

      const res = await checkout({
        planCode: selectedPlan.code,
        billingInterval: billingCycle,
        paymentMethod,
        proofFileUrl: proofDataUrl || 'https://nora.ao/proofs/pending',
        referenceNumber: orderRef,
        notes: notes.trim() ? `${notes.trim()}${mcxPhone ? ` | MCX: ${mcxPhone}` : ''}` : (mcxPhone ? `MCX: ${mcxPhone}` : undefined),
        addOns: addOnsPayload.length > 0 ? addOnsPayload : undefined,
      });

      const refNum = res?.referenceNumber || orderRef;
      setSuccessRef(refNum);
    } catch {
      // Handled in mutation toast
    }
  };

  if (successRef) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center">
          <Card className="w-full max-w-lg p-6 sm:p-8 gap-0">
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Pedido recebido
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Subscrição submetida
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Recebemos a solicitação do plano{' '}
                <span className="font-semibold text-foreground">{selectedPlan?.name}</span>.
                A equipa irá validar o pagamento e activar o acesso.
              </p>
            </div>

            <div className="mt-6 border border-border bg-muted/20 p-4 rounded-xs">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Referência
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-mono text-base font-semibold">{successRef}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(successRef, 'Referência')}
                  className="gap-1.5 text-xs h-8 rounded-xs"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 border border-border p-4 text-xs leading-5 text-muted-foreground rounded-xs">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                O comprovativo foi encaminhado para validação. A activação será concluída
                após a confirmação da transacção.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/subscriptions')}
                className="w-full h-10 rounded-xs"
              >
                Ver subscrições
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full h-10 rounded-xs"
              >
                Ir para o dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur w-full">
        <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos planos
          </Link>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Checkout seguro (SSL)</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Subscrição
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Finalizar subscrição
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Escolha o plano, indique o método de pagamento e envie o comprovativo.
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-12 xl:gap-12 w-full">
            <div className="lg:col-span-8 min-w-0 space-y-8">
              {/* Billing */}
              <section className="border-b border-border pb-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold">Ciclo de facturação</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Escolha a periodicidade da subscrição.
                    </p>
                  </div>

                  <div className="flex shrink-0 border border-border p-0.5 rounded-xs bg-muted/30">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={`h-8 px-3 text-xs font-medium transition-colors rounded-xs ${
                        billingCycle === 'MONTHLY'
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Mensal
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('ANNUAL')}
                      className={`h-8 px-3 text-xs font-medium transition-colors rounded-xs ${
                        billingCycle === 'ANNUAL'
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Anual
                    </button>
                  </div>
                </div>

                {billingCycle === 'ANNUAL' && (
                  <p className="text-xs text-primary font-medium">
                    O ciclo anual aplica a condição de 2 meses grátis.
                  </p>
                )}
              </section>

              {/* Plan */}
              <section>
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    01
                  </p>
                  <h2 className="mt-1 text-sm font-semibold">Escolha o plano</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {plans.map((p) => {
                    const isSelected = p.code === selectedPlanCode;
                    const price =
                      billingCycle === 'ANNUAL' ? p.priceAnnual : p.priceMonthly;

                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => setSelectedPlanCode(p.code)}
                        aria-pressed={isSelected}
                        className={`group min-h-[150px] border p-4 text-left transition-colors rounded-xs ${
                          isSelected
                            ? 'border-primary bg-muted/40'
                            : 'border-border bg-card hover:border-primary/40'
                        }`}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold">{p.name}</span>
                              {p.code === 'PROFISSIONAL' && (
                                <Badge variant="default" className="text-[10px]">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {p.description}
                            </p>
                          </div>

                          <div className="mt-5 border-t border-border pt-3">
                            <span className="text-sm font-semibold">{formatKz(price)}</span>
                            <span className="ml-1 text-[11px] text-muted-foreground">
                              /{billingCycle === 'ANNUAL' ? 'ano' : 'mês'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Add-ons */}
              {addOns.length > 0 && (
                <section>
                  <div className="mb-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      02
                    </p>
                    <h2 className="mt-1 text-sm font-semibold">Add-ons Opcionais</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Adicione apenas o que a sua produtora precisa.
                    </p>
                  </div>

                  <div className="divide-y divide-border border-y border-border">
                    {addOns.map((add) => {
                      const isChecked = !!selectedAddOns[add.code];
                      const qty = selectedAddOns[add.code] || 1;
                      const itemPrice =
                        billingCycle === 'ANNUAL'
                          ? add.priceMonthly * 10
                          : add.priceMonthly;

                      return (
                        <div key={add.code} className="flex items-center gap-4 py-4">
                          <input
                            id={`addon-${add.code}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAddOn(add.code)}
                            className="h-4 w-4 shrink-0 rounded-xs border-border accent-[hsl(var(--primary))]"
                          />

                          <label htmlFor={`addon-${add.code}`} className="min-w-0 flex-1 cursor-pointer">
                            <span className="block text-sm font-medium text-foreground">{add.name}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                              {add.description}
                            </span>
                          </label>

                          <div className="flex shrink-0 items-center gap-3">
                            {isChecked && (
                              isCapacityAddOn(add.code) ? (
                                <div className="flex items-center border border-border rounded-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAddOnQty(add.code, qty - 1)}
                                    className="h-7 w-7 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label={`Diminuir quantidade de ${add.name}`}
                                  >
                                    −
                                  </button>
                                  <span className="w-7 text-center text-xs font-medium">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAddOnQty(add.code, qty + 1)}
                                    className="h-7 w-7 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label={`Aumentar quantidade de ${add.name}`}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary border border-primary/20">
                                  Ativo
                                </span>
                              )
                            )}
                            <span className="text-xs font-semibold text-foreground">
                              {formatKz(itemPrice * (isChecked ? qty : 1))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Payment */}
              <section>
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    03
                  </p>
                  <h2 className="mt-1 text-sm font-semibold">Método de Pagamento em Angola</h2>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`border p-4 text-left transition-colors rounded-xs ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-primary bg-muted/40'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <span className="block text-sm font-medium text-foreground">
                          Transferência Bancária (BAI)
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Depósito ou transferência por IBAN direto.
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MULTICAIXA_EXPRESS')}
                    className={`border p-4 text-left transition-colors rounded-xs ${
                      paymentMethod === 'MULTICAIXA_EXPRESS'
                        ? 'border-primary bg-muted/40'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <span className="block text-sm font-medium text-foreground">
                          Multicaixa Express
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Pagamento direto através do telemóvel.
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-4 border border-border p-5 rounded-xs bg-card">
                  {paymentMethod === 'BANK_TRANSFER' ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <span className="text-[11px] text-muted-foreground">Banco</span>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            Banco Angolano de Investimentos (BAI)
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            Beneficiário
                          </span>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            Nora Audiovisual, Lda
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="text-[11px] text-muted-foreground">
                            IBAN Direto
                          </span>
                          <p className="mt-1 break-all font-mono text-xs font-semibold text-foreground">
                            AO06.0040.0000.1234.5678.9012.3
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard('AO06004000001234567890123', 'IBAN')
                          }
                          className="h-8 gap-1.5 text-xs rounded-xs"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copiar IBAN
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="mcx-phone"
                        className="text-xs font-medium text-foreground"
                      >
                        Número associado ao Multicaixa Express *
                      </label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Introduza o número que receberá o pedido de confirmação de pagamento.
                      </p>
                      <Input
                        id="mcx-phone"
                        type="text"
                        value={mcxPhone}
                        onChange={(e) => setMcxPhone(e.target.value)}
                        placeholder="Ex: 923 000 000"
                        required
                        className="mt-3"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Proof */}
              <section>
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    04
                  </p>
                  <h2 className="mt-1 text-sm font-semibold">
                    Comprovativo e Observações
                  </h2>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  className="hidden"
                />

                {proofFile ? (
                  <div className="flex items-center gap-3 border border-border p-4 rounded-xs bg-muted/20">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{proofFile.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {(proofFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProofFile(null);
                        setProofDataUrl(null);
                      }}
                      className="h-8 w-8 p-0 rounded-xs text-muted-foreground hover:text-foreground"
                      aria-label="Remover comprovativo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border border-dashed p-8 text-center transition-colors rounded-xs ${
                      isDragOver
                        ? 'border-foreground bg-muted/30'
                        : 'border-border bg-card hover:border-foreground/50 hover:bg-muted/20'
                    }`}
                  >
                    <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
                    <span className="mt-3 block text-sm font-medium text-foreground">
                      Anexar comprovativo de pagamento
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Formatos aceites: PDF, JPG ou PNG · máximo 10 MB
                    </span>
                  </button>
                )}

                <div className="mt-4 space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-medium text-foreground">
                    NIF da Produtora ou Observações <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Faturar para Estúdio Criativo, NIF 5400000000"
                  />
                </div>
              </section>
            </div>

            {/* Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-20">
              <Card className="p-0 gap-0 overflow-hidden">
                <CardHeader className="p-5 sm:p-6 border-b border-border flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">
                      Resumo da Subscrição
                    </CardDescription>
                    <CardTitle className="mt-1 text-base font-semibold text-foreground">
                      Plano {selectedPlan?.name}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">
                    {billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'}
                  </Badge>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground text-xs">
                      Plano {selectedPlan?.name}
                    </span>
                    <span className="font-semibold text-foreground text-sm">{formatKz(planPrice)}</span>
                  </div>

                  {Object.entries(selectedAddOns).map(([code, qty]) => {
                    const item = addOns.find((a) => a.code === code);
                    if (!item) return null;

                    const itemPrice =
                      (billingCycle === 'ANNUAL'
                        ? item.priceMonthly * 10
                        : item.priceMonthly) * qty;

                    return (
                      <div
                        key={code}
                        className="flex items-center justify-between gap-4 text-xs"
                      >
                        <span className="text-muted-foreground">
                          {item.name} {isCapacityAddOn(code) ? `× ${qty}` : ''}
                        </span>
                        <span className="font-semibold text-foreground">{formatKz(itemPrice)}</span>
                      </div>
                    );
                  })}
                </CardContent>

                <CardFooter className="p-5 sm:p-6 border-t border-border flex flex-col items-stretch">
                  <div className="flex items-end justify-between gap-4 w-full">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Total a pagar
                      </span>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                        {formatKz(totalAmount)}
                      </p>
                    </div>
                    {billingCycle === 'ANNUAL' && (
                      <span className="pb-1 text-xs font-semibold text-primary">
                        2 meses grátis
                      </span>
                    )}
                  </div>

                  <ButtonSubmit
                    isLoading={isCheckingOut}
                    className="mt-6 w-full"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Submeter subscrição
                  </ButtonSubmit>

                  <div className="mt-5 space-y-2 border-t border-border pt-4 w-full">
                    <p className="flex gap-2 text-[11px] leading-5 text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      Validação do pagamento pela equipa financeira.
                    </p>
                    <p className="flex gap-2 text-[11px] leading-5 text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      Activação após confirmação da transacção.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}
