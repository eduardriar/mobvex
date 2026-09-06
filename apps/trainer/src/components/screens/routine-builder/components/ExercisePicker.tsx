/* Mobvex Trainer — RoutineBuilder's "add exercise" panel: filters the
   trainer's real exercise catalog by muscle group and picks one for the
   selected day. Private to RoutineBuilder. */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import { MUSCLE_GROUPS } from "@/lib/data";
import type { CatalogExercise } from "@/lib/types";

const T = COPY.routineBuilder;

type Props = {
  exercises: CatalogExercise[];
  onPick: (exercise: CatalogExercise) => void;
  onDone: () => void;
};

export function ExercisePicker({ exercises, onPick, onDone }: Props) {
  const [filter, setFilter] = useState<string>(T.filterAll);

  const filtered = exercises.filter(
    (ex) => filter === T.filterAll || ex.muscle === filter,
  );

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="mb-3 font-body text-[11px] uppercase tracking-[1px] text-muted">
        {T.exerciseLibrary}
      </div>

      {exercises.length === 0 ? (
        <div className="font-body text-[13px] text-muted">{T.emptyCatalog}</div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {[T.filterAll, ...MUSCLE_GROUPS].map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setFilter(group)}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 font-body text-[12px] font-medium",
                  filter === group
                    ? "bg-accent-card border-accent-card-border text-accent"
                    : "bg-surface-2 border-border text-muted",
                )}
              >
                {group}
              </button>
            ))}
          </div>
          <div className="flex max-h-[280px] flex-wrap gap-2 overflow-y-auto">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => onPick(ex)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3.5 py-2 font-body text-[13px] text-text hover:border-accent-card-border"
              >
                <Icon
                  name="plus"
                  size={13}
                  style={{ color: "var(--color-accent)" }}
                />
                {ex.name}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-3.5 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onDone}>
          {T.done}
        </Button>
      </div>
    </div>
  );
}
