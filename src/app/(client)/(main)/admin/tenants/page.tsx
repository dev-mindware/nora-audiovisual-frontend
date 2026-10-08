import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AdminTenantsPageContent } from '@/components/client/admin';

export default function AdminTenantsPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Produtoras" routeLabel="Admin" routePath="/admin">
        <TitleList
          title="Produtoras"
          suTitle="Lista de produtoras e estúdios audiovisuais"
        />
        <AdminTenantsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
