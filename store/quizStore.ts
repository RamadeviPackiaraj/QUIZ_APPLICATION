"use client";

import { create } from "zustand";

type QuizState = {
  answers: Record<string, string | string[]>;
  warnings: number;
  setAnswer: (questionId: string, answer: string | string[]) => void;
  addWarning: () => void;
  reset: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  answers: {},
  warnings: 0,
  setAnswer: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  addWarning: () => set((state) => ({ warnings: state.warnings + 1 })),
  reset: () => set({ answers: {}, warnings: 0 })
}));
