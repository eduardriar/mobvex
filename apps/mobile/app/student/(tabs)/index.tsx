import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, Screen, Text, colors, initials, spacing } from '@mobvex/ui';
import { ActiveSessionBar } from '@/components/workout/ActiveSessionBar';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useAssignedRoutines } from '@/hooks/useAssignedRoutines';
import { useTrainer } from '@/hooks/useTrainer';
import { useTrainingStats } from '@/hooks/useTrainingStats';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard';
import { ProfileMenu } from '@/components/dashboard/ProfileMenu';
import { TrainerStrip } from '@/components/dashboard/TrainerStrip';
import { StatCard } from '@/components/dashboard/StatCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { TodayRoutineCard } from '@/components/dashboard/TodayRoutineCard';
import { ExpressCard } from '@/components/dashboard/ExpressCard';
import { TrackingCard } from '@/components/dashboard/TrackingCard';
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { RecipeCard } from '@/components/dashboard/RecipeCard';
import { TipCard } from '@/components/dashboard/TipCard';
import {
  getSelectedMealOption,
  useNutritionPlan,
} from '@/components/nutrition/NutritionProvider';
import { EXPRESS_ROUTINES, TIPS } from '@/components/dashboard/constants';
import { COPY } from '@/lib/copy';
import {
  estimateRoutineMinutes,
  getDayOfWeek,
  getMuscleGroups,
  resolveTodayRoutine,
} from '@/lib/todayRoutine';

const T = COPY.home;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Sign-prefixed value for a delta stat (+2, −3, 0). */
function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}

