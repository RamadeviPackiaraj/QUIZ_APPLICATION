"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogIn, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

export function Navbar({
  links = [],
  actionLabel = "Login",
  actionHref = "/login",
}: {
  links?: NavLink[];
  actionLabel?: string;
  actionHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLogout = actionLabel.toLowerCase() === "logout";

  const handleAction = () => {
    if (isLogout) {
      localStorage.removeItem("superAdminAccess");
      localStorage.removeItem("authUser");
      localStorage.removeItem("selectedRole");
    }

    router.push(actionHref);
  };

  const handleNavClick = (href: string) => {
    if (href !== "/student/quiz" || typeof document === "undefined" || document.fullscreenElement) {
      return;
    }

    document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A8A] text-white shadow-sm">
            <GraduationCap size={20} />
          </div>

          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">
              Aptora
            </h1>
            <p className="hidden text-xs text-slate-400 sm:block">
              Assessment Platform
            </p>
          </div>
        </Link>

        {links.length > 0 ? (
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white",
                  pathname === link.href
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleAction}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
        >
          {isLogout ? <LogOut size={16} /> : <LogIn size={16} />}
          {actionLabel}
        </button>
      </nav>
    </header>
  );
}
