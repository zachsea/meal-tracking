import { useEffect, useState, useTransition, useMemo } from "react";
import {
  createMealEntryFromRecipe,
  createManualMealEntry,
  updateMealEntry,
  deleteMealEntry,
} from "@/actions/mealEntries";
import { latestVersion } from "@/utils/recipe";
import { MealEntry } from "@/types/mealEntry";
import { Recipe } from "@/types/recipe";
import { IngredientRow } from "@/types/recipe";
import { IIngredient } from "@/models/Recipe";

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

export function useMealEntryForm({
  open,
  entry,
  recipes,
  onClose,
  onSaved,
}: {
  open: boolean;
  entry: MealEntry | null;
  recipes: Recipe[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = entry !== null;

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Recipe tab state
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [servingsEaten, setServingsEaten] = useState("");
  const [notes, setNotes] = useState("");

  // Ingredient override rows
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([
    emptyIngredient(),
  ]);

  // Manual entry state
  const [manualName, setManualName] = useState("");
  const [manualKcal, setManualKcal] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualFiber, setManualFiber] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualSugar, setManualSugar] = useState("");
  const [manualSodium, setManualSodium] = useState("");

  // Derived values
  const selectedRecipe = useMemo(
    () => recipes.find((r) => r._id === selectedRecipeId),
    [selectedRecipeId, recipes],
  );

  const selectedVersion = useMemo(
    () => (selectedRecipe ? latestVersion(selectedRecipe) : null),
    [selectedRecipe],
  );

  const perServingMacros = useMemo(() => {
    if (!selectedVersion) return null;
    // recipe macros are already per-serving, no need to divide
    return {
      kcal: selectedVersion.kcal,
      protein: selectedVersion.protein,
      fiber: selectedVersion.fiber,
      carbs: selectedVersion.carbs,
      sugar: selectedVersion.sugar,
      sodium: selectedVersion.sodium,
    };
  }, [selectedVersion]);

  const scaledMacros = useMemo(() => {
    if (!perServingMacros || !servingsEaten) return null;
    const multiplier = Number(servingsEaten) || 0;
    return {
      kcal: perServingMacros.kcal * multiplier,
      protein: perServingMacros.protein * multiplier,
      fiber: perServingMacros.fiber * multiplier,
      carbs: perServingMacros.carbs * multiplier,
      sugar: perServingMacros.sugar * multiplier,
      sodium: perServingMacros.sodium * multiplier,
    };
  }, [perServingMacros, servingsEaten]);

  const hasIngredients = useMemo(
    () =>
      selectedVersion &&
      selectedVersion.ingredients &&
      selectedVersion.ingredients.length > 0,
    [selectedVersion],
  );

  // Populate on open
  useEffect(() => {
    if (!open) return;
    setError(null);

    if (entry && isEdit) {
      // Edit mode: populate from entry
      setNotes(entry.notes || "");
      setServingsEaten(String(entry.servingsEaten));

      if (entry.recipeId) {
        setSelectedRecipeId(entry.recipeId);

        // If entry has logged ingredients and they were overridden, populate ingredient rows
        if (
          entry.ingredientsOverridden &&
          entry.loggedIngredients?.length > 0
        ) {
          setIngredientRows(
            entry.loggedIngredients.map((ing: IIngredient) => ({
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
          setIngredientRows([emptyIngredient()]);
        }

        setManualName("");
        setManualKcal("");
        setManualProtein("");
        setManualFiber("");
        setManualCarbs("");
        setManualSugar("");
        setManualSodium("");
      } else {
        // Manual entry (no recipe)
        setSelectedRecipeId("");
        setIngredientRows([emptyIngredient()]);
        setManualName(entry.recipeName);
        setManualKcal(String(entry.kcal));
        setManualProtein(String(entry.protein));
        setManualFiber(String(entry.fiber));
        setManualCarbs(String(entry.carbs));
        setManualSugar(String(entry.sugar));
        setManualSodium(String(entry.sodium));
      }
    } else {
      // Create mode: reset
      setSelectedRecipeId("");
      setServingsEaten("");
      setNotes("");
      setIngredientRows([emptyIngredient()]);
      setManualName("");
      setManualKcal("");
      setManualProtein("");
      setManualFiber("");
      setManualCarbs("");
      setManualSugar("");
      setManualSodium("");
    }
  }, [open, entry, isEdit]);

  function updateIngredientRow(
    id: string,
    field: keyof IngredientRow,
    value: string,
  ) {
    setIngredientRows((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)),
    );
  }

  function handleSave(activeTab: number) {
    setError(null);

    if (activeTab === 0 || activeTab === 1) {
      // Recipe-based (servings or ingredient mode)
      if (!selectedRecipeId) {
        return setError("Please select a recipe");
      }
      if (!servingsEaten || isNaN(Number(servingsEaten))) {
        return setError("Servings must be a valid number");
      }

      startTransition(async () => {
        try {
          const baseData = {
            recipeId: selectedRecipeId,
            servingsEaten: Number(servingsEaten),
            notes: notes || undefined,
          };

          if (activeTab === 1 && hasIngredients) {
            // Ingredient override mode
            const overrides = ingredientRows
              .filter((i) => i.name.trim())
              .map((i) => ({
                recipeIngredientId: i.id, // using local id as placeholder
                name: i.name,
                amount: i.amount,
                kcal: Number(i.kcal) || 0,
                protein: Number(i.protein) || 0,
                fiber: Number(i.fiber) || 0,
                carbs: Number(i.carbs) || 0,
                sugar: Number(i.sugar) || 0,
                sodium: Number(i.sodium) || 0,
              }));

            if (isEdit && entry) {
              await updateMealEntry(entry._id, {
                servingsEaten: Number(servingsEaten),
                notes: notes || undefined,
                ingredientOverrides: overrides,
              });
            } else {
              await createMealEntryFromRecipe({
                ...baseData,
                ingredientOverrides: overrides,
              });
            }
          } else {
            // Simple servings mode with scaled macros
            if (!scaledMacros) {
              return setError("Unable to calculate macros");
            }

            if (isEdit && entry) {
              await updateMealEntry(entry._id, {
                servingsEaten: Number(servingsEaten),
                notes: notes || undefined,
                macroOverrides: scaledMacros,
              });
            } else {
              await createMealEntryFromRecipe({
                ...baseData,
                macroOverrides: scaledMacros,
              });
            }
          }

          onSaved();
          onClose();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      });
    } else {
      // Manual entry mode
      if (!manualName.trim()) {
        return setError("Meal name is required");
      }
      if (!servingsEaten || isNaN(Number(servingsEaten))) {
        return setError("Servings must be a valid number");
      }

      startTransition(async () => {
        try {
          if (isEdit && entry) {
            await updateMealEntry(entry._id, {
              servingsEaten: Number(servingsEaten),
              notes: notes || undefined,
              macroOverrides: {
                kcal: Number(manualKcal) || 0,
                protein: Number(manualProtein) || 0,
                fiber: Number(manualFiber) || 0,
                carbs: Number(manualCarbs) || 0,
                sugar: Number(manualSugar) || 0,
                sodium: Number(manualSodium) || 0,
              },
            });
          } else {
            await createManualMealEntry({
              recipeName: manualName.trim(),
              servingsEaten: Number(servingsEaten),
              kcal: Number(manualKcal) || 0,
              protein: Number(manualProtein) || 0,
              fiber: Number(manualFiber) || 0,
              carbs: Number(manualCarbs) || 0,
              sugar: Number(manualSugar) || 0,
              sodium: Number(manualSodium) || 0,
              notes: notes || undefined,
            });
          }

          onSaved();
          onClose();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      });
    }
  }

  function handleDelete() {
    if (!entry) return;
    startTransition(async () => {
      try {
        await deleteMealEntry(entry._id);
        onSaved();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return {
    // Recipe tab
    selectedRecipeId,
    setSelectedRecipeId,
    servingsEaten,
    setServingsEaten,
    notes,
    setNotes,
    recipes,
    selectedRecipe,
    selectedVersion,
    perServingMacros,
    scaledMacros,
    hasIngredients,

    // Ingredient rows
    ingredientRows,
    setIngredientRows,
    updateIngredientRow,

    // Manual entry
    manualName,
    setManualName,
    manualKcal,
    setManualKcal,
    manualProtein,
    setManualProtein,
    manualFiber,
    setManualFiber,
    manualCarbs,
    setManualCarbs,
    manualSugar,
    setManualSugar,
    manualSodium,
    setManualSodium,

    // Handlers
    handleSave,
    handleDelete,

    // Async state
    isPending,
    error,
    setError,

    // Derived
    isEdit,
  };
}
