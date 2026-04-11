"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(154, 115, 149)",
      light: "rgb(180, 150, 175)",
      dark: "rgb(128, 80, 123)",
      contrastText: "#fff",
    },
    secondary: {
      main: "rgb(236, 145, 229)",
      light: "rgb(242, 175, 239)",
      dark: "rgb(220, 100, 213)",
      contrastText: "#fff",
    },
    background: {
      default: "rgb(252, 244, 251)",
      paper: "#fff",
    },
    text: {
      primary: "rgb(13, 4, 12)",
      secondary: "rgba(13, 4, 12, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      color: "rgb(13, 4, 12)",
    },
    h3: {
      color: "rgb(13, 4, 12)",
    },
    h6: {
      color: "rgb(13, 4, 12)",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgb(154, 115, 149)",
          backgroundImage:
            "linear-gradient(135deg, rgb(154, 115, 149) 0%, rgb(128, 80, 123) 100%)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "rgb(236, 145, 229)",
          color: "#fff",
          "&:hover": {
            backgroundColor: "rgb(220, 100, 213)",
          },
        },
      },
    },
  },
});

export default theme;
