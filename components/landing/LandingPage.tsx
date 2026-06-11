"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { MotionBlock } from "@/components/ui/MotionBlock";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function LandingPage() {
  return (
    <main className="soft-grid flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <section className="relative flex-1 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            <MotionBlock>
              <div className="mono-chip">
                <ShieldCheck size={14} />
                Secure Assessment Platform
              </div>

              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight text-slate-950 lg:text-7xl">
                Quiz SaaS
                <br />
                for modern
                <br />
                assessments.
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
                Create quizzes, approve candidates, run exams, and publish scoreboards.
              </p>

              <Link
                href="/login"
                className="btn-primary mt-8 px-7 py-4"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </MotionBlock>

            <div className="relative h-[550px] w-full">

              <MotionBlock delay={0.1}>
                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    h-[350px]
                    w-[500px]
                    -translate-x-1/2
                    -translate-y-1/2
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                  "
                >
                  <Image
                    src="/images/image.png"
                    alt="Dashboard"
                    fill
                    className="object-cover"
                  />
                </div>
              </MotionBlock>

              <MotionBlock delay={0.2}>
                <div
                  className="
                    absolute
                    left-0
                    top-48
                    z-20
                    w-56
                    rounded-[20px]
                    bg-white
                    p-3
                    shadow-xl
                  "
                >
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      src="/images/Assessment.png"
                      alt="Assessment"
                      width={300}
                      height={180}
                      className="h-28 w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    Assessments
                  </h3>

                  <p className="text-sm text-slate-500">
                    Create quizzes instantly
                  </p>
                </div>
              </MotionBlock>

              <MotionBlock delay={0.3}>
                <div
                  className="
                    absolute
                    right-0
                    top-10
                    z-20
                    w-56
                    rounded-[20px]
                    bg-white
                    p-3
                    shadow-xl
                  "
                >
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      src="/images/Candidate.png"
                      alt="Candidate"
                      width={300}
                      height={180}
                      className="h-28 w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    Candidates
                  </h3>

                  <p className="text-sm text-slate-500">
                    Invite participants
                  </p>
                </div>
              </MotionBlock>

              <MotionBlock delay={0.4}>
                <div
                  className="
                    absolute
                    right-16
                    bottom-0
                    z-20
                    w-64
                    rounded-[20px]
                    bg-slate-950
                    p-4
                    text-white
                    shadow-2xl
                  "
                >
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      src="/images/Result.png"
                      alt="Result"
                      width={400}
                      height={220}
                      className="h-32 w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-3 text-xl font-bold">
                    Results
                  </h3>

                  <p className="text-blue-100">
                    Real-time analytics
                  </p>
                </div>
              </MotionBlock>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
