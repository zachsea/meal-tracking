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
import { useEffect, useState, useTransition } from "react";
import { getMealEntries } from "@/actions/mealEntries";
import { MealEntry } from "@/types/mealEntry";
import { roundMacro } from "@/utils/macros";
import { MealEntryDialog } from "@/components/log/MealEntryDialog";

export default function HistoryPage() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MealEntry[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState<MealEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  function loadEntries() {
    setLoading(true);
    startTransition(async () => {
      try {
        const data = await getMealEntries();
        const filtered = data.filter((e: MealEntry) => {
          const entryDate = new Date(e.loggedAt).toISOString().split("T")[0];
          if (startDate && entryDate < startDate) return false;
          if (endDate && entryDate > endDate) return false;
          return true;
        });
        setEntries(filtered);
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    loadEntries();
  }, [startDate, endDate]);

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
      const isoDate = new Date(entry.loggedAt).toISOString().split("T")[0];
      if (!acc[isoDate]) acc[isoDate] = [];
      acc[isoDate].push(entry);
      return acc;
    },
    {} as Record<string, MealEntry[]>,
  );

  const dateLabels = Object.fromEntries(
    Object.keys(groupedByDate).map((isoDate) => {
      const label = new Date(isoDate + "T00:00:00").toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "short", day: "numeric" },
      );
      return [isoDate, label] as const;
    }),
  );

  const dateKeys = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
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
                      <TableCell
                        align="right"
                        sx={{ fontFamily: "monospace", fontSize: 13 }}
                      >
                        {roundMacro("kcal", entry.kcal)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontFamily: "monospace", fontSize: 13 }}
                      >
                        {roundMacro("protein", entry.protein)}g
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontFamily: "monospace", fontSize: 13 }}
                      >
                        {roundMacro("carbs", entry.carbs)}g
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontFamily: "monospace", fontSize: 13 }}
                      >
                        {roundMacro("fiber", entry.fiber)}g
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
