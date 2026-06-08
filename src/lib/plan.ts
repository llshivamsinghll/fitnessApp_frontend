export type PlanExercise = {
  id?: number;
  name: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
};

export type PlanWorkoutDay = {
  day: number;
  dayName: string;
  focus: string;
  exercises: PlanExercise[];
};

export type PlanWorkoutWeek = {
  week: number;
  focus: string;
  days: PlanWorkoutDay[];
};

export type WorkoutPlan = {
  schemaVersion?: number;
  source?: "ai" | "fallback" | string;
  durationWeeks: number;
  weeklyPlan?: {
    frequency?: string;
    restDays?: string;
  };
  weeklySchedule: PlanWorkoutWeek[];
  recommendations?: string[];
};

export type PlanMeal = {
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  prepTime?: string;
  foods?: Array<{
    name: string;
    quantity?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
  recipeNotes?: string;
};

export type DietPlan = {
  schemaVersion?: number;
  source?: "ai" | "fallback" | string;
  durationWeeks: number;
  region?: string;
  dailyTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  weeklyPlan: Array<{
    day: number;
    dayName: string;
    meals: PlanMeal[];
  }>;
  tips?: string[];
  shoppingList?: string[];
};

export type SavedPlan = {
  schemaVersion?: number;
  workout?: WorkoutPlan;
  diet?: DietPlan;
  duration?: number;
  version?: number;
  createdAt?: string;
};

export function getWorkoutWeeks(workout?: WorkoutPlan | null): PlanWorkoutWeek[] {
  return Array.isArray(workout?.weeklySchedule) ? workout.weeklySchedule : [];
}

export function getDietDays(diet?: DietPlan | null): DietPlan["weeklyPlan"] {
  return Array.isArray(diet?.weeklyPlan) ? diet.weeklyPlan : [];
}

export function getTodayWorkout(workout?: WorkoutPlan | null): PlanWorkoutDay | null {
  const weeks = getWorkoutWeeks(workout);
  return weeks[0]?.days?.[0] || null;
}

export function getTodayMeals(diet?: DietPlan | null): PlanMeal[] {
  return getDietDays(diet)[0]?.meals || [];
}

export function getPlanSourceLabel(source?: string) {
  return source === "fallback" ? "Fallback plan" : "AI plan";
}
