"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "info";
type Toast = {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
};

const ToastContext = createContext<{
  showToast: (toast: Omit<Toast, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((items) => [...items, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] grid w-[min(360px,calc(100vw-2rem))] gap-2">
        {toasts.map((toast) => {
          const Icon = toast.tone === "success" ? CheckCircle2 : Info;
          return (
            <div key={toast.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
              <div className="flex items-start gap-3">
                <Icon className={toast.tone === "success" ? "text-emerald-600" : "text-slate-950"} size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{toast.title}</p>
                  {toast.message ? <p className="mt-1 text-xs leading-5 text-slate-500">{toast.message}</p> : null}
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
