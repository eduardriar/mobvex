/* Mobvex Trainer — repository exercise tile (media state, name, equipment,
   edit action). */
"use client";

import { Icon } from "@/components/Icon";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import type { CatalogExercise } from "@/lib/types";

const T = COPY.exercises;

type Props = {
  exercise: CatalogExercise;
  onEdit: () => void;
};

export function ExerciseTile({ exercise, onEdit }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <div
        className={cn(
          "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] border",
          exercise.hasMedia
            ? "bg-accent-icon border-accent-icon-border text-accent"
            : "bg-surface-2 border-border text-muted",
        )}
      >
        <Icon name={exercise.hasMedia ? "camera" : "dumbbell"} size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-[13px] font-medium text-text">
          {exercise.name}
        </div>
        <div className="mt-0.5 font-body text-[11px] text-muted">
          {exercise.equipment}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full border border-border bg-transparent px-[11px] py-1.5 font-body text-[12px] text-muted hover:border-text hover:text-text"
      >
        <Icon name="edit" size={13} />
        {T.editExercise}
      </button>
    </div>
  );
}
