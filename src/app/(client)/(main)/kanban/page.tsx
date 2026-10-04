import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { KanbanPageContent } from '@/components/client';

export default function KanbanPageContentPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Kanban">
        <TitleList
          title="Quadro Kanban de Produção"
          suTitle="Acompanhamento operacional de rodagem, departamentos técnicos e pós-produção"
        />
        <KanbanPageContent />
      </PageWrapper>
    </Suspense>
  );
}
