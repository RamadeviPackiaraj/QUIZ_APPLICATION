import {
  Ban,
  Building2,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { organizations } from "@/mock/organizations";

export default function SuperAdminDashboard() {
  return (
    <AppShell
      role="super-admin"
      title="Dashboard"
      subtitle="Simple overview of organization status and candidate reach."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Organizations"
          value={organizations.length.toString()}
          delta="Tenant directory"
          icon={Building2}
        />

        <MetricCard
          label="Active Organizations"
          value={organizations.filter((org) => org.status === "active").length.toString()}
          delta="Can run assessments"
          icon={CheckCircle2}
        />

        <MetricCard
          label="Inactive Organizations"
          value={organizations.filter((org) => org.status === "inactive").length.toString()}
          delta="Closed or paused"
          icon={Ban}
        />

        <MetricCard
          label="Total Candidates"
          value={organizations
            .reduce((total, org) => total + org.candidates, 0)
            .toLocaleString()}
          delta="Ready for assessments"
          icon={UserPlus}
        />
      </div>
    </AppShell>
  );
}
