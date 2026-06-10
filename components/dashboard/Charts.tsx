"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";

import type { AnalyticsPoint, Result } from "@/types";

const chartCard =
  "group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

export function CompletionChart({
  data,
}: {
  data: AnalyticsPoint[];
}) {
  const totalCompleted = data.reduce(
    (acc, item) => acc + item.completed,
    0
  );

  return (
    <section className={chartCard}>
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-50 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Completion Trend
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Weekly assessment completion analytics
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Total Completed
            </p>

            <p className="mt-2 text-2xl font-black">
              {totalCompleted}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Growth
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-600">
              +18%
            </p>
          </div>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="completionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563EB"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor="#2563EB"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #E2E8F0",
                  background: "#fff",
                }}
              />

              <Area
                type="monotone"
                dataKey="completed"
                stroke="#2563EB"
                fill="url(#completionGradient)"
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export function ScoreDistribution({
  data,
}: {
  data: Result[];
}) {
  return (
    <section className={chartCard}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Score Distribution
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Student performance comparison
          </p>
        </div>

        <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
          <BarChart3 size={20} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Highest
          </p>
          <p className="font-bold">
            95%
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Average
          </p>
          <p className="font-bold">
            84%
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Lowest
          </p>
          <p className="font-bold">
            61%
          </p>
        </div>
      </div>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2563EB"
                />
                <stop
                  offset="100%"
                  stopColor="#60A5FA"
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#E2E8F0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="studentName"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
              }}
            />

            <Bar
              dataKey="percentage"
              fill="url(#scoreGradient)"
              radius={[12, 12, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function PassFailDonut({
  pass,
  fail,
}: {
  pass: number;
  fail: number;
}) {
  const total = pass + fail;

  const passRate =
    total === 0
      ? 0
      : Math.round((pass / total) * 100);

  const data = [
    {
      name: "Pass",
      value: pass,
      color: "#10B981",
    },
    {
      name: "Fail",
      value: fail,
      color: "#EF4444",
    },
  ];

  return (
    <section className={chartCard}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Pass vs Fail
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall assessment outcome
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <PieIcon size={20} />
        </div>
      </div>

      <div className="relative mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={110}
              dataKey="value"
              paddingAngle={5}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Pass Rate
            </p>

            <h3 className="mt-2 text-4xl font-black text-slate-900">
              {passRate}%
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium">
            Pass ({pass})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm font-medium">
            Fail ({fail})
          </span>
        </div>
      </div>
    </section>
  );
}