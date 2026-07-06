/* Mobvex Trainer — Routine builder (weekly split, día → ejercicios). */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DAYS, STUDENTS, routineFor, studentById } from "@/lib/data";
import { cn } from "@/lib/cn";
import type { DayKey, Exercise, RoutineDay } from "@/lib/types";

const EXERCISE_LIBRARY = [
  "Sentadilla",
  "Peso muerto",
  "Press banca",
  "Press militar",
  "Remo con barra",
  "Jalón al pecho",
  "Dominadas",
  "Zancadas",
  "Prensa",
  "Curl bíceps",
  "Extensión tríceps",
  "Elevación lateral",
  "Hip thrust",
  "Plancha",
  "Face pull",
];

type Props = {
  studentId: string;
};

const cellInput = (center = false) =>
  cn(
    "w-full rounded-[10px] border border-border bg-surface px-3 py-[9px] font-body text-[14px] text-text outline-none focus:border-accent",
    center && "text-center",
  );

export function RoutineBuilder({ studentId }: Props) {
  const s = studentById(studentId) ?? STUDENTS[0]!;
  const base = routineFor(s.id);

  const [name, setName] = useState(base.name);
  const [days, setDays] = useState<Record<DayKey, RoutineDay | null>>(() =>
    JSON.parse(JSON.stringify(base.days)),
  );
  const firstActive = DAYS.find((d) => days[d]) ?? "Lun";
  const [sel, setSel] = useState<DayKey>(firstActive);
  const [adderOpen, setAdderOpen] = useState(false);
  const [saved, setSaved] = useState(false);

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
      n[sel] = n[sel] ? null : { focus: "Nuevo bloque", ex: [] };
    });
  const setFocus = (v: string) =>
    update((n) => {
      const d = n[sel];
      if (d) d.focus = v;
    });
  const addEx = (exName: string) =>
    update((n) => {
      if (!n[sel]) n[sel] = { focus: "Nuevo bloque", ex: [] };
      n[sel]!.ex.push({ name: exName, sets: 4, reps: "10", kg: 0 });
    });
  const removeEx = (i: number) =>
    update((n) => {
      n[sel]!.ex.splice(i, 1);
    });
  const editEx = (i: number, key: keyof Exercise, v: string) =>
    update((n) => {
      n[sel]!.ex[i]![key] = v;
    });

  const activeDays = DAYS.filter((d) => days[d]).length;
  const totalEx = DAYS.reduce((a, d) => a + (days[d]?.ex.length ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-[26px]">
      {/* meta row */}
      <div className="mb-6 flex flex-wrap items-end gap-5">
        <Input
          label="Nombre de la rutina"
          value={name}
          onChange={(e) => setName(e.target.value)}
          containerClassName="w-[320px]"
        />
        <div className="flex gap-[22px] pb-1">
          <Meta value={`${activeDays}`} label="días/semana" />
          <Meta value={`${totalEx}`} label="ejercicios" />
        </div>
        <div className="ml-auto flex items-center gap-3 pb-0.5">
          {saved && (
            <span className="inline-flex items-center gap-1.5 font-body text-[13px] text-accent">
              <Icon name="check" size={16} /> Asignada a {s.name.split(" ")[0]}
            </span>
          )}
          <Button
            variant="primary"
            onClick={() => setSaved(true)}
            leadingIcon={<Icon name="check" size={18} color="#0A0A0B" />}
          >
            Guardar y asignar
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
                {has ? days[d]!.focus : "Descanso"}
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
              {sel} es un día de descanso.
            </div>
            <Button
              variant="secondary"
              onClick={toggleRest}
              leadingIcon={<Icon name="plus" size={16} />}
            >
              Añadir entrenamiento
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
                Marcar descanso
              </button>
            </div>

            {/* column headers */}
            <div className="grid grid-cols-[28px_1fr_90px_90px_100px_40px] gap-3.5 border-b border-border px-1 pb-2.5">
              {["", "Ejercicio", "Series", "Reps", "Carga", ""].map((h, i) => (
                <span
                  key={i}
                  className="font-body text-[11px] uppercase tracking-[1px] text-muted"
                >
                  {h}
                </span>
              ))}
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
                  <input
                    value={e.name}
                    onChange={(ev) => editEx(i, "name", ev.target.value)}
                    className={cellInput()}
                  />
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
                    <span className="font-body text-[12px] text-muted">kg</span>
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
                  Aún no hay ejercicios en este día.
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
                  Añadir ejercicio
                </Button>
              ) : (
                <div className="rounded-card border border-border bg-surface p-4">
                  <div className="mb-3 font-body text-[11px] uppercase tracking-[1px] text-muted">
                    Biblioteca de ejercicios
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_LIBRARY.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => addEx(ex)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3.5 py-2 font-body text-[13px] text-text hover:border-accent-card-border"
                      >
                        <Icon
                          name="plus"
                          size={13}
                          style={{ color: "var(--color-accent)" }}
                        />{" "}
                        {ex}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3.5 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdderOpen(false)}
                    >
                      Listo
                    </Button>
                  </div>
                </div>
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
