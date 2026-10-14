"use client";

import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import {
  abortActiveTour,
  useAutoOnboardingTour,
  useOnboardingTour,
  useTourFromQuery,
} from "@/hooks/onboarding/use-onboarding-tour";
import type { OnboardingTourId } from "@/constants/onboarding-tours";
import { useSearchParams } from "next/navigation";

type OnboardingTourButtonProps = {
  tourId: OnboardingTourId;
  autoStart?: boolean;
  className?: string;
};

export function OnboardingTourButton({
  tourId,
  autoStart = true,
  className,
}: OnboardingTourButtonProps) {
  const { startTour, canAccessTour, tourButtonEnabled } = useOnboardingTour(tourId);
  const requestedByLink = Boolean(useSearchParams().get("tour"));

  // `?tour=<id>` (atalhos de "Primeiros passos") tem prioridade sobre o arranque automático.
  useAutoOnboardingTour(tourId, autoStart && !requestedByLink);
  useTourFromQuery(tourId);

  // Sair da página a meio de um guia não o conta como ignorado.
  useEffect(() => () => abortActiveTour(), []);

  if (!canAccessTour || !tourButtonEnabled) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 border-primary/20 bg-background/80 text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5",
            className,
          )}
          onClick={() => void startTour("normal")}
        >
          <Icon name="CircleHelp" className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Ver guia</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Ver guia deste fluxo</p>
      </TooltipContent>
    </Tooltip>
  );
}
