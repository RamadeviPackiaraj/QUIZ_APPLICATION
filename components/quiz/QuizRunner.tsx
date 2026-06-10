"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Flag, Maximize2, ShieldCheck, TimerReset } from "lucide-react";
import type { Question, Quiz } from "@/types";
import { useQuizStore } from "@/store/quizStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type PaletteStatus = "notVisited" | "visited" | "answered" | "review" | "answeredReview" | "completed";

const sectionMeta = {
  Aptitude: "Mixed questions",
  Reasoning: "Logic set",
  Technical: "Core skills",
  Programming: "Applied tasks"
};

const paletteStyles: Record<PaletteStatus, string> = {
  notVisited: "bg-[#E5E7EB] text-[#374151]",
  visited: "bg-[#2563EB] text-white",
  answered: "bg-[#22C55E] text-white",
  review: "bg-[#F59E0B] text-white",
  answeredReview: "bg-[#8B5CF6] text-white",
  completed: "bg-[#166534] text-white"
};

function TopTimer({ label, value, percent, warning = false }: { label: string; value: string; percent: number; warning?: boolean }) {
  return (
    <div className="min-w-[150px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><TimerReset size={14} /> {label}</span>
        <span className={warning ? "text-amber-700" : "text-slate-900"}>{value}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200">
        <div className={cn("h-1.5 rounded-full", warning ? "bg-amber-500" : "bg-blue-700")} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function QuizRunner({ quiz, questions }: { quiz: Quiz; questions: Question[] }) {
  const { showToast } = useToast();
  const [active, setActive] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [visited, setVisited] = useState<Record<string, boolean>>({ [questions[0]?.id]: true });
  const [review, setReview] = useState<Record<string, boolean>>({});
  const { answers, setAnswer, warnings, addWarning } = useQuizStore();
  const question = questions[active];

  const sections = useMemo(() => Object.keys(sectionMeta) as Question["section"][], []);
  const activeSection = question.section;
  const sectionQuestions = questions.filter((item) => item.section === activeSection);

  useEffect(() => {
    setVisited((state) => ({ ...state, [question.id]: true }));
  }, [question.id]);

  useEffect(() => {
    const warn = () => {
      addWarning();
      showToast({ tone: "info", title: "Security warning recorded", message: "Stay on the test screen while attempting the quiz." });
      if (warnings + 1 >= 3) setSubmitted(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const blocked = event.key === "F12" || (event.ctrlKey && ["c", "v", "a", "u", "s", "p"].includes(event.key.toLowerCase()));
      if (blocked) {
        event.preventDefault();
        warn();
      }
    };
    const onContext = (event: MouseEvent) => {
      event.preventDefault();
      warn();
    };
    const onBlur = () => warn();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("contextmenu", onContext);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("contextmenu", onContext);
      window.removeEventListener("blur", onBlur);
    };
  }, [addWarning, showToast, warnings]);

  const getStatus = (item: Question): PaletteStatus => {
    const hasAnswer = Boolean(answers[item.id]);
    const isReview = Boolean(review[item.id]);
    if (hasAnswer && isReview) return "answeredReview";
    if (hasAnswer) return "answered";
    if (isReview) return "review";
    if (visited[item.id]) return "visited";
    return "notVisited";
  };

  const sectionStats = (section: Question["section"]) => {
    const items = questions.filter((item) => item.section === section);
    return {
      total: items.length,
      answered: items.filter((item) => answers[item.id]).length,
      pending: items.filter((item) => !answers[item.id]).length,
      review: items.filter((item) => review[item.id]).length
    };
  };

  if (submitted) {
    return (
      <section className="surface rounded-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-[#22C55E]" size={52} />
        <h2 className="mt-4 text-2xl font-extrabold text-[#111827]">Quiz submitted</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748B]">Your attempt has been submitted. Your scorecard is ready to review.</p>
      </section>
    );
  }

  return (
    <section className="no-select grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_280px]">
      <div className="surface sticky top-20 z-20 rounded-lg p-3 xl:col-span-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-blue-700">Candidate quiz</p>
            <h2 className="text-lg font-black text-slate-900">{quiz.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <TopTimer label="Overall" value="32:18" percent={72} />
            <TopTimer label="Question" value="01:48" percent={22} warning />
          </div>
        </div>
      </div>
      <aside className="surface rounded-2xl p-4">
        <p className="text-sm font-extrabold text-[#111827]">Sections</p>
        <div className="mt-4 grid gap-3">
          {sections.map((section) => {
            const stats = sectionStats(section);
            const firstIndex = questions.findIndex((item) => item.section === section);
            return (
              <button key={section} onClick={() => setActive(firstIndex)} className={cn("rounded-xl border p-3 text-left transition", section === activeSection ? "border-[#1E3A8A] bg-[#DBEAFE]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EFF6FF]")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-[#172554]">{section}</span>
                  <span className="text-xs font-bold text-[#3B82F6]">{sectionMeta[section]}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px] font-bold text-[#64748B]">
                  <span>{stats.total} Total</span>
                  <span>{stats.answered} Ans</span>
                  <span>{stats.pending} Pend</span>
                  <span>{stats.review} Rev</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <article className="surface rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <p className="text-sm font-bold text-[#3B82F6]">{activeSection}</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#111827]">{activeSection} - Question {active + 1}</h2>
          </div>
          <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold text-[#1E3A8A]">{question.difficulty} / {question.marks} marks</span>
        </div>
        <p className="mt-6 text-lg font-semibold leading-8 text-[#111827]">{question.prompt}</p>
        <div className="mt-6 grid gap-3">
          {question.options.map((option) => {
            const current = answers[question.id];
            const checked = Array.isArray(current) ? current.includes(option) : current === option;
            return (
              <label key={option} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition", checked ? "border-[#1E3A8A] bg-[#DBEAFE] text-[#172554]" : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#3B82F6]")}>
                <input
                  type={question.type === "Multiple Choice" || question.type === "Checklist" ? "checkbox" : "radio"}
                  name={question.id}
                  checked={checked}
                  onChange={() => {
                    if (question.type === "Multiple Choice" || question.type === "Checklist") {
                      const list = Array.isArray(current) ? current : [];
                      setAnswer(question.id, checked ? list.filter((item) => item !== option) : [...list, option]);
                    } else {
                      setAnswer(question.id, option);
                    }
                  }}
                  className="h-4 w-4 accent-[#1E3A8A]"
                />
                {option}
              </label>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button onClick={() => setActive(Math.max(active - 1, 0))} className="btn-secondary">Previous</button>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setReview((state) => ({ ...state, [question.id]: !state[question.id] }));
                showToast({ tone: "info", title: "Review flag updated", message: `Question ${active + 1} is marked for review.` });
              }}
              className="btn-secondary"
            >
              <Flag size={16} /> Mark review
            </button>
            <button
              onClick={() => {
                if (active === questions.length - 1) {
                  setSubmitted(true);
                  showToast({ tone: "success", title: "Quiz submitted", message: "Your attempt is ready for review." });
                  return;
                }
                setActive(active + 1);
                showToast({ tone: "success", title: "Answer saved", message: `Moved to question ${active + 2}.` });
              }}
              className="btn-primary"
            >
              {active === questions.length - 1 ? "Submit" : "Save & Next"}
            </button>
          </div>
        </div>
      </article>

      <aside className="grid gap-4">
        <div className="surface rounded-2xl p-4">
          <p className="text-sm font-extrabold text-[#111827]">Question Palette</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((item, index) => (
              <button key={item.id} onClick={() => setActive(index)} className={cn("h-10 rounded-lg text-sm font-extrabold shadow-sm", paletteStyles[getStatus(item)], index === active && "ring-2 ring-[#172554] ring-offset-2")}>
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold text-[#64748B]">
            {Object.entries({ notVisited: "Not Visited", visited: "Visited", answered: "Answered", review: "Review", answeredReview: "Answered & Review", completed: "Completed" }).map(([key, label]) => (
              <span key={key} className="flex items-center gap-2"><i className={cn("h-3 w-3 rounded-full", paletteStyles[key as PaletteStatus])} />{label}</span>
            ))}
          </div>
        </div>
        <div className={cn("rounded-2xl border p-4", warnings === 0 ? "border-[#E2E8F0] bg-white" : warnings === 1 ? "border-[#F59E0B] bg-[#FFFBEB]" : warnings === 2 ? "border-[#F97316] bg-[#FFF7ED]" : "border-[#EF4444] bg-[#FEF2F2]")}>
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
            <AlertTriangle size={17} /> Security Warnings
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#172554]">{warnings}/3</p>
          <div className="mt-3 grid gap-2 text-xs font-semibold text-[#64748B]">
            <span className="flex items-center gap-2"><Maximize2 size={14} /> Fullscreen mode indicator</span>
            <span className="flex items-center gap-2"><ShieldCheck size={14} /> Shortcut, copy, paste, right click disabled UI</span>
            <span className="flex items-center gap-2"><Clock size={14} /> Third warning shows auto-submit state</span>
          </div>
        </div>
      </aside>
    </section>
  );
}

