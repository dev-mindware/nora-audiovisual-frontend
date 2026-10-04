import { Suspense } from 'react';
import { PageWrapper, TitleList } from '@/components';
import { EquipmentPageContent } from '@/components/client';

export default function EquipmentPage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Equipamentos" routeLabel="Produção">
        <TitleList
          title="Equipamentos & Parque Técnico"
          suTitle="Controlo de câmaras, óticas, kits de iluminação, reservas e check-out"
        />
        <EquipmentPageContent />
      </PageWrapper>
    </Suspense>
  );
}
