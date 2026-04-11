import { getMealEntries } from "@/actions/mealEntries";

export type MealEntry = Awaited<ReturnType<typeof getMealEntries>>[number];
