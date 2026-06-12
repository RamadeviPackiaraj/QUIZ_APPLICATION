import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Medal,
  Users,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MotionBlock } from "@/components/ui/MotionBlock";

const superAdminNav = [
  {
    href: "/super-admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/super-admin/organizations",
    label: "Admins",
    icon: Building2,
  },
];

const adminNav = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/students",
    label: "Candidates",
    icon: Users,
  },
  {
    href: "/admin/questions",
    label: "Question Bank",
    icon: BookOpen,
  },
  {
    href: "/admin/quizzes",
    label: "Quiz Settings",
    icon: ClipboardList,
  },
  {
    href: "/admin/reports",
    label: "Leaderboard",
    icon: BarChart3,
  },
];

const studentNav = [
  {
    href: "/candidate/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/candidate/quiz",
    label: "Attempt Quiz",
    icon: BookOpen,
  },
  {
    href: "/candidate/result",
    label: "Scorecard",
    icon: Medal,
  },
];

export function AppShell({
  children,
  role = "admin",
  title,
  subtitle,
}: {
  children: React.ReactNode;
  role?: "super-admin" | "admin" | "student" | "candidate";
  title: string;
  subtitle?: string;
}) {
  const nav =
    role === "super-admin"
      ? superAdminNav
      : role === "admin"
      ? adminNav
      : studentNav;
  const roleLabel =
    role === "super-admin" ? "Super Admin" : role === "admin" ? "Admin" : "Candidate";

  return (
    <div className="soft-grid flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <Navbar
        links={nav.map((item) => ({ href: item.href, label: item.label }))}
        actionLabel={role === "super-admin" ? "Logout" : "Switch Role"}
        actionHref="/login"
      />

      <main className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <MotionBlock className="mb-4 border-b border-slate-200/80 pb-3" delay={0.05}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="mono-chip">
                    {roleLabel}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Active
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
                  {title}
                </h1>

                {subtitle ? (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <nav className="flex flex-wrap gap-2 md:hidden">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </MotionBlock>

          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
