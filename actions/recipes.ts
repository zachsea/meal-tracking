"use server";

import { connectDB } from "@/lib/mongoose";
import { Recipe, IIngredient } from "@/models/Recipe";
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

// If structured ingredients are provided, sum them.
function resolveMacros(
  ingredients: Omit<IIngredient, "_id">[] | undefined,
  explicit: MacroTotals,
): MacroTotals {
  if (!ingredients || ingredients.length === 0) return explicit;
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

type IngredientInput = {
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
};

type VersionMacroInput = {
  servingsMade: number;
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
  changeNote?: string;
  ingredients?: IngredientInput[];
};

type CreateRecipeInput = {
  name: string;
  servingSize: string;
  ingredientNotes?: string[];
  recipeSource?: string;
  category?: string;
  notes?: string;
} & VersionMacroInput;

type UpdateRecipeInput = {
  name?: string;
  ingredientNotes?: string[];
  servingSize?: string;
  recipeSource?: string;
  category?: string;
  notes?: string;
  newVersion?: VersionMacroInput;
};

export async function getRecipes() {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const recipes = await Recipe.find({ userId: user.id }).sort({
    createdAt: -1,
  });
  return JSON.parse(JSON.stringify(recipes.map((r) => r.toJSON())));
}

export async function getRecipe(id: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const recipe = await Recipe.findOne({ _id: id, userId: user.id });
  if (!recipe) throw new Error("Not found");
  return JSON.parse(JSON.stringify(recipe.toJSON()));
}

export async function createRecipe(data: CreateRecipeInput) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  const macros = resolveMacros(data.ingredients, {
    kcal: data.kcal,
    protein: data.protein,
    fiber: data.fiber,
    carbs: data.carbs,
    sugar: data.sugar,
    sodium: data.sodium,
  });

  await connectDB();
  const recipe = await Recipe.create({
    userId: user.id,
    name: data.name,
    ingredientNotes: data.ingredientNotes ?? [],
    servingSize: data.servingSize,
    recipeSource: data.recipeSource,
    category: data.category,
    notes: data.notes,
    versions: [
      {
        versionNumber: 1,
        servingsMade: data.servingsMade,
        ingredients: data.ingredients ?? [],
        changeNote: data.changeNote,
        ...macros,
      },
    ],
  });

  revalidatePath("/recipes");
  return JSON.parse(JSON.stringify(recipe.toJSON()));
}

export async function updateRecipe(id: string, data: UpdateRecipeInput) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const recipe = await Recipe.findOne({ _id: id, userId: user.id });
  if (!recipe) throw new Error("Not found");

  if (data.name != null) recipe.name = data.name;
  if (data.ingredientNotes != null)
    recipe.ingredientNotes = data.ingredientNotes;
  if (data.servingSize != null) recipe.servingSize = data.servingSize;
  if (data.recipeSource != null) recipe.recipeSource = data.recipeSource;
  if (data.category != null) recipe.category = data.category;
  if (data.notes != null) recipe.notes = data.notes;

  if (data.newVersion) {
    const v = data.newVersion;
    const macros = resolveMacros(v.ingredients, {
      kcal: v.kcal,
      protein: v.protein,
      fiber: v.fiber,
      carbs: v.carbs,
      sugar: v.sugar,
      sodium: v.sodium,
    });
    const nextVersionNumber = (recipe.versions.at(-1)?.versionNumber ?? 0) + 1;
    recipe.versions.push({
      versionNumber: nextVersionNumber,
      servingsMade: v.servingsMade,
      ingredients: v.ingredients ?? [],
      changeNote: v.changeNote,
      ...macros,
    });
  }

  await recipe.save();
  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  return JSON.parse(JSON.stringify(recipe.toJSON()));
}

export async function deleteRecipe(id: string) {
  const user = await requireUser();
  if (!user) throw new Error("Unauthorized");

  await connectDB();
  const recipe = await Recipe.findOneAndDelete({ _id: id, userId: user.id });
  if (!recipe) throw new Error("Not found");

  revalidatePath("/recipes");
  return { deleted: true };
}
