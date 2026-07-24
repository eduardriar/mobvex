import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, colors, initials, spacing } from '@mobvex/ui';
import { ActiveSessionBar } from '@/components/workout/ActiveSessionBar';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
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
import {
  EXPRESS_ROUTINES,
  STATS,
  TIPS,
  TODAY_ROUTINE,
  TRAINER,
  greeting,
} from '@/components/dashboard/constants';

/** Student home / dashboard. */
export default function Dashboard() {
  const router = useRouter();
  const { studentId, profile } = useAuth();
  const { session } = useActiveSession(studentId);
  const { plan } = useNutritionPlan();

  const completedSets =
    session?.set_logs.filter((log) => log.completed).length ?? 0;
  const totalSets = session?.set_logs.length ?? 0;

  return (
    <Screen flush scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <DashboardHeader
          greeting={greeting()}
          name={profile?.name ?? ''}
          initials={initials(profile?.name)}
          hasUnread
          // TODO: route to a notifications screen once it exists.
          onNotifications={undefined}
        />
      </View>

      <View style={[styles.block, styles.section]}>
        {/* TODO: trainer chat is out of MVP scope. */}
        <TrainerStrip
          name={TRAINER.name}
          role={TRAINER.role}
          initials={TRAINER.initials}
        />
      </View>

      <View style={[styles.block, styles.stats]}>
        {STATS.map((s) => (
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
        <SectionHeader title="Rutina de hoy" />
        <View style={styles.sectionBody}>
          {session ? (
            <ActiveSessionBar
              routineName={session.routine.name}
              completedSets={completedSets}
              totalSets={totalSets}
              onPress={() => router.push(`/student/workout/${session.id}`)}
            />
          ) : (
            <TodayRoutineCard
              day={TODAY_ROUTINE.day}
              name={TODAY_ROUTINE.name}
              meta={TODAY_ROUTINE.meta}
              chips={TODAY_ROUTINE.chips}
              status={TODAY_ROUTINE.status}
              onPress={() => router.push('/student/routines')}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.block}>
          <SectionHeader
            title="Rutinas exprés"
            actionLabel="Ver todas →"
            onAction={() => router.push('/student/routines')}
          />
        </View>
        {/* <ScrollView
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
        </ScrollView> */}
      </View>

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
            title="Recetas"
            actionLabel="Ver todas →"
            onAction={() => router.push('/student/nutrition')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          style={styles.sectionBody}
        >
          {(plan?.meals ?? []).map((meal) => {
            const option = getSelectedMealOption(meal);
            if (!option) return null;
            return (
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
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
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
      </View>
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
