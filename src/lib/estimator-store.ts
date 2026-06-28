"use client";

import { create } from "zustand";
import { initialEstimatorConfig } from "./seed-data";
import type { EstimatorConfig } from "./types";

interface EstimatorStore {
  config: EstimatorConfig;
  updateConfig: <Key extends keyof EstimatorConfig>(key: Key, value: EstimatorConfig[Key]) => void;
  toggleListItem: (key: "fileTypes" | "workloads", value: string) => void;
  resetConfig: () => void;
}

export const useEstimatorStore = create<EstimatorStore>((set) => ({
  config: initialEstimatorConfig,
  updateConfig: (key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        [key]: value
      }
    })),
  toggleListItem: (key, value) =>
    set((state) => {
      const current = state.config[key];
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return {
        config: {
          ...state.config,
          [key]: next
        }
      };
    }),
  resetConfig: () => set({ config: initialEstimatorConfig })
}));
