/* Mobvex Avatar — circular. Initials on a translucent accent disc. */
import { cn } from "@/lib/cn";

type Props = {
  name?: string;
  size?: number;
  active?: boolean;
  className?: string;
};

export function Avatar({ name = "", size = 44, active = false, className }: Props) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full border font-body font-medium",
        "bg-accent-icon text-accent",
        active ? "border-accent-icon-border" : "border-border",
        className,
      )}
    >
      {initials || "?"}
    </div>
  );
}
