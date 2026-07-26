/* Mobvex Mobile — global user-facing copy (Spanish).
   Single source for every UI string, grouped by screen. Components never
   hardcode user-facing text; they read it from here. */

export const COPY = {
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
