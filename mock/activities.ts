import type { Activity } from "@/types";

export const activities: Activity[] = [
  {
    id: "act-001",
    time: "11:40 AM",
    actor: "Mira Iyer",
    action: "Completed Frontend Architecture Assessment",
    severity: "success",
  },
  {
    id: "act-002",
    time: "11:18 AM",
    actor: "Security Monitor",
    action: "Window blur warning recorded for student003",
    severity: "warning",
  },
  {
    id: "act-003",
    time: "10:52 AM",
    actor: "Admin",
    action: "Imported 24 students from CSV preview",
    severity: "info",
  },
  {
    id: "act-004",
    time: "10:20 AM",
    actor: "Admin",
    action: "Published Aptitude & Reasoning Sprint",
    severity: "success",
  },
];