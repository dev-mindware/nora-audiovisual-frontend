import { Suspense } from 'react';
import { PortalDeliverableView } from '@/components/portal/portal-deliverable-view';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function DeliverablePortalPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense>
      <PortalDeliverableView token={token} />
    </Suspense>
  );
}
