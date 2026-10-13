"use client";

import { useQuery } from "@tanstack/react-query";
import { onboardingService } from "@/services/onboarding-service";
import { useOnboardingScope } from "./use-onboarding-tour";

/** "Primeiros passos" calculados pela API a partir do estado real da produtora. */
export function useOnboardingChecklist(enabled = true) {
  const { user, organizationId } = useOnboardingScope();
  return useQuery({
    queryKey: ["onboarding-checklist", organizationId, user?.id],
    queryFn: onboardingService.getChecklist,
    enabled: enabled && Boolean(user?.id && organizationId),
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
