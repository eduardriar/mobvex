/* Mobvex Input. surface-2 fill, border at rest, accent on focus, accent2 +
   hint message on error. Optional uppercase label above. */
"use client";

import { useId, useState } from "react";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label?: string;
  error?: string;
  leadingIcon?: ReactNode;
  containerClassName?: string;
  containerStyle?: CSSProperties;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({
  label,
  error,
  leadingIcon,
  containerClassName,
  containerStyle,
  id,
  className,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const borderColor = error
    ? "border-accent-2"
    : focused
      ? "border-accent"
      : "border-border";

  return (
    <div
      className={cn("flex flex-col gap-2", containerClassName)}
      style={containerStyle}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-[11px] font-medium uppercase tracking-[1.5px] text-muted"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2 rounded-input border bg-surface-2 px-4 transition-colors",
          borderColor,
        )}
      >
        {leadingIcon && (
          <span className="flex text-muted">{leadingIcon}</span>
        )}
        <input
          id={inputId}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "flex-1 border-none bg-transparent py-[14px] font-body text-[16px] text-text outline-none",
            className,
          )}
          {...rest}
        />
      </div>
      {error && (
        <span className="font-body text-[13px] text-accent-2">{error}</span>
      )}
    </div>
  );
}
