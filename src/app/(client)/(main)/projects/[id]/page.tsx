import { Suspense } from 'react';
import { PageWrapper } from '@/components';
import { ProjectDetailPageContent } from '@/components/client/projects';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense>
      <PageWrapper
        subRoute="Detalhe da Produção"
        routeLabel="Projectos"
        routePath="/projects"
      >
        <ProjectDetailPageContent projectId={id} />
      </PageWrapper>
    </Suspense>
  );
}
