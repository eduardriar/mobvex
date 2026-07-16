/* Public invite landing page: /i/<token>. This is the HTTPS link trainers
   share — no auth, student-facing. */
import type { Metadata } from "next";
import { InviteScreen } from "@/components/screens/InviteScreen";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: COPY.invite.pageTitle,
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  return <InviteScreen token={token} />;
}
