/* Mobvex Trainer — recipe library backed by the DB: the shared catalog plus
   the signed-in trainer's own recipes, with create. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { createRecipe, getRecipes, getSession } from "@mobvex/db";
import { hydrateRecipes, recipeFromDb, recipePayloadToDb } from "@/lib/data";
import { COPY } from "@/lib/copy";
import type { NewRecipePayload, Recipe } from "@/lib/types";

async function trainerId(): Promise<string | null> {
  const {
    data: { session },
    error,
  } = await getSession();
  return error || !session ? null : session.user.id;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const id = await trainerId();
      if (!id) {
        setError(COPY.common.sessionExpired);
        return;
      }

      const { data, error: fetchError } = await getRecipes(id);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const list = (data ?? []).map(recipeFromDb);
      // Keep the shared in-memory library in sync so recipeById lookups
      // (student diet card) resolve the same recipes.
      hydrateRecipes(list);
      setRecipes(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* Returns null on success or a user-facing Spanish error. */
  const create = useCallback(
    async (payload: NewRecipePayload): Promise<string | null> => {
      const id = await trainerId();
      if (!id) return COPY.common.sessionExpired;

      const { recipe, items } = recipePayloadToDb(payload, id);
      const { error: insertError } = await createRecipe(recipe, items);
      if (insertError) return insertError.message;

      await load();
      return null;
    },
    [load],
  );

  return { recipes, loading, error, create, refetch: load };
}
