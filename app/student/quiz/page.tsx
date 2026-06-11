import { AppShell } from "@/components/layout/AppShell";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { quizService } from "@/services/mockApi";

export default async function StudentQuizPage() {
  const { quiz, questions } = await quizService.activeQuiz();

  return (
    <AppShell role="student" title="Attend Quiz" subtitle="Answer questions, track time, mark review items, and submit confidently.">
      <QuizRunner quiz={quiz} questions={questions} />
    </AppShell>
  );
}

