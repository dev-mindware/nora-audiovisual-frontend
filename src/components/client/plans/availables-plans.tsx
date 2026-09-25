"use client";

import { useMemo } from "react";
import {
  Icon,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  PlansPageSkeleton,
} from "@/components";
import { Plan, SubscriptionStatus } from "@/types";
import { useAuth, usePlans } from "@/hooks";
import { useCurrentPlanStore } from "@/stores";
import {
  formatCurrency,
  getPlanFeatures,
} from "@/utils";
import { PlanInclusionFeatures } from "./plan-inclusion-features";
import { useRouter } from "next/navigation";

export function AvailablePlans() {
  const router = useRouter();
  const { user } = useAuth();
  const { plans, isLoading } = usePlans();
  const { setCurrentPlanSelected } = useCurrentPlanStore();

  const subscription = user?.company?.subscription;
  const currentPlan = subscription?.plan;
  const isCurrentPlan = (plan: Plan) => plan.id === currentPlan?.id;

  // Verifica dinamicamente se a subscrição atual está activa ou terminada
  const isSubscriptionActive = useMemo(() => {
    if (!subscription) return false;
    const status = subscription.status;

    // Se o status não for ACTIVE nem TRIALING, a subscrição está terminada
    if (status !== SubscriptionStatus.ACTIVE && status !== SubscriptionStatus.TRIALING) {
      return false;
    }

    // Se houver data de término, valida se já expirou
    const endDate =
      status === SubscriptionStatus.TRIALING
        ? subscription.trialEndsAt
        : subscription.periodEndsAt;

    if (endDate && new Date(endDate).getTime() < Date.now()) {
      return false;
    }

    return true;
  }, [subscription]);

  function onHandlerChoosePlan(plan: Plan) {
    setCurrentPlanSelected(plan);
    router.push("/checkout");
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-tour="plans-header">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolha o Plano Ideal para o Seu Negócio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Otimize a gestão do seu negócio com nossas soluções completas.
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        {isLoading ? (
          <PlansPageSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-tour="plans-grid">
              {plans.map((plan, index) => {
                const isPopular = index === 1;
                const isCurrent = isCurrentPlan(plan);
                const features: string[] = getPlanFeatures(plan);

                // Determina o texto e variante de ação dinamicamente
                const getButtonLabel = () => {
                  if (isCurrent) {
                    return isSubscriptionActive
                      ? "Actualizar Subscrição"
                      : "Renovar Subscrição";
                  }
                  return isSubscriptionActive
                    ? `Actualizar para ${plan.name}`
                    : `Escolher ${plan.name}`;
                };

                const getButtonVariant = () => {
                  if (isCurrent && !isSubscriptionActive) {
                    return "default";
                  }
                  return isPopular || isCurrent ? "default" : "outline";
                };

                return (
                  <Card
                    key={plan.id}
                    className={`relative border-border rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
                      isPopular
                        ? "border-2 border-primary-500 bg-primary-300/5 shadow-2xl scale-105"
                        : "border border-border bg-card"
                    } ${isCurrent && !isSubscriptionActive ? "ring-2 ring-destructive/40" : ""}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary-500 text-white px-4 py-1 shadow-lg">
                          <Icon name="Star" className="h-3 w-3 mr-1" />
                          Mais Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      {isCurrent && (
                        <div className="mb-2 flex justify-center">
                          <Badge
                            variant={isSubscriptionActive ? "default" : "destructive"}
                            className="text-xs px-2.5 py-0.5"
                          >
                            {isSubscriptionActive
                              ? "Plano actual (Activo)"
                              : "Plano actual (Expirado)"}
                          </Badge>
                        </div>
                      )}
                      <CardTitle className="text-2xl font-bold mb-2">
                        {plan.name}
                      </CardTitle>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        {formatCurrency(Number(plan.priceMonthly))}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-0.5">
                              <Icon
                                name="Check"
                                className="h-5 w-5 text-green-600 flex-shrink-0"
                              />
                            </div>
                            <span className="text-sm text-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-6">
                      <Button
                        size="lg"
                        className="w-full gap-2 font-semibold"
                        variant={getButtonVariant()}
                        onClick={() => onHandlerChoosePlan(plan)}
                      >
                        {isCurrent && !isSubscriptionActive && (
                          <Icon name="RotateCw" className="h-4 w-4" />
                        )}
                        {isCurrent && isSubscriptionActive && (
                          <Icon name="ArrowUpToLine" className="h-4 w-4" />
                        )}
                        {getButtonLabel()}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <PlanInclusionFeatures />
          </>
        )}
      </div>
    </div>
  );
}
