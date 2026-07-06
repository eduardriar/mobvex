/* Mobvex Trainer — topbar (title, subtitle, search, actions, back). */
"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Text } from "@/components/ui/Text";

type Props = {
  title: string;
  subtitle?: string;
  search?: string;
  onSearch?: (value: string) => void;
  actions?: ReactNode;
  onBack?: () => void;
};

export function Topbar({
  title,
  subtitle,
  search,
  onSearch,
  actions,
  onBack,
}: Props) {
  return (
    <header className="flex shrink-0 items-center gap-5 border-b border-border px-8 py-[22px]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input border border-border bg-surface-2 text-text hover:border-text"
        >
          <Icon name="arrowLeft" size={20} />
        </button>
      )}
      <div className="min-w-0">
        <Text
          variant="title"
          as="h1"
          className="whitespace-nowrap leading-none"
          style={{ fontSize: 32 }}
        >
          {title}
        </Text>
        {subtitle && (
          <div className="mt-1.5 font-body text-[14px] text-muted">
            {subtitle}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3.5">
        {onSearch && (
          <div className="hidden h-11 w-[260px] items-center gap-2.5 rounded-input border border-border bg-surface-2 px-3.5 md:flex">
            <Icon name="search" size={18} style={{ color: "var(--color-muted)" }} />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar alumno"
              className="flex-1 border-none bg-transparent font-body text-[14px] text-text outline-none"
            />
          </div>
        )}
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-input border border-border bg-surface-2 text-muted hover:text-text"
        >
          <Icon name="bell" size={20} />
          <span className="absolute right-[11px] top-2.5 h-[7px] w-[7px] rounded-full bg-accent" />
        </button>
        {actions}
      </div>
    </header>
  );
}
