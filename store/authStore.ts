"use client";

import { create } from "zustand";
import type { Role } from "@/types";

type AuthState = {
  role: Role | null;
  name: string;
  login: (role: Role, name: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  name: "",
  login: (role, name) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mock-session", JSON.stringify({ role, name }));
    }
    set({ role, name });
  },
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("mock-session");
    set({ role: null, name: "" });
  }
}));
