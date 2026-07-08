/* Mobvex loading indicator. Centered display-font label for async waits.
   Size the container via `className` (e.g. "h-screen w-screen bg-bg" or "flex-1"). */
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";

type Props = {
  label?: string;
  className?: string;
};

export function LoadingIndicator({ label = COPY.common.loading, className }: Props) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <span className="font-display text-[20px] uppercase tracking-[3px] text-muted">
        {label}
      </span>
    </div>
  );
}
