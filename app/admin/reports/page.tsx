import { Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionChart, ScoreDistribution } from "@/components/dashboard/Charts";
import { analyticsService, resultService } from "@/services/mockApi";

export default async function ReportsPage() {
  const dashboard = await analyticsService.dashboard();
  const results = await resultService.list();

  return (
    <AppShell title="Reports & Analytics" subtitle="Student performance, quiz performance, pass-fail reports, weak areas, question analysis, and exports.">
      <div className="mb-5 flex flex-wrap gap-2">
        {["Export Excel", "Export CSV", "Export PDF"].map((item) => (
          <button key={item} className="btn-secondary"><Download size={16} /> {item}</button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <CompletionChart data={dashboard.completionTrend} />
        <ScoreDistribution data={results} />
      </div>
      <section className="surface mt-5 rounded-2xl p-5">
        <h2 className="text-lg font-extrabold text-[#111827]">Detailed Result Matrix</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <tbody className="divide-y divide-[#E2E8F0]">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="py-4 font-bold text-[#111827]">{result.studentName}</td>
                  <td className="text-[#64748B]">{result.quizTitle}</td>
                  <td className="font-bold text-[#172554]">{result.percentage}%</td>
                  <td><span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#166534]">{result.status}</span></td>
                  <td className="text-right text-[#64748B]">Rank #{result.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

