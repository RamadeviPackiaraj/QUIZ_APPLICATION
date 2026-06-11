"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Clock,
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Trash2,
} from "lucide-react";

import type { Quiz } from "@/types";
import { useToast } from "@/components/ui/Toast";

type SortKey =
  | "title"
  | "category"
  | "duration"
  | "passPercentage"
  | "assigned"
  | "completed"
  | "startDate"
  | "endDate"
  | "status";
type SortDirection = "asc" | "desc";
type SettingsTab = "Overview" | "Rules" | "Schedule" | "Publishing";

export function QuizManagementClient({ quizzes }: { quizzes: Quiz[] }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<Quiz[]>(quizzes);
  const [query, setQuery] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id ?? "");
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("Overview");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const selectedQuiz = items.find((quiz) => quiz.id === selectedQuizId) ?? items[0];

  const filteredQuizzes = useMemo(() => {
    const term = query.toLowerCase().trim();
    const filtered = term
      ? items.filter((quiz) =>
          [quiz.title, quiz.category, quiz.status, quiz.description].some((value) => value.toLowerCase().includes(term))
        )
      : items;

    return [...filtered].sort((first, second) => {
      const firstValue = first[sortKey];
      const secondValue = second[sortKey];
      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return sortDirection === "asc" ? firstValue - secondValue : secondValue - firstValue;
      }
      return sortDirection === "asc"
        ? String(firstValue).localeCompare(String(secondValue))
        : String(secondValue).localeCompare(String(firstValue));
    });
  }, [items, query, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ChevronsUpDown size={13} />;
    return sortDirection === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const updateSelectedQuiz = (patch: Partial<Quiz>) => {
    if (!selectedQuiz) return;
    setItems((current) => current.map((quiz) => quiz.id === selectedQuiz.id ? { ...quiz, ...patch } : quiz));
  };

  const addQuiz = () => {
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: "New Assessment",
      category: "General",
      description: "Draft assessment ready for setup.",
      duration: 30,
      passPercentage: 70,
      maxMarks: 50,
      status: "draft",
      assigned: 0,
      completed: 0,
      startDate: "2026-06-11",
      endDate: "2026-06-18",
    };
    setItems((current) => [quiz, ...current]);
    setSelectedQuizId(quiz.id);
    setShowEditor(true);
    setActiveTab("Overview");
  };

  const publishSelectedQuiz = () => {
    if (!selectedQuiz) return;
    updateSelectedQuiz({ status: "published" });
    showToast({ tone: "success", title: "Quiz published", message: `${selectedQuiz.title} is ready.` });
  };

  return (
    <div className="grid gap-4">
      <section className="surface-live rounded-2xl p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,1.3fr)_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Assessment
            <select value={selectedQuizId} onChange={(event) => setSelectedQuizId(event.target.value)} className="input-soft h-10 px-3 text-sm">
              {items.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Search assessments
            <span className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Title, category, status..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>

          <button
            className="btn-primary h-10"
            onClick={publishSelectedQuiz}
          >
            <Send size={16} />
            Publish
          </button>
        </div>

        {selectedQuiz ? (
          <div className="mt-3 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-5">
            <span className="font-bold text-slate-900">{selectedQuiz.category}</span>
            <span className="flex items-center gap-2 text-slate-600">
              <Clock size={15} />
              {selectedQuiz.duration} min
            </span>
            <span className="text-slate-600">{selectedQuiz.passPercentage}% pass</span>
            <span className="text-slate-600">{selectedQuiz.maxMarks} marks</span>
            <span className="text-slate-600">{selectedQuiz.startDate} to {selectedQuiz.endDate}</span>
          </div>
        ) : null}
      </section>

      <section className="surface-live rounded-2xl p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-slate-950" />
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Quiz Settings</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowEditor((current) => !current)} className="btn-secondary h-10">
              <Pencil size={16} />
              {showEditor ? "Hide Editor" : "Edit Selected"}
            </button>
            <button type="button" onClick={addQuiz} className="btn-primary h-10">
              <Plus size={16} />
              Add Quiz
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {(["Overview", "Rules", "Schedule", "Publishing"] as SettingsTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                activeTab === tab
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {showEditor && selectedQuiz ? (
          <div className="scale-in">
            {activeTab === "Overview" ? (
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Assessment Name
                  <input value={selectedQuiz.title} onChange={(event) => updateSelectedQuiz({ title: event.target.value })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Quiz Name" />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Category
                  <input value={selectedQuiz.category} onChange={(event) => updateSelectedQuiz({ category: event.target.value })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Category" />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Total Marks
                  <input value={selectedQuiz.maxMarks} onChange={(event) => updateSelectedQuiz({ maxMarks: Number(event.target.value) })} type="number" className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Max marks" />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500 md:col-span-3">
                  Description
                  <textarea value={selectedQuiz.description} onChange={(event) => updateSelectedQuiz({ description: event.target.value })} className="input-soft min-h-16 p-3 text-sm normal-case tracking-normal" placeholder="Description" />
                </label>
              </div>
            ) : null}

            {activeTab === "Rules" ? (
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Duration (minutes)
                  <input value={selectedQuiz.duration} onChange={(event) => updateSelectedQuiz({ duration: Number(event.target.value) })} type="number" className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Duration" />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Passing Score (%)
                  <input value={selectedQuiz.passPercentage} onChange={(event) => updateSelectedQuiz({ passPercentage: Number(event.target.value) })} type="number" className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Passing Score" />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Assigned Candidates
                  <input value={selectedQuiz.assigned} onChange={(event) => updateSelectedQuiz({ assigned: Number(event.target.value) })} type="number" className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Assigned" />
                </label>
              </div>
            ) : null}

            {activeTab === "Schedule" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Start Date
                  <input value={selectedQuiz.startDate} onChange={(event) => updateSelectedQuiz({ startDate: event.target.value })} type="date" className="input-soft h-10 px-3 text-sm normal-case tracking-normal" />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  End Date
                  <input value={selectedQuiz.endDate} onChange={(event) => updateSelectedQuiz({ endDate: event.target.value })} type="date" className="input-soft h-10 px-3 text-sm normal-case tracking-normal" />
                </label>
              </div>
            ) : null}

            {activeTab === "Publishing" ? (
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                  <select value={selectedQuiz.status} onChange={(event) => updateSelectedQuiz({ status: event.target.value as Quiz["status"] })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
                <button type="button" className="btn-primary h-10 self-end" onClick={publishSelectedQuiz}>
                  <Send size={16} />
                  Publish
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
            Select a quiz, then click Edit Selected or Add Quiz.
          </div>
        )}
      </section>

      <section className="surface-live rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Assessments</h2>
          <span className="text-sm font-semibold text-slate-500">{filteredQuizzes.length} shown</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  ["title", "Assessment"],
                  ["category", "Category"],
                  ["duration", "Duration"],
                  ["passPercentage", "Pass"],
                  ["assigned", "Assigned"],
                  ["completed", "Completed"],
                  ["startDate", "Start Date"],
                  ["endDate", "End Date"],
                  ["status", "Status"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button type="button" onClick={() => handleSort(key as SortKey)} className="inline-flex items-center gap-1">
                      {label}
                      {renderSortIcon(key as SortKey)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className={selectedQuizId === quiz.id ? "bg-[#1E3A8A]/5" : "bg-white"}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">{quiz.title}</p>
                    <p className="truncate text-xs text-slate-500">{quiz.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{quiz.category}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.duration} min</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.passPercentage}%</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.assigned}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.completed}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.startDate}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.endDate}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${quiz.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setSelectedQuizId(quiz.id);
                          setShowEditor(true);
                          showToast({ tone: "info", title: "Quiz selected", message: quiz.title });
                        }}
                      >
                        <FileText size={14} />
                        Use
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"
                        onClick={() => setItems((current) => current.filter((item) => item.id !== quiz.id))}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
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
