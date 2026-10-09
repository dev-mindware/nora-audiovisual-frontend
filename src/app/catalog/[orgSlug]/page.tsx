import { PublicCatalogPage } from '@/components/public/catalog/public-catalog-page';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const capitalized = orgSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `Catálogo Oficial de Serviços | ${capitalized} - Nora Audiovisual`,
    description: `Consulte os pacotes comerciais e serviços audiovisuais oficiais de ${capitalized}.`,
  };
}

export default async function CatalogPage({ params }: PageProps) {
  const { orgSlug } = await params;
  return <PublicCatalogPage orgSlug={orgSlug} />;
}
