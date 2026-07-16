/* Mobvex Trainer — student invitation links.

   The link the trainer shares is HTTPS (messaging apps only linkify http/s),
   pointing at this app's public landing page `/i/<token>`. The landing page
   is what opens the mobile app via its custom scheme (from apps/mobile
   app.json). Both builders run client-side only. */

const INVITE_PATH = "/i";
const APP_DEEP_LINK_BASE = "mobvex://student/register";

/** Shareable HTTPS link to the invite landing page (clickable anywhere). */
export function buildInviteLink(token: string): string {
  return `${window.location.origin}${INVITE_PATH}/${token}`;
}

/** Deep link into the mobile app's register flow, used by the landing page. */
export function buildAppDeepLink(token: string): string {
  return `${APP_DEEP_LINK_BASE}?invite=${token}`;
}
