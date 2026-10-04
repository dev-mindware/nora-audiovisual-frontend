import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { SubscriptionsPageContent } from '@/components/client';

export default function SubscriptionsPageContentPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Planos & Add-Ons" routeLabel="Administração">
        <TitleList
          title="Planos & Add-Ons"
          suTitle="Gerencie o plano contratado da sua produtora, capacidades e faturamento"
        />
        <SubscriptionsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
