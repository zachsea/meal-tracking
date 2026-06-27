"use client";

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCallback, useEffect, useState, useTransition } from "react";
import { getMealEntries } from "@/actions/mealEntries";
import { MealEntry } from "@/types/mealEntry";
import { roundMacro } from "@/utils/macros";
import { MacroChip } from "@/components/recipe/MacroChip";
import { MealEntryDialog } from "@/components/log/MealEntryDialog";
import { useCalories } from "@/context/CalorieContext";

function getLocalDateKey(date: Date | string) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsedDate);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MealEntry[]>([]);
  const [search, setSearch] = useState("");
  const { visible } = useCalories();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState<MealEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const loadEntries = useCallback(() => {
    setLoading(true);
    startTransition(async () => {
      try {
        const data = await getMealEntries();
        const filtered = data.filter((e: MealEntry) => {
          const entryDate = getLocalDateKey(e.loggedAt);
          if (startDate && entryDate < startDate) return false;
          if (endDate && entryDate > endDate) return false;
          return true;
        });
        setEntries(filtered);
      } finally {
        setLoading(false);
      }
    });
  }, [endDate, startDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const filtered = entries.filter((e) =>
      e.recipeName.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredEntries(filtered);
  }, [entries, search]);

  function handleRowClick(entry: MealEntry) {
    setEditEntry(entry);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditEntry(null);
  }

  function handleSaved() {
    setDialogOpen(false);
    setEditEntry(null);
    loadEntries();
  }

  const groupedByDate = filteredEntries.reduce(
    (acc, entry) => {
      const dateKey = getLocalDateKey(entry.loggedAt);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
      return acc;
    },
    {} as Record<string, MealEntry[]>,
  );

  const dateLabels = Object.fromEntries(
    Object.keys(groupedByDate).map((dateKey) => {
      const label = formatDateLabel(dateKey);
      return [dateKey, label] as const;
    }),
  );

  const dateKeys = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: "-0.3px", mb: 2 }}
        >
          Meal History
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            placeholder="Search meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.disabled" }} />
                ),
              },
            }}
            sx={{ width: 300 }}
          />
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Meal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                kcal
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Protein
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Carbs
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Fiber
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Servings
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : dateKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 3 }}>
                  No meals found
                </TableCell>
              </TableRow>
            ) : (
              dateKeys
                .map((date) => [
                  <TableRow
                    key={`divider-${date}`}
                    sx={{ bgcolor: "action.hover" }}
                  >
                    <TableCell
                      colSpan={7}
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        fontSize: 12,
                        textTransform: "uppercase",
                        py: 1,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {dateLabels[date]}
                    </TableCell>
                  </TableRow>,
                  ...groupedByDate[date].map((entry: MealEntry) => (
                    <TableRow
                      key={entry._id}
                      onClick={() => handleRowClick(entry)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                        {new Date(entry.loggedAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>
                        {entry.recipeName}
                      </TableCell>
                      <TableCell align="right">
                        <MacroChip
                          label="kcal"
                          value={roundMacro("kcal", entry.kcal)}
                          unit=""
                          color="primary.main"
                          blurred={!visible}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <MacroChip
                          label="Protein"
                          value={roundMacro("protein", entry.protein)}
                          unit="g"
                          color="success.main"
                          blurred={false}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <MacroChip
                          label="Carbs"
                          value={roundMacro("carbs", entry.carbs)}
                          unit="g"
                          color="warning.main"
                          blurred={false}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <MacroChip
                          label="Fiber"
                          value={roundMacro("fiber", entry.fiber)}
                          unit="g"
                          color="info.main"
                          blurred={false}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>
                        {entry.servingsEaten}
                      </TableCell>
                    </TableRow>
                  )),
                ])
                .flat()
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MealEntryDialog
        open={dialogOpen}
        entry={editEntry}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </Box>
  );
}
