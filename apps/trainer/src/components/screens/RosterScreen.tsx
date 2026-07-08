/* Mobvex Trainer — Roster dashboard (all assigned students). */
"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { GoalTag } from "@/components/trainer/GoalTag";
import { StatusPill } from "@/components/trainer/StatusPill";
import { useStudents } from "@/hooks/useStudents";
import { cn } from "@/lib/cn";
import { COPY } from "@/lib/copy";
import type { Student } from "@/lib/types";

const FILTERS = ["Todos", "Al día", "Atención", "Sesión hoy"] as const;
type Filter = (typeof FILTERS)[number];

type Props = {
  search: string;
  onOpenStudent: (id: string) => void;
};

export function RosterScreen({ search, onOpenStudent }: Props) {
  const [filter, setFilter] = useState<Filter>("Todos");
  const { students, loading, error } = useStudents();

  const q = (search || "").trim().toLowerCase();
  const list = students.filter((s) => {
    if (
      q &&
      !s.name.toLowerCase().includes(q) &&
      !s.goal.toLowerCase().includes(q)
    )
      return false;
    if (filter === "Al día") return s.status === "ontrack";
    if (filter === "Atención") return s.status === "attention";
    if (filter === "Sesión hoy") return s.nextSession.startsWith("Hoy");
    return true;
  });

  const stats = [
    { label: "Alumnos activos", value: `${students.length}`, icon: "users", danger: false },
    {
      label: "Sesiones hoy",
      value: `${students.filter((s) => s.nextSession.startsWith("Hoy")).length}`,
      icon: "calendar",
      danger: false,
    },
    {
      label: "Adherencia media",
      value: students.length
        ? Math.round(
            students.reduce((a, s) => a + s.adherence, 0) / students.length,
          ) + "%"
        : "—",
      icon: "trendingUp",
      danger: false,
    },
    {
      label: "Requieren atención",
      value: `${students.filter((s) => s.status === "attention").length}`,
      icon: "bell",
      danger: true,
    },
  ];

  if (loading) {
    return <LoadingIndicator className="flex-1" label={COPY.roster.loadingStudents} />;
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-8">
        <span className="font-body text-[14px] text-accent-2">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-7">
      {/* Summary stats */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="flex items-center gap-4"
            style={{ padding: 20 }}
          >
            <div
              className={cn(
                "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border",
                s.danger
                  ? "bg-alert border-alert-border text-accent-2"
                  : "bg-accent-icon border-accent-icon-border text-accent",
              )}
            >
              <Icon name={s.icon} size={22} />
            </div>
            <div>
              <div className="font-display text-[34px] leading-none text-text">
                {s.value}
              </div>
              <div className="mt-1 font-body text-[12px] text-muted">
                {s.label}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter row */}
      <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 font-body text-[13px] font-medium",
                active
                  ? "bg-accent-card border-accent-card-border text-accent"
                  : "bg-surface-2 border-border text-muted",
              )}
            >
              {f}
            </button>
          );
        })}
        <span className="ml-auto font-body text-[13px] text-muted">
          {list.length} {list.length === 1 ? "alumno" : "alumnos"}
        </span>
      </div>

      {/* Student list */}
      <div className="flex flex-col gap-3">
        {list.map((s) => (
          <StudentRow
            key={s.id}
            student={s}
            onClick={() => onOpenStudent(s.id)}
          />
        ))}
        {list.length === 0 && (
          <div className="p-16 text-center font-body text-muted">
            {students.length === 0
              ? "Aún no tienes alumnos. Crea el primero con “Nuevo alumno”."
              : "No hay alumnos que coincidan."}
          </div>
        )}
      </div>
    </div>
  );
}

type RowProps = {
  student: Student;
  onClick: () => void;
};

function StudentRow({ student: s, onClick }: RowProps) {
  const today = s.nextSession.startsWith("Hoy");

  return (
    <div
      onClick={onClick}
      className={cn(
        "group grid cursor-pointer items-center gap-4 rounded-card border px-[18px] py-4 transition-colors duration-150",
        "grid-cols-[1fr_auto] md:grid-cols-[minmax(150px,1.1fr)_140px_minmax(108px,1fr)_110px_auto]",
        "bg-surface-2 border-border hover:bg-accent-card hover:border-accent-card-border",
      )}
    >
      {/* identity */}
      <div className="flex min-w-0 items-center gap-3.5">
        <Avatar name={s.name} size={46} />
        <div className="min-w-0">
          <div className="font-body text-[15px] font-medium text-text">
            {s.name}
          </div>
          <div className="mt-0.5 font-body text-[12px] text-muted">
            Desde {s.since}
          </div>
        </div>
      </div>

      {/* goal */}
      <div className="hidden md:block">
        <GoalTag goal={s.goal} size="sm" />
      </div>

      {/* adherence */}
      <div className="hidden md:block">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-body text-[11px] uppercase tracking-[1px] text-muted">
            Adherencia
          </span>
          <span
            className={cn(
              "font-body text-[13px] font-medium",
              s.adherence >= 75 ? "text-accent" : "text-text",
            )}
          >
            {s.adherence}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-[3px] bg-surface">
          <div
            className={cn(
              "h-full rounded-[3px]",
              s.adherence >= 75 ? "bg-accent" : "bg-muted",
            )}
            style={{ width: `${s.adherence}%` }}
          />
        </div>
      </div>

      {/* next session */}
      <div
        className={cn(
          "hidden items-center gap-2 md:flex",
          today ? "text-accent" : "text-muted",
        )}
      >
        <Icon name="clock" size={16} />
        <span
          className={cn(
            "whitespace-nowrap font-body text-[13px]",
            today ? "text-text" : "text-muted",
          )}
        >
          {s.nextSession}
        </span>
      </div>

      {/* status */}
      <div className="flex items-center justify-self-end">
        <StatusPill status={s.status} />
      </div>
    </div>
  );
}
