export type Role = "admin" | "student";
export type Status = "active" | "inactive" | "draft" | "published" | "completed" | "pending";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "Single Choice" | "Multiple Choice" | "Fill Blank" | "True/False" | "Checklist";

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  status: "active" | "inactive";
  batch: string;
  averageScore: number;
  completed: number;
};

export type Question = {
  id: string;
  section: "Aptitude" | "Reasoning" | "Technical" | "Programming";
  type: QuestionType;
  prompt: string;
  topic: string;
  tags: string[];
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
  options: string[];
  answer: string | string[];
  explanation: string;
};

export type Quiz = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: number;
  passPercentage: number;
  maxMarks: number;
  status: "draft" | "published";
  assigned: number;
  completed: number;
  startDate: string;
  endDate: string;
};

export type Result = {
  id: string;
  studentName: string;
  quizTitle: string;
  score: number;
  percentage: number;
  rank: number;
  status: "Pass" | "Fail";
  accuracy: number;
  timeTaken: string;
};

export type Activity = {
  id: string;
  time: string;
  actor: string;
  action: string;
  severity: "info" | "warning" | "success";
};

export type AnalyticsPoint = {
  label: string;
  completed: number;
  pending?: number;
  score?: number;
};
