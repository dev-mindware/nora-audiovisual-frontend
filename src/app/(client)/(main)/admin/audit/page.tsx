import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { AdminAuditPageContent } from '@/components/client/admin';

export default function AdminAuditPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Auditoria" routeLabel="Admin" routePath="/admin">
        <TitleList
          title="Auditoria & Logs"
          suTitle="Trilha imutável de eventos e acessos do sistema"
        />
        <AdminAuditPageContent />
      </PageWrapper>
    </Suspense>
  );
}
