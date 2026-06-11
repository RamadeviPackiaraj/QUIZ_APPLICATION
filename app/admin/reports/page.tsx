import { AppShell } from "@/components/layout/AppShell";
import { LeaderboardClient } from "@/components/admin/LeaderboardClient";
import { resultService } from "@/services/mockApi";

export default async function LeaderboardPage() {
  const results = await resultService.list();

  return (
    <AppShell
      title="Leaderboard"
      subtitle="Ranks, score, accuracy, speed."
    >
      <LeaderboardClient results={results} />
    </AppShell>
  );
}
