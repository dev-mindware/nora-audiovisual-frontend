import { Suspense } from 'react';
import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Nora Audiovisual',
  description: 'Finalize a subscrição do plano da sua produtora na plataforma Nora Audiovisual.',
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-muted-foreground">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent mb-4" />
          <p className="text-sm font-semibold">A carregar checkout seguro...</p>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
