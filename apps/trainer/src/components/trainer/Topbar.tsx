/* Mobvex Trainer — topbar (title, subtitle, search, actions, back). */
"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Text } from "@/components/ui/Text";
import { COPY } from "@/lib/copy";

type Props = {
  title: string;
  subtitle?: string;
  search?: string;
  onSearch?: (value: string) => void;
  actions?: ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
};

export function Topbar({
  title,
  subtitle,
  search,
  onSearch,
  actions,
  onBack,
  onMenu,
}: Props) {
  return (
    <header className="flex shrink-0 flex-col gap-4 border-b border-border px-5 py-[22px] lg:flex-row lg:items-center lg:gap-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-4 lg:flex-1 lg:gap-5">
        {onMenu && (
          <button
            type="button"
            onClick={onMenu}
            title={COPY.sidebar.openMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input border border-border bg-surface-2 text-text hover:border-text lg:hidden"
          >
            <Icon name="menu" size={20} />
          </button>
        )}
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
            className="truncate leading-none"
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
                placeholder={COPY.topbar.searchPlaceholder}
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
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3.5 [&>*]:flex-1 lg:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </header>
  );
}
