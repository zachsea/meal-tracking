import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useState } from "react";
import { MealEntry } from "@/types/mealEntry";
import { Recipe } from "@/types/recipe";
import { useMealEntryForm } from "./hooks/useMealEntryForm";
import { IngredientEditor } from "@/components/recipe/IngredientEditor";
import { roundMacro } from "@/utils/macros";

interface MealEntryDialogProps {
  open: boolean;
  entry: MealEntry | null; // null = create mode
  recipes: Recipe[];
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

export function MealEntryDialog({
  open,
  entry,
  recipes,
  onClose,
  onSaved,
}: MealEntryDialogProps) {
  const [tab, setTab] = useState(0);

  const form = useMealEntryForm({ open, entry, recipes, onClose, onSaved });

  const {
    selectedRecipeId,
    setSelectedRecipeId,
    servingsEaten,
    setServingsEaten,
    notes,
    setNotes,
    selectedRecipe,
    selectedVersion,
    perServingMacros,
    scaledMacros,
    hasIngredients,
    ingredientRows,
    setIngredientRows,
    updateIngredientRow,
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
    handleSave,
    handleDelete,
    isPending,
    error,
    isEdit,
  } = form;

  const handleTabChange = (_: any, newTab: number) => {
    setTab(newTab);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>
          {isEdit ? "Edit log entry" : "Log meal"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Recipe" />
        {selectedRecipe && hasIngredients && <Tab label="Ingredients" />}
        <Tab label="Manual" />
      </Tabs>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── Tab 0: Recipe ── */}
        {tab === 0 && (
          <Stack sx={{ gap: 2 }}>
            <Autocomplete
              options={recipes}
              getOptionLabel={(r) => r.name}
              isOptionEqualToValue={(opt, val) => opt._id === val._id}
              value={selectedRecipe || null}
              onChange={(_, newVal) => {
                setSelectedRecipeId(newVal?._id || "");
                setTab(0); // reset to recipe tab when recipe changes
              }}
              renderInput={(params) => (
                <TextField {...params} label="Recipe" size="small" required />
              )}
            />

            <TextField
              label="Servings eaten"
              value={servingsEaten}
              onChange={(e) => setServingsEaten(e.target.value)}
              size="small"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              required
              helperText="Can be decimal (e.g., 1.5)"
            />

            {perServingMacros && scaledMacros && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: "block" }}
                >
                  Per serving
                </Typography>
                <Stack
                  sx={{ flexDirection: "row", gap: 2, mb: 2, fontSize: 12 }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      kcal
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {roundMacro("kcal", perServingMacros.kcal)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      protein
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {roundMacro("protein", perServingMacros.protein)}g
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      carbs
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {roundMacro("carbs", perServingMacros.carbs)}g
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      fiber
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {roundMacro("fiber", perServingMacros.fiber)}g
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: "block" }}
                >
                  Total for {servingsEaten} serving
                  {Number(servingsEaten) === 1 ? "" : "s"}
                </Typography>
                <Stack sx={{ flexDirection: "row", gap: 2, fontSize: 12 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      kcal
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {roundMacro("kcal", scaledMacros.kcal)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      protein
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {roundMacro("protein", scaledMacros.protein)}g
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      carbs
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {roundMacro("carbs", scaledMacros.carbs)}g
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block" }}
                    >
                      fiber
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {roundMacro("fiber", scaledMacros.fiber)}g
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        )}

        {/* ── Tab 1: Ingredients (if recipe has ingredients) ── */}
        {selectedRecipe && hasIngredients && tab === 1 && (
          <Stack sx={{ gap: 2 }}>
            <IngredientEditor
              ingredients={ingredientRows}
              setIngredients={setIngredientRows}
              updateIngredient={updateIngredientRow}
              derived={null}
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        )}

        {/* ── Tab 2: Manual ── */}
        {tab === (selectedRecipe && hasIngredients ? 2 : 1) && (
          <Stack sx={{ gap: 2 }}>
            <TextField
              label="Meal name"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              size="small"
              required
              placeholder="e.g., Chicken breast with rice"
            />

            <TextField
              label="Servings"
              value={servingsEaten}
              onChange={(e) => setServingsEaten(e.target.value)}
              size="small"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              required
            />

            <Stack sx={{ flexDirection: "row", gap: 2, flexWrap: "wrap" }}>
              <MacroField
                label="kcal"
                value={manualKcal}
                onChange={setManualKcal}
              />
              <MacroField
                label="Protein (g)"
                value={manualProtein}
                onChange={setManualProtein}
              />
              <MacroField
                label="Fiber (g)"
                value={manualFiber}
                onChange={setManualFiber}
              />
              <MacroField
                label="Carbs (g)"
                value={manualCarbs}
                onChange={setManualCarbs}
              />
              <MacroField
                label="Sugar (g)"
                value={manualSugar}
                onChange={setManualSugar}
              />
              <MacroField
                label="Sodium (mg)"
                value={manualSodium}
                onChange={setManualSodium}
              />
            </Stack>

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              multiline
              rows={2}
            />
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
            onClick={() => handleSave(tab)}
            disabled={isPending}
            disableElevation
          >
            {isPending ? "Saving…" : isEdit ? "Save" : "Log meal"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
