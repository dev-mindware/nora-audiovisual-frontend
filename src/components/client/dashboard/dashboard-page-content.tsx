"use client";

import { PageWrapper, TitleList } from "@/components";
import { useAuth } from "@/hooks/auth/use-auth";
import { DashboardOverview, OverviewPeriodSelect } from "./overview";

export function DashboardPageContent() {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";

  return (
    <PageWrapper
      routeLabel={isOwner ? "Dashboard Global" : "Dashboard Loja"}
      subRoute={isOwner ? "Visão do Proprietário" : "Visão do Gerente"}
      onboardingTourId="dashboard"
    >
      <div data-tour="dashboard-header">
        <TitleList
          title="Visão Geral"
          suTitle={
            isOwner
              ? "Resumo inteligente do desempenho do seu negócio"
              : `Resumo inteligente da Loja ${user?.store?.name || ""}`
          }
        >
          <div data-tour="dashboard-period">
            <OverviewPeriodSelect />
          </div>
        </TitleList>
      </div>

      <div className="mt-6">
        <DashboardOverview />
      </div>
    </PageWrapper>
  );
}
