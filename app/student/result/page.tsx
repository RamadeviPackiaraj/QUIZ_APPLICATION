import type { LucideIcon } from "lucide-react";
import { Download, Medal, Target, TimerReset, Trophy, XCircle } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { resultService } from "@/services/mockApi";

export default async function StudentResultPage() {
  const results = await resultService.list();
  const result = results[1];
  const cards: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: "Final Score", value: result.score, icon: Target },
    { label: "Rank", value: `#${result.rank}`, icon: Medal },
    { label: "Accuracy", value: `${result.accuracy}%`, icon: Trophy },
    { label: "Correct", value: "23", icon: Target },
    { label: "Wrong", value: "3", icon: XCircle },
    { label: "Time Taken", value: result.timeTaken, icon: TimerReset },
  ];

  return (
    <AppShell role="student" title="Scoreboard" subtitle="Score, rank, accuracy.">
      <section className="surface-live rounded-2xl p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-bold text-slate-500">{result.quizTitle}</p>
            <div className="mt-2 flex flex-wrap items-end gap-4">
              <h2 className="text-4xl font-black tracking-tight text-slate-950">{result.percentage}%</h2>
              <span className={`mb-1 rounded-full px-3 py-1 text-xs font-bold ${result.status === "Pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {result.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Rank #{result.rank} / {result.timeTaken}</p>
            <button className="btn-primary mt-4">
              <Download size={16} />
              Download PDF
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-950">Performance Snapshot</h3>
              <Trophy size={20} className="text-slate-950" />
            </div>
            <div className="mt-4 h-2.5 rounded-full bg-slate-200">
              <div className="h-2.5 rounded-full bg-slate-950" style={{ width: `${result.percentage}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">Current rank #{result.rank}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-live stagger-in rounded-2xl p-4">
            <Icon className="text-slate-950" size={18} />
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="surface-live mt-4 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Medal size={18} className="text-slate-950" />
          <h2 className="text-lg font-extrabold text-slate-950">Leaderboard</h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Rank", "Candidate", "Assessment", "Score", "Accuracy", "Status"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results
                .sort((a, b) => a.rank - b.rank)
                .map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-3 font-black text-slate-950">#{item.rank}</td>
                    <td className="px-4 py-3 font-semibold text-slate-950">{item.studentName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.quizTitle}</td>
                    <td className="px-4 py-3 font-bold text-slate-950">{item.percentage}%</td>
                    <td className="px-4 py-3 text-slate-600">{item.accuracy}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "Pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
