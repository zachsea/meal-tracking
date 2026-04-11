"use client";

import { createContext, useContext, useState } from "react";

interface CalorieContextValue {
  visible: boolean;
  toggle: () => void;
}

const CalorieContext = createContext<CalorieContextValue>({
  visible: true,
  toggle: () => {},
});

export function CalorieProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
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
