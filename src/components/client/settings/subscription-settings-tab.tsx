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
import {
  CreditCard,
  CheckCircle2,
  FolderKanban,
  Camera,
  HardDrive,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export function SubscriptionSettingsTab() {
  const router = useRouter();
  const {
    subscription,
    isLoading,
    cancelSubscription,
    isCancelling,
    reactivateSubscription,
    isReactivating,
  } = useNoraSubscriptions();

  const entitlements = subscription?.entitlements;
  const isPending = subscription?.status === 'PENDING';

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(value);
  };

  const getPercent = (used = 0, total = 1) => {
    if (!total || total === 0) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Subscrição &amp; Faturamento da Produtora
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Acompanhe o estado do seu plano contratado, capacidades ativas e histórico de renovação.
        </p>
      </div>

      {/* Main Subscription Card */}
      <Card className="p-0 gap-0">
        <CardHeader className="p-6 pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
              Plano em Vigor
            </span>
            <CardTitle className="text-2xl font-semibold text-foreground">
              {subscription?.plan?.name || 'Nora Profissional'}
            </CardTitle>
            <CardDescription className="text-xs">
              Ciclo {subscription?.billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'} •{' '}
              {isPending
                ? 'Comprovativo a aguardar validação'
                : subscription?.currentPeriodEnd
                ? `Renova em ${format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}`
                : 'Vigência de 30 dias'}
            </CardDescription>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <Badge
              variant={subscription?.status === 'ACTIVE' ? 'default' : 'outline'}
            >
              {subscription?.status === 'ACTIVE'
                ? 'Subscrição Ativa'
                : subscription?.status === 'PENDING'
                ? 'Pendente de Aprovação'
                : subscription?.status || 'Ativa'}
            </Badge>

            <span className="text-lg font-semibold text-foreground font-mono">
              {formatKz(subscription?.plan?.priceMonthly || 85000)}
              <span className="text-xs font-normal text-muted-foreground"> /mês</span>
            </span>
          </div>
        </CardHeader>

        {/* Quotas Grid */}
        <CardContent className="p-6 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Utilização de Quotas em Tempo Real
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" /> Projectos Simultâneos
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedProjects || 8} / {entitlements?.maxProjects || 25}
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedProjects || 8, entitlements?.maxProjects || 25)}
              />
            </div>

            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" /> Equipamentos Catálogo
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedEquipment || 24} / {entitlements?.maxEquipment || 75}
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedEquipment || 24, entitlements?.maxEquipment || 75)}
              />
            </div>

            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground" /> Armazenamento Cloud
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedStorageGb || 68} GB / {entitlements?.storageGb || 250} GB
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedStorageGb || 68, entitlements?.storageGb || 250)}
              />
            </div>

            <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Créditos Nora AI
                </span>
                <span className="font-mono text-muted-foreground">
                  {entitlements?.usedAiCredits || 120} / {entitlements?.aiCredits || 500}
                </span>
              </div>
              <Progress
                value={getPercent(entitlements?.usedAiCredits || 120, entitlements?.aiCredits || 500)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
