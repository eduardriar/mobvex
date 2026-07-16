/* Mobvex Trainer — new student screen. Minimal form: name, email, goal. */
"use client";

import { useState } from "react";
import { useCreateStudent } from "@/hooks/useCreateStudent";
import { COPY } from "@/lib/copy";
import { createStudent as addStudentToRoster, GOAL_HUE } from "@/lib/data";
import { buildInviteLink } from "@/lib/invite";
import type { GoalKey } from "@/lib/types";
import { Icon } from "@/components/Icon";
import { GoalTag } from "@/components/trainer/GoalTag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Text } from "@/components/ui/Text";

const GOALS = Object.keys(GOAL_HUE) as GoalKey[];
const T = COPY.newStudent;

type Props = {
  onDone: (id: string) => void;
  onCancel: () => void;
};

export function NewStudentScreen({ onDone, onCancel }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState<GoalKey>(GOALS[0] ?? "Mantenimiento");
  const [created, setCreated] = useState<{
    id: string;
    name: string;
    inviteLink: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { createStudent, creating, error } = useCreateStudent();

  const valid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  const submit = async () => {
    if (!valid || creating) return;
    const payload = { name: name.trim(), email: email.trim(), goal };
    const result = await createStudent(payload);
    if (result) {
      const id = addStudentToRoster(payload);
      setCreated({
        id,
        name: payload.name,
        inviteLink: buildInviteLink(result.invitation.token),
      });
    }
  };

  const copyInviteLink = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (e.g. non-secure context) — link stays selectable */
    }
  };

  const shareOnWhatsApp = () => {
    if (!created) return;
    const message = T.created.whatsappMessage(created.name, created.inviteLink);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto px-8 py-12">
      <div className="w-full max-w-[480px]">
        <Card className="p-8">
          <div className="mb-1.5 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-accent-icon-border bg-accent-icon text-accent">
              <Icon name="users" size={22} />
            </div>
            <div>
              <Text variant="cardName" className="text-[20px]">
                {T.title}
              </Text>
              <div className="mt-0.5 font-body text-[13px] text-muted">
                {T.subtitle}
              </div>
            </div>
          </div>

          <div className="my-[22px] h-px bg-border" />

          <div className="flex flex-col gap-[18px]">
            <Input
              label={T.nameLabel}
              placeholder={T.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label={T.emailLabel}
              type="email"
              placeholder={T.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <div className="mb-2.5 font-body text-[12px] tracking-[0.5px] text-muted">
                {T.goalLabel}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={
                      "cursor-pointer border-none bg-transparent p-0 transition-opacity duration-150 " +
                      (goal === g ? "opacity-100" : "opacity-55")
                    }
                  >
                    <GoalTag goal={g} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <Text variant="hint" as="p" className="mt-4">
              {error}
            </Text>
          )}

          <div className="mt-[30px] flex gap-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={creating}
              className="flex-1"
            >
              {T.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={submit}
              disabled={!valid || creating}
              className="flex-1 whitespace-nowrap"
              leadingIcon={<Icon name="plus" size={18} color="#0A0A0B" />}
            >
              {creating ? T.creating : T.create}
            </Button>
          </div>
        </Card>
      </div>

      <Modal open={created !== null}>
        <div className="flex flex-col items-center gap-[18px] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Icon name="check" size={30} color="#0A0A0B" />
          </div>
          <div>
            <Text variant="cardName" className="text-[20px]">
              {T.created.title}
            </Text>
            <p className="mt-2 font-body text-[14px] leading-[1.5] text-muted">
              {created ? T.created.message(created.name) : ""}
            </p>
          </div>
          <div className="flex w-full items-center gap-2.5">
            <div className="min-w-0 flex-1 rounded-input border border-border bg-surface-2 px-3.5 py-[11px]">
              <span className="block truncate text-left font-body text-[13px] text-text">
                {created?.inviteLink}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyInviteLink}
              className="shrink-0 whitespace-nowrap"
              leadingIcon={<Icon name={copied ? "check" : "copy"} size={16} />}
            >
              {copied ? T.created.copied : T.created.copy}
            </Button>
          </div>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={shareOnWhatsApp}
            leadingIcon={<Icon name="message" size={16} />}
          >
            {T.created.shareWhatsApp}
          </Button>
          <div className="flex w-full gap-2.5">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1 whitespace-nowrap"
            >
              {T.created.viewRoster}
            </Button>
            <Button
              variant="primary"
              onClick={() => created && onDone(created.id)}
              className="flex-1 whitespace-nowrap"
            >
              {T.created.viewProfile}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
