"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { driver, type DriveStep, type Driver } from "driver.js";
import {
  onboardingTours,
  toDriveStep,
  isOnboardingTourId,
  type OnboardingDriveStep,
  type OnboardingTourId,
  type OnboardingTourMode,
} from "@/constants/onboarding-tours";
import { useAuthStore, useOnboardingPreferencesStore } from "@/stores";
import { useTenantStore } from "@/stores/tenant/tenant-store";
import type { User } from "@/types";
import { useOnboardingPreferencesPersistence } from "./use-onboarding-preferences";

const POLL_INTERVAL_MS = 120;
const STEP_TARGET_TIMEOUT_MS = 2500;
// O popover do driver.js também tem role="dialog"; não conta como diálogo da aplicação.
const DIALOG_SELECTOR = '[role="dialog"]:not(.driver-popover)';

type ActiveTour = {
  driver: Driver;
  result: "completed" | "skipped" | null;
  lastStepIndex: number;
  finish: (status: "completed" | "skipped", lastStepIndex: number) => void;
};

let active: ActiveTour | null = null;
let isTransitioning = false;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Escopo das preferências: organização + utilizador (o mesmo utilizador pode ter várias produtoras). */
function getScope(userId?: string, organizationId?: string) {
  return [organizationId || "organization", userId || "user"].join(":");
}

function isElementVisible(element: Element) {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getClientRects().length > 0
  );
}

function findVisibleElement(selector: string) {
  return (
    Array.from(document.querySelectorAll(selector)).find(isElementVisible) ?? null
  );
}

function waitForElement(selector: string, timeoutMs: number) {
  return new Promise<Element | null>((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const element = findVisibleElement(selector);
      if (element) return resolve(element);
      if (Date.now() - startedAt >= timeoutMs) return resolve(null);
      window.setTimeout(check, POLL_INTERVAL_MS);
    };
    check();
  });
}

function hasOpenDialog() {
  return Array.from(document.querySelectorAll(DIALOG_SELECTOR)).some(isElementVisible);
}

async function closeOpenDialogs() {
  if (!hasOpenDialog()) return;
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  const startedAt = Date.now();
  while (hasOpenDialog() && Date.now() - startedAt < 1500) {
    await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
  }
  // dá tempo à animação de saída do diálogo antes de medir o alvo seguinte
  await new Promise((resolve) => window.setTimeout(resolve, 150));
}

function clickTourTarget(name: string) {
  const element = findVisibleElement(`[data-tour="${name}"]`);
  if (!element) return false;
  (element as HTMLElement).click();
  return true;
}

function stepSelector(step: DriveStep) {
  return (
    (step as OnboardingDriveStep).selector ||
    (typeof step.element === "string" ? step.element : undefined)
  );
}

/**
 * Garante que o alvo do passo está visível: fecha diálogos que o tapam, ou abre o diálogo
 * que o contém (o passo indica o botão, ou herda-o do passo anterior com `open`).
 */
async function prepareTarget(
  steps: DriveStep[],
  index: number,
  timeoutMs = STEP_TARGET_TIMEOUT_MS,
) {
  const step = steps[index] as OnboardingDriveStep;
  const selector = stepSelector(step);
  if (!selector) return null;

  let element = findVisibleElement(selector);

  if (element && !element.closest(DIALOG_SELECTOR) && hasOpenDialog()) {
    await closeOpenDialogs();
    element = findVisibleElement(selector);
  } else if (step.closeDialog) {
    await closeOpenDialogs();
    element = findVisibleElement(selector);
  }

  if (element) return element;

  const opener =
    step.open ??
    [...steps.slice(0, index)]
      .reverse()
      .map((previous) => (previous as OnboardingDriveStep).open)
      .find(Boolean);
  if (opener && !hasOpenDialog()) clickTourTarget(opener);

  return waitForElement(selector, timeoutMs);
}

