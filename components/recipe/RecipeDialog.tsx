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
import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { CATEGORY_OPTIONS } from "@/const/Categories";
import { useRecipeForm } from "./hooks/useRecipeForm";
import { IngredientEditor } from "./IngredientEditor";

interface RecipeDialogProps {
  open: boolean;
  recipe: Recipe | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

function MacroField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
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
}

export function RecipeDialog({
  open,
  recipe,
  onClose,
  onSaved,
}: RecipeDialogProps) {
  const [tab, setTab] = useState(0);

  const form = useRecipeForm({ open, recipe, onClose, onSaved });

  const {
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
    derived,
    updateIngredient,
    handleSave,
    handleDelete,
    isPending,
    error,
    isEdit,
  } = form;

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
                <MacroField label="kcal" value={kcal} onChange={setKcal} />
                <MacroField
                  label="Protein (g)"
                  value={protein}
                  onChange={setProtein}
                />
                <MacroField
                  label="Fiber (g)"
                  value={fiber}
                  onChange={setFiber}
                />
                <MacroField
                  label="Carbs (g)"
                  value={carbs}
                  onChange={setCarbs}
                />
                <MacroField
                  label="Sugar (g)"
                  value={sugar}
                  onChange={setSugar}
                />
                <MacroField
                  label="Sodium (mg)"
                  value={sodium}
                  onChange={setSodium}
                />
              </Stack>
            ) : (
              <IngredientEditor
                ingredients={ingredients}
                setIngredients={setIngredients}
                updateIngredient={updateIngredient}
                derived={derived}
              />
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
