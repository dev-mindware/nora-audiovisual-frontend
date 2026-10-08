import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AdminUsersPageContent } from '@/components/client/admin';

export default function AdminUsersPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Utilizadores" routeLabel="Admin" routePath="/admin">
        <TitleList
          title="Utilizadores"
          suTitle="Lista de utilizadores e acessos da plataforma"
        />
        <AdminUsersPageContent />
      </PageWrapper>
    </Suspense>
  );
}
