import { Suspense } from 'react';
import { PageWrapper } from '@/components';
import { TeamPageContent } from '@/components/client/settings/team-page-content';

export const metadata = {
  title: 'Equipa & Membros | Nora Audiovisual',
  description: 'Gestão de equipa, convites e permissões de acesso da organização.',
};

export default function TeamSettingsPage() {
  return (
    <Suspense>
      <PageWrapper
        subRoute="Equipa & Colaboradores"
        routeLabel="Configurações"
        routePath="/settings"
      >
        <TeamPageContent />
      </PageWrapper>
    </Suspense>
  );
}
