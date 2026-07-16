/* Mobvex Trainer — public invite landing page (student-facing, mobile-first).
   Resolves the invite token and hands the student off to the mobile app via
   its deep link; messaging apps can't linkify mobvex:// so this HTTPS page is
   what the trainer actually shares. */
"use client";

import { useEffect, useState } from "react";
import { getInvitationByToken } from "@mobvex/db";
import type { InvitationWithTrainer } from "@mobvex/db";
import { Mark } from "@/components/trainer/Mark";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { COPY } from "@/lib/copy";
import { InviteCard } from "./invite-screen/components/InviteCard";

const T = COPY.invite;

type Props = {
  token: string;
};

type InviteState =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "valid"; invitation: InvitationWithTrainer };

function isUsable(invitation: InvitationWithTrainer): boolean {
  if (invitation.status !== "pending") return false;
  if (!invitation.expires_at) return true;
  return new Date(invitation.expires_at) > new Date();
}

export function InviteScreen({ token }: Props) {
  const [state, setState] = useState<InviteState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await getInvitationByToken(token);
      if (cancelled) return;
      setState(
        !error && data && isUsable(data)
          ? { kind: "valid", invitation: data }
          : { kind: "invalid" },
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-7">
        <div className="flex items-center gap-3">
          <Mark size={36} />
          <span className="font-display text-[26px] tracking-[2px] text-text">
            MOBVEX
          </span>
        </div>

        {state.kind === "loading" && (
          <Text variant="subtitle" as="p">
            {T.loading}
          </Text>
        )}

        {state.kind === "invalid" && (
          <Card className="w-full p-7 text-center">
            <Text variant="displaySubtitle" as="h1" className="text-[24px]">
              {T.invalid.title}
            </Text>
            <p className="mt-3 font-body text-[14px] leading-[1.6] text-muted">
              {T.invalid.message}
            </p>
          </Card>
        )}

        {state.kind === "valid" && (
          <InviteCard token={token} invitation={state.invitation} />
        )}
      </div>
    </div>
  );
}
