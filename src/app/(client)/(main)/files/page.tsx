import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { FilesPageContent } from '@/components/client';

export default function FilesPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Arquivos & Armazenamento" routeLabel="Produção">
        <TitleList
          title="Arquivos & Armazenamento"
          suTitle="Gestão de proxies de vídeo, áudio, guiões e backups em buckets S3/R2"
        />
        <FilesPageContent />
      </PageWrapper>
    </Suspense>
  );
}
