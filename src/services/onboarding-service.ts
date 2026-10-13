import { api } from "./api";
import type {
  OnboardingTourId,
  OnboardingTourMode,
} from "@/constants/onboarding-tours";
import type { OnboardingTourSeenStatus } from "@/stores/onboarding";

export type OnboardingTourStatus =
  | "in_progress"
  | OnboardingTourSeenStatus;

export type OnboardingTourProgress = {
  status: OnboardingTourStatus;
  mode?: OnboardingTourMode;
  lastStepIndex?: number;
  tourVersion?: number;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  updatedAt?: string;
};

export type OnboardingPreferencesResponse = {
  preferences: {
    autoStartEnabled: boolean;
    tourButtonEnabled: boolean;
  };
  tours: Partial<Record<OnboardingTourId, OnboardingTourProgress>>;
  updatedAt?: string;
};

export type UpdateOnboardingPreferencesPayload = Partial<
  OnboardingPreferencesResponse["preferences"]
>;

export type UpdateOnboardingTourPayload = {
  status: OnboardingTourStatus;
  mode: OnboardingTourMode;
  lastStepIndex?: number;
  tourVersion: number;
};

export type OnboardingChecklistItem = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  href: string;
  tourId?: OnboardingTourId;
  optional?: boolean;
};

export type OnboardingChecklist = {
  items: OnboardingChecklistItem[];
  completed: number;
  total: number;
};

const unwrap = <T>(res: { data: unknown }): T =>
  ((res.data as { data?: T })?.data ?? res.data) as T;

/** Preferências e progresso dos guias vivem na API, por organização e utilizador. */
export const onboardingService = {
  async getPreferences(): Promise<OnboardingPreferencesResponse> {
    return unwrap(await api.get("/onboarding"));
  },

  async updatePreferences(payload: UpdateOnboardingPreferencesPayload) {
    return unwrap<OnboardingPreferencesResponse["preferences"]>(
      await api.patch("/onboarding/preferences", payload),
    );
  },

  async updateTour(tourId: OnboardingTourId, payload: UpdateOnboardingTourPayload) {
    return unwrap<OnboardingTourProgress>(
      await api.put(`/onboarding/tours/${tourId}`, payload),
    );
  },

  async resetTour(tourId: OnboardingTourId) {
    await api.delete(`/onboarding/tours/${tourId}`);
  },

  async resetAllTours() {
    await api.delete("/onboarding/tours");
  },

  async getChecklist(): Promise<OnboardingChecklist> {
    return unwrap(await api.get("/onboarding/checklist"));
  },
};
