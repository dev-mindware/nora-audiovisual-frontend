import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { BudgetsPageContent } from '@/components/client';

export default function BudgetsPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Orçamentos" routeLabel="Comercial">
        <TitleList
          title="Orçamentos & Faturação"
          suTitle="Propostas e orçamentos estruturados de produção audiovisual"
        />
        <BudgetsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
