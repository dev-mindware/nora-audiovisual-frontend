import { Suspense } from 'react';
import { PageWrapper } from '@/components';
import { AiPageContent } from '@/components/client/ai/ai-page-content';

export default function AiAssistantPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Nora AI Studio" routeLabel="Inteligência Artificial">
        <AiPageContent />
      </PageWrapper>
    </Suspense>
  );
}

