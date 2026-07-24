/* Mobvex Trainer — Diet builder (comidas del día con recetas Mobvex), backed
   by the DB: loads the student's active plan and saves the built one. Each
   meal slot holds one or more recipe options (equivalents the student picks
   between); each option's ingredient quantities are a per-student portion
   the trainer can edit, and new options default to recipes from the slot's
   own meal category. */
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
  macrosFor,
  MEAL_CATEGORIES,
  MEAL_SLOTS,
  SLOT_TO_MEAL_CATEGORY,
  STUDENTS,
  studentById,
} from "@/lib/data";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import type { DietMealOption, MealSlot, Macros } from "@/lib/types";

const T = COPY.dietBuilder;

type Props = {
  studentId: string;
};

const emptyMeals = (): Record<MealSlot, DietMealOption[]> => ({
  Desayuno: [],
  Comida: [],
  Cena: [],
  Snack: [],
});

const ZERO_MACROS: Macros = { kcal: 0, p: 0, c: 0, f: 0 };

function sumMacros(a: Macros, b: Macros): Macros {
  return { kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f };
}

export function DietBuilder({ studentId }: Props) {
  const s = studentById(studentId) ?? STUDENTS[0]!;
  const { recipes, loading: recipesLoading, error: recipesError } = useRecipes();
  const { diet, loading: dietLoading, error: dietError, save } = useDiet(s.id);

  const [name, setName] = useState("");
  const [meals, setMeals] = useState<Record<MealSlot, DietMealOption[]>>(emptyMeals);
  const [initialized, setInitialized] = useState(false);
  const [picking, setPicking] = useState<MealSlot | null>(null);
  const [filter, setFilter] = useState<string>(T.filterAll);
  const [editingSlot, setEditingSlot] = useState<MealSlot | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed the editable state once from the student's active plan (or a fresh
  // one when none exists yet). Deep-clone so edits never mutate the loaded
  // diet reference directly.
  useEffect(() => {
    if (dietLoading || initialized) return;
    setName(diet?.name ?? T.defaultPlanName);
    const seeded = emptyMeals();
    if (diet) {
      for (const slot of MEAL_SLOTS) {
        seeded[slot] = diet.meals[slot].options.map((option) => ({
          recipeId: option.recipeId,
          ingredients: option.ingredients.map((ing) => ({ ...ing })),
        }));
      }
    }
    setMeals(seeded);
    setInitialized(true);
  }, [dietLoading, initialized, diet]);

  const target = diet?.target ?? DEFAULT_DIET_TARGET;
  const recipeById = (id: string | null) =>
    id ? recipes.find((r) => r.id === id) : undefined;

  // An option's live macros come from its current ingredient quantities, not
  // the catalog recipe's static totals — they diverge once the trainer edits
  // portions. Falls back to the recipe's own totals only if it has no
  // ingredients on record at all.
  const macrosForOption = (option: DietMealOption): Macros => {
    if (option.ingredients.length === 0) {
      const r = recipeById(option.recipeId);
      return r ? { kcal: r.kcal, p: r.p, c: r.c, f: r.f } : ZERO_MACROS;
    }
    return option.ingredients.reduce(
      (acc, ing) => sumMacros(acc, macrosFor(ing.name, ing.qty, ing.unit)),
      ZERO_MACROS,
    );
  };

  // Daily totals count only each slot's default (first) option — the extra
  // options are equivalents the student picks between, not additional food.
  const totals = MEAL_SLOTS.reduce((acc, slot) => {
    const first = meals[slot][0];
    return first ? sumMacros(acc, macrosForOption(first)) : acc;
  }, ZERO_MACROS);
  const roundedTotals = {
    kcal: Math.round(totals.kcal),
    p: Math.round(totals.p),
    c: Math.round(totals.c),
    f: Math.round(totals.f),
  };

  const openPicker = (slot: MealSlot) => {
    setPicking(slot);
    setFilter(SLOT_TO_MEAL_CATEGORY[slot]);
    setEditingSlot(null);
    setEditingRecipeId(null);
  };
  const openEditOption = (slot: MealSlot, recipeId: string) => {
    setEditingSlot(slot);
    setEditingRecipeId(recipeId);
    setPicking(null);
  };
  const closeRightPanel = () => {
    setPicking(null);
    setEditingSlot(null);
    setEditingRecipeId(null);
  };

  const pickRecipe = (slot: MealSlot, recipeId: string) => {
    setMeals((m) => {
      if (m[slot].some((o) => o.recipeId === recipeId)) return m;
      const r = recipeById(recipeId);
      const option: DietMealOption = {
        recipeId,
        ingredients: (r?.ingredients ?? []).map((ing) => ({ ...ing })),
      };
      return { ...m, [slot]: [...m[slot], option] };
    });
    setSaved(false);
    // Jump straight into editing the just-added option's portions.
    setPicking(null);
    setEditingSlot(slot);
    setEditingRecipeId(recipeId);
  };

  const removeOption = (slot: MealSlot, recipeId: string) => {
    setMeals((m) => ({
      ...m,
      [slot]: m[slot].filter((o) => o.recipeId !== recipeId),
    }));
    setSaved(false);
    if (editingSlot === slot && editingRecipeId === recipeId) {
      setEditingSlot(null);
      setEditingRecipeId(null);
    }
  };

  const setIngredientQty = (
    slot: MealSlot,
    recipeId: string,
    index: number,
    qty: number,
  ) => {
    setMeals((m) => ({
      ...m,
      [slot]: m[slot].map((o) =>
        o.recipeId === recipeId
          ? {
              ...o,
              ingredients: o.ingredients.map((ing, i) =>
                i === index ? { ...ing, qty } : ing,
              ),
            }
          : o,
      ),
    }));
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

  const editingOption =
    editingSlot && editingRecipeId
      ? meals[editingSlot].find((o) => o.recipeId === editingRecipeId)
      : undefined;
  const editingRecipe = editingOption ? recipeById(editingOption.recipeId) : undefined;

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
          <DietMeta value={`${roundedTotals.kcal}`} label={T.kcalPerDay} />
          <DietMeta value={`${roundedTotals.p}g`} label={T.proteinMeta} />
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
              .map((option) => ({ option, recipe: recipeById(option.recipeId) }))
              .filter((o) => o.recipe !== undefined);
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
                    onClick={() => openPicker(slot)}
                    leadingIcon={<Icon name="plus" size={15} />}
                  >
                    {options.length > 0 ? T.addOption : T.chooseRecipe}
                  </Button>
                </div>
                <div className="flex flex-col gap-3.5">
                  {options.map(({ option, recipe: r }, optionIndex) => {
                    if (!r) return null;
                    const h = HUE[r.cat];
                    const m = macrosForOption(option);
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
                              {Math.round(m.kcal)} {T.kcalUnit}
                            </span>
                            <span>{T.proteinShort(Math.round(m.p))}</span>
                            <span>{T.carbsShort(Math.round(m.c))}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditOption(slot, r.id)}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-[5px] rounded-full border border-border bg-transparent px-[11px] py-1.5 font-body text-[12px] text-muted hover:border-text hover:text-text"
                        >
                          <Icon name="edit" size={13} /> {T.editQuantities}
                        </button>
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

        {/* right: summary, browse-to-add, or edit-ingredients */}
        {editingSlot && editingOption && editingRecipe ? (
          <Card style={{ padding: 20 }}>
            <div className="mb-3.5 flex items-center justify-between">
              <Text variant="cardName">{editingRecipe.name}</Text>
              <button
                type="button"
                onClick={closeRightPanel}
                className="flex cursor-pointer border-none bg-transparent text-muted hover:text-text"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <div className="mb-2.5 font-body text-[11px] uppercase tracking-[1px] text-muted">
              {T.ingredientsLabel}
            </div>
            <div className="mb-4 flex flex-col gap-2">
              {editingOption.ingredients.length === 0 ? (
                <div className="font-body text-[13px] text-muted">
                  {T.noIngredients}
                </div>
              ) : (
                editingOption.ingredients.map((ing, i) => (
                  <div
                    key={`${ing.name}-${i}`}
                    className="flex items-center gap-2.5 rounded-input border border-border bg-surface px-3 py-2.5"
                  >
                    <span className="flex-1 truncate font-body text-[13px] text-text">
                      {ing.name}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={ing.qty}
                      onChange={(e) =>
                        setIngredientQty(
                          editingSlot,
                          editingOption.recipeId,
                          i,
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-16 rounded-input border border-border bg-surface-2 px-2 py-1.5 text-center font-body text-[13px] text-text outline-none focus:border-accent"
                    />
                    <span className="w-7 font-body text-[12px] text-muted">
                      {ing.unit}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mb-[18px] grid grid-cols-4 gap-2">
              {(() => {
                const m = macrosForOption(editingOption);
                return [
                  [T.calories, m.kcal],
                  [T.protein, m.p],
                  [T.carbs, m.c],
                  [T.fat, m.f],
                ] as const;
              })().map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-input border border-border bg-surface px-1 py-2.5 text-center"
                >
                  <div className="font-display text-[18px] text-accent">
                    {Math.round(value)}
                  </div>
                  <div className="font-body text-[10px] text-muted">{label}</div>
                </div>
              ))}
            </div>
          </Card>
        ) : picking ? (
          <Card style={{ padding: 20 }}>
            <div className="mb-3.5 flex items-center justify-between">
              <Text variant="cardName">{T.chooseFor(picking)}</Text>
              <button
                type="button"
                onClick={closeRightPanel}
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
                    onClick={() => pickRecipe(picking, r.id)}
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
              {filtered.length === 0 && (
                <div className="font-body text-[13px] text-muted">
                  {T.noRecipesInCategory}
                </div>
              )}
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
              value={roundedTotals.kcal}
              target={target.kcal}
              unit={T.kcalUnit}
            />
            <Goal
              label={T.protein}
              value={roundedTotals.p}
              target={target.p}
              unit={COPY.diets.form.macros.gramsUnit}
            />

            <div className="my-5 h-px bg-border" />

            <div className="grid grid-cols-3 gap-3">
              <Macro label={T.protein} value={roundedTotals.p} />
              <Macro label={T.carbs} value={roundedTotals.c} />
              <Macro label={T.fat} value={roundedTotals.f} />
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
                  Math.round(
                    ((roundedTotals.p * 4) / Math.max(roundedTotals.kcal, 1)) * 100,
                  ),
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
