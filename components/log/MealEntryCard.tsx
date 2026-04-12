import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { MealEntry } from "@/types/mealEntry";
import { MacroChip } from "@/components/recipe/MacroChip";
import { roundMacro } from "@/utils/macros";

interface MealEntryCardProps {
  entry: MealEntry;
  onEdit: () => void;
}

export function MealEntryCard({ entry, onEdit }: MealEntryCardProps) {
  const isEdited = entry.ingredientsOverridden;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack sx={{ gap: 2 }}>
        {/* Top row: name and time */}
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Stack sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {entry.recipeName}
            </Typography>
            {isEdited && (
              <Chip
                label={entry.ingredientsOverridden ? "ingredients edited" : "macros edited"}
                size="small"
                variant="outlined"
                sx={{ alignSelf: "flex-start", mt: 0.5 }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.disabled" sx={{ ml: 2 }}>
            {new Date(entry.loggedAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Typography>
        </Stack>

        {/* Macros row */}
        <Stack sx={{ flexDirection: "row", gap: 2, flexWrap: "wrap" }}>
          <MacroChip
            label="kcal"
            value={roundMacro("kcal", entry.kcal)}
            unit=""
            color="primary.main"
            blurred={false}
          />
          <MacroChip
            label="Protein"
            value={roundMacro("protein", entry.protein)}
            unit="g"
            color="success.main"
            blurred={false}
          />
          <MacroChip
            label="Fiber"
            value={roundMacro("fiber", entry.fiber)}
            unit="g"
            color="info.main"
            blurred={false}
          />
          <MacroChip
            label="Carbs"
            value={roundMacro("carbs", entry.carbs)}
            unit="g"
            color="warning.main"
            blurred={false}
          />
          <MacroChip
            label="Sugar"
            value={roundMacro("sugar", entry.sugar)}
            unit="g"
            color="error.main"
            blurred={false}
          />
          <MacroChip
            label="Sodium"
            value={roundMacro("sodium", entry.sodium)}
            unit="mg"
            color="text.secondary"
            blurred={false}
          />
        </Stack>

        {/* Bottom row: servings and edit button */}
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {entry.servingsEaten} serving{entry.servingsEaten === 1 ? "" : "s"}
          </Typography>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
