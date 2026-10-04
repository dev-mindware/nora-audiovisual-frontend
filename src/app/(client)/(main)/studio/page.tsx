import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { StudioPageContent } from '@/components/client';

export default function StudioPageContentPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Estúdio">
        <TitleList
          title="Estúdio & Sets de Filmagem"
          suTitle="Gestão de palcos de rodagem, cicloramas, cabines de som e agenda de ocupação"
        />
        <StudioPageContent />
      </PageWrapper>
    </Suspense>
  );
}
