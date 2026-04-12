"use server";

import { connectDB } from "@/lib/mongoose";
import { MealEntry } from "@/models/MealEntry";
import { IIngredient, Recipe } from "@/models/Recipe";
import { requireUser } from "@/lib/api";
import { revalidatePath } from "next/cache";

type MacroTotals = {
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
};

function sumMacros(ingredients: MacroTotals[]): MacroTotals {
  return ingredients.reduce(
    (acc, ing) => ({
      kcal: acc.kcal + ing.kcal,
      protein: acc.protein + ing.protein,
      fiber: acc.fiber + ing.fiber,
      carbs: acc.carbs + ing.carbs,
      sugar: acc.sugar + ing.sugar,
      sodium: acc.sodium + ing.sodium,
    }),
    { kcal: 0, protein: 0, fiber: 0, carbs: 0, sugar: 0, sodium: 0 },
  );
}

// Per-ingredient override the user can supply when logging
type IngredientOverride = {
  recipeIngredientId: string;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
};

type CreateFromRecipeInput = {
  recipeId: string;
  servingsEaten: number;
  notes?: string;
  loggedAt?: string;
  // flat macro overrides, replaces top-level numbers, clears ingredient breakdown
  macroOverrides?: Partial<MacroTotals>;
  // per-ingredient overrides, re-summed to produce top-level macros
  ingredientOverrides?: IngredientOverride[];
};

type CreateManualInput = {
  recipeName: string;
  servingsEaten: number;
  notes?: string;
  loggedAt?: string;
} & MacroTotals;

type UpdateMealEntryInput = {
  servingsEaten?: number;
  notes?: string;
  loggedAt?: string;
  // flat macro edit, marks macrosOverridden
  macroOverrides?: Partial<MacroTotals>;
  // re-supply full ingredient list to re-sum , marks ingredientsOverridden
  ingredientOverrides?: IngredientOverride[];
};

export async function getMealEntries(date?: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();

  const query: Record<string, unknown> = { userId: user.id };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.loggedAt = { $gte: start, $lte: end };
  }

  const entries = await MealEntry.find(query)
    .sort({ loggedAt: -1 })
    .limit(date ? 0 : 50);

  return JSON.parse(JSON.stringify(entries.map((e) => e.toJSON())));
}

export async function getMealEntry(id: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const entry = await MealEntry.findOne({ _id: id, userId: user.id });
  if (!entry) throw new Error("Not found");
  return JSON.parse(JSON.stringify(entry.toJSON()));
}

export async function createMealEntryFromRecipe(data: CreateFromRecipeInput) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();

  const recipe = await Recipe.findOne({ _id: data.recipeId, userId: user.id });
  if (!recipe) throw new Error("Recipe not found");

  const latest = recipe.versions.at(-1);
  if (!latest) throw new Error("Recipe has no versions");

  // Start with the recipe version's macros as baseline
  let macros: MacroTotals = {
    kcal: latest.kcal,
    protein: latest.protein,
    fiber: latest.fiber,
    carbs: latest.carbs,
    sugar: latest.sugar,
    sodium: latest.sodium,
  };

  let loggedIngredients: IngredientOverride[] = [];
  let macrosOverridden = false;
  let ingredientsOverridden = false;

  if (data.ingredientOverrides && data.ingredientOverrides.length > 0) {
    // User adjusted one or more ingredients, re-sum to get macros
    loggedIngredients = data.ingredientOverrides;
    macros = sumMacros(data.ingredientOverrides);
    ingredientsOverridden = true;
    macrosOverridden = true;
  } else if (data.macroOverrides) {
    // User edited the flat numbers directly, becomes a manual-style override, no ingredient breakdown stored
    macros = { ...macros, ...data.macroOverrides };
    macrosOverridden = true;
  } else if (latest.ingredients.length > 0) {
    // No overrides, snapshot the recipe's ingredient list as-is
    loggedIngredients = latest.ingredients.map((ing: IIngredient) => ({
      recipeIngredientId: ing._id.toString(),
      name: ing.name,
      amount: ing.amount,
      kcal: ing.kcal,
      protein: ing.protein,
      fiber: ing.fiber,
      carbs: ing.carbs,
      sugar: ing.sugar,
      sodium: ing.sodium,
    }));
  }

  const entry = await MealEntry.create({
    userId: user.id,
    recipeId: recipe._id,
    recipeVersionId: latest._id,
    versionNumber: latest.versionNumber,
    recipeName: recipe.name,
    servingsEaten: data.servingsEaten,
    notes: data.notes,
    loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    ...macros,
    macrosOverridden,
    ingredientsOverridden,
    loggedIngredients: loggedIngredients.map((ing) => ({
      recipeIngredientId: ing.recipeIngredientId,
      name: ing.name,
      amount: ing.amount,
      kcal: ing.kcal,
      protein: ing.protein,
      fiber: ing.fiber,
      carbs: ing.carbs,
      sugar: ing.sugar,
      sodium: ing.sodium,
      overridden: ingredientsOverridden,
    })),
  });

  revalidatePath("/log");
  return JSON.parse(JSON.stringify(entry.toJSON()));
}

