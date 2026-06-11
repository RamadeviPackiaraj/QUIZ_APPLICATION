"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Shield, User, Users } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [role, setRole] = useState<"super-admin" | "admin" | "candidate">("admin");
  const [accessCode, setAccessCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roleLabel = role === "super-admin" ? "Super Admin" : role === "admin" ? "Admin" : "Candidate";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="soft-grid flex flex-1 items-center justify-center bg-[#F8FAFC] px-4 py-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
              <Shield size={22} />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">Sign in</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Aptora Assessment Platform</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              ["super-admin", Shield, "Super"],
              ["admin", Users, "Admin"],
              ["candidate", User, "Candidate"],
            ].map(([id, Icon, label]) => (
              <button
                key={id as string}
                type="button"
                onClick={() => setRole(id as "super-admin" | "admin" | "candidate")}
                className={`rounded-lg border p-3 text-xs font-bold transition ${
                  role === id
                    ? "border-[#1E3A8A] bg-blue-50 text-[#172554]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="mx-auto mb-2" size={18} />
                {label as string}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {role !== "super-admin" ? (
              <>
                <label className="grid gap-2 text-sm font-bold text-slate-600">
                  Email / Username
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <User size={18} className="text-slate-500" />
                    <input className="w-full bg-transparent text-sm outline-none" placeholder="Enter email or username" />
                  </div>
                </label>

                <label className="grid gap-2 text-sm font-bold text-slate-600">
                  Password
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <LockKeyhole size={18} className="text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Enter password"
                    />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-slate-500">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </>
            ) : null}

            {role === "super-admin" ? (
              <label className="grid gap-2 text-sm font-bold text-slate-600">
                Access Code
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <Shield size={18} className="text-slate-500" />
                  <input
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    placeholder="Enter super admin access code"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
            ) : null}
          </div>

          <button
            onClick={() => {
              if (role === "super-admin") {
                localStorage.setItem("superAdminAccess", accessCode || "super-admin");
                router.push("/super-admin");
                return;
              }

              if (role === "admin") {
                login("admin", "Admin");
                router.push("/admin");
                return;
              }

              login("student", "candidate");
              router.push("/student");
            }}
            className="btn-primary mt-5 w-full"
          >
            Continue as {roleLabel}
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
