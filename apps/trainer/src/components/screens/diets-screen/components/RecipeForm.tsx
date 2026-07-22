/* Mobvex Trainer — new recipe modal form: picture upload, name, meal
   category, ingredients builder with live macro estimation. */
"use client";

import { useRef, useState } from "react";
import { getSession, uploadRecipeImage } from "@mobvex/db";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { ChipRow } from "@/components/ui/ChipRow";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import {
  INGREDIENT_NAMES,
  INGREDIENT_UNITS,
  macrosFor,
  MEAL_CATEGORIES,
} from "@/lib/data";
import type {
  IngredientUnit,
  MealCategory,
  NewRecipePayload,
  RecipeIngredient,
} from "@/lib/types";
import { IngredientRow } from "./IngredientRow";
import { MacroPreview } from "./MacroPreview";

const T = COPY.diets;

/* Compact fields for the ingredients builder (smaller than the ui Input). */
const FIELD_CLASS =
  "w-full rounded-input border border-border bg-surface-2 px-[13px] py-[11px] " +
  "font-body text-[13px] text-text outline-none placeholder:text-muted focus:border-accent";

type Props = {
  /** User-facing error from a failed save, shown inside the modal. */
  error?: string | null;
  onCancel: () => void;
  onSave: (payload: NewRecipePayload) => void;
};

export function RecipeForm({ error, onCancel, onSave }: Props) {
  const [name, setName] = useState("");
  const [meal, setMeal] = useState<MealCategory>(
    MEAL_CATEGORIES[0] ?? "Desayuno",
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("");
  const [ingUnit, setIngUnit] = useState<IngredientUnit>("gr");

  const valid = name.trim().length > 1 && ingredients.length > 0;

  const handleFileSelected = async (file: File) => {
    setImageUploading(true);
    setImageError(false);

    const {
      data: { session },
    } = await getSession();
    if (!session) {
      setImageUploading(false);
      setImageError(true);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { data, error: uploadError } = await uploadRecipeImage({
      path,
      data: buffer,
      contentType: file.type,
    });
    setImageUploading(false);

    if (uploadError || !data) {
      setImageError(true);
      return;
    }

    setImageUrl(data.publicUrl);
  };

  const addIngredient = () => {
    const qty = parseFloat(ingQty);
    if (!ingName.trim() || !qty || qty <= 0) return;
    setIngredients((list) => [
      ...list,
      { name: ingName.trim(), qty, unit: ingUnit },
    ]);
    setIngName("");
    setIngQty("");
  };

  const removeIngredient = (index: number) =>
    setIngredients((list) => list.filter((_, i) => i !== index));

  const totals = ingredients.reduce(
    (acc, it) => {
      const m = macrosFor(it.name, it.qty, it.unit);
      return {
        kcal: acc.kcal + m.kcal,
        p: acc.p + m.p,
        c: acc.c + m.c,
        f: acc.f + m.f,
      };
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  const submit = () => {
    if (!valid) return;
    onSave({ name, meal, imageUrl: imageUrl || undefined, ingredients, totals });
  };

  return (
    <Modal
      open
      onClose={onCancel}
      width={620}
      className="max-h-[calc(100vh-48px)] overflow-y-auto p-6"
    >
      <div className="mb-[18px] flex items-center justify-between">
        <Text variant="cardName" className="text-[17px]">
          {T.form.title}
        </Text>
        <button
          type="button"
          onClick={onCancel}
          title={T.form.close}
          className="flex cursor-pointer p-1 text-muted hover:text-text"
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-[180px_1fr]">
        {/* picture upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFileSelected(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageUploading}
          className={cn(
            "relative flex h-[180px] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-card border border-dashed bg-surface-2",
            imageUrl && !imageError
              ? "border-accent text-accent"
              : imageError
                ? "border-accent-2 text-accent-2"
                : "border-border text-muted",
          )}
        >
          {imageUploading ? (
            <span className="px-3.5 text-center font-body text-[12px]">
              {T.form.uploading}
            </span>
          ) : imageUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local/optimizable asset
            <img
              src={imageUrl}
              alt=""
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <Icon name="camera" size={26} />
              <span className="px-3.5 text-center font-body text-[12px]">
                {imageError ? T.form.uploadFailed : T.form.mediaEmpty}
              </span>
            </>
          )}
        </button>

        <div className="flex flex-col gap-4">
          <Input
            label={T.form.nameLabel}
            placeholder={T.form.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <div className="mb-[9px] font-body text-[12px] text-muted">
              {T.form.categoryLabel}
            </div>
            <ChipRow options={MEAL_CATEGORIES} value={meal} onSelect={setMeal} />
          </div>
        </div>
      </div>

      {/* ---- Ingredients builder ---- */}
      <div className="mt-6">
        <div className="mb-[9px] font-body text-[12px] text-muted">
          {T.form.ingredientsLabel}
        </div>

        <div className="mb-3 flex flex-col gap-2.5 sm:grid sm:grid-cols-[1.6fr_0.8fr_1fr_auto]">
          <input
            list="ingredient-names"
            value={ingName}
            onChange={(e) => setIngName(e.target.value)}
            placeholder={T.form.ingredientPlaceholder}
            className={FIELD_CLASS}
          />
          <datalist id="ingredient-names">
            {INGREDIENT_NAMES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <input
            type="number"
            min="0"
            value={ingQty}
            onChange={(e) => setIngQty(e.target.value)}
            placeholder={T.form.qtyPlaceholder}
            className={FIELD_CLASS}
          />
          <select
            value={ingUnit}
            onChange={(e) => setIngUnit(e.target.value as IngredientUnit)}
            className={cn(FIELD_CLASS, "cursor-pointer")}
          >
            {INGREDIENT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addIngredient}
            title={T.form.addIngredient}
            className="flex w-full shrink-0 cursor-pointer items-center justify-center rounded-input bg-accent text-on-accent sm:w-11"
          >
            <Icon name="plus" size={18} color="#0A0A0B" />
          </button>
        </div>

        {ingredients.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {ingredients.map((it, i) => (
              <IngredientRow
                key={`${it.name}-${i}`}
                ingredient={it}
                onRemove={() => removeIngredient(i)}
              />
            ))}
          </div>
        )}

        {/* running macro totals */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MacroPreview
            label={T.form.macros.kcal}
            value={Math.round(totals.kcal)}
            unit={T.form.macros.kcalUnit}
          />
          <MacroPreview
            label={T.form.macros.protein}
            value={Math.round(totals.p)}
            unit={T.form.macros.gramsUnit}
          />
          <MacroPreview
            label={T.form.macros.carbs}
            value={Math.round(totals.c)}
            unit={T.form.macros.gramsUnit}
          />
          <MacroPreview
            label={T.form.macros.fat}
            value={Math.round(totals.f)}
            unit={T.form.macros.gramsUnit}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 font-body text-[13px] text-accent-2">{error}</p>
      )}

      <div className="mt-[22px] flex flex-col gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {T.form.cancel}
        </Button>
        <Button
          variant="primary"
          disabled={!valid || imageUploading}
          onClick={submit}
          className="whitespace-nowrap"
          leadingIcon={<Icon name="check" size={16} color="#0A0A0B" />}
        >
          {T.form.save}
        </Button>
      </div>
    </Modal>
  );
}
