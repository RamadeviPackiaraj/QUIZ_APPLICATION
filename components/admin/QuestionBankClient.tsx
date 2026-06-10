"use client";

import { useMemo, useState } from "react";
import { ImagePlus, Plus, Search, Upload } from "lucide-react";
import type { Question, QuestionType } from "@/types";
import { useToast } from "@/components/ui/Toast";

const questionTypes: QuestionType[] = ["Single Choice", "Multiple Choice", "Fill Blank", "True/False", "Checklist"];

export function QuestionBankClient({ questions }: { questions: Question[] }) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<QuestionType>("Single Choice");
  const filteredQuestions = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return questions;
    return questions.filter((question) =>
      [question.prompt, question.topic, question.type, question.section, question.difficulty, question.tags.join(" ")]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [query, questions]);

  return (
    <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <section className="surface rounded-lg p-4">
        <h2 className="text-base font-extrabold text-slate-900">Question Setup</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Question type
            <select value={type} onChange={(event) => setType(event.target.value as QuestionType)} className="input-soft px-3 py-2.5">
              {questionTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <textarea className="input-soft min-h-28 p-3 text-sm" placeholder="Enter question" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input-soft px-3 py-2.5 text-sm" placeholder="Marks" />
            <input className="input-soft px-3 py-2.5 text-sm" placeholder="Negative marks" />
            <input className="input-soft px-3 py-2.5 text-sm" placeholder="Topic" />
            <select className="input-soft px-3 py-2.5 text-sm" defaultValue="Medium">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          {type !== "Fill Blank" ? (
            <div className="grid gap-2">
              {["Option A", "Option B", "Option C", "Option D"].map((option) => (
                <input key={option} className="input-soft px-3 py-2.5 text-sm" placeholder={option} />
              ))}
            </div>
          ) : (
            <input className="input-soft px-3 py-2.5 text-sm" placeholder="Expected answer" />
          )}
          <input className="input-soft px-3 py-2.5 text-sm" placeholder="Correct answer" />
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary"><ImagePlus size={16} /> Image</button>
            <button className="btn-secondary"><Upload size={16} /> CSV</button>
            <button
              className="btn-primary"
              onClick={() => showToast({ tone: "success", title: "Question saved", message: `${type} question added to the bank.` })}
            >
              <Plus size={16} /> Save
            </button>
          </div>
        </div>
      </section>

      <section className="surface rounded-lg p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Bank Preview</h2>
          <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions..." className="w-full bg-transparent text-sm outline-none" />
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {filteredQuestions.map((question) => (
            <article key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">{question.section} / {question.type}</span>
                <span className="text-xs font-semibold text-slate-500">{question.topic} / {question.difficulty}</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{question.prompt}</p>
              <p className="mt-2 text-xs text-slate-500">Marks: {question.marks}, Negative: {question.negativeMarks}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
