import { create } from "zustand";
import type { Operator } from "../types";

interface AuthState {
  token: string | null;
  operator: Operator | null;
  setAuth: (token: string, operator: Operator) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("opchain_token"),
  operator: null,
  setAuth: (token, operator) => {
    localStorage.setItem("opchain_token", token);
    set({ token, operator });
  },
  logout: () => {
    localStorage.removeItem("opchain_token");
    set({ token: null, operator: null });
  },
}));
