"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Ban, Check, ChevronsUpDown, FileUp, Pencil, Plus, Search, ShieldCheck, Trash2, UploadCloud, X } from "lucide-react";

import type { Student } from "@/types";

type SortKey = "name" | "email" | "batch" | "status";
type SortDirection = "asc" | "desc";

export function StudentTable({
  students,
}: {
  students: Student[];
}) {
  const [records, setRecords] = useState<Student[]>(students);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [entryMode, setEntryMode] = useState<"manual" | "csv" | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    batch: "",
    status: "active" as Student["status"],
  });

  const filtered = useMemo(
    () =>
      records
        .filter((student) =>
          `${student.name} ${student.email} ${student.batch} ${student.username}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .sort((first, second) => {
          const firstText = String(first[sortKey]).toLowerCase();
          const secondText = String(second[sortKey]).toLowerCase();
          return sortDirection === "asc"
            ? firstText.localeCompare(secondText)
            : secondText.localeCompare(firstText);
        }),
    [records, query, sortDirection, sortKey]
  );

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

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", username: "", password: "", batch: "", status: "active" });
    setEditingId(null);
  };

  const openEntry = (mode: "manual" | "csv") => {
    resetForm();
    setEntryMode(mode);
    setShowForm(true);
    setShowOptions(false);
  };

  const handleCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const text = await file.text();
    const imported = text
      .split(/\r?\n/)
      .slice(1)
      .map((line, index) => {
        const [name = "", email = "", phone = "", batch = "General"] = line.split(",").map((part) => part.trim());
        const username = name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "") || `candidate.${index + 1}`;
        return {
          id: `stu-csv-${Date.now()}-${index}`,
          name,
          email,
          phone,
          username,
          status: "inactive" as Student["status"],
          batch,
          averageScore: 0,
          completed: 0,
        };
      })
      .filter((student) => student.name && student.email);
    if (imported.length) {
      setRecords((current) => [...imported, ...current]);
    }
  };

  const saveCandidate = () => {
    if (!form.name.trim() || !form.username.trim()) return;
    if (editingId) {
      setRecords((current) =>
        current.map((student) =>
          student.id === editingId
            ? { ...student, ...form }
            : student
        )
      );
    } else {
      setRecords((current) => [
        {
          id: `stu-${Date.now()}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          username: form.username,
          status: form.status,
          batch: form.batch || "General",
          averageScore: 0,
          completed: 0,
        },
        ...current,
      ]);
    }
    resetForm();
    setShowForm(false);
  };

  const editCandidate = (student: Student) => {
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      username: student.username,
      password: "admin123",
      batch: student.batch,
      status: student.status,
    });
    setEditingId(student.id);
    setEntryMode("manual");
    setShowForm(true);
  };

  const approved = records.filter((student) => student.status === "active").length;
  const pending = records.length - approved;

  return (
    <section className="surface-live overflow-hidden rounded-2xl">
      <div className="border-b border-slate-100 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
              Candidate Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {records.length} candidates, {approved} approved, {pending} pending
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 md:w-80">
              <Search size={18} className="text-slate-400" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidates"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptions((current) => !current)}
                className="btn-primary h-10 w-full sm:w-auto"
              >
                <Plus size={16} />
                Upload / Add
              </button>
              {showOptions ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => openEntry("csv")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <UploadCloud size={16} />
                    CSV Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => openEntry("manual")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                    Manual Entry
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="scale-in border-b border-slate-100 bg-slate-50/70 p-4">
          {entryMode === "csv" ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <label className="flex min-h-24 cursor-pointer flex-col justify-center rounded-xl border border-dashed border-[#1E3A8A]/25 bg-[#1E3A8A]/5 px-4 text-center transition hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/10">
                <FileUp className="mx-auto text-[#1E3A8A]" size={24} />
                <span className="mt-2 text-sm font-bold text-slate-950">{csvFileName || "Choose candidate CSV"}</span>
                <span className="mt-1 text-xs text-slate-500">name, email, phone, department</span>
                <input type="file" accept=".csv,text/csv" onChange={handleCsv} className="sr-only" />
              </label>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary min-h-0 py-2.5">
                <X size={16} />
                Close
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Candidate name" className="input-soft px-3 py-2.5 text-sm" />
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="input-soft px-3 py-2.5 text-sm" />
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone" className="input-soft px-3 py-2.5 text-sm" />
              <input value={form.batch} onChange={(event) => setForm({ ...form, batch: event.target.value })} placeholder="Department" className="input-soft px-3 py-2.5 text-sm" />
              <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Username" className="input-soft px-3 py-2.5 text-sm" />
              <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" className="input-soft px-3 py-2.5 text-sm" />
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Student["status"] })} className="input-soft px-3 py-2.5 text-sm">
                <option value="active">Approved</option>
                <option value="inactive">Pending</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={saveCandidate} className="btn-primary min-h-0 flex-1 py-2.5">
                  <Check size={16} />
                  Save
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary min-h-0 px-3 py-2.5">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                ["name", "Candidate"],
                ["email", "Email"],
                ["batch", "Department"],
                ["status", "Status"],
              ].map(([key, label]) => (
                <th key={key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <button type="button" onClick={() => handleSort(key as SortKey)} className="inline-flex items-center gap-1">
                    {label}
                    {renderSortIcon(key as SortKey)}
                  </button>
                </th>
              ))}

              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="stagger-in border-b border-slate-100 transition hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">
                    {student.name}
                  </p>
                </td>

                <td className="px-4 py-3 text-slate-600">
                  <p>{student.email}</p>
                  <p className="text-xs font-semibold text-slate-400">{student.username}</p>
                </td>

                <td className="px-4 py-3 text-slate-700">
                  {student.batch}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      student.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {student.status === "active"
                      ? "Approved"
                      : "Pending"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => editCandidate(student)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => setRecords((current) => current.map((item) => item.id === student.id ? { ...item, status: "active" } : item))}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <ShieldCheck size={14} />
                      Approve
                    </button>

                    {student.status === "active" ? (
                      <button
                        onClick={() => setRecords((current) => current.map((item) => item.id === student.id ? { ...item, status: "inactive" } : item))}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Ban size={14} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setRecords((current) => current.filter((item) => item.id !== student.id))}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
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
