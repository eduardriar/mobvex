import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { DayOfWeek, RoutineWithExercises } from "@mobvex/db";
import { RoutineBuilder } from "./RoutineBuilder";

const { getSession, getAssignedRoutines, saveRoutinePlan, getExercises } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    getAssignedRoutines: vi.fn(),
    saveRoutinePlan: vi.fn(),
    getExercises: vi.fn(),
  }));

vi.mock("@mobvex/db", () => ({
  getSession,
  getAssignedRoutines,
  saveRoutinePlan,
  getExercises,
}));

function fixtureRoutine(
  id: string,
  dayOfWeek: DayOfWeek,
  focus: string,
  exercises: Array<{ name: string; sets: number; reps: string; kg: number }>,
): RoutineWithExercises {
  return {
    id,
    student_id: "ava",
    trainer_id: "trainer-1",
    name: focus,
    description: "Definición · 5 días",
    day_of_week: dayOfWeek,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    routine_exercises: exercises.map((ex, index) => ({
      id: `${id}-re-${index}`,
      routine_id: id,
      exercise_id: `${id}-ex-${index}`,
      order: index,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: 60,
      target_weight: ex.kg,
      exercise: {
        id: `${id}-ex-${index}`,
        trainer_id: "trainer-1",
        name: ex.name,
        created_at: "2026-01-01T00:00:00Z",
      },
    })),
  } as unknown as RoutineWithExercises;
}

function fixtureRoutines(): RoutineWithExercises[] {
  return [
    fixtureRoutine("r-lun", "monday", "Tren superior", [
      { name: "Press banca mancuerna", sets: 4, reps: "12", kg: 14 },
      { name: "Remo con barra", sets: 4, reps: "12", kg: 30 },
      { name: "Press militar", sets: 3, reps: "12", kg: 18 },
      { name: "Face pull", sets: 3, reps: "15", kg: 20 },
    ]),
    fixtureRoutine("r-mar", "tuesday", "Tren inferior", [
      { name: "Sentadilla goblet", sets: 4, reps: "12", kg: 20 },
      { name: "Peso muerto rumano", sets: 4, reps: "10", kg: 40 },
      { name: "Zancadas", sets: 3, reps: "12", kg: 12 },
      { name: "Elevación de gemelo", sets: 4, reps: "15", kg: 30 },
    ]),
    fixtureRoutine("r-mie", "wednesday", "Cardio + core", [
      { name: "HIIT cinta", sets: 1, reps: "20 min", kg: 0 },
      { name: "Plancha", sets: 4, reps: "45 s", kg: 0 },
      { name: "Crunch en polea", sets: 4, reps: "15", kg: 25 },
    ]),
    fixtureRoutine("r-jue", "thursday", "Empuje", [
      { name: "Press inclinado", sets: 4, reps: "10", kg: 16 },
      { name: "Aperturas", sets: 3, reps: "15", kg: 8 },
      { name: "Fondos asistidos", sets: 3, reps: "12", kg: 0 },
      { name: "Extensión de tríceps", sets: 3, reps: "15", kg: 14 },
    ]),
    fixtureRoutine("r-vie", "friday", "Tirón", [
      { name: "Jalón al pecho", sets: 4, reps: "12", kg: 35 },
      { name: "Remo sentado", sets: 4, reps: "12", kg: 32 },
      { name: "Curl bíceps", sets: 3, reps: "12", kg: 10 },
      { name: "Pájaros", sets: 3, reps: "15", kg: 6 },
    ]),
  ];
}

