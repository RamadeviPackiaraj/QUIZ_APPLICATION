import { AppShell } from "@/components/layout/AppShell";
import { QuestionBankClient } from "@/components/admin/QuestionBankClient";
import { questionService } from "@/services/mockApi";

export default async function QuestionsPage() {
  const questions = await questionService.list();

  return (
    <AppShell title="Questions" subtitle="Manual or CSV question setup.">
      <QuestionBankClient questions={questions} />
    </AppShell>
  );
}

