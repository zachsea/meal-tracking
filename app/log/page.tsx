"use client";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState, useTransition } from "react";
import { getMealEntries } from "@/actions/mealEntries";
import { getRecipes } from "@/actions/recipes";
import { MealEntry } from "@/types/mealEntry";
import { Recipe } from "@/types/recipe";
import { MacroChip } from "@/components/recipe/MacroChip";
import { MealEntryCard } from "@/components/log/MealEntryCard";
import { MealEntryDialog } from "@/components/log/MealEntryDialog";
import { roundMacro } from "@/utils/macros";

export default function LogPage() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MealEntry | null>(null);
  const [, startTransition] = useTransition();

  function loadData() {
    startTransition(async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const [entriesData, recipesData] = await Promise.all([
          getMealEntries(todayStr),
          getRecipes(),
        ]);
        setEntries(entriesData);
        setRecipes(recipesData);
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(e: MealEntry) {
    setEditTarget(e);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
  }

  function handleSaved() {
    loadData();
  }

  // Calculate daily totals
  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      fiber: acc.fiber + e.fiber,
      carbs: acc.carbs + e.carbs,
      sugar: acc.sugar + e.sugar,
      sodium: acc.sodium + e.sodium,
    }),
    { kcal: 0, protein: 0, fiber: 0, carbs: 0, sugar: 0, sodium: 0 },
  );

  // Format date label
  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Sort entries by time (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, letterSpacing: "-0.3px" }}
          >
            Today's Log
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {todayLabel}
          </Typography>
        </Box>
        <IconButton onClick={openCreate} size="large">
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>

      {/* Daily Totals */}
      {!loading && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 2, display: "block", fontWeight: 500 }}
          >
            Daily Totals
          </Typography>
          <Stack sx={{ flexDirection: "row", gap: 3, flexWrap: "wrap" }}>
            <MacroChip
              label="kcal"
              value={roundMacro("kcal", totals.kcal)}
              unit=""
              color="primary.main"
              blurred={false}
            />
            <MacroChip
              label="Protein"
              value={roundMacro("protein", totals.protein)}
              unit="g"
              color="success.main"
              blurred={false}
            />
            <MacroChip
              label="Fiber"
              value={roundMacro("fiber", totals.fiber)}
              unit="g"
              color="info.main"
              blurred={false}
            />
            <MacroChip
              label="Carbs"
              value={roundMacro("carbs", totals.carbs)}
              unit="g"
              color="warning.main"
              blurred={false}
            />
            <MacroChip
              label="Sugar"
              value={roundMacro("sugar", totals.sugar)}
              unit="g"
              color="error.main"
              blurred={false}
            />
            <MacroChip
              label="Sodium"
              value={roundMacro("sodium", totals.sodium)}
              unit="mg"
              color="text.secondary"
              blurred={false}
            />
          </Stack>
        </Paper>
      )}

      {/* Meals List */}
      <Stack sx={{ gap: 2, mb: 3 }}>
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={180} />
            ))}
          </>
        ) : entries.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No meals logged yet</Typography>
          </Paper>
        ) : (
          sortedEntries.map((entry) => (
            <MealEntryCard
              key={entry._id}
              entry={entry}
              onEdit={() => openEdit(entry)}
            />
          ))
        )}
      </Stack>

      {/* Add Meal Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={openCreate}
        fullWidth
        size="large"
        sx={{ py: 1.5 }}
      >
        Add meal
      </Button>

      {/* Dialog */}
      <MealEntryDialog
        open={dialogOpen}
        entry={editTarget}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </Box>
  );
}