/** Procura o próximo passo cujo alvo existe; passos sem alvo são saltados para o guia nunca encravar. */
async function moveToPreparedStep(driverInstance: Driver, start: number, direction: 1 | -1) {
  if (isTransitioning) return;
  isTransitioning = true;

  try {
    const steps = driverInstance.getConfig().steps ?? [];
    for (let index = start; index >= 0 && index < steps.length; index += direction) {
      const target = await prepareTarget(steps, index);
      if (target) {
        steps[index].element = target;
        // Dentro de diálogos com scroll interno, centra o alvo para o destaque não ficar cortado.
        target.scrollIntoView({ block: "center", behavior: "instant" });
        driverInstance.moveTo(index);
        return;
      }
    }

    if (direction === 1 && active) {
      active.result = "completed";
      active.lastStepIndex = steps.length - 1;
      driverInstance.destroy();
    }
  } finally {
    isTransitioning = false;
  }
}

export function canUserAccessOnboardingTour(
  tourId: OnboardingTourId,
  user?: User | null,
) {
  const tour = onboardingTours[tourId];
  if (!tour || !user) return false;
  if (user.role === "ADMIN") return true;
  return tour.roles.includes(user.role);
}

/** Escopo (utilizador + organização ativa) partilhado pelo motor e pelas definições. */
export function useOnboardingScope() {
  const user = useAuthStore((state) => state.user);
  const tenantOrganizationId = useTenantStore(
    (state) => state.activeOrganization?.id,
  );
  const organizationId = tenantOrganizationId ?? user?.activeOrganization?.id;
  return { user, organizationId, scope: getScope(user?.id, organizationId) };
}

export function useOnboardingTour(tourId: OnboardingTourId) {
  const { user, organizationId, scope } = useOnboardingScope();
  const canAccessTour = canUserAccessOnboardingTour(tourId, user);
  const { persistTour, isHydrating: isHydratingPreferences } =
    useOnboardingPreferencesPersistence(scope, Boolean(user?.id && organizationId));

  const getPreferences = useOnboardingPreferencesStore((state) => state.getPreferences);
  const markTourCompleted = useOnboardingPreferencesStore((state) => state.markTourCompleted);
  const markTourSkipped = useOnboardingPreferencesStore((state) => state.markTourSkipped);
  const scopedPreferences = useOnboardingPreferencesStore(
    (state) => state.preferencesByScope[scope],
  );
  const autoStartEnabled = scopedPreferences?.autoStartEnabled ?? true;
  const tourButtonEnabled = scopedPreferences?.tourButtonEnabled ?? true;
  const seenStatus = scopedPreferences?.seenTours?.[tourId];

  const hasSeenTour = useCallback(
    () => Boolean(getPreferences(scope).seenTours[tourId]),
    [getPreferences, scope, tourId],
  );

  const markTourAsSeen = useCallback(
    () => markTourCompleted(scope, tourId),
    [markTourCompleted, scope, tourId],
  );

  const startTour = useCallback(
    async (mode: OnboardingTourMode = "normal") => {
      if (typeof window === "undefined") return false;
      if (!canUserAccessOnboardingTour(tourId, user)) return false;

      const tour = onboardingTours[tourId];
      const steps: DriveStep[] = tour.steps.map(toDriveStep);

      // O primeiro passo com alvo disponível define onde o guia começa.
      let firstIndex = 0;
      let firstTarget: Element | null = null;
      for (; firstIndex < steps.length; firstIndex += 1) {
        firstTarget = await prepareTarget(steps, firstIndex, 1500);
        if (firstTarget) break;
      }
      if (!firstTarget) return false;
      steps[firstIndex].element = firstTarget;

      active?.driver.destroy();

      persistTour(tourId, "in_progress", mode, tour.version, firstIndex);

      const finish = (status: "completed" | "skipped", lastStepIndex: number) => {
        if (status === "completed") markTourCompleted(scope, tourId);
        else markTourSkipped(scope, tourId);
        persistTour(tourId, status, mode, tour.version, lastStepIndex);
      };

      const driverInstance = driver({
        steps,
        animate: !prefersReducedMotion(),
        allowClose: true,
        allowKeyboardControl: true,
        disableActiveInteraction: true,
        overlayClickBehavior: () => undefined,
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "mindgest-tour-popover",
        showButtons: ["next", "previous", "close"],
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Seguinte",
        prevBtnText: "Anterior",
        doneBtnText: "Concluir",
        onNextClick: async (_element, _step, { driver: d }) => {
          const total = d.getConfig().steps?.length ?? 0;
          const index = d.getActiveIndex() ?? total - 1;
          if (index >= total - 1) {
            if (active) active.result = "completed";
            d.destroy();
            return;
          }
          await moveToPreparedStep(d, index + 1, 1);
        },
        onPrevClick: async (_element, _step, { driver: d }) => {
          await moveToPreparedStep(d, (d.getActiveIndex() ?? 0) - 1, -1);
        },
        onCloseClick: (_element, _step, { driver: d }) => {
          if (active) active.result = "skipped";
          d.destroy();
        },
        onPopoverRender: (popover) => {
          popover.closeButton.innerText = "Pular";
          popover.closeButton.setAttribute("aria-label", "Ignorar guia");
          // Diálogos Radix fecham em cliques/foco fora de si: o popover do guia vive fora deles.
          for (const type of ["pointerdown", "mousedown", "focusin"]) {
            popover.wrapper.addEventListener(type, (event) => event.stopPropagation());
          }
        },
        onHighlighted: () => {
          if (active) active.lastStepIndex = driverInstance.getActiveIndex() ?? 0;
        },
        onDestroyed: () => {
          const current = active;
          active = null;
          isTransitioning = false;
          if (!current) return;
          // Esc ou fecho por outra via conta como "ignorado": o utilizador pode repetir quando quiser.
          current.finish(current.result ?? "skipped", current.lastStepIndex);
        },
      });

      active = { driver: driverInstance, result: null, lastStepIndex: firstIndex, finish };
      driverInstance.drive(firstIndex);
      return true;
    },
    [markTourCompleted, markTourSkipped, persistTour, scope, tourId, user],
  );

  return {
    startTour,
    hasSeenTour,
    markTourAsSeen,
    canAccessTour,
    autoStartEnabled,
    tourButtonEnabled,
    seenStatus,
    isHydratingPreferences,
  };
}

