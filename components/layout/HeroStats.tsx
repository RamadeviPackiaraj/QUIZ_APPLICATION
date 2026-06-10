import { Card } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";

const stats = [
  { label: "Organizations", value: "24" },
  { label: "Candidates", value: "12.4K" },
  { label: "Assessments", value: "1.8K" },
];

export function HeroStats() {
  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="grid gap-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-xs font-medium tracking-wide text-slate-500">
                {item.label}
              </p>

              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {item.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Analytics */}
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                Analytics
              </p>

              <h3 className="mt-1 text-lg font-semibold">
                Assessment Performance
              </h3>
            </div>

            <BarChart3 size={20} />
          </div>

          {/* Chart */}
          <div className="mt-8 flex h-40 items-end gap-3">
            <div className="h-16 w-full rounded-t-xl bg-blue-400" />
            <div className="h-28 w-full rounded-t-xl bg-blue-500" />
            <div className="h-22 w-full rounded-t-xl bg-blue-600" />
            <div className="h-36 w-full rounded-t-xl bg-blue-400" />
            <div className="h-30 w-full rounded-t-xl bg-blue-500" />
            <div className="h-40 w-full rounded-t-xl bg-blue-600" />
          </div>

          {/* Bottom Metrics */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-xs text-slate-400">Completion</p>
              <p className="mt-1 text-lg font-semibold">94%</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Active Tests</p>
              <p className="mt-1 text-lg font-semibold">128</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Admins</p>
              <p className="mt-1 text-lg font-semibold">82</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}