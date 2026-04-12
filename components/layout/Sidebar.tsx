"use client";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  Stack,
  Button,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import AddIcon from "@mui/icons-material/Add";
import { usePathname, useRouter } from "next/navigation";
import { useCalories } from "@/context/CalorieContext";

const NAV = [
  {
    section: "Track",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: <DashboardOutlinedIcon fontSize="small" />,
      },
      {
        label: "Today's Log",
        href: "/log",
        icon: <AddCircleOutlineIcon fontSize="small" />,
      },
      {
        label: "History",
        href: "/history",
        icon: <BarChartIcon fontSize="small" />,
      },
    ],
  },
  {
    section: "Library",
    items: [
      {
        label: "Recipes",
        href: "/recipes",
        icon: <MenuBookIcon fontSize="small" />,
      },
    ],
  },
];

interface SidebarProps {
  width: number;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogMeal: () => void;
}

const drawerSx = (width: number) => ({
  "& .MuiDrawer-paper": {
    width,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid",
    borderColor: "divider",
  },
});

export function Sidebar({
  width,
  isMobile,
  mobileOpen,
  onMobileClose,
  onLogMeal,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { visible, toggle } = useCalories();

  const handleNav = (href: string) => {
    router.push(href);
    if (isMobile) onMobileClose();
  };

  const content = (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          gap: 1,
          px: 2.5,
          py: 2.5,
          alignItems: "center",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, letterSpacing: "-0.3px" }}
        >
          food
        </Typography>
      </Stack>

      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
        {NAV.map(({ section, items }) => (
          <Box key={section}>
            <Typography
              variant="caption"
              sx={{
                px: 2.5,
                pt: 1.5,
                pb: 0.5,
                display: "block",
                color: "text.disabled",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {section}
            </Typography>
            <List dense disablePadding>
              {items.map(({ label, href, icon }) => {
                const active = pathname === href;
                return (
                  <ListItemButton
                    key={href}
                    selected={active}
                    onClick={() => handleNav(href)}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      mb: 0.25,
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "& .MuiListItemIcon-root": {
                          color: "primary.contrastText",
                        },
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 32, color: "text.secondary" }}
                    >
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 13.5,
                            fontWeight: active ? 500 : 400,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Log meal button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onLogMeal}
          disableElevation
          size="small"
        >
          Log meal
        </Button>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.disabled",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Calorie display
        </Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={visible}
              onChange={toggle}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {visible ? "Visible" : "Hidden"}
            </Typography>
          }
          sx={{ ml: 0 }}
        />
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{ width, flexShrink: 0, ...drawerSx(width) }}
    >
      {content}
    </Drawer>
  );
}
