import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AdminOverviewPageContent } from '@/components/client/admin';

export default function AdminOverviewPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Painel Geral" routeLabel="Admin">
        <TitleList
          title="Centro de Controlo Administrativo"
          suTitle="Governança de produtoras, utilizadores, subscrições e faturação"
        />
        <AdminOverviewPageContent />
      </PageWrapper>
    </Suspense>
  );
}
