import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition",
          styles,
          className
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition",
        styles,
        className
      )}
    >
      {children}
    </button>
  );
}