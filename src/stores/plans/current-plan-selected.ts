import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Plan } from "@/types";

interface PlanStore {
  currentPlanSelected: Plan | null;
  selectedCycle: "MONTHLY" | "ANNUAL";
  setCurrentPlanSelected: (plan: Plan | null) => void;
  setSelectedCycle: (cycle: "MONTHLY" | "ANNUAL") => void;
}

export const useCurrentPlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      currentPlanSelected: null,
      selectedCycle: "MONTHLY",
      setCurrentPlanSelected: (plan) => set({ currentPlanSelected: plan }),
      setSelectedCycle: (cycle) => set({ selectedCycle: cycle }),
    }),
    {
      name: "NORA-PLAN-STORE",
    },
  ),
);