/** Student home / dashboard. */
export default function Dashboard() {
  const router = useRouter();
  const { studentId, profile, student } = useAuth();
  const { trainer, loading: trainerLoading } = useTrainer(student?.trainer_id ?? null);
  const { session } = useActiveSession(studentId);
  const {
    routines,
    loading: routinesLoading,
    error: routinesError,
  } = useAssignedRoutines(studentId);
  const { plan, loading: planLoading, error: planError } = useNutritionPlan();
  const { completedSessions, weightDeltaKg } = useTrainingStats(studentId);
  const [profileOpen, setProfileOpen] = useState(false);

  const completedSets =
    session?.set_logs.filter((log) => log.completed).length ?? 0;
  const totalSets = session?.set_logs.length ?? 0;

  const weeksTraining = student
    ? Math.floor((Date.now() - new Date(student.created_at).getTime()) / WEEK_MS)
    : null;

  const today = useMemo(
    () => resolveTodayRoutine(routines, getDayOfWeek()),
    [routines],
  );

  // Meals that have at least one recipe option to show on the rail.
  const recipeMeals = useMemo(
    () =>
      (plan?.meals ?? []).flatMap((meal) => {
        const option = getSelectedMealOption(meal);
        return option ? [{ meal, option }] : [];
      }),
    [plan],
  );

  const trainerName = trainer?.name ?? (trainerLoading ? '…' : T.trainer.unassigned);

  const stats = [
    { label: T.stats.weeksTraining, value: weeksTraining != null ? String(weeksTraining) : '…', sup: T.stats.weeksUnit, accent: false },
    { label: T.stats.sessionsCompleted, value: completedSessions != null ? String(completedSessions) : '…', sup: undefined, accent: true },
    { label: T.stats.weightSinceStart, value: weightDeltaKg != null ? formatDelta(weightDeltaKg) : '…', sup: T.stats.kgUnit, accent: false },
  ] as const;

  const goToRoutines = () => router.push('/student/routines');

  const renderTodayRoutine = () => {
    if (session) {
      return (
        <ActiveSessionBar
          routineName={session.routine.name}
          completedSets={completedSets}
          totalSets={totalSets}
          onPress={() => router.push(`/student/workout/${session.id}`)}
        />
      );
    }
    if (routinesLoading) {
      return <ActivityIndicator color={colors.accent} style={styles.loader} />;
    }
    if (routinesError) {
      return <Alert message={T.todayRoutine.loadError} />;
    }
    if (today.kind === 'empty') {
      return (
        <EmptyStateCard
          icon="arm-flex"
          title={T.todayRoutine.emptyTitle}
          message={T.todayRoutine.emptyMessage}
        />
      );
    }
    if (today.kind === 'rest') {
      return (
        <EmptyStateCard
          icon="power-sleep"
          title={T.todayRoutine.restTitle}
          message={T.todayRoutine.restMessage}
          onPress={goToRoutines}
        />
      );
    }
    const { routine, day } = today;
    return (
      <TodayRoutineCard
        day={T.todayRoutine.dayLabel(T.weekdays[day], routine.description)}
        name={routine.name}
        meta={T.todayRoutine.meta(
          routine.routine_exercises.length,
          estimateRoutineMinutes(routine),
        )}
        chips={getMuscleGroups(routine)}
        status={T.todayRoutine.notStarted}
        onPress={goToRoutines}
      />
    );
  };

  const renderRecipes = () => {
    if (planLoading) {
      return (
        <View style={styles.block}>
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        </View>
      );
    }
    if (planError) {
      return (
        <View style={styles.block}>
          <Alert message={T.recipes.loadError} />
        </View>
      );
    }
    if (recipeMeals.length === 0) {
      return (
        <View style={styles.block}>
          <EmptyStateCard
            icon="silverware-fork-knife"
            title={T.recipes.emptyTitle}
            message={T.recipes.emptyMessage}
          />
        </View>
      );
    }
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {recipeMeals.map(({ meal, option }) => (
          <RecipeCard
            key={meal.id}
            emoji={meal.icon === 'droplet' ? '💧' : '🍽️'}
            hue={meal.hue}
            name={option.recipe.name}
            tags={[
              `${option.kcal} kcal`,
              option.protein_g ? `${option.protein_g}g prot` : null,
            ].filter((tag): tag is string => Boolean(tag))}
            onPress={() => router.push(`/student/diet/${meal.id}`)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <Screen flush scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <DashboardHeader
          greeting={T.greeting(new Date())}
          name={profile?.name ?? ''}
          initials={initials(profile?.name)}
          hasUnread
          // TODO: route to a notifications screen once it exists.
          onNotifications={undefined}
          onProfilePress={() => setProfileOpen(true)}
        />
      </View>

      <View style={[styles.block, styles.section]}>
        {/* TODO: trainer chat is out of MVP scope. */}
        <TrainerStrip
          name={trainerName}
          role={T.trainer.role}
          initials={initials(trainer?.name)}
        />
      </View>

      <View style={[styles.block, styles.stats]}>
        {stats.map((s) => (
          <StatCard
            key={s.label}
            value={s.value}
            sup={s.sup}
            label={s.label}
            accent={s.accent}
          />
        ))}
      </View>

      <View style={[styles.block, styles.section]}>
        <SectionHeader title={T.todayRoutine.sectionTitle} />
        <View style={styles.sectionBody}>{renderTodayRoutine()}</View>
      </View>

      {/* <View style={styles.section}>
        <View style={styles.block}>
          <SectionHeader
            title="Rutinas exprés"
            actionLabel="Ver todas →"
            onAction={() => router.push('/student/routines')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          style={styles.sectionBody}
        >
          {EXPRESS_ROUTINES.map((r) => (
            <ExpressCard
              key={r.id}
              time={r.time}
              icon={r.icon}
              hue={r.hue}
              name={r.name}
              meta={r.meta}
              onPress={() => router.push('/student/routines')}
            />
          ))}
        </ScrollView>
      </View> */}

      {/* <View style={[styles.block, styles.section]}>
        <SectionHeader title="Seguimiento" />
        <View style={[styles.sectionBody, styles.trackingGroup]}>
          <TrackingCard
            icon="📸"
            hue="green"
            title="Registro fotográfico"
            sub="Última foto hace 7 días"
            onPress={() => router.push('/student/progress')}
          >
            <ProgressBar progress={0.65} />
            <View style={styles.progMeta}>
              <Text variant="cardRole">Semana 8 de 12</Text>
              <Text variant="badge">65%</Text>
            </View>
          </TrackingCard>

          <TrackingCard
            icon="📏"
            hue="purple"
            title="Medición muscular"
            sub="Última medición hace 14 días"
            onPress={() => router.push('/student/progress')}
          >
            <View style={styles.deltas}>
              <Text variant="cardRole">
                Bíceps <Text variant="badge">↑ +1cm</Text>
              </Text>
              <View style={styles.deltaSep} />
              <Text variant="cardRole">
                Cintura{' '}
                <Text variant="badge" color={colors.accent2}>
                  ↓ −2cm
                </Text>
              </Text>
              <View style={styles.deltaSep} />
              <Text variant="cardRole">
                Pecho <Text variant="badge">↑ +1.5cm</Text>
              </Text>
            </View>
          </TrackingCard>
        </View>
      </View> */}

      <View style={styles.section}>
        <View style={styles.block}>
          <SectionHeader
            title={T.recipes.sectionTitle}
            actionLabel={T.recipes.seeAll}
            onAction={() => router.push('/student/nutrition')}
          />
        </View>
        <View style={styles.sectionBody}>{renderRecipes()}</View>
      </View>

      {/* <View style={styles.section}>
        <View style={styles.block}>
          <SectionHeader
            title="Tips de tu entrenador"
            actionLabel="Ver todos →"
            onAction={() => router.push('/student/tips')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          style={styles.sectionBody}
        >
          {TIPS.map((t) => (
            <TipCard
              key={t.id}
              icon={t.icon}
              hue={t.hue}
              title={t.title}
              text={t.text}
              onPress={() => router.push('/student/tips')}
            />
          ))}
        </ScrollView>
      </View> */}

      <ProfileMenu
        visible={profileOpen}
        student={{ name: profile?.name ?? '' }}
        trainer={{ name: trainer?.name ?? '' }}
        onClose={() => setProfileOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  // A standard horizontally-padded section block.
  block: {
    paddingHorizontal: spacing.lg,
  },
  // Vertical rhythm between full sections.
  section: {
    marginBottom: spacing.lg,
  },
  sectionBody: {
    marginTop: 12,
  },
  loader: {
    paddingVertical: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  trackingGroup: {
    gap: 12,
  },
  rail: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  progMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  deltas: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  deltaSep: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
  },
});
