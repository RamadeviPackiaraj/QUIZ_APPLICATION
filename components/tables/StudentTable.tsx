"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Check,
  ChevronsUpDown,
  Clipboard,
  Download,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import { buildErrorReport, ImportSummary, validateCandidateCsv } from "@/lib/importValidation";
import { downloadCsv, printRows } from "@/lib/downloads";
import { createManagedUser, generateTemporaryPassword, hashPassword } from "@/lib/userManagement";
import type { ManagedUser, Student } from "@/types";
import { useToast } from "@/components/ui/Toast";

type CandidateForm = {
  name: string;
  email: string;
  department: string;
};

type SortKey = "displayId" | "name" | "email" | "department" | "status" | "createdDate";
type SortDirection = "asc" | "desc";

function StatCard({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: number;
  tone?: "navy" | "green" | "red" | "gray";
}) {
  const toneClass = {
    navy: "bg-[#0F172A] text-white",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-slate-50 text-slate-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${toneClass}`}>{label}</span>
      </div>
    </div>
  );
}

function fromStudents(students: Student[]): ManagedUser[] {
  return students.map((student, index) => ({
    id: student.id,
    displayId: student.candidateId || `CAN-${String(index + 1).padStart(4, "0")}`,
    name: student.name,
    email: student.email,
    role: "CANDIDATE",
    department: student.batch,
    passwordHash: "mock-hash-imported",
    temporaryPassword: "student123",
    status: student.status,
    createdDate: student.createdDate || "2026-06-04",
    isFirstLogin: student.isFirstLogin ?? true,
  }));
}

const emptyForm: CandidateForm = {
  name: "",
  email: "",
  department: "",
};

export function StudentTable({ students }: { students: Student[] }) {
  const { showToast } = useToast();
  const [records, setRecords] = useState<ManagedUser[]>(() => fromStudents(students));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [entryMode, setEntryMode] = useState<"manual" | "csv" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary<{ name: string; email: string; department?: string }> | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<string[]>([]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("displayId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [form, setForm] = useState<CandidateForm>(emptyForm);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return records
      .filter((candidate) => {
        const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
        const matchesQuery = `${candidate.displayId} ${candidate.name} ${candidate.email} ${candidate.department || ""} ${candidate.status}`
          .toLowerCase()
          .includes(normalized);
        return matchesStatus && matchesQuery;
      })
      .sort((first, second) => {
        const firstText = String(first[sortKey] || "").toLowerCase();
        const secondText = String(second[sortKey] || "").toLowerCase();
        return sortDirection === "asc" ? firstText.localeCompare(secondText) : secondText.localeCompare(firstText);
      });
  }, [query, records, sortDirection, sortKey, statusFilter]);

  const activeCount = records.filter((candidate) => candidate.status === "active").length;
  const inactiveCount = records.filter((candidate) => candidate.status === "inactive").length;
  const exportRows = filtered.map((candidate) => ({
    "Candidate ID": candidate.displayId,
    "Candidate Name": candidate.name,
    Email: candidate.email,
    Department: candidate.department || "",
    "Temporary Password": candidate.temporaryPassword || "",
    Status: candidate.status,
    "Created Date": candidate.createdDate,
  }));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ChevronsUpDown size={13} />;
    return sortDirection === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const resetEditor = () => {
    setForm(emptyForm);
    setEditingId(null);
    setEntryMode(null);
    setCsvFileName("");
    setUploadProgress(0);
  };

  const openEntry = (mode: "manual" | "csv") => {
    resetEditor();
    setEntryMode(mode);
    setShowOptions(false);
  };

  const saveCandidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) return;

    if (records.some((candidate) => candidate.email === email && candidate.id !== editingId)) {
      showToast({ tone: "info", title: "Duplicate email", message: "A candidate with this email already exists." });
      return;
    }

    if (editingId) {
      setRecords((current) =>
        current.map((candidate) =>
          candidate.id === editingId
            ? { ...candidate, name, email, department: form.department.trim() || undefined }
            : candidate
        )
      );
      showToast({ tone: "success", title: "Candidate updated" });
    } else {
      const candidate = createManagedUser({
        name,
        email,
        role: "CANDIDATE",
        department: form.department,
        existingUsers: records,
      });
      setRecords((current) => [candidate, ...current]);
      showToast({ tone: "success", title: "Candidate created", message: `${candidate.displayId} is active. Credentials were emailed.` });
    }

    resetEditor();
  };

  const handleCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setUploadProgress(28);
    const summary = validateCandidateCsv(await file.text(), records);
    setUploadProgress(74);

    const imported = summary.validRows.map((row, index) =>
      createManagedUser({
        name: row.name,
        email: row.email,
        role: "CANDIDATE",
        department: row.department,
        existingUsers: [
          ...records,
          ...summary.validRows.slice(0, index).map((item, itemIndex) => ({
            id: `candidate-preview-${itemIndex}`,
            displayId: `CAN-${String(records.length + itemIndex + 1).padStart(4, "0")}`,
            name: item.name,
            email: item.email,
            role: "CANDIDATE" as const,
            passwordHash: "",
            status: "active" as const,
            createdDate: "",
            isFirstLogin: true,
          })),
        ],
      })
    );

    setRecords((current) => [...imported, ...current]);
    setImportSummary(summary);
    setUploadProgress(100);
    showToast({ tone: "success", title: "Import completed", message: `${summary.validRecords} candidates imported.` });
  };

  const editCandidate = (candidate: ManagedUser) => {
    setEditingId(candidate.id);
    setActionMenuId(null);
    setEntryMode("manual");
    setShowOptions(false);
    setForm({
      name: candidate.name,
      email: candidate.email,
      department: candidate.department || "",
    });
  };

  const toggleStatus = (id: string) => {
    setRecords((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? { ...candidate, status: candidate.status === "active" ? "inactive" : "active" }
          : candidate
      )
    );
    setConfirmId(null);
    setActionMenuId(null);
    showToast({ tone: "success", title: "Status updated" });
  };

  const resetPassword = (id: string) => {
    const temporaryPassword = generateTemporaryPassword();
    setRecords((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? { ...candidate, temporaryPassword, passwordHash: hashPassword(temporaryPassword), isFirstLogin: true }
          : candidate
      )
    );
    console.info("[EMAIL]", "Reset password credentials sent", { id, temporaryPassword });
    showToast({ tone: "success", title: "Password reset", message: "Temporary credentials were emailed." });
    setActionMenuId(null);
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const copyPassword = async (candidate: ManagedUser) => {
    if (!candidate.temporaryPassword) return;
    await navigator.clipboard.writeText(candidate.temporaryPassword);
    showToast({ tone: "success", title: "Password copied", message: `${candidate.displayId} temporary password copied.` });
  };

  const bulkDeactivate = () => {
    setRecords((current) =>
      current.map((candidate) => (selected.includes(candidate.id) ? { ...candidate, status: "inactive" } : candidate))
    );
    setSelected([]);
    showToast({ tone: "success", title: "Bulk action complete" });
  };

  const downloadErrors = () => {
    if (!importSummary) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([buildErrorReport(importSummary.issues)], { type: "text/plain" }));
    link.download = "candidate-import-errors.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={records.length} />
        <StatCard label="Active" value={activeCount} tone="green" />
        <StatCard label="Inactive" value={inactiveCount} tone="red" />
        <StatCard label="Pending" value={0} tone="gray" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950">Candidate Management</h2>
            <p className="mt-1 text-sm text-slate-500">Search, export, and manage candidate access.</p>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-[#0F172A] focus-within:ring-4 focus-within:ring-slate-100 lg:w-80">
              <Search size={16} className="text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidates" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0F172A] focus:ring-4 focus:ring-slate-100">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button type="button" onClick={() => downloadCsv("candidates.csv", exportRows)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              <Download size={16} />
              CSV
            </button>
            <button type="button" onClick={() => printRows("Candidate Credentials", exportRows)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              <FileText size={16} />
              PDF
            </button>
            <div className="relative">
              <button type="button" onClick={() => setShowOptions((current) => !current)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#111827] sm:w-auto">
                <Plus size={16} />
                Upload / Add
              </button>
              {showOptions ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <button type="button" onClick={() => openEntry("csv")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <UploadCloud size={16} />
                    CSV Upload
                  </button>
                  <button type="button" onClick={() => openEntry("manual")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Pencil size={16} />
                    Manual Entry
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {selected.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="text-sm font-bold text-slate-700">{selected.length} selected</span>
            <button type="button" onClick={bulkDeactivate} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
              <Ban size={15} />
              Deactivate
            </button>
          </div>
        ) : null}
      </div>

      {entryMode ? (
        <div className="scale-in border-b border-slate-100 bg-slate-50 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-slate-950">{entryMode === "csv" ? "CSV Upload" : editingId ? "Edit Candidate" : "Manual Entry"}</h3>
            <button type="button" onClick={resetEditor} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {entryMode === "csv" ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <label className="flex min-h-24 cursor-pointer flex-col justify-center rounded-xl border border-dashed border-[#1E3A8A]/25 bg-[#1E3A8A]/5 px-4 text-center transition hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/10">
                <FileUp className="mx-auto text-[#1E3A8A]" size={24} />
                <span className="mt-2 text-sm font-bold text-slate-950">{csvFileName || "Choose candidate CSV"}</span>
                <span className="mt-1 text-xs text-slate-500">Candidate Name, Email Address, Department</span>
                <input type="file" accept=".csv,text/csv" onChange={handleCsv} className="sr-only" />
              </label>
              <div className="min-w-48">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-slate-950 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">{uploadProgress}% uploaded</p>
              </div>
            </div>
          ) : (
            <form onSubmit={saveCandidate} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Candidate Name" className="input-soft px-3 py-2.5 text-sm" required />
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email Address" type="email" className="input-soft px-3 py-2.5 text-sm" required />
              <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="Department" className="input-soft px-3 py-2.5 text-sm" />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#111827]">
                <Check size={16} />
                Save
              </button>
            </form>
          )}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onChange={(event) => setSelected(event.target.checked ? filtered.map((candidate) => candidate.id) : [])}
                  aria-label="Select all candidates"
                />
              </th>
              {[
                ["displayId", "Candidate ID"],
                ["name", "Candidate Name"],
                ["email", "Email"],
                ["department", "Department"],
                ["status", "Status"],
                ["createdDate", "Created Date"],
              ].map(([key, label]) => (
                <th key={key} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <button type="button" onClick={() => handleSort(key as SortKey)} className="inline-flex items-center gap-1">
                    {label}
                    {sortIcon(key as SortKey)}
                  </button>
                </th>
              ))}
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Password</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((candidate) => (
              <tr key={candidate.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(candidate.id)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked ? [...current, candidate.id] : current.filter((id) => id !== candidate.id)
                      )
                    }
                    aria-label={`Select ${candidate.name}`}
                  />
                </td>
                <td className="px-5 py-4 font-bold text-slate-950">{candidate.displayId}</td>
                <td className="px-5 py-4 font-semibold text-slate-900">{candidate.name}</td>
                <td className="px-5 py-4 text-slate-600">{candidate.email}</td>
                <td className="px-5 py-4 text-slate-700">{candidate.department || "-"}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${candidate.status === "active" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"}`}>
                    {candidate.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{candidate.createdDate}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="min-w-28 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs font-bold text-slate-800 ring-1 ring-slate-200">
                      {visiblePasswords.includes(candidate.id) ? candidate.temporaryPassword || "-" : "********"}
                    </span>
                    <button type="button" onClick={() => togglePassword(candidate.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Show password">
                      {visiblePasswords.includes(candidate.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button type="button" onClick={() => copyPassword(candidate)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Copy password">
                      <Clipboard size={15} />
                    </button>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="relative inline-flex">
                    <button
                      type="button"
                      onClick={() => setActionMenuId((current) => (current === candidate.id ? null : candidate.id))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                      aria-label={`Open actions for ${candidate.name}`}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {actionMenuId === candidate.id ? (
                      <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                        <button type="button" onClick={() => editCandidate(candidate)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          <Pencil size={15} />
                          Edit
                        </button>
                        <button type="button" onClick={() => setConfirmId(candidate.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${candidate.status === "active" ? "text-red-700 hover:bg-red-50" : "text-emerald-700 hover:bg-emerald-50"}`}>
                          {candidate.status === "active" ? <Ban size={15} /> : <ShieldCheck size={15} />}
                          {candidate.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" onClick={() => resetPassword(candidate.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          <KeyRound size={15} />
                          Reset Password
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                  No candidates found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {importSummary ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">CSV Upload Result</h3>
                <p className="mt-1 text-sm text-slate-500">Validation completed before import.</p>
              </div>
              <button type="button" onClick={() => setImportSummary(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close result modal">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Total Records", importSummary.totalRecords],
                ["Valid Records", importSummary.validRecords],
                ["Duplicate Records", importSummary.duplicateRecords],
                ["Invalid Records", importSummary.invalidRecords],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={downloadErrors} disabled={!importSummary.issues.length} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                <Download size={16} />
                Error Report
              </button>
              <button type="button" onClick={() => setImportSummary(null)} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmId ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-black text-slate-950">Confirm status change</h3>
            <p className="mt-2 text-sm text-slate-500">This updates candidate access immediately.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmId(null)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={() => toggleStatus(confirmId)} className="btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
      </section>
    </div>
  );
}
