import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Alert,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import { useEffect, useState, useTransition } from "react";
import { createRecipe, updateRecipe, deleteRecipe } from "@/actions/recipes";
import { IIngredient } from "@/models/Recipe";
import { latestVersion, sumIngredients } from "@/utils/recipe";
import { IngredientRow, Recipe } from "@/types/recipe";
import { CATEGORY_OPTIONS } from "@/const/Categories";

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

interface RecipeDialogProps {
  open: boolean;
  recipe: Recipe | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

export function RecipeDialog({
  open,
  recipe,
  onClose,
  onSaved,
}: RecipeDialogProps) {
  const isEdit = recipe !== null;
  const v = recipe ? latestVersion(recipe) : null;

  const [tab, setTab] = useState(0);
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
    setTab(0);
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

  const macroField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      type="number"
      slotProps={{ htmlInput: { min: 0, step: "any" } }}
      sx={{ flex: 1, minWidth: 80 }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit recipe" : "New recipe"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Details" />
        <Tab label="Macros" />
        {isEdit && <Tab label="Version history" />}
      </Tabs>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── Tab 0: details ── */}
        {tab === 0 && (
          <Stack sx={{ gap: 2 }}>
            <Stack sx={{ flexDirection: "row", gap: 2 }}>
              <TextField
                label="Recipe name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                required
                sx={{ flex: 2 }}
              />
              <TextField
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="small"
                select
                sx={{ flex: 1 }}
              >
                <MenuItem value="">— none —</MenuItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack sx={{ flexDirection: "row", gap: 2 }}>
              <TextField
                label="Serving size"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                size="small"
                required
                placeholder="e.g. 1 bowl, 200g"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Servings made"
                value={servingsMade}
                onChange={(e) => setServingsMade(e.target.value)}
                size="small"
                type="number"
                required
                slotProps={{ htmlInput: { min: 0, step: "any" } }}
                sx={{ flex: 1 }}
              />
            </Stack>

            <TextField
              label="Recipe / source URL"
              value={recipeSource}
              onChange={(e) => setRecipeSource(e.target.value)}
              size="small"
              placeholder="https://…"
            />

            <TextField
              label="Ingredient notes (comma-separated)"
              value={ingredientNotes}
              onChange={(e) => setIngredientNotes(e.target.value)}
              size="small"
              placeholder="chicken breast, rice, soy sauce…"
              helperText="Freeform list — separate from structured ingredient macros"
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              multiline
              rows={3}
            />

            {isEdit && (
              <TextField
                label="Change note (optional)"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                size="small"
                placeholder="What changed in this version?"
                helperText="Saving will create a new version snapshot"
              />
            )}
          </Stack>
        )}

        {/* ── Tab 1: macros ── */}
        {tab === 1 && (
          <Stack sx={{ gap: 2 }}>
            <ToggleButtonGroup
              value={macroMode}
              exclusive
              onChange={(_, v) => v && setMacroMode(v)}
              size="small"
            >
              <ToggleButton value="manual">Manually</ToggleButton>
              <ToggleButton value="ingredients">By ingredient</ToggleButton>
            </ToggleButtonGroup>

            {macroMode === "manual" ? (
              <Stack sx={{ flexDirection: "row", gap: 2, flexWrap: "wrap" }}>
                {macroField("kcal", kcal, setKcal)}
                {macroField("Protein (g)", protein, setProtein)}
                {macroField("Fiber (g)", fiber, setFiber)}
                {macroField("Carbs (g)", carbs, setCarbs)}
                {macroField("Sugar (g)", sugar, setSugar)}
                {macroField("Sodium (mg)", sodium, setSodium)}
              </Stack>
            ) : (
              <Stack sx={{ gap: 1 }}>
                {/* Header row */}
                <Stack sx={{ flexDirection: "row", gap: 1 }}>
                  {[
                    "Ingredient",
                    "Amount",
                    "kcal",
                    "Protein",
                    "Fiber",
                    "Carbs",
                    "Sugar",
                    "Sodium",
                    "",
                  ].map((h) => (
                    <Typography
                      key={h}
                      variant="caption"
                      sx={{
                        flex: h === "Ingredient" ? 2 : h === "" ? 0 : 1,
                        minWidth: h === "" ? 32 : 0,
                        color: "text.disabled",
                        fontWeight: 500,
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </Typography>
                  ))}
                </Stack>

                {ingredients.map((ing) => (
                  <Stack
                    key={ing.id}
                    sx={{ flexDirection: "row", gap: 1, alignItems: "center" }}
                  >
                    <TextField
                      value={ing.name}
                      onChange={(e) =>
                        updateIngredient(ing.id, "name", e.target.value)
                      }
                      size="small"
                      placeholder="Name"
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      value={ing.amount}
                      onChange={(e) =>
                        updateIngredient(ing.id, "amount", e.target.value)
                      }
                      size="small"
                      placeholder="200g"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={ing.kcal}
                      onChange={(e) =>
                        updateIngredient(ing.id, "kcal", e.target.value)
                      }
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={ing.protein}
                      onChange={(e) =>
                        updateIngredient(ing.id, "protein", e.target.value)
                      }
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={ing.fiber}
                      onChange={(e) =>
                        updateIngredient(ing.id, "fiber", e.target.value)
                      }
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={ing.carbs}
                      onChange={(e) =>
                        updateIngredient(ing.id, "carbs", e.target.value)
                      }
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={ing.sugar}
                      onChange={(e) =>
                        updateIngredient(ing.id, "sugar", e.target.value)
                      }
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={ing.sodium}
                      onChange={(e) =>
                        updateIngredient(ing.id, "sodium", e.target.value)
                      }
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setIngredients((prev) =>
                          prev.filter((i) => i.id !== ing.id),
                        )
                      }
                      disabled={ingredients.length === 1}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}

                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  size="small"
                  onClick={() =>
                    setIngredients((prev) => [...prev, emptyIngredient()])
                  }
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add ingredient
                </Button>

                {/* Derived totals */}
                {derived && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, bgcolor: "action.hover", mt: 1 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Totals (summed from ingredients)
                    </Typography>
                    <Stack
                      sx={{ flexDirection: "row", gap: 3, flexWrap: "wrap" }}
                    >
                      {(
                        [
                          "kcal",
                          "protein",
                          "fiber",
                          "carbs",
                          "sugar",
                          "sodium",
                        ] as const
                      ).map((key) => (
                        <Box key={key} sx={{ textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{
                              display: "block",
                              textTransform: "uppercase",
                              fontSize: 10,
                            }}
                          >
                            {key}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontWeight: 600 }}
                          >
                            {derived[key]}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            )}
          </Stack>
        )}

        {/* ── Tab 2: version history (edit only) ── */}
        {tab === 2 && recipe && (
          <Stack sx={{ gap: 1 }}>
            {[...recipe.versions].reverse().map((ver) => (
              <Paper key={ver._id} variant="outlined" sx={{ p: 2 }}>
                <Stack
                  sx={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Version {ver.versionNumber}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(ver.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
                {ver.changeNote && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    {ver.changeNote}
                  </Typography>
                )}
                <Stack sx={{ flexDirection: "row", gap: 2, flexWrap: "wrap" }}>
                  {(
                    [
                      "kcal",
                      "protein",
                      "fiber",
                      "carbs",
                      "sugar",
                      "sodium",
                    ] as const
                  ).map((key) => (
                    <Box key={key} sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{
                          display: "block",
                          textTransform: "uppercase",
                          fontSize: 10,
                        }}
                      >
                        {key}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {ver[key]}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ mt: 1, display: "block" }}
                >
                  {ver.servingsMade} servings
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box>
          {isEdit && (
            <Button
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          )}
        </Box>
        <Stack sx={{ flexDirection: "row", gap: 1 }}>
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isPending}
            disableElevation
          >
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create recipe"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
