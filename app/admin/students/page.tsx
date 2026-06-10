import { AppShell } from "@/components/layout/AppShell";
import { studentService } from "@/services/mockApi";
import { StudentTable } from "@/components/tables/StudentTable";

export default async function StudentsPage() {
  const students = await studentService.list();

  return (
    <AppShell
      role="admin"
      title="Candidates"
      subtitle="Manage candidate approvals and examination access."
    >
      <StudentTable students={students} />
    </AppShell>
  );
}