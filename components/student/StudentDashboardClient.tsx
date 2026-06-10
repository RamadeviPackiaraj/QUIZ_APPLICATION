"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Medal, PlayCircle, Search, Target, Trophy } from "lucide-react";
import type { Quiz, Result } from "@/types";
import { useToast } from "@/components/ui/Toast";

export function StudentDashboardClient({ quizzes, result }: { quizzes: Quiz[]; result: Result }) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id ?? "");
  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId) ?? quizzes[0];
  const filteredQuizzes = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return quizzes;
    return quizzes.filter((quiz) =>
      [quiz.title, quiz.category, quiz.description, quiz.status].some((value) => value.toLowerCase().includes(term))
    );
  }, [query, quizzes]);

  return (
    <div className="grid gap-4">
      <section className="surface rounded-lg p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
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
            Search assigned quizzes
            <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Search size={16} className="text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="React, aptitude, draft..." className="w-full bg-transparent text-sm outline-none" />
            </span>
          </label>
          <Link
            href="/student/quiz"
            className="btn-primary h-11"
            onClick={() => showToast({ tone: "info", title: "Starting quiz", message: selectedQuiz?.title })}
          >
            <PlayCircle size={17} /> Start
          </Link>
        </div>
        {selectedQuiz ? (
          <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-4">
            <span className="font-bold text-slate-900">{selectedQuiz.category}</span>
            <span className="flex items-center gap-2 text-slate-600"><Clock size={15} /> {selectedQuiz.duration} min</span>
            <span className="text-slate-600">{selectedQuiz.passPercentage}% pass</span>
            <span className="text-slate-600">{selectedQuiz.maxMarks} marks</span>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="surface rounded-lg p-4">
          <Target className="text-blue-700" size={18} />
          <p className="mt-3 text-xs font-bold uppercase text-slate-500">Average</p>
          <p className="text-2xl font-black text-slate-900">{result.percentage}%</p>
        </div>
        <div className="surface rounded-lg p-4">
          <Medal className="text-blue-700" size={18} />
          <p className="mt-3 text-xs font-bold uppercase text-slate-500">Rank</p>
          <p className="text-2xl font-black text-slate-900">#{result.rank}</p>
        </div>
        <div className="surface rounded-lg p-4">
          <Trophy className="text-blue-700" size={18} />
          <p className="mt-3 text-xs font-bold uppercase text-slate-500">Accuracy</p>
          <p className="text-2xl font-black text-slate-900">{result.accuracy}%</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {filteredQuizzes.map((quiz) => (
          <article key={quiz.id} className="surface rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">{quiz.category}</span>
              <span className="text-xs font-bold text-slate-500">{quiz.status}</span>
            </div>
            <h2 className="mt-3 text-base font-extrabold text-slate-900">{quiz.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{quiz.description}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-700" style={{ width: `${Math.round((quiz.completed / Math.max(quiz.assigned, 1)) * 100)}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{quiz.duration} min</span>
              <span>{quiz.completed}/{quiz.assigned} done</span>
            </div>
            <Link href="/student/quiz" className="btn-secondary mt-4 w-full" onClick={() => setSelectedQuizId(quiz.id)}>
              <PlayCircle size={16} /> Open
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
