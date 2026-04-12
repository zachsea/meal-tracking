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

export default function HistoryPage() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MealEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        // fetch all entries (API will return last 50 if no date specified)
        const data = await getMealEntries();
        setEntries(data);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    const filtered = entries.filter((e) =>
      e.recipeName.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredEntries(filtered);
  }, [entries, search]);

  // Group entries by date (using ISO date for reliable sorting)
  const groupedByDate = filteredEntries.reduce(
    (acc, entry) => {
      const isoDate = new Date(entry.loggedAt).toISOString().split("T")[0]; // YYYY-MM-DD
      if (!acc[isoDate]) acc[isoDate] = [];
      acc[isoDate].push(entry);
      return acc;
    },
    {} as Record<string, MealEntry[]>,
  );

  // Create date labels for display (formatted, not for sorting)
  const dateLabels = Object.fromEntries(
    Object.keys(groupedByDate).map((isoDate) => {
      const label = new Date(isoDate + "T00:00:00").toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );
      return [isoDate, label] as const;
    }),
  );

  const dateKeys = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: "-0.3px", mb: 2 }}
        >
          Meal History
        </Typography>
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

      {/* Table */}
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
                  // Date divider row
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
                  // Meals for this date
                  ...groupedByDate[date].map((entry: MealEntry) => (
                    <TableRow
                      key={entry._id}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
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
    </Box>
  );
}
