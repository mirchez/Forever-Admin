import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRESETS, DEFAULT_MODE, MODE_KEYS } from "../presets";

const STORAGE_KEY = "storeMode";

const PresetContext = createContext(null);

export const PresetProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return MODE_KEYS.includes(stored) ? stored : DEFAULT_MODE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(() => {
    const preset = PRESETS[mode] || PRESETS[DEFAULT_MODE];
    const otherKey = mode === "toys" ? "clothing" : "toys";
    return {
      mode,
      preset,
      otherPreset: PRESETS[otherKey],
      toggleMode: () => setMode((m) => (m === "toys" ? "clothing" : "toys")),
      setMode,
    };
  }, [mode]);

  return <PresetContext.Provider value={value}>{children}</PresetContext.Provider>;
};

export const usePreset = () => {
  const ctx = useContext(PresetContext);
  if (!ctx) throw new Error("usePreset must be used inside <PresetProvider>");
  return ctx;
};
