import { IngredientRow, Recipe } from "@/types/recipe";

export function latestVersion(recipe: Recipe) {
  return recipe.versions.at(-1) ?? null;
}

export function sumIngredients(ingredients: IngredientRow[]) {
  return ingredients.reduce(
    (acc, ing) => ({
      kcal: acc.kcal + (Number(ing.kcal) || 0),
      protein: acc.protein + (Number(ing.protein) || 0),
      fiber: acc.fiber + (Number(ing.fiber) || 0),
      carbs: acc.carbs + (Number(ing.carbs) || 0),
      sugar: acc.sugar + (Number(ing.sugar) || 0),
      sodium: acc.sodium + (Number(ing.sodium) || 0),
    }),
    { kcal: 0, protein: 0, fiber: 0, carbs: 0, sugar: 0, sodium: 0 },
  );
}
