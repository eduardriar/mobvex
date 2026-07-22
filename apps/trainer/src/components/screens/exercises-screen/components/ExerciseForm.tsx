/* Mobvex Trainer — create/edit exercise modal form (media URL preview,
   name, muscular group, equipment; delete available when editing). */
"use client";

import { useRef, useState } from "react";
import { fetchYouTubeOEmbed, getSession, isYouTubeUrl, uploadExerciseImage } from "@mobvex/db";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
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
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? "");
  const [mediaTitle, setMediaTitle] = useState(initial?.mediaTitle ?? "");
  const [mediaThumbnailUrl, setMediaThumbnailUrl] = useState(
    initial?.mediaThumbnailUrl ?? "",
  );
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaInvalid, setMediaInvalid] = useState(false);
  const lastFetchedUrl = useRef(initial?.mediaUrl?.trim() ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const valid = name.trim().length > 1;
  const trimmedMediaUrl = mediaUrl.trim();
  const isVideo = isYouTubeUrl(trimmedMediaUrl);
  const previewSrc = isVideo ? mediaThumbnailUrl : trimmedMediaUrl;

  const handleMediaBlur = async () => {
    if (!trimmedMediaUrl) {
      lastFetchedUrl.current = "";
      setMediaInvalid(false);
      setMediaTitle("");
      setMediaThumbnailUrl("");
      return;
    }

    if (!isYouTubeUrl(trimmedMediaUrl)) {
      // Plain image link — nothing to fetch, the URL is the preview itself.
      lastFetchedUrl.current = trimmedMediaUrl;
      setMediaInvalid(false);
      setMediaTitle("");
      setMediaThumbnailUrl("");
      return;
    }

    if (trimmedMediaUrl === lastFetchedUrl.current) return;

    setMediaLoading(true);
    setMediaInvalid(false);
    const result = await fetchYouTubeOEmbed(trimmedMediaUrl);
    setMediaLoading(false);
    lastFetchedUrl.current = trimmedMediaUrl;

    if (!result) {
      setMediaInvalid(true);
      setMediaTitle("");
      setMediaThumbnailUrl("");
      return;
    }

    setMediaTitle(result.title);
    setMediaThumbnailUrl(result.thumbnailUrl);
  };

  const handleFileSelected = async (file: File) => {
    setMediaLoading(true);
    setMediaInvalid(false);

    const {
      data: { session },
    } = await getSession();
    if (!session) {
      setMediaLoading(false);
      setMediaInvalid(true);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { data, error: uploadError } = await uploadExerciseImage({
      path,
      data: buffer,
      contentType: file.type,
    });
    setMediaLoading(false);

    if (uploadError || !data) {
      setMediaInvalid(true);
      return;
    }

    setMediaUrl(data.publicUrl);
    setMediaTitle("");
    setMediaThumbnailUrl("");
    lastFetchedUrl.current = data.publicUrl;
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

      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-[180px_1fr]">
        {/* media preview — reflects the URL typed to the right */}
        <div
          className={cn(
            "relative flex h-[180px] shrink-0 items-center justify-center overflow-hidden rounded-card border bg-surface-2",
            previewSrc && !mediaInvalid
              ? "border-accent"
              : "border-dashed border-border text-muted",
          )}
        >
          {mediaLoading ? (
            <span className="px-3.5 text-center font-body text-[12px] text-muted">
              {T.form.mediaFetching}
            </span>
          ) : previewSrc && !mediaInvalid ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, not a local/optimizable asset */}
              <img
                src={previewSrc}
                alt=""
                onError={() => setMediaInvalid(true)}
                className="h-full w-full object-cover"
              />
              {isVideo && (
                <span className="absolute inset-0 flex items-center justify-center bg-bg/35 text-text">
                  <Icon name="play" size={30} />
                </span>
              )}
            </>
          ) : (
            <Icon name="dumbbell" size={26} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label={T.form.nameLabel}
            placeholder={T.form.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
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
            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled={mediaLoading}
              onClick={() => fileInputRef.current?.click()}
              leadingIcon={<Icon name="camera" size={16} />}
            >
              {T.form.uploadImage}
            </Button>
            <Divider label={T.form.orDivider} className="my-3" />
            <Input
              label={T.form.mediaLabel}
              placeholder={T.form.mediaPlaceholder}
              value={mediaUrl}
              onChange={(e) => {
                setMediaUrl(e.target.value);
                setMediaInvalid(false);
              }}
              onBlur={handleMediaBlur}
              error={mediaInvalid ? T.form.mediaInvalid : undefined}
            />
          </div>

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

      <div className="mt-[22px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button variant="secondary" onClick={onCancel}>
            {T.form.cancel}
          </Button>
          <Button
            variant="primary"
            disabled={!valid || mediaLoading}
            onClick={() =>
              onSave({
                name,
                muscle,
                equipment,
                mediaUrl: trimmedMediaUrl || undefined,
                mediaTitle: isVideo ? mediaTitle || undefined : undefined,
                mediaThumbnailUrl: isVideo
                  ? mediaThumbnailUrl || undefined
                  : undefined,
              })
            }
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
