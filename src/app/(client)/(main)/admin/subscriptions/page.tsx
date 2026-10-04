import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AdminSubscriptionsPageContent } from '@/components/client/admin';

export default function AdminSubscriptionsPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Subscrições" routeLabel="Admin">
        <TitleList
          title="Subscrições"
          suTitle="Lista de subscrições e planos multi-tenant"
        />
        <AdminSubscriptionsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
