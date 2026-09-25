import { Suspense } from "react";
import { PageWrapper } from "@/components";
import { NoraHomePageContent } from "@/components/client/nora";

export default function HomePage() {
  return (
    <Suspense>
      <PageWrapper subRoute="Visão Geral">
        <NoraHomePageContent />
      </PageWrapper>
    </Suspense>
  );
}
