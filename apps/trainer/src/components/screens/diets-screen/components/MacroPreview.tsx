/* Mobvex Trainer — running macro-total cell shown under the ingredients
   builder (value in display type, unit and label whispered). */
"use client";

type Props = {
  label: string;
  value: number;
  unit: string;
};

export function MacroPreview({ label, value, unit }: Props) {
  return (
    <div className="rounded-card border border-border bg-surface-2 px-3.5 py-3 text-center">
      <div className="font-display text-[22px] leading-none text-accent">
        {value}
        <span className="text-[12px] text-muted"> {unit}</span>
      </div>
      <div className="mt-1.5 font-body text-[11px] text-muted">{label}</div>
    </div>
  );
}
