"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CalorieContextValue {
  visible: boolean;
  toggle: () => void;
}

const CalorieContext = createContext<CalorieContextValue>({
  visible: true,
  toggle: () => {},
});

function getInitialVisible() {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem("caloriesVisible");
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function CalorieProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(getInitialVisible);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "caloriesVisible",
        visible ? "true" : "false",
      );
    } catch {
      // ignore storage failures
    }
  }, [visible]);

  return (
    <CalorieContext.Provider
      value={{ visible, toggle: () => setVisible((v) => !v) }}
    >
      {children}
    </CalorieContext.Provider>
  );
}

export function useCalories() {
  return useContext(CalorieContext);
}
