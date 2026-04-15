"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);
const TOAST_DURATION_MS = 2800;

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      type,
    });
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  const toastMarkup =
    typeof document !== "undefined" && toast
      ? createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-end px-4">
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
                toast.type === "error"
                  ? "border-rose-200 bg-rose-50/95 text-rose-900"
                  : "border-emerald-200 bg-emerald-50/95 text-emerald-900"
              }`}
              role="status"
              aria-live="polite"
            >
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={dismissToast}
                className="rounded-full px-1 text-lg leading-none text-current/60 transition hover:text-current"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastMarkup}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
