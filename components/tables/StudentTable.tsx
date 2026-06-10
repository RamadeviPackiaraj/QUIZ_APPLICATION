"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";

import type { Student } from "@/types";

export function StudentTable({
  students,
}: {
  students: Student[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      students.filter((student) =>
        `${student.name} ${student.email} ${student.batch}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [students, query]
  );

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Candidate Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage candidate approvals and examination access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 md:w-80">
              <Search size={18} className="text-slate-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidates"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button className="btn-primary">
              Upload / Add
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Candidate
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Department
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">
                    {student.name}
                  </p>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {student.email}
                </td>

                <td className="px-6 py-4 text-slate-700">
                  {student.batch}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      student.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.status === "active"
                      ? "Approved"
                      : "Pending"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                      Edit
                    </button>

                    <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                      <ShieldCheck size={14} />
                      Approve
                    </button>

                    <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}