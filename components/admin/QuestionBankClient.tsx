"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, ChevronsUpDown, FileUp, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";

import type { Difficulty, Question, QuestionType } from "@/types";
import { useToast } from "@/components/ui/Toast";

const questionTypes: QuestionType[] = ["Single Choice", "Multiple Choice", "Fill Blank", "True/False", "Checklist"];
const sections: Question["section"][] = ["Aptitude", "Reasoning", "Technical", "Programming"];
const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
type QuestionSortKey = "section" | "type" | "topic" | "difficulty" | "marks";
type SessionSortKey = "name" | "count" | "status";
type SortDirection = "asc" | "desc";

const blankQuestion = {
  session: "",
  section: "Aptitude" as Question["section"],
  questionCount: 10,
  type: "Single Choice" as QuestionType,
  prompt: "",
  topic: "",
  difficulty: "Medium" as Difficulty,
  marks: 4,
  negativeMarks: 1,
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
};

export function QuestionBankClient({ questions }: { questions: Question[] }) {
  const { showToast } = useToast();
  const initialSessions = Array.from(new Set(questions.map((question) => question.tags[0] ?? question.topic))).filter(Boolean);
  const [items, setItems] = useState<Question[]>(questions);
  const [sessions, setSessions] = useState<string[]>(initialSessions.length ? initialSessions : ["Default Session"]);
  const [activeSession, setActiveSession] = useState(initialSessions[0] ?? "Default Session");
  const [newSession, setNewSession] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"manual" | "csv" | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvRows, setCsvRows] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionSortKey, setQuestionSortKey] = useState<QuestionSortKey>("section");
  const [questionSortDirection, setQuestionSortDirection] = useState<SortDirection>("asc");
  const [sessionSortKey, setSessionSortKey] = useState<SessionSortKey>("name");
  const [sessionSortDirection, setSessionSortDirection] = useState<SortDirection>("asc");
  const [form, setForm] = useState(blankQuestion);

  const sessionRows = useMemo(() => {
    return sessions
      .map((session) => {
        const count = items.filter((question) => (question.tags[0] ?? question.topic) === session).length;
        return {
          name: session,
          count,
          status: count > 0 ? "Ready" : "Draft",
        };
      })
      .sort((first, second) => {
        const firstValue = first[sessionSortKey];
        const secondValue = second[sessionSortKey];
        if (typeof firstValue === "number" && typeof secondValue === "number") {
          return sessionSortDirection === "asc" ? firstValue - secondValue : secondValue - firstValue;
        }
        return sessionSortDirection === "asc"
          ? String(firstValue).localeCompare(String(secondValue))
          : String(secondValue).localeCompare(String(firstValue));
      });
  }, [items, sessionSortDirection, sessionSortKey, sessions]);

  const filteredQuestions = useMemo(() => {
    const term = query.toLowerCase().trim();
    const scoped = items.filter((question) => (question.tags[0] ?? question.topic) === activeSession);
    const filtered = term
      ? scoped.filter((question) =>
          [question.prompt, question.topic, question.type, question.section, question.difficulty, question.tags.join(" ")]
            .some((value) => value.toLowerCase().includes(term))
        )
      : scoped;

    return [...filtered].sort((first, second) => {
      const firstValue = first[questionSortKey];
      const secondValue = second[questionSortKey];
      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return questionSortDirection === "asc" ? firstValue - secondValue : secondValue - firstValue;
      }
      return questionSortDirection === "asc"
        ? String(firstValue).localeCompare(String(secondValue))
        : String(secondValue).localeCompare(String(firstValue));
    });
  }, [activeSession, query, items, questionSortDirection, questionSortKey]);

  const renderQuestionSortIcon = (key: QuestionSortKey) => {
    if (questionSortKey !== key) return <ChevronsUpDown size={13} />;
    return questionSortDirection === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const renderSessionSortIcon = (key: SessionSortKey) => {
    if (sessionSortKey !== key) return <ChevronsUpDown size={13} />;
    return sessionSortDirection === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const handleQuestionSort = (key: QuestionSortKey) => {
    if (questionSortKey === key) {
      setQuestionSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setQuestionSortKey(key);
    setQuestionSortDirection("asc");
  };

  const handleSessionSort = (key: SessionSortKey) => {
    if (sessionSortKey === key) {
      setSessionSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSessionSortKey(key);
    setSessionSortDirection("asc");
  };

  const handleCsvFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setMode("csv");
    setCsvFileName(file.name);
    setCsvRows(Math.max(text.split(/\r?\n/).filter(Boolean).length - 1, 0));
    showToast({ tone: "success", title: "CSV loaded", message: file.name });
  };

  const setOption = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? value : option),
    }));
  };

  const resetForm = () => {
    setForm({ ...blankQuestion, session: activeSession });
    setEditingId(null);
  };

  const addSession = () => {
    const name = newSession.trim();
    if (!name) return;
    setSessions((current) => current.includes(name) ? current : [...current, name]);
    setActiveSession(name);
    setForm((current) => ({ ...current, session: name }));
    setNewSession("");
  };

  const saveQuestion = () => {
    if (!form.session.trim() || !form.prompt.trim() || !form.answer.trim()) {
      showToast({ tone: "info", title: "Missing fields", message: "Session, question, and answer are required." });
      return;
    }

    const options =
      form.type === "Fill Blank"
        ? []
        : form.type === "True/False"
        ? ["True", "False"]
        : form.options.filter(Boolean);

    const nextQuestion: Question = {
      id: editingId ?? `q-${Date.now()}`,
      section: form.section,
      type: form.type,
      prompt: form.prompt,
      topic: form.topic || form.session,
      tags: [form.session, form.section].filter(Boolean),
      difficulty: form.difficulty,
      marks: Number(form.marks) || 1,
      negativeMarks: Number(form.negativeMarks) || 0,
      options,
      answer: form.type === "Multiple Choice" || form.type === "Checklist"
        ? form.answer.split(",").map((answer) => answer.trim()).filter(Boolean)
        : form.answer,
      explanation: form.explanation,
    };

    setItems((current) =>
      editingId
        ? current.map((question) => question.id === editingId ? nextQuestion : question)
        : [nextQuestion, ...current]
    );
    setSessions((current) => current.includes(form.session) ? current : [...current, form.session]);
    setActiveSession(form.session);
    showToast({ tone: "success", title: editingId ? "Question updated" : "Question saved", message: `${form.section} / ${form.type}` });
    resetForm();
    setMode(null);
  };

  const editQuestion = (question: Question) => {
    setForm({
      session: question.tags[0] ?? question.topic,
      section: question.section,
      questionCount: 1,
      type: question.type,
      prompt: question.prompt,
      topic: question.topic,
      difficulty: question.difficulty,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      options: [...question.options, "", "", "", ""].slice(0, 4),
      answer: Array.isArray(question.answer) ? question.answer.join(", ") : question.answer,
      explanation: question.explanation,
    });
    setEditingId(question.id);
    setMode("manual");
  };

  return (
    <div className="grid gap-4">
      <section className="surface-live rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Assessment", "Question Bank"],
            ["Session", activeSession],
            ["Questions", filteredQuestions.length.toString()],
            ["Status", filteredQuestions.length > 0 ? "Ready" : "Draft"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-live rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Sessions</h2>
            <p className="mt-1 text-sm text-slate-500">Assessment sessions, counts, and current status.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newSession}
              onChange={(event) => setNewSession(event.target.value)}
              placeholder="New session name"
              className="input-soft h-10 px-3 text-sm sm:w-64"
            />
            <button type="button" onClick={addSession} className="btn-primary h-10">
              <Plus size={16} />
              Add Session
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  ["name", "Session Name"],
                  ["count", "Question Count"],
                  ["status", "Status"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button type="button" onClick={() => handleSessionSort(key as SessionSortKey)} className="inline-flex items-center gap-1">
                      {label}
                      {renderSessionSortIcon(key as SessionSortKey)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessionRows.map((session) => (
                <tr key={session.name} className={activeSession === session.name ? "bg-[#1E3A8A]/5" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{session.name}</td>
                  <td className="px-4 py-3 text-slate-600">{session.count}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${session.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSession(session.name);
                        setForm((current) => ({ ...current, session: session.name }));
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-live overflow-hidden rounded-2xl">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Question Entry</h2>
            <p className="mt-1 text-sm text-slate-500">{activeSession} / choose section, type, marks.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label
              className={`flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${
                mode === "csv"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-[#1E3A8A]"
              }`}
            >
              <FileUp size={17} />
              External CSV
              <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={() => {
                if (mode !== "manual") resetForm();
                setMode(mode === "manual" ? null : "manual");
              }}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${
                mode === "manual"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-[#1E3A8A]"
              }`}
            >
              <Plus size={17} />
              Manual
            </button>
          </div>
        </div>

        {mode === "manual" ? (
          <div className="scale-in border-t border-slate-100 bg-slate-50/70 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Session
                <select value={form.session || activeSession} onChange={(event) => setForm({ ...form, session: event.target.value })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal">
                  {sessions.map((session) => (
                    <option key={session}>{session}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Section
                <select value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value as Question["section"] })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal">
                  {sections.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Question Type
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as QuestionType })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal">
                  {questionTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                No. of Questions
                <input value={form.questionCount} onChange={(event) => setForm({ ...form, questionCount: Number(event.target.value) })} type="number" min={1} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="No. of questions" />
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Topic
                <input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Topic" />
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Difficulty
                <select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal">
                  {difficulties.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Marks
                <input value={form.marks} onChange={(event) => setForm({ ...form, marks: Number(event.target.value) })} type="number" min={1} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Marks" />
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Negative Marks
                <input value={form.negativeMarks} onChange={(event) => setForm({ ...form, negativeMarks: Number(event.target.value) })} type="number" min={0} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Negative marks" />
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500 md:col-span-4">
                Question
                <textarea value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} className="input-soft min-h-24 p-3 text-sm normal-case tracking-normal" placeholder={form.type === "Fill Blank" ? "Question with blank, e.g. React uses ____ for state." : "Question"} />
              </label>
            </div>

            {form.type !== "Fill Blank" ? (
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                {(form.type === "True/False" ? ["True", "False"] : ["Option A", "Option B", "Option C", "Option D"]).map((option, index) => (
                  <label key={option} className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {option}
                    <input value={form.type === "True/False" ? option : form.options[index]} onChange={(event) => setOption(index, event.target.value)} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder={option} readOnly={form.type === "True/False"} />
                  </label>
                ))}
              </div>
            ) : null}

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Correct Answer
                <input value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder={form.type === "Multiple Choice" || form.type === "Checklist" ? "Correct answers, comma separated" : "Correct answer"} />
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Explanation
                <input value={form.explanation} onChange={(event) => setForm({ ...form, explanation: event.target.value })} className="input-soft h-10 px-3 text-sm normal-case tracking-normal" placeholder="Explanation" />
              </label>
            </div>
            <button
              className="btn-primary mt-4 min-h-0 py-2.5"
              onClick={saveQuestion}
            >
              <Save size={16} />
              {editingId ? "Update Question" : "Save Question"}
            </button>
            <button type="button" onClick={() => { resetForm(); setMode(null); }} className="btn-secondary ml-2 mt-4 min-h-0 px-3 py-2.5">
              <X size={16} />
            </button>
          </div>
        ) : null}

        {csvFileName ? (
          <div className="scale-in border-t border-slate-100 p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 font-bold text-slate-950">
                <CheckCircle2 size={17} className="text-emerald-600" />
                {csvFileName}
              </p>
              <p className="mt-1 text-sm text-slate-500">{csvRows} question rows detected.</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="surface-live rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Question Bank</h2>
            <p className="mt-1 text-sm text-slate-500">{activeSession} session</p>
          </div>
          <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search size={16} className="text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions"
              className="w-full bg-transparent text-sm outline-none"
            />
          </span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  ["section", "Section"],
                  ["type", "Type"],
                  ["topic", "Topic"],
                  ["difficulty", "Difficulty"],
                  ["marks", "Marks"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button type="button" onClick={() => handleQuestionSort(key as QuestionSortKey)} className="inline-flex items-center gap-1">
                      {label}
                      {renderQuestionSortIcon(key as QuestionSortKey)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Question</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="bg-white transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-[#1E3A8A]">{question.section}</td>
                  <td className="px-4 py-3 text-slate-700">{question.type}</td>
                  <td className="px-4 py-3 text-slate-600">{question.topic}</td>
                  <td className="px-4 py-3 text-slate-600">{question.difficulty}</td>
                  <td className="px-4 py-3 font-semibold text-slate-950">{question.marks}</td>
                  <td className="max-w-[360px] px-4 py-3 text-slate-700">
                    <p className="truncate font-medium">{question.prompt}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${question.answer ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {question.answer ? "Ready" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editQuestion(question)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button onClick={() => setItems((current) => current.filter((item) => item.id !== question.id))} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50">
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
