"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, Plus, ShieldCheck, Users } from "lucide-react";

type PreviewRow = {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  valid: boolean;
};

export function CsvImportPreview() {
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<"csv" | "manual" | null>(null);

  const rows = useMemo<PreviewRow[]>(() => {
    return csv
      .split(/\r?\n/)
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

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMode("csv");
    setFileName(file.name);
    setCsv(await file.text());
  };

  return (
    <section className="surface-live overflow-hidden rounded-2xl">
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Candidate Entry</h2>
          <p className="mt-1 text-sm text-slate-500">Upload candidates or create a single login.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label
            className={`group flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${
              mode === "csv"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-800 hover:border-[#1E3A8A]"
            }`}
          >
            <FileUp size={17} />
            External CSV
            <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setMode(mode === "manual" ? null : "manual")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${
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
          <div className="grid gap-3 md:grid-cols-3">
            <input placeholder="Full name" className="input-soft px-3 py-2.5 text-sm" />
            <input placeholder="Email" className="input-soft px-3 py-2.5 text-sm" />
            <input placeholder="Phone" className="input-soft px-3 py-2.5 text-sm" />
            <input placeholder="Username" className="input-soft px-3 py-2.5 text-sm" />
            <input placeholder="Password" defaultValue="admin123" className="input-soft px-3 py-2.5 text-sm" />
            <input placeholder="Department" className="input-soft px-3 py-2.5 text-sm" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-primary min-h-0 py-2.5">
              <ShieldCheck size={16} />
              Approve
            </button>
            <button className="btn-secondary min-h-0 py-2.5">Save Pending</button>
          </div>
        </div>
      ) : null}

      {fileName ? (
        <div className="scale-in border-t border-slate-100">
          <div className="grid grid-cols-2 gap-px bg-slate-100 md:grid-cols-4">
            {[
              ["File", fileName],
              ["Rows", rows.length],
              ["Valid", validCount],
              ["Invalid", rows.length - validCount],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-white p-4">
                <p className="text-xs font-bold uppercase text-slate-500">{label as string}</p>
                <p className="mt-2 truncate text-xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {rows.length ? (
        <div className="scale-in border-t border-slate-100 p-5">
          <div className="grid gap-3">
            {rows.map((row) => (
              <div key={`${row.email}-${row.phone}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#1E3A8A]/30 hover:bg-white">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{row.name}</p>
                    <p className="text-sm text-slate-500">{row.email} / {row.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                      {row.username}
                    </span>
                    {row.valid ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={14} />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700">
                        <AlertCircle size={14} />
                        Invalid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4">
            <Users size={16} />
            Import {validCount}
          </button>
        </div>
      ) : null}
    </section>
  );
}
