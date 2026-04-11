"use client";

import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CalorieProvider } from "@/context/CalorieContext";

const SIDEBAR_WIDTH = 220;
const TOPBAR_HEIGHT = 52;

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CalorieProvider>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar
          width={SIDEBAR_WIDTH}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TopBar
            height={TOPBAR_HEIGHT}
            menuButton={
              isMobile ? (
                <IconButton
                  size="small"
                  onClick={() => setMobileOpen(true)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              ) : null
            }
          />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              bgcolor: "background.default",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </CalorieProvider>
  );
}
