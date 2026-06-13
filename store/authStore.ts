"use client";

import { create } from "zustand";
import type { Role } from "@/types";

type AuthState = {
  role: Role | null;
  name: string;
  email: string;
  isFirstLogin: boolean;
  token: string | null;
  userId: string | null;
  login: (role: Role, name: string, email?: string, isFirstLogin?: boolean, token?: string, userId?: string) => void;
  completeFirstLogin: () => void;
  logout: () => void;
  getToken: () => string | null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  role: null,
  name: "",
  email: "",
  isFirstLogin: false,
  token: null,
  userId: null,
  login: (role, name, email = "", isFirstLogin = false, token = "", userId = "") => {
    if (typeof window !== "undefined") {
      const sessionData = { role, name, email, isFirstLogin, token, userId };
      localStorage.setItem("auth-session", JSON.stringify(sessionData));
      if (token) {
        localStorage.setItem("auth-token", token);
      }
    }
    set({ role, name, email, isFirstLogin, token, userId });
  },
  completeFirstLogin: () => {
    if (typeof window !== "undefined") {
      const session = JSON.parse(localStorage.getItem("auth-session") || "{}");
      session.isFirstLogin = false;
      localStorage.setItem("auth-session", JSON.stringify(session));
    }
    set({ isFirstLogin: false });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-session");
      localStorage.removeItem("auth-token");
    }
    set({ role: null, name: "", email: "", isFirstLogin: false, token: null, userId: null });
  },
  getToken: () => {
    const state = get();
    if (state.token) return state.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth-token");
    }
    return null;
  }
}));
