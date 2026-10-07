import { Suspense } from 'react';
import { PageWrapper } from '@/components';
import { DynamicRoleDashboard, DashboardLayoutSkeleton } from '@/components/client/dashboard';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <PageWrapper subRoute="Painel Operacional" onboardingTourId="dashboard">
        <DynamicRoleDashboard />
      </PageWrapper>
    </Suspense>
  );
}
