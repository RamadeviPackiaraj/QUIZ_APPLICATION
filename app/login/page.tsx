"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyhole,
  UserRound,
  Shield,
  Users,
  User,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [role, setRole] = useState<
    "super-admin" | "admin" | "candidate"
  >("admin");

  const [accessCode, setAccessCode] = useState("");

  return (
    <>
      <Navbar />

      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50 px-4 py-8">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="text-center">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Assessment Platform
            </span>

            <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-3 text-lg text-slate-500">
              Sign in to continue your assessment journey.
            </p>
          </div>

          {/* Roles */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <button
              onClick={() => setRole("super-admin")}
              className={`rounded-2xl border p-4 transition-all ${
                role === "super-admin"
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Shield
                  size={22}
                  className={
                    role === "super-admin"
                      ? "text-purple-600"
                      : "text-slate-500"
                  }
                />

                <span className="font-semibold">
                  Super Admin
                </span>
              </div>
            </button>

            <button
              onClick={() => setRole("admin")}
              className={`rounded-2xl border p-4 transition-all ${
                role === "admin"
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Users
                  size={22}
                  className={
                    role === "admin"
                      ? "text-blue-600"
                      : "text-slate-500"
                  }
                />

                <span className="font-semibold">
                  Admin
                </span>
              </div>
            </button>

            <button
              onClick={() => setRole("candidate")}
              className={`rounded-2xl border p-4 transition-all ${
                role === "candidate"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <User
                  size={22}
                  className={
                    role === "candidate"
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }
                />

                <span className="font-semibold">
                  Candidate
                </span>
              </div>
            </button>
          </div>

          {/* Email */}
          <div className="mt-8">
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              Email / Username
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <UserRound
                size={18}
                className="text-slate-500"
              />

              <input
                className="w-full bg-transparent outline-none"
                placeholder="Enter email or username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-600">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <LockKeyhole
                size={18}
                className="text-slate-500"
              />

              <input
                type="password"
                className="w-full bg-transparent outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Access Code */}
          {role === "super-admin" && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Access Code
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                <Shield
                  size={18}
                  className="text-purple-600"
                />

                <input
                  value={accessCode}
                  onChange={(e) =>
                    setAccessCode(e.target.value)
                  }
                  placeholder="Enter Super Admin Access Code"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
          )}

          {/* Remember Me */}
          <div className="mt-5">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input
                type="checkbox"
                defaultChecked
                className="accent-blue-600"
              />
              Remember me
            </label>
          </div>

          {/* Continue */}
          <button
            onClick={() => {
              if (role === "super-admin") {
                router.push("/super-admin");
                return;
              }

              if (role === "admin") {
                login("admin", "Admin");
                router.push("/admin");
                return;
              }

              login("student", "student");
              router.push("/student");
            }}
            className="
              mt-8
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              py-4
              text-lg
              font-semibold
              text-white
              shadow-lg
              transition-all
              hover:scale-[1.01]
            "
          >
            Continue as{" "}
            {role === "super-admin"
              ? "Super Admin"
              : role === "admin"
              ? "Admin"
              : "Candidate"}
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}