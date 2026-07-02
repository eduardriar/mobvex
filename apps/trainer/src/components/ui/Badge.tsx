/* Mobvex Badge / pill. Translucent accent bg, accent border, accent text.
   `tone="danger"` swaps to the accent2 alert palette. */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  tone?: "accent" | "danger";
  leadingIcon?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "accent", leadingIcon, className, children }: Props) {
  const danger = tone === "danger";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-badge border px-2.5 py-1",
        "font-body text-[11px] font-medium leading-[1.2] tracking-[0.2px]",
        danger
          ? "bg-alert border-alert-border text-accent-2"
          : "bg-accent-badge border-accent-card-border text-accent",
        className,
      )}
    >
      {leadingIcon}
      {children}
    </span>
  );
}
