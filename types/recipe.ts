import { getRecipes } from "@/actions/recipes";

export type Recipe = Awaited<ReturnType<typeof getRecipes>>[number];

export interface IngredientRow {
  id: string; // local key only
  name: string;
  amount: string;
  kcal: string;
  protein: string;
  fiber: string;
  carbs: string;
  sugar: string;
  sodium: string;
}
