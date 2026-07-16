/* Mobvex Trainer — Diet builder (comidas del día con recetas Mobvex), backed
   by the DB: loads the student's active plan and saves the built one. */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Text } from "@/components/ui/Text";
import { useDiet } from "@/hooks/useDiet";
import { useRecipes } from "@/hooks/useRecipes";
import {
  DEFAULT_DIET_TARGET,
  HUE,
  MEAL_CATEGORIES,
  MEAL_SLOTS,
  STUDENTS,
  studentById,
} from "@/lib/data";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import type { MealSlot } from "@/lib/types";

const T = COPY.dietBuilder;

type Props = {
  studentId: string;
};

const emptyMeals = (): Record<MealSlot, string[]> => ({
  Desayuno: [],
  Comida: [],
  Cena: [],
  Snack: [],
});

export function DietBuilder({ studentId }: Props) {
  const s = studentById(studentId) ?? STUDENTS[0]!;
  const { recipes, loading: recipesLoading, error: recipesError } = useRecipes();
  const { diet, loading: dietLoading, error: dietError, save } = useDiet(s.id);

  const [name, setName] = useState("");
  const [meals, setMeals] = useState<Record<MealSlot, string[]>>(emptyMeals);
  const [initialized, setInitialized] = useState(false);
  const [picking, setPicking] = useState<MealSlot | null>(null);
  const [filter, setFilter] = useState<string>(T.filterAll);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed the editable state once from the student's active plan (or a fresh
  // one when none exists yet).
  useEffect(() => {
    if (dietLoading || initialized) return;
    setName(diet?.name ?? T.defaultPlanName);
    const seeded = emptyMeals();
    if (diet) {
      for (const slot of MEAL_SLOTS) seeded[slot] = [...diet.meals[slot].options];
    }
    setMeals(seeded);
    setInitialized(true);
  }, [dietLoading, initialized, diet]);

  const target = diet?.target ?? DEFAULT_DIET_TARGET;
  const recipeById = (id: string | null) =>
    id ? recipes.find((r) => r.id === id) : undefined;

  // Daily totals count only each slot's default (first) option — the extra
  // options are equivalents the student picks between, not additional food.
  const totals = MEAL_SLOTS.reduce(
    (acc, slot) => {
      const r = recipeById(meals[slot][0] ?? null);
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

  const addOption = (slot: MealSlot, id: string) => {
    setMeals((m) =>
      m[slot].includes(id) ? m : { ...m, [slot]: [...m[slot], id] },
    );
    setSaved(false);
    setPicking(null);
  };
  const removeOption = (slot: MealSlot, id: string) => {
    setMeals((m) => ({ ...m, [slot]: m[slot].filter((r) => r !== id) }));
    setSaved(false);
  };

  const submit = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const error = await save({ name, target, meals });
    setSaving(false);
    if (error) setSaveError(error);
    else setSaved(true);
  };

  const filtered = recipes.filter(
    (r) => filter === T.filterAll || r.meal === filter,
  );

  if (recipesLoading || dietLoading) {
    return <LoadingIndicator className="flex-1" label={T.loading} />;
  }

  const loadError = recipesError ?? dietError;
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
          <DietMeta value={`${totals.kcal}`} label={T.kcalPerDay} />
          <DietMeta value={`${totals.p}g`} label={T.proteinMeta} />
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* meals column */}
        <div className="flex flex-col gap-3.5">
          {MEAL_SLOTS.map((slot) => {
            const options = meals[slot]
              .map((id) => recipeById(id))
              .filter((r) => r !== undefined);
            return (
              <Card key={slot} style={{ padding: 18 }}>
                <div
                  className={cn(
                    "flex items-center justify-between",
                    options.length > 0 && "mb-3.5",
                  )}
                >
                  <span className="font-body text-[11px] uppercase tracking-[1.5px] text-accent">
                    {slot}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPicking(slot)}
                    leadingIcon={<Icon name="plus" size={15} />}
                  >
                    {options.length > 0 ? T.addOption : T.chooseRecipe}
                  </Button>
                </div>
                <div className="flex flex-col gap-3.5">
                  {options.map((r, optionIndex) => {
                    const h = HUE[r.cat];
                    return (
                      <div key={r.id} className="flex items-center gap-3.5">
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
                          <div className="flex items-center gap-2.5 font-body text-[15px] font-medium text-text">
                            <span className="truncate">{r.name}</span>
                            {optionIndex === 0 && (
                              <Badge>{T.defaultOption}</Badge>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-3 font-body text-[12px] text-muted">
                            <span>
                              {r.kcal} {T.kcalUnit}
                            </span>
                            <span>{T.proteinShort(r.p)}</span>
                            <span>{T.carbsShort(r.c)}</span>
                            <span className="inline-flex items-center gap-1">
                              <Icon name="clock" size={13} />{" "}
                              {T.minBadge(r.time)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          title={T.removeRecipe}
                          onClick={() => removeOption(slot, r.id)}
                          className="flex cursor-pointer border-none bg-transparent p-1.5 text-muted hover:text-accent-2"
                        >
                          <Icon name="x" size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* right: summary OR picker */}
        {picking ? (
          <Card style={{ padding: 20 }}>
            <div className="mb-3.5 flex items-center justify-between">
              <Text variant="cardName">{T.chooseFor(picking)}</Text>
              <button
                type="button"
                onClick={() => setPicking(null)}
                className="flex cursor-pointer border-none bg-transparent text-muted hover:text-text"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {[T.filterAll, ...MEAL_CATEGORIES].map((t) => (
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
              {filtered.map((r) => {
                const h = HUE[r.cat];
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => addOption(picking, r.id)}
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
                        {r.kcal} {T.kcalUnit} · {T.proteinShort(r.p)} · {r.tag}
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
              {T.dailySummary}
            </Text>
            <div className="mb-[22px] font-body text-[12px] text-muted">
              {T.vsGoals(s.name.split(" ")[0] ?? s.name)}
            </div>

            <Goal
              label={T.calories}
              value={totals.kcal}
              target={target.kcal}
              unit={T.kcalUnit}
            />
            <Goal
              label={T.protein}
              value={totals.p}
              target={target.p}
              unit={COPY.diets.form.macros.gramsUnit}
            />

            <div className="my-5 h-px bg-border" />

            <div className="grid grid-cols-3 gap-3">
              <Macro label={T.protein} value={totals.p} />
              <Macro label={T.carbs} value={totals.c} />
              <Macro label={T.fat} value={totals.f} />
            </div>
            <div className="mt-5 flex gap-2.5">
              <Badge>
                {T.mealsCount(
                  MEAL_SLOTS.filter((sl) => meals[sl].length > 0).length,
                  MEAL_SLOTS.length,
                )}
              </Badge>
              <Badge>
                {T.proteinPct(
                  Math.round(((totals.p * 4) / Math.max(totals.kcal, 1)) * 100),
                )}
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
  const pct = Math.min(100, Math.round((value / Math.max(target, 1)) * 100));
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
        <span className="text-[13px] text-muted">
          {COPY.diets.form.macros.gramsUnit}
        </span>
      </div>
      <div className="mt-1.5 font-body text-[11px] text-muted">{label}</div>
    </div>
  );
}
