/* Mobvex Trainer — create/edit exercise modal form (media placeholder,
   name, muscular group, equipment; delete available when editing). */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from "@/lib/data";
import { ChipRow } from "@/components/ui/ChipRow";
import type {
  CatalogExercise,
  EquipmentOption,
  MuscleGroup,
  NewExercisePayload,
} from "@/lib/types";

const T = COPY.exercises;

type Props = {
  title: string;
  initial?: CatalogExercise;
  /** User-facing error from a failed save/delete, shown inside the modal. */
  error?: string | null;
  onCancel: () => void;
  onSave: (payload: NewExercisePayload) => void;
  onDelete?: () => void;
};

export function ExerciseForm({
  title,
  initial,
  error,
  onCancel,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [muscle, setMuscle] = useState<MuscleGroup>(
    initial?.muscle ?? MUSCLE_GROUPS[0] ?? "Tren inferior",
  );
  const [equipment, setEquipment] = useState<EquipmentOption>(
    initial?.equipment ?? EQUIPMENT_OPTIONS[0] ?? "Peso corporal",
  );
  const [hasMedia, setHasMedia] = useState(!!initial?.hasMedia);

  const valid = name.trim().length > 1;

  return (
    <Modal
      open
      onClose={onCancel}
      width={620}
      className="max-h-[calc(100vh-48px)] overflow-y-auto p-6"
    >
      <div className="mb-[18px] flex items-center justify-between">
        <Text variant="cardName" className="text-[17px]">
          {title}
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

      <div className="grid grid-cols-[180px_1fr] gap-6">
        {/* media placeholder */}
        <button
          type="button"
          onClick={() => setHasMedia((v) => !v)}
          className={cn(
            "flex h-[180px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-card border border-dashed bg-surface-2",
            hasMedia ? "border-accent text-accent" : "border-border text-muted",
          )}
        >
          <Icon name={hasMedia ? "check" : "camera"} size={26} />
          <span className="px-3.5 text-center font-body text-[12px]">
            {hasMedia ? T.form.mediaAdded : T.form.mediaEmpty}
          </span>
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
              {T.form.muscleLabel}
            </div>
            <ChipRow options={MUSCLE_GROUPS} value={muscle} onSelect={setMuscle} />
          </div>

          <div>
            <div className="mb-[9px] font-body text-[12px] text-muted">
              {T.form.equipmentLabel}
            </div>
            <ChipRow
              options={EQUIPMENT_OPTIONS}
              value={equipment}
              onSelect={setEquipment}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 font-body text-[13px] text-accent-2">{error}</p>
      )}

      <div className="mt-[22px] flex items-center justify-between">
        {onDelete ? (
          <Button
            variant="ghost"
            onClick={onDelete}
            className="whitespace-nowrap"
            style={{ color: "var(--color-accent-2)" }}
            leadingIcon={<Icon name="trash" size={16} />}
          >
            {T.form.delete}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={onCancel}>
            {T.form.cancel}
          </Button>
          <Button
            variant="primary"
            disabled={!valid}
            onClick={() => onSave({ name, muscle, equipment, hasMedia })}
            className="whitespace-nowrap"
            leadingIcon={<Icon name="check" size={16} color="#0A0A0B" />}
          >
            {onDelete ? T.form.saveEdit : T.form.saveNew}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
