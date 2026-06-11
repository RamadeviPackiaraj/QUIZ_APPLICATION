import { AppShell } from "@/components/layout/AppShell";
import { studentService } from "@/services/mockApi";
import { StudentTable } from "@/components/tables/StudentTable";

export default async function StudentsPage() {
  const students = await studentService.list();

  return (
    <AppShell
      role="admin"
      title="Candidates"
      subtitle="CSV upload, manual entry, approvals."
    >
      <StudentTable students={students} />
    </AppShell>
  );
}
