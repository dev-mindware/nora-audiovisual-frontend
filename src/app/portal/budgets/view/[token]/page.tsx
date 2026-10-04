import { Suspense } from 'react';
import { PortalBudgetView } from '@/components/portal/portal-budget-view';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function BudgetPortalPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense>
      <PortalBudgetView token={token} />
    </Suspense>
  );
}
