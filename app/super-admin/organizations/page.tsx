"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Ban, ChevronsUpDown, Clipboard, Download, Eye, EyeOff, FileText, FileUp, KeyRound, MoreHorizontal, Pencil, Plus, Search, ShieldCheck, UploadCloud, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/components/ui/Toast";
import { userSeed } from "@/mock/users";
import { buildErrorReport, ImportSummary, validateAdminCsv } from "@/lib/importValidation";
import { downloadCsv, printRows } from "@/lib/downloads";
import { createManagedUser, generateTemporaryPassword, hashPassword } from "@/lib/userManagement";
import type { ManagedUser } from "@/types";

const emptyForm = {
  name: "",
  email: "",
};

type SortKey = "displayId" | "name" | "email" | "status" | "createdDate";
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

export default function OrganizationsPage() {
  const { showToast } = useToast();
  const [admins, setAdmins] = useState<ManagedUser[]>(userSeed.admins);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [entryMode, setEntryMode] = useState<"manual" | "csv">("manual");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary<{ name: string; email: string }> | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<string[]>([]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("displayId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [form, setForm] = useState(emptyForm);

  const filteredAdmins = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return admins
      .filter((admin) => {
        const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
        const matchesQuery = `${admin.displayId} ${admin.name} ${admin.email} ${admin.status}`
          .toLowerCase()
          .includes(normalized);
        return matchesStatus && matchesQuery;
      })
      .sort((first, second) => {
        const firstText = String(first[sortKey]).toLowerCase();
        const secondText = String(second[sortKey]).toLowerCase();
        return sortDirection === "asc" ? firstText.localeCompare(secondText) : secondText.localeCompare(firstText);
      });
  }, [admins, query, sortDirection, sortKey, statusFilter]);

  const exportRows = filteredAdmins.map((admin) => ({
    "Admin ID": admin.displayId,
    "Admin Name": admin.name,
    Email: admin.email,
    "Temporary Password": admin.temporaryPassword || "",
    Status: admin.status,
    "Created Date": admin.createdDate,
  }));
  const activeCount = admins.filter((admin) => admin.status === "active").length;
  const inactiveCount = admins.filter((admin) => admin.status === "inactive").length;

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

  const closeForm = () => {
    setShowForm(false);
    setEntryMode("manual");
    setEditingId(null);
    setCsvFileName("");
    setUploadProgress(0);
    setForm(emptyForm);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email) return;

    if (admins.some((admin) => admin.email === email && admin.id !== editingId)) {
      showToast({ tone: "info", title: "Duplicate admin email", message: "An admin with this email already exists." });
      return;
    }

    if (editingId) {
      setAdmins((current) =>
        current.map((admin) => (admin.id === editingId ? { ...admin, name, email } : admin))
      );
      showToast({ tone: "success", title: "Admin updated" });
    } else {
      const admin = createManagedUser({
        name,
        email,
        role: "ADMIN",
        existingUsers: admins,
      });
      setAdmins((current) => [admin, ...current]);
      showToast({ tone: "success", title: "Admin created", message: `${admin.displayId} is active. Credentials were emailed.` });
    }

    closeForm();
  };

  const editAdmin = (admin: ManagedUser) => {
    setEditingId(admin.id);
    setActionMenuId(null);
    setEntryMode("manual");
    setShowForm(true);
    setForm({ name: admin.name, email: admin.email });
  };

  const openEntry = (mode: "manual" | "csv") => {
    setEntryMode(mode);
    setEditingId(null);
    setShowForm(true);
    setForm(emptyForm);
  };

  const handleCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setUploadProgress(32);
    const summary = validateAdminCsv(await file.text(), admins);
    const imported = summary.validRows.map((row, index) =>
      createManagedUser({
        name: row.name,
        email: row.email,
        role: "ADMIN",
        existingUsers: [...admins, ...summary.validRows.slice(0, index).map((item, itemIndex) => ({
          id: `preview-${itemIndex}`,
          displayId: `ADM-${String(admins.length + itemIndex + 1).padStart(4, "0")}`,
          name: item.name,
          email: item.email,
          role: "ADMIN" as const,
          passwordHash: "",
          status: "active" as const,
          createdDate: "",
          isFirstLogin: true,
        }))],
      })
    );

    setAdmins((current) => [...imported, ...current]);
    setImportSummary(summary);
    setUploadProgress(100);
    showToast({ tone: "success", title: "Import completed", message: `${summary.validRecords} admins imported.` });
  };

  const toggleStatus = (id: string) => {
    setAdmins((current) =>
      current.map((admin) =>
        admin.id === id ? { ...admin, status: admin.status === "active" ? "inactive" : "active" } : admin
      )
    );
    setConfirmId(null);
    setActionMenuId(null);
    showToast({ tone: "success", title: "Status updated" });
  };

  const resetPassword = (id: string) => {
    const temporaryPassword = generateTemporaryPassword();
    setAdmins((current) =>
      current.map((admin) =>
        admin.id === id
          ? { ...admin, temporaryPassword, passwordHash: hashPassword(temporaryPassword), isFirstLogin: true }
          : admin
      )
    );
    console.info("[EMAIL]", "Admin reset password credentials sent", { id, temporaryPassword });
    showToast({ tone: "success", title: "Password reset", message: "Temporary credentials were emailed." });
    setActionMenuId(null);
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const copyPassword = async (admin: ManagedUser) => {
    if (!admin.temporaryPassword) return;
    await navigator.clipboard.writeText(admin.temporaryPassword);
    showToast({ tone: "success", title: "Password copied", message: `${admin.displayId} temporary password copied.` });
  };

  const downloadErrors = () => {
    if (!importSummary) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([buildErrorReport(importSummary.issues)], { type: "text/plain" }));
    link.download = "admin-import-errors.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AppShell role="super-admin" title="Organization Admins" subtitle="Create and manage admin access with generated credentials.">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={admins.length} />
        <StatCard label="Active" value={activeCount} tone="green" />
        <StatCard label="Inactive" value={inactiveCount} tone="red" />
        <StatCard label="Pending" value={0} tone="gray" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-950">Admin Management</h2>
              <p className="mt-1 text-sm text-slate-500">Search, export, and manage organization admin access.</p>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-[#0F172A] focus-within:ring-4 focus-within:ring-slate-100 lg:w-80">
                <Search size={16} className="text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search admins" className="w-full bg-transparent text-sm outline-none" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0F172A] focus:ring-4 focus:ring-slate-100">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button type="button" onClick={() => downloadCsv("admins.csv", exportRows)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <Download size={16} />
                CSV
              </button>
              <button type="button" onClick={() => printRows("Admin Credentials", exportRows)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <FileText size={16} />
                PDF
              </button>
              <button type="button" onClick={() => openEntry("manual")} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <Plus size={16} />
                Add Admin
              </button>
              <button type="button" onClick={() => openEntry("csv")} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#111827]">
                <UploadCloud size={16} />
                Upload CSV
              </button>
            </div>
          </div>
        </div>

        {showForm ? (
          <div className="scale-in border-b border-slate-100 bg-slate-50 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{entryMode === "csv" ? "CSV Upload" : editingId ? "Edit Admin" : "Manual Entry"}</h3>
                <p className="mt-1 text-sm text-slate-500">Admin ID, password, status, and timestamps are generated automatically.</p>
              </div>
              <button type="button" onClick={closeForm} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100" aria-label="Close form">
                <X size={16} />
              </button>
            </div>
            {entryMode === "csv" ? (
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <label className="flex min-h-24 cursor-pointer flex-col justify-center rounded-xl border border-dashed border-[#1E3A8A]/25 bg-[#1E3A8A]/5 px-4 text-center transition hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/10">
                  <FileUp className="mx-auto text-[#1E3A8A]" size={24} />
                  <span className="mt-2 text-sm font-bold text-slate-950">{csvFileName || "Choose admin CSV"}</span>
                  <span className="mt-1 text-xs text-slate-500">Admin Name, Email Address</span>
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
              <form onSubmit={handleSave} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Admin Name" className="input-soft px-3 py-2.5 text-sm" required />
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Admin Email" type="email" className="input-soft px-3 py-2.5 text-sm" required />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#111827]">
                  <ShieldCheck size={16} />
                  Save
                </button>
              </form>
            )}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {[
                  ["displayId", "Admin ID"],
                  ["name", "Admin Name"],
                  ["email", "Email"],
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
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-bold text-slate-950">{admin.displayId}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{admin.name}</td>
                  <td className="px-5 py-4 text-slate-600">{admin.email}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${admin.status === "active" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{admin.createdDate}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="min-w-28 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs font-bold text-slate-800 ring-1 ring-slate-200">
                        {visiblePasswords.includes(admin.id) ? admin.temporaryPassword || "-" : "********"}
                      </span>
                      <button type="button" onClick={() => togglePassword(admin.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Show password">
                        {visiblePasswords.includes(admin.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button type="button" onClick={() => copyPassword(admin)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Copy password">
                        <Clipboard size={15} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-flex">
                      <button
                        type="button"
                        onClick={() => setActionMenuId((current) => (current === admin.id ? null : admin.id))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                        aria-label={`Open actions for ${admin.name}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {actionMenuId === admin.id ? (
                        <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                          <button type="button" onClick={() => editAdmin(admin)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button type="button" onClick={() => setConfirmId(admin.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${admin.status === "active" ? "text-red-700 hover:bg-red-50" : "text-emerald-700 hover:bg-emerald-50"}`}>
                            {admin.status === "active" ? <Ban size={15} /> : <ShieldCheck size={15} />}
                            {admin.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button type="button" onClick={() => resetPassword(admin.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            <KeyRound size={15} />
                            Reset Password
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No admins found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {confirmId ? (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-black text-slate-950">Confirm status change</h3>
              <p className="mt-2 text-sm text-slate-500">This updates admin access immediately.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirmId(null)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={() => toggleStatus(confirmId)} className="btn-primary">Confirm</button>
              </div>
            </div>
          </div>
        ) : null}

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
                <button type="button" onClick={() => setImportSummary(null)} className="btn-primary">Done</button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
