export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 md:flex-row">
        <p className="text-sm font-semibold text-slate-500">&copy; 2026 Aptora</p>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-500">
            Secure &middot; Reliable &middot; Assessment Ready
          </span>
        </div>
      </div>
    </footer>
  );
}
