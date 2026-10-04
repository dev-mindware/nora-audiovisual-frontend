import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AutomatePageContent } from '@/components/client/automate/automate-page-content';

export default function AutomatePage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Nora Automate" routeLabel="Nora Suite">
        <TitleList
          title="Nora Automate"
          suTitle="Automações comerciais, follow-up de orçamentos e notificações operacionais da produtora"
        />
        <AutomatePageContent />
      </PageWrapper>
    </Suspense>
  );
}
