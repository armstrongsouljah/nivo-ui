"use client";

import { useEffect, useRef, createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, Info } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

// ─── Context ──────────────────────────────────────────────────────────────────

const ConfirmContext = createContext<ConfirmFn | null>(null);

// ─── Dialog UI ────────────────────────────────────────────────────────────────

interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

function Dialog({ state, onClose }: { state: DialogState; onClose: (value: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open; close on Escape
  useEffect(() => {
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const variant = state.variant ?? "danger";

  const iconColors = {
    danger:  "bg-red-500/10 text-red-400",
    warning: "bg-amber-500/10 text-amber-400",
    info:    "bg-blue-500/10 text-blue-400",
  };

  const confirmColors = {
    danger:  "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-black",
    info:    "bg-white hover:bg-zinc-200 text-black",
  };

  const Icon = variant === "info" ? Info : AlertTriangle;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      {/* Panel */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={state.message ? "confirm-message" : undefined}
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 mx-4">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-4">
            <span className={`p-2.5 rounded-xl shrink-0 ${iconColors[variant]}`}>
              <Icon size={18} />
            </span>
            <div className="pt-0.5">
              <h2
                id="confirm-title"
                className="text-sm font-black text-white uppercase tracking-wide leading-snug"
              >
                {state.title}
              </h2>
              {state.message && (
                <p id="confirm-message" className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {state.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors uppercase tracking-widest"
            >
              {state.cancelLabel ?? "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => onClose(true)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors uppercase tracking-widest ${confirmColors[variant]}`}
            >
              {state.confirmLabel ?? "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...options, resolve });
    });
  }, []);

  function handleClose(value: boolean) {
    dialog?.resolve(value);
    setDialog(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && <Dialog state={dialog} onClose={handleClose} />}
    </ConfirmContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return fn;
}
