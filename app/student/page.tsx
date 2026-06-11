import { AppShell } from "@/components/layout/AppShell";
import { StudentDashboardClient } from "@/components/student/StudentDashboardClient";
import { quizService, resultService } from "@/services/mockApi";

export default async function StudentDashboard() {
  const quizzes = await quizService.list();
  const results = await resultService.list();
  const result = results[1];

  return (
    <AppShell role="student" title="Candidate Dashboard" subtitle="Quiz access and score summary.">
      <StudentDashboardClient quizzes={quizzes} result={result} />
    </AppShell>
  );
}

