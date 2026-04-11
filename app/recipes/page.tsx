"use client";

import {
  Box,
  Typography,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState, useTransition } from "react";
import { getRecipes } from "@/actions/recipes";
import { CATEGORIES } from "@/const/Categories";
import { RecipeDialog } from "@/components/recipe/RecipeDialog";
import { Recipe } from "@/types/recipe";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe/RecipeCard";
import { RecipeTable, TableSkeleton } from "@/components/recipe/RecipeTable";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [, startTransition] = useTransition();

  function loadRecipes() {
    startTransition(async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }
  function openEdit(r: Recipe) {
    setEditTarget(r);
    setDialogOpen(true);
  }
  function handleClose() {
    setDialogOpen(false);
  }
  function handleSaved() {
    loadRecipes();
  }

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || r.category === category;
    return matchesSearch && matchesCategory;
  });

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
            Recipes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {loading ? "Loading…" : `${recipes.length} saved recipes`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          disableElevation
        >
          New recipe
        </Button>
      </Box>

      {/* Filters */}
      <Stack
        sx={{
          mb: 3,
          gap: 1,
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search recipes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 220 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.disabled" }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        <Stack sx={{ flexDirection: "row", gap: 0.75, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => setCategory(cat)}
              color={category === cat ? "primary" : "default"}
              variant={category === cat ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
          ))}
        </Stack>

        <Box sx={{ ml: "auto" }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableRowsIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {/* Content */}
      {view === "grid" ? (
        loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <RecipeCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10, color: "text.disabled" }}>
            <Typography variant="body1">No recipes found</Typography>
            <Typography variant="caption">
              {search || category !== "All"
                ? "Try adjusting your filters"
                : "Add your first recipe to get started"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((recipe) => (
              <Grid key={recipe._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <RecipeCard recipe={recipe} onClick={() => openEdit(recipe)} />
              </Grid>
            ))}
          </Grid>
        )
      ) : loading ? (
        <TableSkeleton />
      ) : (
        <RecipeTable recipes={filtered} onRowClick={openEdit} />
      )}

      <RecipeDialog
        open={dialogOpen}
        recipe={editTarget}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </Box>
  );
}
