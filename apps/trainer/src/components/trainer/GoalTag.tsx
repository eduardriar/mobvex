/* Mobvex Trainer — goal tag (decorative category hue). */
import { GOAL_HUE, HUE } from "@/lib/data";
import type { GoalKey } from "@/lib/types";

type Props = {
  goal: GoalKey;
  size?: "sm" | "md";
};

export function GoalTag({ goal, size = "md" }: Props) {
  const h = HUE[GOAL_HUE[goal] ?? "green"];
  const small = size === "sm";
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-badge border font-body font-medium"
      style={{
        padding: small ? "3px 9px" : "5px 11px",
        fontSize: small ? 11 : 12,
        background: h.bg,
        borderColor: h.border,
        color: h.solid,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: h.solid }}
      />
      {goal}
    </span>
  );
}