export function useCanAccessOnboardingTour(tourId: OnboardingTourId) {
  const user = useAuthStore((state) => state.user);
  return canUserAccessOnboardingTour(tourId, user);
}

/** Arranca o guia na primeira visita à página (se o utilizador não os tiver desligado). */
export function useAutoOnboardingTour(tourId: OnboardingTourId, enabled = true) {
  const { startTour, hasSeenTour, isHydratingPreferences, autoStartEnabled, canAccessTour } =
    useOnboardingTour(tourId);
  const autoStartRef = useRef(false);

  useEffect(() => {
    if (
      !enabled ||
      isHydratingPreferences ||
      !autoStartEnabled ||
      !canAccessTour ||
      autoStartRef.current ||
      hasSeenTour()
    ) {
      return;
    }

    let cancelled = false;
    let attempt = 0;
    const timeouts: number[] = [];

    const tryStartTour = () => {
      const timeout = window.setTimeout(
        async () => {
          if (cancelled || autoStartRef.current || hasSeenTour()) return;
          attempt += 1;
          if (await startTour("normal")) {
            autoStartRef.current = true;
            return;
          }
          if (attempt < 4) tryStartTour();
        },
        attempt === 0 ? 900 : 1200,
      );
      timeouts.push(timeout);
    };

    tryStartTour();

    return () => {
      cancelled = true;
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [autoStartEnabled, canAccessTour, enabled, hasSeenTour, isHydratingPreferences, startTour]);
}

/**
 * `?tour=services` inicia o guia pedido mesmo que já tenha sido visto; é o que os atalhos
 * de "Primeiros passos" usam. O parâmetro é removido para um refresh não o repetir.
 */
export function useTourFromQuery(tourId: OnboardingTourId) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { startTour, canAccessTour, isHydratingPreferences } = useOnboardingTour(tourId);
  const requested = searchParams.get("tour");
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (
      !requested ||
      requested !== tourId ||
      !isOnboardingTourId(requested) ||
      !canAccessTour ||
      isHydratingPreferences ||
      handled.current === requested
    ) {
      return;
    }
    handled.current = requested;

    const next = new URLSearchParams(searchParams.toString());
    next.delete("tour");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

    // Sem cleanup: a remoção do parâmetro re-executa este efeito e cancelaria o arranque.
    window.setTimeout(() => void startTour("normal"), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, canAccessTour, isHydratingPreferences]);
}
