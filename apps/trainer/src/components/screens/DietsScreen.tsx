/* Mobvex Trainer — Dietas: Mobvex recipe library grouped by meal category,
   with a "Nueva receta" form (picture placeholder, name, ingredients). */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { COPY } from "@/lib/copy";
import { createRecipe, MEAL_CATEGORIES, RECIPES } from "@/lib/data";
import type { NewRecipePayload, Recipe } from "@/lib/types";
import { RecipeForm } from "./diets-screen/components/RecipeForm";
import { RecipeTile } from "./diets-screen/components/RecipeTile";

const T = COPY.diets;

export function DietsScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => [...RECIPES]);
  const [creating, setCreating] = useState(false);

  const grouped = MEAL_CATEGORIES.map((meal) => ({
    meal,
    items: recipes.filter((r) => r.meal === meal),
  }));

  const saveNew = (payload: NewRecipePayload) => {
    createRecipe(payload);
    setRecipes([...RECIPES]);
    setCreating(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-[26px]">
      {/* header action */}
      <div className="mb-[22px] flex items-center justify-between">
        <span className="font-body text-[14px] text-muted">
          {T.repositoryCount(recipes.length)}
        </span>
        <Button
          variant="primary"
          onClick={() => setCreating(true)}
          className="whitespace-nowrap"
          leadingIcon={<Icon name="plus" size={18} color="#0A0A0B" />}
        >
          {T.newRecipe}
        </Button>
      </div>

      {creating && (
        <RecipeForm onCancel={() => setCreating(false)} onSave={saveNew} />
      )}

      {/* library grouped by meal category */}
      <div className="flex flex-col gap-5">
        {grouped.map(({ meal, items }) =>
          items.length > 0 ? (
            <Card key={meal} style={{ padding: 22 }}>
              <div className="mb-4 flex items-center gap-2.5">
                <Icon name="utensils" size={18} className="text-accent" />
                <Text variant="cardName" className="text-[16px]">
                  {meal}
                </Text>
                <Badge className="ml-auto">{T.groupCount(items.length)}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {items.map((recipe) => (
                  <RecipeTile key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </Card>
          ) : null,
        )}
      </div>
    </div>
  );
}
