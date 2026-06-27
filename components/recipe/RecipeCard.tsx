import { Recipe } from "@/types/recipe";
import { latestVersion } from "@/utils/recipe";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Typography,
} from "@mui/material";
import { MacroChip } from "./MacroChip";
import { useCalories } from "@/context/CalorieContext";

export function RecipeCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <Box sx={{ bgcolor: "action.hover", height: 140 }} />
      <CardContent>
        <Skeleton width="60%" height={24} />
        <Skeleton width="40%" height={18} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={48} height={40} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export function RecipeCard({
  recipe,
  onClick,
}: {
  recipe: Recipe;
  onClick: () => void;
}) {
  const { visible } = useCalories();
  const v = latestVersion(recipe);

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.15s",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Box
        sx={{
          height: 140,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color="text.disabled">
          No image
        </Typography>
      </Box>

      <CardContent
        sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
            }}
            component="span"
          >
            {recipe.name}
          </Typography>
          {recipe.category && (
            <Chip
              label={recipe.category}
              size="small"
              sx={{ fontSize: 11, flexShrink: 0 }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.disabled">
          {v
            ? `${v.servingsMade} servings · ${recipe.servingSize}`
            : "No version yet"}
          {v && v.versionNumber > 1 && ` · v${v.versionNumber}`}
        </Typography>

        {v && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <MacroChip
                label="kcal"
                value={v.kcal}
                unit=""
                color="primary.main"
                blurred={!visible}
              />
              <MacroChip
                label="protein"
                value={v.protein}
                color="info.main"
                blurred={false}
              />
              <MacroChip
                label="carbs"
                value={v.carbs}
                color="warning.main"
                blurred={false}
              />
              <MacroChip
                label="fiber"
                value={v.fiber}
                color="success.main"
                blurred={false}
              />
              <MacroChip
                label="sugar"
                value={v.sugar}
                color="error.main"
                blurred={false}
              />
              <MacroChip
                label="sodium"
                value={v.sodium}
                color="secondary.main"
                blurred={false}
              />
            </Box>
          </>
        )}

        {recipe.recipeSource && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              mt: "auto",
              pt: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {recipe.recipeSource}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
