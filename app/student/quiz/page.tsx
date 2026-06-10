import { AppShell } from "@/components/layout/AppShell";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { quizService } from "@/services/mockApi";

export default async function StudentQuizPage() {
  const { quiz, questions } = await quizService.activeQuiz();

  return (
    <AppShell role="student" title="Quiz Attempt" subtitle="Answer questions, track time, and review your progress before submitting.">
      <QuizRunner quiz={quiz} questions={questions} />
    </AppShell>
  );
}

