/* Mobvex Text — the single source of type styling. Pick a `variant`; never
   hand-roll font/size/spacing. Bebas for shout, DM Sans for whisper. */
import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TextVariant =
  | "logo"
  | "title"
  | "displaySubtitle"
  | "subtitle"
  | "body"
  | "label"
  | "cardName"
  | "cardRole"
  | "badge"
  | "hint"
  | "footnote"
  | "link";

const VARIANTS: Record<TextVariant, string> = {
  logo: "font-display text-[42px] font-normal tracking-[2px] text-text",
  title: "font-display text-[36px] font-normal tracking-[1px] text-text",
  displaySubtitle: "font-display text-[28px] font-normal tracking-[1px] text-text",
  subtitle: "font-body text-[15px] font-normal text-muted",
  body: "font-body text-[16px] font-normal text-text",
  label:
    "font-body text-[11px] font-medium tracking-[1.5px] uppercase text-muted",
  cardName: "font-body text-[15px] font-medium text-text",
  cardRole: "font-body text-[12px] font-normal text-muted",
  badge: "font-body text-[11px] font-medium text-accent",
  hint: "font-body text-[13px] font-normal text-accent-2",
  footnote: "font-body text-[12px] font-normal text-muted",
  link: "font-body text-[14px] font-normal text-accent",
};

type Props = {
  variant?: TextVariant;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Text({
  variant = "body",
  as: Tag = "span",
  className,
  style,
  children,
}: Props) {
  return (
    <Tag
      className={cn("m-0 leading-[1.35]", VARIANTS[variant], className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
