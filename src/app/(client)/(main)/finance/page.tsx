import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { FinancePageContent } from '@/components/client';

export default function FinancePage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Tesouraria & Despesas" routeLabel="Financeiro">
        <TitleList
          title="Finanças & Despesas"
          suTitle="Controlo de despesas de rodagem, recebimentos e fluxo de caixa da produtora"
        />
        <FinancePageContent />
      </PageWrapper>
    </Suspense>
  );
}
