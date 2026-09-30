/* Mobvex Mobile — global user-facing copy (Spanish).
   Single source for every UI string, grouped by screen. Components never
   hardcode user-facing text; they read it from here. */

export const COPY = {
  home: {
    greeting: (date: Date) => {
      const h = date.getHours();
      if (h < 12) return 'Buenos días,';
      if (h < 19) return 'Buenas tardes,';
      return 'Buenas noches,';
    },
    weekdays: {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    },
    trainer: {
      role: 'Entrenador personal',
      unassigned: 'Sin entrenador asignado',
      newMessage: 'Nuevo mensaje',
    },
    stats: {
      weeksTraining: 'en entrenamiento',
      weeksUnit: 'sem',
      sessionsCompleted: 'sesiones completadas',
      weightSinceStart: 'desde el inicio',
      kgUnit: 'kg',
    },
    todayRoutine: {
      sectionTitle: 'Rutina de hoy',
      loadError: 'No pudimos cargar tu rutina de hoy.',
      dayLabel: (weekday: string, planName?: string | null) =>
        planName ? `${weekday} · ${planName}` : weekday,
      meta: (exercises: number, minutes: number) =>
        `${exercises === 1 ? '1 ejercicio' : `${exercises} ejercicios`} · ~${minutes} min estimado`,
      notStarted: 'Sin iniciar',
      emptyTitle: 'Sin rutina todavía',
      emptyMessage:
        'No tienes entrenamientos registrados, pídele a tu entrenador tu primera rutina.',
      restTitle: 'Hoy toca descansar',
      restMessage:
        'El músculo crece mientras descansas. Hidrátate, duerme bien y mañana vuelves con todo.',
    },
    recipes: {
      sectionTitle: 'Recetas',
      seeAll: 'Ver todas →',
      loadError: 'No pudimos cargar tus recetas.',
      emptyTitle: 'Sin comidas asignadas',
      emptyMessage:
        'Aún no tienes comidas asignadas. Cuando tu entrenador arme tu plan, aparecerán aquí.',
    },
  },
  routines: {
    title: 'TUS\nRUTINAS',
    subtitle: 'Tu plan de entrenamiento.',
    loadError: 'No pudimos cargar tus rutinas.',
    emptyState: 'Aún no tienes rutinas asignadas.',
    startRoutine: 'INICIAR RUTINA',
    routineOptions: 'Opciones de la rutina',
  },
  progress: {
    title: 'TU\nPROGRESO',
    subtitle: 'Fotos y medidas corporales.',
    loadError: 'No pudimos cargar tu progreso.',
    emptyState:
      'Aún no tienes registros. Cuando registres tu peso, medidas o fotos, aparecerán aquí.',
    common: {
      add: 'Añadir',
      addAccessibilityLabel: (title: string) => `Añadir · ${title}`,
    },
    measurementLabels: {
      bodyFatPct: 'Grasa corporal',
      chest: 'Pecho',
      arm: 'Brazo',
      waist: 'Cintura',
      shoulder: 'Hombro',
      quads: 'Cuádriceps',
      calf: 'Pantorrilla',
      glutes: 'Glúteos',
    },
    weight: {
      currentLabel: 'PESO ACTUAL',
      recentMeasurements: (n: number) => `últimas ${n} mediciones`,
      noMeasurementsYet: 'Sin mediciones aún',
    },
    photos: {
      sectionTitle: 'Registro fotográfico',
      weekLabel: (n: number) => `Semana ${n}`,
      today: 'Hoy',
      yesterday: 'Ayer',
      daysAgo: (n: number) => `Hace ${n} días`,
    },
    measurements: {
      sectionTitle: 'Medidas corporales',
    },
  },
  nutrition: {
    title: 'TU DIETA',
    loadError: 'No pudimos cargar tu dieta.',
    emptyState: 'Aún no tienes un plan de nutrición asignado.',
    noPlanSubtitle: 'Tu plan aparecerá aquí.',
    assignedToday: 'Asignado hoy',
    assignedYesterday: 'Asignado ayer',
    assignedDaysAgo: (n: number) => `Asignado hace ${n} días`,
    dailyTarget: {
      sectionTitle: 'Objetivo diario',
      kcalUnit: 'kcal / día',
      protein: 'Proteína',
      carbs: 'Carbos',
      fat: 'Grasas',
    },
    meals: {
      sectionTitle: 'Comidas del día',
      trainerOptions: (n: number) =>
        n === 1 ? '1 opción del entrenador' : `${n} opciones del entrenador`,
      change: 'Cambiar',
    },
  },
} as const;
