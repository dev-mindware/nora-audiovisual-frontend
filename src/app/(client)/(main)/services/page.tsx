import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { ServicesPageContent } from '@/components/client';

export default function ServicesPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Serviços" routeLabel="Comercial">
        <TitleList
          title="Catálogo de Serviços"
          suTitle="Pacotes padronizados, propostas automáticas e serviços disponíveis para solicitação no Portal"
        />
        <ServicesPageContent />
      </PageWrapper>
    </Suspense>
  );
}
