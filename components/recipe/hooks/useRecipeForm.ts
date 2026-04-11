import { useEffect, useState, useTransition } from "react";
import { createRecipe, updateRecipe, deleteRecipe } from "@/actions/recipes";
import { IIngredient } from "@/models/Recipe";
import { latestVersion, sumIngredients } from "@/utils/recipe";
import { IngredientRow, Recipe } from "@/types/recipe";

function emptyIngredient(): IngredientRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: "",
    kcal: "",
    protein: "",
    fiber: "",
    carbs: "",
    sugar: "",
    sodium: "",
  };
}

export function useRecipeForm({
  open,
  recipe,
  onClose,
  onSaved,
}: {
  open: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = recipe !== null;
  const v = recipe ? latestVersion(recipe) : null;

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── form state ──
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servingsMade, setServingsMade] = useState("");
  const [category, setCategory] = useState("");
  const [recipeSource, setRecipeSource] = useState("");
  const [notes, setNotes] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [ingredientNotes, setIngredientNotes] = useState("");

  // macro mode: "manual" or "ingredients"
  const [macroMode, setMacroMode] = useState<"manual" | "ingredients">(
    "manual",
  );
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [fiber, setFiber] = useState("");
  const [carbs, setCarbs] = useState("");
  const [sugar, setSugar] = useState("");
  const [sodium, setSodium] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    emptyIngredient(),
  ]);

  // populate when editing
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (recipe && v) {
      setName(recipe.name);
      setServingSize(recipe.servingSize);
      setServingsMade(String(v.servingsMade));
      setCategory(recipe.category ?? "");
      setRecipeSource(recipe.recipeSource ?? "");
      setNotes(recipe.notes ?? "");
      setChangeNote("");
      setIngredientNotes(recipe.ingredientNotes?.join(", ") ?? "");

      if (v.ingredients?.length) {
        setMacroMode("ingredients");
        setIngredients(
          v.ingredients.map((ing: IIngredient) => ({
            id: crypto.randomUUID(),
            name: ing.name,
            amount: ing.amount,
            kcal: String(ing.kcal),
            protein: String(ing.protein),
            fiber: String(ing.fiber),
            carbs: String(ing.carbs),
            sugar: String(ing.sugar),
            sodium: String(ing.sodium),
          })),
        );
      } else {
        setMacroMode("manual");
        setKcal(String(v.kcal));
        setProtein(String(v.protein));
        setFiber(String(v.fiber));
        setCarbs(String(v.carbs));
        setSugar(String(v.sugar));
        setSodium(String(v.sodium));
        setIngredients([emptyIngredient()]);
      }
    } else {
      setName("");
      setServingSize("");
      setServingsMade("");
      setCategory("");
      setRecipeSource("");
      setNotes("");
      setChangeNote("");
      setIngredientNotes("");
      setMacroMode("manual");
      setKcal("");
      setProtein("");
      setFiber("");
      setCarbs("");
      setSugar("");
      setSodium("");
      setIngredients([emptyIngredient()]);
    }
  }, [open, recipe]);

  const derived =
    macroMode === "ingredients" ? sumIngredients(ingredients) : null;

  function updateIngredient(
    id: string,
    field: keyof IngredientRow,
    value: string,
  ) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)),
    );
  }

  function handleSave() {
    setError(null);

    const macros =
      macroMode === "ingredients" && derived
        ? derived
        : {
            kcal: Number(kcal),
            protein: Number(protein),
            fiber: Number(fiber),
            carbs: Number(carbs),
            sugar: Number(sugar),
            sodium: Number(sodium),
          };

    if (!name.trim()) return setError("Recipe name is required");
    if (!servingSize.trim()) return setError("Serving size is required");
    if (!servingsMade || isNaN(Number(servingsMade)))
      return setError("Servings made must be a number");

    const versionData = {
      servingsMade: Number(servingsMade),
      changeNote: changeNote || undefined,
      ingredients:
        macroMode === "ingredients"
          ? ingredients
              .filter((i) => i.name.trim())
              .map((i) => ({
                name: i.name,
                amount: i.amount,
                kcal: Number(i.kcal) || 0,
                protein: Number(i.protein) || 0,
                fiber: Number(i.fiber) || 0,
                carbs: Number(i.carbs) || 0,
                sugar: Number(i.sugar) || 0,
                sodium: Number(i.sodium) || 0,
              }))
          : undefined,
      ...macros,
    };

    const meta = {
      name: name.trim(),
      servingSize: servingSize.trim(),
      category: category || undefined,
      recipeSource: recipeSource || undefined,
      notes: notes || undefined,
      ingredientNotes: ingredientNotes
        ? ingredientNotes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    startTransition(async () => {
      try {
        if (isEdit && recipe) {
          await updateRecipe(recipe._id, { ...meta, newVersion: versionData });
        } else {
          await createRecipe({ ...meta, ...versionData });
        }
        onSaved();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!recipe) return;
    startTransition(async () => {
      try {
        await deleteRecipe(recipe._id);
        onSaved();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return {
    // meta fields
    name,
    setName,
    servingSize,
    setServingSize,
    servingsMade,
    setServingsMade,
    category,
    setCategory,
    recipeSource,
    setRecipeSource,
    notes,
    setNotes,
    changeNote,
    setChangeNote,
    ingredientNotes,
    setIngredientNotes,
    // macro state
    macroMode,
    setMacroMode,
    kcal,
    setKcal,
    protein,
    setProtein,
    fiber,
    setFiber,
    carbs,
    setCarbs,
    sugar,
    setSugar,
    sodium,
    setSodium,
    ingredients,
    setIngredients,
    // derived
    derived,
    // handlers
    updateIngredient,
    handleSave,
    handleDelete,
    // async state
    isPending,
    error,
    setError,
    // derived constants
    isEdit,
  };
}
