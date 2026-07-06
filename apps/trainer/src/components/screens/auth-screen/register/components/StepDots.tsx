"use client";

type Props = { step: number; total: number };

export function StepDots({ step, total }: Props) {
  return (
    <div className="mb-1 flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-colors duration-150"
          style={{ background: i <= step ? "var(--color-accent)" : "var(--color-border)" }}
        />
      ))}
    </div>
  );
}
