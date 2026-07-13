/* Mobvex Trainer — global user-facing copy (Spanish).
   Single source for every UI string, grouped by screen. Components never
   hardcode user-facing text; they read it from here. */

export const COPY = {
  common: {
    loading: "Cargando...",
    sessionExpired: "Tu sesión ha expirado. Vuelve a iniciar sesión.",
  },
  roster: {
    loadingStudents: "Cargando alumnos...",
  },
  exercises: {
    title: "Ejercicios",
    subtitle: "Biblioteca de ejercicios disponibles",
    loading: "Cargando ejercicios...",
    errors: {
      inUse: "No se puede eliminar: este ejercicio está en uso en una rutina.",
    },
    repositoryCount: (n: number) =>
      n === 1
        ? "1 ejercicio en el repositorio"
        : `${n} ejercicios en el repositorio`,
    groupCount: (n: number) =>
      n === 1 ? "1 ejercicio" : `${n} ejercicios`,
    newExercise: "Nuevo ejercicio",
    editExercise: "Editar",
    form: {
      createTitle: "Crear ejercicio",
      editTitle: "Editar ejercicio",
      close: "Cerrar",
      mediaEmpty: "Añadir foto o video",
      mediaAdded: "Foto/video añadido",
      nameLabel: "Nombre del ejercicio",
      namePlaceholder: "Ej. Press inclinado",
      muscleLabel: "Grupo muscular",
      equipmentLabel: "Equipo",
      cancel: "Cancelar",
      saveNew: "Guardar ejercicio",
      saveEdit: "Guardar cambios",
      delete: "Eliminar ejercicio",
    },
  },
  diets: {
    title: "Dietas",
    subtitle: "Biblioteca de recetas Mobvex",
    loading: "Cargando recetas...",
    repositoryCount: (n: number) =>
      n === 1
        ? "1 receta en el repositorio"
        : `${n} recetas en el repositorio`,
    groupCount: (n: number) => (n === 1 ? "1 receta" : `${n} recetas`),
    newRecipe: "Nueva receta",
    trainerRecipe: "Receta del entrenador",
    kcalBadge: (n: number) => `${n} kcal`,
    proteinBadge: (n: number) => `${n}g prot.`,
    timeBadge: (n: number) => `${n} min`,
    form: {
      title: "Nueva receta",
      close: "Cerrar",
      mediaEmpty: "Añadir foto",
      mediaAdded: "Foto añadida",
      nameLabel: "Nombre de la receta",
      namePlaceholder: "Ej. Bowl de quinoa y pollo",
      categoryLabel: "Categoría",
      ingredientsLabel: "Ingredientes",
      ingredientPlaceholder: "Ingrediente",
      qtyPlaceholder: "Cantidad",
      addIngredient: "Añadir ingrediente",
      removeIngredient: "Quitar ingrediente",
      ingredientAmount: (qty: number, unit: string) => `${qty} ${unit}`,
      macros: {
        kcal: "Calorías",
        kcalUnit: "kcal",
        protein: "Proteína",
        carbs: "Carbos",
        fat: "Grasas",
        gramsUnit: "g",
      },
      cancel: "Cancelar",
      save: "Guardar receta",
    },
  },
  dietBuilder: {
    loading: "Cargando plan...",
    defaultPlanName: "Plan nutricional",
    planNameLabel: "Nombre del plan",
    kcalPerDay: "kcal / día",
    proteinMeta: "proteína",
    saveAssign: "Guardar y asignar",
    saving: "Guardando...",
    assignedTo: (name: string) => `Asignada a ${name}`,
    chooseRecipe: "Elegir receta",
    addOption: "Añadir opción",
    defaultOption: "Por defecto",
    removeRecipe: "Quitar receta",
    chooseFor: (slot: string) => `Elegir para ${slot.toLowerCase()}`,
    filterAll: "Todas",
    minBadge: (n: number) => `${n} min`,
    kcalUnit: "kcal",
    proteinShort: (n: number) => `${n}g prot.`,
    carbsShort: (n: number) => `${n}g carb.`,
    dailySummary: "Resumen diario",
    vsGoals: (name: string) => `Frente a los objetivos de ${name}`,
    calories: "Calorías",
    protein: "Proteína",
    carbs: "Carbos",
    fat: "Grasas",
    mealsCount: (n: number, total: number) => `${n}/${total} comidas`,
    proteinPct: (pct: number) => `${pct}% kcal de proteína`,
  },
  sidebar: {
    trainerRole: "Entrenador personal",
    logout: "Salir",
  },
  student: {
    dietTitle: "Dieta actual",
    editDiet: "Editar dieta",
    loadingDiet: "Cargando dieta...",
    noDiet: "Sin plan de nutrición asignado",
    optionCount: (n: number) => (n === 1 ? "1 opción" : `${n} opciones`),
  },
} as const;
