"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Medal, Search, Sparkles, Trophy } from "lucide-react";

import type { Result } from "@/types";

const organizations = ["Aptora Labs", "Northstar Academy", "SkillBridge"];
type SortKey = "rank" | "studentName" | "percentage" | "accuracy" | "timeTaken" | "status";
type SortDirection = "asc" | "desc";

export function LeaderboardClient({ results }: { results: Result[] }) {
  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState("All Organizations");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const enriched = useMemo(
    () => results.map((result, index) => ({ ...result, organization: organizations[index % organizations.length] })),
    [results]
  );

  const sorted = useMemo(() => {
    const term = query.trim().toLowerCase();
    return enriched
      .filter((result) => organization === "All Organizations" || result.organization === organization)
      .filter((result) =>
        `${result.studentName} ${result.quizTitle} ${result.status} ${result.organization}`.toLowerCase().includes(term)
      )
      .sort((first, second) => {
        const firstValue = first[sortKey];
        const secondValue = second[sortKey];
        if (typeof firstValue === "number" && typeof secondValue === "number") {
          return sortDirection === "asc" ? firstValue - secondValue : secondValue - firstValue;
        }
        return sortDirection === "asc"
          ? String(firstValue).localeCompare(String(secondValue))
          : String(secondValue).localeCompare(String(firstValue));
      });
  }, [enriched, organization, query, sortDirection, sortKey]);

  const winners = [...enriched].sort((a, b) => a.rank - b.rank).slice(0, 3);

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

  return (
    <>
      <section className="grid gap-3 md:grid-cols-3">
        {winners.map((candidate, index) => (
          <article
            key={candidate.id}
            className={`stagger-in rounded-2xl border p-4 shadow-sm ${
              index === 0 ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"
            }`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${index === 0 ? "bg-white text-[#1E3A8A]" : "bg-[#1E3A8A]/10 text-[#1E3A8A]"}`}>
                Rank #{candidate.rank}
              </span>
              {index === 0 ? <Sparkles className="text-yellow-300" size={20} /> : <Trophy className="text-[#1E3A8A]" size={20} />}
            </div>
            <h2 className="mt-3 text-base font-black tracking-tight">{candidate.studentName}</h2>
            <p className={`mt-1 truncate text-sm ${index === 0 ? "text-slate-200" : "text-slate-500"}`}>{candidate.quizTitle}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["Score", `${candidate.percentage}%`],
                ["Accuracy", `${candidate.accuracy}%`],
                ["Time", candidate.timeTaken],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-lg p-2 ${index === 0 ? "bg-white/10" : "bg-slate-50"}`}>
                  <p className="text-xs font-bold opacity-70">{label}</p>
                  <p className="mt-1 text-sm font-black">{value}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="surface-live mt-4 rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Medal size={18} className="text-[#1E3A8A]" />
            <h2 className="text-lg font-extrabold tracking-tight text-[#111827]">Complete Rankings</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex h-10 min-w-[240px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Search size={16} className="text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidate..." className="w-full bg-transparent text-sm outline-none" />
            </label>
            <select value={organization} onChange={(event) => setOrganization(event.target.value)} className="input-soft h-10 px-3 text-sm font-semibold">
              <option>All Organizations</option>
              {organizations.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button className="btn-secondary h-10">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  ["rank", "Rank"],
                  ["studentName", "Candidate"],
                  ["percentage", "Score"],
                  ["accuracy", "Accuracy"],
                  ["timeTaken", "Time Taken"],
                  ["status", "Status"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button type="button" onClick={() => handleSort(key as SortKey)} className="inline-flex items-center gap-1">
                      {label}
                      {renderSortIcon(key as SortKey)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {sorted.map((result) => (
                <tr key={result.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-black text-[#1E3A8A]">#{result.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#111827]">{result.studentName}</p>
                    <p className="text-xs text-[#64748B]">{result.quizTitle}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#111827]">{result.percentage}%</td>
                  <td className="px-4 py-3 text-[#64748B]">{result.accuracy}%</td>
                  <td className="px-4 py-3 text-[#64748B]">{result.timeTaken}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${result.status === "Pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">{result.organization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
