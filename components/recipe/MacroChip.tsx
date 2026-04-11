import { blurSx } from "@/utils/mui";
import { Box, Typography } from "@mui/material";

export function MacroChip({
  label,
  value,
  unit = "g",
  color,
  blurred,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
  blurred: boolean;
}) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 48 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "text.disabled",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: "monospace",
          fontWeight: 600,
          color,
          ...blurSx(blurred),
          fontSize: 13,
        }}
      >
        {value}
        <Typography
          component="span"
          variant="caption"
          sx={{ color: "text.disabled", fontWeight: 400 }}
        >
          {unit}
        </Typography>
      </Typography>
    </Box>
  );
}
