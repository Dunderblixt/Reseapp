"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface AppContextValue {
  savedCountries: string[];
  toggleSavedCountry: (code: string) => void;
  isSaved: (code: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedCountries, setSavedCountries] = useState<string[]>([]);

  const value = useMemo<AppContextValue>(
    () => ({
      savedCountries,
      toggleSavedCountry: (code) =>
        setSavedCountries((current) =>
          current.includes(code)
            ? current.filter((saved) => saved !== code)
            : [...current, code],
        ),
      isSaved: (code) => savedCountries.includes(code),
    }),
    [savedCountries],
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
