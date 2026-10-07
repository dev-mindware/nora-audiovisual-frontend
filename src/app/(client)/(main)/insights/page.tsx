import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { InsightsPageContent } from '@/components/client/insights/insights-page-content';

export default function InsightsPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Nora Insights" routeLabel="Nora Suite">
        <TitleList
          title="Nora Insights"
          suTitle="Inteligência analítica, rentabilidade de projectos e ocupação operacional"
        />
        <InsightsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
