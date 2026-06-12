import { z } from "zod";
import type { ManagedUser } from "@/types";

export type ImportIssue = {
  row: number;
  reason: string;
};

export type ImportCandidate = {
  candidateId?: string;
  name: string;
  email: string;
  department?: string;
};

export type ImportAdmin = {
  adminId?: string;
  name: string;
  email: string;
};

export type ImportSummary<T> = {
  totalRecords: number;
  validRecords: number;
  duplicateRecords: number;
  invalidRecords: number;
  validRows: T[];
  issues: ImportIssue[];
};

const candidateSchema = z.object({
  candidateId: z.string().optional(),
  name: z.string().min(1, "Candidate Name is required"),
  email: z.string().email("Invalid Email Format"),
  department: z.string().optional(),
});

const adminSchema = z.object({
  adminId: z.string().optional(),
  name: z.string().min(1, "Admin Name is required"),
  email: z.string().email("Invalid Email Format"),
});

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.split(/\r?\n/).filter((line) => line.trim());
  if (!headerLine) return [];

  const headers = headerLine.split(",").map((header) => header.trim().toLowerCase());

  return lines.map((line, index) => {
    const values = line.split(",").map((value) => value.trim());
    const record = headers.reduce<Record<string, string>>((current, header, headerIndex) => {
      current[header] = values[headerIndex] ?? "";
      return current;
    }, {});

    return {
      rowNumber: index + 2,
      adminId: record.adminid || record["admin id"] || record.id,
      candidateId: record.candidateid || record["candidate id"] || record.id,
      name: record.name || record["candidate name"] || record["admin name"],
      email: record.email || record["email address"],
      department: record.department,
    };
  });
}

export function validateAdminCsv(text: string, existingUsers: ManagedUser[]): ImportSummary<ImportAdmin> {
  console.info("CSV Upload Started");

  const rows = parseCsv(text);
  const existingEmails = new Set(existingUsers.map((user) => user.email.toLowerCase()));
  const existingAdminIds = new Set(existingUsers.map((user) => user.displayId.toLowerCase()));
  const seenEmails = new Set<string>();
  const seenAdminIds = new Set<string>();
  const validRows: ImportAdmin[] = [];
  const issues: ImportIssue[] = [];
  let duplicateRecords = 0;
  let invalidRecords = 0;

  console.info("Records Received", rows.length);

  rows.forEach((row) => {
    const parsed = adminSchema.safeParse({
      adminId: row.adminId || undefined,
      name: row.name,
      email: row.email,
    });

    if (!parsed.success) {
      invalidRecords += 1;
      issues.push({
        row: row.rowNumber,
        reason: parsed.error.issues[0]?.message || "Invalid Record",
      });
      return;
    }

    const emailKey = parsed.data.email.toLowerCase();
    const adminIdKey = parsed.data.adminId?.toLowerCase();
    const duplicateReasons: string[] = [];

    if (seenEmails.has(emailKey)) duplicateReasons.push("Duplicate Admin Email");
    if (existingEmails.has(emailKey)) duplicateReasons.push("Admin Email Already Exists");
    if (adminIdKey && seenAdminIds.has(adminIdKey)) duplicateReasons.push("Duplicate Admin ID");
    if (adminIdKey && existingAdminIds.has(adminIdKey)) duplicateReasons.push("Admin ID Already Exists");

    if (duplicateReasons.length) {
      duplicateRecords += 1;
      issues.push({ row: row.rowNumber, reason: duplicateReasons.join(", ") });
      seenEmails.add(emailKey);
      if (adminIdKey) seenAdminIds.add(adminIdKey);
      return;
    }

    seenEmails.add(emailKey);
    if (adminIdKey) seenAdminIds.add(adminIdKey);
    validRows.push(parsed.data);
  });

  console.info("Records Validated");
  console.info("Duplicates Found", duplicateRecords);
  console.info("Records Imported Successfully", validRows.length);
  console.info("Import Completed");
  console.info("[IMPORT]", {
    TotalRecords: rows.length,
    Valid: validRows.length,
    Duplicate: duplicateRecords,
    Invalid: invalidRecords,
    Imported: validRows.length,
  });

  return {
    totalRecords: rows.length,
    validRecords: validRows.length,
    duplicateRecords,
    invalidRecords,
    validRows,
    issues,
  };
}

export function validateCandidateCsv(text: string, existingUsers: ManagedUser[]): ImportSummary<ImportCandidate> {
  console.info("CSV Upload Started");

  const rows = parseCsv(text);
  const existingEmails = new Set(existingUsers.map((user) => user.email.toLowerCase()));
  const existingCandidateIds = new Set(existingUsers.map((user) => user.displayId.toLowerCase()));
  const seenEmails = new Set<string>();
  const seenCandidateIds = new Set<string>();
  const validRows: ImportCandidate[] = [];
  const issues: ImportIssue[] = [];
  let duplicateRecords = 0;
  let invalidRecords = 0;

  console.info("Records Received", rows.length);

  rows.forEach((row) => {
    const parsed = candidateSchema.safeParse({
      candidateId: row.candidateId || undefined,
      name: row.name,
      email: row.email,
      department: row.department || undefined,
    });

    if (!parsed.success) {
      invalidRecords += 1;
      issues.push({
        row: row.rowNumber,
        reason: parsed.error.issues[0]?.message || "Invalid Record",
      });
      return;
    }

    const emailKey = parsed.data.email.toLowerCase();
    const candidateIdKey = parsed.data.candidateId?.toLowerCase();
    const duplicateReasons: string[] = [];

    if (seenEmails.has(emailKey)) duplicateReasons.push("Duplicate Email");
    if (existingEmails.has(emailKey)) duplicateReasons.push("Email Already Exists");
    if (candidateIdKey && seenCandidateIds.has(candidateIdKey)) duplicateReasons.push("Duplicate Candidate ID");
    if (candidateIdKey && existingCandidateIds.has(candidateIdKey)) duplicateReasons.push("Candidate ID Already Exists");

    if (duplicateReasons.length) {
      duplicateRecords += 1;
      issues.push({ row: row.rowNumber, reason: duplicateReasons.join(", ") });
      seenEmails.add(emailKey);
      if (candidateIdKey) seenCandidateIds.add(candidateIdKey);
      return;
    }

    seenEmails.add(emailKey);
    if (candidateIdKey) seenCandidateIds.add(candidateIdKey);
    validRows.push(parsed.data);
  });

  console.info("Records Validated");
  console.info("Duplicates Found", duplicateRecords);
  console.info("Records Imported Successfully", validRows.length);
  console.info("Import Completed");
  console.info("[IMPORT]", {
    TotalRecords: rows.length,
    Valid: validRows.length,
    Duplicate: duplicateRecords,
    Invalid: invalidRecords,
    Imported: validRows.length,
  });

  return {
    totalRecords: rows.length,
    validRecords: validRows.length,
    duplicateRecords,
    invalidRecords,
    validRows,
    issues,
  };
}

export function buildErrorReport(issues: ImportIssue[]) {
  return issues.map((issue) => `Row ${issue.row}:\n${issue.reason}`).join("\n\n");
}
