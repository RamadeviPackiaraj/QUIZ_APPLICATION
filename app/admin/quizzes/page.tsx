import { AppShell } from "@/components/layout/AppShell";
import { QuizManagementClient } from "@/components/admin/QuizManagementClient";
import { quizService } from "@/services/mockApi";

export default async function QuizzesPage() {
  const quizzes = await quizService.list();

  return (
    <AppShell title="Quiz Management" subtitle="Choose, search, configure, and publish assessments from one compact workspace.">
      <QuizManagementClient quizzes={quizzes} />
    </AppShell>
  );
}

