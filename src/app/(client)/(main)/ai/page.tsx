import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AiPageContent } from '@/components/client/ai/ai-page-content';

export default function AiAssistantPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Nora AI" routeLabel="Nora Suite">
        <TitleList
          title="Nora AI Studio"
          suTitle="Assistente de produção audiovisual, geração de call sheets e estimativas técnicas"
        />
        <AiPageContent />
      </PageWrapper>
    </Suspense>
  );
}

