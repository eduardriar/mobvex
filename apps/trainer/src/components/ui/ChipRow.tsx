/* Mobvex single-select chip row. Inactive chips are muted; the active chip
   uses the translucent accent treatment. */
"use client";

import { cn } from "@/lib/cn";

type Props<Option extends string> = {
  options: readonly Option[];
  value: Option;
  onSelect: (option: Option) => void;
};

export function ChipRow<Option extends string>({
  options,
  value,
  onSelect,
}: Props<Option>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-2 font-body text-[13px]",
              active
                ? "bg-accent-card border-accent-card-border text-accent"
                : "bg-surface-2 border-border text-muted",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
