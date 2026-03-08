"use client";
import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved === "system" ? "" : saved);
      if (saved === "system") document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  const cycle = () => {
    const next: Theme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
    }
  };

  if (!mounted) return <div className="w-7 h-7" />;

  const icon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️";

  return (
    <button
      onClick={cycle}
      className="w-7 h-7 flex items-center justify-center rounded-md text-sm hover:bg-surface-dim transition-colors"
      aria-label={`テーマ: ${theme}`}
      title={`テーマ: ${theme === "system" ? "自動" : theme === "dark" ? "ダーク" : "ライト"}`}
    >
      {icon}
    </button>
  );
}
