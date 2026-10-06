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

/**
 * A API do Nora não tem módulo de onboarding: preferências e progresso dos tours
 * são conveniências por navegador e ficam apenas em localStorage.
 */
const STORAGE_KEY = "nora-onboarding";

const DEFAULTS: OnboardingPreferencesResponse = {
  preferences: { autoStartEnabled: true, tourButtonEnabled: true },
  tours: {},
};

function read(): OnboardingPreferencesResponse {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw) as Partial<OnboardingPreferencesResponse>;
    return {
      preferences: { ...DEFAULTS.preferences, ...parsed.preferences },
      tours: parsed.tours ?? {},
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function write(value: OnboardingPreferencesResponse) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...value, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // armazenamento indisponível (modo privado): o progresso simplesmente não persiste
  }
}

export const onboardingService = {
  async getPreferences() {
    return read();
  },

  async updatePreferences(payload: UpdateOnboardingPreferencesPayload) {
    const current = read();
    current.preferences = { ...current.preferences, ...payload };
    write(current);
    return current.preferences;
  },

  async updateTour(tourId: OnboardingTourId, payload: UpdateOnboardingTourPayload) {
    const current = read();
    const now = new Date().toISOString();
    const progress: OnboardingTourProgress = {
      ...current.tours[tourId],
      ...payload,
      updatedAt: now,
    };
    current.tours[tourId] = progress;
    write(current);
    return progress;
  },

  async resetTour(tourId: OnboardingTourId) {
    const current = read();
    delete current.tours[tourId];
    write(current);
  },

  async resetAllTours() {
    const current = read();
    current.tours = {};
    write(current);
  },
};
