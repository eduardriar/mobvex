/* Mobvex Button. `primary` is the only solid high-contrast component in the
   system — neon accent fill, Bebas Neue label. Use it sparingly. */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

type Props = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style">;

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent border border-accent",
  secondary:
    "bg-transparent text-muted border border-border hover:text-text hover:border-text active:text-text active:border-text",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-text active:text-text",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  className,
  style,
  disabled = false,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={style}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-input font-display leading-none tracking-[2px]",
        "transition-transform transition-colors duration-150 select-none active:scale-[0.97]",
        size === "sm" ? "px-[18px] py-[10px] text-[16px]" : "px-6 py-4 text-[20px]",
        fullWidth ? "w-full" : "w-auto",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {leadingIcon}
      {children}
    </button>
  );
}
