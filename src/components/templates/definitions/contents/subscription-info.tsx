"use client";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components";
import { useAuth } from "@/hooks/auth";
import { formatCurrency } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export function SubscriptionInfo() {
  const { user } = useAuth();
  const subscription = user?.company?.subscription;
  const plan = subscription?.plan;

  if (!subscription || !plan) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>Nenhum plano ativo</CardTitle>
          <CardDescription>
            Ainda não existe uma subscrição activa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/plans">
            <Button className="gap-2">
              <Icon name="Zap" size={16} />
              Ver Planos Disponíveis
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isTrial = subscription.status === "TRIALING";
  const isPending = subscription.status === "PENDING";
  const endDate = isTrial
    ? subscription.trialEndsAt
    : subscription.periodEndsAt;

  const isExpired =
    subscription.status === "EXPIRED" ||
    subscription.status === "CANCELED" ||
    subscription.status === "PAST_DUE" ||
    (endDate ? new Date(endDate).getTime() < Date.now() : false);

  const isSubscriptionActive = (subscription.status === "ACTIVE" || isTrial) && !isExpired;

  return (
    <div className="space-y-6">
      <Card className={isExpired ? "border-destructive/40 ring-1 ring-destructive/20" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Plano {plan.name}</CardTitle>
            <CardDescription>
              Gerir os detalhes da sua subscrição.
            </CardDescription>
          </div>
          <Badge
            variant={isExpired ? "destructive" : isTrial ? "secondary" : isPending ? "pending" : "default"}
            className="px-3 py-1"
          >
            {isExpired ? "Expirado" : isTrial ? "Período de Teste" : isPending ? "Pendente" : "Ativo"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Preço Mensal</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(Number(plan.priceMonthly))}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {isExpired ? "Expirou em" : isTrial ? "Expira em" : "Próxima facturação"}
              </p>
              <p className={`text-lg font-semibold ${isExpired ? "text-destructive" : ""}`}>
                {endDate
                  ? format(new Date(endDate), "dd 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Intervalo</p>
              <p className="text-lg font-semibold capitalize">
                {subscription.billingInterval || "Mensal"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link href="/plans" className={`${isPending ? "pointer-events-none" : ""}`}>
              <Button
                className="gap-2"
                disabled={isPending}
                variant={isExpired ? "default" : "outline"}
              >
                <Icon name={isExpired ? "RotateCw" : "ArrowUpToLine"} size={16} />
                {isExpired ? "Renovar Subscrição" : "Actualizar Subscrição"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
