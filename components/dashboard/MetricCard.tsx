import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { MotionBlock } from "@/components/ui/MotionBlock";

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta: string;
  icon: LucideIcon;
}) {
  return (
    <MotionBlock>
      <article
        className="
          group
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-slate-200/90
          bg-white/95
          p-6
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-xl
          hover:shadow-slate-200
        "
      >
        {/* Background Glow */}
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-slate-100 blur-3xl opacity-70 transition-all duration-500 group-hover:scale-125" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-500">
              {label}
            </p>

            <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {value}
            </h3>

            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
              <ArrowUpRight size={14} />
              {delta}
            </div>
          </div>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-xl
              bg-slate-950
              text-white
              shadow-lg
              shadow-slate-300/40
              transition-transform
              duration-300
              group-hover:scale-110
              group-hover:rotate-3
            "
          >
            <Icon size={24} />
          </div>
        </div>

        {/* Bottom Progress Accent */}
        <div className="relative z-10 mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="
                h-full
                w-3/4
                rounded-full
                bg-slate-950
              "
            />
          </div>
        </div>
      </article>
    </MotionBlock>
  );
}
