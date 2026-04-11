import { useCalories } from "@/context/CalorieContext";
import { IIngredient } from "@/models/Recipe";
import { Recipe } from "@/types/recipe";
import { blurSx } from "@/utils/mui";
import { latestVersion } from "@/utils/recipe";
import {
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";

export function TableSkeleton() {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {[
              "Dish",
              "Ingredients",
              "Servings",
              "Serving Size",
              "kcal",
              "Protein",
              "Fiber",
              "Carbs",
              "Sugar",
              "Sodium",
              "Source",
              "Notes",
            ].map((h) => (
              <TableCell key={h}>
                <Skeleton width={60} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              {Array(11)
                .fill(0)
                .map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton />
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function RecipeTable({
  recipes,
  onRowClick,
}: {
  recipes: Recipe[];
  onRowClick: (r: Recipe) => void;
}) {
  const { visible } = useCalories();

  const headers = [
    "Dish",
    "Ingredients",
    "Servings",
    "Serving Size",
    "Total kcal",
    "Protein (g)",
    "Fiber (g)",
    "Carbs (g)",
    "Sugar (g)",
    "Sodium (mg)",
    "Source",
    "Notes",
  ];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            {headers.map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  py: 1.25,
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {recipes.map((recipe) => {
            const v = latestVersion(recipe);
            const ingredientList = v?.ingredients?.length
              ? v.ingredients.map((i: IIngredient) => i.name).join(", ")
              : recipe.ingredientNotes?.join(", ") || "—";

            return (
              <TableRow
                key={recipe._id}
                hover
                onClick={() => onRowClick(recipe)}
                sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                    component="span"
                  >
                    {recipe.name}
                  </Typography>
                  {recipe.category && (
                    <Chip
                      label={recipe.category}
                      size="small"
                      sx={{ mt: 0.5, fontSize: 10 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      maxWidth: 200,
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={ingredientList}
                  >
                    {ingredientList}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {v?.servingsMade ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{recipe.servingSize}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "primary.main",
                      ...blurSx(!visible),
                    }}
                  >
                    {v?.kcal ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", color: "info.main" }}
                  >
                    {v?.protein ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", color: "success.main" }}
                  >
                    {v?.fiber ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "warning.main",
                      ...blurSx(!visible),
                    }}
                  >
                    {v?.carbs ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "error.main",
                      ...blurSx(!visible),
                    }}
                  >
                    {v?.sugar ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "secondary.main",
                      ...blurSx(!visible),
                    }}
                  >
                    {v?.sodium ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      maxWidth: 140,
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={recipe.recipeSource}
                  >
                    {recipe.recipeSource || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      maxWidth: 180,
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={recipe.notes}
                  >
                    {recipe.notes || "—"}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
