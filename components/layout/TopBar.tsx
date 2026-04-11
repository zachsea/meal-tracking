"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface TopBarProps {
  height: number;
  menuButton?: React.ReactNode;
}

export function TopBar({ height, menuButton }: TopBarProps) {
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        height,
        justifyContent: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: height, gap: 1 }}>
        {menuButton}
        <Box sx={{ flex: 1 }} />

        {status === "loading" ? (
          <Skeleton variant="circular" width={32} height={32} />
        ) : session?.user ? (
          <>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
                sx={{ width: 32, height: 32, fontSize: 13 }}
              >
                {session.user.name?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Typography variant="body2">{session.user.name}</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  signOut();
                  setAnchorEl(null);
                }}
              >
                Sign out
              </MenuItem>
            </Menu>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
