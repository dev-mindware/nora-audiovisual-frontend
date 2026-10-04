import { Suspense } from 'react';
import { PageWrapper } from '@/components';
import { SettingsPageContent } from '@/components/client/settings';

export default function SettingsPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Configurações" routeLabel="Administração">
        <SettingsPageContent />
      </PageWrapper>
    </Suspense>
  );
}
