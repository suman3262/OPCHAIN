import { create } from "zustand";
import type { Engagement } from "../types";

interface EngagementState {
  engagements: Engagement[];
  activeEngagement: Engagement | null;
  setEngagements: (list: Engagement[]) => void;
  setActive: (eng: Engagement | null) => void;
}

export const useEngagementStore = create<EngagementState>((set) => ({
  engagements: [],
  activeEngagement: null,
  setEngagements: (list) => set({ engagements: list }),
  setActive: (eng) => {
    if (eng) localStorage.setItem("opchain_active_eng", eng.id);
    else localStorage.removeItem("opchain_active_eng");
    set({ activeEngagement: eng });
  },
}));
