"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, Shield } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import authApi from "@/services/authApi";

const roleRoute: Record<string, string> = {
  "super-admin": "/super-admin/dashboard",
  "admin": "/admin/dashboard",
  "candidate": "/candidate/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(email, password);

      if (!response.success) {
        showToast({
          tone: "info",
          title: "Sign in failed",
          message: response.message || "Check the email address and password.",
        });
        setLoading(false);
        return;
      }

      const { user, token } = response.data;
      
      // Validate role is in roleRoute (strict - no defaults)
      const frontendRole = user.role as "super-admin" | "admin" | "candidate";
      if (!roleRoute[frontendRole]) {
        throw new Error(`Unauthorized role: ${frontendRole}`);
      }

      // Store auth data
      login(
        frontendRole,
        user.name,
        user.email,
        user.isFirstLogin,
        token,
        user.id
      );

      const finalRoute = roleRoute[frontendRole]!;
      const targetRoute = user.isFirstLogin ? "/change-password" : finalRoute;
      
      localStorage.setItem("postPasswordRoute", finalRoute);

      showToast({
        tone: "success",
        title: "Signed in",
        message: user.isFirstLogin ? "Please change your temporary password." : "Redirecting to your dashboard.",
      });

      setLoading(false);
      router.push(targetRoute);
    } catch (error) {
      console.error("Login error:", error);
      showToast({
        tone: "info",
        title: "Sign in failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
      setLoading(false);
    }
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
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
