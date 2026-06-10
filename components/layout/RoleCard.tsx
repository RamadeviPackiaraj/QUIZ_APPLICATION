import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function RoleCard({
  title,
  description,
  icon: Icon,
}: Props) {
  return (
    <Card
      className="
        group
        rounded-3xl
        border
        border-slate-200
        bg-white/80
        p-4
        backdrop-blur-xl
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-lg
      "
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
        <Icon size={18} />
      </div>

      <h3 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </Card>
  );
}