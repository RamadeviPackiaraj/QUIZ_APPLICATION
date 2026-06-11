import {
  ClipboardList,
  FileQuestion,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { analyticsService } from "@/services/mockApi";

export default async function AdminDashboard() {
  const dashboard = await analyticsService.dashboard();

  const approvedCandidates = dashboard.metrics.totalStudents;

  const pendingCandidates = 18;
  const totalQuestions = 128;
  const activeQuizzes = 3;

  return (
    <AppShell
      role="admin"
      title="Dashboard"
      subtitle="Candidates, questions, quizzes."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Approved Candidates"
          value={approvedCandidates}
          delta="Eligible for exam"
          icon={ShieldCheck}
        />

        <MetricCard
          label="Pending Approval"
          value={pendingCandidates}
          delta="Awaiting review"
          icon={Users}
        />

        <MetricCard
          label="Question Bank"
          value={totalQuestions}
          delta="Available questions"
          icon={FileQuestion}
        />

        <MetricCard
          label="Active Quizzes"
          value={activeQuizzes}
          delta="Published assessments"
          icon={ClipboardList}
        />
      </div>
    </AppShell>
  );
}
