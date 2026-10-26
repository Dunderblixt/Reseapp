"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AppContextValue {
  savedCountries: string[];
  hydrated: boolean;
  toggleSavedCountry: (code: string) => void;
  isSaved: (code: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = "nordresa:favourite-countries";

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedCountries, setSavedCountries] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedCountries(
            parsed.filter((code): code is string => typeof code === "string"),
          );
        }
      }
    } catch {
      // Ignore unreadable storage and start with an empty list.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCountries));
    } catch {
      // Storage can be unavailable (e.g. private mode); ignore.
    }
  }, [savedCountries, hydrated]);

  const value = useMemo<AppContextValue>(
    () => ({
      savedCountries,
      hydrated,
      toggleSavedCountry: (code) =>
        setSavedCountries((current) =>
          current.includes(code)
            ? current.filter((saved) => saved !== code)
            : [...current, code],
        ),
      isSaved: (code) => savedCountries.includes(code),
    }),
    [savedCountries, hydrated],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider.");
  }
  return context;
}