export async function createManualMealEntry(data: CreateManualInput) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const entry = await MealEntry.create({
    userId: user.id,
    recipeName: data.recipeName,
    servingsEaten: data.servingsEaten,
    kcal: data.kcal,
    protein: data.protein,
    fiber: data.fiber,
    carbs: data.carbs,
    sugar: data.sugar,
    sodium: data.sodium,
    notes: data.notes,
    loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    macrosOverridden: false,
    ingredientsOverridden: false,
    loggedIngredients: [],
  });

  revalidatePath("/log");
  return JSON.parse(JSON.stringify(entry.toJSON()));
}

export async function updateMealEntry(id: string, data: UpdateMealEntryInput) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const entry = await MealEntry.findOne({ _id: id, userId: user.id });
  if (!entry) throw new Error("Not found");

  if (data.servingsEaten != null) entry.servingsEaten = data.servingsEaten;
  if (data.notes != null) entry.notes = data.notes;
  if (data.loggedAt != null) entry.loggedAt = new Date(data.loggedAt);

  if (data.ingredientOverrides && data.ingredientOverrides.length > 0) {
    // Re-sum from updated ingredients
    const macros = sumMacros(data.ingredientOverrides);
    entry.kcal = macros.kcal;
    entry.protein = macros.protein;
    entry.fiber = macros.fiber;
    entry.carbs = macros.carbs;
    entry.sugar = macros.sugar;
    entry.sodium = macros.sodium;
    entry.loggedIngredients = data.ingredientOverrides.map((ing) => ({
      recipeIngredientId: ing.recipeIngredientId,
      name: ing.name,
      amount: ing.amount,
      kcal: ing.kcal,
      protein: ing.protein,
      fiber: ing.fiber,
      carbs: ing.carbs,
      sugar: ing.sugar,
      sodium: ing.sodium,
      overridden: true,
    }));
    entry.macrosOverridden = true;
    entry.ingredientsOverridden = true;
  } else if (data.macroOverrides) {
    // Flat edit: drop ingredient breakdown, becomes fully manual
    const o = data.macroOverrides;
    if (o.kcal != null) entry.kcal = o.kcal;
    if (o.protein != null) entry.protein = o.protein;
    if (o.fiber != null) entry.fiber = o.fiber;
    if (o.carbs != null) entry.carbs = o.carbs;
    if (o.sugar != null) entry.sugar = o.sugar;
    if (o.sodium != null) entry.sodium = o.sodium;
    entry.macrosOverridden = true;
    // Clear ingredients since they no longer match the top-level numbers
    entry.loggedIngredients = [];
    entry.ingredientsOverridden = false;
  }

  await entry.save();
  revalidatePath("/log");
  return JSON.parse(JSON.stringify(entry.toJSON()));
}

export async function deleteMealEntry(id: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const entry = await MealEntry.findOneAndDelete({ _id: id, userId: user.id });
  if (!entry) throw new Error("Not found");

  revalidatePath("/log");
  return { deleted: true };
}
