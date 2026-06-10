import { Download, Medal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { resultService } from "@/services/mockApi";

export default async function StudentResultPage() {
  const results = await resultService.list();
  const result = results[1];

  return (
    <AppShell role="student" title="Scorecard" subtitle="Your score, rank, accuracy, and result summary.">
      <section className="surface rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-[#3B82F6]">{result.quizTitle}</p>
            <h2 className="mt-2 text-4xl font-extrabold text-[#111827]">{result.percentage}%</h2>
            <p className="mt-2 text-[#64748B]">{result.status} / Rank #{result.rank} / {result.timeTaken}</p>
          </div>
          <button className="btn-primary"><Download size={16} /> Download PDF</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Score", result.score],
            ["Accuracy", `${result.accuracy}%`],
            ["Correct", "23"],
            ["Wrong", "3"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-sm font-semibold text-[#64748B]">{label}</p>
              <p className="mt-2 text-2xl font-extrabold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="surface mt-5 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <Medal size={18} className="text-[#3B82F6]" />
          <h2 className="text-lg font-extrabold text-[#111827]">Leaderboard</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {results.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm">
              <span className="font-bold text-[#111827]">#{item.rank} {item.studentName}</span>
              <span className="font-bold text-[#1E3A8A]">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

