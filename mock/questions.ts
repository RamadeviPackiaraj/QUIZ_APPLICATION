import type { Question } from "@/types";

export const questions: Question[] = [
  // Paste all your existing questions array here
  {
    id: "q-001",
    section: "Aptitude",
    type: "Single Choice",
    prompt: "Which React hook is used to memoize a computed value?",
    topic: "React",
    tags: ["hooks", "performance"],
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    options: ["useMemo", "useEffect", "useReducer", "useRef"],
    answer: "useMemo",
    explanation: "useMemo caches the result of an expensive calculation until its dependencies change."
  },
  {
    id: "q-002",
    section: "Reasoning",
    type: "Multiple Choice",
    prompt: "Select the correct sequence checks for solving a reasoning puzzle.",
    topic: "Reasoning",
    tags: ["logic", "sequence"],
    difficulty: "Easy",
    marks: 5,
    negativeMarks: 1,
    options: ["Identify constraints", "Assume all options are equal", "Eliminate contradictions", "Validate final order"],
    answer: ["Identify constraints", "Eliminate contradictions", "Validate final order"],
    explanation: "Reasoning questions need constraint mapping, elimination, and validation."
  },
  {
    id: "q-003",
    section: "Technical",
    type: "Fill Blank",
    prompt: "The React hook used to hold a mutable value without causing re-render is ____.",
    topic: "React",
    tags: ["hooks"],
    difficulty: "Easy",
    marks: 3,
    negativeMarks: 0,
    options: ["useRef", "useState", "useEffect", "useMemo"],
    answer: "useRef",
    explanation: "useRef persists a mutable value across renders without triggering a render."
  },
  {
    id: "q-004",
    section: "Programming",
    type: "Checklist",
    prompt: "Choose the release-readiness checks that should be completed before publishing a quiz.",
    topic: "Assessment Ops",
    tags: ["quality", "publishing"],
    difficulty: "Medium",
    marks: 5,
    negativeMarks: 1,
    options: ["Validate answer keys", "Preview student instructions", "Disable all timers", "Assign target batch"],
    answer: ["Validate answer keys", "Preview student instructions", "Assign target batch"],
    explanation: "Publishing should validate content, instructions, timing, and audience assignment."
  },
  {
    id: "q-005",
    section: "Aptitude",
    type: "Single Choice",
    prompt: "Which accessibility attribute connects an input to its visible label?",
    topic: "Accessibility",
    tags: ["forms", "a11y"],
    difficulty: "Hard",
    marks: 4,
    negativeMarks: 1,
    options: ["htmlFor", "aria-hidden", "role", "tabIndex"],
    answer: "htmlFor",
    explanation: "The label htmlFor attribute references the target input id."
  }
];