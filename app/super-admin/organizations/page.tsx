"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  FileUp,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Ban,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { organizations as mockOrganizations } from "@/mock/organizations";

type Organization = (typeof mockOrganizations)[number];
type Status = Organization["status"];
type SortKey =
  | "name"
  | "adminUserId"
  | "adminPassword"
  | "admins"
  | "candidates"
  | "quizzes"
  | "status";
type SortDirection = "asc" | "desc";
type EntryMode = "csv" | "manual" | null;

const emptyForm = {
  name: "",
  adminUserId: "",
  adminPassword: "",
  admins: "1",
  candidates: "0",
  quizzes: "0",
  status: "active" as Status,
};

function credentialsFromName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const prefix = slug.slice(0, 5).toUpperCase() || "ADMIN";

  return {
    adminUserId: `${slug || "organization"}-admin`,
    adminPassword: `${prefix}@2026`,
  };
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] =
    useState<Organization[]>(mockOrganizations);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    const access = localStorage.getItem("superAdminAccess");

    if (!access) {
      router.push("/super-admin/organizations");
    }
  }, [router]);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return organizations
      .filter((org) =>
        [
          org.name,
          org.adminUserId,
          org.adminPassword,
          org.status,
          org.admins.toString(),
          org.candidates.toString(),
          org.quizzes.toString(),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .sort((first, second) => {
        const firstValue = first[sortKey];
        const secondValue = second[sortKey];

        if (typeof firstValue === "number" && typeof secondValue === "number") {
          return sortDirection === "asc"
            ? firstValue - secondValue
            : secondValue - firstValue;
        }

        const firstText = String(firstValue).toLowerCase();
        const secondText = String(secondValue).toLowerCase();

        return sortDirection === "asc"
          ? firstText.localeCompare(secondText)
          : secondText.localeCompare(firstText);
      });
  }, [organizations, query, sortDirection, sortKey]);

  const totals = useMemo(
    () => ({
      admins: organizations.reduce((total, org) => total + org.admins, 0),
      candidates: organizations.reduce(
        (total, org) => total + org.candidates,
        0
      ),
    }),
    [organizations]
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
    if (sortKey !== key) {
      return <ChevronsUpDown size={14} />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  const openMode = (mode: EntryMode) => {
    setEntryMode(mode);
    setShowOptions(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const closeEditor = () => {
    setEntryMode(null);
    setEditingId(null);
    setCsvFile(null);
    setForm(emptyForm);
  };

  const handleNameChange = (name: string) => {
    const credentials = credentialsFromName(name);

    setForm((current) => ({
      ...current,
      name,
      adminUserId: editingId ? current.adminUserId : credentials.adminUserId,
      adminPassword: editingId ? current.adminPassword : credentials.adminPassword,
    }));
  };

  const handleManualSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      return;
    }

    const payload = {
      name: trimmedName,
      adminUserId:
        form.adminUserId.trim() || credentialsFromName(trimmedName).adminUserId,
      adminPassword:
        form.adminPassword.trim() ||
        credentialsFromName(trimmedName).adminPassword,
      admins: Number(form.admins) || 0,
      candidates: Number(form.candidates) || 0,
      quizzes: Number(form.quizzes) || 0,
      status: form.status,
    };

    if (editingId) {
      setOrganizations((current) =>
        current.map((org) =>
          org.id === editingId
            ? {
                ...org,
                ...payload,
              }
            : org
        )
      );
    } else {
      setOrganizations((current) => [
        ...current,
        {
          id: `org-${Date.now()}`,
          ...payload,
        },
      ]);
    }

    closeEditor();
  };

  const handleEdit = (org: Organization) => {
    setEntryMode("manual");
    setShowOptions(false);
    setEditingId(org.id);
    setForm({
      name: org.name,
      adminUserId: org.adminUserId,
      adminPassword: org.adminPassword,
      admins: org.admins.toString(),
      candidates: org.candidates.toString(),
      quizzes: org.quizzes.toString(),
      status: org.status,
    });
  };

  const handleStatusToggle = (id: string) => {
    setOrganizations((current) =>
      current.map((org) =>
        org.id === id
          ? {
              ...org,
              status: org.status === "active" ? "inactive" : "active",
            }
          : org
      )
    );
  };

  const handleDelete = (id: string) => {
    setOrganizations((current) => current.filter((org) => org.id !== id));
  };

  const parseCsv = (text: string) => {
    const [headerLine, ...rows] = text
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean);

    if (!headerLine) {
      return [];
    }

    const headers = headerLine.split(",").map((header) => header.trim());

    return rows.map((row, index) => {
      const values = row.split(",").map((value) => value.trim());
      const record = headers.reduce<Record<string, string>>(
        (current, header, headerIndex) => ({
          ...current,
          [header]: values[headerIndex] ?? "",
        }),
        {}
      );

      const name =
        record.name || record.organization || `Imported Organization ${index + 1}`;
      const credentials = credentialsFromName(name);

      return {
        id: `org-csv-${Date.now()}-${index}`,
        name,
        adminUserId: record.adminUserId || credentials.adminUserId,
        adminPassword: record.adminPassword || credentials.adminPassword,
        admins: Number(record.admins) || 1,
        candidates: Number(record.candidates) || 0,
        quizzes: Number(record.quizzes) || 0,
        status:
          record.status?.toLowerCase() === "inactive"
            ? "inactive"
            : ("active" as Status),
      };
    });
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      return;
    }

    const importedOrganizations = parseCsv(await csvFile.text());

    if (importedOrganizations.length) {
      setOrganizations((current) => [...current, ...importedOrganizations]);
      closeEditor();
    }
  };

  const handleSampleDownload = () => {
    const csv =
      "name,adminUserId,adminPassword,admins,candidates,quizzes,status\nDemo Academy,demo-admin,DEMO@2026,1,40,6,active";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "organization-sample.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const updateForm = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <AppShell
      role="super-admin"
      title="Organizations"
      subtitle="Tenant access and status."
    >
      <section className="surface-live rounded-2xl p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
              Tenant Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {organizations.length} organizations, {totals.admins} admins,{" "}
              {totals.candidates} candidates
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 md:w-80">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search organizations"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              />
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptions((current) => !current)}
                className="btn-primary w-full sm:w-auto"
              >
                <Plus size={16} />
                Upload / Add
              </button>

              {showOptions ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => openMode("csv")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <UploadCloud size={16} />
                    CSV Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => openMode("manual")}
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

        {entryMode ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">
                  {entryMode === "csv"
                    ? "CSV Upload"
                    : editingId
                    ? "Edit Organization"
                    : "Manual Entry"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {entryMode === "csv"
                    ? "Import rows and generate admin credentials from the uploaded data."
                    : "Save tenant details and admin login credentials."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={16} />
              </button>
            </div>

            {entryMode === "csv" ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                <label
                  htmlFor="organization-csv"
                  className="flex min-h-24 cursor-pointer flex-col justify-center rounded-xl border border-dashed border-[#1E3A8A]/25 bg-[#1E3A8A]/5 px-5 text-center transition hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/10"
                >
                  <FileUp className="mx-auto text-[#1E3A8A]" size={24} />
                  <span className="mt-2 text-sm font-bold text-slate-950">
                    {csvFile ? csvFile.name : "Choose CSV file"}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    name, adminUserId, adminPassword, admins, candidates,
                    quizzes, status
                  </span>
                  <input
                    id="organization-csv"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setCsvFile(event.target.files?.[0] ?? null)
                    }
                  />
                </label>

                <button
                  type="button"
                  onClick={handleCsvUpload}
                  className="btn-primary"
                >
                  <UploadCloud size={16} />
                  Upload CSV
                </button>

                <button
                  type="button"
                  onClick={handleSampleDownload}
                  className="btn-secondary"
                >
                  <Download size={16} />
                  Sample
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleManualSave}
                className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                <input
                  className="input-soft px-4 py-3"
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Organization name"
                  type="text"
                />
                <input
                  className="input-soft px-4 py-3"
                  value={form.adminUserId}
                  onChange={(event) =>
                    updateForm("adminUserId", event.target.value)
                  }
                  placeholder="Admin user ID"
                  type="text"
                />
                <input
                  className="input-soft px-4 py-3"
                  value={form.adminPassword}
                  onChange={(event) =>
                    updateForm("adminPassword", event.target.value)
                  }
                  placeholder="Admin password"
                  type="text"
                />
                <input
                  className="input-soft px-4 py-3"
                  value={form.admins}
                  onChange={(event) => updateForm("admins", event.target.value)}
                  placeholder="Admins"
                  type="number"
                  min="0"
                />
                <input
                  className="input-soft px-4 py-3"
                  value={form.candidates}
                  onChange={(event) =>
                    updateForm("candidates", event.target.value)
                  }
                  placeholder="Candidates"
                  type="number"
                  min="0"
                />
                <input
                  className="input-soft px-4 py-3"
                  value={form.quizzes}
                  onChange={(event) => updateForm("quizzes", event.target.value)}
                  placeholder="Quizzes"
                  type="number"
                  min="0"
                />
                <select
                  className="input-soft px-4 py-3"
                  value={form.status}
                  onChange={(event) =>
                    updateForm("status", event.target.value as Status)
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button type="submit" className="btn-primary xl:col-span-2">
                  <Save size={16} />
                  {editingId ? "Update Organization" : "Save Organization"}
                </button>
              </form>
            )}
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {[
                  ["name", "Organization"],
                  ["adminUserId", "User ID"],
                  ["adminPassword", "Password"],
                  ["admins", "Admins"],
                  ["candidates", "Candidates"],
                  ["quizzes", "Quizzes"],
                  ["status", "Status"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 font-bold">
                    <button
                      type="button"
                      onClick={() => handleSort(key as SortKey)}
                      className="inline-flex items-center gap-1 font-bold"
                    >
                      {label}
                      {renderSortIcon(key as SortKey)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="text-slate-700">
                  <td className="px-4 py-4 font-semibold text-slate-950">
                    {org.name}
                  </td>
                  <td className="px-4 py-4">{org.adminUserId}</td>
                  <td className="px-4 py-4">{org.adminPassword}</td>
                  <td className="px-4 py-4">{org.admins}</td>
                  <td className="px-4 py-4">{org.candidates}</td>
                  <td className="px-4 py-4">{org.quizzes}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        org.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(org)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(org.id)}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold ${
                          org.status === "active"
                            ? "border-red-100 bg-red-50 text-red-700 hover:bg-red-100"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {org.status === "active" ? <Ban size={14} /> : <ShieldCheck size={14} />}
                        {org.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(org.id)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No organizations found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
