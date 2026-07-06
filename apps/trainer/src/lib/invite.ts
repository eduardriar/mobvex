/* Mobvex Trainer — student invitation link.
   Deep link into the mobile app's register flow (scheme from apps/mobile
   app.json). Single base constant so it can switch to an https universal
   link later without touching callers. */

const INVITE_LINK_BASE = "mobvex://student/register";

export function buildInviteLink(token: string): string {
  return `${INVITE_LINK_BASE}?invite=${token}`;
}
