/* Mobvex Card. default = surface-2 + border. active = translucent accent.
   Radius 18, padding 18 unless `flush` (e.g. for full-bleed media). */
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  active?: boolean;
  flush?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Card({
  active = false,
  flush = false,
  onClick,
  className,
  style,
  children,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "rounded-card border transition-colors duration-150",
        active
          ? "bg-accent-card border-accent-card-border"
          : "bg-surface-2 border-border",
        flush ? "overflow-hidden p-0" : "p-[18px]",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      {children}
    </div>
  );
}
