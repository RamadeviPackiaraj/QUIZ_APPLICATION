export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 md:flex-row">
        <p className="text-sm font-medium text-slate-500">
          © 2026 Aptora
        </p>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-500">
            Secure · Reliable · Assessment Ready
          </span>
        </div>
      </div>
    </footer>
  );
}
