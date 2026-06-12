"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, Shield } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/components/ui/Toast";
import { authenticateByEmail } from "@/lib/userManagement";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      const session = authenticateByEmail(email, password);
      setLoading(false);

      if (!session) {
        showToast({
          tone: "info",
          title: "Sign in failed",
          message: "Check the email address and password.",
        });
        return;
      }

      login(
        session.user.role === "SUPER_ADMIN"
          ? "super-admin"
          : session.user.role === "ADMIN"
          ? "admin"
          : "candidate",
        session.user.name,
        session.user.email,
        session.user.isFirstLogin
      );
      localStorage.setItem("postPasswordRoute", session.finalRoute);
      showToast({
        tone: "success",
        title: "Signed in",
        message: session.user.isFirstLogin ? "Please change your temporary password." : "Redirecting to your dashboard.",
      });
      router.push(session.route);
    }, 450);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="soft-grid flex flex-1 items-center justify-center bg-[#F8FAFC] px-4 py-8">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Shield size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Sign in</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Aptora Assessment Platform</p>
          </div>

          <form onSubmit={handleSignIn} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Email Address
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#1E3A8A]/50 focus-within:ring-4 focus-within:ring-[#1E3A8A]/10">
                <Mail size={18} className="text-slate-500" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="name@company.com"
                  type="email"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Password
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#1E3A8A]/50 focus-within:ring-4 focus-within:ring-[#1E3A8A]/10">
                <LockKeyhole size={18} className="text-slate-500" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading} className="btn-primary mt-1 w-full disabled:cursor-wait disabled:opacity-70">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
