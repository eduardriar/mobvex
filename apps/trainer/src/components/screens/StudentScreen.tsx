/* Mobvex Trainer — Student detail: progress + current routine + diet. */
"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { GoalTag } from "@/components/trainer/GoalTag";
import { StatusPill } from "@/components/trainer/StatusPill";
import { WeekDots } from "@/components/trainer/WeekDots";
import { WeightChart } from "@/components/trainer/WeightChart";
import {
  DAYS,
  HUE,
  MEAL_SLOTS,
  STUDENTS,
  dietFor,
  recipeById,
  routineFor,
  studentById,
} from "@/lib/data";
import { cn } from "@/lib/cn";

type Props = {
  studentId: string;
  onEditRoutine: () => void;
  onEditDiet: () => void;
};

function SectionLabel({
  icon,
  children,
  action,
}: {
  icon: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <Icon name={icon} size={18} style={{ color: "var(--color-accent)" }} />
      <Text variant="displaySubtitle" as="h2" style={{ fontSize: 24 }}>
        {children}
      </Text>
      {action}
    </div>
  );
}

export function StudentScreen({ studentId, onEditRoutine, onEditDiet }: Props) {
  const s = studentById(studentId) ?? STUDENTS[0]!;
  const routine = routineFor(s.id);
  const diet = dietFor(s.id);
  const wNow = s.weight[s.weight.length - 1]!;
  const wDelta = wNow - s.startWeight;
  const fatDelta = s.bodyFat - s.bodyFatStart;

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 pt-[26px]">
      {/* Identity header */}
      <Card className="mb-6" style={{ padding: 24 }}>
        <div className="flex flex-wrap items-center gap-5">
          <Avatar name={s.name} size={72} active />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <Text
                variant="title"
                as="h1"
                className="whitespace-nowrap leading-none"
                style={{ fontSize: 30 }}
              >
                {s.name}
              </Text>
              <StatusPill status={s.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <GoalTag goal={s.goal} />
              <span className="inline-flex items-center gap-1.5 font-body text-[13px] text-muted">
                <Icon name="clock" size={15} /> {s.nextSession}
              </span>
              <span className="font-body text-[13px] text-muted">
                · Alumno desde {s.since}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Icon name="message" size={16} />}
            >
              Mensaje
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Icon name="calendar" size={16} />}
            >
              Programar
            </Button>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <SectionLabel icon="trendingUp">Progreso</SectionLabel>
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Weight chart */}
        <Card style={{ padding: 22 }}>
          <div className="mb-2 flex items-baseline justify-between">
            <Text variant="label">Evolución de peso</Text>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[30px] leading-none text-text">
                {wNow.toFixed(1)}
                <span className="text-[16px] text-muted"> kg</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-body text-[13px] font-medium",
                  wDelta <= 0 ? "text-accent" : "text-text",
                )}
              >
                <Icon
                  name={wDelta <= 0 ? "trendingDown" : "trendingUp"}
                  size={15}
                />
                {wDelta > 0 ? "+" : ""}
                {wDelta.toFixed(1)} kg
              </span>
            </div>
          </div>
          <WeightChart data={s.weight} target={s.targetWeight} />
          <div className="mt-1 font-body text-[12px] text-muted">
            Últimas 8 semanas
          </div>
        </Card>

        {/* Adherence / streak */}
        <Card className="flex flex-col" style={{ padding: 22 }}>
          <Text variant="label">Constancia de entrenos</Text>
          <div className="my-[14px] mb-[18px] flex items-baseline gap-4">
            <div>
              <div className="font-display text-[44px] leading-none text-accent">
                {s.adherence}%
              </div>
              <div className="mt-1 font-body text-[12px] text-muted">
                cumplimiento
              </div>
            </div>
            <div className="border-l border-border pl-4">
              <div className="flex items-center gap-1.5">
                <Icon
                  name="flame"
                  size={20}
                  style={{ color: "var(--color-accent)" }}
                />
                <span className="font-display text-[30px] leading-none text-text">
                  {s.streak}
                </span>
              </div>
              <div className="mt-1.5 font-body text-[12px] text-muted">
                días de racha
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <div className="mb-3 font-body text-[11px] uppercase tracking-[1px] text-muted">
              Esta semana
            </div>
            <WeekDots week={s.week} />
          </div>
        </Card>
      </div>

      {/* Body metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          icon="scale"
          label="Peso"
          value={wNow.toFixed(1)}
          unit="kg"
          delta={`${wDelta > 0 ? "+" : ""}${wDelta.toFixed(1)}`}
          good={s.goal === "Hipertrofia" ? wDelta > 0 : wDelta < 0}
        />
        <MetricCard
          icon="drop"
          label="% Grasa"
          value={s.bodyFat.toFixed(1)}
          unit="%"
          delta={`${fatDelta > 0 ? "+" : ""}${fatDelta.toFixed(1)}`}
          good={fatDelta < 0}
        />
        <MetricCard icon="ruler" label="Cintura" value={`${s.metrics.cintura}`} unit="cm" />
        <MetricCard icon="ruler" label="Pecho" value={`${s.metrics.pecho}`} unit="cm" />
        <MetricCard icon="dumbbell" label="Brazo" value={`${s.metrics.brazo}`} unit="cm" />
      </div>

      {/* Routine + Diet summaries */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Routine */}
        <div>
          <SectionLabel
            icon="dumbbell"
            action={
              <Button
                variant="secondary"
                size="sm"
                className="ml-auto"
                leadingIcon={<Icon name="edit" size={15} />}
                onClick={onEditRoutine}
              >
                Editar rutina
              </Button>
            }
          >
            Rutina actual
          </SectionLabel>
          <Card style={{ padding: 20 }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-body text-[15px] font-medium text-text">
                {routine.name}
              </span>
              <Badge>
                {Object.values(routine.days).filter(Boolean).length} días/sem
              </Badge>
            </div>
            <div className="flex flex-col gap-2.5">
              {DAYS.map((d) => {
                const day = routine.days[d];
                if (!day) return null;
                return (
                  <div
                    key={d}
                    className="flex gap-3.5 rounded-xl border border-border bg-surface px-3.5 py-3"
                  >
                    <div className="w-[38px] shrink-0 font-display text-[18px] tracking-[1px] text-accent">
                      {d}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 font-body text-[13px] font-medium text-text">
                        {day.focus}
                      </div>
                      <div className="truncate font-body text-[12px] text-muted">
                        {day.ex.map((e) => e.name).join(" · ")}
                      </div>
                    </div>
                    <span className="whitespace-nowrap font-body text-[12px] text-muted">
                      {day.ex.length} ej.
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Diet */}
        <div>
          <SectionLabel
            icon="utensils"
            action={
              <Button
                variant="secondary"
                size="sm"
                className="ml-auto"
                leadingIcon={<Icon name="edit" size={15} />}
                onClick={onEditDiet}
              >
                Editar dieta
              </Button>
            }
          >
            Dieta actual
          </SectionLabel>
          <Card style={{ padding: 20 }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-body text-[15px] font-medium text-text">
                {diet.name}
              </span>
              <div className="flex gap-2">
                <Badge>{diet.target.kcal} kcal</Badge>
                <Badge>{diet.target.p}g prot.</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              {MEAL_SLOTS.map((slot) => {
                const r = recipeById(diet.meals[slot]);
                if (!r) return null;
                const h = HUE[r.cat];
                return (
                  <div
                    key={slot}
                    className="flex items-center gap-3.5 rounded-xl border border-border bg-surface px-3.5 py-3"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border"
                      style={{ background: h.bg, borderColor: h.border, color: h.solid }}
                    >
                      <Icon name="utensils" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 font-body text-[11px] uppercase tracking-[1px] text-muted">
                        {slot}
                      </div>
                      <div className="truncate font-body text-[14px] text-text">
                        {r.name}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-body text-[13px] text-text">
                        {r.kcal} kcal
                      </div>
                      <div className="font-body text-[12px] text-muted">
                        {r.p}g prot.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type MetricProps = {
  icon: string;
  label: string;
  value: string;
  unit: string;
  delta?: string;
  good?: boolean;
};

function MetricCard({ icon, label, value, unit, delta, good }: MetricProps) {
  return (
    <div className="rounded-card border border-border bg-surface-2 p-[18px]">
      <div className="mb-3.5 flex items-center gap-2 text-muted">
        <Icon name={icon} size={16} />
        <span className="font-body text-[11px] uppercase tracking-[1px]">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-[30px] leading-none text-text">
          {value}
        </span>
        <span className="font-body text-[13px] text-muted">{unit}</span>
      </div>
      {delta && (
        <div
          className={cn(
            "mt-2 font-body text-[12px] font-medium",
            good ? "text-accent" : "text-muted",
          )}
        >
          {delta} {unit} vs. inicio
        </div>
      )}
    </div>
  );
}
