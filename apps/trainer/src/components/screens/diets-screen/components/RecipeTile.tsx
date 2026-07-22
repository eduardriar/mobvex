/* Mobvex Trainer — recipe library tile: hue-tinted icon, name, tag and macro
   badges (trainer-made recipes without macro data get a plain badge). */
"use client";

import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { COPY } from "@/lib/copy";
import { HUE } from "@/lib/data";
import type { Recipe } from "@/lib/types";

const T = COPY.diets;

type Props = {
  recipe: Recipe;
};

export function RecipeTile({ recipe }: Props) {
  /* Category hue is DECORATIVE (recipe icon only) — never status/CTA. */
  const hue = HUE[recipe.cat];

  return (
    <div className="rounded-card border border-border bg-surface p-[18px]">
      <div className="mb-3.5 flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border"
          style={{
            background: hue.bg,
            borderColor: hue.border,
            color: hue.solid,
          }}
        >
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a local/optimizable asset
            <img
              src={recipe.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon name="utensils" size={20} />
          )}
        </div>
        <div className="min-w-0">
          <Text variant="cardName" as="div" className="truncate text-[14px]">
            {recipe.name}
          </Text>
          <div className="mt-0.5 font-body text-[12px] text-muted">
            {recipe.tag}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {recipe.kcal > 0 ? (
          <>
            <Badge>{T.kcalBadge(recipe.kcal)}</Badge>
            <Badge>{T.proteinBadge(recipe.p)}</Badge>
            <Badge leadingIcon={<Icon name="clock" size={12} />}>
              {T.timeBadge(recipe.time)}
            </Badge>
          </>
        ) : (
          <Badge>{T.trainerRecipe}</Badge>
        )}
      </div>
    </div>
  );
}
