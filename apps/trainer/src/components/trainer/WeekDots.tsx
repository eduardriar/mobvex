/* Mobvex Trainer — adherence week dots. */
import { Icon } from "@/components/Icon";
import { DAYS } from "@/lib/data";

type Props = {
  week: boolean[];
  size?: number;
};

export function WeekDots({ week, size = 26 }: Props) {
  return (
    <div className="flex gap-2">
      {week.map((done, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            style={{ width: size, height: size }}
            className={
              "flex items-center justify-center rounded-lg border text-on-accent " +
              (done
                ? "bg-accent border-accent"
                : "bg-surface-2 border-border")
            }
          >
            {done && <Icon name="check" size={15} color="#0A0A0B" />}
          </div>
          <span className="font-body text-[10px] text-muted">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}
