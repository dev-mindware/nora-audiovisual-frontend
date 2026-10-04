import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { CrmPageContent } from '@/components/client';

export default function CrmPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Clientes & CRM" routeLabel="Comercial">
        <TitleList
          title="CRM & Clientes"
          suTitle="Base de clientes, contactos de produção, produtoras parceiras e agências"
        />
        <CrmPageContent />
      </PageWrapper>
    </Suspense>
  );
}
