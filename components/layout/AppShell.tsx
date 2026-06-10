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
    href: "/super-admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/super-admin/organizations",
    label: "Organizations",
    icon: Building2,
  },
];

const adminNav = [
  {
    href: "/admin",
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
    href: "/student",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/student/quiz",
    label: "Attempt Quiz",
    icon: BookOpen,
  },
  {
    href: "/student/result",
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
  role?: "super-admin" | "admin" | "student";
  title: string;
  subtitle: string;
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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <Navbar
        links={nav.map((item) => ({ href: item.href, label: item.label }))}
        actionLabel={role === "super-admin" ? "Logout" : "Switch Role"}
        actionHref="/login"
      />

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <MotionBlock className="mb-5 border-b border-slate-200 pb-5" delay={0.05}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    {roleLabel}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Active
                  </span>
                </div>

                <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
                  {title}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                  {subtitle}
                </p>
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
