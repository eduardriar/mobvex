/* Mobvex Trainer — Diet builder (comidas del día con recetas Mobvex). */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import {
  HUE,
  MEAL_SLOTS,
  RECIPES,
  STUDENTS,
  dietFor,
  recipeById,
  studentById,
} from "@/lib/data";
import { cn } from "@/lib/cn";
import type { MealSlot } from "@/lib/types";

type Props = {
  studentId: string;
};

const TAGS = [
  "Todas",
  "Desayuno",
  "Alto en proteína",
  "Bajo en carbos",
  "Snack",
  "Vegetariano",
];

export function DietBuilder({ studentId }: Props) {
  const s = studentById(studentId) ?? STUDENTS[0]!;
  const base = dietFor(s.id);

  const [name, setName] = useState(base.name);
  const [meals, setMeals] = useState<Record<MealSlot, string | null>>({
    ...base.meals,
  });
  const target = base.target;
  const [picking, setPicking] = useState<MealSlot | null>(null);
  const [filter, setFilter] = useState("Todas");
  const [saved, setSaved] = useState(false);

  const totals = MEAL_SLOTS.reduce(
    (acc, slot) => {
      const r = recipeById(meals[slot]);
      if (r) {
        acc.kcal += r.kcal;
        acc.p += r.p;
        acc.c += r.c;
        acc.f += r.f;
      }
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  const setMeal = (slot: MealSlot, id: string) => {
    setMeals((m) => ({ ...m, [slot]: id }));
    setSaved(false);
    setPicking(null);
  };
  const clearMeal = (slot: MealSlot) => {
    setMeals((m) => ({ ...m, [slot]: null }));
    setSaved(false);
  };

  const recipes = RECIPES.filter(
    (r) =>
      filter === "Todas" ||
      r.tag === filter ||
      (filter === "Vegetariano" &&
        (r.tag === "Vegano" || r.tag === "Vegetariano")),
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-[26px]">
      {/* meta row */}
      <div className="mb-6 flex flex-wrap items-end gap-5">
        <Input
          label="Nombre del plan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          containerClassName="w-[320px]"
        />
        <div className="flex gap-[22px] pb-1">
          <DietMeta value={`${totals.kcal}`} label="kcal / día" />
          <DietMeta value={`${totals.p}g`} label="proteína" />
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* meals column */}
        <div className="flex flex-col gap-3.5">
          {MEAL_SLOTS.map((slot) => {
            const r = recipeById(meals[slot]);
            const h = r ? HUE[r.cat] : null;
            return (
              <Card key={slot} style={{ padding: 18 }}>
                <div
                  className={cn(
                    "flex items-center justify-between",
                    r && "mb-3.5",
                  )}
                >
                  <span className="font-body text-[11px] uppercase tracking-[1.5px] text-accent">
                    {slot}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPicking(slot)}
                    leadingIcon={<Icon name={r ? "edit" : "plus"} size={15} />}
                  >
                    {r ? "Cambiar" : "Elegir receta"}
                  </Button>
                </div>
                {r && h && (
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        background: h.bg,
                        borderColor: h.border,
                        color: h.solid,
                      }}
                    >
                      <Icon name="utensils" size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-body text-[15px] font-medium text-text">
                        {r.name}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-3 font-body text-[12px] text-muted">
                        <span>{r.kcal} kcal</span>
                        <span>{r.p}g prot.</span>
                        <span>{r.c}g carb.</span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" size={13} /> {r.time} min
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => clearMeal(slot)}
                      className="flex cursor-pointer border-none bg-transparent p-1.5 text-muted hover:text-accent-2"
                    >
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* right: summary OR picker */}
        {picking ? (
          <Card style={{ padding: 20 }}>
            <div className="mb-3.5 flex items-center justify-between">
              <Text variant="cardName">
                Elegir para {picking.toLowerCase()}
              </Text>
              <button
                type="button"
                onClick={() => setPicking(null)}
                className="flex cursor-pointer border-none bg-transparent text-muted hover:text-text"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilter(t)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 font-body text-[12px] font-medium",
                    filter === t
                      ? "bg-accent-card border-accent-card-border text-accent"
                      : "bg-surface border-border text-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex max-h-[420px] flex-col gap-2.5 overflow-y-auto">
              {recipes.map((r) => {
                const h = HUE[r.cat];
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setMeal(picking, r.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:border-accent-card-border"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border"
                      style={{
                        background: h.bg,
                        borderColor: h.border,
                        color: h.solid,
                      }}
                    >
                      <Icon name="utensils" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-body text-[14px] text-text">
                        {r.name}
                      </div>
                      <div className="mt-0.5 font-body text-[12px] text-muted">
                        {r.kcal} kcal · {r.p}g prot. · {r.tag}
                      </div>
                    </div>
                    <Icon
                      name="plus"
                      size={18}
                      style={{ color: "var(--color-accent)" }}
                    />
                  </button>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card style={{ padding: 22 }}>
            <Text variant="cardName" className="mb-1">
              Resumen diario
            </Text>
            <div className="mb-[22px] font-body text-[12px] text-muted">
              Frente a los objetivos de {s.name.split(" ")[0]}
            </div>

            <Goal label="Calorías" value={totals.kcal} target={target.kcal} unit="kcal" />
            <Goal label="Proteína" value={totals.p} target={target.p} unit="g" />

            <div className="my-5 h-px bg-border" />

            <div className="grid grid-cols-3 gap-3">
              <Macro label="Proteína" value={totals.p} />
              <Macro label="Carbos" value={totals.c} />
              <Macro label="Grasas" value={totals.f} />
            </div>
            <div className="mt-5 flex gap-2.5">
              <Badge>
                {MEAL_SLOTS.filter((sl) => meals[sl]).length}/4 comidas
              </Badge>
              <Badge>
                {Math.round((totals.p * 4) / Math.max(totals.kcal, 1) * 100)}%
                kcal de proteína
              </Badge>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function DietMeta({ value, label }: { value: string; label: string }) {
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

function Goal({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const over = value > target * 1.02;
  return (
    <div className="mb-[18px]">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-body text-[13px] text-text">{label}</span>
        <span className="font-body text-[13px] text-muted">
          <span
            className={cn(
              "font-medium",
              over ? "text-accent-2" : "text-accent",
            )}
          >
            {value}
          </span>{" "}
          / {target} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-surface-2">
        <div
          className={cn(
            "h-full rounded transition-[width] duration-200",
            over ? "bg-accent-2" : "bg-accent",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3.5 text-center">
      <div className="font-display text-[24px] leading-none text-text">
        {value}
        <span className="text-[13px] text-muted">g</span>
      </div>
      <div className="mt-1.5 font-body text-[11px] text-muted">{label}</div>
    </div>
  );
}
