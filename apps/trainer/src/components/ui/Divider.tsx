/* Mobvex Divider — hairline in the border color, with optional centered label. */
import { cn } from "@/lib/cn";

type Props = {
  label?: string;
  className?: string;
};

export function Divider({ label, className }: Props) {
  if (!label) {
    return <div className={cn("my-4 h-px flex-1 bg-border", className)} />;
  }
  return (
    <div className={cn("my-4 flex items-center gap-4", className)}>
      <div className="h-px flex-1 bg-border" />
      <span className="font-body text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
