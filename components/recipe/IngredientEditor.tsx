import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { IngredientRow } from "@/types/recipe";
import { sumIngredients } from "@/utils/recipe";

interface IngredientEditorProps {
  ingredients: IngredientRow[];
  setIngredients: React.Dispatch<React.SetStateAction<IngredientRow[]>>;
  updateIngredient: (
    id: string,
    field: keyof IngredientRow,
    value: string,
  ) => void;
  derived: ReturnType<typeof sumIngredients> | null;
}

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

export function IngredientEditor({
  ingredients,
  setIngredients,
  updateIngredient,
  derived,
}: IngredientEditorProps) {
  return (
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
            onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
            size="small"
            placeholder="Name"
            sx={{ flex: 2 }}
          />
          <TextField
            value={ing.amount}
            onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
            size="small"
            placeholder="200g"
            sx={{ flex: 1 }}
          />
          <TextField
            value={ing.kcal}
            onChange={(e) => updateIngredient(ing.id, "kcal", e.target.value)}
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
            onChange={(e) => updateIngredient(ing.id, "fiber", e.target.value)}
            size="small"
            type="number"
            sx={{ flex: 1 }}
          />
          <TextField
            value={ing.carbs}
            onChange={(e) => updateIngredient(ing.id, "carbs", e.target.value)}
            size="small"
            type="number"
            sx={{ flex: 1 }}
          />
          <TextField
            value={ing.sugar}
            onChange={(e) => updateIngredient(ing.id, "sugar", e.target.value)}
            size="small"
            type="number"
            sx={{ flex: 1 }}
          />
          <TextField
            value={ing.sodium}
            onChange={(e) => updateIngredient(ing.id, "sodium", e.target.value)}
            size="small"
            type="number"
            sx={{ flex: 1 }}
          />
          <IconButton
            size="small"
            onClick={() =>
              setIngredients((prev) => prev.filter((i) => i.id !== ing.id))
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
        onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
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
          <Stack sx={{ flexDirection: "row", gap: 3, flexWrap: "wrap" }}>
            {(
              ["kcal", "protein", "fiber", "carbs", "sugar", "sodium"] as const
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
  );
}
