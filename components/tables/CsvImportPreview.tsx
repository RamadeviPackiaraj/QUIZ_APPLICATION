"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileUp,
  KeyRound,
  Plus,
  Users,
} from "lucide-react";

type PreviewRow = {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  valid: boolean;
};

const sample = `Name,Email,Phone
Riya Nair,riya@example.com,9876500001
Ishaan Sen,ishaan@example.com,9876500002`;

export function CsvImportPreview() {
  const [csv, setCsv] = useState(sample);
  const [openPanel, setOpenPanel] = useState<"csv" | "manual" | null>(null);

  const rows = useMemo<PreviewRow[]>(() => {
    return csv
      .split("\n")
      .slice(1)
      .map((line, index) => {
        const [name = "", email = "", phone = ""] = line.split(",").map((part) => part.trim());

        return {
          name,
          email,
          phone,
          username: `${name.toLowerCase().replace(/\s+/g, ".")}` || "candidate",
          password: `Qz@${1000 + index * 137}`,
          valid: Boolean(name && email.includes("@") && phone.length >= 10),
        };
      })
      .filter((row) => row.name || row.email || row.phone);
  }, [csv]);

  const validCount = rows.filter((row) => row.valid).length;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Candidate Entry</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose CSV upload or manual entry only when you need to add candidates.
            </p>
          </div>
          <button className="btn-primary">
            <Download size={16} />
            Download Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-4">
        <div className="bg-white p-5">
          <p className="text-xs text-slate-500">Total Rows</p>
          <p className="mt-2 text-3xl font-black">{rows.length}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs text-slate-500">Valid</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{validCount}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs text-slate-500">Invalid</p>
          <p className="mt-2 text-3xl font-black text-red-500">{rows.length - validCount}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-xs text-slate-500">Approved Ready</p>
          <p className="mt-2 text-3xl font-black text-blue-600">{validCount}</p>
        </div>
      </div>

      <div className="grid gap-3 p-6 md:grid-cols-2">
        {[
          ["csv", FileUp, "CSV upload"],
          ["manual", Plus, "Manual entry"],
        ].map(([id, Icon, label]) => (
          <button
            key={id as string}
            type="button"
            onClick={() => setOpenPanel(openPanel === id ? null : (id as "csv" | "manual"))}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left font-bold text-slate-900 transition hover:bg-blue-50"
          >
            <span className="flex items-center gap-2">
              <Icon size={18} className="text-[#1E3A8A]" />
              {label as string}
            </span>
            <ChevronDown size={18} className={openPanel === id ? "rotate-180 transition" : "transition"} />
          </button>
        ))}
      </div>

      {openPanel === "csv" ? (
        <div className="border-t border-slate-100 p-6">
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center transition hover:border-blue-400">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow">
              <FileUp size={30} className="text-blue-600" />
            </div>
            <h3 className="mt-5 text-lg font-bold">Upload candidate CSV</h3>
            <p className="mt-2 text-sm text-slate-500">Upload records or paste CSV content below.</p>
            <button className="btn-primary mt-5">Browse Files</button>
          </div>

          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            className="input-soft mt-4 min-h-[160px] w-full p-5 text-sm"
          />
        </div>
      ) : null}

      {openPanel === "manual" ? (
        <div className="border-t border-slate-100 px-6 pb-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <h3 className="font-bold">Manual Candidate Entry</h3>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input placeholder="Full Name" className="input-soft px-4 py-3" />
              <input placeholder="Email" className="input-soft px-4 py-3" />
              <input placeholder="Phone Number" className="input-soft px-4 py-3" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn-primary">Approve Candidate</button>
              <button className="btn-secondary">Save as Pending</button>
            </div>
          </div>
        </div>
      ) : null}

      {openPanel ? (
        <div className="border-t border-slate-100 px-6 pb-6">
          <div className="grid gap-4">
            {rows.map((row) => (
              <div key={row.email} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{row.name}</h4>
                    <p className="text-sm text-slate-500">{row.email}</p>
                    <p className="text-sm text-slate-500">{row.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm">
                      <KeyRound size={14} className="mr-2 inline" />
                      {row.username}
                    </div>
                    <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm">{row.password}</div>
                    {row.valid ? (
                      <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={14} />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700">
                        <AlertCircle size={14} />
                        Invalid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary">
              <Users size={16} />
              Import {validCount} Approved Candidates
            </button>
            <button className="btn-secondary">Download Credentials</button>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-6 pb-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
            Add/import controls are hidden until you choose CSV upload or manual entry.
          </div>
        </div>
      )}
    </section>
  );
}
