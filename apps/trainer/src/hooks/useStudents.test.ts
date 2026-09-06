import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStudents } from "./useStudents";

const { getSession, getStudentsWithUser } = vi.hoisted(() => ({
  getSession: vi.fn(),
  getStudentsWithUser: vi.fn(),
}));

vi.mock("@mobvex/db", () => ({ getSession, getStudentsWithUser }));

describe("useStudents", () => {
  beforeEach(() => {
    getSession.mockReset();
    getStudentsWithUser.mockReset();
  });

  it("loads and maps the signed-in trainer's students", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "trainer-1" } } },
      error: null,
    });
    getStudentsWithUser.mockResolvedValue({
      data: [
        {
          id: "s-1",
          goal: "fat_loss",
          created_at: "2026-01-15T00:00:00Z",
          user: { name: "Ana Gómez", email: "ana@mobvex.test" },
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useStudents());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getStudentsWithUser).toHaveBeenCalledWith("trainer-1");
    expect(result.current.error).toBeNull();
    expect(result.current.students).toHaveLength(1);
    expect(result.current.students[0]).toMatchObject({
      id: "s-1",
      name: "Ana Gómez",
      email: "ana@mobvex.test",
      goal: "Pérdida de grasa",
    });
  });

  it("surfaces a session-expired error and skips the fetch when there is no session", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toMatch(/sesión/i);
    expect(result.current.students).toEqual([]);
    expect(getStudentsWithUser).not.toHaveBeenCalled();
  });

  it("surfaces the fetch error message returned by the query", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "trainer-1" } } },
      error: null,
    });
    getStudentsWithUser.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    const { result } = renderHook(() => useStudents());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("boom");
    expect(result.current.students).toEqual([]);
  });

  it("refetch re-runs the load sequence", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: { id: "trainer-1" } } },
      error: null,
    });
    getStudentsWithUser.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useStudents());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getSession).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    expect(getSession).toHaveBeenCalledTimes(2);
    expect(getStudentsWithUser).toHaveBeenCalledTimes(2);
  });
});
