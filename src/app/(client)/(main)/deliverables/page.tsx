import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { DeliverablesPageContent } from '@/components/client';

export default function DeliverablesPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Entregáveis & Revisão" routeLabel="Pós-Produção">
        <TitleList
          title="Entregáveis & Revisão"
          suTitle="Gestão de versões de copião, aprovação do cliente e notas frame-a-frame"
        />
        <DeliverablesPageContent />
      </PageWrapper>
    </Suspense>
  );
}
