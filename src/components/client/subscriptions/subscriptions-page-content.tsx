'use client';

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
} from 'lucide-react';
import { format } from 'date-fns';
import { PendingSubscriptionBanner } from './pending-subscription-banner';

export function SubscriptionsPageContent() {
  const router = useRouter();

  const {
    plans,
    addOns,
    subscription,
    isLoading,
    cancelSubscription,
    isCancelling,
    reactivateSubscription,
    isReactivating,
  } = useNoraSubscriptions();

  const currentPlanCode = subscription?.plan?.code || 'PROFISSIONAL';
  const entitlements = subscription?.entitlements;
  const isPending = subscription?.status === 'PENDING';

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  const getPercent = (used = 0, total = 1) => {
    if (!total || total === 0) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const handleOpenCheckout = (plan: PlanItem) => {
    router.push(`/checkout?plan=${plan.code}`);
  };

  const handleOpenAddOnCheckout = (addOn: AddOnItem) => {
    router.push(`/checkout?plan=${currentPlanCode}&addon=${addOn.code}`);
  };

  return (
    <div className="space-y-8">
      {/* Pending Validation Banner */}
      {isPending && (
        <PendingSubscriptionBanner
          planName={subscription?.plan?.name || 'Nora Profissional'}
          billingCycle={subscription?.billingCycle || 'MONTHLY'}
          referenceNumber={subscription?.referenceNumber}
          proofUrl={subscription?.proofUrl}
        />
      )}

      {/* Active Subscription Summary & Quotas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Active Plan Card */}
        <Card className="flex flex-col justify-between p-0 gap-0">
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Plano Vigente
              </span>
              <Badge
                variant={subscription?.status === 'ACTIVE' ? 'default' : 'outline'}
              >
                {subscription?.status === 'ACTIVE'
                  ? 'Ativo'
                  : subscription?.status === 'PENDING'
                  ? 'Aguardando Aprovação'
                  : subscription?.status || 'Ativo'}
              </Badge>
            </div>

            <div className="pt-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                {subscription?.plan?.name || 'Nora Profissional'}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Ciclo {subscription?.billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'} •{' '}
                {isPending
                  ? 'Aguardando validação administrativa'
                  : subscription?.currentPeriodEnd
                  ? `Renova em ${format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}`
                  : 'Vigência de 30 dias'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6 py-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Valor Mensal</div>
              <div className="text-xl font-semibold text-foreground">
                {formatKz(subscription?.plan?.priceMonthly || 85000)}
                <span className="text-xs font-normal text-muted-foreground"> /mês</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-4 border-t border-border flex items-center justify-between gap-2">
            {subscription?.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => reactivateSubscription()}
                disabled={isReactivating}
                className="w-full rounded-xs"
              >
                Reativar Subscrição
              </Button>
            ) : isPending ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = plans.find((p) => p.code === currentPlanCode) || plans[1] || plans[0];
                  if (target) handleOpenCheckout(target);
                }}
                className="w-full rounded-xs"
              >
                Atualizar Comprovativo de Pagamento
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelSubscription()}
                disabled={isCancelling}
                className="w-full rounded-xs"
              >
                Cancelar ao Fim do Período
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Entitlements / Quotas Progress (2 columns span) */}
        <Card className="lg:col-span-2 flex flex-col justify-between p-0 gap-0">
          <CardHeader className="p-6 pb-4 border-b border-border flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quotas &amp; Capacidades Activas da Produtora
            </span>
            <span className="text-xs text-muted-foreground">Recálculo em tempo real</span>
          </CardHeader>

          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Projects Quota */}
            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  Projectos Activos em Simultâneo
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedProjects || 8} / {entitlements?.maxProjects || 25}
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedProjects || 8, entitlements?.maxProjects || 25)}
              />
            </div>

            {/* Equipment Quota */}
            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  Equipamentos no Catálogo
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedEquipment || 24} / {entitlements?.maxEquipment || 75}
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedEquipment || 24, entitlements?.maxEquipment || 75)}
              />
            </div>

            {/* Storage Quota */}
            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                  Armazenamento Cloud
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedStorageGb || 68} GB / {entitlements?.storageGb || 250} GB
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedStorageGb || 68, entitlements?.storageGb || 250)}
              />
            </div>

            {/* AI Credits Quota */}
            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Créditos Nora AI
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedAiCredits || 120} / {entitlements?.aiCredits || 500}
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedAiCredits || 120, entitlements?.aiCredits || 500)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison Tiers */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Planos de Subscrição Nora Audiovisual</h3>
          <p className="text-xs text-muted-foreground">
            Selecione o plano ideal para a sua produtora e confirme o pagamento via transferência bancária ou Multicaixa Express.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = p.code === currentPlanCode;

            return (
              <Card
                key={p.code}
                className={`p-0 gap-0 flex flex-col justify-between transition-all ${
                  p.code === 'PROFISSIONAL'
                    ? 'border-primary ring-1 ring-primary/30 relative'
                    : 'border-border'
                }`}
              >
                {p.code === 'PROFISSIONAL' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="text-[10px] uppercase tracking-wider">
                      Recomendado
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-6 pb-4 border-b border-border">
                  <CardTitle className="text-xl font-semibold text-foreground">{p.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 min-h-[32px]">{p.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-semibold text-foreground">{formatKz(p.priceMonthly)}</span>
                    <span className="text-xs text-muted-foreground"> /mês</span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 py-4 flex-1">
                  <ul className="space-y-2.5">
                    {p.features?.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-4 border-t border-border">
                  {isCurrent && !isPending ? (
                    <Button disabled variant="outline" className="w-full rounded-xs">
                      Plano Atual
                    </Button>
                  ) : (
                    <Button
                      variant={p.code === 'PROFISSIONAL' ? 'default' : 'outline'}
                      onClick={() => handleOpenCheckout(p)}
                      className="w-full rounded-xs"
                    >
                      {isCurrent && isPending
                        ? 'Atualizar Comprovativo'
                        : 'Subscrever / Mudar de Plano'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add-Ons Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Capacidades &amp; Add-ons Opcionais</h3>
          <p className="text-xs text-muted-foreground">
            Aumente o poder da sua produtora adicionando armazenamento extra, membros ou créditos de IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addOns.map((add) => (
            <Card
              key={add.code}
              className="p-5 gap-4 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground text-sm">{add.name}</span>
                <p className="text-xs text-muted-foreground">{add.description}</p>
                <p className="text-base font-semibold text-foreground pt-2">
                  {formatKz(add.priceMonthly)} <span className="text-xs font-normal text-muted-foreground">/mês</span>
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddOnCheckout(add)}
                className="w-full rounded-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar à Subscrição
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}