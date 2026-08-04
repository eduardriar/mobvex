/* Mobvex Trainer — Routine builder (weekly split, día → ejercicios), backed
   by the DB: loads the student's active weekly plan and saves the built one
   as one routine per active day. */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useExercises } from "@/hooks/useExercises";
import { useRoutine } from "@/hooks/useRoutine";
import { DAYS, STUDENTS, studentById } from "@/lib/data";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import type { CatalogExercise, DayKey, Exercise, RoutineDay } from "@/lib/types";
import { ExercisePicker } from "./routine-builder/components/ExercisePicker";

const T = COPY.routineBuilder;

type Props = {
  studentId: string;
};

const emptyDays = (): Record<DayKey, RoutineDay | null> => ({
  Lun: null,
  Mar: null,
  Mié: null,
  Jue: null,
  Vie: null,
  Sáb: null,
  Dom: null,
});

const cellInput = (center = false) =>
  cn(
    "w-full rounded-[10px] border border-border bg-surface px-3 py-[9px] font-body text-[14px] text-text outline-none focus:border-accent",
    center && "text-center",
  );

export function RoutineBuilder({ studentId }: Props) {
  const s = studentById(studentId) ?? STUDENTS[0]!;
  const {
    routine,
    loading: routineLoading,
    error: routineError,
    save,
  } = useRoutine(s.id);
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
  } = useExercises();

  const [name, setName] = useState("");
  const [days, setDays] = useState<Record<DayKey, RoutineDay | null>>(emptyDays);
  const [initialized, setInitialized] = useState(false);
  const [sel, setSel] = useState<DayKey>("Lun");
  const [adderOpen, setAdderOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed the editable state once from the student's active plan (or a fresh
  // one when none exists yet). Deep-clone so edits never mutate the loaded
  // reference directly.
  useEffect(() => {
    if (routineLoading || initialized) return;
    setName(routine?.name || T.defaultPlanName);
    const seeded: Record<DayKey, RoutineDay | null> = routine
      ? JSON.parse(JSON.stringify(routine.days))
      : emptyDays();
    setDays(seeded);
    setSel(DAYS.find((d) => seeded[d]) ?? "Lun");
    setInitialized(true);
  }, [routineLoading, initialized, routine]);

  const day = days[sel];

  const update = (fn: (next: Record<DayKey, RoutineDay | null>) => void) => {
    setDays((prev) => {
      const next: Record<DayKey, RoutineDay | null> = JSON.parse(
        JSON.stringify(prev),
      );
      fn(next);
      return next;
    });
    setSaved(false);
  };

  const toggleRest = () =>
    update((n) => {
      n[sel] = n[sel] ? null : { focus: T.newBlockFocus, ex: [] };
    });
  const setFocus = (v: string) =>
    update((n) => {
      const d = n[sel];
      if (d) d.focus = v;
    });
  const addEx = (exercise: CatalogExercise) =>
    update((n) => {
      if (!n[sel]) n[sel] = { focus: T.newBlockFocus, ex: [] };
      n[sel]!.ex.push({
        exerciseId: exercise.id,
        name: exercise.name,
        sets: 4,
        reps: "10",
        kg: 0,
      });
    });
  const removeEx = (i: number) =>
    update((n) => {
      n[sel]!.ex.splice(i, 1);
    });
  const editEx = (
    i: number,
    key: Exclude<keyof Exercise, "exerciseId" | "name">,
    v: string,
  ) =>
    update((n) => {
      n[sel]!.ex[i]![key] = v;
    });

  const activeDays = DAYS.filter((d) => days[d]).length;
  const totalEx = DAYS.reduce((a, d) => a + (days[d]?.ex.length ?? 0), 0);

  const submit = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const error = await save({ name, days });
    setSaving(false);
    if (error) setSaveError(error);
    else setSaved(true);
  };

  if (routineLoading || exercisesLoading) {
    return <LoadingIndicator className="flex-1" label={T.loading} />;
  }

  const loadError = routineError ?? exercisesError;
  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center px-8">
        <span className="font-body text-[14px] text-accent-2">{loadError}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-[26px]">
      {/* meta row */}
      <div className="mb-6 flex flex-wrap items-end gap-5">
        <Input
          label={T.planNameLabel}
          value={name}
          onChange={(e) => setName(e.target.value)}
          containerClassName="w-[320px]"
        />
        <div className="flex gap-[22px] pb-1">
          <Meta value={`${activeDays}`} label={T.daysPerWeek} />
          <Meta value={`${totalEx}`} label={T.exercisesMeta} />
        </div>
        <div className="ml-auto flex items-center gap-3 pb-0.5">
          {saveError && (
            <span className="font-body text-[13px] text-accent-2">
              {saveError}
            </span>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1.5 font-body text-[13px] text-accent">
              <Icon name="check" size={16} />{" "}
              {T.assignedTo(s.name.split(" ")[0] ?? s.name)}
            </span>
          )}
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => void submit()}
            leadingIcon={<Icon name="check" size={18} color="#0A0A0B" />}
          >
            {saving ? T.saving : T.saveAssign}
          </Button>
        </div>
      </div>

      {/* day tabs */}
      <div className="mb-5 grid grid-cols-7 gap-2.5">
        {DAYS.map((d) => {
          const active = sel === d;
          const has = !!days[d];
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                setSel(d);
                setAdderOpen(false);
              }}
              className={cn(
                "cursor-pointer rounded-card border px-2.5 py-3.5 text-left transition-colors duration-150",
                active
                  ? "bg-accent-card border-accent-card-border"
                  : "bg-surface-2 border-border",
              )}
            >
              <div
                className={cn(
                  "font-display text-[20px] leading-none tracking-[1px]",
                  active ? "text-accent" : "text-text",
                )}
              >
                {d}
              </div>
              <div
                className={cn(
                  "mt-1.5 truncate font-body text-[11px] text-muted",
                  !has && "opacity-55",
                )}
              >
                {has ? days[d]!.focus : T.restDayTabLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* day editor */}
      <Card style={{ padding: 24 }}>
        {!day ? (
          <div className="px-5 py-10 text-center">
            <div className="mb-[18px] font-body text-[15px] text-muted">
              {T.restDay(sel)}
            </div>
            <Button
              variant="secondary"
              onClick={toggleRest}
              leadingIcon={<Icon name="plus" size={16} />}
            >
              {T.addWorkout}
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-5 flex items-center gap-3.5">
              <input
                value={day.focus}
                onChange={(e) => setFocus(e.target.value)}
                className="flex-1 border-b border-transparent bg-transparent font-display text-[26px] tracking-[0.5px] text-text outline-none focus:border-b-accent"
              />
              <button
                type="button"
                onClick={toggleRest}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-input border border-border bg-transparent px-3.5 py-2 font-body text-[13px] text-muted hover:text-text"
              >
                {T.markRest}
              </button>
            </div>

            {/* column headers */}
            <div className="grid grid-cols-[28px_1fr_90px_90px_100px_40px] gap-3.5 border-b border-border px-1 pb-2.5">
              {["", T.colExercise, T.colSets, T.colReps, T.colWeight, ""].map(
                (h, i) => (
                  <span
                    key={i}
                    className="font-body text-[11px] uppercase tracking-[1px] text-muted"
                  >
                    {h}
                  </span>
                ),
              )}
            </div>

            {/* exercise rows */}
            <div className="flex flex-col">
              {day.ex.map((e, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[28px_1fr_90px_90px_100px_40px] items-center gap-3.5 border-b border-border px-1 py-3"
                >
                  <span className="flex text-muted">
                    <Icon name="grip" size={18} />
                  </span>
                  <span className="truncate font-body text-[14px] text-text">
                    {e.name}
                  </span>
                  <input
                    value={e.sets}
                    onChange={(ev) => editEx(i, "sets", ev.target.value)}
                    className={cellInput(true)}
                  />
                  <input
                    value={e.reps}
                    onChange={(ev) => editEx(i, "reps", ev.target.value)}
                    className={cellInput(true)}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      value={e.kg}
                      onChange={(ev) => editEx(i, "kg", ev.target.value)}
                      className={cellInput(true)}
                    />
                    <span className="font-body text-[12px] text-muted">
                      {T.kgUnit}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEx(i)}
                    className="flex cursor-pointer justify-center border-none bg-transparent text-muted hover:text-accent-2"
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              ))}
              {day.ex.length === 0 && (
                <div className="px-1 py-6 font-body text-[14px] text-muted">
                  {T.emptyDay}
                </div>
              )}
            </div>

            {/* adder */}
            <div className="mt-[18px]">
              {!adderOpen ? (
                <Button
                  variant="secondary"
                  onClick={() => setAdderOpen(true)}
                  leadingIcon={<Icon name="plus" size={16} />}
                >
                  {T.addExercise}
                </Button>
              ) : (
                <ExercisePicker
                  exercises={exercises}
                  onPick={addEx}
                  onDone={() => setAdderOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Meta({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[28px] leading-none text-accent">
        {value}
      </div>
      <div className="mt-1.5 font-body text-[11px] uppercase tracking-[1px] text-muted">
        {label}
      </div>
    </div>
  );
}
