"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LockKeyhole } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/components/ui/Toast";
import { hashPassword } from "@/lib/userManagement";
import { useAuthStore } from "@/store/authStore";

export default function ChangePasswordPage() {
  const router = useRouter();
  const completeFirstLogin = useAuthStore((state) => state.completeFirstLogin);
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      showToast({ tone: "info", title: "Use a stronger password", message: "Password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ tone: "info", title: "Passwords do not match", message: "Confirm password must match the new password." });
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      console.info("[PASSWORD]", "Password changed", { passwordHash: hashPassword(newPassword), is_first_login: false });
      completeFirstLogin();
      showToast({ tone: "success", title: "Password updated", message: "First-login requirement completed." });
      router.push(localStorage.getItem("postPasswordRoute") || "/admin/dashboard");
    }, 450);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar actionLabel="Logout" actionHref="/login" />

      <main className="soft-grid flex flex-1 items-center justify-center bg-[#F8FAFC] px-4 py-8">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">
              <LockKeyhole size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Change password</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Required on first login with temporary credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New Password"
              type="password"
              className="input-soft px-4 py-3 text-sm"
              required
            />
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm Password"
              type="password"
              className="input-soft px-4 py-3 text-sm"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-wait disabled:opacity-70">
              <CheckCircle2 size={16} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
