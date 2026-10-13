'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Badge,
  Progress,
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
  Sparkles,
  HardDrive,
  Camera,
  FolderKanban,
  CreditCard,
  Plus,
  ShieldCheck,
  Building2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { PendingSubscriptionBanner } from './pending-subscription-banner';

type BillingCycle = 'MONTHLY' | 'ANNUAL';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  TRIALING: 'Período de teste',
  PENDING: 'Aguardando Aprovação',
  PAST_DUE: 'Pagamento em atraso',
  SUSPENDED: 'Suspensa',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
};

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);

export function SubscriptionsPageContent() {
  const router = useRouter();
  const plansRef = useRef<HTMLDivElement>(null);
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');

  const {
    plans,
    addOns,
    subscription,
    isLoading,
    isLoadingCatalog,
    plansError,
    refetchCatalog,
    cancelSubscription,
    isCancelling,
    reactivateSubscription,
    isReactivating,
  } = useNoraSubscriptions();

  const currentPlanCode = subscription?.plan?.code;
  const entitlements = subscription?.entitlements;
  const status = subscription?.status;
  const isPending = status === 'PENDING';
  const isTrial = status === 'TRIALING';
  const needsPayment = isTrial || status === 'EXPIRED' || status === 'PAST_DUE' || status === 'SUSPENDED';
  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(differenceInCalendarDays(new Date(subscription.trialEndsAt), new Date()), 0)
    : null;
  const activeAddOnCodes = new Set((subscription?.items ?? []).map((i) => i.addOnCode));

  const monthlyPrice = (p: PlanItem) =>
    cycle === 'ANNUAL' && p.priceAnnual > 0 ? p.priceAnnual / 12 : p.priceMonthly;
  const annualSavings = (p: PlanItem) =>
    p.priceAnnual > 0 ? Math.max(Math.round((1 - p.priceAnnual / (p.priceMonthly * 12)) * 100), 0) : 0;

  // A página é o túnel para o checkout: o plano, o ciclo e o add-on seguem no URL.
  const goToCheckout = (planCode: string, addOnCode?: string) => {
    const params = new URLSearchParams({ plan: planCode, cycle });
    if (addOnCode) params.set('addon', addOnCode);
    router.push(`/checkout?${params.toString()}`);
  };

  const scrollToPlans = () => plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const quota = (used: number | undefined, max: number | undefined) => ({
    used,
    max,
    unlimited: max === 0,
    percent: !max || used === undefined ? 0 : Math.min(Math.round((used / max) * 100), 100),
  });

  const quotas = [
    { icon: FolderKanban, label: 'Projectos activos em simultâneo', ...quota(entitlements?.usedProjects, entitlements?.maxProjects), unit: '' },
    { icon: Building2, label: 'Utilizadores da equipa', ...quota(entitlements?.usedUsers, entitlements?.users), unit: '' },
    { icon: Camera, label: 'Equipamentos no catálogo', ...quota(entitlements?.usedEquipment, entitlements?.maxEquipment), unit: '' },
    { icon: HardDrive, label: 'Armazenamento cloud', ...quota(undefined, entitlements?.storageGb), unit: ' GB' },
  ];

  return (
    <div className="space-y-8">
      {isPending && (
        <PendingSubscriptionBanner
          planName={subscription?.plan?.name || ''}
          billingCycle={subscription?.billingCycle || 'MONTHLY'}
          referenceNumber={subscription?.referenceNumber}
          proofUrl={subscription?.proofUrl}
        />
      )}

      {needsPayment && !isPending && (
        <div className="flex flex-col gap-3 rounded-xs border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xs bg-primary/10 p-2 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isTrial
                  ? trialDaysLeft !== null
                    ? `Período de teste: ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}`
                    : 'Está no período de teste'
                  : 'A sua subscrição precisa de atenção'}
              </p>
              <p className="text-xs text-muted-foreground">
                Escolha um plano, pague por transferência ou Multicaixa Express e envie o comprovativo. A subscrição é activada após validação.
              </p>
            </div>
          </div>
          <Button size="sm" className="shrink-0 rounded-xs" onClick={scrollToPlans}>
            Escolher plano
          </Button>
        </div>
      )}

      {/* Plano vigente e quotas */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col justify-between gap-0 p-0">
          <CardHeader className="border-b border-border p-6 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Plano Vigente</span>
              {status && (
                <Badge variant={status === 'ACTIVE' ? 'default' : 'outline'}>{STATUS_LABEL[status] ?? status}</Badge>
              )}
            </div>
            <div className="pt-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                {isLoading ? 'A carregar…' : subscription?.plan?.name || 'Sem plano activo'}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {subscription
                  ? `Ciclo ${subscription.billingCycle === 'ANNUAL' ? 'anual' : 'mensal'} • ${
                      isPending
                        ? 'Aguardando validação administrativa'
                        : subscription.currentPeriodEnd
                          ? `${isTrial ? 'Teste termina' : 'Renova'} em ${format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}`
                          : ''
                    }`
                  : 'Escolha um plano abaixo para começar.'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6 py-4">
            <div>
              <div className="text-xs text-muted-foreground">Valor mensal do plano</div>
              <div className="text-xl font-semibold text-foreground">
                {formatKz(subscription?.plan?.priceMonthly ?? 0)}
                <span className="text-xs font-normal text-muted-foreground"> /mês</span>
              </div>
            </div>
            {(subscription?.items?.length ?? 0) > 0 && (
              <div>
                <div className="text-xs text-muted-foreground">Add-ons incluídos</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {subscription!.items.map((item) => (
                    <Badge key={item.id} variant="outline" className="text-[10px]">
                      {addOns.find((a) => a.code === item.addOnCode)?.name ?? item.addOnCode}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-2 border-t border-border p-6 pt-4">
            {subscription?.cancelAtPeriodEnd ? (
              <Button variant="outline" size="sm" onClick={() => reactivateSubscription()} disabled={isReactivating} className="w-full rounded-xs">
                Reativar Subscrição
              </Button>
            ) : isPending && currentPlanCode ? (
              <Button variant="outline" size="sm" onClick={() => goToCheckout(currentPlanCode)} className="w-full rounded-xs">
                Atualizar Comprovativo de Pagamento
              </Button>
            ) : needsPayment ? (
              <Button size="sm" onClick={() => goToCheckout(currentPlanCode ?? plans[1]?.code ?? plans[0]?.code ?? 'PROFISSIONAL')} className="w-full rounded-xs">
                <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Subscrever agora
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => cancelSubscription()} disabled={isCancelling} className="w-full rounded-xs">
                Cancelar ao Fim do Período
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="flex flex-col justify-between gap-0 p-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border p-6 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quotas &amp; Capacidades da Produtora
            </span>
            <span className="text-xs text-muted-foreground">Consumo real</span>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            {quotas.map(({ icon: QuotaIcon, label, used, max, unlimited, percent, unit }) => (
              <div key={label} className="space-y-2 rounded-xs border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <QuotaIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {max === undefined
                      ? '—'
                      : unlimited
                        ? `${used ?? 0} / Ilimitado`
                        : used === undefined
                          ? `${max}${unit}`
                          : `${used} / ${max}${unit}`}
                  </span>
                </div>
                {used !== undefined && !unlimited && max ? <Progress value={percent} /> : null}
              </div>
            ))}
            {(entitlements?.aiCredits ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:col-span-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Nora AI inclui {entitlements?.aiCredits} créditos por mês.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planos */}
      <div ref={plansRef} className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Planos de Subscrição Nora Audiovisual</h3>
            <p className="text-xs text-muted-foreground">
              Escolha o plano e siga para o checkout: pague por transferência bancária ou Multicaixa Express e envie o comprovativo.
            </p>
          </div>
          <div className="inline-flex shrink-0 items-center rounded-xs border border-border bg-muted/20 p-0.5" role="group" aria-label="Ciclo de facturação">
            {(['MONTHLY', 'ANNUAL'] as const).map((c) => (
              <Button
                key={c}
                type="button"
                size="sm"
                variant={cycle === c ? 'secondary' : 'ghost'}
                onClick={() => setCycle(c)}
                className="h-7 rounded-xs px-3 text-xs"
              >
                {c === 'MONTHLY' ? 'Mensal' : 'Anual'}
              </Button>
            ))}
          </div>
        </div>

        {isLoadingCatalog ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xs border border-border bg-muted/30" />
            ))}
          </div>
        ) : plansError || plans.length === 0 ? (
          <Card className="items-center gap-3 p-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              {plansError ? 'Não foi possível carregar os planos.' : 'Ainda não há planos publicados.'}
            </p>
            <p className="max-w-md text-xs text-muted-foreground">
              {plansError
                ? 'Verifique a ligação à API e tente novamente.'
                : 'O catálogo de planos e add-ons é criado pelo seed da API (pnpm seed:catalog).'}
            </p>
            <Button variant="outline" size="sm" className="rounded-xs" onClick={() => refetchCatalog()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Tentar novamente
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const isCurrent = p.code === currentPlanCode;
              const paidCurrent = isCurrent && status === 'ACTIVE';
              const featured = p.code === 'PROFISSIONAL';
              const savings = annualSavings(p);

              return (
                <Card
                  key={p.code}
                  className={`relative flex flex-col justify-between gap-0 p-0 transition-all ${
                    featured ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                  }`}
                >
                  {featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="text-[10px] uppercase tracking-wider">Recomendado</Badge>
                    </div>
                  )}

                  <CardHeader className="border-b border-border p-6 pb-4">
                    <CardTitle className="text-xl font-semibold text-foreground">{p.name}</CardTitle>
                    <CardDescription className="mt-1 min-h-[32px] text-xs">{p.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-semibold text-foreground">{formatKz(monthlyPrice(p))}</span>
                      <span className="text-xs text-muted-foreground"> /mês</span>
                      {cycle === 'ANNUAL' && p.priceAnnual > 0 && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatKz(p.priceAnnual)} por ano{savings > 0 ? ` • poupa ${savings}%` : ''}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-6 py-4">
                    <ul className="space-y-2.5">
                      {p.features?.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="border-t border-border p-6 pt-4">
                    {paidCurrent ? (
                      <Button disabled variant="outline" className="w-full rounded-xs">Plano Atual</Button>
                    ) : (
                      <Button
                        variant={featured || isCurrent ? 'default' : 'outline'}
                        onClick={() => goToCheckout(p.code)}
                        className="w-full rounded-xs"
                      >
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        {isCurrent && isPending
                          ? 'Atualizar Comprovativo'
                          : isCurrent || !subscription || needsPayment
                            ? `Subscrever ${p.name.replace(/^Plano /, '')}`
                            : `Mudar para ${p.name.replace(/^Plano /, '')}`}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add-ons */}
      {addOns.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Capacidades &amp; Add-ons Opcionais</h3>
            <p className="text-xs text-muted-foreground">
              Acrescente armazenamento, equipa, equipamentos ou módulos ao seu plano. O add-on segue para o checkout já seleccionado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {addOns.map((add) => {
              const included = activeAddOnCodes.has(add.code);
              return (
                <Card key={add.code} className="flex flex-col justify-between gap-4 p-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{add.name}</span>
                      {included && <Badge variant="outline" className="text-[10px]">Incluído</Badge>}
                    </div>
                    {add.description && <p className="text-xs text-muted-foreground">{add.description}</p>}
                    <p className="pt-2 text-base font-semibold text-foreground">
                      {formatKz(add.priceMonthly)} <span className="text-xs font-normal text-muted-foreground">/mês</span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={included && add.maxQuantity === 1}
                    onClick={() => goToCheckout(currentPlanCode ?? plans[1]?.code ?? plans[0]?.code ?? 'PROFISSIONAL', add.code)}
                    className="w-full rounded-xs"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> {included ? 'Adicionar mais' : 'Adicionar à Subscrição'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
