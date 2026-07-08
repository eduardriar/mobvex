/* Mobvex Trainer — Ejercicios: repository grouped by muscular group, with
   create + edit/delete (media placeholder, name, muscular group, equipment). */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { COPY } from "@/lib/copy";
import {
  createExercise,
  deleteExercise,
  EXERCISES,
  MUSCLE_GROUPS,
  updateExercise,
} from "@/lib/data";
import type { CatalogExercise, NewExercisePayload } from "@/lib/types";
import { ExerciseForm } from "./exercises-screen/components/ExerciseForm";
import { ExerciseTile } from "./exercises-screen/components/ExerciseTile";

const T = COPY.exercises;

export function ExercisesScreen() {
  const [exercises, setExercises] = useState<CatalogExercise[]>(() => [
    ...EXERCISES,
  ]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingExercise = editingId
    ? exercises.find((e) => e.id === editingId)
    : undefined;

  const grouped = MUSCLE_GROUPS.map((group) => ({
    group,
    items: exercises.filter((e) => e.muscle === group),
  }));

  const refresh = () => setExercises([...EXERCISES]);

  const saveNew = (payload: NewExercisePayload) => {
    createExercise(payload);
    refresh();
    setCreating(false);
  };

  const saveEdit = (payload: NewExercisePayload) => {
    if (editingId) updateExercise(editingId, payload);
    refresh();
    setEditingId(null);
  };

  const remove = () => {
    if (editingId) deleteExercise(editingId);
    refresh();
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-[26px]">
      {/* header action */}
      <div className="mb-[22px] flex items-center justify-between">
        <span className="font-body text-[14px] text-muted">
          {T.repositoryCount(exercises.length)}
        </span>
        <Button
          variant="primary"
          onClick={() => setCreating(true)}
          className="whitespace-nowrap"
          leadingIcon={<Icon name="plus" size={18} color="#0A0A0B" />}
        >
          {T.newExercise}
        </Button>
      </div>

      {creating && (
        <ExerciseForm
          title={T.form.createTitle}
          onCancel={() => setCreating(false)}
          onSave={saveNew}
        />
      )}
      {editingExercise && (
        <ExerciseForm
          key={editingExercise.id}
          title={T.form.editTitle}
          initial={editingExercise}
          onCancel={() => setEditingId(null)}
          onSave={saveEdit}
          onDelete={remove}
        />
      )}

      {/* repository grouped by muscle */}
      <div className="flex flex-col gap-5">
        {grouped.map(({ group, items }) =>
          items.length > 0 ? (
            <Card key={group} style={{ padding: 22 }}>
              <div className="mb-4 flex items-center gap-2.5">
                <Icon name="dumbbell" size={18} className="text-accent" />
                <Text variant="cardName" className="text-[16px]">
                  {group}
                </Text>
                <Badge className="ml-auto">{T.groupCount(items.length)}</Badge>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
                {items.map((ex) => (
                  <ExerciseTile
                    key={ex.id}
                    exercise={ex}
                    onEdit={() => setEditingId(ex.id)}
                  />
                ))}
              </div>
            </Card>
          ) : null,
        )}
      </div>
    </div>
  );
}
