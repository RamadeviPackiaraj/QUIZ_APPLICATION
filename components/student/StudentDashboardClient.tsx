"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Medal,
  PlayCircle,
  Search,
  Target,
  Trophy,
} from "lucide-react";

import type { Quiz, Result } from "@/types";
import { useToast } from "@/components/ui/Toast";

async function requestFullscreen() {
  if (typeof document === "undefined" || document.fullscreenElement) return;
  await document.documentElement.requestFullscreen?.();
}

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

  const startQuiz = () => {
    requestFullscreen().catch(() => undefined);
    showToast({ tone: "info", title: "Entering assessment", message: selectedQuiz?.title });
  };

  return (
    <div className="grid gap-4">
      <section className="surface-live rounded-2xl p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} />
              Approved Candidate
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">Enter Application</h2>
            <p className="mt-1 text-sm text-slate-500">{selectedQuiz?.title}</p>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-4">
              <span className="flex items-center gap-2"><Clock size={15} /> {selectedQuiz?.duration} min</span>
              <span className="flex items-center gap-2"><CalendarClock size={15} /> {selectedQuiz?.startDate}</span>
              <span>{selectedQuiz?.endDate}</span>
              <span>{selectedQuiz?.passPercentage}% pass</span>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Select Assessment
              <select value={selectedQuizId} onChange={(event) => setSelectedQuizId(event.target.value)} className="input-soft h-10 px-3 text-sm normal-case tracking-normal">
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </label>
            <Link href="/student/quiz" className="btn-primary h-10 w-full" onClick={startQuiz}>
              <PlayCircle size={16} />
              Enter Quiz
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["Previous Score", `${result.percentage}%`, Target],
          ["Rank", `#${result.rank}`, Medal],
          ["Accuracy", `${result.accuracy}%`, Trophy],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="surface-live rounded-2xl p-4">
            <Icon className="text-slate-950" size={18} />
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label as string}</p>
            <p className="text-2xl font-black text-slate-950">{value as string}</p>
          </div>
        ))}
      </section>

      <section className="surface-live rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Assigned Quizzes</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredQuizzes.length} assessments available</p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-80">
            <Search size={16} className="text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assigned quizzes"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Assessment", "Category", "Duration", "Schedule", "Pass", "Status", "Action"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className={selectedQuizId === quiz.id ? "bg-slate-50" : "bg-white"}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{quiz.title}</p>
                    <p className="truncate text-xs text-slate-500">{quiz.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{quiz.category}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.duration} min</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.startDate} to {quiz.endDate}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.passPercentage}%</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${quiz.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href="/student/quiz" onClick={startQuiz} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                      <PlayCircle size={14} />
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
