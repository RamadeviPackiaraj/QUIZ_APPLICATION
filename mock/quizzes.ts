import type { Quiz } from "@/types";

export const quizzes: Quiz[] = [
  // Paste all your existing quizzes array here
   { id: "quiz-001", title: "Frontend Architecture Assessment", category: "React", description: "Hooks, state, rendering, accessibility, and performance.", duration: 45, passPercentage: 70, maxMarks: 80, status: "published", assigned: 86, completed: 71, startDate: "2026-06-01", endDate: "2026-06-12" },
  { id: "quiz-002", title: "Aptitude & Reasoning Sprint", category: "Placement", description: "Quantitative aptitude, logic, interpretation, and speed practice.", duration: 50, passPercentage: 72, maxMarks: 100, status: "published", assigned: 64, completed: 39, startDate: "2026-06-05", endDate: "2026-06-18" },
  { id: "quiz-003", title: "MongoDB Data Modeling", category: "Database", description: "Schemas, indexes, aggregation, and document design.", duration: 35, passPercentage: 65, maxMarks: 60, status: "draft", assigned: 0, completed: 0, startDate: "2026-06-15", endDate: "2026-06-22" }
];