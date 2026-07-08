/* Mobvex Trainer — one ingredient line in the recipe form's list. Known
   ingredients (in the macro DB) get an accent check; unknown ones an apple. */
"use client";

import { Icon } from "@/components/Icon";
import { COPY } from "@/lib/copy";
import { INGREDIENT_DB } from "@/lib/data";
import type { RecipeIngredient } from "@/lib/types";

const T = COPY.diets;

type Props = {
  ingredient: RecipeIngredient;
  onRemove: () => void;
};

export function IngredientRow({ ingredient, onRemove }: Props) {
  const known = !!INGREDIENT_DB[ingredient.name];

  return (
    <div className="flex items-center gap-3 rounded-input border border-border bg-surface-2 px-3.5 py-2.5">
      <Icon
        name={known ? "check" : "apple"}
        size={15}
        className={known ? "text-accent" : "text-muted"}
      />
      <span className="flex-1 font-body text-[13px] text-text">
        {ingredient.name}
      </span>
      <span className="font-body text-[13px] text-muted">
        {T.form.ingredientAmount(ingredient.qty, ingredient.unit)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        title={T.form.removeIngredient}
        className="flex cursor-pointer text-muted hover:text-text"
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
