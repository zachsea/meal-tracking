"use client";

import { Box, Button, Typography, Paper } from "@mui/material";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        variant="outlined"
        sx={{ p: 4, maxWidth: 360, width: "100%", textAlign: "center" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          silly food tracking
        </Typography>

        <Button
          variant="contained"
          fullWidth
          disableElevation
          onClick={() => signIn("discord")}
        >
          Sign in with Discord
        </Button>
      </Paper>
    </Box>
  );
}
