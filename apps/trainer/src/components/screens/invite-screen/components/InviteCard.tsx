/* Valid-invite card: who invited you, the "open app" CTA, and a copy-link
   fallback for when the app isn't installed on this device yet. */
import { useState } from "react";
import type { InvitationWithTrainer } from "@mobvex/db";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Text } from "@/components/ui/Text";
import { buildAppDeepLink, buildInviteLink } from "@/lib/invite";
import { COPY } from "@/lib/copy";

const T = COPY.invite;

type Props = {
  token: string;
  invitation: InvitationWithTrainer;
};

export function InviteCard({ token, invitation }: Props) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(buildInviteLink(token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (e.g. non-secure context) — nothing to do */
    }
  };

  const openApp = () => {
    window.location.href = buildAppDeepLink(token);
  };

  return (
    <Card className="w-full p-7">
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar name={invitation.trainer.name} size={56} active />
        <div>
          <Text variant="displaySubtitle" as="h1" className="text-[24px]">
            {T.invitedBy(invitation.trainer.name)}
          </Text>
          <p className="mt-2 font-body text-[14px] leading-[1.6] text-muted">
            {T.subtitle}
          </p>
        </div>

        <Button variant="primary" fullWidth onClick={openApp}>
          {T.openApp}
        </Button>
      </div>

      <Divider className="my-6" />

      <div className="flex flex-col items-center gap-3 text-center">
        <Text variant="label">{T.noApp}</Text>
        <p className="m-0 font-body text-[13px] leading-[1.6] text-muted">
          {T.noAppHint}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={copyLink}
          leadingIcon={<Icon name={copied ? "check" : "copy"} size={16} />}
        >
          {copied ? T.copied : T.copyLink}
        </Button>
      </div>
    </Card>
  );
}
