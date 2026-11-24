"use client";

import { Moon, Sun } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return <button className="icon-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} onClick={toggleTheme}>
    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
  </button>;
}
