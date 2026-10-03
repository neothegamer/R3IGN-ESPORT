"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
};

type AlertOptions = {
  title?: string;
  message: string;
  okLabel?: string;
};

type DialogContextValue = {
  confirm: (opts: ConfirmOptions | string) => Promise<boolean>;
  alert: (opts: AlertOptions | string) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useR3ignDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useR3ignDialog must be used within R3ignDialogProvider");
  }
  return ctx;
}

type Mode =
  | { kind: "confirm"; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: "alert"; opts: AlertOptions; resolve: () => void }
  | null;

export default function R3ignDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>(null);
  const [mounted, setMounted] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mode) return;
    const t = window.setTimeout(() => okRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode.kind === "confirm") mode.resolve(false);
        else mode.resolve();
        setMode(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  const confirm = useCallback((input: ConfirmOptions | string) => {
    const opts: ConfirmOptions =
      typeof input === "string" ? { message: input } : input;
    return new Promise<boolean>((resolve) => {
      setMode({ kind: "confirm", opts, resolve });
    });
  }, []);

  const alert = useCallback((input: AlertOptions | string) => {
    const opts: AlertOptions =
      typeof input === "string" ? { message: input } : input;
    return new Promise<void>((resolve) => {
      setMode({ kind: "alert", opts, resolve });
    });
  }, []);

  const closeConfirm = (value: boolean) => {
    if (mode?.kind === "confirm") mode.resolve(value);
    setMode(null);
  };

  const closeAlert = () => {
    if (mode?.kind === "alert") mode.resolve();
    setMode(null);
  };

  const title =
    mode?.kind === "confirm"
      ? mode.opts.title || "Confirm"
      : mode?.kind === "alert"
        ? mode.opts.title || "Notice"
        : "";
  const message = mode?.opts.message || "";
  const confirmLabel =
    mode?.kind === "confirm" ? mode.opts.confirmLabel || "OK" : "OK";
  const cancelLabel =
    mode?.kind === "confirm" ? mode.opts.cancelLabel || "Cancel" : "";
  const okLabel = mode?.kind === "alert" ? mode.opts.okLabel || "OK" : "OK";

  const overlay =
    mounted &&
    mode &&
    createPortal(
      <div
        className="r3ign-confirm-overlay is-open"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (mode.kind === "confirm") closeConfirm(false);
            else closeAlert();
          }
        }}
      >
        <div
          className="r3ign-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="r3ign-dialog-title"
          aria-describedby="r3ign-dialog-message"
        >
          <h3 className="r3ign-confirm__title" id="r3ign-dialog-title">
            {title}
          </h3>
          <p className="r3ign-confirm__message" id="r3ign-dialog-message">
            {message}
          </p>
          <div className="r3ign-confirm__actions">
            {mode.kind === "confirm" && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => closeConfirm(false)}
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              ref={okRef}
              onClick={() =>
                mode.kind === "confirm" ? closeConfirm(true) : closeAlert()
              }
            >
              {mode.kind === "confirm" ? confirmLabel : okLabel}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {overlay}
    </DialogContext.Provider>
  );
}
