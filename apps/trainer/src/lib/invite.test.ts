import { describe, expect, it } from "vitest";
import { buildAppDeepLink, buildInviteLink } from "./invite";

describe("buildInviteLink", () => {
  it("points at the /invite landing page under the current origin", () => {
    expect(buildInviteLink("abc123")).toBe(
      "https://app.mobvex.test/invite/abc123",
    );
  });
});

describe("buildAppDeepLink", () => {
  it("builds a mobvex:// deep link carrying the invite token", () => {
    expect(buildAppDeepLink("abc123")).toBe(
      "mobvex://student/register?invite=abc123",
    );
  });
});
