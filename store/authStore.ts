"use client";

import { create } from "zustand";
import type { Role } from "@/types";

type AuthState = {
  role: Role | null;
  name: string;
  email: string;
  isFirstLogin: boolean;
  login: (role: Role, name: string, email?: string, isFirstLogin?: boolean) => void;
  completeFirstLogin: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  name: "",
  email: "",
  isFirstLogin: false,
  login: (role, name, email = "", isFirstLogin = false) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mock-session", JSON.stringify({ role, name, email, isFirstLogin }));
    }
    set({ role, name, email, isFirstLogin });
  },
  completeFirstLogin: () => {
    if (typeof window !== "undefined") {
      const session = JSON.parse(localStorage.getItem("mock-session") || "{}");
      localStorage.setItem("mock-session", JSON.stringify({ ...session, isFirstLogin: false }));
    }
    set({ isFirstLogin: false });
  },
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("mock-session");
    set({ role: null, name: "", email: "", isFirstLogin: false });
  }
}));
