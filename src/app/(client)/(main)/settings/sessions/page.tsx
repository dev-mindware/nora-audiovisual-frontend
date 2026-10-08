import { Suspense } from 'react';
import { PageWrapper } from '@/components';
import { SessionsPageContent } from '@/components/client/settings/sessions-page-content';

export const metadata = {
  title: 'Sessões Ativas | Nora Audiovisual',
  description: 'Controlo de dispositivos e sessões ativas com autenticação protegida.',
};

export default function SessionsSettingsPage() {
  return (
    <Suspense>
      <PageWrapper
        subRoute="Sessões Ativas"
        routeLabel="Configurações"
        routePath="/settings"
      >
        <SessionsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
