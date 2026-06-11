import { AppShell } from "@/components/layout/AppShell";
import { QuizManagementClient } from "@/components/admin/QuizManagementClient";
import { quizService } from "@/services/mockApi";

export default async function QuizzesPage() {
  const quizzes = await quizService.list();

  return (
    <AppShell title="Quiz Settings" subtitle="Configure schedule, passing score, shuffle behavior, and quiz availability.">
      <QuizManagementClient quizzes={quizzes} />
    </AppShell>
  );
}

