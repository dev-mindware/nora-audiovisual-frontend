import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { ProjectsPageContent } from '@/components/client';

export default function ProjectsPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Projetos" routeLabel="Produção">
        <TitleList
          title="Projetos & Produções"
          suTitle="Gestão integrada de rodagens, fases criativas, ordens de serviço e prazos"
        />
        <ProjectsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