describe("RoutineBuilder", () => {
  beforeEach(() => {
    getSession.mockReset().mockResolvedValue({
      data: { session: { user: { id: "trainer-1" } } },
      error: null,
    });
    getAssignedRoutines.mockReset().mockResolvedValue({
      data: fixtureRoutines(),
      error: null,
    });
    getExercises.mockReset().mockResolvedValue({ data: [], error: null });
    saveRoutinePlan.mockReset().mockResolvedValue({
      data: { ids: ["r-new"] },
      error: null,
    });
  });

  it("renders the routine name, active-day count and exercise count for a known student", async () => {
    render(<RoutineBuilder studentId="ava" />);

    expect(
      await screen.findByDisplayValue("Definición · 5 días"),
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("días/semana")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByText("ejercicios")).toBeInTheDocument();
  });

  it("selects the first active day by default and lists its exercises", async () => {
    render(<RoutineBuilder studentId="ava" />);

    expect(await screen.findByDisplayValue("Tren superior")).toBeInTheDocument();
    expect(screen.getByText("Press banca mancuerna")).toBeInTheDocument();
  });

  it("shows a rest-day message for a day with no routine, and can turn it into a workout day", async () => {
    render(<RoutineBuilder studentId="ava" />);
    await screen.findByDisplayValue("Tren superior");

    fireEvent.click(screen.getByText("Sáb"));
    expect(screen.getByText("Sáb es un día de descanso.")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Añadir entrenamiento/i }),
    );

    expect(screen.getByDisplayValue("Nuevo bloque")).toBeInTheDocument();
    expect(
      screen.getByText("Aún no hay ejercicios en este día."),
    ).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument(); // active days went 5 -> 6
  });

  it("updates the routine name and the selected day's focus text", async () => {
    render(<RoutineBuilder studentId="ava" />);
    await screen.findByDisplayValue("Tren superior");

    const nameInput = screen.getByLabelText("Nombre de la rutina");
    fireEvent.change(nameInput, { target: { value: "Plan de fuerza" } });
    expect(nameInput).toHaveValue("Plan de fuerza");

    const focusInput = screen.getByDisplayValue("Tren superior");
    fireEvent.change(focusInput, { target: { value: "Empuje pesado" } });
    expect(screen.getByDisplayValue("Empuje pesado")).toBeInTheDocument();
  });

  it("adds an exercise from the real catalog and can remove it again", async () => {
    getExercises.mockResolvedValue({
      data: [
        {
          id: "ex-hip-thrust",
          trainer_id: "trainer-1",
          name: "Hip thrust",
          muscle_group: "Tren inferior",
          equipment: "Barra",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      error: null,
    });

    render(<RoutineBuilder studentId="ava" />);
    await screen.findByDisplayValue("Tren superior");

    fireEvent.click(screen.getByRole("button", { name: /Añadir ejercicio/i }));
    fireEvent.click(screen.getByRole("button", { name: /Hip thrust/i }));
    fireEvent.click(screen.getByRole("button", { name: /Listo/i }));

    expect(screen.getByText("Hip thrust")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument(); // 19 -> 20

    const row = screen.getByText("Hip thrust").closest("div.grid") as HTMLElement;
    fireEvent.click(within(row).getByRole("button"));

    expect(screen.queryByText("Hip thrust")).not.toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();
  });

  it("shows an empty-catalog message when the trainer has no exercises yet", async () => {
    render(<RoutineBuilder studentId="ava" />);
    await screen.findByDisplayValue("Tren superior");

    fireEvent.click(screen.getByRole("button", { name: /Añadir ejercicio/i }));

    expect(
      screen.getByText(/No tienes ejercicios en tu repositorio todavía/),
    ).toBeInTheDocument();
  });

  it("saves the plan, shows a confirmation, and clears it on further edits", async () => {
    render(<RoutineBuilder studentId="ava" />);
    await screen.findByDisplayValue("Tren superior");

    expect(screen.queryByText(/Asignada a/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Guardar y asignar/i }));
    await waitFor(() =>
      expect(screen.getByText("Asignada a Ava")).toBeInTheDocument(),
    );
    expect(saveRoutinePlan).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByDisplayValue("Tren superior"), {
      target: { value: "Otro focus" },
    });
    expect(screen.queryByText(/Asignada a/)).not.toBeInTheDocument();
  });

  it("shows an inline error when saving fails", async () => {
    saveRoutinePlan.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    render(<RoutineBuilder studentId="ava" />);
    await screen.findByDisplayValue("Tren superior");

    fireEvent.click(screen.getByRole("button", { name: /Guardar y asignar/i }));

    expect(await screen.findByText("boom")).toBeInTheDocument();
    expect(screen.queryByText(/Asignada a/)).not.toBeInTheDocument();
  });

  it("falls back to the first student when studentId matches no one", async () => {
    render(<RoutineBuilder studentId="does-not-exist" />);

    expect(
      await screen.findByDisplayValue("Definición · 5 días"),
    ).toBeInTheDocument();
  });
});
