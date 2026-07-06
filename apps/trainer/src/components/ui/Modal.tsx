/* Mobvex Modal. Dimmed blurred overlay with a centered surface dialog.
   Content is free-form children. Pass `onClose` to allow dismissing via
   overlay click or Escape; omit it to force a choice inside the dialog. */
"use client";

import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose?: () => void;
  width?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Modal({
  open,
  onClose,
  width = 380,
  className,
  style,
  children,
}: Props) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-w-[calc(100vw-48px)] rounded-card border border-border bg-surface p-[34px] shadow-modal",
          className,
        )}
        style={{ width, ...style }}
      >
        {children}
      </div>
    </div>
  );
}
