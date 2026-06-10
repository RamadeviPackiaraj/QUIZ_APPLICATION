"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Clock, FileText, Search, Send, SlidersHorizontal } from "lucide-react";
import type { Quiz } from "@/types";
import { useToast } from "@/components/ui/Toast";

export function QuizManagementClient({ quizzes }: { quizzes: Quiz[] }) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id ?? "");
  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId) ?? quizzes[0];
  const filteredQuizzes = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return quizzes;
    return quizzes.filter((quiz) =>
      [quiz.title, quiz.category, quiz.status, quiz.description].some((value) => value.toLowerCase().includes(term))
    );
  }, [query, quizzes]);

  return (
    <div className="grid gap-4">
      <section className="surface rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,1.3fr)_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Choose quiz
            <select value={selectedQuizId} onChange={(event) => setSelectedQuizId(event.target.value)} className="input-soft px-3 py-2.5">
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Search quizzes
            <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, category, status..." className="w-full bg-transparent text-sm outline-none" />
            </span>
          </label>
          <button
            className="btn-primary h-11"
            onClick={() => showToast({ tone: "success", title: "Quiz published", message: `${selectedQuiz?.title ?? "Selected quiz"} is ready for candidates.` })}
          >
            <Send size={16} /> Publish
          </button>
        </div>
        {selectedQuiz ? (
          <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-4">
            <span className="font-bold text-slate-900">{selectedQuiz.category}</span>
            <span className="flex items-center gap-2 text-slate-600"><Clock size={15} /> {selectedQuiz.duration} min</span>
            <span className="text-slate-600">{selectedQuiz.passPercentage}% pass</span>
            <span className="text-slate-600">{selectedQuiz.maxMarks} marks</span>
          </div>
        ) : null}
      </section>

      <section className="surface rounded-lg p-4">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-blue-700" />
          <h2 className="text-base font-extrabold text-slate-900">Essential Setup</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["Title", "Duration", "Pass percentage"].map((field) => (
            <input key={field} className="input-soft px-3 py-2.5 text-sm" placeholder={field} />
          ))}
          <select className="input-soft px-3 py-2.5 text-sm" defaultValue="">
            <option value="" disabled>Question type</option>
            <option>Single Choice</option>
            <option>Multiple Choice</option>
            <option>Fill Blank</option>
            <option>True/False</option>
            <option>Checklist</option>
          </select>
          <input className="input-soft px-3 py-2.5 text-sm" placeholder="Marks" />
          <input className="input-soft px-3 py-2.5 text-sm" placeholder="Candidate group" />
        </div>
        <textarea className="input-soft mt-3 min-h-20 w-full p-3 text-sm" placeholder="Candidate instructions" />
        <div className="mt-3 flex flex-wrap gap-2">
          {["Shuffle questions", "Auto submit", "Show result"].map((setting) => (
            <label key={setting} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
              <input type="checkbox" className="accent-blue-800" defaultChecked />
              {setting}
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <article key={quiz.id} className="surface rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">{quiz.status}</span>
              <span className="text-xs font-bold text-slate-500">{quiz.category}</span>
            </div>
            <h2 className="mt-3 text-base font-extrabold text-slate-900">{quiz.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{quiz.description}</p>
            <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
              <span>{quiz.duration} min · {quiz.passPercentage}% pass · {quiz.assigned} assigned</span>
              <span className="flex items-center gap-2"><CalendarClock size={14} /> {quiz.startDate} to {quiz.endDate}</span>
            </div>
            <button
              className="btn-secondary mt-4 w-full"
              onClick={() => {
                setSelectedQuizId(quiz.id);
                showToast({ tone: "info", title: "Quiz selected", message: quiz.title });
              }}
            >
              <FileText size={16} /> Use quiz
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
