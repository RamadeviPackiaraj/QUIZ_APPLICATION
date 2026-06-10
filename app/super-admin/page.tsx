"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  UserPlus,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { organizations } from "@/mock/organizations";

export default function SuperAdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem("superAdminAccess");

    if (!access) {
      router.push("/super-admin");
    }
  }, [router]);

  return (
    <AppShell
      role="super-admin"
      title="Dashboard"
      subtitle="Simple overview of organizations and admin access."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Organizations"
          value={organizations.length.toString()}
          delta={`${organizations.filter((org) => org.status === "active").length} active tenants`}
          icon={Building2}
        />

        <MetricCard
          label="Tenant Admins"
          value={organizations.reduce((total, org) => total + org.admins, 0).toString()}
          delta="Across organizations"
          icon={Users}
        />

        <MetricCard
          label="Candidates"
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
